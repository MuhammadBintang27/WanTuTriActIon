'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface HowItWorksProps {
  uiLang: 'en' | 'id' | 'zh';
}

const translations = {
  en: {
    title: 'How it Works',
    subtitle: 'Create cinematic AI content in four simple steps',
    steps: [
      {
        number: '01',
        title: 'Describe Your Idea',
        description: 'Enter your concept, story, or video idea. The more detailed your input, the better the results.',
      },
      {
        number: '02',
        title: 'Generate Script & Prompts',
        description: 'Our AI generates structured scenes, narration, and cinematic image prompts automatically.',
      },
      {
        number: '03',
        title: 'Generate Images',
        description: 'AI creates stunning visuals for each scene based on your script and prompts.',
      },
      {
        number: '04',
        title: 'Build Your Video',
        description: 'Use the generated script and visuals to create a ready-to-publish cinematic video.',
      },
    ],
  },
  id: {
    title: 'Cara Kerja',
    subtitle: 'Buat konten AI sinematik dalam empat langkah sederhana',
    steps: [
      {
        number: '01',
        title: 'Deskripsikan Ide Anda',
        description: 'Masukkan konsep, cerita, atau ide video Anda. Semakin detail input, semakin baik hasilnya.',
      },
      {
        number: '02',
        title: 'Generate Script & Prompt',
        description: 'AI kami membuat scene terstruktur, narasi, dan prompt gambar sinematik secara otomatis.',
      },
      {
        number: '03',
        title: 'Generate Gambar',
        description: 'AI membuat visual menarik untuk setiap scene berdasarkan script dan prompt Anda.',
      },
      {
        number: '04',
        title: 'Buat Video Anda',
        description: 'Gunakan script dan visual yang dihasilkan untuk membuat video sinematik siap publish.',
      },
    ],
  },
  zh: {
    title: '工作原理',
    subtitle: '通过四个简单步骤创建电影级AI内容',
    steps: [
      {
        number: '01',
        title: '描述您的想法',
        description: '输入您的概念、故事或视频想法。您的输入越详细，效果越好。',
      },
      {
        number: '02',
        title: '生成脚本和提示',
        description: '我们的AI会自动生成结构化场景、叙述和电影图像提示。',
      },
      {
        number: '03',
        title: '生成图像',
        description: 'AI根据您的脚本和提示为每个场景创建精美的视觉效果。',
      },
      {
        number: '04',
        title: '制作视频',
        description: '使用生成的脚本和视觉效果创建一个随时可发布的电影视频。',
      },
    ],
  },
};

export default function HowItWorks({ uiLang }: HowItWorksProps) {
  const t = translations[uiLang];

  return (
    <section id="how-it-works" className="relative min-h-screen flex flex-col justify-center bg-white overflow-hidden py-24">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

        {/* Sparkle icon - top right, slowly spinning */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 360 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3, rotate: { duration: 14, repeat: Infinity, ease: 'linear' } }}
          className="absolute right-8 -top-10 hidden md:block"
        >
          <Sparkles className="w-16 h-16 text-gray-900" fill="currentColor" />
        </motion.div>

        {/* Title and subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 relative z-10"
        >
          <h2 className="font-integral-cf text-4xl md:text-5xl lg:text-6xl font-black text-gray-950 mb-4">
            {t.title}
          </h2>
          <p className="text-lg md:text-xl text-gray-500">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto relative z-10">
          {t.steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -10 }}
              className="group text-left rounded-3xl border border-gray-200 bg-white  p-7 shadow-sm transition-shadow duration-300 hover:border-gray-950 hover:shadow-[0_30px_70px_-30px_rgb(0_0_0/0.45)]"
            >
              {/* Large number: outlined, fills with the brand gradient on hover */}
              <div className="step-number text-outline font-integral-cf text-7xl lg:text-8xl font-black mb-6 leading-none">
                {step.number}
              </div>

              {/* Title */}
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
