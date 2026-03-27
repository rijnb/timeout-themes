# Player Hit Sequence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two scripted player-hit events to the Space Invaders theme — each triggered by a bomb or diving alien visually connecting with the ship, followed by a large explosion, lives message, and respawn animation.

**Architecture:** All code lives in the single `index.html` file. Hit timing is pre-scheduled at game start. At the scheduled time, a scripted bomb or diver is spawned that the player AI ignores; when it reaches the player, `triggerPlayerDeath()` fires a 4.5-second state machine managing explosion, message, and respawn.

**Tech Stack:** Vanilla JS, Canvas 2D API, `requestAnimationFrame` game loop already in place.

---

## File Structure

One file modified: `Themes/Space Invaders.totheme/Documents/index.html`

New variables and functions to add, and lines to modify:

| What | Where in file |
|------|---------------|
| `lives`, `playerHit`, `scheduledHits`, `scheduleHits()` | After line 1297 (`let gamePhase = 'playing';`) |
| `spawnPlayerExplosion(x, y)` | After `spawnExplosion()` at line 968 |
| Extra rings in `renderExplosions()` | Inside `renderExplosions()`, after existing ring block (~line 1024) |
| `triggerPlayerDeath(x, y)` | After `spawnPlayerExplosion()` |
| `updatePlayerHit(delta)` | After `triggerPlayerDeath()` |
| `spawnScriptedBomb()` | After `spawnBomb()` at line 1043 |
| `spawnScriptedDiver()` | After `spawnDiver()` at line 1119 |
| `renderPlayerHit()` | After `renderExplosions()` at line 1028 |
| Modify `updatePlayer()` | Line 476 — early return + skip scripted divers/bombs |
| Modify `updateBullets()` | Line 801 — skip shooting during death |
| Modify `updateBombs()` filter | Line 1054 — skip barriers for scripted, add hit check |
| Modify `updateDivers()` loop | Line 1130 — add scripted diver hit check |
| Modify `update()` | Line 1416 — add hit scheduling + `updatePlayerHit` call |
| Modify `render()` | Line 1431 — add `renderPlayerHit()` call |
| Modify `renderHUD()` | Line 1386 — replace hardcoded `'LIVES: 3'` |
| Modify `renderPlayer()` | Line 682 — hide/respawn logic during death |

---

## Task 1: State Variables, Hit Scheduling, and HUD Live Counter

**Files:**
- Modify: `Themes/Space Invaders.totheme/Documents/index.html`

- [ ] **Step 1: Add state variables and `scheduleHits()` after `let gamePhase = 'playing';` (line 1297)**

Find this exact line:
```javascript
    let gamePhase = 'playing';
    let gameOverTimer = 0;
```

Replace with:
```javascript
    let gamePhase = 'playing';
    let gameOverTimer = 0;

    // --- Player Hit / Lives System ---
    let lives = 3;

    let playerHit = {
      active: false,
      timer: 0,
      x: 0,
      y: 0
    };

    let scheduledHits = [];

    function scheduleHits() {
      const hit1Time = (25 + Math.random() * 45) * 1000; // 25–70s
      const minHit2 = Math.max(90000, hit1Time + 40000);
      const hit2Time = minHit2 + Math.random() * (150000 - minHit2); // 90–150s
      const types = Math.random() < 0.5 ? ['bomb', 'diver'] : ['diver', 'bomb'];
      scheduledHits = [
        { time: hit1Time, type: types[0], triggered: false },
        { time: hit2Time, type: types[1], triggered: false }
      ];
    }
    scheduleHits();
```

- [ ] **Step 2: Update `renderHUD()` to use live `lives` variable (line 1386)**

Find:
```javascript
        ctx.fillText('LIVES: 3', 18, H - 26);
```

Replace with:
```javascript
        ctx.fillText('LIVES: ' + lives, 18, H - 26);
```

- [ ] **Step 3: Commit**

```bash
git add "Themes/Space Invaders.totheme/Documents/index.html"
git commit -m "feat: add player hit state variables, scheduleHits, live HUD counter"
```

