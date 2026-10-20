'use strict';
// ============ The gun shop (coins), the sign-in window and what they change in the game ============
// Coins come from finished matches (worked out by the database, see supabase/schema.sql) and buy guns for good. In a match,
// weapons cost nothing, but only the guns you own can be picked; the free set is everyone's. Picking a gun up off the floor, supply crates and the
// 근하신년 free pick still hand out any gun; the 근하신년 guns themselves come from the decoder bingo (or the fragment exchange). With accounts off (no Supabase settings in account.js) every gun stays open.
// Prices: the database table gun_prices is the truth; this copy (same numbers as schema.sql) is shown until it has loaded.
const SHOP_FREE=['knife','p9','sg8','k5','g35'];
const SHOP_PRICE={thanatos9:15000,glock:1000,vector:3500,an94:5000,m82:8500,f7:1200,d50:1500,tw9:1800,r6:2000,db2:1500,m14:3500,as12:4500,k9:1200,um45:1800,pd50:3000,br3:2500,kv47:3500,ar7:4000,ar5c:4500,hr17:5500,sr8:2500,r700:6500,dm14:7000,mg6:6000,hmg:6500,gx6:10000,airb:4500,gl40:5500,axe:1500,hammer:4000,killknife:12000,blaze8:6000,winchester:4500,balrog5:6500,balrog11:7000,plasma:7500,thunder:9500,katana:9000,jhammer:7500,dde:8500,janus1:8500,cbmav:9000};
const SHOP_NOTSOLD=['bhole','skull9','salamander','ak60r','dmp7','bholemini','crimson','janus2','m4dk','sentinel','q7vac','bhound','dglock','spas12d','m32c','m4dk2'];// never in the shop: the season / sidearm decoders' guns (a line on their cards), the transcendence exchange's (v6.41), else crate-only
const SHOP_GACHA={S:['rdc','mdrill','mlaunch','volc','bdc','gaebolg'],A:['xdz','ripper','xbowa','xbow','sterling','duckfoot']};
// the decoder's numbers until gacha_config has loaded (same defaults as schema.sql)
const GACHA_DEF={dec_cost1:600,dec_cost10:5400,bingo_hi:49,dec_frag_min:1,dec_frag_max:3,shuffle_free:3,full_s_coins:3000,full_a_frags:30,ex_s:200,ex_a:80,daily_free:true,
  season_cost1:1000,season_cost10:9000,season_hi:99,season_frag_min:1,season_frag_max:3,season_owned_coins:10000,
  season_lines:['gun:bhole','gun:skull9','gun:salamander','coins:1000','coins:2000','coins:2000','coins:5000','frags:30','frags:30','tickets:3','tickets:3','tickets:3'],
  side_cost1:500,side_cost10:4500,side_hi:80,side_frag_min:1,side_frag_max:2,side_owned_coins:5000,
  side_lines:['gun:bholemini','gun:crimson','gun:janus2','coins:500','coins:1000','coins:2000','coins:3000','frags:20','frags:20','frags:30','tickets:1','tickets:1'],// v6.55: JANUS-2 took a coins:1000 line
  ref_new_coins:2000,ref_new_tickets:2,ref_coins:3000,ref_tickets:2,ref_matches:3,ref_cap:10,ref_days:7,// invite links (v6.37, invite.js)
  trans_frag_min:2,trans_frag_max:4,trans_cost:888,trans_guns:['m4dk']};// transcendence (v6.41): fragments from every decoder, 888 for a transcendence gun
// the 12 lines of the 5×5 card: rows 0-4, columns 5-9, the diagonal from the top left 10, from the top right 11
const BINGO_LINES=[[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],[0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],[0,6,12,18,24],[4,8,12,16,20]];
// a season (or sidearm) card's line items: 'gun:<id>' (owned already: season_owned_coins / side_owned_coins coins), 'coins:<n>', 'frags:<n>', 'tickets:<n>' (n 근하신년 decoders)
const sItem=c=>{const [k,v]=String(c||'').split(':');return k==='gun'?{k,gun:v,n:0}:{k:k==='frags'||k==='tickets'?k:'coins',n:+v||0}};
const sAmt=n=>LI()?(n>=1000&&n%1000===0?n/1000+'K':fmtC(n)):(n>=10000&&n%10000===0?n/10000+'만':fmtC(n));// short amounts for the small tiles
const sRank=c=>{const it=sItem(c);return ({gun:0,coins:1,frags:2,tickets:3})[it.k]*1e7-it.n};// the rules list: guns, then coins (biggest first), fragments, decoders
function seasonGun(id){return (ACC.gc().season_lines||[]).includes('gun:'+id)}
function sideGun(id){return (ACC.gc().side_lines||[]).includes('gun:'+id)}// the sidearm card's (v6.36: Event Horizon Mini, Crimson Peacemaker; v6.55: JANUS-2)
function transGun(id){return (ACC.gc().trans_guns||[]).includes(id)}// the transcendence exchange's (v6.41: the M4A1 Dark Knight)
// a card's guns (season: Event Horizon, Skull-9 …; side: the sidearm card's), in the order of its list; names: 'A · B' in the language shown
function cardGuns(k){const o=[];for(const c of ACC.gc()[k==='side'?'side_lines':'season_lines']||[]){const it=sItem(c);if(it.k==='gun'&&WPN[it.gun]&&!o.includes(it.gun))o.push(it.gun)}return o}
const seasonGuns=()=>cardGuns('season');
const seasonNames=(L,ids)=>(ids||seasonGuns()).map(id=>WPN[id]?WPN[id].n[L]:id).join(' · ');
// a locked gun's right-hand column in the buy menu: where it comes from (the 근하신년 card, the season card, the sidearm card, else its price)
function shopLockTag(id){const L=LI(),p=ACC.price(id);
  return SVG_LOCK+(p&&p.tier?`<small class="gb">${L?'decoder':'해독기'}</small>`:p&&!p.sold&&transGun(id)?`<small class="gb gt">${L?'transcend':'초월'}</small>`:p&&!p.sold&&seasonGun(id)?`<small class="gb gs">${L?'season':'시즌'}</small>`
    :p&&!p.sold&&sideGun(id)?`<small class="gb gd">${L?'sidearm':'보조 해독기'}</small>`
    :WPN[id]&&WPN[id].crate?`<small class="gb">${L?'crates':'보급 전용'}</small>`:`<small>${COIN}${fmtC(p&&p.price)}</small>`)}
// averages for a card of 25 numbers out of N (a fixed seed, so the same every time): first line, 6th line, one given line, the later of
// two different lines (a card with two guns), the whole card
const SIMC={},BINGO_PAIRS=[];for(let i=0;i<12;i++)for(let j=i+1;j<12;j++)BINGO_PAIRS.push([i,j]);// (every pair of lines in turn: the random stream stays as it was)
function bingoSim(N){if(SIMC[N])return SIMC[N];let s=7,a=0,b=0,c=0;const T=2000,t=Array(25),pool=[...Array(N).keys()],rnd=()=>((s=Math.imul(s,1103515245)+12345|0)>>>0)/4294967296;
  for(let k=0;k<T;k++){for(let i=0;i<25;i++){const j=i+Math.floor(rnd()*(N-i));const x=pool[i];pool[i]=pool[j];pool[j]=x;t[i]=pool[i]+1}
    const l0=BINGO_LINES.map(ln=>Math.max(t[ln[0]],t[ln[1]],t[ln[2]],t[ln[3]],t[ln[4]])),q=BINGO_PAIRS[k%66];c+=Math.max(l0[q[0]],l0[q[1]]);
    const lt=l0.sort((x,y)=>x-y);a+=lt[0];b+=lt[5]}
  return SIMC[N]={first:Math.round(a/T),six:Math.round(b/T),two:Math.round(c/T),line:Math.round(5*(N+1)/6),full:Math.round(25*(N+1)/26)}}
const pad2=n=>n==null?'--':String(n).padStart(2,'0');
const COIN='<i class="ci"></i>';
const fmtC=n=>Math.round(n||0).toLocaleString('en-US');
const KIND_N={pistol:['권총','Pistol'],smg:['기관단총','SMG'],shotgun:['산탄총','Shotgun'],rifle:['소총','Rifle'],sniper:['저격총','Sniper'],mg:['기관총','Machine gun'],
  special:['특수','Special'],melee:['근접','Melee'],saw:['전기톱','Chainsaw']};
const SVG_LOCK='<svg class="lki" viewBox="0 0 16 16"><path fill="currentColor" d="M5 7V5a3 3 0 016 0v2h1v8H4V7zm1.6 0h2.8V5a1.4 1.4 0 00-2.8 0z"/></svg>';
const SVG_CART='<svg viewBox="0 0 16 16"><path fill="currentColor" d="M1 2h2.4l.5 2H15l-1.6 6H5.2l.4 1.6H13V13H4.4L2.2 3.6H1zm4 12.5a1 1 0 112 0 1 1 0 01-2 0zm6 0a1 1 0 112 0 1 1 0 01-2 0z"/></svg>';
const SVG_USER='<svg viewBox="0 0 16 16"><path fill="currentColor" d="M8 1.5a3.2 3.2 0 110 6.4 3.2 3.2 0 010-6.4zM2 14.5c.4-3.2 3-5 6-5s5.6 1.8 6 5z"/></svg>';

// ---------- what the shop sells, in the buy menu's order ----------
function shopCats(){const L=LI();const cats=BUY_MENU.filter(c=>c.k!=='equip').map(c=>({k:c.k,n:c.n[L],items:c.items.filter(id=>WPN[id]&&WPN[id].model)}));
  const sp=cats.find(c=>c.k==='special');if(sp)sp.items=['knife',...sp.items.filter(i=>i!=='knife'&&i!=='bhole'),'bhole'].filter(id=>WPN[id]);
  const seen=new Set(),all=[];for(const c of cats)for(const id of c.items)if(!seen.has(id)){seen.add(id);all.push(id)}
  return [{k:'all',n:L?'All':'전체',items:all},...cats]}
// free / own / buy / crate / gacha (근하신년: decoder bingo or exchange only) / season (a line on the season decoder card: Event Horizon, Skull-9)
// / side (a line on the sidearm decoder card: Event Horizon Mini, Crimson Peacemaker)
// / trans (v6.41: the transcendence exchange only)
function shopState(id){const p=ACC.price(id);if(!p||p.free)return 'free';if(ACC.me&&ACC.me.owned&&ACC.me.owned.has(id))return 'own';if(p.tier)return 'gacha';if(!p.sold)return transGun(id)?'trans':seasonGun(id)?'season':sideGun(id)?'side':'crate';return 'buy'}
// free ones first, then by price; the 근하신년 guns after them (S first), then the season decoder's, the sidearm decoder's, crate-only last
function shopOrder(ids){const grp=id=>{const s=shopState(id),t=ACC.tier(id);return s==='free'?0:t?(t==='S'?2:3):s==='trans'?1.5:s==='season'?4:s==='side'?4.5:s==='crate'?5:1};
  return ids.slice().sort((a,b)=>grp(a)-grp(b)||((ACC.price(a)||{}).price||0)-((ACC.price(b)||{}).price||0))}
