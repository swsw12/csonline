'use strict';
// ============ Reloads v2: every reload is a clip on the first-draw engine (vmdraw.js) ============
// The free hand takes a fresh magazine from the belt (below the screen) and brings it up into the gun; the old one drops out
// and falls, tumbling. A reload from empty finishes the gun's own way: the pistol slide that was locked back slams home, the
// M4's bolt catch is tapped, an AK / MP5 / Scout / MAC-10 is charged with its first-draw action. Shotguns are fed shell by
// shell with a shell in the hand, revolvers take a speed loader, break actions two shells, belt-fed guns a new box and belt.
// Timings stay the game's (W.reload, W.relStart, W.shellRel); the sounds that used to be timers in game.js are clip events.

// ---- putting clips together ----
// shift a clip into [u0,u1] of a longer one
function fdRemap(S,u0,u1){const f=u=>u0+u*(u1-u0),T=rows=>rows&&rows.map(r=>[f(r[0]),...r.slice(1)]);
  const H=h=>{if(!h)return h;const o=Object.assign({},h,{k:T(h.k),_wt:undefined,_b:undefined,_a0:undefined,_rm:undefined});o.elbs=h.elbs?h.elbs.map(e=>[f(e[0]),f(e[1]),e[2]]):h.elb?[[u0,u1,h.elb]]:null;delete o.elb;return o};
  return Object.assign({},S,{G:T(S.G),D:T(S.D),C:T(S.C),vib:T(S.vib),H:H(S.H),R:H(S.R),E:T(S.E),
    parts:S.parts&&S.parts.map(p=>Object.assign({},p,{k:T(p.k),rel:p.rel==null?p.rel:f(p.rel)})),
    spins:S.spins&&S.spins.map(p=>Object.assign({},p,{kick:T(p.kick),motor:T(p.motor),stop:p.stop==null?p.stop:f(p.stop)})),
    props:S.props&&S.props.map(p=>Object.assign({},p,{on:p.on.map(r=>[f(r[0]),f(r[1])])}))})}
// join two clips that were remapped onto [0,m] and [m,1]
function fdMerge(A,B,m){const g6=(a,b)=>[K6(a),K6(b)],g1=(a,b)=>[[a,0],[b,0]],g3=(a,b)=>[[a,0,0,0],[b,0,0,0]];
  const tr=(k,rest)=>(A[k]||rest(0,m)).concat(B[k]||rest(m,1));
  const o={G:tr('G',g6),C:tr('C',g3),vib:A.vib||B.vib?tr('vib',g1):null,E:(A.E||[]).concat(B.E||[]),
    parts:(A.parts||[]).concat(B.parts||[]),spins:(A.spins||[]).concat(B.spins||[]),props:(A.props||[]).concat(B.props||[]),eng0:A.eng0!=null?A.eng0:B.eng0};
  if(A.D||B.D){o.D=tr('D',g1);o.DP=A.DP||B.DP}
  for(const k of ['H','R']){const a=A[k],b=B[k];if(!a&&!b)continue;const rest=k==='H'?{sup:1}:{grip:1};
    const ha=a||{A:[rest],k:[HK(0,0),HK(m,0)],elbs:null},hb=b||{A:[rest],k:[HK(m,0),HK(1,0)],elbs:null};const off=ha.A.length;
    o[k]={A:ha.A.concat(hb.A),k:ha.k.concat(hb.k.map(r=>{const q=r.slice();q[1]+=off;return q})),elbs:(ha.elbs||[[0,m,null]]).concat(hb.elbs||[[m,1,null]])}}
  return o}

// ---- what kind of reload a gun gets ----
function rlKind(W,G){const id=W.model;
  if(W.dual)return 'dual';if(id==='r6')return 'rev';if(W.brk)return 'brk';if(id==='hmg'||id==='mg6')return 'belt';
  if(id==='xbow'||id==='xbowa')return 'rail';if(id==='pd50'||id==='airb')return 'top';if(id==='sterling')return 'side';
  if(!G.parts.some(p=>p.tag==='mag')||id==='bhole'||id==='ripper')return 'gen';return 'mag'}
