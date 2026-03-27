# Stand-up Theme Design Spec

## Overview

A ~60-second animated theme in the style of the classic La Linea TV animation. A line-drawn man sits at a desk typing, gets coffee, and converts his desk to a standing desk.

## Visual Style

- **Background:** `#2a5caa` (La Linea blue)
- **Line color:** White (`#ffffff`), ~3px stroke
- **Line style:** Round line caps and joins, consistent weight throughout
- **Ground line:** Continuous horizontal white line spanning full viewport width at ~70% viewport height
- **Character:** La Linea proportions - round head, dot eyes, prominent nose in profile, minimal body detail, slightly rounded limbs
- **All scene objects** (desk, chair, monitor, coffee machine) emerge from / sit on the ground line

## Character Design

The character is always shown in **profile view** (side-on), consistent with La Linea style.

### Joint-based skeleton

The character is defined by joint positions connected by line segments:

- **Head:** Circle with dot eye and triangular nose
- **Neck:** Short segment from head base to shoulders
- **Torso:** Shoulder point to hip point
- **Upper arm / Lower arm:** Shoulder -> elbow -> wrist
- **Upper leg / Lower leg:** Hip -> knee -> ankle
- **Feet:** Simple short line from ankle

### Poses

Each keyframe defines all joint positions relative to a character origin (hip base). Poses are interpolated linearly between keyframes for smooth motion.

Key poses:
1. **Sitting-typing:** Torso upright on chair, arms bent at desk height, hands alternating up/down
2. **Standing-idle:** Upright, arms at sides
3. **Walking (4-frame cycle):** Contact, down, passing, up - arms swing opposite to legs
4. **Reaching/pressing:** Arm extended forward to interact with objects
5. **Standing-at-desk:** Similar to standing-idle but arms on desk/keyboard

## Scene Objects

All drawn with the same white stroke style:

- **Desk:** Rectangle sitting on ground line. Has a visible knob/lever on the near side. Desk surface height is animatable (rises from sitting to standing height).
- **Chair:** Simple office chair shape on ground line (seat, back, base with wheels). Slides away when desk rises.
- **Monitor:** Rectangle on desk surface with a slight glow effect (faint white shadow). Moves up with desk.
- **Keyboard:** Small rectangle on desk surface. Moves up with desk.
- **Coffee machine:** Taller rectangle on ground line, with a button and a spout. Located to the right of the desk area.
- **Coffee cup:** Small cup shape. Appears at coffee machine spout, then carried by character, then placed on desk.

## Animation Timeline

Total duration: **60 seconds** (60,000ms)

| Phase | Start (s) | End (s) | Description |
|-------|-----------|---------|-------------|
| 1. Typing | 0.0 | 10.0 | Man sits at desk, hands bob on keyboard in typing motion |
| 2. Stop & stand | 10.0 | 14.0 | Stops typing, pushes back slightly, rises from chair |
| 3. Walk to coffee machine | 14.0 | 22.0 | Classic La Linea walk cycle moving right toward coffee machine |
| 4. Get coffee | 22.0 | 30.0 | Reaches to press button (22-24s), coffee pours into cup (24-28s), picks up cup (28-30s) |
| 5. Walk back to desk | 30.0 | 38.0 | Walk cycle moving left, cup visible in leading hand |
| 6. Set cup & push knob | 38.0 | 44.0 | Sets cup on desk (38-40s), reaches for knob on desk side (40-42s), pushes it down (42-44s) |
| 7. Desk rises | 44.0 | 52.0 | Desk surface + monitor + keyboard + cup rise smoothly; chair slides off-screen left |
| 8. Standing at desk | 52.0 | 60.0 | Character stands behind raised desk, settles hands on keyboard, looks at monitor |

## Technical Architecture

### Single file approach

One `index.html` file with embedded `<style>` and `<script>` sections. No external dependencies. Follows the pattern of the Analog Clock and Space Invaders themes.

### Animation engine

- **`requestAnimationFrame`** loop with delta timing via `performance.now()`
- **Timeline system:** Array of keyframes `{time, pose, scene}` defining state at specific moments
- **Interpolation:** Linear interpolation between adjacent keyframes for all animatable properties
- **Walk cycle:** Procedural 4-pose cycle blended over time, combined with horizontal translation

### Rendering

- **HTML5 Canvas**, scaled to fill viewport
- **HiDPI support:** Canvas resolution set to `devicePixelRatio` for crisp lines
- All drawing uses:
  - `ctx.strokeStyle = '#fff'`
  - `ctx.lineWidth = 3` (scaled for DPI)
  - `ctx.lineCap = 'round'`
  - `ctx.lineJoin = 'round'`

### Drawing functions

- `drawGroundLine()` - full-width horizontal line
- `drawCharacter(pose, x, y, flip)` - draws character from joint positions, `flip` for facing direction
- `drawDesk(surfaceY, knobPressed)` - desk with animatable surface height
- `drawChair(x)` - chair with animatable x position (slides away)
- `drawMonitor(deskSurfaceY)` - monitor sitting on desk surface
- `drawKeyboard(deskSurfaceY)` - keyboard on desk surface
- `drawCoffeeMachine()` - static coffee machine at fixed position
- `drawCoffeeStream(progress)` - animated pour from spout
- `drawCup(x, y)` - cup at given position (on machine, in hand, or on desk)

### Coordinate system

- Canvas maps to viewport dimensions
- Ground line Y at ~70% of canvas height
- All scene object positions defined relative to ground line
- Character position tracked as x-coordinate along ground line
- Desk area centered, coffee machine offset to the right

## File Structure

```
Stand-up.totheme/
├── Info.json
└── Documents/
    └── index.html
```

### Info.json

```json
{
  "author": {
    "name": "Rijn Buve",
    "email": "",
    "url": ""
  },
  "credits": {
    "name": "Inspired by La Linea by Osvaldo Cavandoli",
    "url": "https://en.wikipedia.org/wiki/La_Linea_(TV_series)"
  },
  "comments": "La Linea style animation of a man converting to a standing desk",
  "rootDocument": "index.html",
  "created": "2026-03-27",
  "identifier": "com.timeout.theme.stand-up",
  "version": 1,
  "modified": "2026-03-27",
  "name": "Stand-up"
}
```
