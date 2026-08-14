// Minimon - Main Game Loop (Enhanced with Battle Effects & QOL)
(function() {
"use strict";

const canvas = document.getElementById("gc");
const ctx = canvas.getContext("2d");
canvas.width = SCREEN_W; canvas.height = SCREEN_H;

function resize() {
  const s = Math.min(window.innerWidth / SCREEN_W, window.innerHeight / SCREEN_H);
  canvas.style.width = (SCREEN_W * s) + "px"; canvas.style.height = (SCREEN_H * s) + "px";
}
window.addEventListener("resize", resize); resize();

const R = new Renderer(ctx, SCREEN_W, SCREEN_H);

const S_TITLE="title", S_INTRO="intro", S_OW="overworld", S_BATTLE="battle",
S_PARTY="party", S_MOVES="moves", S_DIALOG="dialog", S_EVOLUTION="evolution",
S_SHOP="shop", S_GAMEOVER="gameover", S_VICTORY="victory", S_STARTER="choose_starter",
S_TM="tm_select", S_NAME="name_input", S_ENCOUNTER="encounter",
S_PAUSE="pause", S_BAG_CAT="bag_cat", S_PARTY_DETAIL="party_detail",
S_MAP="map_screen";

const FACING = ["down","left","up","right"];
const FACING_CYCLE = {down:"left",left:"up",up:"right",right:"down"};
const DPAD_CX=65, DPAD_CY=400, DPAD_R=32, DPAD_BS=26;

let state = S_TITLE, time = 0, cursor = 0, running = true;
let currentMap = null, dialogQueue = [], dialogCurrent = "", dialogSpeaker = "";
let pendingEvolution = null, pendingStarter = null, pendingTrainer = null, pendingGym = null;
let pendingHealer = false, pendingTrade = null, pendingMoveLearn = null, pendingTM = null;
let pendingNameInput = false;
let battleState = null, battlePhase = "select";
let shopCursor = 0;
let nameInput = "", nameCursor = 0;
let encounterTimer = 0, encounterData = null, encounterType = "wild";
const NAME_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
let pokedex = {};
let isSprinting = false;
let stepTimer = 0;
const STEP_DELAY_NORMAL = 0.15;
const STEP_DELAY_SPRINT = 0.08;
// Pause menu state
let bagTab = 0;
let partyDetailIdx = 0;
let partyMode = "select"; // "select" or "swap"
let pendingUseItem = null; // item being used from overworld bag
let pauseReturnState = S_OW;
let repelUsedInStarter = false; // Easter egg flag
let starterLegendaryOptions = [75, 76, 77]; // Default legendary starters
let bagReturnState = S_OW; // Track where to return from bag
let menuOpenTime = 0; // Relative time when menu was opened
function pokedexSee(dex) { if (!pokedex[dex]) pokedex[dex] = { seen: true, caught: false }; else pokedex[dex].seen = true; }
function pokedexCatch(dex) { pokedexSee(dex); if (pokedex[dex]) pokedex[dex].caught = true; }

// Auto-save timer
let autoSaveTimer = 0;
const AUTO_SAVE_INTERVAL = 180; // 3 minutes

function saveGame() {
  let mapIdx = 0;
  for (let i = 0; i < MAP_CREATORS.length; i++) {
    const m = MAP_CREATORS[i]();
    if (m.name === currentMap.name) { mapIdx = i; break; }
  }
  const data = {
    player: { x: player.x, y: player.y, facing: player.facing, name: player.name,
      party: player.party.map(c => ({ dex: c.dex, level: c.level, xp: c.xp, hp: c.hp, moves: c.moves, status: c.status,
        statStages: c.statStages, confusionTurns: c.confusionTurns })),
      money: player.money, badges: player.badges, storyFlags: player.storyFlags,
      rivalName: player.rivalName, rivalStarter: player.rivalStarter, starterChoice: player.starterChoice,
      inventory: player.inventory, stepCounter: player.stepCounter, playTime: player.playTime },
    mapIdx: mapIdx,
    pokedex: pokedex,
    defeatedTrainers: currentMap ? currentMap.npcs.filter(n => n.defeated).map(n => n.name) : []
  };
  try { localStorage.setItem("minimon_save", JSON.stringify(data)); return true; } catch(e) { return false; }
}

function loadGame() {
  try {
    const raw = localStorage.getItem("minimon_save");
    if (!raw) return false;
    const data = JSON.parse(raw);
    const p = data.player;
    player.x = p.x; player.y = p.y; player.facing = p.facing; player.name = p.name;
    player.money = p.money; player.badges = p.badges || []; player.storyFlags = p.storyFlags || {};
    player.rivalName = p.rivalName || "Luna"; player.rivalStarter = p.rivalStarter; player.starterChoice = p.starterChoice;
    player.inventory = p.inventory || {}; player.stepCounter = p.stepCounter || 0; player.playTime = p.playTime || 0;
    player.party = (p.party || []).map(c => {
      const bc = new BattleCreature(c.dex, c.level);
      bc.xp = c.xp; bc.hp = c.hp; bc.moves = c.moves; bc.status = c.status || null;
      bc.statStages = c.statStages || [0,0,0,0,0,0]; bc.confusionTurns = c.confusionTurns || 0;
      return bc;
    });
    pokedex = data.pokedex || {};
    currentMap = MAP_CREATORS[data.mapIdx || 0]();
    if (data.defeatedTrainers) {
      for (const npc of currentMap.npcs) {
        if (data.defeatedTrainers.includes(npc.name)) npc.defeated = true;
      }
    }
    return true;
  } catch(e) { return false; }
}

function deleteSave() { try { localStorage.removeItem("minimon_save"); } catch(e) {} }
window.tryHasSave = function() { try { return !!localStorage.getItem("minimon_save"); } catch(e) { return false; } };
window.getPokedex = function() { return pokedex; };
const tryHasSave = window.tryHasSave;
const SHOP_ITEMS = [
  I_POTION,I_SPOTION,I_HPOTION,
  I_FHEAL,
  I_SPHERE,I_GSPHERE,I_USPHERE,
  I_REVIVE,
  I_XATK,I_XDEF,
  I_REPEL,
  I_TM_EMBER,I_TM_WGUN,I_TM_VWHIP,I_TM_TSHOCK,I_TM_ISHARD,I_TM_BITE,I_TM_SBALL,I_TM_DCLAW,I_TMSEDGE,
  I_TM_ASLASH,I_TM_DGLEAM,I_TM_FLAMET,I_TM_HYDROP,I_TM_SOLBEAM,I_TM_THUND,I_TM_BLIZZ,I_TM_EQUAKE,
  I_TM_CRUNCH,I_TM_RECOVER,I_TM_SDANCE
];

const player = {
  x:10, y:10, facing:"down", name:"Hero", party:[], money:3000, badges:[], storyFlags:{},
  rivalName:"Luna", rivalStarter:null, starterChoice:null, stepCounter:0, playTime:0,
  inventory:{[I_POTION]:5,[I_SPHERE]:10,[I_GSPHERE]:0,[I_USPHERE]:0,[I_MSPHERE]:0,
    [I_FHEAL]:1,[I_REVIVE]:0,[I_XATK]:0,[I_XDEF]:0}
};
function hasItem(it){return(player.inventory[it]||0)>0;}
function addItem(it,n){player.inventory[it]=(player.inventory[it]||0)+(n||1);}
function removeItem(it,n){if((player.inventory[it]||0)>=(n||1)){player.inventory[it]-=(n||1);return true;}return false;}
function addCreature(c){if(player.party.length<6){player.party.push(c);return true;}return false;}
function aliveParty(){return player.party.filter(c=>c.isAlive());}
function bestSphere(){if(hasItem(I_MSPHERE))return[I_MSPHERE,SPHERE_MASTER];if(hasItem(I_USPHERE))return[I_USPHERE,SPHERE_ULTRA];if(hasItem(I_GSPHERE))return[I_GSPHERE,SPHERE_GREAT];if(hasItem(I_SPHERE))return[I_SPHERE,SPHERE_NORMAL];return[null,0];}

// Bag tab definitions
const BAG_TABS = [
  { name: "Medicine", items: ["Potion","Super Potion","Hyper Potion","Full Heal","Revive","Full Revive"] },
  { name: "Spheres", items: ["Soul Sphere","Great Sphere","Ultra Sphere","Master Sphere"] },
  { name: "TMs", items: ALL_TM },
  { name: "Battle", items: ["X Attack","X Defense"] }
];
function getBagItems(tabIdx) {
  const tab = BAG_TABS[tabIdx];
  if (!tab) return [];
  return tab.items.filter(name => (player.inventory[name] || 0) > 0);
}
function useOverworldItem(itemName) {
  // Easter egg: Repel during starter selection transforms starters into legendaries
  if (itemName === I_REPEL && state === S_STARTER) {
    repelUsedInStarter = true;
    pendingStarter = starterLegendaryOptions;
    removeItem(itemName);
    state = S_STARTER; cursor = 0;
    return null; // will re-render starter with legendary options
  }
  if ([I_POTION,I_SPOTION,I_HPOTION].includes(itemName)) {
    if (!player.party.length) return "No Minis to heal!";
    const amt = { [I_POTION]:20, [I_SPOTION]:60, [I_HPOTION]:200 }[itemName];
    const injured = player.party.filter(c => c.hp < c.maxHP && c.isAlive());
    if (!injured.length) return "All Minis are at full health!";
    pendingUseItem = itemName;
    partyMode = "use";
    return null; // needs target selection
  }
  if (itemName === I_FHEAL) {
    const statused = player.party.filter(c => c.status);
    if (!statused.length) return "No Minis with status conditions!";
    for (const c of player.party) { c.status = null; c.confusionTurns = 0; }
    removeItem(itemName);
    return "All status conditions cured!";
  }
  if ([I_REVIVE,I_FREVIVE].includes(itemName)) {
    const fainted = player.party.filter(c => !c.isAlive());
    if (!fainted.length) return "No fainted Minis!";
    pendingUseItem = itemName;
    partyMode = "use";
    return null; // needs target selection
  }
  if ([I_XATK,I_XDEF].includes(itemName)) return "X items can only be used in battle!";
  if ([I_SPHERE,I_GSPHERE,I_USPHERE,I_MSPHERE].includes(itemName)) return "Spheres can only be used in battle!";
  if (ALL_TM.includes(itemName)) { pendingTM = { itemName: itemName }; useTM(itemName); return null; }
  return "Can't use this here!";
}
function applyOverworldItem(itemName, target) {
  if ([I_POTION,I_SPOTION,I_HPOTION].includes(itemName)) {
    const amt = { [I_POTION]:20, [I_SPOTION]:60, [I_HPOTION]:200 }[itemName];
    if (removeItem(itemName)) { target.heal(amt); return "Used " + itemName + " on " + target.name + "! Healed " + amt + " HP!"; }
  }
  if ([I_REVIVE,I_FREVIVE].includes(itemName)) {
    const hp = itemName === I_REVIVE ? 1 : target.maxHP;
    if (removeItem(itemName)) { target.hp = hp; return target.name + " was revived!"; }
  }
  return "Failed!";
}

// === STATE HANDLERS ===
function formatDialog(text) { return String(text).replace(/\{name\}/g, player.name || "Hero"); }
function setDialog(msgs, speaker) { dialogQueue = msgs.slice().map(formatDialog); dialogSpeaker = speaker || ""; nextDialog(); }
function nextDialog() {
  if (dialogQueue.length) { dialogCurrent = dialogQueue.shift(); return; }
  if (pendingNameInput) { pendingNameInput = false; state = S_NAME; nameInput = ""; nameCursor = 0; return; }
  if (pendingStarter) { state = S_STARTER; cursor = 0; return; }
  if (pendingTrainer) { const npc = pendingTrainer; pendingTrainer = null; if (npc.type === "rival") startRivalBattle(npc); else startTrainerBattle(npc); return; }
  if (pendingGym) { const npc = pendingGym; pendingGym = null; startGymBattle(npc); return; }
  if (pendingHealer) { pendingHealer = false; healParty(); return; }
  if (pendingTrade) { const npc = pendingTrade; pendingTrade = null; executeTrade(npc); return; }
  if (pendingMoveLearn) { handleMoveLearn(); return; }
  pendingEvolution = null;
  state = S_OW;
}
function advanceDialog() {
  if (dialogQueue.length) { dialogCurrent = dialogQueue.shift(); return; }
  if (pendingNameInput) { pendingNameInput = false; state = S_NAME; nameInput = ""; nameCursor = 0; return; }
  if (pendingStarter) { state = S_STARTER; cursor = 0; return; }
  if (pendingTrainer) { const npc = pendingTrainer; pendingTrainer = null; if (npc.type === "rival") startRivalBattle(npc); else startTrainerBattle(npc); return; }
  if (pendingGym) { const npc = pendingGym; pendingGym = null; startGymBattle(npc); return; }
  if (pendingHealer) { pendingHealer = false; healParty(); return; }
  if (pendingTrade) { const npc = pendingTrade; pendingTrade = null; executeTrade(npc); return; }
  if (pendingMoveLearn) { handleMoveLearn(); return; }
  state = S_OW;
}

function healParty() {
  for (const c of player.party) { c.hp = c.maxHP; c.status = null; c.confusionTurns = 0; }
  state = S_DIALOG;
  setDialog(["Your team has been fully healed!"]);
}

function movePlayer(dx, dy, facing) {
  player.facing = facing;
  const nx = player.x + dx, ny = player.y + dy;
  if (currentMap && walkable(currentMap, nx, ny)) {
    player.x = nx; player.y = ny; player.stepCounter++;
    const tile = getT(currentMap, nx, ny);
    if (tile === TILE_DOOR) {
      for (const d of currentMap.doors) { if (d.x === nx && d.y === ny) { changeMap(d.dest, d.destX, d.destY); return; } }
    }
    if (tile === TILE_HEAL) healParty();
    if (encTile(currentMap, nx, ny)) {
      const enc = getEnc(currentMap);
      if (enc) startWildBattle(enc[0], enc[1]);
    }
  }
}

function changeMap(idx, x, y) {
  if (idx >= 0 && idx < MAP_COUNT) {
    R.triggerMapTransition();
    currentMap = MAP_CREATORS[idx](); player.x = x; player.y = y;
  }
}

function getInteractableInfo() {
  if (!currentMap) return null;
  let fx = player.x, fy = player.y;
  if (player.facing === "up") fy--; else if (player.facing === "down") fy++;
  else if (player.facing === "left") fx--; else if (player.facing === "right") fx++;
  for (const npc of currentMap.npcs) if (npc.x === fx && npc.y === fy) return { type: "npc", x: fx, y: fy };
  for (const s of currentMap.signs) if (s.x === fx && s.y === fy) return { type: "sign", x: fx, y: fy };
  if (INTERACTABLE.has(getT(currentMap, fx, fy))) return { type: "tile", x: fx, y: fy };
  return null;
}

function interact() {
  if (!currentMap) return;
  let fx = player.x, fy = player.y;
  if (player.facing === "up") fy--; else if (player.facing === "down") fy++;
  else if (player.facing === "left") fx--; else if (player.facing === "right") fx++;
  for (const npc of currentMap.npcs) { if (npc.x === fx && npc.y === fy) { interactNPC(npc); return; } }
  for (const s of currentMap.signs) { if (s.x === fx && s.y === fy) { state = S_DIALOG; setDialog([s.text]); return; } }
  const tile = getT(currentMap, fx, fy);
  if (tile === TILE_GYM) { for (const npc of currentMap.npcs) if (npc.type === "gym_leader" && !npc.defeated) { startGymBattle(npc); return; } }
  if (tile === TILE_SHOP) { state = S_SHOP; shopCursor = 0; return; }
  if (tile === TILE_HEAL) { for (const npc of currentMap.npcs) if (npc.type === "healer") { interactNPC(npc); return; } }
}

function interactNPC(npc) {
  state = S_DIALOG;
  if (["trainer","rival","gym_leader"].includes(npc.type) && !npc.defeated) {
    setDialog(npc.dialog, npc.name);
    if (npc.type === "gym_leader") pendingGym = npc; else pendingTrainer = npc;
    return;
  }
  // Rematch system - after defeating Elite Four, trainers can be rematched with stronger teams
  if (["trainer","gym_leader"].includes(npc.type) && npc.defeated && npc.rematchParty && player.badges.length >= 8) {
    setDialog(npc.rematchDialog || ["Let's battle again!"], npc.name);
    pendingTrainer = npc;
    npc.isRematch = true;
    return;
  }
  if (npc.type === "healer") { setDialog(npc.dialog || ["Let me heal your Minis!"], npc.name); pendingHealer = true; return; }
  if (npc.type === "item_giver") {
    if (npc.gave_item) { setDialog(["Thanks for taking the " + npc.give_item + "!"], npc.name); return; }
    const msgs = [...(npc.dialog || ["I have something for you!"])];
    if (npc.give_item) { addItem(npc.give_item, npc.give_count || 1); npc.gave_item = true; msgs.push("Received " + npc.give_item + " x" + (npc.give_count || 1) + "!"); }
    setDialog(msgs, npc.name); return;
  }
  if (npc.type === "trade_npc") {
    if (npc.traded) { setDialog(["Thanks for the trade!"], npc.name); return; }
    const want = npc.trade_want_type;
    const has = player.party.some(c => c.types.includes(want));
    if (has) { setDialog(npc.dialog || ["Want to trade?"], npc.name); pendingTrade = npc; }
    else { setDialog(["I'm looking for a " + want + " type Mini to trade!"], npc.name); }
    return;
  }
  setDialog(npc.dialog || ["..."], npc.name);
}

function executeTrade(npc) {
  const want = npc.trade_want_type;
  for (let i = 0; i < player.party.length; i++) {
    if (player.party[i].types.includes(want)) {
      const old = player.party[i].name;
      player.party[i] = new BattleCreature(npc.give_dex, player.party[i].level);
      npc.traded = true;
      setDialog(["Traded " + old + " for " + npc.give_name + "!"]); return;
    }
  }
  setDialog(["You don't have a " + want + " type Mini to trade!"]);
}

// Battle start functions
function beginBattleTransition(type, data) {
  encounterType = type;
  encounterData = data;
  encounterTimer = 0;
  state = S_ENCOUNTER;
}
function finishBattleTransition() {
  const type = encounterType;
  const data = encounterData;
  encounterData = null;
  if (type === "wild") {
    const wild = new BattleCreature(data.dex, data.lv, null, true);
    pokedexSee(data.dex);
    if (!aliveParty().length) { state = S_GAMEOVER; return; }
    battleState = new BattleState(aliveParty(), [wild], false, "", true, true);
    state = S_BATTLE; battlePhase = "menu"; cursor = 0;
    battleState.addMsg("A wild " + wild.name + " appeared!");
    battleState.addMsg("Go, " + battleState.player.name + "!");
  } else if (type === "trainer") {
    const npc = data;
    let party;
    if (npc.isRematch && npc.rematchParty) {
      party = npc.rematchParty.map(([d, l]) => { pokedexSee(d); return new BattleCreature(d, l); });
    } else {
      party = npc.party.map(([d, l]) => { pokedexSee(d); return new BattleCreature(d, l); });
    }
    if (!aliveParty().length) { state = S_GAMEOVER; return; }
    battleState = new BattleState(aliveParty(), party, true, npc.name, false, false, npc.type === "gym_leader");
    if (npc.aiLevel !== undefined) battleState.aiLevel = npc.aiLevel;
    state = S_BATTLE; battlePhase = "menu"; cursor = 0;
    battleState.addMsg((npc.isRematch ? npc.name + " wants a rematch!" : npc.name + " wants to battle!"));
    battleState.addMsg(npc.name + " sent out " + party[0].name + "!");
    battleState.addMsg("Go, " + battleState.player.name + "!");
  } else if (type === "rival") {
    const npc = data;
    const badgeCount = player.badges.length;
    const baseLv = npc.rival_enc === 1 ? 14 : 20;
    const lv = baseLv + badgeCount * 3;
    const party = [new BattleCreature(player.rivalStarter, lv)];
    if (badgeCount >= 4) party.push(new BattleCreature(npc.rival_enc === 1 ? 13 : 49, lv - 2));
    if (badgeCount >= 6) party.push(new BattleCreature(npc.rival_enc === 1 ? 23 : 39, lv - 4));
    if (!aliveParty().length) { state = S_GAMEOVER; return; }
    battleState = new BattleState(aliveParty(), party, true, npc.name, false, false);
    battleState.aiLevel = AI_GYM;
    state = S_BATTLE; battlePhase = "menu"; cursor = 0;
    battleState.message = "Rival " + npc.name + " wants to battle!";
  } else if (type === "gym") {
    const npc = data;
    const party = npc.party.map(([d, l]) => new BattleCreature(d, l));
    if (!aliveParty().length) { state = S_GAMEOVER; return; }
    battleState = new BattleState(aliveParty(), party, true, npc.name, false, false, true);
    if (npc.aiLevel !== undefined) battleState.aiLevel = npc.aiLevel;
    state = S_BATTLE; battlePhase = "menu"; cursor = 0;
    battleState.addMsg("Gym Leader " + npc.name + " wants to battle!");
    battleState.addMsg(npc.name + " sent out " + party[0].name + "!");
    battleState.addMsg("Go, " + battleState.player.name + "!");
  } else if (type === "legendary") {
    const dex = data.dex, lv = data.lv || 50;
    const wild = new BattleCreature(dex, lv, null, true);
    pokedexSee(dex);
    if (!aliveParty().length) { state = S_GAMEOVER; return; }
    battleState = new BattleState(aliveParty(), [wild], false, "", false, true);
    state = S_BATTLE; battlePhase = "menu"; cursor = 0;
    battleState.message = "A legendary " + wild.name + " appeared!";
    battleState.isLegendary = true;
    // Trigger dramatic legendary entrance
    R.triggerLegendaryIntro();
  }
}
function startTrainerBattle(npc) { beginBattleTransition("trainer", npc); }
function startRivalBattle(npc) { beginBattleTransition("rival", npc); }
function startGymBattle(npc) { beginBattleTransition("gym", npc); }
function startWildBattle(dex, lv) { beginBattleTransition("wild", { dex, lv }); }

// Battle action handlers
function selectBattleAction() {
  const actions = ["Fight","Bag","Party","Run"];
  const action = actions[cursor];
  if (action === "Fight") { battlePhase = "moves"; cursor = 0; }
  else if (action === "Bag") { battlePhase = "bag"; cursor = 0; }
  else if (action === "Party") { battlePhase = "party"; cursor = 0; }
  else if (action === "Run") {
    if (battleState.canEscape) { battleState.fled = true; battleState.battleOver = true; battleState.message = "Got away safely!"; battlePhase = "message"; }
    else { battleState.addMsg("Can't escape!"); battlePhase = "message"; }
  }
}

function useBattleMove() {
  const p = battleState.player; const mv = p.moves[cursor];
  if (mv.pp <= 0) { battleState.addMsg("No PP left!"); battlePhase = "message"; return; }
  const e = battleState.enemy;
  const eX = 370, eY = 130; // enemy position for effects
  const pX = 90, pY = 220; // player position for effects
  // Store which move was used for effects
  const moveData = MOVES[mv.id];
  battleState._lastMoveType = moveData ? moveData.type : null;
  battleState._lastTarget = "enemy";
  battleState.executeTurn(cursor);
  // Trigger effects based on result
  if (moveData && moveData.category !== STATUS) {
    const eff = typeEff(moveData.type, e.types);
    const lastEffect = battleState.messageQueue.length > 0 ? battleState.messageQueue[battleState.messageQueue.length - 1] : "";
    const isCrit = lastEffect.includes("Critical") || (battleState._lastEffect && battleState._lastEffect.includes("critical"));
    R.triggerAttackFX(moveData.type, eX, eY, isCrit, eff);
    R.addDamageNum(eX, eY - 20, "", eff > 1 ? "super_effective" : (eff < 1 ? "not_effective" : "normal"));
    if (isCrit) { R.triggerFreeze(5); R.triggerCriticalHitText(); }
    if (eff > 1) { R.triggerCombo(); }
    else { R.comboCount = 0; }
  }
  if (!battleState.enemy.isAlive()) {
    R.triggerShake(8, 0.3);
    R.addParticles(eX, eY, "hit", 15);
    if (!battleState.nextEnemy()) {
      battleState.playerWon = true; battleState.battleOver = true;
      battleState.addMsg("You defeated " + battleState.trainerName + "!");
      if (battleState.isTrainer) {
        for (const npc of currentMap.npcs) {
          if (npc.name === battleState.trainerName) {
            npc.defeated = true;
            const reward = npc.isRematch ? Math.floor((npc.reward || 3000) * 1.5) : (npc.reward || 0);
            if (reward) { player.money += reward; battleState.addMsg("Got $" + reward + "!"); }
            if (npc.badge && !player.badges.includes(npc.badge)) {
              player.badges.push(npc.badge); battleState.addMsg("Got " + npc.badge + "!");
            }
            if (npc.isRematch) {
              battleState.addMsg("You won the rematch!");
            }
          }
        }
      }
    }
  } else if (!battleState.player.isAlive()) {
    R.triggerShake(8, 0.3);
    if (!battleState.nextPlayer()) { battleState.playerWon = false; battleState.battleOver = true; battleState.addMsg("No more Minis!"); }
    else battleState.addMsg("Go, " + battleState.player.name + "!");
  }
  battlePhase = "message";
}

function switchBattleCreature() {
  const target = player.party[cursor];
  if (!target.isAlive()) { battleState.addMsg(target.name + " can't fight!"); battlePhase = "message"; return; }
  if (target === battleState.player) { battleState.addMsg(target.name + " is already out!"); battlePhase = "message"; return; }
  const old = battleState.player.name;
  battleState.playerIdx = cursor;
  battleState.addMsg(old + ", come back! Go, " + target.name + "!");
  // Enemy attacks after switch
  const e = battleState.enemy;
  if (e && e.isAlive() && battleState.player && battleState.player.isAlive()) {
    const eMV = getAIMove(e, battleState.player, battleState.aiLevel !== undefined ? battleState.aiLevel : (battleState.isTrainer ? AI_TRAINER : AI_WILD));
    const eMD = MOVES[eMV.id];
    if (eMD && eMD.category !== STATUS) {
      const [damage, effect] = calcDamage(e, battleState.player, eMD);
      battleState.player.takeDamage(damage);
      if (eMV.pp > 0) eMV.pp--;
      battleState.addMsg(e.name + " used " + eMD.name + "!");
      if (effect === "super_effective") battleState.addMsg("It's super effective!");
      else if (effect === "not_effective") battleState.addMsg("It's not very effective...");
      else if (effect === "no_effect") battleState.addMsg("It had no effect!");
      if (effect && effect.includes("critical")) battleState.addMsg("Critical hit!");
      // Enemy attack effects
      const eff = typeEff(eMD.type, battleState.player.types);
      R.triggerAttackFX(eMD.type, 90, 220, false, eff);
      if (!battleState.player.isAlive()) battleState.addMsg(battleState.player.name + " fainted!");
    } else if (eMD) {
      applyStatus(e, battleState.player, eMD);
      if (eMV.pp > 0) eMV.pp--;
      battleState.addMsg(e.name + " used " + eMD.name + "!");
    }
  }
  battlePhase = "message";
}

function useBattleItem() {
  const items = Object.entries(player.inventory).filter(([k, v]) => v > 0 && [I_POTION,I_SPOTION,I_HPOTION,I_FHEAL,I_SPHERE,I_GSPHERE,I_USPHERE,I_MSPHERE,I_REVIVE,I_FREVIVE].includes(k));
  if (cursor >= items.length) return;
  const [name] = items[cursor];
  if ([I_POTION,I_SPOTION,I_HPOTION].includes(name)) {
    const amt = { [I_POTION]:20, [I_SPOTION]:60, [I_HPOTION]:200 }[name];
    if (removeItem(name)) {
      battleState.player.heal(amt);
      battleState.addMsg("Used " + name + "! Healed " + amt + " HP!");
      R.addParticles(90, 220, "light", 8);
      R.addDamageNum(90, 200, "+" + amt, "heal");
    }
  } else if (name === I_FHEAL) {
    if (removeItem(name)) { battleState.player.status = null; battleState.player.confusionTurns = 0; battleState.addMsg("Status healed!"); }
  } else if ([I_SPHERE,I_GSPHERE,I_USPHERE,I_MSPHERE].includes(name)) {
    const sphereName = { [I_SPHERE]:"Soul Sphere", [I_GSPHERE]:"Great Sphere", [I_USPHERE]:"Ultra Sphere", [I_MSPHERE]:"Master Sphere" }[name];
    const mult = { [I_SPHERE]:1, [I_GSPHERE]:1.5, [I_USPHERE]:2, [I_MSPHERE]:255 }[name];
    if (removeItem(name)) {
      battleState.addMsg("You threw a " + sphereName + "!");
      const [caught, shakes] = attemptCatch(battleState.enemy, mult);
      // Trigger capture shake animation
      R.triggerCaptureShake(shakes, function() {
        R.triggerFlash([255, 255, 100], 0.4);
        if (caught) {
          R.triggerConfetti();
          if (player.party.length >= 6) {
            battleState.addMsg("Gotcha! But your team is full! " + battleState.enemy.name + " got away!");
            if (!battleState.nextEnemy()) { battleState.playerWon = true; battleState.battleOver = true; }
          } else {
            battleState.addMsg("Gotcha! " + battleState.enemy.name + " was caught!");
            const c = new BattleCreature(battleState.enemy.dex, battleState.enemy.level);
            pokedexCatch(battleState.enemy.dex);
            addCreature(c);
            if (!battleState.nextEnemy()) { battleState.playerWon = true; battleState.battleOver = true; }
          }
        } else battleState.addMsg("Oh no! It broke free!");
      });
    }
  } else if ([I_REVIVE,I_FREVIVE].includes(name)) {
    const fainted = player.party.filter(c => !c.isAlive() && c !== battleState.player);
    if (fainted.length) { const hp = name === I_REVIVE ? 1 : fainted[0].maxHP; if (removeItem(name)) { fainted[0].hp = hp; battleState.addMsg(fainted[0].name + " revived!"); R.addParticles(90, 220, "light", 10); } }
    else battleState.addMsg("No fainted Minis!");
  } else if (name === I_XATK) {
    if (removeItem(name)) { battleState.player.statStages[1] = Math.min(6, battleState.player.statStages[1] + 1); battleState.addMsg(battleState.player.name + "'s ATK rose!"); R.triggerFlash([255, 100, 100], 0.2); }
  } else if (name === I_XDEF) {
    if (removeItem(name)) { battleState.player.statStages[2] = Math.min(6, battleState.player.statStages[2] + 1); battleState.addMsg(battleState.player.name + "'s DEF rose!"); R.triggerFlash([100, 100, 255], 0.2); }
  }
  battlePhase = "message";
}

function nextBattleMsg() {
  const msg = battleState.getNextMsg();
  if (msg) { battleState.message = msg; return; }
  if (battleState.battleOver) {
    if (battleState.fled) state = S_OW;
    else if (battleState.playerWon) { checkEvolution(); if (state !== S_EVOLUTION && state !== S_MOVES && state !== S_DIALOG) state = S_OW; }
    else state = S_GAMEOVER;
  } else { battlePhase = "menu"; cursor = 0; }
}

function checkEvolution() {
  for (const c of player.party) {
    if (c.pendingMoves && c.pendingMoves.length) {
      const nm = c.pendingMoves.shift(); const m = MOVES[nm.id]; if (!m) continue;
      if (c.moves.length >= 4) { pendingMoveLearn = { creature: c, newMove: nm }; state = S_MOVES; cursor = 0; }
      else { c.moves.push(nm); state = S_DIALOG; setDialog([c.name + " learned " + m.name + "!"]); }
      return;
    }
  }
  for (const c of player.party) {
    if (c.canEvolve()) {
      const [od, nd] = c.evolve();
      pendingEvolution = [od, nd];
      R.triggerConfetti();
      R.triggerLevelUp(240, 240);
      setDialog([CREATURES[od].name + " is evolving!", CREATURES[od].name + " evolved into " + CREATURES[nd].name + "!"]);
      state = S_EVOLUTION; return;
    }
  }
}

function handleMoveLearn() {
  if (!pendingMoveLearn) return;
  const { creature, newMove } = pendingMoveLearn;
  const md = MOVES[newMove.id];
  if (creature.moves.length < 4) { creature.moves.push(newMove); pendingMoveLearn = null; setDialog([creature.name + " learned " + md.name + "!"]); return; }
  state = S_MOVES; cursor = 0;
}

function confirmName() {
  player.name = nameInput || "Hero";
  repelUsedInStarter = false;
  setDialog([
    "Well then, " + player.name + "! Your adventure begins now!",
    "Your neighbor Luna has also just received a partner Mini.",
    "Now, choose your very first Mini wisely!",
    "It will be your trusted partner on this journey!"
  ]);
  pendingStarter = [1, 2, 3];
  state = S_DIALOG;
}

function chooseStarter() {
  let dex = pendingStarter[cursor];
  let starterName = CREATURES[dex] ? CREATURES[dex].name : "Mini";
  let starterLevel = repelUsedInStarter ? 10 : 5;
  const starter = new BattleCreature(dex, starterLevel);
  addCreature(starter);
  player.starterChoice = dex; player.storyFlags[FLAG_STARTER] = true;
  const starterAdvantage = { 1: 3, 2: 1, 3: 2 };
  player.rivalStarter = starterAdvantage[dex] || pendingStarter[(cursor + 1) % 3];
  pendingStarter = null;
  addItem(I_SPHERE, 5);
  addItem(I_POTION, 2);
  addItem(I_FHEAL, 1);
  let dialogLines = [];
  if (repelUsedInStarter) {
    dialogLines.push("The Repel transformed the Minis into legendary beings!");
    dialogLines.push("You chose " + starterName + " (Legendary)!");
    dialogLines.push("Professor Sage gave you 5 Soul Spheres and 2 Potions!");
    dialogLines.push("You also got 1 Full Heal for emergencies!");
    dialogLines.push("This legendary Mini will grow stronger than any normal one!");
    dialogLines.push("Luna is waiting for you on Route 1...");
  } else {
    dialogLines.push("You chose " + starterName + "!");
    dialogLines.push("Professor Sage gave you 5 Soul Spheres and 2 Potions!");
    dialogLines.push("You also got 1 Full Heal for emergencies!");
    dialogLines.push("Now go out there and catch some Minis!");
    dialogLines.push("Remember - weaken them first, then throw a Sphere!");
    dialogLines.push("Luna is waiting for you on Route 1...");
  }
  setDialog(dialogLines);
  state = S_DIALOG;
}

function useTM(itemName) {
  const tmMove = TM_MOVES[itemName]; const compat = TM_COMPAT[itemName] || [];
  if (!tmMove) { state = S_DIALOG; setDialog(["This TM is invalid!"]); return; }
  const compatible = player.party.filter(c => c.types.some(t => compat.includes(t)));
  if (!compatible.length) { state = S_DIALOG; setDialog(["No Minis can learn this move!"]); return; }
  pendingTM = { itemName, compatible };
  state = S_TM; cursor = 0;
}

function selectTMCreature() {
  if (!pendingTM) return;
  const { itemName, compatible } = pendingTM;
  const tmMove = TM_MOVES[itemName];
  if (cursor >= compatible.length) return;
  const creature = compatible[cursor];
  const nm = { id: tmMove, pp: MOVES[tmMove].maxPP, maxPP: MOVES[tmMove].maxPP };
  if (creature.moves.length >= 4) {
    pendingMoveLearn = { creature, newMove: nm };
    pendingTM = null;
    state = S_MOVES; cursor = 0;
  } else {
    creature.moves.push(nm);
    pendingTM = null;
    removeItem(itemName);
    setDialog([creature.name + " learned " + MOVES[tmMove].name + "!"]);
    state = S_DIALOG;
  }
}

// Menu handlers
function selectPauseMenu() {
  const opts = ["Party","Bag","Minidex","Save","Load","Map","Close"];
  const choice = opts[cursor];
  if (choice === "Party") { state = S_PARTY; cursor = 0; partyMode = "select"; }
  else if (choice === "Bag") { bagReturnState = S_PAUSE; state = S_BAG_CAT; bagTab = 0; cursor = BAG_TABS.length; }
  else if (choice === "Save") { state = S_DIALOG; if (saveGame()) setDialog(["Game saved!"]); else setDialog(["Save failed!"]); }
  else if (choice === "Load") { if (loadGame()) { state = S_DIALOG; setDialog(["Game loaded!"]); } else { state = S_DIALOG; setDialog(["No save found!"]); } }
  else if (choice === "Minidex") { state = "pokedex"; cursor = 0; }
  else if (choice === "Map") { state = S_MAP; cursor = 0; }
  else if (choice === "Close") { state = S_OW; }
}

function selectParty() {
  if (cursor < player.party.length) {
    partyDetailIdx = cursor;
    state = S_PARTY_DETAIL; cursor = 0;
  }
}

function useItem() {
  const items = Object.entries(player.inventory).filter(([, v]) => v > 0);
  if (cursor >= items.length) return;
  const [name] = items[cursor];
  if ([I_POTION,I_SPOTION,I_HPOTION].includes(name)) {
    if (player.party.length) {
      const amt = { [I_POTION]:20, [I_SPOTION]:60, [I_HPOTION]:200 }[name];
      for (const c of player.party) {
        if (c.hp < c.maxHP) {
          if (removeItem(name)) { c.heal(amt); setDialog(["Used " + name + " on " + c.name + "! Healed " + amt + " HP!"]); }
          else setDialog(["No " + name + " left!"]);
          state = S_DIALOG; return;
        }
      }
      setDialog(["All Minis are at full health!"]);
    } else setDialog(["No Minis to heal!"]);
  } else if (name === I_FHEAL) {
    for (const c of player.party) { c.status = null; c.confusionTurns = 0; }
    removeItem(name); setDialog(["All status conditions cured!"]);
  } else if (ALL_TM.includes(name)) { useTM(name); return; }
  else if ([I_REVIVE,I_FREVIVE].includes(name)) {
    const fainted = player.party.filter(c => !c.isAlive());
    if (fainted.length) { const hp = name === I_REVIVE ? 1 : fainted[0].maxHP; if (removeItem(name)) setDialog([fainted[0].name + " revived!"]); }
    else setDialog(["No fainted Minis!"]);
  }   else setDialog([name + " can only be used in battle!"]);
  state = S_DIALOG;
}

function buyItem() {
  const item = SHOP_ITEMS[shopCursor]; const price = PRICES[item] || 100;
  if (player.money >= price) { player.money -= price; addItem(item); setDialog(["Bought " + item + " for $" + price + "!"]); }
  else setDialog(["Not enough money!"]);
  state = S_DIALOG;
}

// === INPUT HANDLING ===
let scrollCD = 0;
function handleScroll(dir) {
  if (state === S_ENCOUNTER) return;
  if (state === S_TITLE) { state = S_INTRO; advanceIntro(); }
  else if (state === S_INTRO) advanceDialog();
  else if (state === S_NAME) { nameCursor = (nameCursor + dir + 29) % 29; }
  else if (state === S_BATTLE) {
    if (battlePhase === "message") nextBattleMsg();
    else if (battlePhase === "select") cursor = Math.max(0, Math.min(3, cursor + dir));
    else if (battlePhase === "moves") { const m = battleState.player.moves; cursor = Math.max(0, Math.min(m.length - 1, cursor + dir)); }
    else if (battlePhase === "party") cursor = Math.max(0, Math.min(player.party.length - 1, cursor + dir));
    else if (battlePhase === "bag") { const items = Object.entries(player.inventory).filter(([k, v]) => v > 0 && [I_POTION,I_SPOTION,I_HPOTION,I_FHEAL,I_SPHERE,I_GSPHERE,I_USPHERE,I_MSPHERE,I_REVIVE,I_FREVIVE].includes(k)); cursor = Math.max(0, Math.min(items.length - 1, cursor + dir)); }
  }
  else if (state === S_PAUSE) { cursor = Math.max(0, Math.min(6, cursor + dir)); }
  else if (state === S_PARTY) {
    const maxC = partyMode === "use" ? player.party.filter(c => (partyMode === "use" && pendingUseItem ? true : true)).length - 1 : player.party.length - 1;
    cursor = Math.max(0, Math.min(player.party.length - 1, cursor + dir));
  }
  else if (state === S_PARTY_DETAIL) {
    // 3 buttons: Swap, Summary, Back (or 2 in swap mode)
    const maxB = partyMode === "swap" ? 1 : 2;
    cursor = Math.max(0, Math.min(maxB, cursor + dir));
  }
  else if (state === S_BAG_CAT) {
    const items = getBagItems(bagTab);
    const totalSlots = BAG_TABS.length + items.length;
    if (totalSlots > 0) cursor = (cursor + dir + totalSlots) % totalSlots;
  }
  else if (state === S_MAP) cursor = Math.max(0, Math.min(11, cursor + dir));
  else if (state === S_MOVES && pendingMoveLearn) { cursor = Math.max(0, Math.min(pendingMoveLearn.creature.moves.length - 1, cursor + dir)); }
  else if (state === S_DIALOG) advanceDialog();
  else if (state === S_SHOP) shopCursor = Math.max(0, Math.min(SHOP_ITEMS.length - 1, shopCursor + dir));
  else if (state === "pokedex") { const max = Math.max(0, Object.entries(pokedex).length - 15); cursor = Math.max(0, Math.min(max, cursor + dir)); }
  else if (state === S_EVOLUTION) advanceDialog();
  else if (state === S_STARTER) cursor = Math.max(0, Math.min(2, cursor + dir));
  else if (state === S_TM && pendingTM) cursor = Math.max(0, Math.min(pendingTM.compatible.length - 1, cursor + dir));
  else if (state === S_GAMEOVER) { initGame(); state = S_TITLE; }
}

function handleClick(button, mx, my) {
  if (state === S_ENCOUNTER) return;
  if (state === S_TITLE) {
    if ((button === 2 || button === 3) && tryHasSave()) { if (loadGame()) state = S_OW; }
    else advanceIntro();
  }
  else if (state === S_INTRO) advanceDialog();
  else if (state === S_NAME) {
    if (nameCursor < 26) { nameInput += NAME_CHARS[nameCursor]; if (nameInput.length > 10) nameInput = nameInput.slice(0, 10); }
    else if (nameCursor === 26) { nameInput = nameInput.slice(0, -1); }
    else if (nameCursor === 27) { confirmName(); }
    else if (nameCursor === 28) { nameInput += " "; if (nameInput.length > 10) nameInput = nameInput.slice(0, 10); }
  }
  else if (state === S_OW) {
    if (button === 1) {
      // Pause button hit test
      if (R.hitPauseButton(mx, my)) { state = S_PAUSE; cursor = 0; return; }
      const dx = mx - DPAD_CX, dy = my - DPAD_CY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= DPAD_R && dist > 8) {
        let dir;
        if (Math.abs(dx) > Math.abs(dy)) dir = dx > 0 ? "right" : "left";
        else dir = dy > 0 ? "down" : "up";
        const ddx = dir === "right" ? 1 : dir === "left" ? -1 : 0;
        const ddy = dir === "down" ? 1 : dir === "up" ? -1 : 0;
        movePlayer(ddx, ddy, dir);
      } else if (getInteractableInfo()) interact();
      else {
        const ddx = player.facing === "right" ? 1 : player.facing === "left" ? -1 : 0;
        const ddy = player.facing === "down" ? 1 : player.facing === "up" ? -1 : 0;
        movePlayer(ddx, ddy, player.facing);
      }
    } else if (button === 3) { state = S_PAUSE; cursor = 0; }
  }
  else if (state === S_BATTLE) {
    if (button === 1) {
      if (battlePhase === "message") nextBattleMsg();
      else if (battlePhase === "select") selectBattleAction();
      else if (battlePhase === "moves") useBattleMove();
      else if (battlePhase === "party") switchBattleCreature();
      else if (battlePhase === "bag") useBattleItem();
    } else if (button === 3) {
      if (["moves","party","bag"].includes(battlePhase)) { battlePhase = "menu"; cursor = 0; }
    }
  }
  else if (state === S_PAUSE && button === 1) selectPauseMenu();
  else if (state === S_PAUSE && button === 3) { state = S_OW; }
  else if (state === "pokedex") { state = S_PAUSE; cursor = 0; }
  else if (state === S_PARTY && button === 1) {
    if (partyMode === "use") {
      if (cursor < player.party.length && pendingUseItem) {
        const c = player.party[cursor];
        const isRevive = [I_REVIVE, I_FREVIVE].includes(pendingUseItem);
        const isPotion = [I_POTION, I_SPOTION, I_HPOTION].includes(pendingUseItem);
        if (isRevive && c.isAlive()) { state = S_DIALOG; setDialog([c.name + " isn't fainted!"]); pendingUseItem = null; partyMode = "select"; return; }
        if (isPotion && (!c.isAlive() || c.hp >= c.maxHP)) { state = S_DIALOG; setDialog([c.name + " doesn't need healing!"]); pendingUseItem = null; partyMode = "select"; return; }
        const msg = applyOverworldItem(pendingUseItem, c);
        pendingUseItem = null; partyMode = "select";
        state = S_DIALOG; setDialog([msg]);
      }
    } else if (partyMode === "swap") {
      // Swap creature positions
      if (partyDetailIdx !== cursor && cursor < player.party.length) {
        const tmp = player.party[partyDetailIdx];
        player.party[partyDetailIdx] = player.party[cursor];
        player.party[cursor] = tmp;
        partyMode = "select";
      }
    } else {
      partyDetailIdx = cursor;
      state = S_PARTY_DETAIL; cursor = 0;
    }
  }
  else if (state === S_PARTY && button === 3) {
    if (partyMode === "use" || partyMode === "swap") { partyMode = "select"; }
    else { state = S_PAUSE; cursor = 0; }
  }
  else if (state === S_PARTY_DETAIL && button === 1) {
    // Buttons: cursor 0=Swap, 1=Summary, 2=Back
    if (cursor === 0) {
      partyMode = "swap"; state = S_PARTY; cursor = partyDetailIdx;
    } else if (cursor === 1) {
      // Summary toggle - stays on detail view
    } else {
      state = S_PARTY; cursor = partyDetailIdx; partyMode = "select";
    }
  }
  else if (state === S_PARTY_DETAIL && button === 3) {
    partyMode = "select"; state = S_PARTY; cursor = partyDetailIdx;
  }
  else if (state === S_BAG_CAT && button === 1) {
    if (cursor < BAG_TABS.length) {
      bagTab = cursor; cursor = BAG_TABS.length;
    } else {
      const items = getBagItems(bagTab);
      const itemIdx = cursor - BAG_TABS.length;
      if (itemIdx < items.length) {
        const itemName = items[itemIdx];
        const msg = useOverworldItem(itemName);
        if (msg === null) {
          // Check if we're in starter selection (easter egg)
          if (state === S_STARTER) {
            return; // Repel was used - already handled in useOverworldItem
          }
          state = S_PARTY; partyMode = "use"; cursor = 0;
        } else if (msg) {
          state = S_DIALOG; setDialog([msg]);
        }
      }
    }
  }
  else if (state === S_BAG_CAT && button === 3) { state = bagReturnState; cursor = bagReturnState === S_STARTER ? 0 : BAG_TABS.length; }
  else if (state === S_MAP && button === 1) { state = S_PAUSE; cursor = 5; }
  else if (state === S_MAP && button === 3) { state = S_PAUSE; cursor = 5; }
  else if (state === S_MOVES && button === 1) {
    if (pendingMoveLearn) {
      const c = pendingMoveLearn.creature, nm = pendingMoveLearn.newMove;
      if (cursor < c.moves.length) {
        const oldName = MOVES[c.moves[cursor].id]?.name;
        c.moves[cursor] = nm;
        const tmItem = pendingTM ? pendingTM.itemName : null;
        pendingMoveLearn = null;
        if (tmItem) { pendingTM = null; removeItem(tmItem); }
        setDialog([c.name + " forgot " + oldName + " and learned " + MOVES[nm.id].name + "!"]);
        state = S_DIALOG;
      }
    }
  }
  else if (state === S_DIALOG) advanceDialog();
  else if (state === S_SHOP) {
    if (button === 1) buyItem(); else if (button === 3) state = S_OW;
  }
  else if (state === S_EVOLUTION) advanceDialog();
  else if (state === S_STARTER && button === 1) {
    if (mx >= 456 && mx <= 476 && my >= 2 && my <= 20) {
      bagReturnState = S_STARTER;
      state = S_BAG_CAT; bagTab = 0; cursor = BAG_TABS.length;
      return;
    }
    chooseStarter();
  }
  else if (state === S_TM && button === 1) selectTMCreature();
  else if (state === S_TM && button === 3) { pendingTM = null; state = S_BAG_CAT; cursor = BAG_TABS.length; }
  else if (state === S_GAMEOVER) { initGame(); state = S_TITLE; }
}

function handleKeyDown(key) {
  if (state === S_ENCOUNTER) return;
  if (key === "Shift") isSprinting = true;
  if (state === S_TITLE) {
    if (key === "Enter" || key === " " || key === "Escape") {
      if (key === "Escape" && tryHasSave()) { if (loadGame()) state = S_OW; }
      else advanceIntro();
    }
  }
  if (state === S_OW) {
    if (key === "m" || key === "M" || key === "Escape") { state = S_PAUSE; cursor = 0; }
    else if (key === "ArrowUp" || key === "w") movePlayer(0, -1, "up");
    else if (key === "ArrowDown" || key === "s") movePlayer(0, 1, "down");
    else if (key === "ArrowLeft" || key === "a") movePlayer(-1, 0, "left");
    else if (key === "ArrowRight" || key === "d") movePlayer(1, 0, "right");
    else if (key === "Enter" || key === " ") interact();
  } else if (state === S_BATTLE) {
    if (key === "Escape") { if (["moves","party","bag"].includes(battlePhase)) { battlePhase = "menu"; cursor = 0; } }
    else if (key === "Enter" || key === " ") {
      if (battlePhase === "message") nextBattleMsg();
      else if (battlePhase === "select") selectBattleAction();
      else if (battlePhase === "moves") useBattleMove();
      else if (battlePhase === "party") switchBattleCreature();
      else if (battlePhase === "bag") useBattleItem();
    }
  } else if (state === S_PAUSE) {
    if (key === "Escape") state = S_OW;
    else if (key === "Enter" || key === " ") selectPauseMenu();
  } else if (state === "pokedex") { if (key === "Escape") { state = S_PAUSE; cursor = 1; } }
  else if (state === S_PARTY && key === "Escape") {
    if (partyMode === "use" || partyMode === "swap") partyMode = "select";
    else state = S_PAUSE;
  }
  else if (state === S_PARTY_DETAIL && key === "Escape") {
    partyMode = "select"; state = S_PARTY; cursor = partyDetailIdx;
  }
  else if (state === S_PARTY_DETAIL && (key === "Enter" || key === " ")) {
    // Same as button 1 click: Swap/Summary/Back
    if (cursor === 0) { partyMode = "swap"; state = S_PARTY; cursor = partyDetailIdx; }
    else if (cursor === 1) { /* Summary toggle */ }
    else { state = S_PARTY; cursor = partyDetailIdx; partyMode = "select"; }
  }
  else if (state === S_BAG_CAT && key === "Escape") { state = S_PAUSE; cursor = 1; }
  else if (state === S_BAG_CAT && (key === "Enter" || key === " ")) {
    if (cursor < BAG_TABS.length) {
      bagTab = cursor; cursor = BAG_TABS.length;
    } else {
      const items = getBagItems(bagTab);
      const itemIdx = cursor - BAG_TABS.length;
      if (itemIdx < items.length) {
        const itemName = items[itemIdx];
        const msg = useOverworldItem(itemName);
        if (msg === null) { state = S_PARTY; partyMode = "use"; cursor = 0; }
        else if (msg) { state = S_DIALOG; setDialog([msg]); }
      }
    }
  }
  else if (state === S_MAP && (key === "Escape" || key === "Enter" || key === " ")) { state = S_PAUSE; cursor = 5; }
  else if (state === S_MOVES && key === "Escape") {
    if (pendingMoveLearn) { const { creature, newMove } = pendingMoveLearn; pendingMoveLearn = null; pendingTM = null; state = S_DIALOG; setDialog([creature.name + " did not learn " + MOVES[newMove.id].name + "."]); }
    else { state = S_PAUSE; cursor = 0; }
  }
  else if (state === S_STARTER && key === "Escape") state = S_TITLE;
  else if (state === S_STARTER && (key === "b" || key === "B")) {
    bagReturnState = S_STARTER;
    state = S_BAG_CAT; bagTab = 0; cursor = BAG_TABS.length;
  }
  else if (state === S_INTRO || state === S_DIALOG) {
    if (key === "Enter" || key === " ") {
      if (state === S_INTRO) advanceDialog();
      else advanceDialog();
    }
  }
  else if (state === S_NAME) {
    if (key === "Backspace") { nameInput = nameInput.slice(0, -1); }
    else if (key === "Enter") { confirmName(); }
    else if (key === "Escape") { state = S_TITLE; }
    else if (key.length === 1 && key.match(/[a-zA-Z ]/)) {
      nameInput += key.toUpperCase();
      if (nameInput.length > 10) nameInput = nameInput.slice(0, 10);
    }
  }
  else if (state === S_TM && key === "Escape") { pendingTM = null; state = S_BAG_CAT; cursor = BAG_TABS.length; }
  else if (state === S_GAMEOVER && key === "Enter") { initGame(); state = S_TITLE; }
}

function advanceIntro() {
  setDialog([
    "Welcome to the world of Minimon!",
    "I'm Professor Sage. I study the mysterious creatures called Minis.",
    "So, what's your name, friend?"
  ]);
  pendingNameInput = true;
  state = S_INTRO;
}

// === GAME INIT ===
function initGame() {
  player.x = 10; player.y = 10; player.facing = "down"; player.party = [];
  player.money = 3000; player.badges = []; player.storyFlags = {}; player.stepCounter = 0;
  player.inventory = {[I_POTION]:3,[I_SPHERE]:3,[I_GSPHERE]:0,[I_USPHERE]:0,[I_MSPHERE]:0,[I_FHEAL]:1,[I_REVIVE]:0,[I_XATK]:0,[I_XDEF]:0,[I_REPEL]:1};
  currentMap = MAP_CREATORS[0]();
}

// === EVENT LISTENERS ===
function screenToCanvas(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  return { x: (clientX - r.left) / (r.width / SCREEN_W), y: (clientY - r.top) / (r.height / SCREEN_H) };
}
function onWheel(e) { e.preventDefault(); if (scrollCD <= 0) { handleScroll(e.deltaY > 0 ? 1 : -1); scrollCD = 0.15; } }
function onMouseDown(e) { e.preventDefault(); const p = screenToCanvas(e.clientX, e.clientY); handleClick(e.button, p.x, p.y); }

let touchStart = null;
function onTouchStart(e) { e.preventDefault(); const t = e.touches[0]; const r = canvas.getBoundingClientRect(); touchStart = { x: (t.clientX - r.left) / (r.width / SCREEN_W), y: (t.clientY - r.top) / (r.height / SCREEN_H), time: Date.now() }; }
function onTouchEnd(e) { e.preventDefault(); if (!touchStart) return; const t = e.changedTouches[0]; const r = canvas.getBoundingClientRect(); const x = (t.clientX - r.left) / (r.width / SCREEN_W); const y = (t.clientY - r.top) / (r.height / SCREEN_H); const dx = x - touchStart.x, dy = y - touchStart.y; const dt = Date.now() - touchStart.time; if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && dt < 500) handleClick(1, x, y); else if (dt < 500) { const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"); handleScroll(dir === "up" || dir === "left" ? -1 : 1); } touchStart = null; }

// Canvas listeners
canvas.addEventListener("wheel", onWheel, { passive: false });
canvas.addEventListener("mousedown", onMouseDown, { passive: false });
canvas.addEventListener("contextmenu", e => e.preventDefault());
canvas.addEventListener("touchstart", onTouchStart, { passive: false });
canvas.addEventListener("touchend", onTouchEnd, { passive: false });

// Document-level fallbacks for R1 (only when canvas doesn't catch it)
document.addEventListener("wheel", function(e) { if (e.target !== canvas) onWheel(e); }, { passive: false });
document.addEventListener("touchstart", function(e) { if (e.target !== canvas) onTouchStart(e); }, { passive: false });
document.addEventListener("touchend", function(e) { if (e.target !== canvas) onTouchEnd(e); }, { passive: false });
document.addEventListener("contextmenu", e => e.preventDefault());
document.addEventListener("keydown", e => { handleKeyDown(e.key); });
document.addEventListener("keyup", e => { if (e.key === "Shift") isSprinting = false; });
document.addEventListener("mousedown", e => { if (e.target !== canvas && e.button === 0) { const p = screenToCanvas(e.clientX, e.clientY); handleClick(1, p.x, p.y); } });

// === GAME LOOP ===
let lastTime = 0;
initGame();

function gameLoop(timestamp) {
  if (!running) return;
  try {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp; time += dt; scrollCD = Math.max(0, scrollCD - dt);
  player.playTime += dt;

  // Update effects
  R.updateEffects(dt);

  // Auto-save
  if (state === S_OW) {
    autoSaveTimer += dt;
    if (autoSaveTimer >= AUTO_SAVE_INTERVAL) {
      autoSaveTimer = 0;
      saveGame();
    }
  }

  if (state === S_ENCOUNTER) {
    encounterTimer += dt;
    if (encounterTimer >= 0.7) { finishBattleTransition(); }
  }

  // Render
  R.clear();
  if (state === S_TITLE) R.startScreen(time);
  else if (state === S_NAME) renderNameInput();
  else if (state === S_STARTER) renderStarter();
  else if (state === S_OW || state === S_DIALOG || state === S_INTRO) renderOverworld();
  else if (state === S_ENCOUNTER) {
    renderOverworld();
    if (encounterTimer < 0.35) {
      const flash = Math.floor(encounterTimer * 14) % 2;
      if (flash) { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, SCREEN_W, SCREEN_H); }
    } else {
      const wipeProg = Math.min(1, (encounterTimer - 0.35) / 0.35);
      const barH = Math.floor(SCREEN_H / 2 * wipeProg);
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, SCREEN_W, barH);
      ctx.fillRect(0, SCREEN_H - barH, SCREEN_W, barH);
    }
  }
  else if (state === S_BATTLE) renderBattle();
  else if (state === S_PAUSE) R.pauseMenu(player, cursor, time);
  else if (state === S_PARTY && partyMode === "use") R.useItemTargetMenu(player.party, pendingUseItem, cursor, time);
  else if (state === S_PARTY) R.partyMenu(player.party, cursor);
  else if (state === S_PARTY_DETAIL) R.partyDetailMenu(player.party, partyDetailIdx, time, partyMode);
  else if (state === S_BAG_CAT) R.bagCatMenu(player.inventory, bagTab, cursor, time);
  else if (state === S_MAP) R.worldMapScreen(player, currentMap ? currentMap.name : "", cursor, time);
  else if (state === S_MOVES && pendingMoveLearn) R.moveMenu(pendingMoveLearn.creature.moves, cursor, pendingMoveLearn.creature, MOVES[pendingMoveLearn.newMove.id]?.name);
  else if (state === S_SHOP) R.shopMenu(SHOP_ITEMS, shopCursor, player.money);
  else if (state === S_EVOLUTION && pendingEvolution) R.evolveScreen(pendingEvolution[0], pendingEvolution[1], time);
  else if (state === S_TM && pendingTM) R.tmSelectMenu(pendingTM.compatible, cursor, MOVES[TM_MOVES[pendingTM.itemName]]?.name, pendingTM.itemName);
  else if (state === "pokedex") renderPokedex();
  else if (state === S_GAMEOVER) {
    // Dark background with red vignette effect
    for (var gy = 0; gy < SCREEN_H; gy++) {
      var gr = gy / SCREEN_H;
      var gRed = Math.floor(8 + 6 * Math.sin(gr * 3.14));
      var gGreen = Math.floor(5 + 3 * Math.sin(gr * 3.14));
      var gBlue = Math.floor(5 + 3 * Math.sin(gr * 3.14));
      ctx.fillStyle = "rgb(" + gRed + "," + gGreen + "," + gBlue + ")";
      ctx.fillRect(0, gy, SCREEN_W, 1);
    }

    // Red vignette edges
    var vigTop = ctx.createRadialGradient(SCREEN_W / 2, SCREEN_H / 2, SCREEN_W * 0.2, SCREEN_W / 2, SCREEN_H / 2, SCREEN_W * 0.65);
    vigTop.addColorStop(0, "rgba(0,0,0,0)");
    vigTop.addColorStop(1, "rgba(120,15,15,0.55)");
    ctx.fillStyle = vigTop;
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

    // "GAME OVER" with red text and shadow
    ctx.save();
    ctx.shadowColor = "rgba(180,0,0,0.8)";
    ctx.shadowBlur = 16;
    ctx.textAlign = "center";
    ctx.font = "bold 32px monospace";
    ctx.fillStyle = rgb(COL_RED);
    ctx.fillText("GAME OVER", SCREEN_W / 2, 185);
    ctx.restore();

    // "Your Minis have fainted..."
    R.text(240, 230, "Your Minis have fainted...", COL_GRAY, 14, true);

    // Flavor text
    R.text(240, 270, "The world fades to black...", [100, 100, 100], 12, true);

    // Pulsing "Click to try again"
    var pulse2 = 0.3 + Math.sin(time * 3) * 0.4;
    ctx.globalAlpha = Math.max(0.1, pulse2);
    R.text(240, 320, "Click to try again", COL_WHITE, 14, true);
    ctx.globalAlpha = 1;
  }

  requestAnimationFrame(gameLoop);
  } catch(err) {
    var e=document.getElementById("err");
    if(e){e.style.display="block";e.textContent="Game Error: "+err.message}
    console.error("Game loop error:",err);
    requestAnimationFrame(gameLoop);
  }
}

