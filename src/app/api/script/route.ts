import { NextRequest, NextResponse } from 'next/server';
import { GenerateRequest } from '@/types';
import { detectLanguage } from '@/lib/utils';
import { generateScript } from '@/lib/qwen';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { prompt, image } = body;

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const language = detectLanguage(prompt);
    
    const scenes = await generateScript(prompt, language, image);
    
    return NextResponse.json({
      success: true,
      data: {
        scenes,
        language,
      },
    });
  } catch (error) {
    console.error('Script generation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
