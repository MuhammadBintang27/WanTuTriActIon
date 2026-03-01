'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Video, Loader2 } from 'lucide-react';

interface FloatingVideoButtonProps {
  show: boolean;
  onClick: () => void;
  isLoading: boolean;
  uiLang: 'en' | 'id' | 'zh';
}

const translations = {
  en: {
    generate: 'Generate Video',
    generating: 'Generating Video...',
  },
  id: {
    generate: 'Buat Video',
    generating: 'Membuat Video...',
  },
  zh: {
    generate: '生成视频',
    generating: '正在生成视频...',
  },
};

export default function FloatingVideoButton({
  show,
  onClick,
  isLoading,
  uiLang,
}: FloatingVideoButtonProps) {
  const t = translations[uiLang];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <motion.button
            whileHover={{ scale: isLoading ? 1 : 1.05 }}
            whileTap={{ scale: isLoading ? 1 : 0.95 }}
            onClick={onClick}
            disabled={isLoading}
            className="group relative px-8 py-4 bg-black hover:bg-gray-800 text-white rounded-full font-bold text-lg shadow-2xl flex items-center gap-3 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {/* Button content */}
            <div className="relative flex items-center gap-3">
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>{t.generating}</span>
                </>
              ) : (
                <>
                  <Video className="w-6 h-6" />
                  <span>{t.generate}</span>
                </>
              )}
            </div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
