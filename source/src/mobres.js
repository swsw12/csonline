'use strict';
// ============ the results on a phone (v6.79) ============
// The owner's 1번 after the phone rooms: on a phone held sideways the results ran twice the screen tall — the table started under the
// MVP card and the buttons (kept on screen, sticky) sat over its first rows, so the scores needed a scroll. With moblob.js's
// html[data-lob] = 'l', after every draw of the results its parts are put in two columns over a button bar (the markup and the boxes
// other modules add stay as they are; they find them by class inside #results):
//   .rsL — the title, the score (a chapter's result in the scenario), the coins / missions / achievements / hall-of-fame boxes and the
//          MVP, scrolling on its own when it runs long;
//   .rsT — the table (대인전's two team tables), its header row held at the top and the player's own row brought into view.
// A box added later at the top of #results (a module that found no score line) goes into .rsL. Upright, the results stay one column.
const MRES={obs:null,
  lob(){return document.documentElement.dataset.lob||''},
  res(){return document.getElementById('results')},
  // the two columns, sideways only
  build(){const r=this.res();if(!r)return;if(this.lob()!=='l'){this.flat(r);return}if(r.querySelector(':scope>.rsL'))return;
    const bt=r.querySelector(':scope>.mbtns'),L=document.createElement('div'),T=document.createElement('div');L.className='rsL';T.className='rsT';
    for(const e of [...r.children]){if(e===bt)continue;(e.matches('table.tbl,.pvSide')?T:L).appendChild(e)}
    r.insertBefore(L,bt||null);r.insertBefore(T,bt||null);r.classList.add('mres');this.watch(r);
    // (the player's row in the middle of the table's view)
    const me=T.querySelector('tr.me');if(me&&T.scrollHeight>T.clientHeight)T.scrollTop=Math.max(0,me.offsetTop-(T.clientHeight-me.offsetHeight)/2)},
  // back to one column, in the order the parts had (turned upright, a window made bigger)
  flat(r){const L=r.querySelector(':scope>.rsL'),T=r.querySelector(':scope>.rsT');if(!L&&!T){r.classList.remove('mres');return}
    const bt=r.querySelector(':scope>.mbtns');for(const box of [L,T])if(box){for(const e of [...box.children])r.insertBefore(e,bt||null);box.remove()}
    r.classList.remove('mres')},
  // a box put straight into #results while the columns are there joins the left one, under the score
  watch(r){if(this.obs||typeof MutationObserver==='undefined')return;
    this.obs=new MutationObserver(ms=>{if(!r.classList.contains('mres'))return;const L=r.querySelector(':scope>.rsL');if(!L)return;
      for(const m of ms)for(const n of m.addedNodes){if(n.nodeType!==1||n.parentNode!==r||n.matches('.rsL,.rsT,.mbtns'))continue;
        const fs=L.querySelector(':scope>.finalScore')||L.querySelector(':scope>h2');if(fs)fs.after(n);else L.prepend(n)}});
    this.obs.observe(r,{childList:true})},
  // the phone turned while the results show
  relay(){if(UI.open==='results')this.build()}};
(function(){
  const sr=UI.showResults;UI.showResults=function(){const r=sr.apply(this,arguments);try{MRES.build()}catch(e){console.error(e)}return r};
})();
