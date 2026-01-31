import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function createBucket() {
  const { data, error } = await supabase.storage.createBucket('posts-images', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    fileSizeLimit: 5242880 // 5MB
  })

  if (error) {
    console.error('Error creating bucket:', error.message)
    console.log('You might need to create it manually in the Supabase dashboard if the anon key doesn\'t have permissions.')
  } else {
    console.log('Bucket created successfully:', data)
  }
}

createBucket()
