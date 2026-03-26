# Space Invaders Timing Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update Space Invaders theme to 90 enemies (15x6) and implement rhythmic burst firing over a 2:45 (165s) duration.

**Architecture:** 
- Modify constants in `index.html` for grid and timing.
- Adjust `generateMilestones()` for 90 enemies over 165s.
- Update `updateBullets()` to implement burst firing (3-5 bullets) with recharge delays (~6.5-7s).
- Add a visual recharging indicator on the player ship.

**Tech Stack:** JavaScript, HTML5 Canvas.

---

### Task 1: Update Grid and Timing Constants

**Files:**
- Modify: `Themes/Space Invaders.totheme/Documents/index.html:46-50`
- Modify: `Themes/Space Invaders.totheme/Documents/index.html:163-164`

- [ ] **Step 1: Update constants for 90 enemies and grid dimensions**

```javascript
    const TOTAL_DURATION      = 180000; // 3 minutes in ms
    const GAME_OVER_DURATION   =  10000; // 10 seconds
    const SHOOT_DEADLINE       = 165000; // all enemies must be shot by 2m45s
    const ENEMY_COLS = 15, ENEMY_ROWS = 6;
    const TOTAL_ENEMIES = ENEMY_COLS * ENEMY_ROWS; // 90
```

- [ ] **Step 2: Adjust spacing to fit 15 columns**

```javascript
    const ENEMY_W = 36, ENEMY_H = 28, ENEMY_PAD_X = 14, ENEMY_PAD_Y = 10;
    const GRID_OFFSET_X = 25, GRID_OFFSET_Y = 55;
```

- [ ] **Step 3: Run the theme (manually verify the grid is 15x6 and fits the screen)**

---

### Task 2: Adjust Milestone Generation for 90 Enemies

**Files:**
- Modify: `Themes/Space Invaders.totheme/Documents/index.html:53-89`

- [ ] **Step 1: Update `generateMilestones` to better distribute 90 kills**

```javascript
    function generateMilestones() {
      const deadline = SHOOT_DEADLINE;
      const total = TOTAL_ENEMIES;
      let currentTime = 0;
      let remainingTime = deadline;
      let remainingEnemies = total;

      for (let i = 0; i < total - 1; i++) {
        const avg = remainingTime / remainingEnemies;
        // Jitter between 0.5 and 1.5 of average
        const interval = avg * (0.5 + Math.random() * 1.0);
        currentTime += interval;
        destructionMilestones.push(currentTime);
        remainingTime -= interval;
        remainingEnemies--;

        if (currentTime > deadline - 500) {
           currentTime = deadline - 500;
        }
      }
      destructionMilestones.push(deadline);
      destructionMilestones.sort((a, b) => a - b);
    }
```

- [ ] **Step 2: Verify milestones are generated and correctly ordered**

---

### Task 3: Implement Rhythmic Burst Firing Logic

**Files:**
- Modify: `Themes/Space Invaders.totheme/Documents/index.html:393-458`

- [ ] **Step 1: Add state variables for burst firing**

```javascript
    let bullets = [];
    let nextEnemyIndex = 0;
    let burstRemaining = 0;
    let burstTimer = 0;
    let rechargeTimer = 0;
    const BURST_SHOT_DELAY = 200; // ms between shots in a burst
    const RECHARGE_DELAY = 6800;  // ms between bursts (spread 90 kills over 165s)
```

- [ ] **Step 2: Update `updateBullets` with burst and recharge logic**

```javascript
    function updateBullets(delta, elapsed) {
      if (gamePhase !== 'playing') return;

      const enemiesAliveCount = enemies.filter(e => e.alive).length;
      if (enemiesAliveCount === 0) return;

      // Handle timers
      if (rechargeTimer > 0) {
        rechargeTimer -= delta;
      }
      if (burstTimer > 0) {
        burstTimer -= delta;
      }

      const milestoneIdx = TOTAL_ENEMIES - enemiesAliveCount;
      if (milestoneIdx >= TOTAL_ENEMIES) return;

      const targetMilestone = destructionMilestones[milestoneIdx];
      const target = getNextTarget();

      if (target && rechargeTimer <= 0 && burstTimer <= 0) {
        // Start a new burst if we are ready and not currently in one
        if (burstRemaining <= 0) {
          burstRemaining = Math.floor(Math.random() * 3) + 3; // 3 to 5
        }

        const ex = target.diving ? target.x : target.x + gridX;
        const ey = target.diving ? target.y : target.y + gridY;
        const travelTime = (player.y - ey) / BULLET_SPEED;
        const fireTime = targetMilestone - travelTime;

        if (elapsed >= fireTime) {
          const px = player.x + PLAYER_W / 2;
          const futureX = ex + (target.diving ? 0 : gridVelocity * travelTime) + ENEMY_W / 2;
          
          // Accuracy: prioritize alignment but allow some misses if overdue
          const aligned = Math.abs(futureX - px) < 15;
          const overdue = elapsed > fireTime + 300;

          if (aligned || overdue) {
            bullets.push({
              x: px,
              y: player.y,
              targetEnemy: target,
              predictedX: futureX
            });
            burstRemaining--;
            if (burstRemaining > 0) {
              burstTimer = BURST_SHOT_DELAY;
            } else {
              rechargeTimer = RECHARGE_DELAY;
            }
          }
        }
      }
    }
      // ... (collision detection part remains same)
```

- [ ] **Step 3: Verify firing pattern matches 3-5 bullets followed by a long pause**

---

### Task 4: Add Recharging Indicator to Player Ship

**Files:**
- Modify: `Themes/Space Invaders.totheme/Documents/index.html:343-379` (renderPlayer)

- [ ] **Step 1: Modify `renderPlayer` to change color or add an indicator when recharging**

```javascript
    function renderPlayer() {
      if (gamePhase === 'gameover') return;
      const pw = PLAYER_W / 11;
      const ph = PLAYER_H / 6;
      
      // Change color when recharging
      ctx.fillStyle = rechargeTimer > 0 ? '#555555' : COLOR_PLAYER;
      
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

      // Small recharging bar if you want more visual feedback
      if (rechargeTimer > 0) {
        const barWidth = (rechargeTimer / RECHARGE_DELAY) * PLAYER_W;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(player.x, player.y + PLAYER_H + 5, barWidth, 3);
      }
    }
```

- [ ] **Step 2: Run and verify the visual feedback matches the recharge state**

---

### Task 5: Final Tuning and Verification

**Files:**
- Modify: `Themes/Space Invaders.totheme/Documents/index.html`

- [ ] **Step 1: Verify the game finishes near 2:45 (165s) with 90 enemies destroyed**
- [ ] **Step 2: Adjust `RECHARGE_DELAY` if needed to better match the deadline**
- [ ] **Step 3: Ensure all 90 enemies are hit and no bullets are leaked**
