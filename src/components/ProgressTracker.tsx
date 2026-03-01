'use client';

import { motion } from 'framer-motion';
import { FileText, Image, Video, Lightbulb, Check } from 'lucide-react';
import { GenerationStage } from '@/types';
import { cn } from '@/lib/utils';

interface ProgressTrackerProps {
  stage: GenerationStage;
  currentScene?: number;
  totalScenes?: number;
  uiLang?: 'en' | 'id' | 'zh';
}

const translations = {
  en: {
    input: 'Input',
    script: 'Script',
    images: 'Images',
    video: 'Video',
    inputMsg: 'Describe your product or idea...',
    scriptMsg: 'Creating your 3-scene drama script...',
    scriptReviewMsg: 'Review and edit your script...',
    imagesMsg: 'Generating images for each scene...',
    imageReviewMsg: 'Review and edit images...',
    videoMsg: 'Generating 3 videos and merging them... (This may take a few minutes)',
    completedMsg: 'Your video is ready!',
    generatingScene: 'Generating scene',
  },
  id: {
    input: 'Input',
    script: 'Naskah',
    images: 'Gambar',
    video: 'Video',
    inputMsg: 'Deskripsikan produk atau ide Anda...',
    scriptMsg: 'Membuat naskah drama 3 adegan...',
    scriptReviewMsg: 'Tinjau dan edit naskah Anda...',
    imagesMsg: 'Membuat gambar untuk setiap adegan...',
    imageReviewMsg: 'Tinjau dan edit gambar...',
    videoMsg: 'Membuat 3 video dan menggabungkannya... (Ini memakan waktu beberapa menit)',
    completedMsg: 'Video Anda sudah siap!',
    generatingScene: 'Membuat adegan',
  },
  zh: {
    input: '输入',
    script: '脚本',
    images: '图片',
    video: '视频',
    inputMsg: '描述您的产品或创意...',
    scriptMsg: '正在创建您的3场景戏剧脚本...',
    scriptReviewMsg: '审查和编辑您的脚本...',
    imagesMsg: '为每个场景生成图像...',
    imageReviewMsg: '审查和编辑图像...',
    videoMsg: '正在生成3个视频并合并... (这可能需要几分钟)',
    completedMsg: '您的视频已准备就绪!',
    generatingScene: '正在生成场景',
  },
};

const stages = [
  { id: 'idle', label: 'input', icon: Lightbulb },
  { id: 'scripting', label: 'script', icon: FileText },
  { id: 'image_generation', label: 'images', icon: Image },
  { id: 'video_generation', label: 'video', icon: Video },
] as const;

export function ProgressTracker({ stage, currentScene = 0, totalScenes = 3, uiLang = 'en' }: ProgressTrackerProps) {
  const t = translations[uiLang];
  
  const getStageIndex = (s: GenerationStage) => {
    if (s === 'idle') return 0;
    if (s === 'scripting' || s === 'script_review') return 1;
    if (s === 'image_generation' || s === 'image_review') return 2;
    if (s === 'video_generation' || s === 'completed') return 3;
    return -1;
  };

  const currentStageIndex = getStageIndex(stage);

  const getStageMessage = (): string => {
    switch (stage) {
      case 'idle':
        return t.inputMsg;
      case 'scripting':
        return t.scriptMsg;
      case 'script_review':
        return t.scriptReviewMsg;
      case 'image_generation':
        return currentScene > 0 && totalScenes > 0
          ? `${t.generatingScene} ${currentScene}/${totalScenes}...`
          : t.imagesMsg;
      case 'image_review':
        return t.imageReviewMsg;
      case 'video_generation':
        return t.videoMsg;
      case 'completed':
        return t.completedMsg;
      default:
        return '';
    }
  };

  const isLoading = stage === 'scripting' || stage === 'image_generation' || stage === 'video_generation';

  const getLoadingIcon = () => {
    if (stage === 'scripting') return FileText;
    if (stage === 'image_generation') return Image;
    if (stage === 'video_generation') return Video;
    return FileText;
  };

  const LoadingIcon = getLoadingIcon();

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-center mb-6 px-4">
        {stages.map((s, index) => {
          const isCompleted = currentStageIndex > index;
          const isCurrent = currentStageIndex === index;
          const isPending = currentStageIndex < index;

          return (
            <div key={s.id} className="flex flex-col items-center relative" style={{ marginRight: index < stages.length - 1 ? '80px' : '0' }}>
              {/* Connection Line */}
              {index < stages.length - 1 && (
                <div className="absolute top-5 left-[50%] h-[2px] bg-gray-300 z-0" style={{ width: '80px' }}>
                  <motion.div
                    className="h-full bg-black"
                    initial={{ width: '0%' }}
                    animate={{
                      width: isCompleted ? '100%' : '0%',
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}

              {/* Stage Circle */}
              <motion.div
                initial={false}
                className={cn(
                  'relative z-10 w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 border-2',
                  (isCompleted || isCurrent) && 'bg-black border-black',
                  isPending && 'bg-white border-gray-300'
                )}
              >
                <span
                  className={cn(
                    'text-sm font-semibold',
                    (isCompleted || isCurrent) ? 'text-white' : 'text-gray-400'
                  )}
                >
                  {index + 1}
                </span>
              </motion.div>

              {/* Stage Label */}
              <span
                className={cn(
                  'text-xs font-medium transition-colors duration-300 text-center',
                  (isCompleted || isCurrent) && 'text-black',
                  isPending && 'text-gray-400'
                )}
              >
                {t[s.label as keyof typeof t]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress Message */}
      {stage !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mx-auto max-w-lg"
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-6 py-8">
              {/* Animated Icon */}
              <motion.div
                className="relative"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className="w-24 h-24 bg-black rounded-2xl flex items-center justify-center relative">
                  <LoadingIcon className="w-12 h-12 text-white" />
                  
                  {/* Orbiting dots */}
                  {[0, 120, 240].map((angle, index) => (
                    <motion.div
                      key={index}
                      className="absolute w-3 h-3 bg-gray-800 rounded-full"
                      style={{
                        top: '50%',
                        left: '50%',
                      }}
                      animate={{
                        x: [
                          Math.cos((angle * Math.PI) / 180) * 50,
                          Math.cos(((angle + 360) * Math.PI) / 180) * 50,
                        ],
                        y: [
                          Math.sin((angle * Math.PI) / 180) * 50,
                          Math.sin(((angle + 360) * Math.PI) / 180) * 50,
                        ],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Loading Text */}
              <motion.p
                className="text-lg font-semibold text-gray-900"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {getStageMessage()}
              </motion.p>

              {/* Loading Dots */}
              <div className="flex items-center gap-2">
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    className="w-2.5 h-2.5 bg-black rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: index * 0.2,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="py-4">
              <p className="text-sm font-medium text-gray-600">
                {getStageMessage()}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