// the gun's pose while a magazine is changed: tipped so the well faces the free hand (pistols come up into view)
// (raised and turned side-on, so the well, the falling magazine and the hand bringing the fresh one are all on screen)
// (the big ones come up and round further, or the well and the hand under it stay below the screen)
const RL_POSE={mdrill:[-.12,.15,-.06,.35,.3,-.45],volc:[-.12,.15,-.06,.35,.3,-.45],gx6:[-.11,.15,-.05,.25,.35,-.35]};
function rlPose(W){const T=window.__RLT;if(T&&T.pose)return T.pose;if(RL_POSE[W.model])return RL_POSE[W.model];return W.hold==='pistol'?[-.09,.12,-.05,.1,.4,-.3]:W.kind==='mg'?[-.07,.07,-.04,.14,.2,-.22]:[-.085,.095,-.04,.3,.2,-.28]}
const rlS=(L,x)=>x/L;// seconds → u

// ---- a magazine change (below the gun, on top of it, or in its side) ----
// o.style 'drop' (falls free), 'pull' (the hand takes it out and carries it off); o.ax the way out of the well (gun space)
function rlMag(W,G,m,L,o){o=o||{};const E=fdExt(G,'mag'),mp=G.parts.find(p=>p.tag==='mag'),rx=(mp&&mp.rx)||0;
  const ax=o.ax||[0,-Math.cos(rx),-Math.sin(rx)],pull=o.style==='pull';const pist=W.hold==='pistol';
  // where the palm goes on the magazine: its base (or its outer side / top for side and top magazines)
  const gp=o.gp||[E.c[0],E.mn[1],(E.mn[2]+E.mx[2])/2],sl=o.on||[0,-.024,0],bk=o.bk||[-.2,-1,0];
  // a rifle magazine is carried by its body (palm on its left side, fingers round it), a short one by its base; both are slapped on the base
  const hgt=E.mx[1]-E.mn[1],body=!o.on&&!pist&&hgt>.09,on=body?[-.026,hgt*.35,0]:sl,bkB=body?[-1,-.25,0]:bk;
  const pouch=o.pouch||[pist?-.07:-.1,pist?-.34:-.42,pist?.06:.1];// a magazine pouch on the belt, well below the screen
  const pr=o.pose||rlPose(W),pp=u=>K6(u,...pr),bump=(u,k)=>K6(u,pr[0],pr[1]+.012*k,pr[2],pr[3]-.04*k,pr[4],pr[5]+.03*k);
  const r0=.08,fall=r0+rlS(L,.3),pk=Math.min(.36,Math.max(fall+.03,.27)),up0=pk+.07,en=.6,ap=Math.max(up0+.06,en-.13),seat=.64,slap=body?.705:.665,back=.86;
  // the magazine: out along the well, then falling (or carried) to the pouch; the fresh one comes up from it, enters, is seated
  const dis=(c)=>{const a=ax[c],P=pouch[c];
    return pull?[[0,0],[r0,0],[r0+.06,a*.07],[pk,P],[up0,P],[ap,a*.15],[en,a*.06],[seat,0,1]]
               :[[0,0],[r0,0],[r0+rlS(L,.05),a*.035],[fall,a*.035+(c===1?-.5:c===2?.05:-.02),1],[fall+.004,P],[up0,P],[ap,a*.15],[en,a*.06],[seat,0,1]]};
  const parts=[{tag:'mag',ch:'px',k:dis(0)},{tag:'mag',ch:'py',k:dis(1)},{tag:'mag',ch:'pz',k:dis(2)}];
  if(!pull)parts.push({tag:'mag',ch:'rx',k:[[0,0],[r0+rlS(L,.05),0],[fall,.9,1],[fall+.004,0]]},{tag:'mag',ch:'rz',k:[[0,0],[r0+rlS(L,.05),0],[fall,-.35,1],[fall+.004,0]]});
  else parts.push({tag:'mag',ch:'rx',k:[[0,0],[r0+.06,0],[pk,.5],[up0,.5],[en,0]]});
  const A=[{sup:1},{tag:'mag',at:gp},{p:[gp[0]+pouch[0],gp[1]+pouch[1],gp[2]+pouch[2]]}];
  const H=pull?[HK(0,0),HK(.03,0),HK(r0-.03,1,[on[0]*1.6,on[1]*1.6,on[2]],.8,bk,.3),HK(r0,1,on,1,bk,.85),HK(r0+.06,1,on,1,bk,.9)]
              :[HK(0,0),HK(r0,0),HK(r0+.08,2,[0,.1,-.02],.7,[-1,-.3,0],.4)];
  H.push(HK(pk,2,on,1,bkB,.8),HK(pk+.035,2,on,1,bkB,.82),HK(up0,1,on,1,bkB,.85),HK(en,1,on,1,bkB,.85),HK(seat,1,on,1,bkB,.7),
    HK(seat+(body?.035:.016),1,[sl[0],sl[1]-.03,sl[2]],1,bk,.1),HK(slap,1,[sl[0],sl[1]+.002,sl[2]],1,bk,.05),HK(slap+.03,1,[sl[0],sl[1]-.02,sl[2]],1,bk,.3),
    HK(back-.08,0,[-.03,-.04,.03],.5,[-1,0,0],.6),HK(back,0),HK(1,0));
  return {G:[K6(0),K6(.05,.004,-.008,0,-.03,-.02,.04),pp(.16),pp(en-.04),bump(seat,.6),bump(slap+.01,1),pp(slap+.08),K6(back+.04,.004,-.003,.002,-.01,-.01,.02),K6(1)],
    H:{A,k:H},parts,
    E:[[r0,'magout',.6,pist?1.15:1],[seat-rlS(L,.07),'magin',.65,pist?1.15:1],[slap,'fdgrab',.55,1.2,[.24,-.6,-.3],[.008,0,-.006]]],
    C:[[0,0,0,0],[.16,.006,.004,-.012],[en,.008,.004,-.014],[slap+.02,.004,.002,-.008],[back+.04,0,0,0],[1,0,0,0]]}}