function renderNameInput() {
  const ctx = R.ctx;

  // Dark gradient background (like RSE name registration)
  for (let y = 0; y < SCREEN_H; y++) {
    const r = y / SCREEN_H;
    const red = Math.floor(12 + 12 * r);
    const green = Math.floor(12 + 10 * r);
    const blue = Math.floor(32 + 28 * r);
    ctx.fillStyle = "rgb(" + red + "," + green + "," + blue + ")";
    ctx.fillRect(0, y, SCREEN_W, 1);
  }

  // Professor Sage sprite on the left
  drawNPC(ctx, 20, 38, 72, "professor");

  // Name label
  R.text(112, 50, "Professor Sage", COL_YELLOW, 16);
  R.text(112, 68, "Name Registration", COL_LGRAY, 11);

  // Minimon-style dialog box at bottom
  for (let y = 370; y < 470; y++) {
    const r = (y - 370) / 100;
    const red = Math.floor(18 + 14 * r);
    const green = Math.floor(28 + 12 * r);
    const blue = Math.floor(72 + 42 * r);
    ctx.fillStyle = "rgb(" + red + "," + green + "," + blue + ")";
    ctx.fillRect(10, y, 460, 1);
  }
  ctx.strokeStyle = rgb(COL_WHITE); ctx.lineWidth = 2;
  ctx.strokeRect(10, 370, 460, 100);
  R.text(22, 386, "Sage:", COL_YELLOW, 13);
  R.text(22, 406, "Hey there! What's", COL_WHITE, 14);
  R.text(22, 424, "your name?", COL_WHITE, 14);
  var arrowA = 0.4 + Math.sin(time * 4) * 0.5;
  ctx.globalAlpha = Math.max(0, arrowA);
  R.text(445, 456, "\u25BC", COL_WHITE, 12, true);
  ctx.globalAlpha = 1;

  // "Your Name" label above input box
  R.text(240, 96, "Your Name", COL_YELLOW, 14, true);

  // Name input box - centered, Minimon-style border
  var nbx = 140, nby = 110, nbw = 200, nbh = 36;
  R.rect(nbx, nby, nbw, nbh, [15, 15, 35]);
  ctx.strokeStyle = rgb(COL_LGRAY); ctx.lineWidth = 2;
  ctx.strokeRect(nbx, nby, nbw, nbh);
  ctx.strokeStyle = rgb([55, 55, 90]); ctx.lineWidth = 1;
  ctx.strokeRect(nbx + 3, nby + 3, nbw - 6, nbh - 6);
  var display = nameInput.length ? (nameInput + (time % 1 < 0.5 ? "_" : " ")) : (time % 1 < 0.5 ? "Enter name..." : "Enter name");
  R.text(nbx + nbw / 2, nby + 25, display, nameInput.length ? COL_WHITE : COL_GRAY, 18, true);

  // Letter grid: 6 cols x 5 rows
  var cols = 6, rows = 5, cellW = 56, cellH = 32;
  var gridW = cols * cellW;
  var startX = (SCREEN_W - gridW) / 2;
  var startY = 160;

  // Grid background
  R.rect(startX - 4, startY - 4, gridW + 8, rows * cellH + 8, [18, 18, 38], 0.7);
  ctx.strokeStyle = rgb([40, 40, 70]); ctx.lineWidth = 1;
  ctx.strokeRect(startX - 4, startY - 4, gridW + 8, rows * cellH + 8);

  for (var i = 0; i < NAME_CHARS.length; i++) {
    var c = i % cols, r = Math.floor(i / cols);
    var x = startX + c * cellW, y = startY + r * cellH;
    var selected = i === nameCursor;

    // Cell background
    R.rect(x + 1, y + 1, cellW - 2, cellH - 2, selected ? [55, 55, 95] : [28, 28, 48]);

    // Cell border
    ctx.strokeStyle = rgb(selected ? COL_YELLOW : [45, 45, 75]);
    ctx.lineWidth = selected ? 2 : 1;
    ctx.strokeRect(x + 1, y + 1, cellW - 2, cellH - 2);

    // Yellow glow for selected cell
    if (selected) {
      var glowP = 0.18 + Math.sin(time * 4) * 0.08;
      ctx.save();
      ctx.globalAlpha = glowP;
      ctx.shadowColor = rgb(COL_YELLOW);
      ctx.shadowBlur = 8;
      ctx.fillStyle = rgb(COL_YELLOW);
      ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);
      ctx.restore();
    }

    R.text(x + cellW / 2, y + cellH / 2 + 4, NAME_CHARS[i], selected ? COL_YELLOW : COL_WHITE, 14, true);
  }

  // Buttons: DEL, OK, SPACE
  var btnY = startY + rows * cellH + 12;
  var btnW = 72, btnH = 28;
  var btnSpacing = 12;
  var totalBtnW = 3 * btnW + 2 * btnSpacing;
  var btnStartX = (SCREEN_W - totalBtnW) / 2;
  var btnLabels = ["DEL", "OK", "SPACE"];
  for (var b = 0; b < 3; b++) {
    var bx = btnStartX + b * (btnW + btnSpacing);
    var bSel = nameCursor === 26 + b;
    R.rect(bx, btnY, btnW, btnH, bSel ? [55, 55, 95] : [28, 28, 48]);
    ctx.strokeStyle = rgb(bSel ? COL_YELLOW : [45, 45, 75]);
    ctx.lineWidth = bSel ? 2 : 1;
    ctx.strokeRect(bx, btnY, btnW, btnH);
    R.text(bx + btnW / 2, btnY + 18, btnLabels[b], bSel ? COL_YELLOW : COL_LGRAY, 12, true);
  }

  // Help text
  R.text(240, 462, "Scroll = Move  |  Click/Tap = Select", COL_GRAY, 11, true);
}

