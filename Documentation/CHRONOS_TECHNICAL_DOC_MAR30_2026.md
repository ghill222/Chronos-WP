# Chronos-WP v4 — Comprehensive Technical Documentation
## Version 4.5.1 | March 30, 2026

---

## ARCHITECTURE OVERVIEW

Single-file HTML application (~33,700 lines, ~2.2MB). All logic self-contained. No build system, no dependencies beyond the ESPN API (fetched at runtime). Runs locally via file:// protocol.

**Key globals:**
- `gameWPs` — Map<gameId, gameEntry>: all active games with V2 results and V4 sidebar data
- `accuracyTracker` — object with `.predictions` Map and `.results` Map
- `currentSport` — active sport tab string ('nba', 'nhl', 'cbb', etc.)
- `window._sidebarPredictionsBySport` — Map<sport, predictions[]>: live sidebar V4 picks
- `window._dnaConfirmedTargets` — today's confirmed winner roots (set when DNA Matrix opened with 5+ games)

---

## CUSTOM SPORT-SPECIFIC CIPHERS

### Overview
Each sport has a custom letter-frequency cipher built from historical winner name pattern analysis. The cipher scores a team name by summing letter values, producing a raw integer. The cipher winner receives a composite bonus based on the margin.

### Current Cipher Tables (as of v4.5.1)

**NBA Cipher** (Accuracy: 61.5% — validated, keep)
```
A:4 B:3 C:4 D:5 E:4 F:4 G:4 H:4 I:3 J:1 K:3 L:4 M:2
N:4 O:4 P:4 Q:4 R:4 S:4 T:5 U:4 V:9 W:4 X:2 Y:4 Z:2
High-value: V(9), T(5), D(5) — teams with these letters in mascot score higher
```

**NHL Cipher** (Accuracy: 61.0% — needs tuning, no V2 model yet)
```
A:5 B:4 C:5 D:7 E:7 F:2 G:1 H:4 I:6 J:7 K:1 L:7 M:9
N:5 O:7 P:4 Q:5 R:3 S:4 T:5 U:5 V:6 W:4 X:5 Y:5 Z:5
High-value: M(9), D(7), E(7), J(7), L(7), O(7) — heavy weighting on common letters
```

**MLB Cipher** (Accuracy: 53.2% — needs significant tuning, background only)
```
A:2 B:2 C:2 D:2 E:2 F:1 G:2 H:1 I:2 J:9 K:2 L:2 M:2
N:2 O:2 P:1 Q:2 R:2 S:2 T:2 U:2 V:6 W:2 X:1 Y:2 Z:1
High-value: J(9), V(6) — very sparse differentiation, most letters = 2
NOTE: MLB cipher needs complete rebuild. Current table produces insufficient score variation.
```

**CBB Cipher** (Accuracy: 72.2% — strongest cipher, validate and keep)
```
A:2 B:3 C:2 D:3 E:4 F:3 G:1 H:2 I:5 J:3 K:3 L:6 M:2
N:4 O:3 P:3 Q:3 R:2 S:3 T:2 U:3 V:1 W:9 X:1 Y:4 Z:4
High-value: W(9), L(6), I(5), N(4) — common in team mascots
```

**CFB Cipher** (Accuracy: unknown — same as NFL, needs independent data)
```
A:4 B:6 C:4 D:5 E:5 F:4 G:3 H:2 I:3 J:3 K:3 L:4 M:4
N:3 O:3 P:3 Q:9 R:4 S:3 T:3 U:3 V:4 W:2 X:1 Y:6 Z:2
High-value: Q(9), B(6), Y(6)
```

**NFL Cipher** (Accuracy: unknown — same values as CFB, needs independent tuning)
```
A:4 B:6 C:4 D:5 E:5 F:4 G:3 H:2 I:3 J:3 K:3 L:4 M:4
N:3 O:3 P:3 Q:9 R:4 S:3 T:3 U:3 V:4 W:2 X:1 Y:6 Z:2
NOTE: NFL and CFB currently share identical cipher values. Need separate tuning once
sufficient game history is accumulated for each.
```

**Soccer Cipher** (Accuracy: 35.5% — DO NOT USE as primary signal)
```
A:1 B:1 C:1 D:1 E:1 F:1 G:1 H:1 I:1 J:3 K:1 L:1 M:1
N:1 O:1 P:1 Q:3 R:1 S:1 T:1 U:1 V:1 W:1 X:3 Y:1 Z:9
NOTE: Nearly all letters = 1. Minimal differentiation. Soccer predictions use V2 as primary.
Cipher needs complete rebuild using club name patterns from international football data.
```

