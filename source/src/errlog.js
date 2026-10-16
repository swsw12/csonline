'use strict';
// ============ Error reports (v6.65): an error on a player's page goes to the admin page's 「오류 기록」 (supabase qz_err_report) ============
// What goes: errors nobody caught (window error), promises left failing (unhandledrejection), the boot or a frame that failed (main.js:
// ERRLOG.report(e,'boot' | 'frame')) and errors the game caught and only logged (console.error with an Error in it). Each kind once a
// page, 8 a page at most, one every 2 s; a network failure or a server's answer (account.js errors carry .net / .status, PeerJS ones
// .type) is not a bug and stays out. Nothing about the player goes: the message, the first lines of the stack (addresses cut to the
// file name), where it came from, the game's version, a little context (mode, map, the match's state, solo / host / guest, the gore
// level, render scale, touch, language) and the browser's user agent. It goes as a guest (the publishable key, no sign-in token), so
// the server cannot tie it to an account either. Off without Supabase (SB.url), on file:// pages, with Options → 게임플레이 → 오류 자동 보고
// off (CFG.errRep false) and with localStorage qz_noerr set.
// (Built right after util.js and sb.js so it is listening before the rest of the game runs.)
const ERRLOG={seen:new Set(),objs:new WeakSet(),n:0,q:[],busy:false,last:0,MAX:8,GAP:2000,
  NOISE:/Failed to fetch|NetworkError|Load failed|network error|ERR_[A-Z_]{4,}|AbortError|The user aborted|The operation was aborted|^Script error\.?$/i,
  PEER:/^(peer-unavailable|network|server-error|socket-error|socket-closed|disconnected|unavailable-id|invalid-id|invalid-key|browser-incompatible|webrtc|negotiation-failed|connection-closed|ssl-unavailable)$/,
  on(){try{if(typeof SB==='undefined'||!SB.url||!SB.key||location.protocol==='file:'||LS.get('noerr',false))return false}catch(e){return false}
    try{if(CFG.errRep===false)return false}catch(e){}return true},// (CFG is not there yet while the page is still starting: an error then still goes)
  clip(s,n){s=String(s==null?'':s);return s.length>n?s.slice(0,n):s},
  // the stack's first 8 lines, each address cut to its file name and position: (index.html:12:345)
  stackOf(e){const s=e&&e.stack?String(e.stack):'';return s.replace(/\(?(?:https?|blob|file):\/\/[^\s)]*\/([^\/\s)]*:\d+:\d+)\)?/g,'($1)').split('\n').slice(0,8).map(l=>l.trim()).filter(Boolean).join('\n')},
  ver(){try{return typeof PATCH!=='undefined'&&PATCH[0]?String(PATCH[0][0]):''}catch(e){return ''}},
  ctx(){const c={};try{if(typeof G!=='undefined'&&G){c.mode=G.mode||null;c.st=G.st||null}if(typeof MAP!=='undefined'&&MAP)c.map=MAP.id||null;
      if(typeof NET!=='undefined'&&NET)c.net=NET.on?(NET.host?'host':'guest'):'solo';if(typeof GORE!=='undefined')c.gore=GORE.lv;if(typeof R!=='undefined'&&R&&R.scale)c.scale=R.scale;
      if(typeof TOUCH!=='undefined'&&TOUCH)c.touch=!!TOUCH.on;if(typeof LANG!=='undefined')c.lang=LANG}catch(e){}return c},
  report(e,src){try{if(!e)return;src=String(src||'log');
      if(typeof e==='object'){if(this.objs.has(e))return;try{this.objs.add(e)}catch(x){}if(e.net||e.status||(typeof e.type==='string'&&this.PEER.test(e.type)))return}
      const msg=this.clip(typeof e==='string'?e:(e.name&&e.message&&e.name!=='Error'?e.name+': '+e.message:(e.message||String(e))),300).trim();if(!msg||this.NOISE.test(msg))return;
      const stack=typeof e==='object'?this.stackOf(e):'',key=src+'|'+msg+'|'+stack.split('\n').slice(0,3).join('|');if(this.seen.has(key))return;this.seen.add(key);
      if(this.n>=this.MAX||!this.on())return;this.n++;
      this.q.push({p_msg:msg,p_stack:stack||null,p_src:src,p_ver:this.ver(),p_ctx:this.ctx(),p_ua:this.clip(typeof navigator!=='undefined'&&navigator.userAgent||'',200)});this.flush()}catch(x){}},
  flush(){if(this.busy||!this.q.length)return;if(!this.on()){this.q.length=0;return}
    const wait=this.last+this.GAP-Date.now();if(wait>0){this.busy=true;setTimeout(()=>{this.busy=false;this.flush()},wait);return}
    const a=this.q.shift(),done=()=>{this.busy=false;if(this.q.length)this.flush()};this.last=Date.now();this.busy=true;
    try{fetch(SB.url.replace(/\/+$/,'')+'/rest/v1/rpc/qz_err_report',{method:'POST',keepalive:true,headers:{apikey:SB.key,'Content-Type':'application/json'},body:JSON.stringify(a)}).then(done,done)}catch(x){done()}}};
addEventListener('error',ev=>{if(!ev)return;if(ev.error)ERRLOG.report(ev.error,'window');else if(ev.message)ERRLOG.report({message:ev.message,stack:(ev.filename||'')+':'+(ev.lineno|0)+':'+(ev.colno|0)},'window')});
addEventListener('unhandledrejection',ev=>{const r=ev&&ev.reason;if(r&&typeof r==='object'&&r.message)ERRLOG.report(r,'promise')});
{const ce=console.error.bind(console);console.error=function(...a){ce(...a);try{const e=a.find(x=>x instanceof Error);if(e)ERRLOG.report(e,'log')}catch(x){}}}
