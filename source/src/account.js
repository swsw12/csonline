'use strict';
// ============ Accounts (Supabase): sign-in, coins, the guns you own ============
// No library: Supabase's auth (GoTrue, /auth/v1) and data (PostgREST, /rest/v1) endpoints are called with fetch.
// The project's URL and key (SB) live in sb.js since v6.42 (the admin page, admin.html, is built with the same file).
// v6.67: the terms and the privacy policy, pages of their own next to the game (build.py makes them from legal/; ver = their effective date)
const LEGAL={terms:'terms.html',privacy:'privacy.html',ver:'%LEGAL_VER%',
  a(f,t,L){return `<a href="${f}${L?'?lang=en':''}" target="_blank" rel="noopener">${t}</a>`},
  links(L){return this.a(this.terms,L?'Terms':'이용약관',L)+' · '+this.a(this.privacy,L?'Privacy':'개인정보처리방침',L)},// (a footer's two links)
  sent(L){return L?'the '+this.a(this.terms,'Terms',1)+' and the '+this.a(this.privacy,'Privacy Policy',1):this.a(this.terms,'이용약관',0)+'과 '+this.a(this.privacy,'개인정보처리방침',0)}};// (the two in a sentence)
const ACC={on:!!(SB.url&&SB.key),ses:null,me:null,bingo:null,season:null,side:null,mis:null,prices:null,gcfg:null,ready:false,busy:false,subs:[],lastErr:'',
  // ---- plumbing ----
  ls(k,v){try{if(v===undefined)return JSON.parse(localStorage.getItem(k)||'null');if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}},
  sub(fn){this.subs.push(fn)},
  emit(){for(const f of this.subs)try{f()}catch(e){console.error(e)}},
  async req(method,path,body,auth){const h={apikey:SB.key,'Content-Type':'application/json'};if(auth&&this.ses)h.Authorization='Bearer '+this.ses.access_token;// the key itself only rides on apikey (publishable keys are not JWTs)
    let r;try{r=await fetch(SB.url.replace(/\/+$/,'')+path,{method,headers:h,body:body==null?undefined:JSON.stringify(body)})}catch(e){const er=new Error('network');er.net=1;throw er}
    const tx=await r.text();let j=null;try{j=tx?JSON.parse(tx):null}catch(e){j=null}
    if(!r.ok){const er=new Error((j&&(j.msg||j.error_description||j.message||j.error))||('HTTP '+r.status));er.status=r.status;er.code=j&&(j.error_code||j.code);throw er}
    return j},
  // a call that needs the player: refreshes the token first when it is about to run out, retries once after a 401
  async call(method,path,body){await this.fresh();try{return await this.req(method,path,body,true)}catch(e){if(e.status===401&&this.ses){await this.refresh();return await this.req(method,path,body,true)}throw e}},
  rpc(name,args){return this.call('POST','/rest/v1/rpc/'+name,args||{})},
  // fire and forget, and it survives the page closing (keepalive): for the last word on pagehide
  beacon(name,args){if(!this.on||!this.ses)return;try{fetch(SB.url.replace(/\/+$/,'')+'/rest/v1/rpc/'+name,{method:'POST',keepalive:true,headers:{apikey:SB.key,'Content-Type':'application/json',Authorization:'Bearer '+this.ses.access_token},body:JSON.stringify(args||{})}).catch(()=>{})}catch(e){}},
  setSes(s){if(!s||!s.access_token){this.ses=null;this.ls('qz_ses',null);return}
    this.ses={access_token:s.access_token,refresh_token:s.refresh_token,expires_at:s.expires_at||Math.floor(Date.now()/1000)+(+s.expires_in||3600),user:s.user||this.ses&&this.ses.user||null};this.ls('qz_ses',this.ses)},
  async fresh(){const s=this.ses;if(s&&s.expires_at-Date.now()/1000<90)await this.refresh()},
  async refresh(){const s=this.ses;if(!s||!s.refresh_token)return;try{this.setSes(await this.req('POST','/auth/v1/token?grant_type=refresh_token',{refresh_token:s.refresh_token}))}
    catch(e){if(!e.net){this.setSes(null);this.me=null;this.emit()}throw e}},
  here(){return /^https?:/.test(location.protocol)?location.origin+location.pathname:''},
  // ---- start-up: a session coming back from Google / Kakao / an e-mail link, or the one saved last time ----
  async init(){if(!this.on){this.ready=true;this.emit();return}
    const c=this.ls('qz_me');if(c&&c.owned)this.me={...c,owned:new Set(c.owned),cached:1};// last known state, so the lobby is right at once
    let kind=null;const hs=location.hash||'';
    if(/access_token=|error=/.test(hs)){const q=new URLSearchParams(hs.slice(1));
      if(q.get('error')){this.lastErr=q.get('error_description')||q.get('error')}
      else{this.setSes({access_token:q.get('access_token'),refresh_token:q.get('refresh_token'),expires_at:+q.get('expires_at')||0,expires_in:q.get('expires_in')});kind=q.get('type')||'oauth';this.signedNow()}// (an e-mail link says its type; back from Google / Kakao: none)
      try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}}
    else this.ses=this.ls('qz_ses');
    this.loadPrices();this.loadGacha();this.loadProviders();
    if(this.ses){try{await this.fresh();if(!this.ses.user)this.ses.user=await this.req('GET','/auth/v1/user',null,true);await this.loadMe()}catch(e){if(!e.net){this.setSes(null);this.me=null}}}
    else this.me=null;
    this.ready=true;this.emit();return kind},
  async loadPrices(){try{const r=await this.req('GET','/rest/v1/gun_prices?select=gun_id,price,free,sold,tier',null,false);if(Array.isArray(r)&&r.length){const P={};for(const x of r)P[x.gun_id]=x;this.prices=P;this.emit()}}catch(e){}},
  async loadGacha(){try{const r=await this.req('GET','/rest/v1/gacha_config?select=*',null,false);if(Array.isArray(r)&&r[0]){this.gcfg=r[0];this.emit()}}catch(e){}},
  // v6.66: which of SB.oauth's sign-in buttons show: the providers switched on in the project (its public auth settings,
  // /auth/v1/settings, asked once at start); when that cannot be asked (offline, an old project) the list as SB.oauth has it
  provs:null,
  async loadProviders(){const want=(SB.oauth||[]).slice();if(!this.on||!want.length){this.provs=[];return this.provs}
    try{const r=await this.req('GET','/auth/v1/settings',null,false),ex=r&&r.external;this.provs=ex&&typeof ex==='object'?want.filter(p=>ex[p]===true):want}catch(e){this.provs=want}
    this.emit();return this.provs},
  oauthList(){return this.provs||[]},
  async loadMe(){const r=await this.rpc('qz_me');this.me={nickname:r.nickname,coins:r.coins,earned:r.earned,matches:r.matches,dayLeft:r.day_left,owned:new Set(r.owned||[]),
      frags:r.fragments|0,tfrags:r.tfrags|0,pity:r.pity|0,tickets:r.tickets|0,fcode:r.fcode||'',giftsNew:r.gifts_new|0,friendReq:r.friend_req|0,ny:Array.isArray(r.ny)?r.ny.map(v=>v|0):[0,0,0,0],sTickets:r.season_tickets|0,freeToday:!!r.free_today,rec:r.rec||null,eps:Array.isArray(r.eps)?r.eps:[],firsts:Array.isArray(r.firsts)?r.firsts.map(v=>v|0):[],ref:r.ref||null,invN:0,email:this.ses&&this.ses.user&&this.ses.user.email||'',admin:!!r.admin,ban:r.ban||null,mailN:r.mail_new|0,gunNew:r.gun_new|0,inqN:r.inq_new|0,
      // (v6.57: the title worn as everyone sees it — undefined on a database from before it —, as set (null: automatic), achievement rewards waiting)
      title:r.title===undefined?undefined:(r.title||null),titleSet:r.title_set||null,achReady:r.ach_ready|0,
      tut:r.tut===undefined?undefined:!!r.tut,// (v6.70: 기초 훈련 finished and its reward taken — undefined on a database from before it)
      epmax:r.epmax|0};// (v6.92: the last chapter the server's records take — 0 on a database from before chapter 6: chapters 1–5)
    this.ls('qz_me',{nickname:this.me.nickname,coins:this.me.coins,owned:[...this.me.owned],rec:this.me.rec,eps:this.me.eps,firsts:this.me.firsts,title:this.me.title,email:this.me.email,uid:this.ses&&this.ses.user&&this.ses.user.id});this.emit();
    this.importRec();this.loadMissions().catch(()=>{});return this.me},
  // the record this browser kept before accounts goes to the first account that signs in here (once; the server clamps it)
  async importRec(){const me=this.me,uid=this.ses&&this.ses.user&&this.ses.user.id;if(!me||!me.rec||me.rec.imported||!uid||this.ls('qz_recFor'))return;
    const L=this.ls('qz_rec');if(!L||!(L.g>0))return;this.ls('qz_recFor',uid);
    try{const r=await this.rpc('qz_import_rec',{p_games:L.g|0,p_kills:L.k|0,p_infects:L.inf|0,p_best:L.best|0,p_xp:L.xp|0});me.rec=r.rec;this.ls('qz_me',{...this.ls('qz_me'),rec:me.rec});this.emit()}
    catch(e){if(!/already_imported/.test(e.message))this.ls('qz_recFor',null)}},// not done (offline, or the database not updated yet): try again next time
  // ---- the player's actions ----
  async signIn(email,pw){const s=await this.req('POST','/auth/v1/token?grant_type=password',{email,password:pw},false);this.setSes(s);this.signedNow();await this.loadMe();return this.me},
  // (v6.74: a nickname is one player's — asked first, so the form can say so; a database before v6.74 cannot be asked)
  async nickFree(n){try{return await this.req('POST','/rest/v1/rpc/qz_nick_free',{p_nick:n},false)}catch(e){if(e.net||/Could not find the function|PGRST202/i.test((e.message||'')+' '+(e.code||'')))return null;throw e}},
  async signUp(email,pw,nick){const f=await this.nickFree(nick);if(f&&!f.ok)throw new Error(f.why==='nick_short'?'nick_short':'nick_taken');
    const q=this.here()?'?redirect_to='+encodeURIComponent(this.here()):'';
    const s=await this.req('POST','/auth/v1/signup'+q,{email,password:pw,data:{nickname:nick,terms:LEGAL.ver}},false);// (terms: the version of the terms agreed to)
    if(s&&s.access_token){this.setSes(s);this.signedNow();await this.loadMe();return {ok:1}}return {confirm:1}},// e-mail confirmation is on: the link brings the player back signed in
  // (Google: the account picker every time — a shared computer, a PC방, never signs the next player in as the last one)
  oauthUrl(p){return SB.url.replace(/\/+$/,'')+'/auth/v1/authorize?provider='+encodeURIComponent(p)+(this.here()?'&redirect_to='+encodeURIComponent(this.here()):'')+(p==='google'?'&prompt=select_account':'')},
  // after: what to open again once back signed in (v6.72: 'del' — 회원 탈퇴 asks for a fresh sign-in)
  oauth(p,after){if(after)this.ls('qz_after',{k:after,at:Date.now()});location.assign(this.oauthUrl(p))},
  takeAfter(){const a=this.ls('qz_after');if(a)this.ls('qz_after',null);return a&&typeof a.k==='string'&&Date.now()-(+a.at||0)<10*60e3?a.k:''},
  // v6.72: when this browser last signed in afresh (a password, Google / Kakao, an e-mail link): the server lets an account be deleted
  // only within 10 minutes of that (qz_account_delete)
  signedNow(){this.ls('qz_signAt',Date.now())},freshSign(){return Date.now()-(+this.ls('qz_signAt')||0)<9.5*60e3},
  provider(){const u=this.ses&&this.ses.user,a=u&&u.app_metadata,P=a&&(Array.isArray(a.providers)?a.providers:a.provider?[a.provider]:[])||[];return P.find(x=>x!=='email')||''},
  async recover(email){const q=this.here()?'?redirect_to='+encodeURIComponent(this.here()):'';await this.req('POST','/auth/v1/recover'+q,{email},false)},
  async newPassword(pw){await this.call('PUT','/auth/v1/user',{password:pw})},
  // the account has a password (an e-mail sign-up): deleting it asks for that first. Google / Kakao only: none to ask for
  hasPw(){const u=this.ses&&this.ses.user,a=u&&u.app_metadata,P=a&&(Array.isArray(a.providers)?a.providers:a.provider?[a.provider]:null);return P?P.includes('email'):!!(u&&u.email)},
  async refreshUser(){if(!this.ses)return null;try{const u=await this.call('GET','/auth/v1/user');if(u&&u.id&&this.ses){this.ses.user=u;this.setSes(this.ses)}return u}catch(e){return null}},
  // v6.67: 회원 탈퇴 — an e-mail account proves its password first (a fresh sign-in), then qz_account_delete takes the account and
  // everything on it (schema.sql); this browser then forgets the session and what it kept of the account
  async deleteAccount(pw){const u=this.ses&&this.ses.user,uid=u&&u.id,em=u&&u.email||this.me&&this.me.email;if(!this.ses)throw new Error('not_signed_in');
    if(pw!=null){this.setSes(await this.req('POST','/auth/v1/token?grant_type=password',{email:em,password:pw},false));this.signedNow()}
    await this.rpc('qz_account_delete',{p_confirm:'delete'});
    this.setSes(null);this.me=null;this.bingo=null;this.season=null;this.side=null;this.mis=null;this.fr=null;this.refRec=null;this.ls('qz_me',null);
    if(uid&&this.ls('qz_recFor')===uid)this.ls('qz_recFor',null);const A=this.ls('qz_nickAsk');if(uid&&Array.isArray(A))this.ls('qz_nickAsk',A.filter(x=>x!==uid));
    this.emit();return true},
  async signOut(){try{if(this.ses)await this.req('POST','/auth/v1/logout',null,true)}catch(e){}this.setSes(null);this.me=null;this.bingo=null;this.season=null;this.side=null;this.mis=null;this.ls('qz_me',null);this.emit()},
  async setNick(n){const r=await this.rpc('qz_set_nickname',{p_nick:n});if(this.me){this.me.nickname=r;this.ls('qz_me',{...this.ls('qz_me'),nickname:r})}this.emit();return r},
  async buy(id){const r=await this.rpc('qz_buy',{p_gun:id});if(this.me){this.me.coins=r.coins;this.me.owned.add(id);this.ls('qz_me',{...this.ls('qz_me'),coins:r.coins,owned:[...this.me.owned]})}this.emit();return r},
  // the 근하신년 decoder bingo: the player's card {nums[25], marked[25], drawn[], rewards[12], done[12], boards, shuffles_left}
  async loadBingo(){const r=await this.rpc('qz_bingo');this.bingo=r;this.emit();return r},
  // open n (1 or 10) decoders, or today's free one, or (ticket) n of the ones kept from the season card.
  // Returns {draws:[{n,cell,lines:[{line,kind,gun,tier,amount}],frags,card}],card,coins,fragments,tickets,free_today}
  async decode(n,free,ticket){const a={p_count:n,p_free:!!free};if(ticket)a.p_ticket=true;// (p_ticket only when used: a database without it still opens coin decoders)
    const r=await this.rpc('qz_decode',a);this.gotDraws(r);this.bingo=r.card;return r},
  gotDraws(r){const me=this.me;if(!me)return;me.coins=r.coins;me.frags=r.fragments;if(r.tfrags!=null)me.tfrags=r.tfrags|0;if(r.tickets!=null)me.tickets=r.tickets|0;if(r.free_today!=null)me.freeToday=!!r.free_today;
    for(const d of r.draws||[])for(const x of d.lines||[])if(x.kind==='gun'&&x.gun)me.owned.add(x.gun);this.saveMe()},
  async bingoReset(){this.bingo=await this.rpc('qz_bingo_reset');this.emit();return this.bingo},
  async bingoShuffle(){this.bingo=await this.rpc('qz_bingo_shuffle');this.emit();return this.bingo},
  // the season decoder bingo: the same card, numbers 0..season_hi, rewards[12] are items ('gun:bhole', 'coins:1000', 'frags:30', 'tickets:3')
  async loadSeason(){const r=await this.rpc('qz_season');this.season=r;this.emit();return r},
  // n (1 or 10) season decoders for coins. Lines: {line,kind (gun|coins|frags|tickets),gun,amount,item}; an owned gun's line pays coins (gun set)
  async seasonDecode(n,ticket){const a={p_count:n};if(ticket)a.p_ticket=true;const r=await this.rpc('qz_season_decode',a);this.gotDraws(r);if(r.season_tickets!=null&&this.me)this.me.sTickets=r.season_tickets|0;this.season=r.card;return r},
  // 근·하·신·년 letters (v6.15): the ones picked up in the match just claimed go to the account; a full set trades for decoders
  async nyAdd(L){const r=await this.rpc('qz_ny_add',{p_g:L[0]|0,p_h:L[1]|0,p_s:L[2]|0,p_n:L[3]|0});if(this.me&&r.ny){this.me.ny=r.ny.map(v=>v|0);this.emit()}return r},
  async nyExchange(choice){const r=await this.rpc('qz_ny_exchange',{p_choice:choice});if(this.me){this.me.ny=r.ny.map(v=>v|0);this.me.tickets=r.tickets|0;this.me.sTickets=r.season_tickets|0;this.emit()}return r},
  async seasonReset(){this.season=await this.rpc('qz_season_reset');this.emit();return this.season},
  async seasonShuffle(){this.season=await this.rpc('qz_season_shuffle');this.emit();return this.season},
  // the sidearm decoder bingo (v6.36): the season card's rules on a third card, numbers 1..side_hi (the Event Horizon Mini and the
  // Crimson Peacemaker come from its lines only). Coins only: n = 1 or 10
  async loadSide(){const r=await this.rpc('qz_side');this.side=r;this.emit();return r},
  async sideDecode(n){const r=await this.rpc('qz_side_decode',{p_count:n});this.gotDraws(r);this.side=r.card;return r},
  async sideReset(){this.side=await this.rpc('qz_side_reset');this.emit();return this.side},
  async sideShuffle(){this.side=await this.rpc('qz_side_shuffle');this.emit();return this.side},
  async exchange(id){const r=await this.rpc('qz_exchange',{p_gun:id});const me=this.me;if(me){me.frags=r.fragments;me.owned.add(id);this.saveMe()}this.emit();return r},
  // a transcendence gun (v6.41: the M4A1 Dark Knight) for trans_cost transcendence fragments → {gun, tfrags}
  async transExchange(id){const r=await this.rpc('qz_trans_exchange',{p_gun:id});const me=this.me;if(me){me.tfrags=r.tfrags|0;me.owned.add(id);this.saveMe()}this.emit();return r},
  async history(){return await this.call('GET','/rest/v1/gacha_log?select=at,src,kind,tier,gun_id,amount,pity_hit&order=id.desc&limit=50',null)},
  saveMe(){const me=this.me;if(!me)return;this.ls('qz_me',{...this.ls('qz_me'),coins:me.coins,owned:[...me.owned],nickname:me.nickname})},
  gc(){return Object.assign({},GACHA_DEF,this.gcfg||{})},
  // (p_match, v6.24: the match's id, the same on every page of it — the hall of fame's first-clear team; p_ach, v6.57: what only the
  // game counted this match for the achievements — melee kills, cures, marks, supply crates, bombs planted / defused, ach.js)
  async claim(st){const a={p_mode:st.mode,p_rounds:st.rounds|0,p_kills:st.kills|0,p_infects:st.infects|0,p_damage:Math.round(st.damage||0),
      p_won:!!st.won,p_mvp:!!st.mvp,p_stage:st.stage|0,p_cleared:!!st.cleared,p_score:st.score|0,p_hs:st.hs|0};let r;
    if(st.ep)Object.assign(a,{p_ep:st.ep|0,p_diff:st.diff|0,p_time:st.time|0,p_lives:st.lives|0,p_bonus:!!st.bonus,p_match:String(st.match||'')});
    if(st.ach&&typeof st.ach==='object'){const o={};for(const k of ['kn','cu','mk','cr','pl','df'])o[k]=Math.max(0,st.ach[k]|0);a.p_ach=o}
    if(st.tok)a.p_token=String(st.tok);// (v6.74: the match's ticket, matchStart)
    const old=e=>/Could not find the function|PGRST202/i.test(e.message+' '+e.code);
    // a database before v6.74 (no p_token), before v6.57 (no p_ach), before v6.24 (no p_match), before v6.20 (no episode fields), then before v6.12 (no p_hs)
    for(const drop of [null,['p_token'],['p_ach'],['p_match'],['p_ep','p_diff','p_time','p_lives','p_bonus'],['p_hs']]){if(drop){if(!drop.some(k=>k in a))continue;for(const k of drop)delete a[k]}
      try{r=await this.rpc('qz_claim',a);break}catch(e){if(!old(e)||drop&&drop[0]==='p_hs')throw e}}
    if(Array.isArray(r.firsts)&&this.me)this.me.firsts=r.firsts.map(v=>v|0);
    if(r.missions){let all=!!(this.mis&&this.mis.missions);for(const x of r.missions){const m=all&&this.mis.missions.find(y=>y.slot===x.slot&&y.kind===x.kind&&y.goal===x.goal);if(m)m.progress=x.progress;else all=false}
      if(!all)this.loadMissions().catch(()=>{})}
    if(this.me){this.me.coins=r.coins;this.me.matches=(this.me.matches||0)+1;this.me.dayLeft=r.day_left;if(r.rec)this.me.rec=r.rec;if(Array.isArray(r.eps))this.me.eps=r.eps;if(r.tickets!=null)this.me.tickets=r.tickets|0;
      this.ls('qz_me',{...this.ls('qz_me'),coins:r.coins,rec:this.me.rec,eps:this.me.eps,firsts:this.me.firsts})}this.emit();try{HOF.claimed(st,r)}catch(e){console.error(e)}return r},
  // v6.92: the chapter a match is claimed as — a database from before chapter 6 records chapters 1–5 only (it would take a 6 for a 5), so a
  // later chapter goes to it as the free scenario (paid as one; the record stays on this device, EP.saveLocal)
  epSrv(ep){ep=ep|0;return ep<=5||(this.me&&(this.me.epmax|0)>=ep)?ep:0},
  // v6.74: a match starts: the server's ticket for it ({mode, ep, diff, mt}: the scenario's chapter and difficulty, the match's own id) —
  // its claim and its rounds' claims bring it back, and the server counts the match's minutes from it. '' on a database before v6.74
  async matchStart(o){if(this.noTicket||!this.signed())return '';let r;
    try{r=await this.rpc('qz_match_start',{p_mode:String(o.mode||''),p_ep:o.ep|0,p_diff:o.diff|0,p_match:String(o.mt||'')})}
    catch(e){if(/Could not find the function|PGRST202/i.test((e.message||'')+' '+(e.code||''))){this.noTicket=true;return ''}throw e}
    return r&&typeof r.token==='string'?r.token:''},
  // a finished round (v6.17): {got,coins,raw,xp_got,day_left,rec}; null when the server has no round rewards yet (an older schema.sql)
  async roundClaim(st){const a={p_mode:st.mode,p_round:st.round|0,p_kills:st.kills|0,p_infects:st.infects|0,p_damage:Math.round(st.damage||0),
      p_won:!!st.won,p_survived:!!st.survived,p_mvp:!!st.mvp,p_score:st.score|0,p_hs:st.hs|0};let r;if(st.tok&&!this.oldRound)a.p_token=String(st.tok);
    const old=e=>/Could not find the function|PGRST202/i.test((e.message||'')+' '+(e.code||''));
    // (v6.74: the match's ticket; a database before it has no p_token — asked without it from then on)
    try{r=await this.rpc('qz_round_claim',a)}catch(e){if(!old(e))throw e;if('p_token' in a){this.oldRound=true;delete a.p_token;try{r=await this.rpc('qz_round_claim',a)}catch(e2){if(old(e2)){this.noRound=true;return null}throw e2}}else{this.noRound=true;return null}}
    const me=this.me;if(me){me.coins=r.coins;me.dayLeft=r.day_left;if(r.rec)me.rec=r.rec;this.ls('qz_me',{...this.ls('qz_me'),coins:r.coins,rec:me.rec})}this.emit();return r},
  // ---- friends and gifts (v6.18) ----
  // {code (mine), friends:[{code,nickname,xp,last,since}], incoming:[{code,nickname,xp,at}], outgoing:[…], gifts_new}; ids never come out
  frGot(r){this.fr={...r,at:Date.now()};const me=this.me;if(me){if(r.code)me.fcode=r.code;me.friendReq=(r.incoming||[]).length;if(r.gifts_new!=null)me.giftsNew=r.gifts_new|0;if(r.dm_new!=null)me.dmNew=r.dm_new|0;if(r.inv!=null)me.invN=r.inv|0}this.emit();return this.fr},
  async loadFriends(){return this.frGot(await this.rpc('qz_friends'))},
  // a request by friend code or a nickname only one player has → also the list, done: sent | accepted (they had asked me already)
  async friendAdd(who){const r=await this.rpc('qz_friend_add',{p_who:who});this.frGot(r);return r},
  async friendAnswer(code,yes){return this.frGot(await this.rpc('qz_friend_answer',{p_who:code,p_yes:!!yes}))},
  async friendRemove(code){return this.frGot(await this.rpc('qz_friend_remove',{p_who:code}))},
  // v6.74: blocks — someone blocked (by code) is cut off both ways: the friendship and requests go, and no requests, messages, invites or
  // gifts cross after that. blk = the players I blocked [{code,nickname,at}]
  async block(code){return this.frGot(await this.rpc('qz_block',{p_who:code}))},
  async blocks(){const r=await this.rpc('qz_blocks');this.blk=Array.isArray(r&&r.blocked)?r.blocked:[];if(this.fr)this.fr.blocked=this.blk.length;return this.blk},
  async unblock(code){const r=await this.rpc('qz_unblock',{p_who:code});this.blk=Array.isArray(r&&r.blocked)?r.blocked:[];if(this.fr)this.fr.blocked=this.blk.length;this.emit();return this.blk},
  // v6.25: 'I am here' (profiles.last_seen; friends read it as online / last seen) and the friend chat. dm_new = unread messages.
  // qz_dm_list → {msgs:[{id,mine,text,at}], seen, dm_new}; asking for a talk marks what the friend wrote as read. Old databases: no ping, no chat.
  // v6.42: play = seconds of a match since the last beat, fresh = the game just came into view (a new stretch of play time starts);
  // a database from before v6.42 has qz_ping without arguments (asked that way from then on). It also brings the counts the lobby's
  // dots show: messages, invites, letters, weapons given, answers to my inquiries (v6.66: inq)
  async ping(play,fresh){if(this.noPing)return null;let r;const a=this.pingOld?{}:{p_play:Math.max(0,play|0),p_fresh:!!fresh};
    try{r=await this.rpc('qz_ping',a)}catch(e){if(/Could not find the function|PGRST202/i.test((e.message||'')+' '+(e.code||''))){if(!this.pingOld){this.pingOld=true;return this.ping(play,fresh)}this.noPing=true;return null}throw e}
    const me=this.me;if(me&&r){let ch=false;if(r.dm_new!=null&&(me.dmNew|0)!==(r.dm_new|0)){me.dmNew=r.dm_new|0;ch=true}if(r.inv!=null&&(me.invN|0)!==(r.inv|0)){me.invN=r.inv|0;ch=true}if(r.mail!=null&&(me.mailN|0)!==(r.mail|0)){me.mailN=r.mail|0;ch=true}if(r.gun!=null&&(me.gunNew|0)!==(r.gun|0)){me.gunNew=r.gun|0;ch=true}if(r.inq!=null&&(me.inqN|0)!==(r.inq|0)){me.inqN=r.inq|0;ch=true}if(ch)this.emit()}return r},
  async dmList(code,after){const r=await this.rpc('qz_dm_list',{p_who:code,p_after:after|0});if(this.me&&(this.me.dmNew|0)!==(r.dm_new|0)){this.me.dmNew=r.dm_new|0;this.emit()}return r},
  async dmSend(code,text){return this.rpc('qz_dm_send',{p_who:code,p_text:text})},
  // a gun from the shop for a friend (the giver's coins): {coins,gun,to}
  async gift(code,gun){const r=await this.rpc('qz_gift',{p_who:code,p_gun:gun});if(this.me){this.me.coins=r.coins;this.saveMe()}this.emit();return r},
  // gifts not shown yet [{gun,from,at}] (shown after this); the guns are on the account already
  async giftInbox(){const r=await this.rpc('qz_gift_inbox');const L0=r.gifts||[];const me=this.me;if(me){for(const g of L0)me.owned.add(g.gun);me.giftsNew=0;this.saveMe()}this.emit();return L0},
  // ---- invites (v6.37) ----
  // a friend into my PeerJS room (code = friend code, room = the 4-letter room code) → {ok,to}; the invites waiting for me
  // [{code,map,mode,at,from,fc,ft}]; one answered (joined or declined) → the rest
  invite(code,room,map,mode){return this.rpc('qz_invite',{p_who:code,p_code:room,p_map:map||'',p_mode:mode||''})},
  async invites(){const r=await this.rpc('qz_invites');const L0=Array.isArray(r)?r:[];if(this.me&&(this.me.invN|0)!==L0.length){this.me.invN=L0.length;this.emit()}return L0},
  async inviteAnswer(fc,room){const r=await this.rpc('qz_invite_answer',{p_fc:fc,p_code:room});if(this.me)this.me.invN=Array.isArray(r)?r.length:0;return r},
  // invite links: apply the code of the link that brought this (new) account → {by,bonus,coins,left,tickets}; settle its reward after
  // enough matches → {state: none|done|wait|paid, left, got_tickets, tickets, inviter_paid, by}; my link's record (marks rewards seen)
  async refSet(code){const r=await this.rpc('qz_ref_set',{p_code:code});const me=this.me;if(me){me.coins=r.coins;me.ref={...(me.ref||{}),by:r.by,done:false,left:r.left|0};this.saveMe()}this.emit();return r},
  async refCheck(){const r=await this.rpc('qz_ref_check');const me=this.me;if(me&&me.ref){if(r.state==='paid'||r.state==='done')me.ref.done=true;if(r.state==='wait')me.ref.left=r.left|0;if(r.tickets!=null)me.tickets=r.tickets|0}this.emit();return r},
  async refInfo(){const r=await this.rpc('qz_ref_info');const me=this.me;if(me){me.ref={...(me.ref||{}),n:r.n|0,paid:r.paid|0,new:0}}this.refRec={...r,at:Date.now()};this.emit();return r},
  // daily missions (v6.12): {day,resets_in,missions:[{slot,id,tier,kind,goal,progress,coins,tickets,ko,en,claimed}]}, the time it came (at)
  async loadMissions(){if(!this.ses)return null;const r=await this.rpc('qz_missions');this.mis={...r,at:Date.now()};this.emit();return this.mis},
  async misClaim(slot){const r=await this.rpc('qz_mission_claim',{p_slot:slot});this.mis={...r.missions,at:Date.now()};const me=this.me;
    if(me){me.coins=r.coins;me.tickets=r.tickets|0;me.earned=(me.earned||0)+(r.got|0);this.saveMe()}this.emit();return r},
  // a mission is done and not claimed yet (the lobby's red dot); a stale day (past midnight in Korea) counts as nothing
  misReady(){const M=this.mis;if(!this.signed()||!M||!M.missions)return 0;if(M.resets_in!=null&&Date.now()-M.at>M.resets_in*1000)return 0;
    return M.missions.filter(m=>!m.claimed&&m.progress>=m.goal).length},
  // the ranking (anyone, signed in or not): kind level | kills | infects | best → {kind,top:[{rank,nickname,value,xp,games,me}],me,total}
  ranking(kind){return this.rpc('qz_ranking',{p_kind:kind})},
  // ---- questions the game asks ----
  signed(){return !!(this.on&&this.ses&&this.me&&!this.me.cached)},
  price(id){const P=this.prices&&this.prices[id];if(P)return P;if(SHOP_FREE.includes(id))return {gun_id:id,price:0,free:true,sold:true};
    if(SHOP_NOTSOLD.includes(id))return {gun_id:id,price:0,free:false,sold:false};for(const t of ['S','A'])if(SHOP_GACHA[t].includes(id))return {gun_id:id,price:0,free:false,sold:false,tier:t};
    const p=SHOP_PRICE[id];return p==null?null:{gun_id:id,price:p,free:false,sold:true}},
  tier(id){const p=this.price(id);return p&&p.tier||null},
  isFree(id){const p=this.price(id);return !!(p&&p.free)},
  // may this player use (buy with round money) this gun? With accounts off, everything is open
  owns(id){if(!this.on)return true;const W=WPN[id];if(!W||W.kind==='nade'||!W.model)return true;const p=this.price(id);if(!p)return true;if(p.free)return true;
    return !!(this.me&&this.me.owned&&this.me.owned.has(id))},
  // error text for the player
  errText(e){const L=LI(),m=String(e&&e.message||e||''),c=String(e&&e.code||'');
    const T2=(ko,en)=>L?en:ko;
    if(e&&e.net||/network|Failed to fetch/i.test(m))return T2('서버에 연결할 수 없어요. 인터넷 연결을 확인해 주세요','Cannot reach the server. Check your connection');
    if(/invalid_credentials|Invalid login credentials/i.test(c+m))return T2('이메일 또는 비밀번호가 맞지 않아요','Wrong e-mail or password');
    if(/user_already_exists|already registered/i.test(c+m))return T2('이미 가입된 이메일이에요','That e-mail already has an account');
    if(/email_not_confirmed|Email not confirmed/i.test(c+m))return T2('메일함에서 인증 링크를 먼저 눌러 주세요','Confirm your e-mail first (check your inbox)');
    if(/weak_password|at least 6|Password should/i.test(c+m))return T2('비밀번호는 6자 이상으로 해 주세요','Use a password of at least 6 characters');
    if(/validation_failed|invalid format|Unable to validate email/i.test(c+m))return T2('이메일 형식이 올바르지 않아요','That is not a valid e-mail address');
    if(/rate limit|over_email_send_rate_limit|too many/i.test(c+m))return T2('요청이 너무 많아요. 잠시 후 다시 해 주세요','Too many tries. Wait a moment and try again');
    if(/signup_disabled|Signups not allowed/i.test(c+m))return T2('지금은 가입을 받지 않아요','Sign-ups are closed right now');
    if(/banned/.test(m))return T2('이용이 정지된 계정이라 할 수 없어요','This account is suspended');
    if(/coupon_not_found/.test(m))return T2('없는 쿠폰 코드예요','No such coupon code');
    if(/coupon_used/.test(m))return T2('이미 쓴 쿠폰이에요','You used this coupon already');
    if(/coupon_expired/.test(m))return T2('기간이 끝난 쿠폰이에요','This coupon has expired');
    if(/coupon_off/.test(m))return T2('지금은 쓸 수 없는 쿠폰이에요','This coupon is switched off for now');
    if(/coupon_soldout/.test(m))return T2('사용 가능 횟수가 다 찬 쿠폰이에요','This coupon has run out');
    if(/coupon_not_started/.test(m))return T2('아직 쓸 수 없는 쿠폰이에요','This coupon is not open yet');
    if(/coupon_slow/.test(m))return T2('틀린 코드를 너무 많이 넣었어요. 10분 뒤에 다시 해 주세요','Too many wrong codes — try again in 10 minutes');
    if(/no_mail/.test(m))return T2('이미 받은 우편이에요','That letter was taken already');
    if(/room_closed/.test(m))return T2('운영자가 공개 목록에서 내린 방이에요 (비공개로는 계속할 수 있어요)','An admin took this room off the public list (it goes on privately)');
    if(/not_admin/.test(m))return T2('관리자 계정이 아니에요','Not an admin account');
    if(/admin_account/.test(m))return T2('관리자 계정은 탈퇴할 수 없어요. 관리 페이지 운영진에서 먼저 빼 주세요','An admin account cannot be deleted — take it off the staff first');
    if(/confirm_needed/.test(m))return T2('확인 문구가 맞지 않아요','The confirmation does not match');
    if(/reauth/.test(m))return T2('안전을 위해 다시 로그인한 뒤 10분 안에 탈퇴할 수 있어요','For safety, sign in again — then you have 10 minutes to delete');
    if(/qz_account_delete/.test(m))return T2('탈퇴는 서버 업데이트(schema.sql) 뒤에 할 수 있어요','Deleting needs the server updated (schema.sql)');
    if(/not_enough_coins/.test(m))return T2('코인이 부족해요','Not enough coins');
    if(/not_enough_tfrags/.test(m))return T2('초월 조각이 부족해요','Not enough transcendence fragments');
    if(/not_enough_frags/.test(m))return T2('해독 조각이 부족해요','Not enough fragments');
    if(/not_enough_tickets/.test(m))return T2('보유한 근하신년 해독기가 부족해요','Not enough decoders kept');
    if(/gacha_only/.test(m))return T2('근하신년 무기는 해독기 빙고에서만 얻을 수 있어요','근하신년 guns only come from the decoder bingo');
    if(/free_used/.test(m))return T2('오늘 무료 해독기는 이미 열었어요','Today\'s free decoder is used');
    if(/no_shuffles/.test(m))return T2('오늘 뒤섞기를 다 썼어요','No shuffles left today');
    if(/not_for_exchange/.test(m))return T2('교환할 수 없는 총이에요','That gun cannot be exchanged');
    if(/bad_count|no_config/.test(m))return T2('해독기 설정을 확인해 주세요','Decoder settings are off');
    if(/not_done/.test(m))return T2('아직 미션을 다 못 했어요','That mission is not finished yet');
    if(/already_claimed/.test(m))return T2('이미 받은 보상이에요','Already claimed');
    if(/no_mission/.test(m))return T2('오늘의 미션이 바뀌었어요. 다시 열어 주세요','Today\'s missions changed — open them again');
    if(/no_title/.test(m))return T2('아직 가지고 있지 않은 칭호예요','You do not have that title yet');
    if(/no_set/.test(m))return T2('근·하·신·년 한 세트가 아직 모자라요','You need one of each letter first');if(/no_tickets/.test(m))return T2('보유한 해독기가 없어요','No kept decoders left');
    if(/dm_text/.test(m))return T2('메시지는 1~200자로 적어 주세요','A message is 1 to 200 characters');
    if(/dm_slow/.test(m))return T2('너무 빨리 보내고 있어요. 잠시 후에 다시 보내 주세요','Slow down — try again in a moment');
    if(/dm_not_friend/.test(m))return T2('친구끼리만 메시지를 보낼 수 있어요','Messages go to friends only');
    if(/inq_short/.test(m))return T2('문의 내용을 5자 이상 적어 주세요','Write at least 5 characters');
    if(/inq_long/.test(m))return T2('문의는 1,000자까지 쓸 수 있어요','An inquiry is 1,000 characters at most');
    if(/inq_slow/.test(m))return T2('문의를 너무 많이 보냈어요. 1시간 뒤에 다시 보내 주세요','Too many inquiries — try again in an hour');
    if(/inq_busy/.test(m))return T2('지금은 게스트 문의가 많이 밀려 있어요. 로그인하고 보내거나 조금 뒤에 다시 보내 주세요','Guest inquiries are backed up right now — sign in to send, or try again later');
    if(/Could not find the function|PGRST202/i.test(m+' '+c)&&/dm_/.test(m))return T2('채팅은 서버 스키마를 갱신해야 쓸 수 있어요','Chat needs the server schema updated');
    if(/friend_self/.test(m))return T2('나 자신은 친구로 추가할 수 없어요','That is you');
    if(/friend_already/.test(m))return T2('이미 친구예요','Already friends');
    if(/friend_pending/.test(m))return T2('이미 친구 요청을 보냈어요','Request already sent');
    if(/friend_full/.test(m))return T2('친구가 너무 많아요 (친구 100명 · 보낸 요청 30개까지)','Too many friends (100 friends, 30 requests waiting)');
    if(/nick_many/.test(m))return T2('같은 닉네임이 여러 명이에요. 친구 코드로 추가해 주세요','Several players have that nickname — use their friend code');
    if(/nick_taken/.test(m))return T2('이미 다른 플레이어가 쓰는 닉네임이에요 (대소문자 구분 없이 한 명만 써요)','Another player has that nickname (any case) — pick another');
    if(/nick_short/.test(m))return T2('닉네임은 2~16자로 정해 주세요','Pick a nickname of 2–16 characters');
    if(/you_blocked/.test(m))return T2('내가 차단한 플레이어예요. 친구 창의 차단 목록에서 먼저 풀어 주세요','You blocked that player — unblock them first (Friends → Blocked)');
    if(/friend_blocked/.test(m))return T2('이 플레이어에게는 친구 요청을 보낼 수 없어요','You cannot send that player a request');
    if(/block_full/.test(m))return T2('차단 목록이 가득 찼어요 (500명까지)','Your block list is full (500 at most)');
    if(/ref_reborn/.test(m))return T2('탈퇴했다가 다시 만든 계정은 초대 보상을 받을 수 없어요','An account made again after deleting one cannot take an invite');
    if(/not_found/.test(m))return T2('그 친구 코드나 닉네임을 가진 플레이어가 없어요','No player with that friend code or nickname');
    if(/no_request/.test(m))return T2('친구 요청이 없어요 (이미 처리됐을 수 있어요)','No such request (it may be answered already)');
    if(/not_friends/.test(m))return T2('친구에게만 선물할 수 있어요','Gifts go to friends only');
    if(/friend_has_it/.test(m))return T2('친구가 이미 가지고 있는 총이에요','Your friend has that gun already');
    if(/inv_friends/.test(m))return T2('친구만 초대할 수 있어요','Only friends can be invited');
    if(/inv_wait/.test(m))return T2('방금 초대했어요. 잠시 뒤에 다시 보낼 수 있어요','Invited just now — try again in a moment');
    if(/inv_many/.test(m))return T2('초대를 너무 많이 보냈어요. 1분 뒤에 다시 해 주세요','Too many invites — wait a minute');
    if(/ref_already/.test(m))return T2('이미 초대 코드를 적용한 계정이에요','This account already used an invite');
    if(/ref_old/.test(m))return T2('초대 링크는 가입하고 7일 안에만 쓸 수 있어요','Invite links work for new accounts only (first 7 days)');
    if(/ref_loop/.test(m))return T2('서로를 초대할 수는 없어요','You cannot invite each other');
    if(/qz_friend|qz_gift|qz_ny_|qz_round_|qz_decode|qz_bingo|qz_season|qz_side|qz_invite|qz_ref_|qz_mission|qz_ranking|qz_trans|qz_mail|qz_coupon|qz_gun_|qz_ach|qz_title|qz_block|qz_unblock|Could not find the function/i.test(m))return T2('서버 업데이트가 필요해요 (supabase/schema.sql 다시 실행)','The database needs the new schema.sql');
    if(/already_owned/.test(m))return T2('이미 가진 총이에요','You already own it');
    if(/not_for_sale/.test(m))return T2('상점에서 팔지 않는 총이에요','Not sold in the shop');
    if(/too_soon/.test(m))return T2('보상은 조금 뒤에 다시 받을 수 있어요','Too soon for another reward');
    if(/not_signed_in|JWT|401/i.test(m))return T2('다시 로그인해 주세요','Please sign in again');
    return T2('문제가 생겼어요: ','Something went wrong: ')+m.slice(0,80)}};
