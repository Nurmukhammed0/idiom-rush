import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Star, Mic } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MasteryBadge } from '@/components/MasteryBadge';
import { ListenButtons } from '@/components/ListenButtons';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { IDIOM_BY_ID } from '@/data/idiomsRepository';
import { useAppStore } from '@/store/useAppStore';

export default function IdiomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const idiom = id ? IDIOM_BY_ID[id] : undefined;
  const progress = useAppStore((s) => (id ? s.progress[id] : undefined));
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const showTranslations = useAppStore((s) => s.stats.showTranslations);
  const learned = (progress?.reviewCount ?? 0) > 0;

  if (!idiom) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Идиома не найдена.</p>
        <Button className="mt-4" onClick={() => navigate('/idioms')}>К списку идиом</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <button onClick={() => navigate(-1)} className="focus-ring flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft size={16} /> Назад
      </button>

      <Card className="p-6 md:p-8">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{idiom.level}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 ml-2">{idiom.category}</span>
          </div>
          <button
            onClick={() => toggleFavorite(idiom.id)}
            aria-label="Add to favorites"
            className="focus-ring p-2 rounded-full hover:bg-amber-50"
          >
            <Star size={22} className={progress?.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
          </button>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 uppercase tracking-tight mb-4">"{idiom.idiom}"</h1>

        <div className="mb-5">
          <MasteryBadge score={progress?.masteryScore ?? 0} />
          <div className="mt-2"><ProgressBar value={progress?.masteryScore ?? 0} /></div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-xs font-bold uppercase text-gray-400 mb-1">Meaning</div>
            <p className="text-gray-800">{idiom.meaning_en}</p>
          </div>

          <div>
            <div className="text-xs font-bold uppercase text-gray-400 mb-1">Example</div>
            <p className="text-gray-800 italic">"{idiom.example_sentence}"</p>
          </div>

          <div>
            <div className="text-xs font-bold uppercase text-gray-400 mb-1">Context</div>
            <p className="text-gray-600 text-sm">{idiom.example_context}</p>
          </div>

          {idiom.synonyms.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase text-gray-400 mb-1">Synonyms</div>
              <p className="text-gray-600 text-sm">{idiom.synonyms.join(', ')}</p>
            </div>
          )}
        </div>

        {showTranslations && (
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="text-xs font-bold uppercase text-[var(--color-primary)] mb-1">Перевод на русский</div>
            <p className="text-gray-800 font-medium">{idiom.meaning_ru}</p>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap items-center gap-3">
          <ListenButtons text={idiom.idiom} />
          {learned && (
            <Button variant="secondary" size="sm" onClick={() => navigate(`/speaking?idiom=${idiom.id}`)}>
              <Mic size={16} /> Практика произношения
            </Button>
          )}
        </div>
      </Card>

      {learned ? (
        <Button fullWidth size="lg" onClick={() => navigate(`/practice?idiom=${idiom.id}`)}>
          Практиковать эту идиому
        </Button>
      ) : (
        <Button fullWidth size="lg" onClick={() => navigate(`/learn?idiom=${idiom.id}`)}>
          Изучить эту идиому
        </Button>
      )}
    </div>
  );
}
