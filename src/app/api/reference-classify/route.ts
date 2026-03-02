import { NextRequest, NextResponse } from 'next/server';
import { classifyReferenceImages } from '@/lib/qwen';
import { detectLanguage } from '@/lib/utils';

interface ReferenceClassifyRequest {
  images: string[];
  prompt?: string;
  language?: 'id' | 'en' | 'zh';
}

export async function POST(request: NextRequest) {
  try {
    const body: ReferenceClassifyRequest = await request.json();
    const { images, prompt = '', language } = body;

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Images array is required' },
        { status: 400 }
      );
    }

    const effectiveLanguage = language || detectLanguage(prompt || '');
    const classifications = await classifyReferenceImages(images, effectiveLanguage);

    return NextResponse.json({
      success: true,
      data: {
        referenceImages: classifications,
        language: effectiveLanguage,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
