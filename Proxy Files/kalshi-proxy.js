const http   = require('http');
const https  = require('https');
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');
const os     = require('os');

// ── Config ──
const CONFIG_PATH = path.join(__dirname, 'kalshi-config.json');
if (!fs.existsSync(CONFIG_PATH)) {
    console.error('kalshi-config.json not found. Run setup-kalshi.bat first.');
    process.exit(1);
}
const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
if (Array.isArray(cfg.privateKey)) cfg.privateKey = cfg.privateKey.join('\n');
if (!cfg.keyId || !cfg.privateKey) {
    console.error('kalshi-config.json must have keyId and privateKey.');
    process.exit(1);
}
const PORT = 3747;

// ── Abbreviation tables ──
const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

const NBA_ABBREV = {
    'Atlanta Hawks':'atl','Boston Celtics':'bos','Brooklyn Nets':'bkn',
    'Charlotte Hornets':'cha','Chicago Bulls':'chi','Cleveland Cavaliers':'cle',
    'Dallas Mavericks':'dal','Denver Nuggets':'den','Detroit Pistons':'det',
    'Golden State Warriors':'gsw','Houston Rockets':'hou','Indiana Pacers':'ind',
    'LA Clippers':'lac','Los Angeles Clippers':'lac','Los Angeles Lakers':'lal',
    'Memphis Grizzlies':'mem','Miami Heat':'mia','Milwaukee Bucks':'mil',
    'Minnesota Timberwolves':'min','New Orleans Pelicans':'nop',
    'New York Knicks':'nyk','Oklahoma City Thunder':'okc','Orlando Magic':'orl',
    'Philadelphia 76ers':'phi','Phoenix Suns':'phx','Portland Trail Blazers':'por',
    'Sacramento Kings':'sac','San Antonio Spurs':'sas','Toronto Raptors':'tor',
    'Utah Jazz':'uta','Washington Wizards':'was'
};
const NHL_ABBREV = {
    'Anaheim Ducks':'ana','Boston Bruins':'bos','Buffalo Sabres':'buf',
    'Calgary Flames':'cgy','Carolina Hurricanes':'car','Chicago Blackhawks':'chi',
    'Colorado Avalanche':'col','Columbus Blue Jackets':'cbj','Dallas Stars':'dal',
    'Detroit Red Wings':'det','Edmonton Oilers':'edm','Florida Panthers':'fla',
    'Los Angeles Kings':'lak','Minnesota Wild':'min','Montreal Canadiens':'mtl',
    'Nashville Predators':'nsh','New Jersey Devils':'nj','New York Islanders':'nyi',
    'New York Rangers':'nyr','Ottawa Senators':'ott','Philadelphia Flyers':'phi',
    'Pittsburgh Penguins':'pit','San Jose Sharks':'sjs','Seattle Kraken':'sea',
    'St. Louis Blues':'stl','Tampa Bay Lightning':'tbl','Toronto Maple Leafs':'tor',
    'Utah Hockey Club':'uta','Vancouver Canucks':'van','Vegas Golden Knights':'vgk',
    'Washington Capitals':'wsh','Winnipeg Jets':'wpg'
};
const MLB_ABBREV = {
    'Arizona Diamondbacks':'ari','Atlanta Braves':'atl','Baltimore Orioles':'bal',
    'Boston Red Sox':'bos','Chicago Cubs':'chc','Chicago White Sox':'cws',
    'Cincinnati Reds':'cin','Cleveland Guardians':'cle','Colorado Rockies':'col',
    'Detroit Tigers':'det','Houston Astros':'hou','Kansas City Royals':'kc',
    'Los Angeles Angels':'laa','Los Angeles Dodgers':'lad','Miami Marlins':'mia',
    'Milwaukee Brewers':'mil','Minnesota Twins':'min','New York Mets':'nym',
    'New York Yankees':'nyy','Oakland Athletics':'oak','Philadelphia Phillies':'phi',
    'Pittsburgh Pirates':'pit','San Diego Padres':'sd','San Francisco Giants':'sf',
    'Seattle Mariners':'sea','St. Louis Cardinals':'stl','Tampa Bay Rays':'tb',
    'Texas Rangers':'tex','Toronto Blue Jays':'tor','Washington Nationals':'wsh'
};
const EPL_ABBREV = {
    'Arsenal':'ars','Aston Villa':'avl','Bournemouth':'bou','Brentford':'bre',
    'Brighton':'bha','Brighton & Hove Albion':'bha','Chelsea':'cfc',
    'Crystal Palace':'cry','Everton':'eve','Fulham':'ful',
    'Ipswich Town':'ips','Ipswich':'ips','Leicester City':'lei','Leicester':'lei',
    'Liverpool':'liv','Manchester City':'mci','Manchester United':'mun',
    'Newcastle United':'new','Newcastle':'new','Nottingham Forest':'nfo',
    'Southampton':'sou','Tottenham Hotspur':'tot','Tottenham':'tot',
    'West Ham United':'whu','West Ham':'whu','Wolverhampton Wanderers':'wol',
    'Wolves':'wol','Sunderland':'sun'
};
const TENNIS_SERIES = {
    'kxatpmatch':          { label:'ATP Tour',        tab:'atp' },
    'kxwtamatch':          { label:'WTA Tour',        tab:'wta' },
    'kxatpchallengermatch':{ label:'ATP Challenger',  tab:'challenger' },
    'kxwtachallengermatch':{ label:'WTA Challenger',  tab:'wta_challenger' },
};

