# Chronos-WP v4 — Session Transfer Document
## March 30, 2026

**Working file:** `/home/claude/chronos_wp_v4_fix1.html`
**Current version:** v4.5.1 (last shipped, clean, validated)
**File size:** ~33,688 lines / 2.17MB
**Output:** `/mnt/user-data/outputs/chronos_wp_v4.5.1.html`
**Validation:** Acorn JS parser at `/tmp/node_modules/acorn`

---

## WHAT IS CHRONOS-WP

Single-file HTML sports prediction engine combining two independent systems:
- **V4 Engine:** Gematria/vibrational resonance — custom sport-specific ciphers, DNA root matching, name variation analysis, calendar resonance across 7+ calendar systems
- **V2 Engine:** Statistical — team efficiency priors, pace factors, Vegas-derived spreads with Monte Carlo simulation

**Sports covered:** NBA, NFL, CBB, CFB, NHL, MLB (background only), Tennis (background only), MMA, CBA, ESPORTS via ESPN API. Tennis and MMA also have manual Tale of the Tape calculators.

**Platform:** Single HTML file, web/mobile. Long-term plan: iPhone PWA via Safari "Add to Home Screen."

---

## CURRENT ARCHITECTURAL STATE (v4.5.1)

### Engine Weights (locked — validated Mar 29 2026)
```
TAPE_WEIGHTS: { UN:6, GD:0, LD:0, DPM:6 }  — all 3 locations in code
NSB cap: ±25 pts
Sidebar cipher cap: 55 pts (normalized)
Cipher amplification: margin×5 + DNA root bonus, capped 80pts total
DNA root match weight: 25pts per variation match
```

### Composite Formula (sidebar scoring)
```
compHome = homeTS.total
         + _dnaH×25          (DNA root matches × 25pts each)
         + _mrBonusH         (+50 if master root = target, -35 if = loser)
         + _skipH            (skip pattern bonus)
         + _ccBonusH         (TOGGLE-DEPENDENT cipher — tape panel toggle)
         + _nsbH             (Name Structure Bonus, ±25 cap)
         + _sidebarCC_H      (ALWAYS-ON sport cipher, normalized, 55pt cap)
         + _cipherAmpH       (ALWAYS-ON amplification: margin×5 + DNA bonus, 80pt cap)
```

### P Flag Decision Framework (v4.5.0+)
The P flag shown on sports cards now follows the MERGED V4 pick, not always V2:
1. Sidebar pool `tapeWinner` (merged V4 pick) — first priority
2. Stored `v4Winner` from accuracy tracker — second
3. V2 `wp >= 50` — last resort fallback only

### Merge Rules (unchanged since Mar 26 2026 audit)
```
R_INCONSISTENT → Mode A inconsistent → use composite Mode B
AGREE          → Both modes agree → that pick
R1:B_CONV      → Mode A conv ≥85% + disagree → use Mode B
R2:A           → Margin ≥100 + low conv → use Mode A
R3:B           → Margin <30 → use Mode B
R4:B_MED       → Medium margin default → use Mode B
V4_OVERRIDE    → V4 conv ≥70% + (Portal PC/PA OR cipher agrees) + V2 <60% → V4 overrides
```

### Primary Record Counting (v4.5.1)
- **Included:** NBA, CBB, CFB, NFL, NHL, CBA, MMA, ESPORTS
- **Background only (excluded from primary W/L):** Tennis (ATP + WTA), MLB
- Same exclusion applied to: Day 1 log, CAT (Calendar Accuracy Tracker), BAR (Badge Accuracy Report)

### Storage
```
MAX_STORED_GAMES: 1200
AUTO_ARCHIVE_THRESHOLD: 1000
Primary storage: IndexedDB (_initIndexedDB, _saveToIndexedDB, _tryRestoreFromIDB)
Secondary: localStorage
Day 1 start key: 'chronos_v430_date' = '2026-03-27'
```

