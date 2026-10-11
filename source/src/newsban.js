'use strict';
// ============ the "new" banner: new weapons, zombies, maps and features, shown when the game starts ============
// Shown once per page load when the lobby first appears (after a sign-in window that is already open closes), unless
// "don't show for 2 hours" was chosen less than 2 hours ago (LS 'nbHide' = the time it was chosen). X closes it for this load;
// the NEW button on the notice panel opens it again. To add an entry, put it at the top of NEW_CONTENT:
//   kind 'weapon' (ref = WPN id) / 'zombie' (ref = ZCLASS id) / 'map' (ref = map id) / 'feature' (ico = a symbol); missing refs are skipped.
const NEW_CONTENT=[
  {kind:'weapon',ref:'balrog5',tag:['상점 6,500 코인','Shop · 6,500 coins'],t:['발록-5','Balrog-5'],
    d:['묵직한 돌격소총. 맞출 때마다 콤보 게이지가 차고(헤드샷은 2), 8이 되면 다음 한 발이 맞은 곳에서 폭발해요. 오른쪽 손잡이에 게이지가 켜지고, 가득 차면 위의 램프가 깜박여요.','A heavy assault rifle with a combo gauge. Every hit fills it (a headshot counts 2); at 8 the next bullet explodes where it lands. The gauge lights up on the right of the handguard and a lamp blinks on top when it is full.']},
  {kind:'feature',ico:'💬',tag:['신규 기능','New'],t:['친구창 채팅','Friend chat'],
    d:['친구창에서 친구에게 바로 메시지를 보낼 수 있어요. 친구가 접속해 있는지(접속 중 / n분 전)도 실제 접속 기준으로 보여요.','Message a friend right from the friends window. It also shows whether they are online (online / n min ago) by real presence.']},
  {kind:'feature',ico:'♛',tag:['신규 기능','New'],t:['명예의 전당','Hall of fame'],
    d:['챕터 × 난이도마다 서버에서 가장 먼저 클리어한 팀이 명예의 전당에 남아요. 그 판의 팀원 모두 이름 옆에 금색 칭호(예: 「알레프 보통 최초 클리어」)를 달고 — 로비 · 대기실 · 머리 위 이름표 · 채팅 · 랭킹 · 친구 목록에 보여요. 랭킹 창의 「명예의 전당」 탭, 챕터 카드에서 팀을 볼 수 있어요.','The first team on the server to clear each chapter on each difficulty goes into the hall of fame. Everyone in it wears a gold title next to their name (e.g. 「ALEPH Normal · first clear」) — in the lobby, the waiting room, over their head, in chat, the ranking and friend lists. See the teams on the ranking window\'s 「Hall of fame」 tab and on the chapter cards.']},
  {kind:'zombie',ref:'lyrebird',tag:['좀비 시나리오 4챕터','Zombie scenario · CH.4'],t:['4챕터 「라이어버드」','Chapter 4 「LYREBIRD」'],
    d:['구름에 묻힌 산꼭대기 통신기지. 1차 회수팀 통신병 라이어버드는 안개 속을 네발로 기어 다니며 우리 목소리를 흉내 내요 — 동료 이름으로 가짜 무전 · 가짜 핑, 안개 속 환각 동료, 3페이즈엔 동료 모습으로 섞여 들어요. 미니맵 점을 확인하고, 경보 사이렌으로 안개를 걷어 내요. 3챕터를 깨면 열려요.','A signal station on a mountaintop buried in cloud. LYREBIRD, RT-1\'s signaller, crawls through the fog and fakes our voices: radio calls and pings in a teammate\'s name, mirages of teammates in the fog, and in phase 3 a teammate\'s face. Check the minimap dots, and sound the alarm siren to clear the fog. Opens once chapter 3 is cleared.']},
  {kind:'zombie',ref:'radioman',tag:['신규 좀비','New zombie'],t:['통신병 좀비','Radio-Operator Zombie'],
    d:['커다란 무전기를 멘 1차 회수팀 통신 지원병. 살아 있는 동안 무전기가 지직거리고, 쓰러뜨리면 그 무전기가 라이어버드의 신호를 역탐지해서 5초 동안 위치를 보여 줘요. 4챕터에 나와요.','An RT-1 radio operator with a big set on his back: it crackles while he lives, and when he drops it traces LYREBIRD\'s signal and shows where it is for 5 s. Shows up in chapter 4.']},
  {kind:'zombie',ref:'spore',tag:['신규 좀비','New zombie'],t:['포자 좀비','Spore Zombie'],
    d:['몸에서 버섯이 자라는 부푼 좀비. 쓰러지면 터지면서 그 자리를 짙은 포자 안개로 덮어요 — 멀리서 쏴요. 4챕터에 나와요.','A bloated zombie with mushrooms growing out of it: it bursts when it drops and buries the spot in thick spore fog — shoot it from a distance. Shows up in chapter 4.']},
  {kind:'feature',ico:'📍',tag:['신규 기능','New'],t:['핑','Pings'],
    d:['Z 키(또는 마우스 휠 클릭, 폰은 📍 버튼)로 보고 있는 곳에 핑을 찍으면 같은 편 화면과 미니맵에 6초 동안 표시돼요. 4챕터에선 라이어버드가 가짜 핑도 찍어요 — 그 동료의 미니맵 점이 딴 데 있으면 가짜!','Press Z (or the middle mouse button; the 📍 button on phones) to mark the spot you are looking at: your side sees it on screen and on the minimap for 6 s. In chapter 4 LYREBIRD fakes pings too — if that teammate\'s minimap dot is somewhere else, it is a fake!']},
  {kind:'zombie',ref:'khepri',tag:['좀비 시나리오 3챕터','Zombie scenario · CH.3'],t:['3챕터 「케프리」','Chapter 3 「KHEPRI」'],
    d:['잿가루 내리는 버려진 제철소. 거대한 쇠똥구리 케프리는 몸집만 한 고철 공을 굴려 정면 총알을 다 막아요 — 드럼통 · 가스 밸브 · 주조장 래들 쇳물로 공을 깨고, 날거나 뒤집혔을 때 배를 노려요. 2챕터를 깨면 열려요.','An abandoned steel works with ash drifting down. KHEPRI, a giant dung beetle, rolls a ball of scrap as big as itself that soaks up every bullet from the front — break it with the drums, the gas valves and the casting bay’s ladle of molten iron, and go for the belly when it flies or lands on its back. Opens once chapter 2 is cleared.']},
  {kind:'zombie',ref:'larva',tag:['신규 좀비','New zombie'],t:['유충 좀비','Larva Zombie'],
    d:['몸속에서 뭔가 꿈틀거리는 좀비. 죽으면 유충 떼가 터져 나와 근처를 물어뜯어요 — 떨어져서 쏘거나 불로 태우면 떼가 안 나와요. 3챕터에 나와요.','Something is wriggling inside it: a swarm of grubs bursts out when it dies and bites whoever is near — shoot it from a distance, or burn it and no swarm comes out. Shows up in chapter 3.']},
  {kind:'zombie',ref:'scrap',tag:['신규 좀비','New zombie'],t:['장갑 고철 좀비','Scrap-Armour Zombie'],
    d:['자동차 문짝과 드럼통 뚜껑을 철사로 감아 두른 좀비. 총알은 반밖에 안 먹히지만 불과 폭발엔 두 배로 약해요. 3챕터에 나와요.','Car doors and drum lids wired on as armour: bullets do half, but fire and blasts do double. Shows up in chapter 3.']},
  {kind:'zombie',ref:'argus',tag:['좀비 시나리오 2챕터','Zombie scenario · CH.2'],t:['2챕터 「아르고스」','Chapter 2 「ARGUS」'],
    d:['비 오는 밤의 봉쇄선 전방기지. 감시탑을 옮겨 다니는 1차 회수팀 저격수 아르고스는 불빛만 보이면 쏴요 — 붉은 레이저가 보이면 엄폐! 투광등을 놈이 선 탑으로 돌리면 야간투시경이 타서 떨어져요. 1챕터를 깨면 열려요.','A rainy night at the containment line’s forward base. ARGUS, RT-1’s sniper, moves between the watchtowers and shoots at any light it sees — when the red laser lands on you, get behind cover. Swing a floodlight onto its tower and its night vision burns out. Opens once chapter 1 is cleared.']},
  {kind:'zombie',ref:'squad',tag:['신규 좀비','New zombie'],t:['1차 팀 분대원 좀비','RT-1 Squad Zombie'],
    d:['헬멧과 방탄복을 입은 1차 회수팀 대원. 정면에서 쏘면 잘 안 먹히니 머리나 옆을 노려요. 가끔 수류탄을 던지고, 죽으면 탄약 상자를 떨궈요. 2챕터에 나와요.','An RT-1 trooper in a helmet and a plate carrier: bullets from the front do less, so go for the head or the flank. Throws a grenade now and then and drops an ammo box when it dies. Shows up in chapter 2.']},
  {kind:'zombie',ref:'aleph',tag:['좀비 시나리오 1챕터','Zombie scenario · CH.1'],t:['1챕터 「알레프」','Chapter 1 「ALEPH」'],
    d:['격리병원 Q-7 연구동을 뚫고 지하 B4의 최초 감염자 알레프를 쓰러뜨린 뒤 60초 안에 탈출. 맞을수록 분노하는 거대 보스, 등의 혈청 탱크가 약점. 방 만들기 → 좀비 시나리오에서 1챕터를 고르세요.','Fight through the Q-7 research wing, bring down ALEPH, patient zero, in the B4 chamber and escape within 60 s. A giant that gets angrier with every hit; the serum tank on its back is the weak spot. Create a room → Zombie scenario → CH.1.']},
  {kind:'zombie',ref:'strait',tag:['신규 좀비','New zombie'],t:['구속복 좀비','Straitjacket Zombie'],
    d:['할퀴지 못하는 대신 덮쳐서 붙잡아요. 붙잡히면 꼼짝 못 하니 동료가 쏴서 떼어 줘야 해요. 1챕터에 나와요.','It cannot claw: it pounces and pins you, and only a teammate shooting it gets you free. Shows up in chapter 1.']},
  {kind:'feature',ico:'✉',tag:['신규 기능','New'],t:['인게임 채팅','In-game chat'],
    d:['매치 중 Enter(또는 Y)로 전체 채팅, U로 우리 편 채팅. 멀티 대기실에서도 바로 대화할 수 있고, 입장 · 퇴장도 채팅창에 떠요. 폰은 위쪽 💬 버튼.','Enter (or Y) talks to everyone and U to your own side, in a match and in the multiplayer waiting room; joins and leaves show in the chat too. On phones, the 💬 button at the top.']},
  {kind:'feature',ico:'♥',tag:['신규 기능','New'],t:['친구 · 선물하기','Friends · gifts'],
    d:['로비의 「친구」 버튼에서 친구 코드로 친구를 맺고, 상점에서 파는 총을 내 코인으로 친구에게 선물할 수 있어요. 받은 선물은 로비에 오면 알림이 떠요.','Make friends by friend code from the lobby’s Friends button, and buy any gun the shop sells for a friend with your coins. Gifts that come in show up in the lobby.']},
  {kind:'weapon',ref:'ak60r',tag:['보급상자 전용','Supply crates only'],t:['AK-47 60R','AK-47 60R'],
    d:['무광 블랙 AK. 가스관 위 조준경(우클릭 줌)과 반달 모양 60발 라운드 탄창. AK-47보다 한 발이 훨씬 세고 넉백 · 경직도 큼. 보급상자에서만 나와요.','A matte-black AK with a scope on the gas tube (right click to zoom) and a 60-round half-moon magazine. Hits far harder than the AK-47, with more knockback and stagger. Only from supply crates.']},
  {kind:'weapon',ref:'dmp7',tag:['보급상자 전용','Supply crates only'],t:['듀얼 MP7A1','Dual MP7A1'],
    d:['실총 MP7A1을 양손에 한 자루씩. 번갈아 쏘는 빠른 연사, 우클릭 「난사」 자세는 연사 +30%. 보급상자에서만 나와요.','A real-pattern MP7A1 in each hand, firing in turns; right click for the spray stance (+30 % fire rate). Only from supply crates.']},
  {kind:'feature',ico:'▣',tag:['신규 기능','New'],t:['인벤토리 · 근하신년 글자','Inventory · New-Year letters'],
    d:['매치에서 주운 근 · 하 · 신 · 년 글자가 인벤토리에 저장돼요. 한 세트를 모으면 근하신년 해독기 2개 또는 시즌 해독기 1개로 교환. 보유 무기, 장비 프리셋 3세트, 좀비 · 생존자 캐릭터도 여기서 미리 설정.','Letters you pick up in a match are kept in your inventory; a full set trades for 2 New-Year decoders or 1 season decoder. Owned weapons, three loadout presets and your zombie / survivor character are set here too.']},
  {kind:'weapon',ref:'blaze8',tag:['상점 6,000 코인','Shop · 6,000 coins'],t:['블레이즈-8','Blaze-8'],
    d:['골드 각인 반자동 샷건. 8발을 한 발씩 장전하고 장전 도중 쏘면 바로 끊고 발사. 3발 쏠 때마다 특수칸에 특수탄이 1발씩 (최대 8발) 쌓이고, 우클릭하면 부채꼴로 넓게 퍼지는 경직 · 넉백탄 발사.','A gold-engraved semi-auto shotgun: 8 shells loaded one by one, firing mid-reload shoots at once. Every 3 shells one special shell goes into its own slot (up to 8); right click fires it as a wide fan that staggers and blows zombies back.']},
  {kind:'weapon',ref:'winchester',tag:['상점 4,500 코인','Shop · 4,500 coins'],t:['윈체스터 M1887','Winchester M1887'],
    d:['레버 액션 샷건. 쏠 때마다 레버를 철컥. 한 방이 묵직하고, 장전 중 쏘면 바로 끊고 발사.','A lever-action shotgun: rack the lever after every shot. Heavy single blasts; firing mid-reload shoots at once.']},
  {kind:'weapon',ref:'killknife',tag:['상점 12,000 코인','Shop · 12,000 coins'],t:['나타나이프','Nata Knife'],
    d:['커다란 전투 칼. 기본 칼보다 사거리 · 데미지 · 경직이 훨씬 높고, 강공격은 두 마리까지 벰.','A big combat knife: far more reach, damage and stagger than the standard knife; the heavy attack cuts two.']},
  {kind:'weapon',ref:'salamander',tag:['시즌 해독기','Season decoder'],t:['샐러맨더','Salamander'],
    d:['화염방사기. 8m 안의 좀비를 한꺼번에 태우고 불붙여 느리게 만듦. 벽은 못 넘음.','A flamethrower: burns every zombie within 8 m at once and slows them; stopped by walls.']},
  {kind:'weapon',ref:'skull9',tag:['시즌 해독기','Season decoder'],t:['스컬-9','SKULL-9'],
    d:['양손 전투도끼. 좌클릭 가로 베기 3마리, 우클릭 일자 내려찍기 2마리 + 띄우기.','A two-handed battle axe: the sweep cuts three, the straight overhead slam two and pops them up.']},
  {kind:'feature',ico:'◎',tag:['신규 기능','New'],t:['공개 방 · 일일 미션 · 랭킹','Public rooms · daily missions · ranking'],
    d:['멀티플레이 메뉴에 열린 방 목록, 매일 바뀌는 미션 3개(해독기 보상), 레벨 · 킬 · 감염 TOP 50 랭킹.','Open rooms in the multiplayer menu, three daily missions (decoders to win) and a top-50 ranking.']}];
