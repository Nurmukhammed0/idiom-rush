// Provider-agnostic AI service abstraction (see spec section 47).
// Today every method is backed by local heuristics so the app works with zero
// external dependencies. To connect a real LLM provider later, implement this
// same interface (e.g. AnthropicAiService) and swap the export at the bottom —
// no calling code changes.
import type { Idiom } from '@/types/idiom';
import { scoreSpeakingAttempt, type SpeakingScores } from './speakingEvaluation';

export interface AiService {
  evaluateSentence(sentence: string, idiom: Idiom): Promise<{ usedCorrectly: boolean; feedback: string }>;
  generateContext(idiom: Idiom): Promise<string>;
  evaluateSpeaking(
    mode: 'repeat' | 'complete' | 'own_sentence' | 'situation' | 'conversation',
    transcript: string,
    idiom: Idiom,
    confidence: number
  ): Promise<SpeakingScores>;
}

class LocalHeuristicAiService implements AiService {
  async evaluateSentence(sentence: string, idiom: Idiom) {
    const lower = sentence.toLowerCase();
    const usedCorrectly = lower.includes(idiom.idiom.toLowerCase());
    return {
      usedCorrectly,
      feedback: usedCorrectly
        ? `Nice, you used "${idiom.idiom}" correctly.`
        : `Try to include the exact phrase "${idiom.idiom}" in your sentence.`,
    };
  }

  async generateContext(idiom: Idiom) {
    return idiom.example_context;
  }

  async evaluateSpeaking(
    mode: 'repeat' | 'complete' | 'own_sentence' | 'situation' | 'conversation',
    transcript: string,
    idiom: Idiom,
    confidence: number
  ) {
    return scoreSpeakingAttempt(mode, transcript, idiom, confidence);
  }
}

export const aiService: AiService = new LocalHeuristicAiService();
