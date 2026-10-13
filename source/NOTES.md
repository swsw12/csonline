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
- Host migration (v6.38, PeerJS only; the claude room keeps "host leaves = room ends"): see the v6.38 section.

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

## v6.2.1 — zombie stacking, random zombie respawn, fixed joystick, landscape-lock button
- headStand(a) (game.js, after moveChar): a falling/standing actor whose feet are within .45 below a same-team actor's head top (footprint overlap
  .8×(hw sum)) is snapped onto it (onGround, a.onHead). Teammates can stand on heads.
- navNode(): a match in the first ring with score ≥1.2 (a node far below — the street under a balcony) no longer ends the search; a node a ring or two
  over at the right height wins. Fixes zombies crowding under a balcony because the target mapped to the ground node beneath.
- AI.stackSpot(a,t,cap): reachable ground node within 4.2 m of the target, open to the sky up to target.y+1.9, with the target's floor 1 m toward them;
  cached 3 s. Used as the path goal when the target is out of reach / partial / on a perch (no node at their height) and > cap+.3 above.
  AI.stack(): walk to the spot; a teammate whose head top is .3..cap-.1 above my feet near the spot = step → run at it and jump; none → be the step
  (crouch, hold still). From a head prowl's jump rule fires with dh<4.5. window.__noStack disables both (A/B tests).
  Test (scratchpad stack/st.js, 6 ragers, ledges 1.9–3.2 m out of nav reach, 30 s): reached 21/24 (was 1/16 without stacking).
- zRandomSpawn(): a dead zombie revives on a random open nav node (≥15 edge entries) ≥12 m (then 8 m) from every human, else zSpawnPoint().
  Mutation too (reviveZombie(a,at,rise): rise keeps the 60 % hp rise-up); net 'rv' carries rs.
- touch.js: fixed stick (no follow); a press within 2.2 R of its centre steers, farther away on the left = look. Moved right (left: bs*.4+9vw).
- ROT (ui.js): fullscreen then screen.orientation.lock('landscape'); no API (iPhone) → 6 s toast explaining rotation lock / home-screen app.
  Buttons: rotate-your-phone overlay (.trotb), lobby top bar and pause menu (.rotbtn, hidden unless html.touch).

## v6.3 — Air Burster, blackout, infection effects, round result card
- WPN.airb (weapons.js, special, $3300, 100/200, 600 rpm, quiet): air:{r:8,a:.42,kb:7.5,up:2.2,cap:12}. airBlast(): white ring + mist particles,
  cone hit with LOS, dmg 8×f, kb ×(.6+.4f), hop every 4th shot on grounded targets. damageActor caps horizontal knock at air.cap for air weapons.
  Model GUNS.airb (gunart.js): air tank tagged 'mag' (swapped on reload), bell nozzle, gauge, hose. VM pose in vm.js. Sound 'airb' (audio.js), design.js entry.
  Test (static zombie 4 m): pushed to ~10 m in 1 s; a chasing rager is held at ~7–8 m (range edge).
- BO (game.js): host rolls once per round (45 %, 25 s..roundTime-45 s into the fight), 18–26 s; flicker 1.3 s → uAmb .2, uLamp 0 (new LU uniform
  multiplying FS_WORLD uEmis), DL.lamp 0 (map lights flagged map:1). Fires/flares/muzzle/flashlights unaffected; VM uAmbV ≥ .3. Net event 'bo'.
  Stopped silently at round end; reset each round. Sounds 'blackout', 'powerup'. Human bots force flashlight on.
- Infection: FS_POST uInfect now does chromatic split + red desaturation + vein pattern from the edges pulsing; decay .36/s. infectFx(t,big):
  blood mist, green spores, red ring, red DL, delayed 'zroar'. Player also hears two heartbeats.
