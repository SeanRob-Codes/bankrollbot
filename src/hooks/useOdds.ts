import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LEAGUES } from '@/lib/betting';

export interface GameOdds {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  bookmakers: {
    key: string;
    title: string;
    markets: {
      key: string;
      outcomes: { name: string; price: number; point?: number }[];
    }[];
  }[];
}

export interface AIAnalysis {
  analysis: {
    verdict: string;
    confidenceScore: number;
    summary: string;
    sharpContext: string;
    keyFactors: string[];
    riskNote: string;
    suggestedBooks: string[];
  };
  math: {
    ev: number;
    edge: number;
    kelly: number;
    impliedProb: number;
    decimalOdds: number;
  };
}

export function useOdds(league: string) {
  const [games, setGames] = useState<GameOdds[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<'live' | 'mock'>('mock');

  const fetchOdds = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-odds', {
        body: { league, type: 'moneyline' },
      });
      if (error) throw error;
      setGames(data.games || []);
      setSource(data.source || 'mock');
    } catch (e) {
      console.error('Failed to fetch odds:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOdds();
  }, [league]);

  return { games, loading, source, refresh: fetchOdds };
}

export function useAnalysis() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (params: {
    betDetails: string;
    odds: number;
    estimatedProb: number;
    units: number;
    confidence: string;
    league: string;
  }) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('analyze-bet', {
        body: params,
      });
      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e: any) {
      setError(e.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return { analyze, result, loading, error, clear: () => { setResult(null); setError(null); } };
}
