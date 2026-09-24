import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { MasteryBadge } from '@/components/MasteryBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { IDIOMS, CATEGORIES, LEVELS, searchIdioms } from '@/data/idiomsRepository';
import { useAppStore } from '@/store/useAppStore';
import { masteryTier } from '@/types/idiom';
import type { MasteryTier } from '@/types/idiom';

const PAGE_SIZE = 48;
const MASTERY_FILTERS: (MasteryTier | 'all')[] = ['all', 'NEW', 'LEARNING', 'FAMILIAR', 'GOOD', 'MASTERED'];
const STATUS_FILTERS = ['all', 'favorites', 'due'] as const;

export default function IdiomsList() {
  const navigate = useNavigate();
  const progress = useAppStore((s) => s.progress);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<string>('all');
  const [category, setCategory] = useState<string>('all');
  const [mastery, setMastery] = useState<MasteryTier | 'all'>('all');
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>('all');
  const [page, setPage] = useState(1);

  const base = useMemo(() => (query.trim() ? searchIdioms(query) : IDIOMS), [query]);

  const filtered = useMemo(() => {
    const now = Date.now();
    return base.filter((idiom) => {
      if (level !== 'all' && idiom.level !== level) return false;
      if (category !== 'all' && idiom.category !== category) return false;
      const p = progress[idiom.id];
      if (mastery !== 'all') {
        const tier = masteryTier(p?.masteryScore ?? 0);
        if (tier !== mastery) return false;
      }
      if (status === 'favorites' && !p?.isFavorite) return false;
      if (status === 'due' && !(p?.nextReview && new Date(p.nextReview).getTime() <= now)) return false;
      return true;
    });
  }, [base, level, category, mastery, status, progress]);

  const visible = filtered.slice(0, page * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Идиомы</h1>
        <p className="text-gray-500 text-sm mt-1">{IDIOMS.length} идиом в базе · найдено {filtered.length}</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder="Поиск: money, work, angry, success..."
          className="focus-ring w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <select value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }} className="focus-ring text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white">
          <option value="all">Все уровни</option>
          {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="focus-ring text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white">
          <option value="all">Все категории</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={mastery} onChange={(e) => { setMastery(e.target.value as any); setPage(1); }} className="focus-ring text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white">
          {MASTERY_FILTERS.map((m) => <option key={m} value={m}>{m === 'all' ? 'Любой уровень освоения' : m}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value as any); setPage(1); }} className="focus-ring text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white">
          <option value="all">Все</option>
          <option value="favorites">Избранное</option>
          <option value="due">На повторение</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🔍" title="Ничего не найдено" description="Попробуйте изменить запрос или фильтры." />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visible.map((idiom) => {
              const p = progress[idiom.id];
              return (
                <Card key={idiom.id} className="p-4" onClick={() => navigate(`/idioms/${idiom.id}`)}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-bold text-gray-900 uppercase text-sm tracking-tight leading-snug">{idiom.idiom}</div>
                    {p?.isFavorite && <Star size={16} className="text-amber-400 fill-amber-400 shrink-0" />}
                  </div>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{idiom.meaning_en}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{idiom.level}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{idiom.category}</span>
                    <span className="ml-auto"><MasteryBadge score={p?.masteryScore ?? 0} showLabel={false} /></span>
                  </div>
                </Card>
              );
            })}
          </div>
          {visible.length < filtered.length && (
            <div className="flex justify-center pt-2">
              <button onClick={() => setPage((p) => p + 1)} className="focus-ring text-sm font-semibold text-[var(--color-primary)] px-4 py-2 rounded-lg hover:bg-[var(--color-primary-light)]">
                Показать ещё ({filtered.length - visible.length})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
