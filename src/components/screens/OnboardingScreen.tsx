import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, AlertTriangle, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function OnboardingScreen() {
  const { updateProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [bankroll, setBankroll] = useState('');
  const [unitSize, setUnitSize] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  const bankrollNum = parseFloat(bankroll) || 0;

  const handleBankrollNext = () => {
    if (bankrollNum < 50) {
      setShowWarning(true);
    } else {
      setStep(1);
    }
  };

  const handleFinish = async () => {
    const us = parseFloat(unitSize) || Math.max(1, Math.round(bankrollNum / 100));
    await updateProfile({
      bankroll: bankrollNum,
      unit_size: us,
      onboarded: true,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="bankroll" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center mb-4">
                  <DollarSign size={28} className="text-primary-foreground" />
                </div>
                <h2 className="font-display text-2xl font-extrabold">What's your bankroll?</h2>
                <p className="text-muted-foreground text-sm mt-2">How much money are you working with? Be honest — this helps us protect you.</p>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg font-bold">$</span>
                <input
                  type="number"
                  value={bankroll}
                  onChange={e => { setBankroll(e.target.value); setShowWarning(false); }}
                  placeholder="0.00"
                  className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-4 text-foreground text-2xl font-display font-bold outline-none placeholder:text-text-dim focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-center"
                  autoFocus
                />
              </div>

              <AnimatePresence>
                {showWarning && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red/10 border border-red/30 rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={20} className="text-red flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-display font-bold text-red text-sm">We recommend closing the app</p>
                        <p className="text-xs text-muted-foreground mt-1">With less than $50, sports betting carries extremely high risk of total loss. Consider saving more before placing bets.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setStep(1)} className="flex-1 bg-surface border border-border text-muted-foreground font-display font-bold text-xs py-2.5 rounded-full hover:border-accent transition-colors">
                        Continue anyway
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!showWarning && (
                <button
                  onClick={handleBankrollNext}
                  disabled={bankrollNum <= 0}
                  className="w-full gradient-primary text-primary-foreground font-display font-bold text-sm py-3.5 rounded-full glow-green hover:shadow-[var(--glow-green-lg)] transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  Continue <ArrowRight size={16} />
                </button>
              )}
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="units" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 mx-auto flex items-center justify-center mb-4">
                  <Shield size={28} className="text-accent" />
                </div>
                <h2 className="font-display text-2xl font-extrabold">Set your unit size</h2>
                <p className="text-muted-foreground text-sm mt-2">
                  We recommend <span className="text-accent font-bold">${Math.max(1, Math.round(bankrollNum / 100))}</span> per unit (1% of bankroll).
                </p>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg font-bold">$</span>
                <input
                  type="number"
                  value={unitSize}
                  onChange={e => setUnitSize(e.target.value)}
                  placeholder={Math.max(1, Math.round(bankrollNum / 100)).toString()}
                  className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-4 text-foreground text-2xl font-display font-bold outline-none placeholder:text-text-dim focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-center"
                />
              </div>

              <div className="bg-surface border border-border rounded-xl p-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="font-mono text-[9px] text-text-dim uppercase tracking-wider">Bankroll</div>
                    <div className="font-display font-bold text-green">${bankrollNum.toFixed(0)}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] text-text-dim uppercase tracking-wider">Unit</div>
                    <div className="font-display font-bold text-accent">${parseFloat(unitSize) || Math.max(1, Math.round(bankrollNum / 100))}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] text-text-dim uppercase tracking-wider">Max Loss</div>
                    <div className="font-display font-bold text-red">5u</div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="w-full gradient-primary text-primary-foreground font-display font-bold text-sm py-3.5 rounded-full glow-green hover:shadow-[var(--glow-green-lg)] transition-all flex items-center justify-center gap-2"
              >
                Let's go <ArrowRight size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