const FRAG='<i class="fi"></i>';
const TFRAG='<i class="tfi"></i>';// a transcendence fragment (v6.41)
// the 근하신년 decoder drawn in SVG: a handheld code breaker — gunmetal case, red and gold band, aerial, green read-out, keypad
function decoderSvg(cls){return `<svg class="${cls||''}" viewBox="0 0 120 150" aria-hidden="true"><defs>
  <linearGradient id="dcB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a616c"/><stop offset=".45" stop-color="#2e333a"/><stop offset="1" stop-color="#16181c"/></linearGradient>
  <linearGradient id="dcG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0a8"/><stop offset=".5" stop-color="#f2c230"/><stop offset="1" stop-color="#a87408"/></linearGradient>
  <linearGradient id="dcS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c3a12"/><stop offset="1" stop-color="#06200a"/></linearGradient></defs>
  <path d="M84 34 L94 8" stroke="#7a808a" stroke-width="3.5" stroke-linecap="round"/><circle cx="94.5" cy="7" r="4.5" fill="#e8402e" stroke="#5a0804"/>
  <rect x="20" y="30" width="80" height="112" rx="11" fill="url(#dcB)" stroke="#0a0b0d" stroke-width="2"/>
  <rect x="20" y="30" width="80" height="13" rx="6" fill="#b4221a"/><rect x="20" y="40" width="80" height="3" fill="url(#dcG)"/>
  <circle cx="30" cy="36.5" r="2.6" fill="#ffd24a"/><circle cx="38" cy="36.5" r="2.6" fill="#7dff6a"/>
  <rect x="29" y="50" width="62" height="34" rx="4" fill="url(#dcS)" stroke="#8a9078" stroke-width="1.5"/>
  <path d="M33 58 h20 M33 64 h30 M33 70 h14" stroke="#3aa83a" stroke-width="2" opacity=".55"/>
  <text x="84" y="77" text-anchor="end" font-size="17" font-weight="bold" fill="#8dff7a" font-family="Galmuri11,monospace">??</text>
  ${[0,1,2].map(r=>[0,1,2].map(c=>`<rect x="${33+c*19}" y="${92+r*14}" width="15" height="10" rx="2.5" fill="${r===2&&c===2?'#b4221a':'#4a505a'}" stroke="#121417"/>`).join('')).join('')}
  <text x="60" y="137" text-anchor="middle" font-size="8.5" font-weight="bold" fill="url(#dcG)" letter-spacing="1" font-family="Galmuri11,sans-serif">근하신년</text>
</svg>`}
// the season decoder: the same handheld in deep violet, its read-out a round window onto a black hole — a dark core, a gold photon
// ring, a tilted accretion disc and spiral arms that turn (.swl; faster while numbers roll)
function seasonSvg(cls){const arm=a=>`<path d="M60 49.5 C73 50.5 79 62 69 70.5" transform="rotate(${a} 60 72)"/>`;
  return `<svg class="${cls||''}" viewBox="0 0 120 150" aria-hidden="true"><defs>
  <linearGradient id="szB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4c3c70"/><stop offset=".45" stop-color="#231a3c"/><stop offset="1" stop-color="#0c0816"/></linearGradient>
  <linearGradient id="szG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffd890"/><stop offset=".5" stop-color="#ff6ad8"/><stop offset="1" stop-color="#9a6aff"/></linearGradient>
  <radialGradient id="szH"><stop offset=".25" stop-color="#000"/><stop offset=".6" stop-color="#2a0c4c"/><stop offset=".86" stop-color="#5a2ab0"/><stop offset="1" stop-color="#140a26"/></radialGradient></defs>
  <path d="M84 34 L94 8" stroke="#6a5a8e" stroke-width="3.5" stroke-linecap="round"/><circle cx="94.5" cy="7" r="5" fill="#c49aff" stroke="#3a1a6a"/><circle cx="93" cy="5.5" r="1.6" fill="#fff" opacity=".8"/>
  <rect x="20" y="30" width="80" height="112" rx="11" fill="url(#szB)" stroke="#05030a" stroke-width="2"/>
  <rect x="20" y="30" width="80" height="13" rx="6" fill="#3c1c70"/><rect x="20" y="40" width="80" height="3" fill="url(#szG)"/>
  <circle cx="30" cy="36.5" r="2.6" fill="#ff6ad8"/><circle cx="38" cy="36.5" r="2.6" fill="#8ae0ff"/>
  <circle cx="60" cy="72" r="24" fill="url(#szH)" stroke="#8a6ac0" stroke-width="1.6"/>
  <g class="swl" fill="none" stroke="#e08aff" stroke-width="2.2" stroke-linecap="round" opacity=".75">${arm(0)}${arm(120)}${arm(240)}</g>
  <ellipse cx="60" cy="72" rx="21" ry="5.5" fill="none" stroke="url(#szG)" stroke-width="2.6" transform="rotate(-16 60 72)"/>
  <circle cx="60" cy="72" r="8.2" fill="#000" stroke="#ffd890" stroke-width="1.3"/>
  <path d="M51.5 70.5 A8.6 8.6 0 0 1 68.5 70.5" fill="none" stroke="#ffb8f0" stroke-width="1" opacity=".8" transform="rotate(-16 60 72)"/>
  ${[0,1,2].map(c=>`<rect x="${33+c*19}" y="104" width="15" height="10" rx="2.5" fill="${c===1?'#7a3ad0':'#3a3050'}" stroke="#0c0816"/>`).join('')}
  ${[0,1,2].map(c=>`<rect x="${33+c*19}" y="118" width="15" height="7" rx="2.5" fill="#2c2440" stroke="#0c0816"/>`).join('')}
  <text x="60" y="137" text-anchor="middle" font-size="8.5" font-weight="bold" fill="url(#szG)" letter-spacing="1.5" font-family="Galmuri11,sans-serif">SEASON</text>
</svg>`}
// the sidearm decoder (v6.36): the same handheld in gunmetal black and crimson, its read-out a round window onto a revolver cylinder —
// six chambers round the pin, flutes between them — that turns a chamber at a time (.cyl; it spins while the numbers roll)
function sideSvg(cls){const at=(a,r)=>{const t=a*Math.PI/180;return [(60+r*Math.sin(t)).toFixed(1),(72-r*Math.cos(t)).toFixed(1)]};
  const ch=a=>{const [x,y]=at(a,12.4);return `<circle cx="${x}" cy="${y}" r="4.7" fill="url(#sdC)" stroke="#0a0506" stroke-width="1"/><circle cx="${x}" cy="${y}" r="1.9" fill="#d8a83a" stroke="#6a4a10" stroke-width=".5"/>`};
  const fl=a=>{const [x1,y1]=at(a+30,15.2),[x2,y2]=at(a+30,18.4);return `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="#141518" stroke-width="2.8" stroke-linecap="round"/>`};
  const A=[0,60,120,180,240,300];
  return `<svg class="${cls||''}" viewBox="0 0 120 150" aria-hidden="true"><defs>
  <linearGradient id="sdB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4c4446"/><stop offset=".45" stop-color="#231c1e"/><stop offset="1" stop-color="#0c0809"/></linearGradient>
  <linearGradient id="sdG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffe2a0"/><stop offset=".5" stop-color="#ff5a4a"/><stop offset="1" stop-color="#ffd890"/></linearGradient>
  <radialGradient id="sdH"><stop offset=".55" stop-color="#2a080b"/><stop offset=".9" stop-color="#4a0e13"/><stop offset="1" stop-color="#140405"/></radialGradient>
  <radialGradient id="sdC" cx=".38" cy=".36"><stop offset="0" stop-color="#2c2c31"/><stop offset="1" stop-color="#040405"/></radialGradient>
  <linearGradient id="sdY" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9a9ea6"/><stop offset=".5" stop-color="#44464c"/><stop offset="1" stop-color="#18191c"/></linearGradient></defs>
  <path d="M84 34 L94 8" stroke="#6e6264" stroke-width="3.5" stroke-linecap="round"/><circle cx="94.5" cy="7" r="5" fill="#ff3a32" stroke="#4a0806"/><circle cx="93" cy="5.5" r="1.6" fill="#fff" opacity=".75"/>
  <rect x="20" y="30" width="80" height="112" rx="11" fill="url(#sdB)" stroke="#050304" stroke-width="2"/>
  <rect x="20" y="30" width="80" height="13" rx="6" fill="#9a141c"/><rect x="20" y="40" width="80" height="3" fill="url(#sdG)"/>
  <circle cx="30" cy="36.5" r="2.6" fill="#ffd24a"/><circle cx="38" cy="36.5" r="2.6" fill="#ff5a4a"/>
  <circle cx="60" cy="72" r="24" fill="url(#sdH)" stroke="#c8343c" stroke-width="1.6"/>
  <g class="cyl"><circle cx="60" cy="72" r="19.6" fill="url(#sdY)" stroke="#08080a" stroke-width="1.3"/>${A.map(fl).join('')}${A.map(ch).join('')}
    <circle cx="60" cy="72" r="3.4" fill="#7a7e86" stroke="#0a0a0c" stroke-width="1"/><circle cx="59.2" cy="71.2" r="1.1" fill="#d8dce2"/></g>
  <path d="M60 50.5 l-3.2 -5.2 h6.4 z" fill="#ffd24a" stroke="#6a4a10" stroke-width=".6"/>
  ${[0,1,2].map(c=>`<rect x="${33+c*19}" y="104" width="15" height="10" rx="2.5" fill="${c===1?'#c8242c':'#3c2a2c'}" stroke="#0c0606"/>`).join('')}
  ${[0,1,2].map(c=>`<rect x="${33+c*19}" y="118" width="15" height="7" rx="2.5" fill="#2c2022" stroke="#0c0606"/>`).join('')}
  <text x="60" y="137" text-anchor="middle" font-size="8.5" font-weight="bold" fill="url(#sdG)" letter-spacing="1.2" font-family="Galmuri11,sans-serif">SIDEARM</text>
</svg>`}
// a pile of coins (the season card's coin lines)
const SVG_COINS=(()=>{const st=(x,n)=>{let s='';for(let i=0;i<n;i++){const y=23-i*3.4;s+=`<path d="M${x-6} ${y}v2.4a6 2.3 0 0 0 12 0V${y}" fill="#b8820e" stroke="#6a4604" stroke-width=".5"/><ellipse cx="${x}" cy="${y}" rx="6" ry="2.3" fill="#f6cf3a" stroke="#8a5c04" stroke-width=".5"/>`}return s};
  return `<svg class="cpile" viewBox="0 0 34 28" aria-hidden="true">${st(8,3)}${st(26,2)}${st(17,5)}<ellipse cx="17" cy="9.4" rx="3.2" ry="1.1" fill="#fff6c0" opacity=".85"/></svg>`})();

