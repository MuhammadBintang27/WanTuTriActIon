# WanTuTri AI

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Transform your ideas into cinematic scripts and ready-to-generate video content with AI**

WanTuTri AI is an advanced AI-powered platform that revolutionizes video content creation by converting simple text prompts into professional cinematic scripts, visual prompts, and fully generated videos. Powered by cutting-edge AI technologies from Alibaba Cloud, Qwen, and WanAI.

---

## Features

### AI Script Generator
- **Multi-language Support**: Generate scripts in English, Indonesian, and Chinese
- **Scene Detection**: Automatically detects language and structures your narrative
- **Character Analysis**: AI-powered character reference classification
- **Smart Narrative**: Creates problem-climax-resolution story structures

### Scene Breakdown
- **Detailed Scene Analysis**: Each scene includes:
  - Scene number and type (problem/climax/resolution)
  - Title and visual description
  - Action sequences and dialogue
  - Character list
- **Editable Scenes**: Full control to edit any scene element before generation

### Visual Prompts Generation
- **AI Image Generation**: Converts scene descriptions to high-quality images
- **Reference Image Support**: Upload reference images for consistent character/style
- **Regeneration**: Regenerate individual scene images if needed
- **Multi-scene Processing**: Batch generate images for all scenes

### Video Generator
- **Text-to-Video**: Transform static images and descriptions into dynamic videos
- **Auto-merge**: Seamlessly merges multiple scene videos into one final output
- **Client-side Processing**: Uses FFmpeg.wasm for efficient video merging
- **Download Support**: Export your final video directly

### Multilingual Interface
- **3 Languages**: English, Indonesian (Bahasa), and Chinese (中文)
- **Real-time Switching**: Switch UI language instantly
- **Localized Content**: All sections translated including footer, navigation, and features

### Progress Tracking
- **Visual Progress Indicator**: Track generation status across all stages
- **Stage-by-stage Updates**: Clear visibility of current process
- **Scene Counter**: Shows progress through multi-scene generation

---

## Tech Stack

