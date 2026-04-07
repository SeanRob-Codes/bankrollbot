import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles, LineChart, Zap, Shield, ChevronRight, Loader2, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Props {
  onBack: () => void;
}

const PLANS = {
  monthly: {
    priceId: 'price_1TJbsHQxOeP7HEjBGcb0ub9R',
    productId: 'prod_UICGwOmZSlKxkE',
    name: 'Monthly',
    price: '$9.99',
    period: '/mo',
    popular: false,
  },
  annual: {
    priceId: 'price_1TJbsdQxOeP7HEjBm7CvsfXL',
    productId: 'prod_UICHPCllQf1Mll',
    name: 'Annual',
    price: '$79.99',
    period: '/yr',
    popular: true,
    save: 'Save 33%',
  },
};

const features = [
  { icon: Sparkles, title: 'AI Pick Analysis', desc: 'Get AI-powered confidence scores and sharp-money context on every bet', color: 'text-green' },
  { icon: LineChart, title: 'Advanced Analytics', desc: 'Deep ROI tracking, league-by-league breakdowns, and trend analysis', color: 'text-accent' },
  { icon: Zap, title: 'Real-Time Odds', desc: 'Compare odds across DraftKings, FanDuel, BetMGM, and 10+ sportsbooks', color: 'text-amber' },
  { icon: Shield, title: 'Unlimited History', desc: 'Full bet history with exportable data and advanced filtering', color: 'text-purple' },
];

export function PremiumScreen({ onBack }: Props) {
  const { profile, subscription, refreshSubscription } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const plan = PLANS[selectedPlan];
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: plan.priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to open subscription management');
    } finally {
      setPortalLoading(false);
    }
  };

  const isSubscribed = subscription?.subscribed || profile?.is_premium;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Hero */}
      <div className="text-center pt-4">
        <div className="w-16 h-16 rounded-2xl gradient-premium mx-auto flex items-center justify-center mb-4 shadow-[0_0_40px_hsl(var(--purple)/0.3)]">
          <Crown size={28} className="text-foreground" />
        </div>
        <h1 className="font-display text-2xl font-extrabold mb-2">
          {isSubscribed ? 'You\'re Pro 🎉' : 'Go Pro'}
        </h1>
        <p className="text-muted-foreground text-sm max-w-[280px] mx-auto leading-relaxed">
          {isSubscribed
            ? `Your subscription renews ${subscription?.subscription_end ? new Date(subscription.subscription_end).toLocaleDateString() : 'soon'}.`
            : 'Unlock AI-powered insights, real-time odds, and advanced analytics across all leagues.'}
        </p>
      </div>

      {/* Features */}
      <div className="space-y-2">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-surface border border-border rounded-lg p-4 flex items-start gap-3"
            >
              <div className={`mt-0.5 ${f.color}`}><Icon size={18} /></div>
              <div>
                <div className="font-display text-sm font-bold mb-0.5">{f.title}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{f.desc}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {isSubscribed ? (
        <>
          <button
            onClick={handleManage}
            disabled={portalLoading}
            className="w-full bg-surface border border-border text-foreground font-display font-bold text-sm py-3.5 rounded-full flex items-center justify-center gap-2 hover:border-accent/30 transition-all"
          >
            {portalLoading ? <Loader2 size={16} className="animate-spin" /> : <Settings size={16} />}
            Manage Subscription
          </button>
          <button
            onClick={() => refreshSubscription()}
            className="w-full text-center text-muted-foreground text-xs font-mono hover:text-foreground transition-colors py-1"
          >
            Refresh status
          </button>
        </>
      ) : (
        <>
          {/* Pricing */}
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(PLANS).map(([key, p]) => (
              <button
                key={key}
                onClick={() => setSelectedPlan(key as 'monthly' | 'annual')}
                className={`relative p-4 rounded-lg border text-left transition-all hover:-translate-y-0.5
                  ${selectedPlan === key
                    ? 'border-purple bg-purple/10 shadow-[0_0_20px_hsl(var(--purple)/0.2)]'
                    : p.popular
                      ? 'border-purple/30 bg-purple/5'
                      : 'border-border bg-surface hover:border-accent/30'}`}
              >
                {p.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full gradient-premium text-foreground">
                    Best value
                  </span>
                )}
                <div className="font-mono text-[10px] text-text-dim uppercase tracking-wider mb-2">{p.name}</div>
                <div className="font-display text-xl font-extrabold">
                  {p.price}<span className="text-xs text-muted-foreground font-normal">{p.period}</span>
                </div>
                {p.save && <div className="font-mono text-[10px] text-green mt-1">{p.save}</div>}
              </button>
            ))}
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full gradient-premium text-foreground font-display font-bold text-sm py-3.5 rounded-full flex items-center justify-center gap-2 shadow-[0_4px_20px_hsl(var(--purple)/0.3)] hover:shadow-[0_6px_28px_hsl(var(--purple)/0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Crown size={16} />}
            {loading ? 'Opening checkout...' : 'Start 7-day free trial'}
            {!loading && <ChevronRight size={16} />}
          </button>
        </>
      )}

      <button onClick={onBack} className="w-full text-center text-muted-foreground text-xs font-mono hover:text-foreground transition-colors py-2">
        ← Back to app
      </button>

      <div className="text-center text-[10px] text-text-dim font-mono pb-4">
        Cancel anytime · No commitment
      </div>
    </motion.div>
  );
}
