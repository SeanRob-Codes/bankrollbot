import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ScheduleGame {
  id: string;
  name: string;
  date: string;
  status: string;
  statusState: string;
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
  line?: string;
  overUnder?: number;
  spread?: number;
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

function formatDateParam(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

export function useSchedule(league: string, dates?: string[]) {
  const [games, setGames] = useState<ScheduleGame[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('fetch-sports-data', {
        body: { league, type: 'schedule', dates: dates || [formatDateParam(new Date())] },
      });
      setGames(data?.games || []);
    } catch (e) {
      console.error('Schedule fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [league, dates?.join(',')]);

  useEffect(() => { fetchSchedule(); }, [fetchSchedule]);

  return { games, loading, refresh: fetchSchedule };
}

export function useMultiDaySchedule(league: string, centerDate: Date, rangeDays: number = 7) {
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    const d: string[] = [];
    for (let i = 0; i < rangeDays; i++) {
      const date = new Date(centerDate);
      date.setDate(date.getDate() + i);
      d.push(formatDateParam(date));
    }
    setDates(d);
  }, [centerDate.toISOString(), rangeDays]);

  return useSchedule(league, dates);
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
