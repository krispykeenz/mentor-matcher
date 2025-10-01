import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { getAdminServices } from '@/lib/firebase/server';

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUser();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Firebase Storage using Admin SDK
    const { storage } = getAdminServices();
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!;
    console.log('Using bucket name:', bucketName);
    
    try {
      const bucket = storage.bucket(bucketName);
      const fileName = `avatars/${userId}/${Date.now()}.jpg`;
      const fileRef = bucket.file(fileName);

      // Upload the buffer
      await fileRef.save(buffer, {
        metadata: {
          contentType: file.type,
        },
      });

      // Make the file publicly readable
      await fileRef.makePublic();

      // Get the public URL
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
      
      return NextResponse.json({ url: publicUrl });
    } catch (bucketError: any) {
      console.error('Storage bucket error:', bucketError);
      
      // If bucket doesn't exist, return a helpful error message
      if (bucketError.message?.includes('bucket does not exist') || bucketError.status === 404) {
        return NextResponse.json({ 
          error: 'Firebase Storage is not initialized. Please enable Firebase Storage in your Firebase Console first.' 
        }, { status: 503 });
      }
      
      throw bucketError;
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    if (error?.message === 'Unauthenticated') {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}