function renderStarter() {
  var ctx = R.ctx;

  // Warm interior gradient (lab/room - tan/beige tones like RSE lab)
  for (var y = 0; y < SCREEN_H; y++) {
    var r = y / SCREEN_H;
    var red = Math.floor(165 + 45 * r);
    var green = Math.floor(145 + 35 * r);
    var blue = Math.floor(105 + 25 * r);
    ctx.fillStyle = "rgb(" + red + "," + green + "," + blue + ")";
    ctx.fillRect(0, y, SCREEN_W, 1);
  }

  // Floor line
  ctx.strokeStyle = rgb([130, 110, 75]); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, 330); ctx.lineTo(SCREEN_W, 330); ctx.stroke();

  // Professor Sage sprite top-left
  drawNPC(ctx, 18, 22, 65, "professor");
  R.text(98, 42, "Professor Sage", COL_YELLOW, 16);

  // Pause/bag button top-right
  R.pauseButton(time);

  // Minimon-style dialog box at bottom
  for (var dy = 370; dy < 470; dy++) {
    var dr = (dy - 370) / 100;
    var dRed = Math.floor(18 + 14 * dr);
    var dGreen = Math.floor(28 + 12 * dr);
    var dBlue = Math.floor(72 + 42 * dr);
    ctx.fillStyle = "rgb(" + dRed + "," + dGreen + "," + dBlue + ")";
    ctx.fillRect(10, dy, 460, 1);
  }
  ctx.strokeStyle = rgb(COL_WHITE); ctx.lineWidth = 2;
  ctx.strokeRect(10, 370, 460, 100);
  R.text(22, 386, "Sage:", COL_YELLOW, 13);
  R.text(22, 406, "Choose your first", COL_WHITE, 14);
  R.text(22, 424, "Mini partner!", COL_WHITE, 14);
  var arrowA = 0.4 + Math.sin(time * 4) * 0.5;
  ctx.globalAlpha = Math.max(0, arrowA);
  R.text(445, 456, "\u25BC", COL_WHITE, 12, true);
  ctx.globalAlpha = 1;

  // Three Miniballs with creatures
  var choices = pendingStarter;
  var pokeR = 30;
  var spacing = 152;
  var baseX = (SCREEN_W - spacing * (choices.length - 1)) / 2;
  var pokeY = 225;

  for (var i = 0; i < choices.length; i++) {
    var dex = choices[i];
    var t = CREATURES[dex];
    var cx = baseX + i * spacing;
    var isSel = i === cursor;

    // Bounce animation for selected
    var bounce = isSel ? Math.sin(time * 4) * 6 : 0;
    var creatureY = pokeY - 70 + Math.floor(bounce);

    // Golden glow for selected miniball
    if (isSel) {
      var gp = 0.15 + Math.sin(time * 3) * 0.08;
      ctx.save();
      ctx.globalAlpha = gp;
      var glowGrad = ctx.createRadialGradient(cx, pokeY, 10, cx, pokeY, 65);
      glowGrad.addColorStop(0, rgba(COL_YELLOW, 0.7));
      glowGrad.addColorStop(1, rgba(COL_YELLOW, 0));
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, pokeY, 65, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // Creature sprite (emerging above the miniball)
    drawCreature(ctx, cx - 24, creatureY, 48, dex, false);

    // -- Draw Miniball --
    // Red top half (full circle)
    ctx.beginPath();
    ctx.arc(cx, pokeY, pokeR, 0, Math.PI * 2);
    ctx.fillStyle = rgb(isSel ? [230, 40, 40] : [210, 35, 35]);
    ctx.fill();

    // White bottom half (semicircle overlay)
    ctx.beginPath();
    ctx.moveTo(cx + pokeR, pokeY);
    ctx.arc(cx, pokeY, pokeR, 0, Math.PI);
    ctx.closePath();
    ctx.fillStyle = rgb(isSel ? [248, 248, 248] : [235, 235, 235]);
    ctx.fill();

    // Outline ring
    ctx.strokeStyle = rgb(isSel ? COL_YELLOW : [35, 35, 35]);
    ctx.lineWidth = isSel ? 3 : 2;
    ctx.beginPath();
    ctx.arc(cx, pokeY, pokeR, 0, Math.PI * 2);
    ctx.stroke();

    // Center line
    ctx.strokeStyle = rgb([35, 35, 35]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - pokeR, pokeY);
    ctx.lineTo(cx + pokeR, pokeY);
    ctx.stroke();

    // Button (white circle with outline)
    ctx.beginPath();
    ctx.arc(cx, pokeY, 7, 0, Math.PI * 2);
    ctx.fillStyle = rgb([245, 245, 245]);
    ctx.fill();
    ctx.strokeStyle = rgb([35, 35, 35]);
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner button dot
    ctx.beginPath();
    ctx.arc(cx, pokeY, 3, 0, Math.PI * 2);
    ctx.fillStyle = rgb(isSel ? COL_YELLOW : [180, 180, 180]);
    ctx.fill();

    // -- Creature info below miniball --
    var infoY = pokeY + pokeR + 10;

    // Name
    R.text(cx, infoY, t.name, isSel ? COL_YELLOW : COL_WHITE, 13, true);

    // Type badges
    var types = t.types;
    var typeW = 42, typeGap = 4;
    var totalTW = types.length * typeW + (types.length - 1) * typeGap;
    var typeX0 = cx - totalTW / 2;
    for (var j = 0; j < types.length; j++) {
      var tc = TYPE_COLORS[types[j]] || COL_GRAY;
      R.rect(typeX0 + j * (typeW + typeGap), infoY + 6, typeW, 14, tc, 0.85);
      R.text(typeX0 + j * (typeW + typeGap) + typeW / 2, infoY + 16, types[j], COL_WHITE, 9, true);
    }

    // Base stats
    R.text(cx, infoY + 28, "HP:" + t.baseStats[0] + " ATK:" + t.baseStats[1], COL_LGRAY, 9, true);
    R.text(cx, infoY + 40, "DEF:" + t.baseStats[2] + " SPD:" + t.baseStats[3], COL_LGRAY, 9, true);

    // Moves
    var startMoves = t.moves.filter(function(m) { return m[0] <= 5; });
    if (startMoves.length > 0) {
      R.text(cx, infoY + 54, "Moves:", COL_LGRAY, 9, true);
      for (var j2 = 0; j2 < startMoves.length && j2 < 3; j2++) {
        var mv = MOVES[startMoves[j2][1]];
        if (mv) {
          var mtc = TYPE_COLORS[mv.type] || COL_GRAY;
          R.text(cx, infoY + 66 + j2 * 12, mv.name, mtc, 9, true);
        }
      }
    }
  }
}