// ---- the dual Berettas: both magazines drop, the guns dip to the belt and come back loaded ----
function rlDual(W,G,m,L,empty){const d=(WPN[W.model]&&WPN[W.model].fd&&WPN[W.model].fd.d)||.04,r0=.1,fall=r0+rlS(L,.3),dn=.3,low=.42,upU=.6,seat=.64;
  const mk=(two,dt)=>[{tag:'mag',two,ch:'py',k:[[0,0],[r0+dt,0],[fall+dt,-.5,1],[fall+dt+.004,-.06],[upU,-.06],[seat+dt,0,1]]},{tag:'mag',two,ch:'rx',k:[[0,0],[r0+dt,0],[fall+dt,.8,1],[fall+dt+.004,0]]}];
  const parts=[...mk(0,0),...mk(1,.02)],nl=!!(WPN[W.model]&&WPN[W.model].fd&&WPN[W.model].fd.nolock);// nolock: the handles stayed forward, the bolt catch lets the bolts go
  if(empty&&!nl)parts.push({tag:'slide',ch:'pz',k:[[0,d],[.8,d]],rel:.8,A:1200,e:.2,home:['fdslam',.85,1.08,[.2,-.6,0],[.01,0,0]]},
                      {tag:'slide',two:1,ch:'pz',k:[[0,d],[.83,d]],rel:.83,A:1200,e:.2,home:['fdslam',.8,.98,[.15,-.4,0]]});
  return {G:[K6(0),K6(.08,0,.02,0,.12,0,0),K6(r0+.05,0,.03,0,.2,0,0),K6(dn,0,-.08,.02,-.2,0,0),K6(low,0,-.3,.05,-.5,0,0),K6(upU-.06,0,-.28,.05,-.45,0,0),
      K6(seat,0,-.02,0,.05,0,0),K6(seat+.06,0,.012,0,.1,0,0),K6(.8,0,.006,0,.06,0,0),K6(.9,0,-.004,0,-.01,0,0),K6(1)],
    D:[[0,0],[r0,0],[r0+.06,1],[dn,1],[dn+.06,0],[1,0]],DP:[.02,.0,0,-.15,0,-.5],parts,
    E:[[r0,'magout',.6,1.1],[r0+.02,'magout',.5,1.05],[seat-rlS(L,.07),'magin',.6,1.1],[seat+.02-rlS(L,.07),'magin',.55,1.05],...(empty&&nl?[[.8,'fdslam',.8,1.12,[.2,-.6,0],[.01,0,0]],[.83,'fdslam',.75,1.02,[.15,-.4,0]]]:[])],
    C:[[0,0,0,0],[r0+.05,.006,0,0],[low,-.01,0,0],[seat,.004,0,0],[1,0,0,0]]}}

