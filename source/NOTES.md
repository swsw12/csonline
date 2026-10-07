# QUARANTINE Z — working notes (survive context compaction)

## Status (2026-10-07 ~00:20 KST)
- Workspace was reset; v5 stage-1 source restored from published artifact
  https://claude.ai/artifact/RZwXULMBfGch56zc3G3Aov (saved page:
  /root/.claude/projects/-home-claude/081f4554-0f0f-55e3-964c-e9e9013ff530/tool-results/artifact-c6f4bb1e-1791295987-4dfe.html, 3952 lines).
- Old URL needs a full re-read after every compaction (read tracking is lost) -> moved to a NEW artifact published from this session:
  https://claude.ai/artifact/2ZKrFtg7B4gLPWACgK9Ukb  (v1 = 근하신년 + CSO names). Update it by publishing file_path /home/claude/game2/dist/index.html
  with url=that link (files: assets/galmuri11.woff, assets/galmuri11b.woff from dist/assets). Multiplayer publish needs capabilities {room:{}}.
- 근하신년 weapons (src/nyw.js) + CSO renames implemented, sim-tested, published. NOW: multiplayer (src/net.js).
- Build: `python3 build.py` (src order incl. 'net' slot). Test: `python3 play.py steps.json` (PAGES=n for multi-page).
- User's PC folder: C:\Users\ksw\Desktop\portfolio\game\game2 (device bridge flaky; v4 there).

