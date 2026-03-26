# Space Invaders Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a self-contained Space Invaders arcade animation theme that runs for 3 minutes, destroys 56 enemies one every 3 seconds, and ends with a retro GAME OVER screen.

**Architecture:** Single `index.html` file with all CSS and JS inline, rendering to an HTML5 canvas. A `requestAnimationFrame` game loop drives all animation: enemy grid movement, player evasion, bullet firing, bomb dropping, diving enemies, and the end sequence.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, Canvas 2D API. No external dependencies.

---

### Task 1: Scaffold the theme folder and Info.json

**Files:**
- Create: `Themes/Space Invaders.totheme/Info.json`
- Create: `Themes/Space Invaders.totheme/Documents/index.html` (empty shell)

- [ ] **Step 1: Create Info.json**

```json
{
  "author": {
    "name": "Junie",
    "email": "junie@jetbrains.com",
    "url": "https://github.com/JetBrains/junie"
  },
  "comments": "A Space Invaders arcade game animation lasting 3 minutes.",
  "rootDocument": "index.html",
  "created": "2026-03-26",
  "identifier": "space-invaders",
  "version": 1,
  "modified": "2026-03-26",
  "name": "Space Invaders"
}
```

- [ ] **Step 2: Create empty index.html shell**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Space Invaders</title>
  <style>
    /* styles go here */
  </style>
</head>
<body>
  <canvas id="game"></canvas>
  <script>
    // game logic goes here
  </script>
</body>
</html>
```

- [ ] **Step 3: Verify files exist and open index.html in a browser to confirm blank black canvas renders**

- [ ] **Step 4: Commit**

```bash
git add "Themes/Space Invaders.totheme/"
git commit -m "feat: scaffold Space Invaders theme folder and Info.json"
```

---

### Task 2: Canvas setup, game loop, and constants

**Files:**
- Modify: `Themes/Space Invaders.totheme/Documents/index.html`

- [ ] **Step 1: Add CSS — full-viewport black canvas, no scrollbars**

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #000; overflow: hidden; }
canvas { display: block; width: 100vw; height: 100vh; }
```

- [ ] **Step 2: Add JS constants and canvas init**

```js
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Logical game dimensions (scaled to viewport)
const W = 800, H = 600;
canvas.width = W;
canvas.height = H;

// Timing
const TOTAL_DURATION = 180000; // 3 minutes in ms
const GAME_OVER_DURATION = 10000; // 10 seconds
const SHOOT_INTERVAL = 3000; // 1 enemy every 3s
const ENEMY_COLS = 8, ENEMY_ROWS = 7;
const TOTAL_ENEMIES = ENEMY_COLS * ENEMY_ROWS; // 56

// Colors
const COLOR_BG = '#000';
const COLOR_ENEMY = '#00ff00';
const COLOR_PLAYER = '#ffffff';
const COLOR_BULLET = '#ffffff';
const COLOR_BOMB = '#ff4444';
const COLOR_EXPLOSION = '#ffff00';
const COLOR_GAMEOVER = '#00ff00';
```

- [ ] **Step 3: Add requestAnimationFrame game loop with delta time**

```js
let lastTime = 0;
let startTime = null;

function gameLoop(timestamp) {
  if (!startTime) startTime = timestamp;
  const elapsed = timestamp - startTime;
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  update(delta, elapsed);
  render(elapsed);

  if (elapsed < TOTAL_DURATION + GAME_OVER_DURATION) {
    requestAnimationFrame(gameLoop);
  }
}

function update(delta, elapsed) { /* filled in later */ }
function render(elapsed) {
  ctx.fillStyle = COLOR_BG;
  ctx.fillRect(0, 0, W, H);
}

requestAnimationFrame(gameLoop);
```

- [ ] **Step 4: Open in browser — confirm black canvas, no errors in console**

- [ ] **Step 5: Commit**

