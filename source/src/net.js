'use strict';
// ============ Multiplayer: friends-only, host-authoritative, peer-to-peer ============
// The room creator's browser is the host: it runs the bots, the round flow, health, infection and money. Every player moves
// their own character and judges their own shots (hit claims go to the host). Data travels on WebRTC data channels:
// 'r' (reliable, ordered) for events and 'u' (unordered, no retransmits) for the 20 Hz state stream.
// Signalling: inside claude.ai the artifact's room (each page's presence carries a compact SDP); in the standalone file the free
// PeerJS cloud server. If no direct connection can be made inside claude.ai, the room itself relays the traffic; on the site, the
// site's own relay (TURN) servers do (v6.89: TURN below, api/turn.mjs).
const NET={on:false,host:false,cli:false,ghost:0,ev:0,kind:null,api:null,code:'',me:'',hostKey:'',ui:'',
  links:new Map(),out:new Map(),inQ:[],fx:[],fxQ:[],hits:[],off:new Map(),ids:new Map(),
  lob:{cfg:{mode:'mut',bots:8,diff:1,rounds:7,time:180},pl:[]},k:0,lastK:0,tAcc:0,msg:'',hostTs:0,hostRx:0,netT:0,gen:0,mig:null};
const NET_HZ=20,NET_DELAY=110,NET_MAXP=8;
const ICE={iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']},{urls:'stun:stun.cloudflare.com:3478'}]};
const ST_L=['menu','prep','fight','end','over'],ZI=Object.fromEntries(ZALL.map((k,i)=>[k,i]));
let WL=[],WI={},NET_VER='';// filled once every weapon is registered (hooks in other files read WI even when offline)
function netTables(){if(WL.length)return;WL=Object.keys(WPN);WI={};WL.forEach((k,i)=>WI[k]=i);NET_VER='qz5-'+WL.length+'-m'+MAPLIST().join('')+'-e'+Object.keys(MAPDEFS).filter(k=>MAPDEFS[k].ep).join('')+'-r20'}// r20: Whitehill and Red Mesa Ranch mirrored and changed (the geometry must match between host and clients, v7.3); r19: chapter 10 — ELPIS, the Patient and the AED in the zombie classes (v6.99); r18: chapter 9 — DAEDALUS, the Static and the sentry gun in the zombie classes (v6.98); r17: chapter 8 — CHARON and the Frozen in the zombie classes (v6.97); r16: chapter 7 — LORELEI and the Listener in the zombie classes (v6.96); r15: the StarTrack's B mode, charge and beam (stb / stc / stf, v6.93); r14: chapter 6 — LEGATUS and the shield trooper in the zombie classes (v6.92); r11: the host checks every claim and holds each link to a message budget (v6.72); r3: Whitehill rebuilt on two levels (map geometry must match between peers); r6: episodes; r7: host migration (v6.38); r8: the firefighter zombie (v6.39); r9: TWINFACE-1 states, the crowbar's shock (v6.40); r10: MORTA-9 states and its slow, the Onyx's B and Deadshot (v6.41)
// r12 (v6.82): a player can join a match under way (latejoin.js: 'start' with late, 'jn' to the others)
// r13 (v6.91): the straitjacket zombie can be picked (strait.js: sjc / sjg / sju), and a class picked in a match reaches the host
const r1=v=>Math.round((v||0)*10),r2=v=>Math.round((v||0)*100),r3=v=>Math.round((v||0)*1000);
const netNow=()=>performance.now();
function netKey(n){const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<n;i++)s+=A[Math.floor(Math.random()*A.length)];return s}
function byId(id){return NET.ids.get(id)||null}
function actorOfKey(k){for(const a of G.actors)if(a.net===k)return a;return null}

// ---------- strings ----------
Object.assign(STR.ko,{mp:'멀티플레이',mpName:'닉네임',mpCreate:'방 만들기',mpJoin:'참가',mpCode:'방 코드로 참가',mpCodePh:'코드 4자리',
  mpChecking:'연결 방식 확인 중…',mpNone:'여기서는 멀티플레이를 쓸 수 없어요 (claude.ai 링크나 인터넷이 되는 파일에서 열어 주세요)',
  mpViaRoom:'이 claude.ai 링크 안에서 연결해요 — 친구도 같은 링크를 공유받아 로그인한 채로 열어야 해요',mpViaPJ:'무료 PeerJS 서버로 연결해요 — 친구도 같은 파일(같은 버전)을 열어야 해요',
  mpConnecting:'연결 중…',mpNotFound:'방을 찾을 수 없어요 — 코드를 확인해 주세요',mpFull:'방이 가득 찼어요',mpInGame:'이미 게임이 진행 중인 방이에요',mpVer:'게임 버전이 달라요 — 같은 링크/파일로 열어 주세요',
  mpHostGone:'호스트와 연결이 끊겼어요',mpFail:'연결하지 못했어요',mpLobby:'대기실',mpPlayers:'플레이어',mpStart:'시작',mpWait:'호스트가 시작하길 기다리는 중…',mpLeave:'나가기',
  mpCopy:'코드 복사',mpCopied:'복사했어요',mpBots:'봇 수',mpJoined:n=>`${n} 님이 들어왔어요`,mpLeft:n=>`${n} 님이 나갔어요 — 봇이 이어받아요`,mpLeftL:n=>`${n} 님이 나갔어요`,
  mpDirect:'P2P 직접',mpRelay:'claude 중계',mpHost:'호스트',mpToLobby:'대기실로',mpCodeIs:'방 코드',mpShare:'친구에게 코드를 알려 주세요',mpMe:'나',mpSet:'게임 설정',mpOnlyHost:'설정은 호스트가 정해요',
  mpBad:'코드는 4자리예요',mpNatPJ:'직접 연결이 안 돼요 — 와이파이가 기기끼리 연결을 막았거나(학교·기숙사·카페 와이파이) 방화벽이 막았어요. 지금은 중계 서버를 쓸 수 없어요',
  mpNatTurnBlk:'직접 연결이 안 되고, 이 네트워크에서는 중계 서버에도 닿지 않아요 — 다른 와이파이나 휴대폰 핫스팟으로 해 보세요',mpNatTurn:'중계 서버로도 연결하지 못했어요 — 방장 쪽 네트워크가 막고 있을 수 있어요',mpTurn:'중계 서버',mpP2POnly:'P2P로만 연결 (claude 중계 안 씀)',mpP2PFail:'P2P 직접 연결에 실패했어요',mpP2PHost:'방장이 P2P 전용으로 설정했는데 직접 연결에 실패했어요',mpPaused:'멀티플레이 중에는 게임이 멈추지 않아요',mpNoRoom:'이 화면에서는 방에 연결할 수 없어요 — claude.ai에 로그인한 채로, 공유받은 링크로 열어 주세요'});
Object.assign(STR.en,{mp:'Multiplayer',mpName:'Nickname',mpCreate:'Create room',mpJoin:'Join',mpCode:'Join with a room code',mpCodePh:'4-letter code',
  mpChecking:'Checking how to connect…',mpNone:'Multiplayer is not available here (open the claude.ai link, or the file with internet access)',
  mpViaRoom:'Connects inside this claude.ai link — friends must open the same shared link while signed in',mpViaPJ:'Connects through the free PeerJS server — friends must open the same file (same version)',
  mpConnecting:'Connecting…',mpNotFound:'Room not found — check the code',mpFull:'The room is full',mpInGame:'That room is already playing',mpVer:'Different game version — open the same link/file',
  mpHostGone:'Lost the connection to the host',mpFail:'Could not connect',mpLobby:'Lobby',mpPlayers:'Players',mpStart:'Start',mpWait:'Waiting for the host to start…',mpLeave:'Leave',
  mpCopy:'Copy code',mpCopied:'Copied',mpBots:'Bots',mpJoined:n=>`${n} joined`,mpLeft:n=>`${n} left — a bot takes over`,mpLeftL:n=>`${n} left`,
  mpDirect:'P2P direct',mpRelay:'claude relay',mpHost:'Host',mpToLobby:'Back to lobby',mpCodeIs:'Room code',mpShare:'Give your friends the code',mpMe:'you',mpSet:'Match settings',mpOnlyHost:'The host picks the settings',
  mpBad:'Codes have 4 letters',mpNatPJ:'No direct connection — the Wi-Fi keeps its devices apart (common at schools, dorms and cafés) or a firewall blocks it, and no relay server is available right now',
  mpNatTurnBlk:'No direct connection, and this network does not reach the relay server either — try another Wi-Fi or a phone hotspot',mpNatTurn:'Could not connect through the relay server either — the host’s network may be blocking it',mpTurn:'relay server',mpP2POnly:'P2P only (never use the claude relay)',mpP2PFail:'Could not make a direct P2P connection',mpP2PHost:'The host allows P2P only and a direct connection failed',mpPaused:'The game keeps running in multiplayer',mpNoRoom:'This view cannot join rooms — open the shared link while signed in to claude.ai'});
// host migration (v6.38)
Object.assign(STR.ko,{mpMigLeft:'방장이 나갔어요',mpMigConn:'새 방장에게 연결 중…',mpMigWaitP:(a,b)=>`다른 플레이어 기다리는 중… ${a}/${b}`,mpMigIn:'연결됨 — 곧 다시 시작해요',mpMigMe:'이제 내가 방장이에요',mpMigNew:n=>`새 방장: ${n}`,
  mpMigRound:'라운드를 다시 시작해요',mpMigStage:'이 스테이지를 다시 시작해요',mpMigZone:'지금 구역부터 다시 시작해요',mpMigPhase:'보스전을 지금 페이즈부터 다시 시작해요',mpMigGo:'이어서 진행해요',
  mpMigFail:'새 방장과 연결하지 못했어요',mpGive:'방장 넘기기',mpGiveQ:'넘길까요?',mpGiving:'방장을 넘기는 중…',mpGave:n=>`${n} 님에게 방장을 넘겼어요`});
Object.assign(STR.en,{mpMigLeft:'The host left',mpMigConn:'Connecting to the new host…',mpMigWaitP:(a,b)=>`Waiting for the others… ${a}/${b}`,mpMigIn:'Connected — starting again in a moment',mpMigMe:'You are the host now',mpMigNew:n=>`New host: ${n}`,
  mpMigRound:'The round starts over',mpMigStage:'This stage starts over',mpMigZone:'Starting this zone over',mpMigPhase:'The boss fight starts over from this phase',mpMigGo:'Carrying on',
  mpMigFail:'Could not reach the new host',mpGive:'Make host',mpGiveQ:'Sure?',mpGiving:'Handing the room over…',mpGave:n=>`${n} is the host now`});

// ---------- transport detection ----------
async function netDetect(){if(NET.kind)return NET.kind;
  try{if(window.claude&&typeof window.claude.use==='function'){const r=await window.claude.use('room');if(r){NET.api=r;return NET.kind='room'}}}catch(e){}
  if(typeof window.Peer==='function')return NET.kind='peerjs';return null}

// ---------- compact SDP: a data-channel session needs only ICE credentials, the DTLS fingerprint, the role and UDP candidates ----------
function sdpPack(sdp){const o={u:'',p:'',f:'',s:'',c:[]};
  for(const l of sdp.split(/\r?\n/)){if(l.startsWith('a=ice-ufrag:'))o.u=l.slice(12);else if(l.startsWith('a=ice-pwd:'))o.p=l.slice(10);
    else if(l.startsWith('a=fingerprint:sha-256 '))o.f=l.slice(22).replace(/:/g,'');else if(l.startsWith('a=setup:'))o.s=l.slice(8);
    else if(l.startsWith('a=candidate:')){const p=l.slice(12).split(' ');if(p.length<8||p[2].toLowerCase()!=='udp')continue;if(o.c.length<8)o.c.push([p[0],p[3],p[4],p[5],p[7]].join(' '))}}
  return o}
function sdpUnpack(o){const fp=(o.f.match(/../g)||[]).join(':');
  let s='v=0\r\no=- 4611731400430051336 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=msid-semantic: WMS\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\nc=IN IP4 0.0.0.0\r\n';
  for(const c of o.c){const [f,pr,ip,pt,ty]=c.split(' ');s+=`a=candidate:${f} 1 udp ${pr} ${ip} ${pt} typ ${ty}${ty==='host'?'':' raddr 0.0.0.0 rport 0'}\r\n`}
  return s+`a=ice-ufrag:${o.u}\r\na=ice-pwd:${o.p}\r\na=ice-options:trickle\r\na=fingerprint:sha-256 ${fp}\r\na=setup:${o.s}\r\na=mid:0\r\na=sctp-port:5000\r\na=max-message-size:262144\r\n`}
function iceDone(pc,ms){return new Promise(res=>{if(pc.iceGatheringState==='complete')return res();let srflx=false,t2=null;const t=setTimeout(res,ms);
  pc.addEventListener('icegatheringstatechange',()=>{if(pc.iceGatheringState==='complete'){clearTimeout(t);clearTimeout(t2);res()}});
  // once a public (server-reflexive) address is known, wait only a moment more for the rest
  pc.addEventListener('icecandidate',e=>{if(e.candidate&&/ typ srflx/.test(e.candidate.candidate)&&!srflx){srflx=true;t2=setTimeout(res,350)}})})}

// ---------- links: one per remote page ----------
function mkLink(key,kind){return {key,kind,ok:false,dead:false,rtt:0,lastRx:netNow(),lastK:0,inGame:false,name:'',send(){},close(){}}}
function rtcLink(key,pc){const L=mkLink(key,'p2p');L.pc=pc;
  const check=()=>{if(!L.ok&&L.r&&L.u&&L.r.readyState==='open'&&L.u.readyState==='open'){L.ok=true;netLinkUp(L)}};
  L.attach=ch=>{if(ch.label==='r')L.r=ch;else L.u=ch;ch.onopen=check;ch.onclose=()=>netLinkDown(L,'close');
    ch.onmessage=e=>{L.lastRx=netNow();netRx(L,e.data,ch.label==='r')};check()};
  pc.ondatachannel=e=>L.attach(e.channel);
  pc.onconnectionstatechange=()=>{if(pc.connectionState==='failed')netLinkDown(L,'failed')};
  L.send=(s,rel)=>{const ch=rel?L.r:L.u;if(ch&&ch.readyState==='open'){try{ch.send(s)}catch(e){}}};
  L.close=()=>{try{pc.close()}catch(e){}};return L}
// the room relay: messages ride in this page's presence; reliable ones are numbered and resent until the other side acknowledges them
function relayLink(key){const L=mkLink(key,'relay');L.q=[];L.seq=0;L.rseq=0;L.u=null;L.lastU=null;L.fw=[];
  // presence keeps only the latest state, so the last few ticks' effects ride along with it and the receiver skips what it has seen
  L.send=(s,rel)=>{if(rel){L.q.push([++L.seq,s]);if(L.q.length>400)netLinkDown(L,'overflow')}
    else{let o=null;try{o=JSON.parse(s)}catch(e){}if(o&&Array.isArray(o.f)){L.fw=L.fw.filter(x=>x[0]>o.k-3);if(o.f.length)L.fw.push([o.k,o.f]);o.fw=L.fw.slice();delete o.f;s=JSON.stringify(o);
      // a stream blob must fit one presence (4 KiB): older effect windows go first, then the slow scoreboard block
      while(s.length>3500&&o.fw.length>1){o.fw.shift();s=JSON.stringify(o)}if(s.length>3500&&o.S){delete o.S;s=JSON.stringify(o)}if(s.length>3500&&o.fw.length){o.fw[0]=[o.fw[0][0],o.fw[0][1].slice(-8)];s=JSON.stringify(o)}}L.u=s}RSIG.dirty=true};
  L.close=()=>{};return L}
function pjLink(key){const L=mkLink(key,'p2p');
  const check=()=>{if(!L.ok&&L.r&&L.u&&L.r.open&&L.u.open){L.ok=true;netLinkUp(L)}};
  L.attach=c=>{if(c.label==='r')L.r=c;else L.u=c;c.on('open',check);c.on('data',d=>{L.lastRx=netNow();netRx(L,d,c.label==='r')});c.on('close',()=>netLinkDown(L,'close'));c.on('error',()=>{});check()};
  L.send=(s,rel)=>{const c=rel?L.r:L.u;if(c&&c.open){try{c.send(s)}catch(e){}}};
  L.close=()=>{try{L.r&&L.r.close();L.u&&L.u.close()}catch(e){}};return L}

