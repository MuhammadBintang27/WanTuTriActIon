import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export async function initFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg) return ffmpeg;
  
  ffmpeg = new FFmpeg();
  
  // Load FFmpeg from CDN
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  
  return ffmpeg;
}

export async function mergeVideosClientSide(videoUrls: string[]): Promise<string> {
  const ffmpeg = await initFFmpeg();
  
  // Download all videos (use proxy for external URLs to avoid CORS)
  const videoFiles: string[] = [];
  for (let i = 0; i < videoUrls.length; i++) {
    const videoUrl = videoUrls[i];
    // Use proxy for external URLs
    const fetchUrl = videoUrl.startsWith('http') && !videoUrl.includes(window.location.host)
      ? `/api/proxy-video?url=${encodeURIComponent(videoUrl)}`
      : videoUrl;
    
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      throw new Error(`Failed to download video ${i + 1}: ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    const inputName = `input${i}.mp4`;
    await ffmpeg.writeFile(inputName, new Uint8Array(buffer));
    videoFiles.push(inputName);
  }
  
  // Create concat list
  const listContent = videoFiles.map(f => `file '${f}'`).join('\n');
  await ffmpeg.writeFile('list.txt', listContent);
  
  // Merge videos
  await ffmpeg.exec([
    '-f', 'concat',
    '-safe', '0',
    '-i', 'list.txt',
    '-c', 'copy',
    'output.mp4'
  ]);
  
  // Read output
  const data = await ffmpeg.readFile('output.mp4') as Uint8Array;
  const blob = new Blob([new Uint8Array(data)], { type: 'video/mp4' });
  
  // Cleanup
  for (const file of videoFiles) {
    await ffmpeg.deleteFile(file);
  }
  await ffmpeg.deleteFile('list.txt');
  await ffmpeg.deleteFile('output.mp4');
  
  return URL.createObjectURL(blob);
}
