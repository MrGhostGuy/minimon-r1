// Minimon - Battle System
class BattleCreature {
  constructor(dex, level, moves, isWild) {
    const t = CREATURES[dex];
    this.dex = dex; this.name = t.name; this.types = [...t.types]; this.level = level;
    this.xp = 0; this.xpNext = xpForLv(level + 1, t.growthRate);
    this.baseStats = [...t.baseStats]; this.catchRate = t.catchRate;
    this.growthRate = t.growthRate; this.color = t.color;
    this.stats = [calcHp(t.baseStats[0], level), calcStat(t.baseStats[1], level),
      calcStat(t.baseStats[2], level), calcStat(t.baseStats[3], level),
      calcStat(t.baseStats[4], level), calcStat(t.baseStats[5], level)];
    this.maxHP = this.stats[0]; this.hp = this.maxHP;
    this.statStages = [0, 0, 0, 0, 0, 0]; this.status = null;
    this.statusTurns = 0; this.confusionTurns = 0; this.protected = false;
    if (moves) {
      this.moves = moves.map(id => { const m = MOVES[id]; return m ? { id, pp: m.maxPP, maxPP: m.maxPP } : null; }).filter(Boolean);
    } else {
      this.moves = [];
      for (const [lv, mid] of t.moves) {
        if (lv <= level && this.moves.length < 4) { const m = MOVES[mid]; if (m) this.moves.push({ id: mid, pp: m.maxPP, maxPP: m.maxPP }); }
      }
      if (!this.moves.length) this.moves.push({ id: "tackle", pp: 35, maxPP: 35 });
    }
  }
  getStat(i) {
    const base = this.stats[i], s = this.statStages[i];
    const mult = s >= 0 ? (2 + s) / 2 : 2 / (2 - s);
    return Math.max(1, Math.floor(base * mult));
  }
  isAlive() { return this.hp > 0; }
  takeDamage(d) { this.hp = Math.max(0, this.hp - d); }
  heal(a) { this.hp = Math.min(this.maxHP, this.hp + a); }
  gainXP(amt) {
    this.xp += amt; let leveled = false;
    while (this.xp >= this.xpNext && this.level < 100) { this.levelUp(); leveled = true; }
    return leveled;
  }
  levelUp() {
    const t = CREATURES[this.dex]; this.level++;
    this.stats = [calcHp(t.baseStats[0], this.level), calcStat(t.baseStats[1], this.level),
      calcStat(t.baseStats[2], this.level), calcStat(t.baseStats[3], this.level),
      calcStat(t.baseStats[4], this.level), calcStat(t.baseStats[5], this.level)];
    const oldMax = this.maxHP; this.maxHP = this.stats[0]; this.hp += this.maxHP - oldMax;
    this.xpNext = xpForLv(this.level + 1, this.growthRate);
    for (const [lv, mid] of t.moves) {
      if (lv === this.level) {
        const m = MOVES[mid]; if (m && !this.moves.find(mv => mv.id === mid)) {
          const nm = { id: mid, pp: m.maxPP, maxPP: m.maxPP };
          if (this.moves.length < 4) this.moves.push(nm); else this.pendingMoves.push(nm);
        }
      }
    }
  }
  canEvolve() { const t = CREATURES[this.dex]; return t.evo && this.level >= t.evo[0]; }
  evolve() {
    const t = CREATURES[this.dex]; if (!t.evo) return null;
    const [, nd] = t.evo; const nt = CREATURES[nd]; const od = this.dex;
    this.dex = nd; this.name = nt.name; this.types = [...nt.types]; this.baseStats = [...nt.baseStats]; this.color = nt.color;
    this.stats = [calcHp(nt.baseStats[0], this.level), calcStat(nt.baseStats[1], this.level),
      calcStat(nt.baseStats[2], this.level), calcStat(nt.baseStats[3], this.level),
      calcStat(nt.baseStats[4], this.level), calcStat(nt.baseStats[5], this.level)];
    this.maxHP = this.stats[0]; this.hp = this.maxHP;
    for (const [lv, mid] of nt.moves) {
      if (lv <= this.level && this.moves.length < 4) { const m = MOVES[mid]; if (m && !this.moves.find(mv => mv.id === mid)) this.moves.push({ id: mid, pp: m.maxPP, maxPP: m.maxPP }); }
    }
    return [od, nd];
  }
}

function typeEff(atkType, defTypes) {
  let m = 1; const chart = TYPE_CHART[atkType] || {};
  for (const dt of defTypes) m *= (chart[dt] || 1); return m;
}

