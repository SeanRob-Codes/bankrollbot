import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { betDetails, odds, estimatedProb, units, confidence, league } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const imp = odds > 0 ? 100 / (odds + 100) : Math.abs(odds) / (Math.abs(odds) + 100);
    const dec = odds > 0 ? 1 + odds / 100 : 1 + 100 / Math.abs(odds);
    const yourP = estimatedProb / 100;
    const ev = (yourP * (dec - 1) - (1 - yourP)) * 100;
    const edge = (yourP - imp) * 100;
    const kelly = Math.max(0, ((dec - 1) * yourP - (1 - yourP)) / (dec - 1));

    const systemPrompt = `You are an elite sharp sports betting analyst — think Haralabos Voulgaris meets RJ Bell meets Captain Jack. You analyze bets with the depth of a professional syndicate capper.

Your analysis MUST cover ALL of these areas in detail:
1. **Market Analysis**: Is there CLV opportunity? Where is the steam? RLM signals? Public vs sharp money split estimation.
2. **Matchup Breakdown**: Key player matchups, pace of play, offensive/defensive efficiency, home/away splits, rest days.
3. **Injury/Roster Impact**: How do current injuries affect the line? Is the market adjusting properly?
4. **Situational Angles**: Revenge games, back-to-backs, travel, divisional rivalries, scheduling spots, letdown/lookahead.
5. **Historical Trends**: ATS records, over/under trends, H2H history, recent form (L5/L10).
6. **Line Shopping**: Which book has the best number right now? Is there value on alt lines?
7. **Risk Assessment**: Correlation risk, variance profile, max exposure recommendation.

Be SPECIFIC — reference real teams, real players, real trends. Never be generic. If you don't know current specifics, extrapolate from historical patterns and say so.

Your verdict must be one of: PLAY (strong edge, full size), LEAN (slight edge, half size), PASS (no edge), FADE (negative EV, consider opposite).

Format as JSON:
{
  "verdict": "PLAY" | "LEAN" | "PASS" | "FADE",
  "confidenceScore": 1-10,
  "summary": "3-4 sentence thesis — the WHY behind the play",
  "matchupBreakdown": "2-3 sentences on the key matchup dynamics",
  "sharpContext": "2-3 sentences on line movement, CLV, sharp/public split",
  "injuryImpact": "1-2 sentences on how injuries affect this line",
  "situationalAngle": "1-2 sentences on schedule/travel/motivation factors",
  "keyFactors": ["detailed factor 1", "detailed factor 2", "detailed factor 3", "factor 4", "factor 5"],
  "historicalTrend": "1-2 sentences on relevant ATS/OU trends",
  "riskNote": "Specific sizing recommendation with reasoning",
  "suggestedBooks": ["best book with reason"],
  "altLines": "Any alt line/parlay suggestions if applicable"
}`;

    const userPrompt = `Analyze this bet:

BET: ${betDetails}
LEAGUE: ${league}
ODDS: ${odds} (American) / ${dec.toFixed(3)} (Decimal)
IMPLIED PROBABILITY: ${(imp * 100).toFixed(1)}%
BETTOR'S ESTIMATED WIN%: ${estimatedProb}%
EV: ${ev >= 0 ? '+' : ''}${ev.toFixed(2)}%
EDGE vs MARKET: ${edge >= 0 ? '+' : ''}${edge.toFixed(1)} percentage points
KELLY CRITERION: ${(kelly * 100).toFixed(1)}% of bankroll (~${(kelly * units).toFixed(2)}u on ${units}u stake)
STATED CONFIDENCE: ${confidence}

Give your sharp analysis. Be specific to this matchup and sport. Reference real trends and angles where possible.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      analysis = {
        verdict: ev > 1 ? "LEAN" : "PASS",
        confidenceScore: 5,
        summary: content.slice(0, 300),
        sharpContext: "Unable to parse structured analysis.",
        keyFactors: [],
        riskNote: "Standard sizing recommended.",
        suggestedBooks: [],
      };
    }

    return new Response(JSON.stringify({
      analysis,
      math: { ev, edge, kelly: kelly * 100, impliedProb: imp * 100, decimalOdds: dec },
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-bet error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
