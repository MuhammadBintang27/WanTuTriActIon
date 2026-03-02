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

  // Duplicate text for seamless marquee
  const marqueeText = Array(8).fill(t.text).join(' • ');

  return (
    <section className="py-6 bg-black border-y border-gray-800 overflow-hidden">
      <div className="relative flex">
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: '-50%' }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="flex items-center gap-6 whitespace-nowrap"
        >
          {Array(2).fill(marqueeText).map((text, i) => (
            <div key={i} className="flex items-center gap-6">
              <p className="font-integral-cf text-xl md:text-2xl lg:text-3xl font-black text-white tracking-wider">
                {text}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
