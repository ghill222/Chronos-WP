# Chronos-WP v4 — Changelog
## All versions from v4.0.0 through v4.5.1

---

## v4.5.1 — March 30, 2026
**Bug fixes — accuracy tab crashes and predicted winner consistency**

- **FIX:** V4 vs V2 Framework report crash — `v4correct is not defined` at line 20723. Variable was dropped in a prior edit. Restored: `var v4correct = v4pick === actual`
- **FIX:** Accuracy tab crash — `_excSport` block inserted into `renderAccuracyDashboard` referenced `_exMLB` which only exists in `renderBadgeReport` scope. Removed misplaced block.
- **FIX:** Accuracy tab crash — `actualWinner is not defined`. Variable was accidentally deleted when predictedWinner block was rewritten. Restored: `const actualWinner = game.homeWon ? homeTeamShort : awayTeamShort`
- **FIX:** Recent results log predicted winner mismatch (Astros/Angels bug). Recent results was re-deriving predicted winner from live `predictedHomeWP` instead of stored fields. Fixed to use `v4Winner → v2Winner → predictedHomeWP` priority chain — same as P flag
- **FEATURE:** MLB excluded from primary record (background tracking only). Applied to Day 1 log (3 filters), CAT (Calendar Accuracy Tracker), and BAR (Badge Accuracy Report)

---

## v4.5.0 — March 29-30, 2026
**Major: P flag architecture change + cipher root cause fix + Tennis exclusion**

- **ARCHITECTURE:** P flag now follows the actual merged V4 pick, not always V2. Decision framework: (1) sidebar pool `tapeWinner`, (2) stored `v4Winner`, (3) V2 `wp>=50` fallback only. The P badge now shows which engine is actually making the prediction.
- **FIX:** Cipher edge root cause finally resolved. `_sbCCS` was declared as `function` inside a try block — unreliably hoisted in modern JS strict mode. Converted to `var _sbCCS = function(...)`. The catch block also now returns cipher defaults so `_compScores.cipherWinner` is never undefined.
- **FEATURE:** Tennis excluded from Day 1 primary record. Both filter instances updated. Tennis tracked in background — not counted against primary win rate.
- **FIX:** CAT win check adds `g.v2Winner` to the fallback chain (was jumping from `g.v4Winner` directly to `predictedHomeWP` derivation, missing the stored v2Winner).

---

## v4.4.9 — March 29, 2026
**Hotfix: v2WinnerWP variable restored**

- v2WinnerWP was dropped when v2Winner block was rewritten in v4.4.8. Restored: `const v2WinnerWP = predHomeWP >= 50 ? predHomeWP : (100 - predHomeWP)`
- Accuracy tab crash fixed (was showing `v2WinnerWP is not defined`)

---

## v4.4.8 — March 29, 2026
**v4Winner write-once protection + recalculation guard**

- **FIX:** `recordPrediction()` recalculation path was calling `predictGameWinner()` (Mode A only) and overwriting `v4Winner` with the fresh Mode A result, discarding the original full-merge pick. Now: `v4Winner` only updated on recalc if it was null (write-once)
- **FIX:** Recalculation blocked for live and final games. Guard: `!gameData.isLive && !gameData.isFinal`. Prevents pregame pick from changing after the game starts.
- Root cause of Spurs/Bucks prediction flip: when NBA priors were updated mid-session, `needsRecalc` flag triggered, Mode A re-ran, picked Bucks over Spurs, overwrote the original merged prediction. Fixed by write-once protection.

---

## v4.4.7 — March 29, 2026
**Cipher edge colors + field name consistency**

