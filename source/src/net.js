'use strict';
// ============ Multiplayer: friends-only, host-authoritative, peer-to-peer ============
// The room creator's browser is the host: it runs the bots, the round flow, health, infection and money. Every player moves
// their own character and judges their own shots (hit claims go to the host). Data travels on WebRTC data channels:
// 'r' (reliable, ordered) for events and 'u' (unordered, no retransmits) for the 20 Hz state stream.
// Signalling: inside claude.ai the artifact's room (each page's presence carries a compact SDP); in the standalone file the free
// PeerJS cloud server. If no direct connection can be made inside claude.ai, the room itself relays the traffic.
const NET={on:false,host:false,cli:false,ghost:0,ev:0,kind:null,api:null,code:'',me:'',hostKey:'',ui:'',
  links:new Map(),out:new Map(),inQ:[],fx:[],fxQ:[],hits:[],off:new Map(),ids:new Map(),
  lob:{cfg:{mode:'mut',bots:8,diff:1,rounds:7,time:180},pl:[]},k:0,lastK:0,tAcc:0,msg:'',hostTs:0,hostRx:0,netT:0};
const NET_HZ=20,NET_DELAY=110,NET_MAXP=8;
const ICE={iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']},{urls:'stun:stun.cloudflare.com:3478'}]};
const ST_L=['menu','prep','fight','end','over'],ZI=Object.fromEntries(ZALL.map((k,i)=>[k,i]));
let WL=[],WI={},NET_VER='';// filled once every weapon is registered (hooks in other files read WI even when offline)
function netTables(){if(WL.length)return;WL=Object.keys(WPN);WI={};WL.forEach((k,i)=>WI[k]=i);NET_VER='qz5-'+WL.length+'-m'+MAPLIST().join('')+'-r5'}// r3: Italy rebuilt on two levels (map geometry must match between peers)
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
  mpBad:'코드는 4자리예요',mpNatPJ:'직접 연결이 안 돼요 (공유기/방화벽이 막음) — 서로 다른 인터넷이면 claude.ai 링크로 접속하세요. 거기선 안 될 때 자동으로 중계해요',mpP2POnly:'P2P로만 연결 (claude 중계 안 씀)',mpP2PFail:'P2P 직접 연결에 실패했어요',mpP2PHost:'방장이 P2P 전용으로 설정했는데 직접 연결에 실패했어요',mpPaused:'멀티플레이 중에는 게임이 멈추지 않아요',mpNoRoom:'이 화면에서는 방에 연결할 수 없어요 — claude.ai에 로그인한 채로, 공유받은 링크로 열어 주세요'});
Object.assign(STR.en,{mp:'Multiplayer',mpName:'Nickname',mpCreate:'Create room',mpJoin:'Join',mpCode:'Join with a room code',mpCodePh:'4-letter code',
  mpChecking:'Checking how to connect…',mpNone:'Multiplayer is not available here (open the claude.ai link, or the file with internet access)',
  mpViaRoom:'Connects inside this claude.ai link — friends must open the same shared link while signed in',mpViaPJ:'Connects through the free PeerJS server — friends must open the same file (same version)',
  mpConnecting:'Connecting…',mpNotFound:'Room not found — check the code',mpFull:'The room is full',mpInGame:'That room is already playing',mpVer:'Different game version — open the same link/file',
  mpHostGone:'Lost the connection to the host',mpFail:'Could not connect',mpLobby:'Lobby',mpPlayers:'Players',mpStart:'Start',mpWait:'Waiting for the host to start…',mpLeave:'Leave',
  mpCopy:'Copy code',mpCopied:'Copied',mpBots:'Bots',mpJoined:n=>`${n} joined`,mpLeft:n=>`${n} left — a bot takes over`,mpLeftL:n=>`${n} left`,
  mpDirect:'P2P direct',mpRelay:'claude relay',mpHost:'Host',mpToLobby:'Back to lobby',mpCodeIs:'Room code',mpShare:'Give your friends the code',mpMe:'you',mpSet:'Match settings',mpOnlyHost:'The host picks the settings',
  mpBad:'Codes have 4 letters',mpNatPJ:'No direct connection (a router or firewall blocks it) — on different networks, use the claude.ai link instead: it relays automatically when this fails',mpP2POnly:'P2P only (never use the claude relay)',mpP2PFail:'Could not make a direct P2P connection',mpP2PHost:'The host allows P2P only and a direct connection failed',mpPaused:'The game keeps running in multiplayer',mpNoRoom:'This view cannot join rooms — open the shared link while signed in to claude.ai'});

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
      if(P.rq&&!CFG.p2pOnly){const L=NET.links.get(k);if(!L||L.kind!=='relay')netUseRelay(k,typeof P.rq==='string'?P.rq:'peer')}
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

