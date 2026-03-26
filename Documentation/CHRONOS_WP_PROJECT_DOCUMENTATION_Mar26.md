# CHRONOS-WP — Project Documentation
## What It Is and What It Does

**Version:** V4 (Current — Session 20)
**Type:** Single-file HTML application (~28,200 lines, self-contained)
**Repository:** https://github.com/ghill222/Chronos-WP
**Hosted at:** https://ghill222.github.io/Chronos-WP
**Purpose:** A dual-intelligence sports prediction engine combining statistical win probability modeling with a vibrational numerology system to predict game winners, spreads, and totals across 9 sports.

---

## Core Philosophy

Chronos-WP operates on the premise that two independent systems — statistical modeling and vibrational numerology — can be cross-validated against each other to produce higher-confidence predictions than either system alone.

**Statistical layer (V2):** Uses historical efficiency ratings, rest/fatigue adjustments, and Vegas-anchored spread math to compute win probability as a percentage. Sport-specific models exist for NBA, CBB, NFL, CFB, NHL, and MLB.

**Vibrational layer (V4):** Uses numerological cipher analysis (team name reduced through 12 cipher systems), mapped against 9 calendar-based "Vibrational Weather" (VW) values for the game date. When a team's cipher roots match the day's VW numbers, that team is considered "in resonance" with the day's dominant frequency. The degree of resonance determines conviction level.

**When both systems agree:** Confidence is amplified (QUAD LOCK / Triple Lock = highest signal).
**When they disagree:** The model flags the split and reduces confidence.

---

## The Vibrational Weather System

Each game date produces VW numbers across 9 calendar systems. Each calendar produces 4 metrics:

| Metric | Abbreviation | Meaning |
|--------|--------------|---------|
| Universal Number | UN | All date digits reduced to single root |
| Gregorian Day | GD | Day-of-month reduced to single root |
| Lunar Day | LD | Moon age (astronomical) reduced to single root |
| Destiny Portal Metric | DPM | Digital root of UN + GD + LD |

### 9 Calendar Systems (Verified Anchors Mar 13, 2026)

| # | Key | Display | Rule |
|---|-----|---------|------|
| 1 | gregorian | Gregorian | Base date |
| 2 | ifc | IFC (13-Mo) | +3 days from Gregorian |
| 3 | unc | UNC Network | -10 days from Gregorian |
| 4 | ancient_roman | Anc. Roman | +4 months for UN/GD; LD inherited from Gregorian |
| 5 | ethiopian | Ethiopian | Fixed anchor 7/3/2018, +1 day per Gregorian day |
| 6 | pure_sol | Pure SOL | 13th-month anchor 13/23; LD inherited from Gregorian |
| 7 | future_gregorian | SOL | 13th-month anchor 13/26; LD = Gregorian +3 |
| 8 | future_gregorian_plus2 | Future Greg (+2yr) | +2 years; own astronomical LD |
| 9 | gemini_rolling | G-Roll | Rolling +1/day cycle |

### VW Scoring Weights
- DPM × 5 (highest weight — Destiny Portal)
- UN × 4
- GD × 3
- LD × 2

---

## The Conviction Engine (V4 — Mode A)

Mode A runs 12 ciphers × 4 name variations × 9 calendars for each team, checks cipher output against that calendar's VW metrics, and assigns conviction tiers:

| % | Label | Trigger |
|---|-------|---------|
| 100% | GOLDEN KEY | Abbrev(Ordinal)=AR DPM AND Mascot(Chaldean)=AR GD, same calendar |
| 95% | STRUCTURAL LOCK | City(Ordinal)=GD AND Full(Chaldean)=DPM, same calendar, value ≥3 |
| 90% | IDENTITY OVERLAP | UN=DPM in same calendar AND cipher matches that shared root |
| 85% | SPEED INTERCEPT | Abbreviation(any cipher)=LD in any calendar |
| 70% | BASELINE MATCH | Full name(any cipher)=any VW metric |