**Tennis Cipher** (Accuracy: 52.6% — below coin flip after margin, PRIORITY for tuning)
```
A:5 B:6 C:5 D:5 E:5 F:6 G:6 H:4 I:4 J:4 K:4 L:4 M:5
N:4 O:4 P:4 Q:5 R:5 S:4 T:4 U:4 V:4 W:1 X:3 Y:9 Z:4
High-value: Y(9), B(6), F(6), G(6) — player surnames with these letters score higher
NOTE: Tennis cipher is shared with MMA (same table). Both use first+last name scoring.
Tennis is the highest-priority cipher for tuning because:
  1. Player names change dramatically in cipher score based on ESPN name format
     ("Carlos Alcaraz" vs "C. Alcaraz" vs "Alcaraz" = completely different scores)
  2. No V2 statistical backup — cipher carries 100% of the prediction weight
  3. ATP ran 44% over Mar 27-29 2026 — below coin flip
  4. Individual players rotate through form cycles not captured by static letter values
  5. Language of origin matters — Eastern European surnames (common in WTA) have
     different letter patterns than Western European or South American players
```

**ESPORTS Cipher** (Accuracy: 60.0% — acceptable for now)
```
A:1 B:2 C:1 D:2 E:2 F:1 G:2 H:1 I:1 J:5 K:1 L:1 M:1
N:2 O:1 P:3 Q:1 R:1 S:2 T:2 U:1 V:9 W:1 X:2 Y:1 Z:2
High-value: V(9), J(5), P(3) — team names often use uncommon letters
```

**MMA Cipher** (Accuracy: unknown — same values as Tennis)
```
Same table as TENNIS. Fighter names use full first+last name scoring.
NOTE: MMA runs 100% in limited sample but needs own independent cipher table
once 50+ fights are tracked.
```

**CBA Cipher** (Accuracy: unknown — same values as CFB/NFL)
```
Same table as CFB/NFL. EuroLeague teams. Needs independent data collection.
```

### Cipher Scoring Formula
```javascript
// For each team name:
raw_score = sum of CIPHER[letter] for each alpha letter in name.toUpperCase()
margin = |home_score - away_score|
max_score = Math.max(home_score, away_score)

// Composite bonuses (always-on, not toggle-dependent):
_sidebarCC = min(55, margin/max_score * 120)  // normalized, 55pt cap
_cipherAmp = min(80, margin*5 + DNA_root_bonus) // amplification, 80pt cap

// Toggle-dependent bonus (when cipher panel is ON):
_ccBonus = min(55, margin/max_score * 120)    // same formula, additive
```

### Cipher Tuning Approach
Ciphers are tuned by:
1. Running Variation Win Rate Report → identify which letter combinations appear most in winning team names per sport
2. Adjusting letter values up for letters that appear disproportionately in winners
3. Adjusting down for letters appearing in losers
4. Re-validating on next 20-30 game sample
5. Only accept changes if overall cipher accuracy improves by ≥2%

**Tennis tuning is highest priority.** Specific approach:
- Separate ATP and WTA into independent ciphers (different player pools)
- Weight by surname only (first name adds noise — ESPN sometimes omits it)
- Consider language-of-origin grouping (Eastern European vs. Western vs. South American)
- Track surface type (grass/clay/hard) as a cipher modifier since player styles differ

---

## SPORT-SPECIFIC VARIATION WEIGHTS

Name variations (full, city, mascot, abbreviation) are weighted differently per sport based on Variation Win Rate Report data (Mar 27 2026, 141 games):

```javascript
const SPORT_VAR_WEIGHTS = {
    nba:    { full:1.3, city:0.7, mascot:1.3, abbrev:1.0 },
    // NBA: mascot 66.7% + full 66.7% >> city 45.5% → boost both, reduce city

    nhl:    { full:0.8, city:1.1, mascot:1.0, abbrev:0.8 },
    // NHL: all weak; city 47.8% best of bad options

    cbb:    { full:1.0, city:1.2, mascot:1.2, abbrev:0.9 },
    // CBB: city 60% + mascot 60% → both boosted

    cfb:    { full:1.0, city:1.1, mascot:1.1, abbrev:0.9 },
    mlb:    { full:1.0, city:1.0, mascot:1.0, abbrev:1.0 },
    // MLB: ~50% all variations → neutral weights

    soccer: { full:0.9, city:0.7, mascot:1.4, abbrev:0.9 },
    // Soccer: mascot 60% >> city 25% → big mascot boost

    tennis: { full:1.2, city:0.8, mascot:1.2, abbrev:0.8 },
    // Tennis: full name + surname work best; city/abbreviation meaningless

    mma:    { full:1.2, city:0.8, mascot:1.2, abbrev:0.8 },
};
```

