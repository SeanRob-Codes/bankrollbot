import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, Tv, MapPin, RefreshCw, AlertTriangle } from 'lucide-react';
import { useMultiDaySchedule, useInjuries, type ScheduleGame } from '@/hooks/useSportsData';
import { LEAGUES } from '@/lib/betting';

interface Props {
  onSelectGame?: (game: ScheduleGame) => void;
}

export function ScheduleBoard({ onSelectGame }: Props) {
  const [league, setLeague] = useState('NBA');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [showInjuries, setShowInjuries] = useState(false);

  const { games, loading, refresh } = useMultiDaySchedule(league, startDate, 14);
  const { injuries, loading: injuriesLoading } = useInjuries(league);

  // Group games by date
  const gamesByDate = useMemo(() => {
    const grouped: Record<string, ScheduleGame[]> = {};
    games.forEach(g => {
      const d = new Date(g.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(g);
    });
    // Sort games within each day by time
    Object.values(grouped).forEach(dayGames => {
      dayGames.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });
    return grouped;
  }, [games]);

  // Generate date range for scrollable date picker
  const dateRange = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [startDate.toISOString()]);

  const selectedDateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const todayGames = gamesByDate[selectedDateKey] || [];

  const shiftWeek = (dir: number) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + dir * 7);
    setStartDate(d);
  };

  const isToday = (d: Date) => {
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  };

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const formatGameTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* League tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {LEAGUES.map(l => (
          <button
            key={l}
            onClick={() => setLeague(l)}
            className={`font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full whitespace-nowrap transition-all
              ${league === l ? 'gradient-primary text-primary-foreground shadow-sm' : 'bg-surface border border-border text-text-dim hover:text-foreground'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Date picker */}
      <div className="flex items-center gap-1">
        <button onClick={() => shiftWeek(-1)} className="p-1.5 rounded-lg bg-surface border border-border text-text-dim hover:text-foreground transition-colors">
          <ChevronLeft size={14} />
        </button>
        <div className="flex-1 flex gap-1 overflow-x-auto scrollbar-none">
          {dateRange.map(d => {
            const hasGames = gamesByDate[`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`]?.length > 0;
            const selected = isSameDay(d, selectedDate);
            return (
              <button
                key={d.toISOString()}
                onClick={() => setSelectedDate(new Date(d))}
                className={`flex flex-col items-center min-w-[44px] py-1.5 px-1 rounded-lg transition-all text-center
                  ${selected ? 'gradient-primary text-primary-foreground shadow-sm' : 'hover:bg-surface'}
                  ${isToday(d) && !selected ? 'border border-green/40' : ''}`}
              >
                <span className={`font-mono text-[9px] uppercase ${selected ? 'text-primary-foreground' : 'text-text-dim'}`}>
                  {dayNames[d.getDay()]}
                </span>
                <span className={`font-display text-sm font-bold ${selected ? '' : ''}`}>
                  {d.getDate()}
                </span>
                <span className={`font-mono text-[8px] uppercase ${selected ? 'text-primary-foreground/80' : 'text-text-dim'}`}>
                  {monthNames[d.getMonth()]}
                </span>
                {hasGames && !selected && (
                  <div className="w-1 h-1 rounded-full bg-green mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
        <button onClick={() => shiftWeek(1)} className="p-1.5 rounded-lg bg-surface border border-border text-text-dim hover:text-foreground transition-colors">
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Selected date heading */}
      <div className="flex items-center justify-between">
        <div className="font-display text-sm font-bold">
          {dayNames[selectedDate.getDay()]}, {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowInjuries(!showInjuries)} className={`font-mono text-[9px] uppercase tracking-wider px-2 py-1 rounded-full transition-all flex items-center gap-1 ${showInjuries ? 'bg-red/10 text-red' : 'bg-surface border border-border text-text-dim hover:text-foreground'}`}>
            <AlertTriangle size={10} /> Injuries
          </button>
          <button onClick={refresh} disabled={loading} className="p-1.5 rounded-lg bg-surface border border-border text-text-dim hover:text-foreground transition-colors">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-green" />
        </div>
      )}

      {/* Games list */}
      {!loading && todayGames.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No games scheduled for this date
        </div>
      )}

      {!loading && todayGames.length > 0 && (
        <div className="space-y-2">
          {todayGames.map(game => {
            const away = game.teams.find(t => t.homeAway === 'away');
            const home = game.teams.find(t => t.homeAway === 'home');
            const isLive = game.statusState === 'in';
            const isFinal = game.statusState === 'post';

            return (
              <motion.button
                key={game.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onSelectGame?.(game)}
                className="w-full bg-surface border border-border rounded-xl p-3.5 text-left hover:border-accent/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                {/* Status bar */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    {isLive && (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
                        <span className="font-mono text-[9px] text-red font-bold uppercase">
                          {game.clock && game.period ? `Q${game.period} ${game.clock}` : 'LIVE'}
                        </span>
                      </span>
                    )}
                    {isFinal && (
                      <span className="font-mono text-[9px] text-text-dim uppercase">Final</span>
                    )}
                    {!isLive && !isFinal && (
                      <span className="font-mono text-[9px] text-text-dim">
                        {formatGameTime(game.date)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {game.broadcast && (
                      <span className="flex items-center gap-1 font-mono text-[9px] text-accent">
                        <Tv size={9} /> {game.broadcast}
                      </span>
                    )}
                  </div>
                </div>

                {/* Matchup */}
                <div className="space-y-2">
                  {/* Away team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {away?.logo && (
                        <img src={away.logo} alt={away.abbreviation} className="w-7 h-7 object-contain" />
                      )}
                      <div>
                        <div className="font-display text-sm font-bold">{away?.name || 'TBD'}</div>
                        {away?.record && <div className="font-mono text-[9px] text-text-dim">{away.record}</div>}
                      </div>
                    </div>
                    {(isLive || isFinal) && away?.score && (
                      <div className={`font-display text-lg font-extrabold ${isFinal && Number(away.score) > Number(home?.score) ? 'text-green' : ''}`}>
                        {away.score}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pl-9">
                    <span className="font-mono text-[9px] text-text-dim">@</span>
                  </div>

                  {/* Home team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {home?.logo && (
                        <img src={home.logo} alt={home.abbreviation} className="w-7 h-7 object-contain" />
                      )}
                      <div>
                        <div className="font-display text-sm font-bold">{home?.name || 'TBD'}</div>
                        {home?.record && <div className="font-mono text-[9px] text-text-dim">{home.record}</div>}
                      </div>
                    </div>
                    {(isLive || isFinal) && home?.score && (
                      <div className={`font-display text-lg font-extrabold ${isFinal && Number(home.score) > Number(away?.score) ? 'text-green' : ''}`}>
                        {home.score}
                      </div>
                    )}
                  </div>
                </div>

                {/* Lines */}
                {(game.line || game.overUnder) && (
                  <div className="mt-2.5 pt-2.5 border-t border-border flex gap-3">
                    {game.line && (
                      <div className="font-mono text-[10px] text-muted-foreground">
                        <span className="text-text-dim">Line:</span> {game.line}
                      </div>
                    )}
                    {game.overUnder && (
                      <div className="font-mono text-[10px] text-muted-foreground">
                        <span className="text-text-dim">O/U:</span> {game.overUnder}
                      </div>
                    )}
                  </div>
                )}

                {/* Venue */}
                {game.venue && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <MapPin size={9} className="text-text-dim" />
                    <span className="font-mono text-[9px] text-text-dim">{game.venue}</span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Injuries panel */}
      {showInjuries && (
        <div className="space-y-2">
          <div className="font-mono text-[10px] text-text-dim uppercase tracking-[0.14em] mt-3 mb-1">
            {league} Injury Report
          </div>
          {injuriesLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 size={18} className="animate-spin text-red" />
            </div>
          )}
          {!injuriesLoading && injuries.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">No injury data available</div>
          )}
          {!injuriesLoading && injuries.map((inj, i) => (
            <div key={i} className="bg-surface border border-border rounded-lg p-3 flex items-start gap-3">
              {inj.headshot ? (
                <img src={inj.headshot} alt={inj.player} className="w-8 h-8 rounded-full object-cover" />
              ) : inj.teamLogo ? (
                <img src={inj.teamLogo} alt={inj.team} className="w-8 h-8 object-contain" />
              ) : null}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-xs font-bold truncate">{inj.player}</span>
                  {inj.position && <span className="font-mono text-[9px] text-text-dim">{inj.position}</span>}
                </div>
                <div className="font-mono text-[9px] text-text-dim">{inj.team}</div>
                <div className={`font-mono text-[9px] font-bold mt-0.5 ${inj.status === 'Out' ? 'text-red' : inj.status === 'Day-To-Day' ? 'text-amber' : 'text-muted-foreground'}`}>
                  {inj.status}
                </div>
                {inj.description && (
                  <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{inj.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