// ---- revolver: crane out, empties out (muzzle up, a slap on the ejector), a speed loader, crane shut ----
function rlRev(W,G,m,L){const C=fdExt(G,'mag'),cx=C.mn[0],cy=(C.mn[1]+C.mx[1])/2,cz=(C.mn[2]+C.mx[2])/2,rear=[cx-.028+.012,cy-.012,C.mx[2]+.004];
  const o0=.12,o1=.2,ej=.32,ld0=.46,ld1=.62,cl=.7,bk=[-1,-.2,0];
  return {
    G:[K6(0),K6(.06,.004,-.006,0,-.03,-.05,.04),K6(o0,-.045,.04,-.015,.12,.6,.15),K6(o1+.04,-.045,.045,-.015,.3,.55,.1),K6(ej-.03,-.04,.08,.0,1.0,.4,.0),K6(ej+.04,-.04,.075,0,.9,.4,0),
       K6(ld0-.02,-.045,.03,-.02,-.3,.55,.2),K6(ld1,-.045,.032,-.02,-.25,.56,.2),K6(cl-.02,-.045,.035,-.02,-.05,.58,.15),K6(cl+.04,-.04,.045,-.012,.16,.5,-.2),K6(.86,.004,-.004,.002,-.01,-.02,.02),K6(1)],
    H:{A:[{sup:1},{tag:'mag',at:[cx,cy,cz]},{p:[cx-.028,cy-.012,cz]},{tag:'mag',at:rear},{p:[-.1,-.36,.08]}],k:[HK(0,0),HK(.05,0),
       HK(o0-.02,1,[-.03,-.04,.01],.7,[-1,-.3,0],.3),HK(o0+.02,1,[-.02,-.008,0],1,bk,.55),HK(o1+.02,1,[-.02,-.008,0],1,bk,.6),// push the crane out
       HK(ej-.04,2,[-.02,.03,-.05],1,[-1,.3,0],.1),HK(ej,2,[-.01,.01,-.06],1,[-1,.3,0],.05),HK(ej+.04,2,[-.03,.02,-.06],1,[-1,.3,0],.2),// palm on the ejector
       HK(ld0-.06,4,[0,0,0],.8,[0,-1,0],.7),HK(ld0+.04,3,[-.004,-.004,.032],1,[0,-1,.4],.8),HK(ld1-.06,3,[0,-.004,.026],1,[0,-1,.4],.8),// the loader to the cylinder
       HK(ld1,3,[0,-.004,.026],1,[-.4,-1,.4],.7),HK(ld1+.04,3,[-.02,-.03,.05],.9,[-1,-.3,0],.3),// twist, let go
       HK(cl-.03,1,[-.026,-.004,0],1,bk,.5),HK(cl,1,[-.02,-.004,0],1,bk,.6),HK(cl+.06,1,[-.04,-.02,.02],.8,bk,.4),HK(.86,0),HK(1,0)]},// push it shut
    parts:[{tag:'mag',ch:'px',k:[[0,0],[o0,0],[o1,-.03,1],[o1+.03,-.027],[o1+.06,-.028],[cl-.03,-.028],[cl,0,1]]},{tag:'mag',ch:'py',k:[[0,0],[o0,0],[o1,-.013,1],[o1+.03,-.0115],[o1+.06,-.012],[cl-.03,-.012],[cl,0,1]]}],
    spins:[{tag:'mag',ch:'rz',kick:[[cl,22]],fric:5,stop:cl+.12,snap:TAU/6}],
    props:[{arm:'L',kind:'loader',on:[[ld0-.08,ld1]],pos:[0,-.03,-.07],rot:[0,0,0]}],
    E:[[o0,'brk',.5,1.6],[ej,'shellcase',.45,1.1],[ej+.03,'shellcase',.4,1.2],[ld1-.04,'magin',.6,1.3],[ld1,'dry',.4,1.6],[cl,'brk',.7,1.35,[.12,0,.5],[.006,0,.01]]],
    C:[[0,0,0,0],[o0,.008,.006,.01],[ej,.03,.004,0],[ld0,-.01,.006,.01],[cl,.006,0,-.006],[.9,0,0,0],[1,0,0,0]]}}