These weights multiply the VW tape score contribution of each variation. Updated as Variation Win Rate Report accumulates more data. Target: update quarterly or after 100+ new games per sport.

---

## COMPOSITE SCORING PIPELINE

```
Step 1: VW Tape Scoring
  scoreSidebarTeam(name, allVW, sport)
  → Scores name against all 9 calendar systems
  → Applies SPORT_VAR_WEIGHTS to each of 4 variations (full/city/mascot/abbrev)
  → Returns {total, grand: {UN, GD, LD, DPM}, topCals}

Step 2: DNA Root Matching (_varDNA_sb)
  → Runs all 4 variations through all standard CIPHERS
  → Gets dominant digital root for each variation
  → Counts how many match today's confirmed target roots (from getObservedDailyRoots())
  → Returns count (0-4)
  → Each match = +25pts composite bonus

Step 3: Master Root Bonus (_mrBonusH/A)
  → Gets dominant root across ALL ciphers combined for the team name
  → If root = today's target: +50pts
  → If root = today's confirmed loser: -35pts
  → If neither: 0pts

Step 4: Always-On Sport Cipher (_sidebarCC)
  → Runs CUSTOM_CIPHERS[currentSport] against homeTeam and awayTeam
  → Normalized margin score, capped at 55pts
  → Goes to cipher winner

Step 5: Cipher Amplification (_cipherAmpH/A)
  → margin × 5 base amplification
  → If cipher winner's score root = today's DNA target: +margin×2 DNA bonus
  → Capped at 80pts total
  → Goes to cipher winner

Step 6: Name Structure Bonus (NSB, _nsbH/A)
  → Ordinal sum analysis: ranges, first letter bias, mascot length
  → R1 penalty (-20pts), sum 100-109 danger zone (-20pts)
  → Capped at ±25pts

Step 7: Toggle Cipher (_ccBonusH/A)
  → Only runs if custom-cipher-toggle is ON
  → Uses currently selected sport cipher from dropdown
  → Same normalization as _sidebarCC, capped 55pts
  → ADDITIVE on top of _sidebarCC (not a replacement)

Step 8: Temporal Shift (_timeShiftH/A)
  → Prime-time (7pm+): +2pts home advantage
  → Afternoon (noon-4pm): +1pt away advantage

Final composite:
  compHome = homeTS.total + _dnaH*25 + _mrBonusH + _skipH + _ccBonusH
           + _nsbH + _sidebarCC_H + _cipherAmpH + _timeShiftH
```

---

## MERGE RULES ENGINE

Merge rules determine which engine's pick becomes the final V4 pick (`tapeWinner`).

```javascript
// Mode A: forward+reverse gematria conviction analysis
const modeAWinner = modeAConsistent ? _fwdWin : null;
const modeAConv = modeAConsistent ? v4pred.winnerConviction.percentage : 0;

// Mode B: VW calendar composite score comparison
const modeBWinner = homeTS.total >= awayTS.total ? homeTeam : awayTeam;
// NOTE: modeBWinnerComposite uses full composite including cipher amplification

const modesAgree = modeAWinner === modeBWinner;

// Rule chain (in priority order):
if (!modeAWinner)         → R_INCONSISTENT: use composite Mode B
else if (modesAgree)      → AGREE: use that pick
else if (modeAConv >= 85) → R1:B_CONV: high conviction + disagree → use Mode B
else if (margin >= 100)   → R2:A: dominant margin → use Mode A
else if (margin < 30)     → R3:B: weak margin → use Mode B
else                      → R4:B_MED: medium default → use Mode B

// V4 Override (additional pass):
// Fires when: V4 conv ≥70% AND (Portal PC/PA fires OR cipher agrees) AND V2 <60%
// Result: mergedRule = 'V4_OVERRIDE', merged pick follows V4
```

---

## V2 STATISTICAL ENGINES

