'use client';

import { motion } from 'framer-motion';
import { FileText, Image, Video, Combine, Check } from 'lucide-react';
import { GenerationStage } from '@/types';
import { cn } from '@/lib/utils';

interface ProgressTrackerProps {
  stage: GenerationStage;
  progress: number;
}

const stages = [
  { id: 'scripting', label: 'Script', icon: FileText },
  { id: 'image_generation', label: 'Images', icon: Image },
  { id: 'video_generation', label: 'Video', icon: Video },
] as const;

export function ProgressTracker({ stage, progress }: ProgressTrackerProps) {
  const getStageIndex = (s: GenerationStage) => {
    const index = stages.findIndex(st => st.id === s);
    return index === -1 ? -1 : index;
  };

  const currentStageIndex = getStageIndex(stage);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        {stages.map((s, index) => {
          const Icon = s.icon;
          const isCompleted = currentStageIndex > index;
          const isCurrent = currentStageIndex === index;
          const isPending = currentStageIndex < index;

          return (
            <div key={s.id} className="flex flex-col items-center flex-1">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                  backgroundColor: isCompleted
                    ? '#22c55e'
                    : isCurrent
                    ? '#3b82f6'
                    : '#e5e7eb',
                }}
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors duration-300',
                  isCompleted && 'bg-green-500',
                  isCurrent && 'bg-blue-500',
                  isPending && 'bg-gray-200'
                )}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6 text-white" />
                ) : (
                  <Icon
                    className={cn(
                      'w-5 h-5',
                      isCurrent ? 'text-white' : 'text-gray-500'
                    )}
                  />
                )}
              </motion.div>
              <span
                className={cn(
                  'text-xs font-medium transition-colors duration-300',
                  isCompleted && 'text-green-600',
                  isCurrent && 'text-blue-600',
                  isPending && 'text-gray-400'
                )}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>

      {stage !== 'idle' && stage !== 'completed' && stage !== 'error' && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-gray-500 mt-3"
        >
          {getStageMessage(stage)}
        </motion.p>
      )}
    </div>
  );
}

function getStageMessage(stage: GenerationStage): string {
  switch (stage) {
    case 'scripting':
      return 'Creating your 3-scene drama script...';
    case 'script_review':
      return 'Review and edit your script...';
    case 'image_generation':
      return 'Generating images for each scene...';
    case 'image_review':
      return 'Review and refine your images...';
    case 'video_generation':
      return 'Converting images to video...';
    default:
      return '';
  }
}