```bash
git add "Themes/Space Invaders.totheme/Documents/index.html"
git commit -m "feat: add canvas setup and game loop skeleton"
```

---

### Task 3: Enemy grid — sprites, movement, and animation

**Files:**
- Modify: `Themes/Space Invaders.totheme/Documents/index.html`

- [ ] **Step 1: Define pixel-art enemy sprite data (3 types, 2 frames each)**

Each sprite is an 11×8 pixel bitmap encoded as an array of rows (binary strings):

```js
const SPRITES = {
  // Type A (top rows) — classic crab shape
  A: [
    ['00100000100', '00010001000', '00111111100', '01101110110',
     '11111111111', '10111111101', '10100000101', '01011011010'],
    ['00100000100', '10010001001', '10111111101', '11101110111',
     '11111111111', '01111111110', '00100000100', '01000000010']
  ],
  // Type B (middle rows) — squid shape
  B: [
    ['00010000100', '00001001000', '00011111100', '01110110111',
     '11111111111', '10111111101', '10000000001', '01100110011'],
    ['00010000100', '10001001001', '10011111101', '01110110111',
     '11111111111', '01111111110', '01000000010', '10100110101']
  ],
  // Type C (bottom rows) — octopus shape
  C: [
    ['00111111100', '11111111111', '11101010111', '11111111111',
     '00101010100', '01000000010', '10100000101', '01000000010'],
    ['00111111100', '11111111111', '11101010111', '11111111111',
     '00101010100', '01011011010', '10100000101', '00011011000']
  ]
};

function spriteType(row) {
  if (row === 0) return 'A';
  if (row <= 2) return 'B';
  return 'C';
}
```

- [ ] **Step 2: Initialize enemy grid state**

```js
const ENEMY_W = 36, ENEMY_H = 28, ENEMY_PAD_X = 16, ENEMY_PAD_Y = 12;
const GRID_OFFSET_X = 60, GRID_OFFSET_Y = 60;

let enemies = [];
for (let r = 0; r < ENEMY_ROWS; r++) {
  for (let c = 0; c < ENEMY_COLS; c++) {
    enemies.push({
      row: r, col: c,
      x: GRID_OFFSET_X + c * (ENEMY_W + ENEMY_PAD_X),
      y: GRID_OFFSET_Y + r * (ENEMY_H + ENEMY_PAD_Y),
      alive: true,
      frame: 0,
      type: spriteType(r),
      diving: false,
      diveProgress: 0,
      diveStartX: 0, diveStartY: 0,
      diveTargetX: 0, diveTargetY: 0,
      diveReturnX: 0, diveReturnY: 0,
    });
  }
}

// Grid movement state
let gridDir = 1; // 1 = right, -1 = left
let gridX = 0; // offset from initial positions
let gridY = 0;
let gridSpeed = 40; // px/s
let spriteFrameTimer = 0;
let spriteFrame = 0;
```

- [ ] **Step 3: Add enemy grid update logic (move left/right, step down on wall hit)**

```js
function updateEnemies(delta) {
  // Sprite animation toggle every 500ms
  spriteFrameTimer += delta;
  if (spriteFrameTimer > 500) {
    spriteFrame = 1 - spriteFrame;
    spriteFrameTimer = 0;
  }

  // Find leftmost and rightmost alive enemy x positions
  const alive = enemies.filter(e => e.alive && !e.diving);
  if (alive.length === 0) return;

  const minX = Math.min(...alive.map(e => e.x + gridX));
  const maxX = Math.max(...alive.map(e => e.x + gridX + ENEMY_W));

  if (gridDir === 1 && maxX >= W - 20) {
    gridDir = -1;
    gridY += 20;
  } else if (gridDir === -1 && minX <= 20) {
    gridDir = 1;
    gridY += 20;
  }

  gridX += gridDir * gridSpeed * (delta / 1000);
}
```

- [ ] **Step 4: Add enemy render function (draw pixel sprites using canvas)**

