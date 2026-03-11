import { NextRequest, NextResponse } from 'next/server';
import { generateVideo, mergeVideos } from '@/lib/wanai';
import { ReferenceImageMeta } from '@/types';

interface SceneVideoData {
  imageUrl: string;
  visualDescription: string;
  action: string;
  dialogue: string;
}

interface VideoRequest {
  scenes: SceneVideoData[];
  referenceImage?: string;
  referenceImages?: ReferenceImageMeta[];
}

// Rate limiting
let lastCallTime = 0;
const MIN_INTERVAL = 5000; // 5 seconds between video API calls

// Helper to detect quota exhaustion from upstream API errors
function isQuotaError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes('400') && msg.includes('Bad Request');
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    if (timeSinceLastCall < MIN_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_INTERVAL - timeSinceLastCall));
    }
    lastCallTime = Date.now();

    const { scenes, referenceImage, referenceImages }: VideoRequest = await request.json();

    if (!Array.isArray(scenes) || scenes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Scenes array is required' },
        { status: 400 }
      );
    }

    // Generate videos from images sequentially with action/dialogue context
    const videoUrls: { url: string; sceneIndex: number }[] = [];
    
    for (let i = 0; i < scenes.length; i++) {
      const { imageUrl, visualDescription, action, dialogue } = scenes[i];
      
      if (!imageUrl) {
        continue;
      }

      // Generate video with action and dialogue context
      // Pass reference image to ensure visual consistency with Step 2
      let referenceBase64: string | undefined;
      const preferredReference =
        referenceImage ||
        referenceImages?.find((item) => item.type === 'character' && item.image)?.image ||
        referenceImages?.[0]?.image;

      if (preferredReference) {
        const base64Match = preferredReference.match(/^data:image\/[^;]+;base64,(.+)$/);
        if (base64Match) {
          referenceBase64 = base64Match[1];
        }
      }
      const sceneDuration = estimateSceneDuration(action, dialogue);
      const videoUrl = await generateVideo(imageUrl, action, dialogue, sceneDuration, referenceBase64, visualDescription);
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
    if (isQuotaError(error)) {
      return NextResponse.json(
        { success: false, error: 'API quota has been exhausted. Please try again later.', code: 'API_QUOTA_EXHAUSTED' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

function estimateSceneDuration(action: string, dialogue: string): number {
  const normalizedDialogue = dialogue
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const wordCount = normalizedDialogue.length > 0
    ? normalizedDialogue.split(' ').filter(Boolean).length
    : 0;

  const hasRichAction = action.length > 80;
  const estimated = Math.ceil(wordCount / 2.2) + (hasRichAction ? 2 : 1);

  return Math.max(5, Math.min(estimated, 10));
}