---

## Task 2: Large Player Explosion

**Files:**
- Modify: `Themes/Space Invaders.totheme/Documents/index.html`

- [ ] **Step 1: Add `spawnPlayerExplosion()` directly after the closing brace of `spawnExplosion()` (after line 968)**

Find:
```javascript
      explosions.push({ x, y, color: color || COLOR_EXPLOSION, timer: 0, duration: 600, particles });
    }
```

Replace with:
```javascript
      explosions.push({ x, y, color: color || COLOR_EXPLOSION, timer: 0, duration: 600, particles });
    }

    function spawnPlayerExplosion(x, y) {
      const particles = [];
      // 45 large standard particles
      for (let i = 0; i < 45; i++) {
        const angle = (i / 45) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const speed = 60 + Math.random() * 100;
        const size = 4 + Math.random() * 8;
        const life = 0.4 + Math.random() * 0.6;
        const r = Math.random();
        const col = r < 0.4 ? '#ffffff' : (r < 0.75 ? '#ffdd44' : (r < 0.9 ? '#ff8800' : '#ff3300'));
        particles.push({ vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, px: x, py: y, size, life, color: col });
      }
      // 15 fast sparks
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 180 + Math.random() * 140;
        particles.push({ vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, px: x, py: y, size: 2, life: 0.2 + Math.random() * 0.4, color: '#ffffff' });
      }
      explosions.push({ x, y, color: '#ff8800', timer: 0, duration: 3000, particles, large: true });
    }
```

- [ ] **Step 2: Add extra shockwave rings in `renderExplosions()` for large explosions**

Find the closing of the ring shockwave block and the final `ctx.globalAlpha = 1;` reset (around line 1024):
```javascript
        // Ring shockwave
        if (t < 0.4) {
          const rt = t / 0.4;
          ctx.globalAlpha = (1 - rt) * 0.6;
          ctx.strokeStyle = e.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(e.x, e.y, rt * 32, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
```

Replace with:
```javascript
        // Ring shockwave
        if (t < 0.4) {
          const rt = t / 0.4;
          ctx.globalAlpha = (1 - rt) * 0.6;
          ctx.strokeStyle = e.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(e.x, e.y, rt * 32, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Extra rings for large (player) explosions
        if (e.large && t < 0.5) {
          const rt2 = Math.max(0, (t - 0.05) / 0.45);
          if (rt2 > 0) {
            ctx.globalAlpha = (1 - rt2) * 0.55;
            ctx.strokeStyle = '#ffdd44';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(e.x, e.y, rt2 * 70, 0, Math.PI * 2);
            ctx.stroke();
          }
          const rt3 = Math.max(0, (t - 0.10) / 0.45);
          if (rt3 > 0) {
            ctx.globalAlpha = (1 - rt3) * 0.45;
            ctx.strokeStyle = '#ff6600';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(e.x, e.y, rt3 * 110, 0, Math.PI * 2);
            ctx.stroke();
          }
          const rt4 = Math.max(0, (t - 0.15) / 0.45);
          if (rt4 > 0) {
            ctx.globalAlpha = (1 - rt4) * 0.3;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(e.x, e.y, rt4 * 150, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        ctx.globalAlpha = 1;
```

- [ ] **Step 3: Open the game in a browser and verify a large explosion looks correct**

Temporarily add `spawnPlayerExplosion(400, 300);` at the end of `scheduleHits()`, reload the page, confirm you see a large multi-ring explosion in the center. Remove the temporary call afterward.

- [ ] **Step 4: Commit**

```bash
git add "Themes/Space Invaders.totheme/Documents/index.html"
git commit -m "feat: add large player explosion with 60 particles and 4 shockwave rings"
```

---

## Task 3: `triggerPlayerDeath()`, `updatePlayerHit()`, and Death Sequence Rendering

**Files:**
- Modify: `Themes/Space Invaders.totheme/Documents/index.html`

- [ ] **Step 1: Add `triggerPlayerDeath()` and `updatePlayerHit()` after `spawnPlayerExplosion()`**

