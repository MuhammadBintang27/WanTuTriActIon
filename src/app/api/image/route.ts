import { NextRequest, NextResponse } from 'next/server';
import { generateImage, buildImagePrompt } from '@/lib/wanai';

interface SceneData {
  visualDescription: string;
  action: string;
  characters: { name: string; visual_description: string }[];
  sceneIndex: number;
}

interface ImageRequest {
  scenes: SceneData[];
  referenceImage?: string;
  regenerateOnly?: boolean;
}

// Rate limiting
let lastCallTime = 0;
const MIN_INTERVAL = 1000; // 1 second between API calls

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    if (timeSinceLastCall < MIN_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_INTERVAL - timeSinceLastCall));
    }
    lastCallTime = Date.now();

    const body: ImageRequest = await request.json();
    const { scenes, referenceImage, regenerateOnly } = body;
    
    if (!Array.isArray(scenes) || scenes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Scenes array is required' },
        { status: 400 }
      );
    }

    // Generate images sequentially with delay for token efficiency
    const imageUrls: { url: string; sceneIndex: number }[] = [];
    
    for (const scene of scenes) {
      const { visualDescription, action, characters, sceneIndex } = scene;
      
      if (!visualDescription || visualDescription.trim().length === 0) {
        continue;
      }

      // Build enhanced prompt with strong prompt engineering
      // Note: Wan2.6-T2I does NOT support image input, so we don't pass reference image here
      // Reference image will be used only for video generation (I2V model)
      const enhancedPrompt = buildImagePrompt(visualDescription, action, characters);

      const imageUrl = await generateImage(enhancedPrompt);
      imageUrls.push({ url: imageUrl, sceneIndex });
      
      // Add delay between calls for token efficiency
      if (scenes.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    if (imageUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No images were generated' },
        { status: 500 }
      );
    }
    
    // If regenerating single image, return just that
    if (regenerateOnly && imageUrls.length === 1) {
      return NextResponse.json({
        success: true,
        data: {
          imageUrl: imageUrls[0].url,
        },
      });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        imageUrls,
      },
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
