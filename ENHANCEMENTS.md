# Minimon R1 — Enhancement Pass (2026-11-15)

Surgical polish/bug-fix pass over the Gen IV overhaul build. No system was
rewritten; every change is a targeted edit in `battle.js`, `moves.js`,
`world.js`, or `main.js`. `creatures.js`, `config.js`, `renderer.js`,
`pixelart.js`, `sprites-v2.js`, and `index.html` are unchanged.

## Test results

- **Before:** `node minimon-tests.js` → **54 passed, 0 failed**
- **After:** `node minimon-tests.js` → **54 passed, 0 failed**
- **Structural validation** (one-off script, not shipped): all 34 maps checked —
  every door destination in range with a walkable spawn tile, every doors[]
  entry backed by a DOOR tile, no overworld NPC standing on a non-walkable or
  door tile, no two NPCs sharing a tile, gym leaders have a standable adjacent
  tile, all creature learnsets/evolutions/TM targets reference real moves and
  dex entries. **All checks passed.**
- **Behavioral verification** (one-off script, not shipped): 24 targeted checks
  of the new/fixed mechanics below (drain math, Protect, Rest, Spite, Sturdy,
  Pressure, status overwrite, immunities, residual-KO XP, Hammer Arm, Mud-Slap,
  Keen Eye). **24 passed, 0 failed.**
- **Save/load regression checks** (in the structural script): saving inside
  Ember Town's Poké Mart now records mapIdx 16 (was 13 by name collision) and
  loading returns to map 16; party XP survives a save/load round-trip (was
  wiped). **Passed.**

## Bugs found and fixed

### Battle engine (`battle.js`, `moves.js`)

1. **Type immunities never worked at all.** `typeEff()` computed each matchup
   as `chart[dt] || 1`, so every `0` in the type chart (Electric→Earth,
   Earth→Wind, Normal→Spirit, Spirit→Normal) silently became `1`. Fixed to
   read the chart value when the key exists. This is the single biggest
   battle-math fix in the pass: immunities now apply to damage, AI move
   scoring, and fixed-damage moves.
2. **Protect, Sandstorm, and Spite were dead moves** — they had no effect
   string, so they did literally nothing. All three are now implemented:
   Protect blocks foe moves for the turn (priority +4, doesn't block your own
   self-boosts), Sandstorm starts 5-turn weather, Spite cuts up to 4 PP from
   the foe's last used move.
3. **Giga Drain / Leech Life healed half of MAX HP per hit** (they reused the
   status-move "recover" effect). They now drain half the HP the foe actually
   lost — also not half the rolled damage, so overkill no longer overheals.
4. **Rest healed only half and never slept.** Rest now fully heals, puts the
   user to sleep for its counter, and fails at full HP or while already
   asleep, as in the games.
5. **A second major status could overwrite the first** (a burned Mini could be
   put to sleep). Status moves now fail against an already-statused target.
6. **Fixed-damage/OHKO moves ignored immunity** — now checked (Fissure can't
   touch Wind types, etc.). Damaging moves that hit an immunity also no longer
   apply their secondary effects or extra multi-hits.
7. **KO by residual damage (burn, poison, Leech Seed, sandstorm) paid no XP.**
   `_residuals` now grants XP for a foe it knocks out, with a guard flag so a
   KO already paid in the main action isn't paid twice.
8. **Hammer Arm lowered the DEFENDER's Speed** — it lowers the user's. Fixed,
   including its log line. **Mud-Slap lowered Attack** — it lowers Accuracy.
9. **Sandstorm weather never expired** when started by the Sandstorm move.
   Weather now ticks down from 5 turns in both turn paths and subsides with a
   message.
10. **Selecting a 0-PP move** (possible via edge paths even though the menu
    guards it) fired the move for free in the engine. The engine now refuses.
