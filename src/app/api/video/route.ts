import { NextRequest, NextResponse } from 'next/server';
import { generateVideo, mergeVideos } from '@/lib/wanai';

interface SceneVideoData {
  imageUrl: string;
  action: string;
  dialogue: string;
}

interface VideoRequest {
  scenes: SceneVideoData[];
  referenceImage?: string;
}

// Rate limiting
let lastCallTime = 0;
const MIN_INTERVAL = 5000; // 5 seconds between video API calls

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    if (timeSinceLastCall < MIN_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_INTERVAL - timeSinceLastCall));
    }
    lastCallTime = Date.now();

    const { scenes, referenceImage }: VideoRequest = await request.json();

    if (!Array.isArray(scenes) || scenes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Scenes array is required' },
        { status: 400 }
      );
    }

    // Generate videos from images sequentially with action/dialogue context
    const videoUrls: { url: string; sceneIndex: number }[] = [];
    
    for (let i = 0; i < scenes.length; i++) {
      const { imageUrl, action, dialogue } = scenes[i];
      
      if (!imageUrl) {
        continue;
      }

      // Generate video with action and dialogue context
      // Pass reference image to ensure visual consistency with Step 2
      let referenceBase64: string | undefined;
      if (referenceImage) {
        const base64Match = referenceImage.match(/^data:image\/[^;]+;base64,(.+)$/);
        if (base64Match) {
          referenceBase64 = base64Match[1];
        }
      }
      const videoUrl = await generateVideo(imageUrl, action, dialogue, 5, referenceBase64);
      videoUrls.push({ url: videoUrl, sceneIndex: i });
      
      // Add delay between calls for token efficiency
      if (i < scenes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    if (videoUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No videos were generated' },
        { status: 500 }
      );
    }

    // Return individual video URLs - frontend will merge them client-side
    const sortedUrls = videoUrls.sort((a, b) => a.sceneIndex - b.sceneIndex).map(v => v.url);
    
    return NextResponse.json({
      success: true,
      data: {
        videoUrls: sortedUrls,
        stage: 'completed',
      },
    });
  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
