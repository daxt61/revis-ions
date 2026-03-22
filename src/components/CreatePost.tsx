'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ImagePlus, X, Send, Loader2 } from 'lucide-react'
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
    <div className="bg-card rounded-3xl shadow-2xl border border-border p-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="flex gap-2 p-1 bg-muted rounded-2xl w-fit border border-border">
          <button
            type="button"
            onClick={() => setType('revis-ions')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              type === 'revis-ions' ? 'bg-primary shadow-lg text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Revis-ions
          </button>
          <button
            type="button"
            onClick={() => setType("n'oublions pas")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              type === "n'oublions pas" ? 'bg-orange-500 shadow-lg text-white' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            N'oublions pas
          </button>
        </div>

        <div className="space-y-2">
          <input
            type="text"
            placeholder="Donnez un titre percutant..."
            className="w-full text-2xl font-black border-none focus:ring-0 p-0 bg-transparent placeholder:text-muted-foreground/30 tracking-tight"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Partagez les détails de votre révision ou de cet événement..."
            className="w-full border-none focus:ring-0 p-0 resize-none min-h-[100px] bg-transparent text-foreground/80 placeholder:text-muted-foreground/30 font-medium"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Matière</label>
            <input
              type="text"
              placeholder="Ex: Mathématiques"
              className="w-full text-sm bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Échéance</label>
            <input
              type="date"
              className="w-full text-sm bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {images.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {images.map((image, i) => (
              <div key={i} className="relative w-24 h-24 group">
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                  className="w-full h-full object-cover rounded-2xl border border-border shadow-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 shadow-lg scale-0 group-hover:scale-100 transition-transform"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-border">
          <label className="flex items-center gap-2.5 text-muted-foreground hover:text-primary cursor-pointer transition-all group">
            <div className="bg-muted p-2.5 rounded-xl group-hover:bg-primary/10 transition-colors">
              <ImagePlus size={20} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest">Images ({images.length}/3)</span>
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
            className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-[0_10px_20px_rgba(59,130,246,0.3)] hover:translate-y-[-2px] active:translate-y-[0px] transition-all disabled:opacity-50 disabled:translate-y-0"
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
