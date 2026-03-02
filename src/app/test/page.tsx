'use client';

// MARKED FOR DELETION - This is a test page for video merging function
// DELETE THIS FILE AFTER TESTING IS COMPLETE

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Merge, Play, Download, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { mergeVideosClientSide } from '@/lib/videoMerge';

// AI-generated videos for testing (original URLs)
const TEST_VIDEOS = [
  'https://dashscope-463f.oss-accelerate.aliyuncs.com/1d/60/20260302/12538a30/55244277-v8I2O1Uu_93c5e3d53b32.mp4?Expires=1772546887&OSSAccessKeyId=LTAI5t7xkDxYoFdeAc4nqUeU&Signature=4Zlt1L5M3NmjLZbBGnfXVQx6EGM%3D',
  'https://dashscope-463f.oss-accelerate.aliyuncs.com/1d/f5/20260302/12538a30/33832261-KplJAyz2_e76dd685261c.mp4?Expires=1772546978&OSSAccessKeyId=LTAI5t7xkDxYoFdeAc4nqUeU&Signature=Zq0haItD6Cj%2FMHNKxQsJT41ZQzA%3D',
  'https://dashscope-463f.oss-accelerate.aliyuncs.com/1d/6e/20260302/12538a30/47025068-fbwoJG4s_26c2a8e9c667.mp4?Expires=1772547065&OSSAccessKeyId=LTAI5t7xkDxYoFdeAc4nqUeU&Signature=KB9x9stdRARRI%2FV5%2F06UOVYfrnk%3D',
];

// Proxy URLs for display (to avoid CORS)
const getProxyUrl = (url: string) => `/api/proxy-video?url=${encodeURIComponent(url)}`;

export default function TestMergePage() {
  const [isMerging, setIsMerging] = useState(false);
  const [mergedVideoUrl, setMergedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

  const handleMerge = async () => {
    setIsMerging(true);
    setError(null);
    setProgress('Initializing FFmpeg...');

    try {
      setProgress('Downloading and merging videos...');
      const mergedUrl = await mergeVideosClientSide(TEST_VIDEOS);
      setMergedVideoUrl(mergedUrl);
      setProgress('Merge complete!');
    } catch (err: any) {
      setError(err.message || 'Failed to merge videos');
      setProgress('');
    } finally {
      setIsMerging(false);
    }
  };

  const handleDownload = () => {
    if (!mergedVideoUrl) return;
    const a = document.createElement('a');
    a.href = mergedVideoUrl;
    a.download = 'merged-video.mp4';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Warning Banner */}
        <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">TEST PAGE - MARKED FOR DELETION</span>
          </div>
          <p className="text-sm text-red-700 mt-1">
            This page is for testing video merging only. Delete this file when testing is complete.
          </p>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Merge Test</h1>
          <p className="text-gray-600">Test merging 3 AI-generated videos into 1</p>
        </div>

        {/* Source Videos */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-blue-600" />
            Source Videos (3 scenes)
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {TEST_VIDEOS.map((url, index) => (
              <div key={index} className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Scene {index + 1}</p>
                <video
                  src={getProxyUrl(url)}
                  controls
                  className="w-full rounded-lg aspect-[9/16] bg-black"
                  preload="metadata"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Merge Button */}
        {!mergedVideoUrl && (
          <motion.button
            onClick={handleMerge}
            disabled={isMerging}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isMerging ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                {progress}
              </>
            ) : (
              <>
                <Merge className="w-6 h-6" />
                Merge Videos
              </>
            )}
          </motion.button>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Merged Result */}
        {mergedVideoUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Merged Video Result
              </h2>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
            <div className="aspect-[9/16] max-w-[400px] mx-auto rounded-xl overflow-hidden bg-black">
              <video
                src={mergedVideoUrl}
                controls
                autoPlay
                className="w-full h-full"
              />
            </div>
            <button
              onClick={() => {
                setMergedVideoUrl(null);
                setProgress('');
              }}
              className="mt-6 w-full py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Test Again
            </button>
          </motion.div>
        )}
      </div>
    </main>
  );
}