// ---------- signalling through PeerJS (standalone file) ----------
const PJ={peer:null,
  // the free PeerJS cloud (its default STUN/TURN servers included); always over TLS, even when this file is opened from disk
  // more STUN servers than PeerJS's default (one) so a public address is found on more networks; PeerJS's own TURN kept, over UDP and TCP
  opts(){return Object.assign({debug:0,secure:true,config:{iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302','stun:stun2.l.google.com:19302']},{urls:'stun:stun.cloudflare.com:3478'},
    {urls:['turn:eu-0.turn.peerjs.com:3478','turn:us-0.turn.peerjs.com:3478','turn:eu-0.turn.peerjs.com:3478?transport=tcp','turn:us-0.turn.peerjs.com:3478?transport=tcp'],username:'peerjs',credential:'peerjsp'}],sdpSemantics:'unified-plan'}},window.__peerOpts||{})},
  host(){return new Promise((res,rej)=>{let done=false;const p=new Peer('qzg-'+NET.code.toLowerCase(),this.opts());this.peer=p;
    p.on('open',id=>{done=true;NET.me=id;res()});p.on('connection',c=>{let L=NET.links.get(c.peer);if(!L||L.kind!=='p2p'){L=pjLink(c.peer);NET.links.set(c.peer,L)}L.attach(c)});
    p.on('error',e=>{if(!done)rej(e);else console.warn('peerjs',e.type)});p.on('disconnected',()=>{try{p.reconnect()}catch(e){}})})},
  join(){return new Promise((res,rej)=>{let done=false;const p=new Peer(this.opts());this.peer=p;
    p.on('open',id=>{NET.me=id;const hk='qzg-'+NET.code.toLowerCase();NET.hostKey=hk;const L=pjLink(hk);NET.links.set(hk,L);
      L.attach(p.connect(hk,{label:'r',reliable:true,serialization:'raw'}));L.attach(p.connect(hk,{label:'u',reliable:false,serialization:'raw'}));
      // a relayed (TURN) path can take a while to come up: wait longer, then say what got stuck
      setTimeout(()=>{if(done)return;done=true;let st='';try{const pc=L.r&&L.r.peerConnection;st=pc?pc.iceConnectionState:''}catch(e){}rej({type:st==='checking'||st==='failed'||st==='disconnected'?'nat':'timeout'})},25000);L.onUp=()=>{done=true;res()}});
    p.on('error',e=>{if(!done){done=true;rej(e)}else console.warn('peerjs',e.type)})})},
  close(){if(this.peer)try{this.peer.destroy()}catch(e){}this.peer=null}};

// ---------- link lifecycle ----------
function netLinkUp(L){if(L.onUp)L.onUp();
  // the handshake is done: clear it from the room presence (it is small, but many friends at once would not fit)
  if(NET.kind==='room'&&L.kind==='p2p'){if(NET.host)RSIG.setSig(L.key,null);else RSIG.set({sig:null})}
  if(NET.cli){NET.msg='';netSend(L.key,{t:'hello',v:NET_VER,n:CFG.mpName,s:CFG.skin,z:CFG.zclass});UI.mpRender&&UI.mpRender()}}
function netLinkDown(L,why){if(L.dead)return;console.warn('net: link down',L.kind,why);L.dead=true;L.ok=false;try{L.close()}catch(e){}
  if(NET.links.get(L.key)!==L)return;NET.links.delete(L.key);NET.out.delete(L.key);if(!NET.on)return;
  if(NET.cli){if(L.key===NET.hostKey)netFatal(NET.ui==='game'||NET.ui==='lobby'?T('mpHostGone'):T('mpFail'))}
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
function netRx(L,data,rel){if(typeof data!=='string')return;let m;try{m=JSON.parse(data)}catch(e){return}
  if(rel){if(Array.isArray(m))for(const x of m)if(x&&typeof x.t==='string')NET.inQ.push([L,x,true])}else if(m&&typeof m==='object')NET.inQ.push([L,m,false])}
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
  if(NET.ui==='game'){netPost();if(NET.cli&&NET.hits.length){netToHost({t:'h',L:NET.hits});NET.hits=[]}
    if(NET.host)for(const a of G.actors)if(a.skPend){if(G.t>a.skPend||!a.alive||a.team!==TZ)a.skPend=0;else if(a.skillCD<=0){a.skPend=0;useSkill(a)}}
    NET.tAcc+=dt;if(NET.tAcc>=1/NET_HZ){NET.tAcc=Math.min(NET.tAcc-1/NET_HZ,.1);if(NET.host)netHostTick();else netCliTick()}}
  netFlushR();
  if(NET.kind==='room'){RSIG.flushT-=dt;if(RSIG.flushT<=0){RSIG.flushT=1/NET_HZ;RSIG.flush()}}
  // a page that went quiet for too long is gone
  NET.netT+=dt;if(NET.netT>1){NET.netT=0;const now=netNow();for(const L of [...NET.links.values()])if(L.ok&&now-L.lastRx>(NET.toMs||(L.kind==='relay'?15000:10000)))netLinkDown(L,'timeout');
    if(NET.host){netAll({t:'ping',h:Math.round(now)});if(NET.ui==='lobby'&&(NET.lobT=(NET.lobT||0)+1)%2===0)netLobbyCast()}}};
function netSafe(f){try{f()}catch(e){console.error(e)}}

// ---------- the host's tick ----------
function netHostTick(){NET.k++;const o={k:NET.k,ts:Math.round(netNow()),g:[ST_L.indexOf(G.st),Math.round(G.time*10),G.round,G.score[0],G.score[1],G.moraleLvl,G.hostN],A:(G.mode==='scen'?SCEN.H:G.actors).map(netEncA),f:NET.fx};
  if(NET.k%10===0)o.S=(G.mode==='scen'?SCEN.H:G.actors).map(a=>[a.id,a.kills,a.infects,a.deaths,Math.round(a.score),Math.round(a.dmgDealt),Math.round(a.dmgRound||0),a.net&&NET.links.get(a.net)?Math.round(NET.links.get(a.net).rtt):-1]);
  if(G.mode==='scen'&&SCEN.on){o.Z=SCEN.encZ(NET.k);o.sc=SCEN.encState()}
  const s=JSON.stringify(o);NET.fx=[];for(const L of NET.links.values())if(L.ok&&L.inGame)L.send(s,false);if(NET.kind==='room')RSIG.flush()}
function netCliTick(){NET.k++;const P=G.player;const o={k:NET.k,ts:Math.round(netNow()),f:NET.fx};if(NET.hostTs)o.e=[NET.hostTs,Math.round(netNow()-NET.hostRx)];if(P)o.s=netEncSelf(P);NET.fx=[];
  const L=NET.links.get(NET.hostKey);if(L&&L.ok)L.send(JSON.stringify(o),false);if(NET.kind==='room')RSIG.flush()}
