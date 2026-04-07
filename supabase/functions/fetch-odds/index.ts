import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Free tier of The Odds API — 500 requests/month
const ODDS_API_BASE = "https://api.the-odds-api.com/v4";

// Sport keys mapping
const SPORT_MAP: Record<string, string> = {
  NFL: "americanfootball_nfl",
  NBA: "basketball_nba",
  MLB: "baseball_mlb",
  NHL: "icehockey_nhl",
  WNBA: "basketball_wnba",
  MMA: "mma_mixed_martial_arts",
  Boxing: "boxing_boxing",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { league, type } = await req.json();
    const ODDS_API_KEY = Deno.env.get("ODDS_API_KEY");

    const sportKey = SPORT_MAP[league] || "upcoming";

    if (!ODDS_API_KEY) {
      // Return mock data when no API key — still useful
      return new Response(JSON.stringify({
        games: getMockGames(league),
        source: "mock",
        message: "Add ODDS_API_KEY secret for live odds from The Odds API"
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const markets = type === "props" ? "player_pass_tds,player_rush_yds,player_receptions,player_points" : "h2h,spreads,totals";
    const url = `${ODDS_API_BASE}/sports/${sportKey}/odds/?apiKey=${ODDS_API_KEY}&regions=us&markets=${markets}&oddsFormat=american&bookmakers=draftkings,fanduel,betmgm,caesars`;

    const resp = await fetch(url);
    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Odds API error:", resp.status, errText);
      return new Response(JSON.stringify({
        games: getMockGames(league),
        source: "mock",
        error: `Odds API returned ${resp.status}`
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rawGames = await resp.json();

    const games = rawGames.slice(0, 12).map((g: any) => ({
      id: g.id,
      sport: g.sport_key,
      homeTeam: g.home_team,
      awayTeam: g.away_team,
      startTime: g.commence_time,
      bookmakers: g.bookmakers?.slice(0, 4).map((bk: any) => ({
        key: bk.key,
        title: bk.title,
        markets: bk.markets?.map((m: any) => ({
          key: m.key,
          outcomes: m.outcomes?.map((o: any) => ({
            name: o.name,
            price: o.price,
            point: o.point,
          })),
        })),
      })),
    }));

    return new Response(JSON.stringify({ games, source: "live" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-odds error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getMockGames(league: string) {
  const now = new Date();
  const teams: Record<string, string[][]> = {
    NBA: [["Boston Celtics", "Miami Heat"], ["Los Angeles Lakers", "Golden State Warriors"], ["Denver Nuggets", "Phoenix Suns"], ["Dallas Mavericks", "Oklahoma City Thunder"]],
    NFL: [["Kansas City Chiefs", "Buffalo Bills"], ["Philadelphia Eagles", "San Francisco 49ers"], ["Detroit Lions", "Dallas Cowboys"], ["Baltimore Ravens", "Cincinnati Bengals"]],
    MLB: [["New York Yankees", "Boston Red Sox"], ["Los Angeles Dodgers", "San Diego Padres"], ["Houston Astros", "Texas Rangers"], ["Atlanta Braves", "Philadelphia Phillies"]],
    NHL: [["Edmonton Oilers", "Florida Panthers"], ["Colorado Avalanche", "Dallas Stars"], ["New York Rangers", "Carolina Hurricanes"], ["Vegas Golden Knights", "Winnipeg Jets"]],
    WNBA: [["New York Liberty", "Las Vegas Aces"], ["Connecticut Sun", "Minnesota Lynx"]],
    MMA: [["Fighter A", "Fighter B"], ["Fighter C", "Fighter D"]],
  };

  const leagueTeams = teams[league] || teams["NBA"];
  return leagueTeams.map((pair, i) => ({
    id: `mock-${league}-${i}`,
    homeTeam: pair[0],
    awayTeam: pair[1],
    startTime: new Date(now.getTime() + (i + 1) * 3600000).toISOString(),
    bookmakers: [
      {
        key: "draftkings",
        title: "DraftKings",
        markets: [
          {
            key: "h2h",
            outcomes: [
              { name: pair[0], price: -110 + Math.floor(Math.random() * 40 - 20) },
              { name: pair[1], price: 100 + Math.floor(Math.random() * 40 - 20) },
            ],
          },
          {
            key: "spreads",
            outcomes: [
              { name: pair[0], price: -110, point: -(2.5 + Math.floor(Math.random() * 8)) },
              { name: pair[1], price: -110, point: 2.5 + Math.floor(Math.random() * 8) },
            ],
          },
        ],
      },
      {
        key: "fanduel",
        title: "FanDuel",
        markets: [
          {
            key: "h2h",
            outcomes: [
              { name: pair[0], price: -115 + Math.floor(Math.random() * 30 - 15) },
              { name: pair[1], price: 105 + Math.floor(Math.random() * 30 - 15) },
            ],
          },
        ],
      },
    ],
  }));
}