11. **Dead abilities that creatures actually have are now live:** Sturdy
    (survive a one-hit KO at full HP on 1 HP), Pressure (foe moves cost 2 PP),
    Static (30% paralysis on contact), Rough Skin (⅛ chip on contact),
    Keen Eye (blocks accuracy drops), Shield Dust (blocks secondary effects),
    Hustle (×1.5 physical power, ×0.8 physical accuracy), Sand Veil (evasion
    in sandstorm), Flash Fire (absorbing Fire now also powers up the
    absorber's Fire moves ×1.5). Previously these abilities were displayed
    but did nothing.

### World (`world.js`) — a systematic NPC placement bug class

NPCs were trapped inside building footprints (unreachable forever), standing
on door tiles (blocking entry), or embedded in wall tiles across nearly every
town. All relocated to standable tiles next to their buildings:

- **Starter Village:** Prof. Sage stood on the player's spawn tile; the Kind
  Old Man (5 free Potions) was trapped inside the Pokémon Center; the
  Fisherman stood on the lab door. **The lab door also pointed at the rival's
  house interior — the lab had no interior at all.** A proper
  **Prof. Sage's Lab interior was added** (new map 33: research benches,
  specimen signs, Prof. Sage, a Lab Aide) and the door now leads there.
- **Ember Town:** Gym Leader Flora was trapped inside the Pokémon Center
  (the first gym was effectively unchallengeable except by rematch logic);
  the Mart Clerk stood inside the Mart walls; rival Luna was embedded in the
  Mart's east wall; the TM Collector stood on a house door.
- **Frost Harbor:** a sign's `setT` **overwrote the Mart door tile — the Mart
  was completely unreachable.** Sign moved one tile down; Nurse Joy was
  trapped inside the Center with a second NPC stacked on her exact tile; the
  TM-giving Fisher was trapped inside the Mart; the Ice Fisher stood on the
  gym's wall corner.
- **Crystal Cavern / Shadow Gate / Solar Sanctum / Grand Colosseum:** Nurse
  Joy stood **on** the Pokémon Center door tile in all four towns; Colosseum
  leader Drakon stood inside a wall block; the Dragon Master stood on the
  Mart door; two Shadow Gate NPCs and an Arena Spectator were embedded in
  building corners; Elite Four members Terra and Umbra stood inside pillar
  wall tiles.
- **Gym interiors:** the leader stood on the raised wall platform with **no
  standable adjacent tile — interior gym leaders could never be talked to or
  battled.** Leaders now stand on the floor in front of the platform, and
  their self-referential dialog ("Let's battle, Flora!" — spoken by Flora)
  was rewritten.
