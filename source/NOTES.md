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
- Fix: zombie get-up timer (a.reviving) now counts down in gameUpdate; it used to tick only in updateVisual, which returns early for the local player (own body hidden), so a revived player zombie (multiplayer clients especially) could never move again.
- Mobile polish: no double-tap zoom (viewport + touch-action), safe-area padding, screens centre with margin:auto (justify-content:center cut off the top of tall windows on short phones), 40 px close buttons, big slider thumbs/checkboxes, touch controls guide in Options (조작법 tab; mouse tab hidden on touch), fullscreen button in the lobby + auto fullscreen when a match starts (Android), touch layer refreshes immediately on buy/class overlay open/close. Audit: scratchpad aud/audit.js taps every control on every screen at 667×320 / 740×360 / 915×412.
- Voodoo zombie doll attack: the scream class grips a pinned rag doll in both hands (models.js shared code adds vdLegs/vdBody/vdHead/vdArm/vdPin parts on bone 6 at the hand; a belt doll named `doll*` in the class block is removed) and clubs with it: third person KF.vdA/vdH, first person buildClaws doll on a wrist pivot + vdPose (VD_REST, VMK.vdA/vdH, 7th channel = wrist flick).
- 관짝 좀비 (src/coffin.js): ZCLASS.coffin (ZI 4), skill 'coffin' stands a tall six-sided coffin (GUNS.coffin) 1.15 m in front, turned to the nearest quarter. It is a dynamic world box (`worldAddDyn`/`worldRemoveDyn`, box.coffin back-reference): stops bullets, bodies and grenades. HP 550, life 25 s, 2 per zombie. Bullets/blades/HE damage it (clients send `cofh` claims); at 0 it bursts like a zombie bomb (`detonate` kind zbomb). Events cof/cofx/cofr.
- One-hit infection (v5.8): `clawApply` always infects — armour no longer absorbs claws and the last human turns too (zombies win the round). Rules text updated.
- Phones: `.scr>*{flex-shrink:0}` — a window taller than the screen used to be squeezed to the screen height and clipped (overflow:hidden flex item), so the create-room / waiting-room / options buttons were unreachable. Windows now keep their height and the screen scrolls; on short screens (max-height 560) the window header and button row are sticky, landscape uses two columns, map description hidden; touch sliders are 30 px tall. Audit v2 (scratchpad mob/audit2.js) only scrolls containers a finger can scroll (overflow auto/scroll) — the old audit's scrollIntoView also scrolled overflow:hidden boxes and missed this.