// ---- break action: open, the empties kicked out, two fresh shells pushed into the chambers, flicked shut ----
function rlBrk(W,G,m,L){const op=(W.fd&&W.fd.open)||.62,two=W.mag>1,E=fdExt(G,'mag'),sup=G.sup||[0,0,-.22],br=[0,(E.mn[1]+E.mx[1])/2+.01,E.mx[2]];
  const o0=.08,o1=.16,ej=.2,ld0=.36,ld1=.55,cl=.66;
  return {
    G:[K6(0),K6(.05,.003,-.006,0,-.02,-.03,-.03),K6(o0+.04,-.06,.01,-.04,-.02,.5,.08),K6(ej+.02,-.062,.02,-.045,.08,.5,.1),K6(ld0,-.064,.0,-.045,-.08,.52,.12),K6(ld1,-.064,.0,-.045,-.06,.53,.12),
       K6(cl,-.058,.035,-.045,.22,.48,.06),K6(cl+.06,-.062,.022,-.045,-.02,.51,.09),K6(.88,.004,-.004,.002,-.012,-.02,.02),K6(1)],
    H:{A:[{tag:'mag',at:sup},{tag:'mag',at:br},{p:[-.1,-.4,.1]}],k:[HK(0,0),HK(o1,0),HK(ej+.02,0,[0,-.006,0],.3,[0,-1,.3],.9),HK(ej+.08,2,[0,0,0],.8,[-1,-.3,0],.6),
       HK(ld0-.02,1,[-.02,-.04,.05],1,[0,-1,.5],.7),HK(ld0+.05,1,[0,-.012,.03],1,[0,-1,.6],.7),HK(ld1-.04,1,[0,-.008,.012],1,[0,-1,.6],.6),HK(ld1,1,[0,-.008,.006],1,[0,-1,.6],.4),// thumb the shells in
       HK(ld1+.05,0,[0,-.03,.03],.6,[0,-1,.3],.7),HK(cl-.02,0,null,0,null,.9),HK(1,0)]},
    parts:[{tag:'aux',ch:'ry',k:[[0,0],[o0-.04,0],[o0,.5,1],[cl,.5],[cl+.03,0]]},
           {tag:'mag',ch:'rx',k:[[0,0],[o0,0],[o1,-op*1.06,1],[o1+.03,-op*.95],[o1+.06,-op]],rel:cl,A:240,e:.16,home:['brk',.95,.82,[.22,1.1,0],[-.016,0,0]]}],
    props:[{arm:'L',kind:two?'shell2':'shell',on:[[ej+.1,ld1]],pos:[0,-.032,-.07],rot:[Math.PI/2,0,0]}],
    E:[[o0,'brk',.55,1.05],[ej,'shellcase',.5,.9],[ej+.02,'shellcase',.45,1],[ld1-.04,'shellin',.6,.9],[ld1,'shellin',.55,1]],
    C:[[0,0,0,0],[o1,.01,0,-.008],[ld1,.012,0,-.01],[cl,-.006,0,0],[.88,0,0,0],[1,0,0,0]]}}

// ---- side magazine (Sterling, on the left): pulled out sideways, the fresh one pushed in from the left ----
function rlSide(W,G,m,L){const E=fdExt(G,'mag');return rlMag(W,G,m,L,{style:'pull',ax:[-1,0,0],gp:[E.mn[0],(E.mn[1]+E.mx[1])/2,(E.mn[2]+E.mx[2])/2],on:[-.022,0,0],bk:[-1,.3,0],
  pouch:[-.14,-.38,.08],pose:[-.035,.02,.0,.08,-.06,.32]})}
// ---- magazine on top (P90, the air tank): lifted off backwards, the fresh one laid on and pressed down ----
function rlTop(W,G,m,L){const E=fdExt(G,'mag');return rlMag(W,G,m,L,{style:'pull',ax:[0,.7,.7],gp:[E.c[0],E.mx[1],(E.mn[2]+E.mx[2])/2+.02],on:[0,.026,0],bk:[0,1,0],
  pouch:[-.1,-.36,.12],pose:[-.035,.0,.0,-.06,.1,.3]})}
