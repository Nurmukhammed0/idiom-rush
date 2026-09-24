import { useEffect, useRef } from 'react';

export function useExerciseTimer(resetKey: unknown) {
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    startRef.current = Date.now();
  }, [resetKey]);

  return () => Date.now() - startRef.current;
}
