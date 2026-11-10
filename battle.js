// Minimon - Battle System
class BattleCreature {
  constructor(dex, level, moves, isWild, opts) {
    const t = CREATURES[dex];
    this.dex = dex; this.name = t.name; this.types = [...t.types]; this.level = level;
    this.xp = 0; this.xpNext = xpForLv(level + 1, t.growthRate);
    this.baseStats = [...t.baseStats]; this.catchRate = t.catchRate;
    this.growthRate = t.growthRate; this.color = t.color;
    this.ability = (opts && opts.ability) ? opts.ability : abilityFor(dex);
    // IVs (0-31 per stat) make individuals differ; shininess is decided by them.
    this.ivs = (opts && opts.ivs) ? opts.ivs.slice() : rollIVs();
    this.shiny = (opts && opts.shiny !== undefined) ? !!opts.shiny : isShinyFromIVs(this.ivs);
    const iv = this.ivs;
    this.stats = [calcHp(t.baseStats[0], iv[0], level), calcStat(t.baseStats[1], iv[1], level),
      calcStat(t.baseStats[2], iv[2], level), calcStat(t.baseStats[3], iv[3], level),
      calcStat(t.baseStats[4], iv[4], level), calcStat(t.baseStats[5], iv[5], level)];
    this.maxHP = this.stats[0]; this.hp = (opts && opts.hp !== undefined) ? opts.hp : this.maxHP;
    // 8 stage slots: [unused, ATK, DEF, SPD, SATK, SDEF, ACC, EVA] - older saves carry 6.
    this.statStages = (opts && opts.statStages) ? [...opts.statStages, 0, 0, 0, 0, 0, 0, 0, 0].slice(0, 8) : [0, 0, 0, 0, 0, 0, 0, 0];
    this.status = (opts && opts.status !== undefined) ? opts.status : null;
    this.statusTurns = 0; this.confusionTurns = 0; this.protected = false;
    this.pendingMoves = []; this.flinched = false;
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
    this.stats = [calcHp(t.baseStats[0], this.ivs[0], this.level), calcStat(t.baseStats[1], this.ivs[1], this.level),
      calcStat(t.baseStats[2], this.ivs[2], this.level), calcStat(t.baseStats[3], this.ivs[3], this.level),
      calcStat(t.baseStats[4], this.ivs[4], this.level), calcStat(t.baseStats[5], this.ivs[5], this.level)];
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
    this.ability = abilityFor(nd);
    const oldMax = this.maxHP;
    this.stats = [calcHp(nt.baseStats[0], this.ivs[0], this.level), calcStat(nt.baseStats[1], this.ivs[1], this.level),
      calcStat(nt.baseStats[2], this.ivs[2], this.level), calcStat(nt.baseStats[3], this.ivs[3], this.level),
      calcStat(nt.baseStats[4], this.ivs[4], this.level), calcStat(nt.baseStats[5], this.ivs[5], this.level)];
    this.maxHP = this.stats[0];
    this.hp = Math.min(this.maxHP, this.hp + (this.maxHP - oldMax)); // DS: evolution keeps your damage, like a level-up
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

/* Struggle: the typeless desperation move used when every move is out of PP. */
if (typeof MOVES !== "undefined" && !MOVES.struggle) {
  MOVES.struggle = { id: "struggle", name: "Struggle", type: null, category: PHYSICAL, power: 50, accuracy: 0, maxPP: 1, priority: 0, effect: null, effectChance: 100 };
}

/* Stat used in damage calc. On a critical hit (Gen IV rules) the attacker's
   negative stat drops and the defender's positive boosts are ignored. */
function statForCrit(c, i, crit, isAtk) {
  if (!crit) return c.getStat(i);
  const s = c.statStages[i];
  const use = isAtk ? Math.max(0, s) : Math.min(0, s);
  const m = use >= 0 ? (2 + use) / 2 : 2 / (2 - use);
  return Math.max(1, Math.floor(c.stats[i] * m));
}

/* Accuracy / evasion stage multiplier (Gen IV): (3+s)/3 or 3/(3-s). */
function accStageMult(s) { return s >= 0 ? (3 + s) / 3 : 3 / (3 - s); }

function calcDamage(atk, def, mvData) {
  if (mvData.category === STATUS) return [0, "status"];
  const mv = MOVES[mvData.id]; if (!mv) return [0, "miss"];
  if (mv.power === 0) {
    if (mv.id === "dragon_rage") return [40, "dragon_rage"];
    if (mv.id === "night_shade") return [atk.level, "night_shade"];
    if (mv.id === "fissure") return [def.hp, "fissure_ohko"];
    return [0, "status"];
  }
  // Gen IV critical hits: 1/16 base (1/8 for high-crit moves), x2 damage.
  const isCrit = Math.random() < (mv.effect === "crit_boost" ? 0.125 : 0.0625);
  const crit = isCrit ? 2 : 1;
  let atkStat, defStat;
  if (mv.category === PHYSICAL) { atkStat = statForCrit(atk, STAT_ATK, isCrit, true); defStat = statForCrit(def, STAT_DEF, isCrit, false); }
  else { atkStat = statForCrit(atk, STAT_SATK, isCrit, true); defStat = statForCrit(def, STAT_SDEF, isCrit, false); }
  const eff = (mv.id === "swift" || mv.id === "struggle") ? 1 : typeEff(mv.type, def.types);
  const base = ((2 * atk.level / 5 + 2) * mv.power * atkStat / defStat) / 50 + 2;
  const stab = atk.types.includes(mv.type) ? 1.5 : 1;
  const rnd = 0.85 + Math.random() * 0.15;
  // a burned attacker's physical moves hit at half power (Gen IV), unless it has Guts
  const burnMod = (atk.status === "burn" && mv.category === PHYSICAL && atk.ability !== "Guts") ? 0.5 : 1;
  // ── ability modifiers ──────────────────────────────────────────────────
  let abilityMod = 1, absorbHeal = 0, immune = false;
  const aAb = atk.ability, dAb = def.ability;

  // attacker-side type boosts when HP is low
  const lowHP = atk.hp > 0 && atk.hp <= Math.floor(atk.maxHP / 3);
  if (lowHP) {
    if (aAb === "Blaze" && mv.type === "Fire") abilityMod *= 1.5;
    else if (aAb === "Torrent" && mv.type === "Water") abilityMod *= 1.5;
    else if (aAb === "Overgrow" && mv.type === "Grass") abilityMod *= 1.5;
  }
  // Guts / Huge Power
  if (aAb === "Guts" && atk.status && mv.category === PHYSICAL) abilityMod *= 1.5;
  if (aAb === "HugePower" && mv.category === PHYSICAL) abilityMod *= 2;

  // defender-side: immunities and halving
  if (mv.type === "Earth" && dAb === "Levitate") immune = true;
  if (mv.type === "Fire" && dAb === "FlashFire") immune = true;
  if (mv.type === "Water" && dAb === "WaterAbsorb") { immune = true; absorbHeal = Math.floor(def.maxHP / 4); }
  if (mv.type === "Electric" && dAb === "VoltAbsorb") { immune = true; absorbHeal = Math.floor(def.maxHP / 4); }
  if (dAb === "ThickFat" && (mv.type === "Fire" || mv.type === "Ice")) abilityMod *= 0.5;

  if (immune) return [absorbHeal, absorbHeal > 0 ? "ability_absorb" : "ability_immune"];

  let total = Math.floor(base * stab * eff * crit * rnd * abilityMod * burnMod);
  if (eff === 0) total = 0; else total = Math.max(1, total);
  let desc = "";
  if (eff > 1) desc = "super_effective"; else if (eff > 0 && eff < 1) desc = "not_effective"; else if (eff === 0) desc = "no_effect";
  if (crit > 1) desc = desc ? desc + "_critical" : "critical";
  return [total, desc];
}

/** Speed after ability + weather, the way abilities like Swift Swim actually
 *  change turn order. `weather` is the field state passed in by the caller. */
function effectiveSpeed(c, weather){
  let spd = c.getStat(STAT_SPD);
  if (c.ability === "SwiftSwim" && weather === "rain") spd *= 2;
  else if (c.ability === "Chlorophyll" && weather === "sun") spd *= 2;
  if (c.ability === "QuickFeet" && c.status) spd *= 1.5;
  else if (c.status === "paralyze") spd *= 0.25; // Gen IV: paralysis quarters Speed
  return Math.floor(spd);
}

function applyStatus(atk, def, mv) {
  if (!mv.effect) return null;
  const ab = def.ability;
  // status immunities from abilities
  if (mv.effect === "burn" && (ab === "WaterVeil" || def.types.indexOf("Fire") >= 0)) return null;
  if (mv.effect === "poison" && ab === "Immunity") return null;
  if (mv.effect === "toxic" && ab === "Immunity") return null;
  if ((mv.effect === "paralyze" || mv.effect === "thunder_wave") && ab === "Limber") return null;
  if (mv.effect === "sleep" && (ab === "Insomnia" || ab === "VitalSpirit")) return null;
  if (mv.effect === "freeze" && (ab === "MagmaArmor" || def.types.indexOf("Ice") >= 0)) return null;
  if ((mv.effect === "confuse_ray" || mv.effect === "confuse") && ab === "OwnTempo") return null;
  if (mv.effect === "recover") { const h = Math.floor(atk.maxHP / 2); atk.heal(h); return "recovered " + h + " HP"; }
  if (mv.effect === "leech") { if (!def.status && Math.random() * 100 <= mv.effectChance) { def.status = "leech_seed"; def.statusTurns = 5; return "leech_active"; } return null; }
  if (mv.effect === "atk_spd_up") { atk.statStages[1] = Math.min(6, atk.statStages[1] + 1); atk.statStages[3] = Math.min(6, atk.statStages[3] + 1); return "atk_spd_up"; }
  if (mv.effect === "atk_up2") { atk.statStages[1] = Math.min(6, atk.statStages[1] + 2); return "atk_up2"; }
  if (mv.effect === "satk_up2") { atk.statStages[4] = Math.min(6, atk.statStages[4] + 2); return "satk_up2"; }
  if (mv.effect === "satk_sdef_up") { atk.statStages[4] = Math.min(6, atk.statStages[4] + 1); atk.statStages[5] = Math.min(6, atk.statStages[5] + 1); return "satk_sdef_up"; }
  if (mv.effect === "acc_down") { def.statStages[6] = Math.max(-6, (def.statStages[6] || 0) - 1); return "acc_down"; }
  if (mv.effect === "eva_up") { atk.statStages[7] = Math.min(6, (atk.statStages[7] || 0) + 1); return "eva_up"; }
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
      const durations = { sleep: 1+Math.floor(Math.random()*3), freeze: 2+Math.floor(Math.random()*4), paralyze: 2+Math.floor(Math.random()*3), paralysis: 2+Math.floor(Math.random()*3), burn: 4, poison: 5 };
      def.statusTurns = durations[mv.effect] || 1;
      return "status_" + mv.effect;
    }
    return null;
  }
  if (mv.effect === "confuse") { if (Math.random() * 100 <= mv.effectChance) { def.confusionTurns = 2 + Math.floor(Math.random() * 4); return "confuse"; } return null; }
  if (mv.effect === "flinch") { if (Math.random() * 100 <= mv.effectChance) { def.flinched = true; return "flinch"; } return null; }
  return null;
}

