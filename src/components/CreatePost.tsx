'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ImagePlus, X, Send } from 'lucide-react'
import { type User as SupabaseUser } from '@supabase/supabase-js'

export default function CreatePost({ user, onPostCreated }: { user: SupabaseUser, onPostCreated: () => void }) {
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
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('Une erreur inconnue est survenue')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card rounded-3xl shadow-xl border border-border/50 p-6 mb-8 transition-all hover:border-border">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-2 p-1 bg-secondary/50 rounded-2xl w-fit border border-border/30">
          <button
            type="button"
            onClick={() => setType('revis-ions')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              type === 'revis-ions' ? 'bg-primary shadow-lg shadow-primary/20 text-white' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Révisions
          </button>
          <button
            type="button"
            onClick={() => setType("n'oublions pas")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              type === "n'oublions pas" ? 'bg-orange-600 shadow-lg shadow-orange-600/20 text-white' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            N&apos;oublions pas
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Quel est l&apos;objet de ce post ?"
            className="w-full text-xl font-black bg-transparent border-none focus:ring-0 p-0 placeholder:text-muted-foreground/50"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Partagez les détails ici..."
            className="w-full bg-transparent border-none focus:ring-0 p-0 resize-none min-h-[100px] text-foreground/80 placeholder:text-muted-foreground/50"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Matière</label>
            <input
              type="text"
              placeholder="ex: Mathématiques"
              className="w-full bg-secondary/30 border-border/50 rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Date d&apos;échéance</label>
            <input
              type="date"
              className="w-full bg-secondary/30 border-border/50 rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all color-scheme-dark"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {images.map((image, i) => (
              <div key={i} className="relative w-24 h-24 group">
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                  className="w-full h-full object-cover rounded-2xl border border-border shadow-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1.5 shadow-xl scale-0 group-hover:scale-100 transition-transform"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-border/50 gap-4">
          <label className="flex items-center gap-2.5 text-muted-foreground hover:text-primary cursor-pointer transition-all group">
            <div className="bg-secondary/50 p-2 rounded-xl group-hover:bg-primary/10 transition-colors">
              <ImagePlus size={20} />
            </div>
            <span className="text-sm font-bold italic">Ajouter des images ({images.length}/3)</span>
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
            className="w-full sm:w-auto bg-primary text-white px-8 py-3 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/25 active:scale-95"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={18} />
                PUBLIER LE POST
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
