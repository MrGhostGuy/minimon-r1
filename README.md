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
