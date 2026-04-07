import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Trash2, Crown } from 'lucide-react';
import { calcStats, initials, type Bet, type AppState } from '@/lib/betting';

interface Props {
  state: AppState;
  onUpdate: (data: Partial<AppState>) => void;
  onReset: () => void;
  onUpgrade: () => void;
}

export function ProfileScreen({ state, onUpdate, onReset, onUpgrade }: Props) {
  const [name, setName] = useState(state.username);
  const [bankroll, setBankroll] = useState(state.bankroll.toString());
  const [unitSize, setUnitSize] = useState(state.unitSize.toString());
  const [risk, setRisk] = useState(state.riskMode);
  const stats = calcStats(state.bets);

  const save = () => {
    onUpdate({
      username: name,
      bankroll: parseFloat(bankroll) || 2500,
      unitSize: parseFloat(unitSize) || 25,
      riskMode: risk,
    });
  };

  const healthPct = state.bankroll > 0 ? Math.min(100, Math.max(0, 50 + (stats.net * state.unitSize / state.bankroll) * 50)) : 50;
  const wrPct = stats.hitRate !== null ? stats.hitRate : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="w-[52px] h-[52px] rounded-2xl gradient-primary flex items-center justify-center font-display text-xl font-extrabold text-primary-foreground mb-3" style={{ background: 'var(--gradient-avatar)' }}>
          {initials(name)}
        </div>
        <div className="font-display text-[22px] font-extrabold mb-1">{name || 'Your profile'}</div>
        <div className="font-mono text-[11px] text-text-dim mb-4">Set up your bankroll and preferences</div>

        <div className="h-px bg-border my-4" />

        <div className="space-y-3">
          <div>
            <FormLabel>Name / alias</FormLabel>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sean" className="w-full bg-card border border-border rounded-sm p-2.5 text-foreground text-sm outline-none placeholder:text-text-dim focus:border-accent focus:ring-1 focus:ring-accent/20" />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <FormLabel>Bankroll ($)</FormLabel>
              <input value={bankroll} onChange={e => setBankroll(e.target.value)} type="number" placeholder="2500" className="w-full bg-card border border-border rounded-sm p-2.5 text-foreground text-sm outline-none placeholder:text-text-dim focus:border-accent focus:ring-1 focus:ring-accent/20" />
            </div>
            <div>
              <FormLabel>Unit size ($)</FormLabel>
              <input value={unitSize} onChange={e => setUnitSize(e.target.value)} type="number" placeholder="25" className="w-full bg-card border border-border rounded-sm p-2.5 text-foreground text-sm outline-none placeholder:text-text-dim focus:border-accent focus:ring-1 focus:ring-accent/20" />
            </div>
          </div>
          <div>
            <FormLabel>Risk mode</FormLabel>
            <select value={risk} onChange={e => setRisk(e.target.value)} className="w-full bg-card border border-border rounded-sm p-2.5 text-foreground text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/20">
              <option value="chill">Chill (0.25–0.5u stakes)</option>
              <option value="standard">Standard (0.5–1u stakes)</option>
              <option value="aggressive">Aggressive (1–2u stakes)</option>
            </select>
          </div>
          <button onClick={save} className="w-full gradient-primary text-primary-foreground font-display font-bold text-sm py-3 rounded-full glow-green flex items-center justify-center gap-2">
            <Save size={16} /> Save profile
          </button>
        </div>
      </div>

      <SectionLabel>Bankroll health</SectionLabel>
      <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
        <BarGroup label="Bankroll vs start" value={healthPct > 50 ? 'Growing' : healthPct < 50 ? 'Declining' : 'Neutral'} pct={healthPct} />
        <BarGroup label="Win rate (last 30)" value={stats.hitRate !== null ? `${stats.hitRate.toFixed(0)}%` : '–'} pct={wrPct} />
        <div className="h-px bg-border my-3" />
        <div className="flex gap-2 flex-wrap">
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border border-green/40 text-green bg-green/5">Active bettor</span>
          {state.bets.length > 10 && <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border border-accent/40 text-accent bg-accent/5">10+ bets</span>}
        </div>
      </div>

      <button onClick={onUpgrade} className="w-full gradient-premium text-foreground font-display font-bold text-sm py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
        <Crown size={16} /> Upgrade to Pro
      </button>

      <SectionLabel>Danger zone</SectionLabel>
      <div className="bg-surface border border-border rounded-lg p-4">
        <button onClick={onReset} className="bg-red/10 border border-red/30 text-red font-display font-bold text-xs px-4 py-2 rounded-full flex items-center gap-2 hover:bg-red/20 transition-colors">
          <Trash2 size={14} /> Reset all data
        </button>
      </div>
    </motion.div>
  );
}

function BarGroup({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div>
      <div className="flex justify-between font-mono text-[10px] text-text-dim mb-1.5">
        <span>{label}</span><span>{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-card overflow-hidden">
        <div className="h-full rounded-full gradient-primary transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-[10px] text-text-dim uppercase tracking-[0.14em] mt-5 mb-2">{children}</div>;
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="block font-mono text-[10px] text-text-dim uppercase tracking-[0.1em] mb-1">{children}</label>;
}
