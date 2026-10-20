// QUARANTINE Z — /api/turn (v6.89): short-lived logins for Cloudflare's relay (TURN) servers.
// Two players whose browsers cannot reach each other directly (a Wi-Fi that keeps its devices apart, a firewall, two strict NATs) meet
// on a relay instead. PeerJS's free relay ended in December 2023, so the site hands out its own: the TURN key and its API token stay here,
// on the server, and a page gets logins that run out after TTL.
// Setup (once): Cloudflare dashboard → Realtime → TURN Server → create a key; then in the Vercel project, Settings → Environment Variables,
// add TURN_KEY_ID (the key's ID) and TURN_KEY_API_TOKEN (its API token) and redeploy. Without them the answer is {ok:false, why:'unset'}
// and the game connects as before, directly only.
// seconds a login lasts; the game asks again before then
const TTL = 6 * 3600;
const CF = 'https://rtc.live.cloudflare.com/v1/turn/keys/';
const HDR = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' };
const out = (o, status) => new Response(JSON.stringify(o), { status: status || 200, headers: HDR });

// a few asks per address are plenty (a player asks once per multiplayer visit, a host again every few hours); per instance, so rough
const HITS = new Map();
function tooMany(ip, now) {
  if (!ip) return false;
  let h = HITS.get(ip);
  if (!h || now - h.t > 600e3) { h = { t: now, n: 0 }; HITS.set(ip, h); }
  if (HITS.size > 5000) for (const [k, v] of HITS) if (now - v.t > 600e3 || HITS.size > 5000) HITS.delete(k);
  return ++h.n > 60;
}

// only what a browser's RTCPeerConnection takes: stun / turn / turns addresses (port 53, which browsers refuse, left out), and the
// login with the turn ones
export function clean(list) {
  const a = Array.isArray(list) ? list : list && typeof list === 'object' ? [list] : [];
  const res = [];
  for (const s of a.slice(0, 6)) {
    if (!s || typeof s !== 'object') continue;
    const urls = (Array.isArray(s.urls) ? s.urls : [s.urls]).filter(u => typeof u === 'string' && u.length < 200 &&
      /^(stun|turns?):[a-z0-9.\-]+(:\d{1,5})?(\?transport=(udp|tcp))?$/i.test(u) && !/:53(\?|$)/.test(u)).slice(0, 8);
    if (!urls.length) continue;
    const turn = urls.some(u => /^turns?:/i.test(u));
    if (turn && !(typeof s.username === 'string' && typeof s.credential === 'string' && s.username && s.credential &&
      s.username.length < 600 && s.credential.length < 600)) continue;
    res.push(turn ? { urls, username: s.username, credential: s.credential } : { urls });
  }
  return res;
}

export default {
  async fetch(request) {
    if (request.method !== 'GET') return out({ ok: false, why: 'method' }, 405);
    // (another site's page may not take the logins: a browser says where a request comes from; 'none' is the address typed in)
    const site = request.headers.get('sec-fetch-site');
    if (site && site !== 'same-origin' && site !== 'none') return out({ ok: false, why: 'site' }, 403);
    const ip = (request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || '').split(',')[0].trim();
    if (tooMany(ip, Date.now())) return out({ ok: false, why: 'busy' }, 429);
    const id = String(process.env.TURN_KEY_ID || '').trim(), tok = String(process.env.TURN_KEY_API_TOKEN || '').trim();
    if (!id || !tok) return out({ ok: false, why: 'unset' });
    try {
      const r = await fetch(CF + encodeURIComponent(id) + '/credentials/generate-ice-servers', {
        method: 'POST', headers: { authorization: 'Bearer ' + tok, 'content-type': 'application/json' },
        body: JSON.stringify({ ttl: TTL }), signal: AbortSignal.timeout(5000)
      });
      if (!r.ok) { console.warn('turn: cloudflare answered', r.status); return out({ ok: false, why: 'cf' + r.status }, 502); }
      const j = await r.json().catch(() => null);
      const ice = clean(j && j.iceServers);
      if (!ice.some(s => s.username)) return out({ ok: false, why: 'empty' }, 502);
      return out({ ok: true, ttl: TTL, iceServers: ice });
    } catch (e) {
      console.warn('turn:', e && e.name);
      return out({ ok: false, why: 'net' }, 502);
    }
  }
};
