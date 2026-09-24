import { useNavigate } from 'react-router-dom';
import { Mic, RotateCcw, TrendingUp, Calendar, BookOpen, Brain } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const FEATURES = [
  { icon: BookOpen, title: '1,000 идиом', text: 'Реальные, часто используемые выражения — от повседневных до бизнес-английского.' },
  { icon: Mic, title: 'Речевая практика', text: 'Говорите вслух и получайте оценку произношения, грамматики и уместности.' },
  { icon: RotateCcw, title: 'Интервальное повторение', text: 'Система сама решает, что и когда повторять, чтобы вы не забывали.' },
  { icon: TrendingUp, title: 'Отслеживание прогресса', text: 'Наглядная аналитика: слабые места, точность, скорость ответов.' },
  { icon: Calendar, title: 'Ежедневные испытания', text: '10 идиом в день — микс упражнений, который держит тонус.' },
  { icon: Brain, title: 'Активное вспоминание', text: 'Никаких пассивных карточек — только практика, которая реально запоминается.' },
];

const STEPS = [
  { n: '1', title: 'Изучайте', text: 'Знакомьтесь с новой идиомой, её значением и живым примером.' },
  { n: '2', title: 'Практикуйтесь', text: 'Проходите разные типы упражнений на понимание и вспоминание.' },
  { n: '3', title: 'Говорите', text: 'Используйте идиому вслух в собственном предложении.' },
  { n: '4', title: 'Повторяйте', text: 'Возвращайтесь к идиоме по расписанию, пока не освоите её.' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <header className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <Logo size={30} />
        <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>Войти в демо</Button>
      </header>

      <section className="max-w-4xl mx-auto px-6 pt-12 pb-20 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
          IDIOM RUSH
        </h1>
        <p className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-3">
          Don't just learn idioms.<br />Use them.
        </p>
        <p className="text-gray-500 mt-5 max-w-xl mx-auto text-lg">
          Освойте 1 000 реальных английских идиом через активное вспоминание, контекст и речевую практику.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <Button size="lg" onClick={() => navigate('/onboarding')}>Start Learning</Button>
          <Button size="lg" variant="secondary" onClick={() => navigate('/idioms')}>Explore Idioms</Button>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-10">Как это работает</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {STEPS.map((s) => (
            <Card key={s.n} className="p-5">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white font-bold flex items-center justify-center text-sm mb-3">{s.n}</div>
              <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <Card key={f.title} className="p-6">
              <div className="w-11 h-11 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center mb-4">
                <f.icon size={22} />
              </div>
              <h3 className="font-bold text-gray-900 mb-1.5">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <Card className="p-10">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Готовы начать?</h2>
          <p className="text-gray-500 mb-6">Пройдите быстрый опрос, и мы составим для вас план обучения.</p>
          <Button size="lg" onClick={() => navigate('/onboarding')}>Start Learning</Button>
        </Card>
      </section>

      <footer className="text-center text-xs text-gray-400 pb-8">Idiom Rush — Learn. Speak. Remember.</footer>
    </div>
  );
}
