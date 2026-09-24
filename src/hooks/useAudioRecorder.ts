import { useCallback, useRef, useState } from 'react';

export type RecorderState = 'idle' | 'recording' | 'stopped' | 'permission-denied' | 'unsupported';

export function useAudioRecorder() {
  const [state, setState] = useState<RecorderState>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setState('unsupported');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setState('recording');
    } catch {
      setState('permission-denied');
    }
  }, []);

  const stop = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setState('stopped');
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setAudioUrl(null);
  }, []);

  return { state, audioUrl, start, stop, reset };
}
