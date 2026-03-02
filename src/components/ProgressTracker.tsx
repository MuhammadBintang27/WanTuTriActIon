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
  const completedStageIndex = isLoading && currentStageIndex > 0 ? currentStageIndex - 1 : currentStageIndex;
  const completedProgressPercent = Math.max(0, Math.min(100, (completedStageIndex / (stages.length - 1)) * 100));
  const transitionSegmentIndex = Math.max(0, currentStageIndex - 1);
  const isTransitioningToCurrent = isLoading && currentStageIndex > 0 && transitionSegmentIndex < stages.length - 1;

  return (
    <div className="w-full max-w-5xl mx-auto py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 px-4 py-6 md:px-8 md:py-8 shadow-sm"
      >
        <div className="relative mb-8">
          <div className="absolute left-[12.5%] right-[12.5%] top-8 h-1 rounded-full bg-gray-200" />
          <motion.div
            className="absolute left-[12.5%] top-8 h-1 rounded-full bg-[#6A5EE5]"
            initial={{ width: '0%' }}
            animate={{ width: `${completedProgressPercent * 0.75}%` }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          />

          {isTransitioningToCurrent && (
            <div
              className="absolute top-8 h-1 overflow-hidden rounded-full z-20"
              style={{
                left: `${12.5 + transitionSegmentIndex * 25}%`,
                width: '25%',
              }}
            >
              <motion.div
                className="h-full w-1/2 rounded-full bg-gradient-to-r from-transparent via-[#6A5EE5] to-transparent opacity-90"
                style={{ filter: 'drop-shadow(0 0 4px rgba(106,94,229,0.9))' }}
                animate={{ x: ['-70%', '250%'] }}
                transition={{ duration: 1.15, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          )}

          <div className="relative z-10 grid grid-cols-4 gap-2">
            {stages.map((stageItem, index) => {
              const isCompleted = currentStageIndex > index;
              const isCurrent = currentStageIndex === index;
              const isPending = currentStageIndex < index;
              const StageIcon = stageItem.icon;

              return (
                <div key={stageItem.id} className="flex flex-col items-center text-center">
                  <motion.div
                    className={cn(
                      'relative mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border-2 transition-all duration-300',
                      isCompleted && 'border-[#6A5EE5] bg-[#6A5EE5] text-white shadow-lg shadow-[#6A5EE5]/30',
                      isCurrent && 'border-[#6A5EE5] bg-[#6A5EE5] text-white shadow-lg shadow-[#6A5EE5]/30',
                      isPending && 'border-gray-300 bg-white text-gray-400'
                    )}
                    animate={
                      isCurrent
                        ? {
                            y: [0, -3, 0],
                            scale: [1, 1.03, 1],
                          }
                        : {}
                    }
                    transition={{ duration: 1.4, repeat: isCurrent ? Infinity : 0, ease: 'easeInOut' }}
                  >
                    {isCurrent && isLoading && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-[#6A5EE5]/40"
                        animate={{ scale: [1, 1.15], opacity: [0.6, 0] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                      />
                    )}

                    {isCompleted ? (
                      <Check className="h-7 w-7" />
                    ) : (
                      <StageIcon className="h-7 w-7" />
                    )}
                  </motion.div>

                  <p
                    className={cn(
                      'text-sm md:text-base font-semibold transition-colors duration-300',
                      (isCompleted || isCurrent) && 'text-black',
                      isPending && 'text-gray-400'
                    )}
                  >
                    {t[stageItem.label as keyof typeof t]}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">0{index + 1}</p>
                </div>
              );
            })}
          </div>
        </div>

        {stage !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white/90 px-6 py-6 text-center"
          >
            {isLoading ? (
              <div className="flex flex-col items-center gap-5">
                <motion.div
                  className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-black text-white"
                  animate={{ rotate: [0, 2, -2, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <motion.div
                    className="absolute -inset-2 rounded-[1.75rem] border-2 border-dashed border-gray-400"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  />
                  <LoadingIcon className="h-12 w-12" />
                </motion.div>

                <motion.p
                  className="text-lg md:text-xl font-semibold text-gray-900"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {getStageMessage()}
                </motion.p>

                <div className="h-2 w-full max-w-md overflow-hidden rounded-full bg-gray-200">
                  <motion.div
                    className="h-full w-1/3 rounded-full bg-black"
                    animate={{ x: ['-20%', '240%'] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">
                  <Check className="h-7 w-7" />
                </div>
                <p className="text-base md:text-lg font-semibold text-gray-700">{getStageMessage()}</p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