```js
function drawSprite(x, y, type, frame, color) {
  const rows = SPRITES[type][frame];
  const pw = ENEMY_W / 11; // pixel width
  const ph = ENEMY_H / 8;  // pixel height
  ctx.fillStyle = color;
  rows.forEach((row, ry) => {
    for (let cx = 0; cx < row.length; cx++) {
      if (row[cx] === '1') {
        ctx.fillRect(
          Math.round(x + cx * pw),
          Math.round(y + ry * ph),
          Math.ceil(pw), Math.ceil(ph)
        );
      }
    }
  });
}

function renderEnemies() {
  enemies.forEach(e => {
    if (!e.alive) return;
    const ex = e.diving ? e.x : e.x + gridX;
    const ey = e.diving ? e.y : e.y + gridY;
    drawSprite(ex, ey, e.type, spriteFrame, COLOR_ENEMY);
  });
}
```

- [ ] **Step 5: Wire updateEnemies and renderEnemies into the game loop**

- [ ] **Step 6: Open in browser — confirm 56 enemies in grid, wiggling, moving left/right and stepping down**

- [ ] **Step 7: Commit**

```bash
git add "Themes/Space Invaders.totheme/Documents/index.html"
git commit -m "feat: add enemy grid with pixel sprites and movement"
```

---

### Task 4: Player — sprite, scripted movement, evasion

**Files:**
- Modify: `Themes/Space Invaders.totheme/Documents/index.html`

- [ ] **Step 1: Define player state**

```js
const PLAYER_W = 44, PLAYER_H = 24;
let player = {
  x: W / 2 - PLAYER_W / 2,
  y: H - 60,
  speed: 120, // px/s
  dir: 1,
  // Evasion: target x updated when bombs/divers get close
  targetX: W / 2 - PLAYER_W / 2,
};
```

- [ ] **Step 2: Define player sprite (classic cannon shape)**

```js
const PLAYER_SPRITE = [
  '00000100000',
  '00001110000',
  '00001110000',
  '11111111111',
  '11111111111',
  '11111111111',
];
```

- [ ] **Step 3: Add player update — smooth movement toward targetX, bounce off walls**

```js
function updatePlayer(delta) {
  const dx = player.targetX - player.x;
  if (Math.abs(dx) > 2) {
    player.x += Math.sign(dx) * player.speed * (delta / 1000);
  } else {
    player.x = player.targetX;
  }
  player.x = Math.max(10, Math.min(W - PLAYER_W - 10, player.x));
}

// Called by bomb/dive logic to make player evade
function evadeToSafeX(threatX) {
  // Move player away from threat
  if (threatX < W / 2) {
    player.targetX = Math.min(W - PLAYER_W - 30, player.targetX + 120);
  } else {
    player.targetX = Math.max(30, player.targetX - 120);
  }
}
```

- [ ] **Step 4: Add idle drift — player slowly oscillates when no threat**

```js
let driftTimer = 0;
function updatePlayerDrift(delta) {
  driftTimer += delta;
  if (driftTimer > 2000) {
    driftTimer = 0;
    // Drift to a new random-ish position
    player.targetX = 80 + Math.random() * (W - PLAYER_W - 160);
  }
}
```

- [ ] **Step 5: Add player render**

```js
function renderPlayer() {
  const pw = PLAYER_W / 11;
  const ph = PLAYER_H / 6;
  ctx.fillStyle = COLOR_PLAYER;
  PLAYER_SPRITE.forEach((row, ry) => {
    for (let cx = 0; cx < row.length; cx++) {
      if (row[cx] === '1') {
        ctx.fillRect(
          Math.round(player.x + cx * pw),
          Math.round(player.y + ry * ph),
          Math.ceil(pw), Math.ceil(ph)
        );
      }
    }
  });
}
```

- [ ] **Step 6: Wire into game loop. Open in browser — confirm player renders and drifts**

