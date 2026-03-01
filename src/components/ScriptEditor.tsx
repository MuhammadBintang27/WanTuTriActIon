'use client';

import { motion } from 'framer-motion';
import { FileText, Plus, Trash2, Users, Loader2, ImageIcon } from 'lucide-react';
import { Scene, Character, SceneType } from '@/types';
import { cn } from '@/lib/utils';

interface ScriptEditorProps {
  uiLang: 'en' | 'id' | 'zh';
  scenes: Scene[];
  onScenesChange: (scenes: Scene[]) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const translations = {
  en: {
    title: 'GENERATED SCRIPT OUTPUT',
    description: 'Review and edit your dramatic script below. You can modify any scene before generating images.',
    editScript: 'Edit Drama Script',
    visualDescription: 'Visual Description',
    action: 'Action',
    dialogue: 'Dialogue',
    characters: 'Characters',
    add: 'Add',
    generateImages: 'Generate Images for All Scenes',
    generatingImages: 'Generating Images...',
    problem: 'Problem',
    climax: 'Climax',
    resolution: 'Resolution',
    sceneTitle: 'Scene Title',
  },
  id: {
    title: 'OUTPUT NASKAH YANG DIHASILKAN',
    description: 'Tinjau dan edit naskah dramatis Anda di bawah. Anda dapat memodifikasi adegan apa pun sebelum membuat gambar.',
    editScript: 'Edit Naskah Drama',
    visualDescription: 'Deskripsi Visual',
    action: 'Aksi',
    dialogue: 'Dialog',
    characters: 'Karakter',
    add: 'Tambah',
    generateImages: 'Generate Gambar untuk Semua Adegan',
    generatingImages: 'Membuat Gambar...',
    problem: 'Masalah',
    climax: 'Puncak',
    resolution: 'Solusi',
    sceneTitle: 'Judul Adegan',
  },
  zh: {
    title: '生成的脚本输出',
    description: '在下面查看和编辑您的戏剧脚本。在生成图像之前，您可以修改任何场景。',
    editScript: '编辑短剧脚本',
    visualDescription: '视觉描述',
    action: '动作',
    dialogue: '对话',
    characters: '角色',
    add: '添加',
    generateImages: '为所有场景生成图像',
    generatingImages: '正在生成图像...',
    problem: '问题',
    climax: '高潮',
    resolution: '解决',
    sceneTitle: '场景标题',
  },
};

export default function ScriptEditor({
  uiLang,
  scenes,
  onScenesChange,
  onSubmit,
  isLoading,
}: ScriptEditorProps) {
  const t = translations[uiLang];

  const getSceneTypeLabel = (type: SceneType) => {
    const labels = {
      problem: t.problem,
      climax: t.climax,
      resolution: t.resolution,
    };
    return labels[type];
  };

  const getSceneTypeColor = (type: SceneType) => {
    const colors = {
      problem: 'bg-red-100 text-red-700 border-red-200',
      climax: 'bg-orange-100 text-orange-700 border-orange-200',
      resolution: 'bg-green-100 text-green-700 border-green-200',
    };
    return colors[type];
  };

  const updateScene = (index: number, field: keyof Scene, value: string) => {
    const updatedScenes = scenes.map((scene, i) =>
      i === index ? { ...scene, [field]: value } : scene
    );
    onScenesChange(updatedScenes);
  };

  const addCharacter = (sceneIndex: number) => {
    const updatedScenes = scenes.map((scene, i) =>
      i === sceneIndex
        ? {
            ...scene,
            characters: [...scene.characters, { name: '', visual_description: '' }],
          }
        : scene
    );
    onScenesChange(updatedScenes);
  };

  const removeCharacter = (sceneIndex: number, charIndex: number) => {
    const updatedScenes = scenes.map((scene, i) =>
      i === sceneIndex
        ? {
            ...scene,
            characters: scene.characters.filter((_, ci) => ci !== charIndex),
          }
        : scene
    );
    onScenesChange(updatedScenes);
  };

  const updateCharacter = (
    sceneIndex: number,
    charIndex: number,
    field: 'name' | 'visual_description',
    value: string
  ) => {
    const updatedScenes = scenes.map((scene, i) =>
      i === sceneIndex
        ? {
            ...scene,
            characters: scene.characters.map((char, ci) =>
              ci === charIndex ? { ...char, [field]: value } : char
            ),
          }
        : scene
    );
    onScenesChange(updatedScenes);
  };

  return (
    <section id="script-editor-section" className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t.title}</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">{t.description}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-700" />
              {t.editScript}
            </h3>
          </div>

          <div className="p-6 space-y-8">
            {scenes.map((scene, index) => (
              <motion.div
                key={scene.scene_number}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 border-l-[3px] border-gray-300 shadow-sm relative"
              >
                {/* Scene Number - Large with vertical line */}
                <div className="absolute left-6 top-6">
                  <span className="text-5xl font-bold text-gray-200 leading-none">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                
                {/* Scene Header */}
                <div className="flex flex-wrap items-center gap-3 mb-4 ml-20">
                  <input
                    type="text"
                    value={scene.title}
                    onChange={(e) => updateScene(index, 'title', e.target.value)}
                    placeholder={t.sceneTitle}
                    className="flex-1 min-w-[200px] font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gray-400 focus:border-transparent focus:bg-white transition-colors"
                  />
                </div>

                {/* Scene Fields */}
                <div className="space-y-4 ml-20">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.visualDescription}
                    </label>
                    <textarea
                      value={scene.visual_description}
                      onChange={(e) => updateScene(index, 'visual_description', e.target.value)}
                      className="w-full min-h-[100px] p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
                      placeholder="Describe the visual aspects of this scene..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t.action}
                      </label>
                      <textarea
                        value={scene.action}
                        onChange={(e) => updateScene(index, 'action', e.target.value)}
                        className="w-full min-h-[80px] p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
                        placeholder="What actions are happening..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t.dialogue}
                      </label>
                      <textarea
                        value={scene.dialogue}
                        onChange={(e) => updateScene(index, 'dialogue', e.target.value)}
                        className="w-full min-h-[80px] p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
                        placeholder="Character dialogue..."
                      />
                    </div>
                  </div>

                  {/* Characters Section */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Users className="w-4 h-4" />
                        {t.characters}
                      </label>
                      <button
                        onClick={() => addCharacter(index)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        {t.add}
                      </button>
                    </div>

                    <div className="space-y-3">
                      {scene.characters.map((char, charIndex) => (
                        <motion.div
                          key={charIndex}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1 space-y-3">
                              <input
                                type="text"
                                value={char.name}
                                onChange={(e) =>
                                  updateCharacter(index, charIndex, 'name', e.target.value)
                                }
                                placeholder="Character name"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white focus:bg-white transition-colors"
                              />
                              <textarea
                                value={char.visual_description}
                                onChange={(e) =>
                                  updateCharacter(
                                    index,
                                    charIndex,
                                    'visual_description',
                                    e.target.value
                                  )
                                }
                                placeholder="Visual description (e.g., appearance, clothing, expression)"
                                className="w-full min-h-[70px] px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white focus:bg-white transition-colors"
                              />
                            </div>
                            {scene.characters.length > 1 && (
                              <button
                                onClick={() => removeCharacter(index, charIndex)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-center">
            <motion.button
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              onClick={onSubmit}
              disabled={isLoading}
              className="max-w-md px-8 py-4 rounded-xl font-semibold text-white bg-black hover:bg-gray-800 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t.generatingImages}</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5" />
                  <span>{t.generateImages}</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
