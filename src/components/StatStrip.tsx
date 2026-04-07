import { calcStats, fmtDollar, fmtUnits, type Bet } from '@/lib/betting';

interface Props {
  bankroll: number;
  unitSize: number;
  bets: Bet[];
}

export function StatStrip({ bankroll, unitSize, bets }: Props) {
  const stats = calcStats(bets);

  return (
    <div className="grid grid-cols-3 gap-2.5 px-5 mb-4">
      <StatCard label="Bankroll" value={`$${bankroll.toFixed(0)}`} sub={`1u=$${unitSize}`} />
      <StatCard
        label="Hit Rate"
        value={stats.hitRate !== null ? `${stats.hitRate.toFixed(1)}%` : '–'}
        sub={`${stats.wins}W/${stats.losses}L`}
        color={stats.hitRate !== null && stats.hitRate >= 52 ? 'green' : stats.hitRate !== null && stats.hitRate < 45 ? 'red' : undefined}
      />
      <StatCard
        label="Net Units"
        value={fmtUnits(stats.net)}
        sub={`${fmtDollar(stats.net * unitSize)} drift`}
        color={stats.net > 0 ? 'green' : stats.net < 0 ? 'red' : undefined}
      />
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color?: 'green' | 'red' }) {
  const colorClass = color === 'green' ? 'text-green' : color === 'red' ? 'text-red' : 'text-foreground';
  return (
    <div className="bg-surface border border-border rounded-sm p-3 relative overflow-hidden group transition-colors hover:border-primary/30">
      <div className="absolute top-0 left-0 right-0 h-0.5 gradient-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="font-mono text-[9px] text-text-dim uppercase tracking-[0.12em] mb-1">{label}</div>
      <div className={`font-display text-xl font-bold leading-none ${colorClass}`}>{value}</div>
      <div className="text-[10px] text-text-dim font-mono mt-1">{sub}</div>
    </div>
  );
}
