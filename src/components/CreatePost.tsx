'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ImagePlus, X, Send } from 'lucide-react'
import { User } from '@supabase/supabase-js'

export default function CreatePost({ user, onPostCreated }: { user: User, onPostCreated: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'revis-ions' | "n'oublions pas" >('revis-ions')
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card rounded-3xl shadow-lg border border-border p-6 transition-all focus-within:border-primary/50">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-2 p-1 bg-muted rounded-xl w-fit border border-border">
          <button
            type="button"
            onClick={() => setType('revis-ions')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
              type === 'revis-ions' ? 'bg-background shadow-sm text-primary border border-border' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Revis-ions
          </button>
          <button
            type="button"
            onClick={() => setType("n'oublions pas")}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
              type === "n'oublions pas" ? 'bg-background shadow-sm text-orange-500 border border-border' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            N&apos;oublions pas
          </button>
        </div>

        <div className="space-y-2">
          <input
            type="text"
            placeholder="Titre accrocheur..."
            className="w-full text-2xl font-black border-none focus:ring-0 p-0 bg-transparent text-foreground placeholder:text-muted-foreground/50"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Une petite description ?"
            className="w-full border-none focus:ring-0 p-0 bg-transparent resize-none min-h-[100px] text-foreground placeholder:text-muted-foreground/50 leading-relaxed"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
             <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Matière</label>
             <input
               type="text"
               placeholder="ex: Math, Physique..."
               className="w-full text-sm bg-muted border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground/50"
               value={subject}
               onChange={(e) => setSubject(e.target.value)}
             />
          </div>
          <div className="space-y-1.5">
             <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Échéance (Optionnel)</label>
             <input
               type="date"
               className="w-full text-sm bg-muted border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                  className="w-full h-full object-cover rounded-2xl border border-border shadow-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <label className="flex items-center gap-2 text-muted-foreground hover:text-primary cursor-pointer transition-all bg-muted/50 px-4 py-2 rounded-xl border border-dashed border-border hover:border-primary/50 group">
            <ImagePlus size={20} className="group-hover:scale-110 transition-transform" />
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
            className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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
