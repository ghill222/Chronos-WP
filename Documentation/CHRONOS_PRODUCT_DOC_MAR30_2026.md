# Chronos-WP v4 — Product Documentation
## Version 4.5.1 | Updated March 30, 2026

---

## WHAT IS CHRONOS-WP?

Chronos-WP is a single-file HTML sports prediction engine that combines two independent prediction systems — a vibrational resonance engine (V4) and a statistical model engine (V2) — to generate pre-game win probability predictions across multiple sports.

The tool is designed for personal sports prediction and betting research. It runs entirely in the browser with no server required, fetches live game data from the ESPN API, and maintains a full accuracy tracking system that learns from results over time.

**Current sports covered:** NBA, CBB (NCAAM), CFB, NFL, NHL, MLB, MMA/UFC, CBA (EuroLeague), ESPORTS, Tennis (ATP + WTA)

**Target platform:** Web browser (Chrome/Edge recommended). Long-term: iPhone PWA via Safari "Add to Home Screen."

---

## CORE PREDICTION ENGINES

### V4 Engine — Vibrational Resonance & Gematria
The V4 engine analyzes team and player names through multiple lens systems:

**1. Calendar Vibrational Weather (VW)**
Each team's name is run through 9 calendar systems to generate UN (Universal Number), GD (Game Day), LD (Life Day), and DPM (Day Position Metric) scores. Current weights: UN×6, DPM×6, GD×0, LD×0.

**Calendar systems used:**
- Gregorian
- Ancient Roman
- UNC (Universal Numerological Calendar)
- IFC (International Fixed Calendar)
- Ethiopian
- Pure Solar
- SOL
- Future Gregorian +2
- Gemini Rolling

**2. Custom Sport-Specific Cipher**
Each sport has a custom letter-frequency cipher built from historical winner name patterns. The cipher scores each team's name letter by letter, producing a raw cipher score. A 10%+ margin triggers an amplification bonus added to the composite score.

**3. DNA Root Matching**
Team name variations (full name, city, mascot, abbreviation) are run through all standard ciphers. The dominant digital root of each variation is compared against today's observed winning roots (updated live as games complete). Each matching variation adds 25 points to the composite score.

**4. Mode A / Mode B Merge**
- **Mode A:** Forward + reverse cipher conviction analysis — produces a winner and conviction percentage
- **Mode B:** Raw VW tape score comparison across all calendars
- **Merge rules** determine the final V4 pick based on Mode A/B agreement, conviction level, and composite score

### V2 Engine — Statistical Model
The V2 engine uses team efficiency ratings, pace factors, and Vegas spreads:
- **NBA/CBB:** Offensive efficiency, defensive efficiency, pace, SRS rating, Monte Carlo simulation (10,000 iterations)
- **NHL:** Corsi For%, Goals For/60, Goals Against/60, PP%, PK%, Save%, OT probability (~24%)
- **MLB:** Run differential, bullpen ERA, batting average, home/away splits
- **NFL/CFB:** SRS rating, point differential, Vegas spread
- **Soccer:** ELO rating, goal differential, form
- **MMA/Tennis:** Tale of the Tape calculator only (no V2 statistical model — V4 only)

### Decision Framework (P Flag)
The "P" badge shown next to a team's name indicates the system's definitive predicted winner. Priority order:
1. V4 merged pick from sidebar pool (`tapeWinner`) — first priority
2. Stored `v4Winner` from accuracy tracker
3. V2 win probability ≥50% — last resort fallback only

---

## SPORTS TAB — GAME CARDS

Each game card shows:
- **Home and Away team names** with the **P badge** on the predicted winner
- **V2 win probability** percentage
- **V4 conviction** percentage (VW calendar score margin)
- **Bet signal:** 🟢 BET (V2+V4+Vegas all agree), 🟡 WATCH (partial agreement), 🔴 SPLIT (V2 and V4 disagree), ⚪ MONITOR (below confidence floor)
- **Lock badges:** Quad Lock, Triple Lock, Portal Convergence (⚡ PC), Portal Alignment (🌀 PA)
- **Warning badges:** R4 Warn, Trap, V3 Ambush, Loser Badge

---

## SIDEBAR — V4 PREDICTION CARDS

