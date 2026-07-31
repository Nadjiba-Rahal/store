import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Shop from '@/models/Shop';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// This app is single-owner: registration is only allowed once, to create
// the store's admin account. After that this route always refuses.
export async function GET() {
  await connectDB();
  const existingShop = await Shop.findOne().lean();
  return NextResponse.json({ configured: !!existingShop });
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const existingShop = await Shop.findOne();
    if (existingShop) {
      return NextResponse.json(
        { error: "La boutique est déjà configurée. Connectez-vous depuis /login." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, email, password, shopName, phone, wilayaCode } = body;

    if (!name || !email || !password || !shopName || !phone || !wilayaCode) {
      return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères.' },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'Un compte existe déjà avec cet email.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'admin',
    });

    const base = slugify(shopName) || 'boutique';
    let slug = base;
    let n = 1;
    while (await Shop.findOne({ slug })) {
      slug = `${base}-${n++}`;
    }

    await Shop.create({
      owner: user._id,
      name: shopName,
      slug,
      phone,
      wilayaCode,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Une erreur est survenue. Réessayez.' }, { status: 500 });
  }
}