### Live DNA Root Feed
- `getObservedDailyRoots()` is called LIVE per game inside `gameWPs.forEach` loop
- Uses `_obsR2` — reads from `accuracyTracker.results` (completed games today)
- DNA targets update automatically as games complete throughout the day
- `isFinal` guard prevents concluded games from being affected
- **This is already working** — no fix needed

---

## WHAT WAS BUILT THIS SESSION (Mar 29-30 2026)

### v4.3.8 through v4.4.5 (earlier in session — see compacted summary)
- Prediction integrity fixes, switch pick rewrite, bulk delete fix
- v2WinnerTrack reads stored field, 1969 date guard
- BAR override tier, Name Structure Bonus, V4 Override system, NBA priors updated
- Backdate fix, switch pick propagation, game time sorting, temporal shift composite
- R4 Warn fix, VPT+DNA dedup

### v4.4.6 — Cipher Edge Infrastructure
- `_sbCH/CA/CMax` declared outside try block with defaults
- `_sbCipherWinner` computed inside try, exposed via `_outerCipher*` vars
- Cipher fields stored in predictions.push record
- ⚡ CIPHER EDGE badge injected in sidebar card

### v4.4.7 — Cipher Edge Colors + Field Names
- Purple=STRONG(≥20%), Green=MODERATE(≥10%), Grey=smaller
- Fixed p._cipherWinner → p.cipherWinner (underscore removal throughout)

### v4.4.8 — v4Winner Write-Once + Recalc Guard
- v4Winner only set on recalc if not already populated (write-once protection)
- Recalc blocked for live/final games (never overwrite pregame pick)

### v4.4.9 — v2WinnerWP Hotfix
- v2WinnerWP dropped in prior edit — restored

### v4.5.0 — P Flag Architecture + Cipher Root Cause + Tennis Exclusion
- **P FLAG NOW FOLLOWS DECISION FRAMEWORK** (V4 merged pick first, not always V2)
- **Cipher edge root cause fixed:** `_sbCCS` was `function` declaration inside try block → converted to `var _sbCCS = function(...)` for reliable execution
- catch block returns cipher defaults so `_outerCipherWinner` is never undefined
- Tennis excluded from Day 1 primary record (both filter instances)
- CAT win check adds `v2Winner` to fallback chain

### v4.5.1 — Bug Fixes (current)
- **V4 vs V2 Framework crash fixed:** `v4correct` variable was missing → `var v4correct = v4pick === actual` restored at line 20723
- **MLB excluded from primary record:** Day 1 (3 filters), CAT, BAR all exclude MLB
- **Recent results predicted winner mismatch fixed (Astros/Angels bug):** Recent results log was re-deriving predicted winner from live `predictedHomeWP` instead of stored `v4Winner`/`v2Winner`. Fixed: uses `v4Winner` → `v2Winner` → `predictedHomeWP` chain (same as P flag)
- **Accuracy tab crash fixed:** Misplaced `_excSport` block in `renderAccuracyDashboard` referenced `_exMLB` which only exists in `renderBadgeReport` scope — removed
- **`actualWinner` declaration restored:** Was accidentally deleted when predictedWinner block was rewritten

---

## CALIBRATION DECISIONS — LOCKED (Mar 29 2026 results)

| Decision | Status | Evidence |
|----------|--------|----------|
| Cipher amplification: margin×5, cap 80pts | **KEEP** | Portland won by 35 (cipher correct); Indiana blowout |
| DNA match weight: 25pts per variation | **KEEP** | Michigan 95-62 — DNA was the ONLY tiebreaker and was right |
| V3 Ambush signal | **KEEP + TRACK** | UConn beat Duke 73-72 — 1pt game with Ambush warning |
| No engine weight changes | **CONFIRMED** | All validation data supports current weights |

