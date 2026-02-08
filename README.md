# Pixel Maze

An 8-bit retro maze game inspired by classic arcade games. Collect all the data bits, avoid the glitches, and grab power cores to fight back!

## Play

Open `index.html` in a browser via any HTTP server (see below), or deploy to GitHub Pages and share the link.

## How to Run Locally

The game uses ES modules, so it needs to be served over HTTP (not opened as a `file://` URL).

**Option A – Python (built-in on macOS/Linux):**
```bash
cd pixel_maze
python3 -m http.server 8080
# Open http://localhost:8080
```

**Option B – Node.js:**
```bash
npx serve .
# Open the URL printed in the terminal
```

**Option C – VS Code:**
Install the "Live Server" extension, right-click `index.html` → Open with Live Server.

## How to Deploy (GitHub Pages)

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Set source to the branch containing the code (e.g. `main`) and folder `/` (root).
4. Save. GitHub will publish the site at `https://<username>.github.io/<repo-name>/`.
5. Share the link — anyone can play on their phone's browser.

No build step required. The game is a pure static site.

## Controls

| Input | Action |
|-------|--------|
| D-pad buttons | Move (mobile) |
| Swipe on canvas | Move (mobile) |
| Arrow keys / WASD | Move (desktop) |
| P / Escape | Pause |
| M | Toggle sound |
| Pause button (‖) | Pause (mobile) |
| Music note button (♫) | Toggle sound (mobile) |

## Game Rules

- **Objective:** Collect all data bits (small dots) in the maze to clear the level.
- **Power Cores:** Large pulsing dots that make glitches vulnerable for a few seconds. Eat them for bonus points!
- **Glitches:** Four enemy types with different AI:
  - **Red (Chase):** Targets you directly.
  - **Pink (Ambush):** Tries to get ahead of you.
  - **Cyan (Whimsy):** Uses a vector trick to flank.
  - **Orange (Shy):** Chases when far away, retreats when close.
- **Lives:** Start with 3. Earn an extra life at 10,000 points.
- **Levels:** 3 levels with increasing difficulty (faster enemies, shorter power-up duration).
- **Win:** Clear all 3 levels!

## Project Structure

```
pixel_maze/
├── index.html          Entry point
├── css/
│   └── style.css       Layout, responsive design, controls
├── js/
│   ├── main.js         Boot and game loop
│   ├── constants.js    All game constants and configuration
│   ├── levels.js       Maze layouts for 3 levels
│   ├── audio.js        Chiptune sound effects (Web Audio API)
│   ├── input.js        Keyboard, D-pad, and swipe input
│   ├── maze.js         Maze state and pathfinding helpers
│   ├── player.js       Player movement and animation
│   ├── enemy.js        Enemy AI (4 personalities)
│   ├── renderer.js     Canvas pixel-art rendering
│   └── game.js         Game state machine
└── README.md
```

## Tech Stack

- Vanilla HTML5 Canvas + JavaScript (ES modules)
- Web Audio API for procedural chiptune sounds
- Zero dependencies, zero build step
- All sprites drawn procedurally via Canvas API
- All sounds generated at runtime — no audio files needed

## License

All code and assets in this project are original work. Released under the MIT License.

```
MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
