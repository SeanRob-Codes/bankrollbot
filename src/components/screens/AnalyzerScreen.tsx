import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, Target, Loader2 } from 'lucide-react';
import { useAnalysis } from '@/hooks/useOdds';
import { LEAGUES } from '@/lib/betting';
import { OddsBoard } from '@/components/OddsBoard';
import type { GameOdds } from '@/hooks/useOdds';

interface Props {
  onSendToLog: (data?: any) => void;
}

export function AnalyzerScreen({ onSendToLog }: Props) {
  const [betText, setBetText] = useState('');
  const [odds, setOdds] = useState('');
  const [prob, setProb] = useState('');
  const [units, setUnits] = useState('1');
  const [conf, setConf] = useState('medium');
  const [league, setLeague] = useState('NBA');
  const { analyze, result, loading, error, clear } = useAnalysis();

  const handleGameSelect = (game: GameOdds, team: string, selectedOdds: number, market: string) => {
    setBetText(`${game.awayTeam} @ ${game.homeTeam} — ${market}`);
    setOdds(selectedOdds.toString());
    // Auto-estimate probability from odds for convenience
    const imp = selectedOdds > 0 ? 100 / (selectedOdds + 100) : Math.abs(selectedOdds) / (Math.abs(selectedOdds) + 100);
    setProb(Math.round(imp * 100 + (Math.random() * 10 - 5)).toString());
  };

  const runAnalysis = () => {
    const o = parseFloat(odds);
    const p = parseFloat(prob);
    const u = parseFloat(units) || 1;
    if (!betText.trim() || isNaN(o) || isNaN(p) || p < 1 || p > 99) return;
    analyze({ betDetails: betText, odds: o, estimatedProb: p, units: u, confidence: conf, league });
  };

  const verdictConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
    PLAY: { icon: <CheckCircle size={20} />, color: 'text-green', bg: 'bg-green/5', border: 'border-green/20' },
    LEAN: { icon: <TrendingUp size={20} />, color: 'text-accent', bg: 'bg-accent/5', border: 'border-accent/20' },
    PASS: { icon: <XCircle size={20} />, color: 'text-amber', bg: 'bg-amber/5', border: 'border-amber/20' },
    FADE: { icon: <TrendingDown size={20} />, color: 'text-red', bg: 'bg-red/5', border: 'border-red/20' },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Live Odds Board */}
      <SectionLabel>📊 Live lines — tap to analyze</SectionLabel>
      <OddsBoard onSelectGame={handleGameSelect} />

      {/* Analysis form */}
      <SectionLabel><Sparkles size={12} className="mr-1.5" /> AI Sharp Analysis</SectionLabel>
      <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
        <div>
          <FormLabel>Bet details</FormLabel>
          <textarea
            value={betText}
            onChange={e => setBetText(e.target.value)}
            placeholder="Tap a game above or type your bet..."
            className="w-full bg-card border border-border rounded-sm p-2.5 text-foreground font-body text-sm outline-none placeholder:text-text-dim focus:border-accent focus:ring-1 focus:ring-accent/20 min-h-[70px] resize-y"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <FormLabel>Odds</FormLabel>
            <input value={odds} onChange={e => setOdds(e.target.value)} type="number" placeholder="-110" className="w-full bg-card border border-border rounded-sm p-2.5 text-foreground font-body text-sm outline-none placeholder:text-text-dim focus:border-accent focus:ring-1 focus:ring-accent/20" />
          </div>
          <div>
            <FormLabel>Your est. %</FormLabel>
            <input value={prob} onChange={e => setProb(e.target.value)} type="number" min="1" max="99" placeholder="55" className="w-full bg-card border border-border rounded-sm p-2.5 text-foreground font-body text-sm outline-none placeholder:text-text-dim focus:border-accent focus:ring-1 focus:ring-accent/20" />
          </div>
          <div>
            <FormLabel>Units</FormLabel>
            <input value={units} onChange={e => setUnits(e.target.value)} type="number" step="0.1" placeholder="1.0" className="w-full bg-card border border-border rounded-sm p-2.5 text-foreground font-body text-sm outline-none placeholder:text-text-dim focus:border-accent focus:ring-1 focus:ring-accent/20" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <FormLabel>League</FormLabel>
            <select value={league} onChange={e => setLeague(e.target.value)} className="w-full bg-card border border-border rounded-sm p-2.5 text-foreground font-body text-sm outline-none focus:border-accent">
              {LEAGUES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <FormLabel>Confidence</FormLabel>
            <select value={conf} onChange={e => setConf(e.target.value)} className="w-full bg-card border border-border rounded-sm p-2.5 text-foreground font-body text-sm outline-none focus:border-accent">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High — lock</option>
            </select>
          </div>
        </div>
        <button
          onClick={runAnalysis}
          disabled={loading || !betText.trim() || !odds || !prob}
          className="w-full gradient-primary text-primary-foreground font-display font-bold text-sm py-3 rounded-full glow-green hover:shadow-[var(--glow-green-lg)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <><Sparkles size={16} /> Run AI analysis</>}
        </button>

        {/* Error */}
        {error && (
          <div className="bg-red/5 border border-red/20 rounded-sm p-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red flex-shrink-0" />
            <span className="text-xs text-red">{error}</span>
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3 mt-2">
              {/* Verdict banner */}
              {(() => {
                const v = verdictConfig[result.analysis.verdict] || verdictConfig.PASS;
                return (
                  <div className={`flex items-center gap-3 p-3.5 rounded-lg border ${v.bg} ${v.border}`}>
                    <div className={v.color}>{v.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-display text-lg font-extrabold ${v.color}`}>{result.analysis.verdict}</span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className={`w-1.5 h-3 rounded-sm ${i < result.analysis.confidenceScore ? v.color.replace('text-', 'bg-') : 'bg-border'}`} />
                          ))}
                        </div>
                        <span className={`font-mono text-xs ${v.color}`}>{result.analysis.confidenceScore}/10</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Math metrics */}
              <div className="grid grid-cols-4 gap-1.5">
                <MetricPill label="EV" value={`${result.math.ev >= 0 ? '+' : ''}${result.math.ev.toFixed(1)}%`} positive={result.math.ev > 0} />
                <MetricPill label="Edge" value={`${result.math.edge >= 0 ? '+' : ''}${result.math.edge.toFixed(1)}pp`} positive={result.math.edge > 0} />
                <MetricPill label="Kelly" value={result.math.kelly > 0 ? `${result.math.kelly.toFixed(1)}%` : '–'} />
                <MetricPill label="Implied" value={`${result.math.impliedProb.toFixed(0)}%`} />
              </div>

              {/* AI Summary */}
              <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                <div className="font-mono text-[9px] text-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles size={10} /> Deep AI Analysis
                </div>
                <p className="text-sm text-foreground leading-relaxed">{result.analysis.summary}</p>

                {/* Matchup breakdown */}
                {(result.analysis as any).matchupBreakdown && (
                  <AnalysisBlock icon="⚔️" title="Matchup breakdown" text={(result.analysis as any).matchupBreakdown} />
                )}

                {/* Sharp context */}
                <AnalysisBlock icon="🎯" title="Sharp money context" text={result.analysis.sharpContext} highlight />

                {/* Injury impact */}
                {(result.analysis as any).injuryImpact && (
                  <AnalysisBlock icon="🏥" title="Injury impact" text={(result.analysis as any).injuryImpact} />
                )}

                {/* Situational angle */}
                {(result.analysis as any).situationalAngle && (
                  <AnalysisBlock icon="📅" title="Situational angle" text={(result.analysis as any).situationalAngle} />
                )}

                {/* Historical trend */}
                {(result.analysis as any).historicalTrend && (
                  <AnalysisBlock icon="📊" title="Historical trends" text={(result.analysis as any).historicalTrend} />
                )}

                {/* Key factors */}
                {result.analysis.keyFactors?.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="font-mono text-[9px] text-text-dim uppercase tracking-wider">Key factors</div>
                    {result.analysis.keyFactors.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="text-accent mt-0.5">▸</span>{f}
                      </div>
                    ))}
                  </div>
                )}

                {/* Alt lines */}
                {(result.analysis as any).altLines && (
                  <div className="bg-surface border border-purple/10 rounded-lg p-3">
                    <div className="font-mono text-[9px] text-purple uppercase tracking-wider mb-1">💡 Alt line suggestions</div>
                    <p className="text-xs text-muted-foreground">{(result.analysis as any).altLines}</p>
                  </div>
                )}

                {/* Risk + books */}
                <div className="flex items-start gap-2 text-xs text-amber">
                  <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                  {result.analysis.riskNote}
                </div>
                {result.analysis.suggestedBooks?.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {result.analysis.suggestedBooks.map(b => (
                      <span key={b} className="font-mono text-[9px] px-2 py-0.5 rounded-full border border-accent/30 text-accent bg-accent/5">{b}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onSendToLog({ league, match: '', market: betText.slice(0, 60), odds: parseFloat(odds), units: parseFloat(units) || 1 });
                  }}
                  className="flex-1 gradient-primary text-primary-foreground font-display font-bold text-xs py-2.5 rounded-full"
                >
                  Add to bet log
                </button>
                <button onClick={clear} className="flex-1 bg-surface-2 border border-border text-muted-foreground font-display font-bold text-xs py-2.5 rounded-full hover:border-primary hover:text-primary transition-colors">
                  Clear
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function MetricPill({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="bg-card border border-border rounded-sm p-2 text-center">
      <div className="font-mono text-[8px] text-text-dim uppercase tracking-widest mb-0.5">{label}</div>
      <div className={`font-mono text-xs font-bold ${positive === true ? 'text-green' : positive === false ? 'text-red' : 'text-foreground'}`}>{value}</div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-[10px] text-text-dim uppercase tracking-[0.14em] mt-5 mb-2 flex items-center">{children}</div>;
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="block font-mono text-[10px] text-text-dim uppercase tracking-[0.1em] mb-1">{children}</label>;
}

function AnalysisBlock({ icon, title, text, highlight }: { icon: string; title: string; text: string; highlight?: boolean }) {
  return (
    <div className={`${highlight ? 'bg-surface border border-primary/10' : 'bg-surface border border-border'} rounded-lg p-3`}>
      <div className={`font-mono text-[9px] ${highlight ? 'text-green' : 'text-text-dim'} uppercase tracking-wider mb-1.5 flex items-center gap-1`}>
        <span>{icon}</span> {title}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}
