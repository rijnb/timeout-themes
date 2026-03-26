# Space Invaders Countdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `MM:SS` countdown timer at the top center of the Space Invaders theme, counting down from 3 minutes.

**Architecture:** Add a `formatTime(ms)` helper function and update `renderHUD()` in `Themes/Space Invaders.totheme/Documents/index.html` to display the remaining time.

**Tech Stack:** JavaScript (HTML5 Canvas), HTML/CSS.

---

### Task 1: Add formatTime Helper Function ✓

**Files:**
- Modify: `Themes/Space Invaders.totheme/Documents/index.html` (approx line 111-112)

- [x] **Step 1: Define the `formatTime` helper function**

```javascript
    function formatTime(ms) {
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    }
```

- [x] **Step 2: Add it after the `spriteColor` function in `index.html`**

- [x] **Step 3: Commit (skipped as per guidelines - only if requested)**

---

### Task 2: Update HUD to Display Countdown ✓

**Files:**
- Modify: `Themes/Space Invaders.totheme/Documents/index.html` (approx line 762-775)

- [x] **Step 1: Calculate `timeLeft` in `renderHUD`**

```javascript
      const timeLeft = Math.max(0, TOTAL_DURATION - elapsed);
      const formattedTime = formatTime(timeLeft);
```

- [x] **Step 2: Add the `ctx.fillText` call for the countdown**

```javascript
      ctx.textAlign = 'center';
      ctx.fillText(formattedTime, W / 2, 8);
```

- [x] **Step 3: Update `renderHUD` in `index.html`**

---

### Task 3: Verification ✓

**Files:**
- Manual Check: `Themes/Space Invaders.totheme/Documents/index.html`

- [x] **Step 1: Verify the countdown shows `03:00` at start**
- [x] **Step 2: Verify the countdown shows `00:00` at `TOTAL_DURATION`**
- [x] **Step 3: Verify alignment and color (should be red `#ff4444`)**
