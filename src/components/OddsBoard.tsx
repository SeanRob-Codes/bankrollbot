import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronRight, Zap } from 'lucide-react';
import { useOdds, type GameOdds } from '@/hooks/useOdds';
import { LEAGUES } from '@/lib/betting';

interface Props {
  onSelectGame: (game: GameOdds, team: string, odds: number, market: string) => void;
}

export function OddsBoard({ onSelectGame }: Props) {
  const [league, setLeague] = useState('NBA');
  const { games, loading, source, refresh } = useOdds(league);

  return (
    <div className="space-y-3">
      {/* League pills — PrizePicks style */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {['NBA', 'NFL', 'MLB', 'NHL', 'WNBA', 'MMA'].map(l => (
          <button
            key={l}
            onClick={() => setLeague(l)}
            className={`px-3.5 py-1.5 rounded-full font-display text-xs font-bold whitespace-nowrap transition-all
              ${league === l ? 'gradient-primary text-primary-foreground glow-green' : 'bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-primary/30'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Source badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {source === 'live' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-green animate-pulse-dot" />}
          <span className="font-mono text-[9px] text-text-dim uppercase tracking-wider">
            {source === 'live' ? 'Live odds' : 'Sample lines'} · {games.length} games
          </span>
        </div>
        <button onClick={refresh} className="font-mono text-[9px] text-accent uppercase tracking-wider hover:underline">
          Refresh
        </button>
      </div>

      {/* Games */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-surface border border-border rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-card rounded w-2/3 mb-3" />
              <div className="h-8 bg-card rounded w-full" />
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={league}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-2.5"
          >
            {games.map(game => (
              <GameCard key={game.id} game={game} onSelect={onSelectGame} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function GameCard({ game, onSelect }: { game: GameOdds; onSelect: Props['onSelectGame'] }) {
  const startDate = new Date(game.startTime);
  const timeStr = startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const dateStr = startDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

  // Get best odds from first bookmaker
  const mainBook = game.bookmakers?.[0];
  const h2h = mainBook?.markets?.find(m => m.key === 'h2h');
  const spreads = mainBook?.markets?.find(m => m.key === 'spreads');

  const homeH2H = h2h?.outcomes?.find(o => o.name === game.homeTeam);
  const awayH2H = h2h?.outcomes?.find(o => o.name === game.awayTeam);
  const homeSpread = spreads?.outcomes?.find(o => o.name === game.homeTeam);
  const awaySpread = spreads?.outcomes?.find(o => o.name === game.awayTeam);

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden hover:border-primary/20 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-border">
        <div className="flex items-center gap-1.5">
          <Clock size={11} className="text-text-dim" />
          <span className="font-mono text-[10px] text-text-dim">{dateStr} · {timeStr}</span>
        </div>
        <span className="font-mono text-[9px] text-text-dim uppercase">{mainBook?.title || 'Odds'}</span>
      </div>

      {/* Teams + Odds grid — DraftKings style */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-0">
        {/* Away team row */}
        <div className="px-3.5 py-2.5 flex items-center">
          <span className="text-sm font-medium truncate">{game.awayTeam}</span>
        </div>
        <OddsCell
          label={awaySpread ? `${awaySpread.point! > 0 ? '+' : ''}${awaySpread.point}` : ''}
          odds={awaySpread?.price}
          onClick={() => awaySpread && onSelect(game, game.awayTeam, awaySpread.price, `${game.awayTeam} ${awaySpread.point! > 0 ? '+' : ''}${awaySpread.point}`)}
        />
        <OddsCell
          label="ML"
          odds={awayH2H?.price}
          onClick={() => awayH2H && onSelect(game, game.awayTeam, awayH2H.price, `${game.awayTeam} ML`)}
        />

        {/* Home team row */}
        <div className="px-3.5 py-2.5 flex items-center border-t border-border">
          <span className="text-sm font-medium truncate">{game.homeTeam}</span>
        </div>
        <OddsCell
          label={homeSpread ? `${homeSpread.point! > 0 ? '+' : ''}${homeSpread.point}` : ''}
          odds={homeSpread?.price}
          onClick={() => homeSpread && onSelect(game, game.homeTeam, homeSpread.price, `${game.homeTeam} ${homeSpread.point! > 0 ? '+' : ''}${homeSpread.point}`)}
          border
        />
        <OddsCell
          label="ML"
          odds={homeH2H?.price}
          onClick={() => homeH2H && onSelect(game, game.homeTeam, homeH2H.price, `${game.homeTeam} ML`)}
          border
        />
      </div>

      {/* Compare odds */}
      {game.bookmakers.length > 1 && (
        <button className="w-full px-3.5 py-1.5 border-t border-border flex items-center justify-center gap-1 text-accent font-mono text-[9px] uppercase tracking-wider hover:bg-accent/5 transition-colors">
          <Zap size={10} /> Compare {game.bookmakers.length} books <ChevronRight size={10} />
        </button>
      )}
    </div>
  );
}

function OddsCell({ label, odds, onClick, border }: { label: string; odds?: number; onClick: () => void; border?: boolean }) {
  if (!odds) return <div className={`px-3 py-2.5 ${border ? 'border-t border-border' : ''}`} />;

  const isPositive = odds > 0;
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2.5 text-center hover:bg-primary/5 transition-colors min-w-[72px] border-l border-border ${border ? 'border-t' : ''}`}
    >
      {label && <div className="font-mono text-[9px] text-text-dim mb-0.5">{label}</div>}
      <div className={`font-mono text-xs font-medium ${isPositive ? 'text-green' : 'text-foreground'}`}>
        {isPositive ? '+' : ''}{odds}
      </div>
    </button>
  );
}
