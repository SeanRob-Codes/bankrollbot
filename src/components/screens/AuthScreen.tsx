import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export function AuthScreen({ onClose }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-6">
      {/* Logo */}
      <div className="text-center">
        <div className="w-14 h-14 rounded-xl gradient-primary mx-auto flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-[0_4px_20px_hsl(var(--green)/0.4)] mb-4 font-display">
          ₿
        </div>
        <h1 className="font-display text-2xl font-extrabold">BankrollBot</h1>
        <p className="text-muted-foreground text-xs font-mono mt-1">Studio · AI Edition</p>
      </div>

      {/* Tab toggle */}
      <div className="flex bg-surface border border-border rounded-full p-1">
        <button
          onClick={() => setMode('login')}
          className={`flex-1 font-display text-xs font-bold py-2.5 rounded-full transition-all ${mode === 'login' ? 'gradient-primary text-primary-foreground' : 'text-muted-foreground'}`}
        >
          Sign in
        </button>
        <button
          onClick={() => setMode('signup')}
          className={`flex-1 font-display text-xs font-bold py-2.5 rounded-full transition-all ${mode === 'signup' ? 'gradient-primary text-primary-foreground' : 'text-muted-foreground'}`}
        >
          Sign up
        </button>
      </div>

      {/* Social buttons */}
      <div className="space-y-2.5">
        <SocialButton icon="🍎" label={`${mode === 'login' ? 'Sign in' : 'Sign up'} with Apple`} />
        <SocialButton icon="G" label={`${mode === 'login' ? 'Sign in' : 'Sign up'} with Google`} isGoogle />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="font-mono text-[10px] text-text-dim uppercase">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Form */}
      <div className="space-y-3">
        {mode === 'signup' && (
          <InputField icon={<User size={16} />} value={name} onChange={setName} placeholder="Name" />
        )}
        <InputField icon={<Mail size={16} />} value={email} onChange={setEmail} placeholder="Email" type="email" />
        <div className="relative">
          <InputField icon={<Lock size={16} />} value={password} onChange={setPassword} placeholder="Password" type={showPw ? 'text' : 'password'} />
          <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-foreground transition-colors">
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {mode === 'login' && (
          <button className="text-right w-full text-[11px] text-accent font-mono hover:underline">
            Forgot password?
          </button>
        )}

        <button className="w-full gradient-primary text-primary-foreground font-display font-bold text-sm py-3 rounded-full glow-green hover:shadow-[var(--glow-green-lg)] hover:-translate-y-0.5 active:translate-y-0 transition-all">
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </div>

      <button onClick={onClose} className="w-full text-center text-muted-foreground text-xs font-mono hover:text-foreground transition-colors py-2">
        Skip for now →
      </button>
    </motion.div>
  );
}

function InputField({ icon, value, onChange, placeholder, type = 'text' }: { icon: React.ReactNode; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim">{icon}</div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-3 text-foreground text-sm outline-none placeholder:text-text-dim focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
      />
    </div>
  );
}

function SocialButton({ icon, label, isGoogle }: { icon: string; label: string; isGoogle?: boolean }) {
  return (
    <button className="w-full bg-surface border border-border rounded-lg py-3 flex items-center justify-center gap-3 font-display text-sm font-bold hover:border-accent/30 hover:bg-surface-2 transition-all">
      <span className={isGoogle ? 'text-base font-bold' : 'text-lg'}>{icon}</span>
      {label}
    </button>
  );
}