Find the closing brace of `spawnPlayerExplosion()` and the next section comment (which should be `// ─── Explosions` update block or similar). Insert immediately after `spawnPlayerExplosion`'s closing `}`:

```javascript
    function triggerPlayerDeath(px, py) {
      lives--;
      playerHit.active = true;
      playerHit.timer = 0;
      playerHit.x = px + PLAYER_W / 2;
      playerHit.y = py + PLAYER_H / 2;
      spawnPlayerExplosion(playerHit.x, playerHit.y);
    }

    function updatePlayerHit(delta) {
      if (!playerHit.active) return;
      playerHit.timer += delta;
      if (playerHit.timer >= 4500) {
        playerHit.active = false;
      }
    }
```

- [ ] **Step 2: Add `renderPlayerHit()` immediately after `renderExplosions()` closing brace (around line 1028)**

Find:
```javascript
        ctx.globalAlpha = 1;
      });
    }

    // ─── Enemy Bombs
```

Replace with:
```javascript
        ctx.globalAlpha = 1;
      });
    }

    function renderPlayerHit() {
      if (!playerHit.active) return;
      const t = playerHit.timer;

      // Screen flash: full-white overlay, fades 0–100ms
      if (t < 100) {
        ctx.globalAlpha = (1 - t / 100) * 0.75;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }

      // Lives message: blinks 500–2000ms
      if (t >= 500 && t < 2000) {
        const blinkCycle = Math.floor((t - 500) / 200);
        if (blinkCycle % 2 === 0) {
          const text = lives >= 2 ? '2 LIVES REMAINING' : '1 LIFE REMAINING';
          ctx.font = 'bold 72px "Share Tech Mono", "Courier New", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 35;
          ctx.fillStyle = '#ffffff';
          ctx.fillText(text, W / 2, H / 2);
          ctx.shadowBlur = 12;
          ctx.fillText(text, W / 2, H / 2);
          ctx.shadowBlur = 0;
        }
      }
    }

    // ─── Enemy Bombs
```

- [ ] **Step 3: Wire `renderPlayerHit()` into `render()` — add it after `renderExplosions()` and before `renderPlayer()`**

Find:
```javascript
      renderExplosions();
      renderPlayer();
```

Replace with:
```javascript
      renderExplosions();
      renderPlayerHit();
      renderPlayer();
```

- [ ] **Step 4: Wire `updatePlayerHit(delta)` and hit-scheduling into `update()`**

Find:
```javascript
    function update(delta, elapsed) {
      if (gamePhase === 'playing') {
```

Replace with:
```javascript
    function update(delta, elapsed) {
      // Check scheduled hits
      if (gamePhase === 'playing') {
        scheduledHits.forEach(hit => {
          if (!hit.triggered && elapsed >= hit.time && !playerHit.active) {
            hit.triggered = true;
            if (hit.type === 'bomb') spawnScriptedBomb();
            else spawnScriptedDiver();
          }
        });
      }
      updatePlayerHit(delta);

      if (gamePhase === 'playing') {
```

- [ ] **Step 5: Commit**

```bash
git add "Themes/Space Invaders.totheme/Documents/index.html"
git commit -m "feat: add triggerPlayerDeath, updatePlayerHit, renderPlayerHit with flash and lives message"
```

---

## Task 4: Disable Player Movement and Shooting During Death

**Files:**
- Modify: `Themes/Space Invaders.totheme/Documents/index.html`

- [ ] **Step 1: Add early return to `updatePlayer()` when death sequence is active**

Find the first line of `updatePlayer()`:
```javascript
    function updatePlayer(delta, elapsed) {
      const playerCX = player.x + PLAYER_W / 2;
```

Replace with:
```javascript
    function updatePlayer(delta, elapsed) {
      if (playerHit.active) return;
      const playerCX = player.x + PLAYER_W / 2;
```

- [ ] **Step 2: Add early return to `updateBullets()` when death sequence is active**