### Frontend
- **[Next.js 16.1.6](https://nextjs.org/)** - React framework with App Router
- **[React 19.2.3](https://react.dev/)** - UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first styling
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library

### AI & Media Processing
- **[Qwen (Alibaba Cloud)](https://tongyi.aliyun.com/)** - Large Language Model for script generation
- **[WanAI](https://www.wanai.com/)** - Image and video generation
- **[FFmpeg.wasm](https://ffmpegwasm.netlify.app/)** - Client-side video processing

### UI Components
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[Radix UI](https://www.radix-ui.com/)** - Headless UI primitives
- **[CVA](https://cva.style/)** - Class variance authority for component variants

---

## Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm, yarn, pnpm, or bun package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/MuhammadBintang27/WanTuTriActIon.git
cd WanTuTriActIon
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:
```env
# Qwen API Configuration
QWEN_API_KEY=your_qwen_api_key
QWEN_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

# WanAI API Configuration
WAN_API_KEY=your_wan_api_key
WAN_API_URL=https://api.wan.ai

# Optional: Additional API keys
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

---

## Usage

### 1. Enter Your Prompt
- Type your video idea in the input form
- (Optional) Upload reference images for character/style consistency
- Choose to generate AI script or write your own

### 2. Review & Edit Script
- Review the AI-generated script with scene breakdown
- Edit any scene element (title, description, action, dialogue)
- Add or remove scenes as needed

### 3. Generate Images
- Click "Generate Images" to create visuals for all scenes
- Review generated images
- Regenerate individual images if needed

### 4. Generate Video
- Click "Generate Video" to convert scenes into video clips
- Wait for video generation and auto-merge
- Download your final cinematic video

---

## Project Structure

```
WanTuTriActIon/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── generate/     # Script generation endpoint
│   │   │   ├── image/        # Image generation endpoint
│   │   │   ├── video/        # Video generation endpoint
│   │   │   ├── script/       # Script processing
│   │   │   ├── merge-videos/ # Video merging endpoint
│   │   │   ├── proxy-image/  # Image proxy
│   │   │   ├── proxy-video/  # Video proxy
│   │   │   └── reference-classify/ # Image classification
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Main page
│   ├── components/
│   │   ├── BrandingBar.tsx   # Branding section
│   │   ├── Footer.tsx        # Footer with translations
│   │   ├── HeroSection.tsx   # Hero section
│   │   ├── HowItWorks.tsx    # Guide section
│   │   ├── ImageReview.tsx   # Image review interface
│   │   ├── InputForm.tsx     # Prompt input form
│   │   ├── LoadingOverlay.tsx # Loading state
│   │   ├── ProgressTracker.tsx # Progress indicator
│   │   ├── ScriptEditor.tsx  # Script editing interface
│   │   ├── VideoPlayer.tsx   # Video playback
│   │   └── ui/               # Reusable UI components
│   ├── lib/
│   │   ├── qwen.ts           # Qwen API integration
│   │   ├── wanai.ts          # WanAI API integration
│   │   ├── videoMerge.ts     # FFmpeg video merging
│   │   └── utils.ts          # Utility functions
│   └── types/
│       └── index.ts          # TypeScript type definitions
├── public/
│   ├── fonts/                # Custom fonts
│   └── image/                # Static images and logos
├── components.json           # Component configuration
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
```

---

## API Endpoints

### POST `/api/script`
Generate AI script from prompt
```typescript
Request: {
  prompt: string;
  image?: string; // base64
  referenceImages?: ReferenceImageMeta[];
  language: 'en' | 'id' | 'zh';
}

Response: {
  data: { scenes: Scene[] }
}
```

### POST `/api/image`
Generate images for scenes
```typescript
Request: {
  scenes: Array<{
    visualDescription: string;
    action: string;
    characters: string[];
    sceneIndex: number;
  }>;
  referenceImage?: string;
  referenceImages?: ReferenceImageMeta[];
  regenerateOnly?: boolean;
}

Response: {
  data: { imageUrls: Array<{url: string, sceneIndex: number}> }
}
```

### POST `/api/video`
Generate videos from scenes
```typescript
Request: {
  scenes: Array<{
    imageUrl: string;
    visualDescription: string;
    action: string;
    dialogue: string;
  }>;
  referenceImage?: string;
  referenceImages?: ReferenceImageMeta[];
}

Response: {
  data: { videoUrls: string[] }
}
```

---

## Key Features Explained

### Reference Image Classification
The platform automatically classifies uploaded reference images into categories:
- **Character**: Character designs and appearances
- **Style**: Art style, color palette, mood
- **Scene**: Location and environmental references
- **Object**: Specific objects or props

### Language Detection
Automatically detects the language of your prompt:
- Analyzes character sets (Latin, Indonesian, Chinese)
- Adjusts AI model parameters accordingly
- Generates contextually appropriate content

### Video Merging (Client-side)
Uses FFmpeg.wasm to merge multiple video clips:
- No server-side processing required
- Fast in-browser video compilation
- Maintains video quality
- Adds fade transitions between scenes

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Team

**WanTuTri AI** by Geutanyoe

---

## Acknowledgments

- **Alibaba Cloud** - Cloud infrastructure and Qwen LLM
- **Qwen Team** - Advanced language model capabilities
- **WanAI** - Image and video generation technology
- **BluePower** - Technology partnership

---

## Contact

- **Email**: Geutanyoe@gmail.com
- **GitHub**: [@MuhammadBintang27](https://github.com/MuhammadBintang27)
- **Repository**: [WanTuTriActIon](https://github.com/MuhammadBintang27/WanTuTriActIon)

---

## Demo

Visit our live demo: [Coming Soon]

---

<div align="center">
  <strong>Made with passion by WanTuTri AI Team</strong>
  <br>
  <sub>© 2026 WanTuTri AI. All rights reserved.</sub>
</div>
