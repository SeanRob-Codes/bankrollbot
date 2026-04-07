import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import { american2dec, american2imp, LEAGUES } from '@/lib/betting';

interface Props {
  onSendToLog: (data: { league: string; match: string; market: string; odds: number; units: number }) => void;
  isPremium?: boolean;
}

export function AnalyzerScreen({ onSendToLog, isPremium }: Props) {
  const [betText, setBetText] = useState('');
  const [odds, setOdds] = useState('');
  const [prob, setProb] = useState('');
  const [units, setUnits] = useState('');
  const [conf, setConf] = useState('medium');
  const [result, setResult] = useState<null | { ev: number; edge: number; kelly: number; imp: number; isPos: boolean }>(null);

  const runAnalysis = () => {
    const o = parseFloat(odds);
    const p = parseFloat(prob);
    const u = parseFloat(units) || 1;
    if (!betText.trim() || isNaN(o) || isNaN(p) || p < 1 || p > 99) return;

    const imp = american2imp(o);
    const yourP = p / 100;
    const dec = american2dec(o);
    const ev = (yourP * (dec - 1) - (1 - yourP) * 1) * 100;
    const edge = (yourP - imp) * 100;
    const kelly = Math.max(0, ((dec - 1) * yourP - (1 - yourP)) / (dec - 1));

    setResult({ ev, edge, kelly, imp, isPos: ev > 1 });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="bg-gradient-to-br from-accent/5 to-primary/5 border border-accent/15 rounded-lg p-4">
        <div className="font-display text-sm font-bold text-accent mb-1 flex items-center gap-2">
          <Sparkles size={16} /> AI-Powered Analysis
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Enter your bet details and estimated probability for a real EV breakdown with Kelly sizing.
          {!isPremium && <span className="text-amber"> Upgrade to Pro for AI-generated insights.</span>}
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
        <div>
          <FormLabel>Bet details</FormLabel>
          <textarea value={betText} onChange={e => setBetText(e.target.value)} placeholder="e.g. NBA – PHX vs DEN, Durant o29.5 pts at -115" className="w-full bg-card border border-border rounded-sm p-2.5 text-foreground font-body text-sm outline-none placeholder:text-text-dim focus:border-accent focus:ring-1 focus:ring-accent/20 min-h-[80px] resize-y" />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <FormLabel>Odds (American)</FormLabel>
            <input value={odds} onChange={e => setOdds(e.target.value)} type="number" placeholder="-110" className="w-full bg-card border border-border rounded-sm p-2.5 text-foreground font-body text-sm outline-none placeholder:text-text-dim focus:border-accent focus:ring-1 focus:ring-accent/20" />
          </div>
          <div>
            <FormLabel>Your est. chance (%)</FormLabel>
            <input value={prob} onChange={e => setProb(e.target.value)} type="number" min="1" max="99" placeholder="55" className="w-full bg-card border border-border rounded-sm p-2.5 text-foreground font-body text-sm outline-none placeholder:text-text-dim focus:border-accent focus:ring-1 focus:ring-accent/20" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <FormLabel>Stake (units)</FormLabel>
            <input value={units} onChange={e => setUnits(e.target.value)} type="number" step="0.1" placeholder="1.0" className="w-full bg-card border border-border rounded-sm p-2.5 text-foreground font-body text-sm outline-none placeholder:text-text-dim focus:border-accent focus:ring-1 focus:ring-accent/20" />
          </div>
          <div>
            <FormLabel>Confidence</FormLabel>
            <select value={conf} onChange={e => setConf(e.target.value)} className="w-full bg-card border border-border rounded-sm p-2.5 text-foreground font-body text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/20">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <button onClick={runAnalysis} className="w-full gradient-primary text-primary-foreground font-display font-bold text-sm py-3 rounded-full glow-green hover:shadow-[var(--glow-green-lg)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2">
          <Sparkles size={16} /> Run analysis
        </button>

        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
            <div className={`flex items-center gap-3 p-3 rounded-sm border ${result.isPos ? 'bg-green/5 border-green/20' : 'bg-red/5 border-red/20'}`}>
              {result.isPos ? <TrendingUp className="text-green" size={22} /> : <TrendingDown className="text-red" size={22} />}
              <div>
                <div className={`font-display text-sm font-bold ${result.isPos ? 'text-green' : 'text-red'}`}>
                  {result.isPos ? 'Positive expected value' : 'Thin / negative edge'}
                </div>
                <div className="text-[11px] text-muted-foreground font-mono">
                  EV: {result.ev >= 0 ? '+' : ''}{result.ev.toFixed(1)}% · Edge: {result.edge >= 0 ? '+' : ''}{result.edge.toFixed(1)}pp
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <MetricCard label="Implied %" value={`${(result.imp * 100).toFixed(1)}%`} />
              <MetricCard label="Your %" value={`${prob}%`} color="text-accent" />
              <MetricCard label="Kelly stake" value={result.kelly > 0 ? `${(result.kelly * 100).toFixed(1)}%` : '–'} color="text-amber" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  let league = 'Other';
                  const t = betText.toLowerCase();
                  for (const l of LEAGUES) {
                    if (t.includes(l.toLowerCase())) { league = l; break; }
                  }
                  onSendToLog({ league, match: '', market: betText.slice(0, 60), odds: parseFloat(odds), units: parseFloat(units) || 1 });
                }}
                className="flex-1 gradient-primary text-primary-foreground font-display font-bold text-xs py-2 rounded-full"
              >
                Send to log
              </button>
              <button onClick={() => setResult(null)} className="flex-1 bg-surface-2 border border-border text-muted-foreground font-display font-bold text-xs py-2 rounded-full hover:border-primary hover:text-primary transition-colors">
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-card border border-border rounded-sm p-2.5 text-center">
      <div className="font-mono text-[9px] text-text-dim uppercase tracking-[0.1em] mb-1">{label}</div>
      <div className={`font-display text-base font-bold ${color || 'text-foreground'}`}>{value}</div>
    </div>
  );
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="block font-mono text-[10px] text-text-dim uppercase tracking-[0.1em] mb-1">{children}</label>;
}
