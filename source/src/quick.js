'use strict';
// ============ 빠른 매칭 (v6.80): one tap into a room with other players ============
// The owner's 3번: the open rooms were listed (ROOMS, net.js) but a player had to read the list and pick one. 빠른 매칭 does it:
// the list is read again and the best room taken — waiting (not playing), a seat free, a map this version has (else it is another
// version's room), a chapter this player has opened; more players first, the player's own mode a little ahead — and joined. A room
// that turns the player away (full, started, another version, gone, no answer in 15 s) is passed over for the next, three in all;
// with none left a public room is made with the last room settings, where the next quick matcher comes in.
// From the lobby (the 멀티플레이 card's 빠른 매칭) or the multiplayer screen, where the steps show under the button (취소 stops).
const QM={on:false,tried:[],n:0,t:0,step:'',noteT:0,MAX:3,WAIT:15000,
  BOLT:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2L4 14h6l-1 8 9-12h-6z" fill="currentColor"/></svg>',
  // a public list exists here (the account server is there; claude.ai's own rooms have none)
  can(){return typeof ACC!=='undefined'&&!!ACC.on&&NET.kind!=='room'},
  mode(){return (CFG.mpCfg&&CFG.mpCfg.mode)||CFG.mode||'mut'},
  ok(r){if(!r||r.status!=='lobby')return false;const n=r.players|0,mx=r.max_players|0,c=String(r.code||'');
    if(!(mx>0&&n<mx)||!/^[A-Z0-9]{4}$/.test(c)||this.tried.includes(c)||!MAPDEFS[r.map])return false;
    const ep=r.mode==='scen'?MAPDEFS[r.map].ep|0:0;if(ep>1&&typeof EP!=='undefined'&&!EP.unlocked(ep))return false;
    return ['mut','orig','scen','tdm','ffa','bomb','race'].includes(r.mode)},
  pick(list){const m=this.mode(),C=(Array.isArray(list)?list:[]).filter(r=>this.ok(r));if(!C.length)return null;
    return C.map(r=>[(r.players|0)*10+(r.mode===m?25:0)+Math.random()*4,r]).sort((a,b)=>b[0]-a[0])[0][1]},
  // the name the room will show (as 방 만들기 / 참가 take it)
  name(){const nm=$('mpName');CFG.mpName=(nm&&nm.value.trim().slice(0,14))||CFG.mpName||(typeof ACC!=='undefined'&&ACC.signed()&&String(ACC.me.nickname||'').slice(0,14))||(LI()?'Player':'플레이어')+Math.floor(Math.random()*90+10);saveCfg()},
  what(r){const L=LI(),E=MAPDEFS[r.map]&&MAPDEFS[r.map].ep&&typeof EPS!=='undefined'?EPS[MAPDEFS[r.map].ep]:null;
    return `${String(r.host_name||'?').slice(0,14)} · ${E?(L?'Scenario: ':'시나리오: ')+E.n[L]:T(r.mode)+' · '+mapName(r.map)} · ${r.players|0}/${r.max_players|0}`},
  async go(){if(this.on||NET.on)return;if(!this.can()){if(UI.open!=='mp')UI.act('mp');return}if(UI.open!=='mp')UI.act('mp');this.name();this.on=true;this.tried=[];this.n=0;await this.next()},
  // the list as it is now (a load already on its way is waited for, then one more)
  async fresh(){const idle=async()=>{for(let i=0;i<50&&ROOMS.busy;i++)await new Promise(r=>setTimeout(r,150))};await idle();await ROOMS.load();await idle()},
  async next(){if(!this.on)return;const L=LI();NET.msg='';if(UI.mpRender)UI.mpRender();this.say(L?'Looking for an open room…':'열린 방 찾는 중…');
    await this.fresh();if(!this.on)return;
    // (no list at all: the reason is said and nothing is made)
    if(!Array.isArray(ROOMS.list)){this.end();NET.msg=ROOMS.err||(L?'The room list did not load — try again':'방 목록을 못 불러왔어요 — 잠시 뒤 다시 해 주세요');if(UI.mpRender)UI.mpRender();return}
    const r=this.n<this.MAX?this.pick(ROOMS.list):null;if(!r){this.make();return}
    const code=String(r.code);this.n++;this.tried.push(code);this.say((L?'Joining ':'들어가는 중 — ')+this.what(r));NET.join(code);this.watch(code)},
  // in (the room's waiting room came), turned away (net.js netFatal left the room) or no answer in time
  watch(code){clearInterval(this.t);const t0=Date.now();
    this.t=setInterval(()=>{if(!this.on){clearInterval(this.t);return}
      if(NET.on&&NET.cli&&NET.ui==='lobby'&&NET.code===code){this.end();this.note(LI()?'Quick match: you are in':'빠른 매칭 — 방에 들어왔어요','');return}
      const gone=!NET.on,late=Date.now()-t0>this.WAIT;if(!gone&&!late)return;clearInterval(this.t);if(late&&NET.on)NET.leave();setTimeout(()=>this.next(),gone?350:150)},250)},
  // nobody to join: a public room of one's own with the last room settings
  async make(){const L=LI();this.end();CFG.mpPub=true;saveCfg();await NET.create();if(!(NET.on&&NET.host&&NET.ui==='lobby'))return;
    const listed=ACC.signed();this.note(L?'No open room — you made one':'열린 방이 없어서 새 방을 만들었어요',
      listed?(L?'It is public: quick matchers come straight in':'공개 방이라 빠른 매칭하는 사람이 바로 들어와요'):(L?'Sign in and it shows up for quick matchers':'로그인하면 목록에 떠서 빠른 매칭으로 사람이 들어와요'))},
  end(){this.on=false;clearInterval(this.t);this.say('')},
  stop(){if(!this.on)return;this.end();if(NET.on&&NET.ui==='join')NET.leave();NET.msg='';if(UI.mpRender)UI.mpRender()},
  say(s){this.step=s;this.render()},
  note(h,s){const box=netMigBox();box.innerHTML=`<b>${esc(h)}</b>${s?`<span>${esc(s)}</span>`:''}`;box.className='on done'+(NET.ui!=='game'?' atop':'');
    clearTimeout(this.noteT);this.noteT=setTimeout(()=>{if(!NET.mig&&box.classList.contains('done'))box.className=''},s?5500:3500)},
  // the button and the steps on the multiplayer screen
  html(){const L=LI();return `<div class="qmbox"><button data-act="${this.on?'qmstop':'qm'}" class="big qmgo${this.on?' busy':''}">${this.BOLT}<span>${this.on?(L?'Searching… · Cancel':'찾는 중… · 취소'):(L?'Quick match':'빠른 매칭')}</span></button>
    <p class="qmmsg" id="qmMsg">${esc(this.step||'')}</p>${this.on?'':`<p class="hint qmhint">${L?'Straight into an open room with a seat — or a new one if there is none':'자리 있는 공개 방에 바로 들어가요 · 없으면 새 방을 만들어요'}</p>`}</div>`},
  put(){const box=document.querySelector('#mp .mpbox');if(!box)return;const old=box.querySelector('.qmbox');if(old)old.remove();if(!this.can())return;
    const at=box.querySelector('[data-act="mpcreate"]');if(!at)return;at.classList.remove('mpgo');at.classList.add('mpmk');at.insertAdjacentHTML('beforebegin',this.html())},
  render(){if(UI.open==='mp')this.put()},
  // the lobby's 멀티플레이 card
  pill(L){return this.can()?`<button class="mtut mqm" data-act="qm" title="${L?'Quick match — straight into an open room':'빠른 매칭 — 자리 있는 공개 방에 바로'}">${this.BOLT}${L?'Quick match':'빠른 매칭'}</button>`:''}};
(function(){
  const mm=UI.mpMenu;UI.mpMenu=function(){const r=mm.apply(this,arguments);try{QM.put()}catch(e){console.error(e)}return r};
  const act0=UI.act;UI.act=function(a,v,el){
    if(a==='qm'){QM.go();return}
    if(a==='qmstop'){QM.stop();return}
    // (another way in, or leaving the screen, ends the search)
    if(QM.on&&(a==='back'||a==='mpcreate'||a==='mpjoin'||a==='mproom'))QM.stop();
    return act0.call(this,a,v,el)};
  // (the lobby's card: drawn with the rest of the lobby)
  const bt=UI.buildTitle;UI.buildTitle=function(){const r=bt.apply(this,arguments);try{const c=document.querySelector('#menu .mc[data-act="mp"]');
    if(c&&!c.querySelector('.mqm')){const h=QM.pill(LI());if(h)c.insertAdjacentHTML('afterbegin',h)}}catch(e){console.error(e)}return r};
})();
