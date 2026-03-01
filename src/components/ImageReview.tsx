'use client';

import { motion } from 'framer-motion';
import { Eye, Download, RefreshCw, Loader2, ImageIcon as ImageIconLucide, Video } from 'lucide-react';
import { Scene, SceneType } from '@/types';
import { cn } from '@/lib/utils';

interface ImageReviewProps {
  uiLang: 'en' | 'id' | 'zh';
  scenes: (Scene & { imageUrl?: string; isGeneratingImage?: boolean })[];
  onSceneEdit: (index: number, field: keyof Scene, value: string) => void;
  onRegenerateImage: (index: number) => void;
  onGenerateVideo: () => void;
  isGeneratingVideo: boolean;
  isRegenerating?: boolean;
}

const translations = {
  en: {
    title: 'GENERATED SCENE IMAGES',
    description: 'Review your generated images. You can edit scene details and regenerate individual images if needed.',
    visualDescription: 'Visual Description',
    action: 'Action',
    dialogue: 'Dialogue',
    regenerate: 'Regenerate',
    generating: 'Generating...',
    view: 'View',
    download: 'Download',
    problem: 'Problem',
    climax: 'Climax',
    resolution: 'Resolution',
    noImage: 'Image loading...',
    generateVideo: 'Generate Video',
    generatingVideo: 'Generating Video...',
  },
  id: {
    title: 'GAMBAR ADEGAN YANG DIHASILKAN',
    description: 'Tinjau gambar yang dihasilkan. Anda dapat mengedit detail adegan dan membuat ulang gambar individual jika diperlukan.',
    visualDescription: 'Deskripsi Visual',
    action: 'Aksi',
    dialogue: 'Dialog',
    regenerate: 'Generate Ulang',
    generating: 'Membuat...',
    view: 'Lihat',
    download: 'Unduh',
    problem: 'Masalah',
    climax: 'Puncak',
    resolution: 'Solusi',
    noImage: 'Memuat gambar...',
    generateVideo: 'Generate Video',
    generatingVideo: 'Membuat Video...',
  },
  zh: {
    title: '生成的场景图像',
    description: '查看生成的图像。如果需要，您可以编辑场景详细信息并重新生成单个图像。',
    visualDescription: '视觉描述',
    action: '动作',
    dialogue: '对话',
    regenerate: '重新生成',
    generating: '生成中...',
    view: '查看',
    download: '下载',
    problem: '问题',
    climax: '高潮',
    resolution: '解决',
    noImage: '加载图像中...',
    generateVideo: 'Generate Video',
    generatingVideo: '正在生成视频...',
  },
};

