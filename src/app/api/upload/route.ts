import { NextRequest, NextResponse } from 'next/server'

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

    // 1. Try Firebase Cloud Storage if credentials are configured
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      try {
        const { adminStorage } = await import('@/lib/firebaseAdmin')
        if (adminStorage) {
          const bucket = adminStorage.bucket()
          const fileRef = bucket.file(storagePath)

          await fileRef.save(buffer, {
            metadata: { contentType: mimeType },
            public: true,
          })

          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`
          return NextResponse.json({
            success: true,
            url: publicUrl,
            provider: 'firebase',
            fileName: uniqueFileName,
          })
        }
      } catch (fbErr: any) {
        console.warn('Firebase Storage upload failed:', fbErr?.message)
      }
    }

    // 2. Try writing to public directory if filesystem is writable
    try {
      const fs = await import('fs')
      const path = await import('path')
      const publicDir = path.join(process.cwd(), 'public', 'images', folder)
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true })
      }
      const filePath = path.join(publicDir, uniqueFileName)
      fs.writeFileSync(filePath, buffer)
      return NextResponse.json({
        success: true,
        url: `/images/${folder}/${uniqueFileName}`,
        provider: 'local',
        fileName: uniqueFileName,
      })
    } catch (fsErr) {
      console.warn('Filesystem write not available, falling back to data URL:', fsErr)
    }

    // 3. Fallback Data URL
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
