# Player Hit Sequence — Space Invaders Theme

**Date:** 2026-03-27
**Status:** Approved

## Summary

The player's spaceship is hit exactly twice during the 3-minute game. Each hit is scripted at a pre-determined time and triggered by either a bomb or a diving alien visually connecting with the ship. The hit triggers a death sequence: large explosion, lives message, and respawn animation. The game does not pause during the sequence.

---

## Hit Scheduling

At game start, pre-schedule 2 hit events:

- **Hit 1**: random time between 25–70 seconds into the game
- **Hit 2**: random time between 90–150 seconds (always at least 40s after Hit 1)
- Each hit is randomly assigned as either **bomb** or **diver** — one of each, random order per playthrough

---

## Hit Trigger Mechanics

### Bomb Hit
1. At the scheduled time, spawn a "scripted" bomb at the player's current X position, at the Y of the lowest living enemy row (natural spawn height).
2. The bomb is flagged as `scripted: true` so the player AI skips evasion for it.
3. The bomb falls at normal speed (175 px/s).
4. When it reaches the player's Y position (within ~10px), the death sequence triggers.

### Diver Hit
1. At the scheduled time, spawn a "scripted" diver aimed exactly at the player's current X center (miss offset = 0).
2. The diver is flagged as `scripted: true` so the player AI skips evasion for it.
3. When the diver center reaches within ~10px of the player center, the death sequence triggers.

---

## Death Sequence

Total duration: ~4.5 seconds. The game continues normally (enemies move, bombs fall, clock ticks) throughout.

| Phase | Start | End | Description |
|-------|-------|-----|-------------|
| Impact flash | 0.0s | 0.1s | Full-screen white flash at full opacity, fades quickly |
| Explosion | 0.0s | 3.0s | Large particle explosion at player position; ship hidden |
| Lives message | 0.5s | 2.0s | Large centered blinking text showing remaining lives |
| Respawn | 3.0s | 4.0s | Ship slides up from below the canvas to home position |
| Invulnerability | 3.0s | 4.5s | Ship flickers to indicate post-respawn invulnerability |

### State Tracking

A `playerHit` state object manages the sequence:
```
playerHit: {
  active: false,
  phase: null,         // 'exploding' | 'message' | 'respawning' | 'invulnerable'
  timer: 0,            // elapsed time within the sequence
  x: 0, y: 0          // position where hit occurred
}
```

Lives start at 3. On first hit: lives → 2. On second hit: lives → 1. Lives are never reduced to 0 (the game continues normally after both hits).

---

## Large Explosion

Significantly larger than the standard enemy kill explosion (which uses 28 particles over 600ms).

- **Particle count**: ~60 particles total
  - 45 standard particles: size 4–12px, speed 60–160 px/s, lifetime 0.8–1.5s
  - 15 spark particles: size 2px, speed 180–320 px/s, lifetime 0.4–0.8s
- **Shockwave rings**: 3–4 concentric rings expanding from center, visible for the first 40% of duration
- **Duration**: 3000ms
- **Colors**: white (40%), yellow/orange (50%), red (10%)
- **Physics**: gravity 80 px/s², damping 0.96

---

## Lives Message

- **Position**: centered on canvas (horizontal and vertical)
- **Font size**: ~90px, bold, arcade-style (same font as HUD)
- **Color**: white or bright yellow
- **Text**:
  - After first hit: `"2 LIVES REMAINING"`
  - After second hit: `"1 LIFE REMAINING"`
- **Blink timing**: appears at 0.5s into sequence, blinks 4–5 times over ~1.5s (on/off every 200ms), fully fades by 2.0s
- **HUD lives counter**: decrements immediately when the death sequence starts

---

## Respawn Animation

- Ship starts just below the bottom canvas edge (off-screen)
- Slides up to home Y position over 0.8s with ease-out curve
- On arrival: brief white shimmer pulse (flash at full opacity, decay over 0.3s)
- Post-respawn: ship flickers (alternates visible/hidden every 100ms) for ~1.5s to indicate invulnerability
- During invulnerability, no further scripted hits can trigger (safety guard)

---

## Implementation Scope

### Files to modify
- `Themes/Space Invaders.totheme/Documents/index.html` — all game code is in this single file

### New additions
- `scheduledHits` array: pre-computed at game start, holds `{ time, type }` objects
- `playerHit` state object: tracks active death sequence
- `spawnScriptedBomb(x, y)`: spawns a bomb flagged as scripted
- `spawnScriptedDiver(targetX)`: spawns a diver with zero miss offset, flagged as scripted
- `triggerPlayerDeath(x, y)`: initializes `playerHit` state
- `updatePlayerHit(dt)`: advances death sequence phases
- `renderPlayerHit()`: renders explosion, flash, message, respawn
- `renderLivesMessage()`: renders the centered blinking lives text
- `createHiResPlayerExplosion()`: large cached explosion sprite / particle config

### Modifications to existing functions
- `updatePlayer()`: skip movement and shooting while `playerHit.active`; skip evasion for scripted bombs/divers
- `updateBombs()`: check scripted bomb proximity to trigger death; skip barrier collision for scripted bombs
- `updateDivers()`: check scripted diver proximity to trigger death
- `update()`: call `updatePlayerHit(dt)` each frame; check `scheduledHits` against elapsed time
- `render()`: call `renderPlayerHit()` each frame
- `renderHUD()`: use live `lives` variable instead of hardcoded `3`

---

## Out of Scope

- Player dying on the third hit (game ends normally from enemy destruction, not from lives reaching 0)
- Sound effects
- Score impact from being hit
- Player shooting during the death/respawn sequence