// ---- crossbow: a bolt laid onto the rail and pushed home until it clicks ----
function rlRail(W,G,m,L){const E=fdExt(G,'mag'),tail=[E.c[0],E.mx[1],E.mx[2]-.01];const a=.18,b=.48,c=.56;
  return {G:[K6(0),K6(.05,.003,-.006,0,-.02,-.02,-.02),K6(.16,-.02,.012,-.01,.18,.05,.12),K6(c+.06,-.018,.01,-.008,.16,.05,.12),K6(.86,.003,-.004,.002,-.01,-.02,-.01),K6(1)],
    H:{A:[{sup:1},{tag:'mag',at:tail},{p:[-.12,-.35,.1]}],k:[HK(0,0),HK(.04,0),HK(.1,2,[0,0,0],.8,[-1,0,0],.6),HK(a,1,[-.012,.022,.006],1,[-.3,1,0],.8),HK(b,1,[-.012,.022,.006],1,[-.3,1,0],.8),
       HK(c,1,[-.012,.016,.006],1,[-.3,1,0],.7),HK(c+.05,1,[-.03,.05,.03],.9,[-.3,1,0],.3),HK(.84,0),HK(1,0)]},
    parts:[{tag:'mag',ch:'px',k:[[0,-.2],[.1,-.2],[a,-.02],[b,0]]},{tag:'mag',ch:'py',k:[[0,-.3],[.1,-.3],[a,.05],[b-.08,.012],[b,0]]},{tag:'mag',ch:'pz',k:[[0,.25],[.1,.25],[a,.16],[b-.05,.02],[c,0,1]]}],
    E:[[a+.04,'slide',.45,.6],[c,'dry',.6,.7,[.1,-.3,0],[.006,0,0]]],
    C:[[0,0,0,0],[.16,.01,0,.006],[.86,0,0,0],[1,0,0,0]]}}
// ---- belt-fed: the ammo box swapped, then the first-draw sequence (cover up, belt in, cover slammed, handle) ----
function rlBelt(W,G,m,L){const sw=.36,A0=rlMag(W,G,m,L*sw,{pose:[-.04,.0,-.02,.06,.12,-.2],pouch:[-.06,-.42,.1]});
  return fdMerge(fdRemap(A0,0,sw),fdRemap(FDS.belt(W.fd||{},G,m,L*(1-sw)),sw,1),sw)}
// ---- anything else: tipped toward the hand, the hand does its work at the part, back ----
function rlGen(W,G,m,L){const id=W.model,E=fdExt(G,G.parts.some(p=>p.tag==='mag')?'mag':'spin'),tp=[E.c[0],E.mx[1],(E.mn[2]+E.mx[2])/2];
  const a=.2,b=.62,can=id==='ripper',orb=id==='bhole';
  const S={G:[K6(0),K6(.06,.003,-.006,0,-.02,-.02,-.02),K6(.18,-.035,.02,-.01,.14,.12,-.3),K6(b,-.035,.022,-.01,.12,.13,-.32),K6(.86,.003,-.004,0,-.01,-.02,.01),K6(1)],
    H:{A:[{sup:1},{p:tp},{p:[-.1,-.36,.08]}],k:[HK(0,0),HK(.05,0),HK(.12,2,[0,0,0],.8,[-1,-.3,0],.6),HK(a,1,[-.012,.04,.01],1,[-.2,1,0],.4),HK(a+.08,1,[-.008,.03,0],1,[-.2,1,0],.7),
       HK(b-.08,1,[-.008,.03,0],1,[-.4,1,0],.7),HK(b,1,[-.02,.05,.02],1,[-.2,1,0],.3),HK(.84,0),HK(1,0)]},
    E:[[a+.06,can?'dry':'magout',.5,.8],[b-.1,can?'hiss':'magin',.6,.8],[b-.04,'dry',.5,1.1,[.08,-.25,0]]],
    C:[[0,0,0,0],[.2,.008,.004,-.01],[.86,0,0,0],[1,0,0,0]]};
  if(can)S.props=[{arm:'L',kind:'can',on:[[.12,b-.02]],pos:[0,-.04,-.06],rot:[0,0,0]}];
  if(orb)S.parts=[{tag:'mag',ch:'s',k:[[0,0],[a,0],[a+.12,-.95],[b-.15,-.95],[b,.12],[b+.08,0]]}];
  return S}

