'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { ScrollingImageGrid } from '@/components/ui/scrolling-image-grid';

interface HeroSectionProps {
  uiLang: 'en' | 'id' | 'zh';
}

const translations = {
  en: {
    title: 'TURN YOUR IDEAS INTO',
    subtitle: 'DRAMATIC AI CONTENT',
    description: 'Transform your ideas into structured scenes, AI image prompts, and video-ready content — all in one place.',
    cta: 'Start Now',
    builtin: 'Built For Modern Storytelling',
    youtube: 'YouTube Creators',
    tiktok: 'Tiktok Creators',
    instagram: 'Instagram Reels',
  },
  id: {
    title: 'UBAH IDE ANDA MENJADI',
    subtitle: 'KONTEN AI DRAMATIS',
    description: 'Ubah ide Anda menjadi adegan terstruktur, prompt gambar AI, dan konten siap video — semua dalam satu tempat.',
    cta: 'Mulai Sekarang',
    builtin: 'Dibuat Untuk Storytelling Modern',
    youtube: 'YouTube Creators',
    tiktok: 'Kreator TikTok',
    instagram: 'Instagram Reels',
  },
  zh: {
    title: '将您的想法转化为',
    subtitle: '戏剧性的AI内容',
    description: '将您的想法转化为结构化场景、AI 图像提示和视频内容 — 一站式解决方案。',
    cta: '立即开始',
    builtin: '为现代叙事而生',
    youtube: 'YouTube Creators',
    tiktok: 'TikTok 创作者',
    instagram: 'Instagram Reels',
  },
};