- [ ] **Step 7: Commit**

```bash
git add "Themes/Space Invaders.totheme/Documents/index.html"
git commit -m "feat: add player sprite and scripted evasion movement"
```

---

### Task 5: Player bullet — fire every 3s, destroy one enemy

**Files:**
- Modify: `Themes/Space Invaders.totheme/Documents/index.html`

- [ ] **Step 1: Define bullet state and shoot timer**

```js
let bullet = null; // { x, y, targetEnemy }
let shootTimer = 0;
let nextEnemyIndex = 0; // index into enemies array (alive enemies, shot in order)

function getNextTarget() {
  // Find next alive, non-diving enemy (scan left-to-right, bottom-to-top)
  const alive = enemies.filter(e => e.alive && !e.diving);
  if (alive.length === 0) return null;
  // Pick bottom-left-most for classic feel
  alive.sort((a, b) => (b.row - a.row) || (a.col - b.col));
  return alive[nextEnemyIndex % alive.length];
}
```

- [ ] **Step 2: Add bullet update — fire every 3s, travel upward, hit target**

```js
const BULLET_SPEED = 400; // px/s

function updateBullet(delta, elapsed) {
  // Only fire during the game phase (not game over)
  if (elapsed > TOTAL_DURATION) return;

  shootTimer += delta;
  if (!bullet && shootTimer >= SHOOT_INTERVAL) {
    shootTimer = 0;
    const target = getNextTarget();
    if (target) {
      bullet = {
        x: player.x + PLAYER_W / 2,
        y: player.y,
        targetEnemy: target,
      };
    }
  }

  if (bullet) {
    const te = bullet.targetEnemy;
    const tx = (te.diving ? te.x : te.x + gridX) + ENEMY_W / 2;
    const ty = (te.diving ? te.y : te.y + gridY) + ENEMY_H / 2;
    const dx = tx - bullet.x;
    const dy = ty - bullet.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 10) {
      // Hit!
      te.alive = false;
      spawnExplosion(tx, ty);
      bullet = null;
      nextEnemyIndex++;
    } else {
      const speed = BULLET_SPEED * (delta / 1000);
      bullet.x += (dx / dist) * speed;
      bullet.y += (dy / dist) * speed;
    }
  }
}
```

- [ ] **Step 3: Add explosion state and update**

```js
let explosions = [];

function spawnExplosion(x, y) {
  explosions.push({ x, y, timer: 0, duration: 400 });
}

function updateExplosions(delta) {
  explosions = explosions.filter(e => {
    e.timer += delta;
    return e.timer < e.duration;
  });
}
```

- [ ] **Step 4: Add bullet and explosion render**

```js
function renderBullet() {
  if (!bullet) return;
  ctx.fillStyle = COLOR_BULLET;
  ctx.fillRect(bullet.x - 2, bullet.y - 8, 4, 16);
}

function renderExplosions() {
  explosions.forEach(e => {
    const t = e.timer / e.duration;
    ctx.globalAlpha = 1 - t;
    ctx.fillStyle = COLOR_EXPLOSION;
    const size = 30 * t;
    // Draw starburst: 8 lines
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      ctx.fillRect(
        e.x + Math.cos(angle) * size - 2,
        e.y + Math.sin(angle) * size - 2,
        4, 4
      );
    }
    ctx.globalAlpha = 1;
  });
}
```

- [ ] **Step 5: Wire into game loop. Open in browser — confirm bullet fires every 3s and destroys enemies one by one**

- [ ] **Step 6: Commit**

```bash
git add "Themes/Space Invaders.totheme/Documents/index.html"
git commit -m "feat: add player bullet, enemy destruction, and explosions"
```

---

### Task 6: Enemy bombs — drop downward, always miss player

**Files:**
- Modify: `Themes/Space Invaders.totheme/Documents/index.html`

- [ ] **Step 1: Define bomb state**

