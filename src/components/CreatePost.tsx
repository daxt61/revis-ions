'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ImagePlus, X, Send, Sparkles, AlertCircle } from 'lucide-react'

export default function CreatePost({ user, onPostCreated }: { user: any, onPostCreated: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'revis-ions' | "n'oublions pas">('revis-ions')
  const [subject, setSubject] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      if (images.length + selectedFiles.length > 3) {
        setError('Maximum 3 images par post.')
        setTimeout(() => setError(null), 3000)
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
    setError(null)

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
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-6 bg-card border-border/50 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-50" />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-2 p-1 bg-secondary/50 rounded-xl w-fit border border-border/50">
            <button
              type="button"
              onClick={() => setType('revis-ions')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                type === 'revis-ions' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Révisions
            </button>
            <button
              type="button"
              onClick={() => setType("n'oublions pas")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                type === "n'oublions pas" ? 'bg-orange-500 text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              N'oublions pas
            </button>
          </div>

          <div className="flex items-center gap-2 text-primary/40">
            <Sparkles size={18} />
          </div>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Titre de la publication..."
            className="w-full text-xl font-black bg-transparent border-none focus:ring-0 p-0 text-foreground placeholder:text-muted-foreground/50"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Partagez vos notes, questions ou rappels..."
            className="w-full bg-transparent border-none focus:ring-0 p-0 resize-none min-h-[100px] text-foreground/80 placeholder:text-muted-foreground/40 leading-relaxed text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative group/input">
            <input
              type="text"
              placeholder="Matière (ex: Mathématiques)"
              className="w-full text-sm bg-secondary/30 border-border/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="relative group/input">
            <input
              type="date"
              className="w-full text-sm bg-secondary/30 border-border/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground [color-scheme:dark]"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-3 py-2">
            {images.map((image, i) => (
              <div key={i} className="relative w-24 h-24 group/img">
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                  className="w-full h-full object-cover rounded-2xl border border-border/50 shadow-md transition-transform group-hover/img:scale-105"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-xl p-1.5 shadow-lg scale-0 group-hover/img:scale-100 transition-transform hover:bg-destructive/90"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-destructive text-xs font-bold bg-destructive/10 p-3 rounded-xl border border-destructive/20 animate-in fade-in zoom-in-95">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="flex items-center justify-between pt-5 border-t border-border/50">
          <label className="flex items-center gap-2.5 text-muted-foreground hover:text-primary cursor-pointer transition-all bg-secondary/50 px-4 py-2 rounded-xl border border-border/50 hover:border-primary/30 active:scale-95">
            <ImagePlus size={20} />
            <span className="text-sm font-bold">Photos ({images.length}/3)</span>
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
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-black text-sm uppercase tracking-widest flex items-center gap-2.5 hover:bg-primary/90 disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 border border-primary/20"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground"></div>
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
