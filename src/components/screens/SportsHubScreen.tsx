import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Users, Loader2, RefreshCw, ArrowRightLeft } from 'lucide-react';
import { useInjuries, useTeams, type Injury, type Team } from '@/hooks/useSportsData';
import { LEAGUES } from '@/lib/betting';

type HubTab = 'injuries' | 'rosters' | 'news';

export function SportsHubScreen() {
  const [league, setLeague] = useState('NBA');
  const [hubTab, setHubTab] = useState<HubTab>('injuries');

  const { injuries, loading: injLoading, refresh: refreshInj } = useInjuries(league);
  const { teams, loading: teamsLoading, refresh: refreshTeams } = useTeams(league);

  const supportedLeagues = LEAGUES.filter(l => ['NFL', 'NBA', 'MLB', 'NHL', 'WNBA'].includes(l));

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="font-display text-lg font-extrabold">Sports Hub</h1>
          <p className="text-muted-foreground text-xs">Live rosters, injuries & updates</p>
        </div>
        <button
          onClick={() => { refreshInj(); refreshTeams(); }}
          className="p-2 rounded-lg bg-surface border border-border text-text-dim hover:text-foreground transition-colors"
        >
          <RefreshCw size={14} className={injLoading || teamsLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* League picker */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {supportedLeagues.map(l => (
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

      {/* Hub tabs */}
      <div className="flex gap-1 bg-surface border border-border rounded-lg p-1">
        {[
          { id: 'injuries' as HubTab, label: 'Injuries', icon: AlertTriangle },
          { id: 'rosters' as HubTab, label: 'Rosters', icon: Users },
          { id: 'news' as HubTab, label: 'Trades & News', icon: ArrowRightLeft },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setHubTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md font-mono text-[10px] uppercase tracking-wider transition-all
                ${hubTab === t.id ? 'gradient-primary text-primary-foreground shadow-sm' : 'text-text-dim hover:text-foreground'}`}
            >
              <Icon size={12} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Injuries Tab */}
      {hubTab === 'injuries' && (
        <div className="space-y-2">
          {injLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-red" />
            </div>
          )}
          {!injLoading && injuries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">No injury data available for {league}</div>
          )}
          {!injLoading && injuries.map((inj, i) => (
            <InjuryCard key={`${inj.player}-${i}`} injury={inj} />
          ))}
        </div>
      )}

      {/* Rosters Tab */}
      {hubTab === 'rosters' && (
        <div className="space-y-2">
          {teamsLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-accent" />
            </div>
          )}
          {!teamsLoading && teams.map(team => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}

      {/* News Tab */}
      {hubTab === 'news' && (
        <div className="space-y-2">
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <ArrowRightLeft size={24} className="text-accent mx-auto mb-2" />
            <div className="font-display text-sm font-bold mb-1">Trade & Transaction Updates</div>
            <p className="text-xs text-muted-foreground mb-3">
              Key roster moves are reflected in the injury report and roster data pulled from ESPN in real-time.
            </p>
            <div className="space-y-2">
              {injuries.filter(inj => inj.status === 'Out' || inj.status === 'Suspended').slice(0, 5).map((inj, i) => (
                <div key={i} className="flex items-center gap-2 bg-card border border-border rounded-lg p-2.5 text-left">
                  {inj.headshot && <img src={inj.headshot} alt={inj.player} className="w-8 h-8 rounded-full object-cover" />}
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-xs font-bold truncate">{inj.player}</div>
                    <div className="font-mono text-[9px] text-text-dim">{inj.team} · {inj.status}</div>
                  </div>
                  <Activity size={12} className="text-red flex-shrink-0" />
                </div>
              ))}
              {injuries.filter(inj => inj.status === 'Out' || inj.status === 'Suspended').length === 0 && (
                <div className="text-xs text-muted-foreground">No major roster changes detected</div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function InjuryCard({ injury }: { injury: Injury }) {
  const statusColor = injury.status === 'Out'
    ? 'text-red bg-red/10 border-red/20'
    : injury.status === 'Day-To-Day'
      ? 'text-amber bg-amber/10 border-amber/20'
      : 'text-muted-foreground bg-surface-2 border-border';

  return (
    <div className="bg-surface border border-border rounded-lg p-3 flex items-start gap-3">
      {injury.headshot ? (
        <img src={injury.headshot} alt={injury.player} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
      ) : injury.teamLogo ? (
        <img src={injury.teamLogo} alt={injury.team} className="w-10 h-10 object-contain flex-shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={16} className="text-text-dim" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-display text-sm font-bold truncate">{injury.player}</span>
          {injury.position && (
            <span className="font-mono text-[9px] text-text-dim bg-card px-1.5 py-0.5 rounded">{injury.position}</span>
          )}
        </div>
        <div className="font-mono text-[10px] text-text-dim mb-1">{injury.team}</div>
        <span className={`inline-block font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
          {injury.status}
        </span>
        {injury.description && (
          <div className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{injury.description}</div>
        )}
      </div>
    </div>
  );
}

function TeamCard({ team }: { team: Team }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-3 flex items-center gap-3">
      {team.logo ? (
        <img src={team.logo} alt={team.abbreviation} className="w-10 h-10 object-contain" />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center">
          <Users size={16} className="text-text-dim" />
        </div>
      )}
      <div className="flex-1">
        <div className="font-display text-sm font-bold">{team.name}</div>
        <div className="font-mono text-[10px] text-text-dim">{team.abbreviation}</div>
      </div>
      {team.color && (
        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `#${team.color}` }} />
      )}
    </div>
  );
}
