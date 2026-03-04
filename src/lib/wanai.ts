import { retryWithBackoff } from './utils';

// Alibaba Cloud Model Studio API Configuration
// Wan AI uses the same Model Studio API key as Qwen
const MODEL_STUDIO_API_KEY = process.env.MODEL_STUDIO_API_KEY || '';

// Wan AI uses different base URL and endpoints (not OpenAI-compatible)
const WANAI_API_URL = 'https://dashscope-intl.aliyuncs.com/api/v1';

// Model IDs
const WANAI_T2I_MODEL = 'wan2.6-t2i'; // Text to Image model
const WANAI_I2V_MODEL = 'wan2.6-i2v-flash'; // Image to Video model

// Rate limiting for token efficiency
let lastImageCall = 0;
const IMAGE_CALL_INTERVAL = 3000; // Minimum 3 seconds between calls

export function buildImagePrompt(
  sceneDescription: string,
  action: string,
  characters: { name: string; visual_description: string }[],
  referenceHints?: string,
  productIdentityLock?: string
): string {
  // Extract character descriptions and lock character anchors for continuity
  const characterDesc = characters.map(c => c.visual_description).join('; ');
  const characterAnchor = characters
    .map(c => `${c.name}: ${c.visual_description}`)
    .join(' | ');
  
  // PROFESSIONAL PHOTOGRAPHY PROMPT FORMULA - 100% REALISTIC
  // [Subject] + [Visual Style] + [Composition] + [Lighting] + [Color] + [Technical]
  
  const subject = `${characterDesc}, ${action}, ${sceneDescription}`;
  const visualStyle = 'professional photography, photojournalistic style, documentary realism, candid moment capture';
  const composition = 'medium shot with shallow depth of field, natural framing, rule of thirds, environmental context visible';
  const lighting = 'soft natural window lighting with gentle shadows, realistic light falloff, practical light sources only';
  const color = 'natural color palette, accurate skin tones, realistic saturation, no color grading artifacts';
  const technical = 'high resolution, sharp focus on subject, natural bokeh, realistic texture detail, 35mm photography aesthetic';
  const continuityLock = `character continuity lock: preserve identical face identity, age, skin tone, hairstyle, core outfit, and signature prop for recurring characters across all scenes. anchor references: ${characterAnchor}`;
  const productLock = productIdentityLock
    ? `product identity lock: use EXACTLY the same product as reference (${productIdentityLock}). Keep the same brand/logo text, packaging shape, cap/lid shape, label layout, dominant colors, and material finish. Do not replace, redesign, or restyle the product.`
    : '';
  
  const referenceLock = referenceHints ? `reference guidance: ${referenceHints}` : '';
  const realisticPrompt = `${subject}, ${visualStyle}, ${composition}, ${lighting}, ${color}, ${technical}, ${continuityLock}, ${productLock}, ${referenceLock}`.trim();
  
  return realisticPrompt;
}

export async function generateImage(
  description: string,
  referenceImageBase64?: string
): Promise<string> {
  // Rate limiting
  const now = Date.now();
  const timeSinceLastCall = now - lastImageCall;
  if (timeSinceLastCall < IMAGE_CALL_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, IMAGE_CALL_INTERVAL - timeSinceLastCall));
  }
  lastImageCall = Date.now();
  
  return retryWithBackoff(async () => {
    // Note: Wan2.6-T2I model does NOT support image input
    // Reference image is only used for video generation (I2V)
    // For T2I, we incorporate reference image description into the text prompt if needed
    
    // Submit synchronous job (async not supported for this account)
    const response = await fetch(`${WANAI_API_URL}/services/aigc/multimodal-generation/generation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MODEL_STUDIO_API_KEY}`,
      },
      body: JSON.stringify({
        model: WANAI_T2I_MODEL,
        input: {
          messages: [
            {
              role: 'user',
              content: [
                {
                  text: description
                }
              ]
            }
          ]
        },
        parameters: {
          negative_prompt: 'illustration, painting, drawing, cartoon, anime, CGI, 3D render, digital art, synthetic, plastic skin, doll-like, uncanny valley, oversaturated, oversharpened, artificial lighting, flat lighting, video game, computer generated, fake, unrealistic proportions, smooth plastic, wax figure, mannequin, doll face, anime eyes, cartoonish, digital painting, vector art, clipart, stock photo, overly perfect, Instagram filter, beauty filter, airbrushed, plastic surgery look, green screen, chroma key, composited, fake shadows, artificial colors, AI artifacts, watermark, text, logo, wrong product, different product, altered packaging, changed logo, different label text, different brand name',
          prompt_extend: false,
          watermark: false,
          n: 1,
          size: '720*1280' // 9:16 aspect ratio for TikTok/Reels
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Wan AI Image API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract image URL from response - try multiple formats
    const imageUrl = 
      data.output?.choices?.[0]?.message?.content?.[0]?.image ||
      data.output?.results?.[0]?.url;
    
    if (!imageUrl) {
      throw new Error('No image URL received from Wan AI API');
    }

    return imageUrl;
  });
}

async function pollImageTask(taskId: string, maxAttempts: number = 30): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between polls
    
    const response = await fetch(`${WANAI_API_URL}/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MODEL_STUDIO_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to check image task status: ${response.status}`);
    }

    const data = await response.json();
    
    const status = data.output?.task_status;
    
    if (status === 'SUCCEEDED') {
      // Extract image URL from results array
      const imageUrl = data.output?.results?.[0]?.url;
      if (imageUrl) {
        return imageUrl;
      }
      throw new Error('Image task succeeded but no URL found');
    }
    
    if (status === 'FAILED') {
      throw new Error(`Image generation failed: ${data.output?.message || 'Unknown error'}`);
    }
    
    // Continue polling if status is PENDING or RUNNING
  }
  
  throw new Error('Image generation timed out');
}

