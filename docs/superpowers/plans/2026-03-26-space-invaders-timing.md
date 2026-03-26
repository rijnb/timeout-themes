# Space Invaders Exact 2:45 Shooting Pace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure the 56th enemy is hit exactly at 165,000ms.

**Architecture:** Pre-calculates 56 destruction milestones, the last being 165s. Firing logic accounts for bullet travel time.

**Tech Stack:** JavaScript (Browser)

---

### Task 1: Add Milestone Generation

**Files:**
- Modify: `Themes/Space Invaders.totheme/Documents/index.html`

- [ ] **Step 1: Define `destructionMilestones` and `generateMilestones` function**

```javascript
// Near constants
const destructionMilestones = [];

function generateMilestones() {
  const totalEnemies = 56;
  const deadline = 165000;
  // Generate a random sequence that sums to 165000
  // Start with average interval
  let avgInterval = deadline / totalEnemies; // ~2946ms
  let currentTime = 0;
  for (let i = 0; i < totalEnemies - 1; i++) {
    // Add some jitter for randomness
    let interval = avgInterval * (0.5 + Math.random());
    currentTime += interval;
    destructionMilestones.push(currentTime);
  }
  // Ensure the last one is exact
  destructionMilestones.push(deadline);
  // Sort them just in case
  destructionMilestones.sort((a, b) => a - b);
}
```

- [ ] **Step 2: Call `generateMilestones` at initialization**
- [ ] **Step 3: Commit**

### Task 2: Refactor Shooting Logic to use Milestones

**Files:**
- Modify: `Themes/Space Invaders.totheme/Documents/index.html`

- [ ] **Step 1: Replace `scheduleNextShot` and `shootTimer` logic with milestone checks**
- [ ] **Step 2: Calculate `fireTime` based on `milestone - travelTime`**

```javascript
const targetMilestone = destructionMilestones[nextEnemyIndex];
const travelTime = (player.y - ey) / BULLET_SPEED;
const fireTime = targetMilestone - travelTime;

if (elapsed >= fireTime) {
  // Fire bullet...
}
```

- [ ] **Step 3: Update `updatePlayer` to prioritize positioning for the upcoming milestone**
- [ ] **Step 4: Commit**

### Task 3: Implement Drift Compensation

**Files:**
- Modify: `Themes/Space Invaders.totheme/Documents/index.html`

- [ ] **Step 1: Add logic to "catch up" if the current milestone is in the past**
- [ ] **Step 2: Commit**

### Task 4: Verification

**Files:**
- Modify: `Themes/Space Invaders.totheme/Documents/index.html`

- [ ] **Step 1: Add a `console.log` to track the exact timestamp of the 56th hit**
- [ ] **Step 2: Run and verify**
- [ ] **Step 3: Commit**