## User decisions
- Multiplayer: P2P WebRTC, host-authoritative (host = room creator's browser), friends only, free, best ping.
  Signaling: claude `room` capability inside claude.ai artifact; PeerJS cloud outside (standalone file / own site).
  Fallback inside claude: relay via room presence if DataChannel fails. Own movement+shot hits client-side; host owns HP/infection/rounds/bots.
- CSO content: use CSO names, stats, special mechanics, modes, zombie classes/skills, 근하신년 series + 근/하/신/년 letter event.
  Visual designs/sounds/logos stay ORIGINAL (declined copying Nexon art). Don't converge models toward CSO looks.
- Order: 근하신년 weapons + CSO renames -> multiplayer -> maps (v5-2) -> v5-3 (sound, HUD, cinematics, optimization/touch).

## Code map (key APIs)
- WPN[id]: slot(1 prim,2 pistol,3 melee,4 nade), kind(melee/pistol/shotgun/smg/rifle/sniper/mg/special/nade/claw), n:[ko,en], cost, mag,res,dmg,rpm,
  semi,burst,burstCd,spread[stand,move,air],spreadZ,zoom[fov..],rec[v,h],kb,stag,hs,reload,shellRel,relStart,brk,bolt,pump,dual,spin(spinup s),proj('gl'),pellets,
  draw,speed,snd(SFX key),model(GUNS key),hold(rifle/pistol/dual/knife/axe/nade),shell. Melee: dmg[2],rate[2],range[2],kb[2],sw,hitT[2].
- BUY_MENU [{k,n,items}], EQUIP{armor,ammo}, HOLDS, holdFor(id).
- fireGun(a,W) -> shotTrace/launchProj; rayActors(src,o,d,tmax); meleeHit/meleeSwing/meleeStrike; NADES[], throwNade, updateNades, detonate(n) kinds gl/he/frost/zbomb/flare.
- game.js: mkActor, cmd{f,s,jump,duck,walk,fire,alt,reload,skill,slot,nv,lastInv}, pc=prev cmd; equip(a,id), buy(a,id), actorPhysics, actorWeapons, zombieAttack, clawStrike, useSkill,
  damageActor(t,dmg,src,o{w,hs,dir,kb,stag,x,y,z,knife,heavy,he,up}) zombies only; hurtHuman; infect; killZombie; becomeZombie(a,host); reviveZombie; startMatch(cfg); startRound; selectHosts; endRound; gameUpdate(dt).
  ZCLASS rager/runner/brute/scream (skills frenzy/leap/harden/shriek). HSKINS guard/medic/soldier/hazmat. Money cap 16000.
- gunart.js: GA_MATS (48 of 64 atlas slots used, 8 per row, 128px), Pt(x,y,z,w,h,d,mat,{rx,ry,rz,tag,r}), GUNS[id]={parts,grip,sup,muzzle,mag,eject,scope?,hinge?,spinAxis?}; tags mag/slide/pump/bolt/spin.
  gunGeo(id), matGun(), gunIcon(id,h), buildVM(id,skin,U,dual).
- vm.js: VM_POS per id/kind, vmKick(W), VMK keyframe tracks, VM.set/fire/reload/melee/claw/throwNade.
- audio.js: GUNDEF recipes -> gunshot(B,p); SFX{name:{n,dur,ch,peak,gain,rev,poly,pj,fn}}; SFX_ORDER must list every SFX; AU.play(name,o), AU.at(name,x,y,z,o).

## Multiplayer design (src/net.js) — keep in sync with code
- Roles: NET.host / NET.cli; NET.on. Star topology, host = room creator. Actor flags: a.net=peerKey (players) or null (bots);
  a.pup = not simulated locally (host: remote players; client: everyone except own player). Bots run AI only on host.
- Authority: host owns HP/armor/team/alive/money/lvl/skillT/skillCD/round flow/infection/kills/traps/burn damage.
  Owner (host for bots+host player, client for its player) owns movement, aim, inventory/ammo, projectiles it fires.
- Client intercepts: damageActor -> hit claim batch 'h'; clawStrike -> 'claw'; hurtHuman fall -> 'fall'; useSkill -> 'sk' request;
  buy -> 'buy' request ('buyok' applies buy(P,id,true)). Guards: NET.ghost (cosmetic replay: no damage/effects),
  NET.ev (client applying a host event may call infect/killZombie/reviveZombie/selectHosts/endRound/startRound(plan)).
- Effects on non-owned actors (kvx/kvz/c.vy launch, frozen, staggerT, dizzy, shriekT, rootT, burnT[cli->host only]) are found by
  netPre/netPost diff around the frame and sent as 'eff' to the owner (client->host->owner).
- Host events (reliable): lobby,start,round,hosts,infect,kill,hdie,rv,end,over,buyok/buyno,eff,sk,trap,tsnap,snd,bot,tolobby,bye.
- Unreliable tick 20Hz: host {k,ts,g,A,S?,f}; client {k,ts,s,f,pe,pd}. fx: f fire,p proj,m melee,c claw,n nade,x alt,s sawswing.
  Receivers replay fx on puppets under NET.ghost (fireGun etc.), launchProj skipped in ghost; 'p'/'n' spawn ghost projectiles.
- Transports: claude room (named room 'qz-<code>', presence signaling with compact SDP, RTC DataChannels r/u, relay over presence
  if RTC fails within ~8s) ; PeerJS cloud in standalone (ids 'qzg-<code>', DataConnections r/u raw). Test: mock room via
  BroadcastChannel injected with play.py INIT=, SAMECTX=1.

## Multiplayer status (2026-10-06 ~18:30)
- src/net.js implemented & tested headless (2 browsers: MULTIB=1 PAGES=2 QS='?mock=1' INIT=scratchpad/mp/mockroom.js; tests t5..t13.py in
  scratchpad/mp; relay via QS '?mock=1&relay=1'; PeerJS via local server: peersrv/ node_modules/.bin/peerjs --port 9000 --host 127.0.0.1, INIT=pjinit.js).
  Verified: lobby, start, movement, hit claims, infect events, skills, knockback forwarding, kill/revive, end/over/lobby/rematch, host leave,
  client leave->bot, relay transport, buying, ghost projectiles, PeerJS transport.
- Headless sandbox is CPU-starved (2 cores): tests use fast.js (R.render no-op, NET.toMs=90000). Single-browser SAMECTX starves background page.
- Fixed: netFxPush args used WI before tables existed -> offline crash in fireGun (now WI={} default + NET.on&& guards). ALWAYS rerun
  scratchpad/t/wrange_nr.json + skills_nr.json after touching weapons/nyw.
- Next: publish with capabilities {room:{}} to https://claude.ai/artifact/2ZKrFtg7B4gLPWACgK9Ukb ; then maps (v5-2), then v5-3.

## Published 2026-10-07 00:15 KST
- https://claude.ai/artifact/2ZKrFtg7B4gLPWACgK9Ukb Version 2 (id 1791332137-092d), capabilities {room:{}} (stored; omit on redeploy to keep).
- Standalone with PeerJS sent to user as dist/quarantine-z-multiplayer.html.
- User re-sent "그대로 해줘 (카스 그대로)" -> answered again: names/mechanics yes, Nexon art/sound/logo copies no.
- NEXT: v5-2 maps (#49 Q-7 detail upgrade, #50 new subway map '새벽역'). MP must keep working: map choice must be part of
  the lobby cfg and identical on all pages (buildMapData is deterministic? check RNG use) — host sends map id in 'start'.

## v5-2 maps (2026-10-07 ~10:10 KST) — IN PROGRESS
- map.js refactored: MAPDEFS registry {q7, sub(+ mapsub.js), italy(TODO)}, buildMapData(id), mapLoader generator (stash/restore MAPCACHE: meshes, WORLD.cells, NAV arrays, probes),
  loadMap(id) sync, loadMapUI(id) async with #load overlay (MAP.loading pauses Main.step), mapEnv() (sky vis, fog, rain, AU.setEnv, DL fire/dyn lights).
  Helpers: slab(x0,z0,x1,z1,y0,y1,mat,holes,o), tireStack, cone, car, tent, monitor. Face material 'none' = not drawn. MATS k = surface kind (matKind()).
  faceUV: uo/vo/sv (absolute v), uv 'boxU' (py: u per box, v world). Spawns [x,z,y?,yaw?]; MAP.zspawns, camps {k,w,p,look}; MAP.cam(t,cam) title camera; MAP.dyn flicker lights [x,y,z,col,r,i,flick]; MAP.smoke.
- nav: drops encode dy (<0); navPath(...,maxDrop) humans 4.3 m; nodes allowed down to y>-5. AI camp weight c.w. Bots' paths reset on map switch.
- Q-7 detail pass done (pilasters, watchtower SW w/ stair x[-27,-25] z18..25, tents, cars, generator+mast NE, office monitors/bunks, forklift, curbs, cones, tyres...). 602 boxes, 40 lights, 383k verts.
- Subway '새벽역' (src/mapsub.js) built: 675 boxes, 66 lights, 327k verts, load ~2 s headless. Integer-aligned walkable edges (nav cells at half-integers!).
- CFG.map + setup selector; MP lobby cfg.map (host mpset map -> loadMapUI; clients preload on lobby msg; netBegin loadMap sync). NET_VER has map ids.
- audio: AU.setEnv (underground drone, no rain/thunder, distant rumbles).
- Screenshot tour script: scratchpad/shots/tour.json (poses via MAP.cam override). Top view: scratchpad/map/top.js (__topY slice, __navDots).
- USER REQUEST 10:08: new map '이탈리아' following their top-down image (/root/.claude/uploads/081f4554-0f0f-55e3-964c-e9e9013ff530/fd335543-image.png),
  as similar as possible; original procedural textures. Keep q7+sub too (3 maps).

## Published 2026-10-07 ~12:00 KST: v5.2 maps (artifact Version 3, id 1791341933-2bac, room capability kept)
- 4 maps: q7 (detail pass), sub '새벽역' (src/mapsub.js), italy '이탈리아' (src/mapit.js + mapit_data.js generated by
  scratchpad/italy/gen.py from the user's overview), militia '밀리샤' (src/mapmil.js + mapmil_data.js; built by a subagent from
  the user's overview; agent scratch in scratchpad/militia/, gen in militia/gen.py). Per-map bounds (italy [-41,-27,41,27]); WORLD grid ±48.
- Engine: nav floor detection half-open (cells on box edges); navPrune() keeps only nodes reachable from spawns; env sky switching
  (skyTex, sun disc via MAP.skyParts), ambOut per map, MATS cs (cell size), MAP.spray fountains, build OUT_DIR / play.py DIST env vars.
- Checks done: navcheck (all 4 maps single component, no bad spawns/camps), bot matches on all 4 maps (no errors), wrange_nr/skills_nr OK.
- USER: multiplayer work deferred ("멀티플레이 관련 작업은 뒤로") — the MP map-switch test (scratchpad/mp/t14.py) has NOT been run yet.
- Next (v5-3): sound renewal, HUD/menu, cinematics, optimization/mobile; later MP map-switch test; save to PC (device bridge now available).

## Italy rework (2026-10-07 ~13:30 KST) — from the user's CSO Italy walkthrough video (youtube gDxgKpLQ8bA)
- src/mapit.js rewritten: itPlan() patches ITALY_DATA grid + per-cell floor height H and kind K
  (0 street, 1 ramp, 2 cellar floor, 3 upper quarter iron rails, 4 stairs w/ wooden treads, 5 east terrace wooden rails, 6 cellar stairs).
  Upper west quarter U=3 (spawn piazza, west street, NW piazza, pocket); lane x<-33 climbs 0->3 from the iron gate (z=-14) south;
  long stepped ramp S1 x(-18,-8) z(-6,3.5) 3->0 eastward; north stairs S2 x(-1,1.5) z(-17.5,-12.5); east terrace x(33.5,40.5) z(12,21.5) at 3
  with stairs S3 x(31.5,33.5) z(12,17) + crate climb at x 38.6-39.8 z 9.7-12 (rail gap). Cellar = old cantina 'd' cells at -2.4: open
  stairwell from the street x(7.5,11.5), roofed hall (roof 1.0-2.6, beams, racks, barrels, table, 3 lanterns), light well x(20.5,27) z(14,16.5)
  with ivy, stair tunnel x(25,29) up to the east lane (portal at x=29, carved out of building 20).
- Walk-through house itHouse(): plan x[-14,-1.5] z[-10,-3.5]; ground floor 0 (store room w/ stair along west wall, hall, south door to the nook),
  upper floor 3.0 = piazza level (2 north doors), wallpaper, sconces, stair well hole x[-13.7,-11.9] z[-8.4,-4] (open over whole flight: brutes).
- Ground boxes from heights (risers/retaining walls = box sides), automatic copings/railings (edgeRuns), rubble plinths at every wall foot,
  cellar enclosure walls/roof. Day look: skyDay (clouds, mountains NW/E, lake S), sun d(-.5,.75,.42) i .8, ambOut #7686a4, bloomThr .92.
- Engine: buildMapGeometry keeps partly-buried face cells (corner test); env.halo, env.bloomThr; MAP.miniCut per map (italy one band).
- Minimap object renamed RADAR (ui.js already had const MINI = icon cache -> boot crash). Radar verified via canvas toDataURL.
- Headless note: in-game page screenshots time out (SwiftShader frames 1-3 s); use MAP.cam title-camera tours (scratchpad/it2/tour.py).
- Checks: navcheck all 4 maps single component; bot matches OK (italy humans hold the hill, zombies get in via ramp/apartment/cellar).
- Published 2026-10-07 ~13:45 KST: artifact Version 4 (id 1791347541-ecff), room capability carried forward. Includes Italy rework + RADAR minimap.
- Next (v5-3): sound renewal, HUD/menu, cinematics, optimization/mobile; later MP map-switch test (scratchpad/mp/t14.py); save to PC.
- 챈샷 (quick switch, 13:40): game.js equip() — returning to the weapon put away < QUICK_BACK 1.2 s ago draws in QUICK_DRAW ×0.45
  (switching already drops bolt/pump + shot delay). Sim (scratchpad/it2/chanshot.js): AWP 1.27->0.57 s, Scout .97->.50, M3 .87->.50.
  Controls help lists 'Q Q'. wrange_nr/skills_nr OK.
- 칼 챈샷 / draw cut (13:50): equip() — drawing a melee weapon (kind 'melee') within DRAW_CUT_WIN 1 s of a.lastFire, with an enemy in
  heavy range+cone (meleeHit(range[1],.8)), skips the draw and does an instant heavy cut (pendingMelee .06 s; cooldown rate[1]*.8).
  Sim scratchpad/it2/drawcut.js (set Z.head when paused: heads update only in the visual pass): knife 70 dmg kb, axe 145/290.
- Hammer (14:10): WPN.hammer (slot 3 melee, '해머', 2000, dmg 95/280, rate 1.2/2.05, range 2.65/2.45, kb 28/48, up 0/4.6, stag .8/1.1,
  speed .84, draw 1.15, hitT .46/.84, anD 1.1/1.75, blunt (no limb cuts, 'hamhit' SFX, bigger shake), cleave 3 on heavy (meleeHits cone .6)).
  GUNS.hammer (1 m haft, 'forged' atlas mat), per-gun armR/armL dirs in buildVM, VM_POS.hammer + VMK hmA/hmH/drH, third-person HOLDS.hammer
  (sup two-handed, KF hamA/hamH), meleeAtkD(W,heavy) replaces axe special cases (game/net), hit-claim flag 16 = blunt. Buy: special menu.
  Sim (open lane): light 95 dmg ~7 m push; heavy 280 x up to 3 zombies ~17 m (axe heavy 5 m). Draw-cut works with it.

## v5.3 — money button, difficulty picker, lobby
- Buy menu header: "+$3000" button (`addMoney`, ADD_MONEY=3000; clients send `{t:'addm'}` to the host).
- Difficulty picker modal (`UI.diffPick`): 4 cards Easy/Normal/Hard/Expert (skull ranks); Expert = DIFF[3], zombies DIFF_Z hp/spd scaled.
- src/lobby.js (built after net.js) overrides the front end, layout modelled on game-client lobbies (original art only):
  - main menu: top bar (profile, level/XP from LS 'rec', settings/controls/language), 4 tall mode cards (quick start=`go`, create room=`start`, multiplayer, training=`help`), notice / my record / map list (click → `lobmap` loads the map behind the menu).
  - create-room window: title input (CFG.room), `<select class="dd" data-chg data-k>` rows → document 'change' → UI.act; map preview = `UI.snap()` frame of the menu scene (THUMB cache, refreshed by `UI.mapLoaded` from loadMapUI).
  - MP waiting room: 8 slots + host-only dropdowns + preview; pings patched in place by UI.mpRender.
  - record: `recMatch()` once per match in showResults (G.recDone reset at round 1).
- Options window (lobby.js `UI.buildOpts`): tabs 게임플레이/키보드/마우스/오디오/비디오, dropdowns, checkboxes (`optck`), tick sliders (`.rng`, live via applyCfg), crosshair colour/gap (CFG.xc/xg → #cross --xc/--g). Changes preview live; 확인/적용 save, 취소/Esc restore `UI.optBak`. 'help' opens the keyboard tab (read-only key table + rules).
- Zombie bomb (v5.4): red creature-head model `zbParts()` (gunart; tag 'mag' = throat gland; `zbombT` = thrown model without it). `zbombUpdate` states bSt 0→1 pull (BOMB_PULL .62) →2 armed while held →3 throw on release; right click = soft lob (a.bSoft, speed 5.5). VMX.zbomb (game.js) animates the left hand into the mouth and rips the gland out. Blast: humans as before + `zbombLaunch` (zombies within 4.5 m, vy 5.5–16, push along facing, no damage) (no early trigger: always the 1.3 s fuse; `zbombStepped` unused). Sim: lob at feet → 5.7 m jump.
- Hammer reworked to the CSO scheme (v5.5): right click toggles stance (a.hamB; VM.stB blends VM_POS.hammer ↔ hammerB). A = 떡찧기 overhead pound (dmg 180, hitT .7, range 2.8, low kb 9); B = 날리기 instant knock-away sweep (dmg 112, hitT .03, range 2.25, kb 62 + up 5.5, cleave 3, move speed ×.5). Index 0/1 of the stat arrays = A/B (passed as `heavy`). VMK.hmH = pound, VMK.hmB = sweep. Bots still use alt as B directly (no toggle).
- Relay v2 (v5.6): the 20 Hz stream moves to its own named room `qzs-<code>` (RSIG.openU; own 4 KiB presence, sent only when changed), reliable queue/acks stay in `qz-<code>` and are re-sent only when changed; stream blobs trimmed to ≤3.5 KB (fx windows 3 ticks → fewer, then S). Ping now measured on the state stream (client echoes host ts + hold time → L.srtt). Relay fallback reason in NET.relayWhy (client sends it as rq) shown in the waiting room. P2P wait 14 s. Mock test: scratchpad/mp/mockroom2.js (33 ms coalesce + 45 ms one way), t15/t16.
- P2P only (CFG.p2pOnly, checkbox in the MP menu): a client never falls back to the relay (one extra offer retry, then netFatal with the reason); a P2P-only host advertises p2p:1 in presence and ignores relay requests.
- Touch (src/touch.js, built last): TOUCH.want() = CFG.touch auto/on/off (auto = coarse pointer only). Floating stick (left 42%), drag-look (right, also while holding fire/alt), buttons fire×2/alt/jump/duck(toggle)/R/⇄(cycle)/Q/skill + top row buy/class/💡/NV/score/fullscreen/pause, ✕ for overlays. Main.lock is skipped while touch is on; playerCmd wrapped for analog movement. Options: 터치 조작, 터치 시점 감도 (CFG.tsens), 버튼 투명도 (CFG.tal → --tal). Phone landscape (max-height 520) compact lobby/room CSS; portrait shows a rotate prompt. play.py MOBILE=844x390 emulates a phone.
- Standalone (PeerJS) connect: extra STUN servers + PeerJS TURN over UDP and TCP; join waits 25 s, then reports NAT/timeout with advice to use the claude.ai link (which can relay).
- Mobile v2 (touch.js rewrite): fixed-rest floating stick (follows the thumb past the rim), arc of buttons around a big fire button (fire/alt/skill drags also aim), weapon slot bar bottom-centre with ammo (tap = equip, tap the held one = quick switch), top-right buy/class · light/NV · score · pause. Aim assist (TOUCH.assist: gentle yaw/pitch pull toward the nearest visible enemy in a cone, stronger while dragging) + auto-fire when the crosshair is on a body (melee/claws: in reach), semi-autos pulsed. Haptics on hit/hurt. Touch buy menu = category chips + card grid + 추천 구매 (TOUCH.quickBuy). Options: 자동 사격, 조준 보정, 왼쪽 사격 버튼, 진동, 버튼 크기 (CFG.tsz). First phone visit (CFG.mob=2): scale .6, ≤11 bots, no shadows.
