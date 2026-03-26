# Space Invaders Theme — Design Spec

**Date:** 2026-03-26  
**Author:** Junie

---

## Overview

A timeout theme that recreates the classic Atari Space Invaders arcade game as a fully animated, self-playing demo. The animation runs for exactly 3 minutes and ends with a retro "GAME OVER" screen.

---

## Visual Style

- Black background
- Green/white pixel-art aesthetic (classic arcade CRT look)
- Pixel/monospace font (e.g. "Press Start 2P" from Google Fonts or embedded fallback)
- Optional scanline overlay for CRT effect
- All motion is smooth but retro-feeling

---

## Game Elements

### Enemies (56 total)
- Arranged in a 7-row × 8-column grid at the top of the screen
- Two alternating sprite frames (classic invader wiggle animation)
- Three visual types (rows 1, rows 2-3, rows 4-5+) with different pixel shapes
- Grid moves left and right, stepping down each time it hits a wall
- Speed increases slightly as enemies are destroyed

### Player (Shooter)
- Positioned at the bottom of the screen
- Moves left and right continuously, evading bombs and diving enemies
- Never gets hit — evasion is scripted/guaranteed
- Fires a bullet upward every 3 seconds, always hitting one enemy

### Enemy Bullets (Bombs)
- Enemies periodically fire bombs downward
- Bombs always narrowly miss the player (scripted to avoid collision)
- Multiple bombs can be on screen simultaneously

### Diving Enemies
- Periodically, one enemy breaks formation and dives toward the player
- Follows a curved or angled path toward the player's position
- Always misses — veers off at the last moment
- Returns to formation (or is removed) after the dive

### Player Bullet
- One bullet at a time fires upward from the player
- Travels to the targeted enemy and destroys it
- Enemy explodes with a brief flash/particle effect

---

## Timeline

| Time | Event |
|------|-------|
| 0:00 | Animation starts, all 56 enemies in grid, player at bottom |
| Every 3s | Player fires, 1 enemy destroyed |
| 0:00–2:48 | 56 enemies destroyed (56 × 3s = 168s) |
| ~2:48 | Last enemy destroyed |
| 2:48–2:58 | "GAME OVER" displayed in large retro pixel text |
| 3:00 | Animation ends |

---

## Architecture

Single self-contained file: `Documents/index.html`  
All CSS and JS embedded inline (no external dependencies except optional Google Font).

### JS Structure
- `GameState` object: tracks enemies alive, time, player position, bullets, bombs
- `requestAnimationFrame` game loop
- Enemy grid logic: position, movement, sprite toggling
- Player logic: scripted evasion path
- Bullet logic: fire every 3s, target next enemy
- Bomb logic: enemies fire at intervals, scripted to miss
- Dive logic: periodic enemy breaks formation, scripted miss
- Render: canvas-based or DOM-based (canvas preferred for pixel art)
- End sequence: GAME OVER text after last enemy destroyed

### Rendering
- HTML5 `<canvas>` element, centered in a container
- 60% of the viewport width and height
- Pixel art drawn with canvas 2D API (rectangles for sprites)
- No external image assets — all sprites drawn programmatically

---

## File Structure

```
Themes/Space Invaders.totheme/
  Info.json
  Documents/
    index.html   ← single file, all CSS+JS inline
```

### Info.json
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

---

## Success Criteria

- Exactly 56 enemies, destroyed one every 3 seconds
- Player never gets hit
- Animation runs for ~3 minutes total
- "GAME OVER" shown for ~10 seconds at the end
- Retro pixel art aesthetic throughout
- No external assets required (self-contained)