Mode A is **order-independent**: it runs both Home→Away and Away→Home orderings to eliminate bias.

### Mode B (Tape VW Scorer)

Mode B accumulates VW resonance points across all 9 calendars simultaneously with no cipher matching — pure score accumulation. Winner = team with higher total tape score.

Mode A and Mode B run independently. When they agree, confidence is boosted. When they disagree, merge rules resolve the conflict based on validated accuracy data.

---

## The V2 Statistical Model

Sport-specific V2 models produce a model spread (negative = home favored), which is converted to win probability via sigmoid function. Model is calibrated against Vegas spread for sanity checks.

### Model Coverage by Sport

| Sport | Model Type | Key Efficiency Metrics |
|-------|-----------|----------------------|
| NBA | Basketball PPP | Points per possession, pace, eFG%, TOV%, B2B fatigue |
| CBB | Basketball PPP | Points per possession, pace, eFG%, TOV% |
| NFL | Drive efficiency | Points per drive, plays per drive, TOV rate, explosive rate |
| CFB | Drive efficiency | Points per drive, plays per drive, TOV rate |
| NHL | Shot efficiency | Goals/shot attempt, shots/game, giveaway rate |
| MLB | ERA/FIP model | Runs/inning, ERA+, FIP, BABIP, OBP, SLG, bullpen ERA |
| Soccer | Vegas-anchored | Uses Vegas spread/total (no independent model yet) |

### MLB Model Detail (implemented Session 20)

The MLB V2 model computes expected runs as follows:

```
Offensive rating = runs_per_inning + OBP_factor + SLG_factor + BABIP_luck_adj
Pitching rating  = (ERA+ - 100)/100 × 0.35 + (lgFIP - FIP) × 0.08
Bullpen rating   = (lgBullpenERA - bullpen_era) × 0.06

Expected home runs = (home_offense × 9) + (away_pitch + away_bullpen) × -9 + 0.12 (home adv)
Expected away runs = (away_offense × 9) + (home_pitch + home_bullpen) × -9
Model spread      = -(home_exp - away_exp)
```

When model total diverges from Vegas total by >2.5 runs, totals are blended 50/50. Model-Vegas spread divergence >2.5 runs triggers manual review flag.

### NHL Model Detail (implemented Session 20)

NHL uses the same basketball PPP infrastructure since both are possession-efficiency sports. Key constants:
- `points_per_drive` = goals per shot attempt (~0.095 league avg)
- `pace` = shots per game (~30 league avg)
- `true_turnover_rate` = giveaway rate (lower = better puck control)

All 32 NHL teams have priors in `TEAM_PRIORS`. `_DEFAULT_NHL` fallback used when ESPN team name doesn't partial-match.

### Team Priors Matching Logic

ESPN team names are matched in order:
1. Exact match (e.g., "Golden State Warriors")
2. Last-word partial match (e.g., "Warriors")
3. Alias keys for ESPN naming quirks (e.g., "Sox" → Red Sox / White Sox, "Jays" → Blue Jays)
4. Vegas-implied priors (if spread/total available)
5. Sport-specific default (`_DEFAULT_MLB`, `_DEFAULT_NHL`, etc.)

---

## Bet Signal System

Every pregame card displays a tri-color confidence signal:

| Signal | Color | Condition |
|--------|-------|-----------|
| BET | 🟢 Green | V2 ≥60% + V4 ≥85% + all three systems agree direction |
| WATCH | 🟡 Yellow | One system strong, no direction conflict |
| SPLIT — NO BET | 🔴 Red | V2 and V4 pick opposite winners |
| MONITOR | ⚪ Gray | Below all confidence floors |

V4 conviction is read from the stored prediction record (`v4ConvictionPct` field) to ensure the signal is frozen at pregame time and doesn't change during live games.

---

## Badge System

### Conviction Tier Badges (pregame prediction quality)
GOLDEN KEY, STRUCTURAL LOCK, IDENTITY OVERLAP, SPEED INTERCEPT, MATRIX SEQUENCE, CHALDEAN DPM, BASELINE MATCH

