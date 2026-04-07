import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Zap, Share2 } from 'lucide-react';
import { LEAGUES } from '@/lib/betting';
import { BetList } from '@/components/BetList';
import { PerfChart } from '@/components/PerfChart';
import { OddsBoard } from '@/components/OddsBoard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { GameOdds } from '@/hooks/useOdds';

interface Props {
  onGoToAnalyzer: () => void;
}

export function HomeScreen({ onGoToAnalyzer }: Props) {
  const { user, profile } = useAuth();
  const [bets, setBets] = useState<any[]>([]);
  const [league, setLeague] = useState('NBA');
  const [match, setMatch] = useState('');
  const [market, setMarket] = useState('');
  const [odds, setOdds] = useState('');
  const [units, setUnits] = useState('');

  const loadBets = async () => {
    if (!user) return;
    const { data } = await supabase.from('bets').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50);
    if (data) setBets(data);
  };

  useEffect(() => { loadBets(); }, [user]);

  const handleSubmit = async () => {
    if (!market.trim() || !user) return;
    const { error } = await supabase.from('bets').insert({
      user_id: user.id,
      league,
      match: match.trim() || 'TBD',
      market: market.trim(),
      odds: parseFloat(odds) || -110,
      units: parseFloat(units) || 1,
    });
    if (error) { toast.error('Failed to log bet'); return; }
    setMatch(''); setMarket(''); setOdds(''); setUnits('');
    toast.success('Bet logged!');
    loadBets();
  };

  const markBet = async (id: string, result: 'win' | 'loss') => {
    await supabase.from('bets').update({ result }).eq('id', id);
    // Update bet score
    if (result === 'win' && user) {
      const bet = bets.find(b => b.id === id);
      if (bet) {
        const dec = bet.odds > 0 ? 1 + bet.odds / 100 : 1 + 100 / Math.abs(bet.odds);
        const scoreGain = Math.round((dec - 1) * bet.units * 10);
        await supabase.from('profiles').update({ bet_score: (profile?.bet_score || 0) + scoreGain }).eq('id', user.id);
      }
    }
    loadBets();
  };

  const shareBet = async (betId: string) => {
    if (!user) return;
    await supabase.from('social_posts').insert({
      user_id: user.id,
      bet_id: betId,
      caption: '🔥 Check out this pick!',
    });
    toast.success('Bet shared to social!');
  };

  const handleGameSelect = (game: GameOdds, team: string, selectedOdds: number, marketStr: string) => {
    setMatch(`${game.awayTeam} @ ${game.homeTeam}`);
    setMarket(marketStr);
    setOdds(selectedOdds.toString());
  };

  const mappedBets = bets.map(b => ({ ...b, odds: Number(b.odds), units: Number(b.units) }));

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <SectionLabel>Performance</SectionLabel>
      <div className="bg-surface border border-border rounded-xl p-4 relative overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-[120px] h-[120px] bg-[radial-gradient(circle,hsl(var(--green)/0.07),transparent_70%)] pointer-events-none" />
        <PerfChart bets={mappedBets} />
      </div>

      <div className="flex items-center justify-between">
        <SectionLabel>Today's lines</SectionLabel>
        <button onClick={onGoToAnalyzer} className="font-mono text-[9px] text-accent uppercase tracking-wider flex items-center gap-1 hover:underline">
          <Zap size={10} /> AI analyze
        </button>
      </div>
      <OddsBoard onSelectGame={handleGameSelect} />

      <SectionLabel>Quick log</SectionLabel>
      <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <FormLabel>League</FormLabel>
            <select value={league} onChange={e => setLeague(e.target.value)} className="w-full bg-card border border-border rounded-lg p-2.5 text-foreground font-body text-sm outline-none focus:border-accent">
              {LEAGUES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <FormLabel>Stake (units)</FormLabel>
            <input value={units} onChange={e => setUnits(e.target.value)} type="number" min="0.1" step="0.1" placeholder="1.0" className="w-full bg-card border border-border rounded-lg p-2.5 text-foreground font-body text-sm outline-none placeholder:text-text-dim focus:border-accent" />
          </div>
        </div>
        <div>
          <FormLabel>Match</FormLabel>
          <input value={match} onChange={e => setMatch(e.target.value)} placeholder="e.g. PHX @ DEN" className="w-full bg-card border border-border rounded-lg p-2.5 text-foreground font-body text-sm outline-none placeholder:text-text-dim focus:border-accent" />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <FormLabel>Market / prop</FormLabel>
            <input value={market} onChange={e => setMarket(e.target.value)} placeholder="e.g. Durant o29.5" className="w-full bg-card border border-border rounded-lg p-2.5 text-foreground font-body text-sm outline-none placeholder:text-text-dim focus:border-accent" />
          </div>
          <div>
            <FormLabel>Odds</FormLabel>
            <input value={odds} onChange={e => setOdds(e.target.value)} type="number" placeholder="-110" className="w-full bg-card border border-border rounded-lg p-2.5 text-foreground font-body text-sm outline-none placeholder:text-text-dim focus:border-accent" />
          </div>
        </div>
        <button onClick={handleSubmit} className="w-full gradient-primary text-primary-foreground font-display font-bold text-sm py-3 rounded-full glow-green hover:shadow-[var(--glow-green-lg)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2">
          <Plus size={16} /> Log bet
        </button>
      </div>

      <SectionLabel>Recent bets</SectionLabel>
      <div className="space-y-2">
        {mappedBets.slice(0, 20).map(b => (
          <div key={b.id} className="bg-surface border border-border rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">{b.league}</span>
                <span className="text-sm font-display font-bold truncate">{b.market}</span>
              </div>
              <ResultPill result={b.result} />
            </div>
            <div className="text-xs text-muted-foreground mb-2">{b.match}</div>
            <div className="flex items-center justify-between">
              <div className="flex gap-3 font-mono text-[10px] text-text-dim">
                <span>{b.odds > 0 ? '+' : ''}{b.odds}</span>
                <span>{b.units}u</span>
              </div>
              <div className="flex gap-1">
                {b.result === 'pending' && (
                  <>
                    <button onClick={() => markBet(b.id, 'win')} className="font-mono text-[9px] px-2.5 py-1 rounded-full bg-green/10 text-green hover:bg-green/20 transition-colors">W</button>
                    <button onClick={() => markBet(b.id, 'loss')} className="font-mono text-[9px] px-2.5 py-1 rounded-full bg-red/10 text-red hover:bg-red/20 transition-colors">L</button>
                  </>
                )}
                <button onClick={() => shareBet(b.id)} className="font-mono text-[9px] px-2.5 py-1 rounded-full text-text-dim hover:text-accent transition-colors">
                  <Share2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {bets.length === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">No bets logged yet. Tap a game above or log one manually!</div>
        )}
      </div>
    </motion.div>
  );
}

function ResultPill({ result }: { result: string }) {
  if (result === 'win') return <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-green/10 text-green font-bold">W</span>;
  if (result === 'loss') return <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-red/10 text-red font-bold">L</span>;
  return <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-surface-2 text-text-dim">–</span>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-[10px] text-text-dim uppercase tracking-[0.14em] mt-5 mb-2 flex items-center">{children}</div>;
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="block font-mono text-[10px] text-text-dim uppercase tracking-[0.1em] mb-1">{children}</label>;
}
