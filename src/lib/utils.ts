import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function detectLanguage(text: string): 'id' | 'en' {
  const indonesianWords = [
    'yang', 'dan', 'di', 'dari', 'untuk', 'dengan', 'pada', 'ini', 'itu',
    'adalah', 'sebuah', 'saya', 'anda', 'kita', 'mereka', 'akan', 'telah',
    'bisa', 'dapat', 'seperti', 'oleh', 'karena', 'jadi', 'jika', 'atau',
    'tetapi', 'namun', 'sangat', 'lebih', 'banyak', 'semua', 'sudah', 'belum',
    'ada', 'tidak', 'ya', 'tolong', 'terima kasih', 'maaf', 'selamat',
    'produk', 'bisnis', 'jual', 'beli', 'harga', 'murah', 'bagus'
  ];
  
  const words = text.toLowerCase().split(/\s+/);
  let indonesianCount = 0;
  
  for (const word of words) {
    if (indonesianWords.includes(word)) {
      indonesianCount++;
    }
  }
  
  const threshold = Math.max(1, words.length * 0.15);
  return indonesianCount >= threshold ? 'id' : 'en';
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const delayMs = baseDelay * Math.pow(2, i);
      await delay(delayMs);
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Return full data URL for browser display (data:image/...;base64,...)
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Helper to extract just base64 string (without data URL prefix) for API calls
export function getBase64String(dataUrl: string): string {
  return dataUrl.split(',')[1] || dataUrl;
}

export function base64ToFile(base64: string, filename: string, mimeType: string): File {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  
  return new File([blob], filename, { type: mimeType });
}