// a client's 20 Hz state on the host
function netOnState(L,m){if(m.t)return;if(!(m.k>L.lastK))return;L.lastK=m.k;const now=netNow();
  if(Array.isArray(m.e)&&m.e[0]>0){const r=now-m.e[0]-(m.e[1]||0);if(r>=0&&r<10000){L.srtt=lerp(L.srtt||r,r,.2);L.rtt=L.srtt}}
  if(NET.ui!=='game')return;const a=actorOfKey(L.key);if(!a)return;netClock(L.key,m.ts,now);a.nsrc=L.key;
  const s=m.s;if(s&&s.length>=13){const r={x:s[0]/100,y:s[1]/100,z:s[2]/100,vx:s[3]/100,vz:s[4]/100,yaw:s[5]/1000,pitch:s[6]/1000,F:s[7],cur:s[8]};a.nraw=r;
    netSample(a,m.ts,r.x,r.y,r.z,r.vx,r.vz,r.yaw,r.pitch,r.F,r.cur);a.frozen=s[9]/10;a.rootT=s[10]/10;a.nyFree=s[11]|0;a.zpick=ZLIST[s[12]]||a.zpick}
  for(const f of netFxList(L,m)){if(!Array.isArray(f)||f[1]!==a.id)continue;netQueueFx(a,f);NET.fx.push(f);
    if(f[0]==='n'&&a.inv&&a.inv[f[2]]>0)a.inv[f[2]]--}}
// the host's snapshot on a client
function netOnSnap(L,m){if(m.t||!(m.k>NET.lastK))return;NET.lastK=m.k;const now=netNow();NET.hostTs=m.ts;NET.hostRx=now;netClock('h',m.ts,now);
  if(NET.ui!=='game')return;const g=m.g;if(g){G.time=g[1]/10;if(g[5]>G.moraleLvl&&G.mode==='mut'){HUD.announce(T('moraleUp',g[5]*10),'h',2.2);if(G.player&&G.player.team===TH)AU.play('morale',{vol:.55})}G.moraleLvl=g[5];G.hostN=g[6]}
  const P=G.player;
  for(const e of m.A||[]){const a=byId(e[0]);if(!a)continue;const F=e[8];const same=((F&2)?TZ:TH)===a.team&&!!(F&1)===a.alive;
    if(a===P){if(!same)continue;const hp0=P.hp,ar0=P.armor;P.hp=e[10];P.armor=e[11];P.maxHp=e[12];P.lvl=e[13];P.money=e[18];P.skillT=e[15]/10;P.skillCD=e[19]/10;P.host=!!(F&16);
      if(P.alive&&P.hp<hp0-.5){const d=hp0-P.hp;if(P.team===TZ)HUD.hurt(clamp(d/600,.15,.8));else{HUD.hurt(clamp(d/40,.25,1));FX.shake=Math.max(FX.shake,.3);AU.play('hurt',{vol:.7})}}
      else if(P.alive&&P.team===TH&&P.armor<ar0-.5){HUD.hurt(.5);AU.play('armor',{vol:.5})}
      continue}
    netSample(a,m.ts,e[1]/100,e[2]/100,e[3]/100,e[4]/100,e[5]/100,e[6]/1000,e[7]/1000,F,e[9]);a.nsrc='h';if(!same)continue;
    a.hp=e[10];a.armor=e[11];a.maxHp=e[12];a.lvl=e[13];a.skillT=e[15]/10;a.frozen=e[16]/10;a.rootT=e[17]/10;a.money=e[18];a.skillCD=e[19]/10;a.host=!!(F&16);
    a.permaDead=!!(F&2048);a.burnT=F&8192?Math.max(a.burnT||0,.3):0;
    if(a.team===TZ){const zc=ZALL[e[14]]||a.zc;if(zc!==a.zc){a.zc=zc;setHull(a);ensureRig(a)}}}
  if(G.mode==='scen'){if(m.Z)SCEN.decZ(m.Z,m.ts);if(m.sc)SCEN.decState(m.sc)}
  if(m.S)for(const s of m.S){const a=byId(s[0]);if(!a)continue;a.kills=s[1];a.infects=s[2];a.deaths=s[3];a.score=s[4];a.dmgDealt=s[5];a.dmgRound=s[6];a.ping=s[7]}
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
  const og=!!(F&8);c.onGround=og;a.airT=og?0:a.airT+dt;a.flash=!!(F&32);a.nv=!!(F&64);a.cmd.walk=!!(F&128);a.zoom=F&1024?1:0;a.spinV=F&16384?1:0;
  if(a.team===TH&&S.cur>=0&&WL[S.cur]&&a.cur!==WL[S.cur]&&WPN[WL[S.cur]].kind!=='claw')equip(a,WL[S.cur],true);
  else if(a.team===TZ&&a.cur!=='claw'&&a.cur!=='zbomb')equip(a,'claw',true);
  const W=WPN[a.cur]||{};
  if(F&256&&W.mag){if(!a.nRel){a.nRel=1;a.relKind=W.shellRel?'shell':'mag';a.reloadT=W.shellRel||W.reload||2;AU.at('magout',c.x,c.y+1.2,c.z,{vol:.4,range:15})}
    else{a.reloadT=Math.max(0,a.reloadT-dt);if(a.reloadT===0)a.reloadT=a.relKind==='shell'?W.shellRel:.001}}
  else if(a.nRel||a.relKind){a.nRel=0;a.reloadT=0;a.relKind=null}
  a.kick=Math.max(0,a.kick-dt*6);a.punchP*=Math.exp(-dt*7);a.punchY*=Math.exp(-dt*7);a.recoilSpread*=Math.exp(-dt*4.5);
  // the Ripper grinding: replayed from the owner's trigger, harmless here
  if(a.cur==='ripper'&&a.team===TH){if(!a.ammo.ripper)a.ammo.ripper={mag:999,res:0};a.ammo.ripper.mag=999;a.cmd.fire=!!(F&512);a.cmd.alt=false;a.drawT=0;NET.ghost++;try{sawUpdate(a,WPN.ripper,dt)}finally{NET.ghost--}a.pc.alt=false}
  // footsteps from the replayed motion
  const hs=Math.hypot(c.vx,c.vz);if(og&&hs>1.5){a.stepAcc+=hs*dt;if(a.stepAcc>(a.team===TZ?1.7:1.9)){a.stepAcc=0;footstep(a)}}}

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
const EFF_T=[['frozen','fz'],['holdT','hd'],['staggerT','st'],['dizzy','dz'],['shriekT','sh'],['rootT','rt']];
function netPre(){for(const a of G.actors){if(!a.pup||!a.alive){a._ef=null;continue}a.kvx=a.kvz=0;a.c.vy=0;const e=a._ef||(a._ef={});for(const [f] of EFF_T)e[f]=a[f]||0;e.burnT=a.burnT||0}}
function netPost(){for(const a of G.actors){const e0=a._ef;if(!e0||!a.pup||!a.alive)continue;const e={t:'eff',i:a.id};let any=false;
    if(Math.abs(a.kvx)>.01||Math.abs(a.kvz)>.01){e.kx=r2(a.kvx);e.kz=r2(a.kvz);any=true}
    if(a.c.vy>.01){e.up=r2(a.c.vy);any=true}
    for(const [f,k] of EFF_T){if((a[f]||0)>e0[f]+.05){e[k]=r1(a[f]);any=true}}
    if(NET.cli&&(a.burnT||0)>e0.burnT+.05&&a.burnSrc===G.player){e.bt=r1(a.burnT);e.bw=WI[a.burnW]??-1;any=true}
    a.kvx=a.kvz=0;a.c.vy=0;if(!any)continue;
    if(NET.host){if(a.net&&NET.links.has(a.net))netSend(a.net,e)}else netToHost(e)}}