Find:
```javascript
    function updateBullets(delta, elapsed) {
      if (gamePhase !== 'playing') return;

      const aliveEnemies = enemies.filter(e => e.alive);
```

Replace with:
```javascript
    function updateBullets(delta, elapsed) {
      if (gamePhase !== 'playing') return;
      if (playerHit.active) return;

      const aliveEnemies = enemies.filter(e => e.alive);
```

- [ ] **Step 3: Update `renderPlayer()` to hide/respawn the ship during the death sequence**

Find the entire `renderPlayer()` function:
```javascript
    function renderPlayer() {
      if (gamePhase === 'gameover') return;

      const color = (rechargeTimer > 0) ? '#4488ff' : COLOR_PLAYER;
      if (!playerCache[color]) {
        playerCache[color] = createHiResPlayer(color, PLAYER_W, PLAYER_H);
      }
      const oc = playerCache[color];
      ctx.drawImage(oc, 0, 0, oc.width, oc.height, player.x, player.y, PLAYER_W, PLAYER_H);

      // Recharge bar with gradient
      if (rechargeTimer > 0) {
        const barW = (rechargeTimer / RECHARGE_DELAY) * PLAYER_W;
        const grad = ctx.createLinearGradient(player.x, 0, player.x + barW, 0);
        grad.addColorStop(0, '#ff2222');
        grad.addColorStop(1, '#ff6644');
        ctx.fillStyle = grad;
        ctx.fillRect(player.x, player.y + PLAYER_H + 5, barW, 3);
      }
    }
```

Replace with:
```javascript
    function renderPlayer() {
      if (gamePhase === 'gameover') return;

      if (playerHit.active) {
        const t = playerHit.timer;
        if (t < 3000) return; // ship is destroyed, hide it

        // Respawn slide: ship enters from below (3000–4000ms)
        let renderY = player.y;
        if (t < 4000) {
          const progress = (t - 3000) / 1000;
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          renderY = (H + 30) + (player.y - (H + 30)) * eased;
        }

        // Invulnerability flicker: alternate visible/hidden every 100ms (3000–4500ms)
        if (Math.floor(t / 100) % 2 === 1) return;

        const color = COLOR_PLAYER;
        if (!playerCache[color]) {
          playerCache[color] = createHiResPlayer(color, PLAYER_W, PLAYER_H);
        }
        const oc = playerCache[color];
        ctx.drawImage(oc, 0, 0, oc.width, oc.height, player.x, renderY, PLAYER_W, PLAYER_H);
        return;
      }

      // Normal rendering
      const color = (rechargeTimer > 0) ? '#4488ff' : COLOR_PLAYER;
      if (!playerCache[color]) {
        playerCache[color] = createHiResPlayer(color, PLAYER_W, PLAYER_H);
      }
      const oc = playerCache[color];
      ctx.drawImage(oc, 0, 0, oc.width, oc.height, player.x, player.y, PLAYER_W, PLAYER_H);

      // Recharge bar with gradient
      if (rechargeTimer > 0) {
        const barW = (rechargeTimer / RECHARGE_DELAY) * PLAYER_W;
        const grad = ctx.createLinearGradient(player.x, 0, player.x + barW, 0);
        grad.addColorStop(0, '#ff2222');
        grad.addColorStop(1, '#ff6644');
        ctx.fillStyle = grad;
        ctx.fillRect(player.x, player.y + PLAYER_H + 5, barW, 3);
      }
    }
```

- [ ] **Step 4: Commit**

```bash
git add "Themes/Space Invaders.totheme/Documents/index.html"
git commit -m "feat: disable player movement/shooting during death, add respawn slide animation"
```

---

## Task 5: Scripted Bomb Hit

**Files:**
- Modify: `Themes/Space Invaders.totheme/Documents/index.html`

- [ ] **Step 1: Add `spawnScriptedBomb()` after `spawnBomb()` (after line 1043)**

Find the closing brace of `spawnBomb()`:
```javascript
      bombs.push({ x: bx, y: by, frame: 0, frameTimer: 0 });
    }
```

