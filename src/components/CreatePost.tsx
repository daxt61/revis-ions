'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ImagePlus, X, Send, Sparkles, AlertCircle } from 'lucide-react'
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
    <div className="bg-card rounded-3xl shadow-xl border border-border p-6 transition-all hover:border-primary/20">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit border border-border shadow-inner">
          <button
            type="button"
            onClick={() => setType('revis-ions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              type === 'revis-ions' ? 'bg-primary text-white shadow-lg' : 'text-muted hover:text-foreground'
            }`}
          >
            <Sparkles size={14} />
            Revis-ions
          </button>
          <button
            type="button"
            onClick={() => setType("n'oublions pas")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              type === "n'oublions pas" ? 'bg-orange-500 text-white shadow-lg' : 'text-muted hover:text-foreground'
            }`}
          >
            <AlertCircle size={14} />
            N'oublions pas
          </button>
        </div>

        <input
          type="text"
          placeholder="Titre de votre publication..."
          className="w-full text-xl font-bold border-none focus:ring-0 p-0 bg-transparent placeholder:text-muted/50"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Décrivez ce que vous souhaitez partager..."
          className="w-full border-none focus:ring-0 p-0 resize-none min-h-[100px] bg-transparent text-foreground placeholder:text-muted/40 leading-relaxed"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Matière</label>
            <input
              type="text"
              placeholder="Ex: Mathématiques"
              className="w-full text-sm bg-white/5 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:bg-white/10 outline-none transition-all placeholder:text-muted/30"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-2">Échéance</label>
            <input
              type="date"
              className="w-full text-sm bg-white/5 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:bg-white/10 outline-none transition-all [color-scheme:dark]"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="flex gap-3 animate-in zoom-in-95 duration-200">
            {images.map((image, i) => (
              <div key={i} className="relative w-24 h-24 group">
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                  className="w-full h-full object-cover rounded-2xl border border-border shadow-lg transition-all group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-xl transition-all hover:bg-red-600 active:scale-90"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-5 border-t border-border">
          <label className="flex items-center gap-2.5 text-muted hover:text-primary cursor-pointer transition-all active:scale-95 group">
            <div className="p-2.5 bg-white/5 rounded-xl border border-border group-hover:border-primary/50 transition-all shadow-inner">
              <ImagePlus size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold">Ajouter images</span>
              <span className="text-[10px] font-medium opacity-60">({images.length}/3)</span>
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
            className="bg-primary text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2.5 hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all disabled:opacity-50 active:scale-95"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={16} />
                Publier
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
