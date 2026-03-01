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
    console.error('Generation error:', error);
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
  language: 'id' | 'en',
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
  language: 'id' | 'en',
  image?: string
): Promise<Scene[]> {
  console.log(`[Step 1/4] Generating script in ${language === 'id' ? 'Indonesian' : 'English'}...`);
  
  try {
    const scenes = await mockGenerateScript(prompt, language);
    console.log(`[Step 1/4] Script generated with ${scenes.length} scenes`);
    return scenes;
  } catch (error) {
    console.error('[Step 1/4] Script generation failed:', error);
    throw new Error(`Script generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function generateImagesStep(scenes: Scene[]): Promise<string[]> {
  console.log('[Step 2/4] Generating images for each scene...');
  
  const imageUrls: string[] = [];
  
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    console.log(`[Step 2/4] Generating image for scene ${i + 1}...`);
    
    try {
      const imageUrl = await mockGenerateImage(scene.visual_description);
      imageUrls.push(imageUrl);
      console.log(`[Step 2/4] Image ${i + 1} generated: ${imageUrl}`);
    } catch (error) {
      console.error(`[Step 2/4] Image generation failed for scene ${i + 1}:`, error);
      throw new Error(`Image generation failed for scene ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  console.log(`[Step 2/4] All ${imageUrls.length} images generated`);
  return imageUrls;
}

async function generateVideosStep(imageUrls: string[]): Promise<string[]> {
  console.log('[Step 3/4] Generating videos from images...');
  
  const videoUrls: string[] = [];
  
  for (let i = 0; i < imageUrls.length; i++) {
    const imageUrl = imageUrls[i];
    console.log(`[Step 3/4] Generating video for image ${i + 1}...`);
    
    try {
      const videoUrl = await mockGenerateVideo(imageUrl, 5);
      videoUrls.push(videoUrl);
      console.log(`[Step 3/4] Video ${i + 1} generated: ${videoUrl}`);
    } catch (error) {
      console.error(`[Step 3/4] Video generation failed for image ${i + 1}:`, error);
      throw new Error(`Video generation failed for scene ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  console.log(`[Step 3/4] All ${videoUrls.length} videos generated`);
  return videoUrls;
}

async function mergeVideosStep(videoUrls: string[]): Promise<string> {
  console.log('[Step 4/4] Merging videos into final output...');
  
  try {
    const mergedUrl = await mockMergeVideos(videoUrls);
    console.log(`[Step 4/4] Videos merged: ${mergedUrl}`);
    return mergedUrl;
  } catch (error) {
    console.error('[Step 4/4] Video merging failed:', error);
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