function netApplyEff(a,e,src){if(!a||!a.alive)return;
  if(e.fz){a.frozen=Math.max(a.frozen,e.fz/10);a.c.vx=a.c.vz=0;a.mvx=a.mvz=a.kvx=a.kvz=0}
  if(e.rt){a.rootT=Math.max(a.rootT||0,e.rt/10);a.c.vx=a.c.vz=0;a.mvx=a.mvz=a.kvx=a.kvz=0}
  if(e.kx||e.kz){a.kvx+=(e.kx||0)/100;a.kvz+=(e.kz||0)/100}
  if(e.up){a.c.vy=Math.max(a.c.vy,e.up/100);a.c.onGround=false;a.c.jumped=true}
  if(e.hd)a.holdT=Math.max(a.holdT||0,e.hd/10);if(e.st)a.staggerT=Math.max(a.staggerT,e.st/10);if(e.dz)a.dizzy=Math.max(a.dizzy,e.dz/10);if(e.sh)a.shriekT=Math.max(a.shriekT,e.sh/10);
  if(e.bt&&src&&a.team===TZ){a.burnT=Math.max(a.burnT||0,e.bt/10);a.burnSrc=src;a.burnW=WL[e.bw]||'bdc'}
  if(a.isPlayer&&e.dz)FX.shake=Math.max(FX.shake,.5)}
// a hit this page saw on someone it does not own: shown at once, judged by the host
function netClaimHit(t,dmg,src,o){if(!G.player||src!==G.player||!t||!t.alive||t.team===TH)return 0;
  NET.hits.push([t.id,Math.round(dmg),WI[o.w]??-1,(o.hs?1:0)|(o.knife?2:0)|(o.heavy?4:0)|(o.he?8:0)|(o.blunt?16:0),o.dir?r2(o.dir[0]):0,o.dir?r2(o.dir[1]):0,o.dir?r2(o.dir[2]):0,r1(o.kb),r2(o.stag),r2(o.x),r2(o.y),r2(o.z),r1(o.up)]);
  const d=dmg*(1+.1*G.moraleLvl)*(src.wup&&src.wup[o.w]?1+.1*src.wup[o.w]:1),ab=Math.min(Math.max(0,t.armor),d*.5),dealt=Math.max(0,Math.min(d-ab,Math.max(0,t.hp))+ab);
  t.an.flinch=Math.min(1,t.an.flinch+.35);if(t.ch)t.ch.mat.uniforms.uFlash.value=Math.min(.35,t.ch.mat.uniforms.uFlash.value+.12);
  HUD.dmgNum(t,dealt,!!o.hs,false);if(!AU.throttle('zp'+t.id,350))AU.at('zpain',t.c.x,t.c.y+1.5,t.c.z,{vol:.7});return dealt}

