import type { Idiom } from '@/types/idiom';
import { buildFillGap } from '@/features/practice/exercises/fillGapUtils';

export type SpeakingMode = 'repeat' | 'complete' | 'own_sentence' | 'situation' | 'conversation';

export const MODE_LABELS: Record<SpeakingMode, string> = {
  repeat: 'Повторите',
  complete: 'Закончите предложение',
  own_sentence: 'Составьте своё предложение',
  situation: 'Ответьте на ситуацию',
  conversation: 'Разговорная практика',
};

const SITUATIONS = [
  (idiom: Idiom) => `Your colleague just helped you solve a difficult problem at work. Respond naturally, ideally using "${idiom.idiom}".`,
  (idiom: Idiom) => `A friend asks how your week has been. Answer them, and try to use "${idiom.idiom}" naturally.`,
  (idiom: Idiom) => `Someone asks for advice about a tough decision. Reply using "${idiom.idiom}" if it fits.`,
  (idiom: Idiom) => `You're catching up with an old friend about a recent change in your life. Use "${idiom.idiom}" in your response.`,
];

export function buildPrompt(mode: SpeakingMode, idiom: Idiom): { instruction: string; display: string } {
  switch (mode) {
    case 'repeat':
      return { instruction: 'Listen to the idiom, then repeat it as clearly as you can.', display: idiom.idiom };
    case 'complete': {
      const { gappedSentence } = buildFillGap(idiom.idiom, idiom.example_sentence);
      return { instruction: 'Say the missing words to complete the sentence.', display: gappedSentence };
    }
    case 'own_sentence':
      return { instruction: `Use "${idiom.idiom}" in your own original sentence.`, display: `"${idiom.idiom}" — ${idiom.meaning_en}` };
    case 'situation':
    case 'conversation': {
      const template = SITUATIONS[Math.floor(Math.random() * SITUATIONS.length)];
      return { instruction: 'Respond out loud to the situation below.', display: template(idiom) };
    }
  }
}