function calcDamage(atk, def, mvData) {
  if (mvData.category === STATUS) return [0, "status"];
  const mv = MOVES[mvData.id]; if (!mv) return [0, "miss"];
  let atkStat, defStat;
  if (mv.category === PHYSICAL) { atkStat = atk.getStat(STAT_ATK); defStat = def.getStat(STAT_DEF); }
  else { atkStat = atk.getStat(STAT_SATK); defStat = def.getStat(STAT_SDEF); }
  if (mv.power === 0) {
    if (mv.id === "dragon_rage") return [40, "dragon_rage"];
    if (mv.id === "night_shade") return [atk.level, "night_shade"];
    if (mv.id === "fissure") return [def.hp, "fissure_ohko"];
    return [0, "status"];
  }
  const eff = mv.id === "swift" ? 1 : typeEff(mv.type, def.types);
  const base = ((2 * atk.level / 5 + 2) * mv.power * atkStat / defStat) / 50 + 2;
  const stab = mv.type in atk.types ? 1.5 : 1;
  let crit = 1; let critChance = 0.0625; if (mv.effect === "crit_boost") critChance = 0.25;
  if (Math.random() < critChance) crit = 1.5;
  const rnd = 0.85 + Math.random() * 0.15;
  let total = Math.floor(base * stab * eff * crit * rnd);
  if (eff === 0) total = 0; else total = Math.max(1, total);
  let desc = "";
  if (eff > 1) desc = "super_effective"; else if (eff > 0 && eff < 1) desc = "not_effective"; else if (eff === 0) desc = "no_effect";
  if (crit > 1) desc = desc ? desc + "_critical" : "critical";
  return [total, desc];
}

function applyStatus(atk, def, mv) {
  if (!mv.effect) return null;
  if (mv.effect === "recover") { const h = Math.floor(atk.maxHP / 2); atk.heal(h); return "recovered " + h + " HP"; }
  if (mv.effect === "leech") { if (!def.status && Math.random() * 100 <= mv.effectChance) { def.status = "leech_seed"; def.statusTurns = 5; return "leech_active"; } return null; }
  if (mv.effect === "atk_spd_up") { atk.statStages[1] = Math.min(6, atk.statStages[1] + 1); atk.statStages[3] = Math.min(6, atk.statStages[3] + 1); return "atk_spd_up"; }
  if (mv.effect === "protect") { atk.protected = true; return "protect_active"; }
  if (mv.effect === "sandstorm") { return "sandstorm_active"; }
  if (mv.effect === "spite") { return "spite_active"; }
  const ups = ["atk_up", "def_up", "spd_up", "satk_up", "sdef_up"];
  const downs = ["atk_down", "def_down", "spd_down", "satk_down", "sdef_down"];
  const statMap = { atk_up: 1, def_up: 2, spd_up: 3, satk_up: 4, sdef_up: 5, atk_down: 1, def_down: 2, spd_down: 3, satk_down: 4, sdef_down: 5 };
  if (ups.includes(mv.effect)) { const i = statMap[mv.effect]; atk.statStages[i] = Math.min(6, atk.statStages[i] + 1); return mv.effect; }
  if (downs.includes(mv.effect)) { const i = statMap[mv.effect]; def.statStages[i] = Math.max(-6, def.statStages[i] - 1); return mv.effect; }
  const statusEffs = ["burn", "freeze", "paralyze", "poison", "sleep"];
  if (statusEffs.includes(mv.effect)) {
    const chance = mv.effectChance ? mv.effectChance : 30;
    if (Math.random() * 100 <= chance) {
      def.status = mv.effect;
      const durations = { sleep: 1+Math.floor(Math.random()*3), freeze: 2+Math.floor(Math.random()*4), paralysis: 2+Math.floor(Math.random()*3), burn: 4, poison: 5 };
      def.statusTurns = durations[mv.effect] || 1;
      return "status_" + mv.effect;
    }
    return null;
  }
  if (mv.effect === "confuse") { if (Math.random() * 100 <= mv.effectChance) { def.confusionTurns = 2 + Math.floor(Math.random() * 4); return "confuse"; } return null; }
  if (mv.effect === "flinch") { if (Math.random() * 100 <= mv.effectChance) { def.flinched = true; return "flinch"; } return null; }
  return null;
}

