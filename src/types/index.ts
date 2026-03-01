export interface Character {
  name: string;
  visual_description: string;
}

export type SceneType = 'problem' | 'climax' | 'resolution';

export interface Scene {
  scene_number: number;
  scene_type: SceneType;
  title: string;
  visual_description: string;
  action: string;
  dialogue: string;
  characters: Character[];
}

export interface Script {
  scenes: Scene[];
}

export type GenerationStage = 
  | 'idle'
  | 'scripting'
  | 'script_review'
  | 'image_generation'
  | 'image_review'
  | 'video_generation'
  | 'completed'
  | 'error';

export interface GenerationStatus {
  stage: GenerationStage;
  progress: number;
  message: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface GenerateRequest {
  prompt: string;
  image?: string;
  language: 'id' | 'en';
}

export interface GenerateResponse {
  videoUrl: string;
  scenes: Scene[];
  stage: GenerationStage;
}

export interface QwenScriptResponse {
  scenes: Scene[];
}

export interface WanAIImageResponse {
  url: string;
}

export interface WanAIVideoResponse {
  url: string;
}

export interface ProgressUpdate {
  stage: GenerationStage;
  progress: number;
  message: string;
  scenes?: Scene[];
  videoUrl?: string;
}
