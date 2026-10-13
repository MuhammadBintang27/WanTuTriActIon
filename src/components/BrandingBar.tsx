'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface BrandingBarProps {
  uiLang: 'en' | 'id' | 'zh';
}

const translations = {
  en: {
    text: 'POWERED BY QWEN AI & WAN - ALIBABA CLOUD',
  },
  id: {
    text: 'DIDUKUNG OLEH QWEN AI & WAN - ALIBABA CLOUD',
  },
  zh: {
    text: '由通义千问 AI 和通义万相 - 阿里云提供支持',
  },
};

export default function BrandingBar({ uiLang }: BrandingBarProps) {
  const t = translations[uiLang];

  return (
    <section className="py-6 bg-black border-y border-gray-800 overflow-hidden">
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: '-50%' }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="flex w-max whitespace-nowrap"
      >
        {/* Two identical halves for a seamless loop; solid and outlined text alternate */}
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0 items-center" aria-hidden={half === 1}>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="flex items-center">
                <span
                  className={`font-integral-cf px-8 text-2xl md:text-3xl lg:text-4xl leading-none font-black tracking-wider ${
                    i % 2 ? 'text-transparent [-webkit-text-stroke:1.5px_white]' : 'text-white'
                  }`}
                >
                  {t.text}
                </span>
                <Sparkles className="h-6 w-6 text-white" fill="currentColor" />
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </section>
  );
}
