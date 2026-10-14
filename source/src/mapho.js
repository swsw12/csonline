'use strict';
// ============ Map "새벽 종합병원 Saebyeok General Hospital" (v6.54): a big general hospital at dawn, made for the zombie modes ============
// x runs east, z runs south; a storey is 4.2 m (1F 0, 2F 4.2, 3F 8.4, the roof 12.6). The main building (x −32…32, z −38…−8):
//  · 1F — the lobby under a three-storey glass atrium (reception, waiting seats, the escalator up), the pharmacy and the convenience store
//    (west), the administration and records rooms, the blood-draw room, the lab, X-ray and the outpatient waiting room (east), the stores
//    behind the lobby with the loading dock's doors;
//  · 2F — the galleries round the atrium, radiology (CT, MRI) west with the glass skybridge to the parking tower, the clinics east with the
//    door out onto the emergency wing's roof, the ICU behind its glass wall north, the lounge and its door out onto the entrance canopy;
//  · 3F — the ward (rooms 301–306, the nurse station) west, the operating suite (three theatres, scrub, recovery) east, the conference room;
//  · the roof — the helipad with the medical helicopter, air handlers, the skylight over the atrium, the big sign facing the plaza.
// Every wing has a racetrack of two corridors (z −31…−28 and −22…−19) joined at its far end. Two stairwells (north-west, north-east) run
// from 1F to the roof; the escalators climb the atrium (1F→2F west side, 2F→3F east side, across the void).
// East: the emergency wing (x 32…58) and its ambulance bay under a canopy; its roof is a terrace level with 2F (zombies can jump up from
// an ambulance's roof, people cannot). West: a three-deck parking tower (ramps up the middle, a stairwell in its north-east corner), joined
// to 2F by the skybridge over the service road. South: the drop-off loop round a fountain island, the bus stop and the car park (south-
// west), the quarantine checkpoint at the shut main gate, the healing garden with its pond, pergola and pavilion (south-east). North: the
// service yard (loading dock, oxygen tank, generators, bins). Brick walls with a fence on top close it all in.
Object.assign(MATS,{hoGroundF:{t:'asph',s:6,cs:8,k:'soft'},hoFacadeF:{t:'hoFacade',s:8.4,sv:4.2,cs:6,k:'stone'},hoFence:{t:'fence',s:2,cs:2.5,k:'hoSteel'},hoMetal:{t:'hoMetal',s:2,cs:1,k:'hoSteel'}});
function buildHospital(){const CV={nosolid:true},CH=3.8,YR=12.6;
  const only=(k,m)=>{const f={px:'none',nx:'none',py:'none',ny:'none',pz:'none',nz:'none'};f[k]=m;return {nosolid:true,f}};
  // partitions 0.2 m thick along x (at z) or along z (at x), a storey high (3.8 m, up to the slab); openings [u0,u1] (a 2.4 m door),
  // [u0,u1,h] or [u0,u1,y0,y1] (above the floor: a hatch or a window)
  const hz=(y,d)=>d.length===4?[d[0],d[1],y+d[2],y+d[3]]:[d[0],d[1],y,y+(d[2]||2.4)];
  const pX=(x0,x1,z,y,m,o,op)=>wallX(x0,x1,z-.1,z+.1,y,y+CH,m||'hoWall',(o||[]).map(d=>hz(y,d)),op);
  const pZ=(z0,z1,x,y,m,o,op)=>wallZ(x-.1,x+.1,z0,z1,y,y+CH,m||'hoWall',(o||[]).map(d=>hz(y,d)),op);
  // a ceiling light: the troffer (only its underside shows) and its light (r 0: the panel alone)
  const cl=(x,z,yc,col,r,k,ax)=>{const a=ax==='z';B(x-(a?.3:.6),yc-.04,z-(a?.6:.3),x+(a?.3:.6),yc,z+(a?.6:.3),'hoLamp',only('ny','hoLamp'));if(r)LIGHT(x,yc-.45,z,col||'#e6eeff',r,k==null?.7:k)};
  // a floor slab whose top is y: zones [x0,z0,x1,z1,floor] (later ones win) each with their own floor, holes cut through all of it
  const deck=(x0,z0,x1,z1,y,def,zones,holes,body,under)=>{const Z=zones.map(q=>q.slice(0,4)),m=body||'hoPanel',u=under||'hoCeil';
    slab(x0,z0,x1,z1,y-.4,y,m,holes.concat(Z),{f:{py:def,ny:u}});zones.forEach((q,i)=>slab(q[0],q[1],q[2],q[3],y-.4,y,m,holes.concat(Z.slice(i+1)),{f:{py:q[4],ny:u}}))};
  // glass balustrades (see-through, solid to walk into)
  const railX=(x0,x1,z,y)=>B(x0,y,z-.04,x1,y+1.15,z+.04,'hoRail',{pass:1});
  const railZ=(z0,z1,x,y)=>B(x-.04,y,z0,x+.04,y+1.15,z1,'hoRail',{pass:1});
  // an escalator along z: 16 grooved steps from (a0, y0) to (a1, y1), glass balustrades stepping up both sides
  const esc=(x0,x1,a0,a1,y0,y1)=>{stairs('z',x0,x1,a0,a1,y0,y1,16,'hoEsc',{f:{px:'hoMachD',nx:'hoMachD',ny:'hoMachD'}});const da=(a1-a0)/16,dy=(y1-y0)/16;
    for(let i=0;i<16;i++){const s0=a0+da*i,s1=a0+da*(i+1),t=y0+dy*(i+1);for(const x of [x0-.14,x1])B(x,y0,Math.min(s0,s1),x+.14,t+1,Math.max(s0,s1),'hoRail',{pass:1,f:{py:'hoMachD'}})}};
  // a stairwell (x0…x0+3.4, z0 north … z0+6.6 south, the door side): each storey a flight of 8 up northwards (west lane), a half landing,
  // 8 back southwards (east lane) to the next floor's landing; a wall between the lanes; the walls rise 3 m over the top level (the hut)
  const stairwell=(x0,z0,lv,decal,wm)=>{const z1=z0+6.6,top=lv[lv.length-1],H=top+3,W=wm||'hoWallC',o=k=>{const f={};f[k]='hoPanel';return {f}};
    for(let i=0;i<lv.length-1;i++){const y=lv[i],h=lv[i+1]-y,hf=h/2;
      stairs('z',x0,x0+1.6,z0+4.9,z0+1.7,y,y+hf,8,'hoStair');B(x0,i?y+hf-.4:y,z0,x0+3.4,y+hf,z0+1.7,'hoConc',{f:{py:'hoFloor'}});
      stairs('z',x0+1.8,x0+3.4,z0+1.7,z0+4.9,y+hf,y+h,8,'hoStair');if(!i)B(x0+1.8,y,z0+1.7,x0+3.4,y+hf,z0+4.9,'hoConc')}
    lv.forEach((y,i)=>{LIGHT(x0+1.7,y+2.8,z0+5.6,'#e6eeff',6.5,.6);B(x0+1.1,y+2.96,z0+5.3,x0+2.3,y+3,z0+5.9,'hoLamp',only('ny','hoLamp'));
      if(decal&&decal[i])B(x0+3.38,y+1.3,z0+5.2,x0+3.4,y+2.3,z0+6.2,decal[i],only('nx',decal[i]))});
    B(x0+1.6,lv[0],z0+1.7,x0+1.8,H,z0+4.9,'hoConc');// (up to the hut's roof: nobody ends up standing on top of it)
    wallZ(x0-.2,x0,z0-.2,z1+.2,lv[0],H,W,[],o('nx'));wallZ(x0+3.4,x0+3.6,z0-.2,z1+.2,lv[0],H,W,[],o('px'));wallX(x0,x0+3.4,z0-.2,z0,lv[0],H,W,[],o('nz'));
    // (wallX cannot stack openings in one column: the door wall is built a storey at a time)
    for(let i=0;i<lv.length-1;i++)wallX(x0,x0+3.4,z1,z1+.2,lv[i],lv[i+1],W,[[x0+.9,x0+2.5,lv[i],lv[i]+2.3]]);wallX(x0,x0+3.4,z1,z1+.2,top,H,W,[[x0+.9,x0+2.5,top,top+2.3]],o('pz'));
    B(x0-.2,H,z0-.2,x0+3.6,H+.3,z1+.2,'hoPanel')};
  // the lift block: solid, a pair of doors on its south face on every floor
  const lift=(x0,x1,z0,z1,lv,top)=>{B(x0,lv[0],z0,x1,top,z1,'hoPanel');for(const y of lv)for(const c of [x0+(x1-x0)*.27,x0+(x1-x0)*.73])B(c-.62,y,z1,c+.62,y+2.4,z1+.02,'hoElev',only('pz','hoElev'))};
  // furniture. Beds: head to the north (bedZ) or the west (bedX), solid to 0.62 m, boards at both ends
  const bedZ=(x,z,y)=>{B(x-.5,y,z-1,x+.5,y+.62,z+1,'hoBedP',{f:{py:'hoSheetZ'}});B(x-.52,y,z-1.1,x+.52,y+1.05,z-1,'hoBedP');B(x-.52,y,z+1,x+.52,y+.82,z+1.08,'hoBedP')};
  const bedX=(x,z,y)=>{B(x-1,y,z-.5,x+1,y+.62,z+.5,'hoBedP',{f:{py:'hoSheetX'}});B(x-1.1,y,z-.52,x-1,y+1.05,z+.52,'hoBedP');B(x+1,y,z-.52,x+1.08,y+.82,z+.52,'hoBedP')};
  const cur=(x0,z0,x1,z1,y)=>{B(x0,y+.15,z0,x1,y+2.45,z1,'hoCurtain',CV);B(x0-.02,y+2.45,z0-.02,x1+.02,y+2.5,z1+.02,'hoSteel',CV)};
  const iv=(x,z,y)=>{B(x-.02,y,z-.02,x+.02,y+1.95,z+.02,'hoSteel',CV);B(x-.08,y+1.5,z-.03,x+.08,y+1.82,z+.03,'hoLineW',CV);B(x-.25,y,z-.25,x+.25,y+.05,z+.25,'hoMetal',CV)};
  const mon=(x,z,y,f)=>{B(x-.03,y,z-.03,x+.03,y+1.25,z+.03,'hoMetal',CV);B(x-.22,y,z-.22,x+.22,y+.05,z+.22,'hoMetal',CV);
    if(f==='pz'||f==='nz')monitor(x-.28,y+1.25,z-.04,x+.28,y+1.65,z+.04,f);else monitor(x-.04,y+1.25,z-.28,x+.04,y+1.65,z+.28,f)};
  const desk=(x0,z0,x1,z1,y,f)=>{B(x0,y,z0,x1,y+.75,z1,'hoDesk',{f:{py:'hoTop'}});if(f){const cx=(x0+x1)/2,cz=(z0+z1)/2;
      if(f==='pz'||f==='nz')monitor(cx-.3,y+.75,cz-.03,cx+.3,y+1.15,cz+.03,f);else monitor(cx-.03,y+.75,cz-.3,cx+.03,y+1.15,cz+.3,f)}};
  const chair=(x,z,y)=>{B(x-.24,y,z-.24,x+.24,y+.46,z+.24,'hoSeat',{nosolid:true,f:{px:'hoMetal',nx:'hoMetal',pz:'hoMetal',nz:'hoMetal'}})};
  // a row of waiting seats: the seat solid (0.46 m, stepped onto), the backrest on the side away from where they face ('n' or 's', 'e' or 'w')
  const seats=(x0,x1,z0,z1,y,face)=>{const SM={f:{px:'hoMetal',nx:'hoMetal',pz:'hoMetal',nz:'hoMetal'}};B(x0,y,z0,x1,y+.46,z1,'hoSeat',SM);
    if(face==='n')B(x0,y+.46,z1-.1,x1,y+1,z1,'hoSeat');else if(face==='s')B(x0,y+.46,z0,x1,y+1,z0+.1,'hoSeat');else if(face==='w')B(x1-.1,y+.46,z0,x1,y+1,z1,'hoSeat');else B(x0,y+.46,z0,x0+.1,y+1,z1,'hoSeat')};
  const ctr=(x0,z0,x1,z1,y,h)=>B(x0,y,z0,x1,y+(h||1.05),z1,'hoDesk',{f:{py:'hoTop'}});
  const shelf=(x0,z0,x1,z1,y,h,m)=>B(x0,y,z0,x1,y+(h||2),z1,m||'hoShelfL',{f:{py:'hoMetal',ny:'hoMetal'}});
  const plant=(x,z,y,s)=>{s=s||1;MAP.deco.push({k:'drum',x,y,z,r:.3*s,h:.5*s,mat:'hoPanel',rot:0});B(x-.21*s,y,z-.21*s,x+.21*s,y+.5*s,z+.21*s,'metalx');
    B(x-.5*s,y+.45*s,z-.5*s,x+.5*s,y+1.5*s,z+.5*s,'hoLeafG',CV);B(x-.32*s,y+1.5*s,z-.32*s,x+.32*s,y+1.9*s,z+.32*s,'hoLeafG',CV)};
  const faceB=(x0,y0,z0,x1,y1,z1,m,f)=>B(x0,y0,z0,x1,y1,z1,'hoPanel',{f:{[f]:m}});
  const mach=(x0,z0,x1,z1,y,h,m)=>B(x0,y,z0,x1,y+h,z1,m||'hoMach');
  // an operating table, its anaesthesia trolley and the theatre light (two emissive heads on an arm) with its light
  const orTable=(x,z,y,ax)=>{const a=ax==='x';B(x-.25,y,z-.25,x+.25,y+.7,z+.25,'hoMachD');B(x-(a?1:.32),y+.7,z-(a?.32:1),x+(a?1:.32),y+.92,z+(a?.32:1),'hoMachD');
    B(x-.04,y+2.7,z-.04,x+.04,y+CH,z+.04,'hoSteel',CV);for(const d of [-.55,.55]){const hx=x+(a?d:0),hz2=z+(a?0:d);B(hx-.33,y+2.4,hz2-.33,hx+.33,y+2.7,hz2+.33,'hoMach',{nosolid:true,f:{ny:'hoSpot'}})}
    LIGHT(x,y+2.1,z,'#ffffff',7,1.05)};
  // a fluorescent tube's flicker for a few broken lights (dynamic, also on the people passing)
  const flick=(x,y,z,col,r,k,f)=>MAP.dyn.push([x,y,z,col,r,k,f]);

  // ================= the ground: roads, paths, lawns, and the ground floors of the buildings =================
  {const R=[[-42,-49.4,72.4,-38,'hoAsph'],[-42,-38,-32,0,'hoAsph'],[-42,-5,22,0,'hoAsph'],[-22,0,-16,24,'hoAsph'],[16,0,22,24,'hoAsph'],[-22,18,22,24,'hoAsph'],[-6,24,6,49.4,'hoAsph'],
      [22,-10,58,0,'hoAsph'],[58,-38,72.4,0,'hoAsph'],[-72.4,2,-26,46,'hoAsph'],
      [-16,0,16,18,'hoGrass'],[26,6,72.4,46,'hoGrass'],[-2,0,2,18,'hoPave'],[-16,7.5,16,10.5,'hoPave'],[26,23,72.4,26,'hoPave'],[46,6,49,46,'hoPave'],
      [-31.6,-37.6,31.6,-8.4,'hoFloor'],[-13,-31,13,-8.4,'hoFloorL'],[-13,-37.6,13,-31,'hoConcF'],[32,-35.6,57.6,-10.4,'hoFloorG'],[-72,-44,-42,-8,'hoParkF']];
    const xs=new Set([-72.4,72.4]),zs=new Set([-49.4,49.4]);for(const r of R){xs.add(r[0]);xs.add(r[2]);zs.add(r[1]);zs.add(r[3])}
    const X=[...xs].sort((a,b)=>a-b),Z=[...zs].sort((a,b)=>a-b);
    for(let j=0;j<Z.length-1;j++){let run=null;const cz=(Z[j]+Z[j+1])/2;for(let i=0;i<X.length-1;i++){const cx=(X[i]+X[i+1])/2;let m='hoPave';for(const r of R)if(cx>r[0]&&cx<r[2]&&cz>r[1]&&cz<r[3])m=r[4];
        if(run&&run.m===m)run.x1=X[i+1];else{if(run)B(run.x0,-1,Z[j],run.x1,0,Z[j+1],run.m,{ground:1});run={x0:X[i],x1:X[i+1],m}}}
      if(run)B(run.x0,-1,Z[j],run.x1,0,Z[j+1],run.m,{ground:1})}
    // road paint: the crossing at the entrance, the gate road's centre line, the ambulance bay's box, stalls in the car park
    const PL=(x0,z0,x1,z1,m)=>B(x0,0,z0,x1,.012,z1,m||'hoLineW',only('py',m||'hoLineW'));
    for(let x=-4;x<4;x+=1)PL(x+.05,-4.6,x+.55,-.6);for(let z=26;z<48;z+=4)PL(-.08,z,.08,z+2,'hoLineY');for(const z of [2,22])PL(-22,z-.06,22,z+.06,'hoLineY');
    PL(34,-9.6,58,-9.45,'hoLineY');PL(34,-.55,58,-.4,'hoLineY');for(const x of [36,44.5,53])PL(x,-9.6,x+.15,-.4,'hoLineY');
    for(const [z0,z1] of [[4,9],[20,25],[25,30],[38,43]])for(let x=-70;x<=-28;x+=2.6)PL(x-.06,z0,x+.06,z1);for(const z of [9,20,30,38])PL(-70,z-.06,-28,z+.06)}

  // ================= the outer walls (brick, a fence on top), the shut gates =================
  {const W='hoBrick',FN={pass:1};
    B(-73,0,-50,73,3.2,-49.4,W,{f:{nz:'none'}});B(-73,0,49.4,-6.6,3.2,50,W,{f:{pz:'none'}});B(6.6,0,49.4,73,3.2,50,W,{f:{pz:'none'}});
    B(-73,0,-49.4,-72.4,3.2,49.4,W,{f:{nx:'none'}});B(72.4,0,-49.4,73,3.2,49.4,W,{f:{px:'none'}});
    B(-72.4,3.2,-49.75,72.4,4.6,-49.65,'hoFence',FN);B(-72.4,3.2,49.65,-6.6,4.6,49.75,'hoFence',FN);B(6.6,3.2,49.65,72.4,4.6,49.75,'hoFence',FN);
    B(-72.75,3.2,-49.4,-72.65,4.6,49.4,'hoFence',FN);B(72.65,3.2,-49.4,72.75,4.6,49.4,'hoFence',FN);
    for(let x=-72;x<=72;x+=8){B(x-.06,3.2,-49.76,x+.06,4.7,-49.64,'hoMetal');B(x-.06,3.2,49.64,x+.06,4.7,49.76,'hoMetal')}
    for(let z=-48;z<=48;z+=8){B(-72.76,3.2,z-.06,-72.64,4.7,z+.06,'hoMetal');B(72.64,3.2,z-.06,72.76,4.7,z+.06,'hoMetal')}
    // the main gate: two leaves of bars between brick piers, shut; the gatehouse beside it
    B(-6.6,0,49.2,-5.8,3.8,50.2,W);B(5.8,0,49.2,6.6,3.8,50.2,W);B(-5.8,0,49.5,5.8,2.6,49.7,'hoFence',FN);B(-5.8,2.5,49.48,5.8,2.6,49.72,'hoMetal');B(-.05,0,49.48,.05,2.6,49.72,'hoMetal');
    B(8,0,45.6,11,2.7,48.6,'hoPanel',{f:{py:'roof'}});B(8,1.1,45.58,11,2,45.62,'carGl',CV);B(10.98,0,46.4,11.02,2.2,47.4,'hoDoor',CV)}

  // ================= the main building =================
  // outer walls: the facade outside, the window wall inside (the store's street door, the lobby's glass front, the dock's two doors,
  // the skybridge door (2F west), the doors to the emergency wing (1F east) and out onto its roof (2F east))
  wallX(-32,-13,-8.4,-8,0,YR,'hoFacade',[[-29,-27.2,0,2.4]],{f:{nz:'hoWallWin'}});wallX(13,32,-8.4,-8,0,YR,'hoFacade',[],{f:{nz:'hoWallWin'}});
  for(const y of [3.8,8,12.2])B(-13,y,-8.4,13,y+.4,-8,'hoPanel');
  wallX(-13,13,-8.36,-8.24,0,3.8,'hoGlassW',[[-5,-2,0,2.9],[-1.5,1.5,0,2.9],[2,5,0,2.9]],{pass:1});wallX(-13,13,-8.36,-8.24,4.2,8,'hoGlassW',[[-1,1,4.2,6.6]],{pass:1});wallX(-13,13,-8.36,-8.24,8.4,12.2,'hoGlassW',[],{pass:1});
  wallX(-32,32,-38,-37.6,0,YR,'hoFacade',[[-6,-2,0,3.4],[2,6,0,3.4]],{f:{pz:'hoWallWin'}});
  wallZ(-32,-31.6,-37.6,-8.4,0,YR,'hoFacade',[[-21.6,-19.4,4.2,6.8]],{f:{px:'hoWallWin'}});
  wallZ(31.6,32,-37.6,-8.4,0,4.2,'hoFacade',[[-21.6,-19.4,0,2.6]],{f:{nx:'hoWallWin'}});wallZ(31.6,32,-37.6,-8.4,4.2,8.4,'hoFacade',[[-21.6,-19.4,4.2,6.8]],{f:{nx:'hoWallWin'}});wallZ(31.6,32,-37.6,-8.4,8.4,YR,'hoFacade',[],{f:{nx:'hoWallWin'}});
  B(-32,YR,-38,32,YR+1.1,-37.7,'hoPanel');B(-32,YR,-8.3,32,YR+1.1,-8,'hoPanel');B(-32,YR,-37.7,-31.7,YR+1.1,-8.3,'hoPanel');B(31.7,YR,-37.7,32,YR+1.1,-8.3,'hoPanel');
  // a few rooms already lit behind the windows
  for(const [x,y,s] of [[-27.3,4.2,1],[-10.5,8.4,1],[3.15,0,0],[15.75,4.2,1],[24.15,8.4,1],[-22.05,8.4,0],[28.35,4.2,0]]){const z=s?-7.98:-38.02;B(x-.95,y+1.07,Math.min(z,z+(s?.02:-.02)),x+.95,y+3.12,Math.max(z,z+(s?.02:-.02)),'hoWinLit',only(s?'pz':'nz','hoWinLit'))}
  for(const [z,y] of [[-17.85,8.4],[-30.45,4.2]])B(-32.02,y+1.07,z-.95,-32,y+3.12,z+.95,'hoWinLit',only('nx','hoWinLit'));
  // the slabs: 2F, 3F and the roof; the atrium's void and the stairwells cut through
  const VOID=[-10,-28,10,-16],STW=[-31.6,-37.6,-28.2,-32.7],STE=[28.2,-37.6,31.6,-32.7];
  deck(-31.6,-37.6,31.6,-8.4,4.2,'hoFloor',[[-13,-31,13,-8.4,'hoFloorL'],[-13,-37.6,13,-31,'hoFloorG']],[VOID,STW,STE]);
  deck(-31.6,-37.6,31.6,-8.4,8.4,'hoFloor',[[-13,-31,13,-8.4,'hoFloorL'],[13,-37.6,31.6,-8.4,'hoFloorG'],[-24.6,-37.6,-13,-31,'hoFloorW'],[-28.6,-28,-13,-22,'hoFloorW'],[-31.6,-19,-13,-8.4,'hoFloorW']],[VOID,STW,STE]);
  deck(-31.6,-37.6,31.6,-8.4,YR,'hoConcF',[],[VOID,STW,STE]);
  // the atrium: a column at each corner of the void, the skylight over it, two pendant lights
  for(const [x,z] of [[-10.6,-28.6],[10,-28.6],[-10.6,-16],[10,-16]])B(x,0,z,x+.6,12.2,z+.6,'hoPanel');
  B(-10,YR,-28,10,YR+.2,-16,'hoSkyG',{pass:1,f:{px:'hoPanel',nx:'hoPanel',pz:'hoPanel',nz:'hoPanel'}});for(const z of [-25,-22,-19])B(-10,YR+.2,z-.1,10,YR+.34,z+.1,'hoMetal');for(const x of [-5,0,5])B(x-.1,YR+.2,-28,x+.1,YR+.34,-16,'hoMetal');
  for(const x of [-4,4]){B(x-.02,9.6,-22.02,x+.02,12.2,-21.98,'hoSteel',CV);B(x-.55,9.3,-22.55,x+.55,9.6,-21.45,'hoPanel',{nosolid:true,f:{ny:'hoLamp'}});LIGHT(x,9,-22,'#f4f0e6',15,.8)}
  // the stairwells (doors onto corridor N on every floor and onto the roof) and the lifts beside them
  stairwell(-31.6,-37.6,[0,4.2,8.4,YR],['hoF1','hoF2','hoF3','hoFR']);stairwell(28.2,-37.6,[0,4.2,8.4,YR],['hoF1','hoF2','hoF3','hoFR']);
  lift(-28.2,-24.6,-37.6,-31,[0,4.2,8.4],YR+2.4);lift(24.6,28.2,-37.6,-31,[0,4.2,8.4],YR+2.4);
  // the escalators: 1F→2F up the west side of the atrium to the north gallery, 2F→3F from the south gallery across the void to 3F's north gallery
  esc(-9.4,-6.6,-20.7,-28,0,4.2);esc(6.6,9.4,-16,-28,4.2,8.4);
  // gallery balustrades round the void on 2F and 3F (gaps where the escalators arrive)
  railX(-10,-9.4,-28,4.2);railX(-6.6,10,-28,4.2);railX(-10,6.6,-16,4.2);railX(9.4,10,-16,4.2);railZ(-28,-16,-10,4.2);railZ(-28,-16,10,4.2);
  railX(-10,6.6,-28,8.4);railX(9.4,10,-28,8.4);railX(-10,10,-16,8.4);railZ(-28,-16,-10,8.4);railZ(-28,-16,10,8.4);
  // the same grid of rooms on every floor: north rooms (z −37.6…−31), corridor N, middle rooms (−28…−22), corridor S, south rooms (−19…−8.4);
  // in each wing a cross corridor at its far end (x ±28.6…±31.6) joins the two corridors
  const grid=(y,mw,me,D)=>{
    pX(-24.6,-13,-31,y,mw,D.nw);pX(13,24.6,-31,y,me,D.ne);pZ(-37.6,-31,-13,y,mw);pZ(-37.6,-31,13,y,me);
    pX(-28.6,-13,-28,y,mw,D.mwn);pX(13,28.6,-28,y,me,D.men);pX(-28.6,-13,-22,y,mw,D.mws);pX(13,28.6,-22,y,me,D.mes);
    for(const x of [-28.6,-20.8,-13])pZ(-28,-22,x,y,mw);for(const x of [13,20.8,28.6])pZ(-28,-22,x,y,me);
    pX(-31.6,-13,-19,y,mw,D.sw);pX(13,31.6,-19,y,me,D.se);pZ(-19,-8.4,-22.4,y,mw);pZ(-19,-8.4,22.4,y,me);pZ(-19,-8.4,-13,y,mw,D.swe);pZ(-19,-8.4,13,y,me,D.see)};
  // corridor lights (and coloured guide lines on the floor of each corridor)
  const corr=(y,cols)=>{const yc=y+CH;for(const x of [-26,-17.5,17.5,26])cl(x,-29.4,yc,cols[0],8,.65);for(const x of [-29,-22,-15.5,15.5,22,29])cl(x,-20.5,yc,cols[1],8,.65);
    cl(-30.1,-25,yc,cols[0],7,.55,'z');cl(30.1,-25,yc,cols[0],7,.55,'z')};
  const guide=(y,x0,x1,z,m)=>B(x0,y,z-.12,x1,y+.012,z+.12,m,only('py',m));
  // ---------------- 1F ----------------
  {const y=0;
    grid(y,'hoWall','hoWall',{nw:[[-20.2,-18.4]],ne:[[18.4,20.2]],mwn:[[-25.2,-23.4]],mws:[[-27.4,-21.8,.95,2.2],[-16.6,-14.8]],men:[[23.4,25.2]],mes:[[15.2,17]],
      sw:[[-26.4,-24.6],[-19.6,-17.8]],se:[[14.6,20.8,2.6],[25.4,27.2]],swe:[[-17.5,-11,2.6]],see:[[-17,-11,2.6]]});
    corr(y,['#e6eeff','#e6eeff']);guide(y,-31.6,-13,-20.5,'hoLineG');guide(y,13,31.6,-20.5,'hoLineO');guide(y,-28.2,28.2,-29.4,'hoLineB');
    // the stores behind the lobby and the dock doors: shelving, linen carts, gas bottles, pallets
    pX(-13,13,-31,y,'hoWallC',[[-9.2,-7.4],[7.4,9.2]]);
    for(const x of [-12.4,-5.2,5.6])shelf(x,-37.4,x+3.4,-36.7,y,2.3,'hoShelfL');shelf(-12.6,-35.4,-11.9,-32.2,y,2.1,'hoShelfP');shelf(11.9,-35.4,12.6,-32,y,2.1,'hoShelfL');
    for(const [x,z] of [[-9.6,-33.8],[-8.6,-33.8],[9.4,-34.6]])B(x-.35,y,z-.55,x+.35,y+1.1,z+.55,'hoMach',{f:{py:'hoSheetZ'}});
    for(let i=0;i<6;i++)MAP.deco.push({k:'drum',x:2.6+i*.32,y,z:-36.9,r:.12,h:1.5,mat:'drumB',rot:i});B(2.4,y,-37.1,4.6,y+1.5,-36.7,'metalx');
    for(const [x,z] of [[-3.6,-33.6],[3.2,-33]]){B(x-.6,y,z-.6,x+.6,y+.15,z+.6,'pallet');B(x-.55,y+.15,z-.55,x+.55,y+1.1,z+.55,'wood')}
    for(const x of [-4,4]){B(x-2.2,3.4,-37.6,x+2.2,3.8,-37.1,'hoMetal',CV);for(const s of [-1,1])B(x+s*2.05-.08,y,-37.62,x+s*2.05+.08,3.4,-37.5,'hazard',CV)}
    for(const x of [-8,0,8])cl(x,-34.3,CH,'#e6eeff',9,.55);
    // the lobby: reception under the atrium, the floor guide behind it, seats, a ficus in a planter, kiosks, lifts of light
    ctr(-4.2,-27.4,4.2,-26.5,y,1.1);B(-4.2,y,-28.3,4.2,y+.75,-27.7,'hoDesk',{f:{py:'hoTop'}});for(const x of [-2.6,0,2.6]){monitor(x-.3,y+.75,-28.1,x+.3,y+1.15,-28.04,'nz');chair(x,-28.9,y)}
    B(-1.6,1,-30.9,1.6,3.4,-30.88,'hoSignDir',only('pz','hoSignDir'));
    for(const z of [-22.6,-20.4,-18.2]){seats(-5.2,-1,z-.3,z+.3,y,'n');seats(1,5.2,z-.3,z+.3,y,'n')}
    B(-9.8,y,-19.8,-7.2,y+.6,-16.4,'hoPanel',{f:{py:'hoSoil'}});MAP.deco.push({k:'drum',x:-8.5,y:.6,z:-18.1,r:.16,h:3.4,mat:'hoBark',rot:0});B(-8.66,.6,-18.26,-8.34,4,-17.94,'metalx');
    for(const [x0,y0,z0,x1,y1,z1] of [[-10,2.6,-19.6,-7,4.4,-16.6],[-9.4,4.2,-19,-7.6,5.4,-17.2],[-10.2,3.2,-18.6,-8.6,4.4,-16.4]])B(x0,y0,z0,x1,y1,z1,'hoLeafG',CV);
    for(const x of [-6,6]){B(x-.3,y,-12.3,x+.3,y+1.35,-11.9,'hoMachD');monitor(x-.26,y+.8,-11.9,x+.26,y+1.3,-11.86,'pz')}
    for(const x of [-12.6,-11.5])B(x,y,-30.9,x+1,y+1.9,-30.1,'hoPanel',{f:{pz:'hoVend'}});B(11.6,y,-30.9,12.6,y+1.6,-30.3,'hoMachD');monitor(11.8,y+.9,-30.32,12.4,y+1.3,-30.28,'pz');
    for(const [x,z] of [[11.6,-10],[12.3,-10.2]])B(x-.3,y,z-.3,x+.3,y+.9,z+.3,'hoSteel',CV);plant(-12.2,-9.2,y);plant(12.2,-15,y);plant(-12.2,-27.4,y,1.2);plant(12.2,-27.4,y,1.2);
    for(const x of [-11.5,11.5])for(const z of [-29.5,-22,-14.5])cl(x,z,CH,'#f4f0e6',9,.65);for(const x of [-5,0,5])cl(x,-29.5,CH,'#f4f0e6',0);cl(-5,-11.5,CH,'#f4f0e6',9,.6);cl(5,-11.5,CH,'#f4f0e6',9,.6);cl(0,-14.5,CH);
    LIGHT(0,2.6,-6,'#e8eef8',8,.5);
    // west: linen store, administration (a service window onto corridor S), records, the convenience store, the pharmacy
    shelf(-24.4,-37.4,-14,-36.8,y,2.2,'hoShelfL');shelf(-23,-34.6,-15.4,-34,y,2.1,'hoShelfL');B(-16,y,-33,-14.8,y+1.1,-32,'hoMach',{f:{py:'hoSheetZ'}});cl(-19,-34.3,CH,'#f0f0e8',8,.5);
    B(-27.4,.9,-22.2,-21.8,.95,-21.8,'hoTop',CV);B(-27.4,.95,-22.04,-21.8,2.2,-21.96,'hoGlassP',{pass:1});B(-26.4,2.45,-21.9,-22.8,3.05,-21.88,'hoSnRec',only('pz','hoSnRec'));
    B(-27.4,y,-22.9,-21.8,y+.95,-22.12,'hoDesk',{f:{py:'hoTop'}});for(const x of [-26,-24.6,-23.2])monitor(x-.25,y+.95,-22.6,x+.25,y+1.3,-22.56,'nz');for(const x of [-26,-23.2])chair(x,-23.6,y);
    shelf(-28.4,-27.8,-26,-27.3,y,1.8,'hoShelfL');desk(-22.6,-26,-21.2,-25.2,y,'nz');cl(-24.7,-25,CH,'#f0f0e8',7.5,.55);
    for(const z of [-27.2,-25])shelf(-20.2,z,-13.8,z+.6,y,2.2,'hoShelfL');shelf(-20.2,-23,-17.4,-22.4,y,2.2,'hoShelfL');cl(-17,-25,CH,'#f0f0e8',7,.45);
    // the convenience store: shelf rows, drink fridges along the west wall, the till by the street door, a coffee bar
    for(const z of [-16,-13])shelf(-29.4,z,-24.6,z+.8,y,1.6,'hoShelfS');B(-31.6,y,-18.6,-31,y+2.1,-10,'hoPanel',{f:{px:'hoFridge'}});
    ctr(-26,-11,-23.2,-10.2,y,1.05);monitor(-25.2,y+1.05,-10.7,-24.6,y+1.4,-10.66,'nz');B(-23,y,-18.8,-22.6,y+1.1,-15.6,'hoDesk',{f:{py:'hoTop'}});
    B(-27,2.5,-19.12,-24,3.08,-19.1,'hoSnCS',only('nz','hoSnCS'));cl(-27,-15.5,CH,'#f4f8ff',9,.75);cl(-27,-11,CH,'#f4f8ff',8,.6);
    // the pharmacy: its counter along the lobby (a gap at the south end), dispensing shelves, a long table
    ctr(-14.6,-17.5,-13.4,-12.5,y,1.1);B(-12.9,2.65,-16.2,-12.88,3.25,-13,'hoSnPh',only('px','hoSnPh'));
    shelf(-22.2,-18.6,-21.6,-9,y,2.2,'hoShelfP');shelf(-21.4,-9,-15,-8.6,y,2.2,'hoShelfP');B(-19.6,y,-16,-16.4,y+.9,-14.6,'hoDesk',{f:{py:'hoTop'}});
    cl(-18,-15,CH,'#f4f8ff',8.5,.7);cl(-18,-11,CH,'#f4f8ff',0);
    // east: X-ray, blood draw, the lab, the outpatient waiting room (seats facing a screen), a clinic
    B(17,y,-35.4,21,y+.8,-34.4,'hoMach',{f:{py:'hoSheetX'}});B(22,y,-36.8,22.5,y+2.6,-36.3,'hoMach');B(18.4,2.2,-36.3,22.4,2.4,-35.9,'hoMach',CV);B(18.6,1.6,-36,19.6,2.2,-35.2,'hoMachD',CV);
    B(13.6,y,-37.2,14.2,y+2,-36.6,'hoMach');cl(19,-34.3,CH,'#dfe8f8',7.5,.45);
    B(14,y,-27.6,20.2,y+.75,-26.8,'hoDesk',{f:{py:'hoTop'}});for(const x of [15,17,19])chair(x,-26.2,y);B(14,y,-23,15.6,y+1.8,-22.3,'hoPanel',{f:{pz:'hoFridge'}});cl(17,-25,CH,'#f0f4f8',7.5,.55);
    for(const z of [-25.4,-22.9])B(22.4,y,z,27,y+.9,z+.8,'hoDesk',{f:{py:'hoTop'}});for(const [x,z] of [[22.6,-25],[25,-25],[23.8,-22.5]])mach(x-.3,z-.3,x+.3,z+.3,y+.9,.4);cl(24.7,-25,CH,'#f0f4f8',7.5,.55);
    for(const z of [-16.2,-14,-11.8])seats(14,21.4,z-.3,z+.3,y,'n');monitor(16.6,1.6,-18.9,19.6,2.9,-18.86,'pz');plant(21.6,-9.2,y);cl(17.7,-15,CH,'#f4f0e6',9,.65);cl(17.7,-10.6,CH,'#f4f0e6',0);
    desk(28,-17.6,30.8,-16.8,y,'pz');chair(29.4,-16,y);chair(27.2,-15.6,y);bedZ(24.4,-13.2,y);cur(23.5,-15.6,25.4,-15.55,y);cl(27,-13.6,CH,'#f4f0e6',8,.6);
    B(27,2.5,-19.12,30.2,3.1,-19.1,'hoSnEmg',only('nz','hoSnEmg'));B(12.88,2.6,-16.4,12.9,3.2,-13.2,'hoSnOPD',only('nx','hoSnOPD'));
    plant(-30,-30.4,y);plant(30,-30.4,y);seats(-31.4,-29,-26,-24,y,'e');flick(-22,3.2,-20.5,'#dfe8ff',6,.35,.55)}
  // ---------------- 2F ----------------
  {const y=4.2,yc=y+CH;
    grid(y,'hoWallC','hoWall',{nw:[[-20.2,-18.4]],ne:[[18.4,20.2]],mwn:[[-25.2,-23.4]],mws:[[-16.6,-14.8]],men:[[23.4,25.2]],mes:[[15.2,17]],
      sw:[[-30.8,-23.2,2.6],[-19.6,-17.8]],se:[[15.4,17.2],[25.4,27.2]],swe:[],see:[]});
    corr(y,['#e6eeff','#e6eeff']);guide(y,-31.6,-13,-20.5,'hoLineB');guide(y,13,31.6,-20.5,'hoLineG');
    // the ICU behind its glass wall: six beds along the north wall, monitors, ventilators, curtains, the nurses' desk at the glass
    wallX(-13,13,-31.1,-30.9,y,yc,'hoGlassP',[[-1.2,1.2,y,y+2.5]],{pass:1});B(-1.6,y+2.62,-30.88,1.6,y+3.22,-30.86,'hoSnICU',only('pz','hoSnICU'));
    for(const x of [-10,-6,-2,2,6,10]){bedZ(x,-35.3,y);mon(x-.95,-36.7,y,'pz');mach(x+.65,-36.9,x+1.15,-36.4,y,1.25);if(x<10)cur(x+1.95,-37.4,x+2,-33.4,y)}
    ctr(-3,-32.7,3,-31.9,y,1);for(const x of [-1.5,1.5])monitor(x-.3,y+1,-32.4,x+.3,y+1.4,-32.36,'nz');for(const x of [-8,0,8])cl(x,-34,yc,'#cfe2ff',8.5,.6);
    // radiology (west): the CT room (gantry and table), CT control, the reading room, the waiting room, the MRI
    B(-20.2,y,-35.2,-19.4,y+2.2,-34.4,'hoMach');B(-18.6,y,-35.2,-17.8,y+2.2,-34.4,'hoMach');B(-19.4,y,-35.2,-18.6,y+.7,-34.4,'hoMach');B(-19.4,y+1.5,-35.2,-18.6,y+2.2,-34.4,'hoMach');
    B(-19.3,y,-34.4,-18.7,y+.8,-31.8,'hoMach',{f:{py:'hoSheetZ'}});B(-23.8,y,-37.4,-21,y+1.9,-36.8,'hoShelfP');B(-22,y+2.5,-30.9,-18.8,y+3.1,-30.88,'hoSnRad',only('pz','hoSnRad'));cl(-19,-34.3,yc,'#dfe8f8',8,.5);
    desk(-28.2,-22.9,-22,-22.2,y,'nz');for(const x of [-27,-25,-23])chair(x,-23.6,y);cl(-24.7,-25,yc,'#dfe8f8',7.5,.5);
    desk(-20.4,-27.6,-13.6,-26.9,y,'pz');for(const x of [-19,-17,-15])chair(x,-26.2,y);cl(-17,-25,yc,'#c8d8f0',6.5,.35);
    for(const z of [-16.4,-14.2,-12])seats(-30.4,-24,z-.3,z+.3,y,'n');ctr(-31.4,-18.6,-29.6,-17.8,y,1.05);plant(-23.2,-9.2,y);cl(-27,-15,yc,'#f0f4f8',9,.65);cl(-27,-10.6,yc,'#f0f4f8',0);
    B(-19,y,-15.4,-16,y+2.2,-12.6,'hoMach');B(-17.9,y+.7,-12.6,-17.1,y+1.5,-12.58,'hoMachD',only('pz','hoMachD'));B(-17.8,y,-12.6,-17.2,y+.8,-10,'hoMach',{f:{py:'hoSheetZ'}});
    B(-19.6,2.5+y,-19.12,-16.4,3.1+y,-19.1,'hoSnRad',only('nz','hoSnRad'));cl(-17.5,-14,yc,'#c8d8ff',7,.45);
    // clinics (east): the staff lounge, four consulting rooms (desk, couch, curtain)
    B(14,y,-37.4,17.6,y+.45,-36.4,'hoSeat');B(14,y+.45,-37.4,17.6,y+.95,-37.2,'hoSeat');B(14.6,y,-35.4,17,y+.45,-34.6,'hoTop');for(let x=20;x<24.4;x+=.8)B(x,y,-37.5,x+.76,y+1.9,-37,'hoMetal');
    B(22.4,y,-33.2,23.4,y+.9,-32.2,'hoMach');cl(19,-34.3,yc,'#f4f0e6',8,.55);
    const clinic=(x0,z0,x1,z1,dz)=>{const cx=(x0+x1)/2,cz=(z0+z1)/2;desk(x0+.4,cz-.4,x0+2.4,cz+.4,y,'px');chair(x0+2.9,cz,y);chair(x0+1.4,cz+1.2,y);bedX(x1-1.5,z0+(dz>0?1:z1-z0-1),y);
      cur(x1-3,z0+.2,x1-2.95,z1-.2,y);B(x1-.6,y,cz-.4,x1-.1,y+.9,cz+.4,'hoTop');cl(cx,cz,yc,'#f4f0e6',7.5,.55)};
    clinic(13.4,-27.8,20.6,-22.2,1);clinic(21,-27.8,28.4,-22.2,1);clinic(13.4,-18.8,22.2,-8.6,1);clinic(22.6,-18.8,31.4,-8.6,1);
    for(const x of [19,22.6])seats(x,x+2.6,-19.6,-19.1,y,'n');B(12.88,y+2.6,-16.4,12.9,y+3.2,-13.2,'hoSnOPD',only('nx','hoSnOPD'));
    // the lounge over the entrance (its door out onto the canopy), the galleries
    for(const x of [-11,7])seats(x,x+4,-11.3,-10.7,y,'s');for(const x of [-12,12])plant(x,-9.4,y,1.1);B(-12.6,y,-15.6,-11.6,y+1.9,-14.8,'hoPanel',{f:{px:'hoVend'}});
    for(const x of [-6,6])cl(x,-11.6,yc,'#f4f0e6',9,.6);cl(0,-14.5,yc,'#f4f0e6',0);for(const z of [-29.5,-22,-14.5]){cl(-11.5,z,yc,'#f4f0e6',z===-22?8:0,.55);cl(11.5,z,yc,'#f4f0e6',z===-22?8:0,.55)}
    plant(-30,-30.4,y);plant(30,-30.4,y)}
  // ---------------- 3F ----------------
  {const y=8.4,yc=y+CH;
    grid(y,'hoWallB','hoTile',{nw:[[-20.2,-18.4]],ne:[[18.2,20.4]],mwn:[[-25.2,-23.4],[-17.6,-15.8]],mws:[[-20,-14,1,2.6]],men:[[15,16.8],[23.4,25.6]],mes:[[15,16.8]],
      sw:[[-29.2,-27.4],[-19.6,-17.8]],se:[[16.2,18.4],[25.4,27.6]],swe:[],see:[]});
    // the operating suite is shut off from the galleries: a wall at x 13 with steel double doors across both corridors
    pZ(-31,-28,13,y,'hoTile',[[-30.6,-28.4]]);pZ(-22,-19,13,y,'hoTile',[[-21.6,-19.4]]);
    for(const [z0,z1] of [[-30.6,-28.4],[-21.6,-19.4]]){B(13.12,y,z0,14.1,y+2.4,z0+.05,'hoDoorS',CV);B(13.12,y,z1-.05,14.1,y+2.4,z1,'hoDoorS',CV)}
    B(12.88,y+2.6,-26.6,12.9,y+3.2,-23.4,'hoSnOR',only('nx','hoSnOR'));
    corr(y,['#e6eeff','#eaf2ff']);guide(y,-31.6,-13,-20.5,'hoLineO');
    // the conference room behind the north gallery
    pX(-13,13,-31,y,'hoWallB',[[-1,1]]);B(-6,y,-35,6,y+.75,-33.6,'hoTop');for(let x=-5;x<=5;x+=2){chair(x,-35.6,y);chair(x,-33,y)}monitor(-2,y+1.2,-37.56,2,y+3,-37.52,'pz');
    shelf(-12.6,-37.4,-9,-36.8,y,2,'hoShelfL');shelf(9,-37.4,12.6,-36.8,y,2,'hoShelfL');for(const x of [-6,6])cl(x,-34.3,yc,'#f4f0e6',8.5,.55);
    // the ward: room 301 (four beds), 303 (two), the nurse station (a hatch onto corridor S), 305 (six), 306 (four); dim night lights
    const W3='#ffd9b0';
    for(const x of [-22.8,-19.8,-16.8,-14])bedZ(x,-35.4,y);for(const x of [-21.3,-18.3,-15.4])cur(x,-37.4,x+.05,-33.6,y);for(const x of [-22.8,-16.8])iv(x+.75,-36.4,y);cl(-19,-34.3,yc,W3,8,.42);
    bedX(-26.4,-26.6,y);bedX(-26.4,-23.5,y);cur(-28.4,-25.1,-24.6,-25.05,y);iv(-24.9,-27.4,y);cl(-24.7,-25,yc,W3,7,.4);
    B(-20,y,-22.9,-14,y+1,-22.12,'hoDesk',{f:{py:'hoTop'}});for(const x of [-18.6,-15.4])monitor(x-.3,y+1,-22.6,x+.3,y+1.4,-22.56,'nz');B(-20.6,y,-27.6,-20,y+2,-23.4,'hoShelfP');
    B(-19.6,y,-25.4,-18.4,y+1,-24.6,'hoMach');for(const x of [-18,-16])chair(x,-23.6,y);B(-20.4,y+2.7,-21.9,-17.2,y+3.3,-21.88,'hoSnWard',only('pz','hoSnWard'));cl(-17,-25,yc,'#f4f0e6',8,.6);
    for(const x of [-30,-27,-24.2])for(const z of [-17.8,-11.6])bedZ(x,z,y);for(const x of [-28.5,-25.6])cur(x,-18.8,x+.05,-15.4,y);iv(-29.3,-18.6,y);iv(-26.3,-12.4,y);cl(-27,-15.2,yc,W3,8.5,.42);cl(-27,-11,yc,W3,0);
    for(const x of [-20.4,-15.4])for(const z of [-17.8,-11.6])bedZ(x,z,y);cur(-17.95,-18.8,-17.9,-9,y);iv(-19.6,-18.6,y);cl(-17.7,-14,yc,W3,8.5,.42);
    // beds dragged into corridor N as a barricade (a gap is left along its south side)
    bedX(-27.4,-30.2,y);bedX(-25.2,-29.95,y);B(-26.6,y+.62,-30.6,-24.4,y+1.2,-29.6,'hoSheetX');flick(-27,yc-.5,-29.4,'#dfe8ff',6,.3,.7);
    // the operating suite: theatre 1 (north), scrub (sinks), theatre 2, theatre 3 (south), recovery (four beds)
    orTable(19,-34.4,y,'x');mach(15.6,-36.8,16.6,-36,y,1.5);mon(16.2,-35.4,y,'px');B(21.6,y,-33.2,22.8,y+.9,-32.6,'hoSteel',CV);shelf(13.6,-37.4,17,-37,y,2.1,'hoShelfP');shelf(20.6,-37.4,24.2,-37,y,2.1,'hoShelfP');
    for(const x of [14,17])B(x,y,-27.7,x+2.6,y+.95,-27.1,'hoSteel');for(const x of [14.6,17.6])B(x,y+1.6,-27.9,x+1.4,y+2.6,-27.84,'hoGlassP',CV);cl(17,-25,yc,'#eaf2ff',7,.55);
    orTable(24.7,-25,y,'x');mach(26.8,-27.6,27.8,-26.8,y,1.4);mon(22.2,-23,y,'px');
    orTable(17.7,-13.6,y,'z');mach(14,-16,15,-15,y,1.5);mon(20.4,-16,y,'nx');B(19.6,y,-11,21,y+.9,-10.4,'hoSteel',CV);shelf(13.6,-9.2,17.6,-8.6,y,2.1,'hoShelfP');
    for(const x of [23.6,29.8])bedZ(x,-17.6,y);for(const x of [24.8,28.6])cur(x,-18.8,x+.05,-15.6,y);bedX(26,-11,y);bedX(29.8,-11.4,y);mon(24,-10.4,y,'pz');cl(27,-15,yc,'#f4f0e6',8.5,.55);cl(27,-11,yc,'#f4f0e6',0);
    // the lounge and the galleries
    for(const x of [-11,7])seats(x,x+4,-11.3,-10.7,y,'s');for(const x of [-12,12])plant(x,-9.4,y,1.1);for(const x of [-6,6])cl(x,-11.6,yc,'#f4f0e6',9,.55);cl(0,-14.5,yc,'#f4f0e6',0);
    for(const z of [-29.5,-22,-14.5]){cl(-11.5,z,yc,'#f4f0e6',z===-22?8:0,.5);cl(11.5,z,yc,'#f4f0e6',z===-22?8:0,.5)}plant(-30,-30.4,y)}
  // ---------------- the roof ----------------
  {const y=YR;
    // the helipad (raised 0.4 m, its H, edge lights), the medical helicopter on it, a windsock
    B(11,y,-30,27,y+.4,-12,'hoConc',{f:{py:'hoHeli'}});for(let x=11.5;x<27;x+=2.5){B(x-.1,y+.4,-30.1,x+.1,y+.48,-29.9,'hoLed',CV);B(x-.1,y+.4,-12.1,x+.1,y+.48,-11.9,'hoLed',CV)}
    for(let z=-29.5;z<-12;z+=2.5){B(10.9,y+.4,z-.1,11.1,y+.48,z+.1,'hoLed',CV);B(26.9,y+.4,z-.1,27.1,y+.48,z+.1,'hoLed',CV)}
    const hy=y+.4;B(17.8,hy+.3,-24.4,20.2,hy+2.4,-18.6,'hoHeliB');B(18,hy+.4,-25.9,20,hy+2.1,-24.4,'carGl',{f:{py:'hoHeliB',ny:'hoHeliB'}});B(18.6,hy+1.4,-18.6,19.4,hy+2,-12.6,'hoHeliB');
    B(18.8,hy+1.4,-13.4,19.2,hy+3.2,-12.6,'hoHeliB');B(17.3,hy,-24,17.5,hy+.3,-18.6,'hoMetal');B(20.5,hy,-24,20.7,hy+.3,-18.6,'hoMetal');
    B(18.85,hy+2.4,-21.65,19.15,hy+2.9,-21.35,'hoMetal');B(12,hy+2.9,-21.6,26,hy+2.96,-21.4,'hoMetal',CV);B(18.9,hy+2.9,-28.5,19.1,hy+2.96,-14.5,'hoMetal',CV);
    B(28.6,y,-13.2,28.7,y+3.2,-13.1,'hoMetal');B(28.7,y+2.6,-13.25,30.2,y+3.1,-13.05,'hoLineO',CV);
    for(const [x,z] of [[11.4,-29.6],[26.6,-12.4]])LIGHT(x,y+1.4,z,'#e8f0ff',11,.55);
    // air handlers, ducts, the water tanks, an aerial with its red light
    for(const [x0,z0,x1,z1] of [[-27,-28,-22,-24],[-27,-21,-22,-17],[-19.5,-27,-15.5,-23]]){B(x0,y,z0,x1,y+2.4,z1,'hoHVAC',{f:{py:'hoFan'}});B(x0+.4,y+2.4,z0+.4,x1-.4,y+2.6,z1-.4,'hoMetal',CV)}
    B(-22,y+1.6,-24,-21.4,y+2.2,-21,'hoMetal');B(-15.5,y+.8,-25.3,-12,y+1.4,-24.7,'hoMetal');B(-12,y,-25.3,-11.4,y+1.4,-24.7,'hoMetal');
    for(const [x,z] of [[-19,-34.4],[-14.4,-34.4]]){B(x-1.6,y,z-1.6,x+1.6,y+.5,z+1.6,'hoConc');MAP.deco.push({k:'drum',x,y:y+.5,z,r:1.4,h:3,mat:'hoAmbW',rot:0});B(x-1,y+.5,z-1,x+1,y+3.5,z+1,'metalx')}
    B(-6.1,y,-36.1,-5.9,y+6,-35.9,'hoMetal');B(-6.2,y+6,-36.2,-5.8,y+6.3,-35.8,'hoLampR',CV);
    for(const z of [-36.6,-33.8])for(const x0 of [-4,2.6]){B(x0,y+.75,z,x0+5.4,y+.85,z+1.8,'hoMetal',{f:{py:'hoSolar'}});for(const x of [x0+.2,x0+5])B(x-.06,y,z+.3,x+.06,y+.75,z+1.5,'hoMetal')}
    B(-1,y,-30.8,1,y+.4,-29.6,'hoConc');B(-.1,y+.4,-30.3,.1,y+1.6,-30.1,'hoMetal');B(-.7,y+1.4,-30.9,.7,y+2.4,-30.8,'hoMach',CV);
    // the big sign facing the plaza, on its steel frame
    for(const x of [-8.2,-.1,7.9])B(x,y,-9.25,x+.24,y+4.9,-9.05,'hoMetal');B(-8.2,y+.6,-9.25,8.2,y+.8,-9.05,'hoMetal');B(-8,y+.9,-9.02,8,y+4.9,-8.98,'hoSignH',only('pz','hoSignH'));
    LIGHT(0,y+2.5,-6.5,'#ff6a5a',13,.4)}

  // ================= the emergency wing: treatment hall, resuscitation, isolation rooms, bays; the canopy over the ambulance bay =================
  {const y=0;
    wallX(32,58,-36,-35.6,0,4.2,'hoFacade',[],{f:{pz:'hoWallC'}});wallZ(57.6,58,-35.6,-10.4,0,4.2,'hoFacade',[],{f:{nx:'hoWallWin'}});
    wallX(32,58,-10.4,-10,0,4.2,'hoFacade',[[35,36.8,0,2.4],[42,47,0,2.8]],{f:{nz:'hoWallC'}});wallZ(32,32.05,-35.6,-10.4,0,CH,'hoWallC',[[-21.6,-19.4,0,2.6]]);
    B(32,3.8,-36,58,4.2,-10,'hoPanel',{f:{py:'hoConcF',ny:'hoCeil'}});B(34,3.8,-10,58,4.2,-2,'hoPanel',{f:{py:'hoConcF'}});
    B(32,4.2,-36,58,5.2,-35.7,'hoPanel');B(57.7,4.2,-35.7,58,5.2,-2,'hoPanel');B(32,4.2,-10.3,34,4.5,-10,'hoPanel');B(33.7,4.2,-10,34,4.5,-2,'hoPanel');
    B(34,3.2,-2.3,58,3.8,-2,'hoPanel');for(const x of [34.2,40,46,52])B(x,0,-2.6,x+.5,3.2,-2.1,'hoPanel');B(43,3.25,-1.99,49,4.19,-1.95,'hoSignER',only('pz','hoSignER'));
    for(const x of [38,46,54])cl(x,-6,3.8,'#eef4ff',x===46?9:0,.6);LIGHT(46,3.8,0,'#ff5a4a',9,.45);
    // the resuscitation room
    pZ(-35.6,-28,40,y,'hoWallC');pX(32,40,-28,y,'hoWallC',[[35.4,37.2]]);bedZ(36,-32.6,y);mon(37.2,-34.6,y,'pz');mach(33,-35.4,34,-34.4,y,1.2,'hoBinR');iv(34.8,-33.8,y);
    B(32.06,1.4,-33.6,32.08,2.8,-31.6,'hoPoster2',only('px','hoPoster2'));cl(36,-32,CH,'#f0f6ff',7,.65);
    // isolation rooms: a glass wall with three doors, a bed in each
    wallX(40,57.6,-30.6,-30.4,0,CH,'hoGlassP',[[42.2,44,0,2.4],[48.2,50,0,2.4],[54.2,56,0,2.4]],{pass:1});pZ(-35.6,-30.5,46,y,'hoWallC');pZ(-35.6,-30.5,52,y,'hoWallC');
    for(const x of [43,49,55]){bedZ(x,-33.6,y);mon(x+1,-35,y,'pz');cl(x,-33,CH,'#ffd8d0',5.5,.35);B(x-1.6,2.5,-30.38,x+1.6,3.1,-30.36,'hoSnIso',only('pz','hoSnIso'))}
    // the bays along the east wall (curtains between), the nurse station island, triage by the doors, stretchers in the hall
    for(const z of [-26.8,-23.1,-19.4,-15.7])cur(53,z,57.6,z+.05,y);for(const z of [-28.6,-24.9,-21.2,-17.5,-13.8]){bedZ(56,z,y);mon(56.9,z-1.2,y,'nx');cur(53,z+.6,53.05,z+1.7,y)}
    ctr(43,-25.6,49,-25,y,1.1);ctr(43,-25,43.6,-21.6,y,1.1);ctr(48.4,-25,49,-21.6,y,1.1);ctr(43,-21.6,45.2,-21,y,1.1);ctr(46.8,-21.6,49,-21,y,1.1);
    B(44.2,y,-24.4,47.8,y+.75,-23.8,'hoDesk',{f:{py:'hoTop'}});for(const x of [45,47])monitor(x-.3,y+.75,-24.3,x+.3,y+1.15,-24.26,'pz');for(const x of [45,47])chair(x,-23.2,y);
    ctr(36,-15.4,40.4,-14.6,y,1.1);monitor(37.6,y+1.1,-15.2,38.2,y+1.45,-15.16,'pz');for(const z of [-12.6,-11.2])seats(33.4,40,z-.28,z+.28,y,'n');
    for(const [x,z] of [[45.6,-17],[40.4,-22.4],[50,-14.6]])bedX(x,z,y);iv(44.2,-17.4,y);B(41,y,-26.6,42,y+1.1,-25.8,'hoBinR');B(50,y,-29.4,51,y+1.5,-28.6,'hoMach');
    B(42,2.7,-10.38,47,3.3,-10.36,'hoSnEmg',only('nz','hoSnEmg'));plant(33,-27.2,y);
    for(const [x,z] of [[46,-27.6],[46,-17.2],[38,-20.6],[38,-12.6]])cl(x,z,CH,'#eef6ff',9.5,.68);for(const z of [-26.8,-19.4,-12])cl(55.2,z,CH,'#eef6ff',7.5,.55,'z');
    flick(46,3.3,-17.2,'#e8f0ff',7,.35,.5);
    // the ambulances (one with its beacons going), a stretcher, oxygen bottles
    const amb=(x,z0,lit)=>{B(x-1.1,.5,z0,x+1.1,2.7,z0+3.8,'hoAmbW',{f:{px:'hoAmb',nx:'hoAmb'}});B(x-1.05,.45,z0+3.8,x+1.05,2.1,z0+5.6,'hoAmbW');B(x-1,1.35,z0+5.6,x+1,2.05,z0+5.62,'carGl',CV);
      B(x-1,1.35,z0+3.82,x+1,2.05,z0+5.4,'carGl',{nosolid:true,f:{py:'none',ny:'none'}});for(const z of [z0+.8,z0+4.6])for(const s of [-1,1])B(x+s*1.05-.15,0,z-.36,x+s*1.05+.15,.72,z+.36,'tire');
      B(x-.8,2.1,z0+4.2,x+.8,2.3,z0+4.6,'hoBeacon',CV);B(x-.05,.5,z0-.02,x+.05,2.6,z0,'hoMetal',CV);if(lit){flick(x,2.6,z0+4.4,'#ff2a2a',8,.5,.9)}};
    amb(38.6,-5.2,1);amb(50,-9.6,0);B(42.6,y,-6.4,43.6,y+.75,-4.4,'hoMach',{f:{py:'hoSheetZ'}});for(let i=0;i<4;i++)MAP.deco.push({k:'drum',x:56.6+(i%2)*.32,y,z:-8.8+(i>>1)*.32,r:.12,h:1.4,mat:'drumB',rot:i});B(56.4,y,-9,57.1,y+1.4,-8.3,'metalx');
    // the terrace on top: condensers, an exhaust stack
    for(const [x,z] of [[40,-33],[44,-33],[48,-33],[52,-33]]){B(x-.8,4.2,z-.6,x+.8,5.4,z+.6,'hoHVAC',{f:{py:'hoFan'}})}B(55.4,4.2,-34,56.6,6.4,-32.8,'hoMetal');
    for(const [z0,z1] of [[-27,-21],[-17,-12]]){B(41,4.2,z0,49,4.75,z1,'hoPanel',{f:{py:'hoSkyG'}})}B(55.2,4.2,-30,57.4,4.95,-14,'hoCurb',{f:{py:'hoHedge'}});B(34.2,4.2,-26,36.4,4.95,-14,'hoCurb',{f:{py:'hoHedge'}});
    MAP.deco.push({k:'drum',x:35.6,y:4.2,z:-32,r:1.1,h:2.4,mat:'hoAmbW',rot:0});B(34.8,4.2,-32.8,36.4,6.6,-31.2,'metalx');B(57.1,4.2,-6.1,57.3,10,-5.9,'hoMetal');B(57,10,-6.2,57.4,10.3,-5.8,'hoLampR',CV)}

  // ================= the parking tower (P1 ground, P2 4.2, P3 8.4 open roof), its ramps, stairwell and the skybridge =================
  {const X0=-72,X1=-42,Z0=-44,Z1=-8,C='hoConc',PK='#ffcf8a';
    const STP=[-45.4,-44,-42,-39.1];
    slab(X0,Z0,X1,Z1,3.8,4.2,C,[[-59,-36,-55.4,-14],STP],{f:{py:'hoParkF'}});slab(X0,Z0,X1,Z1,8,8.4,C,[[-55,-36,-51.4,-14],STP],{f:{py:'hoConcF'}});
    // ramp 1 (P1→P2) rises north on the west lane, ramp 2 (P2→P3) south on the east lane; a wall between them; stepped side walls
    stairs('z',-59,-55.4,-14,-36,0,4.2,21,'hoConcF');stairs('z',-55,-51.4,-36,-14,4.2,8.4,21,'hoConcF');B(-55.4,0,-36,-55,9.4,-14,C);
    for(let i=0;i<21;i++){const t=.2*(i+1),a=-14-(22/21)*(i+1),b=-14-(22/21)*i;B(-59.3,0,a,-59,t+1,b,C);const c=-36+(22/21)*i,d=-36+(22/21)*(i+1);B(-51.4,4.2,c,-51.1,4.2+t+1,d,C)}
    B(-59.3,4.2,-36,-59,5.2,-14,C);B(-59.3,4.2,-14,-55.4,5.2,-13.7,C);B(-51.4,8.4,-36,-51.1,9.4,-14,C);B(-55,8.4,-36.3,-51.1,9.4,-36,C);
    // the deck edges: low walls with gaps on P1, parapets on P2 (the skybridge's gap) and P3
    wallX(X0,X1,Z1-.3,Z1,0,1,C,[[-62,-50,0,1]]);wallZ(X0,X0+.3,Z0,Z1,0,1,C,[]);wallZ(X1-.3,X1,-37.2,Z1,0,1,C,[[-31,-28,0,1],[-17,-14,0,1]]);wallX(X0,-45.4,Z0,Z0+.3,0,1,C,[]);
    for(const y of [4.2,8.4]){wallX(X0,X1,Z1-.3,Z1,y,y+1.05,C,[]);wallZ(X0,X0+.3,Z0,Z1,y,y+1.05,C,[]);wallX(X0,-45.4,Z0,Z0+.3,y,y+1.05,C,[]);
      wallZ(X1-.3,X1,-37.2,Z1,y,y+1.05,C,y<5?[[-22,-19,y,y+1.05]]:[])}
    for(const x of [-71.7,-66,-48,-42.3])for(const z of [-43.7,-35,-26,-17,-8.3]){if(x===-42.3&&z===-43.7)continue;B(x-.3,0,z-.3,x+.3,8,z+.3,C)}
    stairwell(-45.4,-44,[0,4.2,8.4],['hoP1','hoP2','hoP3'],'hoConc');
    // cars on every deck (west row nose to the wall, east row backed in), the ticket booth and barrier, deck lights, the sign on the roof
    // (car() in map.js always stands on the ground: carY is the same car on a deck)
    const carY=(x0,z0,x1,z1,mat,y)=>{const ax=(x1-x0)>=(z1-z0),L=ax?x1-x0:z1-z0,W=ax?z1-z0:x1-x0;
      const LB=(a0,a1,c0,c1,y0,y1,m,oo)=>ax?B(x0+a0,y+y0,z0+c0,x0+a1,y+y1,z0+c1,m,oo):B(x0+c0,y+y0,z0+a0,x0+c1,y+y1,z0+a1,m,oo);
      LB(.12,L-.12,0,W,.32,.95,mat);LB(1.15,L-1,.1,W-.1,.95,1.48,'carGl',{f:{py:mat}});LB(0,.12,.08,W-.08,.3,.62,'hoMetal');LB(L-.12,L,.08,W-.08,.3,.62,'hoMetal');
      for(const a of [.55,L-1.25])for(const c of [-.04,W-.24])LB(a,a+.7,c,c+.28,0,.64,'tire')};
    const CM=['hoCar','hoCarR','hoAmbW','hoCar','hoTaxi','hoCarR','hoCar'];let ci=0;
    const park=(y,W,E)=>{for(const z of W)carY(-71.2,z-.95,-66.8,z+.95,CM[ci++%CM.length],y);for(const z of E)carY(-47.3,z-.95,-42.9,z+.95,CM[ci++%CM.length],y)};
    park(0,[-40.6,-38,-32.8,-30.2,-22.4,-14.6,-12],[-33,-30.4,-25,-11.8]);park(4.2,[-40.4,-35.2,-27.4,-19.6,-12.4],[-31,-27.8,-13]);park(8.4,[-39,-26,-13],[-31.6,-12.6]);
    carY(-64.6,-30.95,-60.2,-29.05,'car',0);carY(-64.2,-20.95,-59.8,-19.05,'carR',0);carY(-64.4,-17.4,-60,-15.5,'hoAmbW',8.4);
    B(-49.6,0,-7.2,-48,2.4,-5.6,'hoPanel',{f:{py:'roof'}});B(-49.62,1,-7,-49.58,1.9,-5.8,'carGl',CV);B(-56,1,-6.65,-49.8,1.1,-6.55,'hazard',CV);
    for(const [x,z] of [[-69,-41],[-63,-41],[-69,-27],[-63,-24],[-69,-12],[-63,-11],[-50,-33],[-49,-24],[-49,-12],[-57,-40]])cl(x,z,3.8,PK,11,.78);
    for(const [x,z] of [[-69,-40],[-63,-40],[-69,-26],[-63,-24],[-69,-12],[-63,-12],[-47,-30],[-47,-14],[-57,-40]])cl(x,z,8,PK,11,.75);
    for(const [x,z] of [[-70.6,-42.6],[-70.6,-25],[-70.6,-9.4],[-50,-42.6]]){B(x-.08,8.4,z-.08,x+.08,13,z+.08,'hoMetal');B(x-.4,13,z-.25,x+.4,13.15,z+.25,'hoMetal',CV);B(x-.32,12.95,z-.18,x+.32,13,z+.18,'lampO',CV);LIGHT(x,12.4,z,PK,15,.75)}
    for(const x of [-60.6,-53.4])B(x,8.4,-8.2,x+.2,12.2,-8,'hoMetal');B(-60.8,9.6,-8.01,-53.2,12.4,-7.97,'hoSignP',only('pz','hoSignP'));
    B(-66.28,1.4,-8.62,-65.72,1.96,-8.6,'hoP1',only('nz','hoP1'));flick(-62,3.3,-30,PK,8,.35,.6);
    // the skybridge (2F level, glass walls) over the service road, two columns under it
    B(-42,3.8,-22.4,-31.6,4.2,-18.6,'hoPanel',{f:{py:'hoFloor'}});B(-42,4.2,-22.4,-32,7,-22.24,'hoGlassW',{pass:1});B(-42,4.2,-18.76,-32,7,-18.6,'hoGlassW',{pass:1});
    B(-42,7,-22.4,-31.6,7.3,-18.6,'hoPanel');for(const x of [-37.4])for(const z of [-22.2,-19])B(x-.25,0,z-.25,x+.25,3.8,z+.25,'hoPanel');cl(-37,-20.5,7,'#e6eeff',7.5,.55)}

  // ================= the plaza: the entrance canopy, the drop-off loop round the fountain island, the bus stop =================
  {B(-10,3.8,-8,10,4.2,-2,'hoPanel',{f:{py:'hoConcF'}});B(-10,3.3,-2.3,10,3.8,-2,'hoPanel');for(const x of [-9.4,-3.4,3.4,9.4])B(x-.3,0,-2.9,x+.3,3.3,-2.3,'hoPanel');
    railX(-10,10,-2.1,4.2);railZ(-8,-2.1,-9.9,4.2);railZ(-8,-2.1,9.9,4.2);for(const x of [-5,5])cl(x,-5,3.8,'#f4f0e6',9,.6);
    // the island: a round fountain with the sunrise sculpture, benches, low hedges, zelkovas; the hospital's name on a low wall at its south end
    MAP.deco.push({k:'drum',x:0,y:0,z:9,r:3.6,h:.55,mat:'hoCurb',rot:0});MAP.deco.push({k:'drum',x:0,y:.4,z:9,r:3.3,h:.06,mat:'hoWater',rot:0});
    B(-2.6,0,6.4,2.6,.55,11.6,'metalx');B(-3.5,0,7.4,3.5,.55,10.6,'metalx');B(-1.6,0,5.5,1.6,.55,12.5,'metalx');
    B(-.3,.5,8.7,.3,3.4,9.3,'hoSteel');for(let k=0;k<6;k++){const a=k/6*Math.PI;B(Math.cos(a)*1.5-.12,2.2+Math.sin(a)*1.5,8.9,Math.cos(a)*1.5+.12,2.44+Math.sin(a)*1.5,9.1,'hoSteel',CV)}
    B(-4,0,15.6,4,1.7,16.4,'hoPanel',{f:{pz:'hoCurb',py:'hoCurb'}});B(-4,.15,16.4,4,1.65,16.42,'hoSignH',only('pz','hoSignH'));
    for(const [x0,z0,x1,z1] of [[-15.6,.4,-3,1],[3,.4,15.6,1],[-15.6,17,-3,17.6],[3,17,15.6,17.6],[-15.6,1,-15,7],[-15.6,11,-15,17],[15,1,15.6,7],[15,11,15.6,17]])B(x0,0,z0,x1,.8,z1,'hoHedge');
    for(const [x,z] of [[-9,4],[9,4],[-9,14],[9,14]]){B(x-1,0,z-.25,x+1,.45,z+.25,'hoWood',{f:{px:'hoMetal',nx:'hoMetal'}})}
    // the bus stop on the west sidewalk
    B(-25.8,2.6,8,-22.8,2.75,14,'hoPanel');B(-25.8,0,8,-25.6,2.6,14,'hoGlassP',{pass:1});for(const z of [8.1,13.9])B(-25.8,0,z-.1,-25.6,2.6,z+.1,'hoMetal');
    B(-25.4,0,9,-24.8,.46,13,'hoWood');B(-25.6,.9,9.4,-25.58,2.2,12.6,'hoPoster',only('px','hoPoster'));B(-22.6,0,14.6,-22.5,3,14.7,'hoMetal');B(-22.7,2.2,14.2,-22.4,2.9,15.4,'hoMetal',{nosolid:true,f:{px:'hoSnBus',nx:'hoSnBus'}})}

  // ================= trees, lamps, benches, hedges =================
  // zelkova (a broad green crown) and ginkgo (a narrow golden one): a round trunk, a solid core, cut-out leaf clumps
  const tree=(x,z,h,g)=>{MAP.deco.push({k:'drum',x,y:0,z,r:g?.18:.24,h,mat:'hoBark',rot:hash2(Math.round(x*7),Math.round(z*7),9)*TAU});B(x-.18,0,z-.18,x+.18,h,z+.18,'metalx');
    const m=g?'hoLeafY':'hoLeafG',s=hash2(Math.round(x*3),Math.round(z*3),11);
    if(g){for(let i=0;i<7;i++){const a=i*2.4+s*6,f=i<4?.6:.35,w=i<4?.9:.7,yy=h*(.42+i*.075);B(x+Math.cos(a)*f-w,yy,z+Math.sin(a)*f-w,x+Math.cos(a)*f+w,yy+h*.22,z+Math.sin(a)*f+w,m,CV)}B(x-.5,h*.88,z-.5,x+.5,h*1.06,z+.5,m,CV)}
    else{B(x-1.9,h*.58,z-1.9,x+1.9,h*.86,z+1.9,m,CV);for(let i=0;i<6;i++){const a=i*1.05+s*5,f=1.5+(i%2)*.5,w=1.05+(i%3)*.2,yy=h*(.48+(i%3)*.12);B(x+Math.cos(a)*f-w,yy,z+Math.sin(a)*f-w,x+Math.cos(a)*f+w,yy+h*.24,z+Math.sin(a)*f+w,m,CV)}}};
  for(const [x,z] of [[-12,3],[12,3],[-12,15],[12,15]])tree(x,z,7,0);for(let z=27;z<46;z+=6){tree(-8,z,8.5,1);tree(8,z,8.5,1)}
  for(const [x,z] of [[-29,-4],[-24,-4],[27,-4],[-38,4],[-38,22],[-38,40],[-27,47]])tree(x,z,8,1);
  for(const [x,z,g] of [[30,10,0],[38,9,1],[56,9,0],[33,18,1],[42,30,0],[60,20,1],[68,10,0],[68,30,1],[30,44,0],[52,44,1],[64,44,0],[40,40,1]])tree(x,z,g?8.6:7.2,g);
  for(const [x,z] of [[-20,-2.5],[-30,-2.5],[20,-2.5],[-18,26],[18,26],[-24,30],[24,30],[0,26.5]])lamp(x,z,5.6,'#ffd8a8');
  for(const [x,z] of [[-50,12],[-50,34],[-34,12],[-62,26],[62,-24],[66,-6],[36,24.6],[58,24.6],[47.5,14],[47.5,38],[-20,-44],[20,-41],[48,-44]])lamp(x,z,6.2,'#ffcf98');

  // ================= the car park (south-west): stalls, abandoned cars, the pay booth =================
  {for(const [k,z,m] of [[0,4.4,'hoCar'],[2,4.4,'hoCarR'],[7,4.4,'hoAmbW'],[10,4.4,'hoCar'],[1,20.4,'hoTaxi'],[4,20.4,'hoCar'],[8,20.4,'hoCarR'],[12,20.4,'hoCar'],
      [3,25.4,'hoCar'],[6,25.4,'hoAmbW'],[11,25.4,'hoCarR'],[0,38.4,'hoCar'],[5,38.4,'hoCarR'],[14,38.4,'hoCar']]){const x=-70+2.6*k+1.3-.95;car(x,z,x+1.9,z+4.4,m)}
    car(-46,10.6,-41.6,12.5,'carBurnt',{burnt:1});B(-30,0,44,-27,2.4,46.6,'hoPanel',{f:{py:'roof'}});B(-30.02,1,44.4,-29.98,1.9,46.2,'carGl',CV);
    for(const [x0,z0,x1,z1] of [[-71,13.4,-28,15.6],[-71,32.6,-28,34.8]]){B(x0,0,z0,x1,.25,z1,'hoCurb',{f:{py:'hoGrass'}})}
    for(const x of [-64,-52,-40])tree(x,14.5,6.4,0);for(const x of [-60,-46,-34])tree(x,33.7,6.4,1)}

  // ================= the quarantine checkpoint at the main gate: field tents, sandbags, barriers, a military truck, floodlights, a burning car =================
  {const tent2=(x0,z0,x1,z1,d0,d1)=>{const h=2.4,t=.06,M='hoTent';wallX(x0,x1,z0,z0+t,0,h,M);wallX(x0,x1,z1-t,z1,0,h,M);wallZ(x0,x0+t,z0+t,z1-t,0,h,M);wallZ(x1-t,x1,z0+t,z1-t,0,h,M,[[d0,d1,0,2.25]]);
      const cz=(z0+z1)/2,hw=(z1-z0)/2+.15;B(x0-.12,h,cz-hw,x1+.12,h+.26,cz+hw,M);B(x0-.12,h+.26,cz-hw*.64,x1+.12,h+.5,cz+hw*.64,M);B(x0-.12,h+.5,cz-hw*.3,x1+.12,h+.68,cz+hw*.3,M);
      B(x1+.12,2.45,d0-.25,x1+.15,2.85,d1+.25,'signMed',{nosolid:true});B(x1,2.12,d0,x1+.2,2.3,d1,M,{nosolid:true})};
    tent2(-25,31,-19,37,33,35);tent2(-25,39.5,-19,45.5,41.5,43.5);
    for(const [x0,z0,x1,z1] of [[-14,44.6,-6.6,45.6],[6.6,44.6,14,45.6],[-14,40.4,-13,44.6],[13,40.4,14,44.6]])B(x0,0,z0,x1,1.1,z1,'sandbag');
    for(const x of [-5.6,-3.2,1.2,3.6])B(x,0,36.6,x+2.2,.85,37.2,'barrier');for(const x of [-13,-10.6])B(x,0,29,x+2.2,.85,29.6,'barrier');
    // the truck (olive, a canvas over its bed), parked across the east lane of the gate road
    B(8.6,.5,30,11,2.4,32.2,'hoMil');B(8.7,1.5,29.98,10.9,2.2,30.02,'carGl',CV);B(8.6,.9,32.2,11,1.6,37.4,'hoMil');B(8.5,1.6,32.2,11.1,3.3,37.4,'tent');
    for(const z of [31,35.8])for(const x of [8.5,10.8])B(x-.1,0,z-.45,x+.2,.9,z+.45,'tire');
    for(const [x,z] of [[-15.5,27.5],[15.5,27.5]]){B(x-.1,0,z-.1,x+.1,6.4,z+.1,'hoMetal');B(x-.6,6.4,z-.2,x+.6,6.9,z+.2,'hoMetal',CV);B(x-.5,6.35,z+.2,x+.5,6.85,z+.22,'hoLampW',CV);LIGHT(x,6,z+1.4,'#f0f4ff',16,.95)}
    for(const [x0,x1,z] of [[-19,-14,30.2],[14,19,30.2]]){B(x0,.95,z-.02,x1,1.03,z+.02,'hoTape',CV);for(const x of [x0,x1])B(x-.05,0,z-.05,x+.05,1.05,z+.05,'hazard',CV)}
    car(-2.6,46,1.8,47.9,'carBurnt',{burnt:1});LIGHT(-.4,1.4,45.4,'#ff8a3a',9,1.05);MAP.fires.push([-.4,1.1,47],[1,.9,46.6]);MAP.smoke.push([-.4,2,47]);
    for(const [x,z] of [[-20,39],[-17,46.8]])B(x-.9,0,z-.4,x+.9,.4,z+.4,'cot');for(const [x,z] of [[-6,30],[7,33]])cone(x,z);cone(-1,35.5);cone(.6,35.8)}

  // ================= the healing garden (south-east): the pond, the pergola, the pavilion =================
  {B(51,0,29,61,.6,29.5,'hoCurb');B(51,0,37.5,61,.6,38,'hoCurb');B(51,0,29.5,51.5,.6,37.5,'hoCurb');B(60.5,0,29.5,61,.6,37.5,'hoCurb');B(51.5,0,29.5,60.5,.36,37.5,'hoWater');
    for(const [x,z] of [[53,31],[58.5,36],[56,32.6]])B(x-.5,.36,z-.4,x+.5,.7,z+.4,'hoCurb');
    // the pergola: posts, beams, slats overhead, benches under it
    for(const x of [30,34,38])for(const z of [36,41]){B(x-.12,0,z-.12,x+.12,2.7,z+.12,'hoWood')}for(const z of [36,41])B(29.6,2.7,z-.14,38.4,2.9,z+.14,'hoWood');
    for(let x=29.8;x<38.4;x+=.7)B(x,2.9,35.6,x+.12,3.02,41.4,'hoWood',CV);for(const z of [37,40])B(31,0,z-.25,37,.45,z+.25,'hoWood');
    // the pavilion (정자): a wooden floor 0.8 m up, steps on its west side, posts, a dark tiled hipped roof
    B(58,0,8,66,.8,16,'hoWood');stairs('x',11,13,56.2,58,0,.8,3,'hoWood');for(const x of [58.2,62,65.6])for(const z of [8.2,15.6])B(x,0,z,x+.2,3.6,z+.2,'hoWood');
    B(57.2,3.6,7.2,66.8,3.9,16.8,'roof');B(58.2,3.9,8.2,65.8,4.3,15.8,'roof');B(59.4,4.3,9.4,64.6,4.6,14.6,'roof');B(60.6,4.6,10.6,63.4,4.8,13.4,'roof');
    for(const [x0,z0,x1,z1] of [[58,8,66,8.12],[58,15.88,66,16],[65.88,8,66,16]])B(x0,.8,z0,x1,1.3,z1,'hoWood');LIGHT(62,3.2,12,'#ffd8a8',8,.5);
    for(const [x0,z0,x1,z1] of [[26,26.6,44,27.4],[50,26.6,72,27.4],[49.6,6,50.4,22],[49.6,28,50.4,46],[26,13,30,14]])B(x0,0,z0,x1,.9,z1,'hoHedge');
    for(const [x,z] of [[35,24.5],[56,24.5]])B(x-1,0,z-.25,x+1,.45,z+.25,'hoWood',{f:{px:'hoMetal',nx:'hoMetal'}});
    B(45,0,18,46,1.2,19,'hoCurb');B(45.2,1.2,18.2,45.8,2.6,18.8,'hoSteel')}

  // ================= the service yard (north): the dock (a box truck backed up to it), the oxygen tank, generators, bins =================
  {B(-8,3.4,-42,8,3.6,-38,'hoPanel');for(const x of [-7.8,7.6])B(x,0,-42,x+.2,3.4,-41.8,'hoMetal');cl(0,-40,3.4,'#e6eeff',9,.6);
    B(-5.2,.9,-48.6,-1.8,3.3,-41.2,'hoAmbW',{f:{py:'hoPanel'}});B(-5.1,.45,-49.4,-1.9,2.5,-48.6,'hoTaxi');B(-5,1.5,-49.42,-2,2.3,-49.38,'carGl',CV);for(const z of [-48.4,-42.4])for(const x of [-5.3,-2])B(x,0,z-.45,x+.3,.9,z+.45,'tire');
    for(const [x,z] of [[3,-44],[5.6,-46.4]]){B(x-.6,0,z-.6,x+.6,.15,z+.6,'pallet');B(x-.55,.15,z-.55,x+.55,1.2,z+.55,'wood')}
    MAP.deco.push({k:'drum',x:22,y:0,z:-45,r:1.8,h:9,mat:'hoAmbW',rot:0});B(20.6,0,-46.4,23.4,9,-43.6,'metalx');B(19.9,0,-47.7,24.1,.3,-42.3,'hoConc');
    fenceX(19,25,-48,2.2);fenceX(19,25,-42,2.2);fenceZ(-48,-42,19,2.2);for(const x of [26,27])B(x,0,-46.5,x+.5,4.5,-46,'hoMetal');
    for(const x of [31,37.5])B(x,0,-48.6,x+5.8,2.7,-45.8,'contG');B(36,2.7,-47.6,36.4,5.2,-47.2,'hoMetal');
    for(let i=0;i<4;i++)B(45+i*2.2,0,-48.8,46.8+i*2.2,1.3,-47.4,'hoBin');for(let i=0;i<3;i++)B(55+i*1.2,0,-48.8,56+i*1.2,1,-47.8,'hoBinR');
    for(const [x,z] of [[60,-46],[61.2,-46.6]])drum(x,z);crate(64,-46,1.2);crate(65.3,-46,1.2);crate(64.6,-46,1.1,1.2);
    B(66,0,-47,69,2.6,-44,'hoPanel',{f:{py:'roof'}});B(65.98,1,-46.4,66.02,1.9,-44.8,'carGl',CV);
    for(const [x,z,m] of [[62,-30,'hoAmbW'],[62,-18,'hoCar']])car(x,z,x+1.9,z+4.4,m);car(-41,-46,-36.6,-44.1,'hoCarR');drum(-26,-47);drum(-25.4,-46.6,0,'drumR')}

  // ================= scenery beyond the walls: streets, the city's apartment blocks, low shops =================
  {const SF={ground:1},G='hoGroundF';B(-160,-1,-160,160,0,-50,G,SF);B(-160,-1,50,160,0,160,G,SF);B(-160,-1,-50,-73,0,50,G,SF);B(73,-1,-50,160,0,50,G,SF);
    const apt=(x0,z0,x1,z1,h,m)=>B(x0,0,z0,x1,h,z1,m||'hoApt',{f:{py:'hoConcF',ny:'none'}});
    for(const [x0,z0,x1,z1,h,m] of [[-76,-128,-40,-116,44.8,0],[-16,-136,24,-124,50.4,1],[44,-126,80,-114,39.2,0],[118,-66,130,-30,44.8,1],[122,-6,134,34,50.4,0],[58,116,94,128,44.8,1],
        [-20,124,20,136,39.2,0],[-82,112,-46,124,50.4,1],[-136,26,-124,62,44.8,0],[-132,-44,-120,-8,39.2,1],[-140,-110,-128,-74,56,0],[132,58,144,94,56,1],[96,-120,108,-84,33.6,0],[-112,84,-100,120,33.6,1],[98,94,110,130,28,0],[-104,-136,-68,-124,28,1]])apt(x0,z0,x1,z1,h,m?'hoAptB':'hoApt');
    for(const [x0,z0,x1,z1,h] of [[-60,-70,-30,-58,8.4],[20,-72,50,-60,12.6],[86,-30,98,0,8.4],[84,20,96,50,12.6],[-40,62,-10,74,8.4],[20,64,50,76,12.6],[-96,-20,-84,10,12.6],[-98,20,-86,50,8.4]])
      B(x0,0,z0,x1,h,z1,'hoFacadeF',{f:{py:'hoConcF',ny:'none'}})}

  // ================= people's starts, the zombies' entries, the camps, the dawn light, the title camera =================
  MAP.spawns=[];for(const x of [-9,-6,-3,3,6,9])for(const z of [-13.6,-10.6])MAP.spawns.push([x+rr(-.2,.2),z+rr(-.2,.2),0,Math.PI+rr(-.4,.4)]);
  for(const [x,z] of [[-11.5,-24],[11.5,-24],[-11.5,-20],[11.5,-20]])MAP.spawns.push([x,z,0,rr(0,TAU)]);
  MAP.zspawns=[[-30,-46,0],[12,-46,0],[50,-44.5,0],[66,-36,0],[66,-12,0],[40,16,0],[62,26,0],[36,44,0],[0,21,0],[-60,10,0],[-44,30,0],[-64,44,0],[-15,38,0],
    [-62,-40,0],[-50,-12,0],[-64,-30,4.2],[-48,-36,4.2],[-62,-12,8.4],[46,-14,0],[37,-23,0],[24,-20.5,0],[-24,-20.5,4.2],[24,-29.4,4.2],[-26,-20.5,8.4],[26,-29.4,8.4],[-20,-14,YR],[50,-20,4.2]];
  MAP.camps=[
    {k:'heli',w:.12,p:[[14,YR+.4,-27],[24,YR+.4,-27],[14,YR+.4,-15],[24,YR+.4,-15]],look:[0,YR,-30]},
    {k:'roofW',w:.07,p:[[-24.5,YR,-15],[-17.5,YR,-21],[-29,YR,-27]],look:[-10,YR,-30]},
    {k:'theatre',w:.08,p:[[22,8.4,-35.6],[15,8.4,-33],[26.6,8.4,-23.4]],look:[19,9.4,-29]},
    {k:'ward',w:.07,p:[[-23.6,8.4,-36],[-30.6,8.4,-14.6],[-14.6,8.4,-14.6]],look:[-19,9.4,-20]},
    {k:'station',w:.06,p:[[-17,8.4,-24.6],[-15,8.4,-25.8]],look:[-17,9.4,-20]},
    {k:'icu',w:.08,p:[[-11.6,4.2,-33],[11.6,4.2,-33],[0,4.2,-34.6]],look:[0,5,-28]},
    {k:'ct',w:.06,p:[[-23.6,4.2,-33.6],[-14,4.2,-36.6]],look:[-19,5,-29]},
    {k:'canopy',w:.08,p:[[-8.6,4.2,-3],[8.6,4.2,-3],[0,4.2,-2.8]],look:[0,1,10]},
    {k:'erRoof',w:.1,p:[[33.4,4.2,-34.4],[56.4,4.2,-34.4],[56.6,4.2,-3.4],[35.4,4.2,-3.4]],look:[46,4,-18]},
    {k:'erStation',w:.05,p:[[45,0,-22.6],[47,0,-24.6]],look:[46,1,-14]},
    {k:'pharmacy',w:.05,p:[[-15.6,0,-16.8],[-17,0,-12.4]],look:[-8,1,-14]},
    {k:'store',w:.04,p:[[-30.4,0,-18.2],[-23.8,0,-12]],look:[-27,1,-14]},
    {k:'p3',w:.09,p:[[-71,8.4,-43],[-43,8.4,-9],[-71,8.4,-9]],look:[-56,8.4,-26]},
    {k:'p2',w:.05,p:[[-70.6,4.2,-43],[-49.4,4.2,-43]],look:[-56,4.2,-30]},
    {k:'bridge',w:.04,p:[[-33,4.2,-20.5],[-40.6,4.2,-20.5]],look:[-46,5,-20.5]},
    {k:'pavilion',w:.04,p:[[63.6,.8,10.4],[63.6,.8,14]],look:[54,1,12]},
    {k:'dock',w:.03,p:[[-1,0,-39],[1.6,0,-36.4]],look:[0,1,-46]},
    {k:'tents',w:.03,p:[[-21,0,34],[-21,0,42.5]],look:[-10,1,36]},
  ];
  MAP.spawnYaw=null;
  // dawn: no sun yet, the sky glowing pink and gold low in the east-south-east lights the east faces faintly
  MAP.moon={d:new THREE.Vector3(.86,.3,.18).normalize(),c:new THREE.Color('#c8a8b8'),i:.42};
  MAP.cam=(t,cam)=>{const a=Math.sin(t*.035)*.55;cam.position.set(a*46,15+Math.sin(t*.05)*1.5,34+Math.cos(t*.035)*4);cam.lookAt(a*12,9,-20)}}
MAPDEFS.hospital={n:['새벽 종합병원','Saebyeok General Hospital'],d:['동이 트기 직전의 종합병원. 3층까지 뚫린 유리 아트리움 로비와 에스컬레이터, 영상의학과·중환자실(2층), 수술실·병동(3층), 헬기가 내려앉은 옥상 헬기장, 구름다리로 이어진 3층 주차타워, 구급차가 멈춘 응급의료센터와 그 옥상, 격리 검문소가 선 정문 광장과 치유의 정원.',
    'A general hospital just before dawn: a three-storey glass atrium with escalators, radiology and the ICU (2F), the operating suite and the ward (3F), a helipad with a helicopter on the roof, a parking tower joined by a skybridge, the emergency wing and its roof, the quarantine checkpoint at the gate and the healing garden.'],
  env:{sky:1,skyTex:'hoSky',noStars:1,halo:'#8a9ac8',rain:0,storm:0,fog:'#3c4664',fogD:.0125,bloomThr:.8,ambOut:'#4c5876',ambIn:'#2c3038',boAmb:.45},
  bounds:[-75,-52,75,52],probeY:[.9,2.6,5.1,9.3,13.5,15.4],mini:[2.6,6.8,11],tex:bakeHoTex,build:buildHospital};