## v5.8 — 좀비 시나리오 (co-op PvE, src/scenario.js, built after main.js)
- Mode 'scen': no infection; 5 stages × (20 s prep → 3 waves) with 8 s breaks; stage 5 wave 3 brings the giant. Team lives 3: a wipe replays the stage ('retry'), 0 lives = game over. The fallen revive next to a teammate when the next wave starts. Results: cleared stage, kills, damage.
- The zombie pool: POOL 30 + 1 boss slot are real actors created with the match (`a.scen`, last one `a.boss`; MP roster entries `[id,'Z','guard','rager','',1]`), so the roster never changes. A spawn = `reviveZombie(a,[x,y,z])` of the longest-dead free slot at a spawn point out of sight (≥10 m, ≥30 m if seen); a kill leaves it permaDead; corpses hidden after 14 s. At most 30 alive, the rest wait in SCEN.queue.
- Waves (`SCEN.makeWave`): n = (4+1.5·stage+1.5·wave)·(.5+.25·humans)·diff; kinds join by stage (runner 1, bomber+voodoo 2, spitter+heavy 3, coffin 4). HP = class hp × .28 × (1+.1·(humans−1)) × diff × (1+.12·(stage−1)+.05·(wave−1)); claws only wound: dmg × .18 × diff × (1+.06·(stage−1)). SC_DIFF easy is gentle (hp .6, count .7, dmg .5). Horde speed ×.84–.9 (a.spdMul in maxSpeed).
- New classes (ZCLASS, not in ZLIST; ZALL = network index of every class): 자폭 좀비 bomber (bloated, glowing boils; arms 2.1 m from a human, swells .6 s, bursts r 4.5 — also a smaller burst when shot dead), 산성 좀비 spitter (glowing throat sac; holds 6–15 m, lobs acid every 2.8–4 s, 20 direct / 10 splash), 거대 좀비 boss (the heavy model recoloured, BOSS_S 2.2 visual scale, hull .45×2.3, hit width a.hitW .85; dash, ground slam, leap onto campers it cannot reach, summons 6 at ≤50 % HP every 20 s; HP bar on the HUD).
- Stuck guards: a zombie that has neither hurt anyone nor been hurt for 22 s (boss 30 s) re-enters at a fresh spawn point; zombies leap up (ballistic SCEN.leapTo) to a human 1.2–4.6 m above them that they have no path to.
- Ally bots regroup around the leader (the player, or the first human standing) and face outward (SCEN.spotNear via AI.pickCamp / AI.update hooks); bots spend spare money on upgrades.
- Rewards: after each stage a supply drop opens (3 of: full ammo + grenades, heal 100 + 50 armour, kevlar, random primary); closing it picks at random. Weapon upgrade: +10 % damage per level, max 5, $1000×level (host applies in damageActor via src.wup[o.w]; clients ask with `scu`).
- Network: host-authoritative. Snapshot `A`/`S` carry humans only; `Z` = [id,x,y,z,vx,vz,yaw,hp,maxHp,class|16 airborne] (near zombies every tick, far ones every 3rd); `sc` = [stage,wave,phase,t,lives,remain,bossId]. Events scst/scw/scwc/scrh/scr/scf/scend, scba/scb (bomber), sca (acid), scsl/scbo/scbh (boss), scp (push a remote player), scrw/scu/scuok (rewards). NET_VER r5. Mock relay test: 30 zombies + 3 humans → 1981 B presence (limit 4 KiB).
- UI: lobby mode option 좀비 시나리오 (ally bots 0/1/3/5/7 instead of bots/rounds/time; zombie class picker hidden), HUD line (stage/wave/left/lives) + boss bar under the timer, supply drop panel (1–3 keys, U = upgrade; taps on touch), spectate teammates when dead.
- Scenario tuning (after the first push): the giant walks on a heavy-sized hull (.4×2.05; the bigger one wedged in a doorway on Q-7) and leaps at campers it cannot reach; horde zombies do not regenerate health (2 %/s let the giant heal 240 HP a second); giant HP 8000·(.6+.4·humans)·diff, claws 70, dash 30, slam 10–40, 4 summons every 24 s. SC_DIFF hp [.6,.85,1.1,1.4], count [.7,.85,1,1.2], dmg [.5,.75,1,1.3]. Auto-run (AI player + 3 bots, easy, Q-7): all 5 stages cleared twice without losing a life; normal reaches stage 2–4. Boss reachability checked from spawn points on all four maps. Results/scoreboard drop the infections column; hearts are SVG (`.sclv`, the lobby already has a `.lv` badge style); on phones the big announcement and notes sit below the boss bar.
- Weapons (after v5.8): 흑룡포 bdc / 적룡포 rdc / 게이볼그 gaebolg reload one round at a time (shellRel .32 / .3 / .6, relStart .35). Heavy zombie hp 2700, armour 220. Every gun's spare ammo (W.res, not grenades) ×2 once at load (`W.resX2` guard, after ZLIST in game.js).

## Map 5 — 영동 휴게소 (src/maprest.js, built after mapmil)
- `MAPDEFS.rest`: a snowed-in highway rest stop at night. bounds [-41,-33,41,31]. Highway strip along z −32..−18 (sound wall behind, lane marks, broken median, snowed-in cars, jackknifed truck) with a footbridge (stairs from the lot to a 5.5 m deck); car park in the middle (bays, parked cars, a bus at x −7..5, plough piles, cones, lamp poles, pylon sign); main building x −20..10, z 13..24 (shop with shelves/fridges/counter, food court with tables and menu board, east and back doors, west outdoor stair to the roof); gas canopy x 20..34 at 4.6–5.2 m reached from the kiosk roof (kiosk x 34..38 with a stair along its side) and a short stair; spawns in front of the building, zombie spawns around the edges. Camps (bots/scenario): store, food court, roof, canopy, bridge, kiosk, bus.
- Snow: env.snow reuses the rain particle system (FX.rain.snow → slow drifting flakes, no splashes, uK 2.6 size); the rain heightmap now uses MAP.bounds. Nav: every stair rises ≤ .9 m per metre (steeper flights break the nav graph); all camps and zombie spawns flood-fill reachable.
- Textures are painted in canvas (rs* mats; the sign text is drawn with P.post).
- Melee swap-cancel: a melee swing lands with the weapon that swung it even if the player switches weapons during the wind-up (`meleePend` stores `{t,heavy,w}`; `meleePendTick` runs every frame in actorWeapons whatever is in hand; `equip` no longer clears it; `meleeStrike(a,heavy,w)`; the network ghost swing keeps its weapon too). A new swing while one is pending lands the old one first.

