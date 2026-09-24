import type { Idiom, IdiomCategory } from '@/types/idiom';

const CATEGORY_INTRO: Record<IdiomCategory, string> = {
  Everyday: 'It\'s an ordinary day, and',
  Work: 'You\'re at the office when',
  Business: 'In a meeting with investors,',
  Education: 'Back in class,',
  Money: 'Looking at your bank account,',
  Relationships: 'Talking with someone close to you,',
  Emotions: 'Right now, you feel like',
  Communication: 'Mid-conversation, you realize',
  Success: 'After months of effort,',
  Failure: 'After things went wrong,',
  Problems: 'Right in the middle of a mess,',
  Time: 'Watching the clock,',
  Decisions: 'Standing at a crossroads,',
  Travel: 'Halfway through a trip,',
  Health: 'Feeling off today,',
  Technology: 'Staring at your screen,',
  'Social Life': 'At a get-together with friends,',
  Personality: 'Everyone who knows them agrees:',
  Food: 'Around the dinner table,',
  Weather: 'Watching the sky change,',
  Other: 'Out of nowhere,',
};

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function meaningAsClause(meaning: string): string {
  const m = meaning.trim().replace(/\.$/, '');
  if (/^to\s/i.test(m)) return lowerFirst(m.replace(/^to\s/i, ''));
  if (/^(a|an)\s/i.test(m)) return `you notice ${lowerFirst(m)}`;
  return lowerFirst(m);
}

/**
 * Builds a short, concrete "imagine this" scene for an idiom, without naming the idiom
 * itself — the learner should recognize the situation and connect it to what they just
 * learned, the way the spec's example works ("You missed a train but met your future boss").
 */
export function buildMiniScene(idiom: Idiom): string {
  const intro = CATEGORY_INTRO[idiom.category] ?? CATEGORY_INTRO.Other;
  return `${intro} you ${meaningAsClause(idiom.meaning_en)}.`;
}
