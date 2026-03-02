'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import BrandingBar from '@/components/BrandingBar';
import HowItWorks from '@/components/HowItWorks';
import InputForm from '@/components/InputForm';
import ScriptEditor from '@/components/ScriptEditor';
import ImageReview from '@/components/ImageReview';
import { ProgressTracker } from '@/components/ProgressTracker';
import { VideoPlayer } from '@/components/VideoPlayer';
import { GenerationStage, ReferenceImageMeta, Scene, SceneType } from '@/types';
import { detectLanguage } from '@/lib/utils';

interface SceneWithImage extends Scene {
  imageUrl?: string;
  isGeneratingImage?: boolean;
}

type UILanguage = 'en' | 'id' | 'zh';

export default function Home() {
  // State management
  const [uiLang, setUiLang] = useState<UILanguage>('en');
  const [stage, setStage] = useState<GenerationStage>('idle');
  const [scenes, setScenes] = useState<SceneWithImage[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [currentGeneratingScene, setCurrentGeneratingScene] = useState(0);
  const [promptLang, setPromptLang] = useState<'id' | 'en' | 'zh'>('en');
  const [referenceImage, setReferenceImage] = useState<string>('');
  const [referenceImagesMeta, setReferenceImagesMeta] = useState<ReferenceImageMeta[]>([]);

  // Handler: Submit input form and generate script
  const handleInputSubmit = async (prompt: string, images: string[]) => {
    setError('');
    setIsGeneratingScript(true);
    setStage('scripting');

    // Scroll to progress tracker
    setTimeout(() => {
      const progressSection = document.getElementById('progress-tracker-section');
      if (progressSection) {
        progressSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    // Detect language
    const detectedLang = detectLanguage(prompt);
    setPromptLang(detectedLang);

    try {
      let classifiedReferences: ReferenceImageMeta[] = [];
      if (images.length > 0) {
        const classifyResponse = await fetch('/api/reference-classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            images,
            prompt,
            language: detectedLang,
          }),
        });

        if (classifyResponse.ok) {
          const classifyData = await classifyResponse.json();
          classifiedReferences = classifyData?.data?.referenceImages || [];
        }
      }

      // Strip data URL prefix from images if present (data:image/...;base64,)
      // Use first image for script generation (API expects single image)
      const firstImage = images.length > 0 ? images[0] : null;
      const imageBase64 = firstImage ? (firstImage.includes(',') ? firstImage.split(',')[1] : firstImage) : null;
      setReferenceImagesMeta(classifiedReferences);

      const characterRef = classifiedReferences.find((ref) => ref.type === 'character' && ref.image);
      setReferenceImage((characterRef?.image as string) || firstImage || '');
      
      const response = await fetch('/api/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          image: imageBase64,
          referenceImages: classifiedReferences,
          language: detectedLang,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate script');
      }

      const data = await response.json();
      setScenes(data.data.scenes);
      setStage('script_review');
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the script');
      setStage('idle');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Handler: Use own script (skip AI generation)
  const handleUseOwnScript = () => {
    setError('');
    // Initialize with 3 empty scenes for user to fill in
    const emptyScenes: SceneWithImage[] = [
      {
        scene_number: 1,
        scene_type: 'problem',
        title: '',
        visual_description: '',
        action: '',
        dialogue: '',
        characters: [],
      },
      {
        scene_number: 2,
        scene_type: 'climax',
        title: '',
        visual_description: '',
        action: '',
        dialogue: '',
        characters: [],
      },
      {
        scene_number: 3,
        scene_type: 'resolution',
        title: '',
        visual_description: '',
        action: '',
        dialogue: '',
        characters: [],
      },
    ];
    setScenes(emptyScenes);
    setReferenceImagesMeta([]);
    setReferenceImage('');
    setStage('script_review');
    
    // Scroll to script editor
    setTimeout(() => {
      const scriptEditor = document.getElementById('script-editor-section');
      if (scriptEditor) {
        scriptEditor.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Handler: Submit script and auto-generate all images
  const handleScriptSubmit = async () => {
    setError('');
    setIsGeneratingImages(true);
    setStage('image_generation');

    // Scroll to progress tracker
    setTimeout(() => {
      const progressSection = document.getElementById('progress-tracker-section');
      if (progressSection) {
        progressSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    try {
      // Generate images for all scenes - map to API format
      const scenesData = scenes.map((scene, index) => ({
        visualDescription: scene.visual_description,
        action: scene.action,
        characters: scene.characters,
        sceneIndex: index,
      }));

      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenes: scenesData, referenceImage, referenceImages: referenceImagesMeta }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate images');
      }

      const data = await response.json();
      console.log('Image API response:', data);
      
      // Update scenes with image URLs - data.data.imageUrls is array of {url, sceneIndex}
      const imageUrlsMap = new Map<number, string>(
        data.data.imageUrls.map((item: any) => [item.sceneIndex, item.url])
      );
      console.log('Image URLs map:', Array.from(imageUrlsMap.entries()));
      
      setScenes((prev) =>
        prev.map((scene, index) => ({
          ...scene,
          imageUrl: imageUrlsMap.get(index) || '',
        }))
      );

      setStage('image_review');
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating images');
      setStage('script_review');
    } finally {
      setIsGeneratingImages(false);
    }
  };

  // Handler: Regenerate individual image
  const handleRegenerateImage = async (sceneIndex: number) => {
    const scene = scenes[sceneIndex];
    
    // Mark this scene as regenerating
    setScenes((prev) =>
      prev.map((s, i) =>
        i === sceneIndex ? { ...s, isGeneratingImage: true } : s
      )
    );

    try {
      // Map scene to API format
      const sceneData = {
        visualDescription: scene.visual_description,
        action: scene.action,
        characters: scene.characters,
        sceneIndex: sceneIndex,
      };

      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenes: [sceneData],
          referenceImage,
          referenceImages: referenceImagesMeta,
          regenerateOnly: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to regenerate image');
      }

      const data = await response.json();
      console.log('Regenerate image API response:', data);
      console.log('New image URL:', data.data.imageUrl);

      // Update the specific scene with new image
      setScenes((prev) =>
        prev.map((s, i) =>
          i === sceneIndex
            ? { ...s, imageUrl: data.data.imageUrl, isGeneratingImage: false }
            : s
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate image');
      // Reset regenerating state
      setScenes((prev) =>
        prev.map((s, i) =>
          i === sceneIndex ? { ...s, isGeneratingImage: false } : s
        )
      );
    }
  };

  // Handler: Edit scene field
  const handleSceneEdit = (index: number, field: keyof Scene, value: string) => {
    setScenes((prev) =>
      prev.map((scene, i) => (i === index ? { ...scene, [field]: value } : scene))
    );
  };

  // Handler: Generate video
  const handleGenerateVideo = async () => {
    setError('');
    setIsGeneratingVideo(true);
    setStage('video_generation');

    // Scroll to progress tracker
    setTimeout(() => {
      const progressSection = document.getElementById('progress-tracker-section');
      if (progressSection) {
        progressSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    try {
      // Map scenes to API format for video generation
      const videoScenes = scenes.map((scene) => ({
        imageUrl: scene.imageUrl || '',
        visualDescription: scene.visual_description,
        action: scene.action,
        dialogue: scene.dialogue,
      }));

      const response = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenes: videoScenes, referenceImage, referenceImages: referenceImagesMeta }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate video');
      }

      const data = await response.json();
      
      // Merge videos client-side using ffmpeg.wasm
      if (data.data.videoUrls.length > 1) {
        setStage('video_generation'); // Keep loading state while merging
        const { mergeVideosClientSide } = await import('@/lib/videoMerge');
        const mergedUrl = await mergeVideosClientSide(data.data.videoUrls);
        setVideoUrls([mergedUrl]);
      } else {
        setVideoUrls(data.data.videoUrls);
      }
      
      setStage('completed');
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating video');
      setStage('image_review');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header with Navigation */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                WanTuTri Action
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-base font-medium text-gray-900 hover:text-blue-600 transition-colors">
                Home
              </a>
              <a href="#features" className="text-base font-medium text-gray-600 hover:text-blue-600 transition-colors">
                Features
              </a>
              <a href="#about" className="text-base font-medium text-gray-600 hover:text-blue-600 transition-colors">
                About
              </a>
            </nav>

            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUiLang('en')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  uiLang === 'en'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setUiLang('id')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  uiLang === 'id'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                ID
              </button>
              <button
                onClick={() => setUiLang('zh')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  uiLang === 'zh'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                中文
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Marketing Sections */}
      <HeroSection uiLang={uiLang} />
      <BrandingBar uiLang={uiLang} />

      {/* Application Sections */}
      <InputForm
        uiLang={uiLang}
        onSubmit={handleInputSubmit}
        onUseOwnScript={handleUseOwnScript}
        isLoading={isGeneratingScript}
        error={error}
      />

      {/* Progress Tracker */}
      {stage !== 'idle' && (
        <div id="progress-tracker-section" className="py-8 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <ProgressTracker
              stage={stage}
              currentScene={currentGeneratingScene}
              totalScenes={scenes.length}
              uiLang={uiLang}
            />
          </div>
        </div>
      )}

      {/* Script Editor */}
      {stage === 'script_review' && (
        <ScriptEditor
          uiLang={uiLang}
          scenes={scenes}
          onScenesChange={setScenes}
          onSubmit={handleScriptSubmit}
          isLoading={isGeneratingImages}
        />
      )}

      {/* Image Review */}
      {(stage === 'image_generation' ||
        stage === 'image_review' ||
        stage === 'video_generation') &&
        scenes.some((s) => s.imageUrl) && (
          <ImageReview
            uiLang={uiLang}
            scenes={scenes}
            onSceneEdit={handleSceneEdit}
            onRegenerateImage={handleRegenerateImage}
            onGenerateVideo={handleGenerateVideo}
            isGeneratingVideo={isGeneratingVideo}
          />
        )}

      {/* Video Player */}
      {videoUrls.length > 0 && stage === 'completed' && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-5xl font-black text-white mb-3 tracking-tight">
                  FINAL VIDEO OUTPUT
                </h2>
                <p className="text-gray-300 text-lg">
                  Your AI-generated cinematic masterpiece
                </p>
              </div>
              
              {/* Show single merged video */}
              {videoUrls.length > 0 && (
                <div className="space-y-6">
                  <div className="bg-gray-100 rounded-2xl p-2 shadow-xl mx-auto w-fit">
                    <div className="w-full max-w-sm mx-auto">
                      <VideoPlayer videoUrl={videoUrls[0]} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => window.location.reload()}
                      className="px-8 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-black transition-colors duration-300"
                    >
                      Regenerate
                    </button>
                    <a
                      href={videoUrls[0]}
                      download="wantutri-video.mp4"
                      className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors duration-300"
                    >
                      Download
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      <HowItWorks uiLang={uiLang} />

      {/* Footer */}
      <footer className="py-16 bg-gray-100 border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Column 1: About */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                WanTuTri Action
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                AI-powered platform to turn ideas into cinematic scripts and ready-to-generate video content.
              </p>
              <p className="text-gray-500 text-sm">
                Powered by Qwen & Wan — Alibaba AI
              </p>
            </div>

            {/* Column 2: Features */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Features
              </h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>AI Script Generator</li>
                <li>Scene Breakdown</li>
                <li>Visual Prompts</li>
                <li>Video Generator</li>
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Contact
              </h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>Email: Geutanyoe@gmail.com</li>
                <li>Available 24/7</li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-gray-300">
            <p className="text-center text-gray-500 text-sm">
              © 2026 WanTuTri Action. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