## Map 5 v2 — 영동 휴게소 expansion (v5.9)
- Bounds [-58,-33,58,50] (116 × 83 m, was 82 × 64). New: truck park east (five semi-trailers in rows, burn barrels, pallets) with a self car wash (two bays, brushes, roof reached by a railed stair on its east side); west woods with a 정자 pavilion (stepped giwa roof) and an observation deck (3.4 m, railed stair); a service road behind the building (delivery truck at the back door, dumpsters, gas-bottle cage), a restroom block (men's/women's, privacy screens, stalls, sinks + mirrors, urinals), a rest plaza (glass smoking booth, benches, drinks machines), a fenced playground (swings, slide, seesaw, snowman); out front two snack stalls (호두과자, 핫바·어묵) with striped awnings, drinks machines, benches, bins, coloured bulbs along the parapet; EV chargers by the gas station, a camper van and picnic tables in the east field; a direction gantry over the highway; more cars, smoke from burnt wrecks. All painted textures (rs* mats; text via P.post in Galmuri).
- Stair flights that zombies use (kiosk, kiosk → canopy, deck, car wash) have solid stepped side rails (`rail()`): without them nav offered side jumps onto the steps and climbers wobbled off the edge. The kiosk → canopy flight is 3.2 m wide and ends flush with the canopy edge.
- Engine fixes found on the big map: (1) WORLD's box grid was fixed at ±48 m — `worldIndex` now sizes it from the boxes (unchanged for maps inside ±48; the map cache stores the grid with the cells). (2) A* heap entries now carry their own key (`NAV.hf`): a node whose f dropped while queued broke the heap order, so long paths needed >100k pops (the far east spawns found no path at all). Default navPath budget = max(6000, 1.5 × nodes); zombie target search max(2500, .7 × nodes).
- Checks: every camp point and zombie spawn reachable (flood fill); zombie reach test 22/22 spawns reach humans on the roof, canopy, deck and car-wash roof; orig match 3.2 ms/frame, scenario 1.7 ms/frame; other maps' reach tests unchanged.
- Fullscreen (all devices): `FS` in ui.js — toggle (requestFullscreen / webkit, landscape lock on phones), label sync on fullscreenchange (plus two later passes: the resize it causes can rebuild screens), toast when the page refuses (iframe without allow=fullscreen → open in its own tab / F11). Buttons: lobby top bar (SVG icon, was touch-only), pause menu, Options → 비디오; Alt+Enter in game (listed under 조작법).
- Damage numbers: hits on the same target merge within .45 s, or .95 s for 1.5 s after the player swaps weapons (`a.swapT` set by a non-instant equip), so a knife/gun swap combo shows as one total.
- Fullscreen button is always shown; where the browser has no fullscreen API (iPhone Safari) it toasts how to add the page to the home screen; build.py adds apple-mobile-web-app-capable / mobile-web-app-capable metas so the installed icon opens fullscreen.
- Patch notes: lobby NOTICE panel has a small + (phones in landscape: 패치노트 button in the top bar) opening a scrolling window from the PATCH array in lobby.js (newest first, [version, date, [[NEW|UP|FIX, ko, en]]]) — add an entry for each release. Footer shows v5.9.