function attemptCatch(def, sphereType, statusMultiplier) {
  const rate = def.catchRate;
  const hpF = (3 * def.maxHP - 2 * def.hp) / (3 * def.maxHP);
  // Sphere multipliers: Normal=1, Great=1.5, Ultra=2, Master=255
  const sphereMult = {normal: 1, great: 1.5, ultra: 2, master: 255}[sphereType] || 1;
  // Status multipliers: None=1, Burn/Poison=1.5, Paralysis=2, Freeze=2, Sleep=2.5
  const statusMod = {none: 1, burn: 1.5, poison: 1.5, paralysis: 2, freeze: 2, sleep: 2.5}[statusMultiplier] || 1;
  let chance = rate * hpF * sphereMult * statusMod / 255;
  chance = Math.min(0.95, Math.max(0.05, chance));
  let shakes = 0;
  for (let i = 0; i < 4; i++) { if (Math.random() < chance) shakes++; else break; }
  return [shakes >= 4, shakes, chance];
}

function calcXP(defeated, partySize) {
  const t = CREATURES[defeated.dex];
  const base = Math.floor(t.baseStats.reduce((a, b) => a + b, 0) / 6);
  return Math.max(1, Math.floor(base * defeated.level / (7 * Math.max(1, partySize))));
}

function getAIMove(creature, opponent, diff) {
  const usable = creature.moves.filter(m => m.pp > 0);
  if (!usable.length) return creature.moves[0];
  const aiDiff = diff !== undefined ? diff : AI_WILD;
  if (aiDiff <= AI_WILD) return usable[Math.floor(Math.random() * usable.length)];
  if (aiDiff >= AI_GYM) {
    let best = null, bestScore = -999;
    for (const mv of usable) {
      const md = MOVES[mv.id]; if (!md) continue;
      let score = md.power || 20;
      const eff = typeEff(md.type, opponent.types); score *= eff;
      if (md.effect === "recover" && creature.hp < creature.maxHP * 0.5) score += 50;
      if (["atk_up", "def_up", "spd_up"].includes(md.effect)) score += 10;
      if (score > bestScore) { bestScore = score; best = mv; }
    }
      return best || usable[Math.floor(Math.random() * usable.length)];
  }
  // AI_ROOKIE and AI_TRAINER - some intelligence
  if (aiDiff >= AI_TRAINER) {
    // 50% chance to pick best move, 50% random
    if (Math.random() < 0.5) {
      let best = null, bestScore = -999;
      for (const mv of usable) {
        const md = MOVES[mv.id]; if (!md) continue;
        let score = md.power || 10;
        const eff = typeEff(md.type, opponent.types); score *= eff;
        if (md.effect === "recover" && creature.hp < creature.maxHP * 0.4) score += 40;
        if (score > bestScore) { bestScore = score; best = mv; }
      }
      return best || usable[Math.floor(Math.random() * usable.length)];
    }
  }
  return usable[Math.floor(Math.random() * usable.length)];
}

class BattleState {
  constructor(playerParty, enemyParty, isTrainer, trainerName, canEscape, canCatch, isGymLeader) {
    this.playerParty = playerParty; this.enemyParty = enemyParty;
    this.playerIdx = 0; this.enemyIdx = 0; this.isTrainer = isTrainer;
    this.trainerName = trainerName || "";     this.canEscape = canEscape !== false;
    this.canCatch = canCatch !== false; this.turn = 0; this.isGymLeader = !!isGymLeader;
    this.aiLevel = isGymLeader ? AI_GYM : (isTrainer ? AI_TRAINER : AI_WILD);
    this.phase = "menu"; this.selectedMove = 0; this.selectedItem = 0;
    this.selectedCreature = 0; this.menuCursor = 0; this.submenu = null;
    this.message = ""; this.messageQueue = [];
    this.battleOver = false; this.playerWon = false; this.fled = false;
    this.weather = null; this.onEnd = null;
  }
  get player() { return this.playerParty[this.playerIdx]; }
  get enemy() { return this.enemyParty[this.enemyIdx]; }
  nextEnemy() { for (let i = 0; i < this.enemyParty.length; i++) { if (this.enemyParty[i].isAlive()) { this.enemyIdx = i; return true; } } return false; }
  nextPlayer() { for (let i = 0; i < this.playerParty.length; i++) { if (this.playerParty[i].isAlive()) { this.playerIdx = i; return true; } } return false; }
  addMsg(msg) { this.messageQueue.push(msg); }
  getNextMsg() { return this.messageQueue.length ? this.messageQueue.shift() : null; }

