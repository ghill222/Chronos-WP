# CHRONOS-WP V4 — Change Log

Single-file sports prediction engine combining V2 statistical modeling with V4 Gematria/calendar conviction scoring.
**File:** `app.html` (hosted at https://ghill222.github.io/Chronos-WP)
**Repository:** https://github.com/ghill222/Chronos-WP
**Current size:** ~28,200 lines | 200+ functions

---

## Session 1 — Foundation
- Initial V4 architecture: 7 calendar systems (Gregorian, Ancient Roman, UNC, IFC, Ethiopian, Pure SOL, Future Gregorian)
- V4 conviction engine tiers: Golden Key (100%), Structural Lock (95%), Identity Overlap (90%), Speed Intercept (85%), Baseline Match (70%), Weak Signal (55%)
- Vibrational Weather (VW) calculator: UN, GD, LD, DPM per calendar
- Team cipher engine: Ordinal, Chaldean, Pythagorean, Reduction across Full/City/Mascot/Abbrev variations
- Tab navigation: NBA | NFL | CBB | CFB | NHL | MLB | Gematria Lab | Accuracy

## Session 2 — Calendar Math + Live Scoring
- Live game support: in-game score tracking and win probability updates
- TotalsEngine: basketball linear model, football Monte Carlo simulation
- deriveVegasImpliedPriors: sport-specific PPD bounds
- Odds caching: ESPN stops returning odds during live games; pregame odds persisted to localStorage

## Session 3 — Sports Expansion + Accuracy Tracker
- Added Soccer tab with 7 leagues: EPL, MLS, UCL, La Liga, Bundesliga, Serie A, Ligue 1
- Added Tennis and MMA tabs with Tale of the Tape calculator
- Accuracy tracker v1: localStorage persistence, V2/V3/V4 model split W-L records per sport

## Session 4 — Sidebar Tape Predictions
- Sidebar predictions panel using weighted VW tape scoring (DPM x5, UN x4, GD x3, LD x2)
- Scroll-safe sidebar using fingerprint comparison
- updateSidebarOnly() for scroll-safe re-renders

## Session 5 — Parlay System
- Parlay generator, tracking (save/auto-resolve), and management
- Mixed Strategy, 2-Leg Quick Hit, 5-Leg Power, Best of Each Sport parlay cards
- ATS and O/U parlay types

## Session 6 — NHL/MLB/Soccer Totals Fix
- NHL: Vegas-anchored totals +/-1.0 goal; MLB: +/-1.5 runs; Soccer: +/-0.5 goals
- All routed to linear model instead of football Monte Carlo

## Session 7 — Spreadsheet Analysis + Chaldean DPM Signal
- Ingested 1,136-row prediction spreadsheet
- CHALDEAN DPM LOCK (80%): Full name Chaldean = DPM — 63.3% real-world hit rate
- CHALDEAN DPM Mascot (78%): Mascot Chaldean = DPM

## Session 8 — Lunar Day Calculation Fixes
- Bug fixed: Math.floor(age)+1 -> Math.floor(age) — overcounting LD by 1 across all calendars
- Verified: Mar 15 2026 -> LD 27 root 9

## Session 9 — Structural Lock Tightened
- 95%: City(Ordinal)=GD AND Full(Chaldean)=DPM, same calendar, value >=3
- 93%: City/Mascot any cipher=GD AND Full(Chaldean)=DPM, value >=4

## Session 10 — V2/V4/Vegas 3-Way Alignment Sidebar
- TRIPLE LOCK / UPSET ALERT / V2+V4 AGREE / V2+V4 SPLIT badges
- Blended confidence: +12% (Triple Lock), +6% (Agree), -8% (Split)

## Session 11 — Tooltip System + Parlay Management
- .chronos-tip CSS class with JS viewport-aware fixed pos

## Session 12 — DNA Skip-Pattern + QUAD LOCK
- DNA Skip-Pattern: analyzes completed games for root-number frequency patterns
- QUAD LOCK: V4 + V2 + DNA + Vegas all agree — strongest composite signal
- Skip-pattern pick displayed on sidebar cards with method label

## Session 13 — Live Betting Signal + Badge Accuracy Report
- Live Betting Signal panel (fires at ≥10 plays)
- Daily W/L Drill-Down report
- Badge Accuracy Report: 16 badge types tracked with W/L per badge
- LIVE badge in parlay picks
- Live games in sidebar

## Session 14 — Accuracy Pattern Analysis + Bug Sprint
- CBB tracking above 60% (CBB specifically above 70%)
- False QUAD LOCK badge fixed (ESPN team name variant mismatch — "Saint Louis Billikens" vs "St. Louis Billikens")
- Live games dropping from sidebar fixed (ESPN stops returning start times for in-progress games — fixed with new Date() fallback + 🔴 LIVE badge)
- Parlay legs prematurely resolving for live games fixed (now requires isFinal === true)
- Variation win rate report backfill fixed (reading from wrong data structure)
- UCL soccer blank page on league switch fixed
- NBA games bleeding into CBB sidebar fixed

## Session 15 — MLB Opening Day + Kalshi Proxy
- MLB Opening Day cutoff set to March 25, 2026 — pre-season games excluded
- Kalshi proxy integration for Tennis and MMA real-money market discovery
- Tennis/MMA tabs now pull live Kalshi markets (ATP, WTA, ATP Challenger, WTA Challenger)
- Live Betting Signal panel added
- Bet sizing thresholds: V2 ≥60% WP, V4 ≥85% conviction for action

## Session 16 — Calendar Full Recalibration (MAJOR)
All 7 non-Gemini calendars corrected using verified anchor dates from 3/13/2026.

### Verified Anchors (3/13/2026)
| Calendar | Op Date | UN | GD | LD | DPM |
|---|---|---|---|---|---|
| Gregorian | 3/13/2026 | 8 | 4 | 7 | 1 |
| IFC | 3/16/2026 | 2 | 7 | 1 | 1 |
| UNC | 3/3/2026 | 7 | 3 | 6 | 7 |
| Ancient Roman | 7/13/2026 | 3 | 4 | 7* | 5 |
| Ethiopian | 7/3/2018 | 3 | 3 | 2 | 8 |
| SOL | 13/26/2026 | 4 | 8 | 1 | 4 |
| Pure SOL | 13/23/2026 | 1 | 5 | 7* | 4 |

### 9-Calendar Array (Final)
| # | Key | Display | Rule |
|---|---|---|---|
| 1 | gregorian | Gregorian | Base |
| 2 | ifc | IFC (13-Mo) | +3 days |
| 3 | unc | UNC Network | -10 days |
| 4 | ancient_roman | Anc. Roman | +4 months, LD inherited |
| 5 | ethiopian | Ethiopian | 7/3/2018 anchor |
| 6 | pure_sol | Pure SOL | 13th mo anchor 13/23, LD inherited |
| 7 | future_gregorian | SOL | 13th mo anchor 13/26, LD Greg+3 |
| 8 | future_gregorian_plus2 | Future Greg (+2yr) | +2 years, own LD |
| 9 | gemini_rolling | G-Roll | Rolling +1/day cycle |

## Session 17 — Identity Overlap Rebuilt + V4 Filter Bug + Row Colors
- Identity Overlap completely rebuilt: fires when UN = DPM in same calendar AND cipher matches
- V4 model filter bug fixed (V4-Chronos was being mapped to 'V1')
- Migration bug fixed (never downgrades V4 records)
- Three-color row system: Green (V2 correct), Blue (V2 miss / V4 hit), Red (both miss)

## Session 18 — Data Analysis + Trap Flag + O/U Adjustment + Lopsided Badge
- Trap Flag: Gate A (sum=4,7) = SHORT-CIRCUIT, Gate B = VOID TRAP, both = EXTREME TRAP
- O/U Adjustment: V-Sum >11 (NBA) or >14 (CBB) adds +7.8 pts to V4 total display
- Lopsided Badge (DOM CAL): fires when winner dominates 4+ calendars by 100+ VW pts each

## Session 19 — VW Pattern Tracker + Triple Lock + Tennis
- VW Pattern Tracker: 14-day history, per-day dominant VW signals, calendar accuracy
- Triple Lock accuracy tracking per sport
- Tennis auto-pull expanded to 10 ESPN endpoints

---

## Session 20 — Mar 20 2026 — Bug Sprint + MLB Priors + Bet Signal System

### Bug Fixes
- **False QUAD LOCK badge**: ESPN team name variant mismatch fixed ("Saint Louis Billikens" vs "St. Louis Billikens") — all ESPN team variants now normalized through TEAM_DATABASE
- **Live games dropping from sidebar**: ESPN stops returning start times for in-progress games — fixed with `new Date()` fallback + 🔴 LIVE badge
- **Parlay legs prematurely resolving**: Requires `isFinal === true` before resolving parlay legs
- **VPT+DNA badge greyout**: Moved VPT+DNA computation from prediction-recording time to `recordOutcome()` — was always returning null pre-game because VPT needs 3+ completed games for context
- **VPT Loser badge**: Added to badge registry and VPR reasons with point deduction
- **Post-game badges separated**: `v4_covered`, `v2_covered`, `v4_total_hit/miss`, `actual_over/under` now `tier:'result'` — appear in separate "Post-Game Result Badges" section in badge report
- **Root 4 warning badge**: Fires `⚠️ R4 WARN: [Mascot]` when predicted winner has R4 3+ times across name variations AND R4 is a VW loser root
- **P badge frozen at pregame**: For live games, reads stored prediction value (locked at pregame time) — no more flipping during games
- **DNA dynamic roots**: "0/4 variations hit Root 7/1/3" now calls `getObservedDailyRoots()` dynamically

### MLB V2 Model Implemented
- `calculateMLBModel()` function using ERA/FIP/OBP/SLG/bullpen efficiency ratings
- 30 MLB teams in `TEAM_PRIORS` with: `runs_per_inning`, `era_plus`, `fip`, `babip`, `obp`, `slg`, `bullpen_era`, `home_run_rate`
- `_DEFAULT_MLB` fallback; `'Sox'` and `'Jays'` alias keys for ESPN partial-match misses
- MLB Opening Day cutoff: March 25, 2026 — pre-season games excluded
- MLB removed from `COUNT_ONLY_SPORTS` — now fully tracked with W/L breakdown
- MLB exclusion messages removed from accuracy tracker

### NHL Team Priors Added
- 32 NHL teams added to `TEAM_PRIORS` using shot-efficiency metrics
- `points_per_drive` = goals/shot attempt (~0.095 lgAvg); `pace` = shots/game; `true_turnover_rate` = giveaway rate
- `_DEFAULT_NHL` fallback; NHL routing in `getTeamPriors`
- Previously NHL fell back to `_DEFAULT_CFB` (football stats) — now correct

### Bet Signal System
- 🟢 BET: V2 ≥60% + V4 ≥85% + all three systems agree direction
- 🟡 WATCH: one system strong, no conflict
- 🔴 SPLIT: V2 and V4 pick opposite winners (do not bet)
- ⚪ MONITOR: below all confidence floors
- Displayed on every pregame card below confidence badge
- V4 conviction read from stored prediction record (`v4ConvictionPct` field)

### Sidebar V4 Sort Fixed
- Sort now matches V2 card order (startTime ASC, gameId tiebreak) — no longer uses confidence-weighted sort
- Games on left and right panels now scroll in sync

### Records on All Sports
- Team W-L records now display on all sport tabs (previously MLB-only)
- Font-size increased to 11px, color improved to `#8b92a7`

### fetchMatchupStats Hardened
- NHL and MLB sport/league mappings added (previously returned `undefined` causing CORS crash)
- Unknown sport bail added (`else { return null }`) to prevent URL injection

### PPD Safety Guard
- `points_per_drive` null guard added before injury adjustment block
- MLB priors use `runs_per_inning` — bridge copies it to `points_per_drive` for injury math compatibility

### Kalshi Tennis Proxy Updates
- Tennis prefix list expanded: yesterday + today + tomorrow for all 4 series
- `isLive` tightened: requires `approxStartMs < nowMs` (match must have actually started)
- Reduces false-LIVE display for matches hours away

### Bulk Delete Checkboxes Restored
- Checkbox missing from regular (non-tape) pending game cards — restored

---

## Architecture Reference

### Key localStorage Keys
| Key | Purpose |
|-----|---------|
| wp_accuracy_log_V4_Chronos | Main prediction log |
| wp_accuracy_log_V4_backup | Backup copy |
| wp_parlay_log_V4 | Parlay save history |
| wp_active_tabs_V4 | Tab state |
| wp_v4_migration_done | Migration flag |

### Conviction Tier Hierarchy (Current)
| % | Label | Trigger |
|---|-------|---------| 
| 100% | GOLDEN KEY | Abbrev(Ordinal)=AR DPM AND Mascot(Chaldean)=AR GD, same calendar |
| 95% | STRUCTURAL LOCK | City(Ordinal)=GD AND Full(Chaldean)=DPM, same calendar, >=3 |
| 90% | IDENTITY OVERLAP | UN=DPM same calendar AND cipher matches |
| 85% | SPEED INTERCEPT | Abbreviation(any cipher)=LD in any calendar |
| 70% | BASELINE MATCH | Full name(any cipher)=any VW metric |

### Tape Scoring Weights
DPM x5, UN x4, GD x3, LD x2 across all 9 calendars x 12 ciphers x 4 variations

### Bet Signal Floors
- V2 ≥60% WP OR ≤40% WP = strong directional
- V4 ≥85% conviction = strong vibrational
- Both required + same direction = 🟢 BET

### V2 Model Coverage (as of Session 20)
| Sport | Model | Key Metrics |
|-------|-------|------------|
| NBA | Basketball PPP model | PPP, pace, eFG%, TOV%, fatigue |
| CBB | Basketball PPP model | PPP, pace, eFG%, TOV% |
| NFL | Independent ratings | PPD, plays/drive, TOV rate |
| CFB | Independent ratings | PPD, plays/drive, TOV rate |
| NHL | Shot-efficiency model | goals/shot attempt, pace, giveaway rate |
| MLB | ERA/FIP model | runs/inning, ERA+, FIP, OBP, SLG, bullpen ERA |
| Soccer | Vegas-anchored | Vegas spread/total |

---

*Document last updated: Session 20, March 26, 2026*
*Working file: app.html (~28,200 lines)*
