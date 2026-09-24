import { Check, X } from 'lucide-react';

export function AnswerFeedback({ correct, explanation }: { correct: boolean; explanation: string }) {
  return (
    <div
      className={`mt-4 p-4 rounded-xl flex items-start gap-3 ${correct ? 'bg-[var(--color-success-light)]' : 'bg-[var(--color-danger-light)]'}`}
    >
      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${correct ? 'bg-[var(--color-success)]' : 'bg-[var(--color-danger)]'}`}>
        {correct ? <Check size={15} color="white" /> : <X size={15} color="white" />}
      </div>
      <div>
        <div className={`font-bold text-sm ${correct ? 'text-green-800' : 'text-red-800'}`}>{correct ? 'Правильно!' : 'Не совсем'}</div>
        <p className="text-sm text-gray-700 mt-0.5">{explanation}</p>
      </div>
    </div>
  );
}