export default function ImageReview({
  uiLang,
  scenes,
  onSceneEdit,
  onRegenerateImage,
  onGenerateVideo,
  isGeneratingVideo,
}: ImageReviewProps) {
  const t = translations[uiLang];

  // Proxy Aliyun OSS URLs through our API to avoid CORS issues
  const getProxiedImageUrl = (originalUrl: string) => {
    if (!originalUrl) return '';
    return `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
  };

  const getSceneTypeLabel = (type: SceneType) => {
    const labels = {
      problem: t.problem,
      climax: t.climax,
      resolution: t.resolution,
    };
    return labels[type];
  };

  const getSceneTypeColor = (type: SceneType) => {
    const colors = {
      problem: 'bg-red-100 text-red-700 border-red-200',
      climax: 'bg-orange-100 text-orange-700 border-orange-200',
      resolution: 'bg-green-100 text-green-700 border-green-200',
    };
    return colors[type];
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t.title}</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">{t.description}</p>
        </motion.div>

        <div className="space-y-8">
          {scenes.map((scene, index) => (
            <motion.div
              key={scene.scene_number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border-l-[3px] border-gray-300 p-6 relative"
            >
              {/* Scene Number - Large with vertical line */}
              <div className="absolute left-6 top-6">
                <span className="text-5xl font-bold text-gray-200 leading-none">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Scene Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 ml-20">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-900">{scene.title}</span>
                </div>
                {scene.imageUrl && (
                  <div className="flex items-center gap-2">
                    <a
                      href={scene.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                      title={t.view}
                    >
                      <Eye className="w-5 h-5" />
                    </a>
                    <a
                      href={scene.imageUrl}
                      download={`scene-${index + 1}.png`}
                      className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                      title={t.download}
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Scene Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ml-20">
                {/* Left: Editable Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.visualDescription}
                    </label>
                    <textarea
                      value={scene.visual_description}
                      onChange={(e) => onSceneEdit(index, 'visual_description', e.target.value)}
                      className="w-full min-h-[180px] p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
                      placeholder="Visual description..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t.action}
                      </label>
                      <textarea
                        value={scene.action}
                        onChange={(e) => onSceneEdit(index, 'action', e.target.value)}
                        className="w-full min-h-[120px] p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
                        placeholder="Action..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t.dialogue}
                      </label>
                      <textarea
                        value={scene.dialogue}
                        onChange={(e) => onSceneEdit(index, 'dialogue', e.target.value)}
                        className="w-full min-h-[120px] p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
                        placeholder="Dialogue..."
                      />
                    </div>
                  </div>

                  {/* Regenerate Button */}
                  <motion.button
                    whileHover={{ scale: scene.isGeneratingImage ? 1 : 1.02 }}
                    whileTap={{ scale: scene.isGeneratingImage ? 1 : 0.98 }}
                    onClick={() => onRegenerateImage(index)}
                    disabled={scene.isGeneratingImage}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
                  </motion.button>
                </div>

                {/* Right: Generated Image (9:16 aspect ratio) */}
                <div className="flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden p-4">
                  {scene.imageUrl ? (
                    <div className="relative w-full aspect-[9/16] max-w-[360px] mx-auto rounded-lg overflow-hidden shadow-lg">
                      {scene.isGeneratingImage && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                          <div className="text-center">
                            <Loader2 className="w-12 h-12 text-gray-600 animate-spin mx-auto mb-2" />
                            <p className="text-sm text-gray-600 font-medium">{t.generating}</p>
                          </div>
                        </div>
                      )}
                      <img
                        src={getProxiedImageUrl(scene.imageUrl)}
                        alt={`Scene ${index + 1}: ${scene.title}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Image failed to load:', scene.imageUrl);
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="360" height="640" viewBox="0 0 360 640"%3E%3Crect width="360" height="640" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="16" fill="%23ef4444" text-anchor="middle" dominant-baseline="middle"%3EImage Load Failed%3C/text%3E%3C/svg%3E';
                        }}
                        onLoad={() => console.log('Image loaded successfully:', scene.imageUrl)}
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-[9/16] max-w-[360px] mx-auto flex flex-col items-center justify-center bg-white rounded-lg border border-gray-200">
                      {scene.isGeneratingImage ? (
                        <>
                          <Loader2 className="w-16 h-16 text-gray-600 animate-spin mb-4" />
                          <p className="text-sm text-gray-600 font-medium">{t.generating}</p>
                        </>
                      ) : (
                        <>
                          <ImageIconLucide className="w-16 h-16 text-gray-300 mb-4" />
                          <p className="text-sm text-gray-400">{t.noImage}</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Generate Video Button - Similar to Generate Images button in ScriptEditor */}
        {scenes.every(s => s.imageUrl) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-center">
              <motion.button
                whileHover={{ scale: isGeneratingVideo ? 1 : 1.02 }}
                whileTap={{ scale: isGeneratingVideo ? 1 : 0.98 }}
                onClick={onGenerateVideo}
                disabled={isGeneratingVideo}
                className="max-w-md px-8 py-4 rounded-xl font-semibold text-white bg-black hover:bg-gray-800 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingVideo ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t.generatingVideo}</span>
                  </>
                ) : (
                  <>
                    <Video className="w-5 h-5" />
                    <span>{t.generateVideo}</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
