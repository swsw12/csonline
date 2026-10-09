'use strict';
// ============ Accounts (Supabase): sign-in, coins, the guns you own ============
// No library: Supabase's auth (GoTrue, /auth/v1) and data (PostgREST, /rest/v1) endpoints are called with fetch.
// Fill in SB.url and SB.key from the Supabase dashboard: the project's Connect button (or Project Settings → API Keys) shows the
// Project URL (https://<ref>.supabase.co) and the publishable key (sb_publishable_…; the legacy "anon public" eyJ… key works too).
// Both are meant to be public: the tables are guarded by row level security and every coin change happens inside the database
// functions in supabase/schema.sql. Never put the secret / service_role key here. Left empty, accounts are off and every gun
// stays open as before.
// SB.oauth: social sign-in buttons to show, e.g. ['google','kakao'] (turn the provider on in Authentication → Providers first).
const SB={url:'https://qoavmnovajakmfwqixiu.supabase.co',key:'sb_publishable_Pn-fNd9t03i6cOOGxoBbtQ_dRMChz_a',oauth:[]};
if(typeof window!=='undefined'&&window.QZ_SB)Object.assign(SB,window.QZ_SB);// (the test harness points this at a mock)
const ACC={on:!!(SB.url&&SB.key),ses:null,me:null,bingo:null,prices:null,gcfg:null,ready:false,busy:false,subs:[],lastErr:'',
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
      else{this.setSes({access_token:q.get('access_token'),refresh_token:q.get('refresh_token'),expires_at:+q.get('expires_at')||0,expires_in:q.get('expires_in')});kind=q.get('type')}
      try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}}
    else this.ses=this.ls('qz_ses');
    this.loadPrices();this.loadGacha();
    if(this.ses){try{await this.fresh();if(!this.ses.user)this.ses.user=await this.req('GET','/auth/v1/user',null,true);await this.loadMe()}catch(e){if(!e.net){this.setSes(null);this.me=null}}}
    else this.me=null;
    this.ready=true;this.emit();return kind},
  async loadPrices(){try{const r=await this.req('GET','/rest/v1/gun_prices?select=gun_id,price,free,sold',null,false);if(Array.isArray(r)&&r.length){const P={};for(const x of r)P[x.gun_id]=x;this.prices=P;this.emit()}}catch(e){}},
  async loadGacha(){try{const r=await this.req('GET','/rest/v1/gacha_config?select=*',null,false);if(Array.isArray(r)&&r[0]){this.gcfg=r[0];this.emit()}}catch(e){}},
  async loadMe(){const r=await this.rpc('qz_me');this.me={nickname:r.nickname,coins:r.coins,earned:r.earned,matches:r.matches,dayLeft:r.day_left,owned:new Set(r.owned||[]),
      frags:r.fragments|0,pity:r.pity|0,freeToday:!!r.free_today,rec:r.rec||null,email:this.ses&&this.ses.user&&this.ses.user.email||''};
    this.ls('qz_me',{nickname:this.me.nickname,coins:this.me.coins,owned:[...this.me.owned],rec:this.me.rec,email:this.me.email,uid:this.ses&&this.ses.user&&this.ses.user.id});this.emit();
    this.importRec();return this.me},
  // the record this browser kept before accounts goes to the first account that signs in here (once; the server clamps it)
  async importRec(){const me=this.me,uid=this.ses&&this.ses.user&&this.ses.user.id;if(!me||!me.rec||me.rec.imported||!uid||this.ls('qz_recFor'))return;
    const L=this.ls('qz_rec');if(!L||!(L.g>0))return;this.ls('qz_recFor',uid);
    try{const r=await this.rpc('qz_import_rec',{p_games:L.g|0,p_kills:L.k|0,p_infects:L.inf|0,p_best:L.best|0,p_xp:L.xp|0});me.rec=r.rec;this.ls('qz_me',{...this.ls('qz_me'),rec:me.rec});this.emit()}
    catch(e){if(!/already_imported/.test(e.message))this.ls('qz_recFor',null)}},// not done (offline, or the database not updated yet): try again next time
  // ---- the player's actions ----
  async signIn(email,pw){const s=await this.req('POST','/auth/v1/token?grant_type=password',{email,password:pw},false);this.setSes(s);await this.loadMe();return this.me},
  async signUp(email,pw,nick){const q=this.here()?'?redirect_to='+encodeURIComponent(this.here()):'';
    const s=await this.req('POST','/auth/v1/signup'+q,{email,password:pw,data:{nickname:nick}},false);
    if(s&&s.access_token){this.setSes(s);await this.loadMe();return {ok:1}}return {confirm:1}},// e-mail confirmation is on: the link brings the player back signed in
  oauth(p){location.assign(SB.url.replace(/\/+$/,'')+'/auth/v1/authorize?provider='+encodeURIComponent(p)+(this.here()?'&redirect_to='+encodeURIComponent(this.here()):''))},
  async recover(email){const q=this.here()?'?redirect_to='+encodeURIComponent(this.here()):'';await this.req('POST','/auth/v1/recover'+q,{email},false)},
  async newPassword(pw){await this.call('PUT','/auth/v1/user',{password:pw})},
  async signOut(){try{if(this.ses)await this.req('POST','/auth/v1/logout',null,true)}catch(e){}this.setSes(null);this.me=null;this.bingo=null;this.ls('qz_me',null);this.emit()},
  async setNick(n){const r=await this.rpc('qz_set_nickname',{p_nick:n});if(this.me){this.me.nickname=r;this.ls('qz_me',{...this.ls('qz_me'),nickname:r})}this.emit();return r},
  async buy(id){const r=await this.rpc('qz_buy',{p_gun:id});if(this.me){this.me.coins=r.coins;this.me.owned.add(id);this.ls('qz_me',{...this.ls('qz_me'),coins:r.coins,owned:[...this.me.owned]})}this.emit();return r},
  // the 근하신년 decoder bingo: the player's card {nums[25], marked[25], drawn[], rewards[12], done[12], boards, shuffles_left}
  async loadBingo(){const r=await this.rpc('qz_bingo');this.bingo=r;this.emit();return r},
  // open n (1 or 10) decoders, or today's free one. Returns {draws:[{n,cell,lines:[{line,kind,gun,tier,amount}],frags,card}],card,coins,fragments,free_today}
  async decode(n,free){const r=await this.rpc('qz_decode',{p_count:n,p_free:!!free});const me=this.me;
    if(me){me.coins=r.coins;me.frags=r.fragments;me.freeToday=!!r.free_today;for(const d of r.draws||[])for(const x of d.lines||[])if(x.kind==='gun'&&x.gun)me.owned.add(x.gun);this.saveMe()}
    this.bingo=r.card;return r},
  async bingoReset(){this.bingo=await this.rpc('qz_bingo_reset');this.emit();return this.bingo},
  async bingoShuffle(){this.bingo=await this.rpc('qz_bingo_shuffle');this.emit();return this.bingo},
  async exchange(id){const r=await this.rpc('qz_exchange',{p_gun:id});const me=this.me;if(me){me.frags=r.fragments;me.owned.add(id);this.saveMe()}this.emit();return r},
  async history(){return await this.call('GET','/rest/v1/gacha_log?select=at,src,kind,tier,gun_id,amount,pity_hit&order=id.desc&limit=50',null)},
  saveMe(){const me=this.me;if(!me)return;this.ls('qz_me',{...this.ls('qz_me'),coins:me.coins,owned:[...me.owned],nickname:me.nickname})},
  gc(){return Object.assign({},GACHA_DEF,this.gcfg||{})},
  async claim(st){const r=await this.rpc('qz_claim',{p_mode:st.mode,p_rounds:st.rounds|0,p_kills:st.kills|0,p_infects:st.infects|0,p_damage:Math.round(st.damage||0),
      p_won:!!st.won,p_mvp:!!st.mvp,p_stage:st.stage|0,p_cleared:!!st.cleared,p_score:st.score|0});
    if(this.me){this.me.coins=r.coins;this.me.matches=(this.me.matches||0)+1;this.me.dayLeft=r.day_left;if(r.rec)this.me.rec=r.rec;this.ls('qz_me',{...this.ls('qz_me'),coins:r.coins,rec:this.me.rec})}this.emit();return r},
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
    if(/not_enough_coins/.test(m))return T2('코인이 부족해요','Not enough coins');
    if(/not_enough_frags/.test(m))return T2('해독 조각이 부족해요','Not enough fragments');
    if(/gacha_only/.test(m))return T2('근하신년 무기는 해독기 빙고에서만 얻을 수 있어요','근하신년 guns only come from the decoder bingo');
    if(/free_used/.test(m))return T2('오늘 무료 해독기는 이미 열었어요','Today\'s free decoder is used');
    if(/no_shuffles/.test(m))return T2('오늘 뒤섞기를 다 썼어요','No shuffles left today');
    if(/not_for_exchange/.test(m))return T2('교환할 수 없는 총이에요','That gun cannot be exchanged');
    if(/bad_count|no_config/.test(m))return T2('해독기 설정을 확인해 주세요','Decoder settings are off');
    if(/qz_decode|qz_bingo|Could not find the function/i.test(m))return T2('서버 업데이트가 필요해요 (supabase/schema.sql 다시 실행)','The database needs the new schema.sql');
    if(/already_owned/.test(m))return T2('이미 가진 총이에요','You already own it');
    if(/not_for_sale/.test(m))return T2('상점에서 팔지 않는 총이에요','Not sold in the shop');
    if(/too_soon/.test(m))return T2('보상은 조금 뒤에 다시 받을 수 있어요','Too soon for another reward');
    if(/not_signed_in|JWT|401/i.test(m))return T2('다시 로그인해 주세요','Please sign in again');
    return T2('문제가 생겼어요: ','Something went wrong: ')+m.slice(0,80)}};
