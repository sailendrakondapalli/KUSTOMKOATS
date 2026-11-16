import api from './apiClient'

const BUCKET = "product-images"

const VIDEO_EXTS = ["mp4", "mov", "webm", "avi", "mkv"]
const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp", "avif"]

export function isVideoUrl(url) {
  if (!url) return false
  const lower = url.toLowerCase().split("?")[0]
  return VIDEO_EXTS.some(ext => lower.endsWith("." + ext))
}

/**
 * Upload a single image or video file via backend API
 * Returns the public URL
 */
export async function uploadProductImage(file) {
  const ext = file.name.split(".").pop().toLowerCase()
  const isVideo = VIDEO_EXTS.includes(ext)
  const isImage = IMAGE_EXTS.includes(ext)

  if (!isVideo && !isImage) throw new Error("Only JPG, PNG, WEBP images or MP4/MOV/WEBM videos allowed")

  if (isImage && file.size > 5 * 1024 * 1024) throw new Error("Image must be under 5MB")
  if (isVideo && file.size > 50 * 1024 * 1024) throw new Error("Video must be under 50MB")

  try {
    const response = await api.storage.upload(file, BUCKET)
    return response.data.publicUrl
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

/**
 * Upload multiple images/videos, returns array of public URLs
 */
export async function uploadProductImages(files) {
  const urls = []
  for (const file of files) {
    const url = await uploadProductImage(file)
    urls.push(url)
  }
  return urls
}

/**
 * Delete an image/video from storage by its public URL
 */
export async function deleteProductImage(publicUrl) {
  try {
    const marker = `/product-images/`
    const idx = publicUrl.indexOf(marker)
    if (idx === -1) return
    const filePath = publicUrl.slice(idx + marker.length)
    
    // Call backend delete endpoint if it exists
    // For now, just log warning as backend may handle this differently
    console.warn('Delete file functionality needs backend endpoint:', filePath)
  } catch (e) {
    console.warn("Failed to delete file from storage:", e)
  }
}