- HUD.roundResult(win) (ui.js, element #hRRes — note #hRes is the ammo reserve): per-round deltas from a.r0 snapshot taken in startRound,
  human MVP (dmg + 400·kills), zombie MVP (infects), top-8 table with fate, round bonus (a.rBonus). Hides the big banner; hidden when st≠'end'.

## v6.4 — supply crates, Event Horizon (crate-only), Ripper pin
- supply.js (build order after drops): SUP — host drops a crate 20-32 s into the fight then every 35-50 s (≤2 on the map) at an open-sky nav node
  8-26 m from a random human; it falls 20 m at 4.2 m/s under a parachute (models 'supbox','supchute'), lands with dust, red smoke, a blinking light,
  a screen marker (.supMk) and a minimap square. A human within 1.1 m opens it (host decides): 45 % 'bhole', 30 % a heavy weapon, else kit
  (full ammo, armour 100, he/frost/flare, +$1000). Net: 'sb' spawn, 'so' open (the opener applies the reward to his own inventory). Reset each round.
- WPN.bhole 'Event Horizon' (sup:1, not in BUY_MENU, 3/3): proj 'vortex' (vortexMake/vortexLaunch/vortexUpd; replayed as a ghost on other pages
  through the 'p' fx). Orb 24 m/s → hole on contact or after 1.1 s, lifted to floor+1.9; 3.2 s: pull (host only) up to 38 m/s² within 9 m with LOS,
  kv capped 9, lift within 4.5 m, 60 dmg / .25 s within 2.6 m; then blastDamage 6.5 m / 950 / kb 18. Sounds 'bhole','vortex','supply'.
  Test: a ring of 6 zombies (4 m) gathered to 0.5 m mean spread, ~1500 dmg each.
- Weapon atlas grown to 8×10 slots (GA.H 1280): the NY materials past slot 63 were off the atlas; new 'voidC','voidG','supW','chute' (paintSupAtlas).
- Ripper pin: damageActor gives saw hits t.holdT (.32 s, swing .7 s; not a hardened Heavy) → maxSpeed ×.12 (hosts ×.3), no jump, non-host zombies
  can't claw/skill (actorWeapons). holdT is in EFF_T ('hd') so client-owned zombies get it. Grind stag .9, staggerT .6, range 2.2.
  Test: a rager run into the saw was pinned 93 % of 3 s, 0 claw attempts.

## v6.5 — gun identity: first-draw ready actions, chamber +1, real magazines
- design.js 4부 GUN_DESIGN: per gun real model (comment), mag/res overrides, ch (closed bolt → +1 in the chamber), act (first-draw action) and its
  parameters (x extra seconds, d pull distance, roll, side, heavy, ob open bolt, rps/axis/snd for spin, open/lift for break). applyGunDesign()
  runs at the end of supply.js (after every WPN file) and sets W.mag/W.res/W.ch/W.fd.
- Fresh guns: gunFresh(a,id) on buy(), giveDefault (USP), dropGive (pick-ups), SUP.give (crates). equip(): a fresh gun's draw is
  W.draw + fd.x (no quick-draw) and VM.firstDraw(raise, extra, fd); the flag clears on that draw.
- vmdraw.js (build order after vm): FD[type](V,q,m,G,W,P,K,dt) for slide, revolver, charge, hk, ar, pump, bolt, break, belt, spin, saw, xbow,
  harpoon, tank, orb, dragon, cock, barrel — a whole-gun pose, tag motion, the free hand (armL) lerped to the part (G._tc tag centres) and riding
  along, and cues (fdCues: sound, rate, spring kick, 'flame' muzzle glow). VM.actFrame runs last in VM.update (after VMX) so it can add to the
  tags VMX sets. Pistols/revolver turn muzzle-left (ry ≈ .85) so the slide/cylinder is seen side-on.
- Model tags: vmGun animates 'chg','aux','cover' as well and supports G.piv[tag] pivots. New/tagged parts: charging handles on MP5, MAC-10 (new
  knob), UMP, P90, M4 (+forward assist 'aux'), SG552, AK, Galil, SCAR, FAMAS, USAS-12 (+20-round drum mag), XM1014 (new), G3 (new), M249/MG3
  (top cover 'cover' + handle), crossbows (nock slide), Ripper (starter grip), Sterling (new, right side); r6 cylinder pivot + hammer 'aux';
  db2 top lever; duckfoot hammer; mlaunch barrels as 'spin'; airb tank and bhole orb pivots.
- Chamber: reload start stores a.relCh=(mag>0); completion fills to W.mag+(W.ch&&relCh ? (dual?2:1) : 0).
- Mag changes: M134 200→500 (res 500). Everything else already matched the real gun (see the table).
- Sounds: chg, hkslap, cylspin, sawpull, spinup, xbowcock, hiss (audio.js), entries in design.js.
- Tests: logic (AK first draw 1.4 s with action, second draw quick; reload 10→31, empty→30; MAC-10 30; dual 32); contact sheets of all 40
  first-draw actions (scratchpad fd/); bot matches on 4 maps without errors.

## v6.5.1 — first-draw motions rebuilt (vmdraw.js v2)
- Clips instead of formulas: FDS[act](P,G,m,L) returns {G gun pose track, H/R hand tracks, parts, spins, E timed events, C camera, vib,
  D/DP dual}. L = clip seconds; the clip runs from raise*.62 (overlapping the raise) to raise+fd.x (gun ready). Tracks are monotone cubic
  (fdSlopes/fdHerm, PCHIP: flat ends, no overshoot between keys); part keys can carry a mode (1 = accelerate into a dead stop, 2 = snap away).
- Parts: keyed while held, released at `rel` to fly home under constant acceleration A with restitution e (4 substeps); the first impact
  fires `home` [sound, vol, rate, gun impulse [py,rx,rz,pz], camera impulse] — sounds are synced to impacts, so new SFX start at t=0
  (fdslam, fdhome, pumpf; pumpb knocks at .055 s; fdgrab).
- Spins: kick + friction or a motor track, `stop`+`snap` index onto a chamber; the gun twists against the (smoothed) acceleration and buzzes,
  both fading over the last 14 %.
- Hands: anchors {sup}/{grip}/{p}/{tag,at,ride} (riding applies the tag's current transform); key HK(u, anchor, offset, w, back, curl).
  fdArm: the wrist sits .045 behind the palm point toward an elbow anchor in camera space (FD_ELB, a clip may set H.elb/R.elb), lookAt with
  the back of the hand as up. The back vectors become rolls about the forearm, unwrapped key to key once (S._a0) and eased — no flips when the
  palm turns over (route through a sideways key to choose the wrist's direction). Blend from the rest quaternion q0 by w with a sign-continuous
  target and a raw slerp (THREE's shortest-path slerp jumped when the hand passed half a turn from rest). VM.actArms runs after the root
  transform is written (vm.js); vm.js resets arm position/quaternion/finger curl and tag scale every frame.
- Jointed gun hands (gunart.js armMesh): palm + one knuckle-row group (prox) + middle-joint group (dist) + two-part thumb; vmHandCurl(g,c)
  (0 open .. 1 fist; rest .95 right / .82 left). Left arm built with o.left (thumb on +x).
- Models: pistols (p9, f7, d50, tw9/tw9b) have a fixed barrel under the slide's nose (crown moved out of the slide tag) so racking shows it;
  sr8/r700 bolt pivot on the bore (piv.bolt) — the after-shot bolt cycle was turning about the grip.
- Ripper: VMX.ripper keeps the engine loop silent until the clip's 'eng' event (second pull catches).
- Tests: scratch fd3/ — var.js variant/contact sheets (bright neutral background, crop), pops.js (every clip at 120 Hz: no NaN, no frame
  jumps, max wrist roll ~20°/step), smoke runs (buy, first draw, fire, reload, switch) for 14 guns without errors, logic test unchanged.

## v6.6 — reloads v2 (vmrel.js), knife swings v2 (vmknife.js), shooting range (range.js)
- Reloads are clips on the vmdraw engine. VM.reload(W,dur,kind,empty) builds rlBuild (mag) or rlShellSpec('start'); VM.shellIn(last,next)
  plays one shell ('shell' / 'last', the last one merged with FDS.pump/charge when loaded from empty); VM.stopReload fades (fadeClip .12).
  Kinds (rlKind): dual, rev (crane + speed loader prop), brk (two shells), belt (rlMag box swap merged with FDS.belt), rail (crossbows),
  top (P90, air tank), side (Sterling), gen (no mag part: Ripper can, orb shrink), mag. From empty: pistols 'release' (slide held back
  through the change, released at .78), M4 'catch' (palm on the bolt catch), charge/hk/bolt = mag change [0,.6] + first-draw rack [.6,1].
- Poses: rlPose (pistol / mg / rifle) + RL_POSE per model for the big guns (mdrill, volc, gx6); shells: raised and canted -.55 so the port
  and the hand are on screen; fast feeders (shellRel < .4) keep the pouch close. window.__RLT {pose, spose} overrides for the sheets.
- Engine changes (vmdraw.js): fdRemap / fdMerge compose clips; props held in a hand (FD_PROPS shell/shell2/loader/bolt/can);
  playClip(S,st,d,tag) + fadeClip + A.hold (hit-stop); a clip's last frame is now posed (act cleared in actArms via A.end — it used to end
  before the hands were placed, one frame at rest); S.hold keeps a clip that ends away from rest (one shell of several) on its last frame
  until the next takes over (fades after it); fdTrack rows may carry a mode in an extra last element (1 = driven into the key, dead stop);
  H.elbT = elbow track [[u,x,y,z]] (fdElb). Hand roll: the reference axis is carried from frame to frame (arm.userData.fdr, reset in
  playClip) instead of world-up projection (flipped when the forearm passed vertical); key rolls are followed frame to frame and freeze while
  the key's back-of-hand direction lies along the forearm; roll slopes are kept from the first frame (S._rm).
- rlMag: a still key at the pouch (pk+.035) so the hand curve doesn't feel the old magazine being swapped out of sight; the fresh one comes
  up to an approach point (a*.15 along the well) by ap = max(up0+.06, en-.13) and goes in; a magazine carried by its body is let go and
  its base slapped later (slap .705 instead of .665).
- Knife v2 (vmknife.js): VM.knSwing(heavy) from VM.melee for the knife; R hand on a fixed palm point of the grip (knGrip from the arm's rest
  wrist + q0) with w=1 and an elbow track; light A forehand / B backhand alternate (VM.knSide), heavy stab (impact key mode 1); S.trail
  window; d = min(.4, rate-.06) so a hit-stop never runs into the next swing. VM.meleeHit(heavy, 1 body / 2 wall) from meleeStrike:
  A.hold .055 / .085 / .035 + camera and pz kick. Axe and hammer keep the v1 keyframes.
- Shooting range (range.js, built after scenario): MAPDEFS.range (practice:1 → left out of MAPLIST), buildRange (6 stalls, 60 m, boards at
  10–50 m, daylight), RG_DUMMIES (6 static + 2 walkers), RANGE {begin, update, hit, shot, kill, reset, toggleMove, draw}. Hooks: startRound
  (range instead of a round), fireGun (shots / hit shots), damageActor (record + money stays 999999), killZombie (no respawn timer: up again
  in 2 s at its mark), HUD.update (top bar: range time), Main.toTitle (panel off), keys K / J. gameUpdate runs RANGE.update instead of the
  round flow (no rounds, infection, blackout, supply). Lobby: the 4th card (act 'range') → Main.startRange(). Panel #hRange (style.css).
- Tests (scratch fd3/, rng/): reload sheets for all 40 guns (rel.js / mkr.py, pose variants via __RLT), rpops.js (every reload at 120 Hz:
  only the intended slaps remain), ammo logic (AK 10→31, empty→30, MAC-10 30, dual 32, M134 500, USAS 20, M3 shells, cut by firing → fade),
  knife sheets (kn.js) and step scan, first-draw pops unchanged, range: start, shots, kill / TTK / respawn / heal / walkers / reset, and a
  normal match → range → title → normal match round trip without console errors.

## v6.7 — accounts (Supabase), coins, gun shop (account.js, shop.js, supabase/)
- Backend: supabase/schema.sql (run once in the SQL editor; idempotent) — profiles (nickname, coins, earned_total, matches, last_claim,
  day, day_earned), gun_prices (price, free, sold), owned_guns, coin_log; RLS = read own rows (prices public), no direct writes; trigger on
  auth.users makes the profile (+3000 welcome). RPCs (security definer, search_path ''): qz_me, qz_set_nickname(p_nick), qz_buy(p_gun),
  qz_claim(p_mode,p_rounds,p_kills,p_infects,p_damage,p_won,p_mvp,p_stage,p_cleared). Reward = 80 + 12/round + 6/kill + 10/infect +
  4/1000 dmg + win 100 + mvp 60 (scen: 80 + 40/stage + 150 cleared + 4/kill); caps 900/match, 80/min since the last claim, 8000/KST day,
  +200 first of the day, too_soon under 1.5 min. Errors are plain exception messages (not_enough_coins, already_owned, not_for_sale,
  too_soon, not_signed_in). Validated on a local Postgres 16 with an auth stub (scratch shop/: stub.sql, t1.sql). Setup guide: supabase/README.md.
- Client account.js: SB {url,key,oauth} (empty = accounts off: ACC.on false, every gun open, shop shows prices only); fetch-based GoTrue
  (password / signup with data.nickname / refresh / recover / PUT user / logout / authorize redirect for OAuth, implicit #access_token
  parsed on load incl. type=recovery) + PostgREST rpc. Session in localStorage qz_ses, last profile cached in qz_me. ACC.owns(id): free
  or owned (nades / no price row always). window.QZ_SB overrides SB (tests).
- shop.js: SHOP_FREE / SHOP_PRICE / SHOP_NOTSOLD (same list as schema.sql, generated from scratch shop/prices.py); SHOP window (#shopWin:
  category tabs from BUY_MENU + knife / bhole, cards, detail with UI.statBars / UI.wTags, confirm, server errors), ACCW (#accWin: in / up /
  reset / newpw / sent / me), lobby chip + shop button (UI.buildTitle wrap), buy-menu locks (UI.renderBuy wrap: .bi.lk, data-act buylk;
  Main.buyItem wrap) — allowed anyway: gun in hand, NY free pick, the range; results reward (UI.showResults wrap, G.coinDone once per match,
  G.coinBox re-shown); startMatch wrap resets; myName() = nickname when signed in; first visit opens the sign-in window once the lobby is up.
- Tests (scratch shop/): mock.js (a fetch stand-in for auth + qz_* with the same rules) via play.py INIT — sign-up validation, sign-up,
  buy / not enough / already owned, buy-menu locks + blocked buy + NY free pick, results +622 (first of the day), no double pay, reload
  keeps the session, sign-out → guest; accounts off: no locks, no reward box; phone 844×390 layouts.

## v6.8 — 근하신년 복주머니 (gacha): pouch-only NY guns, fragments, exchange
- User asked: NY guns not buyable, only from a gacha item; plan shown first and approved ("ㄱㄱ").
- Pool: S rdc mdrill mlaunch volc bdc gaebolg; A xdz ripper xbowa xbow sterling duckfoot (SHOP_GACHA in shop.js = gun_prices.tier in
  schema.sql, both generated from scratch shop/prices.py). price 0, sold false, tier S/A; qz_buy raises gacha_only for tier guns.
- Server (schema.sql, re-run on top of v6.7 keeps owned guns): profiles + fragments, pity, free_day; gacha_config (one row: cost1 500,
  cost10 4500, rate_s .02, rate_a .08, rate_coin .30 — rest fragments, pity 60, coin_table [[100,30],[200,30],[300,20],[500,15],[1000,5]],
  frag 2-5, full_s_coins 3000, full_a_frags 30, ex_s 200, ex_a 80, daily_free) — public read; gacha_log (one row per result, src pull/free/
  exchange, pity_hit). qz_pull(p_count 1|10, p_free): server random(), pity counter (S forced when it reaches 60, reset on any S), owned
  guns skipped (grade fully owned → S pays 3000 coins, A 30 fragments), 10th of ten forced A if no S/A yet, free pull once per KST day.
  qz_exchange(p_gun). qz_me also returns fragments, pity, free_today. Validated on local Postgres (400 ten-pulls: S ≈ 2.6 % with pity,
  max gap 60, every ten has S/A, all 12 owned after 28 tens then substitutes; v6.7 → v6.8 upgrade keeps owned NY guns).
- Client: ACC.pull / exchange / history / gc() (gacha_config merged over GACHA_DEF), ACC.price falls back for tier guns; SHOP pages
  'shop' | 'gacha' | 'ex' (tabs; red dot when the free pull is up); pouchSvg (drawn red silk pouch, gold cord, 복 emblem); GFX (#gFx):
  shake ≥ 750 ms → burst + flash in the best grade's colour → cards slide in and flip (ten: 170 ms apart; the flip waits for the slide-in —
  overlapping them left a card unpainted in phone emulation) → OK / again / skip (skip kills the slide-in animations); S glow sits on .gfront
  (not the card) so the card's own animation can be cleared. gPopRates (each gun's real share, owned → '—'), gPopHist (last 50).
  Buy menu: tier gun not owned → lock + 'pouch' label, buylk note says pouch. First-visit sign-in prompt skips when a session exists or
  the shop is open.
- gunIcon now widens yawed parts (p.ry) in the side silhouette: duckfoot barrels were missing; the xbow icons change slightly.
- Tests (scratch shop/): gt1 (free pull, forced ten, exchange, NY buy refused), gt2 (buy-menu NY locks, owned volc buyable), gt3/gt5 phone
  844×390 (pouch page, ten grid 5×2, single card), gt6 accounts off (pouch page says the server isn't connected), gt7/gt8 desktop ten +
  again + skip. Headless screenshots lag the DOM by ~1-2 s under swiftshader — check DOM state, not only pixels.
- v6.8.1 fix (user ran schema.sql in the Supabase SQL Editor → "unterminated dollar-quoted string", the editor appended
  "-- Added by Supabase: enable Row Level Security on newly created tables / ALTER TABLE p ENABLE ROW LEVEL SECURITY"): the editor's
  auto-RLS helper reads `select … into var` inside plpgsql bodies as a table creation and breaks the $$ body. schema.sql now has no
  select-into / returning-into anywhere: reads are `var := (select …)`, row locks are `perform 1 from … for update` + `if not found`,
  updates re-read the row. Keep it that way (no `select` + `into` in one statement, no `$$` in comments). Re-tested on local PG 16
  (fresh, twice in a row, v6.7 → new upgrade, t1 / g1 suites). A failed editor run is one parse error → nothing was created.
- account.js: the key only goes on `apikey`; `Authorization: Bearer` only carries a user access token (new sb_publishable_ keys are
  not JWTs). Keys: project Connect button or Project Settings → API Keys (publishable sb_publishable_…, legacy anon eyJ… also works).

## v6.9 — level / record on the account
- profiles + xp, rec_games, rec_kills, rec_infects, rec_best, rec_imported; qz_rec(profiles) → {g,k,inf,best,xp,imported}; qz_me returns rec.
- qz_claim gained p_score (default 0; the old 9-arg signature is dropped first): xp = clamp(20..3000, score*.6 + kills*8 + infects*12)
  with score ≤ 30000, kills ≤ 80, infects ≤ 30; returns xp_got + rec. qz_import_rec(games,kills,infects,best,xp): once per account,
  clamped (games ≤ 5000, per game 80 kills / 30 infects / 3000 xp, xp ≤ 300000).
- Client: recGet() = ACC.me.rec when a session exists (cached too), else LS 'rec'; recMatch skips the local record when signed in.
  ACC.importRec after loadMe: localStorage qz_rec → first account on this browser (qz_recFor = uid; reset on failure unless
  already_imported). Results box shows "+N XP". Tests: scratch shop/rc1 (import, match +956 xp, local untouched, sign-out → guest
  record, second account not imported); local PG r1.sql (claims, too_soon, caps, import once, anon denied, 6.8.1 upgrade).

## v6.10 — 근하신년 decoder bingo replaces the lucky pouch
- User chose numbers 0-49 and 600 coins (10 for 5,400); kept defaults: 1-3 fragments per decoder, shuffle 3/day free, reset free,
  1 free decoder a day. Sim (20k cards): first line ≈ 29 decoders, 6 lines ≈ 43, all 12 ≈ 49 (max 50).
- Server: gacha_config + dec_cost1/dec_cost10/bingo_hi/dec_frag_min/dec_frag_max/shuffle_free (old pouch columns unused);
  profiles + shuffle_day/shuffles; bingo_boards(user_id, nums[25], marked[25], drawn[], rewards[12], done[12], boards) read-own RLS.
  qz_bingo_new(uid) (internal), qz_bingo_json(uid) (internal), qz_bingo(), qz_decode(p_count 1|10, p_free), qz_bingo_reset(),
  qz_bingo_shuffle(); qz_pull dropped. Lines: rows 0-4, cols 5-9, diag TL 10, diag TR 11. A full card → new card mid-batch
  (draw.card counts cards in the batch). Tested on local PG (30 cards: 12 lines each, all 12 guns once, then substitutes).
- Client: ACC.loadBingo/decode/bingoReset/bingoShuffle, ACC.bingo. SHOP.bingoPage (decoderSvg, read-out #bNum, buttons, stats,
  reset confirm, shuffle, rules/history), boardHtml = 7×6 grid: row rewards left, column rewards bottom, TR diagonal bottom-left,
  TL diagonal bottom-right. decode → anim {view, draws}: roll 560 ms (ten 300), stamp, gold line flash, then GFX.show(lines) cards
  (BINGO!, NEW, line label) with again. Skip button. Hover a reward → .hl on its cells. Mock: __MOCK_SEQ / __MOCK_CARD.
  Test: scratch shop/bt1.json (free + forced ten finishing row 1 + col 1, shuffle, NY buy refused), bt2 phone.

## v6.11 — playtest fixes, free weapons + loadouts, human skills, Skull-9, season decoder, bot tactics
Built from parallel agent branches merged into v611 (base 59769a1 = my core fixes), then squashed onto main.
- Core (game.js/weapons.js/nyw.js/models.js): actorEye() returns a fresh vector (the shared one let fireGun's pellets 2..n start
  at the player's head → "wallbangs" + bot gunshots at the player's ear). The local player's a.head/headR are set in updateVisual
  even though its body isn't drawn (claws reach the player again; bot bullets hit a player zombie → knockback/stagger work).
  Zombie arm hit volumes: charArms(ch,out) (models.js) → a.arms/armR/armT, rayArms() in rayActors / rayActorsX / projHitsActor.
  CLAW_R=[1.75,2.0], AI swing at 1.35+hw, ZSPD .95, stagger = stag + min(.1, dealt/500). infect() only in 'fight'; AI.zombie idles
  outside 'fight' (except scen); endRound clears pendingClaw. Original: every zombie death is permanent, all dead → human win.
  Fixes: becomeZombie resets swallowed by a comment, scenario reviveZombie wrapper dropped `rise`, gun_prices select lacked tier.
- Bots (ai.js, agent B): camp occupancy fixed + caps, roaming on own bearings, relocation 20-55 s, kiting from 9 m, scatter after an
  infection nearby, aim settle error by distance, LOS before firing; zombie pack AI.zPack (stage out of sight 13-20 m, rush on quorum
  / triggers, flank via navPath penalties, retreat to heal); ZBAL: hosts clamp(round(N/5),2,4), host hp +300/human/host, gunfire
  knockback caps, Mutation comeback rule, regen 4 %/s after 4 s, morale ≤ +50 % and −1 level per infection. ZPACK/HBOT tables.
- Buying (loadout.js, agent C): buy()/buyCheck() moved here, free, BUY_MENU whitelist (host checks client buys too), grenades and armor
  once per round (a.kit), ldSnap/ldRestore carry-over (snap before dropDeath in becomeZombie/hurtHuman, at round end), 3 sets
  (CFG.sets, Shift+1-3 in the buy menu, touch buttons), Event Horizon for owners (ehOK: ACC.on && owned, once per round, 3/0),
  scenario keeps money (scEarn, start 1000). Blackout 20 %, 12-18 s, MAP.env.boAmb floors, lamps .18, auto flashlight, CFG.blackout.
- Human skills (hskill.js, agent D): 5 Sprint ×1.45 10 s → ×.4 5 s, 6 Deadshot 5 s all hits = head; once per round; HUD, touch,
  bots (wraps AI.human), net 'hsk' + claim flag bit 256 honoured inside the window; NET_VER suffix -hsk1.
- Skull-9 (skull9.js, agent E): dmg [230,520], cleave [3,2], arcs, kb/up/stag, slam FX; atlas mats 72-75; price 9000.
- Season decoder (agent F): season_boards + qz_season*, 0..99, 1000/9000 coins, lines EH ×1 / coins / frags / 3 NY decoders;
  dec_tickets + qz_decode(p_count,p_free,p_ticket). README §8. schema.sql must be re-run.
- Test assets: source/test/mock.js (fake Supabase), supabase/tools/gen_schema.py + prices.py (python3 supabase/tools/gen_schema.py).


## v6.11.1 — Skull-9 moves to the season decoder
- skull9 joins NOT_SOLD (prices.py → gun_prices row price 0, sold false; qz_buy says not_for_sale) and gacha_config.season_lines
  gets gun:skull9 in the place of one coins:1000. schema.sql updates a DB still on the exact v6.11 list (an edited list is left alone)
  and, in the same one-shot, puts gun:skull9 on every dealt season card that lacks it, on its first coins:1000 line not done yet.
- Client: SHOP_NOTSOLD / GACHA_DEF.season_lines / mock.js match. shopLockTag(id) (shop.js) is the locked-gun tag for both buy menus
  (해독기 / 시즌 / price); buylk explains a season gun. The season page shows a progress badge per gun line, its note and rules
  name every season gun (seasonGuns(), seasonNames()).

## v6.11.2 — Skull-9 slam straight down
- SK_SW.heavy (skull9.js) rebuilt from .52 on: the haft stays in a plane through the eye (x = .12 * depth), so the first-person slam is
  one vertical line on screen; the blade turns 35 degrees about the haft on the way down (its face shows) and lands square (8 degrees);
  impact pose: head at about NDC (.13, -.45), hands just under the bottom edge. SK_FX.heavy: no yaw/roll, pitch dip -.12 at the hit.
  Third person (KF.skH) was already a pure pitch swing. window.__SKT = {heavy: {K, F}} still overrides the keys for tuning.

## v6.12 — public room list, daily missions, ranking, claw lock
- Rooms (agent, net.js ROOMS): random 4-char PeerJS codes (retry on unavailable-id), public/private toggle, signed-in hosts
  heartbeat qz_room_up every 10 s (+ on change), qz_room_down on leave / pagehide (ACC.beacon); list in the mp menu (5 s refresh).
  SQL section "public rooms (v6.12)": rooms table (RLS, no direct access), qz_room_up / qz_room_down / qz_rooms (anon too).
- Missions + ranking (agent, rank.js, after shop in build.py): mission_pool table, 3 a day (easy/normal/hard), progress inside
  qz_claim (new p_hs = headshot kills, old 10-arg signature dropped; client retries without p_hs on an old DB), qz_missions /
  qz_mission_claim; qz_ranking(level|kills|infects|best) top 50 + my place (anon too). P.hsKills counted in killZombie.
- CLAW_LOCK (game.js): a newly infected zombie (not a host) can't start a claw for 2 s; the player gets a note.
## Salamander flamethrower (salamander.js)
- WPN.salamander (slot 1, special, cost 5500): 100 fuel (res 100 → 200 after game.js doubles spare ammo), rpm 600 = ten flame ticks a
  second, dmg 38 per tick full to 2.5 m, down to 38 % at the 7.6 m reach (eye to the body's surface), nothing past it. The cone is
  w0 .3 m + .09 m per metre wide (+ the body's half width), so it narrows as an angle; every tick needs a clear line from the eye (walls
  stop it). Each tick sets burnT 2.5 / burnSrc / burnW 'salamander' (updBurn: 11 per .25 s, kill credit and feed with its icon; a
  client's ticks reach the host through the 'eff' bt/bw path like the dragon cannons). kb 1.1, stag .22, burning zombies run ×.88
  (maxSpeed), no headshots (hskill dsGun skips W.flame), speed .85, reload 3.5 s (the canister under the barrel is the magazine: the
  rlMag drop clip, its magout/magin events renamed salout/salin), first draw act 'salig' (GUN_DESIGN: valve wheel a quarter turn, the
  pilot light pops).
- fireGun hands W.flame guns to salFire (net 'f' push, fuel, punch, salHits). salUpdate (gameUpdate, every frame, every actor holding
  one): salOn = a tick within .16 s (.24 for remote puppets fed by 'f' replays); the stream (salEmit: a rope redrawn every frame + core,
  fringe, plain-blended body, glow, smoke, embers; every droplet is raycast and cut at the wall, where a lick and a scorch go), a
  flickering DL light, ignition / shutoff / gust sounds for others. The player's stream starts where the view model's nozzle is on
  screen (salOrigin; muzzleWorld when the camera is not at the player). VMX.salamander: pilot sprites, jet sprites, the orange VM light
  and the shudder. AU.flame (main.js) is the player's roar loop. Bots: AI.rollLd weight .03, kite at 4 m, fire only within reach.
  Atlas mats salTank / salHose / salSoot / salBottle take slots 72-75 (supply.js moves to 76-79; the 8 x 10 atlas is now full).
- Measured (body aim, 60 fps sim; ticks land every 6-7 frames): DPS incl. burn 382 @2 m, 297 @5 m, 0 @8 / 10 m; MG3 380 / 355 / 329 /
  329, M249 384 flat; four zombies at 2.5-4 m take ≈ 330 each at once.

## v6.13 — Salamander on the season card
- salamander joins NOT_SOLD / SHOP_NOTSOLD and season_lines (in the place of one coins:1000). schema.sql moves a DB on the exact
  v6.11.1 list to the new one and gives dealt season cards a gun:salamander line on a coins:1000 line not done yet (one-shot);
  a DB still on the v6.11 list gets Skull-9 then Salamander in the same run.

## v6.14 — Blaze-8, Winchester M1887, Kill Knife, the "new" banner (built without review: the owner tests them)
- newguns.js (after salamander): models on existing atlas materials only. W.relFire: a fire press during a shell reload cuts it and
  fires in the same frame (game.js reload block). W.spEvery/spKb/spUp/spStag: spShot(a,W) in fireGun swaps in the special shell
  every spEvery shots (a.spN[id]); shotTrace passes up:W.spUp; spTag() on the HUD weapon name. Winchester: pump:1 + a 'lever'
  tag rotated about GUNS.winchester.leverPiv in vm.js's pump block. Kill Knife uses the knife clips (vm.js melee) and GUNS[id].trail.
- newsban.js (after rank): NEW_CONTENT list, NBAN (shows once per load after the lobby and any sign-in window; LS 'nbHide' = 2 h),
  NEW button on the notice panel (UI.act 'nbopen'); the first-visit sign-in prompt waits while the banner is open.
- Shop prices: killknife 3000, blaze8 6000, winchester 4500 (prices.py, SHOP_PRICE, mock.js).
- v6.14.x: Kill Knife blood is dyed into the steel (kkS1..kkS3 stained-steel materials, fading toward the handle). The gun atlas grew to 8 x 11 slots (GA_SLOTS); skull9/salamander painters check GA_SLOTS.

## v6.15 — New-Year letters in the inventory, the inventory window
- Letters picked up in a match count into G.player.nyM; after qz_claim the client sends them with qz_ny_add (server clamps each to 0..8 and to profiles.ny_quota, which qz_claim sets to least(8, 2 + kills/6), then zeroes the quota). The in-match free weapon pick (nyFree) is gone.
- profiles.ny_g/ny_h/ny_s/ny_n hold the letters; qz_ny_exchange('ny'|'season') takes one of each for dec_tickets +2 or season_tickets +1 (gacha_log src 'letters').
- qz_season_decode(p_count, p_ticket default false): with a ticket it costs no coins and uses season_tickets.
- inv.js: INV window (z 55), tabs ny / guns / sets (CFG.sets, slots 1-3, grenades, armor) / char (CFG.zclass, CFG.skin). The lobby bag button shows a dot when a set can be traded. The NEW banner waits while #invWin is open, and opening the inventory closes the banner.

- v6.15.1: the Kill Knife is renamed 나타나이프 / Nata Knife (WPN.killknife.n, the NEW banner, the lobby news). The id stays 'killknife': owned guns, gun_prices and SHOP_PRICE are unchanged.

## v6.16 — supply-crate guns: AK-47 60R, Dual MP7A1
- crateguns.js (after newguns in build.py): three atlas materials (mtB matte metal, mtP matte polymer, mtRed) painted by paintCgAtlas (main.js), the models, WPN entries, VM_POS, sounds (GUNDEF/SFX ak60r, dmp7). GUN_DESIGN rows and SOUND_DESIGN rows are in design.js.
- WPN.crate=1 marks a crate-only gun (CRATE_GUNS). Not in BUY_MENU, so not buyable; shopCats adds them to their W.cat category as crate cards (SHOP_NOTSOLD); INV.mine skips them; ldKeep (loadout.js) keeps them out of the next round and out of saved sets. The shooting range splices a 'crate' row into BUY_MENU while it runs (startMatch hook in loadout.js).
- SUP.open: Event Horizon r<.3, a crate gun r<.6, heavy r<.8, else supplies.
- AK-47 60R: the half-moon magazine is 36 slices round an arc (AK60: centre, radii, sweep); the first mag part is the slice in the well (rlMag takes the axis from it). Support hand at the front of the handguard, clear of the magazine tip. zoom:[44].
- Dual MP7A1: real MP7A1 proportions (mp7Parts). Charging handles are tag 'slide' for the dual first draw; fd.nolock keeps them forward when empty (vm.js slide lock skipped, rlDual skips the slide release and just plays the bolt sound). bRpm/bSpread: the right-click stance (a.dualB) multiplies the fire rate (game.js) and the spread (curSpread). VM_POS.dmp7.dx sets the gap between the guns (vm.js).

## v6.17 — round rewards, bigger match rewards
- Server: qz_round_claim(p_mode, p_round, p_kills, p_infects, p_damage, p_won, p_survived, p_mvp, p_score, p_hs). raw = 150 + 8k + 12inf + 5·dmg/1000
  + 120 won + 60 survived + 80 mvp, capped at 600 and at 4 a second since profiles.last_round (too_soon under 25 s); scen / range: no_rounds.
  xp = clamp(score·0.6 + 8k + 12inf, 10, 1500). Shares day / day_earned with qz_claim; the daily limit is 20,000 (was 8,000).
- qz_claim: raw = 100 + 15 rounds + 7k + 12inf + 5·dmg/1000 + 130 won + 80 mvp (scen: 100 + 50 stage + 200 cleared + 5k), capped at 1,200 and
  100 a minute; xp = clamp(score·0.75 + 10k + 15inf, 25, 4000); the first-match bonus (250) is keyed on profiles.bonus_day (day is moved by
  the round rewards too). The upgrade copies day into bonus_day so nobody gets a second bonus today.
- Client: game.js r0 (the round-start snapshot) also keeps score and headshots. shop.js hooks endRound: shopRoundStats (that round's numbers,
  won = the player's side at the end won, mvp picked like the round card) → ACC.roundClaim → a line under the round card (or a note).
  An older schema (no qz_round_claim) sets ACC.noRound and stays quiet. test/mock.js has the same numbers.

## v6.18 — friends, gifts, owned crate guns
- Server (schema.sql): profiles.fcode (6 characters, no 0/O/1/I/L; qz_fcode_new; every profile gets one, new ones at sign-up), friends (a = asker,
  b = asked, accepted; one row per pair), gifts (from, to, gun, price, seen). qz_find_player: a code, else a nickname only one player has
  (not_found / nick_many). qz_friends (code, friends with xp and the last time they played, incoming, outgoing, gifts_new), qz_friend_add
  (a mutual request is a yes; 100 friends, 30 waiting), qz_friend_answer, qz_friend_remove, qz_gift (accepted friends only, shop guns only,
  friend_has_it charges nothing), qz_gift_inbox (marks seen). qz_me adds fcode, gifts_new, friend_req. ak60r / dmp7 are in gun_prices
  (not sold) so owned_guns can hold them.
- Client: friends.js (FR window, GIFTS pop-up in the lobby, the lobby button and its dot, a poll every 45 s in the lobby), ACC.loadFriends /
  friendAdd / friendAnswer / friendRemove / gift / giftInbox, SHOP gift mode (SHOP.gift = {code, nick}; SHOP.giftTo; pickHtml).
- Crate guns are in BUY_MENU (their W.cat row). loadout.js crateOK: the range, an account that owns one, a remote player (trusted), never bots;
  buyCheck → 'lock' / 'crate', ldLocked, ldKeep (an owned one carries over). The range's own crate row is gone.
- Granting a gun by hand (Supabase SQL Editor): insert into public.owned_guns (user_id, gun_id, price_paid) select id, 'dmp7', 0 from auth.users
  where email = '...' on conflict do nothing;

## v6.19 — in-game chat (multiplayer not tested here: the owner tests it)
- chat.js (last in build order). CHAT.where(): 'lobby' in a multiplayer waiting room, 'game' in a match and its results, else hidden.
  #chatBox (lines: fade after 9 s, the last 14 while typing or in the waiting room) and #chatBar (input, send, all / my-side toggle).
- Keys (capture-phase keydown, not while typing in an input, paused, an overlay open, or on the solo results): Enter / Y = everyone,
  U = own side; the waiting room takes Enter only. Inside the box: Enter sends (empty = close), Esc closes. While open the player's cmd is
  zeroed (Main.playerCmd wrapper) and Main.keys cleared. Main.pause wrapper: Esc or a lost mouse lock while typing closes the box instead of
  pausing (alt-tab still pauses).
- Network: client → netToHost {t:'chat', m, tm}; HOSTH.chat (4 lines / 5 s per link, cleaned, 90 chars, name and side from the actor in a
  match, L.name in the lobby) → CHAT.relay: every link (a team line only to links whose actor is on the sender's side; the sender gets its
  own line back with me:1). Joins / leaves: HOSTH.hello and netDropPlayer wrappers → CHAT.sys → netAll {t:'chat', s:1}.
- Phones: TOUCH.build adds a 💬 button to .ttop (also shown while dead); TOUCH.press('chat') toggles the box.

## v6.19.1 — waiting-room chat fix
- The chat's waiting-room class was 'lob', which is also the main menu's container class (.lob = a flex column, 12 px gaps): the bar laid out
  top to bottom and covered the newest lines. Now 'inRoom'; #chatBar also pins flex-direction:row. Flood limit 6 lines / 5 s (client and host).
- The waiting room now holds the chat as a row of its own window (.rchat, right under the slots: a 116 px scrolling log that follows the
  newest line + the input), instead of floating over the room. CHAT.place() moves the box and bar between .rchat and the page; a
  UI.mpLobby wrapper re-docks them after every rebuild and keeps the typing focus. render() only rewrites the log when it changed.

## v6.20 — zombie scenario episode 1 「알레프」 (episode.js, aleph.js, mapep1.js; multiplayer not tested here: the owner tests it)
- Players see an episode as a chapter: 「1챕터」 / "Chapter 1", "CH.1" (the owner's wording); the code and the database say episode / ep.
- An episode = the scenario mode (G.mode 'scen') with G.cfg.ep > 0, always on the episode's own map (EPS[ep].map; epMapOf / epSel in
  main.js, net.js and the lobby). EP.on is set in a SCEN.initPool wrapper when MAP.ez exists and MAP.id is that map; every SCEN hook
  (begin, update, hud, hpFor, onRevive, pickTick, encState / decState, spotNear) hands over to EP while it is on. ep 0 = the free scenario.
- EPS: 1 = ALEPH (Q7-000, map ep1), 2–5 'soon' (ARGUS RT1-07, KHEPRI Q7-303, LYREBIRD RT1-05, TIAMAT Q7-Ω, LEGATUS RT1-01 in the plan).
  Unlocks: EP.unlocked(n) = episode n−1 cleared (ACC.me.eps from qz_me, or LS 'eprec' for guests); CLIH.lobby turns a joiner away
  (netFatal) from a room set to an episode they have not opened.
- Flow (host / solo, EP.host): stage 1 zone A waves (3, makeWave), 2 zone B terminals (25 s each in a 2.6 m ring, zombies near it stop it;
  a retry keeps the done ones), 3 zone C hold 60 s (ALEPH bursts through gate gW at 12 s, retreats at 35 s or at −10 % health), board
  the lift (gC, 40 s), ride 15 s (rideEnd moves everyone from car C to car D: x_D = −z_C, z_D = 74 + (x_C − 62), yaw − π/2), 4 the boss
  (prep 12 s with the supply pick, then bossGo: gD shuts, ALEPH breaks its chains), 5 escape 60 s (all living humans in car D =
  finish(true,true); time out = a clear without the bonus). 'move' 40 s between zones (all in the next zone's box ends it early).
  Three shared lives: a wipe = fail → the zone again (the boss: its phase, kind 'phase', starts shifted 8.4 m out of the car).
- Events (host → clients): eps (stage start: s, k, l, P = placements, g = gates, z = despawned, bp = boss phase), epw / epwc / epm / epo /
  epb / epr / epgo / epk / epf / epend / eprh / epdz / epg / epn, epx (aleph.js FX), ept (floor warnings). Client → host: eprv (revive),
  eppn / epvl (a panel / valve shot). Snapshot: SCEN.encState index 7 = EP.pack().
- aleph.js: ALEPH (hp 27,000 × (0.6 + 0.4 × humans) × SC_DIFF.hp; the header comment has every rule), STRAIT (the straitjacket zombie's
  pounce / grab), TELE (red floor warnings, also dodged by bots), ROCK (thrown slabs: 20 s cover), STEAM (valves: no far picks inside),
  CHAIN (the four restraint chains during the prep: sync from ALEPH.attach, tick from EP.update). Atlas slots epTank / epConc (GA 88).
- Records: shopMatchStats adds ep / diff / time / lives / bonus; ACC.claim sends p_ep … p_bonus (falls back without them on an older
  database). Server (schema.sql): ep_records (user × ep × diff: plays, clears, best time / medal / lives, first_at), qz_eps, qz_claim
  (16 arguments: the 11-argument one is dropped) pays an episode (100 + 150/zone + 400 clear + 300 escape + 5/kill) × [.7, 1, 1.4, 2],
  ≤ 3,000 and 150/min; a clear needs ≥ 300 s and the time since the last paid match ≥ 90 % of it (and episode n−1 cleared); the first clear
  per difficulty: 1,000 / 3,000 / 5,000 / 8,000 coins outside the daily limit + 1 decoder from normal up. Medal S (no life lost, ≤ 16 min) /
  A (≤ 1, ≤ 22 min) / B, and B for any clear without the escape (EP.medal is the same rule).
- Test harness note: a headless run that steps gameUpdate itself must also call DL.update(dt, cam), or the dynamic light list never
  expires and the page eventually crashes.

## v6.21 — zombie scenario chapter 2 「아르고스」 (argus.js, mapep2.js, epbase.js; multiplayer not tested here: the owner tests it)
- The chapter framework moved out of aleph.js: epbase.js holds CHAP / EPZ and the shared toys (TELE floor warnings, epFx knockdown /
  blind / dizzy, EPV screen overlays, ELAS laser sights, EBUL enemy bullets (m.s = shooter id → a.epKick recoil), EGREN thrown frag /
  flashbang / smoke, ESMK smoke, EPK ammo boxes, epKin scripted leaps: a.kin flies a body along an arc and actorPhysics skips it,
  epHid: a zombie flagged epHide is invisible to bots through / inside smoke). episode.js runs any CHAP[n] (stage kinds waves, terms,
  act, hold, breach, boss, escape); aleph.js is now only ALEPH, the straitjacket zombie and CHAP[1].
- New hooks in episode.js: EPZ[zc].ai(a,dt) returning true replaces the zombie AI altogether (ARGUS); a boss stage's own devices
  (B.useNear / useInfo / botUse, held with epUse = 100 + index, so the host counts holders like act devices); C.botPost(a) for every
  ally bot; B.goalTag(b) joins the bots' goal key. The local player with a .bot (the tests) skips useTick (its bot code holds E).
- ai.js: a zombie's epAimY (aim height above its feet: ARGUS on a tower clears the sandbags), epPri (target priority multiplier:
  lower = preferred), epHide. scenario.js: SCEN.unstick leaves zombies with their own brain alone (it used to teleport ARGUS).
- argus.js: ARGUS (hp 14,000 × (0.6 + 0.4 × humans) × SC_DIFF.hp; phases at 75 % and 30 %; the header comment has every rule),
  FLOOD (four floodlight heads on map poles: states 'p' plaza pool / 0–3 a tower / 'x' off; 3 s E at the box swings onto ARGUS's tower
  → burnout: it falls off, 5 s down, the light spent 20 s), TRAP (phase 2 tripwires), SQUAD (the RT-1 squad zombie: −30 % frontal
  bullets, grenades, ammo drops), a poseZombie wrapper (ARGUS aims, carries and throws with poseHuman holds on its zombie rig; beast /
  down poses from the zombie set), CHAP[2] (stages: A waves, B act 'gen' ×3, C act 'rec' ×2 with the sniper meeting on the C tower,
  D boss). Snapshot (bsPack): gauges, flags, lens bits, pose index, tower, seen human ids, the floodlights [state, progress, cd] × 4.
  Events 'eag' (fxApply); client → host 'epfl' (its own flare burst near ARGUS: stagger +40).
- Atlas: epNvg / epFlood (GA 90 of 104 slots used).
- Balance from 4-bot simulations on normal: the boss fight 110–230 s (P1 35–55 s, P2 30–45 s, P3 45–125 s, often one wipe in P3),
  the whole chapter 4:47–10 min; hard is a loss for bots more often than not. Bots dodge the laser to floor the tower cannot see
  (ARGUS.hidNodes, per perch), take peek spots a step from it, close in while it is down, and one minds the floodlight that reaches it.
- Server: a chapter clear counts from 240 s (was 300; schema.sql, re-run it).
- Test harness note: yield with a MessageChannel, not setTimeout(0) — headless runs that yielded with timers sometimes stalled for good.

## v6.22 — zombie scenario chapter 3 「케프리」 (khepri.js, mapep3.js; multiplayer not tested here: the owner tests it)
- mapep3.js 「녹슨 제철소」 (MAPDEFS.ep3, ep:3): A scrap yard (scrap mountain, crushed cars, car press, magnet crane; gate gA), B rail yard
  (tracks, gondolas, loco, coil flatcar, signal box with an outside stair, pump house, oil tank, gantry, flare stack; the stair cage gB up
  to the gallery), C conveyor gallery at y 8 (window bays, the breach wall gW), D blast-furnace hall (furnace octagon with catwalk rings
  at y 5 / 10, slag yard with two scrap heaps, molten runners, casting bay with the ladle, two lever booths, the pour spot; door gC).
  MAP.ez carries zones / doors / valves / drums / gas / coolant / heaps / scrap / rails / ladle / perches / phase points / gallery / cut.
  env.ash (map.js): the snow particles tinted as ash (rain shader uTn). ep3Mesh: the runners' molten shader (E3MOLT.uOn = furnace lit).
- khepri.js: KHEPRI (hp 22,000 × (0.6 + 0.4 × humans) × SC_DIFF.hp; phases at 60 % / 30 %; the header comment has every rule). Its own
  hit volumes through a.epRay (+ a.epRayZc so a reused boss slot of another class never keeps it): the ball sphere, the head-joint sphere,
  the body box. The ball (S.b: st held / air / loose / none / grow, r = 1.25 + 0.075 × weight, durability 1,300 × …) rides khFwd(r)
  ahead of the body. KX = the hazards (drums with hp 50 and chains, gas pillars, coolant steam (ESMK), heaps, scrap pick-ups, fire
  patches, larva swarms, the phase-2 mini balls); LADLE = the casting bay ladle (levers held as boss devices epUse 100 / 101).
  The beetle is its own rig on the zombie group (rigX / attach: shell, hinged wing cases and wings, head, six two-part legs whose
  shins are angled so the claws reach the ground; it rears up to lift the ball). Larva (swarm on death unless fire / HE) and
  scrap-armour zombies (bullets ×0.5, fire / HE ×2) via EPZ; their designs in design.js.
- weapons.js / nyw.js: rayActors(X) ask a.epRay when present; part 'ball' → metal impact. epbase.js: epBoxShot (shots on props with
  o.eh reach C.boxShot), the 'du' dust-in-the-eyes effect.
- Snapshot (bsPack): id, phase, grog, grog max, flags, ball state, ball xyz, weight, durability, lift, grow radius, pose, ladle.
  Events 'ekh' (KX kinds → KX.fxApply, 'ld' → LADLE.set, else KHEPRI.fxApply); client → host 'ekhs' prop shot, 'ekhb' HE blast,
  'ekhf' flame on a swarm.
- Atlas: epEly / epChit / epBelly / epWing / epRust / epMolt (GA 96 of 104 slots used).
- Balance from 4-bot simulations on normal: the boss fight 90–210 s, the whole chapter 6–7 min, no lives lost on most runs.
- Phones: with a boss bar up (#hud.epB) the radio box narrows and keeps its last two lines.

## v6.22.1 — the chapter 1 and 2 bosses hit harder and move more (aleph.js, argus.js, epbase.js)
- epbase.js: EWAVE, a shared shockwave (a ring racing out over the floor; on the ground where it passes: damage and a shove, a jump or
  a raised spot dodges it; bots jump most of them). Host decides the hits; 'epwv' draws it on the clients. Updated / cleared with the
  other toys.
- ALEPH: claws 22 / 34, the charge 38 (+25 pinned; speed 16.5, the warning strip 18.5 m), cooldowns shorter (P1 charge 4.5 / slam 3.5 /
  throw 8; P2 smash 8 / shield charge 5.5 / slam 3.5 / throw 11; P3 roar 16 / hops 9 / charge 3.2 / throw 7) and much less idle time
  after each move. A charge that ends within 7 m of someone turns into a slam (P1 45 %, later 85 %); P3 charges a second time 65 % of
  the time (0.45 s wind-up). Slams 18–48 in 8 m, with a shockwave from P2 on (15 m, 12.5 m/s, 24); P3's third hop sends one too.
  Slabs 40 in 3.5 m, thrown in P2 as well, three at once in P3 (±4.2 m beside the target). Shield smash 52.
- ARGUS: the rifle 68 (88 into armour), P3 doubles 40 (three when enraged or under 15 %); frags (EGREN 'he', 42): from the tower at
  whoever comes within 13 m of its foot (cooldown 10), in P2 alternating with the flashbangs (9); the SMG 7 a round, spread 0.04,
  2.2 s bursts every 6 s; tripwires 36; claws 22 / 32; the descent 30. P3 pounce (modes pnw / pnl / pnr): a red ring where it will
  land, 0.55 s, the leap, 34 in 3.6 m and knocked flat within 2.3 m, then it hops away (cooldown 11).
- New radio lines: aWave (ch1), aFrag and aPounce (ch2).
- Balance from 4-bot simulations on normal (whole chapters): chapter 1 about 6.5 min, one life lost (was none); chapter 2 8–11 min,
  one or two lives lost, medal B (was S). Human players can jump the waves and use the rings better than the bots do.

## v6.23 — zombie scenario chapter 4 「라이어버드」 (lyrebird.js, mapep4.js, ping.js; multiplayer not tested here: the owner tests it)
- mapep4.js 「운무봉 통신기지」 (MAPDEFS.ep4, ep:4): A the checkpoint at the foot (y 0, gate gA), B the mountain road (lower road east
  y 0 → 3, the hairpin and supply depot at y 3, the upper road west y 3 → 6 through a rock tunnel; three relays; gate gB), C the radar dome
  compound (y 6; radar blocks, mess hall, the summit gate gC and its console), D the summit antenna yard (y 10; three alarm siren towers,
  lattice masts with platforms, helipad, the two-storey signals block, the generator shed, the cliff over the sea of cloud). Clouds at y −14,
  blinking warning lamps (E4GLOW). env.skyFog (map.js / shaders.js): the sky dome fades into the fog colour.
- lyrebird.js: EPFOG (the fog density per stage / near lit relays / past the cliff edge / thicker after the cry / clear for a siren's 10 s;
  bots see 2.3 / density metres, 18–90), SIREN (beacons, rings, the boxes = boss devices epUse 100–102), DECOY (dyn boxes eh k 'dc',
  shot through C.boxShot), GATEC (stage 3's console = boss device 103, progress in EP.obj.ps[0]; CHAP.breachOK / breachDev / goal /
  markers), LYRE (the boss: brain, pounce / pin / release, climb / perch, fake radio (CHAT + PING), mirages, sonic, echo, disguise (a human
  rig via rigKey, epAsH), fake siren; hit volumes through epRay; the rig extras: the throat sac, the radio pack), MIRAGE (a teammate's rig on
  a zombie, walks up, lunges, grabs), EPZ radioman / spore. The quadruped rig: lyCrawl (IK hands through ik2 in the spine frame, feet
  through solveLeg with the pelvis pitch; a trot on the stride clock; perch / pin / down / leap poses).
- ping.js: PING (Z / middle button / the 📍 touch button; host relays 'pngs' to the pinger's side; screen diamonds and minimap marks).
- episode.js: a breach stage can wait on C.breachOK and use the boss module's devices (C.breachDev).
- Snapshot (bsPack): id, phase, grog, grog max, flags, pack %, pose, disguise as, victim, sirens. Events 'ely'; client → host 'elyk'
  (the knife frees a pin), 'elys' (a decoy shot).
- Balance from 4-bot simulations on normal (whole chapter): 6.5–10 min, the boss fight 165–270 s, sometimes a wipe in phase 3.
- Test harness note: calling HUD.update every few frames in headless runs makes the renderer's memory climb to an OOM kill (swiftshader
  compositing); the long sims skip it (window.__noHud).

## v6.24 — hall of fame: the first clear team of every chapter × difficulty (hof.js)
- Schema: `ep_firsts(ep,diff,match_id,at,clear_time)` + `ep_first_members(ep,diff,user_id,at)`; pre-v6.24 first clears are migrated by the
  schema file. `qz_ep_firsts()` (public) lists them with member nicknames; `qz_claim(..., p_match)` records the first clear (the match id is
  made by the host, `cfg.mt`, or `netKey(12)` solo), `qz_me`/`qz_ranking`/`qz_friends` return `ft` (the player's titles).
- Title code = chapter*10 + difficulty. The client shows a title only if `qz_ep_firsts` lists that account nickname for that team (no spoofing).
- hof.js: HOF.chip / crown / of / cardLine / page / claimed / hello. Shown in the ranking (new 명예의 전당 tab), friends, chat, name tags,
  results/scoreboard and the chapter cards.
- Old databases keep working: `ACC.claim` falls back through the older signatures; a missing `qz_ep_firsts` is treated as 'old'.
- Fixed: lyradio SFX warning (setValueCurveAtTime overlapped a ramp; `B.am` now goes on a separate gain).

## v6.25 — friends window: real last-seen time and chat (friends.js, account.js, schema.sql)
- Schema: `profiles.last_seen`; `qz_ping()` (the heartbeat; touches last_seen at most every 20 s, returns dm_new); `friend_msgs` table (no direct
  access, RLS on and no grants) with `qz_dm_send(code,text)` (friends only, 1..200 chars after control chars become spaces, 20 / min, 300 / h,
  each pair keeps its newest 100) and `qz_dm_list(code,after)` (newest 60, oldest first, marks the friend's messages read, returns seen + dm_new).
  `qz_friends` also touches last_seen and returns per friend `seen`, `dm` (unread) and in total `dm_new`; `last` = greatest(last_seen, last_claim, last_round).
- friends.js: online = seen in the last 150 s (frOn); the heartbeat is once at sign-in, every 60 s and when the tab comes back; the chat panel
  polls `ACC.dmList` every 4 s while open; the red dot on the lobby 친구 button counts requests + gifts + unread messages.
- Old databases: `ACC.ping` stops after the first 'function not found'; chat then shows 'needs the schema updated'.
- mock.js: qz_ping / qz_dm_send / qz_dm_list, `seen` and `dm` on friends.

## v6.26 — balance and feel patch from player feedback (nyw.js, game.js, weapons.js, vm.js, shaders.js, skull9.js)
- Gae Bolg: `WPN.gaebolg.pm` = {head 2.5, legs .6}; the harpoon stores the hit part (n.part, n.pm); harpoonBoom hits the stuck zombie with 330 × pm
  (hs flag = head) and excludes it from blastDamage (`o.skip`).
- Blood Dripper: a head hit on the outbound disc (not on bosses: epRay / al / ag / kh / ly / sb) deals 126 with kb 16, then the disc follows the head
  for `gT` 1.6 s: `gDmg` 45 every 0.12 s with kb 2.6 (`o.nocap` skips kbCap), then returns.
- Draw cut: meleePend / meleeStrike take `dc`; the blow uses max(dmg), max(kb), max(stag), max(up) of the weapon (hammer: 180 / kb 62 instead of 112).
- Spawns: in mut / orig `startRound` draws from MAP.spawns + MAP.zspawns, random yaw when a point has none (the player's fixed spawnYaw is skipped).
- Zombies: berserk (rager) takes ×1.3 and loses its kb ×.5; STAG_K = 1.6 on every stagger; staggered speed ×.4.
- Humans: no fall damage (the host ignores the old client 'fall' message); bunny hop (BHOP_*: +5 % per chained jump up to 6, held jump rejumps within .09 s of
  landing); grenade hold (a.nHold / a.nT, VM.hold freezes the throw animation at the pulled-back pose; bots still throw at once).
- Light zombie: the invisibility tint is bright blue (.5,.75,1) at 0.8 mix, 70 % dithered away; host zombies killed by a headshot stay down in mutation;
  Skull-9 speed 1 and no atkSpd.

## v6.27 — Balrog-5 (balrog.js)
- A heavy assault rifle with a combo gauge: each landed bullet +1 (headshot +2), at `W.cmb` (8 since v6.27.1; 25 before) the next bullet is explosive — it hits normally and
  `blastDamage` goes off where it landed (radius 3.6, 230 at the centre, kb 13, up 4.2, he flag). `a.cmb[id]` is the gauge (cleared by startRound).
- Hooks: weapons.js `fireGun` (xb, cmbAfter), `shotTrace` (a.shotEnd, only for W.cmb weapons), ui.js `cmbTag`, `VMX.balrog5` (tags g1..g5 / rdy).
- Shop 6,500 (shop.js, schema.sql price table — re-run the schema to be able to buy it), bots may carry it (ai.js rollLd), design.js sound + reload entries (the
  M4A1's 'ar' action), a heavier report (GUNDEF.balrog5). Remote clients replay the shot in ghost mode, so they see the same gauge and blast.

## v6.28 — Balrog-XI, Plasma Gun, Thunderbolt (csoguns.js; build order: after ui.js because it wraps HUD.update)
- Atlas: plGlow (self-lit green), tbBody (blue-violet plating), tbGlow (self-lit cyan) — 102 of the 104 atlas slots are now used.
- First person looks at the LEFT side of a gun: lamps / gauges / the plasma cell sit on the left (Balrog-5's gauge moved there too).
- Balrog-XI: the Blaze-8 special-shell machinery (spEvery 4, spMax 7) (v6.28.1: the count no longer resets on trigger release; `spRun` removed) and
  `spFlame` (newguns.js spFire → bxFlame): five 'bxfl' projectiles in a ±0.2 rad fan, radius 0.3 + 1.3·t, each stops in the first zombie it touches
  (160, kb 6 uncapped, stagger 1.1, 3 s burn), 24 m/s for 0.6 s. HUD ring #bxRing; ember pips p1..p7 (VMX.balrog11). Shell reload (shellRel .36).
- Plasma Gun: proj 'plasma' (52 m/s), plBoom splash radius 4.5, dmg 70 since v6.29.2 (direct target 100 %, others 100→80 % by distance, LOS), `o.flat` skips morale
  (game.js damageActor), no hsForce, kbCap applies. Reload rlCell (vmrel rlBuild wrapper): the cell pulled out backwards (rlMag style 'pull', ax +z).
- Thunderbolt: `W.rail` branch in fireGun → tbShot: walls collected with rayCast + a skip set (×wallK .85 each), tbLine = every enemy on the line
  (×pierceK .9 each), damage 650 × part (head ×2.5 since v6.29.1). `W.noRel` (mag 30, res 0): no reload; loadout.js ammo buy / re-buy, epbase supplies and the range
  refill the magazine; the HUD hides the reserve. Scope #scope.tb (+ .lock), through-wall marks #tbMk, beam meshes (TB.beams, updated from nyUpdate),
  FDS.rail first draw (power switch tag 'sw'), VMX.thunder lights coils tc1..tc4 as nextFire comes round.
- Network: fireballs and orbs are nyProj kinds (the nyProj wrapper builds remote copies); the beam replays with the ghost shot.
- Motions checked against the reference videos (frames pulled in Chrome): Balrog-XI shell reload rolled on its side (`W.spose`, vmrel rlShellSpec
  now takes a per-gun shell pose), the Plasma Gun's cell change with the muzzle almost straight up (rlCell pose rx .8), the Thunderbolt's recharge
  after every shot (`tbRecharge` clip: swing up, roll, two slaps on the coil housing; a scoped shot drops the scope, `a.tbZ` brings it back when
  the coils are full). Balrog-XI's fore-end is crimson with black ribs and steel horns on the receiver.

## v6.29 — zombie scenario chapter 5 「티아마트」, the season 1 finale (tiamat.js, mapep5.js; multiplayer not tested here: the owner tests it)
- Build order: mapep5 after mapep4; tiamat after lyrebird, before episode (EPS is built from CHAP at episode.js load). tiamat.js reuses ch3's
  KX swarms (larva zombies, burst egg sacs) — khepri.js's grenade / flame hooks now also run for EP.id 5; CHAP[5].clear calls KX.clear.
- mapep5.js 「새벽천 대심도 방수로」 (MAPDEFS.ep5, ep:5): A the control yard on the surface (y 33, storm), the cage lift (gates gLt top /
  gLb bottom, same footprint 33 m apart), B the inflow tunnel (walkways y 0, channel −1.6 with water at −0.7; three pumps in alcoves), C the
  surge tank (y 0, roof 18; 24 pillars, two trenches −4 deep, a walkway grid at y 4 with platforms round the pillars, stairs from the floor to
  the two drain wheels, the pump dais), zone E = the dais (the boss stage's zone), D shaft No. 3 (r 15, 45 deep; a ramp 2.75 turns up the wall
  with landings at 11 and 22 m to the yard door gX at 33). The shaft's wall, ramp, parapet and column are meshes (ep5Mesh); its collision is
  invisible 0.5 m grid boxes merged in rows / columns (e5ShaftBoxes; the ramp boxes carry stair:1 so the nav graph takes the slope's steps).
  E5D + e5H / e5At / e5Near describe the ramp. minimap.js takes any number of cuts (MAP.mini). gunart.js: the atlas grew to 8 × 15 slots.
- Water (tiamat.js WATER): regions B (fixed), C and D (levels moved by the host, event 'etw'); WATER.surf sets WATER.k (the region).
  Humans out of their depth float (actorPhysics wrapper: vy toward feet 1.42 under the surface, onGround for the step-up) except in D, where
  the escape's water drowns (15/s over the head). Deep water: humans −40 %, zombies −25 % (not the drowned), no jumping, grenades fizzle.
  E5W: the water planes (shader e5WaterMat, churn uniform); the underwater overlay #e5uw and fog.
- TIAMAT: the actor is the head (no actor physics; its brain moves S.H); TMV lays 14 segments (TM_K 1.4 scale) along the trail of the head on
  every page and keeps the hit volumes (TMV.parts: head, core, seg, sac, joint; TMT the tail sting's own pieces); hits are matched to a part by
  TMV.partAt on the host. Bots aim through a.epAimP (ai.js: a chapter body's own aim point) at the best exposed part (TM_AIM) and do not see
  it when nothing shows (tmSub → epHid). Phase scripts (toPhase / phStep) break the sluice gW (P2, hall floods to 1.2) and the shaft gate gS
  (P3, the climb). Devices 100+0..1 the drain wheels, 102..103 the fan switches (E5X). Snapshot (bsPack): id, ph, grog, grog max, flags, gauge,
  len, sacs, joints, coil glow, mode, E5X.pack (wheels, cooldowns, water). Events 'etm' (boss / hazards), 'etw' (water), 'e5r' (the lift ride).
- Episode hooks added: CHAP.endFx(res) (called from EP.endFx on every page: ch5's season ending — radio end0..end2 with voice3 LEGATUS
  (#hRadio p.v), then the season card #epCard.s1); CHAP.hostPh handles the lift ('move' = boarding at stage 1, then 'ride' 12 s, teleport 33 m
  down into stage 2).
- design.js: drowned (orange raincoat, chest waders, weed) and hazmat (a Q7 researcher's suit, the visor frame, a glowing spore tank);
  tiamat / centi are hidden placeholders (keys z_tiamat / z_centi), drawn by tiamat.js.
- Balance from 4-bot simulations on normal (whole chapter, 4 runs): 8–12 min, all wins (the escape made in 3); the boss fight 3–7 min. Stage 3 ~45 s once the stairs to the wheels were added. Solo (one bot) does not get through phase 1: fewer than four
  humans slow its attacks (up to 1.6×). Hard with 4 bots stalls in the tunnel (zombie pressure). TIAMAT 23,500 × (0.6 + 0.4 × humans) × difficulty (22,000 gave 3 min fights without a wipe, 25,000 one with two).

## v6.31 — Event Horizon Mini (supply.js)
- `bholemini`: pistol (slot 2), cost 30000 (shop.js SHOP_PRICE + supabase/schema.sql gun_catalog row — run the SQL), mag 2 / res 6, dmg 0, `pull:1`: reuses the vortex projectile; vortexUpd reads WPN[n.w] vR (9 m) / vT (2.6 s) / vF (.55 pull force); `pull` skips the grinding ticks and the collapse blast.

## v6.32 — Crimson Peacemaker (supply.js)
- `crimson`: pistol (slot 2), shop 12000 (SHOP_PRICE + supabase/schema.sql gun_catalog — run the SQL), mag 6 / res 24, dmg 250, hs 2.4 (head 600), kb 30, rpm 70, rec [.16,.04] + `kickX` (vmKick override); model reuses the r6 revolver reload (rlKind 'rev').

- v6.32.1: Crimson rpm 150; `alt:'fan'` (nyw.js nyAlt) sets a.fanB + a.burstN=mag; the burst branch in game.js actorWeapons fires `fanShot(W)` (dmg x fanDm, spread x2.4, kb x.55) at fanRpm 700, then burstCd. Model rebuilt (~60 parts).

## v6.33 — Katana (katana.js, build order: after crateguns)
- `katana`: melee (slot 3, special buy menu), shop 9000 (SHOP_PRICE + supabase/schema.sql gun_catalog + test/mock.js), dmg [105,280], rate [.5,1.05], range [2.6,2.9], cleave [2,3], arc [.45,.32], kbL [.3,.5], hitT [.17,.36], anD [.42,.76]; swS/hitS/drawS kaswing/kahit/kadraw (synthesised here).
- Model: blade in slices along a curve (kaCy), burnished back band, polished flat (kaSteel), hardened edge (kaHamon) with a waving temper line, groove, finer slices over the point (KS .925); habaki, seppa, guard built in rows (kaIron + gold rim), black ito over white same (kaIto texture + raised crossings), menuki, kashira. Atlas: kaSteel, kaHamon, kaIto, kaIron (paintKaAtlas, chained onto paintCgAtlas).
- First person: two fists on the handle (kaVmArms; v6.33.1: kaHand lets the handle cross the palm on a slant up to KA_SLANT .62 rad so the forearms come up from below instead of standing square to an upright handle; elbow tracks are derived from the fists by kaElb, rest elbows KA_ELB from KA_ELB_RAW); swings are skull9-style quaternion clips on a pivot (kaClip, KA_SW keys in camera space: grip point, blade direction, edge direction; elbows auto-placed when left out). Light alternates 'light' (kesa: down from the upper right) and 'light2' (up from the lower left), VM.kaSide; heavy = flat sweep right to left. vm.js: kind 'katana', VMK.drKa draw, VM.melee hook. Hit-stop via the VM.meleeHit wrapper.
- Third person: HOLDS.katana (ham two-handed, light KF.hamA, heavy KF.skA). game.js dismember: katana heavy kills always sever, light 50 %.

## v6.34 — Jackhammer (realguns.js, build order: after csoguns, before supply so applyGunDesign sees it)
- realguns.js: real firearms with an unusual layout. `jhammer` (Pancor Jackhammer): shotgun slot 1, full auto 240 rpm, mag 10 / res 50, 8 pellets × 20, shop 7500 (SHOP_PRICE + schema.sql + test/mock.js), snd 'jhfire' (GUNDEF.jhammer via gunshot), no shell ejection.
- Model: receiver, carry handle with sights, vented shroud, ported muzzle, ribbed forearm (tag pump: the first draw is act 'pump', design.js GUN_DESIGN.jhammer, reload 3.2 rl 'mag'), the cassette (tag mag): ten olive staves round the axle (JH.cy/cz), chamber mouths front, brass heads back. VMX.jhammer turns the cassette TAU/10 per shot fired (10-fold symmetric, so the count can restart after a reload). RL_POSE.jhammer swings the gun round to show the bay behind the grip.

## v6.35 — Dual Desert Eagle (realguns.js)
- `dde`: dual pistol (slot 2, hold dual, model dde + alt ddeL, iconDual), mag 14 (7×2) / res 42, dmg 110, hs 3, kb 12, stag .75, rpm 300 semi (stance B: auto, bSpread 1.4), kickX [.8,2.9,.7], shop 8500 (SHOP_PRICE + schema.sql + test/mock.js), snd 'ddefire' (GUNDEF.dde); first draw slide ×2 heavy (GUN_DESIGN.dde), reload rlDual.
- deParts(scheme): Mark XIX barrel block (three-sided top + rail with slots), engraved flats (deGold), ported muzzle brake, slide (tag slide) with grooves / port / inlay / safeties, square trigger guard, grip panels + medallions, magazine (tag mag). Atlas: deGold (engraved), deGoldP (polished) — paintDeAtlas on the paintCgAtlas chain.

## v6.35.1 — Thunderbolt scope class
- The Thunderbolt scope's class is `tbsc` (it was `tb`, the touch buttons' class: `.tb{pointer-events:auto}` made the full-screen scope eat the canvas clicks on PC). `#scope` is `pointer-events:none` as a guard.

## v6.36 — the sidearm decoder (보조무기 해독기)
- A third decoder bingo card, kind `side` (JS) / `side_*` (SQL): numbers 1..side_hi (80), 12 line items from `gacha_config.side_lines` = gun:bholemini, gun:crimson, coins 500/1000/1000/2000/3000, frags 20/20/30, tickets 1/1 (근하신년 decoders). Coins only: side_cost1 500 / side_cost10 4500, side_frag_min..max 1–2 per decoder, an owned gun's line pays side_owned_coins 5000. Shuffles: shuffle_free a day on its own counter (profiles.side_shuffle_day / side_shuffles).
- Server: table side_boards (RLS read own), qz_side_new / qz_side_json (internal), qz_side, qz_side_decode(p_count), qz_side_reset, qz_side_shuffle; gacha_log src 'side', coin_log 'side_decoder' / 'side_win'. bholemini and crimson are `sold=false, price 0` (not bought, not gifted, not exchanged); accounts that bought them keep them.
- Client: ACC.side + loadSide / sideDecode / sideReset / sideShuffle (ACC.sub is the subscribe method — do not reuse the name). shop.js: SHOP.bk('side') {s:1, lo:1}, shopState 'side', sideGun(), cardGuns(k), sideSvg() (a revolver cylinder `.cyl` that indexes a chamber at a time, spins while rolling), the `sd` crimson theme (style.css), sPopRules(kind) for both item cards, bingoSim(N).two = the later of two lines. test/mock.js mirrors qz_side* (__MOCK_DRW = the next sidearm card's items).
- While a batch plays out, the line tiles show as owned only the guns owned before it plus the ones revealed so far (SHOP.ownView, anim.own0) — gotDraws adds the won guns to ACC.me.owned before the animation.

## v6.38 — host migration (net.js; PeerJS rooms only)
- Line of succession: netMigOrder(NET.lob.pl, hostKey) = pl[1..] in join order, non-touch (p.t 0) before touch (p.t from hello `tc`; the host's own me.t in netLobbyCast). Every lobby cast also carries lob.pub (listed room) and lob.g (NET.gen, hand-over count). NET_VER bumped to -r7 so older pages cannot share a room.
- Triggers on a client: CLIH.bye without `why` (the host's NET.leave sends {t:'bye', mg:[order], g}), the host link closing / timing out (netLinkDown), or a host silent for 6 s in a match (frameEnd watchdog, not in the first 15 s after netBegin: NET.t0). netMigStart builds NET.mig {old (pl[0].k: the roster key; the link may be 'qzg-code' for bell joiners), list, gone, hold (in a match), role 'cli'}, drops the old link (a merely quiet one gets {t:'bye', why:'mig'} first), nulls the old host actor's a.net, clears NET.off / a.nb / lastK.
- netMigNext: first non-gone key in the list; mine → netMigPromote, else netMigDial(k) (PJ.peer.connect to that player's own peer id; every page's peer now takes connections: pjAccept). PeerJS 'peer-unavailable' (EXPIRE, ~5 s) → netMigGone → next. A dial not up in 14 s, or the link to the new host dropping → netFatal(mpMigFail). The hello carries mg / sk (gone keys) / wu (scenario upgrades).
- A client getting a hello with `mg` on a non-host link (netHandle routes it to netMigAsk): own host heard within 1.5 s (2.5 s lobby) → {t:'mignot'} (asker netFatal); else it starts its own migration, adds the asker's sk to gone and either promotes (first in line) or answers {t:'migto', k} (asker re-dials, ≤3 redirects; k = asker → it promotes).
- netMigPromote: NET.host, pl = [me, ...the rest not gone], M.want = their keys; ROOMS.pubOn = lob.pub; PJ.bellOn() after 1.5 s (a second Peer on 'qzg-<code>', retried every 5 s while taken, 30 tries: a crashed host's ghost holds it up to ~60 s; ROOMS retries a room_taken code every 20 s). NET.start (and NET.give) wait while NET.mig is set. In a match netMigTakeover: bots and the old host's actor get a.pup=false + AI.mk, remote players stay puppets, all L.inGame=false until their hello (netMigHello: L.inGame, got, a.wup, replies {t:'mig'}).
- netMigTick (host): all wanted players back (or gone from pl) or 15 s → netMigResume: no-shows → netDropPlayer (bots), 'mbot' (a.net=null for the old host / gone actors), netMigRestart, netEv('mgo', {w, n}), a chat line (CHAT.sys). Restart: infection prep/fight → G.round-- + startRound(); 'end' / 'over' carry on (over: netMigResults swaps in the to-lobby button); free scenario → SCEN.stageStart('retry') (lives kept); chapters → move: stageStart(st+1,'next'), boss stage: 'phase', board / ride / escape: carry on (SCEN.zsp recomputed), else 'retry' (terms/act keep progress). SCEN.best raised to the stages already cleared.
- The pause: netHold() (NET.mig.hold in a match) → Main.step skips playerCmd + gameUpdate (visuals only) and the host skips netHostTick; clients unpause on 'mgo'. Notice #migBox (centred in a match, top in the lobby; .done for 3.5 s after).
- 방장 넘기기 (lobby, host, PeerJS): slot button data-act="mpgive" (two taps) → NET.give(k): bye with mg [k, ...], PJ.detach (the code's id frees), becomes a client with NET.mig {why:'give', list:[k]}, a fresh PJ.mk() and dials k (it rejoins as a new player).
- PJ refactor: mk(id) (open → NET.me; 'connection' → pjAccept; reconnect on 'disconnected'), host(), join() (mk + dial, onErr routes errors during the join), bellOn/bellOff, detach() (returns the destroyer; NET.leave destroys after 150 ms so the goodbyes go out).

## v6.37 — invites (invite.js, after hof in the build)
- Room invites: table room_invites (from_id, to_id) → code/map/mode/at, 3 minutes to answer; qz_invite(p_who, p_code, p_map, p_mode) (friends only: inv_friends; same friend again after 10 s: inv_wait; 15 a minute: inv_many), qz_invites() (mine, newest first), qz_invite_answer(p_fc, p_code) (deletes). qz_ping and qz_friends carry `inv` (the count).
- Client INVT: polls qz_invites every 6 s only while signed in, in the lobby (G.st menu), not in a room, tab visible and with a friend online (frOn), plus at once when ping / friends report more invites than last seen. Pop-up #invPop (join → UI.act('mp') then 'mproom', no → answer). The waiting room (UI.mpLobby wrapper): 「친구 초대」 (FR.open with an invite button per friend) and 「초대 링크」 (?join=CODE&ref=FCODE; share sheet on touch). Empty seats invite too.
- Invite links: profiles.ref_by / ref_done, table referrals (referee pk, referrer, paid_at, rewarded, seen), gacha_config ref_new_coins 2000 / ref_new_tickets 2 / ref_coins 3000 / ref_tickets 2 / ref_matches 3 / ref_cap 10 / ref_days 7. qz_ref_set(p_code) (new accounts only: ref_old; once: ref_already; no self / loop; makes them friends), qz_ref_check() (after ACC.claim: pays both once matches ≥ ref_matches; locks the referrer row to keep the cap), qz_ref_info() (record; marks rewards seen). qz_me returns `ref` {by, done, left, n, paid, new}.
- Client REFL: ?ref= kept in localStorage qz_ref (7 days) → applied on the first signed-in emit; welcome / paid / inviter pop-ups (#refPop); the sign-up form shows the pending code; the friends window shows my link card (+ the room card while in a PeerJS room). The URL params are stripped at load.
- inv.js already owns the global INV (the inventory): the invite objects are INVT / REFL.

## v6.38.1
- Plasma Gun: plBoom multiplies by 2 when G.mode==='scen'. Thunderbolt marks skip targets without losClear. Balrog-XI: spShot resets spN when the gap since the last shell exceeds 1.5 shot intervals. EP.botPost: boss-stage stall breaker (B.stT/stN; botGoal gets i+stN).

## v6.39 — the firefighter zombie (fireman.js, last in the build)
- ZCLASS.fireman (skill 'charge', cd 15), appended to ZLIST (the 6th playable class) and to ZALL (network index 23). The model is design.js defZombie 'fireman'; the oxygen tank is NOT part of the rig: FM.place puts a GUNS.fmTank mesh (a.fmM, a child of ch.grp, matrixAutoUpdate off) on the back plate (ch.uB[1] × the rest offset) or, while charging, across the chest at a fixed body offset (FM_TY 1.22 up, FM_TZ .56 forward, axis = the body's right) so the model and the hit volume agree on every page (the local player's own rig is never computed).
- Coat (damageActor wrapper, host/offline only): fmFire (o.fire, o.dot = the burn tick from nyw.js updBurn, salamander/bdc/rdc/gas/ladle, Balrog-XI fireballs = w balrog11 with nocap) and fmBlast (o.he, gl40) → ×0.5.
- Charge: FM.start (host/offline, via nySkill; useSkill's list now includes 'charge') → FM.begin on every page (CLIH fmc {i,y}; the owner page uses its own yaw). The page that moves the body (host for bots, the player's own page) drives it in an actorPhysics wrapper: kv = heading × FM.SPD (12.5) with mv 0 and cmd zeroed (the Aleph charge pattern), heading turns ≤ FM.TURN (2.2 rad/s) toward a.yaw (bots: toward their target, and a.yaw = heading). A wall (moved < 35 % of the intended step for > .06 s after .15 s) ends it with a .45 s stagger; frost ends it; FM.DUR 1.4 s otherwise. Early ends go owner → host {t:'fmx'} → everyone (fmx {i,w}).
- Rams (host): every charging fireman (puppets while they move > 6.5 m/s on the host's view, plus a .4 s grace after the host's timer: fmGr) checks humans within hw+hw+.55 in front and at its height: SCEN.pushHuman (heading × 13 + 3.2 sideways, up 4.6; remote humans get 'scp') and FM.knock (fmKd 1.1 s; CLIH fmkd {i,t,s,d}). Each human once per charge (fmHit).
- Knocked flat (a.fmKd, every page): game.js updateVisual draws it with the get-up pose (an.dead = a.kdP, reviving flag); the actorPhysics / actorWeapons wrappers hold the body still and stop the gun; Main.camera wrapper drops the eye 1.1 m, rolls it and hides the view model. deadDir 1 = thrown backwards (on its back), -1 = hit from behind.
- The tank while charging: a.xRay (5 spheres r .13 along the axis) is tested by weapons.js rayActors and nyw.js rayActorsX after the usual volumes; within 15 cm of this body's own non-head hit the tank wins (the hands sit in front of it). shotTrace passes tank:0/1; projectiles fall back to the impact point next to the tank (FM.near). A client claims with bit 32 (net.js netClaimHit, judged on its own view; HOSTH.h decodes tank) and shows only a tank flash. Host: FM.tankHurt (380 hp; blasts hurt the tank too while the body takes its half) → FM.breakTank: charge over, stagger 1 s, skillCD and a.fmTkT = FM.RE (18 s, no tank drawn), ESMK cloud r 4.6 for 7 s (its own epsm event), shooter +1 score, CLIH fmb {i,s}.
- Smoke outside the chapters: FM.update runs ESMK.update when !EP.on; NY.clear (round start) clears it. ai.js: human bots skip zombies hidden by a cloud (epHid) for every zombie when !EP.on and a cloud exists (chapters keep the epHide-only rule).
- Bots: ai.js zombie skills — charge on the rush with a clear, walkable straight line (B.straight) 3.5–12.5 m from the target and a tank on its back.
- First person (vm.js claws + gunart.js buildClaws): the fireman's arms are 'sl_fmcoat' sleeves with an 'fmRefl' cuff over 'zs_fireman' hands; m.fmTank (scale .6) shows while FM.vmK(a) (= a.fmP) > 0 and the hands blend to FM.VMH. Atlas: zs_fireman + sl_fmcoat in gunart's list, fmRefl painted by fireman.js (119 of 120 slots used).
- NET_VER '-r8'.

## v6.39.1 — spectating clicks
- G.deathCam counts down past 0 (camera: `if(G.deathCam>0)G.deathCam-=dt`), so the old `!G.deathCam` test on the left click (main.js) and the touch fire button (touch.js) never passed once the death cam ended. Main.specOn() = dead, not in the menu, deathCam <= 0 and the camera is actually spectating (permaDead, or a human down); nextSpec (and the scenario's SCEN.H override) steps from the one watched now (L.indexOf(G.spec)+1), not from a stored index, so a changed list cannot land on the same player again.

## v6.40 — JANUS-1 (janus.js) and the Crowbar Maverick (crowbar.js), last in the build
- JANUS-1 (pistol slot, id janus1): WPN.noRel + supOnly — mag 5, res 0, no reload. loadout's buyCheck/buy are wrapped so the menu's ammo hides supOnly guns and buying the one in hand is 'own'; fillAmmo is wrapped with a.jnLeft (the rounds it held last time it was in the hands, reset by NY.clear at a round start), so dropping it and taking another does not refill it. Supply crates / chapter ammo boxes refill as before.
- The grenades are projectiles ('jn' / 'jnb', nyProj hook) that burst through detonate 'gl' with their own numbers (weapons.js: n.R, n.dmg, n.kb, n.stag, n.up, n.jw, n.he, n.vol/n.rate/n.shk; n.hitN = zombies caught); the coffin, KHEPRI and TIAMAT hooks scale by n.dmg. JN numbers: 130 a normal grenade, 150 in the form, ×2.5 in G.mode 'scen', radius 4.8.
- State (per actor): jnH counts (owner page, normal blasts with hitN>0, one per blast), jnS signal 35 s, jnO opening 0.62 s, jnB form 5 s, jnC closing 0.55 s (visual). Right click = W.alt 'janus' → nyAlt hook. In the form fireGun swaps in JN.WB (proj 'jnb', noMag) for the player and for replays; actorWeapons is wrapped: the drum reads >=1 during the call, pc.fire is cleared so a held trigger refires, nextFire = 60/214. Putting it away ends the form; death / turning / NY.clear reset everything. Network: ['jn', id, 0|1|2] fx (netDoFx hook) → jnRemote; remote pages run the timers themselves.
- Bots: AI.rollLd 7 % janus1 as sidearm; with the signal and a zombie in B.seen within 28 m they draw it and open it; an equip wrapper keeps it in hand while opening / open (or signalled with a zombie in sight); AI.update wrapper fires it while open.
- Models: GUNS.janus1 is the first-person model (tags cyl/cg drum and its glow, bU/bD barrel shells, fL/fR fins, crest, eye, aux hammer, gl inlays, h1..h5 charge pips; piv JN_PIV), GUNS.janus1n / s / b the world models (ensureGun hook picks by state; gunGeo follows G.wid so drops use janus1n). One new atlas slot: jnGlow (the atlas is now full: 120 of 120).
- vmGun (gunart.js) builds a group for every tag now — the Balrog-XI pips, Thunderbolt coils and switch, Balrog-5 gauge and Winchester lever had been dropped from the first-person model since they were made.
- Crowbar Maverick (melee, id cbmav): dmg [80,210], rate [.55,1.15], range [2.55,2.45], cleave [2,1], blunt. The heavy (o.heavy with w cbmav) shocks: damageActor hook on the host / solo → cbShock (3 s, bosses 0.6 s) + netEv 'cbsh' → cbShockOn on every page. a.shockT: maxSpeed ×0.12, no jump (actorPhysics hook), no skill (actorWeapons hook), a firefighter's charge ends; sparks / crackle / blue tint (updateVisual hook) on every page; the shocked player gets #hud.shk. The striking page shows cbZapFx at once.
- Its first-person swings are knife-engine clips (vmknife knGrip/KN_ELB): forehand (side -1, first) / backhand (side 1) as offsets; the stab keys are camera-space poses turned into offsets (cbKey). One fist (kaHand); W.drKey 'drCb' picks its own draw keys (vm.js). Bots: AI.rollLd 6 % cbmav.

## v6.41 — THANATOS-9 (thanatos.js), the M4A1 Dark Knight (m4dk.js) and transcendence fragments, last in the build
- Atlas: GA.H 1920 → 2048 (16 rows, 128 slots; it was full at 120). New materials: thSteel (THANATOS blade steel), dkPlate (black lacquer with sparse gold scrollwork — no border in the tile, since faces sample it at random places), dkGlow (self-lit crimson).
- weapons.js: rayActors reports a zombie's arm as part 'arm' (every other consumer treats it as the body); shotTrace multiplies legs / arms by W.limbK when a gun has one (the Dark Knight: 50/90).
- THANATOS-9 (melee, id thanatos9; numbers in THN — TH is the team constant): the generic melee code never sees its buttons (actorWeapons wrapper clears cmd.fire/alt around the call, thInput runs them on the owner page). Left click in the scythe form = meleeSwing (light, 'm' fx) + meleePend → meleeStrike hook → thSweepHit: meleeHits with cone -1.01 (360°, LOS from the eye), pushed radially. State a.thS 0 scythe / 1 transforming (THN.ON 3 s) / 2 drill (kept across weapon swaps) / 3 barrage (THN.BAR 5 s, a strike every THN.BI at up to THN.BN in a cone of THN.BCOS within THN.BR; equip and playerDrop blocked; becomes 4 by itself) / 4 folding back (THN.OFF). Swapping away during 1 or 4 drops it to 0. Network: ['th', id, st] from the owner; other pages run timers and show the strikes under NET.ghost and wait for the owner's next state.
- Weak stagger: a damageActor hook (host / solo, only when the hit took something off) puts staggerT back and sets t.thSlow (×THN.SLOWK in maxSpeed); EFF_T got ['thSlow','ts'] and netApplyEff applies e.ts, so a zombie another page runs gets it. Deadshot doubles both attacks (hs + ds: the host's window check divides by W.hs = 2 when it fails).
- First person: the model's six plates (tags b0..b5, each the same bowed plate thPlate, placed along a circle through the hub top TH.C) turn about their crescent roots; VMX.thanatos9 poses everything from one timeline T (thT: 0 scythe .. 1 drill): the pivot (TH.TK camera-space keys → rest-relative quaternions, fdTrack), both fists (kaHand toward the keyed elbows), the plates (thPlatePose: off the crescent tip first into a fan round the hub, a full turn, folded forward into the drill; in the barrage the drill spins and the two sets of three thrust by turns), the core. Sweeps are katana-style pivot clips (thClip, TH_SW / TH_FX), the trail violet. World models th9w / th9wb swapped by ensureGun (T > .8); third person: Skull-9's sweep, KF.thB a looping thrust for the barrage (atkD .5, restarted every strike).
- THANATOS bots (AI.update wrapper): sweep in reach, ready the drill when nothing is within 12 m, start the barrage at THN.BR − .3 with a clear line and walk into the target through it. Sounds: B.am needs a gain node of its own — an envelope's gain already has ramps, setValueCurveAtTime over them throws and the whole sound is left unrendered (only a console warning at boot).
- M4A1 Dark Knight (rifle, id m4dk): 50 / 300, dmg 90, hs 150/90, limbK 50/90, 700 rpm (the engine's per-frame firing makes 600 at 60 fps). Right click = W.alt 'dk' → dkSet (['dk', id, 0|1] fx). In B fireGun swaps in DK.WB (rail + dkp): tbShot is wrapped so dkShot traces the line instead — up to DK.WALLS walls (×DK.WALLK), every zombie on it (dkLine: head, body, legs, arm, boss volumes, the firefighter's tank; ×DK.PK per one before), a crimson beam on TB.beams; the actorWeapons wrapper sets nextFire to DK.BRPM. Half zoom: Main.camera wrapper (FOV ×DK.FOV, like hskill.js). Equip away / turning / NY.clear end B. Remote 'f' replays use B while that player's dkB is on.
- Deadshot +DK.DS s for an owner (dkOwns: the account; accounts off: in hand; bots: carrying it; others: a.dkOwn). A client's {t:'hsk',k:'ds'} carries x when it owns one (netToHost wrapper), HOSTH.hsk stores it, netEv('hsk') passes x on, CLIH.hsk stores it for the others; HSK.start adds the second.
- Transcendence (schema.sql v6.41): profiles.trans_frags; gacha_config trans_frag_min/max (2/4, every decoder of every card, 'tfrags' per draw and in the answers), trans_cost 888, trans_guns '{m4dk}'; qz_trans_exchange(p_gun) (not_for_exchange / already_owned / not_enough_tfrags; gacha_log src 'trans'). gun_prices: thanatos9 15,000 sold, m4dk 0 not sold (qz_buy / qz_gift refuse it). Client: ACC.me.tfrags, ACC.transExchange, shop page 'tr' (SHOP.trPage), shopState 'trans', lock tag 「초월」; the mock does the same.
- NET_VER -r10.

## v6.42 — the admin page (admin.html: admin/admin.js + admin.css), server notices and bans in the game (srvnote.js), play time
- The admin page is a page of its own (build.py writes dist/admin.html and dist/standalone/admin.html; copy the standalone one to the repo root next to index.html; Vercel's cleanUrls serves it at /admin, <meta robots noindex>). Built from sb.js (the Supabase project: SB moved out of account.js so both pages share it) + GUN_NAMES / MAP_NAMES read out of the game's sources by regex (WPN entries' n:[ko,en] and kind; the MAPDEFS literal) + admin/admin.js + admin/admin.css + Galmuri11 subset to the page's own characters (inlined). No game code.
- It has no powers of its own: every call is a qz_admin_* function, each starts with qz_admin_uid() (raises not_admin unless auth.uid() is in public.admins). Admins are set only by hand in the SQL Editor (the line is in schema.sql's admin section; the page's "not an admin" screen shows it with the signed-in e-mail filled in). Its session is its own (localStorage qz_adm_ses, password or SB.oauth sign-in) so the game and the page never refresh one token at the same time.
- Views (hash routes): #/dash (qz_admin_dash: the scoreboard — online now = last_seen within 150 s, the Korean clock, bans —, today's players / sign-ups / time, three 14-day column charts with hover, focus and a table view, today's coins and decoders, the public rooms), #/players[/<id>] (qz_admin_users search + sorts, 50 a page; the player sheet: qz_admin_user, grant / take back coins · fragments · transcendence fragments · decoders (qz_admin_grant, never below 0, coins also on coin_log 'admin'), guns (qz_admin_gun), nickname (qz_admin_rename), ban 1/3/7/30 days or for good (qz_admin_ban: rooms and invites go; admins cannot be) / unban, play time, record, coin / decoder / admin logs), #/settings/prices (qz_admin_price / _reset: admin_set rows keep their price and shop flag when schema.sql runs again, file_price / file_sold keep the file's; tier and transcendence guns cannot be sold), #/settings/gacha (qz_admin_config: any gacha_config column by name, the value cast by jsonb_populate_record, checked as a whole row afterwards — min ≤ max, card sizes, the lines' format and guns, trans_guns exist), #/settings/missions (qz_admin_mission_save: mission_pool.edited rows are left alone by later runs, the win3 migration included), #/notices (qz_admin_notice_save / _delete, a preview in the lobby strip's look), #/logs (qz_admin_logs, 100 a page). Every action on a player needs a reason; the destructive ones ask first (the effect spelled out).
- Bans: profiles.banned_until ('infinity' = for good) / ban_reason. qz_guard(uid) starts every call that pays, sells, opens decoders, posts a room or reaches another player (26 functions + qz_set_nickname); reading (qz_me, missions, the friend list, messages) and qz_ping still work; qz_ranking leaves banned accounts out. qz_me carries admin and ban {until, forever, reason}. In the game: srvnote.js opens a window once per sign-in and tags the profile; errText('banned').
- Server notices: public.notices (info / warn / event, popup, starts_at, ends_at, active); qz_notices() for anyone (the lobby: the first as a strip under the top bar — on a phone too, where the notice list is hidden —, all at the head of the notice list, a popup one in a window once per browser: localStorage qz_ntc; the ban window comes first).
- Play time: qz_ping(p_play integer default 0, p_fresh boolean default false) — the old qz_ping() is dropped. The time since the last beat from any tab counts (≤ 150 s; a longer gap is a new stretch) into profiles.online_secs, p_play (the game's own count of seconds in a match, a 1 s sampler while the tab is in view, capped by that time) into play_secs, and both into daily_activity (Korean day × player: the daily player counts). friends.js: a beat every minute while in view, a keepalive one as the tab leaves view (ACC.beacon), a fresh one on coming back or signing in. ACC.ping falls back to no arguments on an older database.
- Tests: a local Postgres 16 cluster with a Supabase-like prelude (anon / authenticated roles, auth.users, auth.uid() from test.uid) runs schema.sql (fresh, upgrade from v6.41, re-run) and SQL checks as role authenticated; a small Python bridge (PostgREST-style rpc with named, typed arguments + password tokens) lets the harness drive admin.html (PAGE=admin.html) and the game (QZ_SB) against that database. play.py takes PAGE and VIEW=WxH (not committed).

## v6.43 — admin page part two: mail, coupons, suspects, taking rooms down, staff (the game: mailbox.js)
- Two admin roles: public.admins.role 'owner' (set by hand in the SQL Editor, as before) or 'staff' (added on #/staff by an owner: qz_admin_staff_add by e-mail / friend code / unique nickname — not a banned account —, qz_admin_staff_remove; owners cannot be removed there). qz_admin_owner() (raises owner_only) starts grant, gun, prices, price / price_reset, config_get / config, missions / mission_save, notices / notice_save / notice_delete, every mail and coupon function and the staff ones; staff keep the dashboard, players (no e-mails: qz_admin_users / _user leave them out and the search skips them), rename, ban / unban (never an admin), suspects, room close and the log. The page hides the owner menus for staff (nav, routes, the sheet's grant / guns / mail link) and tags the role.
- Mail: public.mails (title ≤ 60, body ≤ 500, rewards, to_all — the accounts there when it was sent —, for_new — accounts made later too —, expires_at, active) + mail_targets (to chosen players) + mail_claims (once per account). qz_rewards_clean(rw) is the one check for a reward bundle (coins ≤ 10,000,000, frags ≤ 100,000, tfrags ≤ 10,000, tickets / season_tickets ≤ 1,000, ≤ 10 guns that exist and are not free; whole numbers ≥ 0; bad_rewards / no_gun), qz_give(uid, rw, why, det) pays it (coins also on coin_log 'mail' / 'coupon' — outside the daily cap and the suspects lists; owned guns are skipped and reported as had). qz_mail_open(uid) = the letters an account can take now; qz_mails() / qz_mail_claim(p_id default null = all) for players (qz_guard); qz_me mail_new, qz_ping mail (the count). #/mail: write a letter (all players / chosen ones, one per line, who_not_found names the misses), the sent list with taken / reached counts and an on / off switch (qz_admin_mail_active).
- Coupons: public.coupons (code ^[A-Z0-9]{4,20}$ — typed codes are upper-cased and stripped of anything else —, rewards, max_uses, uses, starts_at, expires_at, active, note) + coupon_uses + coupon_fails (10 wrong codes in 10 minutes → coupon_slow). qz_coupon_redeem answers its refusals as {error: coupon_*} instead of raising, so a wrong code's coupon_fails row is kept. An empty code on #/mail/coupons makes a random 10-character one; a coupon's rewards are fixed once someone used it; qz_admin_coupon_uses lists who.
- Suspects (#/suspects/<kind>, qz_admin_suspects): cap (days near the 20,000 daily cap in 14 days, from coin_log match / round), kills / damage (the highest single match / round in 14 days, with the average), rate (coins per hour of match time, ≥ 1 h played), refs (referrers with many thin invitees in 30 days). Only lists: nothing is decided from them.
- Taking a public room down: qz_admin_room_close(p_code, p_minutes 10..10080, p_reason) deletes the row and puts the host in public.room_blocks (until); qz_room_up raises room_closed for a blocked host. net.js: ROOMS.shutT — the room goes on privately and is not posted again for 5 minutes (a note once).
- The game (mailbox.js, built last): a letter button in the account chip after the coins with the count; #mailWin lists the letters (rewards as chips: COIN / FRAG / TFRAG / ticket svg / gun icons), 받기 / 모두 받기, the coupon box at the bottom. A new letter (id above localStorage qz_mailSeen) opens it once in the lobby when no other window is open — server notices, the ban window and the new-content window go first; a MutationObserver on body's children asks again when one of those windows closes; qz_mails is asked only when the count changed, at most every 20 s. Not while banned (the claim says banned). PGRST202 → MBOX.off (an older database: no button).
- test/mock.js: __MOCK_MAILS [{id,title,body,rewards,expires_at}] and __MOCK_COUPONS {CODE: rewards}; qz_me mail_new, qz_ping mail.
- Tests: SQL (staff refusals, no e-mails for staff, mail to all / chosen / for_new / expired / off / once, coupons normalize / used / sold out / slow / off / rewards fixed after use, room close + block, suspects, staff add / remove rules; fresh, upgrade from v6.41 and v6.42, re-run), the admin page as owner and as staff (bridge), the game's mailbox against the bridge (notices first, auto-open, take all, coupons and their errors, a new letter by heartbeat, a phone width) and against the mock (ban), plus the solo-mode and notice regressions and the boot check.

## v6.44 — the survivors wear masks (design.js defHuman + models.js painters)
- No bare faces: 박재원 (guard) a black knit balaclava (skin material = knit, so the neck and the back of the head are knit too) under a riot helmet with a lowered ballistic visor in three panels (centre + two wings at ry ±.6, hinges and side arms on the helmet); 엘레나 (medic) a teal-grey neck gaiter pulled up to the goggles (face kind 'gaiter': hair above the hem, the strap round the sides), goggles, a white half-mask respirator (rsp + rspN nose bridge, two round filters at ry ±.45, a valve with a green cross), the ponytail kept; 메이슨 (soldier) a coyote shemagh (decor op 'check' on the head, the neck and a rounded 'wrap' part round the lower head, a hanging tail) and the goggles pulled down over the eyes; 서유나 (hazmat) an M50-style mask in the suit's hood (face kind 'm50': one wide lens that dips over the nose, the hood's rim), cheek filters at ry ±.55 and a voicemitter. Helmets were made deep and tall enough that the head never shows through (the medic's helmet front had the hair poking through). References: GSG 9 / KNP SOU visors and balaclavas, desert shemagh + goggles, the US M50 mask; the shapes and paint are our own.
- models.js: face kinds 'balaclava' / 'gaiter' / 'm50' (+ FACE_GA, the gloss a painted face starts with), decor ops 'line', 'disc', 'check', 'solid', 'grad'; parts may carry fr (fillet radius as a share of their thinnest side, rounder filters) and the human extras now keep d / rx / ry / rz; paintSkin looks for the densest atlas scale in 3% steps instead of 10% (guard and soldier 292 px/m with the new parts instead of falling to 270; brute 200 → 218, coffin 241 → 250, fireman 243 → 257).
- Everything that draws a survivor follows: the 3D models (players, bots), portraits (lobby, inventory, room slots), the chapter 4 mirage and LYREBIRD's disguises. First-person arms, stats and hitboxes are unchanged; skins keep their keys, so mixed versions in one room are fine.
- Checked with a mugshot rig (the menu demo frozen, the four rest-pose models in front of the menu camera, front / 3-4 / side / back) and live bots in a match (single frames drawn with the loop stopped: a full match frame is too slow for screenshots here), portraits at 30–150 px, the solo modes and the boot check.

## v6.45 — the survivors go by their units
- HSKIN_N (game.js): KNP SOU (guard, Korean National Police SOU), PJ (medic, USAF Pararescue), LEGION (soldier, French Foreign Legion), CBIRF (hazmat, USMC CBIRF) — the same English names in both languages. HSKIN_R: a short unit line under the name on the inventory cards (like a zombie's skill line); HSKIN_T: the longer "ex-… · role" line as the hover title on every character card (inventory, room setup, multiplayer). Lore: RT-2 is a recovery team drawn from special units around the world.
- Skin keys (guard / medic / soldier / hazmat) are unchanged: saved picks, multiplayer and the models are not touched. design.js comments use the new names. No unit emblems or logos anywhere; CS's own unit names (GSG-9, SAS, GIGN, SEAL) were avoided, SEAL also because the US Navy holds it as a trademark.

## v6.46 — every weapon that comes in shows on screen (gunpop.js)
- One window for weapons that arrive outside the shop and the decoders: #gunPop (the gun's picture at 52 px, its name and kind, where it came from, OK; above the mailbox at z 9600; Escape / OK / the backdrop close it; a match start removes it). GUNPOP.show(guns, src) — src {mail: title} / {coupon: code} / null (an admin). Friends' gifts keep their own window.
- An admin's direct grant (qz_admin_gun give) skips the mailbox, so the server keeps public.gun_notices (id, user_id, gun_id, src 'admin', at, seen; RLS on, no direct access); taking the gun back before it was seen deletes the notice. qz_me gun_new and the heartbeat's gun count say how many wait; GUNPOP.check (on account changes, a lobby build, and when a window in the way closes — the same MutationObserver idea as the mailbox) lists them with qz_gun_notices (newest first, 20), shows them in one window, marks them with qz_gun_seen(ids) (seen ones older than 30 days are deleted) and reloads qz_me so the shop and the inventory have the gun at once. It waits for the lobby with nothing else open (MBOX.busyUI, which now counts #gunPop; the new-content window waits for #gunPop and #mailWin).
- A letter or a coupon with a gun opens the window right when it is taken (MBOX.claim / MBOX.redeem, on top of the mailbox).
- Admin page: the reward editor's gun picker puts a gun in the moment it is picked (first line 「무기 넣기 — 고르면 바로 들어가요」, then back to it; the old separate button was easy to miss, so a gun picked but not added was left out of the letter); the player sheet says a direct grant skips the mailbox and opens the window in the game; its toast says so too.
- Fixed: the gift and invite windows used the round-result animation, whose translate(-50%) pushed a flex-centred box half its width to the left (new popIn keyframes).
- Tests: SQL (a notice on a grant, none twice, taking back removes an unseen one, qz_me / qz_ping counts, listing, seen by ids and all, another account's ids do nothing, the table closed, anon refused; fresh, upgrade, re-run), the game against the bridge (a grant while the mailbox is open waits and shows two guns when it closes, a letter with a gun, a coupon with a gun, owned guns updated), the admin page (pick to add, duplicates refused), the mock (notices on sign-in), the mailbox regression and the boot check.

## v6.47 — THANATOS-9's barrage lasts 3 s
- THN.BAR 5 → 3 (thanatos.js): the drill form's barrage is 3 s of strikes, one every THN.BI (0.1 s) as before, so THN.NMAX = 30 strikes (was 50). Damage per strike, reach, cone, the lock (no cancel, no weapon change) and the fold-back are unchanged.
- Everything that said 5 s now reads THN.BAR: the drill-ready note, the weapon tags (buy menu / inventory), the barrage sound (thbar: its length, the drone's hold, the scream and one chatter grain per strike all follow THN.BAR and THN.NMAX). The new-content window's text says 3 s.
