export interface Bet {
  id: string;
  league: string;
  match: string;
  market: string;
  odds: number;
  units: number;
  result: 'pending' | 'win' | 'loss';
  createdAt: number;
}

export interface Guardrails {
  stopLossOn: boolean;
  stopLoss: number;
  maxBetsOn: boolean;
  maxBets: number;
  tiltOn: boolean;
  kellyOn: boolean;
}

export interface CommunityPick {
  id: string;
  user: string;
  pick: string;
  note: string;
  votes: number;
  voted: boolean;
  league: string;
  createdAt: number;
}

export interface AppState {
  bankroll: number;
  unitSize: number;
  riskMode: string;
  username: string;
  bets: Bet[];
  guardrails: Guardrails;
  communityPicks: CommunityPick[];
}

const STORAGE_KEY = 'bbs_v3';

const DEFAULT_STATE: AppState = {
  bankroll: 2500,
  unitSize: 25,
  riskMode: 'standard',
  username: '',
  bets: [],
  guardrails: { stopLossOn: false, stopLoss: -5, maxBetsOn: false, maxBets: 5, tiltOn: true, kellyOn: true },
  communityPicks: [],
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const p = JSON.parse(raw);
    return {
      ...DEFAULT_STATE,
      ...p,
      guardrails: { ...DEFAULT_STATE.guardrails, ...(p.guardrails || {}) },
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function american2dec(o: number) {
  return o > 0 ? 1 + o / 100 : 1 + 100 / Math.abs(o);
}

export function american2imp(o: number) {
  return o > 0 ? 100 / (o + 100) : Math.abs(o) / (Math.abs(o) + 100);
}

export function fmtDollar(n: number) {
  const s = n < 0 ? '-' : '';
  return s + '$' + Math.abs(n).toFixed(0);
}

export function fmtUnits(n: number) {
  return (n >= 0 ? '+' : '') + n.toFixed(1) + 'u';
}

export function calcStats(bets: Bet[]) {
  const b = bets.slice(-30);
  let wins = 0, losses = 0;
  const curve: number[] = [];
  let running = 0;
  for (const x of b) {
    if (x.result === 'win') { wins++; running += (american2dec(x.odds) - 1) * x.units; }
    else if (x.result === 'loss') { losses++; running -= x.units; }
    curve.push(+running.toFixed(2));
  }
  const resolved = wins + losses;
  return { wins, losses, net: running, hitRate: resolved ? (wins / resolved) * 100 : null, curve };
}

export function tiltStreak(bets: Bet[]) {
  let s = 0;
  for (let i = bets.length - 1; i >= 0; i--) {
    if (bets[i].result === 'loss') s++;
    else if (bets[i].result === 'win') break;
  }
  return s;
}

export function initials(name: string) {
  if (!name) return 'BB';
  const p = name.trim().split(/\s+/);
  return p.length === 1 ? p[0].slice(0, 2).toUpperCase() : (p[0][0] + p[1][0]).toUpperCase();
}

export const LEAGUES = ['NFL', 'NBA', 'MLB', 'NHL', 'WNBA', 'MMA', 'Boxing', 'Racing', 'Esports', 'Other'] as const;
