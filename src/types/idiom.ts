export type CEFRLevel = 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type IdiomCategory =
  | 'Everyday'
  | 'Work'
  | 'Business'
  | 'Education'
  | 'Money'
  | 'Relationships'
  | 'Emotions'
  | 'Communication'
  | 'Success'
  | 'Failure'
  | 'Problems'
  | 'Time'
  | 'Decisions'
  | 'Travel'
  | 'Health'
  | 'Technology'
  | 'Social Life'
  | 'Personality'
  | 'Food'
  | 'Weather'
  | 'Other';

export type Commonness = 'very common' | 'common' | 'moderate' | 'rare';

export interface Idiom {
  id: string;
  idiom: string;
  level: CEFRLevel;
  meaning_en: string;
  meaning_ru: string;
  short_explanation: string;
  example_sentence: string;
  example_context: string;
  category: IdiomCategory;
  pronunciation: string;
  synonyms: string[];
  antonyms: string[];
  commonness: Commonness;
  difficulty: number; // 1-5
  tags: string[];
}

export type MasteryTier = 'NEW' | 'LEARNING' | 'FAMILIAR' | 'GOOD' | 'MASTERED';

export function masteryTier(score: number): MasteryTier {
  if (score >= 80) return 'MASTERED';
  if (score >= 60) return 'GOOD';
  if (score >= 40) return 'FAMILIAR';
  if (score >= 20) return 'LEARNING';
  return 'NEW';
}