### NBA/CBB Model (`calculateBasketballModel`)
Monte Carlo simulation (10,000 iterations). Inputs:
- `offEff`: Offensive efficiency (points per 100 possessions)
- `defEff`: Defensive efficiency (points allowed per 100)
- `pace`: Possessions per game
- `vegasSpread`: Current Vegas line
- `vegasTotal`: Current over/under

Win probability derived from projected point distribution. Home court: +3.2pt adjustment.

**NBA Priors (updated Mar 29 2026 — 2025-26 actual season data):**
Key corrections made: Spurs 109.4→120.1 offEff (were bottom of league, now top); Bucks fixed to reflect negative net rating; several other teams corrected from stale preseason projections. Must update monthly — use NBAstuffer.com around the 15th of each month.

### NHL Model (`calculateHockeyModel`)
Monte Carlo shot-attempt simulation. Inputs:
- `cf_pct`: Corsi For percentage (shot attempt possession)
- `gf60`: Goals For per 60 minutes at 5v5
- `ga60`: Goals Against per 60 minutes at 5v5
- `pp_pct`: Power play percentage
- `pk_pct`: Penalty kill percentage
- `sv_pct`: Save percentage
- OT logic: ~24% of NHL games go to overtime

**STATUS:** Function built (`calculateHockeyModel`), but team priors are incomplete. Most NHL games fall back to Vegas-derived model. This means NHL AGREE = "V4 agrees with Vegas" — not two independent engines. NHL priors update is highest-priority V2 improvement.

### MLB Model (`calculateBaseballModel`)
Inputs: runs per game, bullpen ERA, batting average, home/away splits, Vegas line.
Currently background-tracking only until cipher and model accuracy improves above 60%.

---

## DNA ROOT SYSTEM

### getObservedDailyRoots()
Live function called per game in the sidebar scoring loop. Priority order:
1. Today's completed games from `accuracyTracker.results` (requires ≥1 game)
2. `window._dnaConfirmedTargets` cache (set when DNA Matrix opened with ≥5 games)
3. Yesterday's completed games (≥3 games)
4. Default fallback: `{targets:[7,1,3], losers:[4,5]}`

**Returns:** `{targets: number[], losers: number[], source: string, live: boolean}`

**Target threshold:** A root is confirmed as a winner target when it wins ≥60% of games where it appears as a team's dominant cipher root.

**Loser threshold:** A root is confirmed as a loser when it wins ≤35% of games.

**Important:** The sidebar scoring loop calls `getObservedDailyRoots()` live per game on each 5-second refresh. As games complete throughout the day, DNA target/loser roots update automatically and all remaining pregame composite scores recalculate. Concluded games (isFinal=true) are excluded from re-scoring.

---

## ACCURACY TRACKING SYSTEM

### Data Flow
```
1. recordPrediction(gameId, gameData, wpResult)
   Called from fetchGames() every 5 seconds for each pregame
   Stores: v4Winner (merged pick), v2Winner, predictedHomeWP, all badge flags,
           mergedRule, portalConvergence, cipherWinner, cipherEdgePct, etc.
   
2. generatePredictedWinnersSidebar()
   Runs every 5 seconds (same refresh cycle)
   Writes to window._sidebarPredictionsBySport[sport] = predictions[]
   Also writes lock flags, cipher data back to gameWPs entries

3. recordOutcome(gameId, homeScore, awayScore, source)
   Called by AUTO_TAB (ESPN final detection) or MANUAL (user entry)
   Sets: homeWon, actualHomeScore, actualAwayScore, completedAt
   Does NOT recalculate v4Winner — write-once protection
   Does NOT fire for live games — only final/completed

4. Results stored in accuracyTracker.results Map
   Read by: BAR, CAT, Day 1 log, V4V2 Framework, recent results table
```

### Win Check Logic (all report locations)
```javascript
// Consistent across BAR, CAT, Day 1, V4V2 Framework, recent results:
const pred = g.v4Winner || g.v2Winner || (g.predictedHomeWP > 50 ? g.homeTeam : g.awayTeam);
const act  = g.homeWon ? g.homeTeam : g.awayTeam;
const correct = pred === act;
```

### v4Winner Write-Once Protection
`v4Winner` is set at prediction time from the full V4 merge. During recalculations (when Vegas data becomes available), `v4Winner` is only updated if it was null. Live and final games are blocked from recalculation entirely. This prevents the Spurs/Bucks-style bug where a mid-session prior update caused the post-game logged winner to differ from the pre-game prediction.

