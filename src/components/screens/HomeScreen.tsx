import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { LEAGUES, type Bet } from '@/lib/betting';
import { BetList } from '@/components/BetList';
import { PerfChart } from '@/components/PerfChart';

interface Props {
  bets: Bet[];
  onAddBet: (bet: Omit<Bet, 'id' | 'createdAt' | 'result'>) => void;
  onMarkBet: (id: string, result: 'win' | 'loss') => void;
}

export function HomeScreen({ bets, onAddBet, onMarkBet }: Props) {
  const [league, setLeague] = useState('NBA');
  const [match, setMatch] = useState('');
  const [market, setMarket] = useState('');
  const [odds, setOdds] = useState('');
  const [units, setUnits] = useState('');

  const handleSubmit = () => {
    if (!market.trim()) return;
    onAddBet({
      league,
      match: match.trim(),
      market: market.trim(),
      odds: parseFloat(odds) || -110,
      units: parseFloat(units) || 1,
    });
    setMatch('');
    setMarket('');
    setOdds('');
    setUnits('');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <SectionLabel>Performance chart</SectionLabel>
      <div className="bg-surface border border-border rounded-lg p-4 relative overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-[120px] h-[120px] bg-[radial-gradient(circle,hsl(var(--green)/0.07),transparent_70%)] pointer-events-none" />
        <PerfChart bets={bets} />
      </div>

      <SectionLabel>Log a bet</SectionLabel>
      <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <FormLabel>League</FormLabel>
            <select value={league} onChange={e => setLeague(e.target.value)} className="w-full bg-card border border-border rounded-sm p-2.5 text-foreground font-body text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/20">
              {LEAGUES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <FormLabel>Stake (units)</FormLabel>
            <input value={units} onChange={e => setUnits(e.target.value)} type="number" min="0.1" step="0.1" placeholder="1.0" className="w-full bg-card border border-border rounded-sm p-2.5 text-foreground font-body text-sm outline-none placeholder:text-text-dim focus:border-accent focus:ring-1 focus:ring-accent/20" />
          </div>
        </div>
        <div>
          <FormLabel>Match</FormLabel>
          <input value={match} onChange={e => setMatch(e.target.value)} placeholder="e.g. PHX @ DEN" className="w-full bg-card border border-border rounded-sm p-2.5 text-foreground font-body text-sm outline-none placeholder:text-text-dim focus:border-accent focus:ring-1 focus:ring-accent/20" />
        </div>
        <div>
          <FormLabel>Market / prop</FormLabel>
          <input value={market} onChange={e => setMarket(e.target.value)} placeholder="e.g. Durant o29.5 pts" className="w-full bg-card border border-border rounded-sm p-2.5 text-foreground font-body text-sm outline-none placeholder:text-text-dim focus:border-accent focus:ring-1 focus:ring-accent/20" />
        </div>
        <div>
          <FormLabel>Odds (American)</FormLabel>
          <input value={odds} onChange={e => setOdds(e.target.value)} type="number" placeholder="-110" className="w-full bg-card border border-border rounded-sm p-2.5 text-foreground font-body text-sm outline-none placeholder:text-text-dim focus:border-accent focus:ring-1 focus:ring-accent/20" />
        </div>
        <button onClick={handleSubmit} className="w-full gradient-primary text-primary-foreground font-display font-bold text-sm py-3 rounded-full glow-green hover:shadow-[var(--glow-green-lg)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2">
          <Plus size={16} /> Log bet
        </button>
      </div>

      <SectionLabel>Recent bets</SectionLabel>
      <BetList bets={bets} onMark={onMarkBet} />
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-[10px] text-text-dim uppercase tracking-[0.14em] mt-5 mb-2">{children}</div>;
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="block font-mono text-[10px] text-text-dim uppercase tracking-[0.1em] mb-1">{children}</label>;
}