function renderOverworld() {
  if (currentMap) {
    R.townMap(currentMap, player.x, player.y, time);
    R.hud(player, currentMap.name);
    R.pauseButton(time);
    const info = getInteractableInfo();
    if (info) R.interactBubble(info.x * TILE + TILE / 2, info.y * TILE - 12, time);
    R.dpad(DPAD_CX, DPAD_CY, DPAD_R, DPAD_BS);
    if (state === S_INTRO) {
      // Minimon RSE-style blue gradient dialog box for intro
      var ictx = R.ctx;
      for (var dby = 350; dby < 470; dby++) {
        var dbr = (dby - 350) / 120;
        var dbRed = Math.floor(16 + 12 * dbr);
        var dbGreen = Math.floor(24 + 10 * dbr);
        var dbBlue = Math.floor(68 + 44 * dbr);
        ictx.fillStyle = "rgb(" + dbRed + "," + dbGreen + "," + dbBlue + ")";
        ictx.fillRect(10, dby, 460, 1);
      }
      ictx.strokeStyle = rgb(COL_WHITE); ictx.lineWidth = 2;
      ictx.strokeRect(10, 350, 460, 120);
      // Speaker name in yellow
      if (dialogSpeaker) R.text(22, 368, dialogSpeaker + ":", COL_YELLOW, 13);
      // Dialog text in white
      var introLines = R.wrapText(dialogCurrent, 440);
      for (var il = 0; il < Math.min(introLines.length, 4); il++) {
        R.text(22, 388 + il * 18, introLines[il], COL_WHITE, 14);
      }
      // Blinking continue arrow
      var introArrow = 0.4 + Math.sin(time * 4) * 0.5;
      ictx.globalAlpha = Math.max(0, introArrow);
      R.text(445, 458, "\u25BC", COL_WHITE, 12, true);
      ictx.globalAlpha = 1;
    } else if (state === S_DIALOG) R.dialogBox(dialogCurrent, dialogSpeaker);
    R.drawMapTransition();
  }
}

