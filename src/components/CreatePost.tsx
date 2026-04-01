'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ImagePlus, X, Send } from 'lucide-react'
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
    <div className="bg-card rounded-2xl shadow-sm border border-border p-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2 p-1 bg-muted/5 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setType('revis-ions')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              type === 'revis-ions' ? 'bg-primary text-white shadow-lg' : 'text-muted hover:text-foreground'
            }`}
          >
            Revis-ions
          </button>
          <button
            type="button"
            onClick={() => setType("n'oublions pas")}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              type === "n'oublions pas" ? 'bg-orange-500 text-white shadow-lg' : 'text-muted hover:text-foreground'
            }`}
          >
            N'oublions pas
          </button>
        </div>

        <input
          type="text"
          placeholder="Titre de la publication..."
          className="w-full text-xl font-bold border-none focus:ring-0 p-0 bg-transparent text-foreground placeholder:text-muted"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Description (optionnel)..."
          className="w-full border-none focus:ring-0 p-0 resize-none min-h-[100px] bg-transparent text-foreground placeholder:text-muted"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-muted px-1">Matière</label>
            <input
              type="text"
              placeholder="ex: Math"
              className="w-full text-sm bg-muted/5 border-border rounded-xl px-3 py-2 text-foreground focus:ring-primary focus:border-primary placeholder:text-muted/50"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-muted px-1">Échéance</label>
            <input
              type="date"
              className="w-full text-sm bg-muted/5 border-border rounded-xl px-3 py-2 text-foreground focus:ring-primary focus:border-primary"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="flex gap-3 pt-2">
            {images.map((image, i) => (
              <div key={i} className="relative w-24 h-24 group">
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                  className="w-full h-full object-cover rounded-xl border border-border shadow-sm transition-transform group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-xl hover:bg-red-600 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <label className="flex items-center gap-2 text-muted hover:text-primary cursor-pointer transition-colors px-2 py-1.5 rounded-lg hover:bg-primary/5">
            <ImagePlus size={20} />
            <span className="text-sm font-semibold">Images ({images.length}/3)</span>
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
            disabled={loading || !title}
            className="bg-primary text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
          >
            {loading ? 'Publication...' : (
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