- **Interior exits dumped you in the wrong place** almost everywhere (a fixed
  plaza point, or the town's north edge). Every Center/Mart/Gym/House exit
  now returns you to the tile in front of that building's door. Gym interior
  spawn also sat on the door tile; corrected.

### Main loop / saves / UI (`main.js`)

12. **Saving inside any interior reloaded you into the WRONG town's building**
    (all Centers share the name "Pokémon Center", etc.) and defeated-trainer
    records collided across gyms, because the current map was looked up *by
    name*. The game now tracks the map index explicitly through every map
    change. Old saves still load exactly as before (see "Left alone").
13. **Loading a save wiped party XP progress** (`loadGame` never restored
    `xp`). Restored; `lastHealSpot` is also saved now, so a blackout after
    loading returns to *your* last heal spot instead of the default.
14. **Beating one "Gym Trainer" marked BOTH same-named trainers in the gym
    defeated** (name matching, no break). Worse, if the foe's last Mini
    knocked itself out on its own turn (recoil, burn tick), the win was never
    settled at all — **no reward, no badge, trainer not marked defeated.**
    Settlement is now a single guarded function keyed to the actual NPC
    instance battled, called from both end-of-battle paths.
15. **Switching Minis mid-battle could soft-lock the battle:** the switch
    code indexed the alive-only battle party with the full-party cursor, so
    with a fainted Mini in the team it pointed at an undefined active Mini.
    Fixed via index translation. The post-switch enemy attack was also a
    hand-rolled copy that **ignored sleep, paralysis, confusion, Protect,
    and accuracy** — a sleeping foe hit you every time. It now runs through
    the real turn engine.
16. **Revive restored 1 HP** (both in battle and overworld). It now restores
    half max HP; Full Revive still restores full.
17. **Keyboard crash:** using an item from the party screen via keyboard hit
    an undefined `dialogLog` (ReferenceError after the item was consumed).
    Fixed to show the result dialog like the touch path.
18. **Pause menu "Close" was unreachable by scroll wheel** (clamp stopped at
    index 6 of 8 options) — on the R1, whose primary input is the wheel.
    Clamp fixed. Pokedex scroll had the same class of off-by-one (last entry
    unreachable); fixed.
19. **Buying one item ejected you from the shop** (the receipt dialog dropped
    you to the overworld). You now return to the shop counter after buying.
20. **A TM could teach a move the Mini already knew**, wasting the TM. Now
    refused with a message, TM kept.
21. **Escape Rope was a dead item** — in no bag tab and no shop, so it could
    never be used; its effect also computed a destination, ignored it, and
    warped you onto Prof. Sage's tile. It's now in the Battle bag tab, sold
    in shops, and warps you to the Starter Village plaza.
22. **The in-battle bag list overflowed its box** once you owned many item
    types (rows drew past the panel). The list now windows and follows the
    cursor, in both the renderer and the tap hit-testing.
23. **Super Potion healed 60** — the Gen IV value is 50. Corrected in all
    three amount tables.

## Improvements (beyond bug fixes)

- The **lab interior** gives Prof. Sage a real home and a lore spot for
  IVs/shiny hunting (signs explain both).
- **Shop stays open after a purchase** — stocking up on spheres/potions is
  one visit instead of one trip per item.
- **Battle bag windowing** with a "Scroll for more (x–y of z)" footer, so a
  full inventory stays readable on the 240×282 screen.
- Nine previously-decorative **abilities now change fights**, which makes
  several dex entries (Sturdy lines, Pressure legendaries, Static/Rough Skin
  lines) play the way their Pokedex-style presentation implies.
- Weather now visibly **ends**, instead of a sandstorm lasting the whole
  battle once started by the move.

## Left alone, and why

- **Snow Cloak** — assigned to some creatures, but there is no hail weather
  or hail move anywhere in the game; adding a weather system for one ability
  was out of scope for a surgical pass.
- **Sticky Hold** (no held-item system exists), **Illuminate** (overworld
  encounter-rate flavor) — nothing to hook into.
- **Intimidate / Clear Body / Synchronize / Huge Power / Quick Feet /
  Vital Spirit / Water Veil / Own Tempo** — engine support partially exists
  for some (Clear Body is honored by the new stat-drop guard), but **no
  creature in the dex has these abilities**, so there was nothing to fix in
  practice.
- **Full Heal curing the whole party** for one item — generous, but it's the
  shipped design and changing it would be a balance nerf, not a bug fix.
- **`TILE_CHEST`** exists in config but no map or logic uses chests — adding
  a chest/loot system is new content, not polish.
- **The dead "legendary" battle-transition branch** in main.js — harmless,
  nothing starts it; removing it risks touching the transition flow for no
  player-visible gain.
- **One pending level-up move / evolution processed per win** — pending moves
  persist on the creature and resolve after the next win; quirky but not a
  lock or a loss.
- **Physical = contact** simplification for Static/Rough Skin — consistent
  with how the engine already treats contact everywhere else.
- **Save-format compatibility:** the save format gained one optional field
  (`lastHealSpot`); old saves load with the previous default behavior. One
  known one-time side effect: because defeated-trainer records key on NPC
  position, an old save's record for a *relocated* battler (Flora, Drakon,
  Terra, Umbra, Wyvern) won't match the new position, so that one trainer
  can be battled once more after loading an old save. Badges already earned
  are kept (badge award is guarded), so the worst case is one extra reward
  payout — no data loss, no stuck state.
- **Balance numbers** (wild levels, catch rates, prices, rewards) were
  audited in passing and left as shipped — the Gen IV overhaul's tuning was
  deliberate, and the suite's catch/XP checks encode it.