Replace with:
```javascript
      bombs.push({ x: bx, y: by, frame: 0, frameTimer: 0 });
    }

    function spawnScriptedBomb() {
      // Spawn at the lowest living enemy row Y, directly above the player
      let lowestY = gridY + 10;
      enemies.forEach(e => {
        if (e.alive && !e.diving) {
          const ey = e.y + gridY + ENEMY_H;
          if (ey > lowestY) lowestY = ey;
        }
      });
      const bx = player.x + PLAYER_W / 2;
      bombs.push({ x: bx, y: Math.max(10, lowestY), frame: 0, frameTimer: 0, scripted: true });
    }
```

- [ ] **Step 2: Modify `updateBombs()` to handle scripted bombs — skip barrier damage and detect player hit**

Find inside the `bombs = bombs.filter(b => {` block, the barrier damage section:
```javascript
        // Damage barriers
        barriers.forEach(bar => {
          bar.blocks.forEach(bl => {
            if (bl.hp <= 0) return;
            const bkx = bar.x + bl.c * 10;
            const bky = bar.y + bl.r * 8;
            if (b.x >= bkx && b.x <= bkx + 9 && b.y >= bky && b.y <= bky + 7) {
              bl.hp--;
            }
          });
        });

        return b.y < H + 20;
```

Replace with:
```javascript
        // Scripted bomb: check if it has reached the player
        if (b.scripted && !playerHit.active) {
          if (b.y >= player.y && b.y <= player.y + PLAYER_H + 5) {
            triggerPlayerDeath(player.x, player.y);
            return false; // remove bomb on hit
          }
        }

        // Damage barriers (skip for scripted bombs)
        if (!b.scripted) {
          barriers.forEach(bar => {
            bar.blocks.forEach(bl => {
              if (bl.hp <= 0) return;
              const bkx = bar.x + bl.c * 10;
              const bky = bar.y + bl.r * 8;
              if (b.x >= bkx && b.x <= bkx + 9 && b.y >= bky && b.y <= bky + 7) {
                bl.hp--;
              }
            });
          });
        }

        return b.y < H + 20;
```

- [ ] **Step 3: Skip evasion of scripted bombs in `updatePlayer()`**

Find the bomb evasion block (inside `updatePlayer()`):
```javascript
      // --- Threat 2: falling bombs ---
      if (!threatened) {
        bombs.forEach(b => {
          const impactX = predictedImpactX(b.x, b.y, 0, BOMB_SPEED);
```

Replace with:
```javascript
      // --- Threat 2: falling bombs ---
      if (!threatened) {
        bombs.forEach(b => {
          if (b.scripted) return; // don't evade scripted (hit-destined) bombs
          const impactX = predictedImpactX(b.x, b.y, 0, BOMB_SPEED);
```

- [ ] **Step 4: Commit**

```bash
git add "Themes/Space Invaders.totheme/Documents/index.html"
git commit -m "feat: add scripted bomb that ignores evasion and triggers player death on contact"
```

---

## Task 6: Scripted Diver Hit

**Files:**
- Modify: `Themes/Space Invaders.totheme/Documents/index.html`

- [ ] **Step 1: Add `spawnScriptedDiver()` after `spawnDiver()` (after line 1119)**

Find the closing brace of `spawnDiver()`:
```javascript
      diver.diveReturnX = diver.diveTargetX + missOffset * 0.8;
      diver.diveReturnY = H + 70;
    }
```

Replace with:
```javascript
      diver.diveReturnX = diver.diveTargetX + missOffset * 0.8;
      diver.diveReturnY = H + 70;
    }

    function spawnScriptedDiver() {
      const alive = enemies.filter(e => e.alive && !e.diving);
      if (alive.length === 0) return;
      const diver = alive[Math.floor(Math.random() * alive.length)];
      diver.diving = true;
      diver.scripted = true;
      diver.diveProgress = 0;
      diver.diveStartX = diver.x + gridX;
      diver.diveStartY = diver.y + gridY;
      diver.diveTargetX = player.x + PLAYER_W / 2; // zero miss offset — hits player center
      diver.diveTargetY = player.y + PLAYER_H / 2;
      diver.diveReturnX = diver.diveTargetX;
      diver.diveReturnY = H + 70;
    }
```

