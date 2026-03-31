'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ImagePlus, X, Send, BookOpen, Calendar, Loader2 } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

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
    <div className="bg-card/50 backdrop-blur-md rounded-2xl shadow-xl border border-border p-6 transition-all duration-300">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex gap-2 p-1.5 bg-background/50 border border-border rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setType('revis-ions')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              type === 'revis-ions' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'text-muted hover:text-foreground'
            }`}
          >
            Revis-ions
          </button>
          <button
            type="button"
            onClick={() => setType("n'oublions pas")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              type === "n'oublions pas" ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-105' : 'text-muted hover:text-foreground'
            }`}
          >
            N'oublions pas
          </button>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Titre de votre publication..."
            className="w-full text-xl font-bold bg-transparent border-none focus:ring-0 p-0 text-foreground placeholder:text-muted"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Partagez vos notes, questions ou rappels..."
            className="w-full bg-transparent border-none focus:ring-0 p-0 resize-none min-h-[100px] text-foreground placeholder:text-muted/60 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Matière (ex: Math)"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="date"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {images.map((image, i) => (
              <div key={i} className="relative w-24 h-24 group">
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                  className="w-full h-full object-cover rounded-xl border border-border shadow-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 scale-90"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-5 border-t border-border">
          <label className="flex items-center gap-2.5 text-muted hover:text-primary cursor-pointer transition-all group font-medium">
            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-all">
              <ImagePlus size={20} className="text-primary" />
            </div>
            <span className="text-sm">Ajouter des images ({images.length}/3)</span>
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
            className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
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