```js
let bombs = [];
let bombTimer = 0;
const BOMB_INTERVAL = 1800; // new bomb every ~1.8s
const BOMB_SPEED = 180; // px/s
```

- [ ] **Step 2: Add bomb spawn — pick random alive enemy, fire downward**

```js
function spawnBomb() {
  const alive = enemies.filter(e => e.alive && !e.diving);
  if (alive.length === 0) return;
  const shooter = alive[Math.floor(Math.random() * alive.length)];
  const bx = (shooter.diving ? shooter.x : shooter.x + gridX) + ENEMY_W / 2;
  const by = (shooter.diving ? shooter.y : shooter.y + gridY) + ENEMY_H;
  bombs.push({ x: bx, y: by, frame: 0, frameTimer: 0 });
}
```

- [ ] **Step 3: Add bomb update — move down, evade player, remove when off-screen**

```js
function updateBombs(delta) {
  bombTimer += delta;
  if (bombTimer >= BOMB_INTERVAL) {
    bombTimer = 0;
    spawnBomb();
  }

  bombs = bombs.filter(b => {
    b.y += BOMB_SPEED * (delta / 1000);
    b.frameTimer += delta;
    if (b.frameTimer > 150) { b.frame = 1 - b.frame; b.frameTimer = 0; }

    // Scripted miss: if bomb is close to player row, nudge it away
    if (b.y > player.y - 60 && b.y < player.y + PLAYER_H) {
      const playerCenterX = player.x + PLAYER_W / 2;
      const bombCenterX = b.x;
      if (Math.abs(bombCenterX - playerCenterX) < 40) {
        // Nudge bomb sideways to miss
        b.x += (bombCenterX < playerCenterX ? -1 : 1) * 60 * (delta / 1000) * 8;
        // Also trigger player evasion for visual drama
        evadeToSafeX(b.x);
      }
    }

    return b.y < H + 20;
  });
}
```

- [ ] **Step 4: Add bomb render (zigzag shape)**

```js
function renderBombs() {
  ctx.fillStyle = COLOR_BOMB;
  bombs.forEach(b => {
    // Simple zigzag bomb: alternating offset rectangles
    for (let i = 0; i < 4; i++) {
      const offset = (i % 2 === b.frame) ? -3 : 3;
      ctx.fillRect(b.x + offset - 2, b.y + i * 5 - 10, 4, 5);
    }
  });
}
```

- [ ] **Step 5: Wire into game loop. Open in browser — confirm bombs fall and miss player**

- [ ] **Step 6: Commit**

```bash
git add "Themes/Space Invaders.totheme/Documents/index.html"
git commit -m "feat: add enemy bombs that always miss the player"
```

---

### Task 7: Diving enemies — break formation, swoop at player, always miss

**Files:**
- Modify: `Themes/Space Invaders.totheme/Documents/index.html`

- [ ] **Step 1: Define dive state and timer**

```js
let diveTimer = 0;
const DIVE_INTERVAL = 5000; // a new diver every 5s
const DIVE_SPEED = 220; // px/s
```

- [ ] **Step 2: Add dive spawn — pick random alive enemy, set dive path**

```js
function spawnDiver() {
  const alive = enemies.filter(e => e.alive && !e.diving);
  if (alive.length < 3) return; // don't dive when few enemies left
  const diver = alive[Math.floor(Math.random() * alive.length)];
  diver.diving = true;
  diver.diveProgress = 0;
  diver.diveStartX = diver.x + gridX;
  diver.diveStartY = diver.y + gridY;
  // Target: near player but offset to miss
  const missOffset = (Math.random() > 0.5 ? 1 : -1) * (60 + Math.random() * 40);
  diver.diveTargetX = player.x + PLAYER_W / 2 + missOffset;
  diver.diveTargetY = player.y + 10;
  // Return position: off-screen bottom, then enemy is removed
  diver.diveReturnX = diver.diveTargetX + missOffset;
  diver.diveReturnY = H + 60;
  // Trigger player evasion for drama
  evadeToSafeX(player.x + PLAYER_W / 2 - missOffset);
}
```

