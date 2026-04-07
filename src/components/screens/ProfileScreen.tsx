import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, TrendingUp, Crown, LogOut, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { calcStats } from '@/lib/betting';
import { toast } from 'sonner';
import { useEffect } from 'react';

interface Props {
  onUpgrade: () => void;
}

export function ProfileScreen({ onUpgrade }: Props) {
  const { profile, user, updateProfile, uploadAvatar, signOut } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState(profile?.username || '');
  const [bankroll, setBankroll] = useState(profile?.bankroll?.toString() || '');
  const [unitSize, setUnitSize] = useState(profile?.unit_size?.toString() || '');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [bets, setBets] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      supabase.from('bets').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => {
        if (data) setBets(data);
      });
      supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20).then(({ data }) => {
        if (data) setNotifications(data);
      });
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setBankroll(profile.bankroll?.toString() || '');
      setUnitSize(profile.unit_size?.toString() || '');
    }
  }, [profile]);

  const stats = calcStats(bets.map(b => ({ ...b, odds: Number(b.odds), units: Number(b.units) })));

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadAvatar(file);
    if (url) toast.success('Avatar updated!');
  };

  const save = async () => {
    await updateProfile({
      username: username.trim() || 'Bettor',
      bankroll: parseFloat(bankroll) || 0,
      unit_size: parseFloat(unitSize) || 25,
    } as any);
    toast.success('Profile saved!');
  };

  const markNotifsRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex flex-col items-center py-4">
        <div className="relative group cursor-pointer mb-3" onClick={() => fileRef.current?.click()}>
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-green/30 bg-surface">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center gradient-primary text-2xl font-display font-bold text-primary-foreground">
                {(profile?.username || 'B')[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="absolute inset-0 rounded-full bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={20} className="text-foreground" />
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div className="font-display text-lg font-extrabold">{profile?.username || 'Bettor'}</div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-1 text-green font-mono text-sm">
            <TrendingUp size={14} /> {profile?.bet_score || 0}
          </div>
          {profile?.is_premium && (
            <span className="font-mono text-[9px] px-2 py-0.5 rounded-full gradient-premium text-primary-foreground">PRO</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <SectionLabel>Notifications</SectionLabel>
        <button onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) markNotifsRead(); }} className="relative">
          <Bell size={18} className="text-text-dim hover:text-foreground transition-colors" />
          {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red text-[9px] font-bold flex items-center justify-center text-primary-foreground">{unreadCount}</span>}
        </button>
      </div>

      {showNotifs && (
        <div className="bg-surface border border-border rounded-xl divide-y divide-border max-h-48 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No notifications yet</div>
          ) : notifications.map(n => (
            <div key={n.id} className={`p-3 ${!n.read ? 'bg-accent/5' : ''}`}>
              <div className="font-display font-bold text-xs">{n.title}</div>
              <div className="text-[11px] text-muted-foreground">{n.message}</div>
            </div>
          ))}
        </div>
      )}

      <SectionLabel>Your stats</SectionLabel>
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Win rate" value={stats.hitRate ? `${stats.hitRate.toFixed(0)}%` : '—'} />
        <StatCard label="Record" value={`${stats.wins}-${stats.losses}`} />
        <StatCard label="Net units" value={`${stats.net >= 0 ? '+' : ''}${stats.net.toFixed(1)}u`} positive={stats.net >= 0} />
      </div>

      <SectionLabel>Settings</SectionLabel>
      <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
        <div>
          <FormLabel>Username</FormLabel>
          <input value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FormLabel>Bankroll ($)</FormLabel>
            <input value={bankroll} onChange={e => setBankroll(e.target.value)} type="number" className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent" />
          </div>
          <div>
            <FormLabel>Unit size ($)</FormLabel>
            <input value={unitSize} onChange={e => setUnitSize(e.target.value)} type="number" className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent" />
          </div>
        </div>
        <button onClick={save} className="w-full gradient-primary text-primary-foreground font-display font-bold text-sm py-3 rounded-full glow-green transition-all">Save profile</button>
      </div>

      {!profile?.is_premium && (
        <button onClick={onUpgrade} className="w-full gradient-premium text-primary-foreground font-display font-bold text-sm py-3 rounded-full flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all">
          <Crown size={16} /> Upgrade to Pro
        </button>
      )}

      <button onClick={signOut} className="w-full bg-surface border border-border text-muted-foreground font-display font-bold text-sm py-3 rounded-full flex items-center justify-center gap-2 hover:border-red/30 hover:text-red transition-colors">
        <LogOut size={16} /> Sign out
      </button>
    </motion.div>
  );
}

function StatCard({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-3 text-center">
      <div className="font-mono text-[9px] text-text-dim uppercase tracking-wider mb-1">{label}</div>
      <div className={`font-display font-extrabold text-lg ${positive === true ? 'text-green' : positive === false ? 'text-red' : ''}`}>{value}</div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-[10px] text-text-dim uppercase tracking-[0.14em] mt-5 mb-2 flex items-center">{children}</div>;
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="block font-mono text-[10px] text-text-dim uppercase tracking-[0.1em] mb-1">{children}</label>;
}
