import { BarChart3, Brain, Calendar, User, Users } from 'lucide-react';

const tabs = [
  { id: 'home', label: 'Home', icon: BarChart3 },
  { id: 'schedule', label: 'Games', icon: Calendar },
  { id: 'analyzer', label: 'AI', icon: Brain },
  { id: 'social', label: 'Social', icon: Users },
  { id: 'profile', label: 'Profile', icon: User },
] as const;

export type TabId = typeof tabs[number]['id'];

interface Props {
  active: TabId;
  onChange: (id: TabId) => void;
}

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[560px] bg-background/92 backdrop-blur-xl border-t border-border z-50 grid grid-cols-5 py-1.5">
      {tabs.map(t => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex flex-col items-center gap-0.5 py-1.5 px-1 font-mono text-[9px] uppercase tracking-wider transition-colors relative
              ${isActive ? 'text-primary' : 'text-text-dim hover:text-muted-foreground'}`}
          >
            <Icon size={18} />
            {t.label}
            {isActive && (
              <span className="absolute -bottom-1.5 left-[20%] right-[20%] h-0.5 rounded-full gradient-primary" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
