import { NextRequest, NextResponse } from 'next/server';
import { GenerateRequest, GenerateResponse, GenerationStage, Scene } from '@/types';
import { detectLanguage } from '@/lib/utils';
import { mockGenerateScript } from '@/lib/qwen';
import { mockGenerateImage, mockGenerateVideo, mockMergeVideos } from '@/lib/wanai';

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
    
    const result = await generateDrama(prompt, language, image);
    
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

async function generateDrama(
  prompt: string,
  language: 'id' | 'en' | 'zh',
  image?: string
): Promise<GenerateResponse> {
  const scenes = await generateScriptStep(prompt, language, image);
  
  const imageUrls = await generateImagesStep(scenes);
  
  const videoUrls = await generateVideosStep(imageUrls);
  
  const finalVideoUrl = await mergeVideosStep(videoUrls);
  
  return {
    videoUrl: finalVideoUrl,
    scenes,
    stage: 'completed',
  };
}

async function generateScriptStep(
  prompt: string,
  language: 'id' | 'en' | 'zh',
  image?: string
): Promise<Scene[]> {
  const languageLabel = language === 'id' ? 'Indonesian' : language === 'zh' ? 'Chinese' : 'English';
  
  try {
    const scenes = await mockGenerateScript(prompt, language);
    return scenes;
  } catch (error) {
    throw new Error(`Script generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function generateImagesStep(scenes: Scene[]): Promise<string[]> {
  const imageUrls: string[] = [];
  
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    
    try {
      const imageUrl = await mockGenerateImage(scene.visual_description);
      imageUrls.push(imageUrl);
    } catch (error) {
      throw new Error(`Image generation failed for scene ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return imageUrls;
}

async function generateVideosStep(imageUrls: string[]): Promise<string[]> {
  const videoUrls: string[] = [];
  
  for (let i = 0; i < imageUrls.length; i++) {
    const imageUrl = imageUrls[i];
    
    try {
      const videoUrl = await mockGenerateVideo(imageUrl, 5);
      videoUrls.push(videoUrl);
    } catch (error) {
      throw new Error(`Video generation failed for scene ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return videoUrls;
}

async function mergeVideosStep(videoUrls: string[]): Promise<string> {
  try {
    const mergedUrl = await mockMergeVideos(videoUrls);
    return mergedUrl;
  } catch (error) {
    throw new Error(`Video merging failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Video Generation API',
    endpoints: {
      POST: '/api/generate - Generate a drama video from text input',
    },
  });
}
