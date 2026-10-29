import { NextRequest, NextResponse } from 'next/server'
import { adminStorage } from '@/lib/firebaseAdmin'
import sharp from 'sharp'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'products'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const rawBuffer = Buffer.from(bytes)

    // Optimize image with Sharp (resize to max 1200x1200px and compress WebP)
    let optimizedBuffer = rawBuffer
    try {
      optimizedBuffer = await sharp(rawBuffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer()
    } catch (sharpErr) {
      console.warn('Sharp optimization skipped:', sharpErr)
    }

    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const uniqueFileName = `${Date.now()}-${sanitizedFileName}.webp`
    const storagePath = `${folder}/${uniqueFileName}`

    // 1. Try Firebase Cloud Storage if initialized and bucket configured
    if (adminStorage) {
      try {
        const bucket = adminStorage.bucket()
        const fileRef = bucket.file(storagePath)

        await fileRef.save(optimizedBuffer, {
          metadata: {
            contentType: 'image/webp',
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
        console.warn('Firebase Storage upload failed, falling back:', fbErr?.message)
      }
    }

    // 2. Safe serverless fallback: Embedded WebP Data URL
    // Works 100% reliably in serverless lambdas without write filesystem permissions or external storage keys
    const base64Data = optimizedBuffer.toString('base64')
    const dataUrl = `data:image/webp;base64,${base64Data}`

    return NextResponse.json({
      success: true,
      url: dataUrl,
      provider: 'embedded',
      fileName: uniqueFileName,
    })
  } catch (err: any) {
    console.error('Upload handler error:', err)
    return NextResponse.json(
      { error: err.message || 'Image processing failed' },
      { status: 500 }
    )
  }
}
