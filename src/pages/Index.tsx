import { useState } from 'react';
import { BottomNav, type TabId } from '@/components/BottomNav';
import { StatStrip } from '@/components/StatStrip';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { AnalyzerScreen } from '@/components/screens/AnalyzerScreen';
import { ProfileScreen } from '@/components/screens/ProfileScreen';
import { SocialScreen } from '@/components/screens/SocialScreen';
import { PremiumScreen } from '@/components/screens/PremiumScreen';
import { AuthScreen } from '@/components/screens/AuthScreen';
import { OnboardingScreen } from '@/components/screens/OnboardingScreen';
import { ScheduleBoard } from '@/components/ScheduleBoard';
import { GuideScreen } from '@/components/screens/GuideScreen';
import { SportsHubScreen } from '@/components/screens/SportsHubScreen';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<TabId>('home');
  const [showPremium, setShowPremium] = useState(false);
  const [prefillGame, setPrefillGame] = useState<any>(null);
  const [showSportsHub, setShowSportsHub] = useState(false);

  const handleScheduleGameSelect = (game: any) => {
    setPrefillGame(game);
    setTab('analyzer');
  };

  if (authLoading) {
    return (
      <Shell>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-green" />
        </div>
      </Shell>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (profile && !profile.onboarded) {
    return <OnboardingScreen />;
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
          <div className="flex items-center gap-2">
            {profile?.is_premium && (
              <span className="font-mono text-[9px] px-2 py-0.5 rounded-full gradient-premium text-primary-foreground">PRO</span>
            )}
            <button
              onClick={() => setShowSportsHub(!showSportsHub)}
              className={`font-mono text-[9px] px-2 py-1 rounded-full transition-all ${showSportsHub ? 'gradient-primary text-primary-foreground' : 'bg-surface border border-border text-text-dim hover:text-foreground'}`}
            >
              Hub
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-green/30 cursor-pointer" onClick={() => setTab('profile')}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center gradient-primary text-xs font-display font-bold text-primary-foreground">
                  {(profile?.username || 'B')[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <StatStrip bankroll={profile?.bankroll || 0} unitSize={profile?.unit_size || 25} bets={[]} />

      <div className="px-5 pb-24">
        {showSportsHub ? (
          <SportsHubScreen />
        ) : (
          <>
            {tab === 'home' && <HomeScreen onGoToAnalyzer={() => setTab('analyzer')} />}
            {tab === 'schedule' && <ScheduleBoard onSelectGame={handleScheduleGameSelect} />}
            {tab === 'analyzer' && <AnalyzerScreen onSendToLog={() => setTab('home')} prefillGame={prefillGame} onPrefillConsumed={() => setPrefillGame(null)} />}
            {tab === 'profile' && <ProfileScreen onUpgrade={() => setShowPremium(true)} />}
            {tab === 'social' && <SocialScreen />}
            {tab === 'guide' && <GuideScreen />}
          </>
        )}
      </div>

      <BottomNav active={tab} onChange={(id) => { setShowSportsHub(false); setTab(id); }} />
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