/* Gen IV catch mechanics, faithfully: a = ((3*maxHP - 2*HP) * rate * ball * status) / (3*maxHP);
   if a >= 255 the catch is certain, otherwise each of the 4 shakes succeeds with
   probability b/65536 where b = 1048560 / sqrt(sqrt(16711680 / a)). */
function attemptCatch(def, sphereType, statusArg) {
  const SPHERE_MULT = {
    "soul sphere": 1, "great sphere": 1.5, "ultra sphere": 2, "master sphere": 255,
    normal: 1, great: 1.5, ultra: 2, master: 255
  };
  const sphereMult = (typeof sphereType === "number")
    ? sphereType
    : (SPHERE_MULT[String(sphereType).toLowerCase()] || 1);
  if (sphereMult >= 255) return [true, 4, 1];
  const status = def.status || (typeof statusArg === "string" ? statusArg : null);
  const statusBonus = (status === "sleep" || status === "freeze") ? 2 : (status ? 1.5 : 1);
  const a = Math.floor(((3 * def.maxHP - 2 * def.hp) * def.catchRate * sphereMult * statusBonus) / (3 * def.maxHP));
  if (a >= 255) return [true, 4, 1];
  if (a <= 0) return [false, 0, 0];
  const b = Math.min(65535, Math.floor(1048560 / Math.sqrt(Math.sqrt(16711680 / a))));
  const shakeP = b / 65536;
  let shakes = 0;
  for (let i = 0; i < 4; i++) { if (Math.random() * 65536 < b) shakes++; else break; }
  return [shakes >= 4, shakes, Math.pow(shakeP, 4)];
}

