import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MicButton } from '@/components/MicButton';
import { ScoreBar } from '@/components/ScoreBar';
import { ListenButtons } from '@/components/ListenButtons';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { aiService } from '@/services/aiService';
import { useAppStore } from '@/store/useAppStore';
import type { Idiom } from '@/types/idiom';
import type { SpeakingScores } from '@/services/speakingEvaluation';
import { buildPrompt, MODE_LABELS, type SpeakingMode } from './prompts';
import { AlertCircle, RotateCcw } from 'lucide-react';

const ERROR_MESSAGES: Record<string, string> = {
  'not-supported': 'Распознавание речи не поддерживается в этом браузере. Попробуйте Chrome на компьютере или Android.',
  'permission-denied': 'Доступ к микрофону запрещён. Разрешите доступ в настройках браузера и попробуйте снова.',
  'no-speech': 'Речь не обнаружена. Попробуйте говорить чуть громче и ближе к микрофону.',
  network: 'Проблема с сетью при распознавании речи. Проверьте подключение к интернету.',
  aborted: 'Запись была прервана.',
  unknown: 'Что-то пошло не так. Попробуйте ещё раз.',
};

export function SpeakingChallenge({ idiom, mode }: { idiom: Idiom; mode: SpeakingMode }) {
  const recordSpeakingAttempt = useAppStore((s) => s.recordSpeakingAttempt);
  const recognition = useSpeechRecognition();
  const recorder = useAudioRecorder();
  const [scores, setScores] = useState<SpeakingScores | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const prompt = useState(() => buildPrompt(mode, idiom))[0];

  async function handleStop() {
    recognition.stop();
  }

  async function handleMicClick() {
    if (recognition.state === 'listening') {
      handleStop();
      return;
    }
    setScores(null);
    recognition.reset();
    recognition.start();
  }

  // Evaluate once recognition finishes with a transcript.
  useEffect(() => {
    if (recognition.state !== 'done' || !recognition.transcript || scores) return;
    let cancelled = false;
    setEvaluating(true);
    aiService.evaluateSpeaking(mode, recognition.transcript, idiom, recognition.confidence).then((result) => {
      if (cancelled) return;
      setScores(result);
      setEvaluating(false);
      recordSpeakingAttempt(idiom.id, mode, recognition.transcript, result);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recognition.state, recognition.transcript]);

  function tryAgain() {
    setScores(null);
    recognition.reset();
    recorder.reset();
  }

  const showFallback = !recognition.supported;

  return (
    <Card className="p-6 md:p-8">
      <div className="text-xs font-bold uppercase text-gray-400 mb-2">{MODE_LABELS[mode]}</div>
      <h2 className="text-xl font-extrabold text-gray-900 mb-1 uppercase tracking-tight">{idiom.idiom}</h2>
      <p className="text-sm text-gray-500 mb-4">{idiom.meaning_en}</p>

      <div className="bg-gray-50 rounded-xl p-4 mb-5">
        <p className="text-xs font-semibold text-gray-400 mb-1">{prompt.instruction}</p>
        <p className="text-gray-800 font-medium">{prompt.display}</p>
      </div>

      <div className="mb-5">
        <ListenButtons text={mode === 'repeat' ? idiom.idiom : idiom.example_sentence} />
      </div>

      {showFallback ? (
        <FallbackRecorder recorder={recorder} />
      ) : (
        <>
          {recognition.error && (
            <div className="mb-4 p-3 rounded-xl bg-[var(--color-danger-light)] flex items-start gap-2 text-sm text-red-800">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              {ERROR_MESSAGES[recognition.error.kind] ?? ERROR_MESSAGES.unknown}
            </div>
          )}

          {!scores && (
            <div className="flex flex-col items-center py-4">
              <MicButton listening={recognition.state === 'listening'} onClick={handleMicClick} disabled={evaluating} />
              {evaluating && <p className="text-sm text-gray-500 mt-4">Анализирую…</p>}
              {recognition.state === 'done' && recognition.transcript && !evaluating && (
                <p className="text-sm text-gray-500 mt-4 italic">Вы сказали: "{recognition.transcript}"</p>
              )}
            </div>
          )}

          {scores && (
            <div className="space-y-5">
              <p className="text-sm text-gray-500 italic">Вы сказали: "{recognition.transcript}"</p>
              <div className="space-y-3">
                <ScoreBar label="Произношение" score={scores.pronunciation} />
                <ScoreBar label="Грамматика" score={scores.grammar} />
                <ScoreBar label="Контекст" score={scores.context} />
                <ScoreBar label="Беглость" score={scores.fluency} />
                <div className="pt-2 border-t border-gray-100">
                  <ScoreBar label="Итог" score={scores.overall} />
                </div>
              </div>
              <div className="bg-[var(--color-primary-light)] rounded-xl p-4 space-y-1">
                {scores.feedback.map((f, i) => (
                  <p key={i} className="text-sm text-[var(--color-primary)] font-medium">{f}</p>
                ))}
              </div>
              <p className="text-xs text-gray-400">
                Оценка основана на распознанном тексте и уверенности браузера в распознавании — это не точный фонетический анализ произношения.
              </p>
              <Button variant="secondary" onClick={tryAgain}><RotateCcw size={16} /> Попробовать снова</Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function FallbackRecorder({ recorder }: { recorder: ReturnType<typeof useAudioRecorder> }) {
  return (
    <div className="flex flex-col items-center py-4 gap-4">
      <p className="text-sm text-gray-500 text-center max-w-sm">
        Автоматическое распознавание речи недоступно в этом браузере. Вы всё равно можете записать себя и прослушать произношение.
      </p>
      {recorder.state === 'unsupported' && <p className="text-sm text-red-600">Запись аудио тоже не поддерживается этим браузером.</p>}
      {recorder.state === 'permission-denied' && <p className="text-sm text-red-600">Доступ к микрофону запрещён.</p>}
      {recorder.audioUrl ? (
        <div className="flex flex-col items-center gap-3">
          <audio controls src={recorder.audioUrl} />
          <Button variant="secondary" size="sm" onClick={recorder.reset}><RotateCcw size={14} /> Записать снова</Button>
        </div>
      ) : (
        <MicButton listening={recorder.state === 'recording'} onClick={recorder.state === 'recording' ? recorder.stop : recorder.start} />
      )}
    </div>
  );
}
