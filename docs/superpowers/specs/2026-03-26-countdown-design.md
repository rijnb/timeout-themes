# Space Invaders - Countdown Design Spec

**Date:** 2026-03-26  
**Author:** Junie

---

## Overview

A countdown timer at the top center of the Space Invaders theme, showing the remaining time until the 3-minute `TOTAL_DURATION` is reached.

---

## Visual Style

- **Color:** `#ff4444` (`COLOR_ENEMY_A`), matching the "SCORE" label.
- **Font:** `15px "Courier New", Courier, monospace`, consistent with the HUD.
- **Position:** Top center of the canvas (`W / 2`, `8px` from the top).
- **Format:** `MM:SS` (e.g., `02:59`).

---

## Logic

- **Calculation:** `timeLeft = Math.max(0, TOTAL_DURATION - elapsed)`.
- **Formatting:** A helper function `formatTime(ms)` will:
  - Calculate `totalSeconds = Math.floor(ms / 1000)`.
  - Calculate `minutes = Math.floor(totalSeconds / 60)`.
  - Calculate `seconds = totalSeconds % 60`.
  - Return formatted string `min:sec` with zero-padding (e.g., `01:05`).
- **Update:** `renderHUD()` will call `formatTime` and draw the string using `ctx.textAlign = 'center'`.

---

## Success Criteria

- Countdown starts at `03:00` and counts down to `00:00`.
- Stops at `00:00` even if the game continues (though `TOTAL_DURATION` should match the game's end).
- Fits perfectly between the "SCORE" and "INVADERS" labels in the HUD.
- Matches the retro aesthetic.
