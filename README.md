# Minimon Web - Quick Start

## To play locally:
1. Open a terminal in this `web/` directory
2. Run: `python -m http.server 8080`
3. Open: http://localhost:8080

## For Rabbit R1:
1. Host these files on an HTTPS server (GitHub Pages, Netlify, etc.)
2. The game runs in the R1's browser
3. Controls:
   - **Scroll wheel** = Navigate menus / advance text
   - **Side button (click)** = Interact / confirm / move forward
   - **Right-click** = Go back / open menu
   - **D-pad overlay** (bottom-left) = Movement in overworld
   - **Touch** = Tap for select, swipe for scroll

## To deploy to GitHub Pages:
```bash
cd web
git init
git add .
git commit -m "Deploy Minimon web"
git remote add origin https://github.com/MrGhostGuy/minimon.git
git push -f origin main:gh-pages
```
Then enable GitHub Pages in repo settings (source: gh-pages branch).

## DS-style systems (2026 overhaul)

The battle engine and overworld now follow the classic Nintendo DS games
(Diamond/Pearl/Platinum era) under the hood:

**Battles**
- Real Gen IV stat formula (base stats and IVs scale the way the games do)
- STAB works (it silently never applied before), critical hits are x2 at
  1/16 odds (1/8 for high-crit moves), burn halves physical damage and ticks
  1/8 HP, poison ticks 1/8, paralysis quarters Speed - and none of them wear
  off on their own anymore
- Sleep runs on a 1-3 turn counter, confusion is a 50% self-hit with the
  real 40-power formula, speed ties are a coin flip
- The real Gen IV catch formula with its 4-shake check (status bonuses:
  sleep/frozen x2, other status x1.5)
- XP uses species yields, x1.5 from trainer battles, split only among the
  Minis that actually fought
- Items and failed escapes spend your turn (the foe still moves), a caught
  Mini joins you as itself (HP, status, IVs and shine intact), and running
  away uses the Gen IV escape formula
- Out of PP everywhere? Struggle, with recoil - just like the games
- Losing is a blackout: you wake up healed where you last healed, down 10%
  of your money, instead of a full game over

**Overworld**
- Smooth tile-to-tile gliding instead of teleporting between tiles, at DS
  walking pace; push the joystick to its rim (or hold Shift) to sprint
- Trainers have line of sight (4 tiles): step into it and you get the "!"
  moment - they walk straight up to you and challenge you
- NPCs are solid; you can't walk through people
- Repel follows the DS rule: it only turns away wild Minis below your
  lead's level, and wild levels vary slightly around each route's table

**World & character art (graphics pass)**
- Terrain rebuilt in the DS style: two-tone shimmer grass with tufts and
  flowers, dense layered tall grass, speckled dirt paths with soft rims
  where they meet other surfaces, sandy shores with foam flecks, lobed
  trees (one variant bears fruit), railed plank bridges, faceted boulders,
  and warm wood-plank floors indoors
- Every human is drawn by one DS-style sprite builder: the professor's
  glasses and lab coat, the nurse's cap and cross, caps, backpacks,
  aprons, capes - all in four directions, with a walk cycle for trainers
  who spot you. (Before this pass NPCs didn't render at all: a sprite
  helper bug produced empty sprites, and a tile-variant bug kept most
  terrain textures from ever reaching the screen.)

**Creature art (Pokémon-style pass)**
- Cel shading the way the games do it: highlights mix toward warm light,
  shadows toward cool indigo, instead of flat brightness steps that greyed
  colours out; body colours are richer than the UI type colours, so pale
  types (Earth/Wind/Light) no longer wash out to near-white
- Designs drawn light-dominant (golems, moles, diggers) are rebalanced at
  render time so the body colour leads and the light shade becomes an edge
- Template touch-ups: cream bellies on quadrupeds and blobs (starters
  included), the golem template's body is main-colour now instead of all
  highlight, and serpents got a crest and a wider head
