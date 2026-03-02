'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, ArrowUp, Loader2, AlertCircle, Wrench } from 'lucide-react';
import Image from 'next/image';
import { fileToBase64 } from '@/lib/utils';

interface InputFormProps {
  uiLang: 'en' | 'id' | 'zh';
  onSubmit: (prompt: string, images: string[]) => void;
  onUseOwnScript?: () => void;
  isLoading: boolean;
  error?: string;
}

  const translations = {
  en: {
    title: 'CREATE AI DRAMATIC CONTENT',
    inputPlaceholder: 'Type your ideas......',
    referenceImage: 'Reference images:',
    referenceTypes: 'Product / Face / Background',
    uploadError: 'Failed to upload image. Please try again.',
    maxSizeError: 'Image size must be less than 5MB',
    maxImagesError: 'Maximum 5 images allowed',
    alreadyHaveScript: 'Already have a script?',
    useOwnScript: 'Use your own script instead',
  },
  id: {
    title: 'BUAT KONTEN AI DRAMATIS',
    inputPlaceholder: 'Ketik ide Anda......',
    referenceImage: 'Gambar referensi:',
    referenceTypes: 'Produk / Wajah / Latar belakang',
    uploadError: 'Gagal mengunggah gambar. Silakan coba lagi.',
    maxSizeError: 'Ukuran gambar harus kurang dari 5MB',
    maxImagesError: 'Maksimal 5 gambar',
    alreadyHaveScript: 'Sudah punya script?',
    useOwnScript: 'Gunakan script Anda sendiri',
  },
  zh: {
    title: '创建戏剧性AI内容',
    inputPlaceholder: '输入您的想法......',
    referenceImage: '参考图片：',
    referenceTypes: '产品 / 人脸 / 背景',
    uploadError: '上传图片失败。请重试。',
    maxSizeError: '图片大小必须小于5MB',
    maxImagesError: '最多5张图片',
    alreadyHaveScript: '已有脚本？',
    useOwnScript: '使用您自己的脚本',
  },
};

export default function InputForm({ uiLang, onSubmit, onUseOwnScript, isLoading, error }: InputFormProps) {
  const t = translations[uiLang];
  const [prompt, setPrompt] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_IMAGES = 5;

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check max images limit
    if (uploadedImages.length + files.length > MAX_IMAGES) {
      setImageError(t.maxImagesError);
      return;
    }

    const validImages: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setImageError(t.maxSizeError);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        console.log(`Image ${i + 1} uploaded successfully, data URL length:`, base64.length);
        validImages.push(base64);
      } catch (err) {
        console.error('Error uploading image:', err);
      }
    }

    if (validImages.length > 0) {
      setUploadedImages(prev => [...prev, ...validImages]);
      setImageError('');
    } else if (validImages.length === 0 && files.length > 0) {
      setImageError(t.uploadError);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImageError('');
  };

  const handleSubmit = () => {
    if (!prompt.trim() || isLoading) return;
    onSubmit(prompt.trim(), uploadedImages);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <section id="input-section" className="h-screen flex flex-col justify-center bg-gradient-to-br from-gray-50 to-white py-12 lg:pt-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Title and Robot Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 md:mb-20"
        >
          <h2 className="font-integral-cf text-5xl md:text-6xl font-black text-black leading-tight max-w-full md:max-w-[62%]">
            {t.title}
          </h2>
        </motion.div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative bg-white rounded-3xl border-2 border-gray-200 overflow-visible shadow-sm"
        >
          <div className="hidden md:block absolute -top-73 -right-1 pointer-events-none">
            <Image
              src="/image/robotThink.png"
              alt="AI Robot"
              width={320}
              height={320}
              className="object-contain"
            />
            </div>

          <div className="p-4">
            {/* Main input row with icons inside */}
            <div className="flex items-center gap-3 px-4 py-3 bg-white border-2 border-gray-100 rounded-2xl">
              {/* Left Icons */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || uploadedImages.length >= MAX_IMAGES}
                className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={uploadedImages.length >= MAX_IMAGES ? t.maxImagesError : 'Upload images'}
              >
                <Plus className="w-5 h-5 text-gray-600" />
              </button>
              
              <button
                className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                title="Tools"
              >
                <Wrench className="w-5 h-5 text-gray-600" />
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.inputPlaceholder}
                className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder:text-gray-400 text-base"
                disabled={isLoading}
              />

              {/* Send Button - Circular */}
              <motion.button
                whileHover={{ scale: isLoading ? 1 : 1.05 }}
                whileTap={{ scale: isLoading ? 1 : 0.95 }}
                onClick={handleSubmit}
                disabled={isLoading || !prompt.trim()}
                className="flex-shrink-0 w-12 h-12 bg-black hover:bg-gray-800 disabled:bg-gray-300 rounded-full flex items-center justify-center transition-colors disabled:shadow-none"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <ArrowUp className="w-5 h-5 text-white" />
                )}
              </motion.button>
            </div>

            {/* Uploaded Images Preview */}
            {uploadedImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4"
              >
                <div className="mb-2 text-sm text-gray-600">
                  <p className="font-semibold text-gray-700">
                    {t.referenceImage} ({uploadedImages.length}/{MAX_IMAGES})
                  </p>
                  <p className="text-xs text-gray-500">
                    {t.referenceTypes}
                  </p>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {uploadedImages.map((img, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative flex-shrink-0"
                    >
                      <img 
                        src={img} 
                        alt={`Reference ${index + 1}`} 
                        className="h-20 w-20 object-cover rounded-lg border-2 border-gray-200 shadow-md" 
                      />
                      <button
                        onClick={() => removeImage(index)}
                        disabled={isLoading}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md disabled:opacity-50"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Error Messages */}
            {(error || imageError) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-start gap-2 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error || imageError}</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Already Have Script Link */}
        {onUseOwnScript && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-left"
          >
            <span className="text-sm text-gray-400">{t.alreadyHaveScript} </span>
            <button
              onClick={onUseOwnScript}
              className="text-sm text-black underline hover:text-gray-700 font-normal transition-colors"
            >
              {t.useOwnScript}
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
