// a stand-in for Supabase (auth + the qz_* functions), same rules as supabase/schema.sql; state kept in localStorage
(function(){const URL0='https://mock.supabase.test';window.QZ_SB={url:URL0,key:'anon-test-key',oauth:['google','kakao']};
const PRICES=[{"gun_id": "knife", "price": 0, "free": true, "sold": true, "tier": null}, {"gun_id": "p9", "price": 0, "free": true, "sold": true, "tier": null}, {"gun_id": "sg8", "price": 0, "free": true, "sold": true, "tier": null}, {"gun_id": "k5", "price": 0, "free": true, "sold": true, "tier": null}, {"gun_id": "g35", "price": 0, "free": true, "sold": true, "tier": null}, {"gun_id": "f7", "price": 1200, "free": false, "sold": true, "tier": null}, {"gun_id": "d50", "price": 1500, "free": false, "sold": true, "tier": null}, {"gun_id": "tw9", "price": 1800, "free": false, "sold": true, "tier": null}, {"gun_id": "r6", "price": 2000, "free": false, "sold": true, "tier": null}, {"gun_id": "db2", "price": 1500, "free": false, "sold": true, "tier": null}, {"gun_id": "m14", "price": 3500, "free": false, "sold": true, "tier": null}, {"gun_id": "as12", "price": 4500, "free": false, "sold": true, "tier": null}, {"gun_id": "k9", "price": 1200, "free": false, "sold": true, "tier": null}, {"gun_id": "um45", "price": 1800, "free": false, "sold": true, "tier": null}, {"gun_id": "pd50", "price": 3000, "free": false, "sold": true, "tier": null}, {"gun_id": "br3", "price": 2500, "free": false, "sold": true, "tier": null}, {"gun_id": "kv47", "price": 3500, "free": false, "sold": true, "tier": null}, {"gun_id": "ar7", "price": 4000, "free": false, "sold": true, "tier": null}, {"gun_id": "ar5c", "price": 4500, "free": false, "sold": true, "tier": null}, {"gun_id": "hr17", "price": 5500, "free": false, "sold": true, "tier": null}, {"gun_id": "sr8", "price": 2500, "free": false, "sold": true, "tier": null}, {"gun_id": "r700", "price": 6500, "free": false, "sold": true, "tier": null}, {"gun_id": "dm14", "price": 7000, "free": false, "sold": true, "tier": null}, {"gun_id": "mg6", "price": 6000, "free": false, "sold": true, "tier": null}, {"gun_id": "hmg", "price": 6500, "free": false, "sold": true, "tier": null}, {"gun_id": "gx6", "price": 10000, "free": false, "sold": true, "tier": null}, {"gun_id": "airb", "price": 4500, "free": false, "sold": true, "tier": null}, {"gun_id": "gl40", "price": 5500, "free": false, "sold": true, "tier": null}, {"gun_id": "axe", "price": 1500, "free": false, "sold": true, "tier": null}, {"gun_id": "hammer", "price": 4000, "free": false, "sold": true, "tier": null}, {"gun_id": "skull9", "price": 0, "free": false, "sold": false, "tier": null}, {"gun_id": "killknife", "price": 12000, "free": false, "sold": true, "tier": null}, {"gun_id": "blaze8", "price": 6000, "free": false, "sold": true, "tier": null}, {"gun_id": "winchester", "price": 4500, "free": false, "sold": true, "tier": null}, {"gun_id": "balrog5", "price": 6500, "free": false, "sold": true, "tier": null}, {"gun_id": "balrog11", "price": 7000, "free": false, "sold": true, "tier": null}, {"gun_id": "plasma", "price": 7500, "free": false, "sold": true, "tier": null}, {"gun_id": "thunder", "price": 9500, "free": false, "sold": true, "tier": null}, {"gun_id": "bholemini", "price": 0, "free": false, "sold": false, "tier": null}, {"gun_id": "crimson", "price": 0, "free": false, "sold": false, "tier": null}, {"gun_id": "katana", "price": 9000, "free": false, "sold": true, "tier": null}, {"gun_id": "jhammer", "price": 7500, "free": false, "sold": true, "tier": null}, {"gun_id": "dde", "price": 8500, "free": false, "sold": true, "tier": null}, {"gun_id": "thanatos9", "price": 15000, "free": false, "sold": true, "tier": null}, {"gun_id": "m4dk", "price": 0, "free": false, "sold": false, "tier": null}, {"gun_id": "bhole", "price": 0, "free": false, "sold": false, "tier": null}, {"gun_id": "salamander", "price": 0, "free": false, "sold": false, "tier": null}, {"gun_id": "ak60r", "price": 0, "free": false, "sold": false, "tier": null}, {"gun_id": "dmp7", "price": 0, "free": false, "sold": false, "tier": null}, {"gun_id": "glock", "price": 1000, "free": false, "sold": true, "tier": null}, {"gun_id": "dglock", "price": 0, "free": false, "sold": false, "tier": null}, {"gun_id": "vector", "price": 3500, "free": false, "sold": true, "tier": null}, {"gun_id": "an94", "price": 5000, "free": false, "sold": true, "tier": null}, {"gun_id": "m82", "price": 8500, "free": false, "sold": true, "tier": null}, {"gun_id": "spas12d", "price": 0, "free": false, "sold": false, "tier": null}, {"gun_id": "m32c", "price": 0, "free": false, "sold": false, "tier": null}, {"gun_id": "rdc", "price": 0, "free": false, "sold": false, "tier": "S"}, {"gun_id": "mdrill", "price": 0, "free": false, "sold": false, "tier": "S"}, {"gun_id": "mlaunch", "price": 0, "free": false, "sold": false, "tier": "S"}, {"gun_id": "volc", "price": 0, "free": false, "sold": false, "tier": "S"}, {"gun_id": "bdc", "price": 0, "free": false, "sold": false, "tier": "S"}, {"gun_id": "gaebolg", "price": 0, "free": false, "sold": false, "tier": "S"}, {"gun_id": "xdz", "price": 0, "free": false, "sold": false, "tier": "A"}, {"gun_id": "ripper", "price": 0, "free": false, "sold": false, "tier": "A"}, {"gun_id": "xbowa", "price": 0, "free": false, "sold": false, "tier": "A"}, {"gun_id": "xbow", "price": 0, "free": false, "sold": false, "tier": "A"}, {"gun_id": "sterling", "price": 0, "free": false, "sold": false, "tier": "A"}, {"gun_id": "duckfoot", "price": 0, "free": false, "sold": false, "tier": "A"}];const PM={};for(const r of PRICES)PM[r.gun_id]=r;
const load=()=>{try{return JSON.parse(localStorage.getItem('__mockdb'))||{users:{},tok:{},prof:{},own:{},log:[]}}catch(e){return {users:{},tok:{},prof:{},own:{},log:[]}}};
const save=db=>localStorage.setItem('__mockdb',JSON.stringify(db));
const uuid=()=>'u'+Math.random().toString(16).slice(2,10)+Date.now().toString(16);
const clean=t=>{const n=String(t||'').replace(/[\u0000-\u001f]/g,'').replace(/\s+/g,' ').trim().slice(0,16);return n.length>=2?n:'생존자'};
const res=(st,body)=>new Response(body==null?'':JSON.stringify(body),{status:st,headers:{'Content-Type':'application/json'}});
const err=(st,o)=>res(st,o);const pgerr=m=>res(400,{code:'P0001',details:null,hint:null,message:m});
window.__mockCalls=[];
// v6.66: a session back from Google / Kakao — a test opens the page with #access_token=oauth_<provider>_<tag>&refresh_token=oauthr_<provider>_<tag>
// (the account is made the first time one of them comes in: the provider's name and e-mail in its metadata, a 생존자 + 4 digits nickname)
const oauthUser=(db,t)=>{const mt=/^oauthr?_(google|kakao)_([a-z0-9]{1,20})$/.exec(String(t||''));if(!mt)return;const id='uo_'+mt[1]+'_'+mt[2],a='oauth_'+mt[1]+'_'+mt[2],r='oauthr_'+mt[1]+'_'+mt[2];
  if(!db.users[id]){const e=mt[2]+'@gmail.com';db.users[id]={email:e,pw:null,meta:Object.assign({name:'홍길동',full_name:'홍길동',email:e},mt[1]==='kakao'?{nickname:'카카오닉'}:{}),prov:mt[1],confirmed:true};newProfile(db,id,autoNick())}
  if(!db.tok[a])db.tok[a]={uid:id,exp:Date.now()+3600e3,born:Date.now()};if(!db.tok[r]&&t===r)db.tok[r]={uid:id,refresh:1,born:Date.now()};save(db)};
// v6.66: an operator's answer to an inquiry (the admin page's qz_admin_inquiry_reply); done false keeps it open
window.__mockInqReply=(id,text,done)=>{const db=load(),q=(db.inq||[]).find(x=>x.id===id);if(!q)return false;q.reply=text;q.reply_at=new Date().toISOString();q.seen=false;if(done!==false)q.status='done';save(db);return true};
// (v6.72: born = when the session was signed into; a refresh keeps it — qz_account_delete wants it within 10 minutes; window.__MOCK_SES_AGE ages every session)
const ses=(db,uid,born)=>{born=born||Date.now();const a='at_'+uuid(),r='rt_'+uuid();db.tok[a]={uid,exp:Date.now()+3600e3,born};db.tok[r]={uid,refresh:1,born};const u=db.users[uid];
  return {access_token:a,token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,refresh_token:r,user:{id:uid,email:u.email,user_metadata:u.meta,app_metadata:{provider:u.prov||'email',providers:[u.prov||'email']}}}};
const REC=Q=>Object.assign({g:0,k:0,inf:0,best:0,xp:0,imported:false},Q.rec||{});
// v6.66: an account that picked no nickname (Google / Kakao) starts as 생존자 + 4 digits (schema.sql qz_auto_nick)
const autoNick=()=>'생존자'+String(Math.floor(Math.random()*10000)).padStart(4,'0');
const newProfile=(db,uid,nick)=>{if(db.prof[uid])return;let nk=clean(nick);if(Object.values(db.prof).some(q=>String(q.nickname).toLowerCase()===nk.toLowerCase()))nk=autoNick();db.prof[uid]={nickname:nk,coins:3000,earned:0,matches:0,last:null,day:null,dayE:0,frags:0,pity:0,freeDay:null,created:Date.now()};db.own[uid]=[];db.glog=db.glog||[];db.log.push([uid,3000,'welcome'])};
const GCFG={id:1,dec_cost1:600,dec_cost10:5400,bingo_hi:49,dec_frag_min:1,dec_frag_max:3,shuffle_free:3,cost1:500,cost10:4500,rate_s:0.02,rate_a:0.08,rate_coin:0.3,pity:60,coin_table:[[100,30],[200,30],[300,20],[500,15],[1000,5]],frag_min:2,frag_max:5,full_s_coins:3000,full_a_frags:30,ex_s:200,ex_a:80,daily_free:true,
  season_cost1:1000,season_cost10:9000,season_hi:99,season_frag_min:1,season_frag_max:3,season_owned_coins:10000,
  season_lines:['gun:bhole','gun:skull9','gun:salamander','coins:1000','coins:2000','coins:2000','coins:5000','frags:30','frags:30','tickets:3','tickets:3','tickets:3'],
  ref_new_coins:2000,ref_new_tickets:2,ref_coins:3000,ref_tickets:2,ref_matches:3,ref_cap:10,ref_days:7,
  side_cost1:500,side_cost10:4500,side_hi:80,side_frag_min:1,side_frag_max:2,side_owned_coins:5000,
  side_lines:['gun:bholemini','gun:crimson','coins:500','coins:1000','coins:1000','coins:2000','coins:3000','frags:20','frags:20','frags:30','tickets:1','tickets:1'],
  trans_frag_min:2,trans_frag_max:4,trans_cost:888,trans_guns:['m4dk']};
const today=()=>new Date(Date.now()+9*3600e3).toISOString().slice(0,10);
// daily missions (same pool and rules as schema.sql, v6.12); window.__MOCK_MIS = [3 pool ids] forces the next day's picks
const MPOOL=[['play1',1,'play',1,150,0],['kills20',1,'kills',20,150,0],['dmg20k',1,'damage',20000,150,0],['rounds5',1,'rounds',5,150,0],['hs3',1,'hs',3,200,0],
  ['play3',2,'play',3,300,0],['win1',2,'win',1,300,0],['kills60',2,'kills',60,350,0],['inf3',2,'infects',3,350,0],['hs12',2,'hs',12,400,0],['dmg60k',2,'damage',60000,350,0],
  ['win3',3,'win',3,500,3],['inf10',3,'infects',10,500,1],['hs30',3,'hs',30,500,1],['kills150',3,'kills',150,550,0],['dmg150k',3,'damage',150000,550,0],['play5',3,'play',5,600,0]]
  .map(([id,tier,kind,goal,coins,tickets])=>({id,tier,kind,goal,coins,tickets,ko:null,en:null}));
const misMake=(db,uid)=>{db.mis=db.mis||{};const d=today(),L=db.mis[uid]||[];if(L.some(m=>m.day===d))return;const keep=L.filter(m=>m.day>=new Date(Date.parse(d)-7*864e5).toISOString().slice(0,10));
  const kinds=[],ids=[],pick=window.__MOCK_MIS;window.__MOCK_MIS=null;
  for(let s=0;s<3;s++){let c=pick?MPOOL.filter(q=>q.id===pick[s]):MPOOL.filter(q=>q.tier===s+1&&!kinds.includes(q.kind));if(!c.length)c=MPOOL.filter(q=>!ids.includes(q.id)&&!kinds.includes(q.kind));if(!c.length)continue;
    const m=c[Math.floor(Math.random()*c.length)];kinds.push(m.kind);ids.push(m.id);keep.push({day:d,slot:s,id:m.id,tier:m.tier,kind:m.kind,goal:m.goal,coins:m.coins,tickets:s===2?Math.min(m.tickets,5):0,ko:m.ko,en:m.en,progress:0,claimed:false})}
  db.mis[uid]=keep};
const misJ=(db,uid)=>{const d=today(),mid=Date.parse(d+'T00:00:00Z')+864e5-9*3600e3;
  return {day:d,resets_in:Math.max(0,Math.floor((mid-Date.now())/1000)),missions:(db.mis&&db.mis[uid]||[]).filter(m=>m.day===d).sort((a,b)=>a.slot-b.slot).map(m=>({slot:m.slot,id:m.id,tier:m.tier,kind:m.kind,goal:m.goal,progress:m.progress,coins:m.coins,tickets:m.tickets,ko:m.ko,en:m.en,claimed:m.claimed}))}};
const rankV=(R,k)=>k==='kills'?R.k:k==='infects'?R.inf:k==='best'?R.best:R.xp;
// v6.57: achievements and titles (same list and rules as schema.sql: ach_defs, qz_ach_stats, qz_title_worn, qz_ach_claim, qz_title_wear)
const ACHD=JSON.parse('[["kill1","kill",1,"kills",100,300,0,null,0,10],["kill2","kill",2,"kills",1000,1000,0,"hunter",2,10],["kill3","kill",3,"kills",5000,2000,1,null,0,10],["kill4","kill",4,"kills",15000,3000,2,"slayer",4,10],["kill5","kill",5,"kills",40000,5000,3,"reaper",5,10],["hs1","hs",1,"hs",50,300,0,null,0,20],["hs2","hs",2,"hs",500,1000,0,"marksman",2,20],["hs3","hs",3,"hs",2500,2000,1,null,0,20],["hs4","hs",4,"hs",8000,4000,2,"oneshot",4,20],["dmg1","dmg",1,"dmg",200000,300,0,null,0,30],["dmg2","dmg",2,"dmg",2000000,1000,0,null,0,30],["dmg3","dmg",3,"dmg",10000000,2000,1,"firepower",3,30],["dmg4","dmg",4,"dmg",40000000,4000,2,"artillery",4,30],["knife1","knife",1,"kn",10,300,0,null,0,40],["knife2","knife",2,"kn",100,1000,0,"blade",2,40],["knife3","knife",3,"kn",500,2500,1,"bladedance",4,40],["mvp1","mvp",1,"mvp",5,300,0,null,0,50],["mvp2","mvp",2,"mvp",30,1000,0,"ace",3,50],["mvp3","mvp",3,"mvp",100,3000,2,"dominator",4,50],["inf1","inf",1,"inf",30,300,0,null,0,60],["inf2","inf",2,"inf",300,1000,0,"plague",2,60],["inf3","inf",3,"inf",1500,2500,1,"pandemic",3,60],["inf4","inf",4,"inf",5000,5000,3,"patientzero",5,60],["zw1","zw",1,"zw",10,300,0,null,0,70],["zw2","zw",2,"zw",100,1000,0,"horde",2,70],["zw3","zw",3,"zw",500,3000,2,"legion",4,70],["surv1","surv",1,"surv",10,300,0,null,0,80],["surv2","surv",2,"surv",100,1000,0,"survivor",2,80],["surv3","surv",3,"surv",500,2500,1,"immortal",4,80],["surv4","surv",4,"surv",2000,5000,3,"lasthuman",5,80],["win1","win",1,"wins",5,300,0,null,0,90],["win2","win",2,"wins",50,1500,0,"resistance",3,90],["win3","win",3,"wins",200,4000,2,"hero",4,90],["ep1","ep",1,"ep",1,500,0,null,0,100],["ep2","ep",2,"ep",3,1500,1,null,0,100],["ep3","ep",3,"ep",5,3000,2,"liberator",4,100],["s2c1","s2c",1,"s2a",5,3000,2,"rt2",3,101],["s2c2","s2c",2,"s2h",5,6000,3,"unyielding",4,101],["s2c3","s2c",3,"s2x",5,10000,5,"dawn",5,101],["tags1","tags",1,"rt1",7,4000,3,"dogtags",4,102],["eph1","eph",1,"eph",1,1000,0,null,0,110],["eph2","eph",2,"eph",3,2500,1,null,0,110],["eph3","eph",3,"eph",5,5000,3,"hellwalker",4,110],["epx1","epx",1,"epx",1,2000,1,"expert",4,120],["epx2","epx",2,"epx",5,8000,5,"nightmare",5,120],["medal1","medal",1,"medal",1,1000,0,"flawless",3,130],["medal2","medal",2,"medal",5,3000,2,null,0,130],["medal3","medal",3,"medal",15,6000,4,"perfect",5,130],["hof1","hof",1,"hof",1,3000,2,null,0,140],["pk1","pk",1,"pk",50,300,0,null,0,150],["pk2","pk",2,"pk",500,1500,0,"gunslinger",2,150],["pk3","pk",3,"pk",3000,4000,2,"duelist",4,150],["pw1","pw",1,"pw",5,300,0,null,0,160],["pw2","pw",2,"pw",50,1500,0,"merc",3,160],["pw3","pw",3,"pw",200,4000,2,"warhound",4,160],["rw1","rw",1,"rw",1,500,0,null,0,170],["rw2","rw",2,"rw",10,2000,1,"armsmaster",4,170],["bomb1","bomb",1,"bm",5,300,0,null,0,180],["bomb2","bomb",2,"bm",50,2000,1,"demolition",3,180],["lv1","lv",1,"lv",10,500,0,"recruit",1,190],["lv2","lv",2,"lv",20,1000,0,"veteran",2,190],["lv3","lv",3,"lv",30,2500,1,"elite",3,190],["lv4","lv",4,"lv",40,5000,3,"oldguard",4,190],["games1","games",1,"games",10,300,0,null,0,200],["games2","games",2,"games",100,1000,0,"regular",2,200],["games3","games",3,"games",500,3000,2,"resident",3,200],["games4","games",4,"games",2000,6000,4,"legend",5,200],["hours1","hours",1,"hours",10,500,0,null,0,210],["hours2","hours",2,"hours",50,1500,0,"nightshift",2,210],["hours3","hours",3,"hours",200,4000,2,"oldtimer",4,210],["guns1","guns",1,"guns",10,500,0,null,0,220],["guns2","guns",2,"guns",25,1500,0,"collector",2,220],["guns3","guns",3,"guns",45,4000,2,"arsenal",4,220],["cure1","cure",1,"cu",1,300,0,null,0,230],["cure2","cure",2,"cu",20,1500,0,"medic",3,230],["cure3","cure",3,"cu",100,4000,2,"savior",4,230],["mark1","mark",1,"mk",20,300,0,null,0,240],["mark2","mark",2,"mk",300,1500,0,"tracker",3,240],["crate1","crate",1,"cr",5,300,0,null,0,250],["crate2","crate",2,"cr",50,1500,0,"supply",2,250]]').map(([id,grp,tier,stat,goal,coins,tickets,title,g,ord])=>({id,grp,tier,stat,goal,coins,tickets,title,g,ord}));
const LVT=[0,300,654,1072,1565,2147,2834,3645,4602,5731,7063,8635,10490,12679,15262,18310,21907,26151,31159,37068,44041,52269,61978,73435,86954,102906,121729,143940,170149,201076,237570,280633,331447,391408,462162,545652,644170,760421,897597,1059465,1250469,1475854,1741808,2055634,2425949,2862921,3378548,3986988,4704947,5552139,6551826,7731457,9123422,10765941,12704113,14991156,17689867,20874346,24632031,29066099,34298299,40472295,47757610,56354282,66498355,78468361,92592968,109260004,128927106,152134286,179518758,211832435,249962574,294956138,348048544,410697583,484623449,571855971,674790347,796252911,939578737,1108703212,1308270093,1543759013,1821635939,2149530712,2536446544,2993007226,3531748831,4167463925,4917607736,5802777433,6847277675,8079787961,9534150098,11250297420,13275351260,15664914791,18484599758],lvOf=xp=>LVT.filter(t=>t<=Math.max(0,xp|0)).length;
const of=window.fetch.bind(window);
window.fetch=async function(input,init){const url=typeof input==='string'?input:input.url;if(!url.startsWith(URL0))return of(input,init);
  init=init||{};const m=(init.method||'GET').toUpperCase(),u=new URL(url),p=u.pathname,body=init.body?JSON.parse(init.body):null,H=init.headers||{};
  window.__mockCalls.push(m+' '+p+u.search);if(window.__MOCK_DOWN)throw new TypeError('Failed to fetch');
  if(H.apikey!=='anon-test-key')return err(401,{message:'Invalid API key'});
  const db=load();const bearer=String(H.Authorization||'').replace('Bearer ','');oauthUser(db,bearer);oauthUser(db,body&&body.refresh_token);const tk=db.tok[bearer];const uid=tk&&!tk.refresh&&tk.exp>Date.now()?tk.uid:null;
  // the hall of fame (v6.24; same rules as qz_claim / qz_ep_firsts): db.hof = [{ep,diff,match,at,time,members:[uid]}]
  // v7.0: an account's chapter records as qz_eps lists them (db.prof[uid].epr: {ep, diff, clears, medal, first, t}), the seasons' finishers (qz_ep_seasons)
  const epsOf=id=>Object.values((db.prof[id]||{}).epr||{}).sort((a,b)=>a.ep-b.ep||a.diff-b.diff).map(e=>({ep:e.ep,diff:e.diff,plays:e.clears,clears:e.clears,best_time:e.t||null,best_medal:e.medal||(e.clears>0?'B':null),best_lives:null,first_at:e.first||null}));
  const seasons=()=>{const out=[];for(let s=1;s*5<=10;s++){const tiers=[0,2,3].map(lv=>{const L0=[];
      for(const id in db.prof){const Q=db.prof[id];if(Q.banned)continue;const E=Object.values(Q.epr||{}).filter(e=>e.clears>0&&e.first&&e.diff>=lv&&e.ep>=s*5-4&&e.ep<=s*5),at={};
        for(const e of E)if(!at[e.ep]||e.first<at[e.ep])at[e.ep]=e.first;const k=Object.keys(at);if(k.length===5)L0.push({id,nick:Q.nickname,at:k.map(x=>at[x]).sort().pop()})}
      L0.sort((a,b)=>a.at<b.at?-1:a.at>b.at?1:a.nick<b.nick?-1:1);const mi=uid?L0.findIndex(x=>x.id===uid):-1;
      return {lv,n:L0.length,first:L0.slice(0,10).map(x=>({nick:x.nick,at:x.at})),me:mi>=0?{rank:mi+1,at:L0[mi].at}:null}});
    out.push({season:s,from:s*5-4,to:s*5,tiers})}return out};
  const HOFL=()=>db.hof||(db.hof=[]),hofOf=id=>HOFL().filter(h=>h.members.includes(id)).map(h=>h.ep*10+h.diff).sort((a,b)=>a-b),hofBest=id=>{const L=hofOf(id);return L.length?L[L.length-1]:null};
  // v6.57: the numbers an achievement reads, the tiers claimed (db.achc[uid] = [{id,at}]), the title worn (window.__MOCK_ACH = {stat: n} adds to the numbers)
  const ACL=id=>(db.achc||(db.achc={}))[id]||(db.achc[id]=[]),achStats=id=>{const Q=db.prof[id],R=REC(Q),E=Object.values(Q.epr||{});
    const n=f=>new Set(E.filter(e=>e.clears>0&&f(e)).map(e=>e.ep)).size;// (v7.0: s2a / s2h / s2x season 2's chapters on any / hard+ / expert, rt1 RT-1's seven)
    return Object.assign({},Q.ach||{},{ep:n(()=>true),eph:n(e=>e.diff>=2),epx:n(e=>e.diff===3),
      s2a:n(e=>e.ep>=6&&e.ep<=10),s2h:n(e=>e.ep>=6&&e.ep<=10&&e.diff>=2),s2x:n(e=>e.ep>=6&&e.ep<=10&&e.diff===3),rt1:n(e=>[2,4,6,7,8,9,10].includes(e.ep)),
      medal:E.filter(e=>e.medal==='S').length,kills:R.k,inf:R.inf,games:R.g,lv:lvOf(R.xp),hours:Math.floor((Q.playSecs|0)/3600),guns:(db.own[id]||[]).length,hof:hofOf(id).length},
      id===uid&&window.__MOCK_ACH?Object.fromEntries(Object.entries(window.__MOCK_ACH).map(([k,v])=>[k,v+((Object.assign({},Q.ach||{},{kills:R.k,inf:R.inf,games:R.g,lv:lvOf(R.xp),guns:(db.own[id]||[]).length}))[k]|0)])):{})},
    achHas=(id,d)=>ACL(id).some(c=>c.id===d.id),achReady=id=>{const S0=achStats(id);return ACHD.filter(d=>!achHas(id,d)&&(S0[d.stat]|0)>=d.goal).length},
    titleWorn=id=>{const Q=db.prof[id];if(!Q)return null;const w=Q.title;if(w==='none')return null;
      if(w&&/^hof:/.test(w)){if(hofOf(id).includes(+w.slice(4)))return w}else if(w&&ACL(id).some(c=>{const d=ACHD.find(x=>x.id===c.id);return d&&d.title===w}))return w;
      const b=hofBest(id);if(b!=null)return 'hof:'+b;const L=ACL(id).map(c=>({c,d:ACHD.find(x=>x.id===c.id)})).filter(x=>x.d&&x.d.title).sort((a,b)=>b.d.g-a.d.g||b.c.at-a.c.at||b.d.ord-a.d.ord);return L.length?L[0].d.title:null},
    achJ=id=>{const S0=achStats(id);return {stats:S0,claimed:ACL(id).map(c=>c.id),ready:ACHD.filter(d=>!achHas(id,d)&&(S0[d.stat]|0)>=d.goal).length,title:db.prof[id].title||null,worn:titleWorn(id),
      defs:ACHD.map(d=>({id:d.id,grp:d.grp,tier:d.tier,stat:d.stat,goal:d.goal,coins:d.coins,tickets:d.tickets,title:d.title,g:d.g}))}},
    achAdd=(id,o)=>{const Q=db.prof[id];Q.ach=Q.ach||{};for(const k in o){const v=o[k]|0;if(v)Q.ach[k]=(Q.ach[k]|0)+v}};
  try{
  if(p==='/auth/v1/signup'&&m==='POST'){const e=String(body.email||'').toLowerCase();if(!/^\S+@\S+\.\S+$/.test(e))return err(400,{code:400,error_code:'validation_failed',msg:'Unable to validate email address: invalid format'});
    if(Object.values(db.users).some(x=>x.email===e))return err(422,{code:422,error_code:'user_already_exists',msg:'User already registered'});
    if(String(body.password||'').length<6)return err(422,{code:422,error_code:'weak_password',msg:'Password should be at least 6 characters.'});
    const id=uuid(),nk=clean((body.data||{}).nickname);db.users[id]={email:e,pw:body.password,meta:(body.data||{}),prov:'email',confirmed:!window.__MOCK_CONFIRM};newProfile(db,id,nk==='생존자'?autoNick():nk);
    if(window.__MOCK_CONFIRM){save(db);return res(200,{id,email:e,confirmation_sent_at:new Date().toISOString()})}const s=ses(db,id);save(db);return res(200,s)}
  if(p==='/auth/v1/token'&&m==='POST'){const g=u.searchParams.get('grant_type');
    if(g==='password'){const e=String(body.email||'').toLowerCase();const id=Object.keys(db.users).find(k=>db.users[k].email===e&&db.users[k].pw===body.password);
      if(!id)return err(400,{code:400,error_code:'invalid_credentials',msg:'Invalid login credentials'});if(!db.users[id].confirmed)return err(400,{code:400,error_code:'email_not_confirmed',msg:'Email not confirmed'});
      const s=ses(db,id);save(db);return res(200,s)}
    if(g==='refresh_token'){const t=db.tok[body.refresh_token];if(!t||!t.refresh)return err(400,{code:400,error_code:'refresh_token_not_found',msg:'Invalid Refresh Token: Refresh Token Not Found'});delete db.tok[body.refresh_token];const s=ses(db,t.uid,t.born);save(db);return res(200,s)}}
  if(p==='/auth/v1/user'&&m==='GET'){if(!uid)return err(401,{code:401,msg:'invalid JWT'});const x=db.users[uid];return res(200,{id:uid,email:x.email,user_metadata:x.meta,app_metadata:{provider:x.prov||'email',providers:[x.prov||'email']}})}
  // v6.66: the project's public auth settings (which providers are on): window.__MOCK_PROVIDERS = {google:false,…} switches some off, __MOCK_SETTINGS_DOWN fails it
  if(p==='/auth/v1/settings'&&m==='GET'){if(window.__MOCK_SETTINGS_DOWN)return err(500,{message:'down'});return res(200,{external:Object.assign({email:true,google:true,kakao:true},window.__MOCK_PROVIDERS||{}),disable_signup:false,mailer_autoconfirm:!window.__MOCK_CONFIRM})}
  if(p==='/auth/v1/user'&&m==='PUT'){if(!uid)return err(401,{code:401,msg:'invalid JWT'});if(body.password)db.users[uid].pw=body.password;save(db);return res(200,{id:uid})}
  if(p==='/auth/v1/logout'){if(uid){for(const k in db.tok)if(db.tok[k].uid===uid)delete db.tok[k];save(db)}return new Response(null,{status:204})}
  if(p==='/auth/v1/recover'){return res(200,{})}
  if(p==='/rest/v1/gun_prices'&&m==='GET'){return res(200,PRICES)}
  if(p==='/rest/v1/gacha_config'&&m==='GET'){return res(200,[GCFG])}
  if(p==='/rest/v1/gacha_log'&&m==='GET'){if(!uid)return err(401,{message:'JWT expired'});return res(200,(db.glog||[]).filter(x=>x.uid===uid).slice(-50).reverse())}
  // ---- public rooms (same rules as qz_room_up / qz_room_down / qz_rooms); window.__MOCK_ROOMS_AGE = seconds added to every room's age
  const RM=()=>{db.rooms=db.rooms||{};const now=Date.now(),age=r=>(now-r.upd)/1000+(window.__MOCK_ROOMS_AGE||0);for(const c in db.rooms)if(age(db.rooms[c])>45)delete db.rooms[c];return age};
  if(p==='/rest/v1/rpc/qz_rooms'){if(window.__MOCK_OFF&&window.__MOCK_OFF.includes('qz_rooms'))return err(404,{code:'PGRST202',message:'Could not find the function public.qz_rooms without parameters in the schema cache'});const age=RM();save(db);
    return res(200,Object.values(db.rooms).filter(r=>age(r)<30).sort((a,b)=>b.made-a.made).slice(0,50).map(r=>({code:r.code,host_name:r.host_name,map:r.map,mode:r.mode,players:r.players,max_players:r.max_players,status:r.status})))}
  if(p==='/rest/v1/rpc/qz_room_up'&&uid){if(window.__MOCK_OFF&&window.__MOCK_OFF.includes('qz_room_up'))return err(404,{code:'PGRST202',message:'Could not find the function public.qz_room_up'});
    const age=RM(),b=body||{},code=String(b.p_code||'').slice(0,8).toUpperCase(),cl=(v,lo,hi,d)=>Math.min(Math.max(v==null?d:v|0,lo),hi);if(!/^[A-Z0-9]{4}$/.test(code))return pgerr('bad_code');
    const mx=cl(b.p_max,1,20,8),o={code,host:uid,host_name:clean(String(b.p_name||'').slice(0,64)),map:String(b.p_map||'').slice(0,64).replace(/[^A-Za-z0-9_-]/g,'').slice(0,16),
      mode:String(b.p_mode||'').slice(0,64).replace(/[^a-z]/g,'').slice(0,8)||'mut',players:Math.min(cl(b.p_players,0,20,1),mx),max_players:mx,status:b.p_status==='playing'?'playing':'lobby'};
    const r=db.rooms[code];if(r&&r.host!==uid)return pgerr('room_taken');
    if(r&&(age(r)<1||age(r)<5&&['host_name','map','mode','players','max_players','status'].every(k=>r[k]===o[k]))){save(db);return res(200,{ok:true,code,skipped:true})}
    if(!r){if(Object.values(db.rooms).some(x=>x.host===uid&&age(x)<3))return pgerr('too_soon');for(const c in db.rooms)if(db.rooms[c].host===uid)delete db.rooms[c];
      if(Object.keys(db.rooms).length>=500)return pgerr('too_many_rooms')}
    db.rooms[code]=Object.assign(o,{made:r?r.made:Date.now(),upd:Date.now()});window.__mockRoomUps=(window.__mockRoomUps||0)+1;save(db);return res(200,{ok:true,code})}
  if(p==='/rest/v1/rpc/qz_room_down'&&uid){RM();const code=String((body||{}).p_code||'').slice(0,8).toUpperCase(),r=db.rooms[code],gone=!!(r&&r.host===uid);if(gone)delete db.rooms[code];save(db);return res(200,{ok:true,gone})}
  if(p.startsWith('/rest/v1/rpc/')){const fn=p.slice(13);
    if(window.__MOCK_OFF&&window.__MOCK_OFF.includes(fn))return err(404,{code:'PGRST202',message:'Could not find the function public.'+fn+' without parameters in the schema cache'});
    // v6.65: the game's error reports (anyone may send; kept on window.__mockErr with whether a bearer rode along)
    if(fn==='qz_err_report'){(window.__mockErr=window.__mockErr||[]).push(Object.assign({},body,{_auth:!!H.Authorization}));return res(200,{ok:!!(body&&String(body.p_msg||'').trim())})}
    // v6.66: inquiries (anyone; same rules as qz_inquiry_send / qz_my_inquiries): db.inq, what was sent also on window.__mockInq
    if(fn==='qz_inquiry_send'||fn==='qz_my_inquiries'){const IQ=db.inq||(db.inq=[]),b=body||{},now=Date.now();
      if(fn==='qz_inquiry_send'){const kind=['bug','account','report','idea','etc'].includes(b.p_kind)?b.p_kind:'etc';
        const txt=String(b.p_body||'').replace(/\r/g,'').replace(/[\x01-\x09\x0b-\x1f\x7f]/g,' ').replace(/\n{3,}/g,'\n\n').trim();
        if(txt.length<5)return pgerr('inq_short');if(txt.length>1000)return pgerr('inq_long');
        if(uid){if(IQ.filter(q=>q.uid===uid&&now-q.at<3600e3).length>=5||IQ.filter(q=>q.uid===uid&&now-q.at<864e5).length>=20)return pgerr('inq_slow')}
        else if(IQ.filter(q=>!q.uid&&now-q.at<3600e3).length>=60||IQ.filter(q=>!q.uid&&q.status==='new').length>=300)return pgerr('inq_busy');
        const ticket=[...Array(32)].map(()=>'0123456789abcdef'[Math.floor(Math.random()*16)]).join(''),ctx=b.p_ctx&&typeof b.p_ctx==='object'&&!Array.isArray(b.p_ctx)&&JSON.stringify(b.p_ctx).length<=800?b.p_ctx:null;
        db.inqId=(db.inqId|0)+1;IQ.push({id:db.inqId,uid:uid||null,ticket,nick:uid&&db.prof[uid]?db.prof[uid].nickname:null,kind,body:txt,contact:String(b.p_contact||'').replace(/[\x00-\x1f]/g,' ').trim().slice(0,100)||null,ctx,status:'new',reply:null,reply_at:null,seen:true,at:now});
        (window.__mockInq=window.__mockInq||[]).push(Object.assign({},b,{_auth:!!uid}));save(db);return res(200,{ok:true,id:db.inqId,ticket})}
      const T=(Array.isArray(b.p_tickets)?b.p_tickets:[]).filter(t=>/^[0-9a-f]{32}$/.test(String(t))).slice(0,30),mine=q=>!!(uid&&q.uid===uid)||T.includes(q.ticket);
      const nw=IQ.filter(q=>mine(q)&&q.reply&&!q.seen).length,rows=IQ.filter(mine).sort((x,y)=>y.id-x.id).slice(0,30)
        .map(q=>({id:q.id,kind:q.kind,body:q.body,at:new Date(q.at).toISOString(),status:q.status,reply:q.reply,reply_at:q.reply_at,new:!!q.reply&&!q.seen,mine:!!uid&&q.uid===uid}));
      if(b.p_mark!==false&&nw)for(const q of IQ)if(mine(q)&&q.reply)q.seen=true;save(db);return res(200,{rows,new:nw})}
    if(fn==='qz_titles_of'){const N=(Array.isArray(body&&body.p_names)?body.p_names:[]).slice(0,16),o={};for(const id in db.prof){const n=db.prof[id].nickname;if(!N.includes(n))continue;const w=titleWorn(id);o[n]=o[n]||[];if(w&&!o[n].includes(w))o[n].push(w)}return res(200,o)}
    if(fn==='qz_ep_seasons')return res(200,seasons());
    if(fn==='qz_ep_firsts')return res(200,HOFL().slice().sort((a,b)=>a.ep-b.ep||a.diff-b.diff).map(h=>({ep:h.ep,diff:h.diff,at:h.at,time:h.time,team:h.members.map(id=>db.prof[id]?db.prof[id].nickname:null).filter(Boolean)})));
    // the ranking: anyone (a guest too); nicknames and records only, accounts without a finished match left out
    // v6.42: the server notices showing now (anyone): window.__MOCK_NOTICES = [{id,title,body,level,popup,starts_at,ends_at}]
    if(fn==='qz_notices')return res(200,window.__MOCK_NOTICES||[]);
    // v6.74: is a nickname free, any case (qz_nick_free; anyone may ask)
    if(fn==='qz_nick_free'){const raw=String((body||{}).p_nick||'').replace(/[\u0000-\u001f]/g,'').trim(),n=clean(raw);if(raw.length<2)return res(200,{ok:false,why:'nick_short',nick:n});
      return res(200,{ok:!Object.keys(db.prof).some(id=>id!==uid&&String(db.prof[id].nickname).toLowerCase()===n.toLowerCase()),nick:n})}
    if(fn==='qz_ranking'){const k=['level','kills','infects','best'].includes(body&&body.p_kind)?body.p_kind:'level',ids=Object.keys(db.prof);
      const all=ids.map((id,i)=>({id,i,R:REC(db.prof[id]),n:db.prof[id].nickname})).filter(x=>x.R.g>0).map(x=>({...x,v:rankV(x.R,k)}));
      all.sort((a,b)=>b.v-a.v||b.R.xp-a.R.xp||a.i-b.i);const rk=v=>1+all.filter(x=>x.v>v).length;
      const top=all.slice(0,50).map(x=>({rank:rk(x.v),nickname:x.n,value:x.v,xp:x.R.xp,games:x.R.g,me:x.id===uid,ft:hofBest(x.id),tt:titleWorn(x.id)}));
      let me=null;if(uid&&db.prof[uid]){const R=REC(db.prof[uid]),v=rankV(R,k);me={nickname:db.prof[uid].nickname,value:v,xp:R.xp,games:R.g,rank:R.g>0?rk(v):null,ft:hofBest(uid),tt:titleWorn(uid)}}
      return res(200,{kind:k,top,me,total:all.length})}
    // (v6.88: the chat's reading, and a guest's line, answer guests too)
    if(!uid&&!['qz_online','qz_chat_who','qz_chat_recent','qz_chat_guest_post','qz_chat_glines'].includes(fn))return err(401,{code:'PGRST301',message:'JWT expired'});const P=db.prof[uid];
    // window.__MOCK_OFF = ['qz_season', ...]: a database that has not been updated yet (checked above)
    // ---- friends and gifts (v6.18; same rules as schema.sql) ----
    const FC=id=>{const Q=db.prof[id];if(Q&&!Q.fcode){const A='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let c;do{c='';for(let i=0;i<6;i++)c+=A[Math.floor(Math.random()*31)]}while(Object.values(db.prof).some(x=>x.fcode===c));Q.fcode=c}return Q?Q.fcode:null};
    const FRL=()=>db.fr||(db.fr=[]),GFL=()=>db.gifts||(db.gifts=[]),pair=(x,y)=>FRL().find(f=>f.a===x&&f.b===y||f.a===y&&f.b===x);
    // v6.74: blocks (db.blk = [{a, b, at}]: a blocked b)
    const BLK=()=>db.blk||(db.blk=[]),blocked=(x,y)=>BLK().some(k=>k.a===x&&k.b===y||k.a===y&&k.b===x);
    const find=w=>{w=String(w||'').trim();if(!w)throw 'not_found';if(/^k:[0-9a-f]{20}$/i.test(w)){const c=(db.ckeys||{})[w.slice(2).toLowerCase()];if(!c)throw 'not_found';return c.uid}const c=w.toUpperCase().replace(/[^A-Z0-9]/g,'');if(c.length===6)for(const id in db.prof){FC(id);if(db.prof[id].fcode===c)return id}
      const ids=Object.keys(db.prof).filter(id=>db.prof[id].nickname.toLowerCase()===w.toLowerCase());if(!ids.length)throw 'not_found';if(ids.length>1)throw 'nick_many';return ids[0]};
    const card=(id,x)=>{const Q=db.prof[id];FC(id);return Object.assign({code:Q.fcode,nickname:Q.nickname,xp:REC(Q).xp,ft:hofBest(id),tt:titleWorn(id)},x||{})};
    const DML=()=>db.dms||(db.dms=[]),dmNew=()=>DML().filter(m=>m.to===uid&&!m.seen).length,touch=()=>{if(P)P.seenT=Date.now()};
    // ---- invites (v6.37; same rules as qz_invite* / qz_ref_*) ----
    const IVL=()=>db.inv||(db.inv=[]),invMine=()=>IVL().filter(i=>i.to===uid&&Date.now()-i.at<180e3),invN=()=>invMine().length;
    const invJ=()=>invMine().sort((a,b)=>b.at-a.at).map(i=>({code:i.code,map:i.map,mode:i.mode,at:new Date(i.at).toISOString(),from:db.prof[i.from].nickname,fc:FC(i.from),ft:hofBest(i.from),tt:titleWorn(i.from)}));
    const RFL=()=>db.refs||(db.refs=[]),refJ=Q=>({by:Q.refBy&&db.prof[Q.refBy]?db.prof[Q.refBy].nickname:null,done:!!Q.refDone,left:Math.max(0,GCFG.ref_matches-(Q.matches|0)),
      n:RFL().filter(r=>r.referrer===uid).length,paid:RFL().filter(r=>r.referrer===uid&&r.rewarded).length,new:RFL().filter(r=>r.referrer===uid&&!r.seen).length});
    const frJ=()=>{FC(uid);touch();const L=FRL(),last=Q=>{const t=Math.max(Q.last||0,Q.lastR||0,Q.seenT||0);return t?new Date(t).toISOString():null};
      return {code:db.prof[uid].fcode,friends:L.filter(f=>f.acc&&(f.a===uid||f.b===uid)).map(f=>{const o=f.a===uid?f.b:f.a;return card(o,{last:last(db.prof[o]),seen:db.prof[o].seenT?new Date(db.prof[o].seenT).toISOString():null,since:f.accAt,dm:DML().filter(m=>m.to===uid&&m.from===o&&!m.seen).length})}),
        incoming:L.filter(f=>!f.acc&&f.b===uid).map(f=>card(f.a,{at:f.at})),outgoing:L.filter(f=>!f.acc&&f.a===uid).map(f=>card(f.b,{at:f.at})),gifts_new:GFL().filter(g=>g.to===uid&&!g.seen).length,dm_new:dmNew(),inv:invN(),blocked:BLK().filter(k=>k.a===uid).length}};
    const blkJ=()=>({blocked:BLK().filter(k=>k.a===uid&&db.prof[k.b]).sort((x,y)=>x.at<y.at?1:-1).map(k=>card(k.b,{at:k.at}))});
    // v6.43: the mailbox and coupons (same answers as qz_mails / qz_mail_claim / qz_coupon_redeem): window.__MOCK_MAILS = [{id,title,body,rewards,expires_at}]
    // (each account takes each letter once), window.__MOCK_COUPONS = {CODE: rewards} (once per account)
    const MCL=()=>db.mclaim||(db.mclaim={}),MAILS=()=>(window.__MOCK_MAILS||[]).filter(m=>!MCL()[uid+':'+m.id]&&(!m.expires_at||new Date(m.expires_at)>Date.now()))
      .map(m=>({id:m.id,title:m.title,body:m.body||'',rewards:m.rewards||{},expires_at:m.expires_at||null,at:m.at||new Date().toISOString()})).sort((x,y)=>y.id-x.id);
    const GIVE=(rw,why)=>{const g={coins:rw.coins|0,frags:rw.frags|0,tfrags:rw.tfrags|0,tickets:rw.tickets|0,season_tickets:rw.season_tickets|0,guns:[],had:[]};
      P.coins+=g.coins;P.frags=(P.frags|0)+g.frags;P.tfr=(P.tfr|0)+g.tfrags;P.tickets=(P.tickets|0)+g.tickets;P.sTk=(P.sTk|0)+g.season_tickets;if(g.coins)db.log.push([uid,g.coins,why]);
      for(const x of rw.guns||[])if(db.own[uid].includes(x))g.had.push(x);else{db.own[uid].push(x);g.guns.push(x)}return g};
    const WAL=()=>({coins:P.coins,fragments:P.frags|0,tfrags:P.tfr|0,tickets:P.tickets|0,season_tickets:P.sTk|0,owned:db.own[uid]});
    // v6.46: weapons an admin put on the account: window.__MOCK_GUNNOTES = [{id,gun,src}] (the gun is put on the account when it is listed)
    const GNS=()=>(window.__MOCK_GUNNOTES||[]).filter(n=>!(db.gseen||(db.gseen={}))[uid+':'+n.id]);
    if(fn==='qz_gun_notices'){const L=GNS();for(const n of L)if(!db.own[uid].includes(n.gun))db.own[uid].push(n.gun);save(db);return res(200,L.map(n=>({id:n.id,gun:n.gun,src:n.src||'admin',at:new Date().toISOString()})))}
    if(fn==='qz_gun_seen'){let k=0;for(const n of GNS())if(body.p_ids==null||body.p_ids.includes(n.id)){db.gseen[uid+':'+n.id]=1;k++}save(db);return res(200,{seen:k})}
    if(fn==='qz_mails')return res(200,MAILS());
    if(fn==='qz_mail_claim'){if(window.__MOCK_BAN)return pgerr('banned');const L=MAILS().filter(m=>body.p_id==null||m.id===+body.p_id);if(!L.length)return pgerr('no_mail');
      const got={coins:0,frags:0,tfrags:0,tickets:0,season_tickets:0,guns:[],had:[]};
      for(const m of L){MCL()[uid+':'+m.id]=1;const g=GIVE(m.rewards,'mail');for(const k of ['coins','frags','tfrags','tickets','season_tickets'])got[k]+=g[k];got.guns.push(...g.guns);got.had.push(...g.had)}
      save(db);return res(200,Object.assign({claimed:L.map(m=>m.id),got,left:MAILS().length},WAL()))}
    if(fn==='qz_coupon_redeem'){if(window.__MOCK_BAN)return pgerr('banned');const c=String(body.p_code||'').toUpperCase().replace(/[^A-Z0-9]/g,''),C=window.__MOCK_COUPONS||{};
      if(!C[c])return res(200,{error:'coupon_not_found'});const U=db.cuse||(db.cuse={});if(U[uid+':'+c])return res(200,{error:'coupon_used'});
      U[uid+':'+c]=1;const got=GIVE(C[c],'coupon');save(db);return res(200,Object.assign({code:c,got},WAL()))}
    // v6.74: the match's ticket (qz_match_start): window.__mockTickets = what was asked; window.__MOCK_NOTICKET = a database before v6.74
    if(fn==='qz_match_start'){if(window.__MOCK_NOTICKET)return err(404,{code:'PGRST202',message:'Could not find the function public.qz_match_start in the schema cache'});
      if(window.__MOCK_BAN)return pgerr('banned');const t='tk'+uuid();(window.__mockTickets=window.__mockTickets||[]).push(Object.assign({token:t,at:Date.now()},body||{}));
      (db.tks||(db.tks={}))[t]={uid,mode:String((body||{}).p_mode||''),at:Date.now()};save(db);return res(200,{token:t})}
    // v6.75: the global chat's keys (qz_chat_key / qz_chat_who; db.ckeys[kid] = {uid, pub, at}; a profile's bannedT in the future = suspended) and qz_online
    if(fn==='qz_chat_key'){if(window.__MOCK_BAN)return pgerr('banned');if(window.__MOCK_CHAT_OFF)return pgerr('chat_off');const pub=String((body||{}).p_pub||'');if(!/^[A-Za-z0-9_-]{86,88}$/.test(pub))return pgerr('bad_key');
      const CK=db.ckeys||(db.ckeys={});if(Object.values(CK).some(k=>k.uid===uid&&Date.now()-k.at<5e3))return pgerr('too_soon');
      let h='',x=0;for(let r=0;r<3;r++){for(const ch of pub+':'+uid+':'+r)x=(Math.imul(x^ch.charCodeAt(0),16777619)+r)>>>0;h+=x.toString(16).padStart(8,'0')}const kid=h.slice(0,20);
      CK[kid]={uid,pub,at:Date.now()};const mine=Object.entries(CK).filter(([,k])=>k.uid===uid).sort((a,b)=>b[1].at-a[1].at);for(const [k] of mine.slice(3))delete CK[k];
      save(db);return res(200,{kid,nickname:P.nickname,ms:Date.now()+(window.__MOCK_SKEW||0)})}
    if(fn==='qz_chat_who'){const CK=db.ckeys||{},o={};for(const k of (Array.isArray((body||{}).p_kids)?body.p_kids:[]).slice(0,20)){const c=CK[k],Q=c&&db.prof[c.uid];if(!Q)continue;
        o[k]={pub:c.pub,n:Q.nickname,tt:titleWorn(c.uid),ft:hofBest(c.uid),b:!!(Q.bannedT&&Q.bannedT>Date.now()),me:c.uid===uid,x:(db.blk||[]).some(z=>z.a===uid&&z.b===c.uid)}}
      (window.__mockWho=window.__mockWho||[]).push((body||{}).p_kids);return res(200,o)}
    if(fn==='qz_online')return res(200,{n:Object.values(db.prof).filter(q=>q.seenT&&Date.now()-q.seenT<150e3).length,ms:Date.now()+(window.__MOCK_SKEW||0),on:!window.__MOCK_CHAT_OFF,guest:!window.__MOCK_GUEST_OFF,gday:window.__MOCK_GUEST_DAY==null?10:window.__MOCK_GUEST_DAY});
    // v6.88: guests in the global chat (qz_chat_guest_post / qz_chat_glines; a guest's line in db.clines with uid null, gid, gn; db.gday[gid] = {day, n});
    // __MOCK_GUEST_OFF = gacha_config.chat_guest off, __MOCK_GUEST_DAY = chat_guest_day, __MOCK_RT_NOSEND = a project whose realtime cannot send, __MOCK_NOGUEST = a database before v6.88
    if(fn==='qz_chat_guest_post'||fn==='qz_chat_glines'){if(window.__MOCK_NOGUEST||window.__MOCK_NOCHATLOG)return err(404,{code:'PGRST202',message:'Could not find the function public.'+fn+' in the schema cache'});
      const now=Date.now(),H12=12*3600e3,b=body||{};(window.__mockChat=window.__mockChat||[]).push([fn,b]);
      if(fn==='qz_chat_glines'){if(window.__MOCK_CHAT_OFF)return res(200,[]);const ids=(Array.isArray(b.p_ids)?b.p_ids:[]).slice(0,20);
        return res(200,(db.clines||[]).filter(l=>l.gid&&ids.includes(l.id)&&now-l.at<H12).map(l=>({id:l.id,g:l.gid,n:l.gn,ts:l.ts,t:l.t})))}
      if(window.__MOCK_CHAT_OFF)return pgerr('chat_off');if(window.__MOCK_GUEST_OFF)return pgerr('guest_off');
      const sec=String(b.p_sec||''),n=String(b.p_n||'').replace(/\s+/g,' ').trim(),t=b.p_t,ms=now+(window.__MOCK_SKEW||0),cap=window.__MOCK_GUEST_DAY==null?10:window.__MOCK_GUEST_DAY;
      if(!/^[0-9a-f]{32}$/.test(sec))return pgerr('bad_guest');if([...n].length<1||[...n].length>14||/[\u0000-\u001f\u007f]/.test(n))return pgerr('bad_name');
      if(typeof t!=='string'||[...t].length<1||[...t].length>120||/[\u0000-\u001f\u007f]/.test(t))return pgerr('bad_line');if(typeof b.p_ts!=='number'||Math.abs(b.p_ts-ms)>600e3)return pgerr('bad_time');
      if(Object.values(db.prof).some(q=>String(q.nickname).toLowerCase()===n.toLowerCase()))return pgerr('name_taken');
      const h=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(sec))),gid=[...h.slice(0,6)].map(x=>x.toString(16).padStart(2,'0')).join('');
      const day=new Date(now+9*3600e3).toISOString().slice(0,10),GD=db.gday||(db.gday={}),cnt=GD[gid]&&GD[gid].day===day?GD[gid].n:0,L0=db.clines||(db.clines=[]);
      const dup=L0.find(l=>l.kid==='g'+gid&&l.ts===b.p_ts);if(dup)return res(200,{ok:true,id:dup.id,g:gid,ms,left:Math.max(0,cap-cnt)});
      if(cnt>=cap)return pgerr('guest_limit');const mine=L0.filter(l=>l.gid===gid);
      if(mine.some(l=>now-l.at<1200)||mine.filter(l=>now-l.at<14e3).length>=5)return pgerr('too_fast');if(L0.filter(l=>l.gid&&now-l.at<60e3).length>=30)return pgerr('guest_busy');
      db.clines=L0.filter(l=>now-l.at<H12).slice(-2999);const id=(db.clseq=(db.clseq||0)+1);db.clines.push({id,uid:null,gid,gn:n,kid:'g'+gid,ts:b.p_ts,t,s:'',r:null,at:now});
      GD[gid]={day,n:cnt+1};save(db);if(!window.__MOCK_RT_NOSEND&&window.__mockRtDb)setTimeout(()=>window.__mockRtDb('g',{id}),window.__MOCK_RT_LAG||30);
      return res(200,{ok:true,id,g:gid,ms,left:Math.max(0,cap-cnt-1)})}
    if(fn==='qz_ping'){touch();(window.__mockPings=window.__mockPings||[]).push(Object.assign({at:Date.now()},body||{}));save(db);return res(200,{dm_new:dmNew(),inv:invN(),mail:MAILS().length,gun:GNS().length,inq:(db.inq||[]).filter(q=>q.uid===uid&&q.reply&&!q.seen).length,chat:!window.__MOCK_CHAT_OFF})}
    // v6.42: a ban (window.__MOCK_BAN) refuses what qz_guard refuses in schema.sql
    if(window.__MOCK_BAN&&['qz_buy','qz_claim','qz_round_claim','qz_import_rec','qz_ny_add','qz_ny_exchange','qz_mission_claim','qz_decode','qz_bingo_reset','qz_bingo_shuffle',
      'qz_season_decode','qz_season_reset','qz_season_shuffle','qz_side_decode','qz_side_reset','qz_side_shuffle','qz_exchange','qz_trans_exchange','qz_friend_add','qz_friend_answer',
      'qz_gift','qz_dm_send','qz_room_up','qz_invite','qz_ref_set','qz_ref_check','qz_set_nickname'].includes(fn))return pgerr('banned');
    if(['qz_invite','qz_invites','qz_invite_answer','qz_ref_set','qz_ref_check','qz_ref_info'].includes(fn)){try{const g=GCFG;
      if(fn==='qz_invite'){const code=String(body.p_code||'').toUpperCase().slice(0,8);if(!/^[A-Z0-9]{4}$/.test(code))throw 'bad_code';const t=find(body.p_who);if(t===uid)throw 'friend_self';
        const f=pair(uid,t);if(!f||!f.acc)throw 'inv_friends';db.inv=IVL().filter(i=>!(i.from===uid&&Date.now()-i.at>600e3));
        if(IVL().some(i=>i.from===uid&&i.to===t&&i.code===code&&Date.now()-i.at<10e3))throw 'inv_wait';if(IVL().filter(i=>i.from===uid&&Date.now()-i.at<60e3).length>=15)throw 'inv_many';
        db.inv=IVL().filter(i=>!(i.from===uid&&i.to===t));IVL().push({from:uid,to:t,code,map:String(body.p_map||'').slice(0,24),mode:String(body.p_mode||'').slice(0,12),at:Date.now()});save(db);return res(200,{ok:true,to:db.prof[t].nickname})}
      if(fn==='qz_invites')return res(200,invJ());
      if(fn==='qz_invite_answer'){const fc=String(body.p_fc||'').toUpperCase().replace(/[^A-Z0-9]/g,''),code=String(body.p_code||'').toUpperCase();db.inv=IVL().filter(i=>!(i.to===uid&&FC(i.from)===fc&&i.code===code));save(db);return res(200,invJ())}
      if(fn==='qz_ref_set'){const c=String(body.p_code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');if(P.refBy)throw 'ref_already';if(Date.now()-(P.created||Date.now())>g.ref_days*864e5)throw 'ref_old';
        if(c.length!==6)throw 'not_found';const t=Object.keys(db.prof).find(id=>FC(id)===c);if(!t)throw 'not_found';if(t===uid)throw 'friend_self';if(db.prof[t].refBy===uid)throw 'ref_loop';
        P.refBy=t;P.coins+=g.ref_new_coins;RFL().push({referee:uid,referrer:t,at:Date.now(),paid:false,rewarded:false,seen:true});db.log.push([uid,g.ref_new_coins,'ref_welcome']);
        if(P.reborn)throw 'ref_reborn';const f=pair(uid,t);if(!f&&!blocked(uid,t)&&FRL().filter(x=>x.a===t||x.b===t).length<100)FRL().push({a:uid,b:t,acc:false,at:new Date().toISOString(),accAt:null});
        save(db);return res(200,{by:db.prof[t].nickname,bonus:g.ref_new_coins,coins:P.coins,left:Math.max(0,g.ref_matches-(P.matches|0)),tickets:g.ref_new_tickets})}
      if(fn==='qz_ref_check'){if(!P.refBy)return res(200,{state:'none'});if(P.refDone)return res(200,{state:'done'});if((P.matches|0)<g.ref_matches)return res(200,{state:'wait',left:g.ref_matches-(P.matches|0)});
        P.refDone=true;P.tickets=(P.tickets|0)+g.ref_new_tickets;const R=db.prof[P.refBy],row=RFL().find(r=>r.referee===uid),n=RFL().filter(r=>r.referrer===P.refBy&&r.rewarded).length;let paid=false;
        if(R&&n<g.ref_cap){R.coins+=g.ref_coins;R.tickets=(R.tickets|0)+g.ref_tickets;if(row){row.paid=true;row.rewarded=true;row.seen=false}db.log.push([P.refBy,g.ref_coins,'ref_reward']);paid=true}else if(row)row.paid=true;
        save(db);return res(200,{state:'paid',got_tickets:g.ref_new_tickets,inviter_paid:paid,tickets:P.tickets,by:R?R.nickname:null})}
      if(fn==='qz_ref_info'){const L0=RFL().filter(r=>r.referrer===uid).sort((a,b)=>b.at-a.at);const out={code:FC(uid),n:L0.length,paid:L0.filter(r=>r.rewarded).length,cap:g.ref_cap,matches:g.ref_matches,coins:g.ref_coins,tickets:g.ref_tickets,new_coins:g.ref_new_coins,new_tickets:g.ref_new_tickets,
          list:L0.slice(0,30).map(r=>({nick:db.prof[r.referee].nickname,at:new Date(r.at).toISOString(),m:Math.min(db.prof[r.referee].matches|0,g.ref_matches),paid:r.paid,rewarded:r.rewarded,new:!r.seen}))};for(const r of L0)r.seen=true;save(db);return res(200,out)}
    }catch(e){if(typeof e==='string')return pgerr(e);throw e}}
    if(fn==='qz_dm_send'||fn==='qz_dm_list'){try{const t=find(body.p_who),f=pair(uid,t);if(!f||!f.acc)throw 'dm_not_friend';touch();
      if(fn==='qz_dm_send'){const x=String(body.p_text||'').replace(/[\x00-\x1f]/g,' ').trim();if(x.length<1||x.length>200)throw 'dm_text';
        if(DML().filter(m=>m.from===uid&&Date.now()-m.at<6e4).length>=20)throw 'dm_slow';db.dmId=(db.dmId|0)+1;DML().push({id:db.dmId,from:uid,to:t,text:x,at:Date.now(),seen:false});save(db);return res(200,{ok:true})}
      for(const m of DML())if(m.to===uid&&m.from===t)m.seen=true;save(db);
      return res(200,{msgs:DML().filter(m=>(m.from===uid&&m.to===t||m.from===t&&m.to===uid)&&m.id>(body.p_after|0)).slice(-60).map(m=>({id:m.id,mine:m.from===uid,text:m.text,at:new Date(m.at).toISOString()})),seen:db.prof[t].seenT?new Date(db.prof[t].seenT).toISOString():null,dm_new:dmNew()})}
    catch(e){if(typeof e==='string')return pgerr(e);throw e}}
    if(['qz_friends','qz_friend_add','qz_friend_answer','qz_friend_remove','qz_gift','qz_gift_inbox','qz_block','qz_blocks','qz_unblock'].includes(fn)){try{
      if(fn==='qz_friends'){save(db);return res(200,frJ())}
      if(fn==='qz_block'){const t=find(body.p_who);if(t===uid)throw 'friend_self';if(!BLK().some(k=>k.a===uid&&k.b===t)){if(BLK().filter(k=>k.a===uid).length>=500)throw 'block_full';BLK().push({a:uid,b:t,at:new Date().toISOString()})}
        db.fr=FRL().filter(x=>!(x.a===uid&&x.b===t||x.a===t&&x.b===uid));db.inv=IVL().filter(i=>!(i.from===uid&&i.to===t||i.from===t&&i.to===uid));save(db);return res(200,frJ())}
      if(fn==='qz_blocks')return res(200,blkJ());
      if(fn==='qz_unblock'){const t=find(body.p_who);db.blk=BLK().filter(k=>!(k.a===uid&&k.b===t));save(db);return res(200,blkJ())}
      if(fn==='qz_friend_add'){const t=find(body.p_who);if(t===uid)throw 'friend_self';if(BLK().some(k=>k.a===uid&&k.b===t))throw 'you_blocked';if(BLK().some(k=>k.a===t&&k.b===uid))throw 'friend_blocked';const f=pair(uid,t);
        if(f){if(f.acc)throw 'friend_already';if(f.a===uid)throw 'friend_pending';f.acc=true;f.accAt=new Date().toISOString();save(db);return res(200,{...frJ(),done:'accepted'})}
        if(FRL().filter(x=>x.a===uid||x.b===uid).length>=100||FRL().filter(x=>x.a===uid&&!x.acc).length>=30)throw 'friend_full';
        FRL().push({a:uid,b:t,acc:false,at:new Date().toISOString(),accAt:null});save(db);return res(200,{...frJ(),done:'sent'})}
      if(fn==='qz_friend_answer'){const t=find(body.p_who),f=FRL().find(x=>x.a===t&&x.b===uid&&!x.acc);if(!f)throw 'no_request';
        if(body.p_yes){f.acc=true;f.accAt=new Date().toISOString()}else db.fr=FRL().filter(x=>x!==f);save(db);return res(200,frJ())}
      if(fn==='qz_friend_remove'){const t=find(body.p_who);db.fr=FRL().filter(x=>!(x.a===uid&&x.b===t||x.a===t&&x.b===uid));save(db);return res(200,frJ())}
      if(fn==='qz_gift'){const t=find(body.p_who);if(t===uid)throw 'friend_self';const f=pair(uid,t);if(!f||!f.acc||blocked(uid,t))throw 'not_friends';
        const r=PM[body.p_gun];if(r&&r.tier)throw 'gacha_only';if(!r||!r.sold)throw 'not_for_sale';if(r.free)throw 'friend_has_it';if(P.coins<r.price)throw 'not_enough_coins';
        db.own[t]=db.own[t]||[];if(db.own[t].includes(body.p_gun))throw 'friend_has_it';db.own[t].push(body.p_gun);P.coins-=r.price;
        GFL().push({from:uid,to:t,gun:body.p_gun,price:r.price,at:new Date().toISOString(),seen:false});db.log.push([uid,-r.price,'gift']);save(db);return res(200,{coins:P.coins,gun:body.p_gun,to:db.prof[t].nickname})}
      if(fn==='qz_gift_inbox'){const L=GFL().filter(g=>g.to===uid&&!g.seen);for(const g of L)g.seen=true;save(db);return res(200,{gifts:L.map(g=>({gun:g.gun,from:db.prof[g.from]?db.prof[g.from].nickname:'?',at:g.at}))})}
    }catch(e){if(typeof e==='string')return pgerr(e);throw e}}
    if(fn==='qz_me'){if(!P){const U=db.users[uid],nk=(U.prov||'email')==='email'?clean((U.meta||{}).nickname):'생존자';newProfile(db,uid,nk==='생존자'?autoNick():nk)}const Q=db.prof[uid];FC(uid);save(db);
      return res(200,{nickname:Q.nickname,fcode:Q.fcode,gifts_new:GFL().filter(g=>g.to===uid&&!g.seen).length,friend_req:FRL().filter(f=>!f.acc&&f.b===uid).length,coins:Q.coins,earned:Q.earned,matches:Q.matches,day_left:20000-(Q.day===today()?Q.dayE:0),fragments:Q.frags|0,tfrags:Q.tfr|0,pity:Q.pity|0,tickets:Q.tickets|0,ny:Q.ny||[0,0,0,0],season_tickets:Q.sTk|0,free_today:Q.freeDay!==today(),rec:REC(Q),owned:db.own[uid],firsts:hofOf(uid),ref:refJ(Q),admin:!!window.__MOCK_ADMIN,ban:window.__MOCK_BAN||null,mail_new:MAILS().length,gun_new:GNS().length,title:titleWorn(uid),title_set:Q.title||null,ach_ready:achReady(uid),inq_new:(db.inq||[]).filter(q=>q.uid===uid&&q.reply&&!q.seen).length,eps:epsOf(uid),epmax:window.__MOCK_EPMAX!=null?window.__MOCK_EPMAX:10})}
    if(fn==='qz_ny_add'){const cap=window.__MOCK_NYCAP!=null?window.__MOCK_NYCAP:60,used=P.nyDay===today()?P.nyDayN|0:0;let q=Math.min(Math.max(P.nyQ|0,0),Math.max(cap-used,0));const v=[body.p_g,body.p_h,body.p_s,body.p_n].map(x=>Math.min(Math.max(x|0,0),8)),ad=v.map(x=>{const t=Math.min(x,q);q-=t;return t});
      P.ny=(P.ny||[0,0,0,0]).map((x,i)=>x+ad[i]);P.nyQ=0;const n=ad.reduce((a,b)=>a+b,0);P.nyDay=today();P.nyDayN=used+n;save(db);return res(200,{added:ad,ny:P.ny,day_left:Math.max(cap-used-n,0),day_cap:cap})}
    if(fn==='qz_ny_exchange'){const c=body.p_choice;if(c!=='ny'&&c!=='season')return pgerr('bad_choice');const N=P.ny||[0,0,0,0];if(Math.min(...N)<1)return pgerr('no_set');
      P.ny=N.map(x=>x-1);if(c==='ny')P.tickets=(P.tickets|0)+2;else P.sTk=(P.sTk|0)+1;save(db);return res(200,{ny:P.ny,tickets:P.tickets|0,season_tickets:P.sTk|0})}
    // v6.67: 회원 탈퇴 (same rules as qz_account_delete): the account and everything on it; window.__mockDeleted = the ids gone
    if(fn==='qz_account_delete'){if((body||{}).p_confirm!=='delete')return pgerr('confirm_needed');if(window.__MOCK_ADMIN)return pgerr('admin_account');
      if(Date.now()-((tk&&tk.born)||0)+(window.__MOCK_SES_AGE||0)>600e3)return pgerr('reauth');
      delete db.users[uid];delete db.prof[uid];delete db.own[uid];for(const k in db.tok)if(db.tok[k].uid===uid)delete db.tok[k];
      db.inq=(db.inq||[]).filter(q=>q.uid!==uid);db.fr=FRL().filter(f=>f.a!==uid&&f.b!==uid);db.dms=DML().filter(m=>m.from!==uid&&m.to!==uid);db.gifts=GFL().filter(g=>g.to!==uid);
      db.log=db.log.filter(l=>l[0]!==uid);if(db.mis)delete db.mis[uid];if(db.bingo)delete db.bingo[uid];if(db.season)delete db.season[uid];if(db.side)delete db.side[uid];
      (window.__mockDeleted=window.__mockDeleted||[]).push(uid);save(db);return res(200,{ok:true})}
    if(fn==='qz_set_nickname'){const raw=String(body.p_nick||'').replace(/[\u0000-\u001f]/g,'').trim(),n=clean(raw);if(raw.length<2)return pgerr('nick_short');
      if(Object.keys(db.prof).some(id=>id!==uid&&String(db.prof[id].nickname).toLowerCase()===n.toLowerCase()))return pgerr('nick_taken');P.nickname=n;save(db);return res(200,P.nickname)}
    if(fn==='qz_buy'){const r=PM[body.p_gun];if(r&&r.tier)return pgerr('gacha_only');if(!r||!r.sold)return pgerr('not_for_sale');if(r.free||db.own[uid].includes(body.p_gun))return pgerr('already_owned');
      if(P.coins<r.price)return pgerr('not_enough_coins');P.coins-=r.price;db.own[uid].push(body.p_gun);db.log.push([uid,-r.price,'buy']);save(db);return res(200,{coins:P.coins,gun:body.p_gun})}
    if((fn==='qz_claim'||fn==='qz_round_claim')&&window.__MOCK_NOTOKEN&&'p_token' in (body||{}))return err(404,{code:'PGRST202',message:'Could not find the function public.'+fn+'(p_token, ...) in the schema cache'});
    if(fn==='qz_claim'||fn==='qz_round_claim')(window.__mockClaimBodies=window.__mockClaimBodies||[]).push(Object.assign({fn},body||{}));
    if(fn==='qz_claim'){if(window.__MOCK_NOMATCH&&'p_match' in body)return err(404,{code:'PGRST202',message:'Could not find the function public.qz_claim(p_bonus, p_cleared, p_match, ...) in the schema cache'});
      if(window.__MOCK_NOACH&&'p_ach' in body)return err(404,{code:'PGRST202',message:'Could not find the function public.qz_claim(p_ach, p_bonus, ...) in the schema cache'});
      if(window.__MOCK_NOHS&&'p_hs' in body)return err(404,{code:'PGRST202',message:'Could not find the function public.qz_claim(p_cleared, p_damage, p_hs, ...) in the schema cache'});
      const mins=(Date.now()-(P.last||Date.now()-15*60e3))/60e3*(window.__MOCK_TIMEWARP||1);if(mins<1.5)return pgerr('too_soon');
      const cl=(v,a)=>Math.min(Math.max(v|0,0),a),k=cl(body.p_kills,80);let raw=body.p_mode==='scen'?100+50*cl(body.p_stage,5)+(body.p_cleared?200:0)+5*k
        :100+15*cl(body.p_rounds,10)+7*Math.min(k,60)+12*cl(body.p_infects,30)+5*Math.floor(cl(body.p_damage,60000)/1000)+(body.p_won?130:0)+(body.p_mvp?80:0);
      raw=Math.min(raw,1200,Math.floor(mins*100));const d0=P.day===today()?P.dayE:0,bonus=P.bday!==today()?250:0,got=Math.max(0,Math.min(raw+bonus,20000-d0));
      P.coins+=got;P.earned+=got;P.matches++;P.last=Date.now();P.day=today();P.bday=today();P.dayE=d0+got;P.nyQ=Math.min(8,2+Math.floor(k/6));db.log.push([uid,got,'match']);save(db);
      const s0=achStats(uid);
      const R0=P.rec||(P.rec={g:0,k:0,inf:0,best:0,xp:0,imported:false}),sc=cl(body.p_score,30000),inf=cl(body.p_infects,30),gx=Math.min(4000,Math.max(25,Math.round(sc*.75+k*10+inf*15)));
      R0.g++;R0.k+=k;R0.inf+=inf;R0.best=Math.max(R0.best,sc);R0.xp+=gx;
      // daily missions: this match's numbers, clamped the same way (headshot kills at most the kills). window.__MOCK_NOHS: a database before p_hs
      misMake(db,uid);const scen=body.p_mode==='scen',gain={play:1,win:body.p_won||(scen&&body.p_cleared)?1:0,kills:k,infects:inf,damage:cl(body.p_damage,60000),
        rounds:scen?cl(body.p_stage,5):cl(body.p_rounds,10),hs:Math.min(cl(body.p_hs,1e9),k)};
      const missions=misJ(db,uid).missions.map(m=>({slot:m.slot,kind:m.kind,goal:m.goal,from:m.progress,progress:Math.min(m.goal,m.progress+(gain[m.kind]|0)),claimed:m.claimed,ko:m.ko,en:m.en}));
      for(const m of db.mis[uid])if(m.day===today())m.progress=Math.min(m.goal,m.progress+(gain[m.kind]|0));
      const ep=scen?cl(body.p_ep,10):0,ed=cl(body.p_diff,3),et=cl(body.p_time,36000),ep_clear=ep>0&&!!body.p_cleared&&et>=240;let ep_hof=false;window.__mockMatch=body.p_match;
      if(ep_clear){let mt=String(body.p_match||'').replace(/[^A-Za-z0-9]/g,'').slice(0,24);if(!mt)mt='u:'+uid;let h=HOFL().find(x=>x.ep===ep&&x.diff===ed);
        if(!h){h={ep,diff:ed,match:mt,at:new Date().toISOString(),time:et,members:[]};HOFL().push(h)}
        if(h.match===mt&&Date.now()-Date.parse(h.at)<15*60e3&&h.members.length<8&&!h.members.includes(uid)){h.members.push(uid);ep_hof=true}}
      if(ep_clear){P.epr=P.epr||{};const e=P.epr[ep+':'+ed]||(P.epr[ep+':'+ed]={ep,diff:ed,clears:0,medal:null});e.clears++;if(body.p_bonus&&!(body.p_lives|0))e.medal='S';if(!e.first)e.first=new Date().toISOString();if(!e.t||et<e.t)e.t=et}
      const A=body.p_ach&&typeof body.p_ach==='object'&&!Array.isArray(body.p_ach)?body.p_ach:{},ai=v=>/^-?\d{1,9}$/.test(String(v))?+v:0,pvp=['tdm','ffa','bomb','race'].includes(body.p_mode),zm=['orig','mut'].includes(body.p_mode);
      achAdd(uid,{hs:Math.min(cl(body.p_hs,1e9),k),dmg:cl(body.p_damage,60000),wins:zm&&body.p_won?1:0,mvp:body.p_mvp?1:0,pk:pvp?k:0,pw:pvp&&body.p_won?1:0,rw:body.p_mode==='race'&&body.p_won?1:0,
        kn:Math.min(Math.max(ai(A.kn),0),40,k),cu:Math.min(Math.max(ai(A.cu),0),20),mk:Math.min(Math.max(ai(A.mk),0),200),cr:Math.min(Math.max(ai(A.cr),0),10),bm:Math.min(Math.max(ai(A.pl),0),12)+Math.min(Math.max(ai(A.df),0),12)});
      const s1=achStats(uid),ach_hit=ACHD.filter(d=>!achHas(uid,d)&&(s1[d.stat]|0)>=d.goal&&(s0[d.stat]|0)<d.goal).map(d=>d.id);window.__mockAch=body.p_ach;
      save(db);
      return res(200,{got,coins:P.coins,bonus,raw,day_left:20000-P.dayE,xp_got:gx,rec:REC(P),missions,ep_clear,ep_hof,firsts:ep>0?hofOf(uid):null,eps:ep>0?epsOf(uid):null,ach_hit,ach_ready:achReady(uid)})}
    // v6.17: a finished round (same numbers as qz_round_claim in schema.sql)
    if(fn==='qz_round_claim'){if(window.__MOCK_NOROUND)return err(404,{code:'PGRST202',message:'Could not find the function public.qz_round_claim in the schema cache'});
      if(['scen','range',''].includes(body.p_mode||''))return pgerr('no_rounds');
      const secs=(Date.now()-(P.lastR||Date.now()-600e3))/1e3*(window.__MOCK_TIMEWARP||1);if(secs<25)return pgerr('too_soon');
      const cl=(v,a)=>Math.min(Math.max(v|0,0),a),k=cl(body.p_kills,30),inf=cl(body.p_infects,12),dm=cl(body.p_damage,40000),sc=cl(body.p_score,8000);
      let raw=150+8*k+12*inf+5*Math.floor(dm/1000)+(body.p_won?120:0)+(body.p_survived?60:0)+(body.p_mvp?80:0);raw=Math.min(raw,600,Math.floor(secs*4));
      const d0=P.day===today()?P.dayE:0,got=Math.max(0,Math.min(raw,20000-d0)),gx=Math.min(1500,Math.max(10,Math.round(sc*.6+k*8+inf*12)));
      P.coins+=got;P.earned+=got;P.lastR=Date.now();P.day=today();P.dayE=d0+got;const R0=P.rec||(P.rec={g:0,k:0,inf:0,best:0,xp:0,imported:false});R0.xp+=gx;db.log.push([uid,got,'round']);
      if(['orig','mut'].includes(body.p_mode))achAdd(uid,{surv:body.p_survived?1:0,zw:body.p_won&&!body.p_survived?1:0});save(db);
      return res(200,{got,coins:P.coins,raw,xp_got:gx,day_left:20000-P.dayE,rec:REC(P)})}
    if(fn==='qz_missions'){misMake(db,uid);save(db);return res(200,misJ(db,uid))}
    if(fn==='qz_achievements'){save(db);return res(200,achJ(uid))}
    if(fn==='qz_ach_claim'){if(window.__MOCK_BAN)return pgerr('banned');const S0=achStats(uid),pid=body.p_id||'',L=ACHD.filter(d=>(!pid||d.id===pid)&&!achHas(uid,d)&&(S0[d.stat]|0)>=d.goal);
      if(!L.length){if(pid&&ACL(uid).some(c=>c.id===pid))return pgerr('already_claimed');return pgerr('not_done')}
      let c=0,t=0;const titles=[];for(const d of L){ACL(uid).push({id:d.id,at:Date.now()});c+=d.coins;t+=d.tickets;if(d.title)titles.push(d.title)}
      P.coins+=c;P.earned+=c;P.tickets=(P.tickets|0)+t;db.log.push([uid,c,'ach']);save(db);
      return res(200,{got:c,got_tickets:t,ids:L.map(d=>d.id),titles,coins:P.coins,tickets:P.tickets|0,ach:achJ(uid)})}
    if(fn==='qz_title_wear'){const w=String(body.p_title==null?'':body.p_title).trim()||null;
      if(w&&w!=='none'){if(/^hof:/.test(w)){if(!hofOf(uid).includes(+w.slice(4)))return pgerr('no_title')}else if(!ACL(uid).some(c=>{const d=ACHD.find(x=>x.id===c.id);return d&&d.title===w}))return pgerr('no_title')}
      P.title=w;save(db);return res(200,{title:w,worn:titleWorn(uid)})}
    if(fn==='qz_mission_claim'){const m=(db.mis&&db.mis[uid]||[]).find(x=>x.day===today()&&x.slot===(body.p_slot|0));if(!m)return pgerr('no_mission');if(m.claimed)return pgerr('already_claimed');
      if(m.progress<m.goal)return pgerr('not_done');m.claimed=true;P.coins+=m.coins;P.earned+=m.coins;P.tickets=(P.tickets|0)+m.tickets;db.log.push([uid,m.coins,'mission']);save(db);
      return res(200,{got:m.coins,got_tickets:m.tickets,coins:P.coins,tickets:P.tickets,missions:misJ(db,uid)})}
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
      if(!db.bingo||!db.bingo[uid])newCard();const owned=new Set(db.own[uid]);let cw=0,fw=0,tfw=0,card=0;const out=[];db.glog=db.glog||[];
      for(let i=0;i<n;i++){const b=db.bingo[uid];const left=[...Array(g.bingo_hi+1).keys()].filter(x=>!b.drawn.includes(x));
        let num=window.__MOCK_SEQ&&window.__MOCK_SEQ.length?window.__MOCK_SEQ.shift():left[Math.floor(Math.random()*left.length)];if(!left.includes(num))num=left[0];
        b.drawn.push(num);const c=b.nums.indexOf(num),lines=[];
        if(c>=0){b.marked[c]=true;BL.forEach((ln,k)=>{if(b.done[k]||!ln.every(x=>b.marked[x]))return;b.done[k]=true;const gun=b.rewards[k],tier=(PM[gun]||{}).tier;let kind,amount=0;
          if(gun&&!owned.has(gun)){kind='gun';owned.add(gun);db.own[uid].push(gun)}else if(tier==='S'){kind='coins';amount=g.full_s_coins;cw+=amount}else{kind='frags';amount=g.full_a_frags;fw+=amount}
          db.glog.push({uid,at:new Date().toISOString(),src:free?'free':tk?'ticket':'decode',kind,tier,gun_id:gun,amount});lines.push({line:k,kind,gun,tier,amount})})}
        const f=g.dec_frag_min+Math.floor(Math.random()*(g.dec_frag_max-g.dec_frag_min+1));fw+=f;const tf=window.__MOCK_TFR!=null?window.__MOCK_TFR:g.trans_frag_min+Math.floor(Math.random()*(g.trans_frag_max-g.trans_frag_min+1));tfw+=tf;out.push({n:num,cell:c>=0?c:null,lines,frags:f,tfrags:tf,card});
        if(b.marked.every(Boolean)||b.drawn.length>g.bingo_hi){newCard();card++}}
      P.coins=P.coins-cost+cw;P.frags=(P.frags|0)+fw;P.tfr=(P.tfr|0)+tfw;if(tk)P.tickets-=n;if(free)P.freeDay=td;save(db);
      return res(200,{draws:out,card:cardJ(),coins:P.coins,fragments:P.frags,tfrags:P.tfr,cost,tickets:P.tickets|0,free_today:P.freeDay!==td})}
    // ---- the season card (same rules as qz_season*); __MOCK_SEQ / __MOCK_CARD work here too, __MOCK_SRW = [12 items] the next season card's line items
    const newSCard=()=>{db.season=db.season||{};const old=db.season[uid];const nums=window.__MOCK_CARD?window.__MOCK_CARD.slice():shuf([...Array(GCFG.season_hi+1).keys()]).slice(0,25);window.__MOCK_CARD=null;
      const rw=window.__MOCK_SRW?window.__MOCK_SRW.slice():shuf(GCFG.season_lines);window.__MOCK_SRW=null;while(rw.length<12)rw.push('coins:1000');
      db.season[uid]={nums,marked:Array(25).fill(false),drawn:[],rewards:rw.slice(0,12),done:Array(12).fill(false),boards:(old?old.boards:0)+1}};
    const scardJ=()=>{const b=db.season[uid],used=P.sShufDay===today()?(P.sShufs|0):0;return {...b,shuffles_left:Math.max(0,GCFG.shuffle_free-used)}};
    if(fn==='qz_season'){if(!db.season||!db.season[uid])newSCard();save(db);return res(200,scardJ())}
    if(fn==='qz_season_reset'){newSCard();save(db);return res(200,scardJ())}
    if(fn==='qz_season_shuffle'){const used=P.sShufDay===today()?(P.sShufs|0):0;if(used>=GCFG.shuffle_free)return pgerr('no_shuffles');if(!db.season||!db.season[uid])newSCard();
      const b=db.season[uid],idx=b.marked.map((m,i)=>m?-1:i).filter(i=>i>=0),vals=shuf(idx.map(i=>b.nums[i]));idx.forEach((i,j)=>b.nums[i]=vals[j]);P.sShufDay=today();P.sShufs=used+1;save(db);return res(200,scardJ())}
    if(fn==='qz_season_decode'){const n=body.p_count|0,g=GCFG,tk=!!body.p_ticket;if(n!==1&&n!==10)return pgerr('bad_count');const cost=tk?0:n===10?g.season_cost10:g.season_cost1;if(P.coins<cost)return pgerr('not_enough_coins');if(tk&&(P.sTk|0)<n)return pgerr('no_tickets');if(tk)P.sTk-=n;
      if(!db.season||!db.season[uid])newSCard();const owned=new Set(db.own[uid]);let cw=0,fw=0,tw=0,tfw=0,card=0;const out=[];db.glog=db.glog||[];
      for(let i=0;i<n;i++){const b=db.season[uid];const left=[...Array(g.season_hi+1).keys()].filter(x=>!b.drawn.includes(x));
        let num=window.__MOCK_SEQ&&window.__MOCK_SEQ.length?window.__MOCK_SEQ.shift():left[Math.floor(Math.random()*left.length)];if(!left.includes(num))num=left[0];
        b.drawn.push(num);const c=b.nums.indexOf(num),lines=[];
        if(c>=0){b.marked[c]=true;BL.forEach((ln,k)=>{if(b.done[k]||!ln.every(x=>b.marked[x]))return;b.done[k]=true;const item=b.rewards[k]||'',p=item.split(':');
          let kind=p[0],gun=null,amount=/^\d{1,7}$/.test(p[1]||'')?+p[1]:0;
          if(kind==='gun'){amount=0;gun=PM[p[1]]?p[1]:null;if(gun&&!owned.has(gun)){owned.add(gun);db.own[uid].push(gun)}else{kind='coins';amount=g.season_owned_coins;cw+=amount}}
          else if(kind==='frags')fw+=amount;else if(kind==='tickets')tw+=amount;else{kind='coins';cw+=amount}
          db.glog.push({uid,at:new Date().toISOString(),src:'season',kind,tier:null,gun_id:gun,amount});lines.push({line:k,kind,gun,amount,item})})}
        const f=g.season_frag_min+Math.floor(Math.random()*(Math.max(g.season_frag_max-g.season_frag_min,0)+1));fw+=f;const tf=window.__MOCK_TFR!=null?window.__MOCK_TFR:g.trans_frag_min+Math.floor(Math.random()*(g.trans_frag_max-g.trans_frag_min+1));tfw+=tf;out.push({n:num,cell:c>=0?c:null,lines,frags:f,tfrags:tf,card});
        if(b.marked.every(Boolean)||b.drawn.length>g.season_hi){newSCard();card++}}
      P.coins=P.coins-cost+cw;P.frags=(P.frags|0)+fw;P.tfr=(P.tfr|0)+tfw;P.tickets=(P.tickets|0)+tw;save(db);
      return res(200,{draws:out,card:scardJ(),coins:P.coins,fragments:P.frags,tfrags:P.tfr,tickets:P.tickets,season_tickets:P.sTk|0,cost})}
    // ---- the sidearm card (v6.36, same rules as qz_side*: numbers 1..side_hi); __MOCK_SEQ / __MOCK_CARD work here too, __MOCK_DRW = [12 items] the next card's line items
    const newDCard=()=>{db.side=db.side||{};const old=db.side[uid];const nums=window.__MOCK_CARD?window.__MOCK_CARD.slice():shuf([...Array(GCFG.side_hi).keys()].map(x=>x+1)).slice(0,25);window.__MOCK_CARD=null;
      const rw=window.__MOCK_DRW?window.__MOCK_DRW.slice():shuf(GCFG.side_lines);window.__MOCK_DRW=null;while(rw.length<12)rw.push('coins:500');
      db.side[uid]={nums,marked:Array(25).fill(false),drawn:[],rewards:rw.slice(0,12),done:Array(12).fill(false),boards:(old?old.boards:0)+1}};
    const dcardJ=()=>{const b=db.side[uid],used=P.dShufDay===today()?(P.dShufs|0):0;return {...b,shuffles_left:Math.max(0,GCFG.shuffle_free-used)}};
    if(fn==='qz_side'){if(!db.side||!db.side[uid])newDCard();save(db);return res(200,dcardJ())}
    if(fn==='qz_side_reset'){newDCard();save(db);return res(200,dcardJ())}
    if(fn==='qz_side_shuffle'){const used=P.dShufDay===today()?(P.dShufs|0):0;if(used>=GCFG.shuffle_free)return pgerr('no_shuffles');if(!db.side||!db.side[uid])newDCard();
      const b=db.side[uid],idx=b.marked.map((m,i)=>m?-1:i).filter(i=>i>=0),vals=shuf(idx.map(i=>b.nums[i]));idx.forEach((i,j)=>b.nums[i]=vals[j]);P.dShufDay=today();P.dShufs=used+1;save(db);return res(200,dcardJ())}
    if(fn==='qz_side_decode'){const n=body.p_count|0,g=GCFG;if(n!==1&&n!==10)return pgerr('bad_count');const cost=n===10?g.side_cost10:g.side_cost1;if(P.coins<cost)return pgerr('not_enough_coins');
      if(!db.side||!db.side[uid])newDCard();const owned=new Set(db.own[uid]);let cw=0,fw=0,tw=0,tfw=0,card=0;const out=[];db.glog=db.glog||[];
      for(let i=0;i<n;i++){const b=db.side[uid];const left=[...Array(g.side_hi).keys()].map(x=>x+1).filter(x=>!b.drawn.includes(x));
        let num=window.__MOCK_SEQ&&window.__MOCK_SEQ.length?window.__MOCK_SEQ.shift():left[Math.floor(Math.random()*left.length)];if(!left.includes(num))num=left[0];
        b.drawn.push(num);const c=b.nums.indexOf(num),lines=[];
        if(c>=0){b.marked[c]=true;BL.forEach((ln,k)=>{if(b.done[k]||!ln.every(x=>b.marked[x]))return;b.done[k]=true;const item=b.rewards[k]||'',p=item.split(':');
          let kind=p[0],gun=null,amount=/^\d{1,7}$/.test(p[1]||'')?+p[1]:0;
          if(kind==='gun'){amount=0;gun=PM[p[1]]?p[1]:null;if(gun&&!owned.has(gun)){owned.add(gun);db.own[uid].push(gun)}else{kind='coins';amount=g.side_owned_coins;cw+=amount}}
          else if(kind==='frags')fw+=amount;else if(kind==='tickets')tw+=amount;else{kind='coins';cw+=amount}
          db.glog.push({uid,at:new Date().toISOString(),src:'side',kind,tier:null,gun_id:gun,amount});lines.push({line:k,kind,gun,amount,item})})}
        const f=g.side_frag_min+Math.floor(Math.random()*(Math.max(g.side_frag_max-g.side_frag_min,0)+1));fw+=f;const tf=window.__MOCK_TFR!=null?window.__MOCK_TFR:g.trans_frag_min+Math.floor(Math.random()*(g.trans_frag_max-g.trans_frag_min+1));tfw+=tf;out.push({n:num,cell:c>=0?c:null,lines,frags:f,tfrags:tf,card});
        if(b.marked.every(Boolean)||b.drawn.length>=g.side_hi){newDCard();card++}}
      P.coins=P.coins-cost+cw;P.frags=(P.frags|0)+fw;P.tfr=(P.tfr|0)+tfw;P.tickets=(P.tickets|0)+tw;save(db);
      return res(200,{draws:out,card:dcardJ(),coins:P.coins,fragments:P.frags,tfrags:P.tfr,tickets:P.tickets,cost})}
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
    if(fn==='qz_trans_exchange'){const id=body.p_gun;if(!id||!(GCFG.trans_guns||[]).includes(id)||!PM[id])return pgerr('not_for_exchange');if(db.own[uid].includes(id))return pgerr('already_owned');
      if((P.tfr|0)<GCFG.trans_cost)return pgerr('not_enough_tfrags');P.tfr-=GCFG.trans_cost;db.own[uid].push(id);db.glog=db.glog||[];
      db.glog.push({uid,at:new Date().toISOString(),src:'trans',kind:'gun',tier:null,gun_id:id,amount:-GCFG.trans_cost,pity_hit:false});save(db);return res(200,{gun:id,tfrags:P.tfr})}
    if(fn==='qz_exchange'){const r=PM[body.p_gun];if(!r||!r.tier)return pgerr('not_for_exchange');const c=r.tier==='S'?GCFG.ex_s:GCFG.ex_a;
      if(db.own[uid].includes(body.p_gun))return pgerr('already_owned');if((P.frags|0)<c)return pgerr('not_enough_frags');P.frags-=c;db.own[uid].push(body.p_gun);
      db.glog=db.glog||[];db.glog.push({uid,at:new Date().toISOString(),src:'exchange',kind:'gun',tier:r.tier,gun_id:body.p_gun,amount:-c,pity_hit:false});save(db);return res(200,{gun:body.p_gun,fragments:P.frags})}
    // v6.83: the global chat's 12 hours (qz_chat_post / qz_chat_recent; db.clines = [{id, uid, kid, ts, t, s, r, at}]); window.__MOCK_NOCHATLOG = a database before v6.83
    if(fn==='qz_chat_post'||fn==='qz_chat_recent'){if(window.__MOCK_NOCHATLOG)return err(404,{code:'PGRST202',message:'Could not find the function public.'+fn+' in the schema cache'});
      const now=Date.now(),H12=12*3600e3;(window.__mockChat=window.__mockChat||[]).push([fn,body||{}]);
      if(fn==='qz_chat_recent'){if(window.__MOCK_CHAT_OFF)return res(200,[]);const blk=db.blk||[];
        // (v6.88: guests may ask, and the guests' lines come too; window.__MOCK_RECENT_NOANON = a database before v6.88, where a guest is refused)
        if(!uid&&window.__MOCK_RECENT_NOANON)return err(401,{code:'42501',message:'permission denied for function qz_chat_recent'});
        const L=(db.clines||[]).filter(l=>now-l.at<H12&&(l.gid||db.prof[l.uid]&&!(db.prof[l.uid].bannedT>now)&&!blk.some(z=>z.a===uid&&z.b===l.uid))).slice(-100);
        return res(200,L.map(l=>l.gid?{id:l.id,g:l.gid,n:l.gn,ts:l.ts,t:l.t}:{id:l.id,k:l.kid,ts:l.ts,t:l.t,r:l.r,n:db.prof[l.uid].nickname,tt:titleWorn(l.uid),ft:hofBest(l.uid),me:l.uid===uid}))}
      if(window.__MOCK_BAN||(P&&P.bannedT>now))return pgerr('banned');if(window.__MOCK_CHAT_OFF)return pgerr('chat_off');
      const b=body||{},t=b.p_t,ms=now+(window.__MOCK_SKEW||0);
      if(typeof t!=='string'||[...t].length<1||[...t].length>120||/[\u0000-\u001f\u007f]/.test(t))return pgerr('bad_line');
      if(typeof b.p_ts!=='number'||Math.abs(b.p_ts-ms)>600e3)return pgerr('bad_time');
      if(typeof b.p_s!=='string'||!/^[A-Za-z0-9_-]{40,120}$/.test(b.p_s))return pgerr('bad_sig');
      const CK=db.ckeys||{};if(!CK[b.p_kid]||CK[b.p_kid].uid!==uid)return pgerr('bad_key');
      let r=null;const R=b.p_r;if(R!=null){if(typeof R!=='object'||!/^[A-Z0-9]{4}$/.test(R.c||'')||!/^[a-z]{2,8}$/.test(R.m||'')||!/^[a-z0-9_]{1,24}$/.test(R.p||'')||!Number.isInteger(R.n)||!Number.isInteger(R.x)||R.n<1||R.x>8||R.n>R.x)return pgerr('bad_room');r={c:R.c,m:R.m,p:R.p,n:R.n,x:R.x}}
      const mine=(db.clines||[]).filter(l=>l.uid===uid);
      if(mine.some(l=>now-l.at<700)||mine.filter(l=>now-l.at<14e3).length>=5||r&&mine.some(l=>l.r&&now-l.at<25e3))return pgerr('too_fast');
      db.clines=(db.clines||[]).filter(l=>now-l.at<H12).slice(-2999);
      if(!db.clines.some(l=>l.kid===b.p_kid&&l.ts===b.p_ts))db.clines.push({id:(db.clseq=(db.clseq||0)+1),uid,kid:b.p_kid,ts:b.p_ts,t,s:b.p_s,r,at:now});save(db);return res(200,{ok:true,ms})}
    return err(404,{code:'PGRST202',message:'function not found'})}
  return err(404,{message:'not found '+p})}catch(e){return err(500,{message:String(e)})}};
// v6.75: Supabase Realtime for the global chat — a socket to wss://mock.supabase.test/realtime/... speaks the Phoenix messages the game
// sends (join, heartbeat, broadcast, access_token, leave); a broadcast goes to every other socket of this page and, through a
// BroadcastChannel, of this browser's other pages (private and public channels apart). window.__mockRt = the frames this page sent;
// __MOCK_RT_DENY_PRIVATE refuses a private join (no policies); __MOCK_RT_MUTE: the server answers nothing (a dead link); __mockRtInject(frame) hands this page's sockets a frame; __mockRtKill() drops them
(function(){const OW=window.WebSocket;if(!OW)return;const bc=typeof BroadcastChannel!=='undefined'?new BroadcastChannel('__mockrt'):null;const socks=new Set();
  if(bc)bc.onmessage=e=>{for(const s of socks)s._in(e.data)};
  class MockWS{constructor(url){this.url=String(url);this.readyState=0;this.topics=new Map();socks.add(this);(window.__mockRtUrls=window.__mockRtUrls||[]).push(this.url);
      setTimeout(()=>{if(this.readyState!==0)return;this.readyState=1;if(this.onopen)this.onopen({})},20)}
    send(d){if(this.readyState!==1)throw new Error('InvalidStateError');const m=JSON.parse(d);(window.__mockRt=window.__mockRt||[]).push(m);if(window.__MOCK_RT_MUTE)return;
      const rep=p=>this._emit({topic:m.topic,event:'phx_reply',payload:p,ref:m.ref});
      if(m.event==='heartbeat'){rep({status:'ok',response:{}});return}
      if(m.event==='phx_join'){const cfg=(m.payload&&m.payload.config)||{};
        if(cfg.private&&window.__MOCK_RT_DENY_PRIVATE){rep({status:'error',response:{reason:'Unauthorized: You do not have permissions to read from this Channel topic: qz-lobby'}});return}
        // (v6.88: a guest — no access_token — on a project without the guest policy)
        if(cfg.private&&!(m.payload&&m.payload.access_token)&&window.__MOCK_RT_ANON_DENY){rep({status:'error',response:{reason:'Unauthorized: You do not have permissions to read from this Channel topic: qz-lobby'}});return}
        this.topics.set(m.topic,{priv:!!cfg.private,self:!!(cfg.broadcast&&cfg.broadcast.self),tok:m.payload&&m.payload.access_token});rep({status:'ok',response:{postgres_changes:[]}});return}
      if(m.event==='phx_leave'){this.topics.delete(m.topic);rep({status:'ok',response:{}});return}
      if(m.event==='access_token'){const t=this.topics.get(m.topic);if(t)t.tok=m.payload&&m.payload.access_token;return}
      if(m.event==='broadcast'){const t=this.topics.get(m.topic);if(!t)return;const f={topic:m.topic,event:'broadcast',payload:{type:'broadcast',event:m.payload.event,payload:m.payload.payload},ref:null,priv:t.priv};
        if(bc)bc.postMessage(f);for(const s of socks)if(s!==this)s._in(f);if(t.self)this._in(f)}}
    _in(f){const t=this.topics.get(f.topic);if(!t||t.priv!==!!f.priv||this.readyState!==1)return;const o=Object.assign({},f);delete o.priv;this._emit(o)}
    _emit(o){setTimeout(()=>{if(this.readyState===1&&this.onmessage)this.onmessage({data:JSON.stringify(o)})},5)}
    close(){if(this.readyState===3)return;this.readyState=3;socks.delete(this);setTimeout(()=>{if(this.onclose)this.onclose({code:1000})},5)}}
  window.__mockRtInject=f=>{for(const s of socks)s._in(Object.assign({priv:true},f))};
  // (v6.88) what realtime.send does for the database: the event on qz-lobby, private and public, to this page and the others
  window.__mockRtDb=(event,payload)=>{for(const priv of [true,false]){const f={topic:'realtime:qz-lobby',event:'broadcast',payload:{type:'broadcast',event,payload},ref:null,priv};if(bc)bc.postMessage(f);for(const s of socks)s._in(f)}};
  window.__mockRtKill=()=>{for(const s of [...socks])s.close()};
  window.__mockRtSocks=()=>socks.size;
  const W=function(url,p){if(String(url).startsWith('wss://mock.supabase.test/'))return new MockWS(url);return p===undefined?new OW(url):new OW(url,p)};
  W.prototype=OW.prototype;W.CONNECTING=0;W.OPEN=1;W.CLOSING=2;W.CLOSED=3;window.WebSocket=W})();
})();
