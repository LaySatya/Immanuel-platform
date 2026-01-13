import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to extract YouTube video ID
export function getYouTubeVideoId(url) {
  if (!url) return null
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  
  return null
}

// Helper to get YouTube embed URL
export function getYouTubeEmbedUrl(url) {
  const videoId = getYouTubeVideoId(url)
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null
}

// Upload file to Supabase storage
export async function uploadFile(file, bucket) {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return { success: true, url: publicUrl, path: data.path }
  } catch (error) {
    console.error('Upload error:', error)
    return { success: false, error: error.message }
  }
}

// Delete file from Supabase storage
export async function deleteFile(bucket, filePath) {
  try {
    // Extract filename from full URL if needed
    const fileName = filePath.includes('/') ? filePath.split('/').pop() : filePath
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName])

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    return { success: false, error: error.message }
  }
}

// CRUD operations for songs
export async function createSong(songData) {
  try {
    const { data, error } = await supabase
      .from('songs')
      .insert([songData])
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Create song error:', error)
    return { success: false, error: error.message }
  }
}

export async function getSongs() {
  try {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Get songs error:', error)
    return { success: false, error: error.message }
  }
}

export async function updateSong(id, updates) {
  try {
    const { data, error } = await supabase
      .from('songs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Update song error:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteSong(id) {
  try {
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Delete song error:', error)
    return { success: false, error: error.message }
  }
}

export async function incrementViews(id) {
  try {
    const { error } = await supabase.rpc('increment_views', { song_id: id })
    if (error) throw error
    return { success: true }
  } catch (error) {
    // Fallback if RPC doesn't exist
    const { data: song } = await supabase
      .from('songs')
      .select('views')
      .eq('id', id)
      .single()
    
    if (song) {
      await supabase
        .from('songs')
        .update({ views: (song.views || 0) + 1 })
        .eq('id', id)
    }
    return { success: true }
  }
}

export async function incrementDownloads(id) {
  try {
    const { data: song } = await supabase
      .from('songs')
      .select('downloads')
      .eq('id', id)
      .single()
    
    if (song) {
      await supabase
        .from('songs')
        .update({ downloads: (song.downloads || 0) + 1 })
        .eq('id', id)
    }
    return { success: true }
  } catch (error) {
    console.error('Increment downloads error:', error)
    return { success: false, error: error.message }
  }
}