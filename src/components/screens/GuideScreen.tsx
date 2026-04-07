import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronRight, ChevronDown, Search, GraduationCap } from 'lucide-react';

interface Article {
  title: string;
  content: string;
  category: string;
}

const ARTICLES: Article[] = [
  {
    category: 'Basics',
    title: 'How to Read Sports Odds',
    content: `Sports odds represent the probability of an outcome and determine your payout. There are three main formats:\n\n**American Odds** (most common in the US)\n- Negative (-150): How much you must bet to win $100. A -150 line means you risk $150 to win $100.\n- Positive (+130): How much you win on a $100 bet. A +130 line means you win $130 on a $100 wager.\n\n**Decimal Odds** (popular internationally)\n- Simply multiply your stake by the decimal. A $100 bet at 2.50 = $250 total return ($150 profit).\n\n**Fractional Odds** (common in UK)\n- 5/2 means you win $5 for every $2 wagered.\n\n**Converting Between Formats:**\n- American to Decimal: If negative, (100/odds)+1. If positive, (odds/100)+1.\n- The "implied probability" tells you what chance the book gives an outcome: for -150, it's 60%. For +130, it's 43.5%.`,
  },
  {
    category: 'Basics',
    title: 'Moneyline Explained',
    content: `The moneyline is the simplest bet — you're picking which team wins, period. No point spread involved.\n\n**How It Works:**\n- Favorite: Listed with a minus sign (-180). You risk $180 to win $100.\n- Underdog: Listed with a plus sign (+160). You risk $100 to win $160.\n\n**When to Bet Moneyline:**\n- When you're confident a team wins but unsure about the margin\n- Underdogs in close matchups often offer great moneyline value\n- Parlaying moneyline favorites (though this carries compounding risk)\n\n**Key Tip:** Always compare moneyline odds across sportsbooks. A -170 at one book might be -155 at another — that difference adds up over hundreds of bets.`,
  },
  {
    category: 'Basics',
    title: 'Betting Against the Spread',
    content: `Point spread betting levels the playing field between favorites and underdogs.\n\n**How It Works:**\n- The favorite "gives" points: Dallas -7.5 means Dallas must win by 8+ for the bet to cash.\n- The underdog "gets" points: NYG +7.5 means the Giants can lose by up to 7 and the bet still wins.\n\n**Key Numbers in NFL:** 3, 7, 6, 10, 14 — these are the most common margins of victory. A spread of -3 or -7 has historically significant push rates.\n\n**ATS (Against the Spread) Records:** Track how often a team covers the spread, not just wins. A team can be 10-6 straight up but 6-10 ATS if they're over-valued by the public.\n\n**Buying Points:** Some books let you move the spread by paying extra juice. Buying through key numbers (like 3 in football) can be worth it.`,
  },
  {
    category: 'Basics',
    title: 'Over / Under Betting (Totals)',
    content: `Also called "totals" — you bet on whether the combined score of both teams will go over or under a set number.\n\n**Example:** NBA game total set at 224.5\n- Over: You win if the combined final score is 225+\n- Under: You win if the combined final score is 224 or less\n\n**Factors That Affect Totals:**\n- Pace of play (fast teams push overs)\n- Defensive ratings and matchup history\n- Weather (wind/rain suppresses scoring in outdoor sports)\n- Injuries to key offensive/defensive players\n- Back-to-back games (fatigue = lower scoring)\n\n**Sharp Tip:** Totals are often where sharp bettors find the most value because the public tends to bet overs, creating soft unders.`,
  },
  {
    category: 'Basics',
    title: 'What Is the Vigorish / Juice?',
    content: `The vigorish (vig) or juice is the sportsbook's commission on every bet. It's how they guarantee profit.\n\n**Standard Juice:** -110 on both sides. You risk $110 to win $100.\n- The book collects $110 from each side. Pays out $210 to the winner. Keeps $10 (4.5% margin).\n\n**Reduced Juice:** Some books offer -105 or even -102. This dramatically improves your long-term edge.\n- At -110, you need to win 52.4% to break even\n- At -105, you only need 51.2%\n- That 1.2% difference is HUGE over thousands of bets\n\n**Always shop for the best line and lowest juice.** This is the single easiest way to improve your betting results.`,
  },
  {
    category: 'Bet Types',
    title: 'Parlays & Teasers',
    content: `**Parlays** combine multiple bets into one. All legs must hit for the parlay to win.\n- 2-team parlay at -110 each pays roughly +264 (2.64x)\n- 3-team parlay pays roughly +596 (5.96x)\n- The more legs, the higher the payout — but the lower the probability\n\n**Why Sharps Avoid Parlays:** The house edge compounds with each leg. A 2-leg parlay has ~10% house edge vs ~4.5% on a single bet.\n\n**When Parlays Make Sense:** Correlated parlays where outcomes are linked (e.g., team wins + under in a blowout scenario).\n\n**Teasers** let you adjust the spread in your favor across multiple games:\n- NFL 6-point teaser: Move each spread 6 points. -7 becomes -1, +3 becomes +9.\n- Key: Teasing through 3 and 7 in NFL is historically profitable ("Wong teasers").\n- Standard 2-team 6-point teaser pays -120.`,
  },
  {
    category: 'Bet Types',
    title: 'Prop Bets',
    content: `Prop bets (propositions) are wagers on specific events within a game, not the final outcome.\n\n**Player Props:** Most popular category\n- Points (Luka Doncic over 30.5 points)\n- Rebounds, assists, steals, blocks\n- Passing/rushing/receiving yards in football\n- Strikeouts, hits, home runs in baseball\n\n**Game Props:**\n- First team to score, first basket, race to 20 points\n- Will there be overtime?\n- Exact score / winning margin\n\n**Finding Value in Props:**\n- Books set player prop lines based on season averages — but matchups matter more\n- Check recent form (last 5-10 games) vs. the season average\n- Pace and matchup data are your best friends\n- Injury to teammates can inflate one player's usage\n\n**Beware:** Props often carry higher juice (-115 to -125) and lower limits.`,
  },
  {
    category: 'Bet Types',
    title: 'Futures Bets',
    content: `Futures are long-term bets placed on outcomes decided weeks or months later.\n\n**Examples:**\n- Super Bowl winner (+800 means $100 wins $800)\n- NBA MVP (+350)\n- Over/Under team season wins (Buffalo Bills over 10.5 wins)\n- Conference/Division winners\n\n**Advantages:**\n- Huge payouts possible at early odds\n- You can find value before the public catches on\n- Hedging opportunities as the season progresses\n\n**Disadvantages:**\n- Your money is locked up for a long time\n- Injuries can tank a future bet with no recourse\n- The juice on futures is typically very high (15-30% margins)\n\n**Sharp Strategy:** Place futures early when lines are softest. The preseason is when the biggest edges exist.`,
  },
  {
    category: 'Bet Types',
    title: 'Live Betting (In-Game)',
    content: `Live betting lets you place wagers while the game is in progress. Lines update in real-time based on score, time, and momentum.\n\n**Advantages:**\n- Watch the game flow before committing money\n- Exploit overreactions to early scores\n- Hedge pre-game bets\n\n**Key Strategies:**\n- Bet the under after a fast start — regression is real\n- Back a favorite that falls behind early (their pre-game line was -7, they're now +3)\n- Watch for momentum shifts and line lag\n\n**Risks:**\n- Odds move fast — you may get worse numbers\n- Easy to chase losses in real-time\n- Sportsbooks have a major edge with faster data feeds\n\n**Discipline is critical with live betting.** Set a unit limit per game and stick to it.`,
  },
  {
    category: 'Bet Types',
    title: 'Grand Salami Betting',
    content: `A Grand Salami is a totals bet on ALL games in a league on a given day.\n\n**How It Works:**\n- The sportsbook sets a combined total for every game that day\n- You bet over or under that number\n- Example: 8 NHL games with a Grand Salami of 47.5 total goals\n\n**Best For:** NHL and MLB where daily game counts are high and totals are relatively predictable.\n\n**Strategy:** Look for slates heavy with high-scoring or low-scoring matchups. Weather, pitching matchups (MLB), and back-to-backs (NHL) can skew the number.`,
  },
  {
    category: 'Bet Types',
    title: 'Three-Way Moneyline Bets',
    content: `In sports where ties/draws are possible (soccer, some hockey markets), a three-way moneyline offers three outcomes: Team A wins, Team B wins, or Draw.\n\n**Key Difference from 2-Way:**\n- In a 2-way moneyline, overtime decides the winner\n- In a 3-way line, the bet settles at the end of regulation\n\n**Typical Odds:** Home +150 / Draw +220 / Away +180\n- The draw is often undervalued by casual bettors\n\n**Strategy:** In soccer especially, draws occur ~25-28% of the time. Look for matchups between evenly-matched teams where the draw price is inflated.`,
  },
  {
    category: 'Bet Types',
    title: 'Head-to-Head Bets',
    content: `Head-to-head bets pit two competitors against each other — common in golf, NASCAR, tennis, and F1.\n\n**How It Works:**\n- Book sets odds on which of two players/drivers will finish higher\n- Example: Tiger Woods (-130) vs. Phil Mickelson (+110) — who finishes better in the tournament?\n\n**Finding Value:**\n- Recent form and course/track history matter more than overall rankings\n- Weather and conditions can heavily favor one competitor\n- In racing, qualifying positions and team strategy play a role`,
  },
  {
    category: 'Bet Types',
    title: 'What Is An If Bet?',
    content: `An "If Bet" is a conditional wager where subsequent bets are only placed if the first one wins (or pushes).\n\n**How It Works:**\n1. You place Bet A first\n2. If Bet A wins, your original stake (plus winnings or just stake) automatically goes to Bet B\n3. If Bet A loses, Bet B is never placed\n\n**Advantage Over Parlays:** You can still win money even if later legs lose. In a parlay, one loss kills everything.\n\n**Example:**\n- $100 If Bet: Chiefs -3 (-110) → then Lakers ML (-150)\n- Chiefs win: $100 + $90.91 profit. $100 goes to Lakers bet.\n- Chiefs lose: You lose $100, Lakers bet never happens.`,
  },
  {
    category: 'Bet Types',
    title: 'Season Win Total Betting',
    content: `Season win totals let you bet on how many games a team will win over the full season.\n\n**Example:** Celtics over/under 54.5 wins\n- Over 54.5 at -110: You think they win 55+\n- Under 54.5 at -110: You think they win 54 or fewer\n\n**Key Factors:**\n- Offseason roster changes (trades, free agency, draft)\n- Strength of schedule\n- Coaching changes\n- Injury history of key players\n\n**When to Bet:** Preseason lines are softest. As the season goes on, lines sharpen and value decreases.\n\n**Sharp Angle:** Compare your own win projection to the book's number. If you have the Celtics at 57 wins and the line is 54.5, that's a strong over.`,
  },
  {
    category: 'Bet Types',
    title: 'Pleasers vs Teasers',
    content: `While teasers move the line in YOUR favor, pleasers move it AGAINST you — in exchange for much higher payouts.\n\n**Teaser:** You adjust the spread in your favor\n- Cowboys -7 becomes -1 (6-point teaser)\n- Lower payout, higher win probability\n\n**Pleaser:** You adjust the spread against yourself\n- Cowboys -7 becomes -13 (6-point pleaser)\n- Much higher payout, much lower win probability\n\n**Pleasers are extremely risky** and generally not recommended. The house edge on pleasers is significantly higher than standard bets. Stick to teasers through key numbers if you want to adjust spreads.`,
  },
  {
    category: 'Bet Types',
    title: 'Dual Lines',
    content: `Some sportsbooks offer dual lines — two different spread or total options for the same game with different juice.\n\n**Example:**\n- Patriots -3 (-110) OR Patriots -2.5 (-125)\n- The tighter spread (-2.5) costs more juice but is easier to cover\n\n**When Dual Lines Help:**\n- When you want to buy through a key number without the full cost of "buying points"\n- When comparing value between the standard line and an alternative\n\n**Strategy:** Calculate the break-even win rate for each option and choose the one with better expected value based on your model.`,
  },
  {
    category: 'Bet Types',
    title: 'Dead Heat Betting',
    content: `A dead heat occurs when two or more competitors tie for a position. Common in golf, horse racing, and swimming.\n\n**How Payouts Work:**\n- Your stake is divided by the number of competitors sharing the position\n- If you bet $100 on a golfer to finish Top 5 and they tie for 5th with one other player, you get paid on $50 instead of $100\n\n**Impact:** This can significantly reduce your expected payout. Factor dead heat possibilities into your calculations, especially in golf top-finish markets.`,
  },
  {
    category: 'Strategy',
    title: 'Bankroll Management',
    content: `Bankroll management is the #1 factor separating winning bettors from losing ones. It's more important than picking winners.\n\n**The Rules:**\n1. **Set a bankroll** — money you can afford to lose entirely\n2. **Define your unit size** — typically 1-3% of your bankroll\n3. **Never chase losses** — stick to your unit size regardless\n4. **Track everything** — log every bet, odds, units, result\n\n**Recommended Approaches:**\n- **Flat betting:** Same unit size every bet (safest)\n- **Confidence-based:** 1-3 units based on edge (moderate risk)\n- **Kelly Criterion:** Size bets proportional to your edge (advanced)\n\n**Red Flags You're Over-Betting:**\n- Betting more than 5% of bankroll on any single bet\n- Increasing bet size after a loss\n- Feeling stressed about outcomes\n- Needing to deposit more money frequently\n\n**Golden Rule:** If your bankroll drops 50%, cut your unit size in half. Preservation first.`,
  },
  {
    category: 'Strategy',
    title: 'Using Betting Units',
    content: `Units standardize bet sizing so you can track performance regardless of bankroll size.\n\n**What Is a Unit?**\n- A unit = a fixed percentage of your bankroll (typically 1-2%)\n- $1,000 bankroll → 1 unit = $10-$20\n- $5,000 bankroll → 1 unit = $50-$100\n\n**Why Units Matter:**\n- "+10 units" means you've profited 10x your standard bet size\n- Makes it easy to compare tipsters and track records\n- Forces discipline — you can't randomly bet $500 when your unit is $25\n\n**How to Size Bets:**\n- Standard play: 1 unit\n- Confident play: 1.5-2 units\n- Max play (rare): 3 units\n- Never exceed 5 units on any single bet\n\n**Adjusting Over Time:** Re-calculate your unit size monthly based on current bankroll. Up 20%? Your unit grows. Down 30%? Unit shrinks.`,
  },
  {
    category: 'Strategy',
    title: 'Understanding Expected Value & Variance',
    content: `**Expected Value (EV)** is the average amount you win or lose per bet over the long run.\n\n**Formula:** EV = (Win Probability × Profit) - (Loss Probability × Stake)\n\n**Example:** You bet at +150 and believe you'll win 45% of the time:\n- EV = (0.45 × $150) - (0.55 × $100) = $67.50 - $55.00 = +$12.50\n- This is a +EV bet — you expect to profit $12.50 per $100 wagered over time\n\n**Variance** is the short-term randomness:\n- Even with a 5% edge, you can lose 10 bets in a row\n- A 55% bettor has a ~13% chance of being down after 100 bets\n- You need 1,000+ bets for your true edge to become clear\n\n**Key Lesson:** Focus on making +EV bets. Results over a small sample mean almost nothing. Trust the process.`,
  },
  {
    category: 'Strategy',
    title: 'Betting Against the Public',
    content: `"Fading the public" means betting against popular opinion — and it can be a legitimate strategy.\n\n**Why It Works:**\n- Public money tends to favor favorites, overs, and popular teams\n- When 75%+ of bets are on one side, the line may be inflated\n- Sportsbooks shade lines toward the public side to balance action\n\n**When to Fade:**\n- Heavy public sides (75%+) with line movement going the other way (sharp money)\n- Prime-time games and playoffs where casual bettors flood in\n- Popular teams (Cowboys, Lakers, Yankees) that are consistently overvalued\n\n**Caution:** Don't blindly fade the public. Combine this with your own analysis. The public is right more often than contrarian bettors admit.`,
  },
  {
    category: 'Strategy',
    title: 'Using Key Numbers',
    content: `Key numbers are the most common final margins in a sport. In the NFL, these are 3, 7, 6, 10, 14, and 17.\n\n**Why They Matter:**\n- ~15% of NFL games are decided by exactly 3 points\n- ~9% are decided by exactly 7 points\n- Buying through these numbers on spreads provides significant value\n\n**Example:**\n- A spread of -3 has a ~10% chance of pushing. Moving to -2.5 eliminates that push.\n- Buying from -3 to -2.5 might cost 15-20 cents of juice — often worth it.\n\n**In NBA:** Key numbers are less pronounced, but 5-6-7 point margins are slightly more common.\n\n**In MLB/NHL:** Key numbers barely exist due to low scoring. Focus on moneylines and totals instead.`,
  },
  {
    category: 'Strategy',
    title: 'What Happens with a Push?',
    content: `A push occurs when the final result lands exactly on the spread or total number.\n\n**What Happens:**\n- Your original stake is returned — no win, no loss\n- In parlays, the pushed leg is removed and the parlay pays at reduced odds\n\n**Half-Point Spreads:** Lines like -3.5 or +7.5 eliminate pushes entirely. This is why books often use half-points.\n\n**Strategy Around Pushes:**\n- Some bettors prefer buying the half-point to avoid pushes (e.g., -3 to -2.5)\n- In teasers, pushing a leg typically results in the teaser reducing by one team\n- Track your push rate — too many pushes means you're consistently landing on the number`,
  },
  {
    category: 'Strategy',
    title: 'Buying Points',
    content: `Buying points means paying extra juice to move the spread in your favor.\n\n**How It Works:**\n- Standard: Cowboys -7 at -110\n- Buy 1 point: Cowboys -6 at -120\n- Buy through 7: Cowboys -6.5 at -125\n\n**When It's Worth It:**\n- Buying through key numbers (3 and 7 in NFL) is almost always worthwhile\n- Moving from -3 to -2.5 in the NFL has historically been +EV\n\n**When It's NOT Worth It:**\n- Buying non-key numbers (e.g., -5 to -4.5) rarely justifies the extra juice\n- In NBA/MLB where there are few key numbers\n- When the juice exceeds -130 to -140 for the adjusted line\n\n**Rule of Thumb:** Only buy through 3 and 7 in the NFL. Everything else is usually a losing proposition.`,
  },
  {
    category: 'Strategy',
    title: 'The Most Common Betting Mistakes',
    content: `**1. Chasing Losses:** Doubling down after a bad beat. This is the #1 bankroll killer.\n\n**2. Betting Too Many Games:** Quality over quantity. Sharp bettors might only bet 2-3 games a day.\n\n**3. Ignoring Line Shopping:** Not comparing odds across books costs you thousands over a year.\n\n**4. Parlays as Primary Strategy:** The house edge on parlays is enormous. Use them sparingly.\n\n**5. Betting with Your Heart:** Wagering on your favorite team clouds judgment. Bet with data, not emotion.\n\n**6. No Record Keeping:** If you don't track your bets, you can't analyze what's working.\n\n**7. Overvaluing Recent Results:** A team on a 5-game win streak isn't automatically a good bet. Regression exists.\n\n**8. Not Understanding Juice:** The vig is the silent killer. Always factor it into your calculations.\n\n**9. Tilt Betting:** Making impulsive bets after a bad loss. Take a break instead.\n\n**10. Ignoring Bankroll Management:** Even the best picks fail without proper money management.`,
  },
  {
    category: 'Strategy',
    title: 'What Is Strength of Schedule?',
    content: `Strength of Schedule (SOS) measures how tough a team's opponents have been (or will be).\n\n**How It's Calculated:** Average win percentage of all opponents played.\n\n**Why It Matters for Betting:**\n- A 10-2 team with a weak SOS may be overvalued\n- A 7-5 team with the hardest schedule may be undervalued\n- Season win totals should heavily factor in upcoming SOS\n\n**Where to Find It:** ESPN, TeamRankings, and most advanced stats sites publish SOS rankings.\n\n**Caution:** SOS is backward-looking. The schedule ahead matters more for futures and win totals than the schedule already played.`,
  },
  {
    category: 'Advanced',
    title: 'Where Do Sports Odds Come From?',
    content: `Odds are set by a combination of mathematical models, market forces, and oddsmakers.\n\n**Opening Lines:**\n- Created by oddsmakers using power ratings, algorithms, and historical data\n- Often released by market-setting books like Pinnacle, Circa, or BetCRIS\n- Other books copy and adjust based on their own models\n\n**How Lines Move:**\n- Sharp money (professional bettors) causes the biggest early moves\n- Public money (recreational bettors) moves lines closer to game time\n- Injuries, weather, and lineup changes trigger adjustments\n\n**Why It Matters:** Understanding who is moving the line tells you whether the value is on the current number or has already been bet out. Follow sharp moves, fade public steam.`,
  },
  {
    category: 'Advanced',
    title: 'Where Does the Point Spread Come From?',
    content: `The point spread is designed to create equal action on both sides — not to predict the exact margin of victory.\n\n**The Process:**\n1. Oddsmakers build power ratings for every team\n2. Home-field advantage is added (typically 2-3 points in NFL)\n3. An opening line is posted\n4. Bets come in and the line adjusts to balance action\n\n**Misconception:** The spread is NOT the oddsmaker's prediction. It's a number that attracts 50/50 action, guaranteeing the book profits from the juice.\n\n**Using This Knowledge:** When the spread moves against heavy public action, it's usually sharp money. These "reverse line movements" are among the best betting signals available.`,
  },
  {
    category: 'Advanced',
    title: 'What Are Betting Exchanges?',
    content: `Betting exchanges let you bet against other people instead of against a sportsbook.\n\n**How They Work:**\n- You can "back" (bet for) or "lay" (bet against) any outcome\n- Another user takes the other side of your bet\n- The exchange takes a small commission (2-5%) on winnings\n\n**Advantages:**\n- Better odds (no sportsbook margin)\n- Ability to lay bets (act as the bookmaker)\n- Trade positions — buy and sell bets like stocks\n\n**Popular Exchanges:** Betfair, Betdaq, Smarkets\n\n**Note:** Betting exchanges are not legal in all US states. Check your local regulations.`,
  },
  {
    category: 'Advanced',
    title: 'What Is Courtsiding?',
    content: `Courtsiding is the practice of attending a live sporting event and using the slight delay between the actual action and the broadcast/data feed to place bets before odds update.\n\n**How It Works:**\n- A person at the venue sees a point scored live\n- They signal a partner (or use an app) to place a live bet before odds adjust\n- The delay can be 2-10 seconds — enough to exploit\n\n**Legality:** Courtsiding is banned at most venues and illegal in some jurisdictions (notably Australia). Sportsbooks actively fight it with faster data feeds.\n\n**For Bettors:** You're unlikely to do this, but it explains why live betting odds can seem to move before you see the play on TV. The data feed is faster than your broadcast.`,
  },
  {
    category: 'Practical',
    title: 'Common Sportsbook Rules',
    content: `**Key Rules Every Bettor Should Know:**\n\n1. **Minimum/Maximum Bets:** Each book sets limits. Sharp bettors often get limited to small wagers.\n2. **Grading Period:** Most bets grade within minutes. Some (like futures) take months.\n3. **Cancelled Games:** If a game is cancelled, bets are typically voided and stakes returned.\n4. **Rain Delays:** Baseball — game must go 5 innings (4.5 if home team leads) for bets to stand.\n5. **Overtime:** Spreads and totals include OT unless otherwise stated. Moneylines always include OT.\n6. **Line Errors:** Books reserve the right to void bets placed on obviously wrong lines.\n7. **Same-Game Parlays:** Correlated outcomes in the same game. Higher house edge but popular.\n\n**Read The Fine Print:** Every sportsbook has different house rules. Know them before you bet.`,
  },
  {
    category: 'Practical',
    title: 'Why Was My Bet Cancelled?',
    content: `Sportsbooks can cancel (void) your bet for several reasons:\n\n1. **Obvious Line Error:** A -300 favorite listed at +300 by mistake\n2. **Game Cancelled/Postponed:** If the game doesn't happen within the specified timeframe\n3. **Player Not in Lineup:** Player prop bets are voided if the player doesn't participate\n4. **Rule Changes:** Some books void bets if conditions change drastically\n5. **Regulatory Issues:** Suspicious activity flagged by compliance\n\n**What Happens:** Your stake is returned. You don't lose money, but you don't win either.\n\n**Prevention:** Check lineups before player props lock, and be aware of weather postponement risks.`,
  },
  {
    category: 'Practical',
    title: 'What Is Action / No Action?',
    content: `**Action** means the bet stands regardless of circumstances (e.g., a pitching change in baseball).\n\n**No Action** means the bet is voided and your stake is returned.\n\n**Baseball Specifics:**\n- "Listed Pitcher" bets: Only action if BOTH listed pitchers start. If either is scratched, bet is "no action."\n- "Action" bets: The bet stands regardless of who pitches. The odds may change but the bet is live.\n\n**Other Sports:**\n- Player props: No action if the player doesn't play\n- Postponed games: Usually no action if not played within 24 hours\n\n**Tip:** When betting baseball, always specify whether you want "action" or "listed pitchers." The pitching matchup significantly impacts the odds.`,
  },
  {
    category: 'Practical',
    title: 'Online Betting vs. Vegas',
    content: `**Online Advantages:**\n- Bet from anywhere (where legal)\n- More markets and props\n- Easy line shopping across 10+ books\n- Bonuses and promotions\n- Instant access to live betting\n\n**Vegas Advantages:**\n- Higher limits for sharp bettors\n- Cash payouts — no withdrawal delays\n- The experience (sportsbook atmosphere)\n- Some unique prop markets\n- Futures odds can be sharper at Circa, Westgate, etc.\n\n**Key Difference:** Online books are faster to limit winning bettors. Vegas books generally have higher limits and are more tolerant of sharps.\n\n**Best Strategy:** Use online for convenience and bonuses, but if you're a high-volume sharp bettor, Vegas books (especially Circa) offer the best limits.`,
  },
  {
    category: 'Practical',
    title: 'Mobile Bets',
    content: `Mobile betting now accounts for 80%+ of all legal sports wagers in the US.\n\n**Tips for Mobile Betting:**\n1. **Download multiple apps** — DraftKings, FanDuel, BetMGM, Caesars, etc.\n2. **Enable notifications** for line movements and promotions\n3. **Use biometric login** for security\n4. **Set deposit limits** in your account settings\n5. **Compare odds** across apps before placing any bet\n\n**Geo-Location:** You must be physically located in a legal state. VPNs will get you banned.\n\n**Responsible Features:** All legal apps must offer self-exclusion, deposit limits, timeout periods, and responsible gambling resources. Use them.`,
  },
  {
    category: 'Practical',
    title: 'Why Can\'t I Access My Sportsbook?',
    content: `**Common Reasons:**\n1. **Geo-restriction:** You're in a state/country where the book isn't licensed\n2. **VPN detection:** The app detected you're using a VPN\n3. **Account verification:** Identity documents needed\n4. **Self-exclusion active:** You previously self-excluded\n5. **Maintenance:** The app is being updated\n6. **Account restriction:** You've been limited or banned for winning too much\n\n**If Limited:** Being "limited" means the book has reduced your maximum bet size. This happens to winning bettors. Options: use other books, bet through Vegas, or find books known for higher limits.`,
  },
  {
    category: 'Practical',
    title: 'What Is Self-Exclusion?',
    content: `Self-exclusion is a voluntary program where you ban yourself from gambling for a set period.\n\n**How It Works:**\n- Available through every licensed sportsbook and state gaming commission\n- Periods range from 6 months to lifetime\n- Once activated, you cannot bet, enter casinos, or access online accounts\n- Breaking self-exclusion can result in forfeiture of winnings\n\n**When to Consider It:**\n- Gambling is causing financial stress\n- You can't stick to bankroll limits\n- Betting is affecting relationships or mental health\n- You feel unable to stop on your own\n\n**Resources:**\n- National Problem Gambling Helpline: 1-800-522-4700\n- NCPG: www.ncpgambling.org\n- Every state has its own self-exclusion registry\n\n**There is no shame in using these tools.** Responsible gambling is smart gambling.`,
  },
  {
    category: 'Practical',
    title: 'Daily Fantasy Sports (DFS) and Sports Betting',
    content: `DFS (DraftKings, FanDuel contests) and sports betting are related but different:\n\n**DFS:**\n- Build a lineup within a salary cap\n- Compete against other players for a prize pool\n- Classified as a "game of skill" in most states\n- House takes a rake (typically 10-15%)\n\n**Sports Betting:**\n- Wager against the sportsbook\n- Pick outcomes (spreads, totals, props)\n- House edge is in the juice/vig\n\n**Skills Transfer:**\n- Player research from DFS directly helps with player props\n- Understanding usage rates, matchups, and pace from DFS makes you a better prop bettor\n- Bankroll management principles are identical\n\n**Many successful sports bettors started in DFS** and transitioned their player-level analysis to the prop market.`,
  },
  {
    category: 'Practical',
    title: 'Practice at Free Online Betting Sites',
    content: `Before risking real money, consider paper trading your bets.\n\n**How to Practice:**\n1. Track bets in a spreadsheet with the same discipline as real money\n2. Use BankrollBot to log hypothetical bets and track your record\n3. Some sites offer free play-money betting\n4. Follow your picks for 2-4 weeks before going live\n\n**What You'll Learn:**\n- Whether your edge is real or perceived\n- How variance feels over a sample size\n- Where your analysis is strongest (which sport, which bet type)\n- Discipline habits before real money is at stake\n\n**Warning:** Paper trading doesn't replicate the emotional aspect. When real money is involved, psychology changes. Start small when transitioning.`,
  },
];