- [ ] **Step 3: Add dive update — move along path, remove when off-screen**

```js
function updateDivers(delta) {
  diveTimer += delta;
  if (diveTimer >= DIVE_INTERVAL) {
    diveTimer = 0;
    spawnDiver();
  }

  enemies.forEach(e => {
    if (!e.alive || !e.diving) return;
    e.diveProgress += DIVE_SPEED * (delta / 1000);

    // Phase 1: start -> target (swoop down)
    const phase1Dist = Math.sqrt(
      Math.pow(e.diveTargetX - e.diveStartX, 2) +
      Math.pow(e.diveTargetY - e.diveStartY, 2)
    );
    if (e.diveProgress < phase1Dist) {
      const t = e.diveProgress / phase1Dist;
      e.x = e.diveStartX + (e.diveTargetX - e.diveStartX) * t;
      e.y = e.diveStartY + (e.diveTargetY - e.diveStartY) * t;
    } else {
      // Phase 2: target -> off-screen
      const p2 = e.diveProgress - phase1Dist;
      const phase2Dist = Math.sqrt(
        Math.pow(e.diveReturnX - e.diveTargetX, 2) +
        Math.pow(e.diveReturnY - e.diveTargetY, 2)
      );
      const t2 = Math.min(1, p2 / phase2Dist);
      e.x = e.diveTargetX + (e.diveReturnX - e.diveTargetX) * t2;
      e.y = e.diveTargetY + (e.diveReturnY - e.diveTargetY) * t2;
      if (t2 >= 1) {
        // Diver exits screen — mark as dead (lost in space)
        e.alive = false;
        e.diving = false;
      }
    }
  });
}
```

- [ ] **Step 4: Wire into game loop. Open in browser — confirm enemies periodically dive toward player and miss**

- [ ] **Step 5: Commit**

```bash
git add "Themes/Space Invaders.totheme/Documents/index.html"
git commit -m "feat: add diving enemies that swoop at player and always miss"
```

---

### Task 8: GAME OVER screen and end sequence

**Files:**
- Modify: `Themes/Space Invaders.totheme/Documents/index.html`

- [ ] **Step 1: Add game phase tracking**

```js
// Phases: 'playing', 'gameover'
let gamePhase = 'playing';
let gameOverTimer = 0;
```

- [ ] **Step 2: Add phase transition logic in update()**

```js
function checkPhase(elapsed) {
  const aliveCount = enemies.filter(e => e.alive).length;
  if (gamePhase === 'playing' && aliveCount === 0) {
    gamePhase = 'gameover';
    gameOverTimer = 0;
    // Clear all bullets and bombs
    bullet = null;
    bombs = [];
  }
  if (gamePhase === 'gameover') {
    gameOverTimer += delta; // delta passed in
  }
}
```

- [ ] **Step 3: Add GAME OVER render — large pixelated retro text, blinking**

```js
function renderGameOver(elapsed) {
  if (gamePhase !== 'gameover') return;

  // Dark overlay
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, W, H);

  // Blinking effect: visible for 600ms, hidden for 200ms
  const t = gameOverTimer % 800;
  if (t > 200) {
    ctx.fillStyle = COLOR_GAMEOVER;
    ctx.font = 'bold 72px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Pixel shadow for retro depth
    ctx.fillStyle = '#004400';
    ctx.fillText('GAME OVER', W / 2 + 4, H / 2 + 4);
    ctx.fillStyle = COLOR_GAMEOVER;
    ctx.fillText('GAME OVER', W / 2, H / 2);

    // Score line
    ctx.font = '24px "Courier New", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('ALL INVADERS DESTROYED', W / 2, H / 2 + 70);
  }
}
```

