import type { Idiom, IdiomCategory, CEFRLevel } from '@/types/idiom';
import raw from './idioms.json';

export const IDIOMS: Idiom[] = raw as Idiom[];

export const IDIOM_BY_ID: Record<string, Idiom> = Object.fromEntries(IDIOMS.map((i) => [i.id, i]));

export const CATEGORIES: IdiomCategory[] = [
  'Everyday', 'Work', 'Business', 'Education', 'Money', 'Relationships', 'Emotions',
  'Communication', 'Success', 'Failure', 'Problems', 'Time', 'Decisions', 'Travel',
  'Health', 'Technology', 'Social Life', 'Personality', 'Food', 'Weather', 'Other',
];

export const LEVELS: CEFRLevel[] = ['A2', 'B1', 'B2', 'C1', 'C2'];

export function searchIdioms(query: string): Idiom[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return IDIOMS.filter((idiom) =>
    idiom.idiom.toLowerCase().includes(q) ||
    idiom.meaning_en.toLowerCase().includes(q) ||
    idiom.meaning_ru.toLowerCase().includes(q) ||
    idiom.category.toLowerCase().includes(q) ||
    idiom.tags.some((t) => t.toLowerCase().includes(q))
  ).slice(0, 100);
}

export interface IdiomFilters {
  level?: CEFRLevel | 'all';
  category?: IdiomCategory | 'all';
}

export function filterIdioms(idioms: Idiom[], filters: IdiomFilters): Idiom[] {
  return idioms.filter((idiom) => {
    if (filters.level && filters.level !== 'all' && idiom.level !== filters.level) return false;
    if (filters.category && filters.category !== 'all' && idiom.category !== filters.category) return false;
    return true;
  });
}

export function getRandomIdioms(count: number, excludeIds: Set<string> = new Set()): Idiom[] {
  const pool = IDIOMS.filter((i) => !excludeIds.has(i.id));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getDistractors(target: Idiom, count: number): Idiom[] {
  const sameCategory = IDIOMS.filter((i) => i.id !== target.id && i.category === target.category);
  const pool = sameCategory.length >= count ? sameCategory : IDIOMS.filter((i) => i.id !== target.id);
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}
