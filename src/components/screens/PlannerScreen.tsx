import { motion } from 'framer-motion';
import type { Guardrails } from '@/lib/betting';

interface Props {
  guardrails: Guardrails;
  onUpdate: (data: Partial<Guardrails>) => void;
}

const mockAlerts = [
  { league: 'NBA', title: 'Line move on star assists', detail: 'Assist line shifted 6.5→5.5 after rest news.', tags: ['Injury?', 'Props'], time: '3m ago' },
  { league: 'NFL', title: 'Wind flag in CLE game', detail: 'Forecast upgraded. Totals ticking down 1–1.5 pts.', tags: ['Totals', 'Weather'], time: '11m ago' },
  { league: 'MMA', title: 'Late training camp change', detail: 'Main card fighter switched camps 4 weeks out.', tags: ['Insider', 'Props'], time: '24m ago' },
  { league: 'NBA', title: 'Reverse line movement', detail: 'Money on Heat but line moved to Celtics -5.5.', tags: ['Sharp money', 'RLM'], time: '38m ago' },
];

export function PlannerScreen({ guardrails, onUpdate }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <SectionLabel>Guardrails</SectionLabel>
      <div className="bg-surface border border-border rounded-lg divide-y divide-border">
        <ToggleRow
          name="Stop-loss reminder"
          desc="Alert when simulated loss hits threshold"
          active={guardrails.stopLossOn}
          onToggle={() => onUpdate({ stopLossOn: !guardrails.stopLossOn })}
          extra={
            <input
              type="number"
              value={guardrails.stopLoss}
              onChange={e => onUpdate({ stopLoss: parseFloat(e.target.value) || -5 })}
              className="w-14 bg-card border border-border rounded-sm px-2 py-1.5 text-xs text-foreground font-mono outline-none focus:border-accent"
            />
          }
        />
        <ToggleRow
          name="Max bets per session"
          desc="Prevent autopilot spraying"
          active={guardrails.maxBetsOn}
          onToggle={() => onUpdate({ maxBetsOn: !guardrails.maxBetsOn })}
          extra={
            <input
              type="number"
              value={guardrails.maxBets}
              onChange={e => onUpdate({ maxBets: parseInt(e.target.value) || 5 })}
              className="w-14 bg-card border border-border rounded-sm px-2 py-1.5 text-xs text-foreground font-mono outline-none focus:border-accent"
            />
          }
        />
        <ToggleRow name="Tilt warning" desc="Alert after 2+ consecutive losses" active={guardrails.tiltOn} onToggle={() => onUpdate({ tiltOn: !guardrails.tiltOn })} />
        <ToggleRow name="Kelly sizing hints" desc="Show Kelly criterion suggestions" active={guardrails.kellyOn} onToggle={() => onUpdate({ kellyOn: !guardrails.kellyOn })} />
      </div>

      <SectionLabel>
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red animate-pulse-dot mr-1.5" />
        Simulated line movement
      </SectionLabel>
      <div className="bg-surface border border-border rounded-lg divide-y divide-border">
        {mockAlerts.map((a, i) => (
          <div key={i} className="p-3.5">
            <div className="flex justify-between items-start gap-2 mb-1">
              <div className="font-medium text-sm">{a.league} – {a.title}</div>
              <div className="font-mono text-[10px] text-text-dim flex-shrink-0">{a.time}</div>
            </div>
            <div className="text-xs text-muted-foreground mb-2">{a.detail}</div>
            <div className="flex gap-1.5 flex-wrap">
              {a.tags.map(t => (
                <span key={t} className="font-mono text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground bg-card">{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ToggleRow({ name, desc, active, onToggle, extra }: { name: string; desc: string; active: boolean; onToggle: () => void; extra?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-3.5 gap-3">
      <div className="flex-1">
        <div className="text-sm font-medium">{name}</div>
        <div className="text-[11px] text-text-dim">{desc}</div>
      </div>
      <div className="flex items-center gap-2">
        {extra}
        <button
          onClick={onToggle}
          className={`w-10 h-[22px] rounded-full relative transition-colors flex-shrink-0 ${active ? 'bg-green/20 border border-green' : 'bg-card border border-border'}`}
        >
          <span className={`absolute top-[3px] left-[3px] w-3.5 h-3.5 rounded-full transition-all ${active ? 'translate-x-[18px] bg-green' : 'bg-text-dim'}`} />
        </button>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-[10px] text-text-dim uppercase tracking-[0.14em] mt-5 mb-2 flex items-center">{children}</div>;
}