- [ ] **Step 4: Stop game loop after GAME OVER duration**

The game loop already stops when `elapsed >= TOTAL_DURATION + GAME_OVER_DURATION`. Ensure the GAME OVER screen stays visible until then.

- [ ] **Step 5: Wire checkPhase and renderGameOver into game loop**

- [ ] **Step 6: Open in browser — fast-test by temporarily reducing TOTAL_ENEMIES or SHOOT_INTERVAL to verify GAME OVER screen appears correctly**

- [ ] **Step 7: Commit**

```bash
git add "Themes/Space Invaders.totheme/Documents/index.html"
git commit -m "feat: add GAME OVER end sequence"
```

---

### Task 9: Polish — scanlines, score display, enemy count, final tuning

**Files:**
- Modify: `Themes/Space Invaders.totheme/Documents/index.html`

- [ ] **Step 1: Add CRT scanline overlay**

```js
function renderScanlines() {
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  for (let y = 0; y < H; y += 4) {
    ctx.fillRect(0, y, W, 2);
  }
}
```

- [ ] **Step 2: Add HUD — score (enemies destroyed × 10), remaining enemies count**

```js
function renderHUD() {
  if (gamePhase === 'gameover') return;
  const destroyed = TOTAL_ENEMIES - enemies.filter(e => e.alive).length;
  ctx.fillStyle = COLOR_ENEMY;
  ctx.font = '16px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`SCORE: ${destroyed * 10}`, 20, 10);
  ctx.textAlign = 'right';
  ctx.fillText(`INVADERS: ${enemies.filter(e => e.alive).length}`, W - 20, 10);
}
```

- [ ] **Step 3: Add mystery ship — a UFO that crosses the top of the screen periodically**

```js
let ufo = null;
let ufoTimer = 0;
const UFO_INTERVAL = 15000;

function updateUFO(delta) {
  ufoTimer += delta;
  if (!ufo && ufoTimer > UFO_INTERVAL) {
    ufoTimer = 0;
    ufo = { x: -60, y: 30, speed: 150 };
  }
  if (ufo) {
    ufo.x += ufo.speed * (delta / 1000);
    if (ufo.x > W + 60) ufo = null;
  }
}

function renderUFO() {
  if (!ufo) return;
  ctx.fillStyle = '#ff0000';
  // Simple saucer shape
  ctx.beginPath();
  ctx.ellipse(ufo.x + 20, ufo.y + 8, 20, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(ufo.x + 20, ufo.y + 4, 10, 6, 0, 0, Math.PI * 2);
  ctx.fill();
}
```

- [ ] **Step 4: Final timing check — verify 56 enemies × 3s = 168s ≈ 2m48s, then 10s GAME OVER = ~3m total**

- [ ] **Step 5: Open in browser and watch full animation for at least 30 seconds. Check for console errors, visual glitches, player always evading**

- [ ] **Step 6: Commit**

```bash
git add "Themes/Space Invaders.totheme/Documents/index.html"
git commit -m "feat: add scanlines, HUD, UFO mystery ship, and final polish"
```

---

### Task 10: Final review and cleanup

**Files:**
- Review: `Themes/Space Invaders.totheme/Documents/index.html`
- Review: `Themes/Space Invaders.totheme/Info.json`

- [ ] **Step 1: Verify Info.json is correct (identifier, name, dates)**

- [ ] **Step 2: Verify index.html has no external network dependencies (no CDN links, no external fonts that would break offline)**

- [ ] **Step 3: Open in browser, let run for full 3 minutes (or fast-forward by reducing timers), confirm:**
  - All 56 enemies destroyed
  - Player never hit
  - GAME OVER shown for ~10 seconds
  - No JS errors in console

- [ ] **Step 4: Final commit**

```bash
git add "Themes/Space Invaders.totheme/"
git commit -m "feat: complete Space Invaders theme"
```