// ---------- signalling over the claude.ai room ----------
const RSIG={R:null,U:null,uUnsub:null,uOpening:false,lastU:null,lastRl:'',pres:{},unsub:null,byPeer:{},seen:new Map(),pend:new Map(),dirty:false,flushT:0,
  async open(){const api=NET.api;let R=null;try{R=await api.join('qz-'+NET.code.toLowerCase())}catch(e){R=null}
    this.R=R||api;this.byPeer={};this.seen=new Map();this.pend=new Map();
    this.pres={qz:1,c:NET.code,r:NET.host?'h':'c',k:NET.me,n:CFG.mpName||'',sig:null,rl:null,rq:null,p2p:CFG.p2pOnly&&NET.host?1:null};
    await this.R.presence(this.pres).catch(()=>{});
    this.unsub=this.R.onPeers(ch=>{try{this.onPeers(ch)}catch(e){console.error(e)}},e=>{if(NET.on)netFatal(e.code==='not_granted'||e.code==='revoked'?T('mpNoRoom'):T('mpFail')+' ('+e.code+')')})},
  // the 20 Hz state stream gets its own named room: its own 4 KiB presence, so it never crowds out the reliable queue
  async openU(){if(this.U||this.uOpening||!NET.api||!NET.api.join)return;this.uOpening=true;let U=null;try{U=await NET.api.join('qzs-'+NET.code.toLowerCase())}catch(e){U=null}this.uOpening=false;
    if(!U||!NET.on){if(U)U.leave().catch(()=>{});return}this.U=U;this.lastU=null;U.presence({k:NET.me}).catch(()=>{});
    this.uUnsub=U.onPeers(ch=>{for(const p of ch.joined.concat(ch.updated)){if(p.sameTab)continue;const P=p.presence;if(!P||typeof P.k!=='string')continue;
        if(NET.cli&&P.k!==NET.hostKey)continue;const L=NET.links.get(P.k);if(!L||L.kind!=='relay')continue;
        const u=Array.isArray(P.u)?P.u.join(''):'';if(u&&u!==L.lastU){L.lastU=u;L.lastRx=netNow();netRx(L,u,false)}}},()=>{this.U=null})},
  close(){if(this.uUnsub)try{this.uUnsub()}catch(e){}this.uUnsub=null;if(this.U){this.U.leave().catch(()=>{});this.U=null}
    if(this.unsub)try{this.unsub()}catch(e){}this.unsub=null;const R=this.R;this.R=null;for(const p of this.pend.values())try{p.pc&&p.pc.close()}catch(e){}this.pend.clear();
    if(R){if(R.leave&&R!==NET.api)R.leave().catch(()=>{});else R.presence({qz:null,c:null,r:null,k:null,n:null,sig:null,rl:null,rq:null}).catch(()=>{})}},
  set(patch){if(!this.R)return;Object.assign(this.pres,patch);this.R.presence(patch).catch(()=>{})},
  setSig(k,v){const s=Object.assign({},this.pres.sig||{});if(v)s[k]=v;else delete s[k];this.set({sig:Object.keys(s).length?s:null})},
  onPeers(ch){for(const p of ch.left){const k=this.byPeer[p.peer];if(k){delete this.byPeer[p.peer];this.seen.delete(k);const L=NET.links.get(k);if(L)netLinkDown(L,'left');
      const pd=this.pend.get(k);if(pd){try{pd.pc.close()}catch(e){}this.pend.delete(k)}}}
    for(const p of ch.peers){if(p.sameTab)continue;const P=p.presence;if(!P||P.qz!==1||P.c!==NET.code||!P.k)continue;this.byPeer[p.peer]=P.k;
      if(this.seen.get(P.k)===P)continue;this.seen.set(P.k,P);this.handle(P)}},
  handle(P){const k=P.k;
    if(NET.cli){if(P.r!=='h')return;if(P.p2p)NET.hostP2P=true;if(!NET.hostKey){NET.hostKey=k;if(!NET.forceRelay&&typeof RTCPeerConnection==='function')netRtcOffer(k).catch(e=>{console.warn(e);netUseRelay(k,'err')});else netUseRelay(k,NET.forceRelay?'forced':'nortc')}
      if(k!==NET.hostKey)return;const s=P.sig&&P.sig[NET.me];const pd=this.pend.get(k);
      if(s&&s.a&&pd&&!pd.answered&&s.i===pd.i){pd.answered=true;pd.pc.setRemoteDescription({type:'answer',sdp:sdpUnpack(s.a)}).catch(e=>{console.warn(e);netUseRelay(k,'sdp')})}}
    else if(NET.host){if(P.r!=='c')return;
      if(P.rq&&!CFG.p2pOnly){const L=NET.links.get(k);if(!L||L.kind!=='relay')netUseRelay(k,typeof P.rq==='string'&&/^[a-z]{1,8}$/.test(P.rq)?P.rq:'peer')}
      const s=P.sig&&P.sig[NET.me];if(s&&s.o&&!P.rq&&typeof RTCPeerConnection==='function'){const pd=this.pend.get(k);if(!pd||pd.i!==s.i)netRtcAnswer(k,s).catch(e=>console.warn(e))}}
    if(P.rl){const L=NET.links.get(k);if(L&&L.kind==='relay')this.rx(L,P.rl)}},
  // relay receive: the latest state blob, then every numbered message not seen yet, then the other side's acknowledgement
  rx(L,rl){L.lastRx=netNow();const J=v=>Array.isArray(v)?v.join(''):typeof v==='string'?v:'';
    const u=J(rl.u);if(u&&u!==L.lastU){L.lastU=u;netRx(L,u,false)}
    const q=NET.host?rl.q:(rl.q&&rl.q[NET.me]);if(Array.isArray(q))for(const it of q){if(!Array.isArray(it))continue;const s=it[0];if(s>L.rseq){L.rseq=s;netRx(L,J(it[1]),true);this.dirty=true}}
    const a=NET.host?rl.a:(rl.a&&rl.a[NET.me]);if(a!=null){while(L.q.length&&L.q[0][0]<=a)L.q.shift()}},
  flush(){if(!this.R||!this.dirty)return;this.dirty=false;let u=null;const q={},a={};let any=false;
    const C=s=>{const o=[];for(let i=0;i<s.length;i+=900)o.push(s.slice(i,i+900));return o};
    for(const L of NET.links.values()){if(L.kind!=='relay'||L.dead)continue;any=true;if(L.u!=null)u=L.u;q[L.key]=L.q.slice(0,40).map(([n,m])=>[n,C(m)]);a[L.key]=L.rseq}
    if(!any){if(this.pres.rl)this.set({rl:null});return}
    if(!this.U)this.openU();
    // stream: its own room when there is one (only when it changed), else it rides with the reliable queue
    const viaU=!!this.U;if(viaU&&u&&u!==this.lastU){this.lastU=u;this.U.presence({u:C(u)}).catch(()=>{})}
    let rl=NET.host?{u:viaU?null:(u&&C(u)),q,a}:{u:viaU?null:(u&&C(u)),q:q[NET.hostKey]||[],a:a[NET.hostKey]||0};
    // stay inside the room's 4 KiB presence: drop queued messages first (they go next time), then the state blob
    let n=JSON.stringify(this.pres).length-JSON.stringify(this.pres.rl||null).length;
    const fit=()=>JSON.stringify(rl).length+n<3900;
    while(!fit()){let cut=false;if(NET.host){for(const k in rl.q)if(rl.q[k].length>1){rl.q[k]=rl.q[k].slice(0,Math.ceil(rl.q[k].length/2));cut=true}}else if(rl.q.length>1){rl.q=rl.q.slice(0,Math.ceil(rl.q.length/2));cut=true}
      if(!cut){if(rl.u){rl.u=null;continue}break}}
    const js=JSON.stringify(rl);if(js===this.lastRl)return;this.lastRl=js;this.set({rl})}};
async function netRtcOffer(k){const pc=new RTCPeerConnection(ICE);const L=rtcLink(k,pc);const i=(RSIG.pend.get(k)||{i:0}).i+1;const pd={pc,L,i,answered:false};RSIG.pend.set(k,pd);
  L.attach(pc.createDataChannel('r',{ordered:true}));L.attach(pc.createDataChannel('u',{ordered:false,maxRetransmits:0}));
  try{await pc.setLocalDescription(await pc.createOffer());await iceDone(pc,2600);if(RSIG.pend.get(k)!==pd)return;
    RSIG.setSig(k,{o:sdpPack(pc.localDescription.sdp),i});}catch(e){console.warn(e);netUseRelay(k,'err');return}
  NET.links.set(k,L);
  // no direct path within a few seconds (strict NAT, blocked UDP): the room relays instead
  setTimeout(()=>{if(NET.on&&NET.links.get(k)===L&&!L.ok&&(CFG.p2pOnly||NET.hostP2P)&&!NET.p2pRetry){NET.p2pRetry=1;netRtcOffer(k).catch(e=>netUseRelay(k,'err'));return}
    if(NET.on&&NET.links.get(k)===L&&!L.ok)netUseRelay(k,L.pc&&L.pc.iceConnectionState==='checking'?'nat':'timeout')},14000)}
async function netRtcAnswer(k,s){const old=RSIG.pend.get(k);if(old)try{old.pc.close()}catch(e){}
  const pc=new RTCPeerConnection(ICE);const L=rtcLink(k,pc);const pd={pc,L,i:s.i};RSIG.pend.set(k,pd);NET.links.set(k,L);
  try{await pc.setRemoteDescription({type:'offer',sdp:sdpUnpack(s.o)});await pc.setLocalDescription(await pc.createAnswer());await iceDone(pc,2600);
    if(RSIG.pend.get(k)!==pd)return;RSIG.setSig(k,{a:sdpPack(pc.localDescription.sdp),i:s.i})}catch(e){console.warn(e)}}
function netUseRelay(k,why){if(NET.kind!=='room')return;
  // P2P only (this player's choice, or the host's): no relay, say why the direct link failed
  if(NET.cli&&(CFG.p2pOnly||NET.hostP2P)){const w=typeof relayWhyT==='function'?relayWhyT(why):why;netFatal((NET.hostP2P&&!CFG.p2pOnly?T('mpP2PHost'):T('mpP2PFail'))+' — '+w);return}
  if(NET.host&&CFG.p2pOnly)return;NET.relayWhy=why||NET.relayWhy||'';const old=NET.links.get(k);if(old&&old.kind==='relay')return;
  const pd=RSIG.pend.get(k);if(pd){try{pd.pc.close()}catch(e){}RSIG.pend.delete(k)}if(old){old.dead=true;old.close()}
  const L=relayLink(k);NET.links.set(k,L);if(NET.cli){RSIG.set({rq:NET.relayWhy||1,sig:null})}else RSIG.setSig(k,null);L.ok=true;netLinkUp(L)}

// ---------- the site's relay (TURN) servers (v6.89) ----------
// PeerJS ended its free TURN servers in December 2023, so two pages that could not reach each other directly (a Wi-Fi that keeps its
// devices apart, a firewall, two strict NATs) had nothing left to try: "직접 연결이 안 돼요". The site's /api/turn (api/turn.mjs) hands
// out Cloudflare TURN logins that run out after a few hours; the key stays on the server. A page opened from a file, or a site without
// the key, goes on with STUN only (why: none = no site to ask, unset = no key on the site, net / cf… / http… = the ask failed).
const TURN={ice:null,exp:0,soon:0,p:null,why:'',failT:0,
  url(){return typeof window.__turnUrl==='string'?window.__turnUrl:/^https?:$/.test(location.protocol)?'/api/turn':''},
  // the logins while they last (not in their last 15 minutes: a link made then would lose its relay mid-match)
  use(){return this.ice&&Date.now()<this.exp-9e5?this.ice:null},
  get(ms){if(this.ice&&Date.now()<this.soon)return Promise.resolve(this.ice);if(this.p)return this.p;const u=this.url();
    if(!u){this.why='none';return Promise.resolve(this.use())}if(Date.now()-this.failT<30e3)return Promise.resolve(this.use());
    const ac=typeof AbortController==='function'?new AbortController():null,t=setTimeout(()=>{try{ac&&ac.abort()}catch(e){}},ms||4000);
    return this.p=fetch(u,{cache:'no-store',credentials:'omit',signal:ac?ac.signal:undefined}).then(r=>r.json().catch(()=>({ok:false,why:'http'+r.status})))
      .then(j=>{const ice=j&&j.ok?turnClean(j.iceServers):[];
        if(ice.some(s=>s.username)){const ttl=Math.max(1800,Math.min(86400,+j.ttl||3600))*1e3,now=Date.now();this.ice=ice;this.exp=now+ttl;this.soon=now+ttl*.75;this.why='';this.apply()}
        else{this.why=String(j&&j.why||'bad').replace(/[^\w]/g,'').slice(0,12);this.failT=Date.now()}
        return this.use()},()=>{this.why='net';this.failT=Date.now();return this.use()})
      .finally(()=>{clearTimeout(t);this.p=null})},
  // a page that stays long in a room (a host) takes fresh logins before they run out; PeerJS reads its peer's config for each new link
  tick(){if(NET.on&&NET.kind==='peerjs'&&this.ice&&Date.now()>this.soon)this.get()},
  apply(){const ice=PJ.ice();for(const p of [PJ.peer,PJ.bellP])if(p&&p.options&&p.options.config)p.options.config.iceServers=ice}};
setInterval(()=>{try{TURN.tick()}catch(e){}},30e3);
// only what RTCPeerConnection takes: stun / turn / turns addresses (port 53, which browsers refuse, left out), a login with the turn ones
function turnClean(a){const res=[];if(!Array.isArray(a))return res;
  for(const s of a.slice(0,6)){if(!s||typeof s!=='object')continue;
    const urls=(Array.isArray(s.urls)?s.urls:[s.urls]).filter(u=>typeof u==='string'&&u.length<200&&/^(stun|turns?):[a-z0-9.\-]+(:\d{1,5})?(\?transport=(udp|tcp))?$/i.test(u)&&!/:53(\?|$)/.test(u)).slice(0,8);
    if(!urls.length)continue;const turn=urls.some(u=>/^turns?:/i.test(u));
    if(turn&&!(typeof s.username==='string'&&typeof s.credential==='string'&&s.username&&s.credential&&s.username.length<600&&s.credential.length<600))continue;
    res.push(turn?{urls,username:s.username,credential:s.credential}:{urls})}
  return res}
// (whether this page got a relay address for a link: none means its own network keeps it from the relay server)
function pjWatch(L,c){const pc=c&&c.peerConnection;if(!pc||!pc.addEventListener)return;pc.addEventListener('icecandidate',e=>{if(e.candidate&&/ typ relay/.test(e.candidate.candidate||''))L.relayC=true})}
// which way a link went: straight, or through the relay server — the waiting room and the game's corner show it
async function pjVia(L){if(L.dead)return;let v='';
  for(const c of [L.u,L.r]){const pc=c&&c.peerConnection;if(!pc||!pc.getStats)continue;
    try{const s=await pc.getStats();let pair=null;s.forEach(x=>{if(x.type==='transport'&&x.selectedCandidatePairId&&s.get(x.selectedCandidatePairId))pair=s.get(x.selectedCandidatePairId)});
      if(!pair)s.forEach(x=>{if(x.type==='candidate-pair'&&x.nominated&&x.state==='succeeded'&&(!pair||(x.bytesReceived|0)>(pair.bytesReceived|0)))pair=x});
      if(!pair)continue;const lc=s.get(pair.localCandidateId),rc=s.get(pair.remoteCandidateId);
      if(lc&&lc.candidateType==='relay'||rc&&rc.candidateType==='relay'){v='turn';break}v='p2p'}catch(e){}}
  if(v&&L.via!==v&&!L.dead){L.via=v;if(NET.host)netLobbyCast();else UI.mpRender&&UI.mpRender()}}

