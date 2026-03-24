'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ImagePlus, X, Send, Loader2 } from 'lucide-react'
import { User } from '@supabase/supabase-js'

export default function CreatePost({ user, onPostCreated }: { user: User, onPostCreated: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'revis-ions' | "n'oublions pas">('revis-ions')
  const [subject, setSubject] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      if (images.length + selectedFiles.length > 3) {
        alert('Maximum 3 images par post.')
        return
      }
      setImages([...images, ...selectedFiles])
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return
    setLoading(true)

    try {
      const imageUrls: string[] = []

      for (const image of images) {
        const fileExt = image.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('posts-images')
          .upload(filePath, image)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('posts-images')
          .getPublicUrl(filePath)

        imageUrls.push(publicUrl)
      }

      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        title,
        description,
        type,
        subject,
        due_date: dueDate || null,
        images: imageUrls,
      })

      if (error) throw error

      setTitle('')
      setDescription('')
      setSubject('')
      setDueDate('')
      setImages([])
      onPostCreated()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-4">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div className="flex gap-2 p-1 bg-muted rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setType('revis-ions')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              type === 'revis-ions' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Revis-ions
          </button>
          <button
            type="button"
            onClick={() => setType("n'oublions pas")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              type === "n'oublions pas" ? 'bg-card shadow-sm text-orange-500' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            N'oublions pas
          </button>
        </div>

        <input
          type="text"
          placeholder="Titre..."
          className="w-full text-lg font-bold bg-transparent border-none focus:ring-0 p-0 text-foreground placeholder:text-muted-foreground"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Description..."
          className="w-full bg-transparent border-none focus:ring-0 p-0 resize-none min-h-[80px] text-foreground placeholder:text-muted-foreground text-sm"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Matière (ex: Math)"
            className="text-sm bg-muted border-none rounded-xl px-4 py-2 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <input
            type="date"
            className="text-sm bg-muted border-none rounded-xl px-4 py-2 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary [color-scheme:dark]"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="flex gap-2 pt-2">
            {images.map((image, i) => (
              <div key={i} className="relative w-20 h-20">
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                  className="w-full h-full object-cover rounded-xl border border-border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md hover:scale-110 transition-transform"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <label className="flex items-center gap-2 text-muted-foreground hover:text-primary cursor-pointer transition-colors group">
            <div className="p-2 bg-muted rounded-full group-hover:bg-primary/10 transition-colors">
              <ImagePlus size={20} />
            </div>
            <span className="text-sm font-medium">Images ({images.length}/3)</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageChange}
              disabled={images.length >= 3}
            />
          </label>

          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95 shadow-md shadow-primary/20"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Publication...
              </>
            ) : (
              <>
                <Send size={18} />
                Publier
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