function renderBattle() {
  if (!battleState) return;
  R.battleScene(battleState.player, battleState.enemy, time);
  if (battleState.message) {
    R.box(10, 310, 460, 80);
    const lines = R.wrapText(battleState.message, 440);
    for (let i = 0; i < Math.min(lines.length, 3); i++) R.text(20, 328 + i * 18, lines[i], COL_WHITE, 14);
    R.text(420, 472, "Click/Scroll", COL_GRAY, 10, true);
  }
  if (battlePhase === "menu") {
    R.box(10, 400, 460, 70);
    const actions = ["Fight","Bag","Party","Run"];
    for (let i = 0; i < 4; i++) {
      const x = 30 + (i % 2) * 230, y = 415 + Math.floor(i / 2) * 28;
      if (i === cursor) R.rect(x - 5, y - 2, 100, 22, COL_SELECT, 0.5);
      R.text(x, y + 12, actions[i], i === cursor ? COL_YELLOW : COL_WHITE, 14);
    }
    const cx = 20 + (cursor % 2) * 230, cy = 413 + Math.floor(cursor / 2) * 28;
    R.menuCursor(cx, cy, time);
    // Enemy info
    if (battleState.enemy) {
      const eHpPct = Math.ceil(battleState.enemy.hp/Math.max(1,battleState.enemy.maxHP)*100);
      R.text(350, 445, battleState.enemy.name + " HP:" + eHpPct + "%", COL_GRAY, 10);
      if (battleState.enemy.status) {
        const sTxt = {burn:"BRN",poison:"PSN",paralyze:"PAR",freeze:"FRZ",sleep:"SLP"}[battleState.enemy.status]||"";
        if (sTxt) R.text(440, 445, sTxt, COL_RED, 10, true);
      }
    }
    // Player info
    if (battleState.player) {
      R.text(20, 445, battleState.player.name + " HP:" + battleState.player.hp + "/" + battleState.player.maxHP, COL_LGRAY, 10);
      if (battleState.player.status) {
        const sTxt2 = {burn:"BRN",poison:"PSN",paralyze:"PAR",freeze:"FRZ",sleep:"SLP"}[battleState.player.status]||"";
        if (sTxt2) R.text(200, 445, sTxt2, COL_RED, 10);
      }
    }
  } else if (battlePhase === "moves") R.moveMenu(battleState.player.moves, cursor, battleState.player);
  else if (battlePhase === "party") R.partyMenu(player.party, cursor);
  else if (battlePhase === "bag") {
    const items = Object.entries(player.inventory).filter(([k, v]) => v > 0 && [I_POTION,I_SPOTION,I_HPOTION,I_FHEAL,I_SPHERE,I_GSPHERE,I_USPHERE,I_MSPHERE,I_REVIVE,I_FREVIVE,I_XATK,I_XDEF].includes(k));
    R.box(10, 30, 460, 350); R.text(240, 48, "BAG", COL_YELLOW, 14, true);
    for (let i = 0; i < items.length; i++) {
      const [item, count] = items[i]; const y = 65 + i * 32;
      if (i === cursor) R.rect(16, y, 448, 28, COL_SELECT, 0.3);
      R.text(24, y + 18, item + " x" + count, i === cursor ? COL_WHITE : COL_LGRAY, 14);
    }
    if (!items.length) R.text(240, 200, "No items!", COL_GRAY, 14, true);
  }
}