- Cipher edge colors corrected: Purple (#a78bfa) = STRONG (≥20% margin), Green (#10b981) = MODERATE (≥10%), Grey (#4a5568) = smaller
- Fixed field name mismatch throughout cipher edge IIFE: `p._cipherWinner` → `p.cipherWinner` (no underscore) in guard, color, tooltip, and return statements

---

## v4.4.6 — March 29, 2026
**Cipher edge infrastructure + V2 mismatch fix**

- `_sbCH/CA/CMax` declared outside try block with zero defaults (previously inside, causing undefined when try threw)
- `_sbCipherWinner` computed inside try (where scores are valid), exposed to outer scope via `_outerCipherWinner/EdgePct/EdgeLabel`
- Cipher fields stored in `predictions.push` record: `cipherWinner`, `cipherEdgePct`, `cipherEdgeLabel`
- ⚡ CIPHER EDGE badge IIFE injected in sidebar card HTML
- `_compScores` return now includes cipher data
- **FIX:** Pending results uses stored `g.v2Winner` instead of re-deriving from `predictedHomeWP`
- **FIX:** v4Winner is write-once on sidebar recalc (existing v4Winner not overwritten)
- **FIX:** Recalc blocked for live/final games

---

## v4.4.5 — March 28-29, 2026
**R4 Warn fix + VPT+DNA dedup**

- R4 Warn: now requires `losers.indexOf(4) !== -1` — only fires when R4 is explicitly a confirmed loser root, not simply absent from targets
- Applied to both BAR tracking path and sidebar live rendering
- VPT+DNA live-recompute IIFE removed; kept stored `p.vptDnaWinner` version with team name
- Removed duplicate `if((_obsR4.targets||[]).indexOf(4)!==-1) return false` in sidebar R4 path

---

## v4.4.4 — March 28, 2026
**NSB cap + cipher cap + IndexedDB storage**

- NSB (Name Structure Bonus) cap reduced from ±50 → ±25 (was causing Bucks to incorrectly beat Spurs in composite)
- Sidebar cipher cap raised from 40 → 55pts
- `MAX_STORED_GAMES` 500→1200, `AUTO_ARCHIVE_THRESHOLD` 400→1000
- **FEATURE:** IndexedDB added as primary storage layer: `_initIndexedDB()`, `_saveToIndexedDB()`, `_tryRestoreFromIDB()`. Auto-restores from IDB if localStorage has fewer records.

---

## v4.4.3 — March 28, 2026
**Backdate "today" label + daily log date fix + V4 Override v2wp scale**

- `daysSince` uses midnight-to-midnight calendar comparison (not raw milliseconds — was showing wrong day labels)
- "Yesterday" label added to pending results
- Daily log and Day 1 log group by `gameDate` not `completedAt`
- V4 Override: fixed `_v4OvV2WP` — `gameData.wp` is 0-100 in sidebar context (was multiplying by 100 again, producing values like 7432%)

---

## v4.4.2 — March 28, 2026
**Backdate fix + switch pick propagation + game time sorting + temporal shift**

- `saveTapePrediction` reads `tape-game-date` input for `gameDate` (was using current date always)
- `switchTapePick()` updates `window._lastTapeDisplayWinner = oppName` for consistency
- Pending/recent results sorted by date then game start time ASC
- Temporal shift in composite: prime-time (7pm+) +2 home advantage, afternoon +1 away advantage

---

## v4.4.1 — March 28, 2026
**V4 Override system + Name Structure Bonus + NBA priors updated**

- `override` tier added to TIER_LABELS and TIER_ORDER (was why Trust V4/V4 Dissent badges never rendered)
- **V4 Override system:** V4 conv ≥70% + (Portal PC/PA OR cipher agrees) + V2 <60% → V4 overrides merge, stored as `mergedRule = 'V4_OVERRIDE'`
- **Name Structure Bonus `_nsbCompute()`:** ordinal sum ranges, mascot length, first letter bias, sport root distribution, R1 penalty (−20), sum 100-109 danger zone (−20)
- Always-on sidebar cipher `_sidebarCC_H/A` (not toggle-dependent, capped 40pts → later raised to 55)
- **NBA priors updated** to 2025-26 actual season data: Spurs 120.1/111.8, Bucks 112.8/118.9, Charlotte 119.2/114.4, 76ers 115.0/114.9 (correcting stale preseason projections)

---

## v4.4.0 — March 28, 2026
**v2WinnerTrack fix + 1969 date fix**

- `v2WinnerTrack` reads stored `v2Winner` field first before deriving from `predictedHomeWP`
- `gameDate` guards against isNaN/zero/negative timestamps (was producing 1969 dates)

---

## v4.3.9 — March 28, 2026
**Switch pick rewrite + bulk delete fix + cipher panel fix**

- `switchTapePick(oppName, origName)` rewritten as standalone function
- `bulkDeleteResults`: sanitized→actual key lookup (was failing to find records to delete)
- Cipher panel letter display: shows "🔥 High-value: V, Y" instead of raw letter list
- `r4_warn`, `trust_v4`, `v4_dissent` removed from TAPE_BADGE_KEYS (were routing to tape pool instead of BAR)

---

## v4.3.8 — March 28, 2026
**Prediction integrity fixes**

- `trackMergedWinner` synced with sidebar merge rules (NBA wrong predicted winner bug — was using different rule logic than sidebar)
- Stale `_lastTape*` globals cleared at start of `runTapeCalculator()` (Tennis wrong winner bug — was showing previous match winner)
- Duplicate trap badges fixed

---

## v4.3.7 — March 28, 2026
**BAR tracking + cipher panel UX**

- R4 Warn added to main BADGE_DEFS for BAR tracking
- Trust V4 and V4 Dissent added to TAPE_BADGE_KEYS and SIE export lists
- Cipher panel now appears between save/sport box and VW calendar breakdown
- Switching sport cipher clears results with "Cipher changed — re-run to update" message
- Switch Pick button added under winner banner (visual only, doesn't affect saved pick)
- Composite scoring overhauled for cipher toggle-on state

---

## v4.3.2 — March 27-28, 2026
**Portal badges in BAR + preV430 stamp + Day 1 drill-down**

- Portal Convergence and Portal Alignment added to BAR BADGE_DEFS
- preV430 stamp re-runs with key `v2` to catch all currently-pending predictions
- Day 1 card converted to drill-down with full game log (home, away, predicted, actual, result, rule, PC/PA)

---

## v4.3.0 — March 27, 2026
**Major: V4.3 weight changes + merge rule overhaul**

- TAPE_WEIGHTS changed: DPM×6, UN×6, GD×0, LD×0 (previously DPM×5, UN×4, GD×3, LD×2)
- Merge rules updated from 163-game audit: R1:B_CONV (new), R2:A, R3:B, R4:B_MED, R_INCONSISTENT
- preV430 flag stamps all pre-existing records to exclude from Day 1 baseline
- Day 1 start date locked: `chronos_v430_date = '2026-03-27'`

---

## v4.2.7 — March 27, 2026
**Sport variation weights — full coverage**

- All `scoreTeamVW` calls wired with sport parameter
- Zero calls without sport remaining — sport-specific weights apply globally

---

## v4.2.6 — March 27, 2026
**Tape display rounds + sport wired to all call sites**

- VW display rounded throughout (`Math.round` at 3 tape display sites)
- Sport parameter wired into 13 `scoreTeamVW` call sites

---

## v4.2.5 — March 27, 2026
**VW decimal fix**

- `Math.round()` added at all 5 sidebar display sites
- Root cause: float multipliers from v4.2.4 SPORT_VAR_WEIGHTS broke integer VW scores

---

## v4.2.4 — March 27, 2026
**4 actions from Variation Win Rate analysis**

- `SPORT_VAR_WEIGHTS` + `getVarWeights(sport)` — sport-specific variation multipliers
- Pattern recognition confidence fixed — now tracks single dominant root per game
- VW Pattern export upgraded with day-by-day breakdown + root streak analysis
- Pattern recognition timing fixed — runs 200ms after sidebar (not before ESPN loads)

---

## v4.2.3 — March 27, 2026
**Panel exports + combinator fix + pattern recognition redesign**

- Export functions added for: CAT, VW Pattern, Pattern Recognition, Variation Win Rate, Pulse Tracker
- Combinator auto-populate filters to today-only games
- Pattern Recognition redesigned with calendar-slot → winning-root table
- Fixed missing closing `}` for else block (syntax bug)

---

## v4.2.2 — March 27, 2026
**Export buttons on all reports**

- Export functions: `exportAccuracyDashboard`, `exportBadgeReport`, `exportDailyWLReport`, `exportV4V2Framework`, `exportCalendarLeaderboard`, `exportUpsetAnalysis`, `exportVPRanking`
- Helper functions: `_exportDownload`, `_fmtDate`, `_pct`, `_winCheck`
- Export buttons added to every report header

---

## v4.2.1 — March 27, 2026
**Data integrity fixes from SIE report**

- `recordOutcome` forces `modelVersion = 'V4-Tape'` for tape matches
- `trackMergedRule` updated to new names (R1:B_CONV, R2:A, R3:B, R4:B_MED, R_INCONSISTENT)
- `isLopsided`, `dnaWinnerVarScore`, `r4WarnActive` added to `v4CalendarData`
- Retroactive alignment badge computation in `migrateV1toV2()` — patches old records
- Calendar hit rates exposed to `window._calHitRates`, `window._calRanked`
- `applyCalReweighting()`, `resetCalWeights()`, `runCalendarBacktest()` added

---

## v4.2.0 — March 27, 2026
**Self-Improvement Engine Loop 2**

- `renderSelfImprovementEngine()` — Engine Health table, Merge Rule Performance, Badge Signal Weight Table, Recommendations, Loop 3 readiness tracker
- `loadSIEWeights()`, `saveSIEWeights()`, `loadSIEHistory()` — localStorage persistence
- `_sigConf()` wired to SIE empirical weights (70% empirical / 30% prior blend)
- SIE button added to Accuracy tab

---

## v4.0.0 through v4.1.x — March 19-26, 2026
**Foundation sessions**

- Initial V4 gematria engine built on top of V3 statistical base
- ESPN API integration (all sports)
- Tale of the Tape calculator (Tennis + MMA)
- Sidebar V4 prediction cards
- Accuracy tracker (predictions + results storage)
- Badge system (Portal Convergence, Portal Alignment, Triple Lock, Quad Lock, R4 Warn, Trap, Skip Pattern, DNA Match)
- DNA Root Matrix and Vibrational Pulse Tracker
- Kalshi integration (Tennis market odds)
- March Madness bracket integration
- Calendar Accuracy Tracker (CAT)
- Badge Accuracy Report (BAR)
- V4 vs V2 Framework report
- Gematria Lab with cipher calculator
- Power Rankings + VPR system
- CBB bracket tool with VW scoring
- Custom cipher engine (`CUSTOM_CIPHERS` per sport)
- `SPORT_VAR_WEIGHTS` foundation

---

## ACCURACY MILESTONES

| Date | Games | Record | Win% | Notes |
|------|-------|--------|------|-------|
| Mar 19-26, 2026 | ~162 | ~77-85 | ~52% | Pre-v4.3 weights, dirty data (ESPORTS contamination, stale priors) |
| Mar 27, 2026 | v4.3 Day 1 start | — | — | New weights locked, clean baseline begins |
| Mar 27-29, 2026 | 58 unique | 47-11 | 81% | All sports including Tennis |
| Mar 27-29, 2026 | 38 | 38-3 | **92.7%** | **Non-Tennis/MLB primary record** |

**Key finding (Mar 29):** Portland beat Washington 123-88. The sidebar predicted Washington due to the cipher bug (pre-v4.5.0). The tape panel correctly showed Portland winning the composite via cipher. This single game validated the cipher system and justified the v4.5.0 architecture fix.