- [ ] **Step 2: Add player hit detection for scripted divers in `updateDivers()`**

Inside `updateDivers()`, find the phase-1 movement block that sets `e.x` and `e.y`:
```javascript
          e.x = baseX + swirlDir * swirlAmp * Math.sin(t * Math.PI * 4);
          e.y = baseY;
        } else {
```

Replace with:
```javascript
          e.x = baseX + swirlDir * swirlAmp * Math.sin(t * Math.PI * 4);
          e.y = baseY;

          // Scripted diver: check if it has reached the player
          if (e.scripted && !playerHit.active) {
            const ddx = e.x - (player.x + PLAYER_W / 2);
            const ddy = e.y - (player.y + PLAYER_H / 2);
            if (Math.sqrt(ddx * ddx + ddy * ddy) < 18) {
              triggerPlayerDeath(player.x, player.y);
              e.alive = false;
              e.diving = false;
            }
          }
        } else {
```

- [ ] **Step 3: Skip evasion of scripted divers in `updatePlayer()`**

Find the diver evasion loop (inside `updatePlayer()`):
```javascript
      enemies.forEach(e => {
        if (!e.alive || !e.diving) return;
        const diverCX = e.x + ENEMY_W / 2;
```

Replace with:
```javascript
      enemies.forEach(e => {
        if (!e.alive || !e.diving || e.scripted) return; // skip scripted divers
        const diverCX = e.x + ENEMY_W / 2;
```

- [ ] **Step 4: Commit**

```bash
git add "Themes/Space Invaders.totheme/Documents/index.html"
git commit -m "feat: add scripted diver that ignores evasion and triggers player death on contact"
```

---

## Task 7: End-to-End Verification

**Files:**
- Read: `Themes/Space Invaders.totheme/Documents/index.html`

- [ ] **Step 1: Temporarily force both hits to occur at 5s and 15s for testing**

Find `scheduleHits()` and change the times to:
```javascript
    function scheduleHits() {
      scheduledHits = [
        { time: 5000,  type: 'bomb',  triggered: false },
        { time: 15000, type: 'diver', triggered: false }
      ];
    }
```

- [ ] **Step 2: Open the game and verify the full sequence for the bomb hit at 5s**

Checklist to observe:
- At ~5s: a bomb appears above the ship and falls without the ship evading
- Bomb visually connects with the ship
- Full-screen white flash fires
- Large explosion (3 rings expanding, many particles) at ship position for ~3s
- Ship disappears
- "2 LIVES REMAINING" blinks in center, approximately 4–5 blinks over 1.5s
- HUD shows "LIVES: 2" immediately
- At ~8s: ship slides up from bottom with ease-out curve
- Ship flickers for ~1.5s then resumes normal play and shooting

- [ ] **Step 3: Let game run to 15s and verify the diver hit**

Checklist:
- A diver spawns and swoops directly at the player without evasion
- On contact: same explosion, flash, message showing "1 LIFE REMAINING"
- HUD shows "LIVES: 1"
- Ship respawns, game continues normally to completion

- [ ] **Step 4: Restore real hit timing**

Restore `scheduleHits()` to the original random timing:
```javascript
    function scheduleHits() {
      const hit1Time = (25 + Math.random() * 45) * 1000; // 25–70s
      const minHit2 = Math.max(90000, hit1Time + 40000);
      const hit2Time = minHit2 + Math.random() * (150000 - minHit2); // 90–150s
      const types = Math.random() < 0.5 ? ['bomb', 'diver'] : ['diver', 'bomb'];
      scheduledHits = [
        { time: hit1Time, type: types[0], triggered: false },
        { time: hit2Time, type: types[1], triggered: false }
      ];
    }
```

- [ ] **Step 5: Final commit**

```bash
git add "Themes/Space Invaders.totheme/Documents/index.html"
git commit -m "feat: restore random hit timing after verification"
```
