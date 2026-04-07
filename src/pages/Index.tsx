import { useState } from 'react';
import { BottomNav, type TabId } from '@/components/BottomNav';
import { StatStrip } from '@/components/StatStrip';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { AnalyzerScreen } from '@/components/screens/AnalyzerScreen';
import { PlannerScreen } from '@/components/screens/PlannerScreen';
import { ProfileScreen } from '@/components/screens/ProfileScreen';
import { SocialScreen } from '@/components/screens/SocialScreen';
import { PremiumScreen } from '@/components/screens/PremiumScreen';
import { AuthScreen } from '@/components/screens/AuthScreen';
import { useBettingState } from '@/hooks/useBettingState';

const Index = () => {
  const { state, addBet, markBet, updateProfile, updateGuardrails, addCommunityPick, votePick, resetAll } = useBettingState();
  const [tab, setTab] = useState<TabId>('home');
  const [showPremium, setShowPremium] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  if (showAuth) {
    return (
      <Shell>
        <div className="px-5">
          <AuthScreen onClose={() => setShowAuth(false)} />
        </div>
      </Shell>
    );
  }

  if (showPremium) {
    return (
      <Shell>
        <div className="px-5">
          <PremiumScreen onBack={() => setShowPremium(false)} />
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* Header */}
      <div className="px-5 pt-5 pb-0 relative">
        <div className="absolute top-[-40px] left-[-60px] w-[300px] h-[200px] bg-[radial-gradient(ellipse,hsl(var(--green)/0.08),transparent_70%)] pointer-events-none" />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] gradient-primary flex items-center justify-center text-base shadow-[0_4px_20px_hsl(var(--green)/0.4)] font-display font-bold text-primary-foreground">₿</div>
            <div>
              <div className="font-display text-[17px] font-extrabold tracking-[0.02em]">BankrollBot</div>
              <div className="font-mono text-[10px] text-text-dim tracking-[0.1em] uppercase">Studio · AI Edition</div>
            </div>
          </div>
          <button
            onClick={() => setShowAuth(true)}
            className="font-mono text-[10px] px-3 py-1 rounded-full border border-green/30 text-green bg-green/5 tracking-wider uppercase hover:bg-green/10 transition-colors"
          >
            Sign in
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatStrip bankroll={state.bankroll} unitSize={state.unitSize} bets={state.bets} />

      {/* Content */}
      <div className="px-5 pb-24">
        {tab === 'home' && <HomeScreen bets={state.bets} onAddBet={addBet} onMarkBet={markBet} onGoToAnalyzer={() => setTab('analyzer')} />}
        {tab === 'analyzer' && <AnalyzerScreen onSendToLog={addBet} />}
        {tab === 'planner' && <PlannerScreen guardrails={state.guardrails} onUpdate={updateGuardrails} />}
        {tab === 'profile' && <ProfileScreen state={state} onUpdate={updateProfile} onReset={resetAll} onUpgrade={() => setShowPremium(true)} />}
        {tab === 'social' && <SocialScreen picks={state.communityPicks} onAddPick={addCommunityPick} onVote={votePick} username={state.username} />}
      </div>

      <BottomNav active={tab} onChange={setTab} />
    </Shell>
  );
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-[1] max-w-[560px] mx-auto min-h-screen flex flex-col">
      {children}
    </div>
  );
}

export default Index;
