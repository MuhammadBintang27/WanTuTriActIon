import { motion } from 'framer-motion';
import Image from 'next/image';

type UILanguage = 'en' | 'id' | 'zh';

interface FooterProps {
  uiLang: UILanguage;
}

const translations = {
  en: {
    title: 'WanTuTri AI',
    description: 'AI-powered platform to turn ideas into cinematic scripts and ready-to-generate video content.',
    features: 'Features',
    featuresList: [
      'AI Script Generator',
      'Scene Breakdown',
      'Visual Prompts',
      'Video Generator',
    ],
    contact: 'Contact',
    email: 'Email: Geutanyoe@gmail.com',
    available: 'Available 24/7',
    poweredBy: 'Powered by',
    poweredByDesc: 'Supported by our technology partners',
    copyright: '© 2026 WanTuTri AI. All rights reserved.',
  },
  id: {
    title: 'WanTuTri AI',
    description: 'Platform bertenaga AI untuk mengubah ide menjadi skrip sinematik dan konten video siap-generate.',
    features: 'Fitur',
    featuresList: [
      'Generator Skrip AI',
      'Pemecahan Adegan',
      'Prompt Visual',
      'Generator Video',
    ],
    contact: 'Kontak',
    email: 'Email: Geutanyoe@gmail.com',
    available: 'Tersedia 24/7',
    poweredBy: 'Didukung oleh',
    poweredByDesc: 'Didukung oleh mitra teknologi kami',
    copyright: '© 2026 WanTuTri AI. Hak cipta dilindungi.',
  },
  zh: {
    title: 'WanTuTri AI',
    description: '由AI驱动的平台，将创意转化为电影脚本和可生成的视频内容。',
    features: '功能',
    featuresList: [
      'AI脚本生成器',
      '场景分解',
      '视觉提示',
      '视频生成器',
    ],
    contact: '联系方式',
    email: '邮箱：Geutanyoe@gmail.com',
    available: '全天候服务',
    poweredBy: '技术支持',
    poweredByDesc: '由我们的技术合作伙伴提供支持',
    copyright: '© 2026 WanTuTri AI。保留所有权利。',
  },
};

const partnerLogos: Array<{
  src: string;
  alt: string;
  width: number;
  cardClassName?: string;
  imageClassName?: string;
}> = [
  { src: '/image/Alibaba_Cloud_Logo.png', alt: 'Alibaba Cloud', width: 120 },
  { src: '/image/Logo_Qwen.png', alt: 'Qwen', width: 90 },
  { src: '/image/Logo_Wan.png', alt: 'Wan', width: 90 },
  {
    src: '/image/Logo_BluePower.png',
    alt: 'BluePower',
    width: 120,
    cardClassName: 'px-3',
    imageClassName: 'h-7 w-auto object-contain',
  },
];

export default function Footer({ uiLang }: FooterProps) {
  const t = translations[uiLang];

  return (
    <footer className="py-16 bg-gray-100 border-t border-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12 items-start">
          {/* Column 1: About */}
          <div className="md:col-span-3">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {t.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {t.description}
            </p>
          </div>

          {/* Column 2: Features */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {t.features}
            </h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              {t.featuresList.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="md:col-span-2 md:pl-3">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {t.contact}
            </h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="whitespace-nowrap">{t.email}</li>
              <li>{t.available}</li>
            </ul>
          </div>

          {/* Column 4: Powered By */}
          <div className="md:col-span-5 md:flex md:flex-col md:items-end md:text-right">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {t.poweredBy}
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {t.poweredByDesc}
            </p>

            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white/70 p-3 w-full md:max-w-[520px] md:ml-auto">
              <motion.div
                className="flex w-max items-center gap-3"
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
              >
                {[...partnerLogos, ...partnerLogos].map((logo, index) => (
                  <div
                    key={`${logo.alt}-${index}`}
                    className={`h-12 px-4 rounded-xl border border-gray-200 bg-white flex items-center justify-center ${logo.cardClassName ?? ''}`}
                  >
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={logo.width}
                      height={26}
                      className={logo.imageClassName ?? 'h-6 w-auto object-contain'}
                    />
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-gray-300">
          <p className="text-center text-gray-500 text-sm">
            {t.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
