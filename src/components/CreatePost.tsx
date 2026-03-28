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
    <div className="bg-card rounded-3xl shadow-2xl shadow-black/40 border border-border p-5 md:p-6 transition-all hover:border-primary/50 relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full group-hover:bg-primary/20 transition-all duration-700"></div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-2 p-1.5 bg-secondary/80 backdrop-blur-sm rounded-2xl w-fit border border-border/50 shadow-inner">
            <button
              type="button"
              onClick={() => setType('revis-ions')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${
                type === 'revis-ions' ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles size={14} />
              Revis-ions
            </button>
            <button
              type="button"
              onClick={() => setType("n'oublions pas")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${
                type === "n'oublions pas" ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30 scale-105' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <AlertCircle size={14} />
              N'oublions pas
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground bg-secondary/30 px-3 py-1.5 rounded-full border border-border/30">
            Posté par <span className="text-primary">{user.user_metadata?.username || user.email?.split('@')[0]}</span>
          </div>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Quel est le titre de votre pépite ?"
            className="w-full text-2xl font-black bg-transparent border-none focus:ring-0 p-0 placeholder:text-muted-foreground/30 tracking-tight text-foreground"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Partagez vos explications, conseils ou rappels ici..."
            className="w-full bg-transparent border-none focus:ring-0 p-0 resize-none min-h-[120px] text-base text-foreground/80 placeholder:text-muted-foreground/30 leading-relaxed"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="group relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <span className="text-xs font-black">@</span>
            </div>
            <input
              type="text"
              placeholder="Matière (ex: Mathématiques)"
              className="w-full pl-9 pr-4 py-3 bg-secondary/50 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-secondary outline-none text-sm transition-all text-foreground"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="group relative">
            <input
              type="date"
              className="w-full px-4 py-3 bg-secondary/50 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-secondary outline-none text-sm transition-all text-foreground [color-scheme:dark]"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-4 p-4 bg-secondary/30 rounded-2xl border border-dashed border-border/50">
            {images.map((image, i) => (
              <div key={i} className="group relative w-24 h-24 rounded-xl overflow-hidden border-2 border-border shadow-2xl transition-all hover:scale-105">
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-destructive text-white rounded-lg p-1.5 shadow-xl transition-all hover:scale-110 active:scale-95"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-border/50">
          <label className="flex items-center gap-3 text-muted-foreground hover:text-primary cursor-pointer transition-all group/img bg-secondary/50 px-4 py-2 rounded-2xl border border-border/50 hover:bg-secondary active:scale-95">
            <ImagePlus size={20} className="transition-transform group-hover/img:scale-110" />
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-wider">Ajouter images</span>
              <span className="text-[10px] font-bold text-muted-foreground/60">{images.length}/3 sélectionnés</span>
            </div>
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
            className="bg-primary text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 hover:bg-primary/80 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-xl shadow-primary/30"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Publication...
              </>
            ) : (
              <>
                <Send size={18} />
                Publier la pépite
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
