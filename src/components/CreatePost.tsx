'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ImagePlus, X, Send } from 'lucide-react'
import { type User } from '@supabase/supabase-js'

export default function CreatePost({ user, onPostCreated }: { user: User, onPostCreated: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'revis-ions' | "n'oublions pas">('revis-ions')
  const [subject, setSubject] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const newPreviews = images.map((image) => URL.createObjectURL(image))
    setPreviews(newPreviews)
    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [images])

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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue'
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card rounded-2xl shadow-md border border-border p-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2 p-1 bg-gray-950 rounded-xl w-fit border border-border">
          <button
            type="button"
            onClick={() => setType('revis-ions')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              type === 'revis-ions' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Revis-ions
          </button>
          <button
            type="button"
            onClick={() => setType("n'oublions pas")}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              type === "n'oublions pas" ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            N&apos;oublions pas
          </button>
        </div>

        <input
          type="text"
          placeholder="Titre de votre publication"
          className="w-full text-xl font-bold border-none focus:ring-0 p-0 bg-transparent text-gray-100 placeholder:text-gray-600"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Partagez vos notes, questions ou rappels..."
          className="w-full border-none focus:ring-0 p-0 resize-none min-h-[100px] bg-transparent text-gray-300 placeholder:text-gray-600 text-sm"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Matière</label>
            <input
              type="text"
              placeholder="Ex: Mathématiques"
              className="w-full text-sm bg-gray-950 border border-border rounded-xl px-3 py-2 text-gray-200 outline-none focus:ring-2 focus:ring-blue-500/50"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Échéance (optionnel)</label>
            <input
              type="date"
              className="w-full text-sm bg-gray-950 border border-border rounded-xl px-3 py-2 text-gray-200 outline-none focus:ring-2 focus:ring-blue-500/50 [color-scheme:dark]"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Image Previews */}
        {previews.length > 0 && (
          <div className="flex gap-3 pt-2">
            {previews.map((preview, i) => (
              <div key={i} className="relative w-24 h-24 group">
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-full object-cover rounded-xl border border-border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border mt-2">
          <label className="flex items-center gap-2 text-gray-500 hover:text-blue-400 cursor-pointer transition-colors group">
            <div className="p-2 bg-gray-950 rounded-lg border border-border group-hover:border-blue-500/50 transition-colors">
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
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
          >
            {loading ? 'Publication...' : (
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
