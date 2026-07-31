import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

// POST /api/upload — body: { image: "data:image/png;base64,..." }
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.shopId) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  try {
    const { image } = await req.json();
    if (!image) return NextResponse.json({ error: 'Aucune image fournie.' }, { status: 400 });

    const url = await uploadImage(image);
    return NextResponse.json({ url });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: "Échec de l'envoi de l'image." }, { status: 500 });
  }
}
