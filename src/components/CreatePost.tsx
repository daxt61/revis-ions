'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ImagePlus, Send, Sparkles, AlertCircle, Trash2, Link } from 'lucide-react'

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
    <div className="bg-card rounded-[32px] shadow-2xl border border-border p-6 lg:p-8 animate-in slide-in-from-top-5 duration-700">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${type === 'revis-ions' ? 'bg-primary/20 text-primary' : 'bg-orange-500/20 text-orange-500'}`}>
              {type === 'revis-ions' ? <Sparkles size={24} /> : <AlertCircle size={24} />}
            </div>
            <h2 className="text-xl font-black text-foreground tracking-tight">Que partagez-vous ?</h2>
          </div>

          <div className="flex gap-1.5 p-1 bg-background border border-border rounded-2xl w-full sm:w-fit shadow-inner">
            <button
              type="button"
              onClick={() => setType('revis-ions')}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-sm font-black transition-all ${
                type === 'revis-ions' ? 'bg-primary shadow-lg shadow-primary/30 text-primary-foreground scale-105' : 'text-muted-foreground hover:text-foreground hover:bg-muted/5'
              }`}
            >
              Revis-ions
            </button>
            <button
              type="button"
              onClick={() => setType("n'oublions pas")}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-sm font-black transition-all ${
                type === "n'oublions pas" ? 'bg-orange-500 shadow-lg shadow-orange-500/30 text-white scale-105' : 'text-muted-foreground hover:text-foreground hover:bg-muted/5'
              }`}
            >
              N&apos;oublions pas
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Titre accrocheur..."
            className="w-full text-2xl font-black bg-transparent border-none focus:ring-0 p-0 text-foreground placeholder:text-muted/30 tracking-tight"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Partagez vos notes, astuces ou rappels importants ici..."
            className="w-full bg-transparent border-none focus:ring-0 p-0 resize-none min-h-[120px] text-foreground/80 placeholder:text-muted/30 leading-relaxed custom-scrollbar"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="group relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
              <Link size={18} />
            </div>
            <input
              type="text"
              placeholder="Matière (ex: Math)"
              className="w-full pl-12 pr-4 py-3 bg-background/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none font-medium"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="group relative">
            <input
              type="date"
              className="w-full px-4 py-3 bg-background/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none font-medium text-foreground color-scheme-dark"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-4 pt-4 border-t border-border/50 animate-in fade-in zoom-in-95 duration-500">
            {images.map((image, i) => (
              <div key={i} className="relative group w-24 h-24 sm:w-28 sm:h-28">
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                  className="w-full h-full object-cover rounded-2xl border border-border shadow-xl group-hover:scale-105 transition-transform"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-3 -right-3 bg-destructive text-white rounded-full p-2 shadow-xl hover:scale-110 active:scale-95 transition-all border-2 border-card"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-border/50">
          <label className={`flex items-center justify-center gap-3 px-5 py-3 rounded-2xl border-2 border-dashed transition-all cursor-pointer group ${images.length >= 3 ? 'opacity-30 border-muted grayscale cursor-not-allowed' : 'border-border hover:border-primary hover:bg-primary/5'}`}>
            <ImagePlus size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
            <div className="flex flex-col items-start leading-tight">
              <span className="text-sm font-black text-foreground group-hover:text-primary transition-colors">Ajouter des visuels</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{images.length} / 3 images</span>
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
            className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-primary/90 disabled:opacity-50 transition-all shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 group"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Publier
                <Send size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