### Mar 29 Key Results
- **BKN 116-99 over SAC:** Brooklyn won despite SAC having 71pt cipher advantage. Raw VW held. Cipher is valid signal but doesn't always override strong raw VW.
- **PDX 123-88 over WAS:** Portland won — cipher was CORRECT. Sidebar picked Washington due to cipher bug (pre-v4.5.0). This was the most important validation — the bug directly caused a wrong pick.
- **IND 135-118 over MIA:** Indiana predicted (all signals agreed). Blowout. Cleanest validation.
- **MICH 95-62 over TEN:** Michigan predicted via DNA differential ONLY (2/4 vs 1/4). Michigan dominated. DNA at 25pts/match VALIDATED.
- **UCONN 73-72 over Duke:** Duke predicted. V3 Ambush fired -13% for Duke. 1-point upset confirms V3 Ambush has directional merit.
- **OKC vs NYK:** OKC led 53-52 at halftime. Result pending at session close.

### Portal Badge Finding
All 3 non-tennis losses (NJ Devils, Florida Panthers, Texas Rangers) had Portal Convergence or Portal Alignment fire on the LOSING team. **Hypothesis: Portal badge on AGREE game = contrarian warning signal, not boost.** Needs more data to confirm — do NOT change badge behavior yet, just track.

---

## KNOWN ARCHITECTURAL ISSUES (do not fix yet — need more data)

1. **Tale of Tape composite ≠ Sidebar composite:** Tape panel shows VW+DNA+NSB+toggle-cipher. Sidebar adds always-on `_sidebarCC` + `_cipherAmpH`. They produce different scores. Need to reconcile or label explicitly. Not urgent — users can cross-reference after understanding the difference.

2. **NHL AGREE = false confidence:** NHL V2 model is Vegas-derived (no real team efficiency priors). NHL AGREE just means "V4 agrees with Vegas" — not two independent engines. Fixed by building the NHL V2 Monte Carlo model (already in codebase as `calculateHockeyModel` but priors incomplete).

3. **Cipher edge badge in sidebar:** Infrastructure exists and is code-correct, but not reliably visible in practice. The `_sbCCS` function and `_outerCipher*` vars are wired correctly. May be a threshold issue (margin <3% suppresses badge) or a remaining scoping issue.

4. **Double-picking inflation:** The system runs V4 and V2 simultaneously and only loses when BOTH are wrong. The P flag now follows V4 merged pick (v4.5.0 fix) which is a step toward a single-pick framework. True single-pick mode (one definitive pick per game, log a loss if that pick is wrong) is the long-term goal.

---

## PRIORITY BUILD QUEUE — NEXT SESSION

### Bugs to Fix First
1. **Cipher edge badge not showing in V4 sidebar** — infrastructure exists, scoping or threshold issue
2. **Pending results shows VR score instead of cipher score** — wrong field being read

### Features to Build (in order)
1. **Export buttons:** SIE Calendar VW Matchboard + DNA Root Matrix
2. **Accuracy tab sport cards — sub-rows:**
   - Tennis: ATP sub-row + WTA sub-row (tape predictions only)
   - NHL: V2 sub-row (track V2-only win/loss for NHL)
3. **Retroactive badge rollup report:** Day-by-day with date-range selector, shows all badges that fired for winners vs losers, total points, spread. Rolls up to current date summary.
4. **Store + display cipher scores everywhere:**
   - Pending results: show actual cipher score (not VR score)
   - Recent results log: add cipher score column
   - Daily W/L log: add cipher score
   - Backdate cipher scores against all historical records including Tennis
5. **V3 Ambush BAR tracking:** Post-game only. Two rows:
   - "V3 Ambush Boost (+12%)" — did the boosted team win?
   - "V3 Ambush Penalty (-12%)" — did the penalized team lose?
   - Goal: validate whether V3 Ambush is worth keeping