/* XP the DS way: yield (derived from the species' base stat total, the way real
   yields track it) * level / 7, x1.5 from trainer battles, split among the
   party members who actually took part in the battle. */
function expYield(dex) {
  const t = CREATURES[dex]; if (!t) return 64;
  const bst = t.baseStats.reduce((x, y) => x + y, 0);
  return Math.max(20, Math.min(255, Math.round(bst / 4)));
}
function calcXP(defeated, isTrainer) {
  const total = Math.floor(expYield(defeated.dex) * defeated.level / 7);
  return Math.max(1, Math.floor(total * (isTrainer ? 1.5 : 1)));
}

function getAIMove(creature, opponent, diff) {
  const usable = creature.moves.filter(m => m.pp > 0);
  if (!usable.length) return { id: "struggle", pp: 1, maxPP: 1 }; // out of PP: Struggle, like the real games
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
    this.participants = new Set([0]); // party slots that have taken part - they split the XP
    this.escapeAttempts = 0;
  }
  get player() { return this.playerParty[this.playerIdx]; }
  get enemy() { return this.enemyParty[this.enemyIdx]; }
  nextEnemy() { for (let i = 0; i < this.enemyParty.length; i++) { if (this.enemyParty[i].isAlive()) { this.enemyIdx = i; return true; } } return false; }
  nextPlayer() { for (let i = 0; i < this.playerParty.length; i++) { if (this.playerParty[i].isAlive()) { this.playerIdx = i; this.participants.add(i); return true; } } return false; }
  addMsg(msg) { this.messageQueue.push(msg); }
  getNextMsg() { return this.messageQueue.length ? this.messageQueue.shift() : null; }
  /* One creature's action within a turn. Returns true when a creature fainted
     and the turn should stop there, the way the games end a turn on a KO. */
  _performAction(who, attacker, defender, move, moveData, log) {
    if (!attacker.isAlive() || !defender.isAlive()) return false;
    if (defender.protected) { defender.protected = false; log.push(defender.name + " protected itself!"); return false; }
    if (attacker.flinched) { attacker.flinched = false; log.push(attacker.name + " flinched!"); return false; }
    if (attacker.status === "paralyze" && Math.random() < 0.25) { log.push(attacker.name + " is fully paralyzed!"); return false; }
    if (attacker.confusionTurns > 0) {
      // Gen IV confusion: 50% chance to hit yourself with a 40-power typeless physical hit
      if (Math.random() < 0.5) {
        const d = Math.max(1, Math.floor(((2 * attacker.level / 5 + 2) * 40 * attacker.getStat(STAT_ATK) / attacker.getStat(STAT_DEF)) / 50) + 2);
        attacker.takeDamage(d);
        log.push(attacker.name + " is confused! It hurt itself in its confusion!");
        attacker.confusionTurns--;
        if (!attacker.isAlive()) { if (who === "enemy") this._grantXP(attacker, log); return true; }
        return false;
      }
      attacker.confusionTurns--;
      if (attacker.confusionTurns === 0) log.push(attacker.name + " snapped out of confusion!");
    }
    if (attacker.status === "sleep") {
      // Sleep runs on a counter (1-3 turns): you wake the turn the counter empties
      attacker.statusTurns--;
      if (attacker.statusTurns > 0) { log.push(attacker.name + " is fast asleep!"); return false; }
      attacker.status = null; attacker.statusTurns = 0; log.push(attacker.name + " woke up!");
    }
    if (attacker.status === "freeze") {
      if (Math.random() < 0.8) { log.push(attacker.name + " is frozen solid!"); return false; }
      attacker.status = null; log.push(attacker.name + " thawed out!");
    }
    if (!moveData) return false;
    if (move.pp > 0) move.pp--; // PP is spent when the move is used, hit or miss
    const accM = accStageMult(attacker.statStages[6] || 0) / accStageMult(defender.statStages[7] || 0);
    const hit = (moveData.accuracy === 0 || moveData.id === "swift") ? true : Math.random() * 100 <= moveData.accuracy * accM;
    if (!hit) { log.push("The attack missed!"); return false; }
    const [damage, effect] = calcDamage(attacker, defender, moveData);
    this._lastEffect = effect;
    log.push(attacker.name + " used " + moveData.name + "!");
    if (moveData.category !== STATUS) {
      defender.takeDamage(damage);
      if (moveData.effect === "multi_hit") {
        const hits = 2 + Math.floor(Math.random() * 4); let total = damage;
        for (let i = 1; i < hits; i++) { const [d] = calcDamage(attacker, defender, moveData); defender.takeDamage(d); total += d; }
        log.push("Hit " + hits + " times!");
      }
      if (effect === "super_effective") log.push("It's super effective!");
      else if (effect === "not_effective") log.push("It's not very effective...");
      else if (effect === "no_effect") log.push("It had no effect!");
      else if (effect === "fissure_ohko") log.push("It's a one-hit KO!");
      if (effect && effect.includes("critical")) log.push("Critical hit!");
      if (moveData.effect === "recoil") { const r = Math.floor(damage / 3); attacker.takeDamage(r); log.push(attacker.name + " took recoil!"); }
      if (moveData.id === "struggle") { const r = Math.floor(attacker.maxHP / 4); attacker.takeDamage(r); log.push(attacker.name + " is hurt by recoil!"); }
      const status = applyStatus(attacker, defender, moveData);
      this._logStatusResult(status, attacker, defender, log);
    } else {
      const status = applyStatus(attacker, defender, moveData);
      this._logStatusResult(status, attacker, defender, log);
    }
    if (!defender.isAlive()) { if (who === "player") this._grantXP(defender, log); return true; }
    if (!attacker.isAlive()) { if (who === "enemy") this._grantXP(attacker, log); return true; }
    return false;
  }

  _logStatusResult(status, attacker, defender, log) {
    if (!status) return;
    if (status.startsWith("recovered")) log.push(attacker.name + " " + status + "!");
    else if (status.startsWith("status_")) { const sn = status.slice(7); const w = { burn: "burned", freeze: "frozen", paralyze: "paralyzed", poison: "poisoned", sleep: "put to sleep" }; log.push(defender.name + " was " + (w[sn] || sn) + "!"); }
    else if (status === "confuse") log.push(defender.name + " became confused!");
    else if (status === "leech_active") log.push(defender.name + " was seeded!");
    else if (status === "atk_spd_up") log.push(attacker.name + "'s ATK and SPD rose!");
    else if (status === "satk_sdef_up") log.push(attacker.name + "'s SATK and SDEF rose!");
    else if (status.endsWith("_up2")) log.push(attacker.name + "'s " + status.replace("_up2", "").toUpperCase() + " rose sharply!");
    else if (status.endsWith("_down")) log.push(defender.name + "'s " + status.replace("_down", "").toUpperCase() + " fell!");
    else if (status.endsWith("_up")) log.push(attacker.name + "'s " + status.replace("_up", "").toUpperCase() + " rose!");
    else if (status === "protect_active") log.push(attacker.name + " used Protect!");
    else if (status === "sandstorm_active") { log.push("A sandstorm is brewing!"); this.weather = "sandstorm"; }
    else if (status === "spite_active") log.push(defender.name + " is full of spite!");
  }

  /* XP split among the party members who took part, as the DS games do it. */
  _grantXP(defeated, log) {
    const total = calcXP(defeated, this.isTrainer);
    const parts = this.playerParty.filter((m, i) => this.participants.has(i) && m.isAlive());
    if (!parts.length) return;
    const share = Math.max(1, Math.floor(total / parts.length));
    for (const m of parts) {
      const lv = m.gainXP(share);
      log.push(m.name + " gained " + share + " XP!");
      if (lv) log.push(m.name + " grew to level " + m.level + "!");
    }
  }

  /* End-of-turn residuals: burn and poison tick for 1/8 max HP and never wear
     off on their own; Leech Seed drains; sandstorm buffets non-Earth types. */
  _residuals() {
    for (const c of [this.player, this.enemy]) {
      if (c && c.isAlive() && c.status) {
        if (c.status === "burn") { const d = Math.max(1, Math.floor(c.maxHP / 8)); c.takeDamage(d); this.messageQueue.push(c.name + " is hurt by its burn!"); }
        else if (c.status === "poison") { const d = Math.max(1, Math.floor(c.maxHP / 8)); c.takeDamage(d); this.messageQueue.push(c.name + " is hurt by poison!"); }
        else if (c.status === "leech_seed") { const d = Math.max(1, Math.floor(c.maxHP / 8)); c.takeDamage(d); const other = c === this.player ? this.enemy : this.player; if (other && other.isAlive()) other.heal(d); this.messageQueue.push(c.name + " health is sapped by Leech Seed!"); }
      }
    }
    if (this.weather === "sandstorm") {
      for (const c of [this.player, this.enemy]) {
        if (c && c.isAlive() && !c.types.includes(TYPE_EARTH)) {
          const d = Math.max(1, Math.floor(c.maxHP / 16));
          c.takeDamage(d);
          this.messageQueue.push("The sandstorm rages! " + c.name + " is buffeted!");
        }
      }
    }
    for (const c of [this.player, this.enemy]) {
      if (c && !c.isAlive() && !this.battleOver) {
        this.messageQueue.push(c.name + " fainted!");
        if (c === this.enemy) {
          if (!this.nextEnemy()) { this.playerWon = true; this.battleOver = true; this.messageQueue.push("You defeated " + this.trainerName + "!"); }
        } else {
          if (!this.nextPlayer()) { this.playerWon = false; this.battleOver = true; this.messageQueue.push("No more Minis!"); }
          else this.messageQueue.push("Go, " + this.player.name + "!");
        }
      }
    }
  }

  executeTurn(playerMoveIdx) {
    const p = this.player, e = this.enemy;
    if (!p || !e) return;
    let pMove = p.moves[playerMoveIdx];
    if (!pMove || pMove.pp <= 0) {
      if (p.moves.every(m => m.pp <= 0)) pMove = { id: "struggle", pp: 1, maxPP: 1 }; // no PP anywhere: Struggle
      else if (!pMove) return;
    }
    const pMD = MOVES[pMove.id];
    const eMV = getAIMove(e, p, this.aiLevel !== undefined ? this.aiLevel : (this.isTrainer ? AI_TRAINER : AI_WILD));
    const eMD = MOVES[eMV.id];
    this._eMoveType = eMD ? eMD.type : null; // for enemy-attack FX
    const pSpd = effectiveSpeed(p, this.weather), eSpd = effectiveSpeed(e, this.weather);
    let first, second;
    if (pMD.priority > eMD.priority) { first = "player"; second = "enemy"; }
    else if (eMD.priority > pMD.priority) { first = "enemy"; second = "player"; }
    else if (pSpd > eSpd) { first = "player"; second = "enemy"; }
    else if (eSpd > pSpd) { first = "enemy"; second = "player"; }
    else if (Math.random() < 0.5) { first = "player"; second = "enemy"; } // DS: speed ties are a coin flip
    else { first = "enemy"; second = "player"; }
    const log = [];
    const pHP0 = p.hp, eHP0 = e.hp; // for per-side damage FX
    p.flinched = false; e.flinched = false;
    p.protected = false; e.protected = false;
    for (const who of [first, second]) {
      const attacker = who === "player" ? p : e;
      const defender = who === "player" ? e : p;
      const moveData = who === "player" ? pMD : eMD;
      const move = who === "player" ? pMove : eMV;
      if (this._performAction(who, attacker, defender, move, moveData, log)) break;
    }
    this.messageQueue.push(...log); this.turn++;
    this._pDmg = Math.max(0, eHP0 - e.hp);   // damage the player dealt this turn
    this._eDmg = Math.max(0, pHP0 - p.hp);   // damage the enemy dealt this turn
    this._residuals();
  }

  /* The enemy's half of a turn, used when the player spent their action on an
     item or a failed escape - the DS games always give the foe its move. */
  enemyTurnOnly() {
    const e = this.enemy, p = this.player;
    if (!e || !p || this.battleOver || !e.isAlive() || !p.isAlive()) return;
    const eMV = getAIMove(e, p, this.aiLevel !== undefined ? this.aiLevel : (this.isTrainer ? AI_TRAINER : AI_WILD));
    const eMD = MOVES[eMV.id];
    this._eMoveType = eMD ? eMD.type : null;
    const log = [];
    const pHP0 = p.hp;
    e.flinched = false; p.protected = false;
    this._performAction("enemy", e, p, eMV, eMD, log);
    this.messageQueue.push(...log);
    this._pDmg = 0;
    this._eDmg = Math.max(0, pHP0 - p.hp);
    this._residuals();
    this.turn++;
  }
}