export default function HeroSection({ uiLang }: HeroSectionProps) {
  const t = translations[uiLang];
  const titleChars = Array.from(t.title);
  const subtitleChars = Array.from(t.subtitle);
  const [playHeadingAnimation, setPlayHeadingAnimation] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setPlayHeadingAnimation(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    const inputSection = document.getElementById('input-section');
    inputSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Sample images for scrolling grid (square 1:1 aspect ratio)
  const gridImages = [
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop',
  ];

  return (
    <section className="relative h-screen bg-gray-50 overflow-hidden">
      {/* Decorative sparkle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <Sparkles className="w-12 h-12 text-gray-300" />
      </div>

      <div className="relative max-w-[1920px] mx-auto">
        {/* Mobile/Tablet: Stacked layout */}
        <div className="lg:hidden px-4 sm:px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 -mt-6 md:-mt-10"
          >
            <div className="space-y-4">
              <h1 className="font-integral-cf text-4xl md:text-5xl font-black leading-tight text-gray-900">
                <motion.span
                  initial={playHeadingAnimation ? 'hidden' : false}
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.03,
                        delayChildren: 0.1,
                      },
                    },
                  }}
                  className="inline-block"
                >
                  {titleChars.map((char, index) => (
                    <motion.span
                      key={`${char}-${index}`}
                      variants={{
                        hidden: { opacity: 0, y: 12 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="inline-block font-black"
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </motion.span>
                  ))}
                </motion.span>
                <br />
                <motion.span
                  initial={playHeadingAnimation ? 'hidden' : false}
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.025,
                        delayChildren: 0.45,
                      },
                    },
                  }}
                  className="inline-block"
                >
                  {subtitleChars.map((char, index) => (
                    <motion.span
                      key={`subtitle-${char}-${index}`}
                      variants={{
                        hidden: { opacity: 0, y: 12 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="inline-block font-black"
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </motion.span>
                  ))}
                </motion.span>
              </h1>
            </div>

            <p className="text-base text-gray-600 leading-relaxed">
              {t.description}
            </p>

            <button
              onClick={handleGetStarted}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white rounded-full font-semibold text-base transition-all duration-300 hover:bg-gray-800 hover:shadow-xl"
            >
              {t.cta}
            </button>

            {/* Platform Badges */}
            <div className="pt-4 space-y-3">
              <p className="text-sm font-medium text-gray-500">
                {t.builtin}
              </p>
              <div className="flex flex-wrap gap-3">
                {/* YouTube */}
                <div className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span className="text-base font-semibold text-gray-700">{t.youtube}</span>
                </div>

                {/* TikTok */}
                <div className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <svg className="w-8 h-8 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                  <span className="text-base font-semibold text-gray-700">{t.tiktok}</span>
                </div>

                {/* Instagram */}
                <div className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <svg className="w-8 h-8 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 0 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
                  </svg>
                  <span className="text-base font-semibold text-gray-700">{t.instagram}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Scrolling grid for mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 h-[400px] rounded-2xl overflow-hidden"
          >
            <ScrollingImageGrid images={gridImages} />
          </motion.div>
        </div>

        {/* Desktop: Side-by-side with marquee on right */}
        <div className="hidden lg:grid lg:grid-cols-[56%_44%] items-center h-screen px-8 xl:px-12">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="z-10 space-y-4 lg:space-y-5 -mt-10 xl:-mt-14"
          >
            <div className="space-y-3">
              <h1 className="font-integral-cf text-4xl lg:text-5xl xl:text-6xl font-black leading-[1.1] text-gray-900">
                <motion.span
                  initial={playHeadingAnimation ? 'hidden' : false}
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.03,
                        delayChildren: 0.1,
                      },
                    },
                  }}
                  className="inline-block"
                >
                  {titleChars.map((char, index) => (
                    <motion.span
                      key={`desktop-${char}-${index}`}
                      variants={{
                        hidden: { opacity: 0, y: 12 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="inline-block font-black"
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </motion.span>
                  ))}
                </motion.span>
                <br />
                <motion.span
                  initial={playHeadingAnimation ? 'hidden' : false}
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.025,
                        delayChildren: 0.45,
                      },
                    },
                  }}
                  className="inline-block"
                >
                  {subtitleChars.map((char, index) => (
                    <motion.span
                      key={`desktop-subtitle-${char}-${index}`}
                      variants={{
                        hidden: { opacity: 0, y: 12 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="inline-block font-black"
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </motion.span>
                  ))}
                </motion.span>
              </h1>
            </div>

            <p className="text-sm lg:text-base text-gray-600 leading-relaxed max-w-xl">
              {t.description}
            </p>

            <button
              onClick={handleGetStarted}
              className="inline-flex items-center gap-2 px-6 lg:px-7 py-3 bg-gray-900 text-white rounded-full font-semibold text-sm lg:text-base transition-all duration-300 hover:bg-gray-800 hover:shadow-xl"
            >
              {t.cta}
            </button>

            {/* Platform Badges */}
            <div className="pt-2 space-y-2">
              <p className="text-sm font-medium text-gray-500">
                {t.builtin}
              </p>
              <div className="flex flex-wrap gap-3">
                {/* YouTube */}
                <div className="inline-flex items-center gap-2 px-5 py-3 lg:px-6 lg:py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <svg className="w-7 h-7 lg:w-8 lg:h-8 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span className="text-sm lg:text-base font-semibold text-gray-700">{t.youtube}</span>
                </div>

                {/* TikTok */}
                <div className="inline-flex items-center gap-2 px-5 py-3 lg:px-6 lg:py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <svg className="w-7 h-7 lg:w-8 lg:h-8 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                  <span className="text-sm lg:text-base font-semibold text-gray-700">{t.tiktok}</span>
                </div>

                {/* Instagram */}
                <div className="inline-flex items-center gap-2 px-5 py-3 lg:px-6 lg:py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <svg className="w-7 h-7 lg:w-8 lg:h-8 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 0 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
                  </svg>
                  <span className="text-sm lg:text-base font-semibold text-gray-700">{t.instagram}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right content - Twibbonize-style scrolling grid */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute top-0 -right-10 xl:-right-14 bottom-0 w-1/2 z-0"
          >
            <ScrollingImageGrid images={gridImages} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
