import { storage } from './firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

/**
 * Uploads an image file directly to Firebase Cloud Storage.
 * Returns the permanent Google Cloud / Firebase download URL.
 */
export async function uploadToFirebaseStorage(
  file: File,
  folder = 'products'
): Promise<string> {
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const uniqueName = `${Date.now()}-${sanitizedName}`
  const fileRef = ref(storage, `${folder}/${uniqueName}`)

  const snapshot = await uploadBytes(fileRef, file, {
    contentType: file.type || 'image/jpeg',
  })

  return await getDownloadURL(snapshot.ref)
}

/**
 * High-res image uploader with automatic fallback:
 * 1. Attempts direct upload to Firebase Cloud Storage bucket.
 * 2. If Firebase credentials/rules reject it, falls back to the serverless upload endpoint.
 */
export async function uploadProductImage(
  file: File,
  folder = 'products'
): Promise<{ url: string; provider: 'firebase' | 'embedded' | 'server' }> {
  // 1. Try Firebase Client Storage first
  try {
    const firebaseUrl = await uploadToFirebaseStorage(file, folder)
    if (firebaseUrl) {
      return { url: firebaseUrl, provider: 'firebase' }
    }
  } catch (fbErr: any) {
    console.warn('Direct Firebase Storage upload notice:', fbErr?.message)
  }

  // 2. Fallback to API route
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  const text = await res.text()
  let result: any
  try {
    result = JSON.parse(text)
  } catch {
    throw new Error(`Upload server error (${res.status}): ${text.slice(0, 100)}`)
  }

  if (!res.ok) {
    throw new Error(result.error || 'Failed to upload photo')
  }

  return {
    url: result.url,
    provider: result.provider || 'server',
  }
}
