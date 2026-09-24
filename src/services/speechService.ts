// Thin wrapper around the browser's Web Speech API.
// Kept as a narrow interface so a professional cloud speech API can replace it later
// without touching any calling code (see docs at the bottom of this file).

export interface TtsOptions {
  rate?: number; // 0.1 - 10, 1 is normal
  pitch?: number;
  lang?: string;
}

class SpeechSynthesisService {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  speak(text: string, options: TtsOptions = {}): Promise<void> {
    if (!this.isSupported()) return Promise.reject(new Error('speech-synthesis-unsupported'));
    return new Promise((resolve, reject) => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate ?? 1;
      utterance.pitch = options.pitch ?? 1;
      utterance.lang = options.lang ?? 'en-US';
      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(e.error);
      window.speechSynthesis.speak(utterance);
    });
  }

  speakSlow(text: string, lang = 'en-US'): Promise<void> {
    return this.speak(text, { rate: 0.6, lang });
  }

  stop(): void {
    if (this.isSupported()) window.speechSynthesis.cancel();
  }
}

export const ttsService = new SpeechSynthesisService();

export type RecognitionErrorKind =
  | 'not-supported'
  | 'permission-denied'
  | 'no-speech'
  | 'network'
  | 'aborted'
  | 'unknown';

export interface RecognitionResult {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

class SpeechRecognitionService {
  private recognition: SpeechRecognitionLike | null = null;
  private listening = false;

  isSupported(): boolean {
    return getRecognitionCtor() !== null;
  }

  isListening(): boolean {
    return this.listening;
  }

  start(
    onResult: (result: RecognitionResult) => void,
    onError: (kind: RecognitionErrorKind, message: string) => void,
    onEnd: () => void,
    lang = 'en-US'
  ): void {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      onError('not-supported', 'Speech recognition is not supported in this browser.');
      return;
    }
    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      this.listening = true;
    };

    recognition.onresult = (event: any) => {
      const result = event.results[0][0];
      onResult({ transcript: result.transcript, confidence: result.confidence ?? 0.8 });
    };

    recognition.onerror = (event: any) => {
      const code = event.error as string;
      const map: Record<string, RecognitionErrorKind> = {
        'not-allowed': 'permission-denied',
        'permission-denied': 'permission-denied',
        'no-speech': 'no-speech',
        network: 'network',
        aborted: 'aborted',
      };
      onError(map[code] ?? 'unknown', code);
    };

    recognition.onend = () => {
      this.listening = false;
      onEnd();
    };

    this.recognition = recognition;
    try {
      recognition.start();
    } catch {
      onError('unknown', 'Could not start recognition.');
    }
  }

  stop(): void {
    this.recognition?.stop();
    this.listening = false;
  }

  abort(): void {
    this.recognition?.abort();
    this.listening = false;
  }
}

export const recognitionService = new SpeechRecognitionService();

/**
 * Architecture note (see spec sections 47-48):
 * ttsService / recognitionService wrap only what the browser can do today.
 * To integrate a professional speech API later, implement the same
 * `speak` / `start(onResult, onError, onEnd)` surface backed by that provider
 * and swap the export — nothing in features/ or pages/ needs to change.
 */
