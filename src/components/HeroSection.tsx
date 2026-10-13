'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Check, Clapperboard } from 'lucide-react';
import { ScrollingImageGrid } from '@/components/ui/scrolling-image-grid';

interface HeroSectionProps {
  uiLang: 'en' | 'id' | 'zh';
}

const translations = {
  en: {
    title: 'TURN YOUR IDEAS INTO',
    subtitle: 'DRAMATIC AI CONTENT',
    description: 'Transform your ideas into structured scenes, AI image prompts, and video-ready content — all in one place.',
    cta: 'Create Now',
    builtin: 'Built For Modern Storytelling',
    youtube: 'YouTube Creators',
    tiktok: 'Tiktok Creators',
    instagram: 'Instagram Reels',
    scenes: ['Problem', 'Climax', 'Resolution'],
  },
  id: {
    title: 'UBAH IDE ANDA MENJADI',
    subtitle: 'KONTEN AI DRAMATIS',
    description: 'Ubah ide Anda menjadi adegan terstruktur, prompt gambar AI, dan konten siap video — semua dalam satu tempat.',
    cta: 'Buat Sekarang',
    builtin: 'Dibuat Untuk Storytelling Modern',
    youtube: 'YouTube Creators',
    tiktok: 'Kreator TikTok',
    instagram: 'Instagram Reels',
    scenes: ['Masalah', 'Klimaks', 'Resolusi'],
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
    scenes: ['问题', '高潮', '结局'],
  },
};

const platforms = [
  { key: 'youtube', color: 'bg-[#FF0000]', path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
  { key: 'tiktok', color: 'bg-black', path: 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z' },
  { key: 'instagram', color: 'bg-gradient-to-tr from-[#FEDA75] via-[#D62976] to-[#4F5BD5]', path: 'M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 0 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z' },
] as const;

// Local images from public/image (add more files and paths here)
const gridImages = Array.from({ length: 13 }, (_, i) => `/image/example${i + 1}.jpg`);

const reveal = { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const };

export default function HeroSection({ uiLang }: HeroSectionProps) {
  const t = translations[uiLang];

  const handleGetStarted = () => {
    document.getElementById('input-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };


  return (
    <section className="relative min-h-screen overflow-hidden bg-white">
      {/* Desktop: image wall melting into the white on the right */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ...reveal, delay: 0.2 }}
        className="absolute inset-y-0 -right-10 hidden w-1/2 lg:block xl:-right-14"
      >
        <ScrollingImageGrid images={gridImages} />
        {/* White overlays instead of a mask: a mask re-rasterises the moving wall every frame */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent" />

        {/* Floating storyboard card */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[16%] left-[8%] w-60 rounded-2xl border border-white/60 bg-white p-4 shadow-[0_20px_60px_-15px_rgb(0_0_0/0.35)] "
        >
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-gray-500">
            <Clapperboard className="h-4 w-4 text-gray-950" />
            STORYBOARD
          </div>
          <ul className="space-y-2">
            {t.scenes.map((scene, i) => (
              <li key={scene} className="flex items-center gap-2.5 text-sm font-semibold text-gray-800">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-950 text-white">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span className="text-gray-400">0{i + 1}</span>
                {scene}
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>

      <div className="relative mx-auto flex min-h-screen max-w-[1920px] flex-col justify-center px-4 pb-16 pt-28 sm:px-6 lg:px-12">
        <div className="z-10 max-w-2xl space-y-7 lg:max-w-[54%]">
          {/* Each line slides up out of its own mask */}
          <h1 className="font-integral-cf text-4xl font-black leading-[1.08] text-gray-950 sm:text-5xl xl:text-6xl 2xl:text-7xl">
            <span className="block overflow-hidden pb-1">
              <motion.span initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ ...reveal, delay: 0.1 }} className="block">
                {t.title}
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-1">
              <motion.span initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ ...reveal, delay: 0.25 }} className="text-gradient block">
                {t.subtitle}
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...reveal, delay: 0.45 }}
            className="max-w-xl text-base leading-relaxed text-gray-600 lg:text-lg"
          >
            {t.description}
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...reveal, delay: 0.55 }}
            onClick={handleGetStarted}
            className="group inline-flex items-center gap-3 rounded-full bg-[#6A5EE5] py-2 pl-8 pr-2 text-lg font-semibold text-white shadow-[0_18px_40px_-14px_rgb(0_0_0/0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#5A50D1] hover:shadow-[0_24px_50px_-14px_rgb(0_0_0/0.5)]"
          >
            {t.cta}
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-950 transition-transform duration-300 group-hover:rotate-[-45deg]">
              <ArrowRight className="h-5 w-5" />
            </span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex items-center gap-4 pt-8"
          >
            {/* Overlapping brand tiles */}
            <div className="flex -space-x-3">
              {platforms.map((p) => (
                <div
                  key={p.key}
                  title={t[p.key]}
                  className={`relative flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg ring-4 ring-white transition-transform duration-300 hover:z-10 hover:-translate-y-1.5 hover:-rotate-6 ${p.color}`}
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d={p.path} />
                  </svg>
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-950">{t.builtin}</p>
              <p className="text-sm text-gray-500">{platforms.map((p) => t[p.key]).join(' · ')}</p>
            </div>
          </motion.div>
        </div>

        {/* Scrolling grid for mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mt-10 h-[400px] overflow-hidden rounded-3xl border border-gray-200 shadow-xl lg:hidden"
        >
          <ScrollingImageGrid images={gridImages} />
        </motion.div>
      </div>
    </section>
  );
}
