'use client';

// MARKED FOR DELETION - This is a test page for single scene generation
// DELETE THIS FILE WHEN TESTING IS COMPLETE

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  X, 
  Sparkles, 
  AlertCircle,
  CheckCircle2,
  Wand2,
  Image as ImageIcon,
  Play,
  Send,
  Download,
  Loader2
} from 'lucide-react';
import { VideoPlayer } from '@/components/VideoPlayer';
import { cn, fileToBase64, detectLanguage } from '@/lib/utils';

export default function TestPage() {
  const [prompt, setPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stage, setStage] = useState<'idle' | 'scripting' | 'script_review' | 'image' | 'image_review' | 'video' | 'completed' | 'error'>('idle');
  const [scene, setScene] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Step 1: Generate Script only
  const handleGenerateScript = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setStage('scripting');

    try {
      const lang = detectLanguage(prompt);
      const scriptResponse = await fetch('/api/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          image: uploadedImage || undefined,
          language: lang,
        }),
      });

      if (!scriptResponse.ok) {
        throw new Error('Script generation failed');
      }

      const scriptResult = await scriptResponse.json();
      if (!scriptResult.success) {
        throw new Error(scriptResult.error || 'Script generation failed');
      }

      // Use first scene only
      setScene(scriptResult.data.scenes[0]);
      setStage('script_review'); // Show script result, wait for user to click Next
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setStage('error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Step 2: Generate Image only
  const handleGenerateImage = async () => {
    if (!scene) return;

    setIsGenerating(true);
    setError(null);
    setStage('image');

    try {
      const imageResponse = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenes: [{
            visualDescription: scene.visual_description,
            action: scene.action,
            characters: scene.characters,
            sceneIndex: 0
          }],
          referenceImage: uploadedImage,
          regenerateOnly: true
        }),
      });

      if (!imageResponse.ok) {
        throw new Error('Image generation failed');
      }

      const imageResult = await imageResponse.json();
      if (!imageResult.success) {
        throw new Error(imageResult.error || 'Image generation failed');
      }

      setImageUrl(imageResult.data.imageUrl);
      setStage('image_review'); // Show image result, wait for user to click Next
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setStage('error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Step 3: Generate Video only
  const handleGenerateVideo = async () => {
    if (!scene || !imageUrl) return;

    setIsGenerating(true);
    setError(null);
    setStage('video');

    try {
      const videoResponse = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenes: [{
            imageUrl: imageUrl,
            action: scene.action,
            dialogue: scene.dialogue
          }],
          referenceImage: uploadedImage,
        }),
      });

      if (!videoResponse.ok) {
        throw new Error('Video generation failed');
      }

      const videoResult = await videoResponse.json();
      if (!videoResult.success) {
        throw new Error(videoResult.error || 'Video generation failed');
      }

      setVideoUrl(videoResult.data.videoUrls[0]);
      setStage('completed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setStage('error');
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setPrompt('');
    setUploadedImage(null);
    setScene(null);
    setImageUrl(null);
    setVideoUrl(null);
    setStage('idle');
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      {/* DELETE MARKER - START */}
      <div className="max-w-4xl mx-auto px-4">
        {/* Warning Banner */}
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">TEST PAGE - MARKED FOR DELETION</span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            This page is for testing single scene generation only. Delete this file when testing is complete.
          </p>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Single Scene Test</h1>
          <p className="text-gray-600">Test 1 scene → 1 image → 1 video pipeline</p>
        </div>

        {/* Input Section */}
        {stage === 'idle' && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your product/idea description..."
                className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Image Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {!uploadedImage ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 flex flex-col items-center gap-2"
                >
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-sm text-gray-500">Add reference image (optional)</span>
                </button>
              ) : (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={uploadedImage} alt="Reference" className="w-full h-48 object-cover" />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleGenerateScript}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Script...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Step 1: Generate Script
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Progress */}
        {(stage === 'scripting' || stage === 'image' || stage === 'video') && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {stage === 'scripting' && 'Generating Script...'}
              {stage === 'image' && 'Generating Image...'}
              {stage === 'video' && 'Generating Video...'}
            </h3>
            <p className="text-gray-500">Please wait, this may take a few minutes</p>
          </div>
        )}

        {/* Step 2: Script Review with Next Button */}
        {(stage === 'script_review' || stage === 'image' || stage === 'image_review' || stage === 'video' || stage === 'completed') && scene && (
          <div className="space-y-6">
            {/* Scene Info */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Step 1: Generated Scene
              </h3>
              <div className="space-y-3">
                <p><span className="font-medium">Title:</span> {scene.title}</p>
                <p><span className="font-medium">Visual:</span> {scene.visual_description}</p>
                <p><span className="font-medium">Action:</span> {scene.action}</p>
                <p><span className="font-medium">Dialogue:</span> {scene.dialogue}</p>
              </div>
              
              {/* Next Button to Generate Image */}
              {stage === 'script_review' && (
                <button
                  onClick={handleGenerateImage}
                  disabled={isGenerating}
                  className="mt-6 w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Image...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5" />
                      Step 2: Generate Image
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Step 3: Image Result with Next Button */}
            {(stage === 'image_review' || stage === 'video' || stage === 'completed') && imageUrl && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                  Step 2: Generated Image
                </h3>
                <div className="aspect-[9/16] max-w-[400px] mx-auto rounded-xl overflow-hidden">
                  <img src={imageUrl} alt="Generated" className="w-full h-full object-cover" />
                </div>
                
                {/* Next Button to Generate Video */}
                {stage === 'image_review' && (
                  <button
                    onClick={handleGenerateVideo}
                    disabled={isGenerating}
                    className="mt-6 w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating Video...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        Step 3: Generate Video
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Step 4: Video Result */}
            {stage === 'completed' && videoUrl && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Step 3: Generated Video
                  </h3>
                  <a
                    href={videoUrl}
                    download
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
                <div className="aspect-[9/16] max-w-[400px] mx-auto rounded-xl overflow-hidden">
                  <VideoPlayer videoUrl={videoUrl} />
                </div>
              </div>
            )}

            {(stage === 'completed') && (
              <button
                onClick={reset}
                className="w-full py-4 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Wand2 className="w-5 h-5" />
                Test Again
              </button>
            )}
          </div>
        )}
      </div>
      {/* DELETE MARKER - END */}
    </main>
  );
}
