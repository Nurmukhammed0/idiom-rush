import type { Idiom } from '@/types/idiom';

// Honest, transcript-level evaluation. We do NOT claim phoneme-level pronunciation
// analysis — the browser's SpeechRecognition API only gives us a text transcript and
// a confidence score, so pronunciation quality is estimated from those two signals
// plus how closely the transcript matches the target idiom's wording.
// See spec sections 9-10 and 48: this module is the swappable "brain" behind
// SpeakingEvaluationService — a professional speech API can replace scoreTranscript()
// without changing any UI code.

export interface SpeakingScores {
  pronunciation: number;
  grammar: number;
  context: number;
  fluency: number;
  overall: number;
  usedIdiom: boolean;
  feedback: string[];
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s']/g, '').replace(/\s+/g, ' ').trim();
}

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na.length && !nb.length) return 1;
  const dist = levenshtein(na, nb);
  return Math.max(0, 1 - dist / Math.max(na.length, nb.length, 1));
}

function containsIdiom(transcript: string, idiom: string): boolean {
  const nt = normalize(transcript);
  const ni = normalize(idiom);
  if (nt.includes(ni)) return true;
  // allow minor inflection differences (e.g. "went the extra mile" vs "go the extra mile")
  const idiomWords = ni.split(' ');
  const coreWords = idiomWords.filter((w) => w.length > 3);
  if (coreWords.length === 0) return nt.includes(ni);
  const hits = coreWords.filter((w) => nt.includes(w)).length;
  return hits / coreWords.length >= 0.8;
}

function wordCount(text: string): number {
  return normalize(text).split(' ').filter(Boolean).length;
}

/**
 * Mode A (Repeat): compare transcript directly against the idiom itself.
 */
export function scoreRepeat(transcript: string, idiom: Idiom, confidence: number): SpeakingScores {
  const sim = similarity(transcript, idiom.idiom);
  const pronunciation = Math.round(Math.min(100, sim * 80 + confidence * 20));
  const usedIdiom = containsIdiom(transcript, idiom.idiom);
  const feedback: string[] = [];
  if (pronunciation >= 80) feedback.push('Great, that matched the target phrase closely.');
  else if (pronunciation >= 50) feedback.push(`Close. Try listening again and repeating "${idiom.idiom}" more slowly.`);
  else feedback.push(`That did not match "${idiom.idiom}" well. Use the Listen button and try again.`);

  return {
    pronunciation,
    grammar: 100,
    context: usedIdiom ? 100 : 30,
    fluency: Math.round(confidence * 100),
    overall: Math.round(pronunciation * 0.6 + (usedIdiom ? 100 : 30) * 0.2 + confidence * 100 * 0.2),
    usedIdiom,
    feedback,
  };
}

/**
 * Modes B-E (complete the sentence / own sentence / situation / conversation):
 * we can't verify grammar or meaning with certainty from a browser transcript alone,
 * so grammar/context are heuristic estimates, clearly labeled as such in the UI.
 */
export function scoreFreeSpeech(transcript: string, idiom: Idiom, confidence: number): SpeakingScores {
  const usedIdiom = containsIdiom(transcript, idiom.idiom);
  const words = wordCount(transcript);
  const feedback: string[] = [];

  // Fluency: recognizer confidence + a reasonable sentence length signal how clearly
  // and continuously the person spoke.
  const lengthScore = Math.min(1, words / 8);
  const fluency = Math.round(Math.min(100, confidence * 70 + lengthScore * 30));

  // Grammar: a light heuristic — real grammar checking needs an LLM/grammar API
  // (see aiService.evaluateSentence for where that would plug in). We check for
  // basic sentence shape: has a verb-like word, reasonable length, not just the idiom alone.
  const hasSubjectLikeStart = /^(i|you|he|she|it|we|they|my|our|his|her|their|the|a|an|this|that)\b/i.test(transcript.trim());
  const notJustTheIdiom = words > wordCount(idiom.idiom) + 1;
  let grammar = 60;
  if (hasSubjectLikeStart) grammar += 20;
  if (notJustTheIdiom) grammar += 20;
  grammar = Math.min(100, grammar);

  const context = usedIdiom ? (notJustTheIdiom ? 90 : 60) : 20;

  // Pronunciation, in the absence of phoneme data, is approximated from recognizer
  // confidence — a low-confidence transcript usually means speech was unclear.
  const pronunciation = Math.round(confidence * 100);

  const overall = Math.round(pronunciation * 0.25 + grammar * 0.25 + context * 0.3 + fluency * 0.2);

  if (!usedIdiom) {
    feedback.push(`Try to include the exact phrase "${idiom.idiom}" in your sentence.`);
  } else if (!notJustTheIdiom) {
    feedback.push('You said the idiom, but try building a full sentence around it.');
  } else {
    feedback.push(`Good use of "${idiom.idiom}" in context.`);
  }
  if (confidence < 0.6) feedback.push('The recording was a little unclear — try speaking closer to the microphone.');
  if (fluency < 60) feedback.push('Try to speak in one continuous flow rather than pausing a lot.');

  return { pronunciation, grammar, context, fluency, overall, usedIdiom, feedback };
}

export function scoreSpeakingAttempt(
  mode: 'repeat' | 'complete' | 'own_sentence' | 'situation' | 'conversation',
  transcript: string,
  idiom: Idiom,
  confidence: number
): SpeakingScores {
  if (mode === 'repeat') return scoreRepeat(transcript, idiom, confidence);
  return scoreFreeSpeech(transcript, idiom, confidence);
}