---

## STORAGE ARCHITECTURE

### IndexedDB (Primary)
- `_initIndexedDB()`: Opens 'ChronosWP' database
- `_saveToIndexedDB()`: Saves full predictions + results on every change
- `_tryRestoreFromIDB()`: On load, restores from IDB if it has more records than localStorage
- Auto-promotes IDB over localStorage when IDB has more data (handles localStorage quota)

### localStorage (Secondary)
- Fallback when IDB unavailable
- Key: `chronos_accuracy_v2` (predictions + results JSON)
- Key: `chronos_v430_date` (Day 1 start date = '2026-03-27')
- Key: `chronos_cal_ranked` (calendar hit rate cache)
- Key: `chronos_sie_weights` (Self-Improvement Engine weight history)

### Limits
```
MAX_STORED_GAMES: 1200
AUTO_ARCHIVE_THRESHOLD: 1000
```

---

## ESPN API INTEGRATION

### Endpoints Used
```
NBA:    /basketball/nba
CBB:    /basketball/mens-college-basketball
NHL:    /hockey/nhl
MLB:    /baseball/mlb
NFL:    /football/nfl
CFB:    /football/college-football
Soccer: /soccer/{league}
Tennis: Manual only (ESPN doesn't provide individual match odds)
MMA:    Manual only
```

### Refresh Logic
- `startAutoRefresh()`: Calls `fetchGames()` every 5 seconds
- `fetchGames()`: Skips when user is on Accuracy, Gematria, Tennis, MMA, or Pulse tabs
- `enrichedGames.forEach()`: Processes each game → calls V2 model → stores in gameWPs → calls recordPrediction
- Auto-resolve: When ESPN returns `isFinal === true`, calls `recordOutcome(gid, homeScore, awayScore, 'AUTO_TAB')`

### Fetch Windows
- NFL/CFB: 7 days ahead
- NBA/CBB: 2 days ahead
- NHL/MLB: 2 days ahead
- Pregame logging window: NBA/CBB/NHL = 3 hours before start; MLB/Soccer = 12 hours

---

## KNOWN ARCHITECTURAL ISSUES

### Tale of Tape vs Sidebar Composite Mismatch
The Tale of the Tape composite score and the sidebar composite score are not the same computation:
- **Tape:** VW + DNA×25 + NSB + toggle-cipher (when ON)
- **Sidebar:** VW + DNA×25 + NSB + toggle-cipher + _sidebarCC (always-on) + _cipherAmpH (always-on)

The sidebar adds up to 135pts of cipher bonuses (55pt sidebarCC + 80pt amp) that the tape panel does not show. This is why Knicks showed +39 on tape but OKC led by ~84 in sidebar for the Mar 29 game. Resolution: add a "Sidebar Composite" field to the tape panel output, or explicitly label the composite score on each panel.

### NHL AGREE = False Confidence
Without a proper NHL V2 Monte Carlo model using real team priors, NHL AGREE means "V4 agrees with Vegas" — not two independent engines confirming the same pick. All 2 NHL losses in the Mar 27-29 sample were AGREE games. Fix: complete the NHL team priors table to enable `calculateHockeyModel()` to run independently of Vegas.

### Cipher Edge Badge Reliability
The ⚡ CIPHER EDGE badge infrastructure is complete (stored in prediction records, rendered in card HTML). However the badge requires the cipher to run successfully AND produce a margin ≥3% AND for `p.cipherWinner` to be non-null. Under certain conditions (very balanced cipher scores, or sports with nearly-identical team name structures) the badge is suppressed. This is architecturally correct behavior but may need threshold adjustment.

---

## VALIDATION COMMAND (run after every change)
```bash
cd /tmp && node -e "
const acorn=require('./node_modules/acorn');
const fs=require('fs');
const src=fs.readFileSync('/home/claude/chronos_wp_v4_fix1.html','utf8');
const scripts=src.match(/<script[^>]*>([\s\S]*?)<\/script>/g)||[];
let errors=[];
scripts.forEach((s,i)=>{
  const inner=s.replace(/<script[^>]*>/,'').replace(/<\/script>/,'');
  try{acorn.parse(inner,{ecmaVersion:2020});}
  catch(e){errors.push('Block '+i+': line '+e.loc?.line+' — '+e.message);}
});
console.log(errors.length?'ERRORS:\n'+errors.join('\n'):'✅ All JS valid — '+src.split('\n').length+' lines');
"
```
