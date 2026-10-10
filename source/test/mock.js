// a stand-in for Supabase (auth + the qz_* functions), same rules as supabase/schema.sql; state kept in localStorage
(function(){const URL0='https://mock.supabase.test';window.QZ_SB={url:URL0,key:'anon-test-key',oauth:['google','kakao']};
const PRICES=[{"gun_id": "knife", "price": 0, "free": true, "sold": true, "tier": null}, {"gun_id": "p9", "price": 0, "free": true, "sold": true, "tier": null}, {"gun_id": "sg8", "price": 0, "free": true, "sold": true, "tier": null}, {"gun_id": "k5", "price": 0, "free": true, "sold": true, "tier": null}, {"gun_id": "g35", "price": 0, "free": true, "sold": true, "tier": null}, {"gun_id": "f7", "price": 1200, "free": false, "sold": true, "tier": null}, {"gun_id": "d50", "price": 1500, "free": false, "sold": true, "tier": null}, {"gun_id": "tw9", "price": 1800, "free": false, "sold": true, "tier": null}, {"gun_id": "r6", "price": 2000, "free": false, "sold": true, "tier": null}, {"gun_id": "db2", "price": 1500, "free": false, "sold": true, "tier": null}, {"gun_id": "m14", "price": 3500, "free": false, "sold": true, "tier": null}, {"gun_id": "as12", "price": 4500, "free": false, "sold": true, "tier": null}, {"gun_id": "k9", "price": 1200, "free": false, "sold": true, "tier": null}, {"gun_id": "um45", "price": 1800, "free": false, "sold": true, "tier": null}, {"gun_id": "pd50", "price": 3000, "free": false, "sold": true, "tier": null}, {"gun_id": "br3", "price": 2500, "free": false, "sold": true, "tier": null}, {"gun_id": "kv47", "price": 3500, "free": false, "sold": true, "tier": null}, {"gun_id": "ar7", "price": 4000, "free": false, "sold": true, "tier": null}, {"gun_id": "ar5c", "price": 4500, "free": false, "sold": true, "tier": null}, {"gun_id": "hr17", "price": 5500, "free": false, "sold": true, "tier": null}, {"gun_id": "sr8", "price": 2500, "free": false, "sold": true, "tier": null}, {"gun_id": "r700", "price": 6500, "free": false, "sold": true, "tier": null}, {"gun_id": "dm14", "price": 7000, "free": false, "sold": true, "tier": null}, {"gun_id": "mg6", "price": 6000, "free": false, "sold": true, "tier": null}, {"gun_id": "hmg", "price": 6500, "free": false, "sold": true, "tier": null}, {"gun_id": "gx6", "price": 10000, "free": false, "sold": true, "tier": null}, {"gun_id": "airb", "price": 4500, "free": false, "sold": true, "tier": null}, {"gun_id": "gl40", "price": 5500, "free": false, "sold": true, "tier": null}, {"gun_id": "axe", "price": 1500, "free": false, "sold": true, "tier": null}, {"gun_id": "hammer", "price": 4000, "free": false, "sold": true, "tier": null}, {"gun_id": "skull9", "price": 9000, "free": false, "sold": true, "tier": null}, {"gun_id": "bhole", "price": 0, "free": false, "sold": false, "tier": null}, {"gun_id": "rdc", "price": 0, "free": false, "sold": false, "tier": "S"}, {"gun_id": "mdrill", "price": 0, "free": false, "sold": false, "tier": "S"}, {"gun_id": "mlaunch", "price": 0, "free": false, "sold": false, "tier": "S"}, {"gun_id": "volc", "price": 0, "free": false, "sold": false, "tier": "S"}, {"gun_id": "bdc", "price": 0, "free": false, "sold": false, "tier": "S"}, {"gun_id": "gaebolg", "price": 0, "free": false, "sold": false, "tier": "S"}, {"gun_id": "xdz", "price": 0, "free": false, "sold": false, "tier": "A"}, {"gun_id": "ripper", "price": 0, "free": false, "sold": false, "tier": "A"}, {"gun_id": "xbowa", "price": 0, "free": false, "sold": false, "tier": "A"}, {"gun_id": "xbow", "price": 0, "free": false, "sold": false, "tier": "A"}, {"gun_id": "sterling", "price": 0, "free": false, "sold": false, "tier": "A"}, {"gun_id": "duckfoot", "price": 0, "free": false, "sold": false, "tier": "A"}];const PM={};for(const r of PRICES)PM[r.gun_id]=r;
const load=()=>{try{return JSON.parse(localStorage.getItem('__mockdb'))||{users:{},tok:{},prof:{},own:{},log:[]}}catch(e){return {users:{},tok:{},prof:{},own:{},log:[]}}};
const save=db=>localStorage.setItem('__mockdb',JSON.stringify(db));
const uuid=()=>'u'+Math.random().toString(16).slice(2,10)+Date.now().toString(16);
const clean=t=>{const n=String(t||'').replace(/[\u0000-\u001f]/g,'').replace(/\s+/g,' ').trim().slice(0,16);return n.length>=2?n:'생존자'};
const res=(st,body)=>new Response(body==null?'':JSON.stringify(body),{status:st,headers:{'Content-Type':'application/json'}});
const err=(st,o)=>res(st,o);const pgerr=m=>res(400,{code:'P0001',details:null,hint:null,message:m});
window.__mockCalls=[];
const ses=(db,uid)=>{const a='at_'+uuid(),r='rt_'+uuid();db.tok[a]={uid,exp:Date.now()+3600e3};db.tok[r]={uid,refresh:1};const u=db.users[uid];
  return {access_token:a,token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,refresh_token:r,user:{id:uid,email:u.email,user_metadata:u.meta}}};
const REC=Q=>Object.assign({g:0,k:0,inf:0,best:0,xp:0,imported:false},Q.rec||{});
const newProfile=(db,uid,nick)=>{if(db.prof[uid])return;db.prof[uid]={nickname:clean(nick),coins:3000,earned:0,matches:0,last:null,day:null,dayE:0,frags:0,pity:0,freeDay:null};db.own[uid]=[];db.glog=db.glog||[];db.log.push([uid,3000,'welcome'])};
const GCFG={id:1,dec_cost1:600,dec_cost10:5400,bingo_hi:49,dec_frag_min:1,dec_frag_max:3,shuffle_free:3,cost1:500,cost10:4500,rate_s:0.02,rate_a:0.08,rate_coin:0.3,pity:60,coin_table:[[100,30],[200,30],[300,20],[500,15],[1000,5]],frag_min:2,frag_max:5,full_s_coins:3000,full_a_frags:30,ex_s:200,ex_a:80,daily_free:true,
  season_cost1:1000,season_cost10:9000,season_hi:99,season_frag_min:1,season_frag_max:3,season_owned_coins:10000,
  season_lines:['gun:bhole','coins:1000','coins:1000','coins:1000','coins:2000','coins:2000','coins:5000','frags:30','frags:30','tickets:3','tickets:3','tickets:3']};
const today=()=>new Date(Date.now()+9*3600e3).toISOString().slice(0,10);
const of=window.fetch.bind(window);
window.fetch=async function(input,init){const url=typeof input==='string'?input:input.url;if(!url.startsWith(URL0))return of(input,init);
  init=init||{};const m=(init.method||'GET').toUpperCase(),u=new URL(url),p=u.pathname,body=init.body?JSON.parse(init.body):null,H=init.headers||{};
  window.__mockCalls.push(m+' '+p+u.search);if(window.__MOCK_DOWN)throw new TypeError('Failed to fetch');
  if(H.apikey!=='anon-test-key')return err(401,{message:'Invalid API key'});
  const db=load();const bearer=String(H.Authorization||'').replace('Bearer ','');const tk=db.tok[bearer];const uid=tk&&!tk.refresh&&tk.exp>Date.now()?tk.uid:null;
  try{
  if(p==='/auth/v1/signup'&&m==='POST'){const e=String(body.email||'').toLowerCase();if(!/^\S+@\S+\.\S+$/.test(e))return err(400,{code:400,error_code:'validation_failed',msg:'Unable to validate email address: invalid format'});
    if(Object.values(db.users).some(x=>x.email===e))return err(422,{code:422,error_code:'user_already_exists',msg:'User already registered'});
    if(String(body.password||'').length<6)return err(422,{code:422,error_code:'weak_password',msg:'Password should be at least 6 characters.'});
    const id=uuid();db.users[id]={email:e,pw:body.password,meta:(body.data||{}),confirmed:!window.__MOCK_CONFIRM};newProfile(db,id,(body.data||{}).nickname||e.split('@')[0]);
    if(window.__MOCK_CONFIRM){save(db);return res(200,{id,email:e,confirmation_sent_at:new Date().toISOString()})}const s=ses(db,id);save(db);return res(200,s)}
  if(p==='/auth/v1/token'&&m==='POST'){const g=u.searchParams.get('grant_type');
    if(g==='password'){const e=String(body.email||'').toLowerCase();const id=Object.keys(db.users).find(k=>db.users[k].email===e&&db.users[k].pw===body.password);
      if(!id)return err(400,{code:400,error_code:'invalid_credentials',msg:'Invalid login credentials'});if(!db.users[id].confirmed)return err(400,{code:400,error_code:'email_not_confirmed',msg:'Email not confirmed'});
      const s=ses(db,id);save(db);return res(200,s)}
    if(g==='refresh_token'){const t=db.tok[body.refresh_token];if(!t||!t.refresh)return err(400,{code:400,error_code:'refresh_token_not_found',msg:'Invalid Refresh Token: Refresh Token Not Found'});delete db.tok[body.refresh_token];const s=ses(db,t.uid);save(db);return res(200,s)}}
  if(p==='/auth/v1/user'&&m==='GET'){if(!uid)return err(401,{code:401,msg:'invalid JWT'});const x=db.users[uid];return res(200,{id:uid,email:x.email,user_metadata:x.meta})}
  if(p==='/auth/v1/user'&&m==='PUT'){if(!uid)return err(401,{code:401,msg:'invalid JWT'});if(body.password)db.users[uid].pw=body.password;save(db);return res(200,{id:uid})}
  if(p==='/auth/v1/logout'){if(uid){for(const k in db.tok)if(db.tok[k].uid===uid)delete db.tok[k];save(db)}return new Response(null,{status:204})}
  if(p==='/auth/v1/recover'){return res(200,{})}
  if(p==='/rest/v1/gun_prices'&&m==='GET'){return res(200,PRICES)}
  if(p==='/rest/v1/gacha_config'&&m==='GET'){return res(200,[GCFG])}
  if(p==='/rest/v1/gacha_log'&&m==='GET'){if(!uid)return err(401,{message:'JWT expired'});return res(200,(db.glog||[]).filter(x=>x.uid===uid).slice(-50).reverse())}
  if(p.startsWith('/rest/v1/rpc/')){const fn=p.slice(13);if(!uid)return err(401,{code:'PGRST301',message:'JWT expired'});const P=db.prof[uid];
    // window.__MOCK_OFF = ['qz_season', ...]: a database that has not been updated yet
    if(window.__MOCK_OFF&&window.__MOCK_OFF.includes(fn))return err(404,{code:'PGRST202',message:'Could not find the function public.'+fn+' without parameters in the schema cache'});
    if(fn==='qz_me'){if(!P)newProfile(db,uid,db.users[uid].email.split('@')[0]);const Q=db.prof[uid];save(db);
      return res(200,{nickname:Q.nickname,coins:Q.coins,earned:Q.earned,matches:Q.matches,day_left:8000-(Q.day===today()?Q.dayE:0),fragments:Q.frags|0,pity:Q.pity|0,tickets:Q.tickets|0,free_today:Q.freeDay!==today(),rec:REC(Q),owned:db.own[uid]})}
    if(fn==='qz_set_nickname'){P.nickname=clean(body.p_nick);save(db);return res(200,P.nickname)}
    if(fn==='qz_buy'){const r=PM[body.p_gun];if(r&&r.tier)return pgerr('gacha_only');if(!r||!r.sold)return pgerr('not_for_sale');if(r.free||db.own[uid].includes(body.p_gun))return pgerr('already_owned');
      if(P.coins<r.price)return pgerr('not_enough_coins');P.coins-=r.price;db.own[uid].push(body.p_gun);db.log.push([uid,-r.price,'buy']);save(db);return res(200,{coins:P.coins,gun:body.p_gun})}
    if(fn==='qz_claim'){const mins=(Date.now()-(P.last||Date.now()-15*60e3))/60e3*(window.__MOCK_TIMEWARP||1);if(mins<1.5)return pgerr('too_soon');
      const cl=(v,a)=>Math.min(Math.max(v|0,0),a),k=cl(body.p_kills,80);let raw=body.p_mode==='scen'?80+40*cl(body.p_stage,5)+(body.p_cleared?150:0)+4*k
        :80+12*cl(body.p_rounds,10)+6*Math.min(k,60)+10*cl(body.p_infects,30)+4*Math.floor(cl(body.p_damage,60000)/1000)+(body.p_won?100:0)+(body.p_mvp?60:0);
      raw=Math.min(raw,900,Math.floor(mins*80));const d0=P.day===today()?P.dayE:0,bonus=P.day!==today()?200:0,got=Math.max(0,Math.min(raw+bonus,8000-d0));
      P.coins+=got;P.earned+=got;P.matches++;P.last=Date.now();P.day=today();P.dayE=d0+got;db.log.push([uid,got,'match']);save(db);
      const R0=P.rec||(P.rec={g:0,k:0,inf:0,best:0,xp:0,imported:false}),sc=cl(body.p_score,30000),inf=cl(body.p_infects,30),gx=Math.min(3000,Math.max(20,Math.round(sc*.6+k*8+inf*12)));
      R0.g++;R0.k+=k;R0.inf+=inf;R0.best=Math.max(R0.best,sc);R0.xp+=gx;save(db);
      return res(200,{got,coins:P.coins,bonus,raw,day_left:8000-P.dayE,xp_got:gx,rec:REC(P)})}
    if(fn==='qz_import_rec'){const R0=P.rec||(P.rec={g:0,k:0,inf:0,best:0,xp:0,imported:false});if(R0.imported)return pgerr('already_imported');
      const cl=(v,a)=>Math.min(Math.max(v|0,0),a),g=cl(body.p_games,5000);R0.imported=true;R0.g+=g;R0.k+=cl(body.p_kills,g*80);R0.inf+=cl(body.p_infects,g*30);R0.best=Math.max(R0.best,cl(body.p_best,30000));R0.xp+=cl(body.p_xp,Math.min(g*3000,300000));
      save(db);return res(200,{rec:REC(P)})}

    // ---- decoder bingo (same rules as schema.sql); window.__MOCK_SEQ = [numbers] forces the next draws, __MOCK_CARD = [25 numbers] the next card
    const BL=[[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],[0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],[0,6,12,18,24],[4,8,12,16,20]];
    const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
    const newCard=()=>{db.bingo=db.bingo||{};const old=db.bingo[uid];const nums=window.__MOCK_CARD?window.__MOCK_CARD.slice():shuf([...Array(GCFG.bingo_hi+1).keys()]).slice(0,25);window.__MOCK_CARD=null;
      db.bingo[uid]={nums,marked:Array(25).fill(false),drawn:[],rewards:shuf(PRICES.filter(x=>x.tier).map(x=>x.gun_id)).slice(0,12),done:Array(12).fill(false),boards:(old?old.boards:0)+1}};
    const cardJ=()=>{const b=db.bingo[uid],used=P.shufDay===today()?(P.shufs|0):0;return {...b,shuffles_left:Math.max(0,GCFG.shuffle_free-used)}};
    if(fn==='qz_bingo'){if(!db.bingo||!db.bingo[uid])newCard();save(db);return res(200,cardJ())}
    if(fn==='qz_bingo_reset'){newCard();save(db);return res(200,cardJ())}
    if(fn==='qz_bingo_shuffle'){const used=P.shufDay===today()?(P.shufs|0):0;if(used>=GCFG.shuffle_free)return pgerr('no_shuffles');if(!db.bingo||!db.bingo[uid])newCard();
      const b=db.bingo[uid],idx=b.marked.map((m,i)=>m?-1:i).filter(i=>i>=0),vals=shuf(idx.map(i=>b.nums[i]));idx.forEach((i,j)=>b.nums[i]=vals[j]);P.shufDay=today();P.shufs=used+1;save(db);return res(200,cardJ())}
    if(fn==='qz_decode'){const n=body.p_count|0,free=!!body.p_free,tk=!!body.p_ticket,g=GCFG,td=today();if(n!==1&&n!==10)return pgerr('bad_count');if(free&&tk)return pgerr('bad_count');
      if(free){if(n!==1)return pgerr('bad_count');if(P.freeDay===td)return pgerr('free_used')}else if(tk){if((P.tickets|0)<n)return pgerr('not_enough_tickets')}
      const cost=free||tk?0:(n===10?g.dec_cost10:g.dec_cost1);if(P.coins<cost)return pgerr('not_enough_coins');
      if(!db.bingo||!db.bingo[uid])newCard();const owned=new Set(db.own[uid]);let cw=0,fw=0,card=0;const out=[];db.glog=db.glog||[];
      for(let i=0;i<n;i++){const b=db.bingo[uid];const left=[...Array(g.bingo_hi+1).keys()].filter(x=>!b.drawn.includes(x));
        let num=window.__MOCK_SEQ&&window.__MOCK_SEQ.length?window.__MOCK_SEQ.shift():left[Math.floor(Math.random()*left.length)];if(!left.includes(num))num=left[0];
        b.drawn.push(num);const c=b.nums.indexOf(num),lines=[];
        if(c>=0){b.marked[c]=true;BL.forEach((ln,k)=>{if(b.done[k]||!ln.every(x=>b.marked[x]))return;b.done[k]=true;const gun=b.rewards[k],tier=(PM[gun]||{}).tier;let kind,amount=0;
          if(gun&&!owned.has(gun)){kind='gun';owned.add(gun);db.own[uid].push(gun)}else if(tier==='S'){kind='coins';amount=g.full_s_coins;cw+=amount}else{kind='frags';amount=g.full_a_frags;fw+=amount}
          db.glog.push({uid,at:new Date().toISOString(),src:free?'free':tk?'ticket':'decode',kind,tier,gun_id:gun,amount});lines.push({line:k,kind,gun,tier,amount})})}
        const f=g.dec_frag_min+Math.floor(Math.random()*(g.dec_frag_max-g.dec_frag_min+1));fw+=f;out.push({n:num,cell:c>=0?c:null,lines,frags:f,card});
        if(b.marked.every(Boolean)||b.drawn.length>g.bingo_hi){newCard();card++}}
      P.coins=P.coins-cost+cw;P.frags=(P.frags|0)+fw;if(tk)P.tickets-=n;if(free)P.freeDay=td;save(db);
      return res(200,{draws:out,card:cardJ(),coins:P.coins,fragments:P.frags,cost,tickets:P.tickets|0,free_today:P.freeDay!==td})}
    // ---- the season card (same rules as qz_season*); __MOCK_SEQ / __MOCK_CARD work here too, __MOCK_SRW = [12 items] the next season card's line items
    const newSCard=()=>{db.season=db.season||{};const old=db.season[uid];const nums=window.__MOCK_CARD?window.__MOCK_CARD.slice():shuf([...Array(GCFG.season_hi+1).keys()]).slice(0,25);window.__MOCK_CARD=null;
      const rw=window.__MOCK_SRW?window.__MOCK_SRW.slice():shuf(GCFG.season_lines);window.__MOCK_SRW=null;while(rw.length<12)rw.push('coins:1000');
      db.season[uid]={nums,marked:Array(25).fill(false),drawn:[],rewards:rw.slice(0,12),done:Array(12).fill(false),boards:(old?old.boards:0)+1}};
    const scardJ=()=>{const b=db.season[uid],used=P.sShufDay===today()?(P.sShufs|0):0;return {...b,shuffles_left:Math.max(0,GCFG.shuffle_free-used)}};
    if(fn==='qz_season'){if(!db.season||!db.season[uid])newSCard();save(db);return res(200,scardJ())}
    if(fn==='qz_season_reset'){newSCard();save(db);return res(200,scardJ())}
    if(fn==='qz_season_shuffle'){const used=P.sShufDay===today()?(P.sShufs|0):0;if(used>=GCFG.shuffle_free)return pgerr('no_shuffles');if(!db.season||!db.season[uid])newSCard();
      const b=db.season[uid],idx=b.marked.map((m,i)=>m?-1:i).filter(i=>i>=0),vals=shuf(idx.map(i=>b.nums[i]));idx.forEach((i,j)=>b.nums[i]=vals[j]);P.sShufDay=today();P.sShufs=used+1;save(db);return res(200,scardJ())}
    if(fn==='qz_season_decode'){const n=body.p_count|0,g=GCFG;if(n!==1&&n!==10)return pgerr('bad_count');const cost=n===10?g.season_cost10:g.season_cost1;if(P.coins<cost)return pgerr('not_enough_coins');
      if(!db.season||!db.season[uid])newSCard();const owned=new Set(db.own[uid]);let cw=0,fw=0,tw=0,card=0;const out=[];db.glog=db.glog||[];
      for(let i=0;i<n;i++){const b=db.season[uid];const left=[...Array(g.season_hi+1).keys()].filter(x=>!b.drawn.includes(x));
        let num=window.__MOCK_SEQ&&window.__MOCK_SEQ.length?window.__MOCK_SEQ.shift():left[Math.floor(Math.random()*left.length)];if(!left.includes(num))num=left[0];
        b.drawn.push(num);const c=b.nums.indexOf(num),lines=[];
        if(c>=0){b.marked[c]=true;BL.forEach((ln,k)=>{if(b.done[k]||!ln.every(x=>b.marked[x]))return;b.done[k]=true;const item=b.rewards[k]||'',p=item.split(':');
          let kind=p[0],gun=null,amount=/^\d{1,7}$/.test(p[1]||'')?+p[1]:0;
          if(kind==='gun'){amount=0;gun=PM[p[1]]?p[1]:null;if(gun&&!owned.has(gun)){owned.add(gun);db.own[uid].push(gun)}else{kind='coins';amount=g.season_owned_coins;cw+=amount}}
          else if(kind==='frags')fw+=amount;else if(kind==='tickets')tw+=amount;else{kind='coins';cw+=amount}
          db.glog.push({uid,at:new Date().toISOString(),src:'season',kind,tier:null,gun_id:gun,amount});lines.push({line:k,kind,gun,amount,item})})}
        const f=g.season_frag_min+Math.floor(Math.random()*(Math.max(g.season_frag_max-g.season_frag_min,0)+1));fw+=f;out.push({n:num,cell:c>=0?c:null,lines,frags:f,card});
        if(b.marked.every(Boolean)||b.drawn.length>g.season_hi){newSCard();card++}}
      P.coins=P.coins-cost+cw;P.frags=(P.frags|0)+fw;P.tickets=(P.tickets|0)+tw;save(db);
      return res(200,{draws:out,card:scardJ(),coins:P.coins,fragments:P.frags,tickets:P.tickets,cost})}
    if(fn==='qz_pull'){const n=body.p_count|0,free=!!body.p_free,g=GCFG,td=today();if(n!==1&&n!==10)return pgerr('bad_count');
      if(free){if(n!==1)return pgerr('bad_count');if(P.freeDay===td)return pgerr('free_used')}const cost=free?0:(n===10?g.cost10:g.cost1);if(P.coins<cost)return pgerr('not_enough_coins');
      const owned=new Set(db.own[uid]);let pity=P.pity|0,cw=0,fw=0,sa=false;const out=[];const R=window.__MOCK_RNG||Math.random;db.glog=db.glog||[];
      for(let i=1;i<=n;i++){pity++;const r=R();let tier=null,gun=null,kind,amt=0,hit=false;
        if(r<g.rate_s||pity>=g.pity){tier='S';hit=r>=g.rate_s;pity=0}else if(r<g.rate_s+g.rate_a)tier='A';else if(n===10&&i===10&&!sa)tier='A';
        if(tier){sa=true;const left=PRICES.filter(x=>x.tier===tier&&!owned.has(x.gun_id));if(left.length){gun=left[Math.floor(Math.random()*left.length)].gun_id;owned.add(gun);db.own[uid].push(gun);kind='gun'}
          else if(tier==='S'){kind='coins';amt=g.full_s_coins}else{kind='frags';amt=g.full_a_frags}}
        else if(r<g.rate_s+g.rate_a+g.rate_coin){kind='coins';const tot=g.coin_table.reduce((a,c)=>a+c[1],0);let w=Math.floor(Math.random()*tot),acc=0;amt=100;for(const [c,ww] of g.coin_table){acc+=ww;if(w<acc){amt=c;break}}}
        else{kind='frags';amt=g.frag_min+Math.floor(Math.random()*(g.frag_max-g.frag_min+1))}
        if(kind==='coins')cw+=amt;else if(kind==='frags')fw+=amt;out.push({kind,tier,gun,amount:amt,pity:hit});db.glog.push({uid,at:new Date().toISOString(),src:free?'free':'pull',kind,tier,gun_id:gun,amount:amt,pity_hit:hit})}
      P.coins=P.coins-cost+cw;P.frags=(P.frags|0)+fw;P.pity=pity;if(free)P.freeDay=td;save(db);
      return res(200,{results:out,coins:P.coins,fragments:P.frags,pity:P.pity,cost,free_today:P.freeDay!==td})}
    if(fn==='qz_exchange'){const r=PM[body.p_gun];if(!r||!r.tier)return pgerr('not_for_exchange');const c=r.tier==='S'?GCFG.ex_s:GCFG.ex_a;
      if(db.own[uid].includes(body.p_gun))return pgerr('already_owned');if((P.frags|0)<c)return pgerr('not_enough_frags');P.frags-=c;db.own[uid].push(body.p_gun);
      db.glog=db.glog||[];db.glog.push({uid,at:new Date().toISOString(),src:'exchange',kind:'gun',tier:r.tier,gun_id:body.p_gun,amount:-c,pity_hit:false});save(db);return res(200,{gun:body.p_gun,fragments:P.frags})}
    return err(404,{code:'PGRST202',message:'function not found'})}
  return err(404,{message:'not found '+p})}catch(e){return err(500,{message:String(e)})}}})();