// ---------- the shop window: the gun shop, the 근하신년, season and sidearm decoder bingos, the fragment exchange ----------
// gift (v6.18): {code, nick} while buying for a friend (the buy buttons send the gun to them); gpick: the gun whose friend list is open
const SHOP={page:'shop',cat:'all',sel:null,onlyOwn:false,confirm:null,msg:'',msgOk:false,busy:false,exSel:null,anim:null,lastN:{},bLoad:{},gift:null,gpick:null,
  giftTo(code,nick){this.gift={code,nick};this.gpick=null;this.page='shop';this.open()},
  open(id,page){let o=$('shopWin');if(!o){o=document.createElement('div');o.id='shopWin';document.body.appendChild(o);
      o.addEventListener('click',e=>{if(e.target===o){this.close();return}const t=e.target.closest('[data-sa]');if(t)this.act(t.dataset.sa,t.dataset.v)});
      o.addEventListener('change',e=>{if(e.target.dataset.sa==='own'){this.onlyOwn=e.target.checked;this.render()}});
      // pointing at a line's reward lights up its five cells
      const hl=k=>{for(const c of o.querySelectorAll('.bc.hl'))c.classList.remove('hl');if(k==null)return;for(const i of BINGO_LINES[k]){const c=o.querySelector('.bc[data-c="'+i+'"]');if(c)c.classList.add('hl')}};
      o.addEventListener('mouseover',e=>{const t=e.target.closest('.brw');hl(t?+t.dataset.l:null)})}
    if(page)this.page=page;if(id){this.sel=id;this.cat='all';this.page='shop'}this.confirm=null;this.msg='';this.bLoad={};this.scrollSel=true;this.render();AU.play('ui',{vol:.35})},
  close(){if(this.anim)this.animSkip();const o=$('shopWin');if(o)o.remove();this.confirm=null;this.gift=null;this.gpick=null;const p=$('gPop');if(p)p.remove()},
  list(){const C=shopCats(),c=C.find(x=>x.k===this.cat)||C[0];let ids=c.items;if(this.onlyOwn)ids=ids.filter(id=>{const s=shopState(id);return s==='free'||s==='own'});return {C,c,ids:shopOrder(ids)}},
  head(){const L=LI(),signed=ACC.signed(),me=ACC.me;
    if(!ACC.on)return `<span class="soff">${L?'Accounts not set up — every gun is open':'계정 서버 연결 전 — 지금은 모든 총 사용 가능'}</span>`;
    if(signed)return `<span class="scoin">${COIN}<b>${fmtC(me.coins)}</b></span><span class="scoin frg" title="${L?'Decoder fragments':'해독 조각'}">${FRAG}<b>${fmtC(me.frags||0)}</b></span><button class="scoin tfr" data-sa="page" data-v="tr" title="${L?'Transcendence fragments (the 초월 exchange)':'초월 조각 (초월 교환)'}">${TFRAG}<b>${fmtC(me.tfrags||0)}</b></button>${me.tickets>0?`<button class="scoin tkc" data-sa="page" data-v="gacha" title="${L?'근하신년 decoders kept (open them on the 근하신년 tab)':'보유한 근하신년 해독기 (근하신년 해독기 탭에서 사용)'}">${decoderSvg('tki')}<b>${fmtC(me.tickets)}</b></button>`:''}<button class="sacc" data-sa="acc">${SVG_USER}<span>${esc(me.nickname)}</span></button>`;
    return `<button class="sacc hl" data-sa="login">${SVG_USER}<span>${L?'Sign in':'로그인'}</span></button>`},
  render(){const o=$('shopWin');if(!o)return;const L=LI(),pg=this.page,free=ACC.signed()&&ACC.me.freeToday&&ACC.gc().daily_free;
    const ptabs=`<div class="spages"><button class="${pg==='shop'?'on':''}" data-sa="page" data-v="shop">${L?'Gun shop':'총기 상점'}</button><button class="${pg==='gacha'?'on':''} gp" data-sa="page" data-v="gacha">${L?'Decoder bingo':'근하신년 해독기'}${free?'<i class="dot"></i>':''}</button><button class="${pg==='season'?'on':''} sp" data-sa="page" data-v="season">${L?'Season decoder':'시즌 해독기'}</button><button class="${pg==='side'?'on':''} dp" data-sa="page" data-v="side">${L?'Sidearm decoder':'보조무기 해독기'}</button><button class="${pg==='ex'?'on':''}" data-sa="page" data-v="ex">${L?'Fragment exchange':'조각 교환'}</button><button class="${pg==='tr'?'on':''} tp" data-sa="page" data-v="tr">${L?'Transcendence':'초월 교환'}</button></div>`;
    const body=pg==='gacha'||pg==='season'||pg==='side'?this.bingoPage(pg):pg==='ex'?this.exPage():pg==='tr'?this.trPage():this.shopPage();
    o.innerHTML=`<div class="swin"><div class="swh"><b>${L?'Shop':'상점'}</b><small>SHOP</small><span class="sgap"></span>${this.head()}<button class="sx" data-sa="x" aria-label="close">×</button></div>${ptabs}${body}</div>`;
    if(this.scrollSel){this.scrollSel=false;const c=o.querySelector('.sc.on');if(c&&c.scrollIntoView)c.scrollIntoView({block:'nearest'})}},
  // ---- the gun shop ----
  shopPage(){const L=LI(),{C,ids}=this.list();if(!ids.includes(this.sel))this.sel=ids[0]||null;const signed=ACC.signed(),coins=signed?ACC.me.coins:0;
    const cards=ids.map(id=>{const W=WPN[id],st=shopState(id),p=ACC.price(id)||{price:0},t=ACC.tier(id);
      const tag=st==='free'?`<em class="bf">${L?'FREE':'기본'}</em>`:st==='own'?`<em class="bo">${L?'OWNED':'보유'}</em>`:st==='crate'?`<em class="bc">${L?'CRATE ONLY':'보급 전용'}</em>`
        :st==='gacha'?`<em class="bg${t}">${t} · ${L?'DECODER':'해독기 전용'}</em>`:st==='season'?`<em class="bsz">${L?'SEASON DECODER':'시즌 해독기'}</em>`
        :st==='side'?`<em class="bsd">${L?'SIDEARM DECODER':'보조무기 해독기'}</em>`:st==='trans'?`<em class="btr">${L?'TRANSCENDENCE':'초월 교환'}</em>`
        :`<span class="pr${signed&&coins<p.price?' poor':''}">${COIN}${fmtC(p.price)}</span>`;
      return `<div class="sc ${st}${t?' t'+t:''}${seasonGun(id)?' tE':''}${sideGun(id)?' tP':''}${transGun(id)?' tX':''}${id===this.sel?' on':''}" data-sa="sel" data-v="${id}">${W.ny?'<i class="nyb">NY</i>':''}<div class="sci"><img src="${gunIcon(W.model,30)}" alt=""></div><b>${esc(W.n[L])}</b><span class="scp">${tag}</span></div>`}).join('')
      ||`<div class="sempty">${L?'Nothing here yet':'아직 없어요'}</div>`;
    return `<div class="stabs"><div class="stl">${C.map(c=>`<button class="${c.k===this.cat?'on':''}" data-sa="cat" data-v="${c.k}">${esc(c.n)}</button>`).join('')}</div>
        <label class="sfil"><input type="checkbox" data-sa="own"${this.onlyOwn?' checked':''}><span>${L?'Mine only':'보유한 총만'}</span></label></div>
      ${this.gift?`<div class="sgift">${SVG_GIFT}<span>${L?`Pick a gun to send to <b>${esc(this.gift.nick)}</b> (your coins)`:`<b>${esc(this.gift.nick)}</b>에게 선물할 총을 골라요 (내 코인으로)`}</span><button data-sa="giftoff">${L?'Stop gifting':'선물 그만두기'}</button></div>`:''}
      <div class="sbody"><div class="sgrid">${cards}</div>${this.detail()}</div>
      <div class="sfoot">${L?'Coins and xp come at the end of every round (its kills, infections, damage and win) and more at the end of a finished match. In a match every gun you own is free to pick; floor pick-ups and supply crates still give any gun. The shooting range lends you every gun to try. 근하신년 guns come from the decoder bingo'+(seasonGuns().length?', '+seasonNames(1)+' from the season decoder':'')+(cardGuns('side').length?', '+seasonNames(1,cardGuns('side'))+' from the sidearm decoder.':'.')
        :'코인과 경험치는 라운드가 끝날 때마다 그 라운드의 킬·감염·피해량·승리로 들어오고, 매치를 끝까지 하면 더 들어와요. 매치 안에서는 보유한 총을 무료로 고를 수 있고, 바닥에 떨어진 총·보급상자는 그대로예요. 사격장에서는 모든 총을 빌려 쏴 볼 수 있어요. 근하신년 무기는 해독기 빙고에서만'+(seasonGuns().length?', '+seasonNames(0)+'는 시즌 해독기에서만':'')+(cardGuns('side').length?', '+seasonNames(0,cardGuns('side'))+'는 보조무기 해독기에서만':'')+' 나와요.'}</div>`},
  detail(){const L=LI(),id=this.sel,W=id&&WPN[id];if(!W)return '<div class="sdet"></div>';const st=shopState(id),p=ACC.price(id)||{price:0},signed=ACC.signed(),coins=signed?ACC.me.coins:0,t=ACC.tier(id),g=ACC.gc();
    const kn=(KIND_N[W.kind]||KIND_N.special)[L?1:0];
    const info=[kn,t?t+(L?' grade':'등급'):null,transGun(id)?(L?'Transcendence':'초월 무기'):null,seasonGun(id)?(L?'Season decoder':'시즌 해독기'):null,sideGun(id)?(L?'Sidearm decoder':'보조무기 해독기'):null,W.mag?W.mag+(L?' rds':'발'):null,W.rpm?W.rpm+' RPM':null].filter(Boolean).join(' · ');
    let buy;
    if(st==='gacha')buy=`<div class="sbn">${L?'Only from a bingo line on the 근하신년 decoder card, or the fragment exchange.':'근하신년 해독기 빙고의 줄 보상이나 조각 교환으로만 얻을 수 있어요.'}</div>
      <button class="sbb red" data-sa="page" data-v="gacha">${L?'Open decoders':'해독기 열기'}</button><button class="sbx2" data-sa="exsel" data-v="${id}">${FRAG}${fmtC(t==='S'?g.ex_s:g.ex_a)} ${L?'fragments — exchange':'조각으로 교환'}</button>`;
    else if(!ACC.on)buy=`<div class="sbn">${L?'Accounts are not set up yet, so every gun is open for now.':'계정 서버가 연결되기 전이라 지금은 모든 총을 쓸 수 있어요.'}</div>${st==='buy'?`<div class="sbp">${COIN}${fmtC(p.price)}</div>`:''}`;
    else if(st==='free')buy=`<div class="sbn ok">${L?'Free for everyone.':'기본 지급 — 누구나 쓸 수 있어요.'}</div>`;
    else if(st==='own')buy=`<div class="sbn ok">${L?'Yours. Pick it free from the buy menu in a match.':'보유 중 — 매치의 구매 메뉴에서 무료로 고를 수 있어요.'}</div>`;
    else if(st==='crate')buy=`<div class="sbn">${L?'Only from supply crates.':'보급상자에서만 얻을 수 있어요.'}</div>`;
    else if(st==='season')buy=`<div class="sbn">${L?'Yours to keep only from its line on the season decoder card (not sold, not exchanged).':'시즌 해독기 빙고에서 이 총의 줄을 완성하면 영구 보유해요 (판매 · 조각 교환 없음).'}</div>
      <button class="sbb vio" data-sa="page" data-v="season">${L?'Open season decoders':'시즌 해독기 열기'}</button>`;
    else if(st==='trans')buy=`<div class="sbn">${L?`Only from the transcendence exchange: ${fmtC(g.trans_cost)} transcendence fragments (every decoder gives ${g.trans_frag_min}–${g.trans_frag_max}). Never from a decoder line, the shop or a gift.`:`초월 교환으로만 얻어요: 초월 조각 ${fmtC(g.trans_cost)}개 (해독기를 열 때마다 ${g.trans_frag_min}~${g.trans_frag_max}개). 해독기 보상 · 상점 · 선물로는 안 나와요.`}</div>
      <button class="sbb trx" data-sa="trsel" data-v="${id}">${TFRAG}${fmtC(g.trans_cost)} ${L?'— to the exchange':'초월 교환으로'}</button>`;
    else if(st==='side')buy=`<div class="sbn">${L?'Yours to keep only from its line on the sidearm decoder card (not sold, not exchanged, not a gift).':'보조무기 해독기 빙고에서 이 총의 줄을 완성하면 영구 보유해요 (판매 · 조각 교환 · 선물 없음).'}</div>
      <button class="sbb crim" data-sa="page" data-v="side">${L?'Open sidearm decoders':'보조무기 해독기 열기'}</button>`;
    else if(!signed)buy=`<div class="sbp">${COIN}${fmtC(p.price)}</div><button class="sbb" data-sa="login">${L?'Sign in to buy':'로그인하고 구매'}</button>`;
    else if(this.confirm===id)buy=`<div class="sbq">${L?`Buy ${esc(W.n[1])} for ${fmtC(p.price)} coins?`:`${esc(W.n[0])}, ${fmtC(p.price)} 코인에 살까요?`}</div>
      <div class="sbr"><button class="sbb" data-sa="buyok" data-v="${id}"${this.busy?' disabled':''}>${this.busy?(L?'Buying…':'구매 중…'):(L?'Buy':'구매')}</button><button class="sbx2" data-sa="buyno">${L?'Cancel':'취소'}</button></div>`;
    else if(coins>=p.price)buy=`<button class="sbb" data-sa="buy" data-v="${id}">${COIN}${fmtC(p.price)} <span>${L?'Buy':'구매'}</span></button>`;
    else buy=`<button class="sbb" disabled>${COIN}${fmtC(p.price)}</button><div class="sbn bad">${L?fmtC(p.price-coins)+' coins short':'코인 '+fmtC(p.price-coins)+' 부족'}</div>`;
    // gifts (v6.18): only guns the shop sells (one you own too). In gift mode the button sends it; otherwise a friend list opens under it
    const giftable=ACC.on&&signed&&!!p.sold&&!p.free&&!p.tier&&p.price>0;
    if(this.gift){const g=this.gift;
      if(!giftable)buy=`<div class="sbn">${L?'Only guns the shop sells can be gifts.':'상점에서 파는 총만 선물할 수 있어요.'}</div>`;
      else if(this.confirm==='gift:'+id)buy=`<div class="sbq">${L?`Send the ${esc(W.n[1])} to ${esc(g.nick)} for ${fmtC(p.price)} coins?`:`${esc(g.nick)}에게 ${esc(W.n[0])}을(를) ${fmtC(p.price)} 코인에 선물할까요?`}</div>
        <div class="sbr"><button class="sbb gift" data-sa="giftok" data-v="${id}"${this.busy?' disabled':''}>${this.busy?(L?'Sending…':'보내는 중…'):(L?'Send':'선물하기')}</button><button class="sbx2" data-sa="buyno">${L?'Cancel':'취소'}</button></div>`;
      else if(coins>=p.price)buy=`<button class="sbb gift" data-sa="gift" data-v="${id}">${SVG_GIFT}${COIN}${fmtC(p.price)} <span>${L?'Gift to '+esc(g.nick):esc(g.nick)+'에게 선물'}</span></button>`;
      else buy=`<button class="sbb gift" disabled>${SVG_GIFT}${COIN}${fmtC(p.price)}</button><div class="sbn bad">${L?fmtC(p.price-coins)+' coins short':'코인 '+fmtC(p.price-coins)+' 부족'}</div>`}
    else if(giftable&&this.confirm!==id)buy+=this.gpick===id?this.pickHtml():`<button class="sbx2 sgb" data-sa="gpick" data-v="${id}">${SVG_GIFT}<span>${L?'Gift to a friend':'친구에게 선물'}</span></button>`;
    if(this.msg)buy+=`<div class="sbm ${this.msgOk?'ok':'bad'}">${esc(this.msg)}</div>`;
    return `<div class="sdet"><div class="sdi${t?' t'+t:''}${seasonGun(id)?' tE':''}${sideGun(id)?' tP':''}${transGun(id)?' tX':''}"><img src="${gunIcon(W.model,58)}" alt=""></div><h4>${esc(W.n[L])}<small>${esc(W.n[L?0:1])}</small></h4><div class="sinfo">${info}</div>
      ${UI.statBars(W)}<p class="sdesc">${UI.wTags(W,id)||''}</p><div class="sbuy">${buy}</div></div>`},
  // the friends to send the selected gun to (loaded on first use)
  pickHtml(){const L=LI(),F=ACC.fr;if(!F){ACC.loadFriends().then(()=>this.render()).catch(e=>{this.msg=ACC.errText(e);this.msgOk=false;this.gpick=null;this.render()});return `<div class="sgp"><small>${L?'Loading friends…':'친구 목록 불러오는 중…'}</small></div>`}
    const fr=F.friends||[];if(!fr.length)return `<div class="sgp"><small>${L?'No friends yet.':'아직 친구가 없어요.'}</small><button data-sa="friends">${L?'Add friends':'친구 추가하러 가기'}</button><button class="sgx" data-sa="gpick" data-v="">${L?'Close':'닫기'}</button></div>`;
    return `<div class="sgp"><small>${L?'Send it to':'누구에게 보낼까요?'}</small>${fr.map(f=>`<button data-sa="gto" data-v="${esc(f.code)}">${esc(f.nickname)} <i>Lv.${recLevel(f.xp|0).l}</i></button>`).join('')}<button class="sgx" data-sa="gpick" data-v="">${L?'Close':'닫기'}</button></div>`},
  // ---- the decoder bingos: 'gacha' = the 근하신년 card (guns), 'season' = the season card (Event Horizon, Skull-9 and items),
  // 'side' = the sidearm card (v6.36: Event Horizon Mini, Crimson Peacemaker and items; numbers 1..side_hi) ----
  // what a page needs from its card: the account's card, its numbers (lo..hi) and prices, the server calls; s: a card of items (season, side)
  bk(k){const g=ACC.gc();return k==='season'?{k,s:1,lo:0,card:ACC.season,hi:g.season_hi,c1:g.season_cost1,c10:g.season_cost10,f0:g.season_frag_min,f1:g.season_frag_max,own:g.season_owned_coins,
      load:()=>ACC.loadSeason(),dec:(n,m)=>ACC.seasonDecode(n,m==='ticket'),reset:()=>ACC.seasonReset(),shuf:()=>ACC.seasonShuffle()}
    :k==='side'?{k,s:1,lo:1,card:ACC.side,hi:g.side_hi,c1:g.side_cost1,c10:g.side_cost10,f0:g.side_frag_min,f1:g.side_frag_max,own:g.side_owned_coins,
      load:()=>ACC.loadSide(),dec:n=>ACC.sideDecode(n),reset:()=>ACC.sideReset(),shuf:()=>ACC.sideShuffle()}
    :{k,s:0,lo:0,card:ACC.bingo,hi:g.bingo_hi,c1:g.dec_cost1,c10:g.dec_cost10,f0:g.dec_frag_min,f1:g.dec_frag_max,
      load:()=>ACC.loadBingo(),dec:(n,m)=>ACC.decode(n,m==='free',m==='ticket'),reset:()=>ACC.bingoReset(),shuf:()=>ACC.bingoShuffle()}},
  // the guns to show as owned: while a batch plays out, the ones owned before it and the ones it has revealed so far
  ownView(A){const me=ACC.me;if(!A||!A.own0)return me&&me.owned;const o=new Set(A.own0);for(const x of A.got)if(x.kind==='gun'&&x.gun)o.add(x.gun);return o},
  // the animation playing on this card, if any
  banim(k){const A=this.anim;return A&&A.kind===k?A:null},
  // the card on screen: the one being played out by the animation, else the account's card (a guest sees the rewards on a blank card)
  bview(k){const A=this.banim(k);if(A)return A.view;const b=this.bk(k).card;if(b&&b.nums)return b;
    const rw=k==='season'?(ACC.gc().season_lines||[]).slice(0,12):k==='side'?(ACC.gc().side_lines||[]).slice(0,12):[...SHOP_GACHA.S,...SHOP_GACHA.A];
    return {nums:null,marked:Array(25).fill(false),drawn:[],rewards:rw,done:Array(12).fill(false),boards:0,shuffles_left:ACC.gc().shuffle_free}},
  rwTile(B,k,cls,kind){if(kind==='season'||kind==='side')return this.srwTile(B,k,cls,kind);
    const L=LI(),id=B.rewards[k],W=WPN[id],t=ACC.tier(id),me=ACC.me,got=B.done[k],g=ACC.gc(),A=this.banim(kind),OW=this.ownView(A),own=!got&&!!OW&&OW.has(id);
    const name=W?W.n[L]:'?',sub=t==='S'?`${fmtC(g.full_s_coins)} ${L?'coins':'코인'}`:`${L?'fragments':'조각'} ${g.full_a_frags}`;
    const tip=got?(L?'Line done: ':'완성: ')+name:own?`${name} — ${L?'owned, pays':'보유 중 → 완성하면'} ${sub}`:name;
    return `<div class="brw ${cls}${t?' t'+t:''}${got?' got':''}${own?' own':''}${A&&A.flash&&A.flash.includes(k)?' pop':''}" data-l="${k}" title="${esc(tip)}">${W?`<img src="${gunIcon(W.model,22)}" alt="">`:''}${t?`<em>${t}</em>`:''}${got?'<i>✔</i>':''}</div>`},
  // a season (or sidearm) line's tile: a gun (with its card's glow; owned already: the coins it pays instead), a coin pile, fragments
  // or 근하신년 decoders, the amount under the picture
  srwTile(B,k,cls,kind){const L=LI(),it=sItem(B.rewards[k]),got=B.done[k],me=ACC.me,D=kind==='side',oc=this.bk(D?'side':'season').own,A=this.banim(D?'side':'season');let ic,x,tip,amt='';
    if(it.k==='gun'){const W=WPN[it.gun],name=W?W.n[L]:it.gun,OW=this.ownView(A),own=!got&&!!OW&&OW.has(it.gun);
      ic=W&&W.model?`<img src="${gunIcon(W.model,22)}" alt="">`:'';x=(D?' rP':' rE')+(own?' own':'');if(own)amt=`<em>${COIN}${sAmt(oc)}</em>`;
      tip=got?(L?'Line done: ':'완성: ')+name:own?`${name} — ${L?'owned, pays':'보유 중 → 완성하면'} ${fmtC(oc)} ${L?'coins':'코인'}`:`${name} — ${D?(L?'the sidearm prize':'보조무기 보상'):(L?'the season prize':'시즌 보상')}`}
    else if(it.k==='coins'){ic=SVG_COINS;x=' rC';amt=`<em>${sAmt(it.n)}</em>`;tip=`${fmtC(it.n)} ${L?'coins':'코인'}`}
    else if(it.k==='frags'){ic='<span class="fi"></span>';x=' rF';amt=`<em>×${it.n}</em>`;tip=`${L?'Decoder fragments':'해독 조각'} ×${it.n}`}
    else{ic=decoderSvg('tki');x=' rT';amt=`<em>×${it.n}</em>`;tip=`${L?'근하신년 decoders':'근하신년 해독기'} ×${it.n}`}
    return `<div class="brw it ${cls}${x}${got?' got':''}${A&&A.flash&&A.flash.includes(k)?' pop':''}" data-l="${k}" title="${esc(tip)}">${ic}${amt}${got?'<i>✔</i>':''}</div>`},
  boardHtml(B,kind){const A=this.banim(kind),hot=new Set();if(A&&A.flash)for(const k of A.flash)for(const c of BINGO_LINES[k])hot.add(c);
    const cell=i=>{const n=B.nums?B.nums[i]:null,m=B.marked[i];return `<div class="bc${m?' mk':''}${A&&A.last===i?' last':''}${hot.has(i)?' lw':''}" data-c="${i}"><span>${n==null?'?':pad2(n)}</span>${m?'<i></i>':''}</div>`};
    let h='';for(let r=0;r<5;r++){h+=this.rwTile(B,r,'rr',kind);for(let c=0;c<5;c++)h+=cell(r*5+c);h+='<div class="bsp"></div>'}
    h+=this.rwTile(B,11,'rd2',kind);for(let c=0;c<5;c++)h+=this.rwTile(B,5+c,'rc',kind);h+=this.rwTile(B,10,'rd1',kind);
    return `<div class="bboard">${h}</div>`},
  bingoPage(kind){const L=LI(),g=ACC.gc(),K=this.bk(kind),S=K.s,signed=ACC.signed(),me=ACC.me,coins=signed?me.coins:0,A=this.banim(kind);
    // load the card once; a failed load (offline, or a database without this card yet) waits until the page is opened again
    if(signed&&!K.card&&!this.bLoad[kind]){this.bLoad[kind]=1;K.load().then(()=>{this.bLoad[kind]=0},e=>{this.msg=ACC.errText(e);this.msgOk=false}).finally(()=>this.render())}
    const D=kind==='side',B=this.bview(kind),hi=K.hi,lo=K.lo|0,lines=B.done.filter(Boolean).length,free=!S&&signed&&me.freeToday&&g.daily_free,tk=signed&&!D?(S?me.sTickets|0:me.tickets|0):0;
    const can1=signed&&coins>=K.c1,can10=signed&&coins>=K.c10,dis=this.busy||!!this.anim,sa=D?'pdec':S?'sdec':'dec';
    const btns=!ACC.on?`<div class="sbn">${L?'Decoders open once accounts are set up.':'계정 서버가 연결되면 해독기를 열 수 있어요.'}</div>`
      :!signed?`<button class="gbtn big" data-sa="login">${L?'Sign in to open decoders':'로그인하고 해독기 열기'}</button>`
      :A?`<button class="gbtn big skip" data-sa="bskip">${L?'Skip':'건너뛰기'}</button>`
      :`${free?`<button class="gbtn free" data-sa="dec" data-v="free"${dis?' disabled':''}>${L?'Today\'s free decoder':'오늘의 무료 해독기'}</button>`:''}
        ${tk>0?`<div class="gtk"><span title="${S?(L?'From 근·하·신·년 letter sets':'근·하·신·년 글자 세트로 받은 시즌 해독기'):(L?'Won on the season and sidearm decoder cards':'시즌 · 보조무기 해독기 빙고에서 받은 해독기')}">${S?seasonSvg('tki'):decoderSvg('tki')}<i><u>${L?'Kept':'보유 해독기'} </u><b>${fmtC(tk)}</b>${L?'':'개'}</i></span><button class="gbtn tk" data-sa="${sa}" data-v="t1"${dis?' disabled':''}>${L?'Open 1':'1개 열기'}</button>${tk>=10?`<button class="gbtn tk" data-sa="${sa}" data-v="t10"${dis?' disabled':''}>${L?'Open 10':'10개 열기'}</button>`:''}</div>`:''}
        <div class="gbr"><button class="gbtn" data-sa="${sa}" data-v="1"${can1&&!dis?'':' disabled'}><b>${L?'1 decoder':'해독기 1개'}</b><span>${COIN}${fmtC(K.c1)}</span></button>
        <button class="gbtn ten" data-sa="${sa}" data-v="10"${can10&&!dis?'':' disabled'}><b>${L?'10 decoders':'해독기 10개'}</b><span>${COIN}${fmtC(K.c10)}</span></button></div>`;
    const tools=signed&&!A?(this.confirm==='breset'?`<div class="bq">${L?'A new card? What is stamped now is lost.':'새 판으로 바꿀까요? 지금 찍힌 칸은 사라져요.'}<div><button data-sa="bresetok">${L?'New card':'바꾸기'}</button><button data-sa="buyno">${L?'Cancel':'취소'}</button></div></div>`
      :`<div class="btools"><button data-sa="breset"${this.busy?' disabled':''}>↻ ${L?'Reset':'초기화'}</button><button data-sa="bshuf"${this.busy||!(B.shuffles_left>0)?' disabled':''}>⇄ ${L?'Shuffle':'뒤섞기'} <small>${B.shuffles_left|0}/${g.shuffle_free}</small></button></div>`):'';
    // the season / sidearm card: how far each of its gun lines has got
    const gl=S?B.rewards.map((c,k)=>({k,W:WPN[sItem(c).gun]})).filter(x=>sItem(B.rewards[x.k]).k==='gun'&&x.W):[],gn=esc(gl.map(x=>x.W.n[L]).join(' · '));
    const eh=B.nums?gl.map(({k,W})=>`<span class="ehs" title="${esc(W.n[L])} ${L?'line':'줄'}">${W.model?`<img src="${gunIcon(W.model,14)}" alt="">`:''}<b>${B.done[k]?'✔':BINGO_LINES[k].filter(c=>B.marked[c]).length}</b>${B.done[k]?'':'/5'}</span>`).join(''):'';
    const note=D?(L?`Each sidearm decoder shows one number from ${lo}–${hi} not drawn on this card yet; a number on the card is stamped. Finish a line and you get the item at its end: ${gn||'the sidearm guns'} (owned already: ${fmtC(K.own)} coins), coins, fragments or 근하신년 decoders (open them on the 근하신년 tab instead of paying). Every sidearm decoder also gives ${K.f0}–${K.f1} fragments (and ${g.trans_frag_min}–${g.trans_frag_max} transcendence fragments). A full card is replaced by a new one.`
        :`보조무기 해독기 1개를 열면 ${lo}~${hi} 중 이 판에서 아직 안 나온 숫자가 하나 나오고, 판에 있는 숫자면 도장이 찍혀요. 줄을 채우면 줄 끝의 보상을 받아요: ${gn||'보조무기'}(이미 가졌으면 ${fmtC(K.own)} 코인), 코인, 해독 조각, 근하신년 해독기(근하신년 해독기 탭에서 코인 대신 사용). 해독기마다 조각 ${K.f0}~${K.f1}개(초월 조각 ${g.trans_frag_min}~${g.trans_frag_max}개)도 나오고, 판을 다 채우면 새 판이 깔려요.`)
      :S?(L?`Each season decoder shows one number from 0–${hi} not drawn on this card yet; a number on the card is stamped. Finish a line and you get the item at its end: ${gn||'the season gun'} (owned already: ${fmtC(g.season_owned_coins)} coins), coins, fragments or 근하신년 decoders (open them on the 근하신년 tab instead of paying). Every season decoder also gives ${K.f0}–${K.f1} fragments (and ${g.trans_frag_min}–${g.trans_frag_max} transcendence fragments). A full card is replaced by a new one.`
        :`시즌 해독기 1개를 열면 0~${hi} 중 이 판에서 아직 안 나온 숫자가 하나 나오고, 판에 있는 숫자면 도장이 찍혀요. 줄을 채우면 줄 끝의 보상을 받아요: ${gn||'시즌 무기'}(이미 가졌으면 ${fmtC(g.season_owned_coins)} 코인), 코인, 해독 조각, 근하신년 해독기(근하신년 해독기 탭에서 코인 대신 사용). 해독기마다 조각 ${K.f0}~${K.f1}개(초월 조각 ${g.trans_frag_min}~${g.trans_frag_max}개)도 나오고, 판을 다 채우면 새 판이 깔려요.`)
      :(L?`Each decoder shows one number from 0–${hi} not drawn on this card yet; a number on the card is stamped. Finish a row, a column or a diagonal and you get the 근하신년 gun shown at its end (owned already: an S line pays ${fmtC(g.full_s_coins)} coins, an A line ${g.full_a_frags} fragments). Every decoder also gives ${K.f0}–${K.f1} fragments (and ${g.trans_frag_min}–${g.trans_frag_max} transcendence fragments). A full card is replaced by a new one.`
        :`해독기 1개를 열면 0~${hi} 중 이 판에서 아직 안 나온 숫자가 하나 나오고, 판에 있는 숫자면 도장이 찍혀요. 가로·세로·대각선 한 줄을 채우면 줄 끝에 있는 근하신년 무기를 받아요 (이미 가진 무기면 S줄은 ${fmtC(g.full_s_coins)} 코인, A줄은 조각 ${g.full_a_frags}개). 해독기마다 조각 ${K.f0}~${K.f1}개(초월 조각 ${g.trans_frag_min}~${g.trans_frag_max}개)도 나오고, 판을 다 채우면 새 판이 깔려요.`);
    return `<div class="gwrap bwrap${D?' sd':S?' sz':''}"><div class="gleft"><div class="bdec${A&&A.rolling?' roll':''}">${D?sideSvg('dz'):S?seasonSvg('dz'):decoderSvg('dz')}</div>
        <div class="bnum"><small>${L?`Number drawn (${lo}–${hi})`:`추첨된 빙고 숫자 (${lo}~${hi})`}</small><b id="bNum" class="${A&&A.hit?'hit':''}">${pad2(this.lastN&&this.lastN[kind])}</b></div>
        <div class="gbtns">${btns}</div>${this.msg?`<div class="sbm ${this.msgOk?'ok':'bad'}">${esc(this.msg)}</div>`:''}
        <div class="bstat"><span>${L?'Lines':'완성한 줄'} <b>${lines}</b>/12</span><span>${L?'Drawn':'나온 숫자'} <b>${B.drawn.length}</b>/${hi-lo+1}</span>${B.boards?`<span>${L?'Card':'판'} <b>#${B.boards}</b></span>`:''}${eh}</div>
        ${tools}<div class="glinks"><button data-sa="rules">${L?'How it works':'규칙 · 확률'}</button>${signed?`<button data-sa="hist">${L?'History':'획득 기록'}</button>`:''}</div></div>
      <div class="gright bright">${this.boardHtml(B,kind)}<div class="gnote">${note}</div></div></div>`},
  // ---- the fragment exchange ----
  exPage(){const L=LI(),g=ACC.gc(),signed=ACC.signed(),me=ACC.me,fr=signed?me.frags||0:0;
    const ids=[...SHOP_GACHA.S,...SHOP_GACHA.A].filter(id=>WPN[id]);if(!ids.includes(this.exSel))this.exSel=ids.find(id=>!(me&&me.owned&&me.owned.has(id)))||ids[0];
    const cards=ids.map(id=>{const W=WPN[id],t=ACC.tier(id),own=me&&me.owned&&me.owned.has(id),cost=t==='S'?g.ex_s:g.ex_a;
      return `<div class="sc ${own?'own':'gacha'} t${t}${id===this.exSel?' on':''}" data-sa="exsel" data-v="${id}"><div class="sci"><img src="${gunIcon(W.model,30)}" alt=""></div><b>${esc(W.n[L])}</b>
        <span class="scp">${own?`<em class="bo">${L?'OWNED':'보유'}</em>`:`<span class="pr fr${signed&&fr<cost?' poor':''}">${FRAG}${fmtC(cost)}</span>`}<em class="bg${t} sm">${t}</em></span></div>`}).join('');
    const id=this.exSel,W=WPN[id],t=ACC.tier(id),own=me&&me.owned&&me.owned.has(id),cost=t==='S'?g.ex_s:g.ex_a;
    let act;
    if(!ACC.on)act=`<div class="sbn">${L?'The exchange opens once accounts are set up.':'계정 서버가 연결되면 교환할 수 있어요.'}</div>`;
    else if(!signed)act=`<button class="sbb" data-sa="login">${L?'Sign in to exchange':'로그인하고 교환'}</button>`;
    else if(own)act=`<div class="sbn ok">${L?'Already yours.':'이미 보유 중이에요.'}</div>`;
    else if(this.confirm==='ex:'+id)act=`<div class="sbq">${L?`Exchange ${fmtC(cost)} fragments for ${esc(W.n[1])}?`:`조각 ${fmtC(cost)}개로 ${esc(W.n[0])}을(를) 받을까요?`}</div>
      <div class="sbr"><button class="sbb" data-sa="exok" data-v="${id}"${this.busy?' disabled':''}>${L?'Exchange':'교환'}</button><button class="sbx2" data-sa="buyno">${L?'Cancel':'취소'}</button></div>`;
    else if(fr>=cost)act=`<button class="sbb" data-sa="ex" data-v="${id}">${FRAG}${fmtC(cost)} <span>${L?'Exchange':'교환'}</span></button>`;
    else act=`<button class="sbb" disabled>${FRAG}${fmtC(cost)}</button><div class="sbn bad">${L?fmtC(cost-fr)+' fragments short':'조각 '+fmtC(cost-fr)+'개 부족'}</div>`;
    if(this.msg)act+=`<div class="sbm ${this.msgOk?'ok':'bad'}">${esc(this.msg)}</div>`;
    return `<div class="sbody"><div class="sgrid">${cards}</div><div class="sdet"><div class="sdi t${t}"><img src="${gunIcon(W.model,58)}" alt=""></div><h4>${esc(W.n[L])}<small>${t}${L?' grade':'등급'} · ${esc(W.n[L?0:1])}</small></h4>
      ${UI.statBars(W)}<p class="sdesc">${UI.wTags(W,id)||''}</p><div class="sbn">${L?`You have ${fmtC(fr)} fragments. Every decoder gives ${g.dec_frag_min}–${g.dec_frag_max}, and a finished A line whose gun you own gives ${g.full_a_frags}.`:`보유 조각 ${fmtC(fr)}개 — 해독기마다 ${g.dec_frag_min}~${g.dec_frag_max}개, 이미 가진 A 무기 줄을 완성하면 ${g.full_a_frags}개가 나와요.`}</div><div class="sbuy">${act}</div></div></div>
      <div class="sfoot">${L?`An S of your choice for ${g.ex_s} fragments, an A for ${g.ex_a}.`:`원하는 S 무기는 조각 ${g.ex_s}개, A 무기는 ${g.ex_a}개로 바꿀 수 있어요.`}</div>`},
  // ---- the transcendence exchange (v6.41): a transcendence gun for trans_cost transcendence fragments ----
  trPage(){const L=LI(),g=ACC.gc(),signed=ACC.signed(),me=ACC.me,fr=signed?me.tfrags||0:0,cost=g.trans_cost;
    const ids=(g.trans_guns||[]).filter(id=>WPN[id]&&WPN[id].model);if(!ids.length)return `<div class="sbody"><div class="sempty">${L?'Nothing here yet':'아직 없어요'}</div></div>`;
    if(!ids.includes(this.trSel))this.trSel=ids.find(id=>!(me&&me.owned&&me.owned.has(id)))||ids[0];
    const cards=ids.map(id=>{const W=WPN[id],own=me&&me.owned&&me.owned.has(id);
      return `<div class="sc ${own?'own':'trans'} tX${id===this.trSel?' on':''}" data-sa="trsel" data-v="${id}"><div class="sci"><img src="${gunIcon(W.model,30)}" alt=""></div><b>${esc(W.n[L])}</b>
        <span class="scp">${own?`<em class="bo">${L?'OWNED':'보유'}</em>`:`<span class="pr tf${signed&&fr<cost?' poor':''}">${TFRAG}${fmtC(cost)}</span>`}</span></div>`}).join('');
    const id=this.trSel,W=WPN[id],own=me&&me.owned&&me.owned.has(id);let act;
    if(!ACC.on)act=`<div class="sbn">${L?'The exchange opens once accounts are set up.':'계정 서버가 연결되면 교환할 수 있어요.'}</div>`;
    else if(!signed)act=`<button class="sbb" data-sa="login">${L?'Sign in to exchange':'로그인하고 교환'}</button>`;
    else if(own)act=`<div class="sbn ok">${L?'Already yours.':'이미 보유 중이에요.'}</div>`;
    else if(this.confirm==='tr:'+id)act=`<div class="sbq">${L?`Exchange ${fmtC(cost)} transcendence fragments for the ${esc(W.n[1])}?`:`초월 조각 ${fmtC(cost)}개로 ${esc(W.n[0])}을(를) 받을까요?`}</div>
      <div class="sbr"><button class="sbb trx" data-sa="trok" data-v="${id}"${this.busy?' disabled':''}>${L?'Exchange':'교환'}</button><button class="sbx2" data-sa="buyno">${L?'Cancel':'취소'}</button></div>`;
    else if(fr>=cost)act=`<button class="sbb trx" data-sa="tr" data-v="${id}">${TFRAG}${fmtC(cost)} <span>${L?'Exchange':'교환'}</span></button>`;
    else act=`<button class="sbb trx" disabled>${TFRAG}${fmtC(cost)}</button><div class="sbn bad">${L?fmtC(cost-fr)+' transcendence fragments short':'초월 조각 '+fmtC(cost-fr)+'개 부족'}</div>`;
    if(this.msg)act+=`<div class="sbm ${this.msgOk?'ok':'bad'}">${esc(this.msg)}</div>`;
    const pct=Math.min(100,Math.round(fr/Math.max(1,cost)*100));
    return `<div class="sbody"><div class="sgrid">${cards}</div><div class="sdet"><div class="sdi tX"><img src="${gunIcon(W.model,58)}" alt=""></div><h4>${esc(W.n[L])}<small>${L?'Transcendence':'초월 무기'} · ${esc(W.n[L?0:1])}</small></h4>
      ${UI.statBars(W)}<p class="sdesc">${UI.wTags(W,id)||''}</p>
      <div class="trbar"><i style="width:${pct}%"></i><span>${TFRAG}<b>${fmtC(fr)}</b> / ${fmtC(cost)}</span></div>
      <div class="sbn">${L?`Every decoder you open — 근하신년, season or sidearm, one or ten at a time — gives ${g.trans_frag_min}–${g.trans_frag_max} transcendence fragments on top of its decoder fragments. Transcendence guns never come from a decoder line, the shop or a gift.`:`근하신년 · 시즌 · 보조무기 해독기를 열 때마다 (1개든 10개든 한 개마다) 해독 조각과 따로 초월 조각이 ${g.trans_frag_min}~${g.trans_frag_max}개씩 나와요. 초월 무기는 해독기 보상 · 상점 · 선물로는 나오지 않아요.`}</div><div class="sbuy">${act}</div></div></div>
      <div class="sfoot">${L?`A transcendence gun of your choice for ${fmtC(cost)} transcendence fragments. M4A1 Dark Knight: owning it also makes your Deadshot last a second longer.`:`원하는 초월 무기를 초월 조각 ${fmtC(cost)}개로 교환해요. M4A1 다크나이트는 보유만 해도 확인사살 지속시간이 1초 늘어나요.`}</div>`},
  act(a,v){const L=LI();
    if(a==='x'){this.close();return}
    if(a==='page'){if(this.page!==v){if(this.anim)this.animSkip();this.page=v;this.bLoad={};this.confirm=null;this.msg='';this.scrollSel=true;this.render();AU.play('ui',{vol:.3})}return}
    if(a==='cat'){this.cat=v;this.confirm=null;this.msg='';this.scrollSel=true;this.render();const g=document.querySelector('#shopWin .sgrid');if(g)g.scrollTop=0;return}
    if(a==='sel'){if(this.sel!==v){this.sel=v;this.confirm=null;this.msg='';this.render();AU.play('ui',{vol:.25})}return}
    if(a==='sel2'){this.page='shop';this.cat='all';this.sel=v;this.confirm=null;this.msg='';this.scrollSel=true;this.render();return}
    if(a==='exsel'){this.page='ex';if(this.exSel!==v){this.exSel=v;this.confirm=null;this.msg=''}this.render();return}
    if(a==='trsel'){if(this.anim)this.animSkip();this.page='tr';if(this.trSel!==v){this.trSel=v;this.confirm=null;this.msg=''}this.render();return}
    if(a==='tr'){this.confirm='tr:'+v;this.msg='';this.render();return}
    if(a==='trok'){this.trExchange(v);return}
    if(a==='login'){ACCW.open('in');return}
    if(a==='acc'){ACCW.open('me');return}
    if(a==='buy'){this.confirm=v;this.msg='';this.render();return}
    if(a==='buyno'){this.confirm=null;this.render();return}
    if(a==='giftoff'){this.gift=null;this.confirm=null;this.msg='';this.render();return}
    if(a==='gift'){this.confirm='gift:'+v;this.msg='';this.render();return}
    if(a==='giftok'){this.giftBuy(v);return}
    if(a==='gpick'){this.gpick=v||null;this.msg='';this.render();return}
    if(a==='gto'){const f=(ACC.fr&&ACC.fr.friends||[]).find(x=>x.code===v);if(f){this.gift={code:f.code,nick:f.nickname};this.gpick=null;this.confirm='gift:'+this.sel;this.msg=''}this.render();return}
    if(a==='friends'){this.close();FR.open();return}
    if(a==='buyok'){this.buy(v);return}
    if(a==='ex'){this.confirm='ex:'+v;this.msg='';this.render();return}
    if(a==='exok'){this.exchange(v);return}
    // 근하신년 decoders: 1 | 10 | free | t1 | t10 (kept ones instead of coins); season decoders: 1 | 10 | t1 | t10; sidearm decoders: 1 | 10
    if(a==='dec'){const t=v[0]==='t';this.decode(t?+v.slice(1):v==='free'?1:+v,t?'ticket':v==='free'?'free':'coins','gacha');return}
    if(a==='sdec'){const t=v[0]==='t';this.decode(t?+v.slice(1):+v,t?'ticket':'coins','season');return}
    if(a==='pdec'){this.decode(+v,'coins','side');return}
    if(a==='bskip'){this.animSkip();return}
    if(a==='breset'){this.confirm='breset';this.msg='';this.render();return}
    if(a==='bresetok'){this.confirm=null;const K=this.bk(this.page);this.tool(()=>K.reset(),L?'A new card':'새 판을 깔았어요');return}
    if(a==='bshuf'){const K=this.bk(this.page);this.tool(()=>K.shuf(),L?'Shuffled the open numbers':'안 찍힌 숫자 자리를 섞었어요');return}
    if(a==='rules'){if(this.page==='season'||this.page==='side')sPopRules(this.page);else gPopRules();return}
    if(a==='hist'){gPopHist();return}},
  async buy(id){if(this.busy)return;const L=LI(),W=WPN[id];this.busy=true;this.render();
    try{await ACC.buy(id);this.msg=(L?'Bought: ':'구매 완료 — ')+W.n[L];this.msgOk=true;AU.play('buy',{vol:.8})}
    catch(e){this.msg=ACC.errText(e);this.msgOk=false;AU.play('dry',{vol:.5});if(/not_signed_in|JWT/i.test(String(e.message)))ACCW.open('in')}
    this.busy=false;this.confirm=null;this.render()},
  async giftBuy(id){if(this.busy||!this.gift)return;const L=LI(),W=WPN[id],g=this.gift;this.busy=true;this.render();
    try{const r=await ACC.gift(g.code,id);this.msg=L?`Sent the ${W.n[1]} to ${r.to||g.nick}`:`선물 완료 — ${r.to||g.nick}에게 ${W.n[0]}`;this.msgOk=true;AU.play('lvlup',{vol:.6})}
    catch(e){this.msg=ACC.errText(e);this.msgOk=false;AU.play('dry',{vol:.5});if(/not_signed_in|JWT/i.test(String(e.message)))ACCW.open('in')}
    this.busy=false;this.confirm=null;this.render()},
  async exchange(id){if(this.busy)return;const L=LI(),W=WPN[id];this.busy=true;this.render();
    try{await ACC.exchange(id);this.msg=(L?'Exchanged: ':'교환 완료 — ')+W.n[L];this.msgOk=true;AU.play('lvlup',{vol:.7})}
    catch(e){this.msg=ACC.errText(e);this.msgOk=false;AU.play('dry',{vol:.5})}
    this.busy=false;this.confirm=null;this.render()},
  async trExchange(id){if(this.busy)return;const L=LI(),W=WPN[id];this.busy=true;this.render();
    try{await ACC.transExchange(id);this.msg=(L?'Exchanged: ':'교환 완료 — ')+W.n[L];this.msgOk=true;AU.play('stingH',{vol:.8})}
    catch(e){this.msg=ACC.errText(e);this.msgOk=false;AU.play('dry',{vol:.5})}
    this.busy=false;this.confirm=null;this.render()},
  async tool(fn,ok){if(this.busy||this.anim)return;this.busy=true;this.msg='';this.render();
    try{await fn();this.msg=ok;this.msgOk=true;this.lastN[this.page]=null;AU.play('cylspin',{vol:.3,rate:1.6})}catch(e){this.msg=ACC.errText(e);this.msgOk=false;AU.play('dry',{vol:.5})}
    this.busy=false;this.render()},
  // open decoders: the server answers at once; then the card plays it out — each number rolls on the read-out and lands,
  // a number on the card is stamped, a finished line flashes gold — and the line rewards turn over as cards at the end.
  // mode: coins | free | ticket (근하신년 decoders kept from the season card); kind: gacha (근하신년 card) | season | side (the sidearm card)
  async decode(n,mode,kind){if(this.busy||this.anim)return;const K=this.bk(kind);this.busy=true;this.msg='';this.render();
    // (own0: the guns owned before these decoders — while the card plays out, a gun won in this batch must not show as owned yet)
    const before=K.card&&K.card.nums?K.card:null,own0=ACC.me&&ACC.me.owned?new Set(ACC.me.owned):null;let r=null;AU.play('cylspin',{vol:.35,rate:1.3});
    try{r=await K.dec(n,mode)}catch(e){this.msg=ACC.errText(e);this.msgOk=false;AU.play('dry',{vol:.5});this.busy=false;this.render();return}
    const cp=b=>({nums:b.nums.slice(),marked:b.marked.slice(),drawn:b.drawn.slice(),rewards:b.rewards.slice(),done:b.done.slice(),boards:b.boards,shuffles_left:b.shuffles_left});
    const fresh=b=>({...cp(b),marked:Array(25).fill(false),drawn:[],done:Array(12).fill(false)});
    // the card as it was before these decoders: the one on screen, else the answer's card with this batch's numbers taken back out
    let start=before?cp(before):null;
    if(!start&&!r.draws.some(d=>d.card>0)){const mine=new Set(r.draws.map(d=>d.n)),v=fresh(r.card);v.drawn=r.card.drawn.filter(x=>!mine.has(x));
      for(const x of v.drawn){const c=v.nums.indexOf(x);if(c>=0)v.marked[c]=true}BINGO_LINES.forEach((ln,k)=>{v.done[k]=ln.every(c=>v.marked[c])});start=v}
    this.anim={kind,view:start||fresh(r.card),draws:r.draws,i:0,card:0,got:[],frags:0,tfr:0,flash:null,last:null,n,mode,res:r,fast:n>=10,hi:K.hi,lo:K.lo|0,own0};
    this.busy=false;if(this.page!==kind){this.animSkip();return}// (the player left this card while the server answered)
    this.render();this.animStep()},
  animStep(){const A=this.anim;if(!A)return;if(A.i>=A.draws.length){this.animEnd();return}
    const d=A.draws[A.i],el=()=>$('bNum');
    if(d.card>A.card){A.card=d.card;const f=A.res.card;A.view={...A.view,nums:f.nums.slice(),rewards:f.rewards.slice(),marked:Array(25).fill(false),drawn:[],done:Array(12).fill(false),boards:(A.view.boards||0)+1};
      shopToast(LI()?'BINGO card full — a new card!':'판을 다 채웠어요 — 새 판!')}
    A.flash=null;A.last=null;A.hit=false;A.rolling=true;this.render();
    const roll=A.fast?300:560,t0=performance.now();clearInterval(A.iv);
    A.iv=setInterval(()=>{const e=el();if(e)e.textContent=pad2(A.lo+Math.floor(Math.random()*(A.hi-A.lo+1)))},45);
    AU.play('ui',{vol:.2,rate:1.6});
    A.to=setTimeout(()=>{clearInterval(A.iv);if(this.anim!==A)return;A.rolling=false;this.lastN[A.kind]=d.n;A.view.drawn=[...A.view.drawn,d.n];A.frags+=d.frags|0;A.tfr+=d.tfrags|0;
      if(d.cell!=null){A.view.marked=A.view.marked.slice();A.view.marked[d.cell]=true;A.last=d.cell;A.hit=true}
      const ls=d.lines||[];if(ls.length){A.view.done=A.view.done.slice();for(const x of ls){A.view.done[x.line]=true;A.got.push(x)}A.flash=ls.map(x=>x.line)}
      this.render();
      if(ls.length)AU.play(ls.some(x=>x.kind==='gun'&&x.tier!=='A')?'stingH':'lvlup',{vol:.8});else if(d.cell!=null)AU.play('hsding',{vol:.6});else AU.play('ui',{vol:.25,rate:.8});
      A.i++;A.to=setTimeout(()=>this.animStep(),ls.length?1100:d.cell!=null?(A.fast?380:650):(A.fast?220:420))},roll)},
  animSkip(){const A=this.anim;if(!A)return;clearTimeout(A.to);clearInterval(A.iv);
    for(;A.i<A.draws.length;A.i++){const d=A.draws[A.i];A.frags+=d.frags|0;A.tfr+=d.tfrags|0;for(const x of d.lines||[])A.got.push(x);this.lastN[A.kind]=d.n}
    this.animEnd()},
  animEnd(){const A=this.anim;if(!A)return;clearTimeout(A.to);clearInterval(A.iv);this.anim=null;const L=LI();
    if(A.res.card.drawn.length===0&&A.draws.length)shopToast(L?'BINGO card full — a new card!':'판을 다 채웠어요 — 새 판!');
    this.msg=(L?`+${A.frags} fragments`:`조각 +${A.frags}개`)+(A.tfr?(L?` · +${A.tfr} transcendence`:` · 초월 조각 +${A.tfr}개`):'')+(A.got.length?(L?` · ${A.got.length} line(s)!`:` · ${A.got.length}줄 완성!`):'');this.msgOk=true;
    ACC.emit();this.render();if(A.got.length)GFX.show(A.got,A.n,A.kind,A.mode)}};

// ---------- the line rewards: one card per finished line, turned over one by one ----------
const GFX={res:null,n:1,kind:'gacha',mode:'coins',timers:[],done:false,
  el(){let o=$('gFx');if(!o){o=document.createElement('div');o.id='gFx';document.body.appendChild(o);o.addEventListener('click',e=>{const t=e.target.closest('[data-gx]');if(t)this.act(t.dataset.gx);else if(this.done)this.close()})}return o},
  clear(){for(const t of this.timers)clearTimeout(t);this.timers=[]},
  later(ms,fn){this.timers.push(setTimeout(fn,ms))},
  // res: the finished lines; n: 1 or 10 (for "again"); kind: gacha | season | side; mode: how they were opened (coins | free | ticket)
  show(res,n,kind,mode){this.clear();this.res=res;this.n=n;this.kind=kind||'gacha';this.mode=mode||'coins';this.done=false;const o=this.el(),D=this.kind==='side',S=this.kind==='season'||D;
    const best=S?(res.some(x=>x.kind==='gun')?(D?'P':'E'):'A'):res.some(x=>x.tier==='S')?'S':'A';o.className='on'+(D?' sd':S?' sz':'');
    const fl=document.createElement('div');fl.className='gflash t'+best;o.innerHTML='';o.appendChild(fl);this.later(380,()=>this.cards(res))},
  lnTag(x){const L=LI();return `<i class="gln">${L?'LINE':'빙고'} ${x.line<5?(L?'row ':'가로 ')+(x.line+1):x.line<10?(L?'col ':'세로 ')+(x.line-4):(L?'diag ':'대각 ')+(x.line-9)}</i>`},
  card(x,i){if(this.kind==='season'||this.kind==='side')return this.scard(x,i);
    const L=LI(),W=WPN[x.gun]||{n:[x.gun||'?',x.gun||'?']},many=this.res.length>5,ln=this.lnTag(x);let face='',cls='t'+(x.tier||'A');
    if(x.kind==='gun')face=`<div class="gci"><img src="${W.model?gunIcon(W.model,many?30:48):''}" alt=""></div><b>${esc(W.n[L])}</b><span class="gtg t${x.tier}">${x.tier}</span><i class="gnew">NEW</i>${ln}`;
    else if(x.kind==='coins'){cls+=' cv';face=`<div class="gci big">${COIN}</div><b>${fmtC(x.amount)}</b><span>${L?'coins':'코인'} <small>(${esc(W.n[L])} ${L?'owned':'보유 중'})</small></span>${ln}`}
    else{cls+=' fv';face=`<div class="gci big">${FRAG}</div><b>×${x.amount}</b><span>${L?'fragments':'해독 조각'} <small>(${esc(W.n[L])} ${L?'owned':'보유 중'})</small></span>${ln}`}
    return `<div class="gcard ${cls}" style="--i:${i}"><div class="gin"><div class="gback">${decoderSvg('mini')}</div><div class="gfront">${face}</div></div></div>`},
  // a season (or sidearm) line's card: the gun (violet / crimson, a turning disc behind it), the coins it pays when owned, a coin pile,
  // fragments, 근하신년 decoders
  scard(x,i){const L=LI(),W=WPN[x.gun]||null,name=W?W.n[L]:(x.gun||'?'),many=this.res.length>5,ln=this.lnTag(x),D=this.kind==='side',tg=D?'tP':'tE';let face,cls;
    if(x.kind==='gun'){cls=tg;face=`<div class="gci eh${D?' dp':''}"><img src="${W&&W.model?gunIcon(W.model,many?30:48):''}" alt=""></div><b>${esc(name)}</b><span class="gtg ${tg}">${D?(L?'SIDEARM':'보조무기'):(L?'SEASON':'시즌')}</span><i class="gnew">NEW</i>${ln}`}
    else if(x.kind==='coins'&&x.gun){cls=tg+' cv';face=`<div class="gci big">${COIN}</div><b>${fmtC(x.amount)}</b><span>${L?'coins':'코인'} <small>(${esc(name)} ${L?'owned':'보유 중'})</small></span>${ln}`}
    else if(x.kind==='coins'){cls='tC';face=`<div class="gci pile">${SVG_COINS}</div><b>${fmtC(x.amount)}</b><span>${L?'coins':'코인'}</span>${ln}`}
    else if(x.kind==='frags'){cls='tF';face=`<div class="gci big">${FRAG}</div><b>×${x.amount}</b><span>${L?'fragments':'해독 조각'}</span>${ln}`}
    else{cls='tT';face=`<div class="gci tks">${decoderSvg('tki').repeat(Math.max(1,Math.min(3,x.amount|0)))}</div><b>×${x.amount}</b><span>${L?'근하신년 decoders':'근하신년 해독기'}</span>${ln}`}
    return `<div class="gcard ${D?'sd':'sz'} ${cls}" style="--i:${i}"><div class="gin"><div class="gback">${D?sideSvg('mini'):seasonSvg('mini')}</div><div class="gfront">${face}</div></div></div>`},
  cards(res){const o=this.el(),L=LI(),many=res.length>5,step=many?170:220;
    o.innerHTML=`<div class="gstage res${many?' ten':''}"><div class="gcap">BINGO! <small>${L?`${res.length} line(s)`:`${res.length}줄 완성`}</small></div><div class="gcards">${res.map((x,i)=>this.card(x,i)).join('')}</div>
      <div class="gbar"><button class="gskip" data-gx="skip">${L?'Skip':'건너뛰기'}</button></div></div>`;
    const cs=o.querySelectorAll('.gcard');cs.forEach((c,i)=>this.later(Math.max(260+i*step,420+i*40),()=>{// flip only once the card has slid in (a flip during the slide-in can leave the card unpainted on some phones)
      c.classList.add('open');const x=res[i];AU.play(x.kind==='gun'?(x.tier==='A'?'hsding':'lvlup'):'ui',{vol:x.kind==='gun'?.8:.3})}));
    this.later(Math.max(260+cs.length*step,420+cs.length*40)+500,()=>this.finish())},
  // "again": the same count on the same card — with kept 근하신년 decoders while they last, else coins
  again(){const g=ACC.gc(),me=ACC.me,S=this.kind==='season',D=this.kind==='side',n=this.n>=10?10:1,tk=!S&&!D&&this.mode==='ticket'&&me&&me.tickets>=n;
    const cost=D?(n===10?g.side_cost10:g.side_cost1):S?(n===10?g.season_cost10:g.season_cost1):(n===10?g.dec_cost10:g.dec_cost1);return {n,tk,cost,can:!!(me&&(tk||me.coins>=cost))}},
  finish(){this.clear();const o=this.el(),L=LI();if(!o.querySelector('.gcards'))return;o.querySelectorAll('.gcard').forEach(c=>{c.style.animation='none';c.classList.add('open')});this.done=true;
    const bar=o.querySelector('.gbar');if(bar){const a=this.again();
      bar.innerHTML=`<button class="gok" data-gx="close">${L?'OK':'확인'}</button>${a.can?`<button class="gagain${this.kind==='season'?' vio':this.kind==='side'?' crim':''}" data-gx="again">${a.n===10?(L?'10 more':'10개 더'):(L?'One more':'1개 더')} · ${a.tk?decoderSvg('tki')+(L?a.n+' kept':'보유 '+a.n+'개'):COIN+fmtC(a.cost)}</button>`:''}`}},
  act(a){if(a==='skip'){this.finish();return}if(a==='close'){this.close();return}
    if(a==='again'){const x=this.again(),kind=this.kind;this.close();SHOP.decode(x.n,x.tk?'ticket':'coins',kind);return}},
  close(){this.clear();const o=$('gFx');if(o)o.remove();this.done=false}};
// odds and history windows over the shop
function gPop(title,html,cls){let o=$('gPop');if(o)o.remove();o=document.createElement('div');o.id='gPop';o.innerHTML=`<div class="gpw${cls?' '+cls:''}"><div class="awh"><b>${title}</b><button data-gp="x">×</button></div><div class="gpb">${html}</div></div>`;
  o.addEventListener('click',e=>{if(e.target===o||e.target.dataset.gp==='x')o.remove()});document.body.appendChild(o)}
function gPopRules(){const L=LI(),g=ACC.gc(),hi=g.bingo_hi,rows=[],S=bingoSim(hi+1);
  const r=(a,b,h)=>rows.push(`<tr${h?' class="h"':''}><td>${a}</td><td>${b}</td></tr>`);
  r(L?'The card':'빙고판','',1);r(L?'Numbers on the card':'판의 숫자',L?`25 of 0–${hi}`:`0~${hi} 중 25개`);r(L?'Lines':'줄',L?'12 (5 rows, 5 columns, 2 diagonals)':'12줄 (가로 5 · 세로 5 · 대각 2)');
  r(L?'Line rewards':'줄 보상',L?'one 근하신년 gun each (6 S, 6 A, placed at random)':'줄마다 근하신년 무기 1개 (S 6 · A 6, 자리는 무작위)');
  r(L?'A decoder':'해독기','',1);r(L?'Price':'가격',`${COIN}${fmtC(g.dec_cost1)} · 10${L?' for ':'개 '}${COIN}${fmtC(g.dec_cost10)}`);if(g.daily_free)r(L?'Free':'무료',L?'1 a day':'하루 1개');
  r(L?'Kept decoders':'보유 해독기',L?'from the season and sidearm cards, instead of coins':'시즌 · 보조무기 해독기 빙고에서 — 코인 대신 사용');
  r(L?'Number shown':'나오는 숫자',L?`one of 0–${hi} not drawn on this card yet (equal chance)`:`0~${hi} 중 이 판에서 아직 안 나온 숫자 (모두 같은 확률)`);
  r(L?'Hit chance, first decoder':'첫 해독기가 판에 맞을 확률',`${Math.round(25/(hi+1)*100)}%`);r(L?'Fragments':'해독 조각',L?`${g.dec_frag_min}–${g.dec_frag_max} with every decoder`:`해독기마다 ${g.dec_frag_min}~${g.dec_frag_max}개`);
  r(L?'On average (simulated)':'평균 (시뮬레이션)','',1);r(L?'First line':'첫 줄 완성',L?`about ${S.first} decoders`:`해독기 약 ${S.first}개`);r(L?'6 lines':'6줄',L?`about ${S.six}`:`약 ${S.six}개`);
  r(L?'The whole card (12 lines)':'판 전체 (12줄)',L?`about ${S.full} — never more than ${hi+1}`:`약 ${S.full}개 — 최대 ${hi+1}개`);
  gPop(L?'How the decoder bingo works':'해독기 빙고 규칙 · 확률',`<table class="grt">${rows.join('')}</table><ul class="grl">
    <li>${L?`A line whose gun you own pays instead: S ${fmtC(g.full_s_coins)} coins, A ${g.full_a_frags} fragments.`:`이미 가진 무기의 줄을 완성하면 대신 S는 ${fmtC(g.full_s_coins)} 코인, A는 조각 ${g.full_a_frags}개.`}</li>
    <li>${L?'A full card is replaced by a new one at once (the rest of a ten goes on it).':'25칸이 다 차면 바로 새 판이 깔려요 (10개 열기의 나머지는 새 판에).'}</li>
    <li>${L?`Reset: a new card, free (what was stamped is lost). Shuffle: the numbers not stamped yet change places, ${g.shuffle_free} a day.`:`초기화: 새 판으로 (무료, 찍힌 칸은 사라짐). 뒤섞기: 안 찍힌 숫자들 자리만 바뀜, 하루 ${g.shuffle_free}번.`}</li>
    <li>${L?`Fragments: an S gun of your choice for ${g.ex_s}, an A for ${g.ex_a} (fragment exchange).`:`조각 교환: 원하는 S 무기 ${g.ex_s}개, A 무기 ${g.ex_a}개.`}</li>
    <li>${L?'Every number is drawn on the server; the game only shows it.':'숫자는 전부 서버에서 뽑고, 게임 화면은 결과만 보여줘요.'}</li></ul>`,'wide')}
// the season (or sidearm) card's rules: its items (counted from gacha_config.season_lines / side_lines), price, odds and the simulated averages
function sPopRules(kind){const L=LI(),g=ACC.gc(),D=kind==='side',K=SHOP.bk(D?'side':'season'),hi=K.hi,lo=K.lo|0,N=hi-lo+1,S=bingoSim(N),rows=[],cnt={},items=(D?g.side_lines:g.season_lines)||[];
  const r=(a,b,h)=>rows.push(`<tr${h?' class="h"':''}><td>${a}</td><td>${b}</td></tr>`);
  for(const c of items)cnt[c]=(cnt[c]||0)+1;
  const guns=cardGuns(D?'side':'season'),many=guns.length>1,gname=guns.length?esc(seasonNames(L,guns)):D?(L?'the sidearm guns':'보조무기'):(L?'the season gun':'시즌 무기');
  const nm=c=>{const it=sItem(c),W=it.gun&&WPN[it.gun];return it.k==='gun'?`<b class="${D?'tP':'tE'}">${esc(W?W.n[L]:it.gun)}</b>`:it.k==='coins'?`${COIN}${fmtC(it.n)} ${L?'coins':'코인'}`
    :it.k==='frags'?`${FRAG}${L?'fragments':'해독 조각'} ×${it.n}`:`${decoderSvg('tki')}${L?'근하신년 decoders':'근하신년 해독기'} ×${it.n}`};
  r(L?'The card':'빙고판','',1);r(L?'Numbers on the card':'판의 숫자',L?`25 of ${lo}–${hi}`:`${lo}~${hi} 중 25개`);r(L?'Lines':'줄',L?'12 (5 rows, 5 columns, 2 diagonals)':'12줄 (가로 5 · 세로 5 · 대각 2)');
  r(L?'Line rewards (placed at random)':'줄 보상 (자리는 무작위)','',1);for(const c of Object.keys(cnt).sort((a,b)=>sRank(a)-sRank(b)))r(nm(c),L?`${cnt[c]} line${cnt[c]>1?'s':''}`:`${cnt[c]}줄`);
  if(items.length>12)r(L?'Each card':'판마다',L?`12 of these ${items.length} at random`:`이 ${items.length}개 중 무작위 12개`);
  r(D?(L?'A sidearm decoder':'보조무기 해독기'):(L?'A season decoder':'시즌 해독기'),'',1);r(L?'Price':'가격',`${COIN}${fmtC(K.c1)} · 10${L?' for ':'개 '}${COIN}${fmtC(K.c10)}`);r(L?'Free':'무료',L?'none':'없음');
  r(L?'Number shown':'나오는 숫자',L?`one of ${lo}–${hi} not drawn on this card yet (equal chance)`:`${lo}~${hi} 중 이 판에서 아직 안 나온 숫자 (모두 같은 확률)`);
  r(L?'Hit chance, first decoder':'첫 해독기가 판에 맞을 확률',`${Math.round(25/N*100)}%`);r(L?'Fragments':'해독 조각',L?`${K.f0}–${K.f1} with every decoder`:`해독기마다 ${K.f0}~${K.f1}개`);
  r(L?'On average (simulated)':'평균 (시뮬레이션)','',1);r(L?'First line':'첫 줄 완성',L?`about ${S.first} decoders`:`해독기 약 ${S.first}개`);
  r(`${gname} ${L?(many?'line (each)':'line'):(many?'줄 (각각)':'줄')}`,L?`about ${S.line} — never more than ${N}`:`약 ${S.line}개 — 최대 ${N}개`);
  r(L?'…in coins, opening tens':'…코인으로 (10개씩 열면)',`${COIN}${fmtC(Math.round(S.line*K.c10/1000)*100)}`);
  if(guns.length===2){r(L?'Both gun lines':'무기 두 줄 모두',L?`about ${S.two} — never more than ${N}`:`약 ${S.two}개 — 최대 ${N}개`);r(L?'…in coins, opening tens':'…코인으로 (10개씩 열면)',`${COIN}${fmtC(Math.round(S.two*K.c10/1000)*100)}`)}
  r(L?'6 lines':'6줄',L?`about ${S.six}`:`약 ${S.six}개`);r(L?'The whole card (12 lines)':'판 전체 (12줄)',L?`about ${S.full} — never more than ${N}`:`약 ${S.full}개 — 최대 ${N}개`);
  gPop(D?(L?'How the sidearm decoder works':'보조무기 해독기 규칙 · 확률'):(L?'How the season decoder works':'시즌 해독기 규칙 · 확률'),`<table class="grt">${rows.join('')}</table><ul class="grl">
    <li>${L?`A gun line (${gname}) whose gun you own already pays ${fmtC(K.own)} coins instead.`:`무기 줄(${gname})은 그 무기를 이미 가졌으면 대신 ${fmtC(K.own)} 코인.`}</li>
    ${D?`<li>${L?'The guns of this card are not sold in the shop, cannot be exchanged for fragments and cannot be gifts.':'이 판의 무기는 상점 판매 · 조각 교환 · 선물이 없어요.'}</li>`:''}
    <li>${L?'근하신년 decoders are kept: open them on the 근하신년 tab instead of paying (one or ten at a time).':'근하신년 해독기는 보유해 두었다가 근하신년 해독기 탭에서 코인 대신 열어요 (1개 · 10개씩).'}</li>
    <li>${L?'A full card is replaced by a new one at once (the rest of a ten goes on it).':'25칸이 다 차면 바로 새 판이 깔려요 (10개 열기의 나머지는 새 판에).'}</li>
    <li>${L?`Reset: a new card, free. Shuffle: the numbers not stamped yet change places, ${g.shuffle_free} a day — counted apart from the other cards.`:`초기화: 새 판으로 (무료). 뒤섞기: 안 찍힌 숫자들 자리만 바뀜, 하루 ${g.shuffle_free}번 (다른 판과 따로).`}</li>
    <li>${L?'Every number is drawn on the server; the game only shows it.':'숫자는 전부 서버에서 뽑고, 게임 화면은 결과만 보여줘요.'}</li></ul>`,'wide '+(D?'sd':'sz'))}
async function gPopHist(){const L=LI();gPop(L?'History':'획득 기록',`<div class="gload">${L?'Loading…':'불러오는 중…'}</div>`);let rows;
  try{rows=await ACC.history()}catch(e){const b=document.querySelector('#gPop .gpb');if(b)b.innerHTML=`<div class="sbm bad">${esc(ACC.errText(e))}</div>`;return}
  const b=document.querySelector('#gPop .gpb');if(!b)return;if(!rows||!rows.length){b.innerHTML=`<div class="gload">${L?'Nothing yet':'아직 기록이 없어요'}</div>`;return}
  const SRC={free:L?'free':'무료',exchange:L?'exchange':'교환',trans:L?'transcendence':'초월 교환',decode:L?'bingo':'빙고',ticket:L?'bingo · kept':'빙고 · 보유분',season:L?'season':'시즌',side:L?'sidearm':'보조무기'};
  b.innerHTML=`<table class="grt hist">${rows.map(x=>{const d=new Date(x.at),t=`${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    const W=WPN[x.gun_id],nm=esc(W?W.n[L]:(x.gun_id||''));
    const what=x.kind==='gun'?`<b class="${x.tier?'t'+x.tier:x.src==='side'?'tP':x.src==='trans'?'tX':'tE'}">${x.tier?`[${x.tier}] `:''}${nm}</b>`:x.kind==='coins'?`${COIN}${fmtC(x.amount)}${x.gun_id?` <small>(${nm} ${L?'owned':'보유'})</small>`:''}`
      :x.kind==='tickets'?`${decoderSvg('tki')}${L?'근하신년 decoder':'근하신년 해독기'} ×${x.amount}`:`${FRAG}×${x.amount}`;
    const src=SRC[x.src]||(L?'pouch':'복주머니');return `<tr${x.tier?' class="t'+x.tier+'"':''}><td>${t}</td><td>${what}${x.pity_hit?` <small>${L?'pity':'천장'}</small>`:''}</td><td><small>${src}</small></td></tr>`}).join('')}</table>`}

// ---------- the account window: sign in / sign up / password / my account ----------
const ACCW={mode:'in',msg:'',ok:false,busy:false,f:{email:'',pw:'',nick:'',cf:'',agree:false},
  open(mode){let o=$('accWin');if(!o){o=document.createElement('div');o.id='accWin';document.body.appendChild(o);
      o.addEventListener('click',e=>{if(e.target===o){this.close();return}const t=e.target.closest('[data-aa]');if(t)this.act(t.dataset.aa,t.dataset.v)});
      o.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'&&e.target.tagName==='INPUT'){e.preventDefault();this.act('go')}});
      o.addEventListener('keyup',e=>e.stopPropagation())}
    this.mode=mode||'in';this.msg='';this.ok=false;this.render();const i=o.querySelector('input');if(i)setTimeout(()=>{try{i.focus()}catch(e){}},30)},
  close(){const o=$('accWin');if(o)o.remove();try{LS.set('accSeen',1)}catch(e){}},
  grab(){const o=$('accWin');if(!o)return;for(const k of ['email','pw','nick','cf']){const i=o.querySelector('[name="'+k+'"]');if(i)this.f[k]=i.value}const a=o.querySelector('[name="agree"]');if(a)this.f.agree=a.checked},
  render(){const o=$('accWin');if(!o)return;this.grab();const L=LI(),m=this.mode,f=this.f,me=ACC.me;
    const inp=(k,type,ph,ac)=>`<input name="${k}" type="${type}" placeholder="${ph}" autocomplete="${ac}" value="${esc(f[k]||'')}" maxlength="${k==='nick'?16:120}">`;
    const tabs=m==='in'||m==='up'?`<div class="atabs"><button class="${m==='in'?'on':''}" data-aa="mode" data-v="in">${L?'Sign in':'로그인'}</button><button class="${m==='up'?'on':''}" data-aa="mode" data-v="up">${L?'Sign up':'회원가입'}</button></div>`:'';
    const OA=ACC.oauthList(),so=(m==='in'||m==='up')&&OA.length?`<div class="aor"><span>${L?'or':'또는'}</span></div><div class="aso">${OA.map(p=>`<button class="ao ${p}" data-aa="oauth" data-v="${p}">${p==='google'?'<b>G</b> '+(L?'Continue with Google':'Google로 계속'):p==='kakao'?'<b>K</b> '+(L?'Continue with Kakao':'카카오로 계속'):esc(p)}</button>`).join('')}</div>
      <p class="anote small"><span>${L?`Continuing with ${OA.length>1?'these':'it'} means you are 14 or older and agree to ${LEGAL.sent(1)}.`:`계속하면 만 14세 이상이며 ${LEGAL.sent(0)}에 동의하는 것으로 봐요.`}</span></p>`:'';
    let body='';
    if(m==='in')body=`<label>${L?'E-mail':'이메일'}${inp('email','email','you@example.com','email')}</label><label>${L?'Password':'비밀번호'}${inp('pw','password','••••••','current-password')}</label>
      <button class="ago" data-aa="go"${this.busy?' disabled':''}>${this.busy?'…':(L?'Sign in':'로그인')}</button><button class="alink" data-aa="mode" data-v="reset">${L?'Forgot your password?':'비밀번호를 잊었어요'}</button>${so}<p class="anote small center"><span>${LEGAL.links(L)}</span></p>`;
    else if(m==='up')body=`<label>${L?'Nickname':'닉네임'} <small>${L?'2–16 characters':'2~16자'}</small>${inp('nick','text',L?'Survivor':'생존자','nickname')}</label><label>${L?'E-mail':'이메일'}${inp('email','email','you@example.com','email')}</label>
      <label>${L?'Password':'비밀번호'} <small>${L?'6+ characters':'6자 이상'}</small>${inp('pw','password','••••••','new-password')}</label>
      <label class="achk"><input type="checkbox" name="agree"${f.agree?' checked':''}><span>${L?`I am 14 or older and agree to ${LEGAL.sent(1)}`:`만 14세 이상이며 ${LEGAL.sent(0)}에 동의해요`}</span></label>
      <button class="ago" data-aa="go"${this.busy?' disabled':''}>${this.busy?'…':(L?'Create account':'가입하기')}</button><p class="anote">${COIN} ${L?'3,000 coins to start with':'가입하면 3,000 코인을 드려요'}</p>${so}`;
    else if(m==='reset')body=`<p class="anote">${L?'We will mail you a link to set a new password.':'새 비밀번호를 정할 수 있는 링크를 메일로 보내 드려요.'}</p><label>${L?'E-mail':'이메일'}${inp('email','email','you@example.com','email')}</label>
      <button class="ago" data-aa="go"${this.busy?' disabled':''}>${this.busy?'…':(L?'Send the link':'링크 보내기')}</button><button class="alink" data-aa="mode" data-v="in">${L?'Back to sign in':'로그인으로 돌아가기'}</button>`;
    else if(m==='newpw')body=`<p class="anote">${L?'Choose a new password.':'새 비밀번호를 정해 주세요.'}</p><label>${L?'New password':'새 비밀번호'}${inp('pw','password','••••••','new-password')}</label>
      <button class="ago" data-aa="go"${this.busy?' disabled':''}>${this.busy?'…':(L?'Save':'저장')}</button>`;
    else if(m==='sent')body=`<p class="anote big">${this.msg?esc(this.msg):''}</p><button class="ago" data-aa="mode" data-v="in">${L?'OK':'확인'}</button>`;
    else if(m==='bye')body=`<p class="anote big">${this.msg?esc(this.msg):''}</p><button class="ago" data-aa="x">${L?'OK':'확인'}</button>`;
    else if(m==='nick'&&me)body=`<p class="anote big">${L?'Welcome! Pick the nickname other players will see.':'환영해요! 다른 플레이어에게 보일 닉네임을 정해 주세요.'}</p>
      <label>${L?'Nickname':'닉네임'} <small>${L?'2–16 characters':'2~16자'}</small>${inp('nick','text',esc(me.nickname),'nickname')}</label>
      <button class="ago" data-aa="nick"${this.busy?' disabled':''}>${this.busy?'…':(L?'Use this nickname':'이 닉네임으로 할게요')}</button>
      <button class="alink" data-aa="x">${L?'Keep '+esc(me.nickname)+' for now':esc(me.nickname)+' 그대로 쓸게요'}</button><p class="anote">${L?'You can change it any time under My account.':'닉네임은 나중에 내 계정에서 언제든 바꿀 수 있어요.'}</p>`;
    else if(m==='me'&&me)body=`<div class="ame"><div class="amc">${COIN}<b>${fmtC(me.coins)}</b><small>${L?'coins':'코인'}</small></div>
        <div class="ams"><span>${L?'Earned':'모은 코인'} <b>${fmtC(me.earned||0)}</b></span><span>${L?'Matches':'정산한 판'} <b>${fmtC(me.matches||0)}</b></span><span>${L?'Left today':'오늘 남은 보상'} <b>${fmtC(me.dayLeft==null?20000:me.dayLeft)}</b></span><span>${L?'Guns owned':'보유 총'} <b>${(me.owned?me.owned.size:0)+SHOP_FREE.length}</b></span><span>${L?'Fragments':'해독 조각'} <b>${fmtC(me.frags||0)}</b></span></div>
        ${me.email?`<p class="anote">${esc(me.email)}</p>`:''}</div>
      <label>${L?'Nickname':'닉네임'}${inp('nick','text',esc(me.nickname),'nickname')}</label><button class="ago" data-aa="nick"${this.busy?' disabled':''}>${L?'Change nickname':'닉네임 바꾸기'}</button>
      <div class="arow"><button class="alink" data-aa="shop">${L?'Open the shop':'상점 열기'}</button><button class="alink red" data-aa="out">${L?'Sign out':'로그아웃'}</button></div>
      <div class="arow afoot"><span>${LEGAL.links(L)}</span><button class="alink dim" data-aa="mode" data-v="del">${L?'Delete account':'회원 탈퇴'}</button></div>`;
    else if(m==='del'&&me){const pw=ACC.hasPw();body=`<p class="anote big">${L?'Deleting the account removes all of this for good:':'계정을 지우면 아래 것들이 모두 사라지고 되돌릴 수 없어요.'}</p>
      <ul class="adel">${(L?['Coins, fragments, decoders, owned guns and bingo cards','Level, records, achievements, titles, the hall of fame and the rankings','Friends, friend messages, gifts received and invites','Letters and coupons used, your inquiries and their answers']
        :['코인 · 조각 · 해독기 · 보유 무기 · 빙고판','레벨 · 기록 · 업적 · 칭호 · 명예의 전당 · 랭킹','친구 · 친구 메시지 · 받은 선물 · 초대','우편 · 쿠폰 사용 기록 · 내 문의와 답변']).map(x=>`<li>${x}</li>`).join('')}</ul>
      <p class="anote">${L?'Signing up again with the same e-mail starts from nothing. Records of what the operators did to the account stay, no longer tied to anyone.':'같은 이메일로 다시 가입해도 되살릴 수 없어요. 운영자가 계정에 한 조치 기록은 누구 것인지 알 수 없게 바뀐 채 남아요.'}</p>
      ${!pw&&!ACC.freshSign()?(()=>{const pv=ACC.provider(),pn=pv==='kakao'?(L?'Kakao':'카카오'):pv==='google'||!pv?'Google':pv;// (v6.72: the server deletes only within 10 minutes of a fresh sign-in)
        return `<p class="anote">${L?`For safety, sign in with ${pn} once more first — you then have 10 minutes to delete the account.`:`안전을 위해 ${pn}(으)로 한 번 더 로그인해야 탈퇴할 수 있어요 (로그인하고 10분 안에).`}</p>
      <button class="ago" data-aa="reauth">${L?`Sign in again with ${pn}`:`${pn}로 다시 로그인`}</button><button class="alink" data-aa="mode" data-v="me">${L?'Cancel':'취소'}</button>`})():`
      ${pw?`<label>${L?'Your password':'비밀번호 확인'}${inp('pw','password','••••••','current-password')}</label>`:''}
      <label><span>${L?'Type <b>DELETE</b> to confirm':'확인을 위해 <b>탈퇴</b>라고 적어 주세요'}</span><input name="cf" type="text" autocomplete="off" spellcheck="false" value="${esc(f.cf||'')}" maxlength="10"></label>
      <button class="ago red" data-aa="del"${this.busy?' disabled':''}>${this.busy?'…':(L?'Delete my account':'계정 지우기')}</button><button class="alink" data-aa="mode" data-v="me">${L?'Cancel':'취소'}</button>`}`}
    else body=`<p class="anote">${L?'Not signed in.':'로그인되어 있지 않아요.'}</p><button class="ago" data-aa="mode" data-v="in">${L?'Sign in':'로그인'}</button>`;
    const title={in:L?'Sign in':'로그인',up:L?'Sign up':'회원가입',reset:L?'Reset password':'비밀번호 재설정',newpw:L?'New password':'새 비밀번호',sent:L?'Check your mail':'메일을 확인해 주세요',me:L?'My account':'내 계정',nick:L?'Your nickname':'닉네임 정하기',del:L?'Delete account':'회원 탈퇴',bye:L?'Account deleted':'회원 탈퇴 완료'}[m]||'';
    o.innerHTML=`<div class="awin"><div class="awh"><b>${title}</b><button data-aa="x" aria-label="close">×</button></div>${tabs}<div class="awb">${body}
      ${m!=='sent'&&m!=='bye'&&this.msg?`<div class="amsg ${this.ok?'ok':'bad'}">${esc(this.msg)}</div>`:''}
      ${m==='in'||m==='up'?`<button class="aguest" data-aa="x">${L?'Play as a guest — free guns only':'게스트로 계속 — 기본 총만 사용'}</button>`:''}</div></div>`},
  act(a,v){const L=LI();
    if(a==='x'){this.close();return}
    if(a==='mode'){this.grab();this.mode=v;this.msg='';if(v==='del'){this.f.cf='';this.f.pw='';ACC.refreshUser().then(()=>{if(this.mode==='del'&&$('accWin'))this.render()})}this.render();return}
    if(a==='del'){this.grab();const f=this.f,word=String(f.cf||'').trim().toUpperCase();
      if(word!=='탈퇴'&&word!=='DELETE'){this.msg=L?'Type DELETE in the box to confirm':'확인 칸에 「탈퇴」라고 적어 주세요';this.ok=false;this.render();return}
      const pw=ACC.hasPw()?String(f.pw||''):null;if(pw!=null&&!pw){this.msg=L?'Enter your password':'비밀번호를 적어 주세요';this.ok=false;this.render();return}
      this.run(async()=>{try{await ACC.deleteAccount(pw)}catch(e){if(/reauth/.test(e&&e.message||'')&&pw==null)ACC.ls('qz_signAt',0);throw e}this.f={email:'',pw:'',nick:'',cf:'',agree:false};this.mode='bye';
        this.msg=L?'Your account is deleted. Thank you for playing.':'계정을 지웠어요. 그동안 함께해 줘서 고마워요.';AU.play('uiok',{vol:.4})});return}
    if(a==='oauth'){ACC.oauth(v);return}
    if(a==='reauth'){ACC.oauth(ACC.provider()||'google','del');return}
    if(a==='shop'){this.close();SHOP.open();return}
    if(a==='out'){ACC.signOut().then(()=>{this.close();shopToast(L?'Signed out':'로그아웃했어요')});return}
    if(a==='nick'){this.grab();const from=this.mode;if((this.f.nick||'').trim().length<2){this.msg=L?'Pick a nickname (2–16 characters)':'닉네임을 2~16자로 정해 주세요';this.ok=false;this.render();return}
      this.run(async()=>{const n=await ACC.setNick(this.f.nick);this.f.nick='';if(from==='nick'){this.close();shopToast((L?'Nickname: ':'닉네임: ')+n);AU.play('uiok',{vol:.5});return}this.msg=(L?'Nickname: ':'닉네임 변경 — ')+n;this.ok=true});return}
    if(a==='go'&&(this.mode==='nick'||this.mode==='me')){this.act('nick');return}// (Enter in the nickname box)
    if(a==='go'){this.grab();const f=this.f,m=this.mode;
      if((m==='in'||m==='up'||m==='reset')&&!/^\S+@\S+\.\S+$/.test(f.email.trim())){this.msg=L?'Enter your e-mail address':'이메일을 입력해 주세요';this.ok=false;this.render();return}
      if((m==='in'||m==='up'||m==='newpw')&&(f.pw||'').length<6){this.msg=L?'Use a password of at least 6 characters':'비밀번호는 6자 이상이에요';this.ok=false;this.render();return}
      if(m==='up'&&(f.nick||'').trim().length<2){this.msg=L?'Pick a nickname (2–16 characters)':'닉네임을 2~16자로 정해 주세요';this.ok=false;this.render();return}
      if(m==='up'&&!f.agree){this.msg=L?'Tick the box: 14 or older, and agreeing to the terms and the privacy policy':'만 14세 이상 · 약관 동의에 체크해 주세요';this.ok=false;this.render();return}
      if(m==='in')this.run(async()=>{await ACC.signIn(f.email.trim(),f.pw);this.done(L?'Welcome back, ':'어서 와요, ')});
      else if(m==='up')this.run(async()=>{const r=await ACC.signUp(f.email.trim(),f.pw,f.nick.trim());
        if(r.confirm){this.mode='sent';this.msg=L?'We sent a confirmation link to '+f.email.trim()+'. Open it to finish signing up — you will come back here signed in.':f.email.trim()+' 로 인증 메일을 보냈어요. 메일의 링크를 누르면 로그인된 상태로 돌아와요.'}
        else this.done(L?'Welcome, ':'환영해요, ')});
      else if(m==='reset')this.run(async()=>{await ACC.recover(f.email.trim());this.mode='sent';this.msg=L?'If that e-mail has an account, a reset link is on its way.':'가입된 이메일이면 재설정 링크가 곧 도착해요.'});
      else if(m==='newpw')this.run(async()=>{await ACC.newPassword(f.pw);this.f.pw='';this.mode='me';this.msg=L?'Password changed':'비밀번호를 바꿨어요';this.ok=true});
      return}},
  // v6.66: an account that never picked a nickname (Google / Kakao start as 생존자 + 4 digits) is asked for one, once on this browser
  nickAsk(){const me=ACC.signed()&&ACC.me,uid=ACC.ses&&ACC.ses.user&&ACC.ses.user.id;if(!me||!uid||!/^생존자\d{4,8}$/.test(me.nickname||''))return false;// (v6.74: 6 or 8 digits once the 4-digit ones run out)
    const A0=ACC.ls('qz_nickAsk'),A=Array.isArray(A0)?A0:[];if(A.includes(uid))return false;A.push(uid);ACC.ls('qz_nickAsk',A.slice(-20));this.f.nick='';this.open('nick');return true},
  done(hi){const me=ACC.me;this.f.pw='';this.close();if(me){shopToast(hi+me.nickname+' · '+fmtC(me.coins)+(LI()?' coins':' 코인'));AU.play('uiok',{vol:.5})}},
  async run(fn){if(this.busy)return;this.busy=true;this.msg='';this.render();try{await fn()}catch(e){this.msg=ACC.errText(e);this.ok=false}this.busy=false;if($('accWin'))this.render()}};
// a short line on screen: in a match the HUD's note, in the lobby a toast
function shopToast(t){if(G.st!=='menu'&&HUD.note){HUD.note(t,2.4);return}let el=$('qzToast');if(!el){el=document.createElement('div');el.id='qzToast';document.body.appendChild(el)}
  el.textContent=t;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),2600)}
addEventListener('keydown',e=>{if(e.code!=='Escape')return;const stop=()=>{e.stopPropagation();e.preventDefault()};
  if($('gFx')){if(GFX.done)GFX.close();else GFX.finish();stop()}else if($('gPop')){$('gPop').remove();stop()}else if($('accWin')){ACCW.close();stop()}else if($('shopWin')){SHOP.close();stop()}},true);

// ---------- the lobby: coins, sign-in and the shop button ----------
function shopLobby(){const top=document.querySelector('#menu .lobTop');if(!top)return;const L=LI(),me=ACC.me,signed=ACC.signed();
  if(signed){const nb=top.querySelector('.prof b');if(nb)nb.textContent=me.nickname}
  const old=top.querySelector('.accChip');if(old)old.remove();
  if(ACC.on){const ch=document.createElement('div');ch.className='accChip';
    ch.innerHTML=signed||(me&&me.cached)?`<button class="acoin" data-act="shop" title="${L?'Coins':'코인'}">${COIN}<b>${fmtC(me.coins)}</b></button><button class="aname" data-act="acc" title="${L?'My account':'내 계정'} · ${esc(me.nickname)}">${SVG_USER}<span>${esc(me.nickname)}</span></button>`
      :`<button class="alog" data-act="acc">${SVG_USER}<span>${L?'Sign in':'로그인'}</span></button>`;
    const pf=top.querySelector('.prof');if(pf)pf.after(ch);else top.prepend(ch)}
  const tb=top.querySelector('.tbtns');if(tb&&!tb.querySelector('.tshop')){const b=document.createElement('button');b.className='tshop';b.dataset.act='shop';b.innerHTML=SVG_CART+`<span>${L?'Shop':'상점'}</span>`;tb.prepend(b)}
  const sb=tb&&tb.querySelector('.tshop');if(sb){const dot=sb.querySelector('.dot'),want=signed&&me.freeToday&&ACC.gc().daily_free;if(want&&!dot){const d=document.createElement('i');d.className='dot';d.title=L?'A free decoder today':'오늘의 무료 해독기';sb.appendChild(d)}else if(!want&&dot)dot.remove()}}

// ---------- in a match: weapons are free, but only the guns you own (and the free set) ----------
// (the shooting range lends every gun: try before you buy; the Event Horizon has its own rule, loadout.js ehOK)
function shopLocked(P,id){if(id==='bhole'||!ACC.on||!P||G.mode==='range')return false;const W=WPN[id];if(!W||!W.model||W.kind==='nade')return false;if(ACC.owns(id))return false;
  if(P.inv[W.slot]===id)return false;// already in hand (picked up): ammo for it is fine
  if(W.ny&&P.nyFree>0)return false;// the 근하신년 free pick
  return true}

// ---------- after a match: the coins ----------
function shopMatchStats(){const P=G.player,A=G.actors.filter(a=>!a.scen&&!a.rg),best=A.slice().sort((a,b)=>(b.score||0)-(a.score||0))[0];
  return {mode:G.mode,rounds:G.round|0,kills:P.kills|0,infects:P.infects|0,damage:P.dmgDealt||0,won:(G.score&&G.score[TH]>G.score[TZ]),mvp:best===P&&(P.score||0)>0,
    stage:typeof SCEN!=='undefined'?(SCEN.best||SCEN.stage||0):0,cleared:typeof SCEN!=='undefined'&&!!SCEN.win,score:Math.round(P.score||0),hs:P.hsKills|0,
    // an episode (v6.20): which one, the difficulty, the clear time, lives lost and the escape bonus (records and first-clear rewards);
    // the match's id (v6.24: the hall of fame's first-clear team, hof.js)
    ...(typeof EP!=='undefined'&&EP.on&&EP.res?{ep:ACC.epSrv(EP.id),diff:G.diff|0,time:EP.res.time|0,lives:EP.res.lost|0,bonus:!!EP.res.bonus,match:G.mt||''}:{}),
    tok:G.mtok||''}}// (v6.74: the match's ticket, shopTicket)
function shopReward(){const P=G.player,res=$('results');if(!P||!res||!ACC.on||G.mode==='range')return;const L=LI();
  const box=document.createElement('div');box.className='coinRes';const put=()=>{const fs=res.querySelector('.finalScore');if(fs)fs.after(box);else res.prepend(box)};
  if(G.coinDone){if(G.coinBox){box.innerHTML=G.coinBox;put();if(G.misBox)misResPut(box,G.misBox)}return}G.coinDone=true;// shown again, never paid twice
  if(!ACC.signed())box.innerHTML=`${COIN}<span>${L?'Sign in to earn coins from every match and buy guns for good.':'로그인하면 매치마다 코인을 받고 총을 영구 구매할 수 있어요.'}</span><button data-act="acc">${L?'Sign in':'로그인'}</button>`;
  else{box.innerHTML=`${COIN}<span>${L?'Counting your coins…':'코인 정산 중…'}</span>`;
    ACC.claim(shopMatchStats()).then(r=>{const M=P.nyM;if(M&&M.some(v=>v>0))ACC.nyAdd(M).then(x=>{const ad=x.added||[],got=ad.reduce((a,v)=>a+(v|0),0),want=M.reduce((a,v)=>a+(v|0),0);if(got>0)shopToast((L?'Letters kept: ':'인벤토리에 저장: ')+NY_CH.map((c,i)=>ad[i]?c+(ad[i]>1?'×'+ad[i]:''):'').join(' '));if(x.day_left===0&&got<want)setTimeout(()=>shopToast(L?`That's today's letters (${x.day_cap|0} a day) — more tomorrow`:`오늘 받을 수 있는 글자를 다 받았어요 (하루 ${x.day_cap|0}개) — 내일 또 모아요`),got>0?2600:0)}).catch(e=>console.warn('letters',e));P.nyM=[0,0,0,0];
      G.coinBox=box.innerHTML=`${COIN}<span><b>+${fmtC(r.got)}</b> ${L?'coins':'코인'}${r.bonus?` <small>(${L?'first match today':'오늘 첫 판'} +${fmtC(r.bonus)})</small>`:''}${r.day_left<=0?` <small>${L?'— daily limit reached':'— 오늘 받을 수 있는 만큼 다 받았어요'}</small>`:''}${r.xp_got?` <small>· +${fmtC(r.xp_got)} XP</small>`:''}${r.ep_first?` <small class="epf">· ${L?'first clear':'첫 클리어'} +${fmtC(r.ep_first)}${r.ep_tickets?` · ${L?'decoder':'해독기'} +${r.ep_tickets}`:''}</small>`:''}</span><span class="crh">${L?'You have':'보유'} ${COIN}${fmtC(r.coins)}</span><button data-act="shop">${L?'Shop':'상점'}</button>`;AU.play('buy',{vol:.6});
      const mh=misResHtml(r.missions);if(mh){G.misBox=mh;misResPut(box,mh)}})
      .catch(e=>{G.coinBox=box.innerHTML=`${COIN}<span>${esc(ACC.errText(e))}</span>`})}
  put()}

// ---------- v6.74: the match's ticket ----------
// As a match starts (signed in, a mode that pays) the server hands out a ticket for it (ACC.matchStart → qz_match_start: the mode, the
// scenario's chapter and difficulty, the match's id G.mt); the match's claim and its rounds' claims take it back (tok), and the server
// counts the numbers for the minutes the match ran by it. A database before v6.74 has none (the claims go without one, as before).
function shopTicket(cfg){G.mtok='';const m=G.mode;if(!ACC.on||!ACC.signed()||!/^(orig|mut|tdm|ffa|bomb|race|scen)$/.test(m||''))return;
  const key=G.mt,o={mode:m,ep:m==='scen'?ACC.epSrv(cfg&&cfg.ep|0):0,diff:G.diff|0,mt:G.mt||''};
  const ask=tries=>ACC.matchStart(o).then(t=>{if(G.mt===key&&G.st!=='menu')G.mtok=t||''})
    .catch(e=>{if(tries>0&&/too_soon|network|Failed to fetch/i.test(String(e&&e.message||e)))setTimeout(()=>{if(G.mt===key&&G.st!=='menu'&&!G.mtok)ask(tries-1)},2500)});
  ask(2)}

// ---------- after every round: that round's coins and xp (v6.17) ----------
// the round's own numbers (kills, infections, damage since it began: a.r0), the side the player ended it on, and whether he was its
// human or zombie MVP (picked the way the round card picks them, ui.js). The server works the coins out (qz_round_claim).
function shopRoundStats(win){const P=G.player,r0=P.r0||{},d=(v,b)=>Math.max(0,(v||0)-(b||0)),A=G.actors.filter(a=>a.r0&&!a.scen&&!a.rg);
  const R=A.map(a=>({a,k:d(a.kills,a.r0.k),i:d(a.infects,a.r0.i),dm:d(a.dmgDealt,a.r0.dm)})),hs=r=>r.dm+r.k*400,zs=r=>r.i*1000+r.k*300+r.dm*.2;
  const hm=R.filter(r=>!(r.a.team===TZ&&r.a.host)).sort((p,q)=>hs(q)-hs(p))[0],zm=R.filter(r=>r.a.team===TZ&&r.i>0).sort((p,q)=>zs(q)-zs(p))[0];
  return {mode:G.mode,round:G.round|0,kills:d(P.kills,r0.k),infects:d(P.infects,r0.i),damage:Math.round(d(P.dmgDealt,r0.dm)),won:P.team===win,survived:!!P.survived,
    mvp:!!((hm&&hm.a===P&&(hm.dm>0||hm.k>0))||(zm&&zm.a===P)),score:Math.round(d(P.score,r0.sc)),hs:d(P.hsKills,r0.hs),tok:G.mtok||''}}
// a line on the round card (or a note when the card has gone): counting… → +coins · +XP
function shopRoundReward(win){const P=G.player;if(!P||!ACC.on||!ACC.signed()||ACC.noRound||G.mode==='range'||G.mode==='scen'||!P.r0)return;
  const n=G.round|0;if(G.roundPaid===n)return;G.roundPaid=n;const L=LI(),st=shopRoundStats(win);
  const line=h=>{const el=$('hRRes');if(!el||el.classList.contains('off'))return false;let r=el.querySelector('.rrw');if(!h){if(r)r.remove();return true}
    if(!r){r=document.createElement('div');r.className='rrw';el.appendChild(r)}r.innerHTML=h;return true};
  line(`${COIN}<span>${L?'Counting the round reward…':'라운드 보상 정산 중…'}</span>`);
  ACC.roundClaim(st).then(r=>{if(!r){line('');return}
    const h=`${COIN}<span><b>+${fmtC(r.got)}</b> ${L?'coins':'코인'}${r.xp_got?` · <b>+${fmtC(r.xp_got)}</b> XP`:''}</span><small>${L?`Round ${n} reward`:`${n}라운드 보상`}${r.day_left<=0?(L?' · daily limit reached':' · 오늘 한도 다 받음'):''}</small>`;
    if(!line(h))HUD.note(`${L?'Round reward':'라운드 보상'} +${fmtC(r.got)} ${L?'coins':'코인'}${r.xp_got?` · +${fmtC(r.xp_got)} XP`:''}`,2.6);AU.play('buy',{vol:.45})})
  .catch(e=>{if(/too_soon|no_rounds/.test(String(e&&e.message||e))){line('');return}line(`${COIN}<span>${esc(ACC.errText(e))}</span>`)})}

// ---------- hooks ----------
(function(){
  const bt=UI.buildTitle;UI.buildTitle=function(){const r=bt.apply(this,arguments);try{shopLobby()}catch(e){console.error(e)}return r};
  const act0=UI.act;UI.act=function(a,v,el){
    if(a==='shop'){SHOP.open();return}
    if(a==='acc'){ACCW.open(ACC.signed()?'me':'in');return}
    if(a==='buylk'){const W=WPN[v],p=ACC.price(v),L=LI(),n=W?W.n[L]:'';HUD.note(W&&W.crate?`${n}: ${L?'only from supply crates (an account that owns one can pick it here)':'보급상자에서만 나와요 (계정에 있으면 여기서 고를 수 있어요)'}`:p&&p.tier?`${n}: ${L?'only from the 근하신년 decoder bingo (lobby shop)':'근하신년 해독기 빙고에서만 얻을 수 있어요 (로비 상점)'}`
      :p&&!p.sold&&seasonGun(v)?`${n}: ${L?'only from its line on the season decoder card (lobby shop)':'시즌 해독기 빙고에서만 얻을 수 있어요 (로비 상점)'}`
      :p&&!p.sold&&sideGun(v)?`${n}: ${L?'only from its line on the sidearm decoder card (lobby shop)':'보조무기 해독기 빙고에서만 얻을 수 있어요 (로비 상점)'}`
      :`${n}: ${L?'buy it in the shop first':'상점에서 먼저 사야 해요'} (${fmtC(p&&p.price)} ${L?'coins':'코인'})`,2.2);AU.play('dry',{vol:.5});return}
    return act0.call(this,a,v,el)};
  const rb=UI.renderBuy;UI.renderBuy=function(){const r=rb.apply(this,arguments);const P=G.player;if(!ACC.on||!P)return r;const L=LI();
    for(const el of document.querySelectorAll('#buy .bi[data-v]')){const id=el.dataset.v;if(!shopLocked(P,id))continue;
      el.classList.add('lk','na');el.dataset.act='buylk';const c=el.querySelector('.c');if(c)c.innerHTML=shopLockTag(id)}
    const h=document.querySelector('#buy h3');if(h&&!h.querySelector('.bcoin')){const s=document.createElement('span');s.className='bcoin';s.innerHTML=ACC.signed()?`${COIN}${fmtC(ACC.me.coins)} · ${L?'locked guns are bought in the lobby shop':'잠긴 총은 로비 상점에서 구매'}`:(L?'Guest: free guns only — sign in to unlock more':'게스트: 기본 총만 — 로그인하면 더 많은 총');h.appendChild(s)}
    return r};
  const bi=Main.buyItem;Main.buyItem=function(id){const P=G.player;if(shopLocked(P,id)){UI.act('buylk',id);return}return bi.call(this,id)};
  const sr=UI.showResults;UI.showResults=function(){const r=sr.apply(this,arguments);try{shopReward()}catch(e){console.error(e)}return r};
  const sm=startMatch;startMatch=function(cfg){G.coinDone=false;G.coinBox=null;G.misBox=null;G.roundPaid=0;G.mtok='';const r=sm(cfg);
    // (v6.74: once every module has set the match up — the match id G.mt among it — its ticket is asked for)
    Promise.resolve().then(()=>{try{shopTicket(cfg)}catch(e){console.error(e)}});return r};
  const er=endRound;endRound=function(win){const s0=G.st,r=er.apply(this,arguments);try{if(s0!==G.st&&G.st==='end')shopRoundReward(win)}catch(e){console.error(e)}return r};
  // the signed-in nickname is the name other players see
  const mn=myName;myName=function(){return ACC.signed()&&ACC.me.nickname||mn()};
  ACC.sub(()=>{if(G.st==='menu'&&UI.open==='menu')UI.buildTitle();if($('shopWin'))SHOP.render();if($('accWin')&&!ACCW.busy)ACCW.render()});
  ACC.init().then(kind=>{const L=LI();
    if(kind==='recovery'){ACCW.open('newpw');return}
    if(kind&&ACC.signed()&&ACC.takeAfter()==='del'){setTimeout(()=>{if(ACC.signed())ACCW.open('del')},800);return}// (v6.72: back from signing in again to delete the account)
    if(ACC.lastErr){ACCW.open('in');ACCW.msg=ACC.lastErr;ACCW.ok=false;ACCW.render();return}
    if(ACC.signed()&&/^생존자\d{4,8}$/.test(ACC.me.nickname||'')){const t0=Date.now(),go=()=>{if(!ACC.signed())return;if($('nbWin')||$('accWin')||G.st!=='menu'||UI.open!=='menu'){if(Date.now()-t0<60e3)setTimeout(go,700);return}if(!ACCW.nickAsk()&&kind)shopToast((L?'Welcome, ':'환영해요, ')+ACC.me.nickname)};setTimeout(go,500);return}
    if(ACC.signed()&&kind){shopToast((L?'Welcome, ':'환영해요, ')+ACC.me.nickname);return}
    // first visit: offer to sign in once the lobby is on screen (the boot can still be painting characters)
    let seen=null;try{seen=LS.get('accSeen',null)}catch(e){}
    const ask=n=>{if($('nbWin')||$('pwaWin')){if(n<120)setTimeout(()=>ask(n+1),700);return}if(ACC.ses||ACC.signed()||$('accWin')||$('shopWin')||$('rkWin')||G.st!=='menu')return;if(UI.open==='menu')ACCW.open('in');else if(n<60)setTimeout(()=>ask(n+1),700)};
    if(ACC.on&&!ACC.signed()&&!seen)setTimeout(()=>ask(0),700)}).catch(e=>console.error(e));
})();
