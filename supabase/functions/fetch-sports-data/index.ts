import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports";

const SPORT_MAP: Record<string, { sport: string; league: string }> = {
  NFL: { sport: "football", league: "nfl" },
  NBA: { sport: "basketball", league: "nba" },
  MLB: { sport: "baseball", league: "mlb" },
  NHL: { sport: "hockey", league: "nhl" },
  WNBA: { sport: "basketball", league: "wnba" },
  MMA: { sport: "mma", league: "ufc" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { league, type, dates } = await req.json();
    const sportInfo = SPORT_MAP[league];

    if (!sportInfo) {
      return new Response(JSON.stringify({ error: "Unsupported league", data: null }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "schedule") {
      // Support fetching multiple dates
      // dates can be a single YYYYMMDD string or an array of them
      const dateList: string[] = Array.isArray(dates) ? dates : dates ? [dates] : [];
      
      // If no dates provided, fetch today
      if (dateList.length === 0) {
        const today = new Date();
        dateList.push(formatDate(today));
      }

      const allGames: any[] = [];

      for (const dateStr of dateList) {
        const url = `${ESPN_BASE}/${sportInfo.sport}/${sportInfo.league}/scoreboard?dates=${dateStr}`;
        const resp = await fetch(url);
        const data = await resp.json();

        const games = (data.events || []).map((ev: any) => {
          const comp = ev.competitions?.[0];
          const teams = (comp?.competitors || []).map((c: any) => ({
            name: c.team?.displayName || c.team?.name,
            abbreviation: c.team?.abbreviation,
            logo: c.team?.logo,
            score: c.score,
            homeAway: c.homeAway,
            record: c.records?.[0]?.summary,
          }));

          // Extract odds/lines from ESPN data
          const oddsData = comp?.odds?.[0];
          const line = oddsData?.details || null;
          const overUnder = oddsData?.overUnder || null;
          const spread = oddsData?.spread || null;

          return {
            id: ev.id,
            name: ev.name,
            date: ev.date,
            status: comp?.status?.type?.description || 'Scheduled',
            statusState: comp?.status?.type?.state || 'pre',
            period: comp?.status?.period,
            clock: comp?.status?.displayClock,
            teams,
            venue: comp?.venue?.fullName,
            broadcast: comp?.broadcasts?.[0]?.names?.join(', '),
            line,
            overUnder,
            spread,
          };
        });

        allGames.push(...games);
      }

      return new Response(JSON.stringify({ games: allGames, source: "espn" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "injuries") {
      const url = `${ESPN_BASE}/${sportInfo.sport}/${sportInfo.league}/injuries`;
      const resp = await fetch(url);
      if (!resp.ok) {
        return new Response(JSON.stringify({ injuries: [], source: "espn", error: "Not available" }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const data = await resp.json();

      const injuries = (data.injuries || []).flatMap((team: any) =>
        (team.injuries || []).map((inj: any) => ({
          team: team.team?.displayName,
          teamLogo: team.team?.logo,
          player: inj.athlete?.displayName,
          position: inj.athlete?.position?.abbreviation,
          status: inj.status,
          description: inj.longComment || inj.shortComment,
          date: inj.date,
          headshot: inj.athlete?.headshot?.href,
        }))
      );

      return new Response(JSON.stringify({ injuries: injuries.slice(0, 40), source: "espn" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "roster") {
      const url = `${ESPN_BASE}/${sportInfo.sport}/${sportInfo.league}/teams`;
      const resp = await fetch(url);
      const data = await resp.json();

      const teams = (data.sports?.[0]?.leagues?.[0]?.teams || []).map((t: any) => ({
        id: t.team?.id,
        name: t.team?.displayName,
        abbreviation: t.team?.abbreviation,
        logo: t.team?.logos?.[0]?.href,
        color: t.team?.color,
      }));

      return new Response(JSON.stringify({ teams: teams.slice(0, 32), source: "espn" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown type" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-sports-data error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}
