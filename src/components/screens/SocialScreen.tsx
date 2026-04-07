import { useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, Send, Users, Trophy, Share2 } from 'lucide-react';
import { LEAGUES, type CommunityPick } from '@/lib/betting';

interface Props {
  picks: CommunityPick[];
  onAddPick: (pick: Omit<CommunityPick, 'id' | 'createdAt' | 'votes' | 'voted'>) => void;
  onVote: (id: string) => void;
  username: string;
}

const mockLeaderboard = [
  { name: 'SharpShooter', record: '34-18', roi: '+14.2%', rank: 1 },
  { name: 'TheOracle', record: '29-15', roi: '+11.8%', rank: 2 },
  { name: 'BankrollKing', record: '41-26', roi: '+9.3%', rank: 3 },
  { name: 'StatsMaster', record: '22-14', roi: '+8.1%', rank: 4 },
];

export function SocialScreen({ picks, onAddPick, onVote, username }: Props) {
  const [pick, setPick] = useState('');
  const [note, setNote] = useState('');
  const [league, setLeague] = useState('NBA');

  const submit = () => {
    if (!pick.trim()) return;
    onAddPick({ user: username || 'Anonymous', pick: pick.trim(), note: note.trim(), league });
    setPick('');
    setNote('');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Leaderboard */}
      <SectionLabel><Trophy size={12} className="mr-1.5" /> Leaderboard</SectionLabel>
      <div className="bg-gradient-to-br from-purple/5 to-accent/5 border border-purple/15 rounded-lg overflow-hidden">
        {mockLeaderboard.map((u, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border-b border-border last:border-b-0">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-display font-bold text-xs
              ${i === 0 ? 'gradient-primary text-primary-foreground' : i === 1 ? 'bg-accent/20 text-accent' : 'bg-surface-2 text-muted-foreground'}`}>
              {u.rank}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{u.name}</div>
              <div className="font-mono text-[10px] text-text-dim">{u.record}</div>
            </div>
            <div className="text-green font-mono text-xs font-medium">{u.roi}</div>
          </div>
        ))}
      </div>

      {/* Picks feed */}
      <SectionLabel><Users size={12} className="mr-1.5" /> Community picks</SectionLabel>
      <div className="bg-surface border border-border rounded-lg">
        {picks.length === 0 && (
          <div className="p-8 text-center text-text-dim text-xs">
            <div className="text-3xl mb-2">📡</div>
            No picks shared yet — be the first!
          </div>
        )}
        {[...picks].reverse().map(p => (
          <div key={p.id} className="p-3.5 border-b border-border last:border-b-0">
            <div className="flex justify-between items-start gap-2 mb-1">
              <div className="font-medium text-sm">{p.pick}</div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground">{p.league}</span>
            </div>
            <div className="font-mono text-[10px] text-text-dim mb-1.5">@{p.user}</div>
            {p.note && <div className="text-xs text-muted-foreground mb-2">{p.note}</div>}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onVote(p.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-mono text-[11px] transition-colors
                  ${p.voted ? 'border-green text-green bg-green/10' : 'border-border text-text-dim hover:border-green hover:text-green'}`}
              >
                <ThumbsUp size={12} /> {p.votes}
              </button>
              <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border text-text-dim font-mono text-[11px] hover:border-accent hover:text-accent transition-colors">
                <Share2 size={12} /> Share
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add pick */}
      <SectionLabel>Share your pick</SectionLabel>
      <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2.5">
          <div className="col-span-2">
            <FormLabel>Pick</FormLabel>
            <input value={pick} onChange={e => setPick(e.target.value)} placeholder="e.g. NBA · HOU +6.5 vs LAL" className="w-full bg-card border border-border rounded-sm p-2.5 text-foreground text-sm outline-none placeholder:text-text-dim focus:border-accent focus:ring-1 focus:ring-accent/20" />
          </div>
          <div>
            <FormLabel>League</FormLabel>
            <select value={league} onChange={e => setLeague(e.target.value)} className="w-full bg-card border border-border rounded-sm p-2.5 text-foreground text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/20">
              {LEAGUES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div>
          <FormLabel>Your reasoning</FormLabel>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Why you like it" className="w-full bg-card border border-border rounded-sm p-2.5 text-foreground text-sm outline-none placeholder:text-text-dim focus:border-accent focus:ring-1 focus:ring-accent/20" />
        </div>
        <button onClick={submit} className="gradient-primary text-primary-foreground font-display font-bold text-xs px-5 py-2.5 rounded-full flex items-center gap-2">
          <Send size={14} /> Post pick
        </button>
      </div>
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-[10px] text-text-dim uppercase tracking-[0.14em] mt-5 mb-2 flex items-center">{children}</div>;
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="block font-mono text-[10px] text-text-dim uppercase tracking-[0.1em] mb-1">{children}</label>;
}