// Rate limiting for video generation
let lastVideoCall = 0;
const VIDEO_CALL_INTERVAL = 5000; // Minimum 5 seconds between calls

export async function generateVideo(
  imageUrl: string,
  action: string,
  dialogue: string,
  duration: number = 5,
  referenceImageBase64?: string,
  sceneVisualDescription?: string
): Promise<string> {
  // Rate limiting
  const now = Date.now();
  const timeSinceLastCall = now - lastVideoCall;
  if (timeSinceLastCall < VIDEO_CALL_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, VIDEO_CALL_INTERVAL - timeSinceLastCall));
  }
  lastVideoCall = Date.now();

  const finalDuration = Math.max(5, Math.min(duration, 10));
  const hasReferenceImage = Boolean(referenceImageBase64 && referenceImageBase64.length > 100);
  
  return retryWithBackoff(async () => {
    // Build prompt that aligns video motion with action and dialogue
    const motionPrompt = buildVideoPrompt(action, dialogue, hasReferenceImage, sceneVisualDescription);
    
    // Build input - I2V model requires img_url for the input image
    const input: any = {
      prompt: motionPrompt,
      img_url: imageUrl, // I2V model requires img_url field
    };
    
    // First, submit the async job
    const submitResponse = await fetch(`${WANAI_API_URL}/services/aigc/video-generation/video-synthesis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable',
        'Authorization': `Bearer ${MODEL_STUDIO_API_KEY}`,
      },
      body: JSON.stringify({
        model: WANAI_I2V_MODEL,
        input,
        parameters: {
          size: '720*1280', // 9:16 aspect ratio for TikTok/Reels
          duration: finalDuration,
          shot_type: 'single'
        }
      }),
    });

    if (!submitResponse.ok) {
      throw new Error(`Wan AI Video API error: ${submitResponse.status} ${submitResponse.statusText}`);
    }

    const submitData = await submitResponse.json();
    const taskId = submitData.output?.task_id;
    
    if (!taskId) {
      throw new Error('No task ID received from Wan AI API');
    }

    // Poll for task completion
    return pollVideoTask(taskId);
  });
}

function buildVideoPrompt(
  action: string,
  dialogue: string,
  hasReferenceImage: boolean = false,
  sceneVisualDescription?: string
): string {
  // Extract key actions from the action description
  const actionKeywords = action.toLowerCase();
  
  // Build motion prompt that matches the action
  let motionDescription = '';
  
  if (actionKeywords.includes('talk') || actionKeywords.includes('speak') || actionKeywords.includes('bicara') || actionKeywords.includes('ngobrol') || actionKeywords.includes('berkata')) {
    motionDescription = 'character talking with natural mouth movements and hand gestures, expressive facial expressions matching dialogue';
  } else if (actionKeywords.includes('walk') || actionKeywords.includes('run') || actionKeywords.includes('jalan') || actionKeywords.includes('berjalan') || actionKeywords.includes('lari')) {
    motionDescription = 'character walking naturally with fluid body movement, realistic leg and arm motion';
  } else if (actionKeywords.includes('hold') || actionKeywords.includes('carry') || actionKeywords.includes('pegang') || actionKeywords.includes('membawa')) {
    motionDescription = 'character holding object with natural hand movements, slight body sway, realistic grip';
  } else if (actionKeywords.includes('cry') || actionKeywords.includes('sad') || actionKeywords.includes('menangis') || actionKeywords.includes('sedih')) {
    motionDescription = 'character showing sad emotion with tearful eyes, wiping tears, emotional body language';
  } else if (actionKeywords.includes('laugh') || actionKeywords.includes('happy') || actionKeywords.includes('tertawa') || actionKeywords.includes('bahagia')) {
    motionDescription = 'character laughing joyfully with bright smile, energetic body movement, expressive happiness';
  } else if (actionKeywords.includes('surprise') || actionKeywords.includes('shock') || actionKeywords.includes('kaget') || actionKeywords.includes('terkejut')) {
    motionDescription = 'character showing surprised expression with wide eyes, hands near face, sudden body reaction';
  } else {
    motionDescription = 'character moving naturally with subtle body movements, realistic breathing motion, lifelike gestures';
  }
  
  // Add dialogue context if available
  const normalizedDialogue = normalizeDialogueForPrompt(dialogue);
  if (normalizedDialogue.length > 10) {
    const emotion = extractEmotionFromDialogue(dialogue);
    motionDescription += `, ${emotion} emotional tone matching the dialogue context`;
  }

  const realismLock = 'photorealistic live-action video, natural skin texture, physically plausible motion, realistic eye blink and breathing cadence';
  const stabilityLock = 'no identity drift, no face morphing, no extra fingers, no anatomy deformation, no jitter, no flicker, no sudden camera jump';
  const cameraLock = 'single continuous shot, stable handheld feel, subtle camera motion only, natural motion blur';
  const identityLock = hasReferenceImage
    ? 'strictly preserve the same identity from reference face image and first frame'
    : 'strictly preserve the same identity from the first frame';
  const lipSyncLock = normalizedDialogue.length > 0
    ? `accurate lip synchronization to spoken dialogue timing, mouth articulation follows phonemes naturally, spoken content: ${normalizedDialogue}`
    : 'mouth remains naturally closed or minimally moving when there is no spoken dialogue';
  const sceneContext = sceneVisualDescription && sceneVisualDescription.trim().length > 0
    ? `scene context to preserve: ${sceneVisualDescription.trim()}`
    : '';
  const explicitDirectives = `follow this scene action exactly: ${action || 'subtle natural idle movement'}, align performance tone with this dialogue: ${normalizedDialogue || 'no spoken dialogue'}`;

  return `${sceneContext}, ${explicitDirectives}, ${motionDescription}, ${realismLock}, ${cameraLock}, ${stabilityLock}, ${identityLock}, ${lipSyncLock}`;
}

function normalizeDialogueForPrompt(dialogue: string): string {
  return dialogue
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 240);
}

function extractEmotionFromDialogue(dialogue: string): string {
  const lower = dialogue.toLowerCase();
  if (lower.includes('!') || lower.includes('wow') || lower.includes('amazing')) {
    return 'excited';
  } else if (lower.includes('?') || lower.includes('what') || lower.includes('how')) {
    return 'curious';
  } else if (lower.includes('sad') || lower.includes('cry') || lower.includes('sorry')) {
    return 'sad';
  } else if (lower.includes('happy') || lower.includes('great') || lower.includes('love')) {
    return 'happy';
  } else if (lower.includes('angry') || lower.includes('hate') || lower.includes('stupid')) {
    return 'angry';
  }
  return 'neutral';
}

async function pollVideoTask(taskId: string, maxAttempts: number = 60): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds between polls (faster)
    
    const response = await fetch(`${WANAI_API_URL}/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MODEL_STUDIO_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to check video task status: ${response.status}`);
    }

    const data = await response.json();
    
    const status = data.output?.task_status;
    
    if (status === 'SUCCEEDED') {
      // Video URL is at output.video_url
      const videoUrl = data.output?.video_url;
      if (videoUrl) {
        return videoUrl;
      }
      throw new Error('Video task succeeded but no URL found');
    }
    
    if (status === 'FAILED') {
      throw new Error(`Video generation failed: ${data.output?.message || 'Unknown error'}`);
    }
    
    // Continue polling if status is PENDING or RUNNING
  }
  
  throw new Error('Video generation timed out');
}

export async function mergeVideos(videoUrls: string[]): Promise<string[]> {
  // Return all video URLs - frontend will display them sequentially
  // Since Wan AI doesn't provide video merging API, we return array of URLs
  return videoUrls;
}

export async function mockGenerateImage(description: string): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const placeholderImages = [
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1024&h=1024&fit=crop',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1024&h=1024&fit=crop',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1024&h=1024&fit=crop',
  ];
  
  const hash = description.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return placeholderImages[hash % placeholderImages.length];
}

export async function mockGenerateVideo(imageUrl: string, duration: number = 5): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const placeholderVideos = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  ];
  
  const hash = imageUrl.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return placeholderVideos[hash % placeholderVideos.length];
}

export async function mockMergeVideos(videoUrls: string[]): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
}
