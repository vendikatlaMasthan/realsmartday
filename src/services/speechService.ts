// SmartDay Speech Service (Voice-to-Text & Text-to-Speech)
// Web Speech API wrapper with full browser support detection, event lifecycle,
// interim transcription handling, and cross-platform safety.

export interface SpeechRecognitionLanguage {
  code: string;
  name: string;
  flag: string;
}

export const SUPPORTED_SPEECH_LANGUAGES: SpeechRecognitionLanguage[] = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', flag: '🇩🇪' },
  { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
  { code: 'te-IN', name: 'Telugu', flag: '🇮🇳' },
  { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh-CN', name: 'Chinese (Mandarin)', flag: '🇨🇳' },
];

export interface VoiceOption {
  name: string;
  lang: string;
  voiceURI: string;
  default: boolean;
}

// Check Web Speech Recognition support
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

// Check Speech Synthesis support
export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

/**
 * Voice-to-Text Controller class
 */
export class SpeechRecognitionController {
  private recognition: any = null;
  private isListening = false;
  private onFinalResultCallback?: (finalText: string) => void;
  private onInterimResultCallback?: (interimText: string) => void;
  private onErrorCallback?: (errorMessage: string) => void;
  private onStateChangeCallback?: (listening: boolean) => void;

  constructor() {
    if (isSpeechRecognitionSupported()) {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      this.setupHandlers();
    }
  }

  private setupHandlers() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.onStateChangeCallback?.(true);
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        const transcript = item[0]?.transcript || '';
        if (item.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript.trim()) {
        this.onFinalResultCallback?.(finalTranscript.trim());
      }
      this.onInterimResultCallback?.(interimTranscript);
    };

    this.recognition.onerror = (event: any) => {
      let message = 'An error occurred during speech recognition.';
      switch (event.error) {
        case 'not-allowed':
          message = 'Microphone permission was denied. Please allow microphone access in your browser settings.';
          break;
        case 'no-speech':
          message = 'No speech was detected. Please try speaking closer to the microphone.';
          break;
        case 'audio-capture':
          message = 'No microphone was found on this device.';
          break;
        case 'network':
          message = 'Network error during speech recognition. Please check your internet connection.';
          break;
        default:
          message = `Speech recognition error: ${event.error || 'unknown'}`;
      }
      this.onErrorCallback?.(message);
      this.stop();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.onStateChangeCallback?.(false);
      this.onInterimResultCallback?.('');
    };
  }

  public async start(options: {
    lang?: string;
    onFinalResult: (finalText: string) => void;
    onInterimResult?: (interimText: string) => void;
    onError?: (errorMessage: string) => void;
    onStateChange?: (listening: boolean) => void;
  }): Promise<boolean> {
    if (!isSpeechRecognitionSupported() || !this.recognition) {
      options.onError?.(
        'Speech recognition is not supported in this runtime. You can type your note directly or use the microphone key on your Android keyboard.'
      );
      return false;
    }

    // Stop any active text-to-speech first so mic doesn't transcribe it
    stopReading();

    this.onFinalResultCallback = options.onFinalResult;
    this.onInterimResultCallback = options.onInterimResult;
    this.onErrorCallback = options.onError;
    this.onStateChangeCallback = options.onStateChange;

    this.recognition.lang = options.lang || 'en-US';

    try {
      this.recognition.start();
      return true;
    } catch (e: any) {
      // If already started, ignore or restart
      if (e.name === 'InvalidStateError') {
        this.stop();
        setTimeout(() => {
          try {
            this.recognition.start();
          } catch {
            // ignore
          }
        }, 150);
        return true;
      }
      this.onErrorCallback?.('Failed to start speech recognition: ' + (e.message || 'Unknown error'));
      return false;
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
    this.isListening = false;
    this.onStateChangeCallback?.(false);
    this.onInterimResultCallback?.('');
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

// Global active controller instance
let activeRecognitionController: SpeechRecognitionController | null = null;

export function getSpeechRecognition(): SpeechRecognitionController {
  if (!activeRecognitionController) {
    activeRecognitionController = new SpeechRecognitionController();
  }
  return activeRecognitionController;
}

/**
 * Text-to-Speech (TTS) Manager
 */
export type TTSStatus = 'idle' | 'speaking' | 'paused' | 'stopped';

let currentUtterance: SpeechSynthesisUtterance | null = null;
let currentStatusListener: ((status: TTSStatus) => void) | null = null;

export function getAvailableVoices(): VoiceOption[] {
  if (!isSpeechSynthesisSupported()) return [];
  const voices = window.speechSynthesis.getVoices();
  return voices.map((v) => ({
    name: v.name,
    lang: v.lang,
    voiceURI: v.voiceURI,
    default: v.default,
  }));
}

export function subscribeToVoices(onVoicesChanged: (voices: VoiceOption[]) => void): () => void {
  if (!isSpeechSynthesisSupported()) return () => {};

  const handler = () => {
    onVoicesChanged(getAvailableVoices());
  };

  if ('onvoiceschanged' in window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = handler;
  }

  // initial load
  const initial = getAvailableVoices();
  if (initial.length > 0) {
    onVoicesChanged(initial);
  }

  return () => {
    if (isSpeechSynthesisSupported() && 'onvoiceschanged' in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = null;
    }
  };
}

export interface ReadNoteOptions {
  text: string;
  lang?: string;
  rate?: number; // 0.75 to 2.0
  pitch?: number;
  voiceURI?: string;
  onStatusChange?: (status: TTSStatus) => void;
  onError?: (error: string) => void;
}

export function readNote(options: ReadNoteOptions): { ok: boolean; error?: string } {
  if (!isSpeechSynthesisSupported()) {
    return { ok: false, error: 'Read Aloud is not supported on this device/browser.' };
  }

  const cleanText = options.text.trim();
  if (!cleanText) {
    return { ok: false, error: 'Note is empty. Add some text first.' };
  }

  // Stop any active recognition to prevent recording our own speech
  if (activeRecognitionController && activeRecognitionController.getIsListening()) {
    activeRecognitionController.stop();
  }

  // Cancel any currently playing speech
  stopReading();

  currentStatusListener = options.onStatusChange || null;

  try {
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = options.lang || 'en-US';
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;

    if (options.voiceURI) {
      const voices = window.speechSynthesis.getVoices();
      const matched = voices.find((v) => v.voiceURI === options.voiceURI);
      if (matched) {
        utterance.voice = matched;
      }
    }

    utterance.onstart = () => {
      currentStatusListener?.('speaking');
    };

    utterance.onpause = () => {
      currentStatusListener?.('paused');
    };

    utterance.onresume = () => {
      currentStatusListener?.('speaking');
    };

    utterance.onend = () => {
      currentStatusListener?.('idle');
      currentUtterance = null;
    };

    utterance.onerror = (e) => {
      if (e.error === 'canceled' || e.error === 'interrupted') {
        currentStatusListener?.('idle');
      } else {
        options.onError?.(`Playback error: ${e.error}`);
        currentStatusListener?.('idle');
      }
      currentUtterance = null;
    };

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message || 'Speech synthesis failed' };
  }
}

export function pauseReading() {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.pause();
    currentStatusListener?.('paused');
  }
}

export function resumeReading() {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.resume();
    currentStatusListener?.('speaking');
  }
}

export function stopReading() {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
    currentStatusListener?.('idle');
    currentUtterance = null;
  }
}