// ── Kalshi signed request ──
function kalshiRequest(method, reqPath) {
    return new Promise((resolve, reject) => {
        const ts = String(Date.now());
        const sigMsg = ts + method.toUpperCase() + reqPath.split('?')[0];
        let sig;
        try {
            const s = crypto.createSign('RSA-SHA256');
            s.update(sigMsg);
            sig = s.sign(cfg.privateKey, 'base64');
        } catch(e) { return reject(new Error('RSA sign failed: ' + e.message)); }

        const opts = {
            hostname: 'api.elections.kalshi.com',
            path: '/trade-api/v2' + reqPath,
            method: method.toUpperCase(),
            headers: {
                'Content-Type':            'application/json',
                'KALSHI-ACCESS-KEY':       cfg.keyId,
                'KALSHI-ACCESS-TIMESTAMP': ts,
                'KALSHI-ACCESS-SIGNATURE': sig,
            }
        };
        const req = https.request(opts, (r) => {
            let d = '';
            r.on('data', c => d += c);
            r.on('end', () => {
                try { resolve({ status: r.statusCode, body: JSON.parse(d) }); }
                catch(e) { resolve({ status: r.statusCode, body: d }); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

// ── Helpers ──
function abbrevLookup(name, table) {
    if (table[name]) return table[name];
    const low = name.toLowerCase();
    for (const [k,v] of Object.entries(table)) {
        if (k.toLowerCase() === low) return v;
    }
    const last = name.split(' ').pop().toLowerCase();
    for (const [k,v] of Object.entries(table)) {
        if (k.toLowerCase().includes(last)) return v;
    }
    return null;
}

function buildTicker(sport, away, home, startTime) {
    const d   = new Date(startTime);
    const yy  = String(d.getFullYear()).slice(2);
    const mon = MONTHS[d.getMonth()];
    const dd  = String(d.getDate()).padStart(2,'0');
    if (sport === 'nba') {
        const a = abbrevLookup(away, NBA_ABBREV), h = abbrevLookup(home, NHL_ABBREV);
        return (a && h) ? 'kxnbagame-'+yy+mon+dd+a+h : null;
    }
    if (sport === 'nhl') {
        const a = abbrevLookup(away, NHL_ABBREV), h = abbrevLookup(home, NHL_ABBREV);
        return (a && h) ? 'kxnhlgame-'+yy+mon+dd+a+h : null;
    }
    if (sport === 'mlb') {
        const a = abbrevLookup(away, MLB_ABBREV), h = abbrevLookup(home, MLB_ABBREV);
        if (!a || !h) return null;
        const hh = String(d.getHours()).padStart(2,'0');
        const mm = String(d.getMinutes()).padStart(2,'0');
        return 'kxmlbgame-'+yy+mon+dd+hh+mm+a+h;
    }
    if (sport === 'soccer') {
        const a = abbrevLookup(away, EPL_ABBREV), h = abbrevLookup(home, EPL_ABBREV);
        return (a && h) ? 'kxeplgame-'+yy+mon+dd+a+h : null;
    }
    if (sport === 'tennis') {
        const p1 = away.split(' ').pop().toLowerCase().slice(0,3);
        const p2 = home.split(' ').pop().toLowerCase().slice(0,3);
        return { atp:'kxatpmatch-'+yy+mon+dd+p1+p2, wta:'kxwtamatch-'+yy+mon+dd+p1+p2 };
    }
    return null;
}

function parseKalshiEvent(ev, info) {
    const markets = ev.markets || [];
    if (!markets.length) return null;
    const mktA = markets[0], mktB = markets[1];
    if (!mktA) return null;
    const playerA = mktA.yes_sub_title || '';
    const playerB = mktB ? (mktB.yes_sub_title || '') : '';
    if (!playerA) return null;
    const aPrice = mktA.yes_bid_dollars ? parseFloat(mktA.yes_bid_dollars) :
                   (mktA.last_price_dollars ? parseFloat(mktA.last_price_dollars) : 0);
    const bPrice = mktB ? (mktB.yes_bid_dollars ? parseFloat(mktB.yes_bid_dollars) :
                   (mktB.last_price_dollars ? parseFloat(mktB.last_price_dollars) : 0)) : 0;
    const aPct = Math.round(aPrice * 100);
    const bPct = Math.round(bPrice * 100);
    const evData = ev.event || ev;
    const tournament = (evData.product_metadata && evData.product_metadata.competition) || info.label;
    // isLive detection:
    // open_time is when Kalshi opened betting (can be days before match)
    // expected_expiration_time is when match is expected to END
    // A match is LIVE if:
    //   - market is active AND
    //   - expected end is either already past (running long) OR within 4 hours (started or starting)
    const nowMs = Date.now();
    const expMs = mktA.expected_expiration_time ? new Date(mktA.expected_expiration_time).getTime() : 0;
    const isOpen = mktA.status === 'active';
    const timeToEnd = expMs > 0 ? expMs - nowMs : Infinity;
    // matchStartTime = expMs - 2h (our approximation of when the match started)
    const approxStartMs = expMs > 0 ? expMs - (2 * 3600 * 1000) : 0;
    // isLive: market is active AND match has already started (approxStart < now) AND ending within 3h
    const isLive = isOpen && expMs > 0 && approxStartMs > 0 && approxStartMs < nowMs && timeToEnd < (3 * 3600 * 1000);
    const isSettled = mktA.status === 'finalized' || mktA.status === 'settled';
    // matchStartTime = expected_expiration - 2h (approximate match start)
    let matchStartTime = null;
    if (expMs) {
        matchStartTime = new Date(expMs - 2 * 3600 * 1000).toISOString();
    }
    return {
        eventTicker: evData.event_ticker || '',
        tickerA: mktA.ticker || '', tickerB: mktB ? mktB.ticker || '' : '',
        series: info.tab, label: info.label, tournament,
        playerA, playerB, aPct, bPct,
        matchTime: matchStartTime,
        isLive, isSettled,
        result: mktA.result || null,
        status: mktA.status,
        title: evData.title || evData.sub_title || '',
    };
}
async function fetchTennisMatches() {
    const grouped = {};
    const d = new Date();
    const yy  = String(d.getFullYear()).slice(2);
    const mon = MONTHS[d.getMonth()];
    // Also check yesterday and tomorrow for matches near midnight
    const yesterday = new Date(d); yesterday.setDate(d.getDate()-1);
    const yy2 = String(yesterday.getFullYear()).slice(2);
    const mon2 = MONTHS[yesterday.getMonth()];
    const dd2 = String(yesterday.getDate()).padStart(2,'0');
    const tomorrow  = new Date(d); tomorrow.setDate(d.getDate()+1);
    const yy3 = String(tomorrow.getFullYear()).slice(2);
    const mon3 = MONTHS[tomorrow.getMonth()];
    const dd3 = String(tomorrow.getDate()).padStart(2,'0');
    const prefixes = [
        { prefix: 'KXATPMATCH-'+yy+mon,           series: 'kxatpmatch',           info: TENNIS_SERIES['kxatpmatch'] },
        { prefix: 'KXWTAMATCH-'+yy+mon,           series: 'kxwtamatch',           info: TENNIS_SERIES['kxwtamatch'] },
        { prefix: 'KXATPCHALLENGERMATCH-'+yy+mon, series: 'kxatpchallengermatch', info: TENNIS_SERIES['kxatpchallengermatch'] },
        { prefix: 'KXWTACHALLENGERMATCH-'+yy+mon, series: 'kxwtachallengermatch', info: TENNIS_SERIES['kxwtachallengermatch'] },
        // Yesterday's matches that may still be active
        { prefix: 'KXATPMATCH-'+yy2+mon2+dd2,           series: 'kxatpmatch',           info: TENNIS_SERIES['kxatpmatch'] },
        { prefix: 'KXWTAMATCH-'+yy2+mon2+dd2,           series: 'kxwtamatch',           info: TENNIS_SERIES['kxwtamatch'] },
        { prefix: 'KXATPCHALLENGERMATCH-'+yy2+mon2+dd2, series: 'kxatpchallengermatch', info: TENNIS_SERIES['kxatpchallengermatch'] },
        { prefix: 'KXWTACHALLENGERMATCH-'+yy2+mon2+dd2, series: 'kxwtachallengermatch', info: TENNIS_SERIES['kxwtachallengermatch'] },
        // Tomorrow — Kalshi opens betting on upcoming matches 24-48h ahead
        { prefix: 'KXATPMATCH-'+yy3+mon3+dd3,           series: 'kxatpmatch',           info: TENNIS_SERIES['kxatpmatch'] },
        { prefix: 'KXWTAMATCH-'+yy3+mon3+dd3,           series: 'kxwtamatch',           info: TENNIS_SERIES['kxwtamatch'] },
        { prefix: 'KXATPCHALLENGERMATCH-'+yy3+mon3+dd3, series: 'kxatpchallengermatch', info: TENNIS_SERIES['kxatpchallengermatch'] },
        { prefix: 'KXWTACHALLENGERMATCH-'+yy3+mon3+dd3, series: 'kxwtachallengermatch', info: TENNIS_SERIES['kxwtachallengermatch'] },
    ];
    const seenEvents = new Set(); // deduplicates across all prefix passes
    for (const { prefix, series, info } of prefixes) {
        if (!info) continue;
        try {
            // Strategy 1: Direct market lookup — individual match markets start with the series prefix
            const r = await kalshiRequest('GET', '/markets?ticker_prefix='+prefix+'&limit=200');
            if (r.status === 200 && r.body.markets) {
                for (const mkt of r.body.markets) {
                    // Individual match markets: ticker = KXATPMATCH-26MAR25LANLEH-LAN
                    // event_ticker = KXATPMATCH-26MAR25LANLEH
                    const et = (mkt.event_ticker || '').toUpperCase();
                    if (et && et.startsWith(prefix.toUpperCase()) && !seenEvents.has(et)) {
                        seenEvents.add(et);
                        try {
                            const er = await kalshiRequest('GET', '/events/'+et);
                            if (er.status === 200 && er.body.event) {
                                const match = parseKalshiEvent(er.body, info);
                                if (match) {
                                    if (!grouped[info.tab]) grouped[info.tab] = { label:info.label, matches:[] };
                                    grouped[info.tab].matches.push(match);
                                }
                            }
                            await new Promise(function(r){ setTimeout(r, 80); });
                        } catch(e) {}
                    }
                    // Strategy 2: Also scan mve_selected_legs for tennis event tickers
                    for (const leg of (mkt.mve_selected_legs || [])) {
                        const let2 = (leg.event_ticker || '').toUpperCase();
                        if (let2.startsWith(prefix.toUpperCase()) && !seenEvents.has(let2)) {
                            seenEvents.add(let2);
                            try {
                                const er2 = await kalshiRequest('GET', '/events/'+let2);
                                if (er2.status === 200 && er2.body.event) {
                                    const match2 = parseKalshiEvent(er2.body, info);
                                    if (match2) {
                                        if (!grouped[info.tab]) grouped[info.tab] = { label:info.label, matches:[] };
                                        grouped[info.tab].matches.push(match2);
                                    }
                                }
                                await new Promise(function(r){ setTimeout(r, 80); });
                            } catch(e) {}
                        }
                    }
                }
            }
            await new Promise(function(r){ setTimeout(r, 150); });
        } catch(e) {
            console.warn('Tennis fetch ['+series+']:', e.message);
        }
    }
    // Sort each group: live first, then by matchTime
    Object.values(grouped).forEach(function(g) {
        g.matches.sort(function(a, b) {
            if (a.isLive && !b.isLive) return -1;
            if (!a.isLive && b.isLive) return 1;
            if (a.matchTime && b.matchTime) return new Date(a.matchTime) - new Date(b.matchTime);
            return 0;
        });
    });
    return grouped;
}

// ── HTTP Server — single unified handler ──
function getLocalIP() {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) return net.address;
        }
    }
    return 'x.x.x.x';
}

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    const url   = new URL(req.url, 'http://localhost:'+PORT);
    const route = url.pathname;

    // ── /health ──
    if (route === '/health') {
        res.writeHead(200);
        res.end(JSON.stringify({ status:'ok', port:PORT, time:new Date().toISOString() }));
        return;
    }

    // ── /debug — raw Kalshi response for any API path ──
    if (route === '/debug') {
        const apiPath = url.searchParams.get('path') || '/markets?limit=3';
        try {
            const r = await kalshiRequest('GET', apiPath);
            res.writeHead(200);
            res.end(JSON.stringify({ kalshiStatus:r.status, path:apiPath, body:r.body }, null, 2));
        } catch(e) {
            res.writeHead(500);
            res.end(JSON.stringify({ error:e.message, path:apiPath }));
        }
        return;
    }

    // ── /ticker ──
    if (route === '/ticker') {
        const sport = url.searchParams.get('sport')||'';
        const away  = url.searchParams.get('away') ||'';
        const home  = url.searchParams.get('home') ||'';
        const time  = url.searchParams.get('time') ||new Date().toISOString();
        const t = buildTicker(sport, away, home, time);
        if (!t) { res.writeHead(404); res.end(JSON.stringify({error:'Cannot build ticker',sport,away,home})); return; }
        res.writeHead(200);
        res.end(JSON.stringify({ ticker:t }));
        return;
    }

    // ── /market ── fetch by event ticker (returns both team prices)
    if (route === '/market') {
        const ticker = url.searchParams.get('ticker')||'';
        if (!ticker) { res.writeHead(400); res.end(JSON.stringify({error:'ticker required'})); return; }
        try {
            const r = await kalshiRequest('GET', '/events/'+ticker.toUpperCase());
            if (r.status === 200 && r.body.event) {
                const evInfo = r.body.event;
                const mkts   = r.body.markets || [];
                const mktA = mkts[0], mktB = mkts[1];
                const aPrice = mktA && mktA.yes_bid_dollars ? parseFloat(mktA.yes_bid_dollars) : 0;
                const bPrice = mktB && mktB.yes_bid_dollars ? parseFloat(mktB.yes_bid_dollars) : 0;
                res.writeHead(200);
                res.end(JSON.stringify({
                    eventTicker: evInfo.event_ticker, title: evInfo.title,
                    tournament: evInfo.product_metadata && evInfo.product_metadata.competition,
                    status:    mktA ? mktA.status : 'unknown',
                    isLive:    mktA && mktA.status === 'active',
                    isSettled: mktA && (mktA.status==='finalized'||mktA.status==='settled'),
                    result:    mktA ? mktA.result||null : null,
                    teamA: mktA ? mktA.yes_sub_title : '', teamAPct: Math.round(aPrice*100),
                    teamB: mktB ? mktB.yes_sub_title : '', teamBPct: Math.round(bPrice*100),
                    tickerA: mktA ? mktA.ticker:'', tickerB: mktB ? mktB.ticker:'',
                }));
                return;
            }
            res.writeHead(r.status);
            res.end(JSON.stringify({error:'Not found', ticker, kalshiStatus:r.status}));
        } catch(e) {
            res.writeHead(500); res.end(JSON.stringify({error:e.message}));
        }
        return;
    }

    // ── /tennis-matches ──
    if (route === '/tennis-matches') {
        try {
            const data = await fetchTennisMatches();
            res.writeHead(200);
            res.end(JSON.stringify({ matches:data, fetchedAt:new Date().toISOString() }));
        } catch(e) {
            res.writeHead(500);
            res.end(JSON.stringify({ error:e.message }));
        }
        return;
    }

    // ── /tennis-live ──
    if (route === '/tennis-live') {
        const tickerStr = url.searchParams.get('tickers')||'';
        const tickers = tickerStr.split(',').filter(Boolean);
        if (!tickers.length) { res.writeHead(400); res.end(JSON.stringify({error:'tickers required'})); return; }
        const results = {};
        for (const t of tickers) {
            try {
                const r = await kalshiRequest('GET', '/markets/'+t);
                if (r.status === 200 && r.body.market) {
                    const mkt = r.body.market;
                    const bid = mkt.yes_bid_dollars ? parseFloat(mkt.yes_bid_dollars) : null;
                    const raw = bid || (mkt.last_price_dollars ? parseFloat(mkt.last_price_dollars) : 50);
                    results[t] = {
                        status: mkt.status, result: mkt.result||null,
                        isLive: mkt.status==='active',
                        isSettled: mkt.status==='finalized'||mkt.status==='settled',
                        yesPct: raw > 1 ? Math.round(raw) : Math.round(raw*100),
                        liveScore: mkt.subtitle||mkt.custom_strike||null,
                    };
                } else { results[t] = null; }
            } catch(e) { results[t] = null; }
            await new Promise(r => setTimeout(r, 150));
        }
        res.writeHead(200);
        res.end(JSON.stringify({ scores:results, fetchedAt:new Date().toISOString() }));
        return;
    }

    // ── /resolve ──
    if (route === '/resolve' && req.method === 'POST') {
        let body = '';
        req.on('data', c => body += c);
        req.on('end', async () => {
            try {
                const { tickers } = JSON.parse(body);
                const results = {};
                for (const t of (tickers||[])) {
                    try {
                        const r = await kalshiRequest('GET', '/markets/'+t);
                        if (r.status === 200 && r.body.market) {
                            const mkt = r.body.market;
                            results[t] = {
                                settled: mkt.status==='finalized'||mkt.status==='settled',
                                result:  mkt.result||null, status: mkt.status
                            };
                        } else { results[t] = null; }
                    } catch(e) { results[t] = null; }
                    await new Promise(r => setTimeout(r, 200));
                }
                res.writeHead(200);
                res.end(JSON.stringify({ results }));
            } catch(e) { res.writeHead(400); res.end(JSON.stringify({error:e.message})); }
        });
        return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error:'Unknown route: '+route }));
});

server.listen(PORT, '0.0.0.0', () => {
    const ip = getLocalIP();
    console.log('\n  Chronos-WP Kalshi Proxy v2');
    console.log('  Laptop : http://localhost:'+PORT);
    console.log('  iPhone : http://'+ip+':'+PORT);
    console.log('\n  Routes: /health /debug /ticker /market /tennis-matches /tennis-live /resolve');
    console.log('  Press Ctrl+C to stop.\n');
});
server.on('error', e => {
    if (e.code==='EADDRINUSE') console.error('Port '+PORT+' already in use.');
    else console.error('Server error:', e.message);
    process.exit(1);
});
