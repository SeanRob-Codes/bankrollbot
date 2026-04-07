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

    const systemPrompt = `You are a sharp sports betting analyst modeled after professional handicappers. You provide real, actionable analysis like you'd find on Action Network, The Athletic, or from professional cappers.

Your analysis style:
- Direct, confident, no hedging language
- Reference real betting concepts: CLV (closing line value), steam moves, reverse line movement, public vs sharp money splits
- Mention specific sportsbooks when discussing line shopping (DraftKings, FanDuel, BetMGM, Caesars, etc.)
- Reference injury reports, recent form, matchup data, and situational angles
- Use the Kelly Criterion calculation provided
- Give a clear PLAY / LEAN / PASS / FADE verdict
- Include a confidence score from 1-10

Format your response as JSON with this structure:
{
  "verdict": "PLAY" | "LEAN" | "PASS" | "FADE",
  "confidenceScore": 1-10,
  "summary": "2-3 sentence core analysis",
  "sharpContext": "1-2 sentences about line movement, sharp vs public money, CLV angle",
  "keyFactors": ["factor 1", "factor 2", "factor 3"],
  "riskNote": "1 sentence on sizing/risk",
  "suggestedBooks": ["best book for this line"]
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
