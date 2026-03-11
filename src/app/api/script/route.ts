import { NextRequest, NextResponse } from 'next/server';
import { GenerateRequest } from '@/types';
import { detectLanguage } from '@/lib/utils';
import { generateScript } from '@/lib/qwen';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { prompt, image, referenceImages } = body;

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const language = detectLanguage(prompt);
    
    const scenes = await generateScript(prompt, language, image, referenceImages);
    
    return NextResponse.json({
      success: true,
      data: {
        scenes,
        language,
      },
    });
  } catch (error) {
    // Handle sensitive character detection
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    if (errorMessage.includes('SENSITIVE_CHARACTER_DETECTED')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Sensitive character detected. Please avoid using religious figures, political leaders, terrorists, or other controversial figures in your request.',
          code: 'SENSITIVE_CHARACTER'
        },
        { status: 400 }
      );
    }
    
    // Detect upstream API quota exhaustion (400 Bad Request)
    if (errorMessage.includes('400') && errorMessage.includes('Bad Request')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'API quota has been exhausted. Please try again later.',
          code: 'API_QUOTA_EXHAUSTED'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}
