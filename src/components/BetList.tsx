import type { Bet } from '@/lib/betting';

interface Props {
  bets: Bet[];
  onMark: (id: string, result: 'win' | 'loss') => void;
}

export function BetList({ bets, onMark }: Props) {
  const reversed = [...bets].reverse();

  if (!reversed.length) {
    return (
      <div className="bg-surface border border-border rounded-lg p-8 text-center">
        <div className="text-3xl mb-2">📋</div>
        <div className="text-text-dim text-xs">No bets logged yet</div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg divide-y divide-border">
      {reversed.map(b => (
        <div key={b.id} className="flex gap-2.5 items-start p-3">
          <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{b.league} – {b.market || 'Bet'}</div>
            <div className="font-mono text-[10px] text-text-dim flex gap-2 flex-wrap">
              <span>{b.match || '–'}</span>
              <span>Odds: {b.odds}</span>
              <span>{b.units.toFixed(1)}u</span>
            </div>
          </div>
          <div className="flex gap-1 items-center flex-shrink-0">
            <ResultPill result={b.result} />
            <button onClick={() => onMark(b.id, 'win')} className="px-2 py-1 rounded-full border border-border bg-card font-mono text-[10px] text-text-dim hover:border-green hover:text-green transition-colors">W</button>
            <button onClick={() => onMark(b.id, 'loss')} className="px-2 py-1 rounded-full border border-border bg-card font-mono text-[10px] text-text-dim hover:border-red hover:text-red transition-colors">L</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ResultPill({ result }: { result: string }) {
  const cls = result === 'win'
    ? 'border-green/50 text-green bg-green/10'
    : result === 'loss'
    ? 'border-red/50 text-red bg-red/10'
    : 'border-border text-text-dim';
  return (
    <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${cls}`}>
      {result === 'win' ? 'W' : result === 'loss' ? 'L' : '–'}
    </span>
  );
}