// ---- after a mag change from empty: the gun's own way of chambering the first round ----
// a pistol's slide stays back (locked) through the change and is released; the M4's bolt catch is slapped; others are charged
function rlEmptyAct(W){const fd=W.fd||{};if(W.dual||W.brk||!fd.act)return null;
  if(fd.act==='slide')return 'release';if(fd.act==='ar')return 'catch';if(['charge','hk','bolt'].includes(fd.act))return fd.act;return null}
function rlBuild(W,G,m,L,empty){const k=rlKind(W,G),fx=empty?rlEmptyAct(W):null;
  if(k==='dual')return rlDual(W,G,m,L,empty);if(k==='rev')return rlRev(W,G,m,L);if(k==='brk')return rlBrk(W,G,m,L);if(k==='belt')return rlBelt(W,G,m,L);
  const mag=t=>k==='side'?rlSide(W,G,m,t):k==='top'?rlTop(W,G,m,t):k==='rail'?rlRail(W,G,m,t):k==='gen'?rlGen(W,G,m,t):rlMag(W,G,m,t);
  if(!fx)return mag(L);
  if(fx==='release'||fx==='catch'){// the change runs to .72, then a thumb drops the slide / the palm slaps the catch
    const S=fdRemap(mag(L*.74),0,.74),d=W.fd.d||.045;S.G=S.G.slice(0,-1).concat([K6(.79,-.01,.03,0,.12,.06,-.08),K6(.84,0,.012,0,-.02,.02,-.02),K6(1)]);
    if(fx==='release'){S.parts.push({tag:'slide',ch:'pz',k:[[0,d],[.78,d]],rel:.78,A:1300,e:.22,home:['fdslam',.9,1.05,[.26,-.75,.15],[.012,0,.008]]})}
    else{const E=fdExt(G,'mag'),bc=[E.mn[0]-.004,E.mx[1]+.03,E.c[2]+.02];const H=S.H;H.A.push({p:bc});const i=H.A.length-1;
      H.k=H.k.filter(r=>r[0]<=.72).concat([HK(.75,i,[-.03,.02,.02],1,[-1,.2,0],.3),HK(.78,i,[-.018,.004,0],1,[-1,.2,0],.15),HK(.81,i,[-.035,.02,.02],1,[-1,.2,0],.3),HK(.92,0),HK(1,0)]);
      S.E.push([.78,'fdhome',.85,1.05,[.25,-.6,.1],[.011,0,.006]])}
    return S}
  const sp=fx==='bolt'?.6:.6;// the rack takes the last 40 %
  return fdMerge(fdRemap(mag(L*sp),0,sp),fdRemap(FDS[fx](W.fd,G,m,L*(1-sp)),sp,1),sp)}

