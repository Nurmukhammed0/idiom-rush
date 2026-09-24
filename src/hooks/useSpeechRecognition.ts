import { useCallback, useState } from 'react';
import { recognitionService, type RecognitionErrorKind } from '@/services/speechService';

export type RecognitionState = 'idle' | 'listening' | 'done' | 'error';

export function useSpeechRecognition() {
  const [state, setState] = useState<RecognitionState>('idle');
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<{ kind: RecognitionErrorKind; message: string } | null>(null);

  const supported = recognitionService.isSupported();

  const start = useCallback(() => {
    setError(null);
    setTranscript('');
    setConfidence(0);
    setState('listening');
    recognitionService.start(
      (result) => {
        setTranscript(result.transcript);
        setConfidence(result.confidence);
      },
      (kind, message) => {
        setError({ kind, message });
        setState('error');
      },
      () => {
        setState((s) => (s === 'listening' ? 'done' : s));
      }
    );
  }, []);

  const stop = useCallback(() => recognitionService.stop(), []);

  const reset = useCallback(() => {
    setState('idle');
    setTranscript('');
    setConfidence(0);
    setError(null);
  }, []);

  return { supported, state, transcript, confidence, error, start, stop, reset };
}