// ---------- host: handlers for what clients send ----------
const HOSTH={
  hello(L,m){if(m.v!==NET_VER){netSend(L.key,{t:'bye',why:'ver'});return}
    if(NET.ui==='game'&&!actorOfKey(L.key)){netSend(L.key,{t:'bye',why:'ingame'});return}
    let p=NET.lob.pl.find(p=>p.k===L.key);if(!p){if(NET.lob.pl.length>=NET_MAXP){netSend(L.key,{t:'bye',why:'full'});return}p={k:L.key};NET.lob.pl.push(p);HUD.note(T('mpJoined',String(m.n||'?').slice(0,14)),2.5);AU.play('uiok',{vol:.4})}
    p.n=String(m.n||'?').slice(0,14);p.s=HSKINS.includes(m.s)?m.s:'guard';p.z=ZLIST.includes(m.z)?m.z:'rager';L.name=p.n;netLobbyCast()},
  ping(L){},
  pong(L,m){if(m.h&&!(L.srtt&&NET.ui==='game'))L.rtt=lerp(L.rtt||0,Math.max(0,netNow()-m.h),L.rtt?.3:1)},
  bye(L){netLinkDown(L,'bye')},
  h(L,m){const src=actorOfKey(L.key);if(!src||!Array.isArray(m.L))return;for(const h of m.L){const t=byId(h[0]);if(!t||!t.alive||t.team!==TZ)continue;const f=h[3];
    damageActor(t,clamp(+h[1]||0,0,5000),src,{w:WL[h[2]]||'',hs:!!(f&1),knife:!!(f&2),heavy:!!(f&4),he:!!(f&8),blunt:!!(f&16),dir:[h[4]/100,h[5]/100,h[6]/100],kb:h[7]/10,stag:h[8]/100,x:h[9]/100,y:h[10]/100,z:h[11]/100,up:h[12]/10})}},
  claw(L,m){const a=actorOfKey(L.key),t=byId(m.i);if(!a||!t||!a.alive||a.team!==TZ||!t.alive||t.team!==TH)return;clawApply(a,t,!!m.h)},
  fall(L,m){const a=actorOfKey(L.key);if(a&&a.alive&&a.team===TH)hurtHuman(a,clamp(+m.d||0,0,500),null,{fall:1})},
  eff(L,m){const src=actorOfKey(L.key),t=byId(m.i);if(t&&src)netApplyEff(t,m,src)},
  buy(L,m){const a=actorOfKey(L.key);const ok=!!(a&&buy(a,m.w));netSend(L.key,{t:ok?'buyok':'buyno',w:m.w})},
  // a skill pressed just before the cooldown ends (the client's view of it lags a little) fires the moment it is ready
  sk(L){const a=actorOfKey(L.key);if(!a||!a.alive||a.team!==TZ)return;if(a.skillCD>0&&a.skillCD<.6)a.skPend=G.t+.7;else useSkill(a)}};