### Queued Features (scoped, not yet started)
- **Tennis/MMA bilateral ESPN auto-population** + ATP/WTA match card display
- **NCAAW sub-tab under CBB** (ESPN endpoint: basketball/womens-college-basketball)
- **Variation Win Rate Report** — which name variation (full/city/mascot/abbrev) hits highest win rate per sport
- **Vibrational Pattern → Daily Root Number Predictor** — after 1 week of pulse data
- **Switch to V4 button** — manual pick override (deferred, let automated framework run first)

### Long-Term (do not build until >60% overall record)
- Sport expansion parent-tab architecture
- Reporting Dashboard (500+ resolved games)
- Daily Fantasy Integration (user will provide DFS HTML file)

---

## KEY TECHNICAL NOTES

### Function Locations
- `generatePredictedWinnersSidebar()` — line ~22905: builds sidebar, runs V4 merge rules
- `renderGameCard()` — line ~25886: renders each sport tab game card
- `recordPrediction()` — called from `fetchGames()` every 5 seconds
- `recordOutcome()` — called by auto-resolve (AUTO_TAB source) and manual scoring
- `renderAccuracyDashboard()` — accuracy tab main render
- `renderBadgeReport()` — BAR (Badge Accuracy Report)
- `renderDailyWLReport()` — CAT (Calendar Accuracy Tracker / Daily W/L)
- `renderV4V2Framework()` — V4 vs V2 framework report
- `calculateHockeyModel()` — NHL V2 Monte Carlo (built, priors incomplete)

### Critical Variable Scoping Rules Learned This Session
- `function` declarations inside `try` blocks are NOT reliably hoisted → always use `var fn = function()` inside try blocks
- `_exMLB` only exists in `renderBadgeReport` scope — do not reference in `renderAccuracyDashboard`
- `_outerCipher*` vars must be extracted from `_compScores` return object after the IIFE closes
- `v4correct` and `actualWinner` must be declared BEFORE they are used in the results forEach

### Stale Data Bug Pattern (recurring)
**Never re-derive predicted winner from live data post-game.** Always read from stored fields:
- `g.v4Winner` → `g.v2Winner` → `g.predictedHomeWP` (last resort only)
- This pattern appears in: BAR win check, Day 1 log, recent results, pending results, V4V2 framework
- The Astros/Angels bug (v4.5.1) and Bulls/Grizzlies bug were the same root cause

### ESPN API
- NFL/CFB: fetch 7 days ahead
- NBA/CBB: fetch 2 days ahead
- Pregame window: NBA/CBB/NHL 3 hours, MLB/Soccer 12 hours
- Auto-resolve: triggered when ESPN returns `isFinal === true`

---

## ACCURACY SUMMARY (as of Mar 29 2026 — Day 1 start Mar 27 2026)

| Sport | Record | Win% | Notes |
|-------|--------|------|-------|
| NBA | 11-0 | 100% | |
| MMA | 6-0 | 100% | |
| CBA | 2-0 | 100% | |
| CBB | 2-0 | 100% | |
| ESPORTS | 4-0 | 100% | |
| MLB | 7-1 | 88% | Background only |
| NHL | 6-2 | 75% | No independent V2 yet |
| Tennis-WTA | 4-3 | 57% | Background only |
| Tennis-ATP | 4-5 | 44% | Background only |
| **Non-Tennis/MLB** | **38-3** | **92.7%** | **Primary record** |

**By merge rule:** AGREE 24-7 (77%), R1:B_CONV 15-4 (79%), R_INCONSISTENT 2-0 (100%), no-rule tape 6-0 (100%)

**Important integrity note:** The 92.7% reflects V4 gematria merged picks. V2 and V4 often agree (AGREE rule). Pure V4 picks (R1:B_CONV + R_INCONSISTENT + tape) ran 23-4 (85%). The system only loses when BOTH engines are simultaneously wrong.

---

## SESSION KICKOFF PROMPT (for next window)
*See separate .txt file*
