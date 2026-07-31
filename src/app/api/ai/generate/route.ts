// src/app/api/ai/generate/route.ts

import { NextResponse } from 'next/server';
import { generateProductDescription } from '@/lib/openrouter'; // Updated import

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      );
    }

    const description = await generateProductDescription(body);
    return NextResponse.json({ description });
  } catch (error: any) {
    console.error('AI Generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate product description' },
      { status: 500 }
    );
  }
}