## v6.0 — Italy rebuilt from a 3D reference, Big Tree map
- Italy (mapit.js + generated mapit_data.js): geometry derived from "Cs_Italy with real light" by Neo_minigan (Sketchfab, CC BY 4.0 — credit kept in mapit_data.js and the patch notes; the scene recreates Valve's cs_italy, so only the layout is used: no meshes or textures are shipped, every surface is our painted Italy set). Offline pipeline (scratchpad it2/: vox.py → solid.py → floors.py → boxes.py → export.py): voxelise the model at 0.25 m, flood-fill the air reachable from the sky, everything else solid (and everything below a column's lowest surface); seal empty columns beside reachable floors (7 m walls); walkable floors found by voxel BFS from the biggest walk patch; per column solid runs, unreachable tops rounded up (wall heads .5 m, roofs 1.5 m tiers); boxes merged per distinct (y0,y1) run → 3151 boxes, 46 KB. Each box: 2-char base-36 x0 z0 w d y0 y1 + top/side material codes (top +16 = on steps/ramp → nav `stair` flag, walk links up to .9 m/m). Materials: reachable outdoor tops cobble, covered woodFl / cellarF, roofs roofIt, building sides facA/B/C by 10 m block, low walls stoneIt/retW, undersides ceilT. ITALY_META: 16 human spawns in the low south street (y -2), 16 zombie points ≥45 m away, camps on wide raised floors, 40 warm lights over covered floors. World offset: game = world + (6, -28.75, -33). Street levels: south -2, middle 0, north 3.75–6.5. Load ~5 s, orig match ~5.5 ms/frame headless.
- Engine: `{ground:1}` boxes only draw their top face — never set it on a box whose sides show (the Italy columns and Big Tree's terrace/pool walls were invisible with it).
- Big Tree (mapbt.js, built after maprest): see the map comment; stairs keep ≤ .8 m between 1 m nav samples, deck/keep/rampart stairs have solid stepped rails; keep roof hole runs to z -30.2 so climbers clear the roof slab. Known: a rager from the cloister to the keep roof and a brute from the pool to the rampart sometimes stall (the scenario idle-respawn recovers them).
- v6.0.1 (test build, the user will decide whether to keep it): Italy is drawn with the reference mesh itself (mapit_mesh.js: 14 parts, positions uint16 over each part's box, uv uint16, normals int8, uint16 indices, the part's 1k baked-light texture as a data URL — JPEG q78, leaves PNG 512; 3.7 MB). MAPDEFS.italy.mesh = itMesh, called by mapLoader right after buildMapMeshes; FS_BAKED = texture^.62 × uK (1.1) + dynamic lights, DoubleSide, glTF texture space (flipY false, repeat). The collision boxes are all 'nodraw'. Box y is now stored at 1/16 m ((y+5)×16) and reachable floor tops take the highest reference surface hit in the rect (hits25.py → floorH.npy), so feet sit on the visible floor. Standalone grows 1.8 → 5.6 MB. To go back to the painted look: drop 'mapit_mesh' from build.py (buildItaly then draws the boxes with the painted materials).
- v6.0.2: the reference-texture test build is reverted (mapit_mesh.js removed from the build; the itMesh/FS_BAKED path stays in mapit.js but only runs if ITALY_MESH exists). Instead the painted Italy takes the reference's paint colours: colors.py samples the reference textures onto the 0.25 m voxels, boxcol.py averages each box's side (upper 7 m, wall-facing samples) and top colour; export.py picks the material by hue/saturation (salmon facR, orange facO, tan facT, ochre facY, light grey facG, dark grey bare stone retW, dark saturated red bare brick brickIt, cream facA/facC; floors cobble / cobbleR / pavers / woodFl; grey roofs roofFl) and stores a side and a top tint (3 chars each, 0.7..1.3 per channel, the reference hue at half strength, brightness normalised). Engine: a box may carry o.tint (sides) and o.ttop (top); buildMapGeometry keeps a per-vertex tint and bakeGroups multiplies the baked light by it. Records are 20 chars; mapit_data.js 66 KB. Italy lamps capped at 20 (range 6) — load ~6.5 s headless.

## v6.1
- Weapon drop / pick-up (src/drops.js, built after coffin): G (cmd.drop, KeyG; phones: hold the weapon in hand on the slot bar 550 ms, a short tap is still the quick switch) throws the gun in hand (slots 1–2 only) 4 m forward; a human who dies or turns zombie (becomeZombie / hurtHuman death → dropDeath) drops his primary. Guns are world props (gunGeo + matGun, probe-lit), fall and settle (charFits/floorBelow), last 90 s (blink the last 5), max 30, cleared each round. Pick-up is automatic: a human with that slot empty within 1.1 m (not the thrower for 1.2 s) takes it with its magazine and reserve; a melee-in-hand auto-equips it. Host-authoritative: client → host 'wdrop' {w}; host → all 'wd' {d,w,x,y,z,vx,vy,vz,yw,by} (r2 hundredths) and 'wp' {d,i,w,mg,rs}. Mock-relay test: client drops, host sees it land and picks it up, client sees it vanish.
- Graphics presets (Options › Video): high = scale = device pixel ratio (1–2, half steps) + shadows + bloom, balanced = auto, low = 50 % without shadows/bloom; scale 150 % / 200 % added. Above 100 % R.resize sets renderer pixel ratio = min(scale, devicePixelRatio) so the canvas has native pixels.
- Italy load 7.5 → 4.4 s headless: bakeItTex paints only the textures the rebuilt town uses; wall/roof/kerb materials light in 1–2 m cells (MATS cs) — 846k → 329k vertices.
- Big zombies squeeze: a heavy/giant bot wedged for 0.45 s crouches and takes a 0.3 m hull for 1.6 s (game.js widens it again once it fits). Italy reach 15/16.
- Big Tree keep: stepped solid rail on the stair's open side (steps 2–10) and a rail round the roof stairwell (exit at the north end).
- v6.1.1: room code fixed to NET_FIXED_CODE '1234' (net.js NET.create). PeerJS: host id qzg-1234; if it is taken ('unavailable-id') the creator joins that room instead. The join box is pre-filled with 1234. Only one 1234 room can exist on the public PeerJS server at a time.

## v6.1.2 — design.js (the owner's design / sound file), Dual Beretta colours
- src/design.js (built right after i18n) holds, with Korean comments on every entry:
  1) SOUND_MIX {music, ambience} and SOUND_DESIGN {name:{vol, rate, file}} for all 121 SFX (audio.js + nyw.js). AU.play multiplies vol/rate;
     spin/saw loops too; AU.prepare loads `file` (URL or data: URI) via AU.loadFile instead of synthesising, falling back to the synth on error.
     New SFX must get a SOUND_DESIGN line (a check: every SFX key has one, no extras).
  2) ARM_DESIGN — first-person sleeve / zombie-arm atlas colours (gunart.js paints sl_* and zs_* from it).
  3) SKIN_C, defHuman, defZombie (moved out of models.js), with a field reference (o / mats / decor ops / extra / bone numbers).
     The coffin and voodoo (scream) bodies there are the owner's own designs — keep them.
