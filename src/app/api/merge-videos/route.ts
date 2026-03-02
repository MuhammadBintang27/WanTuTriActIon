import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

// Helper to run FFmpeg command
function runFFmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', args, { stdio: 'pipe' });
    let stderr = '';
    
    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}: ${stderr}`));
      }
    });
    
    ffmpeg.on('error', (err) => {
      reject(new Error(`Failed to spawn FFmpeg: ${err.message}. Make sure FFmpeg is installed.`));
    });
  });
}

export async function POST(request: NextRequest) {
  const tempFiles: string[] = [];
  
  try {
    const body = await request.json();
    const { videoUrls } = body;

    if (!videoUrls || !Array.isArray(videoUrls) || videoUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Video URLs are required' },
        { status: 400 }
      );
    }

    // Create temp directory
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'video-merge-'));
    
    // Download all videos
    const videoFiles: string[] = [];
    for (let i = 0; i < videoUrls.length; i++) {
      const response = await fetch(videoUrls[i]);
      if (!response.ok) {
        throw new Error(`Failed to download video ${i + 1}`);
      }
      
      const buffer = Buffer.from(await response.arrayBuffer());
      const videoPath = path.join(tempDir, `video-${i}.mp4`);
      await fs.writeFile(videoPath, buffer);
      videoFiles.push(videoPath);
      tempFiles.push(videoPath);
    }

    // Create concat list file
    const listFile = path.join(tempDir, 'list.txt');
    const listContent = videoFiles.map(f => `file '${f.replace(/'/g, "'\\''")}'`).join('\n');
    await fs.writeFile(listFile, listContent);
    tempFiles.push(listFile);

    // Merge videos using FFmpeg
    const outputPath = path.join(tempDir, 'merged.mp4');
    tempFiles.push(outputPath);

    await runFFmpeg([
      '-f', 'concat',
      '-safe', '0',
      '-i', listFile,
      '-c', 'copy',
      outputPath
    ]);

    // Read merged video
    const mergedBuffer = await fs.readFile(outputPath);
    
    // Clean up temp files
    for (const file of tempFiles) {
      try {
        await fs.unlink(file);
      } catch {}
    }
    try {
      await fs.rmdir(tempDir);
    } catch {}

    // Return merged video as base64 (since we can't easily store it)
    const base64Video = mergedBuffer.toString('base64');
    
    return NextResponse.json({
      success: true,
      data: {
        videoBase64: `data:video/mp4;base64,${base64Video}`,
      },
    });
  } catch (error) {
    // Clean up on error
    for (const file of tempFiles) {
      try {
        await fs.unlink(file);
      } catch {}
    }
    
    console.error('Video merge error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to merge videos' 
      },
      { status: 500 }
    );
  }
}
