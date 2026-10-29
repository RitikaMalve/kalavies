import { NextRequest, NextResponse } from 'next/server'
import { adminStorage } from '@/lib/firebaseAdmin'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'products'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const mimeType = file.type || 'image/jpeg'

    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const uniqueFileName = `${Date.now()}-${sanitizedFileName}`
    const storagePath = `${folder}/${uniqueFileName}`

    // 1. Try Firebase Cloud Storage if configured
    if (adminStorage) {
      try {
        const bucket = adminStorage.bucket()
        const fileRef = bucket.file(storagePath)

        await fileRef.save(buffer, {
          metadata: {
            contentType: mimeType,
          },
          public: true,
        })

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`
        return NextResponse.json({
          success: true,
          url: publicUrl,
          provider: 'firebase',
          fileName: uniqueFileName,
        })
      } catch (fbErr: any) {
        console.warn('Firebase Storage upload failed:', fbErr?.message)
      }
    }

    // 2. Pure JavaScript Data URL fallback (Zero native C++ binary required, works on all platforms)
    const base64Data = buffer.toString('base64')
    const dataUrl = `data:${mimeType};base64,${base64Data}`

    return NextResponse.json({
      success: true,
      url: dataUrl,
      provider: 'embedded',
      fileName: uniqueFileName,
    })
  } catch (err: any) {
    console.error('Upload error:', err)
    return NextResponse.json(
      { error: err.message || 'Upload processing failed' },
      { status: 500 }
    )
  }
}