### Alignment Badges (cross-system agreement)
⚡ QUAD LOCK — All 4 systems agree (V4 Mode A + Mode B + V2 + Vegas)
🔒 ALL-3 LOCK — Three systems agree
🔐 TRIPLE LOCK — V4 + V2 + Vegas agree
V4+V2 AGREE — Vibrational and statistical agree

### Flag Badges (warning signals)
⚠️ VPT+DNA LOSER — Predicted winner's dominant root is a confirmed loser root in both VPT and DNA systems
⚠️ R4 WARN — Predicted winner has Root 4 appearing 3+ times across name variations AND R4 is a VW loser root
☠️ VOID LOCK — Gate A trap fires
TRAP T2, TRAP T3 — Graduated trap tiers

### Result Badges (post-game only — tracked for historical accuracy)
V4 COVERED, V2 COVERED, V4 TOTAL CORRECT/WRONG, ACTUAL OVER/UNDER

### VPT+DNA Badge (computed at resolution time)
The VPT+DNA badge requires 3+ completed games for context. It is computed in `recordOutcome()` (not at prediction-recording time) to ensure enough game history is available. Stored as `vptDnaAlign` on the resolved record.

---

## DNA Skip-Pattern Engine

Analyzes completed games for root-number frequency patterns. After sufficient history:
- Identifies which roots appear most in winners vs losers for the current date
- Generates a skip-pattern pick using those observed targets
- Skip-pattern pick displayed on sidebar cards with method label (Root N)

Combined with V4 and V2: when all three agree = QUAD LOCK.

---

## Accuracy Tracking

All predictions are stored in localStorage under `wp_accuracy_log_V4_Chronos`. Each record captures:

**At prediction time:** homeTeam, awayTeam, sport, gameDate, gameTime, predictedHomeWP, v4Winner, v4ConvictionPct, v4ConvictionLabel, vegasSpread, vegasTotal, quadLock, allThreeLock, tripleAlign, trapTier, skipPatternPick, v4v2agree, dnaWinVarScore

**At resolution time:** actualHomeScore, actualAwayScore, homeWon, wpError, spreadError, v4PickCoveredSpread, v2PickCoveredSpread, actualOver, actualUnder, vptDnaAlign (computed here), vptDnaLoser

### Accuracy Results (as of Mar 26, 2026)
| Sport | Games | Overall W-L | V4 W-L |
|-------|-------|-------------|--------|
| CBB | ~80+ | >60% | >70% |
| NHL | 29 | 15-14 (51.7%) | 7-9 (43.8%) |
| MLB | Opening Day Mar 25 | Fresh | Fresh |

---

## Tennis & MMA (Kalshi Integration)

Tennis and MMA use Kalshi prediction markets as the discovery source (only free source covering ATP Challengers). The Kalshi proxy (`kalshi-proxy.js`) runs on Node.js and:
- Searches 4 series: ATP Tour, WTA Tour, ATP Challenger, WTA Challenger
- Fetches markets for yesterday + today + tomorrow (handles cross-day tournaments)
- `isLive` requires: market active AND approxStartMs < nowMs AND timeToEnd < 3h
- Updates every 90 seconds for prices; match list cached 5 minutes

ESPN only covers ATP/WTA Tour — no Challenger endpoint exists. Kalshi remains the only free source for Challenger coverage.

---

## Technical Architecture

**Language:** Vanilla HTML/CSS/JavaScript (no frameworks, no build tools)
**Size:** ~28,200 lines, single file
**Functions:** 200+
**External dependencies:** ESPN API (runtime), Kalshi proxy (Tennis/MMA only)
**Offline capability:** Partial (cached odds/results persist; live data requires internet)
**Testing environment:** Windows laptop, Chrome, local file access
**Syntax validation:** Acorn JS parser at `/tmp/node_modules/acorn`

### Key Module Locations (approximate line ranges)

