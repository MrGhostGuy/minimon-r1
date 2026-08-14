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
