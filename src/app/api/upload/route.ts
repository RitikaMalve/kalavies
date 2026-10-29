import { NextRequest, NextResponse } from 'next/server'
import { adminStorage } from '@/lib/firebaseAdmin'
import fs from 'fs'
import path from 'path'

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

    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const uniqueFileName = `${Date.now()}-${sanitizedFileName}`
    const storagePath = `${folder}/${uniqueFileName}`

    // 1. Try uploading to Firebase Cloud Storage if bucket is available
    if (adminStorage) {
      try {
        const bucket = adminStorage.bucket()
        const fileRef = bucket.file(storagePath)

        await fileRef.save(buffer, {
          metadata: {
            contentType: file.type || 'image/jpeg',
          },
          public: true,
        })

        // Public download URL from Firebase Storage
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`
        return NextResponse.json({
          success: true,
          url: publicUrl,
          provider: 'firebase',
          fileName: uniqueFileName,
        })
      } catch (fbErr: any) {
        console.warn('Firebase Storage upload failed, falling back to local storage:', fbErr?.message)
      }
    }

    // 2. Fallback to local storage (persisting to public/images/{folder})
    const targetDir = path.join(process.cwd(), 'public/images', folder)
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }

    const filePath = path.join(targetDir, uniqueFileName)
    fs.writeFileSync(filePath, buffer)

    const localUrl = `/images/${folder}/${uniqueFileName}`
    return NextResponse.json({
      success: true,
      url: localUrl,
      provider: 'local',
      fileName: uniqueFileName,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
