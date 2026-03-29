'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ImagePlus, X, Send, BookOpen, Calendar } from 'lucide-react'
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
    <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl transition-all duration-300 focus-within:border-blue-500/30">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-1.5 p-1 bg-gray-950/50 rounded-xl w-fit border border-white/5">
          <button
            type="button"
            onClick={() => setType('revis-ions')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
              type === 'revis-ions'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Revis-ions
          </button>
          <button
            type="button"
            onClick={() => setType("n'oublions pas")}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
              type === "n'oublions pas"
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            N'oublions pas
          </button>
        </div>

        <div className="space-y-2">
          <input
            type="text"
            placeholder="Titre de votre publication..."
            className="w-full text-2xl font-black bg-transparent border-none focus:ring-0 p-0 placeholder-gray-700 text-white"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Partagez vos notes, questions ou rappels..."
            className="w-full bg-transparent border-none focus:ring-0 p-0 resize-none min-h-[100px] text-gray-300 placeholder-gray-700 leading-relaxed"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative group">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-400 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Matière (ex: Mathématiques)"
              className="w-full bg-gray-950/50 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-200 focus:border-blue-500/50 focus:ring-0 transition-all placeholder-gray-700"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="relative group">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-orange-400 transition-colors" size={18} />
            <input
              type="date"
              className="w-full bg-gray-950/50 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-200 focus:border-orange-500/50 focus:ring-0 transition-all [color-scheme:dark]"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-4 pt-2">
            {images.map((image, i) => (
              <div key={i} className="relative w-24 h-24 group/preview">
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                  className="w-full h-full object-cover rounded-xl border border-white/10 shadow-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 shadow-xl opacity-0 group-hover/preview:opacity-100 transition-opacity hover:bg-red-700"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5">
          <label className="flex items-center gap-3 text-gray-500 hover:text-blue-400 cursor-pointer transition-all group/label">
            <div className="p-2 bg-gray-950/50 rounded-lg border border-white/5 group-hover/label:border-blue-400/30 transition-all">
              <ImagePlus size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold">Ajouter des images</span>
              <span className="text-[10px] text-gray-600">{images.length} / 3 images sélectionnées</span>
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
            className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={18} />
                Publier sur le Hub
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