  executeTurn(playerMoveIdx) {
    const p = this.player, e = this.enemy;
    if (!p || !e) return;
    const pMove = p.moves[playerMoveIdx], pMD = MOVES[pMove.id];
    const eMV = getAIMove(e, p, this.aiLevel !== undefined ? this.aiLevel : (this.isTrainer ? AI_TRAINER : AI_WILD));
    const eMD = MOVES[eMV.id];
    const pSpd = p.getStat(STAT_SPD), eSpd = e.getStat(STAT_SPD);
    let first, second;
    if (pMD.priority > eMD.priority) { first = "player"; second = "enemy"; }
    else if (eMD.priority > pMD.priority) { first = "enemy"; second = "player"; }
    else if (pSpd >= eSpd) { first = "player"; second = "enemy"; }
    else { first = "enemy"; second = "player"; }
    const log = [];
    p.flinched = false; e.flinched = false;
    p.protected = false; e.protected = false;

    for (const who of [first, second]) {
      const attacker = who === "player" ? p : e;
      const defender = who === "player" ? e : p;
      const moveData = who === "player" ? pMD : eMD;
      const move = who === "player" ? pMove : eMV;
      if (!attacker.isAlive() || !defender.isAlive()) continue;
      if (defender.protected) { defender.protected = false; log.push(defender.name + " protected itself!"); continue; }
      if (attacker.flinched) { attacker.flinched = false; log.push(attacker.name + " flinched!"); continue; }
      if (attacker.status === "paralyze" && Math.random() < 0.25) { log.push(attacker.name + " is fully paralyzed!"); continue; }
      if (attacker.confusionTurns > 0) {
        attacker.confusionTurns--;
        if (Math.random() < 0.33) { const d = Math.max(1, attacker.level * 2); attacker.takeDamage(d); log.push(attacker.name + " hurt itself in confusion!"); continue; }
        else { log.push(attacker.name + " snapped out of confusion!"); attacker.confusionTurns = 0; }
      }
      if (attacker.status === "sleep" && Math.random() < 0.5) { log.push(attacker.name + " is fast asleep!"); continue; }
      else if (attacker.status === "sleep") { attacker.status = null; log.push(attacker.name + " woke up!"); }
      if (attacker.status === "freeze" && Math.random() < 0.8) { log.push(attacker.name + " is frozen solid!"); continue; }
      else if (attacker.status === "freeze") { attacker.status = null; log.push(attacker.name + " thawed out!"); }
      if (!moveData) continue;
      if (move.pp > 0) move.pp--;
      const hit = moveData.accuracy === 0 || moveData.id === "swift" ? true : Math.random() * 100 <= moveData.accuracy;
      if (!hit) { log.push("The attack missed!"); continue; }
      const [damage, effect] = calcDamage(attacker, defender, moveData);
      this._lastEffect = effect;
      if (moveData.category !== STATUS) {
        defender.takeDamage(damage);
        if (moveData.effect === "multi_hit") {
          const hits = 2 + Math.floor(Math.random() * 4); let total = damage;
          for (let i = 1; i < hits; i++) { const [d] = calcDamage(attacker, defender, moveData); defender.takeDamage(d); total += d; }
          log.push("Hit " + hits + " times!");
        }
        log.push(attacker.name + " used " + moveData.name + "!");
        if (effect === "super_effective") log.push("It's super effective!");
        else if (effect === "not_effective") log.push("It's not very effective...");
        else if (effect === "no_effect") log.push("It had no effect!");
        else if (effect === "fissure_ohko") log.push("It's a one-hit KO!");
        if (effect && effect.includes("critical")) log.push("Critical hit!");
        if (moveData.effect === "recoil") { const r = Math.floor(damage / 3); attacker.takeDamage(r); log.push(attacker.name + " took recoil!"); }
        const status = applyStatus(attacker, defender, moveData);
        if (status && status.startsWith("status_")) { const sn = status.slice(7); const w = { burn: "burned", freeze: "frozen", paralyze: "paralyzed", poison: "poisoned", sleep: "put to sleep" }; log.push(defender.name + " was " + (w[sn] || sn) + "!"); }
        else if (status && status.endsWith("_down")) log.push(defender.name + "'s " + status.replace("_down", "").toUpperCase() + " fell!");
        else if (status && status.endsWith("_up")) log.push(attacker.name + "'s " + status.replace("_up", "").toUpperCase() + " rose!");
        else if (status === "atk_spd_up") log.push(attacker.name + "'s ATK and SPD rose!");
        else if (status === "protect_active") log.push(attacker.name + " used Protect!");
        else if (status === "sandstorm_active") { log.push("A sandstorm is brewing!"); this.weather = "sandstorm"; }
        else if (status === "spite_active") log.push(defender.name + " is full of spite!");
      } else {
        const status = applyStatus(attacker, defender, moveData);
        if (status) {
          if (status.startsWith("recovered")) log.push(attacker.name + " " + status + "!");
          else if (status.endsWith("_up")) log.push(attacker.name + "'s " + status.replace("_up", "").toUpperCase() + " rose!");
          else if (status === "leech_active") log.push(defender.name + " was seeded!");
          else if (status.startsWith("status_")) { const sn2 = status.slice(7); log.push(defender.name + " was " + ({ burn: "burned", freeze: "frozen", paralyze: "paralyzed", poison: "poisoned", sleep: "put to sleep" }[sn2] || sn2) + "!"); }
          else if (status === "confuse") log.push(defender.name + " became confused!");
          else if (status === "atk_spd_up") log.push(attacker.name + "'s ATK and SPD rose!");
          else if (status === "protect_active") log.push(attacker.name + " used Protect!");
          else if (status === "sandstorm_active") { log.push("A sandstorm is brewing!"); this.weather = "sandstorm"; }
          else if (status === "spite_active") log.push(defender.name + " is full of spite!");
        }
      }
      if (!defender.isAlive()) {
        log.push(defender.name + " fainted!");
        if (who === "player") {
          const baseXP = calcXP(defender, this.playerParty.length);
          for (const m of this.playerParty) {
            if (!m.isAlive()) continue;
            const xp = m === attacker ? Math.floor(baseXP * 1.5) : baseXP;
            if (xp > 0) { const lv = m.gainXP(xp); log.push(m.name + " gained " + xp + " XP!"); if (lv) log.push(m.name + " grew to level " + m.level + "!"); }
          }
        }
        break;
      }
    }
    this.messageQueue.push(...log); this.turn++;
    // End-of-turn status
    for (const c of [this.player, this.enemy]) {
      if (c && c.isAlive() && c.status) {
        // Decrement status turns
        c.statusTurns--;
        // Handle status removal after turns expire
        if (c.statusTurns <= 0) {
          const w = { burn: "burned", freeze: "frozen", paralysis: "paralyzed", poison: "poisoned", sleep: "put to sleep" };
          this.messageQueue.push(c.name + " recovered from " + (w[c.status] || c.status) + "!"); c.status = null; c.statusTurns = 0;
        } else if (c.status === "burn") { const d = Math.max(1, Math.floor(c.maxHP / 16)); c.takeDamage(d); this.messageQueue.push(c.name + " is hurt by its burn!"); }
        else if (c.status === "poison") { const d = Math.max(1, Math.floor(c.maxHP / 8)); c.takeDamage(d); this.messageQueue.push(c.name + " is hurt by poison!"); }
        else if (c.status === "leech_seed") { const d = Math.max(1, Math.floor(c.maxHP / 8)); c.takeDamage(d); const other = c === this.player ? this.enemy : this.player; if (other && other.isAlive()) other.heal(d); this.messageQueue.push(c.name + " health is sapped by Leech Seed!"); }
      }
    }
    // Sandstorm damage (only when weather is sandstorm)
    if (this.weather === "sandstorm") {
      for (const c of [this.player, this.enemy]) {
        if (c && c.isAlive() && !c.types.includes(TYPE_EARTH) && !c.types.includes(TYPE_DRAGON)) {
          const d = Math.max(1, Math.floor(c.maxHP / 16));
          c.takeDamage(d);
          this.messageQueue.push("The sandstorm rages! " + c.name + " is buffeted!");
        }
      }
    }
    // End-of-turn fainting check
    for (const c of [this.player, this.enemy]) {
      if (c && !c.isAlive() && !this.battleOver) {
        this.messageQueue.push(c.name + " fainted!");
        if (c === this.enemy) {
          const baseXP = calcXP(c, this.playerParty.length);
          for (const m of this.playerParty) {
            if (!m.isAlive()) continue;
            const xp = m === this.player ? Math.floor(baseXP * 1.5) : baseXP;
            if (xp > 0) { const lv = m.gainXP(xp); this.messageQueue.push(m.name + " gained " + xp + " XP!"); if (lv) this.messageQueue.push(m.name + " grew to level " + m.level + "!"); }
          }
          if (!this.nextEnemy()) { this.playerWon = true; this.battleOver = true; this.messageQueue.push("You defeated " + this.trainerName + "!"); }
        } else {
          if (!this.nextPlayer()) { this.playerWon = false; this.battleOver = true; this.messageQueue.push("No more Minis!"); }
          else this.messageQueue.push("Go, " + this.player.name + "!");
        }
      }
    }
  }
}
