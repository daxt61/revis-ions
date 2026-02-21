'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ImagePlus, X, Send, Book, Calendar as CalendarIcon } from 'lucide-react'
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
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card rounded-2xl shadow-xl border border-border p-5 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        <div className="flex gap-2 p-1.5 bg-background/50 rounded-xl w-fit border border-border">
          <button
            type="button"
            onClick={() => setType('revis-ions')}
            className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
              type === 'revis-ions' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted hover:text-foreground'
            }`}
          >
            Revis-ions
          </button>
          <button
            type="button"
            onClick={() => setType("n'oublions pas")}
            className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
              type === "n'oublions pas" ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-muted hover:text-foreground'
            }`}
          >
            N&apos;oublions pas
          </button>
        </div>

        <div className="space-y-2">
          <input
            type="text"
            placeholder="Titre de votre publication..."
            className="w-full text-xl font-bold bg-transparent border-none focus:ring-0 p-0 placeholder:text-muted/50 text-foreground"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Partagez des détails, des conseils ou des rappels..."
            className="w-full bg-transparent border-none focus:ring-0 p-0 resize-none min-h-[100px] text-muted placeholder:text-muted/50 leading-relaxed"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Book className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type="text"
              placeholder="Matière (ex: Math)"
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type="date"
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                  className="w-full h-full object-cover rounded-xl border border-border shadow-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-5 border-t border-border">
          <label className="flex items-center gap-2 text-muted hover:text-primary cursor-pointer transition-all group">
            <div className="p-2 bg-background border border-border rounded-xl group-hover:border-primary group-hover:bg-primary/5">
              <ImagePlus size={20} />
            </div>
            <span className="text-sm font-bold">Images ({images.length}/3)</span>
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
            className="bg-primary text-white px-6 py-2.5 rounded-xl font-black flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            {loading ? 'Publication...' : (
              <>
                <Send size={18} />
                <span>PUBLIER</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