- sync_cs.py now stamps a hash of every pushed file (scratchpad sync_stamp.json); a repo file edited on GitHub is pulled into game2 first, both-sides edits stop the sync.
- Dual Berettas: GUNS.tw9 (right hand, deep red 'dred' with black clouding) has alt:'tw9b' (left hand, deep yellow 'dyel'); buildVM and ensureGun use the alt for the second gun.
  The VM shader lights roughly ×3, so these atlas colours are kept dark.
- v6.1.3: recorded sounds live in source/sound (the owner drops files there) — build.py copies sound/ next to both builds, and the repo root keeps a copy in sound/ for Vercel (copy it on every deploy).
  SOUND_DESIGN.file may be a list (first that decodes wins: ogg first, an mp3 copy for iPhones). AU.fromFile[name] marks file-backed sounds; AU.stopAll(name).
  countdown (sound/round_start.mp3, 12.4 s, trimmed to len:9 by trimBuf with a 60 ms fade) plays once at the 10-second mark of the infection modes' prep and replaces the beeps there (scenario keeps beeps);
  stopped on startRound / back to menu / leaving the room. zpain (sound/Zombi_hurt_01.ogg) now plays on every hit, throttled to 0.35 s per zombie.
- v6.1.4: Dual Berettas poses in vm.js (DUAL_POSE): kX = X-cross flourish while VM.drawT runs (peaks 30–62 % of the draw), kB = stance B blended by a.dualB
  (game.js: aim key toggles a.dualB for W.dual, reset on equip; first person only, not networked). Stance B fires full-auto while held (game.js fire gate, touch.js autoF); HUD name shows · 연사.

## v6.2 — spore bombs for every zombie, roaming human bots, terrain-aware zombie chase
- Spore bombs: becomeZombie gives 1 (0 in the scenario), reviveZombie tops up to 1 (orig respawns and mut revivals). Zombie bots throw at groups, dy>1.5, unreachable targets (B.partial), when hurt, or 40 % on a clear 5–15 m view (bombT 6–12 s).
- Human bots: B.roam (75 %) — roamers hold rr(5,15) s (prep 1.5–4 s) then pickRoam (random open node 5–28 m away, scored away from zombies) or 30 % pickCamp;
  with a zombie in view >6.5 m they plant (stop and shoot), walk on after 2.5 s without one. Off-camp spots sweep the view (B.scanY). Not in the scenario.
- Zombie chase: straight run only when navStraight says the line is walkable (|dy|<.6, <14 m, LOS) — else the path. navPath(...,partial) returns the way to the
  reachable node nearest the target (array .partial); unreachable targets → prowl() under them (step in if walkable, running jump if dy<jumpCap+.3, side pacing
  that never walks off a ledge). Old blind "run at the target when there is no path" only when off the grid (B.offGrid). Target choice tries 3 nearest, 6 when
  none of them is reachable; nobody reachable → nearest with a partial path, rechecked every 2.2–3.4 s. scenario climb-leap also fires on partial paths.
- Tests (scratchpad zai/): obstacle chase (LOS but no walkable line) fails 4→1 of ~74, wall-push time q7 4.2→1.6 %, italy 23→3.5 %, bigtree 4.1→1.1 %;
  unreachable targets wall-push 14–16 %→1–3 %; human bots cover ~2× the ground; zombie AI cost per call went down.
