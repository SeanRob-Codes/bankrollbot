import { useState, useCallback } from 'react';
import { AppState, Bet, CommunityPick, loadState, saveState } from '@/lib/betting';

export function useBettingState() {
  const [state, setState] = useState<AppState>(loadState);

  const update = useCallback((updater: (prev: AppState) => AppState) => {
    setState(prev => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  const addBet = useCallback((bet: Omit<Bet, 'id' | 'createdAt' | 'result'>) => {
    update(prev => ({
      ...prev,
      bets: [...prev.bets, { ...bet, id: 'b' + Date.now().toString(36), result: 'pending', createdAt: Date.now() }],
    }));
  }, [update]);

  const markBet = useCallback((id: string, result: 'win' | 'loss') => {
    update(prev => ({
      ...prev,
      bets: prev.bets.map(b => b.id === id ? { ...b, result } : b),
    }));
  }, [update]);

  const updateProfile = useCallback((data: Partial<AppState>) => {
    update(prev => ({ ...prev, ...data }));
  }, [update]);

  const updateGuardrails = useCallback((data: Partial<AppState['guardrails']>) => {
    update(prev => ({ ...prev, guardrails: { ...prev.guardrails, ...data } }));
  }, [update]);

  const addCommunityPick = useCallback((pick: Omit<CommunityPick, 'id' | 'createdAt' | 'votes' | 'voted'>) => {
    update(prev => ({
      ...prev,
      communityPicks: [...prev.communityPicks, { ...pick, id: 'cp' + Date.now().toString(36), votes: 0, voted: false, createdAt: Date.now() }],
    }));
  }, [update]);

  const votePick = useCallback((id: string) => {
    update(prev => ({
      ...prev,
      communityPicks: prev.communityPicks.map(p => p.id === id ? { ...p, votes: p.voted ? p.votes - 1 : p.votes + 1, voted: !p.voted } : p),
    }));
  }, [update]);

  const resetAll = useCallback(() => {
    localStorage.removeItem('bbs_v3');
    setState(loadState());
  }, []);

  return { state, addBet, markBet, updateProfile, updateGuardrails, addCommunityPick, votePick, resetAll };
}
