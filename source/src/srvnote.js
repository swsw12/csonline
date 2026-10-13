'use strict';
// ============ v6.42: server notices, the ban notice and the admin page's button (the lobby) ============
// Server notices come from qz_notices (anyone may read it; they are written on the admin page). The first one shows as a strip under
// the lobby's top bar (every screen size: on a phone the notice list is hidden), all of them head the lobby's notice list, and one
// marked popup opens a window once per browser (qz_ntc). A ban (ACC.me.ban, from qz_me) opens a window once per sign-in and tags the
// profile. Admins (ACC.me.admin) get a 관리자 button on the top bar: the admin page (admin.html, a page of its own) in a new tab.
const SRVN={list:[],at:0,busy:false,off:false,banSeen:'',
  async load(force){if(!ACC.on||this.busy||this.off)return;if(!force&&Date.now()-this.at<5*60e3)return;this.busy=true;
    try{const r=await ACC.req('POST','/rest/v1/rpc/qz_notices',{},false);this.list=Array.isArray(r)?r.filter(n=>n&&n.id!=null&&n.title):[];this.at=Date.now();
      this.render();this.popup()}
    catch(e){if(/Could not find the function|PGRST202/i.test((e.message||'')+' '+(e.code||'')))this.off=true;this.at=Date.now()-4*60e3}// (an older database: no notices; offline: again in a minute)
    finally{this.busy=false}},
  tag(lv){const L=LI();return lv==='warn'?(L?'NOTICE':'점검'):lv==='event'?(L?'EVENT':'이벤트'):(L?'INFO':'공지')},
  // the strip, the lines in the notice list, the admin button, the ban tag (after every lobby build and every account change)
  render(){const lob=document.querySelector('#menu .lob');if(!lob)return;const N=this.list;
    let ban=lob.querySelector('.srvBan');
    if(N.length){const n=N[0];if(!ban){ban=document.createElement('div');const top=lob.querySelector('.lobTop');if(top)top.after(ban);else lob.prepend(ban)}
      ban.className='srvBan lv-'+n.level;ban.dataset.act='srvnote';ban.dataset.v=String(n.id);
      const first=String(n.body||'').split('\n').find(s=>s.trim())||'';
      ban.innerHTML=`<em>${this.tag(n.level)}</em><b>${esc(n.title)}</b>${first?`<span>${esc(first)}</span>`:''}${N.length>1?`<small>+${N.length-1}</small>`:''}<i>›</i>`;lob.classList.add('hasBan')}
    else if(ban){ban.remove();lob.classList.remove('hasBan')}
    const ul=lob.querySelector('.news');
    if(ul){ul.querySelectorAll('li.srvn').forEach(x=>x.remove());ul.querySelectorAll('li.srvHid').forEach(x=>x.classList.remove('srvHid'));
      for(const n of N.slice().reverse()){const li=document.createElement('li');li.className='srvn lv-'+n.level;li.dataset.act='srvnote';li.dataset.v=String(n.id);
        li.innerHTML=`<em class="s">${this.tag(n.level)}</em>${esc(n.title)}`;ul.prepend(li)}
      [...ul.children].forEach((x,i)=>{if(i>=5)x.classList.add('srvHid')})}// (the list keeps five lines)
    this.adminBtn();this.banTag()},
  adminBtn(){const tb=document.querySelector('#menu .lobTop .tbtns');if(!tb)return;const on=!!(ACC.signed()&&ACC.me&&ACC.me.admin);let b=tb.querySelector('.tadm');
    if(on&&!b){b=document.createElement('button');b.className='tadm';b.dataset.act='admin';b.title=LI()?'Open the admin page (new tab)':'관리자 페이지 열기 (새 탭)';
      b.innerHTML='<svg viewBox="0 0 16 16"><path fill="currentColor" d="M8 1l6 2.2v4.3c0 3.6-2.5 6.3-6 7.5-3.5-1.2-6-3.9-6-7.5V3.2zm0 2.1L4 4.6v2.9c0 2.5 1.6 4.5 4 5.5 2.4-1 4-3 4-5.5V4.6zm-.8 2.4h1.6v2.7h-1.6zm0 3.7h1.6v1.5h-1.6z"/></svg>'+`<span>${LI()?'Admin':'관리자'}</span>`;
      tb.prepend(b)}
    else if(!on&&b)b.remove()},
  ban(){const me=ACC.signed()&&ACC.me;return me&&me.ban&&me.ban.until?me.ban:null},
  banTag(){const pf=document.querySelector('#menu .lobTop .prof div');if(!pf)return;const B=this.ban();let t=pf.querySelector('.banTag');
    if(B&&!t){t=document.createElement('span');t.className='banTag';t.dataset.act='banwin';pf.appendChild(t)}else if(!B&&t)t.remove();
    if(t)t.textContent=LI()?'SUSPENDED':'정지'},
  // a window (a notice, or the ban)
  win(head,html,cls,onClose){let o=$('srvWin');if(o)o.remove();o=document.createElement('div');o.id='srvWin';o.className=cls||'';
    o.innerHTML=`<div class="pwin"><div class="pwh"><b>${head}</b><button data-sw="x" aria-label="close">×</button></div><div class="pwb">${html}</div><div class="pwf"><button data-sw="x">${LI()?'OK':'확인'}</button></div></div>`;
    o.addEventListener('click',e=>{if(e.target===o||e.target.dataset.sw==='x'){o.remove();if(onClose)onClose()}});document.body.appendChild(o)},
  open(id){const n=this.list.find(x=>String(x.id)===String(id));if(!n)return;const L=LI();
    const per=n.ends_at?`${fmtWhen(n.starts_at)} ~ ${fmtWhen(n.ends_at)}`:fmtWhen(n.starts_at)+(L?' ~':' 부터');
    this.win(`<em class="lv">${this.tag(n.level)}</em>${esc(n.title)}`,`<div class="ntb">${esc(n.body||'')}</div><time>${per}</time>`,'lv-'+n.level,()=>this.seen(n.id))},
  seenList(){const v=ACC.ls('qz_ntc');return Array.isArray(v)?v:[]},
  seen(id){const L=this.seenList();if(!L.includes(id)){L.push(id);ACC.ls('qz_ntc',L.slice(-60))}},
  // a notice marked popup opens once per browser, in the lobby (not over a window already open)
  popup(){if(G.st!=='menu'||$('srvWin')||$('patchWin'))return;if(this.banWin(false))return;const S=this.seenList(),n=this.list.find(x=>x.popup&&!S.includes(x.id));if(n)this.open(n.id)},
  // (the ban comes first: the notice popup waits until it is closed)
  banWin(force){const B=this.ban();if(!B||G.st!=='menu')return false;const key=String(B.until)+'|'+(ACC.me&&ACC.me.nickname);if(!force&&this.banSeen===key)return false;if(!force&&$('srvWin'))return false;this.banSeen=key;
    const L=LI(),till=B.forever?(L?'Permanently':'영구 정지'):(L?'Until ':'')+fmtWhen(B.until)+(L?'':' 까지');
    this.win(L?'Account suspended':'계정 이용 정지',`<div class="bnr"><span>${L?'Period':'기간'}</span><b>${till}</b><span>${L?'Reason':'사유'}</span><b>${esc(B.reason||'-')}</b></div>
      <p>${L?'While suspended, rewards, the shop, decoders, public rooms, friends and messages are closed to this account. Playing alone (bot matches, the range) still works.':'정지 중에는 보상 · 상점 · 해독기 · 공개 방 · 친구 · 메시지를 쓸 수 없어요. 혼자 하기(봇전 · 사격장)는 계속할 수 있어요.'}</p>`,'ban',()=>setTimeout(()=>this.popup(),250));return true}};
