import { useState } from 'react';
import { Volume2, Volume1 } from 'lucide-react';
import { ttsService } from '@/services/speechService';
import { Button } from '@/components/ui/Button';

export function ListenButtons({ text }: { text: string }) {
  const [playing, setPlaying] = useState<'normal' | 'slow' | null>(null);
  const supported = ttsService.isSupported();

  async function play(speed: 'normal' | 'slow') {
    if (!supported) return;
    setPlaying(speed);
    try {
      if (speed === 'normal') await ttsService.speak(text);
      else await ttsService.speakSlow(text);
    } finally {
      setPlaying(null);
    }
  }

  if (!supported) {
    return <p className="text-xs text-gray-400">Синтез речи не поддерживается в этом браузере.</p>;
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="sm" onClick={() => play('normal')} disabled={playing !== null}>
        <Volume2 size={16} /> {playing === 'normal' ? 'Играет…' : 'Слушать'}
      </Button>
      <Button variant="secondary" size="sm" onClick={() => play('slow')} disabled={playing !== null}>
        <Volume1 size={16} /> {playing === 'slow' ? 'Играет…' : 'Медленно'}
      </Button>
    </div>
  );
}
