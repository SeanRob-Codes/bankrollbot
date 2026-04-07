import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { calcStats, fmtUnits, type Bet } from '@/lib/betting';

interface Props { bets: Bet[] }

export function PerfChart({ bets }: Props) {
  const stats = calcStats(bets);
  const data = stats.curve.length ? stats.curve.map((v, i) => ({ name: `#${i + 1}`, units: v })) : [{ name: 'Start', units: 0 }];

  return (
    <div>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(160,100%,45%)" stopOpacity={0.18} />
                <stop offset="100%" stopColor="hsl(160,100%,45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" hide />
            <YAxis
              tick={{ fill: 'hsl(220,15%,40%)', fontFamily: 'DM Mono', fontSize: 10 }}
              tickFormatter={(v: number) => fmtUnits(v)}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ background: 'hsl(220,28%,10%)', border: '1px solid hsl(160,100%,45%,0.3)', borderRadius: 8, fontFamily: 'DM Mono', fontSize: 11 }}
              labelStyle={{ color: 'hsl(220,15%,55%)' }}
              formatter={(v: number) => [fmtUnits(v), 'Units']}
            />
            <Area type="monotone" dataKey="units" stroke="hsl(160,100%,45%)" strokeWidth={2} fill="url(#greenGrad)" dot={stats.curve.length <= 20} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center font-mono text-[10px] text-text-dim mt-2">
        {stats.curve.length ? `${stats.curve.length} bets tracked (last 30)` : 'Log bets to see your curve'}
      </div>
    </div>
  );
}