const NBAN={i:0,timer:null,shown:false,
  list(){return NEW_CONTENT.filter(e=>e.kind==='weapon'?!!(WPN[e.ref]&&GUNS[WPN[e.ref].model]):e.kind==='zombie'?!!ZCLASS[e.ref]:e.kind==='map'?!!MAPDEFS[e.ref]:true)},
  hidden(){const t=LS.get('nbHide',0);return t>0&&Date.now()-t<2*3600e3},
  art(e){if(e.kind==='weapon'){const W=WPN[e.ref],s=gunIcon(W.model,W.kind==='melee'?54:66);return s?`<img class="nbw${W.kind==='melee'?' m':''}" src="${s}" alt="">`:''}
    if(e.kind==='zombie')return `<img class="nbz" src="${portrait('z_'+e.ref,150)}" alt="">`;if(e.kind==='map')return `<div class="nbm">${thumb(e.ref,'big')}</div>`;return `<b class="nbi">${e.ico||'★'}</b>`},
  open(){const L=this.list();if(!L.length)return;this.close();this.i=0;const o=document.createElement('div');o.id='nbWin';document.body.appendChild(o);
    o.addEventListener('click',ev=>{const t=ev.target.closest('[data-nb]');if(!t){if(ev.target===o)this.close();return}const a=t.dataset.nb;
      if(a==='x')this.close();else if(a==='hide'){LS.set('nbHide',Date.now());this.close()}else if(a==='p')this.go(this.i-1,1);else if(a==='n')this.go(this.i+1,1);
      else if(a==='d')this.go(+t.dataset.v,1);else if(a==='shop'){const id=t.dataset.v;this.close();if(typeof SHOP!=='undefined')SHOP.open(id)}});
    this.render();this.timer=setInterval(()=>{if(!this.hold)this.go(this.i+1)},6500);AU.play&&AU.play('ui',{vol:.4})},
  go(i,user){const n=this.list().length;this.i=(i+n)%n;if(user){this.hold=true;setTimeout(()=>this.hold=false,9000)}this.render()},
  render(){const o=$('nbWin');if(!o)return;const L=LI(),A=this.list(),e=A[this.i],n=A.length;if(!e){this.close();return}
    const W=e.kind==='weapon'?WPN[e.ref]:null,kn=W?((typeof KIND_N!=='undefined'&&KIND_N[W.kind])||['',''])[L]:'';
    o.innerHTML=`<div class="nbw0"><div class="nbh"><b>${L?'NEW':'신규 소개'}</b><small>${L?'What\'s new in QUARANTINE Z':'새로 들어온 무기 · 기능'}</small><button class="nbx" data-nb="x" aria-label="close">×</button></div>
      <div class="nbb"><button class="nbar l" data-nb="p"${n<2?' disabled':''}>‹</button><div class="nbc k${e.kind}" key="${this.i}"><div class="nba">${this.art(e)}<i class="nbg"></i></div>
        <div class="nbt"><span class="nbtag">${esc(e.tag?e.tag[L]:'')}</span>${kn?`<span class="nbk">${esc(kn)}</span>`:''}<h3>${esc(e.t[L])}</h3><p>${esc(e.d[L])}</p>
        ${W&&typeof SHOP!=='undefined'?`<button class="nbgo" data-nb="shop" data-v="${e.ref}">${L?'See it in the shop':'상점에서 보기'} ›</button>`:''}</div></div><button class="nbar r" data-nb="n"${n<2?' disabled':''}>›</button></div>
      <div class="nbf"><div class="nbd">${A.map((_,k)=>`<i class="${k===this.i?'on':''}" data-nb="d" data-v="${k}"></i>`).join('')}</div><button class="nbh2" data-nb="hide">${L?'Don\'t show for 2 hours':'2시간 동안 보지 않기'}</button></div></div>`},
  close(){const o=$('nbWin');if(o)o.remove();clearInterval(this.timer);this.timer=null},
  // first lobby of this page load: wait for the lobby and for a sign-in window already open to close
  boot(){if(this.shown||this.hidden()||!this.list().length)return;this.shown=true;let n=0;
    const tryOpen=()=>{if(G.st!=='menu'||UI.open!=='menu'||$('accWin')||$('shopWin')||$('rkWin')||$('invWin')||$('frWin')||$('giftPop')){if(++n<120)setTimeout(tryOpen,800);return}this.open()};setTimeout(tryOpen,1200)}};
(function(){const bt=UI.buildTitle;UI.buildTitle=function(){const r=bt.apply(this,arguments);try{NBAN.boot()}catch(e){console.error(e)}return r};
  const act0=UI.act;UI.act=function(a,v,el){if(a==='nbopen'){NBAN.open();return}return act0.call(this,a,v,el)};
  addEventListener('keydown',e=>{if(e.key==='Escape'&&$('nbWin'))NBAN.close()});
  const sm=startMatch;startMatch=function(cfg){NBAN.close();return sm(cfg)}})();
