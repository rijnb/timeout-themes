# 15 Seconds Theme — Multi-Mode Countdown Design

**Date:** 2026-04-05

## Overview

The 15 Seconds theme currently has one countdown animation (neon 3D corridor). This spec adds two new animations — a balloon pop and an animal race — and a random dispatcher that picks one at load time.

---

## Architecture

### File structure

```
Themes/15 Seconds.totheme/Documents/
  index.html                        ← add two new <script> tags
  assets/
    css/style.css                   ← unchanged
    js/
      script.js                     ← becomes dispatcher only (~10 lines)
      countdown-neon.js             ← existing script.js code, renamed; exposes startNeon()
      countdown-balloons.js         ← new; exposes startBalloons()
      countdown-animals.js          ← new; exposes startAnimals()
```

### Dispatcher (`script.js`)

```js
// Scripts are loaded at end of <body>, DOM is already available
const modes = [startNeon, startBalloons, startAnimals];
modes[Math.floor(Math.random() * modes.length)]();
```

Each module function is called directly (no `DOMContentLoaded` wrapper needed — scripts load after DOM). Modules must not auto-start; they only run when their `start*()` function is called.

Each module is fully self-contained: owns its DOM creation, any extra CSS-in-JS styles, and its own timing loop. No shared state between modules.

### `index.html` change

Add script tags for the three modules before the dispatcher:

```html
<script src="assets/js/countdown-neon.js"></script>
<script src="assets/js/countdown-balloons.js"></script>
<script src="assets/js/countdown-animals.js"></script>
<script src="assets/js/script.js"></script>
```

---

## Mode 1: Neon Corridor (existing)

No functional changes. Code moved from `script.js` to `countdown-neon.js`, wrapped in a `startNeon()` function. The `DOMContentLoaded` auto-start is removed (dispatcher calls `startNeon()` instead).

---

## Mode 2: Balloon Pop (`countdown-balloons.js`)

### Layout

- 16 CSS balloons (numbers 15→0) rendered at page load, spread horizontally across the full viewport width.
- Each balloon: a colored oval with the number printed inside, a thin string below.
- Colors use the same rainbow palette as the neon mode (index = `TOTAL_SECONDS - number`).
- Balloons start near the top of the screen (~15% from top).

### Idle animation

Each balloon has a CSS keyframe sway animation (sinusoidal left/right). Each balloon gets a randomised phase offset and amplitude (±10–20px) so they don't move in sync.

### Tick behavior

At each second tick, starting at t=1s:
1. The balloon for the current number (15, 14, 13…) **pops**:
   - Scale up to ~1.3× over 100ms, then scale to 0 over 150ms (removed from DOM after).
   - Emit 6–8 small particle divs that fly outward radially and fade over ~500ms, then are removed.
2. All remaining balloons drift downward by a small increment (~3–4% of viewport height) with a CSS transition, so the sky empties gradually.

### End state

After balloon 0 pops, all particles fade. Screen is empty.

---

## Mode 3: Animal Race (`countdown-animals.js`)

### Layout

- 16 horizontal lanes (numbers 15→0), evenly distributed vertically across the viewport.
- Each lane has a subtle dark-grey track line spanning the full width.
- Animals are large emoji (~3–4rem font size).
- A number label floats above each animal in the corresponding rainbow color.

### Animal set (fixed order, lane 1–16 top to bottom)

🐌 🐢 🦔 🐿️ 🐓 🦆 🐧 🐻 🦒 🐘 🦊 🐇 🦁 🐆 🦅 🐝

Slowest-looking animals at the top, fastest at the bottom. The comedy comes from the animal choice, not speed — all animals move at the same speed.

### Timing

- Animal 15 enters from the left at t=1s.
- Each subsequent animal (14, 13…) enters 1 second later.
- All animals move at the same constant speed (traverse full viewport width in ~3s).
- When an animal exits the right edge it is removed.

### End state

After animal 0 exits the right edge, the screen is empty.

---

## Shared constants

Both new modules use `TOTAL_SECONDS = 15` and the same `rainbowColors` array as the neon mode. These are duplicated per module (no shared file) to keep modules self-contained.