function renderPokedex() {
  var ctx = R.ctx;

  // Dark blue gradient background (like RSE Minidex)
  for (var py = 0; py < SCREEN_H; py++) {
    var pr = py / SCREEN_H;
    var pRed = Math.floor(15 + 10 * pr);
    var pGreen = Math.floor(15 + 8 * pr);
    var pBlue = Math.floor(35 + 30 * pr);
    ctx.fillStyle = "rgb(" + pRed + "," + pGreen + "," + pBlue + ")";
    ctx.fillRect(0, py, SCREEN_W, 1);
  }

  // Main box
  R.box(10, 10, 460, 460, COL_WHITE, [20, 22, 42]);

  // Title
  R.text(240, 32, "MINIDEX", COL_YELLOW, 16, true);

  var entries = Object.entries(pokedex);
  var seen = entries.filter(function(e) { return e[1].seen; }).length;
  var caught = entries.filter(function(e) { return e[1].caught; }).length;
  var total = Object.keys(CREATURES).length;

  // Stats bar
  R.text(240, 52, "Seen: " + seen + "/" + total + "   Caught: " + caught + "/" + total, COL_LGRAY, 12, true);

  // Progress bar
  var barW = 400, barH = 10, barX = 40, barY = 62;
  R.rect(barX, barY, barW, barH, [35, 35, 55]);
  var fillW = Math.floor(barW * caught / Math.max(1, total));
  if (fillW > 0) {
    // Green gradient fill
    for (var bx = 0; bx < fillW; bx++) {
      var bRatio = bx / barW;
      var bGreen = Math.floor(160 + 60 * bRatio);
      ctx.fillStyle = "rgb(40," + bGreen + ",50)";
      ctx.fillRect(barX + bx, barY, 1, barH);
    }
  }
  // Percentage label
  var pctText = Math.floor(caught / Math.max(1, total) * 100) + "%";
  R.text(barX + barW + 28, barY + 9, pctText, COL_GREEN, 10);

  // Separator line
  ctx.strokeStyle = rgb([60, 60, 90]); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(20, 80); ctx.lineTo(460, 80); ctx.stroke();

  // List entries
  var startY = 88;
  var rowH = 26;
  var maxShow = 14;
  for (var i = 0; i < Math.min(entries.length, maxShow); i++) {
    var idx = cursor + i;
    if (idx >= entries.length) break;
    var dex = entries[idx][0];
    var data = entries[idx][1];
    var t = CREATURES[dex];
    if (!t) continue;

    var ey = startY + i * rowH;
    var isSel = idx === cursor;

    // Row background
    if (isSel) {
      R.rect(16, ey - 1, 448, rowH - 1, COL_SELECT, 0.25);
    }

    var num = String(dex).padStart(3, "0");

    if (data.seen) {
      // Dex number
      R.text(24, ey + 14, "#" + num, COL_LGRAY, 11);

      // Mini sprite (20px)
      drawCreature(ctx, 62, ey - 1, 20, parseInt(dex), false);

      // Name
      R.text(88, ey + 14, t.name, isSel ? COL_YELLOW : COL_WHITE, 12);

      // Type badges (compact)
      var types = t.types;
      var tBadgeX = 175;
      for (var j = 0; j < types.length; j++) {
        var tc = TYPE_COLORS[types[j]] || COL_GRAY;
        R.rect(tBadgeX + j * 42, ey + 2, 38, 12, tc, 0.8);
        R.text(tBadgeX + j * 42 + 19, ey + 11, types[j], COL_WHITE, 7, true);
      }

      // BST
      var total2 = t.baseStats.reduce(function(a, b) { return a + b; }, 0);
      R.text(350, ey + 14, "BST:" + total2, COL_GRAY, 10);

      // Status
      if (data.caught) {
        R.text(430, ey + 14, "Caught", COL_GREEN, 10, true);
      } else {
        R.text(430, ey + 14, "Seen", COL_YELLOW, 10, true);
      }
    } else {
      // Unseen entry
      R.text(24, ey + 14, "#" + num + "  ???", [70, 70, 90], 12);

      // Grayed-out placeholder sprite box
      R.rect(62, ey - 1, 20, 20, [30, 30, 45], 0.5);
    }
  }

  // Scroll indicator
  if (entries.length > maxShow) {
    R.text(240, 440, "Scroll to browse (" + (cursor + 1) + "-" + Math.min(cursor + maxShow, entries.length) + " of " + entries.length + ")", COL_GRAY, 10, true);
  }
  R.text(240, 458, "Click/Right-click to go back", COL_GRAY, 10, true);
}

requestAnimationFrame(gameLoop);
})();
