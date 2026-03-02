import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function detectLanguage(text: string): 'id' | 'en' | 'zh' {
  const normalized = (text || '').toLowerCase().trim();

  if (!normalized) {
    return 'en';
  }

  if (/[\u3400-\u9FFF]/.test(normalized)) {
    return 'zh';
  }

  const tokens = normalized.match(/[a-zA-Z']+/g) || [];
  if (tokens.length === 0) {
    return 'en';
  }

  const indonesianWords = new Set([
    'yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'dengan', 'pada', 'ini', 'itu',
    'adalah', 'sebuah', 'saya', 'aku', 'kamu', 'anda', 'kita', 'mereka', 'kami',
    'akan', 'telah', 'sudah', 'belum', 'bisa', 'dapat', 'seperti', 'oleh', 'karena',
    'jadi', 'jika', 'atau', 'tetapi', 'namun', 'sangat', 'lebih', 'banyak', 'semua',
    'ada', 'tidak', 'ga', 'gak', 'nggak', 'iya', 'ya', 'kok', 'aja', 'banget',
    'tolong', 'maaf', 'selamat', 'produk', 'bisnis', 'jual', 'beli', 'harga', 'murah',
    'bagus', 'buat', 'buatkan', 'adegan', 'scene', 'drama', 'video', 'gambar'
  ]);

  const englishWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'to', 'of', 'in', 'on', 'at', 'for', 'with',
    'from', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'this', 'that',
    'these', 'those', 'i', 'you', 'we', 'they', 'he', 'she', 'it', 'my', 'your',
    'our', 'their', 'can', 'could', 'will', 'would', 'should', 'please', 'make',
    'create', 'scene', 'script', 'video', 'image', 'realistic', 'dialogue', 'action'
  ]);

  let idScore = 0;
  let enScore = 0;

  for (const token of tokens) {
    if (indonesianWords.has(token)) {
      idScore += 2;
    }
    if (englishWords.has(token)) {
      enScore += 2;
    }

    if (/^(me|ber|ter|ke|se|pe)[a-z]+/.test(token)) {
      idScore += 0.7;
    }
    if (/(kan|nya|lah|kah|pun)$/.test(token)) {
      idScore += 0.7;
    }

    if (/(ing|ed|tion|ment|ness|able|ous|ive)$/.test(token)) {
      enScore += 0.5;
    }
  }

  if (/(aku|kamu|nggak|gak|ga|banget|aja|dong)/.test(normalized)) {
    idScore += 2;
  }
  if (/(\bi\b|\byou\b|\bthe\b|\bplease\b|\bdon't\b|\bcan't\b)/.test(normalized)) {
    enScore += 1.5;
  }

  if (idScore >= enScore + 1) {
    return 'id';
  }
  if (enScore >= idScore + 1) {
    return 'en';
  }

  if (/(yang|dengan|untuk|tidak|saya|kamu|produk)/.test(normalized)) {
    return 'id';
  }

  return 'en';
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
