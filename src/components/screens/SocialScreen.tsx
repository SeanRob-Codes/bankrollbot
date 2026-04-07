import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, MessageCircle, Copy, Send, Trophy, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface SocialPost {
  id: string;
  user_id: string;
  bet_id: string | null;
  caption: string;
  created_at: string;
  profile?: { username: string; avatar_url: string | null; bet_score: number };
  bet?: { league: string; match: string; market: string; odds: number; units: number; result: string };
  likes: number;
  dislikes: number;
  myReaction: 'like' | 'dislike' | null;
  commentCount: number;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: { username: string; avatar_url: string | null };
}

export function SocialScreen() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [caption, setCaption] = useState('');
  const [selectedBetId, setSelectedBetId] = useState('');
  const [myBets, setMyBets] = useState<any[]>([]);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentText, setCommentText] = useState('');

  const loadPosts = async () => {
    const { data: postsData } = await supabase
      .from('social_posts')
      .select('*, bets(*)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!postsData) { setLoading(false); return; }

    const userIds = [...new Set(postsData.map(p => p.user_id))];
    const { data: profiles } = await supabase.from('profiles_public' as any).select('id, username, avatar_url, bet_score').in('id', userIds);
    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

    const postIds = postsData.map(p => p.id);
    const { data: reactions } = await supabase.from('post_reactions').select('*').in('post_id', postIds);
    const { data: commentCounts } = await supabase.from('post_comments').select('post_id').in('post_id', postIds);

    const enriched: SocialPost[] = postsData.map(p => {
      const postReactions = (reactions || []).filter(r => r.post_id === p.id);
      const likes = postReactions.filter(r => r.reaction_type === 'like').length;
      const dislikes = postReactions.filter(r => r.reaction_type === 'dislike').length;
      const myR = postReactions.find(r => r.user_id === user?.id);
      const cc = (commentCounts || []).filter((c: any) => c.post_id === p.id).length;

      return {
        ...p,
        profile: profileMap.get(p.user_id),
        bet: p.bets as any,
        likes,
        dislikes,
        myReaction: (myR?.reaction_type as 'like' | 'dislike') || null,
        commentCount: cc,
      };
    });

    setPosts(enriched);
    setLoading(false);
  };

  const loadLeaderboard = async () => {
    const { data } = await supabase.from('profiles').select('id, username, avatar_url, bet_score').order('bet_score', { ascending: false }).limit(10);
    if (data) setLeaderboard(data);
  };

  const loadMyBets = async () => {
    if (!user) return;
    const { data } = await supabase.from('bets').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
    if (data) setMyBets(data);
  };

  useEffect(() => {
    loadPosts();
    loadLeaderboard();
    loadMyBets();

    const channel = supabase.channel('social_feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'social_posts' }, () => loadPosts())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const sharePost = async () => {
    if (!user || !caption.trim()) return;
    await supabase.from('social_posts').insert({
      user_id: user.id,
      bet_id: selectedBetId || null,
      caption: caption.trim(),
    });
    setCaption('');
    setSelectedBetId('');
    toast.success('Pick shared!');
    loadPosts();
  };

  const react = async (postId: string, type: 'like' | 'dislike') => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (post?.myReaction === type) {
      await supabase.from('post_reactions').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      await supabase.from('post_reactions').upsert({ post_id: postId, user_id: user.id, reaction_type: type }, { onConflict: 'post_id,user_id' });
    }
    loadPosts();
  };

  const copyBet = async (post: SocialPost) => {
    if (!user || !post.bet) return;
    const { data: newBet } = await supabase.from('bets').insert({
      user_id: user.id,
      league: post.bet.league,
      match: post.bet.match,
      market: post.bet.market,
      odds: post.bet.odds,
      units: post.bet.units,
    }).select().single();

    if (newBet) {
      await supabase.from('bet_copies').insert({
        original_bet_id: post.bet_id!,
        original_user_id: post.user_id,
        copier_user_id: user.id,
        copier_bet_id: newBet.id,
      });
      await supabase.from('notifications').insert({
        user_id: post.user_id,
        type: 'bet_copied',
        title: 'Someone used your pick!',
        message: `${profile?.username || 'A user'} copied your bet on ${post.bet.market}`,
        related_post_id: post.id,
      });
      toast.success('Bet copied to your log!');
    }
  };

  const loadComments = async (postId: string) => {
    const { data } = await supabase.from('post_comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
    if (!data) return;
    const uids = [...new Set(data.map(c => c.user_id))];
    const { data: profs } = await supabase.from('profiles').select('id, username, avatar_url').in('id', uids);
    const pm = new Map((profs || []).map(p => [p.id, p]));
    setComments(prev => ({ ...prev, [postId]: data.map(c => ({ ...c, profile: pm.get(c.user_id) })) }));
  };

  const toggleComments = (postId: string) => {
    if (expandedComments === postId) {
      setExpandedComments(null);
    } else {
      setExpandedComments(postId);
      loadComments(postId);
    }
  };

  const addComment = async (postId: string) => {
    if (!user || !commentText.trim()) return;
    await supabase.from('post_comments').insert({ post_id: postId, user_id: user.id, content: commentText.trim() });
    const post = posts.find(p => p.id === postId);
    if (post && post.user_id !== user.id) {
      await supabase.from('notifications').insert({
        user_id: post.user_id,
        type: 'comment',
        title: 'New comment on your pick',
        message: `${profile?.username || 'Someone'}: "${commentText.trim().slice(0, 50)}"`,
        related_post_id: postId,
      });
    }
    setCommentText('');
    loadComments(postId);
    loadPosts();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <SectionLabel><Trophy size={12} className="mr-1.5 text-amber" /> Leaderboard</SectionLabel>
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {leaderboard.slice(0, 5).map((u, i) => (
          <div key={u.id} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
            <span className={`font-display font-extrabold text-sm w-6 ${i === 0 ? 'text-amber' : i === 1 ? 'text-muted-foreground' : 'text-text-dim'}`}>#{i + 1}</span>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-2 flex-shrink-0">
              {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-display font-bold text-xs text-muted-foreground">{(u.username || '??')[0]?.toUpperCase()}</div>}
            </div>
            <div className="flex-1 min-w-0"><div className="font-display font-bold text-sm truncate">{u.username || 'Anon'}</div></div>
            <div className="flex items-center gap-1 text-green font-mono text-xs font-bold"><TrendingUp size={12} /> {u.bet_score}</div>
          </div>
        ))}
        {leaderboard.length === 0 && <div className="text-center py-6 text-muted-foreground text-sm">No scores yet</div>}
      </div>

      {user && (
        <>
          <SectionLabel>Share a pick</SectionLabel>
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            {myBets.length > 0 && (
              <select value={selectedBetId} onChange={e => setSelectedBetId(e.target.value)} className="w-full bg-card border border-border rounded-lg p-2.5 text-sm text-foreground outline-none focus:border-accent">
                <option value="">Attach a bet (optional)</option>
                {myBets.map(b => <option key={b.id} value={b.id}>{b.league} · {b.market} ({Number(b.odds) > 0 ? '+' : ''}{b.odds})</option>)}
              </select>
            )}
            <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Share your analysis..." className="w-full bg-card border border-border rounded-lg p-3 text-sm text-foreground outline-none placeholder:text-text-dim focus:border-accent min-h-[60px] resize-none" />
            <button onClick={sharePost} disabled={!caption.trim()} className="w-full gradient-primary text-primary-foreground font-display font-bold text-sm py-3 rounded-full glow-green transition-all flex items-center justify-center gap-2 disabled:opacity-40">
              <Send size={14} /> Share pick
            </button>
          </div>
        </>
      )}

      <SectionLabel>Community feed</SectionLabel>
      <div className="space-y-3">
        {posts.map(post => (
          <div key={post.id} className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 pt-4 pb-2">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-surface-2 flex-shrink-0">
                {post.profile?.avatar_url ? <img src={post.profile.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-display font-bold text-xs text-muted-foreground">{(post.profile?.username || '?')[0]?.toUpperCase()}</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-sm truncate">{post.profile?.username || 'Anon'}</span>
                  <span className="flex items-center gap-0.5 text-green font-mono text-[10px]"><TrendingUp size={10} />{post.profile?.bet_score || 0}</span>
                </div>
                <div className="font-mono text-[10px] text-text-dim">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</div>
              </div>
            </div>

            {post.bet && (
              <div className="mx-4 mb-2 bg-card border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">{post.bet.league}</span>
                  <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${post.bet.result === 'win' ? 'bg-green/10 text-green' : post.bet.result === 'loss' ? 'bg-red/10 text-red' : 'bg-surface-2 text-text-dim'}`}>
                    {post.bet.result === 'win' ? '✓ HIT' : post.bet.result === 'loss' ? '✗ MISS' : 'PENDING'}
                  </span>
                </div>
                <div className="font-display font-bold text-sm">{post.bet.market}</div>
                <div className="text-xs text-muted-foreground">{post.bet.match}</div>
                <div className="flex gap-3 mt-1.5 font-mono text-[10px] text-text-dim">
                  <span>Odds: {Number(post.bet.odds) > 0 ? '+' : ''}{post.bet.odds}</span>
                  <span>{post.bet.units}u</span>
                </div>
              </div>
            )}

            <div className="px-4 pb-3"><p className="text-sm text-foreground">{post.caption}</p></div>

            <div className="flex items-center gap-1 px-3 pb-3">
              <button onClick={() => react(post.id, 'like')} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-mono transition-colors ${post.myReaction === 'like' ? 'bg-green/10 text-green' : 'text-text-dim hover:text-foreground'}`}>
                <ThumbsUp size={14} /> {post.likes}
              </button>
              <button onClick={() => react(post.id, 'dislike')} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-mono transition-colors ${post.myReaction === 'dislike' ? 'bg-red/10 text-red' : 'text-text-dim hover:text-foreground'}`}>
                <ThumbsDown size={14} /> {post.dislikes}
              </button>
              <button onClick={() => toggleComments(post.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-mono text-text-dim hover:text-foreground transition-colors">
                <MessageCircle size={14} /> {post.commentCount}
                {expandedComments === post.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              {post.bet && post.user_id !== user?.id && (
                <button onClick={() => copyBet(post)} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-mono text-accent hover:bg-accent/10 transition-colors ml-auto">
                  <Copy size={14} /> Use bet
                </button>
              )}
            </div>

            <AnimatePresence>
              {expandedComments === post.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border overflow-hidden">
                  <div className="p-3 space-y-2">
                    {(comments[post.id] || []).map(c => (
                      <div key={c.id} className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-surface-2 flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-text-dim">{(c.profile?.username || '?')[0]?.toUpperCase()}</div>
                        <div>
                          <span className="font-display font-bold text-xs">{c.profile?.username || 'Anon'}</span>
                          <span className="font-mono text-[9px] text-text-dim ml-2">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
                          <p className="text-xs text-muted-foreground">{c.content}</p>
                        </div>
                      </div>
                    ))}
                    {user && (
                      <div className="flex gap-2 mt-2">
                        <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-xs outline-none placeholder:text-text-dim focus:border-accent" onKeyDown={e => e.key === 'Enter' && addComment(post.id)} />
                        <button onClick={() => addComment(post.id)} className="text-accent hover:text-green transition-colors"><Send size={16} /></button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        {!loading && posts.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">No picks shared yet. Be the first!</div>}
      </div>
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-[10px] text-text-dim uppercase tracking-[0.14em] mt-5 mb-2 flex items-center">{children}</div>;
}
