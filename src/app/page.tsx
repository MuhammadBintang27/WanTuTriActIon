'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  X, 
  Sparkles, 
  AlertCircle,
  CheckCircle2,
  Wand2,
  Image as ImageIcon,
  RefreshCw,
  Play,
  FileText,
  ChevronRight,
  Loader2,
  Plus,
  Trash2,
  Users,
  Send,
  Lightbulb,
  PenTool,
  Film,
  Download,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { VideoPlayer } from '@/components/VideoPlayer';
import { GenerationStage, Scene, Character, SceneType } from '@/types';
import { cn, fileToBase64, detectLanguage } from '@/lib/utils';

interface SceneWithImage extends Scene {
  imageUrl?: string;
  isGeneratingImage?: boolean;
}

type UILanguage = 'en' | 'id' | 'zh';

const translations = {
  en: {
    heroTitle: 'WanTuTri',
    heroSubtitle: 'Powered by Qwen & WAN Alibaba Cloud',
    heroDescription: 'Transform your product into an entertaining viral Chinese comedy drama. From idea to publish-ready video in minutes.',
    startButton: 'Start Creating Drama',
    createSection: 'Create Your Drama',
    createDescription: 'Describe your product or idea, add reference image if available',
    inputPlaceholder: 'Example: Anti-acne skincare product for teenagers...',
    referenceImage: 'Reference image:',
    referenceTypes: 'Product / Face / Background',
    useOwnScript: 'Use your own script',
    script: 'Script',
    images: 'Images',
    video: 'Video',
    editScript: 'Edit Drama Script',
    visualDescription: 'Visual Description',
    action: 'Action',
    dialogue: 'Dialogue',
    characters: 'Characters',
    add: 'Add',
    generateImages: 'Generate Images for All Scenes',
    generatingImages: 'Generating Images...',
    regenerate: 'Regenerate',
    generating: 'Generating...',
    generateVideo: 'Generate Video',
    generatingVideo: 'Generating Video...',
    videoSuccess: 'Video Generated Successfully!',
    view: 'View',
    download: 'Download',
    createNew: 'Create New Drama',
    howItWorks: 'How It Works',
    howItWorksDesc: 'Three simple steps to create your marketing drama',
    step1Title: 'Describe Your Idea',
    step1Desc: 'Tell us about the product or concept you want to promote. AI will understand and develop the story.',
    step2Title: 'Generate Script',
    step2Desc: 'AI creates a 3-scene drama script with problem, climax, and resolution structure.',
    step3Title: 'Build Your Video',
    step3Desc: 'Generate images and videos aligned with action and dialogue for stunning results.',
    aboutUs: 'About Us',
    aboutDesc: 'WanTuTri AI is an AI-powered video marketing creation platform that combines Qwen LLM and Wan AI technology from Alibaba Cloud. We help businesses and creators create entertaining and effective drama video content for product promotion.',
    contactUs: 'Contact Us',
    contactDesc: 'Have questions or need assistance? Reach out to our team.',
    problem: 'Problem',
    climax: 'Climax',
    resolution: 'Resolution',
  },
  id: {
    heroTitle: 'WanTuTri',
    heroSubtitle: 'Ditenagai oleh Qwen & WAN Alibaba Cloud',
    heroDescription: 'Ubah produk Anda menjadi drama komedi Cina yang menghibur dan viral. Dari ide hingga video siap publikasi dalam hitungan menit.',
    startButton: 'Mulai Buat Drama',
    createSection: 'Buat Drama Anda',
    createDescription: 'Deskripsikan produk atau ide Anda, tambahkan gambar referensi jika ada',
    inputPlaceholder: 'Contoh: Produk skincare anti jerawat untuk remaja...',
    referenceImage: 'Gambar referensi:',
    referenceTypes: 'Produk / Wajah / Latar belakang',
    useOwnScript: 'Gunakan skrip sendiri',
    script: 'Naskah',
    images: 'Gambar',
    video: 'Video',
    editScript: 'Edit Naskah Drama',
    visualDescription: 'Deskripsi Visual',
    action: 'Aksi',
    dialogue: 'Dialog',
    characters: 'Karakter',
    add: 'Tambah',
    generateImages: 'Generate Gambar untuk Semua Adegan',
    generatingImages: 'Membuat Gambar...',
    regenerate: 'Generate Ulang',
    generating: 'Membuat...',
    generateVideo: 'Generate Video',
    generatingVideo: 'Membuat Video...',
    videoSuccess: 'Video Berhasil Dibuat!',
    view: 'Lihat',
    download: 'Unduh',
    createNew: 'Buat Drama Baru',
    howItWorks: 'Cara Kerja',
    howItWorksDesc: 'Tiga langkah mudah untuk membuat drama marketing Anda',
    step1Title: 'Deskripsikan Ide',
    step1Desc: 'Ceritakan produk atau konsep yang ingin dipromosikan. AI akan memahami dan mengembangkan cerita.',
    step2Title: 'Generate Naskah',
    step2Desc: 'AI membuat naskah drama 3 adegan dengan struktur masalah, puncak, dan solusi.',
    step3Title: 'Bangun Video',
    step3Desc: 'Generate gambar dan video yang selaras dengan aksi dan dialog untuk hasil yang memukau.',
    aboutUs: 'Tentang Kami',
    aboutDesc: 'WanTuTri AI adalah platform pembuatan video marketing berbasis AI yang menggabungkan teknologi Qwen LLM dan Wan AI dari Alibaba Cloud. Kami membantu bisnis dan kreator membuat konten video drama yang menghibur dan efektif untuk promosi produk.',
    contactUs: 'Hubungi Kami',
    contactDesc: 'Punya pertanyaan atau butuh bantuan? Hubungi tim kami.',
    problem: 'Masalah',
    climax: 'Puncak',
    resolution: 'Solusi',
  },
  zh: {
    heroTitle: 'WanTuTri',
    heroSubtitle: '由 Qwen 和 WAN 阿里云提供技术支持',
    heroDescription: '将您的产品转化为娱乐性病毒式中国喜剧短剧。从创意到可发布的视频只需几分钟。',
    startButton: '开始创作短剧',
    createSection: '创作您的短剧',
    createDescription: '描述您的产品或创意，如有需要可添加参考图片',
    inputPlaceholder: '示例：青少年祛痘护肤产品...',
    referenceImage: '参考图片：',
    referenceTypes: '产品 / 人脸 / 背景',
    useOwnScript: '使用自己的脚本',
    script: '脚本',
    images: '图片',
    video: '视频',
    editScript: '编辑短剧脚本',
    visualDescription: '视觉描述',
    action: '动作',
    dialogue: '对话',
    characters: '角色',
    add: '添加',
    generateImages: '为所有场景生成图片',
    generatingImages: '正在生成图片...',
    regenerate: '重新生成',
    generating: '正在生成...',
    generateVideo: '生成视频',
    generatingVideo: '正在生成视频...',
    videoSuccess: '视频生成成功！',
    view: '查看',
    download: '下载',
    createNew: '创作新短剧',
    howItWorks: '工作原理',
    howItWorksDesc: '三个简单步骤创建您的营销短剧',
    step1Title: '描述您的创意',
    step1Desc: '告诉我们您想推广的产品或概念。AI将理解并发展故事。',
    step2Title: '生成脚本',
    step2Desc: 'AI创建具有问题、高潮和解决结构的三场景短剧脚本。',
    step3Title: '制作视频',
    step3Desc: '生成与动作和对话对齐的图片和视频，获得惊艳效果。',
    aboutUs: '关于我们',
    aboutDesc: 'WanTuTri AI是一个AI驱动的视频营销创作平台，结合了阿里巴巴云的Qwen LLM和Wan AI技术。我们帮助企业和创作者创建娱乐性和有效的短剧视频内容来推广产品。',
    contactUs: '联系我们',
    contactDesc: '有问题或需要帮助？请联系我们的团队。',
    problem: '问题',
    climax: '高潮',
    resolution: '解决',
  }
};

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [stage, setStage] = useState<GenerationStage>('idle');
  const [scenes, setScenes] = useState<SceneWithImage[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uiLang, setUiLang] = useState<UILanguage>('en');
  const [promptLang, setPromptLang] = useState<'id' | 'en'>('en');
  const [showScriptOutput, setShowScriptOutput] = useState(false);
  
  const t = translations[uiLang];
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePromptChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setPrompt(text);
    // Detect language for AI prompt only (not UI)
    if (text.length > 5) {
      setPromptLang(detectLanguage(text));
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setUploadedImage(`data:${file.type};base64,${base64}`);
      setError(null);
    } catch (err) {
      setError('Failed to process image');
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Step 1: Generate Script
  const handleGenerateScript = async () => {
    if (!prompt.trim()) {
      setError(t.inputPlaceholder === 'Contoh: Produk skincare anti jerawat untuk remaja...' ? 'Silakan masukkan deskripsi produk/ide' : 'Please enter product/idea description');
      return;
    }

    setIsGeneratingScript(true);
    setError(null);
    setStage('scripting');
    setShowScriptOutput(true);

    try {
      const response = await fetch('/api/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          image: uploadedImage || undefined,
          language: promptLang,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Script generation failed');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Script generation failed');
      }

      setScenes(result.data.scenes);
      setStage('script_review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setStage('error');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Update scene fields
  const updateScene = (index: number, field: keyof Scene, value: string) => {
    setScenes(prev => prev.map((scene, i) => 
      i === index ? { ...scene, [field]: value } : scene
    ));
  };

  // Character management
  const addCharacter = (sceneIndex: number) => {
    setScenes(prev => prev.map((scene, i) => 
      i === sceneIndex ? { 
        ...scene, 
        characters: [...scene.characters, { name: '', visual_description: '' }]
      } : scene
    ));
  };

  const removeCharacter = (sceneIndex: number, charIndex: number) => {
    setScenes(prev => prev.map((scene, i) => 
      i === sceneIndex ? { 
        ...scene, 
        characters: scene.characters.filter((_, ci) => ci !== charIndex)
      } : scene
    ));
  };

  const updateCharacter = (sceneIndex: number, charIndex: number, field: 'name' | 'visual_description', value: string) => {
    setScenes(prev => prev.map((scene, i) => 
      i === sceneIndex ? { 
        ...scene, 
        characters: scene.characters.map((char, ci) => 
          ci === charIndex ? { ...char, [field]: value } : char
        )
      } : scene
    ));
  };

  // Step 2: Generate Images for all scenes
  const handleGenerateAllImages = async () => {
    setIsGeneratingImages(true);
    setError(null);
    setStage('image_generation');

    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenes: scenes.map(s => ({
            visualDescription: s.visual_description,
            action: s.action,
            characters: s.characters,
            sceneIndex: s.scene_number - 1
          })),
          referenceImage: uploadedImage
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Image generation failed');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Image generation failed');
      }

      const imageUrls = result.data.imageUrls;
      setScenes(prev => prev.map((scene, i) => ({
        ...scene,
        imageUrl: imageUrls.find((img: { sceneIndex: number; url: string }) => img.sceneIndex === i)?.url,
      })));
      setStage('image_review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setStage('error');
    } finally {
      setIsGeneratingImages(false);
    }
  };

  // Regenerate image for a single scene
  const handleRegenerateImage = async (index: number) => {
    setScenes(prev => prev.map((scene, i) => 
      i === index ? { ...scene, isGeneratingImage: true } : scene
    ));

    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenes: [{
            visualDescription: scenes[index].visual_description,
            action: scenes[index].action,
            characters: scenes[index].characters,
            sceneIndex: index
          }],
          referenceImage: uploadedImage,
          regenerateOnly: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Image regeneration failed');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Image regeneration failed');
      }

      setScenes(prev => prev.map((scene, i) => 
        i === index ? { 
          ...scene, 
          imageUrl: result.data.imageUrl,
          isGeneratingImage: false 
        } : scene
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setScenes(prev => prev.map((scene, i) => 
        i === index ? { ...scene, isGeneratingImage: false } : scene
      ));
    }
  };

  // Step 3: Generate Video
  const handleGenerateVideo = async () => {
    if (scenes.some(s => !s.imageUrl)) {
      setError(t.video === 'Video' ? 'All scenes must have images' : 'Semua adegan harus memiliki gambar');
      return;
    }

    setIsGeneratingVideo(true);
    setError(null);
    setStage('video_generation');

    try {
      const response = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenes: scenes.map(s => ({
            imageUrl: s.imageUrl,
            action: s.action,
            dialogue: s.dialogue
          })),
          referenceImage: uploadedImage, // Pass reference image for visual consistency
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Video generation failed');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Video generation failed');
      }

      setVideoUrls(result.data.videoUrls);
      setCurrentVideoIndex(0);
      setStage('completed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setStage('error');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const reset = () => {
    setPrompt('');
    setUploadedImage(null);
    setScenes([]);
    setVideoUrls([]);
    setCurrentVideoIndex(0);
    setStage('idle');
    setError(null);
    setShowScriptOutput(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getSceneTypeLabel = (type: SceneType) => {
    const labels = {
      problem: t.problem,
      climax: t.climax,
      resolution: t.resolution
    };
    return labels[type];
  };

  const getSceneTypeColor = (type: SceneType) => {
    const colors = {
      problem: 'bg-red-100 text-red-700 border-red-200',
      climax: 'bg-orange-100 text-orange-700 border-orange-200',
      resolution: 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[type];
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                WanTuTri AI
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#input" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Create</a>
              <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
              <a href="#about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">About</a>
              
              {/* Language Selector */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {(['en', 'id', 'zh'] as UILanguage[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setUiLang(lang)}
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                      uiLang === lang
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    {lang === 'en' && 'EN'}
                    {lang === 'id' && 'ID'}
                    {lang === 'zh' && '中文'}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Section 1: Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Marketing Drama</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              WanTuTri
            </h1>
            <p className="text-xl sm:text-2xl text-gray-500 mb-4">
              Powered by Qwen & WAN Alibaba Cloud
            </p>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              {t.heroDescription}
            </p>
            <motion.a
              href="#input"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              <Wand2 className="w-5 h-5" />
              {t.startButton}
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Section 2: Input */}
      <section id="input" className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t.createSection}
            </h2>
            <p className="text-gray-600">
              {t.createDescription}
            </p>
          </motion.div>

          {/* Input Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex gap-4">
                {/* Image Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isGeneratingScript}
                  className="flex-shrink-0 w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                  title={t.add}
                >
                  {uploadedImage ? (
                    <img src={uploadedImage} alt="Ref" className="w-10 h-10 object-cover rounded-lg" />
                  ) : (
                    <Plus className="w-6 h-6 text-gray-600" />
                  )}
                </button>

                {/* Text Input */}
                <div className="flex-1">
                  <textarea
                    value={prompt}
                    onChange={handlePromptChange}
                    placeholder={t.inputPlaceholder}
                    className="w-full h-12 py-3 px-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700 placeholder:text-gray-400"
                    disabled={isGeneratingScript}
                    rows={1}
                  />
                </div>

                {/* Send Button */}
                <motion.button
                  whileHover={{ scale: isGeneratingScript ? 1 : 1.05 }}
                  whileTap={{ scale: isGeneratingScript ? 1 : 0.95 }}
                  onClick={handleGenerateScript}
                  disabled={isGeneratingScript || !prompt.trim()}
                  className="flex-shrink-0 w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 rounded-xl flex items-center justify-center transition-colors"
                >
                  {isGeneratingScript ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 text-white" />
                  )}
                </motion.button>
              </div>

              {/* Uploaded Image Preview */}
              {uploadedImage && (
                <div className="mt-4 flex items-center gap-2">
                  <div className="relative">
                    <img src={uploadedImage} alt="Reference" className="h-20 w-20 object-cover rounded-lg border border-gray-200" />
                    <button
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p className="font-medium">
                      {t.referenceImage}
                    </p>
                    <p className="text-xs">
                      {t.referenceTypes}
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              {/* Use Your Own Script Toggle */}
              <button
                onClick={() => setShowScriptOutput(!showScriptOutput)}
                className="mt-4 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                {t.useOwnScript}
                {showScriptOutput ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>

          {/* Generated Script Output */}
          <AnimatePresence>
            {showScriptOutput && scenes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-8 space-y-6"
              >
                {/* Progress Indicator */}
                {stage !== 'idle' && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                      {[
                        { id: 'script', label: t.script, icon: FileText },
                        { id: 'images', label: t.images, icon: ImageIcon },
                        { id: 'video', label: t.video, icon: Play },
                      ].map((s, index) => {
                        const Icon = s.icon;
                        const isActive = 
                          (s.id === 'script' && (stage === 'scripting' || stage === 'script_review')) ||
                          (s.id === 'images' && (stage === 'image_generation' || stage === 'image_review')) ||
                          (s.id === 'video' && (stage === 'video_generation' || stage === 'completed'));
                        const isCompleted = 
                          (s.id === 'script' && (stage === 'image_generation' || stage === 'image_review' || stage === 'video_generation' || stage === 'completed')) ||
                          (s.id === 'images' && (stage === 'video_generation' || stage === 'completed')) ||
                          (s.id === 'video' && stage === 'completed');
                        
                        return (
                          <div key={s.id} className="flex items-center">
                            <div className={cn(
                              'flex items-center gap-2 px-4 py-2 rounded-full transition-colors',
                              isCompleted ? 'bg-green-100 text-green-700' :
                              isActive ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-400'
                            )}>
                              <Icon className="w-4 h-4" />
                              <span className="text-sm font-medium">{s.label}</span>
                            </div>
                            {index < 2 && (
                              <ChevronRight className="w-5 h-5 text-gray-300 mx-2" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Script Review Section */}
                {stage === 'script_review' && (
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                      <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        {t.editScript}
                      </h3>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      {scenes.map((scene, index) => (
                        <motion.div
                          key={scene.scene_number}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gray-50 rounded-xl p-5 border border-gray-200"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </span>
                            <span className={cn('px-3 py-1 rounded-full text-xs font-medium border', getSceneTypeColor(scene.scene_type))}>
                              {getSceneTypeLabel(scene.scene_type)}
                            </span>
                            <input
                              type="text"
                              value={scene.title}
                              onChange={(e) => updateScene(index, 'title', e.target.value)}
                              className="flex-1 font-medium text-gray-900 bg-transparent border-none focus:ring-0 p-0"
                            />
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t.visualDescription}
                              </label>
                              <textarea
                                value={scene.visual_description}
                                onChange={(e) => updateScene(index, 'visual_description', e.target.value)}
                                className="w-full min-h-[80px] p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  {t.action}
                                </label>
                                <textarea
                                  value={scene.action}
                                  onChange={(e) => updateScene(index, 'action', e.target.value)}
                                  className="w-full min-h-[60px] p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  {t.dialogue}
                                </label>
                                <textarea
                                  value={scene.dialogue}
                                  onChange={(e) => updateScene(index, 'dialogue', e.target.value)}
                                  className="w-full min-h-[60px] p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                              </div>
                            </div>

                            {/* Characters Section */}
                            <div className="pt-4 border-t border-gray-200">
                              <div className="flex items-center justify-between mb-3">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                  <Users className="w-4 h-4" />
                                  {t.characters}
                                </label>
                                <button
                                  onClick={() => addCharacter(index)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                                >
                                  <Plus className="w-4 h-4" />
                                  {t.add}
                                </button>
                              </div>
                              
                              <div className="space-y-3">
                                {scene.characters.map((char, charIndex) => (
                                  <motion.div
                                    key={charIndex}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white rounded-lg p-3 border border-gray-200"
                                  >
                                    <div className="flex items-start gap-2">
                                      <div className="flex-1 space-y-2">
                                        <input
                                          type="text"
                                          value={char.name}
                                          onChange={(e) => updateCharacter(index, charIndex, 'name', e.target.value)}
                                          placeholder={t.characters}
                                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <textarea
                                          value={char.visual_description}
                                          onChange={(e) => updateCharacter(index, charIndex, 'visual_description', e.target.value)}
                                          placeholder={t.visualDescription}
                                          className="w-full min-h-[60px] px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                      </div>
                                      {scene.characters.length > 1 && (
                                        <button
                                          onClick={() => removeCharacter(index, charIndex)}
                                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="p-6 border-t border-gray-100">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGenerateAllImages}
                        disabled={isGeneratingImages}
                        className="w-full py-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingImages ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>{t.generatingImages}</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-5 h-5" />
                            <span>{t.generateImages}</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Image Review Section */}
                {(stage === 'image_generation' || stage === 'image_review' || stage === 'video_generation' || stage === 'completed') && scenes.some(s => s.imageUrl) && (
                  <div className="space-y-6">
                    {scenes.map((scene, index) => (
                      <motion.div
                        key={scene.scene_number}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                      >
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </span>
                            <span className={cn('px-3 py-1 rounded-full text-xs font-medium border', getSceneTypeColor(scene.scene_type))}>
                              {getSceneTypeLabel(scene.scene_type)}
                            </span>
                            <span className="font-medium text-gray-900">{scene.title}</span>
                          </div>
                          {scene.imageUrl && (
                            <div className="flex items-center gap-2">
                              <a
                                href={scene.imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title={t.view}
                              >
                                <Eye className="w-5 h-5" />
                              </a>
                              <a
                                href={scene.imageUrl}
                                download
                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title={t.download}
                              >
                                <Download className="w-5 h-5" />
                              </a>
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                          {/* Left: Editable Content */}
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t.visualDescription}
                              </label>
                              <textarea
                                value={scene.visual_description}
                                onChange={(e) => updateScene(index, 'visual_description', e.target.value)}
                                disabled={stage === 'video_generation'}
                                className="w-full min-h-[80px] p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  {t.action}
                                </label>
                                <textarea
                                  value={scene.action}
                                  onChange={(e) => updateScene(index, 'action', e.target.value)}
                                  disabled={stage === 'video_generation'}
                                  className="w-full min-h-[60px] p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  {t.dialogue}
                                </label>
                                <textarea
                                  value={scene.dialogue}
                                  onChange={(e) => updateScene(index, 'dialogue', e.target.value)}
                                  disabled={stage === 'video_generation'}
                                  className="w-full min-h-[60px] p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100"
                                />
                              </div>
                            </div>

                            {stage !== 'video_generation' && stage !== 'completed' && (
                              <button
                                onClick={() => handleRegenerateImage(index)}
                                disabled={scene.isGeneratingImage}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                              >
                                {scene.isGeneratingImage ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>{t.generating}</span>
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw className="w-4 h-4" />
                                    <span>{t.regenerate}</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          {/* Right: Generated Image - 16:9 */}
                          <div className="flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden">
                            {scene.imageUrl ? (
                              <div className="relative w-full aspect-[9/16] max-w-[400px] mx-auto">
                                <img
                                  src={scene.imageUrl}
                                  alt={`Scene ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-full aspect-[9/16] max-w-[400px] mx-auto flex flex-col items-center justify-center">
                                <ImageIcon className="w-12 h-12 text-gray-300 mb-2" />
                                <span className="text-sm text-gray-400">
                                  {t.images}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Generate Video Button */}
                    {stage !== 'video_generation' && stage !== 'completed' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGenerateVideo}
                        disabled={isGeneratingVideo || scenes.some(s => !s.imageUrl)}
                        className={cn(
                          'w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all',
                          isGeneratingVideo || scenes.some(s => !s.imageUrl)
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200'
                        )}
                      >
                        {isGeneratingVideo ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>{t.generatingVideo}</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5" />
                            <span>{t.generateVideo}</span>
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                )}

                {/* Final Video Section */}
                {videoUrls.length > 0 && stage === 'completed' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                  >
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                          <h3 className="text-xl font-semibold text-gray-900">
                            {t.videoSuccess}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          {videoUrls.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              download
                              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              <Download className="w-4 h-4" />
                              <span>Scene {idx + 1}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      {/* Scene Selector */}
                      <div className="flex items-center justify-center gap-2">
                        {videoUrls.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentVideoIndex(idx)}
                            className={cn(
                              'px-4 py-2 rounded-lg font-medium transition-colors',
                              currentVideoIndex === idx
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            )}
                          >
                            Scene {idx + 1}
                          </button>
                        ))}
                      </div>
                      
                      {/* Current Video Player - 9:16 for TikTok/Reels */}
                      <div className="aspect-[9/16] max-w-[400px] mx-auto bg-black rounded-xl overflow-hidden">
                        <VideoPlayer 
                          videoUrl={videoUrls[currentVideoIndex]} 
                          onEnded={() => {
                            // Auto-play next scene
                            if (currentVideoIndex < videoUrls.length - 1) {
                              setCurrentVideoIndex(currentVideoIndex + 1);
                            }
                          }}
                        />
                      </div>
                      
                      {/* Scene Info */}
                      {scenes[currentVideoIndex] && (
                        <div className="bg-gray-50 rounded-xl p-4 max-w-[400px] mx-auto">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Scene {currentVideoIndex + 1}: {scenes[currentVideoIndex].title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Action:</span> {scenes[currentVideoIndex].action}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Dialogue:</span> {scenes[currentVideoIndex].dialogue}
                          </p>
                        </div>
                      )}
                      
                      <button
                        onClick={reset}
                        className="w-full py-4 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
                      >
                        <Wand2 className="w-5 h-5" />
                        <span>{t.createNew}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Section 3: How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t.howItWorks}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t.howItWorksDesc}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Lightbulb,
                title: t.step1Title,
                description: t.step1Desc,
                step: '01'
              },
              {
                icon: PenTool,
                title: t.step2Title,
                description: t.step2Desc,
                step: '02'
              },
              {
                icon: Film,
                title: t.step3Title,
                description: t.step3Desc,
                step: '03'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all">
                  <span className="absolute -top-4 -right-4 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
                    {item.step}
                  </span>
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                    <item.icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: About & Contact */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t.aboutUs}
              </h2>
              <p className="text-gray-600 mb-6">
                {t.aboutDesc}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Sparkles className="w-4 h-4" />
                  <span>Powered by Alibaba Cloud</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t.contactUs}
              </h2>
              <p className="text-gray-600 mb-6">
                {t.contactDesc}
              </p>
              <div className="space-y-3">
                <a href="mailto:contact@wantutri.ai" className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                    <span className="text-lg">@</span>
                  </div>
                  <span>contact@wantutri.ai</span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-md flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-gray-900">WanTuTri AI</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2026 WanTuTri AI. Powered by Qwen & WAN Alibaba Cloud.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