// ---------- client: handlers for what the host sends ----------
function netWithEv(f){NET.ev++;try{f()}finally{NET.ev--}}
const CLIH={
  lobby(L,m){if(!m.lob||!Array.isArray(m.lob.pl))return;NET.lob=m.lob;const mp=m.lob.cfg&&m.lob.cfg.map;if(NET.ui!=='game'&&MAPDEFS[mp]&&MAP.id!==mp&&MAP.want!==mp)loadMapUI(mp);if(NET.ui!=='game'){const was=NET.ui;NET.ui='lobby';if(was!=='lobby'||UI.open!=='lobby')UI.mpLobby();else UI.mpRender()}},
  ping(L,m){netToHost({t:'pong',h:m.h})},
  bye(L,m){netFatal(m.why==='full'?T('mpFull'):m.why==='ingame'?T('mpInGame'):m.why==='ver'?T('mpVer'):T('mpHostGone'))},
  start(L,m){netBegin(m.cfg,m.ro)},
  round(L,m){netWithEv(()=>startRound(m))},
  hosts(L,m){for(let i=0;i<m.i.length;i++){const a=byId(m.i[i]);if(a)a.zpick=a.isPlayer?a.zpick:m.z[i]}netWithEv(()=>selectHosts(m.i));G.st='fight';G.time=G.roundTime},
  infect(L,m){const t=byId(m.i);if(!t||t.team!==TH)return;if(!t.isPlayer)t.zpick=m.z;netWithEv(()=>infect(t,byId(m.s)))},
  kill(L,m){const t=byId(m.i);if(!t||!t.alive)return;netWithEv(()=>killZombie(t,byId(m.s),{w:m.w,hs:!!m.hs,dir:m.d?[m.d[0]/100,m.d[1]/100,m.d[2]/100]:null,knife:!!m.k,heavy:!!m.h,he:!!m.he}))},
  hdie(L,m){const t=byId(m.i);if(!t||!t.alive||t.team!==TH)return;netWithEv(()=>hurtHuman(t,1e6,byId(m.s),{}))},
  rv(L,m){const a=byId(m.i);if(!a)return;if(!a.isPlayer)a.zpick=m.z;a.nb=null;netWithEv(()=>reviveZombie(a,m.at?[m.at[0]/100,m.at[1]/100,m.at[2]/100]:null,m.rs))},
  end(L,m){netWithEv(()=>endRound(m.w));G.score=m.sc.slice(0,2);G.st='end';G.endT=6},
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
function netHandle(L,m){const H=NET.host?HOSTH:CLIH;const f=H[m.t];if(f)f(L,m)}

// ---------- lobby ----------
function netLobbyCast(){if(!NET.host)return;const me=NET.lob.pl[0];if(me){me.n=CFG.mpName;me.s=CFG.skin;me.z=CFG.zclass}
  for(const p of NET.lob.pl){const L=NET.links.get(p.k);p.p=L?Math.round(L.rtt):0;p.r=L&&L.kind==='relay'?1:0}
  netAll({t:'lobby',lob:NET.lob});UI.mpRender&&UI.mpRender()}
const NET_FIXED_CODE='1234';
NET.create=async function(){netTables();const kind=await netDetect();if(!kind){NET.msg=T('mpNone');UI.mpRender();return}
  NET.on=true;NET.host=true;NET.cli=false;NET.ui='lobby';NET.links.clear();NET.out.clear();NET.inQ=[];NET.msg=T('mpConnecting');
  NET.lob={cfg:Object.assign({mode:CFG.mode,bots:8,diff:CFG.diff,rounds:CFG.rounds,time:CFG.time,blackout:1},CFG.mpCfg||{}),pl:[]};if(!MAPDEFS[NET.lob.cfg.map])NET.lob.cfg.map=MAPDEFS[CFG.map]?CFG.map:'q7';if(MAP.id!==NET.lob.cfg.map)loadMapUI(NET.lob.cfg.map);
  // the room code is always the same (NET_FIXED_CODE): friends just press create / join. If a room with it is already open, join that one instead.
  NET.code=NET_FIXED_CODE;try{if(kind==='room'){NET.me='k'+netKey(9);await RSIG.open()}else await PJ.host()}
  catch(e){PJ.close();NET.on=false;NET.ui='';
    if(e&&e.type==='unavailable-id'){NET.msg=LI()?'Room '+NET_FIXED_CODE+' is already open — joining it':NET_FIXED_CODE+' 방이 이미 열려 있어서 그 방에 참가합니다';UI.mpRender();setTimeout(()=>NET.join(NET_FIXED_CODE),600);return}
    NET.msg=T('mpFail')+(e&&e.type?' ('+e.type+')':'');UI.mpRender();return}
  NET.lob.pl=[{k:NET.me,n:CFG.mpName,s:CFG.skin,z:CFG.zclass,h:1}];NET.msg='';UI.mpLobby()};
NET.join=async function(code){netTables();code=String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');if(code.length!==4){NET.msg=T('mpBad');UI.mpRender();return}
  const kind=await netDetect();if(!kind){NET.msg=T('mpNone');UI.mpRender();return}
  NET.on=true;NET.host=false;NET.cli=true;NET.ui='join';NET.code=code;NET.hostKey='';NET.links.clear();NET.out.clear();NET.inQ=[];NET.lastK=0;NET.msg=T('mpConnecting');UI.mpRender();
  NET.forceRelay=/[?&]relay=1/.test(location.search);NET.p2pRetry=0;NET.hostP2P=false;NET.relayWhy='';
  try{if(kind==='room'){NET.me='k'+netKey(9);await RSIG.open();setTimeout(()=>{if(NET.on&&NET.cli&&!NET.hostKey)netFatal(T('mpNotFound'))},8000)}
    else await PJ.join()}
  catch(e){netFatal(e&&e.type==='peer-unavailable'?T('mpNotFound'):e&&(e.type==='nat'||e.type==='timeout')?T('mpNatPJ'):T('mpFail')+(e&&e.type?' ('+e.type+')':''))}};
NET.leave=function(){if(!NET.on)return;netAll({t:'bye'});netFlushR();if(NET.kind==='room'){RSIG.dirty=true;RSIG.flush()}
  const links=[...NET.links.values()];NET.links.clear();const kind=NET.kind;
  setTimeout(()=>{for(const L of links)try{L.dead=true;L.close()}catch(e){}if(kind==='room')RSIG.close();else PJ.close()},150);
  NET.on=NET.host=NET.cli=false;NET.ui='';NET.out.clear();NET.inQ=[];NET.fx=[];NET.fxQ=[];NET.hits=[];NET.ids.clear();NET.hostKey=''};
function netFatal(msg){console.warn('net: end',msg);const wasGame=NET.ui==='game';NET.leave();NET.msg=msg;if(wasGame||G.st!=='menu'){Main.toTitle();UI.act('mp')}else UI.act('mp');setTimeout(()=>{NET.msg=msg;UI.mpRender&&UI.mpRender()},30)}
NET.start=function(){if(!NET.host||NET.ui!=='lobby')return;const cfg=Object.assign({},NET.lob.cfg);CFG.mpCfg=cfg;saveCfg();
  const ro=[];let id=0;for(const p of NET.lob.pl)ro.push([id++,p.n,p.s,p.z,p.k]);const names=shuffle(BOT_NAMES.slice());const nb=cfg.mode==='scen'?Math.max(0,Math.min(cfg.bots|0,NET_MAXP-NET.lob.pl.length)):cfg.bots;for(let i=0;i<nb;i++)ro.push([id++,names[i%names.length],rpick(HSKINS),rpick(ZLIST),'']);
  if(cfg.mode==='scen')for(let i=0;i<=SCEN.POOL;i++)ro.push([id++,'Z','guard','rager','',1]);
  for(const L of NET.links.values())L.inGame=NET.lob.pl.some(p=>p.k===L.key);
  netEv('start',{cfg,ro});netBegin(cfg,ro)};
// every page builds the same actors from the host's roster
function netBegin(cfg,ro){netTables();AU.init();MAP.want=MAPDEFS[cfg.map]?cfg.map:'q7';loadMap(MAP.want);Main.clearDemo();for(const a of G.actors)for(const k in a.rigs)R.scene.remove(a.rigs[k].grp);
  NET.ui='game';NET.k=0;NET.lastK=0;NET.fx=[];NET.fxQ=[];NET.hits=[];NET.ids.clear();NET.tAcc=0;UI.hideAll();
  startMatch(Object.assign({},cfg,{ro}));for(const a of G.actors)NET.ids.set(a.id,a);
  HUD.show(true);Main.paused=false;Main.overlay=null;if(NET.host)Main.lock();else HUD.note(T('clickToPlay'),4);window.onbeforeunload=e=>{if(NET.on){e.preventDefault();e.returnValue='';return ''}}}
function netToLobby(){if(NET.host)netEv('tolobby');for(const a of G.actors)for(const k in a.rigs)R.scene.remove(a.rigs[k].grp);G.actors=[];G.player=null;clearNades();NY.clear();FX.clearDecals();
  AU.stopAll('countdown');Main.closeOverlay(true);Main.paused=false;R.PU.uNV.value=0;R.PU.uZ.value=0;R.PU.uDeath.value=0;R.PU.uInfect.value=0;R.vmVisible=false;NET.ui='lobby';NET.ids.clear();NET.fxQ=[];
  Main.menuDemo();Main.unlock();UI.mpLobby();if(NET.host)netLobbyCast()}

// ---------- screens ----------
UI.mpMenu=function(){const L=LI();const inC=NET.kind==='room',inP=NET.kind==='peerjs';
  $('mp').innerHTML=`<h2>${T('mp')}</h2><div class="mpbox">
    <label>${T('mpName')}</label><input id="mpName" maxlength="14" value="${esc(CFG.mpName||'')}" autocomplete="off" spellcheck="false">
    <button data-act="mpcreate" class="big">${T('mpCreate')}</button>
    <label>${T('mpCode')}</label><div class="mprow"><input id="mpCode" maxlength="4" value="${NET_FIXED_CODE}" placeholder="${T('mpCodePh')}" autocomplete="off" spellcheck="false"><button data-act="mpjoin">${T('mpJoin')}</button></div>
    ${inC?`<label class="ck${CFG.p2pOnly?' on':''}" data-act="mpp2p"><i></i>${T('mpP2POnly')}</label>`:''}
    <p class="mpmsg" id="mpMsg">${esc(NET.msg||'')}</p>
    <p class="hint">${inC?T('mpViaRoom'):inP?T('mpViaPJ'):NET.detecting?T('mpChecking'):NET.detected?T('mpNone'):''}</p></div>
    <div class="mbtns row"><button data-act="back">${T('back')}</button></div>`;
  const nm=$('mpName');nm.addEventListener('change',()=>{CFG.mpName=nm.value.trim().slice(0,14)||CFG.mpName;saveCfg()});
  const cd=$('mpCode');cd.addEventListener('keydown',e=>{if(e.key==='Enter'){UI.act('mpjoin')}});cd.addEventListener('input',()=>{cd.value=cd.value.toUpperCase().replace(/[^A-Z0-9]/g,'')})};
// the lobby is rebuilt only when something in it changed; ping readings are patched in place (a rebuild would eat clicks)
UI.mpRender=function(){if(UI.open==='mp'){const m=$('mpMsg');if(m)m.textContent=NET.msg||'';return}if(UI.open!=='lobby')return;
  const key=JSON.stringify([NET.lob.cfg,NET.lob.pl.map(p=>[p.k,p.n,p.s,p.z,p.r]),CFG.skin,CFG.zclass]);if(key!==UI.mpKey){UI.mpLobby();return}
  const ems=document.querySelectorAll('#lobby .pl em');NET.lob.pl.forEach((p,i)=>{const e=ems[i];if(e&&i>0)e.textContent=(p.r?T('mpRelay')+' · ':'')+(p.p||0)+'ms'})};
UI.mpLobby=function(){const L=LI(),lb=NET.lob,H=NET.host,c=lb.cfg;UI.mpKey=JSON.stringify([lb.cfg,lb.pl.map(p=>[p.k,p.n,p.s,p.z,p.r]),CFG.skin,CFG.zclass]);
  const seg=(k,opts)=>H?`<div class="seg">${opts.map(([v,l])=>`<button data-act="mpset" data-v="${k}:${v}" class="${String(c[k])===String(v)?'on':''}">${l}</button>`).join('')}</div>`:`<div class="mpval">${(opts.find(o=>String(o[0])===String(c[k]))||[0,c[k]])[1]}</div>`;
  const conn=[...NET.links.values()].find(l=>l.ok);
  $('lobby').innerHTML=`<h2>${T('mpLobby')} <span class="mpcode">${esc(NET.code)}</span> <button class="mini" data-act="mpcopy">${T('mpCopy')}</button></h2><p class="hint">${T('mpShare')}</p>
    <div class="setupGrid"><div class="col"><label>${T('mpPlayers')} (${lb.pl.length}/${NET_MAXP})</label><div class="plist">${lb.pl.map((p,i)=>`<div class="pl${p.k===NET.me?' me':''}"><img src="${portrait('h_'+(HSKINS.includes(p.s)?p.s:'guard'),30)}"><b>${esc(p.n||'?')}</b>${i===0?`<span class="ht">${T('mpHost')}</span>`:''}${p.k===NET.me?`<small>(${T('mpMe')})</small>`:''}<em>${i===0?'':p.r?T('mpRelay')+' · ':''}${i===0?'':(p.p||0)+'ms'}</em></div>`).join('')}</div>
      <label>${T('mpSet')}${H?'':' — '+T('mpOnlyHost')}</label>
      <div class="mpset"><span>${T('mode')}</span>${seg('mode',[['mut',T('mut')],['orig',T('orig')]])}<span>${T('map')}</span>${seg('map',MAPLIST().map(id=>[id,MAPDEFS[id].n[L]]))}<span>${T('mpBots')}</span>${seg('bots',[[0,0],[4,4],[8,8],[12,12]])}
      <span>${T('diff')}</span>${seg('diff',[[0,T('d0')],[1,T('d1')],[2,T('d2')],[3,T('d3')]])}<span>${T('rounds')}</span>${seg('rounds',[[5,5],[7,7],[9,9]])}<span>${T('rtime')}</span>${seg('time',[[120,'2'+T('min')],[180,'3'+T('min')],[240,'4'+T('min')]])}</div></div>
    <div class="col"><label>${T('char')}</label><div class="cards">${HSKINS.map(k=>`<div class="card${CFG.skin===k?' on':''}" data-act="mpme" data-v="skin:${k}"><img src="${portrait('h_'+k,62)}"><span>${HSKIN_N[k][L]}</span></div>`).join('')}</div>
      <label>${T('zcls')}</label><div class="cards">${ZLIST.map(k=>`<div class="card z${CFG.zclass===k?' on':''}" data-act="mpme" data-v="zclass:${k}"><img src="${portrait('z_'+k,k==='brute'?52:62)}"><span>${ZCLASS[k].n[L]}</span></div>`).join('')}</div>
      <p class="desc">${ZCLASS[CFG.zclass].d[L]}</p></div></div>
    <p class="hint">${NET.kind==='room'?(conn&&conn.kind==='relay'?T('mpRelay'):T('mpDirect'))+' · claude.ai':'PeerJS · '+T('mpDirect')}</p>
    <div class="mbtns row"><button data-act="mpleave">${T('mpLeave')}</button>${H?`<button data-act="mpstart" class="big">${T('mpStart')}</button>`:`<span class="mpwait">${T('mpWait')}</span>`}</div>`;
  UI.show('lobby')};
UI.mpAct=function(a,v){
  if(a==='mp'){UI.ret=null;UI.show('mp');UI.mpMenu();if(!NET.kind&&!NET.detecting){NET.detecting=true;netDetect().then(()=>{NET.detecting=false;NET.detected=true;if(UI.open==='mp')UI.mpMenu()})}}
  else if(a==='mpcreate'||a==='mpjoin'){const nm=$('mpName');CFG.mpName=(nm&&nm.value.trim().slice(0,14))||CFG.mpName||(LI()?'Player':'플레이어')+Math.floor(Math.random()*90+10);saveCfg();
    if(NET.on)return;if(a==='mpcreate')NET.create();else NET.join(($('mpCode')||{}).value)}
  else if(a==='mpleave'){NET.leave();NET.msg='';Main.toTitle();UI.act('mp')}
  else if(a==='mpstart'){NET.start()}
  else if(a==='mpp2p'){CFG.p2pOnly=!CFG.p2pOnly;saveCfg();UI.mpMenu()}
  else if(a==='mpset'&&NET.host){const [k,val]=v.split(':');NET.lob.cfg[k]=isNaN(+val)?val:+val;if(k==='map'&&MAPDEFS[val])loadMapUI(val);netLobbyCast()}
  else if(a==='mpme'){const [k,val]=v.split(':');CFG[k]=val;saveCfg();if(NET.host)netLobbyCast();else{netToHost({t:'hello',v:NET_VER,n:CFG.mpName,s:CFG.skin,z:CFG.zclass});UI.mpLobby()}}
  else if(a==='mpcopy'){const b=document.querySelector('[data-act="mpcopy"]');const ok=()=>{if(b)b.textContent=T('mpCopied')};
    const sel=()=>{const el=document.querySelector('.mpcode');if(el){const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r)}};
    try{navigator.clipboard.writeText(NET.code).then(ok,sel)}catch(e){sel()}}
  else if(a==='mplobby'&&NET.host){netToLobby()}
  else return false;return true};