// ---- shell by shell (pump / tube shotguns, dragon cannons, the harpoon gun) ----
// 'start' tips the gun and fetches the first shell; every 'shell' pushes one in and fetches the next; the last one goes home
// (and racks the gun if it was loaded from empty)
function rlShellSpec(W,G,m,L,ph,empty){const id=W.model,drg=id==='bdc'||id==='rdc',hp=id==='gaebolg';
  const E=drg||hp?fdExt(G,'mag'):null;
  const port=hp?[0,E.mx[1],E.mx[2]-.03]:drg?[E.c[0],E.mn[1]-.004,E.c[2]]:[0,-.035,-.1];// where the shell goes in
  const T=window.__RLT,pose=T&&T.spose?T.spose:hp?[-.03,.03,.1,.06,.3,-.12]:drg?[-.07,.08,-.01,.2,.12,-.55]:[-.07,.08,-.01,.2,.12,-.55];// raised and canted so the port and the hand are in view
  const into=hp?[0,0,.06]:[0,.035,0],on=hp?[-.014,.022,0]:[0,-.02,.0],bk=hp?[-.5,1,0]:[0,-1,0],pouch=(W.shellRel||.5)<.4?[-.07,-.22,.06]:[-.1,-.34,.08];// fast feeders keep the next shell close
  const prop={arm:'L',kind:hp?'bolt':'shell',pos:hp?[0,-.03,-.07]:[0,-.03,-.075],rot:hp?[0,0,0]:[0,Math.PI/2,0]};
  const A=[{tag:drg?'mag':'pump',at:G.sup||[0,0,-.3],ride:drg?0:1},{p:port},{p:[port[0]+pouch[0],port[1]+pouch[1],port[2]+pouch[2]]}];
  if(!m.tags.pump)A[0]={sup:1};
  const pp=u=>K6(u,...pose);
  if(ph==='start')return {G:[K6(0),K6(.4,...pose.map(v=>v*.7)),pp(1)],H:{elb:hp?[-.2,-.6,-.4]:null,A,k:[HK(0,0),HK(.25,2,[0,0,0],.8,[-1,-.3,0],.5),HK(.75,2,[0,0,0],.9,bk,.6),HK(1,1,[on[0]-into[0]*1.2,on[1]-into[1]*1.2,on[2]-into[2]*1.2],1,bk,.7)]},
    props:[{...prop,on:[[.55,1]]}],C:[[0,0,0,0],[1,.006,0,-.01]],hold:.3};
  // one shell in: the push (with its click), the hand drops to the belt and comes back with the next
  const push=[HK(0,1,[on[0]-into[0]*1.2,on[1]-into[1]*1.2,on[2]-into[2]*1.2],1,bk,.7),HK(.16,1,on,1,bk,.55),HK(.22,1,[on[0],on[1]-.01,on[2]],1,bk,.3)];
  const E2=[[.12,'shellin',.6,.95+Math.random()*.1,[.06,-.12,0]]];
  if(ph==='shell')return {G:[pp(0),K6(.14,pose[0],pose[1]+.006,pose[2],pose[3]-.02,pose[4],pose[5]+.02),pp(.3),pp(1)],H:{elb:hp?[-.2,-.6,-.4]:null,A,
      k:push.concat([HK(.5,2,[0,0,0],.9,bk,.6),HK(.62,2,[0,0,0],.9,bk,.6),HK(1,1,[on[0]-into[0]*1.2,on[1]-into[1]*1.2,on[2]-into[2]*1.2],1,bk,.7)])},
    props:[{...prop,on:[[0,.16],[.6,1]]}],E:E2,C:[[0,.006,0,-.01],[.14,.008,0,-.008],[1,.006,0,-.01]],hold:.3};
  // the last one: in, then back to the grip
  const S={G:[pp(0),K6(.12,pose[0],pose[1]+.006,pose[2],pose[3]-.02,pose[4],pose[5]+.02),pp(.3),K6(.75,.004,-.004,.002,-.01,-.01,.01),K6(1)],
    H:{elb:hp?[-.2,-.6,-.4]:null,A,k:push.concat([HK(.6,0),HK(1,0)])},props:[{...prop,on:[[0,.16]]}],E:E2,C:[[0,.006,0,-.01],[.12,.008,0,-.008],[.75,0,0,0],[1,0,0,0]]};
  if(!empty||!(W.pump||(W.fd&&W.fd.act==='charge')))return S;
  const rk=W.pump?'pump':'charge';return fdMerge(fdRemap(S,0,.45),fdRemap(FDS[rk](W.fd,G,m,L*.55*2.2),.45,1),.45)}

// ---- hooks the game calls ----
VM.reload=function(W,dur,kind,empty){this.rel={t:0,d:dur,kind:kind||'mag'};this.slapped=false;this.act=null;this.rlEmpty=!!empty;
  const m=this.cur,G=W&&GUNS[W.model];if(!m||!G||this.id==='claw')return;
  try{const S=kind==='start'?rlShellSpec(W,G,m,dur,'start',empty):rlBuild(W,G,m,dur,!!empty);if(S){const A=this.playClip(S,0,dur,kind==='start'?'shell':'rl');if(A)A.rl=1}}catch(e){console.error(e);this.act=null}};
// a shell went in; last = no more to come; next = seconds to the next one
VM.shellIn=function(last,next){const W=WPN[this.id],m=this.cur,G=W&&GUNS[W.model];this.rel={t:0,d:.4,kind:'shell'};
  if(!m||!G){this.sp.py.v+=.12;return}const L=last?.5:Math.max(.2,next||W.shellRel||.45);
  try{const S=rlShellSpec(W,G,m,L,last?'last':'shell',this.rlEmpty);const A=this.playClip(S,0,last?(this.rlEmpty&&(W.pump||(W.fd&&W.fd.act==='charge'))?L*2.2:L):L,'shell');if(A)A.rl=1}catch(e){console.error(e);this.act=null}};
VM.stopReload=function(){this.rel=null;if(this.act&&this.act.rl)this.fadeClip(.12)};