| Module | Description |
|--------|-------------|
| Lines 1-500 | CSS, sport tab navigation |
| Lines 500-2500 | Calendar functions, VW calculator, cipher engine |
| Lines 2500-3500 | Conviction engine (Mode A + Mode B), merge rules |
| Lines 3500-5500 | V3 Gematria overlay, sport configs, accuracy tracker class |
| Lines 5500-7000 | TEAM_PRIORS (CFB, NFL, NBA, CBB, MLB, NHL), getTeamPriors, Vegas-implied priors |
| Lines 7000-8500 | TotalsEngine, calculateBasketballModel, calculateMLBModel |
| Lines 8500-10000 | Main fetch/render pipeline, parseGame, renderGameCard |
| Lines 10000-12000 | Tennis/MMA Kalshi rendering, tape sport schedule |
| Lines 12000-14000 | Parlay generator and manager |
| Lines 14000-18000 | Accuracy dashboard, badge report, W/L drill-down |
| Lines 18000-22000 | Pending results, parlay tracking, daily reports |
| Lines 22000-24000 | fetchGames, renderGames, intelligence gathering, game card HTML |
| Lines 24000-27000 | Sidebar V4 predictions, VPR ranking, VPT tracker |
| Lines 27000-28200 | Gematria Lab, tooltip system, event handlers |

### Key localStorage Keys
| Key | Purpose |
|-----|---------|
| wp_accuracy_log_V4_Chronos | Main prediction log (Map serialized) |
| wp_accuracy_log_V4_backup | Auto-backup copy |
| wp_parlay_log_V4 | Parlay save history |
| wp_pulse_archive | Pulse tracker history |
| wp_odds_cache | Cached Vegas odds (avoids re-fetch) |
| wp_active_tabs_V4 | Tab state persistence |

---

## Pending / Planned Features

### NHL V2 Model (next session)
Proposed metrics: CF% (Corsi For %), GF%, Goals/60 at 5v5, Goals Against/60, PP%, PK%, SV%, high-danger chances. Will use existing `calculateBasketballModel` infrastructure since hockey and basketball share possession-efficiency model shape. Isolated to new `calculateHockeyModel()` function — no other sports affected.

### Autonomous Trading Roadmap
- Phase 1: POST /orders to Kalshi proxy (2-3 sessions)
- Phase 2: Rule engine (unit size, daily cap, conviction thresholds)
- Phase 3: Semi-auto (one-click approval)
- Phase 4: Full auto (runs while sleeping)
- Phase 5: Adaptive sizing from accuracy data

### Self-Improvement Engine
- Loop 1 (measure): Running — accuracy tracked per badge, signal, sport
- Loop 2 (evaluate by badge/signal): Needs 200+ games
- Loop 3 (auto-adjust weights): Follows Loop 2
- ML research pass: At 500+ games

### Other Queued Items
- Tennis/MMA Tale of the Tape bilateral ESPN auto-population
- NCAAW sub-tab under CBB (ESPN endpoint: `basketball/womens-college-basketball`)
- Variation Win Rate Report (which of 4 name variations hits highest actual win rate)
- Historical prediction backfill migration
- Parlay leg drill-down in Accuracy tab
- Sidebar scroll position persistence across auto-refreshes
- Vibration Offset tool (±1 buttons on UN/GD/LD for late-night game temporal shift)
- Daily Parlay Bifurcation Zone (3+ calendar confirmation badges)
- Root Number Predictor / Pattern Calendar from VW pattern recognition

---

## Session Transfer Protocol

Each session starts with:
1. Working HTML file uploaded or referenced from project
2. Transfer document referencing key line numbers and pending items
3. Instruction: skip exploratory reads, go directly to documented line numbers

Each session ends with:
1. Updated CHANGELOG.md
2. Updated CHRONOS_WP_PROJECT_DOCUMENTATION.md
3. Output file: `app.html` pushed to GitHub Pages

---

*Document last updated: Session 20, March 26, 2026*
*Working file: app.html (~28,200 lines)*
*Hosted: https://ghill222.github.io/Chronos-WP*