// ---------- in-game overlays: connection line, friends' name tags ----------
const NTAG={pool:[],used:0};
function netHud(dt){const el=$('hNet');if(!el)return;if(!NET.on||NET.ui!=='game'){el.style.display='none';return}el.style.display='block';
  NET.hudT=(NET.hudT||0)-dt;if(NET.hudT<=0){NET.hudT=.5;let s;if(NET.host)s=`${T('mpHost')} · ${NET.lob.pl.length}${LI()?'P':'명'}`;else{const L=NET.links.get(NET.hostKey);s=L?`${L.kind==='relay'?T('mpRelay'):T('mpDirect')} · ${Math.round(L.rtt||(G.player&&G.player.ping)||0)}ms`:'…'}
    if(el.textContent!==s)el.textContent=s}
  // names over other players (not bots) within sight
  const lay=$('dmgLayer');if(!lay)return;let n=0;const P=G.player,cam=R.cam.position,W=innerWidth,H=innerHeight;
  for(const a of G.actors){if(!a.net||a.isPlayer||!a.alive||!a.ch||!a.ch.grp.visible)continue;const hx=a.head.x,hy=a.head.y+.38,hz=a.head.z;const d=Math.hypot(hx-cam.x,hy-cam.y,hz-cam.z);if(d>45)continue;
    if(P&&P.team!==a.team&&d>14)continue;if(a.team===TZ&&a.zc==='runner'&&a.skillT>0)continue;
    _dn.set(hx,hy,hz).project(R.cam);if(_dn.z>1||Math.abs(_dn.x)>1.1||Math.abs(_dn.y)>1.1)continue;
    if(Math.abs(_dn.x)<.06&&Math.abs(_dn.y)<.3)continue;// the crosshair readout already names whoever is under it
    if(!losClear(cam.x,cam.y,cam.z,hx,hy-.3,hz))continue;
    let e=NTAG.pool[n];if(!e){e=document.createElement('div');e.className='ntag';lay.appendChild(e);NTAG.pool.push(e)}n++;
    const t=a.name;if(e.textContent!==t)e.textContent=t;e.className='ntag'+(a.team===TZ?' z':'');e.style.display='block';
    e.style.transform=`translate(${((_dn.x*.5+.5)*W).toFixed(1)}px,${((-_dn.y*.5+.5)*H).toFixed(1)}px) translate(-50%,-100%)`;e.style.opacity=clamp(1.3-d/45,.35,1).toFixed(2)}
  for(let i=n;i<NTAG.pool.length;i++)NTAG.pool[i].style.display='none'}

addEventListener('pagehide',()=>{if(NET.on)NET.leave()});
// ---------- keep running in a background tab: a worker ticks while requestAnimationFrame sleeps ----------
(function(){let w=null;try{const src='setInterval(()=>postMessage(0),50)';w=new Worker(URL.createObjectURL(new Blob([src],{type:'text/javascript'})))}catch(e){w=null}
  // browsers stop animation frames for hidden or covered windows; the game keeps stepping (without drawing) so friends never freeze
  const tick=()=>{const now=netNow();if(NET.on&&window.__ready&&now-(Main.lastRaf||0)>150&&now-(NET.lastTick||0)>40){NET.lastTick=now;Main.step(now,false)}};
  if(w)w.onmessage=tick;setInterval(tick,50)})();