const CATEGORIES = ['All', 'Basics', 'Bet Types', 'Strategy', 'Advanced', 'Practical'];

export function GuideScreen() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filtered = ARTICLES.filter(a => {
    const matchCat = category === 'All' || a.category === category;
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Header */}
      <div className="text-center pt-2">
        <div className="w-12 h-12 rounded-2xl gradient-primary mx-auto flex items-center justify-center mb-3 shadow-[0_0_30px_hsl(var(--green)/0.3)]">
          <GraduationCap size={24} className="text-primary-foreground" />
        </div>
        <h1 className="font-display text-xl font-extrabold mb-1">Betting 101</h1>
        <p className="text-muted-foreground text-xs max-w-[280px] mx-auto">
          Everything you need to know to bet smarter. From basics to advanced strategy.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search articles..."
          className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-foreground outline-none placeholder:text-text-dim focus:border-accent"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full whitespace-nowrap transition-all
              ${category === c ? 'gradient-primary text-primary-foreground shadow-sm' : 'bg-surface border border-border text-text-dim hover:text-foreground'}`}
          >
            {c} {c === 'All' ? `(${ARTICLES.length})` : `(${ARTICLES.filter(a => a.category === c).length})`}
          </button>
        ))}
      </div>

      {/* Articles */}
      <div className="space-y-1.5">
        {filtered.map((article, i) => {
          const isOpen = expandedIndex === i;
          return (
            <div key={article.title} className="bg-surface border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between p-3.5 text-left hover:bg-card/50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <BookOpen size={14} className="text-accent flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-display text-sm font-bold truncate">{article.title}</div>
                    <div className="font-mono text-[9px] text-text-dim uppercase tracking-wider">{article.category}</div>
                  </div>
                </div>
                <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                  {isOpen ? <ChevronDown size={16} className="text-text-dim" /> : <ChevronRight size={16} className="text-text-dim" />}
                </motion.div>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3.5 pb-4 pt-0 border-t border-border">
                      <div className="prose-sm mt-3 text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                        {article.content.split(/\*\*(.*?)\*\*/g).map((part, j) =>
                          j % 2 === 1 ? (
                            <span key={j} className="font-bold text-foreground">{part}</span>
                          ) : (
                            <span key={j}>{part}</span>
                          )
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">No articles match your search</div>
        )}
      </div>

      <div className="text-center text-[10px] text-text-dim font-mono pb-4">
        {ARTICLES.length} articles · Updated regularly
      </div>
    </motion.div>
  );
}
