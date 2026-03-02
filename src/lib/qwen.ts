import { Scene, QwenScriptResponse, ReferenceImageMeta, ReferenceImageType } from '@/types';
import { retryWithBackoff } from './utils';

// Alibaba Cloud Model Studio API Configuration
// Qwen and Wan AI both use the same Model Studio API key
const MODEL_STUDIO_API_KEY = process.env.MODEL_STUDIO_API_KEY || '';
const MODEL_STUDIO_API_URL = process.env.MODEL_STUDIO_API_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';

// Model IDs
const QWEN_MODEL = 'qwen3.5-35b-a3b'; // Text to Scene model (lowercase)
const QWEN_VL_MODEL = 'qwen-vl-max-latest'; // Vision model for reference image classification

export async function generateScript(
  input: string,
  language: 'id' | 'en' | 'zh',
  imageBase64?: string,
  referenceImages?: ReferenceImageMeta[]
): Promise<Scene[]> {
  return retryWithBackoff(async () => {
    const prompt = buildPrompt(input, language, imageBase64, referenceImages);
    
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

export async function classifyReferenceImages(
  images: string[],
  language: 'id' | 'en' | 'zh'
): Promise<ReferenceImageMeta[]> {
  const results: ReferenceImageMeta[] = [];

  for (const image of images) {
    try {
      const response = await fetch(`${MODEL_STUDIO_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MODEL_STUDIO_API_KEY}`,
        },
        body: JSON.stringify({
          model: QWEN_VL_MODEL,
          messages: [
            {
              role: 'system',
              content: 'Classify image role for short-video production. Return JSON only with keys: type, summary, confidence. type must be one of: product, character, background, mixed, unknown. If type is product/mixed, summary must include concrete visual anchors: product category, package shape, dominant colors, logo/brand text if visible, label layout, material/finish.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: buildReferenceClassifierPrompt(language),
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: image,
                  },
                },
              ],
            },
          ],
          temperature: 0.1,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        throw new Error(`Qwen VL API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      const parsed = parseReferenceClassifierResponse(content);
      results.push({ image, ...parsed });
    } catch {
      results.push({
        image,
        type: 'unknown',
        summary: language === 'id' ? 'Gambar referensi tidak dapat diklasifikasikan' : language === 'zh' ? '参考图像无法分类' : 'Reference image could not be classified',
        confidence: 0,
      });
    }
  }

  return results;
}

function buildReferenceClassifierPrompt(language: 'id' | 'en' | 'zh'): string {
  if (language === 'id') {
    return 'Klasifikasikan gambar ini untuk produksi video 3 scene. Pilih satu type: product (fokus produk), character (fokus wajah/orang), background (fokus tempat/latar), mixed (campuran), unknown. Jika product/mixed, ringkasan WAJIB detail visual produk: kategori produk, bentuk kemasan, warna dominan, teks/logo/brand yang terlihat, layout label, material/finishing. Kembalikan JSON saja: {"type":"...","summary":"...","confidence":0-1}.';
  }
  if (language === 'zh') {
    return '请将该图片分类为以下之一：product（产品为主）、character（人物/人脸为主）、background（场景背景为主）、mixed（混合）、unknown（不明确）。若为product/mixed，summary必须包含产品视觉锚点：品类、包装形状、主色、可见logo/品牌文字、标签布局、材质/表面质感。只返回JSON：{"type":"...","summary":"...","confidence":0-1}。';
  }
  return 'Classify this image for 3-scene video production into one type: product (product-focused), character (person/face-focused), background (location-focused), mixed, or unknown. If type is product/mixed, summary MUST include visual anchors: product category, packaging shape, dominant colors, visible logo/brand text, label layout, material/finish. Return JSON only: {"type":"...","summary":"...","confidence":0-1}.';
}

function parseReferenceClassifierResponse(content: string): Omit<ReferenceImageMeta, 'image'> {
  try {
    const text = typeof content === 'string' ? content : JSON.stringify(content);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const raw = jsonMatch ? jsonMatch[0] : '{}';
    const parsed = JSON.parse(raw) as { type?: string; summary?: string; confidence?: number };

    const allowedTypes: ReferenceImageType[] = ['product', 'character', 'background', 'mixed', 'unknown'];
    const type = allowedTypes.includes((parsed.type || '').toLowerCase() as ReferenceImageType)
      ? (parsed.type || 'unknown').toLowerCase() as ReferenceImageType
      : 'unknown';

    const confidence = typeof parsed.confidence === 'number'
      ? Math.max(0, Math.min(parsed.confidence, 1))
      : 0.5;

    return {
      type,
      summary: parsed.summary || '',
      confidence,
    };
  } catch {
    return {
      type: 'unknown',
      summary: '',
      confidence: 0,
    };
  }
}

function getSystemPrompt(language: 'id' | 'en' | 'zh'): string {
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

KUNCI KONSISTENSI KARAKTER (WAJIB DIPATUHI):
- Untuk karakter yang sama di scene 1-3, gunakan "name" dan "visual_description" yang SAMA PERSIS (kata demi kata).
- Jangan ubah umur, bentuk wajah, warna kulit, gaya rambut, outfit inti, atau properti signature untuk karakter yang sama.
- Jika ada perubahan adegan, hanya ubah pose, ekspresi, kamera, dan lingkungan; JANGAN ubah identitas visual karakter.
- Setiap "visual_description" karakter wajib memuat anchor ini secara eksplisit: usia, fitur wajah, rambut, outfit, properti (jika ada).

GAYA: Drama Cina yang over-the-top, ekspresif, lucu, dengan plot twist yang menarik.

KUNCI BAHASA OUTPUT (WAJIB):
- Semua field scene (title, visual_description, action, dialogue) HARUS dalam Bahasa Indonesia.
- DILARANG mencampur bahasa Inggris/China, kecuali nama brand/produk.

Penting: Respons HARUS dalam format JSON yang valid:`
  : language === 'zh'
  ? `你是一位专业的中国喜剧短剧编剧，同时是营销专家。请为产品/业务推广创作3个场景的喜剧短剧脚本。

角色政策（必须遵守）：
1. 如果用户要求公众人物角色（明星、网红、知名人物）：
   - 视觉描述要与真人面部高度一致
   - 详细描述脸部特征、发型、标志性服装与表情

2. 如果用户要求敏感角色（宗教人物、国家元首、恐怖分子或争议人物）：
   - 拒绝生成并返回原因“SENSITIVE_CHARACTER_DETECTED”
   - 返回带 error/message 的 JSON，而不是 scenes

3. 虚构/原创角色：给出完整且独特的视觉描述

必需结构（3个场景）：
1. 场景1 - 问题引入：用有趣方式呈现日常问题
2. 场景2 - 冲突高潮：冲突戏剧化并带喜剧感地升级
3. 场景3 - 解决与推广：产品作为解决方案并明确推广

角色一致性锁定（必须遵守）：
- 同一角色在场景1-3中的 "name" 和 "visual_description" 必须逐字完全一致。
- 不得改变年龄、脸型、肤色、发型、核心服装和标志性道具。
- 场景变化只允许改变姿势、表情、镜头和环境，不得改变角色视觉身份。
- 每个角色的 "visual_description" 必须包含锚点：年龄、面部特征、发型、服装、道具（如有）。

风格：夸张、戏剧化、有反转的中国短剧喜剧风格。

输出语言锁定（必须）：
- 所有 scene 字段（title、visual_description、action、dialogue）必须使用中文。
- 禁止混用英文或印尼语（品牌名/产品名除外）。

重要：响应必须是合法 JSON：`
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

CHARACTER CONSISTENCY LOCK (MUST FOLLOW):
- For the same recurring character across scenes 1-3, keep "name" and "visual_description" EXACTLY IDENTICAL (word-for-word).
- Do not change age, face shape, skin tone, hairstyle, core outfit, or signature prop for the same character.
- Scene changes may affect only pose, expression, camera framing, and environment; visual identity must remain fixed.
- Each character "visual_description" must explicitly include these anchors: age, facial features, hair, outfit, and prop (if any).

STYLE: Over-the-top Chinese drama, expressive, funny, with engaging plot twists.

OUTPUT LANGUAGE LOCK (MUST FOLLOW):
- All scene fields (title, visual_description, action, dialogue) MUST be in English.
- Do not mix Indonesian/Chinese except for brand or product names.

Important: Response MUST be valid JSON:`;

  const jsonStructure = `{
  "scenes": [
    {
      "scene_number": 1,
      "scene_type": "problem",
      "title": "Scene title describing the situation",
      "visual_description": "[Subject]: [character in specific situation with problem], [action happening], [environmental context]. [Visual Style]: professional photography, photojournalistic documentary style, candid moment. [Composition]: medium shot with shallow depth of field, natural framing, rule of thirds. [Lighting]: soft natural window lighting with gentle shadows, realistic light falloff. [Color]: natural palette, accurate skin tones, realistic saturation. [Technical]: high resolution, sharp focus, natural bokeh, 35mm photography aesthetic. NO illustration, painting, digital art, or AI look - MUST be photorealistic.",
      "action": "Physical action/movement of characters",
      "dialogue": "Character dialogue with emotion markers",
      "characters": [
        {
          "name": "Character Name",
          "visual_description": "ANCHOR LOCK (repeat exactly in all scenes for same character): age, facial features, skin tone, hairstyle, core outfit, signature prop"
        }
      ]
    },
    {
      "scene_number": 2,
      "scene_type": "climax",
      "title": "Scene title",
      "visual_description": "[Subject]: [character at dramatic peak], [intense action], [emotional environment]. [Visual Style]: professional photography, photojournalistic documentary style, dramatic candid. [Composition]: dynamic framing capturing emotion, shallow depth of field, environmental context. [Lighting]: dramatic natural lighting with realistic shadows and contrast. [Color]: natural palette with emotional tone, accurate skin tones. [Technical]: high resolution, sharp focus, natural bokeh, 35mm photography aesthetic. NO illustration, painting, digital art, or AI look - MUST be photorealistic.",
      "action": "Physical action/movement",
      "dialogue": "Character dialogue",
      "characters": [...]
    },
    {
      "scene_number": 3,
      "scene_type": "resolution",
      "title": "Scene title with product promotion",
      "visual_description": "[Subject]: [character with product], [confident action], [resolution setting]. [Visual Style]: professional photography, photojournalistic style, authentic moment. [Composition]: product-aware framing, shallow depth of field, natural positioning. [Lighting]: flattering natural lighting with realistic shadows. [Color]: natural vibrant palette, accurate skin tones, product colors true to life. [Technical]: high resolution, sharp focus, natural bokeh, 35mm photography aesthetic. NO illustration, painting, digital art, or AI look - MUST be photorealistic.",
      "action": "Physical action showing product usage",
      "dialogue": "Promotional dialogue with call-to-action",
      "characters": [...]
    }
  ]
}`;

  const instructions = language === 'id'
    ? `Instruksi Penting:
- Format video: 9:16 portrait untuk TikTok/Reels (bukan landscape)
- Drama harus LUCU dan DRAMATIS seperti sinetron Cina
- Setiap adegan harus memiliki minimal 1 karakter dengan deskripsi visual lengkap
- Untuk karakter yang sama antar scene, field "name" dan "visual_description" HARUS sama persis (word-by-word)
- Jangan mengganti identitas karakter (umur, wajah, warna kulit, rambut, outfit inti, properti signature) di scene 1-3
- Dialog harus emosional dan ekspresif
- Produk/bisnis harus dipromosikan di adegan 3 dengan jelas
- Gunakan bahasa Indonesia yang natural dan engaging
- REALISTIC PHOTOGRAPHY - Deskripsi visual HARUS mengikuti formula Subject + Visual Style + Composition + Lighting + Color + Technical. Gaya professional photography, photojournalistic, documentary realism. Komposisi medium shot, shallow depth of field, natural framing. Pencahayaan soft natural window light, realistic shadows. Warna natural palette, accurate skin tones. Teknis high resolution, sharp focus, 35mm aesthetic. ABSOLUT TIDAK BOLEH terlihat seperti illustration, painting, digital art, atau AI.
- Gunakan bahasa yang sama dengan input user (Bahasa Indonesia).`
  : language === 'zh'
  ? `重要说明：
- 视频比例：9:16 竖屏（TikTok/Reels），不是横屏
- 剧情要有趣、戏剧化，符合中文短剧节奏
- 每个场景至少有1个角色，并提供完整视觉描述
- 同一角色跨场景时，"name" 和 "visual_description" 必须逐字一致
- 不得改变角色核心身份（年龄、脸部、肤色、发型、核心服装、标志道具）
- 对白要有情绪与表现力
- 第3场景必须清晰展示产品/业务推广
- 必须使用中文输出所有 scene 的 title/action/dialogue
- 真实摄影风格：视觉描述遵循 Subject + Visual Style + Composition + Lighting + Color + Technical，禁止插画/动漫/数字绘画风格。`
  : `Important Instructions:
- Video format: 9:16 portrait for TikTok/Reels (not landscape)
- Drama must be FUNNY and DRAMATIC like Chinese soap operas
- Each scene must have at least 1 character with complete visual description
- For recurring characters across scenes, "name" and "visual_description" MUST be exactly identical (word-by-word)
- Never change character identity (age, face, skin tone, hair, core outfit, signature prop) across scenes 1-3
- Dialogue should be emotional and expressive
- Product/business must be promoted clearly in scene 3
- Use natural and engaging English
- REALISTIC PHOTOGRAPHY - Visual descriptions MUST follow formula Subject + Visual Style + Composition + Lighting + Color + Technical. Style professional photography, photojournalistic, documentary realism. Composition medium shot, shallow depth of field, natural framing. Lighting soft natural window light, realistic shadows. Color natural palette, accurate skin tones. Technical high resolution, sharp focus, 35mm aesthetic. ABSOLUTELY MUST NOT look like illustration, painting, digital art, or AI.
- Use the same language as user input (English).`;

  return basePrompt + '\n\n' + jsonStructure + '\n' + instructions;
}

function buildPrompt(
  input: string,
  language: 'id' | 'en' | 'zh',
  imageBase64?: string,
  referenceImages?: ReferenceImageMeta[]
): string {
  const basePrompt = language === 'id' 
    ? `Buat naskah drama komedi 3 adegan untuk promosi berdasarkan input berikut: "${input}"`
    : language === 'zh'
    ? `请基于以下输入创作3个场景的喜剧推广短剧："${input}"`
    : `Create a 3-scene comedy drama for promotion based on this input: "${input}"`;

  let referenceTypeContext = '';
  if (referenceImages && referenceImages.length > 0) {
    const lines = referenceImages.map((item, idx) => {
      const summary = item.summary ? ` - ${item.summary}` : '';
      return `${idx + 1}. ${item.type}${summary}`;
    }).join('\n');

    referenceTypeContext = language === 'id'
      ? `\n\nHASIL DETEKSI TIPE GAMBAR REFERENSI (gunakan sebagai konteks wajib):\n${lines}`
      : language === 'zh'
      ? `\n\n参考图像类型检测结果（必须作为剧情上下文）：\n${lines}`
      : `\n\nREFERENCE IMAGE TYPE DETECTION (must be used as context):\n${lines}`;
  }

  if (imageBase64) {
    const imageContext = language === 'id'
      ? `\n\nGAMBAR REFERENSI: Gambar yang diunggah bisa berupa:
- Foto produk yang akan dipromosikan
- Foto wajah orang yang akan menjadi karakter
- Foto latar/belakang lokasi
- Kombinasi dari ketiganya

Integrasikan elemen visual dari gambar ini ke dalam drama dengan cara yang natural dan kreatif. Produk/wajah/latar dari gambar harus muncul secara konsisten di adegan 3 (resolusi) sebagai fokus promosi.
Jika gambar berisi wajah karakter, jadikan itu sebagai identity anchor dan pertahankan identik di ketiga scene (tanpa berubah).`
  : language === 'zh'
  ? `\n\n参考图片：你上传的图片可能是：
- 要推广的产品图
- 作为角色的人脸图
- 场景背景/地点图
- 以上组合

请将图片中的视觉元素自然融入剧情。图片中的产品/人脸/背景应在第3场景中保持一致并作为推广重点。
如果图片包含人脸，请将其作为固定身份锚点，并在3个场景中保持一致。`
      : `\n\nREFERENCE IMAGE: The uploaded image could be:
- Product photo to be promoted
- Person's face to be the character
- Background/location setting
- Combination of all three

Integrate visual elements from this image into the drama naturally and creatively. The product/face/background from this image should appear consistently in scene 3 (resolution) as the promotion focus.
If the image contains a person face, treat it as a fixed identity anchor and keep it identical across all 3 scenes.`;
    
    return basePrompt + imageContext + referenceTypeContext;
  }

  return basePrompt + referenceTypeContext;
}

function parseScriptResponse(content: string): Scene[] {
  try {
    const extractedJson = extractJsonObject(content);
    if (!extractedJson) {
      throw new Error('No JSON found in response');
    }

    let parsed: QwenScriptResponse & { error?: string; message?: string };
    try {
      parsed = JSON.parse(extractedJson);
    } catch {
      const repairedJson = sanitizeJsonStringControlChars(extractedJson);
      parsed = JSON.parse(repairedJson);
    }
    
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

function extractJsonObject(text: string): string | null {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  return text.slice(firstBrace, lastBrace + 1);
}

function sanitizeJsonStringControlChars(rawJson: string): string {
  let result = '';
  let inString = false;
  let escaping = false;

  for (let index = 0; index < rawJson.length; index += 1) {
    const char = rawJson[index];

    if (escaping) {
      result += char;
      escaping = false;
      continue;
    }

    if (char === '\\') {
      result += char;
      if (inString) {
        escaping = true;
      }
      continue;
    }

    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }

    if (inString) {
      const charCode = char.charCodeAt(0);

      if (char === '\n') {
        result += '\\n';
        continue;
      }
      if (char === '\r') {
        result += '\\r';
        continue;
      }
      if (char === '\t') {
        result += '\\t';
        continue;
      }
      if (charCode >= 0 && charCode <= 31) {
        result += `\\u${charCode.toString(16).padStart(4, '0')}`;
        continue;
      }
    }

    result += char;
  }

  return result;
}

export async function mockGenerateScript(
  input: string,
  language: 'id' | 'en' | 'zh'
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