The right sidebar shows V4 gematria analysis cards for each game, including:
- Predicted winner with blended confidence percentage
- V2 statistical pick (shown separately with "V2:" label)
- Merge rule applied (AGREE, R1:B_CONV, R_INCONSISTENT, etc.)
- Calendar VW scores (UN/GD/LD/DPM mini-bar)
- DNA root match count (X/4 variations)
- Skip pattern pick
- Portal Convergence / Portal Alignment badges
- ⚡ CIPHER EDGE badge (when sport cipher favors one team ≥3% margin)
- Warning badges (R4 Warn, Trap, V3 Ambush)

---

## MY PICKS — PENDING RESULTS

Saved pre-game predictions. Shows:
- Matchup, game date/time, sport
- V2 predicted winner and win probability
- V4 predicted winner and conviction
- Agreement status (Triple Lock, AGREE, SPLIT, etc.)
- Cipher score and DNA match count
- Signal badges
- Manual win/loss entry buttons

---

## ACCURACY TAB

### Dashboard
Overall win rate, sport-by-sport breakdown, daily W/L trend chart.

**Primary record includes:** NBA, CBB, NFL, CFB, NHL, CBA, MMA, ESPORTS
**Background tracking only:** Tennis (ATP + WTA), MLB

### Day 1 Game Log
Full drill-down of every game resolved under v4.3+ rules (starting Mar 27 2026). Shows predicted vs actual winner, merge rule used, portal badges, win/loss per game.

### Recent Results Log
Scrollable table of all resolved games. Shows home/away, predicted winner, actual winner, merge rule, cipher score column, result (✅/❌).

### Badge Accuracy Report (BAR)
Tracks how often each badge fires on winners vs losers. Updated automatically as games resolve. Key badges tracked: Portal Convergence, Portal Alignment, Triple Lock, Quad Lock, R4 Warn, Trap, Skip Pattern, DNA Match, V3 Ambush (in progress).

### Calendar Accuracy Tracker (CAT)
Day-by-day calendar performance. Shows which calendar systems are firing on winning teams. Helps identify which calendars are running hot on a given week.

### V4 vs V2 Framework Report
Head-to-head comparison: how often V4-only picks win vs V2-only picks vs both correct vs both wrong. Critical for understanding which engine to trust when they disagree.

### Self-Improvement Engine (SIE)
Engine health table per sport. Merge rule performance breakdown. Badge signal weight table. Recommendations panel. Runs Loop 2 analysis on demand.

---

## TALE OF THE TAPE CALCULATOR

Manual input calculator for Tennis and MMA. Enter two player names and birthdates. Output:
- Side-by-side cipher breakdowns (all standard ciphers)
- VW match tallies (UN/GD/LD/DPM across 7 calendars)
- DNA root match count (X/4 variations)
- Master number tallies
- Life Path number from birthdate
- Predictive outcome with conviction percentage

---

## VIBRATIONAL PULSE TRACKER

Observation-only module that records winning team root numbers throughout the day. Builds the DNA Root Matrix showing which cipher roots are winning (targets) vs losing (losers) on any given day. Updates every 5-second ESPN refresh. Used to calibrate DNA target roots for the composite scoring engine.

---

## KEY SETTINGS AND TOGGLES

- **Custom Cipher Toggle:** Turns on the toggle-dependent `_ccBonusH` path in the composite (in addition to the always-on `_sidebarCC` path)
- **Sport Cipher Selector:** Chooses which sport's cipher to apply when the toggle is ON
- **Auto-refresh:** Every 5 seconds via ESPN API
- **Pregame window:** NBA/CBB/NHL: 3 hours before tip; MLB/Soccer: 12 hours

---

## ACCURACY INTEGRITY NOTES

**On the 92.7% non-tennis primary record (Mar 27-29 2026):**
This rate reflects V4 gematria merged picks. The system only loses when BOTH the V4 gematria engine AND V2 statistical engine are simultaneously wrong. Pure V4 picks (games where V4 overrode V2) ran 23-4 (85%). AGREE picks (both engines same direction) ran 24-7 (77%). The true independent V4 accuracy is likely 65-72% over a large sample — the 92.7% reflects a strong initial run + favorable matchups + the mathematical advantage of two-engine coverage.

**Tennis note:** ATP tennis ran 4-5 (44%) over the same period. The gematria cipher was not designed for individual player names and has no V2 backup for tennis. Tennis is tracked in the background for research purposes.
