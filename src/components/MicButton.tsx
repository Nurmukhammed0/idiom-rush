import { Mic, Square } from 'lucide-react';

export function MicButton({ listening, onClick, disabled }: { listening: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label={listening ? 'Stop recording' : 'Start recording'}
        className={`focus-ring relative w-24 h-24 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 ${
          listening ? 'bg-[var(--color-danger)]' : 'bg-[var(--color-primary)]'
        }`}
      >
        {listening && (
          <>
            <span className="absolute inset-0 rounded-full bg-[var(--color-danger)] opacity-40 animate-ping" />
            <span className="absolute -inset-3 rounded-full border-2 border-[var(--color-danger)] opacity-30 animate-pulse" />
          </>
        )}
        {listening ? <Square size={28} color="white" fill="white" /> : <Mic size={32} color="white" />}
      </button>
      <span className="text-sm font-semibold text-gray-600">
        {listening ? 'Слушаю…' : 'Нажмите, чтобы говорить'}
      </span>
    </div>
  );
}