// ---------- signalling through PeerJS (standalone file) ----------
// v6.38: every page's peer takes connections (a client may become the host), and a new host also claims the room code's id (the
// doorbell, bell) so friends can still join with the code; the room's original id may stay taken for a while after a crash.
const PJ={peer:null,bell:null,bellP:null,bellT:0,bellN:0,onErr:null,
  // the free PeerJS cloud brokers the links; always over TLS, even when this file is opened from disk
  // STUN finds this page's public address (more servers than PeerJS's default one, so it is found on more networks); then the site's
  // TURN when it has one (v6.89: PeerJS's own TURN servers are gone)
  ice(){const t=TURN.use();return t?[{urls:'stun:stun.l.google.com:19302'}].concat(t):[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302','stun:stun2.l.google.com:19302']},{urls:'stun:stun.cloudflare.com:3478'}]},
  opts(){return Object.assign({debug:0,secure:true,config:{iceServers:this.ice(),sdpSemantics:'unified-plan'}},window.__peerOpts||{})},
  // this page's own peer: the room code's id for a host, a random one for a client
  mk(id){return new Promise((res,rej)=>{let open=false;const p=id?new Peer(id,this.opts()):new Peer(this.opts());this.peer=p;
    p.on('open',pid=>{if(this.peer!==p)return;open=true;NET.me=pid;res(pid)});p.on('connection',c=>pjAccept(c));
    p.on('error',e=>{if(this.peer!==p)return;if(!open){open=true;rej(e);return}if(this.onErr&&this.onErr(e))return;if(e&&e.type==='peer-unavailable'&&netMigUnavail(e))return;console.warn('peerjs',e&&e.type)});
    p.on('disconnected',()=>{if(this.peer===p&&!p.destroyed)try{p.reconnect()}catch(e){}})})},
  host(){return this.mk('qzg-'+NET.code.toLowerCase())},
  join(){return this.mk().then(()=>new Promise((res,rej)=>{const hk='qzg-'+NET.code.toLowerCase();NET.hostKey=hk;const L=pjLink(hk);NET.links.set(hk,L);let done=false;
    const fin=e=>{if(done)return;done=true;this.onErr=null;if(e)rej(e);else res()};this.onErr=e=>{fin(e);return true};
    for(const o of [{label:'r',reliable:true,serialization:'raw'},{label:'u',reliable:false,serialization:'raw'}]){const c=this.peer.connect(hk,o);pjWatch(L,c);L.attach(c)}
    // a relayed (TURN) path can take a while to come up: wait longer, then say what got stuck (and whether a relay address was had)
    setTimeout(()=>{if(done)return;let st='';try{const pc=L.r&&L.r.peerConnection;st=pc?pc.iceConnectionState:''}catch(e){}
      fin({type:st==='checking'||st==='failed'||st==='disconnected'?'nat':'timeout',relay:TURN.use()?!!L.relayC:undefined})},25000);L.onUp=()=>fin()}))},
  // the doorbell: a new host claims the room code's id next to its own (retried every 5 s while someone, or a crashed host's ghost,
  // holds it; after 30 tries the old host is taken to be still there and the code stays its)
  bellOn(){if(this.bellP||this.bellT||!NET.on||!NET.host||NET.kind!=='peerjs'||!NET.code)return;const id='qzg-'+NET.code.toLowerCase();if(this.peer&&this.peer.id===id)return;
    const p=new Peer(id,this.opts());this.bellP=p;
    p.on('open',()=>{if(this.bellP===p){this.bell=p;this.bellN=0}});p.on('connection',c=>pjAccept(c));
    p.on('error',e=>{if(this.bellP!==p||this.bell&&!(e&&e.type==='unavailable-id'))return;try{p.destroy()}catch(_){}this.bellP=this.bell=null;if(++this.bellN>=30)return;this.bellT=setTimeout(()=>{this.bellT=0;this.bellOn()},5000)});
    p.on('disconnected',()=>{if(this.bellP===p&&!p.destroyed)try{p.reconnect()}catch(e){}})},
  bellOff(){if(this.bellT)clearTimeout(this.bellT);this.bellT=0;const p=this.bellP;this.bellP=this.bell=null;if(p)try{p.destroy()}catch(e){}},
  // let go of this page's peers now; they are destroyed when the returned function runs (after the goodbyes have gone out)
  detach(){const p=this.peer,b=this.bellP;if(this.bellT)clearTimeout(this.bellT);this.bellT=this.bellN=0;this.peer=this.bellP=this.bell=null;this.onErr=null;return ()=>{for(const x of [p,b])if(x)try{x.destroy()}catch(e){}}},
  close(){this.detach()()}};
function pjAccept(c){if(!NET.on||NET.kind!=='peerjs'){try{c.close()}catch(e){}return}let L=NET.links.get(c.peer);
  // (a dial of ours to the same page that has not opened yet gives way to theirs)
  if(L&&L.kind==='p2p'&&!L.dead&&!L.ok&&L.dialed){L.dead=true;try{L.close()}catch(e){}L=null}
  if(!L||L.kind!=='p2p'||L.dead){L=pjLink(c.peer);NET.links.set(c.peer,L)}L.attach(c)}

// ---------- link lifecycle ----------
function netLinkUp(L){if(L.onUp)L.onUp();
  // (v6.89: straight or through the relay server — asked once the link has settled, and again a little later)
  if(NET.kind==='peerjs'&&L.kind==='p2p'){setTimeout(()=>pjVia(L),800);setTimeout(()=>pjVia(L),6000)}
  // the handshake is done: clear it from the room presence (it is small, but many friends at once would not fit)
  if(NET.kind==='room'&&L.kind==='p2p'){if(NET.host)RSIG.setSig(L.key,null);else RSIG.set({sig:null})}
  // a client says hello to its host only (other pages may open links to it while a new host is being found)
  if(NET.cli&&L.key===NET.hostKey){const M=NET.mig;if(M&&M.dial&&M.dial.k===L.key)M.dial.up=true;NET.msg='';netSend(L.key,netHello());UI.mpRender&&UI.mpRender();netMigUI()}}
function netHello(){const o={t:'hello',v:NET_VER,n:CFG.mpName,s:CFG.skin,z:CFG.zclass,...TTL.hello()};if(typeof TOUCH!=='undefined'&&TOUCH.on)o.tc=1;
  // on the way to a new host: which hand-over this is, who turned out to be gone, and (scenario) this player's weapon upgrades
  const M=NET.mig;if(M&&M.role==='cli'){o.mg=M.g||1;o.sk=[...M.gone].slice(0,NET_MAXP);const P=G.player;if(NET.ui==='game'&&P&&G.mode==='scen'&&P.wup)o.wu=P.wup}return o}
function netLinkDown(L,why){if(L.dead)return;console.warn('net: link down',L.kind,why);L.dead=true;L.ok=false;try{L.close()}catch(e){}
  if(NET.links.get(L.key)!==L)return;NET.links.delete(L.key);NET.out.delete(L.key);if(!NET.on)return;
  if(NET.cli){if(L.key===NET.hostKey){if(NET.mig)netFatal(T('mpMigFail'));else if(netMigOK())netMigStart(why);else netFatal(NET.ui==='game'||NET.ui==='lobby'?T('mpHostGone'):T('mpFail'))}}
  else netDropPlayer(L.key)}
function netDropPlayer(k){const i=NET.lob.pl.findIndex(p=>p.k===k);if(i>0)NET.lob.pl.splice(i,1);
  if(NET.ui==='game'){const a=actorOfKey(k);if(a){a.net=null;a.pup=false;a.nb=null;a.nraw=null;a.bot=AI.mk(a);if(a.alive)AI.onTeam(a);netEv('bot',{i:a.id});HUD.note(T('mpLeft',a.name),3)}}
  netLobbyCast()}

// ---------- reliable / unreliable messaging ----------
function netSend(k,m){if(!k)return;let q=NET.out.get(k);if(!q)NET.out.set(k,q=[]);q.push(m)}
function netAll(m,except){for(const [k,L] of NET.links)if(k!==except&&!L.dead)netSend(k,m)}
function netEv(t,o){if(!NET.host)return;o=o||{};o.t=t;for(const [k,L] of NET.links)if(L.inGame&&!L.dead)netSend(k,o)}
function netToHost(m){netSend(NET.hostKey,m)}
function netFlushR(){for(const [k,q] of NET.out){if(!q.length)continue;const L=NET.links.get(k);if(!L||!L.ok)continue;L.send(JSON.stringify(q),true);q.length=0}}
// v6.71: whatever another player sends loses the characters markup needs (< > " ' `) before anything reads it, however deep;
// a chat line is the one text kept as typed (it is only ever shown escaped). Past 8 levels a value is dropped.
function netScrub(v,d){if(typeof v==='string')return /[<>"'`]/.test(v)?v.replace(/[<>"'`]/g,''):v;
  if(!v||typeof v!=='object')return v;if(d>8)return null;
  if(Array.isArray(v)){for(let i=0;i<v.length;i++){const x=v[i];if(typeof x==='string'||x&&typeof x==='object')v[i]=netScrub(x,d+1)}return v}
  const chat=v.t==='chat'&&typeof v.m==='string';
  for(const k of Object.keys(v)){if(chat&&k==='m')continue;const x=v[k];if(typeof x==='string'||x&&typeof x==='object')v[k]=netScrub(x,d+1)}return v}
// v6.72: what one link may send in. On the host: a message over 64 KiB is dropped unread (it counts as 200 dropped), about 300 events a
// second (600 at once) and 90 states a second get through and the rest is dropped; a link whose dropped count (fading over about 4 s)
// passes 1,200 is closed — its player goes on as a bot. A client takes up to 512 KiB a message from its host. The queue holds 5,000.
const NET_RXL={EV:300,EVB:600,ST:90,STB:150,KICK:1200,Q:5000};
Object.assign(STR.ko,{mpFlood:'메시지를 너무 많이 보내서 방에서 내보내졌어요'});Object.assign(STR.en,{mpFlood:'Removed from the room: too many messages, too fast'});
function netRxTake(L,n,rel){const now=netNow(),B=L.rxb||(L.rxb={e:0,s:0,t:now,o:0,l:0}),dt=Math.max(0,now-B.t)/1000;B.t=now;
  B.e=Math.max(0,B.e-dt*NET_RXL.EV);B.s=Math.max(0,B.s-dt*NET_RXL.ST);
  if(rel){const k=Math.max(0,Math.min(n,Math.floor(NET_RXL.EVB-B.e)));B.e+=k;return k}
  if(B.s+1>NET_RXL.STB)return 0;B.s++;return 1}
function netRxOver(L,n){if(!NET.host||L.dead)return;const now=netNow(),B=L.rxb||(L.rxb={e:0,s:0,t:now});
  B.d=(B.d||0)*Math.exp(-Math.max(0,now-(B.dt||now))/4000)+n;B.dt=now;NET.rxDrop=(NET.rxDrop|0)+n;
  if(B.d>NET_RXL.KICK){console.warn('net: link flooding, closed',L.key);netSend(L.key,{t:'bye',why:'flood'});netFlushR();netLinkDown(L,'flood')}}
function netRx(L,data,rel){if(typeof data!=='string')return;if(data.length>(NET.host?65536:524288)){netRxOver(L,200);return}
  let m;try{m=netScrub(JSON.parse(data),0)}catch(e){return}
  if(rel){if(!Array.isArray(m))return;let n=m.length;if(NET.host){const k=netRxTake(L,n,true);if(k<n)netRxOver(L,n-k);n=k}
    for(let i=0;i<n;i++){const x=m[i];if(x&&typeof x.t==='string'&&NET.inQ.length<NET_RXL.Q)NET.inQ.push([L,x,true])}}
  else if(m&&typeof m==='object'){if(NET.host&&!netRxTake(L,1,false)){netRxOver(L,1);return}if(NET.inQ.length<NET_RXL.Q)NET.inQ.push([L,m,false])}}
function netFxPush(f){if(NET.on&&NET.ui==='game'&&!NET.ghost)NET.fx.push(f)}
// a remote page's clock: track the least-delayed arrivals so interpolation runs a fixed delay behind the sender
function netClock(k,ts,now){const d=now-ts;const o=NET.off.get(k);NET.off.set(k,o==null||d<o?d:o+(d-o)*.004)}

// ---------- encoding ----------
const OWN_BITS=4|8|32|64|128|256|512|1024|16384;
function netFlags(a){const c=a.c;return (a.alive?1:0)|(a.team===TZ?2:0)|(a.duck?4:0)|(c.onGround?8:0)|(a.host?16:0)|(a.flash?32:0)|(a.nv?64:0)|(a.cmd.walk?128:0)|(a.reloadT>0?256:0)|
  (a.sawCut?512:0)|(a.zoom>0?1024:0)|(a.permaDead?2048:0)|(a.reviving>0?4096:0)|(a.burnT>0?8192:0)|((a.spinV||0)>.5?16384:0)}
function netEncA(a){const c=a.c,s=a.nraw;let F=netFlags(a);if(s)F=(F&~OWN_BITS)|(s.F&OWN_BITS);
  return [a.id,r2(s?s.x:c.x),r2(s?s.y:c.y),r2(s?s.z:c.z),r2(s?s.vx:c.vx),r2(s?s.vz:c.vz),r3(s?s.yaw:a.yaw),r3(s?s.pitch:a.pitch),F,s?s.cur:(WI[a.cur]??-1),
    Math.ceil(a.hp),Math.ceil(a.armor),Math.round(a.maxHp),a.lvl,ZI[a.zc]|0,r1(a.skillT),r1(a.frozen),r1(a.rootT),G.mode==='scen'?a.money|0:0,r1(a.skillCD)]}// [18]: the scenario's upgrade money (0 elsewhere)
function netEncSelf(P){const c=P.c;return [r2(c.x),r2(c.y),r2(c.z),r2(c.vx),r2(c.vz),r3(P.yaw),r3(P.pitch),netFlags(P)&OWN_BITS,WI[P.cur]??-1,r1(P.frozen),r1(P.rootT),P.nyFree||0,ZI[P.zpick]|0]}
function netSample(a,t,x,y,z,vx,vz,yaw,pitch,F,cur){const B=a.nb||(a.nb=[]);if(B.length&&t<=B[B.length-1].t)return;B.push({t,x,y,z,vx,vz,yaw,pitch,F,cur});if(B.length>40)B.splice(0,B.length-40)}

// ---------- per frame ----------
NET.frameStart=function(dt){netTables();
  // the host takes everyone's movement first, then applies claims (so effects that claims cause are seen by netPost)
  const Q=NET.inQ;NET.inQ=[];
  if(NET.host){for(const [L,m,rel] of Q)if(!rel)netSafe(()=>netOnState(L,m));if(NET.ui==='game')netPre();for(const [L,m,rel] of Q)if(rel)netSafe(()=>netHandle(L,m))}
  else{for(const [L,m,rel] of Q)netSafe(()=>rel?netHandle(L,m):netOnSnap(L,m));if(NET.ui==='game')netPre()}
  if(NET.ui==='game')netRunFx()};
NET.frameEnd=function(dt){
  if(NET.ui==='game'){netPost();if(NET.cli&&NET.hits.length){for(let i=0;i<NET.hits.length;i+=48)netToHost({t:'h',L:NET.hits.slice(i,i+48)});NET.hits=[]}// (v6.72: 48 a message; the host takes 64)
    if(NET.host)ngTrack(netNow());
    if(NET.host)for(const a of G.actors)if(a.skPend){if(G.t>a.skPend||!a.alive||a.team!==TZ)a.skPend=0;else if(a.skillCD<=0){a.skPend=0;useSkill(a)}}
    NET.tAcc+=dt;if(NET.tAcc>=1/NET_HZ){NET.tAcc=Math.min(NET.tAcc-1/NET_HZ,.1);if(NET.host){if(!netHold())netHostTick()}else netCliTick()}}
  if(NET.mig)netMigTick();
  netFlushR();
  if(NET.kind==='room'){RSIG.flushT-=dt;if(RSIG.flushT<=0){RSIG.flushT=1/NET_HZ;RSIG.flush()}}
  // a page that went quiet for too long is gone (a host silent for 6 s in a match, past its first 15 s: its players look for the next one)
  NET.netT+=dt;if(NET.netT>1){NET.netT=0;const now=netNow();for(const L of [...NET.links.values()]){if(!L.ok)continue;const q=now-L.lastRx;
      if(NET.cli&&L.key===NET.hostKey&&!NET.mig&&NET.ui==='game'&&NET.kind==='peerjs'&&q>6000&&now-(NET.t0||0)>15000&&netMigOK()){netMigStart('quiet');continue}
      if(q>(NET.toMs||(L.kind==='relay'?15000:10000)))netLinkDown(L,'timeout')}
    if(NET.host){netAll({t:'ping',h:Math.round(now)});if(NET.ui==='lobby'&&(NET.lobT=(NET.lobT||0)+1)%2===0)netLobbyCast()}}};
function netSafe(f){try{f()}catch(e){console.error(e)}}

// ---------- the host's tick ----------
function netHostTick(){NET.k++;const o={k:NET.k,ts:Math.round(netNow()),g:[ST_L.indexOf(G.st),Math.round(G.time*10),G.round,G.score[0],G.score[1],G.moraleLvl,G.hostN],A:(G.mode==='scen'?SCEN.H:G.actors).map(netEncA),f:NET.fx};
  if(NET.k%10===0)o.S=(G.mode==='scen'?SCEN.H:G.actors).map(a=>[a.id,a.kills,a.infects,a.deaths,Math.round(a.score),Math.round(a.dmgDealt),Math.round(a.dmgRound||0),a.net&&NET.links.get(a.net)?Math.round(NET.links.get(a.net).rtt):-1,a.assists|0]);
  if(G.mode==='scen'&&SCEN.on){o.Z=SCEN.encZ(NET.k);o.sc=SCEN.encState()}
  const s=JSON.stringify(o);NET.fx=[];for(const L of NET.links.values())if(L.ok&&L.inGame)L.send(s,false);if(NET.kind==='room')RSIG.flush()}
function netCliTick(){NET.k++;const P=G.player;const o={k:NET.k,ts:Math.round(netNow()),f:NET.fx};if(NET.hostTs)o.e=[NET.hostTs,Math.round(netNow()-NET.hostRx)];if(P)o.s=netEncSelf(P);NET.fx=[];
  const L=NET.links.get(NET.hostKey);if(L&&L.ok)L.send(JSON.stringify(o),false);if(NET.kind==='room')RSIG.flush()}
// a client's 20 Hz state on the host
function netOnState(L,m){if(m.t)return;if(!(m.k>L.lastK))return;L.lastK=m.k;const now=netNow();
  if(Array.isArray(m.e)&&m.e[0]>0){const r=now-m.e[0]-(m.e[1]||0);if(r>=0&&r<10000){L.srtt=lerp(L.srtt||r,r,.2);L.rtt=L.srtt}}
  if(NET.ui!=='game')return;const a=actorOfKey(L.key);if(!a)return;if(!Number.isFinite(m.ts))return;netClock(L.key,m.ts,now);a.nsrc=L.key;
  // (v6.72: a state with anything but plain numbers where they belong is dropped whole; positions within 2 km, speeds 60 m/s)
  const s=m.s;if(Array.isArray(s)&&s.length>=13){for(let i=0;i<13;i++)if(typeof s[i]!=='number'||!Number.isFinite(s[i]))return;
    const r={x:clamp(s[0],-2e5,2e5)/100,y:clamp(s[1],-2e5,2e5)/100,z:clamp(s[2],-2e5,2e5)/100,vx:clamp(s[3],-6e3,6e3)/100,vz:clamp(s[4],-6e3,6e3)/100,yaw:s[5]/1000,pitch:clamp(s[6],-1600,1600)/1000,F:s[7]|0,cur:s[8]|0};a.nraw=r;
    // (v6.74: a move faster than any player can make is taken only as far as its budget goes, ngMove)
    if(a.alive)ngMove(a,r,now);
    netSample(a,m.ts,r.x,r.y,r.z,r.vx,r.vz,r.yaw,r.pitch,r.F,r.cur);a.frozen=clamp(s[9],0,100)/10;a.rootT=clamp(s[10],0,100)/10;a.nyFree=s[11]|0;const zp=ZALL[s[12]];if(ZLIST.includes(zp))a.zpick=zp}// (v6.91: the pick comes as its ZALL index; read as a ZLIST index the firefighter never arrived)
  // its effects go on to everyone: at most 48 a state, each a short list of numbers and short words (a grenade thrown is noted: ngClaim)
  let nf=0;for(const f of netFxList(L,m)){if(!Array.isArray(f)||f[1]!==a.id||f.length>24||++nf>48)continue;
    if(!f.every(v=>typeof v==='number'?Number.isFinite(v):typeof v==='string'?v.length<=24:v===null||typeof v==='boolean'||Array.isArray(v)&&v.length<=8&&v.every(x=>typeof x==='number'&&Number.isFinite(x))))continue;
    netQueueFx(a,f);NET.fx.push(f);
    if(f[0]==='n'&&typeof f[2]==='string'){(a.ngThr||(a.ngThr=Object.create(null)))[f[2]]=now;if(a.inv&&a.inv[f[2]]>0)a.inv[f[2]]--}}}
// the host's snapshot on a client
function netOnSnap(L,m){if(m.t||L.key!==NET.hostKey||!(m.k>NET.lastK))return;NET.lastK=m.k;const now=netNow();NET.hostTs=m.ts;NET.hostRx=now;netClock('h',m.ts,now);
  if(NET.ui!=='game')return;const g=Array.isArray(m.g)?m.g:null;if(g){G.time=netN(g[1])/10;if(G.pvp){G.score[0]=g[3]|0;G.score[1]=g[4]|0}if(g[5]>G.moraleLvl&&G.mode==='mut'){HUD.announce(T('moraleUp',g[5]*10),'h',2.2);if(G.player&&G.player.team===TH)AU.play('morale',{vol:.55})}G.moraleLvl=g[5]|0;G.hostN=g[6]|0}
  const P=G.player;
  // (v6.72: an actor's row with anything but numbers in its first ten is skipped)
  for(const e of Array.isArray(m.A)?m.A:[]){if(!Array.isArray(e))continue;const a=byId(e[0]);if(!a)continue;let bad=false;for(let i=1;i<10;i++)if(typeof e[i]!=='number'||!Number.isFinite(e[i]))bad=true;if(bad)continue;const F=e[8];const same=((F&2)?TZ:TH)===a.team&&!!(F&1)===a.alive;
    if(a===P){if(!same)continue;const hp0=P.hp,ar0=P.armor;P.hp=netN(e[10]);P.armor=netN(e[11]);P.maxHp=netN(e[12],100);P.lvl=e[13]|0;P.money=netN(e[18]);P.skillT=e[15]/10;P.skillCD=e[19]/10;P.host=!!(F&16);
      if(P.alive&&P.hp<hp0-.5){const d=hp0-P.hp;if(P.team===TZ)HUD.hurt(clamp(d/600,.15,.8));else{HUD.hurt(clamp(d/40,.25,1));FX.shake=Math.max(FX.shake,.3);AU.play('hurt',{vol:.7})}}
      else if(P.alive&&P.team===TH&&P.armor<ar0-.5){HUD.hurt(.5);AU.play('armor',{vol:.5})}
      continue}
    netSample(a,m.ts,e[1]/100,e[2]/100,e[3]/100,e[4]/100,e[5]/100,e[6]/1000,e[7]/1000,F,e[9]);a.nsrc='h';if(!same)continue;
    a.hp=netN(e[10]);a.armor=netN(e[11]);a.maxHp=netN(e[12],100);a.lvl=e[13]|0;a.skillT=e[15]/10;a.frozen=e[16]/10;a.rootT=e[17]/10;a.money=e[18];a.skillCD=e[19]/10;a.host=!!(F&16);
    a.permaDead=!!(F&2048);a.burnT=F&8192?Math.max(a.burnT||0,.3):0;
    if(a.team===TZ){const zc=ZALL[e[14]]||a.zc;if(zc!==a.zc){a.zc=zc;setHull(a);ensureRig(a)}}}
  if(G.mode==='scen'){if(m.Z)SCEN.decZ(m.Z,m.ts);if(m.sc)SCEN.decState(m.sc)}
  if(m.S)for(const s of m.S){const a=byId(s[0]);if(!a)continue;a.kills=s[1]|0;a.infects=s[2]|0;a.deaths=s[3]|0;a.score=netN(s[4]);a.dmgDealt=netN(s[5]);a.dmgRound=netN(s[6]);a.ping=netI(s[7],-1,99999,-1);a.assists=s[8]|0}
  for(const f of netFxList(L,m)){if(!Array.isArray(f))continue;const a=byId(f[1]);if(a&&a!==P)netQueueFx(a,f)}}
function netFxList(L,m){if(Array.isArray(m.f))return m.f;if(!Array.isArray(m.fw))return [];const out=[];let hi=L.fxK||0;
  for(const w of m.fw){if(!Array.isArray(w)||!(w[0]>(L.fxK||0))||!Array.isArray(w[1]))continue;hi=Math.max(hi,w[0]);for(const f of w[1])out.push(f)}L.fxK=hi;return out}

// ---------- puppets: actors this page does not simulate, drawn a fixed delay behind their owner ----------
function netPuppet(a,dt){const B=a.nb,c=a.c;if(!B||!B.length)return;const off=NET.off.get(a.nsrc);if(off==null)return;
  const rt=netNow()-off-NET_DELAY,n=B.length;let s0,s1,u=0;
  if(rt>=B[n-1].t){s0=s1=B[n-1];const ex=Math.min(.1,(rt-s1.t)/1000);c.x=s1.x+s1.vx*ex;c.y=s1.y;c.z=s1.z+s1.vz*ex}
  else if(rt<=B[0].t){s0=s1=B[0];c.x=s1.x;c.y=s1.y;c.z=s1.z}
  else{let j=n-1;while(j>0&&B[j-1].t>rt)j--;s1=B[j];s0=B[j-1];u=clamp((rt-s0.t)/Math.max(1,s1.t-s0.t),0,1);
    if(Math.hypot(s1.x-s0.x,s1.z-s0.z)>3.5)u=1;c.x=lerp(s0.x,s1.x,u);c.y=lerp(s0.y,s1.y,u);c.z=lerp(s0.z,s1.z,u)}
  c.vx=lerp(s0.vx,s1.vx,u);c.vz=lerp(s0.vz,s1.vz,u);a.yaw=wrapA(s0.yaw+wrapA(s1.yaw-s0.yaw)*u);a.pitch=lerp(s0.pitch,s1.pitch,u);
  while(B.length>2&&B[1].t<rt-400)B.shift();
  // discrete state follows the newest sample
  const S=B[B.length-1],F=S.F;const duck=!!(F&4);if(duck!==a.duck){a.duck=duck;setHull(a)}
  const og=!!(F&8),wasOg=c.onGround,air0=a.airT;c.onGround=og;a.airT=og?0:a.airT+dt;a.flash=!!(F&32);a.nv=!!(F&64);a.cmd.walk=!!(F&128);a.zoom=F&1024?1:0;a.spinV=F&16384?1:0;
  // (v6.95: a weapon drawn, a reload's magazine out / in or a shell, heard where the body is; the StarTrack's reload its own sheet's sounds)
  if(a.team===TH&&S.cur>=0&&WL[S.cur]&&a.cur!==WL[S.cur]&&WPN[WL[S.cur]].kind!=='claw'){const was=a.cur;equip(a,WL[S.cur],true);const W2=WPN[a.cur];if(was&&a.alive&&W2&&W2.kind!=='claw')othSnd(a,W2.drawS||(W2.kind==='melee'?'kdraw':'draw'),.45,20)}
  else if(a.team===TZ&&a.cur!=='claw'&&a.cur!=='zbomb')equip(a,'claw',true);
  const W=WPN[a.cur]||{};
  if(F&256&&W.mag){if(!a.nRel){a.nRel=1;a.relKind=W.shellRel?'shell':'mag';a.reloadT=W.shellRel||W.reload||2;
      if(a.cur==='startrack'&&typeof stPupRel==='function')stPupRel(a,W);else if(a.relKind==='mag')othSnd(a,'magout',.55,25)}
    else{a.reloadT=Math.max(0,a.reloadT-dt);if(a.reloadT===0){if(a.relKind==='shell')othSnd(a,'shellin',.45,22);a.reloadT=a.relKind==='shell'?W.shellRel:.001}}}
  else if(a.nRel||a.relKind){if(a.relKind==='mag'&&a.alive&&a.cur!=='startrack')othSnd(a,'magin',.5,25);a.nRel=0;a.reloadT=0;a.relKind=null}
  a.kick=Math.max(0,a.kick-dt*6);a.punchP*=Math.exp(-dt*7);a.punchY*=Math.exp(-dt*7);a.recoilSpread*=Math.exp(-dt*4.5);
  // the Grinder grinding: replayed from the owner's trigger, harmless here
  if(a.cur==='ripper'&&a.team===TH){if(!a.ammo.ripper)a.ammo.ripper={mag:999,res:0};a.ammo.ripper.mag=999;a.cmd.fire=!!(F&512);a.cmd.alt=false;a.drawT=0;NET.ghost++;try{sawUpdate(a,WPN.ripper,dt)}finally{NET.ghost--}a.pc.alt=false}
  // footsteps from the replayed motion; a jump's push-off and its landing (v6.94: the flags run NET_DELAY ahead of the drawn motion)
  const hs=Math.hypot(c.vx,c.vz);if(og&&hs>1.5){a.stepAcc+=hs*dt;if(a.stepAcc>(a.team===TZ?1.7:1.9)){a.stepAcc=0;footstep(a)}}
  if(a.alive){if(og&&!wasOg&&air0>.3)stepSnd(a,clamp(air0*1.6,1,2),.85,NET_DELAY/1000);else if(!og&&wasOg&&B.length>1&&S.y>B[B.length-2].y+.02)stepSnd(a,.6,1.1,NET_DELAY/1000)}}

// ---------- cosmetic replays of other players' actions ----------
function netQueueFx(a,f){NET.fxQ.push({at:netNow()+NET_DELAY,a,f});if(NET.fxQ.length>300)NET.fxQ.splice(0,100)}
function netRunFx(){const now=netNow();let i=0;while(i<NET.fxQ.length){const q=NET.fxQ[i];if(q.at<=now){NET.fxQ.splice(i,1);NET.ghost++;try{netDoFx(q.a,q.f)}catch(e){console.error(e)}finally{NET.ghost--}}else i++}}
function netDoFx(a,f){if(!a||a.isPlayer||!G.actors.includes(a))return;const T0=f[0];
  if(T0==='f'){if(!a.alive||a.team!==TH)return;const w=WL[f[2]],W=WPN[w];if(!W||W.kind==='melee'||W.kind==='nade')return;if(a.cur!==w)equip(a,w,true);
    if(!a.ammo[w])a.ammo[w]={mag:1,res:0};a.ammo[w].mag=Math.max(1,a.ammo[w].mag);if(W.dual)a.dualSide=-(f[5]||1);
    const y0=a.yaw,p0=a.pitch;a.yaw=f[3]/1000;a.pitch=f[4]/1000;a.punchY=a.punchP=0;fireGun(a,W);a.yaw=y0;a.pitch=p0;return}
  if(T0==='p'){const w=WL[f[2]],W=WPN[w],kind=f[3];if(!W)return;const x=f[4]/100,y=f[5]/100,z=f[6]/100,vx=f[7]/100,vy=f[8]/100,vz=f[9]/100;let n;
    if(kind==='gl'){n={kind:'gl',owner:a,w,x,y,z,vx,vy,vz,t:0,fuse:6,rest:false,mesh:null,spin:0,impact:1};const m=new THREE.Mesh(gunGeo('glnade'),matGun());R.scene.add(m);n.mesh=m;NADES.push(n)}
    else if(kind==='vortex')n=vortexMake(a,w,x,y,z,vx,vy,vz,true);
    else{n=nyProj(a,W,{x,y,z},{x:0,y:0,z:-1},kind);if(!n)return;n.w=w}
    n.x=x;n.y=y;n.z=z;n.vx=vx;n.vy=vy;n.vz=vz;n.ghost=true;if(n.mesh){n.mesh.position.set(x,y,z);if(kind!=='disc')n.mesh.lookAt(x-vx,y-vy,z-vz)}return}
  if(T0==='n'){throwNade(a,f[2],{x:f[3]/100,y:f[4]/100,z:f[5]/100,vx:f[6]/100,vy:f[7]/100,vz:f[8]/100});a.an.atk=1;a.an.atkD=.55;a.an.heavy=false;return}
  if(T0==='m'){if(!a.alive)return;const w=WL[f[4]];if(w&&a.cur!==w)equip(a,w,true);const heavy=!!f[2];a.an.atkSide=f[3]||1;meleeSwing(a,heavy);a.an.atk=1;a.an.heavy=heavy;a.an.atkD=meleeAtkD(WPN[a.cur],heavy);
    const w0=a.cur,W=meleeW(a);const d=W.hitT?W.hitT[heavy?1:0]:0;nyLater(d,()=>{if(a.alive)meleeStrike(a,heavy,w0)});return}
  if(T0==='c'){if(!a.alive)return;const heavy=!!f[2];a.an.atk=1;a.an.atkD=heavy?.78:.48;a.an.heavy=heavy;a.an.atkSide=f[3]||1;AU.at('zatk',a.c.x,a.c.y+1.5,a.c.z,{vol:.7,range:30});
    nyLater(heavy?.4:.19,()=>{if(a.alive)clawStrike(a,heavy)});return}
  if(T0==='x'){if(!a.alive)return;const w=WL[f[2]],W=WPN[w];if(!W)return;if(a.cur!==w)equip(a,w,true);if(!a.ammo[w])a.ammo[w]={mag:1,res:0};
    if(W.alt==='dragon')summonDragon(a);else{a.altNext=0;nyAlt(a,W)}return}
  if(T0==='s'){if(a.alive)sawSwing(a,WPN.ripper);return}}
function skillFx(a,k){const c=a.c;
  if(k==='frenzy'){AU.at('zroar',c.x,c.y+1.5,c.z,{vol:1,range:50});a.an.skill=.8}
  else if(k==='invis'){a.an.skill=.5;AU.at('invis',c.x,c.y+1.5,c.z,{vol:.9,range:30});for(let i=0;i<16;i++)FX.spawn({x:c.x+rr(-.3,.3),y:c.y+rr(.2,1.8),z:c.z+rr(-.3,.3),vx:rr(-.5,.5),vy:rr(-.2,.5),vz:rr(-.5,.5),life:rr(.4,.8),s0:.15,s1:.4,r:.5,g:.6,b:.7,a:.4,f:5,drag:2});if(a.isPlayer)HUD.note(T('nyInvis'),2)}
  else if(k==='heal'){a.an.skill=1.2;AU.at('heal',c.x,c.y+1.5,c.z,{vol:1,range:50});FX.spawn({x:c.x,y:c.y+1.2,z:c.z,life:.6,s0:1,s1:12,r:.4,g:1,b:.5,a:.55,f:14,add:1});DL.add(c.x,c.y+1.5,c.z,'#60ff80',9,2,.6);
    for(const t of G.actors){if(!t.alive||t.team!==TZ||dist3(t.c,c)>8)continue;for(let i=0;i<8;i++)FX.spawn({x:t.c.x+rr(-.3,.3),y:t.c.y+rr(.3,1.8),z:t.c.z+rr(-.3,.3),vy:rr(.4,1),life:rr(.5,.9),s0:.12,s1:.04,r:.5,g:1,b:.55,f:8,add:1});if(t.isPlayer)HUD.note(T('healed'),1.5)}}
  else if(k==='trap'){a.an.skill=.4;if(a.isPlayer)HUD.note(T('nyTrapSet'),1.5)}}

// ---------- effects on actors this page does not own: found by diffing around the frame, sent to their owner ----------
const EFF_T=[['frozen','fz'],['holdT','hd'],['staggerT','st'],['dizzy','dz'],['shriekT','sh'],['rootT','rt'],['grabT','gb']];
function netPre(){for(const a of G.actors){if(!a.pup||!a.alive){a._ef=null;continue}a.kvx=a.kvz=0;a.c.vy=0;const e=a._ef||(a._ef={});for(const [f] of EFF_T)e[f]=a[f]||0;e.burnT=a.burnT||0}}
function netPost(){for(const a of G.actors){const e0=a._ef;if(!e0||!a.pup||!a.alive)continue;const e={t:'eff',i:a.id};let any=false;
    if(Math.abs(a.kvx)>.01||Math.abs(a.kvz)>.01){e.kx=r2(a.kvx);e.kz=r2(a.kvz);any=true}
    if(a.c.vy>.01){e.up=r2(a.c.vy);any=true}
    for(const [f,k] of EFF_T){if((a[f]||0)>e0[f]+.05){e[k]=r1(a[f]);any=true}}
    if(NET.cli&&(a.burnT||0)>e0.burnT+.05&&a.burnSrc===G.player){e.bt=r1(a.burnT);e.bw=WI[a.burnW]??-1;any=true}
    a.kvx=a.kvz=0;a.c.vy=0;if(!any)continue;
    if(NET.host){if(a.net&&NET.links.has(a.net)){ngShove(a,Math.hypot(e.kx||0,e.kz||0)/100,(e.up||0)/100);netSend(a.net,e)}}else netToHost(e)}}
function netApplyEff(a,e,src){if(!a||!a.alive)return;
  if(e.fz){a.frozen=Math.max(a.frozen,e.fz/10);a.c.vx=a.c.vz=0;a.mvx=a.mvz=a.kvx=a.kvz=0}
  if(e.rt){a.rootT=Math.max(a.rootT||0,e.rt/10);a.c.vx=a.c.vz=0;a.mvx=a.mvz=a.kvx=a.kvz=0}
  if(e.kx||e.kz){a.kvx+=(e.kx||0)/100;a.kvz+=(e.kz||0)/100}
  if(e.up){a.c.vy=Math.max(a.c.vy,e.up/100);a.c.onGround=false;a.c.jumped=true}
  if(e.gb)a.grabT=Math.max(a.grabT||0,e.gb/10);if(e.hd)a.holdT=Math.max(a.holdT||0,e.hd/10);if(e.st)a.staggerT=Math.max(a.staggerT,e.st/10);if(e.dz)a.dizzy=Math.max(a.dizzy,e.dz/10);if(e.sh)a.shriekT=Math.max(a.shriekT,e.sh/10);
  if(e.bt&&src&&a.team===TZ){a.burnT=Math.max(a.burnT||0,e.bt/10);a.burnSrc=src;a.burnW=WL[e.bw]||'bdc'}
  if(a.isPlayer&&e.dz)FX.shake=Math.max(FX.shake,.5)}
// a hit this page saw on someone it does not own: shown at once, judged by the host
function netClaimHit(t,dmg,src,o){if(!G.player||src!==G.player||!t||!t.alive||(G.pvp?!foe(src,t)||!PVP.canHit(t):t.team===TH))return 0;// (대인전: an enemy, not under spawn protection)
  // a hit on the firefighter's oxygen tank (as this page saw it) is claimed as one: the host does not judge it again
  const tk=typeof FM!=='undefined'&&FM.tankHit(t,o);
  NET.hits.push([t.id,Math.round(dmg),WI[o.w]??-1,(o.hs?1:0)|(o.knife?2:0)|(o.heavy?4:0)|(o.he?8:0)|(o.blunt?16:0)|(tk?32:0),o.dir?r2(o.dir[0]):0,o.dir?r2(o.dir[1]):0,o.dir?r2(o.dir[2]):0,r1(o.kb),r2(o.stag),r2(o.x),r2(o.y),r2(o.z),r1(o.up)]);
  if(tk&&!o.he){t.fmFl=.12;return 0}// (the tank flashes, not the body)
  const d=G.pvp?PVP.scale(t,dmg,o):dmg*(1+.1*G.moraleLvl)*(src.wup&&src.wup[o.w]?1+.1*src.wup[o.w]:1),ab=Math.min(Math.max(0,t.armor),d*(G.pvp?1-PVP.ap(o):.5)),dealt=Math.max(0,Math.min(d-ab,Math.max(0,t.hp))+ab);
  t.an.flinch=Math.min(1,t.an.flinch+.35);if(t.ch)t.ch.mat.uniforms.uFlash.value=Math.min(.35,t.ch.mat.uniforms.uFlash.value+.12);
  HUD.dmgNum(t,dealt,!!o.hs,false);if(G.pvp){if(!AU.throttle('zp'+t.id,350))AU.at('hurt',t.c.x,t.c.y+1.5,t.c.z,{vol:.7})}else zPain(t,true);return dealt}

// ---------- host: handlers for what clients send ----------
// ---------- v6.72: the host checks every claim a client makes (security part 2) ----------
// A client's page decides its own hits and its zombie's claws; the host believes a claim only as far as the claimed weapon allows:
// - the weapon is one the player has held in the last 8 s (the host's record of what it bought or picked up, or what its page says is
//   in hand); a grenade's blast only after the host saw it thrown; the shooter a living human (a blast or a round in flight: 8 s on);
// - the target a foe (in the zombie modes a zombie; 대인전 keeps its own per-gun check, pvp.js claimOk, on top of these);
// - the damage no more than that weapon deals in one hit (its biggest damage figure x the head multiplier, at least x3, x2.2 for its
//   special modes and slack; at least 60, a blast at least 1,000);
// - the hits no more than it can make: each claim costs 1 / (shots a second x pellets / pierce / cleave, x2) of a
//   second (splash 24 targets a shot, a blast at least 48 a second), one budget a player whatever the weapon (switching guns adds
//   nothing), 1.5 s of it at a time;
// - the target within the weapon's reach of where the shooter was in the last 0.8 s (110 m for a bullet, the railgun's 150, a blade's
//   reach + 3 m, 170 m for anything that flies or bursts), and for a plain bullet (no pierce, wall, splash or second mode) a clear line
//   from one of the shooter's eye positions of that time to the point it hit or to the target's chest or head;
// - every number made finite and bounded (direction, knockback, lift, stagger, the point hit).
// A zombie's claw: within its reach (+ the target's width and 2.2 m for lag) of the human in the last 0.8 s, in sight, after its
// first-strike lock, 4 a second at most. An effect (eff) on another page's actor: within 120 m, numbers bounded; a status (freeze,
// root, hold, stagger, dizzy, shriek, burn) only on the other side, a shove or a lift on anyone (a zombie bomb launches zombies).
const NG={N:24,DT:1000/30,HMAX:64,HELD:8000,CAP:1.5,P:Object.create(null),rej:Object.create(null)};
const ngRej=(why)=>{NG.rej[why]=(NG.rej[why]||0)+1;return null};
// the host records where every actor was (every 1/30 s, the last 0.8 s) and what each remote player held
function ngTrack(now){for(const a of G.actors){if(!a.alive)continue;let H=a.ngH;
    if(!H)H=a.ngH={x:new Float32Array(NG.N),y:new Float32Array(NG.N),z:new Float32Array(NG.N),e:new Float32Array(NG.N),t:0,i:0,n:0};
    if(!H.n||now-H.t>=NG.DT){H.t=now;H.x[H.i]=a.c.x;H.y[H.i]=a.c.y;H.z[H.i]=a.c.z;H.e[H.i]=eyeH(a);H.i=(H.i+1)%NG.N;if(H.n<NG.N)H.n++}
    if(!a.net)continue;if(a.team===TH)a.ngHum=now;const S=a.ngW||(a.ngW=Object.create(null)),I=a.inv;
    if(I){for(const k of [1,2,3])if(typeof I[k]==='string'&&I[k])S[I[k]]=now;for(const k of H_NADES)if(I[k]>0)S[k]=now}
    if(typeof a.cur==='string'&&a.cur)S[a.cur]=now}}
const _ngA={x:0,y:0,z:0,e:0},_ngB={x:0,y:0,z:0,e:0};
function ngAt(a,k,o){const H=a.ngH;if(!H||k>=H.n){o.x=a.c.x;o.y=a.c.y;o.z=a.c.z;o.e=eyeH(a);return o}const j=(H.i-1-k+2*NG.N)%NG.N;o.x=H.x[j];o.y=H.y[j];o.z=H.z[j];o.e=H.e[j];return o}
const ngN=a=>Math.max(1,a.ngH?a.ngH.n:1);
// came within d of each other at some moment of the last 0.8 s (either one's recorded positions, every other one)
function ngNear(a,t,d){const na=ngN(a),nt=ngN(t),d2=d*d;for(let i=0;i<na;i+=2){ngAt(a,i,_ngA);for(let j=0;j<nt;j+=2){ngAt(t,j,_ngB);const dx=_ngA.x-_ngB.x,dy=_ngA.y-_ngB.y,dz=_ngA.z-_ngB.z;if(dx*dx+dy*dy+dz*dz<=d2)return true}}return false}
// a point by the target (one of its recent positions), as a hit point should be
function ngByT(t,x,y,z){const nt=ngN(t),h=t.c.h||1.8;for(let j=0;j<nt;j+=2){ngAt(t,j,_ngB);if(Math.hypot(x-_ngB.x,z-_ngB.z)<=2.2&&y>=_ngB.y-.6&&y<=_ngB.y+h+.8)return true}return false}
// a clear line from one of the shooter's eye positions to the hit point (when it is by the target) or to the target's chest or head
function ngSee(a,t,px,py,pz){const na=ngN(a),nt=ngN(t),okP=Number.isFinite(px)&&Number.isFinite(py)&&Number.isFinite(pz)&&ngByT(t,px,py,pz),h=t.c.h||1.8;
  for(let i=0;i<na;i+=4){ngAt(a,i,_ngA);const ex=_ngA.x,ey=_ngA.y+_ngA.e,ez=_ngA.z;if(okP&&losClear(ex,ey,ez,px,py,pz))return true;
    for(let j=0;j<nt;j+=6){ngAt(t,j,_ngB);if(losClear(ex,ey,ez,_ngB.x,_ngB.y+h*.55,_ngB.z)||losClear(ex,ey,ez,_ngB.x,_ngB.y+h*.9,_ngB.z))return true}}
  return false}
// a body whose hit volumes reach far from its centre (a chapter's boss, the beetle's ball, the giant): no line-of-sight check
const ngBig=t=>!!(t.epRay||t.xRay||t.boss||(t.hitW||t.c.hw||.4)>.9||(t.c.h||1.8)>3.2||(typeof ZBIG!=='undefined'&&!!ZBIG[t.zc]));
// what a weapon allows (worked out once from its own numbers)
function ngProf(w){let p=NG.P[w];if(p)return p;const W=WPN[w];if(!W)return null;
  const big=re=>{let m=0;const scan=(o,d)=>{for(const k in o){const v=o[k];if(typeof v==='number'){if(re.test(k)&&Number.isFinite(v))m=Math.max(m,v)}
      else if(Array.isArray(v)){if(re.test(k))for(const x of v)if(typeof x==='number'&&Number.isFinite(x))m=Math.max(m,x)}else if(v&&typeof v==='object'&&d<2)scan(v,d+1)}};scan(W,0);return m};
  const melee=W.kind==='melee'||W.kind==='saw',area=!!(W.proj||W.cone||W.flame||W.air||W.cluster||W.slam||W.spFlame||W.kind==='nade'||W.kind==='special');
  const rps=melee?(Array.isArray(W.rate)?1/Math.max(.08,Math.min(...W.rate)):3):Math.max(big(/rpm/i),60)/60;
  const multi=Math.max(1,W.pellets||1,W.spFan||1)*Math.max(1,W.pen||1,W.pierce||1,W.fan||1,W.slugs||1)*(melee?Math.max(1,...[].concat(W.cleave||1)):1);
  const plain=!area&&!melee&&!(W.pen||W.pierce||W.rail||W.wallK||W.trans||W.alt)&&['pistol','smg','rifle','mg','shotgun','sniper'].includes(W.kind);
  p=NG.P[w]={cap:Math.max(big(/dmg|dm$/i),60)*Math.max(W.hs||0,W.pm&&W.pm.head||0,3)*2.2,per:rps*Math.max(multi,area?24:1)*2,area,plain,
    reach:melee?Math.max(...[].concat(W.range||2.5))+3:area?170:(W.range>0?W.range:110)+6,kb:big(/kb/i)*2+2,up:big(/up$/i)+3};
  return p}
// one budget a player: a claim costs 1 / per seconds of it, 1.5 s at a time
function ngSpend(a,per,now){const b=a.ngB||(a.ngB={d:0,t:now});b.d=Math.max(0,b.d-(now-b.t)/1000);b.t=now;const c=1/Math.max(per,.5);if(b.d+c>NG.CAP)return false;b.d+=c;return true}
// ---------- v6.74: how fast a remote player may move, as the host takes its states ----------
// A budget that fills at R m/s across the ground up to C m (room for a burst: a knock-back, a charge, a few late packets) and at RU m/s
// upward up to CU m; a shove the host gave that player adds to it (ngShove). The fastest any player went in bot matches of every mode was
// about 7.5 m/s held (a chain of bunny hops, a berserk rager at 8.2), 8 m in half a second with a knock-back, 5.5 m up within 4 s.
// A state past the budget is taken only as far as the budget goes (the others see that player catch up; its hits are checked from
// there), counted in NG.rej mv / mvu. Falling is never held back. When the host itself puts the player somewhere (placeAt: a respawn,
// a new round or zone) the budget starts again there, and for FREE ms a state from before — still where the player was — is held
// at the new place instead. Nothing is closed or kicked for it.
const NG_MV={R:9,C:16,RU:6,CU:6,FREE:3000,KX:40};
function ngMove(a,r,now){let M=a.ngMv;
  if(!M)M=a.ngMv={x:a.c.x,y:a.c.y,z:a.c.z,t:now,b:NG_MV.C,u:NG_MV.CU,g:0};
  const dt=Math.max(0,(now-M.t)/1000);M.t=now;
  if(M.b<NG_MV.C)M.b=Math.min(NG_MV.C,M.b+NG_MV.R*dt);if(M.u<NG_MV.CU)M.u=Math.min(NG_MV.CU,M.u+NG_MV.RU*dt);
  // (a body that fell under the map is put back at 0, 2, 5 by its own page: game.js actorPhysics)
  if(M.y<-12&&Math.hypot(r.x,r.z-5)<4&&r.y<8){M.x=r.x;M.y=r.y;M.z=r.z;M.b=NG_MV.C;M.u=NG_MV.CU;return}
  const dx=r.x-M.x,dz=r.z-M.z,d=Math.hypot(dx,dz),du=r.y-M.y;
  if(now<M.g&&(d>M.b||du>M.u)){r.x=M.x;r.y=M.y;r.z=M.z;return}
  if(d>M.b){const f=M.b/d;r.x=M.x+dx*f;r.z=M.z+dz*f;M.b=0;ngRej('mv')}else M.b-=d;
  if(du>M.u){r.y=M.y+M.u;M.u=0;ngRej('mvu')}else if(du>0)M.u-=du;
  M.x=r.x;M.y=r.y;M.z=r.z}
function ngShove(a,kv,up){const M=a.ngMv;if(!M)return;if(kv>0)M.b=Math.min(M.b+Math.min(kv,NG_MV.KX),NG_MV.C+NG_MV.KX);if(up>0)M.u=Math.min(M.u+Math.min(up,15)*.6,NG_MV.CU+9)}
function ngPlaced(a){const now=netNow();a.ngMv={x:a.c.x,y:a.c.y,z:a.c.z,t:now,b:NG_MV.C,u:NG_MV.CU,g:now+NG_MV.FREE}}
{const pa=placeAt;placeAt=function(a){const r=pa.apply(this,arguments);if(NET.host&&a&&a.net)ngPlaced(a);return r}}
const ngF=(v,lo,hi,d)=>{v=+v;return Number.isFinite(v)?Math.min(hi,Math.max(lo,v)):d};
// a claim h = [target id, damage, weapon index, flags, dir x, y, z (x100), knockback (x10), stagger (x100), hit x, y, z (x100), lift (x10)]
function ngClaim(src,t,h,now){
  const wi=h[2],w=Number.isInteger(wi)&&wi>=0?WL[wi]:'',f=h[3]|0,P=w?ngProf(w):null;if(!P)return ngRej('weapon');
  const blast=!!(f&8),thrown=WPN[w].kind==='nade';
  // the weapon: held lately (a grenade: seen thrown); the shooter: a living human now or very lately (a blast / a round in flight: 8 s)
  if(thrown){const T=src.ngThr&&src.ngThr[w];if(!(T>now-NG.HELD))return ngRej('throw');}
  else if(!(src.ngW&&src.ngW[w]>now-(P.area||blast?2*NG.HELD:NG.HELD)))return ngRej('held');// (what flies or lingers: 16 s)
  if(!(src.alive&&src.team===TH)&&!(src.ngHum>now-(blast||P.area||thrown?NG.HELD:1000)))return ngRej('dead');
  if(G.pvp){if(!foe(src,t)||!PVP.claimOk(src,t,h))return ngRej('pvp')}
  else{if(t.team!==TZ)return ngRej('team');
    const cap=blast||thrown?Math.max(P.cap,1000):P.cap,dm=+h[1];if(!(dm>=0&&dm<=cap+.5))return ngRej('dmg');
    if(!ngSpend(src,blast||thrown?Math.max(P.per,48):P.per,now))return ngRej('rate')}
  if(!ngNear(src,t,blast||thrown?170:P.reach))return ngRej('far');
  const px=ngF(h[9],-2e5,2e5,NaN)/100,py=ngF(h[10],-2e5,2e5,NaN)/100,pz=ngF(h[11],-2e5,2e5,NaN)/100;
  if(P.plain&&!blast&&!ngBig(t)&&!ngSee(src,t,px,py,pz))return ngRej('los');
  const kbM=blast||thrown?Math.max(P.kb,16):P.kb,upM=blast||thrown?Math.max(P.up,8):P.up,dir=[ngF(h[4],-100,100,0)/100,ngF(h[5],-100,100,0)/100,ngF(h[6],-100,100,0)/100];
  return {dmg:ngF(h[1],0,1e5,0),o:{w,hs:!!(f&1),knife:!!(f&2),heavy:!!(f&4),he:blast,blunt:!!(f&16),tank:f&32?1:0,dir,kb:ngF(h[7],0,kbM*10,0)/10,stag:ngF(h[8],0,300,0)/100,
    x:Number.isFinite(px)?px:t.c.x,y:Number.isFinite(py)?py:t.c.y+1,z:Number.isFinite(pz)?pz:t.c.z,up:ngF(h[12],0,upM*10,0)/10}}}
// an effect another page worked out on an actor it does not own, as numbers this page can take
const NG_EFF=[['fz',50],['rt',40],['gb',20],['hd',20],['st',40],['dz',40],['sh',40]];// (tenths of a second; the game's own longest: a 3.2 s freeze, 2.5 s dizzy or shriek, 2.3 s rooted)
function ngEff(src,t,m){const e={t:'eff',i:t.id},other=G.pvp?t.side!==src.side:t.team!==src.team;
  const kx=ngF(m.kx,-4000,4000,0),kz=ngF(m.kz,-4000,4000,0),up=ngF(m.up,0,2200,0);if(kx||kz){e.kx=kx;e.kz=kz}if(up)e.up=up;
  if(other){for(const [k,mx] of NG_EFF){const v=ngF(m[k],0,mx,0);if(v)e[k]=v}const bt=ngF(m.bt,0,60,0);if(bt&&Number.isInteger(m.bw)&&WPN[WL[m.bw]]){e.bt=bt;e.bw=m.bw}}
  for(const k of Object.keys(m))if(!(k in e)&&!['t','i','kx','kz','up','bt','bw',...NG_EFF.map(x=>x[0])].includes(k)&&typeof m[k]==='number'&&Number.isFinite(m[k])&&other)e[k]=ngF(m[k],0,100,0);// (fields other files add, e.g. MORTA-9's slow, in tenths of a second: up to 10 s)
  return e}
const HOSTH={
  hello(L,m){if(m.v!==NET_VER){netSend(L.key,{t:'bye',why:'ver'});return}
    if(NET.ui==='game'&&!actorOfKey(L.key)){netSend(L.key,{t:'bye',why:m.mg?'mig':'ingame'});return}
    let p=NET.lob.pl.find(p=>p.k===L.key);if(!p){if(NET.lob.pl.length>=NET_MAXP){netSend(L.key,{t:'bye',why:'full'});return}p={k:L.key};NET.lob.pl.push(p);HUD.note(T('mpJoined',String(m.n||'?').slice(0,14)),2.5);AU.play('uiok',{vol:.4})}
    p.n=String(m.n||'?').slice(0,14);p.s=HSKINS.includes(m.s)?m.s:'guard';p.z=ZLIST.includes(m.z)?m.z:'rager';p.f=HOF.valid(m.f)?+m.f:0;p.tt=typeof m.tt==='string'?m.tt.slice(0,24):null;p.an=p.f||p.tt?String(m.an||'').slice(0,16):'';p.t=m.tc?1:0;L.name=p.n;netLobbyCast();
    if(m.mg)netMigHello(L,m)},
  ping(L){},
  pong(L,m){if(Number.isFinite(m.h)&&m.h>0&&!(L.srtt&&NET.ui==='game'))L.rtt=lerp(L.rtt||0,clamp(netNow()-m.h,0,1e4),L.rtt?.3:1)},
  bye(L){netLinkDown(L,'bye')},
  // (v6.72: every claim goes through ngClaim above; 대인전's own per-gun check, pvp.js claimOk, runs inside it)
  h(L,m){const src=actorOfKey(L.key);if(!src||!Array.isArray(m.L))return;const now=netNow();
    for(const h of m.L.slice(0,NG.HMAX)){if(!Array.isArray(h))continue;const t=byId(h[0]);if(!t||!t.alive||t===src)continue;const c=ngClaim(src,t,h,now);if(c)damageActor(t,c.dmg,src,c.o)}},
  claw(L,m){const a=actorOfKey(L.key),t=byId(m.i);if(!a||!t||!a.alive||a.team!==TZ||!t.alive||t.team!==TH)return;const now=netNow();
    if(G.t<(a.clawLock||0)||!ngSpend(a,4,now)||!ngNear(a,t,CLAW_R[1]+(t.c.r||.4)+2.2)||!ngSee(a,t,NaN,NaN,NaN)){ngRej('claw');return}clawApply(a,t,!!m.h)},
  fall(){},// (fall damage was removed in v6.26; an older client may still send this)
  eff(L,m){const src=actorOfKey(L.key),t=byId(m.i);if(!t||!src||t===src||!t.alive||!ngNear(src,t,120)){ngRej('eff');return}netApplyEff(t,ngEff(src,t,m),src)},
  buy(L,m){const a=actorOfKey(L.key);const ok=!!(a&&buy(a,m.w));netSend(L.key,{t:ok?'buyok':'buyno',w:m.w})},
  // a skill pressed just before the cooldown ends (the client's view of it lags a little) fires the moment it is ready
  sk(L){const a=actorOfKey(L.key);if(!a||!a.alive||a.team!==TZ)return;if(a.skillCD>0&&a.skillCD<.6)a.skPend=G.t+.7;else useSkill(a)}};
// ---------- client: handlers for what the host sends ----------
function netWithEv(f){NET.ev++;try{f()}finally{NET.ev--}}
// ---------- v6.71: what the host sends is checked before this page keeps it (a page can send anything at all) ----------
// The lobby, the match settings and roster, round plans, the score and the stats block end up in the waiting room, the scoreboard
// and the results, so every field is made the type and size it should be: modes and maps from the lists, skins and zombie classes
// from theirs, numbers as numbers, names cut to length (they are escaped where they are shown).
const NET_MODES=['mut','orig','scen','tdm','ffa','bomb','race'];
// (v6.82) the modes a player can join while a match is under way (latejoin.js); the scenario's chapters are not among them
const NET_LATE=['mut','orig','tdm','ffa','race','bomb'];
const netN=(v,d)=>{v=+v;return Number.isFinite(v)?v:(d||0)};
const netI=(v,lo,hi,d)=>{v=Math.round(+v);return Number.isFinite(v)?Math.min(hi,Math.max(lo,v)):(d==null?lo:d)};
const netS=(v,n)=>typeof v==='string'?v.slice(0,n):'';
const netZ=(z,d)=>typeof z==='string'&&ZLIST.includes(z)?z:d;
function netCleanCfg(c){const o={};
  if(c&&typeof c==='object'&&!Array.isArray(c))for(const k of Object.keys(c).slice(0,48)){if(!/^[A-Za-z][A-Za-z0-9_]{0,23}$/.test(k)||k==='constructor')continue;const v=c[k];
    if(typeof v==='number'){if(Number.isFinite(v))o[k]=v}else if(typeof v==='boolean')o[k]=v;else if(typeof v==='string')o[k]=v.replace(/[^A-Za-z0-9_.:-]/g,'').slice(0,24)}
  if(!NET_MODES.includes(o.mode))o.mode='mut';if(!(typeof o.map==='string'&&Object.prototype.hasOwnProperty.call(MAPDEFS,o.map)))o.map='q7';return o}
function netCleanPl(p){if(!p||typeof p!=='object')return null;
  return {k:netS(p.k,48),n:netS(p.n,16)||'?',s:HSKINS.includes(p.s)?p.s:'guard',z:netZ(p.z,'rager'),h:p.h?1:0,f:HOF.valid(p.f)?+p.f:0,
    tt:typeof p.tt==='string'?p.tt.slice(0,24):null,an:netS(p.an,16),t:p.t?1:0,p:netI(p.p,-1,99999,0),r:p.r===2?2:p.r?1:0}}
function netCleanLob(l){l=l&&typeof l==='object'?l:{};return {cfg:netCleanCfg(l.cfg),pl:Array.isArray(l.pl)?l.pl.slice(0,NET_MAXP).map(netCleanPl).filter(Boolean):[],pub:l.pub?1:0,g:netI(l.g,0,1e9,0)}}
// the roster: [id, name, skin, zombie class, player key, scenario, hall-of-fame code, account nickname, title] (shorter for bots)
function netCleanRo(ro){const out=[];if(!Array.isArray(ro))return out;
  for(const r0 of ro.slice(0,96)){if(!Array.isArray(r0))continue;const r=r0.slice(0,9),o=[netI(r[0],0,99999,out.length),netS(r[1],16)||'?',HSKINS.includes(r[2])?r[2]:'guard',netZ(r[3],'rager'),netS(r[4],48)];
    if(r.length>5)o.push(r[5]?1:0);if(r.length>6)o.push(HOF.valid(r[6])?+r[6]:0);if(r.length>7)o.push(netS(r[7],16));if(r.length>8)o.push(typeof r[8]==='string'?r[8].slice(0,24):null);out.push(o)}
  return out}
// a round plan: the round number and the placements as numbers; the modes' own fields stay as they are (numbers kept numbers)
function netCleanPlan(m){const p=Object.assign({},m);p.n=netI(m.n,0,9999,1);
  if(m.P!=null)p.P=Array.isArray(m.P)?m.P.slice(0,128).filter(Array.isArray).map(q=>q.slice(0,12).map(v=>typeof v==='number'||typeof v==='boolean'?v:netN(v))):[];
  for(const k of ['s','l','f','k','bp','pw','bb'])if(p[k]!=null&&typeof p[k]!=='number')p[k]=netN(p[k]);return p}
const CLIH={
  lobby(L,m){if(!m.lob||typeof m.lob!=='object'||!Array.isArray(m.lob.pl))return;const lob=netCleanLob(m.lob);NET.lob=lob;const mp=lob.cfg.map;if(NET.ui!=='game'&&MAPDEFS[mp]&&MAP.id!==mp&&MAP.want!==mp)loadMapUI(mp);if(NET.ui!=='game'){const was=NET.ui;NET.ui='lobby';if(was!=='lobby'||UI.open!=='lobby')UI.mpLobby();else UI.mpRender()}},
  ping(L,m){netToHost({t:'pong',h:m.h})},
  // a refusal ends it; the host leaving (with the succession it picked) starts the hand-over
  bye(L,m){if(m.why){netFatal(m.why==='full'?T('mpFull'):m.why==='ingame'?T('mpInGame'):m.why==='ver'?T('mpVer'):m.why==='mig'?T('mpMigFail'):m.why==='flood'?T('mpFlood'):T('mpHostGone'));return}
    if(netMigOK())netMigStart('bye',m.mg);else netFatal(T('mpHostGone'))},
  // the new host has this page back (a match then waits for the others: mgo)
  mig(L,m){NET.gen=m.g|0;const M=NET.mig;if(!M||M.role!=='cli')return;M.joined=netNow();M.dial=null;M.hn=String(m.n||'').slice(0,14);
    if(NET.ui!=='game'){NET.mig=null;netMigDone(M.why==='give'?T('mpGave',M.hn||'?'):T('mpMigNew',M.hn||'?'))}else netMigUI()},
  mgo(L,m){const M=NET.mig;if(!M)return;NET.mig=null;const n=String(m.n||M.hn||'').slice(0,14);netMigDone(T('mpMigNew',n||'?')+(m.w&&m.w!=='over'?' — '+netMigWhat(m.w):''))},
  mignot(){if(NET.mig&&NET.mig.role==='cli')netFatal(T('mpHostGone'))},
  mbot(L,m){if(Array.isArray(m.i))for(const i of m.i){const a=byId(i);if(a&&!a.isPlayer)a.net=null}},
  migto(L,m){const M=NET.mig;if(!M||M.role!=='cli')return;const k=typeof m.k==='string'?m.k:'';
    if(k===NET.me){netMigPromote();return}
    if(!k||M.gone.has(k)||++M.redir>3){netFatal(T('mpMigFail'));return}
    // (v6.72: a page sends one on only to a page ahead of itself in the line; pointed further down or to a stranger, this page goes
    // on in its own order instead)
    {const iL=M.list.indexOf(L.key),iK=M.list.indexOf(k);if(iL>=0&&(iK<0||iK>iL)){M.gone.add(L.key);L.dead=true;try{L.close()}catch(e){}NET.links.delete(L.key);NET.out.delete(L.key);M.dial=null;NET.hostKey='';netMigNext();return}}
    // the page asked is not taking over: drop that link and go where it points
    L.dead=true;try{L.close()}catch(e){}NET.links.delete(L.key);NET.out.delete(L.key);M.dial=null;NET.hostKey='';
    let i=M.list.indexOf(k);if(i<0){M.list.splice(M.i,0,k);i=M.i}M.i=i;netMigDial(k)},
  start(L,m){netBegin(netCleanCfg(m.cfg),netCleanRo(m.ro))},
  round(L,m){netWithEv(()=>startRound(netCleanPlan(m)))},
  hosts(L,m){if(!Array.isArray(m.i))return;const zs=Array.isArray(m.z)?m.z:[];for(let i=0;i<m.i.length;i++){const a=byId(m.i[i]);if(a)a.zpick=a.isPlayer?a.zpick:netZ(zs[i],a.zpick)}netWithEv(()=>selectHosts(m.i));G.st='fight';G.time=G.roundTime},
  infect(L,m){const t=byId(m.i);if(!t||t.team!==TH)return;if(!t.isPlayer)t.zpick=netZ(m.z,t.zpick);netWithEv(()=>infect(t,byId(m.s)))},
  kill(L,m){const t=byId(m.i);if(!t||!t.alive)return;netWithEv(()=>killZombie(t,byId(m.s),{w:m.w,hs:!!m.hs,dir:m.d?[m.d[0]/100,m.d[1]/100,m.d[2]/100]:null,knife:!!m.k,heavy:!!m.h,he:!!m.he}))},
  hdie(L,m){const t=byId(m.i);if(!t||!t.alive||t.team!==TH)return;netWithEv(()=>hurtHuman(t,1e6,byId(m.s),{}))},
  rv(L,m){const a=byId(m.i);if(!a)return;if(!a.isPlayer)a.zpick=netZ(m.z,a.zpick);a.nb=null;netWithEv(()=>reviveZombie(a,m.at?[m.at[0]/100,m.at[1]/100,m.at[2]/100]:null,m.rs))},
  end(L,m){netWithEv(()=>endRound(m.w));G.score=Array.isArray(m.sc)?[m.sc[0]|0,m.sc[1]|0]:[0,0];G.st='end';G.endT=6},
  over(){G.st='over';UI.showResults()},
  bo(L,m){if(m.on)BO.start(m.d||20,true);else BO.stop(true)},
  tolobby(){netToLobby()},
  buyok(L,m){ldBuyOk(m.w)},
  buyno(L,m){ldBuyNo(m.w)},
  eff(L,m){const P=G.player;if(P&&m.i===P.id)netApplyEff(P,m,null)},
  sk(L,m){const a=byId(m.i);if(a){NET.ghost++;try{skillFx(a,m.k)}finally{NET.ghost--}}},
  trap(L,m){const a=byId(m.o);if(a)nyTrapAdd(a,m.x/100,m.y/100,m.z/100,m.r/1000,m.i)},
  tsnap(L,m){nyTrapSnap(m.i,byId(m.v))},
  snd(L,m){AU.at(m.n,m.x/100,m.y/100,m.z/100,{vol:m.v||.9});if(m.n==='clawarmor')FX.spawn({x:m.x/100,y:m.y/100,z:m.z/100,vy:1,life:.2,s0:.3,s1:.5,r:1,g:.9,b:.6,f:1,add:1})},
  bot(L,m){const a=byId(m.i);if(a){HUD.note(T('mpLeft',a.name),3);a.net=null}}};
// (a client hears only its host; another page that opens a link to it is looking for a new host: netMigAsk)
function netHandle(L,m){if(NET.cli&&L.key!==NET.hostKey){netMigAsk(L,m);return}const H=NET.host?HOSTH:CLIH;const f=typeof m.t==='string'&&Object.prototype.hasOwnProperty.call(H,m.t)?H[m.t]:null;if(f)f(L,m)}

// ---------- lobby ----------
function netLobbyCast(){if(!NET.host)return;const me=NET.lob.pl[0];if(me){me.n=CFG.mpName;me.s=CFG.skin;me.z=CFG.zclass;Object.assign(me,TTL.hello());me.t=typeof TOUCH!=='undefined'&&TOUCH.on?1:0}
  // (r: 1 the claude.ai room relays this player, 2 the site's relay server does — v6.89)
  for(const p of NET.lob.pl){const L=NET.links.get(p.k);p.p=L?Math.round(L.rtt):0;p.r=L?(L.kind==='relay'?1:L.via==='turn'?2:0):0}
  // (every player keeps the list: if this page vanishes they agree on who takes over; pub: whether the room is listed)
  NET.lob.pub=ROOMS.pubOn?1:0;NET.lob.g=NET.gen|0;
  netAll({t:'lobby',lob:NET.lob});UI.mpRender&&UI.mpRender()}
const NET_FIXED_CODE='1234';
NET.create=async function(){netTables();const kind=await netDetect();if(!kind){NET.msg=T('mpNone');UI.mpRender();return}
  NET.on=true;NET.host=true;NET.cli=false;NET.ui='lobby';NET.links.clear();NET.out.clear();NET.inQ=[];NET.msg=T('mpConnecting');NET.gen=0;NET.mig=null;
  NET.lob={cfg:Object.assign({mode:CFG.mode,bots:8,diff:CFG.diff,rounds:CFG.rounds,time:CFG.time,blackout:1},CFG.mpCfg||{}),pl:[]};if(!MAPDEFS[NET.lob.cfg.map])NET.lob.cfg.map=MAPDEFS[CFG.map]?CFG.map:'q7';if(MAP.id!==NET.lob.cfg.map)loadMapUI(NET.lob.cfg.map);
  // inside claude.ai the room code is always the same (NET_FIXED_CODE): friends just press create / join.
  // Through PeerJS every room gets a random 4-letter code (no 0/O/1/I); a code someone already holds is redrawn a few times.
  try{if(kind==='room'){NET.code=NET_FIXED_CODE;NET.me='k'+netKey(9);await RSIG.open()}
    else{await TURN.get(3500);if(!NET.on||!NET.host)return;
      for(let i=0;;i++){NET.code=netKey(4);try{await PJ.host();break}catch(e){PJ.close();if(!(e&&e.type==='unavailable-id')||i>=4)throw e}}}}
  catch(e){PJ.close();NET.on=false;NET.ui='';NET.msg=T('mpFail')+(e&&e.type?' ('+e.type+')':'');UI.mpRender();return}
  NET.lob.pl=[{k:NET.me,n:CFG.mpName,s:CFG.skin,z:CFG.zclass,h:1,...TTL.hello()}];NET.msg='';ROOMS.pubOn=kind==='peerjs'&&CFG.mpPub!==false;UI.mpLobby();ROOMS.tick()};
NET.join=async function(code){netTables();code=String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');if(code.length!==4){NET.msg=T('mpBad');UI.mpRender();return}
  const kind=await netDetect();if(!kind){NET.msg=T('mpNone');UI.mpRender();return}
  NET.on=true;NET.host=false;NET.cli=true;NET.ui='join';NET.code=code;NET.hostKey='';NET.links.clear();NET.out.clear();NET.inQ=[];NET.lastK=0;NET.msg=T('mpConnecting');NET.gen=0;NET.mig=null;UI.mpRender();
  NET.forceRelay=/[?&]relay=1/.test(location.search);NET.p2pRetry=0;NET.hostP2P=false;NET.relayWhy='';
  try{if(kind==='room'){NET.me='k'+netKey(9);await RSIG.open();setTimeout(()=>{if(NET.on&&NET.cli&&!NET.hostKey)netFatal(T('mpNotFound'))},8000)}
    else{await TURN.get(3500);if(!NET.on||!NET.cli||NET.code!==code)return;await PJ.join()}}
  catch(e){netFatal(e&&e.type==='peer-unavailable'?T('mpNotFound'):e&&(e.type==='nat'||e.type==='timeout')?netNatMsg(e):T('mpFail')+(e&&e.type?' ('+e.type+')':''))}};
// (why no link came up, as far as this page can tell: no relay to fall back on; a network that keeps it off the relay too; or the other side)
function netNatMsg(e){return !TURN.use()?T('mpNatPJ'):e&&e.relay===false?T('mpNatTurnBlk'):T('mpNatTurn')}
NET.leave=function(){ROOMS.down();if(!NET.on)return;
  // a PeerJS host hands the room on: the order of who takes over goes with the goodbye (clients also keep it from the lobby updates)
  const mg=NET.host&&NET.kind==='peerjs'&&(NET.ui==='lobby'||NET.ui==='game')?netMigOrder(NET.lob.pl,NET.me):null;
  netAll(mg&&mg.length?{t:'bye',mg,g:(NET.gen|0)+1}:{t:'bye'});netFlushR();if(NET.kind==='room'){RSIG.dirty=true;RSIG.flush()}
  const links=[...NET.links.values()];NET.links.clear();const kind=NET.kind,pj=kind==='peerjs'?PJ.detach():null;
  setTimeout(()=>{for(const L of links)try{L.dead=true;L.close()}catch(e){}if(kind==='room')RSIG.close();else if(pj)pj()},150);
  NET.on=NET.host=NET.cli=false;NET.ui='';NET.out.clear();NET.inQ=[];NET.fx=[];NET.fxQ=[];NET.hits=[];NET.ids.clear();NET.hostKey='';NET.mig=null;netMigUI(true)};
function netFatal(msg){console.warn('net: end',msg);const wasGame=NET.ui==='game';NET.leave();NET.msg=msg;if(wasGame||G.st!=='menu'){Main.toTitle();UI.act('mp')}else UI.act('mp');setTimeout(()=>{NET.msg=msg;UI.mpRender&&UI.mpRender()},30)}
// (a new host waits until its players are back before a match can start: netMigResume)
NET.start=function(){if(!NET.host||NET.ui!=='lobby'||NET.mig)return;const cfg=Object.assign({},NET.lob.cfg);if(cfg.mode==='scen'){cfg.ep=epSel(cfg);cfg.map=epMapOf(cfg)}else{cfg.ep=0;cfg.map=epMapOf(cfg)}CFG.mpCfg=Object.assign({},cfg);saveCfg();
  cfg.mt=netKey(12);if(NET.lob.pl[0])Object.assign(NET.lob.pl[0],TTL.hello());
  const ro=[];let id=0;for(const p of NET.lob.pl)ro.push([id++,p.n,p.s,p.z,p.k,0,p.f|0,p.an||'',typeof p.tt==='string'?p.tt:null]);const names=shuffle(BOT_NAMES.slice());const nb=cfg.mode==='scen'?Math.max(0,Math.min(cfg.bots|0,NET_MAXP-NET.lob.pl.length)):cfg.bots;for(let i=0;i<nb;i++)ro.push([id++,names[i%names.length],rpick(HSKINS),rpick(ZLIST),'']);
  if(cfg.mode==='scen')for(let i=0;i<=SCEN.POOL;i++)ro.push([id++,'Z','guard','rager','',1]);
  for(const L of NET.links.values())L.inGame=NET.lob.pl.some(p=>p.k===L.key);
  netEv('start',{cfg,ro});netBegin(cfg,ro)};
// every page builds the same actors from the host's roster
function netBegin(cfg,ro){netTables();AU.init();MAP.want=MAPDEFS[cfg.map]?cfg.map:'q7';loadMap(MAP.want);Main.clearDemo();for(const a of G.actors)for(const k in a.rigs)R.scene.remove(a.rigs[k].grp);
  // v6.90: this page's own tick number (NET.k) only ever grows. It used to start again at 0 with every match while the host kept each
  // player's last number from the match before (L.lastK) and dropped every state not above it: in a second match in the same room the
  // players stood still on every screen (and were hit there) while they moved on their own. What each link heard last starts afresh with
  // the match too (for a page of an older version, whose numbers still start again), and no effects of the last match ride along (the
  // claude.ai relay's windows).
  NET.ui='game';NET.lastK=0;NET.fx=[];NET.fxQ=[];NET.hits=[];NET.ids.clear();NET.tAcc=0;NET.t0=netNow();UI.hideAll();
  for(const L of NET.links.values()){L.lastK=0;L.fxK=0;if(L.fw)L.fw=[]}
  startMatch(Object.assign({},cfg,{ro}));for(const a of G.actors)NET.ids.set(a.id,a);
  HUD.show(true);Main.paused=false;Main.overlay=null;if(NET.host)Main.lock();else HUD.note(T('clickToPlay'),4);window.onbeforeunload=e=>{if(NET.on){e.preventDefault();e.returnValue='';return ''}}}
function netToLobby(){if(NET.host)netEv('tolobby');for(const a of G.actors)for(const k in a.rigs)R.scene.remove(a.rigs[k].grp);G.actors=[];G.player=null;clearNades();NY.clear();FX.clearDecals();
  AU.stopAll('countdown');Main.closeOverlay(true);Main.paused=false;R.PU.uNV.value=0;R.PU.uZ.value=0;R.PU.uDeath.value=0;R.PU.uInfect.value=0;R.vmVisible=false;NET.ui='lobby';NET.ids.clear();NET.fxQ=[];
  Main.menuDemo();Main.unlock();UI.mpLobby();if(NET.host)netLobbyCast()}

// ---------- host migration (v6.38, PeerJS rooms) ----------
// When the host goes (leaves, closes the tab, or falls silent in a match) the room carries on under the next player in line. The line:
// everyone after the host in join order, players on a computer before those on a phone or tablet; every page works it out from the
// last lobby update (the host also sends it with its goodbye), so they agree. The next in line keeps its own peer id and takes
// connections on it (and claims the room code's id once that is free: friends can still join with the code); the others connect to it
// directly. Someone the PeerJS server no longer knows is skipped. In the waiting room that is all. In a match everything stops while
// the others come back (15 s at most); then the new host runs the bots and restarts the round (score, round number and stats stay),
// or in the scenario the stage / zone (a boss fight from the phase it reached; the lift ride and the escape carry on).
// The host can also hand the room over from the waiting room (방장 넘기기). The claude.ai room relay keeps the old rule (the room ends).
function netHold(){return !!(NET.on&&NET.mig&&NET.mig.hold&&NET.ui==='game')}
function netMigOK(){return NET.on&&NET.kind==='peerjs'&&(NET.ui==='lobby'||NET.ui==='game')&&!!PJ.peer&&!PJ.peer.destroyed}
function netMigOrder(pl,ex){const L=(pl||[]).filter((p,i)=>i>0&&p&&typeof p.k==='string'&&p.k&&p.k!==ex);return L.filter(p=>!p.t).concat(L.filter(p=>p.t)).map(p=>p.k)}
const netMigWhat=w=>T(w==='round'?'mpMigRound':w==='stage'?'mpMigStage':w==='zone'?'mpMigZone':w==='phase'?'mpMigPhase':'mpMigGo');
// a client lost its host: why = bye · quiet · ask (another page asked this one to take over) · a link-down reason; mg = the host's order
// (the host's own key is the first in the lobby list; the link to it may have another name: friends who joined a new host with the
// room code reached it at the code's id)
function netMigStart(why,mg,wait){if(NET.mig||!NET.on||!NET.cli)return;const old=NET.hostKey,ui=NET.ui,h0=NET.lob.pl[0],oldK=h0&&typeof h0.k==='string'&&h0.k?h0.k:old;
  const list=Array.isArray(mg)&&mg.length?mg.filter(k=>typeof k==='string'&&k&&k!==old&&k!==oldK).slice(0,NET_MAXP):netMigOrder(NET.lob.pl,oldK);if(!list.includes(NET.me))list.push(NET.me);
  const oa=ui==='game'?actorOfKey(oldK):null;
  NET.mig={g:(NET.lob.g|0)+1,old:oldK,oldId:oa?oa.id:-1,list,i:0,gone:new Set([old,oldK]),t0:netNow(),hold:ui==='game',role:'cli',dial:null,redir:0,why};
  // the old host's link goes (one that only fell quiet is told, in case it can still hear: it lets this player go)
  const L=NET.links.get(old);if(L){if(!L.dead&&L.ok&&(why==='quiet'||why==='ask')){netSend(old,{t:'bye',why:'mig'});netFlushR()}L.dead=true;NET.links.delete(old);setTimeout(()=>{try{L.close()}catch(e){}},150)}NET.out.delete(old);
  // its player is a bot from now on; nothing timed by its clock counts any more
  if(oa)oa.net=null;NET.hostKey='';NET.lastK=0;NET.hostTs=0;NET.off.clear();NET.fxQ=[];NET.hits=[];for(const a of G.actors)a.nb=null;
  netMigUI();if(!wait)netMigNext()}
function netMigNext(){const M=NET.mig;if(!M||M.role!=='cli')return;while(M.i<M.list.length&&M.gone.has(M.list[M.i]))M.i++;
  const k=M.list[M.i];if(!k||k===NET.me){netMigPromote();return}netMigDial(k)}
function netMigDial(k){const M=NET.mig,p=PJ.peer;if(!M||!p)return;
  if(!M.dial||M.dial.k!==k)M.dial={k,at:netNow(),up:false};NET.hostKey=k;
  // (our own line to the PeerJS server is down for a moment: try again shortly)
  if(p.disconnected||p.destroyed){setTimeout(()=>{if(NET.mig===M&&M.dial&&M.dial.k===k&&!M.dial.up)netMigDial(k)},1000);return}
  let L=NET.links.get(k);
  if(L&&L.ok&&!L.dead){M.dial.up=true;netSend(k,netHello())}// (that page already has a link open to this one)
  else{if(L){L.dead=true;try{L.close()}catch(e){}}L=pjLink(k);L.dialed=true;NET.links.set(k,L);
    const r=p.connect(k,{label:'r',reliable:true,serialization:'raw'}),u=p.connect(k,{label:'u',reliable:false,serialization:'raw'});
    if(!r||!u){setTimeout(()=>{if(NET.mig===M&&M.dial&&M.dial.k===k&&!M.dial.up)netMigDial(k)},1000);return}L.attach(r);L.attach(u)}
  netMigUI()}
// the PeerJS server does not know that page (it left too): the next in line
function netMigGone(k){const M=NET.mig;if(!M||M.role!=='cli')return;M.gone.add(k);const L=NET.links.get(k);if(L){L.dead=true;try{L.close()}catch(e){}NET.links.delete(k)}NET.out.delete(k);
  if(M.dial&&M.dial.k===k){M.dial=null;NET.hostKey='';M.i++;netMigNext()}}
function netMigUnavail(e){const M=NET.mig;if(!M||M.role!=='cli'||!M.dial)return false;const k=(/peer (\S+)/.exec(e&&e.message||'')||[])[1];if(k&&k!==M.dial.k)return false;netMigGone(M.dial.k);return true}
// another page, looking for a new host, opened a link to this one (still a client): take over if our host is gone too and this page
// is next in line (after the ones that page found gone), else point it on; a host that is still there: say so
function netMigAsk(L,m){if(!m||m.t!=='hello'||!m.mg||NET.kind!=='peerjs')return;if(m.v!==NET_VER){netSend(L.key,{t:'bye',why:'ver'});return}
  if(!NET.mig){const H=NET.links.get(NET.hostKey),q=!H||H.dead||!H.ok||netNow()-H.lastRx>(NET.ui==='game'?1500:2500);
    if(!q||!netMigOK()){netSend(L.key,{t:'mignot'});return}netMigStart('ask',null,true);if(!NET.mig)return}
  const M=NET.mig;if(M.role!=='cli')return;
  // (v6.72: the pages the asker found gone count only when it asks from further down the line than this page — then its word can only
  // make this page or one ahead of it the host, never the asker itself. A page cannot talk the others into making it the host.)
  const iMe=M.list.indexOf(NET.me),iA=M.list.indexOf(L.key);
  if(Array.isArray(m.sk)&&iA>iMe)for(const k of m.sk.slice(0,NET_MAXP*2))if(typeof k==='string'&&k&&k!==NET.me&&k!==L.key)M.gone.add(k);
  const first=M.list.find(k=>!M.gone.has(k))||NET.me;
  if(first===NET.me){netMigPromote();HOSTH.hello(L,m);return}
  netSend(L.key,{t:'migto',k:first});if(!M.dial){M.i=Math.max(0,M.list.indexOf(first));netMigNext()}}
// this page is the host now
function netMigPromote(){const M=NET.mig;if(!M||M.role!=='cli')return;
  if(M.dial){const L=NET.links.get(M.dial.k);if(L&&!L.ok){L.dead=true;try{L.close()}catch(e){}NET.links.delete(M.dial.k)}}// (a dial still under way goes)
  M.role='host';M.dial=null;M.hostAt=netNow();NET.host=true;NET.cli=false;NET.hostKey='';NET.gen=M.g;
  const me=NET.lob.pl.find(p=>p.k===NET.me)||{k:NET.me},rest=NET.lob.pl.filter(p=>p&&p!==me&&p.k!==M.old&&!M.gone.has(p.k));for(const p of rest)delete p.h;me.h=1;NET.lob.pl=[me,...rest];
  M.want=new Set(rest.map(p=>p.k));M.got=new Set();
  ROOMS.pubOn=!!NET.lob.pub;setTimeout(()=>{if(NET.on&&NET.host)PJ.bellOn()},1500);
  if(NET.ui==='game')netMigTakeover();else if(UI.open==='lobby')UI.mpLobby();
  netLobbyCast();netMigUI()}
// a match: the bots (and the old host's player) run here from now on; the other players stay puppets driven by their own pages
function netMigTakeover(){const M=NET.mig;M.bots=[];
  for(const a of G.actors){a.nb=null;a.nraw=null;a._ef=null;a.skPend=0;if(a===G.player){a.pup=false;continue}
    if(a.net&&(a.net===M.old||M.gone.has(a.net))){a.net=null;M.bots.push(a.id)}if(a.net){a.pup=true;continue}
    a.pup=false;if(!a.bot){a.bot=AI.mk(a);if(a.alive)AI.onTeam(a)}}
  NET.off.clear();NET.fxQ=[];NET.hits=[];for(const L of NET.links.values())L.inGame=false}
// (host) a player on the way here said hello: back in the match (its scenario upgrades with it)
function netMigHello(L,m){const M=NET.mig;
  if(NET.ui==='game'){L.inGame=true;const a=actorOfKey(L.key);
    if(a&&G.mode==='scen'&&m.wu&&typeof m.wu==='object'){const w={};for(const k in m.wu)if(Object.prototype.hasOwnProperty.call(WPN,k))w[k]=clamp(m.wu[k]|0,0,5);a.wup=w}}
  if(M&&M.role==='host'&&M.want)M.got.add(L.key);
  netSend(L.key,{t:'mig',g:NET.gen|0,n:CFG.mpName||''});
  if(NET.ui==='game'&&!(M&&M.hold))netSend(L.key,{t:'mgo',w:'go',n:CFG.mpName||''});// (the match is already going again)
  netMigUI()}
// everyone is back (or 15 s went by): whoever is missing becomes a bot, the match starts again, the pause ends
function netMigResume(){const M=NET.mig;if(!M||M.role!=='host')return;NET.mig=null;
  for(const k of M.want)if(!M.got.has(k))netDropPlayer(k);
  let w='';if(NET.ui==='game'){if(M.bots&&M.bots.length)netEv('mbot',{i:M.bots});w=netMigRestart();netEv('mgo',{w,n:CFG.mpName||''})}
  netLobbyCast();if(typeof CHAT!=='undefined'&&CHAT.sys)CHAT.sys(T('mpMigNew',CFG.mpName||'?'));netMigDone(T('mpMigMe')+(w&&w!=='over'?' — '+netMigWhat(w):''))}
// what starts over: the round (infection), the stage (free scenario), the zone or the boss phase (chapters); the lift ride and the
// escape carry on (their clocks come with every snapshot); a finished round or match goes on as it was
function netMigRestart(){if(G.st==='over'){netMigResults();return 'over'}
  if(G.mode==='scen'&&SCEN.on){
    if(EP.on){const ph=EP.ph,D=EP.S(),C=EP.C;if(ph==='over')return 'over';SCEN.best=Math.max(SCEN.best|0,Math.min(4,ph==='move'?EP.st:EP.st-1));
      if(ph==='board'||ph==='ride'||D.k==='escape'){const Zn=EP.zone(D.z);SCEN.zsp=Zn?(C.zsp?C.zsp(EP.st,Zn):Zn.zsp):null;return 'go'}
      if(ph==='move'&&C.stages[EP.st+1]){EP.stageStart(EP.st+1,'next');return 'zone'}
      if(D.k==='boss'){EP.stageStart(EP.st,'phase');return 'phase'}
      EP.stageStart(EP.st,'retry');return 'zone'}
    if(SCEN.ph==='over')return 'over';SCEN.best=Math.max(SCEN.best|0,SCEN.stage-1);SCEN.stageStart('retry');return 'stage'}
  if(G.st==='end'||G.pvp)return 'go';// (대인전 carries on: the scores and the respawn clocks are on every page)
  G.round=Math.max(0,G.round-1);startRound();return 'round'}
// the results card on a new host: the button that takes everyone back to the waiting room
function netMigResults(){const w=document.querySelector('#results .mbtns .mpwait');if(w)w.outerHTML=`<button data-act="mplobby" class="big">${T('mpToLobby')}</button>`}
// (host) the players still to come back: the ones it waits for that have not said hello and have not left meanwhile
function netMigNeed(M){let n=0,g=0;for(const k of M.want){if(M.got.has(k)){n++;g++}else if(NET.lob.pl.some(p=>p.k===k))n++}return [g,n]}
function netMigTick(){const M=NET.mig,now=netNow();
  if(M.role==='host'){const [g,n]=netMigNeed(M);if(g>=n||now-M.hostAt>15000)netMigResume();else if(M.uiN!==g*100+n){M.uiN=g*100+n;netMigUI()}return}
  if(M.dial&&!M.dial.up&&now-M.dial.at>14000){netFatal(T('mpMigFail'));return}
  if(now-(M.joined||M.t0)>(M.joined?20000:30000))netFatal(T('mpMigFail'))}
// the waiting room's 방장 넘기기: the chosen player takes over; this page drops the room code's id and joins them as a player
NET.give=async function(k){if(!NET.on||!NET.host||NET.ui!=='lobby'||NET.kind!=='peerjs'||NET.mig)return;const p=NET.lob.pl.find(x=>x.k===k);if(!p||k===NET.me)return;
  const old=NET.me,order=[k,...netMigOrder(NET.lob.pl,old).filter(x=>x!==k)];
  ROOMS.down();netAll({t:'bye',mg:order,g:(NET.gen|0)+1});netFlushR();
  const links=[...NET.links.values()];NET.links.clear();NET.out.clear();NET.inQ=[];const pj=PJ.detach();setTimeout(()=>{for(const L of links)try{L.dead=true;L.close()}catch(e){}pj()},150);
  NET.host=false;NET.cli=true;NET.hostKey='';NET.lastK=0;NET.gen=(NET.gen|0)+1;
  NET.mig={g:NET.gen,old,oldId:-1,list:[k],i:0,gone:new Set([old]),t0:netNow(),hold:false,role:'cli',dial:null,redir:0,why:'give'};
  NET.lob.pl=[p,...NET.lob.pl.filter(x=>x!==p&&x.k!==old)];if(UI.open==='lobby')UI.mpLobby();netMigUI();
  try{await PJ.mk()}catch(e){netFatal(T('mpMigFail'));return}
  if(NET.mig&&NET.mig.why==='give'&&NET.mig.role==='cli')netMigDial(k)};
// the notice: while it lasts (a match: centred, the game paused), then what happened for a few seconds
function netMigBox(){let el=$('migBox');if(!el){el=document.createElement('div');el.id='migBox';(document.getElementById('app')||document.body).appendChild(el)}return el}
function netMigUI(off){const M=NET.mig,el=$('migBox');
  if(off||!M||!NET.on){if(el&&(off||!el.classList.contains('done')))el.className='';return}
  let h,s='';if(M.role==='host'){h=T('mpMigMe');const [g,n]=M.want?netMigNeed(M):[0,0];if(n)s=T('mpMigWaitP',g,n)}
  else{h=M.why==='give'?T('mpGiving'):T('mpMigLeft');s=M.joined?T('mpMigIn'):T('mpMigConn')}
  const box=netMigBox();box.innerHTML=`<b>${esc(h)}</b>${s?`<span>${esc(s)}</span>`:''}`;box.className='on'+(M.hold?' hold':'')+(NET.ui!=='game'?' atop':'')}
function netMigDone(msg){const box=netMigBox();box.innerHTML=`<b>${esc(msg)}</b>`;box.className='on done'+(NET.ui!=='game'?' atop':'');clearTimeout(netMigDone.t);netMigDone.t=setTimeout(()=>{if(!NET.mig&&box.classList.contains('done'))box.className=''},3500)}

// ---------- the public room list (v6.12): a signed-in PeerJS host lists its room (supabase: rooms, qz_room_up / qz_room_down / qz_rooms) ----------
// The host refreshes its row every 10 s (and at once when players, map, mode or lobby/playing change); the server drops a row after 30 s
// without one. The list is read by anyone (signed in or not) and refreshed every 5 s while the multiplayer menu is open.
// (a code another account still lists is tried again after 20 s: a new host after a hand-over waits for the old row to lapse)
const ROOMS={list:null,err:'',busy:false,refT:0,upT:0,last:'',pub:'',upBusy:false,bad:'',badT:0,pubOn:false,shutT:0,
  srv(){return typeof ACC!=='undefined'&&ACC.on},
  can(){return NET.on&&NET.host&&NET.kind==='peerjs'&&this.pubOn&&this.srv()&&ACC.signed()&&!(this.bad===NET.code&&Date.now()-this.badT<20000)&&!(Date.now()<this.shutT)},
  st(){const c=NET.lob.cfg;return {p_code:NET.code,p_name:CFG.mpName||'',p_map:c.map||'',p_mode:c.mode||'mut',p_players:NET.lob.pl.length,p_max:NET_MAXP,p_status:NET.ui==='game'?'playing':'lobby'}},
  async up(){const a=this.st(),s=JSON.stringify(a);this.upBusy=true;this.upT=Date.now();
    try{const r=await ACC.rpc('qz_room_up',a);this.pub=a.p_code;if(!(r&&r.skipped))this.last=s}
    catch(e){if(/room_taken|bad_code/.test(e&&e.message||'')){this.bad=a.p_code;this.badT=Date.now()}
      // (v6.43: an admin took the room off the list: it goes on privately; asked again in 5 minutes)
      if(/room_closed/.test(e&&e.message||'')){const first=!this.shutT;this.shutT=Date.now()+300e3;if(first){const t=ACC.errText(e);if(NET.ui==='game'&&typeof HUD!=='undefined')HUD.note(t,4);else netMigDone(t)}}
      console.warn('rooms: up',e&&e.message)}
    this.upBusy=false;if(!this.can()||NET.code!==a.p_code)this.down()},
  down(keep){const c=this.pub;this.last='';if(!c)return;this.pub='';if(!this.srv())return;if(keep)ACC.beacon('qz_room_down',{p_code:c});else ACC.rpc('qz_room_down',{p_code:c}).catch(()=>{})},
  tick(){const now=Date.now();
    if(this.can()){if(!this.upBusy&&(JSON.stringify(this.st())!==this.last&&now-this.upT>1000||now-this.upT>10000))this.up()}
    else if(this.pub&&!this.upBusy)this.down();
    if(UI.open==='mp'&&!NET.on&&now-this.refT>5000)this.load()},
  async load(){this.refT=Date.now();if(!this.srv()||NET.kind==='room'||this.busy){this.render();return}this.busy=true;this.render();
    try{const r=await ACC.rpc('qz_rooms');this.list=Array.isArray(r)?r:[];this.err=''}
    catch(e){const m=String(e&&e.message||'')+(e&&e.code||'');this.err=/Could not find the function|PGRST202/.test(m)?(LI()?'The database needs the new schema.sql':'서버 업데이트가 필요해요 (supabase/schema.sql 다시 실행)'):ACC.errText(e)}
    this.busy=false;this.render()},
  label(){const L=LI();return !this.pubOn?(L?'Private':'비공개'):this.srv()&&ACC.signed()?(L?'Public room':'공개 방'):(L?'Private (sign in to list it)':'비공개 (로그인하면 목록에 떠요)')},
  html(){const L=LI();if(!this.srv())return `<p class="rempty">${L?'Not connected to the account server yet':'계정 서버 연결 전'}</p>`;
    if(this.err&&!(this.list&&this.list.length))return `<p class="rempty bad">${esc(this.err)}</p>`;if(!this.list)return `<p class="rempty">${L?'Loading…':'불러오는 중…'}</p>`;
    if(!this.list.length)return `<p class="rempty">${L?'No public rooms right now — make one!':'지금 열린 공개 방이 없어요 — 방을 만들어 보세요'}</p>`;
    return this.list.map(r=>{const pl=r.status==='playing',n=r.players|0,mx=r.max_players|0,lj=pl&&n<mx&&NET_LATE.includes(r.mode);
      return `<div class="rrow${pl?' play':''}${lj?' late':''}${n>=mx?' full':''}" data-act="mproom" data-v="${esc(String(r.code||''))}"><div class="rh"><b>${esc(r.host_name||'?')}</b><i>${esc(String(r.code||''))}</i></div>
        <span>${esc(MAPDEFS[r.map]?mapName(r.map):(r.map||'?'))}</span><span>${MAPDEFS[r.map]&&MAPDEFS[r.map].ep&&EPS[MAPDEFS[r.map].ep]?(L?'Scenario: ':'시나리오: ')+EPS[MAPDEFS[r.map].ep].n[L]:T(['scen','orig','tdm','ffa','bomb','race'].includes(r.mode)?r.mode:'mut')}</span><span class="rn">${n}/${mx}</span><em${lj?` title="${L?'A match under way: you come in at once, or watch until the next round':'게임 중인 방 — 바로, 또는 관전하다가 다음 라운드부터 함께해요'}"`:''}>${pl?(lj?(L?'Join in':'중간참가'):(L?'Playing':'게임중')):(L?'Waiting':'대기중')}</em></div>`}).join('')+(this.err?`<p class="rempty bad">${esc(this.err)}</p>`:'')},
  render(){const el=$('mpRooms');if(el)el.innerHTML=this.html();const b=document.querySelector('[data-act="mprooms"]');if(b)b.classList.toggle('busy',this.busy)}};
setInterval(()=>{try{ROOMS.tick()}catch(e){console.error(e)}},1000);

// ---------- the connection check (v6.89, the multiplayer menu's 연결 점검) ----------
// A throwaway RTCPeerConnection gathers this device's addresses: a public one (STUN — the network lets UDP out) and relayed ones (the
// site's TURN, by UDP / TCP / TLS). Nothing is sent to anyone; the line says what a friend's page could reach.
const NETCHK={busy:false,res:'',
  wait(){return LI()?'Checking the connection…':'연결 점검 중…'},
  async run(){if(this.busy||typeof RTCPeerConnection!=='function')return;this.busy=true;this.res='';this.draw();
    const o={srflx:false,relay:false,via:new Set()};let pc=null;
    try{await TURN.get(4000);pc=new RTCPeerConnection({iceServers:PJ.ice()});pc.createDataChannel('chk');
      pc.addEventListener('icecandidate',e=>{const c=e.candidate,m=/ typ (srflx|relay)/.exec(c&&c.candidate||'');if(!m)return;
        if(m[1]==='srflx')o.srflx=true;else{o.relay=true;const p=String(c.relayProtocol||'').toUpperCase();if(/^(UDP|TCP|TLS)$/.test(p))o.via.add(p)}});
      await pc.setLocalDescription(await pc.createOffer());
      // (done when gathering is, or a moment after the answers are in: a public address, and a relayed one when there is a relay)
      await new Promise(res=>{const t=setTimeout(res,9000),fin=()=>{clearTimeout(t);res()};pc.addEventListener('icegatheringstatechange',()=>{if(pc.iceGatheringState==='complete')fin()});
        pc.addEventListener('icecandidate',()=>{if(o.srflx&&(o.relay||!TURN.use()))setTimeout(fin,1200)})})}
    catch(e){console.warn('netchk',e&&e.name)}
    try{pc&&pc.close()}catch(e){}
    const L=LI(),via=[...o.via].sort((a,b)=>'UDPTCPTLS'.indexOf(a)-'UDPTCPTLS'.indexOf(b)).join('·');
    const a=L?(o.srflx?'public address found':'no public address'):(o.srflx?'공인 주소 찾음':'공인 주소 못 찾음');
    const r=TURN.use()?(o.relay?(L?'relay server OK':'중계 서버 됨')+(via?' ('+via+')':''):(L?'relay server unreachable — this network blocks it':'중계 서버 안 닿음 — 이 네트워크가 막고 있어요'))
      :TURN.why==='unset'?(L?'relay server not set up yet':'중계 서버 아직 설정 안 됨'):TURN.why==='none'?(L?'no relay server here':'여기선 중계 서버 없음')
      :(L?'could not get the relay server':'중계 서버 정보를 못 받음')+(TURN.why?' ('+TURN.why+')':'');
    this.res=(L?'Check: ':'점검: ')+a+' · '+r;this.busy=false;this.draw()},
  draw(){const el=document.querySelector('#mp .dpFoot .conn');if(el)el.textContent=this.busy?this.wait():this.res||el.textContent;
    const b=document.querySelector('#mp [data-act="mpchk"]');if(b)b.classList.toggle('busy',this.busy)}};

// ---------- screens ----------
UI.mpMenu=function(){const L=LI();const inC=NET.kind==='room',inP=NET.kind==='peerjs',pub=CFG.mpPub!==false,noR=inC||NET.detected&&!NET.kind;
  // (v6.58: a window like the room settings: the name, a room of my own and a code on the left, the open rooms on the right, the link state below)
  const conn=inC?T('mpViaRoom'):inP?NETCHK.busy?NETCHK.wait():NETCHK.res||T('mpViaPJ'):NET.detecting?T('mpChecking'):NET.detected?T('mpNone'):'';
  $('mp').innerHTML=`<div class="win mpw"><div class="dpHead"><b>${T('mp')}</b><span>${L?`Play together · up to ${NET_MAXP}`:`함께 플레이 · 최대 ${NET_MAXP}명`}</span><button class="x" data-act="back">✕</button></div>
    <div class="mpwrap"><div class="mpbox">
    <label>${T('mpName')}</label><input id="mpName" maxlength="14" value="${esc(CFG.mpName||'')}" placeholder="${esc(myName())}" autocomplete="off" spellcheck="false">
    <button data-act="mpcreate" class="big mpgo">${T('mpCreate')}</button>
    ${!noR&&ROOMS.srv()?`<div class="seg mppub"><button data-act="mppub" data-v="1" class="${pub?'on':''}">${L?'Public room':'공개 방'}</button><button data-act="mppub" data-v="0" class="${pub?'':'on'}">${L?'Private':'비공개'}</button></div>
      ${ACC.signed()?'':`<p class="hint mpnote">${L?'Sign in and your room shows up in the list':'로그인하면 방이 목록에 떠요'}</p>`}`:''}
    <label>${T('mpCode')}</label><div class="mprow"><input id="mpCode" maxlength="4" value="${inC?NET_FIXED_CODE:''}" placeholder="${T('mpCodePh')}" autocomplete="off" spellcheck="false"><button data-act="mpjoin">${T('mpJoin')}</button></div>
    ${inC?`<label class="ck${CFG.p2pOnly?' on':''}" data-act="mpp2p"><i></i>${T('mpP2POnly')}</label>`:''}
    <p class="mpmsg" id="mpMsg">${esc(NET.msg||'')}</p></div>
    ${noR?'':`<div class="mprooms"><div class="mprh"><b>${L?'Public rooms':'공개 방 목록'}</b><button class="mini" data-act="mprooms">${L?'Refresh':'새로고침'}</button></div><div id="mpRooms" class="rlist">${ROOMS.html()}</div></div>`}</div>
    <div class="dpFoot"><span class="conn">${esc(conn)}</span>${inP&&typeof RTCPeerConnection==='function'?`<button class="chk${NETCHK.busy?' busy':''}" data-act="mpchk">${L?'Check connection':'연결 점검'}</button>`:''}<button data-act="back">${T('back')}</button></div></div>`;
  const nm=$('mpName');nm.addEventListener('change',()=>{CFG.mpName=nm.value.trim().slice(0,14)||CFG.mpName;saveCfg()});
  const cd=$('mpCode');cd.addEventListener('keydown',e=>{if(e.key==='Enter'){UI.act('mpjoin')}});cd.addEventListener('input',()=>{cd.value=cd.value.toUpperCase().replace(/[^A-Z0-9]/g,'')})};
// (the waiting room itself, UI.mpLobby / UI.mpRender: lobby.js; v6.71 took out the older copies that stood here unused)
UI.mpAct=function(a,v){
  if(a==='mp'){UI.ret=null;UI.show('mp');UI.mpMenu();ROOMS.load();
    // (v6.89: the relay logins are asked for as the menu opens, so they are in hand by the time a room is made or joined)
    if(NET.kind==='peerjs')TURN.get();else if(!NET.kind&&!NET.detecting){NET.detecting=true;netDetect().then(()=>{NET.detecting=false;NET.detected=true;if(NET.kind==='peerjs')TURN.get();if(UI.open==='mp')UI.mpMenu()})}}
  else if(a==='mpchk'){NETCHK.run()}
  else if(a==='mpcreate'||a==='mpjoin'||a==='mproom'){const nm=$('mpName');CFG.mpName=(nm&&nm.value.trim().slice(0,14))||CFG.mpName||(typeof ACC!=='undefined'&&ACC.signed()&&String(ACC.me.nickname||'').slice(0,14))||(LI()?'Player':'플레이어')+Math.floor(Math.random()*90+10);saveCfg();
    if(NET.on)return;if(a==='mpcreate')NET.create();else if(a==='mproom'){const cd=$('mpCode');if(cd)cd.value=v||'';NET.join(v)}else NET.join(($('mpCode')||{}).value)}
  else if(a==='mppub'){CFG.mpPub=v!=='0';saveCfg();for(const b of document.querySelectorAll('[data-act="mppub"]'))b.classList.toggle('on',(b.dataset.v!=='0')===CFG.mpPub)}
  else if(a==='mprooms'){ROOMS.load()}
  else if(a==='mpleave'){NET.leave();NET.msg='';Main.toTitle();UI.act('mp')}
  else if(a==='mpstart'){NET.start()}
  else if(a==='mpp2p'){CFG.p2pOnly=!CFG.p2pOnly;saveCfg();UI.mpMenu()}
  else if(a==='mpset'&&NET.host){const [k,val]=v.split(':');NET.lob.cfg[k]=isNaN(+val)?val:+val;if(k==='map'&&MAPDEFS[val])loadMapUI(val);netLobbyCast()}
  else if(a==='mpme'){const [k,val]=v.split(':');CFG[k]=val;saveCfg();if(NET.host)netLobbyCast();else{netToHost(netHello());UI.mpLobby()}}
  else if(a==='mpcopy'){const b=document.querySelector('[data-act="mpcopy"]');const ok=()=>{if(b)b.textContent=T('mpCopied')};
    const sel=()=>{const el=document.querySelector('.mpcode');if(el){const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r)}};
    try{navigator.clipboard.writeText(NET.code).then(ok,sel)}catch(e){sel()}}
  else if(a==='mplobby'&&NET.host){netToLobby()}
  // 방장 넘기기: the first tap asks, a second within 3 s hands the room over
  else if(a==='mpgive'){if(!NET.host)return true;const b=[...document.querySelectorAll('#lobby [data-act="mpgive"]')].find(e=>e.dataset.v===v);
    if(b&&!b.classList.contains('ask')){for(const o of document.querySelectorAll('#lobby [data-act="mpgive"].ask')){o.classList.remove('ask');o.textContent=T('mpGive')}
      b.classList.add('ask');b.textContent=T('mpGiveQ');clearTimeout(b._t);b._t=setTimeout(()=>{if(b.isConnected){b.classList.remove('ask');b.textContent=T('mpGive')}},3000)}
    else NET.give(v)}
  else return false;return true};

// ---------- in-game overlays: connection line, friends' name tags ----------
const NTAG={pool:[],used:0};
function netHud(dt){const el=$('hNet');if(!el)return;if(!NET.on||NET.ui!=='game'){el.style.display='none';return}el.style.display='block';
  NET.hudT=(NET.hudT||0)-dt;if(NET.hudT<=0){NET.hudT=.5;let s;if(NET.host)s=`${T('mpHost')} · ${NET.lob.pl.length}${LI()?'P':'명'}`;else{const L=NET.links.get(NET.hostKey);s=L?`${L.kind==='relay'?T('mpRelay'):L.via==='turn'?T('mpTurn'):T('mpDirect')} · ${Math.round(L.rtt||(G.player&&G.player.ping)||0)}ms`:'…'}
    if(el.textContent!==s)el.textContent=s}
  // names over other players (not bots) within sight
  const lay=$('dmgLayer');if(!lay)return;let n=0;const P=G.player,cam=R.cam.position,W=innerWidth,H=innerHeight;
  for(const a of G.actors){if(!a.net||a.isPlayer||!a.alive||!a.ch||!a.ch.grp.visible)continue;const hx=a.head.x,hy=a.head.y+.38,hz=a.head.z;const d=Math.hypot(hx-cam.x,hy-cam.y,hz-cam.z);if(d>45)continue;
    if(P&&P.team!==a.team&&d>14)continue;if(a.team===TZ&&a.zc==='runner'&&a.skillT>0)continue;
    _dn.set(hx,hy,hz).project(R.cam);if(_dn.z>1||Math.abs(_dn.x)>1.1||Math.abs(_dn.y)>1.1)continue;
    if(Math.abs(_dn.x)<.06&&Math.abs(_dn.y)<.3)continue;// the crosshair readout already names whoever is under it
    if(!losClear(cam.x,cam.y,cam.z,hx,hy-.3,hz))continue;
    let e=NTAG.pool[n];if(!e){e=document.createElement('div');e.className='ntag';lay.appendChild(e);NTAG.pool.push(e)}n++;
    const tt=TTL.of(a),t=a.name+'|'+(tt||'');if(e.dataset.t!==t){e.dataset.t=t;e.innerHTML=tt?TTL.tag(tt)+esc(a.name):esc(a.name)}// (v6.57: the title worn, ach.js)
    const cn='ntag'+(a.team===TZ?' z':'')+(tt?(TTL.isHof(tt)?' hof':' tt'):'');if(e.className!==cn)e.className=cn;e.style.display='block';
    e.style.transform=`translate(${((_dn.x*.5+.5)*W).toFixed(1)}px,${((-_dn.y*.5+.5)*H).toFixed(1)}px) translate(-50%,-100%)`;e.style.opacity=clamp(1.3-d/45,.35,1).toFixed(2)}
  for(let i=n;i<NTAG.pool.length;i++)NTAG.pool[i].style.display='none'}

addEventListener('pagehide',()=>{ROOMS.down(true);if(NET.on)NET.leave()});
// ---------- keep running in a background tab: a worker ticks while requestAnimationFrame sleeps ----------
(function(){let w=null;try{const src='setInterval(()=>postMessage(0),50)';w=new Worker(URL.createObjectURL(new Blob([src],{type:'text/javascript'})))}catch(e){w=null}
  // browsers stop animation frames for hidden or covered windows; the game keeps stepping (without drawing) so friends never freeze
  const tick=()=>{const now=netNow();if(NET.on&&window.__ready&&now-(Main.lastRaf||0)>150&&now-(NET.lastTick||0)>40){NET.lastTick=now;Main.step(now,false)}};
  if(w)w.onmessage=tick;setInterval(tick,50)})();
