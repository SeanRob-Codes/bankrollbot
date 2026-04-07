import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ScheduleGame {
  id: string;
  name: string;
  date: string;
  status: string;
  period?: number;
  clock?: string;
  teams: {
    name: string;
    abbreviation: string;
    logo: string;
    score: string;
    homeAway: string;
    record?: string;
  }[];
  venue?: string;
  broadcast?: string;
}

export interface Injury {
  team: string;
  teamLogo?: string;
  player: string;
  position?: string;
  status: string;
  description?: string;
  date?: string;
  headshot?: string;
}

export interface Team {
  id: string;
  name: string;
  abbreviation: string;
  logo: string;
  color?: string;
}

export function useSchedule(league: string) {
  const [games, setGames] = useState<ScheduleGame[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch_ = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('fetch-sports-data', {
        body: { league, type: 'schedule' },
      });
      setGames(data?.games || []);
    } catch (e) {
      console.error('Schedule fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch_(); }, [league]);

  return { games, loading, refresh: fetch_ };
}

export function useInjuries(league: string) {
  const [injuries, setInjuries] = useState<Injury[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch_ = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('fetch-sports-data', {
        body: { league, type: 'injuries' },
      });
      setInjuries(data?.injuries || []);
    } catch (e) {
      console.error('Injuries fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch_(); }, [league]);

  return { injuries, loading, refresh: fetch_ };
}

export function useTeams(league: string) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch_ = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('fetch-sports-data', {
        body: { league, type: 'roster' },
      });
      setTeams(data?.teams || []);
    } catch (e) {
      console.error('Teams fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch_(); }, [league]);

  return { teams, loading, refresh: fetch_ };
}