// a date and time in the player's own time zone: 2026-10-14 02:00
function fmtWhen(t){const d=new Date(t);if(isNaN(d))return '';const p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`}
(function(){
  const bt=UI.buildTitle;UI.buildTitle=function(){const r=bt.apply(this,arguments);try{SRVN.render()}catch(e){console.error(e)}return r};
  const act0=UI.act;UI.act=function(a,v,el){if(a==='srvnote'){SRVN.open(v);return}if(a==='banwin'){SRVN.banWin(true);return}
    if(a==='admin'){try{window.open('admin.html','_blank','noopener')}catch(e){location.href='admin.html'}return}return act0.call(this,a,v,el)};
  addEventListener('keydown',e=>{if(e.code==='Escape'&&$('srvWin')){const x=$('srvWin').querySelector('[data-sw="x"]');if(x)x.click();else $('srvWin').remove();e.stopPropagation()}},true);// (closing marks a popup seen)
  // the notices: when the game opens, then every few minutes while in the lobby; the ban window when the account says so
  let was=null;ACC.sub(()=>{try{SRVN.render();const k=ACC.signed()?'in':'out';if(k!==was){was=k;SRVN.load(true)}else if(SRVN.ban())SRVN.popup()}catch(e){console.error(e)}});
  setInterval(()=>{if(G.st==='menu'&&!document.hidden)SRVN.load(false)},60e3);
})();
