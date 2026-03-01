import { Scene, QwenScriptResponse } from '@/types';
import { retryWithBackoff } from './utils';

// Alibaba Cloud Model Studio API Configuration
// Qwen and Wan AI both use the same Model Studio API key
const MODEL_STUDIO_API_KEY = process.env.MODEL_STUDIO_API_KEY || '';
const MODEL_STUDIO_API_URL = process.env.MODEL_STUDIO_API_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';

// Model IDs
const QWEN_MODEL = 'qwen3.5-35b-a3b'; // Text to Scene model (lowercase)

export async function generateScript(
  input: string,
  language: 'id' | 'en',
  imageBase64?: string
): Promise<Scene[]> {
  return retryWithBackoff(async () => {
    const prompt = buildPrompt(input, language, imageBase64);
    
    const response = await fetch(`${MODEL_STUDIO_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MODEL_STUDIO_API_KEY}`,
      },
      body: JSON.stringify({
        model: QWEN_MODEL,
        messages: [
          {
            role: 'system',
            content: getSystemPrompt(language),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Qwen API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from Qwen API');
    }

    return parseScriptResponse(content);
  });
}

function getSystemPrompt(language: 'id' | 'en'): string {
  const basePrompt = language === 'id' 
    ? `Anda adalah penulis naskah drama komedi Cina profesional yang ahli dalam marketing. Buat naskah drama komedi 3 adegan untuk promosi produk/bisnis.

KEBIJAKAN KARAKTER (WAJIB DIPATUHI):
1. Jika user meminta karakter tokoh publik (selebritis, influencer, figur terkenal):
   - BUAT visual description dengan fitur wajah 1:1 mirip aslinya
   - Deskripsikan detail wajah, gaya rambut, pakaian khas, dan ekspresi khas mereka
   
2. Jika user meminta karakter SENSITIF (tokoh agama, presiden/kepala negara, teroris, atau figur kontroversial):
   - TOLAK PEMBUATAN dengan alasan "Karakter sensitif terdeteksi"
   - Kembalikan JSON dengan error message, BUKAN scene

3. Karakter fiksi/original: Buat dengan deskripsi visual lengkap dan unik

STRUKTUR WAJIB (3 ADEGAN):
1. ADEGAN 1 - ORIENTASI MASALAH: Perkenalkan karakter dalam situasi lucu yang menunjukkan masalah/masalah sehari-hari
2. ADEGAN 2 - PUNCAK MASALAH: Konflik memuncak dengan cara yang dramatis dan lucu
3. ADEGAN 3 - RESOLUSI & PROMOSI: Produk muncul sebagai solusi dengan promosi yang kuat

GAYA: Drama Cina yang over-the-top, ekspresif, lucu, dengan plot twist yang menarik.

Penting: Respons HARUS dalam format JSON yang valid:`
    : `You are a professional Chinese comedy drama scriptwriter who is an expert in marketing. Create a 3-scene comedy drama script for product/business promotion.

CHARACTER POLICY (MUST FOLLOW):
1. If user requests a PUBLIC FIGURE character (celebrity, influencer, famous personality):
   - CREATE visual description with 1:1 face accuracy to real life
   - Describe facial features, hairstyle, signature clothing, and characteristic expressions in detail
   
2. If user requests a SENSITIVE character (religious figures, presidents/head of state, terrorists, or controversial figures):
   - DECLINE GENERATION with reason "Sensitive character detected"
   - Return JSON with error message, NOT scenes

3. Fictional/original characters: Create with complete and unique visual descriptions

REQUIRED STRUCTURE (3 SCENES):
1. SCENE 1 - PROBLEM ORIENTATION: Introduce character in a funny situation showing everyday problem
2. SCENE 2 - CLIMAX: Conflict escalates dramatically and humorously  
3. SCENE 3 - RESOLUTION & PROMOTION: Product appears as solution with strong promotion

STYLE: Over-the-top Chinese drama, expressive, funny, with engaging plot twists.

Important: Response MUST be valid JSON:`;

  const jsonStructure = `{
  "scenes": [
    {
      "scene_number": 1,
      "scene_type": "problem",
      "title": "Scene title describing the situation",
      "visual_description": "Describe the scene setting, environment, mood, and what's happening. Include DSLR camera angle (eye-level, natural perspective), natural lighting (golden hour, soft window light, or studio lighting). Focus on surroundings and atmosphere - avoid mentioning AI-generated look. MUST look 100% like real photography.",
      "action": "Physical action/movement of characters",
      "dialogue": "Character dialogue with emotion markers",
      "characters": [
        {
          "name": "Character Name",
          "visual_description": "Detailed visual appearance: age, clothing, hairstyle, expression, physical features"
        }
      ]
    },
    {
      "scene_number": 2,
      "scene_type": "climax",
      "title": "Scene title",
      "visual_description": "Describe the scene setting, environment, mood, and dramatic moment. Include DSLR camera angle (eye-level, natural perspective), natural lighting (golden hour, soft window light, or studio lighting). Focus on surroundings and atmosphere - avoid mentioning AI-generated look. MUST look 100% like real photography.",
      "action": "Physical action/movement",
      "dialogue": "Character dialogue",
      "characters": [...]
    },
    {
      "scene_number": 3,
      "scene_type": "resolution",
      "title": "Scene title with product promotion",
      "visual_description": "Describe the scene setting, product placement, mood, and resolution. Include DSLR camera angle (eye-level, natural perspective), natural lighting (golden hour, soft window light, or studio lighting). Focus on surroundings and atmosphere - avoid mentioning AI-generated look. MUST look 100% like real photography.",
      "action": "Physical action showing product usage",
      "dialogue": "Promotional dialogue with call-to-action",
      "characters": [...]
    }
  ]
}`;

  const instructions = language === 'id'
    ? `
Instruksi Penting:
- Format video: 9:16 portrait untuk TikTok/Reels (bukan landscape)
- Drama harus LUCU dan DRAMATIS seperti sinetron Cina
- Setiap adegan harus memiliki minimal 1 karakter dengan deskripsi visual lengkap
- Dialog harus emosional dan ekspresif
- Produk/bisnis harus dipromosikan di adegan 3 dengan jelas
- Gunakan bahasa Indonesia yang natural dan engaging
- KAMERA: Gunakan sudut kamera DSLR realistis, seperti diambil oleh fotografer profesional dengan kamera Canon/Nikon. Hindari sudut kamera yang terlalu sempurna atau "terlalu AI". Gunakan sudut mata manusia normal, sedikit shake natural, pencahayaan alami seperti golden hour atau studio lighting profesional. 100% realistis seperti kehidupan nyata.`
    : `
Important Instructions:
- Video format: 9:16 portrait for TikTok/Reels (not landscape)
- Drama must be FUNNY and DRAMATIC like Chinese soap operas
- Each scene must have at least 1 character with complete visual description
- Dialogue should be emotional and expressive
- Product/business must be promoted clearly in scene 3
- Use natural and engaging English
- CAMERA: Use realistic DSLR camera angles, like shot by a professional photographer with Canon/Nikon camera. Avoid overly perfect or "too AI" camera angles. Use normal human eye level angles, slight natural shake, natural lighting like golden hour or professional studio lighting. 100% realistic like real life photography.`;

  return basePrompt + '\n\n' + jsonStructure + '\n' + instructions;
}

function buildPrompt(input: string, language: 'id' | 'en', imageBase64?: string): string {
  const basePrompt = language === 'id' 
    ? `Buat naskah drama komedi 3 adegan untuk promosi berdasarkan input berikut: "${input}"`
    : `Create a 3-scene comedy drama for promotion based on this input: "${input}"`;

  if (imageBase64) {
    const imageContext = language === 'id'
      ? `\n\nGAMBAR REFERENSI: Gambar yang diunggah bisa berupa:
- Foto produk yang akan dipromosikan
- Foto wajah orang yang akan menjadi karakter
- Foto latar/belakang lokasi
- Kombinasi dari ketiganya

Integrasikan elemen visual dari gambar ini ke dalam drama dengan cara yang natural dan kreatif. Produk/wajah/latar dari gambar harus muncul secara konsisten di adegan 3 (resolusi) sebagai fokus promosi.`
      : `\n\nREFERENCE IMAGE: The uploaded image could be:
- Product photo to be promoted
- Person's face to be the character
- Background/location setting
- Combination of all three

Integrate visual elements from this image into the drama naturally and creatively. The product/face/background from the image should appear consistently in scene 3 (resolution) as the promotion focus.`;
    
    return basePrompt + imageContext;
  }

  return basePrompt;
}

function parseScriptResponse(content: string): Scene[] {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsed: QwenScriptResponse & { error?: string; message?: string } = JSON.parse(jsonMatch[0]);
    
    // Check for sensitive character error
    if (parsed.error || parsed.message) {
      const errorMsg = parsed.error || parsed.message || '';
      if (errorMsg.toLowerCase().includes('sensitive') || 
          errorMsg.toLowerCase().includes('karakter sensitif')) {
        throw new Error(`SENSITIVE_CHARACTER_DETECTED: ${errorMsg}`);
      }
    }
    
    if (!parsed.scenes || !Array.isArray(parsed.scenes) || parsed.scenes.length !== 3) {
      throw new Error('Invalid script structure: expected exactly 3 scenes (problem, climax, resolution)');
    }
    
    parsed.scenes.forEach((scene, index) => {
      if (!scene.visual_description || !scene.action || !scene.dialogue) {
        throw new Error(`Scene ${index + 1} is missing required fields`);
      }
      // Ensure characters array exists
      if (!scene.characters || !Array.isArray(scene.characters) || scene.characters.length === 0) {
        scene.characters = [{
          name: index === 0 ? 'Main Character' : `Character ${index + 1}`,
          visual_description: 'A person in professional attire'
        }];
      }
      // Validate each character has required fields
      scene.characters = scene.characters.map((char, charIndex) => ({
        name: char.name || `Character ${charIndex + 1}`,
        visual_description: char.visual_description || 'A person in professional attire'
      }));
      scene.scene_number = index + 1;
    });
    
    return parsed.scenes;
  } catch (error) {
    console.error('Failed to parse script response:', error);
    // Re-throw the original error if it's already a sensitive character error
    if (error instanceof Error && error.message.includes('SENSITIVE_CHARACTER_DETECTED')) {
      throw error;
    }
    throw new Error('Failed to parse script from Qwen API response');
  }
}

export async function mockGenerateScript(
  input: string,
  language: 'id' | 'en'
): Promise<Scene[]> {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  if (language === 'id') {
    return [
      {
        scene_number: 1,
        scene_type: 'problem' as const,
        title: 'Masalah Dimulai',
        visual_description: 'Seorang wanita muda berusia 25 tahun dengan rambut hitam panjang, mengenakan piyama lucu berwarna pink, duduk di sofa dengan ekspresi panik sambil memegang wajahnya. Di sekitarnya berantakan dengan tumpukan pakaian dan produk kecantikan yang berantakan di meja rias. Pencahayaan dramatis seperti sinetron Cina dengan efek blur di background',
        action: 'Wanita itu terlihat stres, mengelus wajahnya dengan cemas, melihat ke cermin dengan ekspresi putus asa',
        dialogue: 'Wanita: (Menangis dramatis) "Kulitku jerawatan lagi! Besok ada kencan penting! Apa yang harus aku lakukan?!"',
        characters: [
          {
            name: 'Maya',
            visual_description: 'Wanita muda berusia 25 tahun, rambut hitam panjang berantakan, kulit berminyak dengan jerawat, mengenakan piyama pink lucu, ekspresi panik yang over-the-top'
          }
        ]
      },
      {
        scene_number: 2,
        scene_type: 'climax' as const,
        title: 'Puncak Drama',
        visual_description: 'Maya berdiri di depan cermin dengan ekspresi sedih yang berlebihan, tangan terentang ke atas seperti dalam sinetron Cina. Temannya datang dengan ekspresi heroik membawa produk ajaib. Background dengan efek cahaya dramatis dan partikel berkilauan',
        action: 'Teman datang dengan gerakan lambat (slow motion), mengangkat produk ke atas seperti pahlawan super, Maya menatap dengan mata berbinar penuh harap',
        dialogue: 'Teman: (Nada heroik) "Maya! Jangan khawatir! Aku punya solusi ajaib!" | Maya: (Terkejut) "Apa itu?!"',
        characters: [
          {
            name: 'Maya',
            visual_description: 'Wanita muda berusia 25 tahun, rambut berantakan, ekspresi sedih berlebihan dengan air mata palsu, piyama pink'
          },
          {
            name: 'Teman',
            visual_description: 'Wanita berusia 26 tahun, rambut ponytail rapi, mengenakan kaos casual putih, ekspresi percaya diri dengan senyum misterius, memegang produk kecantikan'
          }
        ]
      },
      {
        scene_number: 3,
        scene_type: 'resolution' as const,
        title: 'Solusi Ajaib',
        visual_description: 'Maya dengan wajah bersih bercahaya, tersenyum bahagia dengan efek kilauan di sekitar wajahnya. Produk kecantikan ditampilkan prominently di tengah frame dengan pencahayaan profesional. Background bersih dengan warna pastel lembut dan efek bokeh berkilauan',
        action: 'Maya memegang produk dengan bangga, membuat pose victory, menunjuk ke produk dengan ekspresi sangat puas',
        dialogue: 'Maya: (Bahagia) "Terima kasih [Nama Produk]! Jerawatku hilang dalam semalam! Beli sekarang juga!"',
        characters: [
          {
            name: 'Maya',
            visual_description: 'Wanita muda berusia 25 tahun, wajah bersih bercahaya tanpa jerawat, rambut diikat rapi, mengenakan dress putih cantik, ekspresi bahagia berlebihan, memegang produk kecantikan'
          }
        ]
      }
    ];
  }
  
  return [
    {
      scene_number: 1,
      scene_type: 'problem' as const,
      title: 'The Problem Begins',
      visual_description: 'A young woman aged 25 with long black hair, wearing cute pink pajamas, sitting on a sofa with a panicked expression while holding her face. Around her is messy with piles of clothes and scattered beauty products on the vanity table. Dramatic lighting like Chinese soap opera with blur effect in background',
      action: 'The woman looks stressed, rubbing her face anxiously, looking at the mirror with desperate expression',
      dialogue: 'Woman: (Crying dramatically) "My skin is breaking out again! I have an important date tomorrow! What should I do?!"',
      characters: [
        {
          name: 'Sarah',
          visual_description: 'Young woman aged 25, long messy black hair, oily skin with acne, wearing cute pink pajamas, over-the-top panicked expression'
        }
      ]
    },
    {
      scene_number: 2,
      scene_type: 'climax' as const,
      title: 'The Dramatic Climax',
      visual_description: 'Sarah standing in front of mirror with exaggerated sad expression, hands stretched upward like in a Chinese drama. Her friend arrives with heroic expression carrying a magical product. Background with dramatic light effects and sparkling particles',
      action: 'Friend arrives in slow motion, lifting the product up like a superhero, Sarah stares with sparkling eyes full of hope',
      dialogue: 'Friend: (Heroic tone) "Sarah! Don\'t worry! I have the magical solution!" | Sarah: (Shocked) "What is that?!"',
      characters: [
        {
          name: 'Sarah',
          visual_description: 'Young woman aged 25, messy hair, exaggerated sad expression with fake tears, pink pajamas'
        },
        {
          name: 'Friend',
          visual_description: 'Woman aged 26, neat ponytail hair, wearing casual white t-shirt, confident expression with mysterious smile, holding beauty product'
        }
      ]
    },
    {
      scene_number: 3,
      scene_type: 'resolution' as const,
      title: 'The Magical Solution',
      visual_description: 'Sarah with clean glowing face, smiling happily with sparkle effects around her face. The beauty product displayed prominently in center of frame with professional lighting. Clean background with soft pastel colors and sparkling bokeh effects',
      action: 'Sarah holds the product proudly, makes victory pose, points to product with very satisfied expression',
      dialogue: 'Sarah: (Happy) "Thank you [Product Name]! My acne disappeared overnight! Buy now!"',
      characters: [
        {
          name: 'Sarah',
          visual_description: 'Young woman aged 25, clean glowing face without acne, hair tied neatly, wearing beautiful white dress, over-the-top happy expression, holding beauty product'
        }
      ]
    }
  ];
}
