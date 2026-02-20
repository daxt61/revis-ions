'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ImagePlus, X, Send, BookOpen, Calendar, Type } from 'lucide-react'
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

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert((error as any).message)
    } finally {
      setLoading(false)
    }
  }, [title, description, type, subject, dueDate, images, user.id, onPostCreated, supabase])

  return (
    <div className="bg-card rounded-3xl shadow-xl border border-border p-6 mb-8">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        <div className="flex gap-2 p-1 bg-background rounded-xl w-fit border border-border">
          <button
            type="button"
            onClick={() => setType('revis-ions')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
              type === 'revis-ions' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-foreground/50 hover:text-foreground'
            }`}
          >
            Revis-ions
          </button>
          <button
            type="button"
            onClick={() => setType("n'oublions pas")}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
              type === "n'oublions pas" ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'text-foreground/50 hover:text-foreground'
            }`}
          >
            N&apos;oublions pas
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Type className="absolute left-0 top-1/2 -translate-y-1/2 text-foreground/30" size={20} />
            <input
              type="text"
              placeholder="Titre de la publication..."
              className="w-full text-xl font-bold bg-transparent border-none focus:ring-0 pl-8 placeholder:text-foreground/20 text-foreground"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <textarea
            placeholder="Que voulez-vous partager ?"
            className="w-full bg-transparent border-none focus:ring-0 p-0 resize-none min-h-[100px] text-foreground/80 placeholder:text-foreground/20"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2">
            <BookOpen size={18} className="text-foreground/30" />
            <input
              type="text"
              placeholder="Matière (ex: Math)"
              className="bg-transparent border-none focus:ring-0 p-0 text-sm flex-1 text-foreground"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2">
            <Calendar size={18} className="text-foreground/30" />
            <input
              type="date"
              className="bg-transparent border-none focus:ring-0 p-0 text-sm flex-1 text-foreground [color-scheme:dark]"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="flex gap-3">
            {images.map((image, i) => (
              <div key={i} className="relative w-24 h-24 group">
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                  className="w-full h-full object-cover rounded-xl border border-border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <label className="flex items-center gap-2 text-foreground/50 hover:text-blue-500 cursor-pointer transition-colors group">
            <div className="bg-background p-2 rounded-lg border border-border group-hover:border-blue-500/50 transition-colors">
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
            disabled={loading || !title}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
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
