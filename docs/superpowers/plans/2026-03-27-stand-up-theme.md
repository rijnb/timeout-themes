# Stand-up Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a 60-second La Linea style animation theme showing a man converting from sitting to standing desk.

**Architecture:** Single HTML file with embedded CSS and JavaScript using HTML5 Canvas. Joint-based character skeleton with keyframe interpolation for poses, procedural scene object drawing, and a timeline-driven animation loop using requestAnimationFrame.

**Tech Stack:** Vanilla HTML5 Canvas, JavaScript (no dependencies)

---

## File Structure

- Create: `Themes/Stand-up.totheme/Info.json` — theme metadata
- Create: `Themes/Stand-up.totheme/Documents/index.html` — all code (HTML + CSS + JS)

---

### Task 1: Scaffold theme directory and Info.json

**Files:**
- Create: `Themes/Stand-up.totheme/Info.json`
- Create: `Themes/Stand-up.totheme/Documents/index.html`

- [ ] **Step 1: Create Info.json**

```json
{
  "author": {
    "name": "Rijn Buve",
    "email": "rijn@buve.nl",
    "url": "https://github.com/rijnb/timeout-themes"
  },
  "credits": {
    "name": "Inspired by La Linea by Osvaldo Cavandoli",
    "url": "https://en.wikipedia.org/wiki/La_Linea_(TV_series)"
  },
  "comments": "La Linea style animation of a man converting to a standing desk.",
  "rootDocument": "index.html",
  "created": "2026-03-27",
  "identifier": "com.timeout.theme.stand-up",
  "version": 1,
  "modified": "2026-03-27",
  "name": "Stand-up"
}
```

- [ ] **Step 2: Create minimal index.html with canvas setup**

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Stand-up</title>
<style>
* { margin: 0; padding: 0; }
body {
    background: #2a5caa;
    overflow: hidden;
    width: 100vw;
    height: 100vh;
}
canvas {
    display: block;
    width: 100vw;
    height: 100vh;
}
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
// === CANVAS SETUP ===
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let W, H, dpr, groundY;

function resize() {
    dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    groundY = H * 0.72;
}
window.addEventListener('resize', resize);
resize();

// === DRAWING DEFAULTS ===
function setLineStyle() {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#fff';
}

// === GROUND LINE ===
function drawGroundLine() {
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(W, groundY);
    ctx.stroke();
}

// === MAIN LOOP ===
const startTime = performance.now();
const DURATION = 60000;

function frame(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / DURATION, 1.0);

    ctx.clearRect(0, 0, W, H);
    setLineStyle();
    drawGroundLine();

    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
</script>
</body>
</html>
```

- [ ] **Step 3: Verify in browser**

Open `Themes/Stand-up.totheme/Documents/index.html` in a browser. Expected: La Linea blue background with a white horizontal ground line at ~72% viewport height.

- [ ] **Step 4: Commit**

```bash
git add "Themes/Stand-up.totheme/Info.json" "Themes/Stand-up.totheme/Documents/index.html"
git commit -m "feat: scaffold Stand-up theme with canvas and ground line"
```

---

### Task 2: Character drawing system

Build a joint-based character that can be drawn from a pose definition. The character is drawn in La Linea style — continuous white lines, profile view, round head with prominent nose.

**Files:**
- Modify: `Themes/Stand-up.totheme/Documents/index.html`

A pose is an object with joint positions relative to the character's hip (origin). All coordinates use a unit system where the character is about 120 units tall standing. The character faces right by default; `flip` mirrors for facing left.

- [ ] **Step 1: Add the pose definition and character drawing function**

Insert after the `drawGroundLine` function and before the `MAIN LOOP` comment:

```javascript
// === CHARACTER SYSTEM ===
// A pose defines joint positions relative to hip origin.
// Positive X = right (forward when facing right), positive Y = down.
// Character is ~120 units tall standing.

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function lerpPose(p1, p2, t) {
    const result = {};
    for (const key in p1) {
        if (typeof p1[key] === 'object' && p1[key] !== null) {
            result[key] = {};
            for (const sub in p1[key]) {
                result[key][sub] = lerp(p1[key][sub], p2[key][sub], t);
            }
        } else {
            result[key] = lerp(p1[key], p2[key], t);
        }
    }
    return result;
}

// Smooth step for easing
function smoothstep(t) {
    return t * t * (3 - 2 * t);
}

function drawCharacter(pose, x, y, facingLeft) {
    ctx.save();
    ctx.translate(x, y);
    if (facingLeft) ctx.scale(-1, 1);

    const s = H / 800; // scale factor so character is proportional to screen

    // Unpack pose joints
    const hip = pose.hip;           // {x, y} - origin reference (usually 0,0)
    const shoulder = pose.shoulder; // {x, y}
    const neck = pose.neck;         // {x, y}
    const head = pose.head;         // {x, y} - center of head circle
    const elbow1 = pose.elbow1;     // {x, y} - right arm
    const wrist1 = pose.wrist1;     // {x, y}
    const elbow2 = pose.elbow2;     // {x, y} - left arm
    const wrist2 = pose.wrist2;     // {x, y}
    const knee1 = pose.knee1;       // {x, y} - right leg
    const ankle1 = pose.ankle1;     // {x, y}
    const foot1 = pose.foot1;       // {x, y}
    const knee2 = pose.knee2;       // {x, y} - left leg
    const ankle2 = pose.ankle2;     // {x, y}
    const foot2 = pose.foot2;       // {x, y}

    // Helper to draw a limb segment
    function line(a, b) {
        ctx.beginPath();
        ctx.moveTo(a.x * s, a.y * s);
        ctx.lineTo(b.x * s, b.y * s);
        ctx.stroke();
    }

    // Draw legs
    line(hip, knee1);
    line(knee1, ankle1);
    line(ankle1, foot1);
    line(hip, knee2);
    line(knee2, ankle2);
    line(ankle2, foot2);

    // Draw torso
    line(hip, shoulder);

    // Draw arms
    line(shoulder, elbow1);
    line(elbow1, wrist1);
    line(shoulder, elbow2);
    line(elbow2, wrist2);

    // Draw neck
    line(shoulder, neck);

    // Draw head - circle with La Linea features
    const headR = (pose.headRadius || 14) * s;
    ctx.beginPath();
    ctx.arc(head.x * s, head.y * s, headR, 0, Math.PI * 2);
    ctx.stroke();

    // Nose - prominent triangular nose pointing right (La Linea signature)
    const noseX = head.x * s + headR * 0.8;
    const noseY = head.y * s - headR * 0.05;
    ctx.beginPath();
    ctx.moveTo(head.x * s + headR * 0.5, noseY - headR * 0.35);
    ctx.lineTo(noseX + headR * 0.5, noseY + headR * 0.1);
    ctx.lineTo(head.x * s + headR * 0.4, noseY + headR * 0.15);
    ctx.stroke();

    // Eye - small dot
    const eyeX = head.x * s + headR * 0.25;
    const eyeY = head.y * s - headR * 0.2;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 2 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// === POSES ===
// Standing idle pose
const POSE_STANDING = {
    hip: {x: 0, y: 0},
    shoulder: {x: 0, y: -45},
    neck: {x: 2, y: -52},
    head: {x: 4, y: -68},
    headRadius: 14,
    elbow1: {x: 8, y: -30},
    wrist1: {x: 6, y: -15},
    elbow2: {x: -6, y: -30},
    wrist2: {x: -4, y: -15},
    knee1: {x: 6, y: 25},
    ankle1: {x: 4, y: 50},
    foot1: {x: 12, y: 50},
    knee2: {x: -4, y: 25},
    ankle2: {x: -2, y: 50},
    foot2: {x: 6, y: 50}
};

// Sitting pose - legs bent, torso upright on chair
const POSE_SITTING = {
    hip: {x: 0, y: 0},
    shoulder: {x: -2, y: -45},
    neck: {x: 0, y: -52},
    head: {x: 2, y: -68},
    headRadius: 14,
    elbow1: {x: 18, y: -32},
    wrist1: {x: 28, y: -38},
    elbow2: {x: 14, y: -30},
    wrist2: {x: 24, y: -36},
    knee1: {x: 22, y: 2},
    ankle1: {x: 22, y: 28},
    foot1: {x: 30, y: 28},
    knee2: {x: 18, y: 4},
    ankle2: {x: 18, y: 28},
    foot2: {x: 26, y: 28}
};

// Sitting typing - hands alternate (frame A)
const POSE_TYPING_A = {
    ...POSE_SITTING,
    wrist1: {x: 28, y: -40},
    wrist2: {x: 24, y: -34}
};

// Sitting typing - hands alternate (frame B)
const POSE_TYPING_B = {
    ...POSE_SITTING,
    wrist1: {x: 28, y: -34},
    wrist2: {x: 24, y: -40}
};
```

- [ ] **Step 2: Test character rendering in the main loop**

Replace the frame function content (after clearing and drawing ground line) with a test draw:

```javascript
// Temporary test: draw standing character at center
const testX = W * 0.35;
drawCharacter(POSE_STANDING, testX, groundY, false);
```

- [ ] **Step 3: Verify in browser**

Open in browser. Expected: La Linea blue background, ground line, and a white stick figure in La Linea style standing on the ground line. The figure should have a round head with prominent nose and dot eye.

- [ ] **Step 4: Adjust proportions if needed and commit**

```bash
git add "Themes/Stand-up.totheme/Documents/index.html"
git commit -m "feat: add La Linea character drawing system with joint-based poses"
```

---

### Task 3: Scene objects (desk, chair, monitor, coffee machine, cup)

**Files:**
- Modify: `Themes/Stand-up.totheme/Documents/index.html`

All scene objects are drawn with the same white stroke style and sit on the ground line. The desk surface height is animatable for the standing desk transformation.

- [ ] **Step 1: Add scene object drawing functions**

Insert after the POSES section and before the MAIN LOOP comment:

```javascript
// === SCENE OBJECTS ===
// All positions relative to their X anchor and groundY.
// Scale factor s = H / 800.

function drawDesk(deskX, surfaceY, s, knobPressed) {
    // Desk: two legs and a surface. surfaceY is the top surface Y relative to groundY.
    // deskX is the left edge X position in screen coords.
    const deskW = 100 * s;
    const legW = 4 * s;
    const surfaceH = 4 * s;
    const surfScreenY = groundY + surfaceY * s;

    // Surface
    ctx.beginPath();
    ctx.moveTo(deskX, surfScreenY);
    ctx.lineTo(deskX + deskW, surfScreenY);
    ctx.lineTo(deskX + deskW, surfScreenY + surfaceH);
    ctx.lineTo(deskX, surfScreenY + surfaceH);
    ctx.closePath();
    ctx.stroke();

    // Left leg
    ctx.beginPath();
    ctx.moveTo(deskX + 8 * s, surfScreenY + surfaceH);
    ctx.lineTo(deskX + 8 * s, groundY);
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.moveTo(deskX + deskW - 8 * s, surfScreenY + surfaceH);
    ctx.lineTo(deskX + deskW - 8 * s, groundY);
    ctx.stroke();

    // Knob/lever on the near (left) side of desk
    const knobX = deskX + 4 * s;
    const knobBaseY = surfScreenY + 14 * s;
    const knobLen = 10 * s;
    const knobAngle = knobPressed ? 0.4 : -0.3; // radians, down when pressed
    ctx.beginPath();
    ctx.moveTo(knobX, knobBaseY);
    ctx.lineTo(knobX - Math.cos(knobAngle) * knobLen, knobBaseY + Math.sin(knobAngle) * knobLen);
    ctx.stroke();
    // Knob handle (small circle at end)
    ctx.beginPath();
    ctx.arc(knobX - Math.cos(knobAngle) * knobLen, knobBaseY + Math.sin(knobAngle) * knobLen, 3 * s, 0, Math.PI * 2);
    ctx.stroke();
}

function drawMonitor(deskX, surfaceY, s) {
    // Monitor sits on desk surface, centered
    const deskW = 100 * s;
    const monW = 36 * s;
    const monH = 28 * s;
    const standW = 6 * s;
    const standH = 8 * s;
    const surfScreenY = groundY + surfaceY * s;
    const monX = deskX + deskW * 0.55 - monW / 2;
    const monY = surfScreenY - standH - monH;

    // Monitor screen
    ctx.strokeRect(monX, monY, monW, monH);

    // Faint glow on screen
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.fillRect(monX + 2, monY + 2, monW - 4, monH - 4);
    ctx.restore();

    // Stand
    const standX = monX + monW / 2 - standW / 2;
    ctx.strokeRect(standX, monY + monH, standW, standH);

    // Base
    ctx.beginPath();
    ctx.moveTo(monX + monW / 2 - 12 * s, surfScreenY);
    ctx.lineTo(monX + monW / 2 + 12 * s, surfScreenY);
    ctx.stroke();
}

function drawKeyboard(deskX, surfaceY, s) {
    const deskW = 100 * s;
    const kbW = 30 * s;
    const kbH = 4 * s;
    const surfScreenY = groundY + surfaceY * s;
    const kbX = deskX + deskW * 0.35 - kbW / 2;
    ctx.strokeRect(kbX, surfScreenY - kbH, kbW, kbH);
}

function drawChair(chairX, s) {
    // Simple office chair: seat, back, and base with wheels
    const seatW = 36 * s;
    const seatH = 4 * s;
    const seatY = groundY - 28 * s; // seat height
    const backH = 32 * s;

    // Seat
    ctx.strokeRect(chairX, seatY, seatW, seatH);

    // Back (slight recline)
    ctx.beginPath();
    ctx.moveTo(chairX, seatY);
    ctx.lineTo(chairX - 4 * s, seatY - backH);
    ctx.lineTo(chairX + 4 * s, seatY - backH);
    ctx.lineTo(chairX + 6 * s, seatY);
    ctx.stroke();

    // Pedestal (center column)
    const pedestalX = chairX + seatW / 2;
    ctx.beginPath();
    ctx.moveTo(pedestalX, seatY + seatH);
    ctx.lineTo(pedestalX, groundY - 6 * s);
    ctx.stroke();

    // Base (5-star base simplified as 2 lines + wheels)
    ctx.beginPath();
    ctx.moveTo(pedestalX - 16 * s, groundY);
    ctx.lineTo(pedestalX + 16 * s, groundY);
    ctx.stroke();
    // Wheels (small circles)
    ctx.beginPath();
    ctx.arc(pedestalX - 14 * s, groundY, 3 * s, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(pedestalX + 14 * s, groundY, 3 * s, 0, Math.PI * 2);
    ctx.stroke();
}

function drawCoffeeMachine(machineX, s) {
    // Tall boxy machine on ground line
    const mW = 30 * s;
    const mH = 50 * s;
    const mY = groundY - mH;

    // Body
    ctx.strokeRect(machineX, mY, mW, mH);

    // Button
    ctx.beginPath();
    ctx.arc(machineX + mW / 2, mY + 12 * s, 4 * s, 0, Math.PI * 2);
    ctx.stroke();

    // Spout (small rectangle at bottom)
    const spoutW = 8 * s;
    const spoutH = 4 * s;
    ctx.strokeRect(machineX + mW / 2 - spoutW / 2, groundY - 18 * s, spoutW, spoutH);

    // Drip tray
    ctx.beginPath();
    ctx.moveTo(machineX + 4 * s, groundY - 2 * s);
    ctx.lineTo(machineX + mW - 4 * s, groundY - 2 * s);
    ctx.stroke();
}

function drawCup(cupX, cupY, s) {
    // Small coffee cup
    const cupW = 10 * s;
    const cupH = 10 * s;
    const handleR = 4 * s;

    // Cup body (slightly tapered)
    ctx.beginPath();
    ctx.moveTo(cupX, cupY - cupH);
    ctx.lineTo(cupX - 2 * s, cupY);
    ctx.lineTo(cupX + cupW + 2 * s, cupY);
    ctx.lineTo(cupX + cupW, cupY - cupH);
    ctx.closePath();
    ctx.stroke();

    // Handle
    ctx.beginPath();
    ctx.arc(cupX + cupW + 2 * s, cupY - cupH / 2, handleR, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
}

function drawCoffeeStream(machineX, progress, s) {
    // Animated coffee pouring from spout into cup
    // progress: 0-1
    const mW = 30 * s;
    const streamX = machineX + mW / 2;
    const streamTop = groundY - 14 * s;
    const streamBottom = groundY - 10 * s;
    const streamLen = (streamBottom - streamTop) * progress;

    if (progress > 0) {
        ctx.beginPath();
        ctx.moveTo(streamX, streamTop);
        ctx.lineTo(streamX, streamTop + streamLen);
        ctx.stroke();
    }
}
```

- [ ] **Step 2: Test scene objects in the main loop**

Replace the test draw with:

```javascript
const s = H / 800;
const deskX = W * 0.3;
const sittingSurfaceY = -30; // desk surface 30 units above ground

drawDesk(deskX, sittingSurfaceY, s, false);
drawMonitor(deskX, sittingSurfaceY, s);
drawKeyboard(deskX, sittingSurfaceY, s);
drawChair(deskX - 20 * s, s);
drawCoffeeMachine(W * 0.72, s);

// Test character sitting at desk
const charX = deskX + 28 * s;
drawCharacter(POSE_SITTING, charX, groundY - 28 * s, false);
```

- [ ] **Step 3: Verify in browser**

Expected: Full scene visible — desk with monitor and keyboard, chair, coffee machine to the right, and the character sitting at the desk. All drawn in white lines on La Linea blue.

- [ ] **Step 4: Commit**

```bash
git add "Themes/Stand-up.totheme/Documents/index.html"
git commit -m "feat: add scene objects - desk, chair, monitor, coffee machine, cup"
```

---

### Task 4: Walk cycle

**Files:**
- Modify: `Themes/Stand-up.totheme/Documents/index.html`

The walk cycle is a 4-pose loop that plays while the character's X position changes. The cycle speed is tied to movement speed.

- [ ] **Step 1: Add walk cycle poses and blending function**

Insert after the existing POSES section:

```javascript
// Walk cycle: 4 key poses, looped
// Contact (heel strike), Down (absorb), Passing (single support), Up (push off)
const WALK_CONTACT = {
    hip: {x: 0, y: 2},
    shoulder: {x: 0, y: -43},
    neck: {x: 2, y: -50},
    head: {x: 4, y: -66},
    headRadius: 14,
    elbow1: {x: -8, y: -30},   // arms swing opposite to legs
    wrist1: {x: -12, y: -18},
    elbow2: {x: 10, y: -30},
    wrist2: {x: 14, y: -18},
    knee1: {x: 16, y: 22},     // front leg extended
    ankle1: {x: 20, y: 48},
    foot1: {x: 28, y: 48},
    knee2: {x: -14, y: 24},    // back leg pushing
    ankle2: {x: -16, y: 48},
    foot2: {x: -10, y: 48}
};

const WALK_DOWN = {
    hip: {x: 0, y: 5},
    shoulder: {x: 0, y: -40},
    neck: {x: 2, y: -47},
    head: {x: 4, y: -63},
    headRadius: 14,
    elbow1: {x: -4, y: -28},
    wrist1: {x: -6, y: -16},
    elbow2: {x: 6, y: -28},
    wrist2: {x: 8, y: -16},
    knee1: {x: 10, y: 26},
    ankle1: {x: 12, y: 48},
    foot1: {x: 20, y: 48},
    knee2: {x: -8, y: 26},
    ankle2: {x: -10, y: 48},
    foot2: {x: -4, y: 48}
};

const WALK_PASSING = {
    hip: {x: 0, y: 1},
    shoulder: {x: 0, y: -44},
    neck: {x: 2, y: -51},
    head: {x: 4, y: -67},
    headRadius: 14,
    elbow1: {x: 4, y: -30},
    wrist1: {x: 2, y: -16},
    elbow2: {x: -2, y: -30},
    wrist2: {x: 0, y: -16},
    knee1: {x: 4, y: 24},
    ankle1: {x: 2, y: 50},
    foot1: {x: 10, y: 50},
    knee2: {x: -2, y: 18},     // passing leg lifted
    ankle2: {x: 2, y: 40},
    foot2: {x: 8, y: 40}
};

const WALK_UP = {
    hip: {x: 0, y: -1},
    shoulder: {x: 0, y: -46},
    neck: {x: 2, y: -53},
    head: {x: 4, y: -69},
    headRadius: 14,
    elbow1: {x: 10, y: -30},
    wrist1: {x: 14, y: -18},
    elbow2: {x: -8, y: -30},
    wrist2: {x: -12, y: -18},
    knee1: {x: -14, y: 24},    // now back leg
    ankle1: {x: -16, y: 48},
    foot1: {x: -10, y: 48},
    knee2: {x: 16, y: 22},     // now front leg
    ankle2: {x: 20, y: 48},
    foot2: {x: 28, y: 48}
};

const WALK_CYCLE = [WALK_CONTACT, WALK_DOWN, WALK_PASSING, WALK_UP];

function getWalkPose(cycleTime) {
    // cycleTime: 0.0 - 1.0 within one walk cycle
    const numPoses = WALK_CYCLE.length;
    const segment = cycleTime * numPoses;
    const idx = Math.floor(segment) % numPoses;
    const frac = segment - Math.floor(segment);
    const nextIdx = (idx + 1) % numPoses;
    return lerpPose(WALK_CYCLE[idx], WALK_CYCLE[nextIdx], frac);
}
```

- [ ] **Step 2: Verify walk cycle visually**

Temporarily replace the frame function test with:

```javascript
const s = H / 800;
const elapsed = now - startTime;
const cycleT = (elapsed % 800) / 800; // 800ms per cycle
const walkPose = getWalkPose(cycleT);
drawCharacter(walkPose, W * 0.5, groundY, false);
```

- [ ] **Step 3: Verify in browser**

Expected: Character walks in place at center of screen with fluid cyclic leg and arm motion.

- [ ] **Step 4: Commit**

```bash
git add "Themes/Stand-up.totheme/Documents/index.html"
git commit -m "feat: add 4-pose walk cycle with interpolation"
```

---

### Task 5: Additional poses for all animation phases

**Files:**
- Modify: `Themes/Stand-up.totheme/Documents/index.html`

Add all the transition poses needed for the full animation: standing-up-from-chair, reaching for coffee button, holding cup, reaching for desk knob, and standing-at-raised-desk.

- [ ] **Step 1: Add all remaining poses**

Insert after the walk cycle poses:

```javascript
// Pose: pushing back from desk (starting to stand)
const POSE_PUSH_BACK = {
    hip: {x: 0, y: -2},
    shoulder: {x: -4, y: -45},
    neck: {x: -2, y: -52},
    head: {x: 0, y: -68},
    headRadius: 14,
    elbow1: {x: 14, y: -34},
    wrist1: {x: 22, y: -38},  // hands pushing on desk
    elbow2: {x: 10, y: -32},
    wrist2: {x: 18, y: -36},
    knee1: {x: 18, y: 6},
    ankle1: {x: 20, y: 28},
    foot1: {x: 28, y: 28},
    knee2: {x: 14, y: 8},
    ankle2: {x: 16, y: 28},
    foot2: {x: 24, y: 28}
};

// Pose: reaching to press coffee machine button
const POSE_PRESS_BUTTON = {
    hip: {x: 0, y: 0},
    shoulder: {x: 0, y: -45},
    neck: {x: 2, y: -52},
    head: {x: 4, y: -68},
    headRadius: 14,
    elbow1: {x: 18, y: -42},
    wrist1: {x: 30, y: -38},  // reaching forward to button
    elbow2: {x: -6, y: -30},
    wrist2: {x: -4, y: -15},
    knee1: {x: 6, y: 25},
    ankle1: {x: 4, y: 50},
    foot1: {x: 12, y: 50},
    knee2: {x: -4, y: 25},
    ankle2: {x: -2, y: 50},
    foot2: {x: 6, y: 50}
};

// Pose: waiting for coffee (relaxed standing, looking at machine)
const POSE_WAITING = {
    hip: {x: 0, y: 0},
    shoulder: {x: 0, y: -45},
    neck: {x: 2, y: -52},
    head: {x: 5, y: -68},
    headRadius: 14,
    elbow1: {x: 4, y: -28},
    wrist1: {x: 2, y: -14},
    elbow2: {x: -8, y: -28},
    wrist2: {x: -10, y: -14},
    knee1: {x: 6, y: 25},
    ankle1: {x: 4, y: 50},
    foot1: {x: 12, y: 50},
    knee2: {x: -6, y: 25},
    ankle2: {x: -6, y: 50},
    foot2: {x: -2, y: 50}
};

// Pose: picking up cup from machine
const POSE_PICK_CUP = {
    hip: {x: 0, y: 0},
    shoulder: {x: 0, y: -45},
    neck: {x: 2, y: -52},
    head: {x: 4, y: -68},
    headRadius: 14,
    elbow1: {x: 16, y: -30},
    wrist1: {x: 26, y: -10},  // reaching down to pick up cup
    elbow2: {x: -6, y: -30},
    wrist2: {x: -4, y: -15},
    knee1: {x: 6, y: 25},
    ankle1: {x: 4, y: 50},
    foot1: {x: 12, y: 50},
    knee2: {x: -4, y: 25},
    ankle2: {x: -2, y: 50},
    foot2: {x: 6, y: 50}
};

// Walk cycle pose with cup in hand (right wrist holds cup higher)
function getWalkWithCupPose(cycleTime) {
    const pose = getWalkPose(cycleTime);
    // Override right arm to hold cup steady at chest height
    pose.elbow1 = {x: 12, y: -36};
    pose.wrist1 = {x: 18, y: -30};
    return pose;
}

// Pose: setting cup on desk
const POSE_SET_CUP = {
    hip: {x: 0, y: 0},
    shoulder: {x: 0, y: -45},
    neck: {x: 2, y: -52},
    head: {x: 4, y: -68},
    headRadius: 14,
    elbow1: {x: 16, y: -34},
    wrist1: {x: 26, y: -32},  // placing cup on desk
    elbow2: {x: -6, y: -30},
    wrist2: {x: -4, y: -15},
    knee1: {x: 6, y: 25},
    ankle1: {x: 4, y: 50},
    foot1: {x: 12, y: 50},
    knee2: {x: -4, y: 25},
    ankle2: {x: -2, y: 50},
    foot2: {x: 6, y: 50}
};

// Pose: reaching for desk knob (left side of desk)
const POSE_REACH_KNOB = {
    hip: {x: 0, y: 0},
    shoulder: {x: 0, y: -45},
    neck: {x: -2, y: -52},
    head: {x: -2, y: -68},
    headRadius: 14,
    elbow1: {x: -12, y: -32},
    wrist1: {x: -22, y: -20},  // reaching for knob
    elbow2: {x: -6, y: -30},
    wrist2: {x: -4, y: -15},
    knee1: {x: 6, y: 25},
    ankle1: {x: 4, y: 50},
    foot1: {x: 12, y: 50},
    knee2: {x: -4, y: 25},
    ankle2: {x: -2, y: 50},
    foot2: {x: 6, y: 50}
};

// Pose: pushing knob down
const POSE_PUSH_KNOB = {
    hip: {x: 0, y: 0},
    shoulder: {x: -2, y: -45},
    neck: {x: -2, y: -52},
    head: {x: -2, y: -68},
    headRadius: 14,
    elbow1: {x: -14, y: -28},
    wrist1: {x: -22, y: -14},  // pushing knob down
    elbow2: {x: -6, y: -30},
    wrist2: {x: -4, y: -15},
    knee1: {x: 6, y: 25},
    ankle1: {x: 4, y: 50},
    foot1: {x: 12, y: 50},
    knee2: {x: -4, y: 25},
    ankle2: {x: -2, y: 50},
    foot2: {x: 6, y: 50}
};

// Pose: standing at raised desk, typing
const POSE_STANDING_DESK = {
    hip: {x: 0, y: 0},
    shoulder: {x: 0, y: -45},
    neck: {x: 2, y: -52},
    head: {x: 4, y: -68},
    headRadius: 14,
    elbow1: {x: 14, y: -38},
    wrist1: {x: 24, y: -44},  // hands on raised keyboard
    elbow2: {x: 10, y: -36},
    wrist2: {x: 20, y: -42},
    knee1: {x: 4, y: 25},
    ankle1: {x: 4, y: 50},
    foot1: {x: 12, y: 50},
    knee2: {x: -4, y: 25},
    ankle2: {x: -2, y: 50},
    foot2: {x: 6, y: 50}
};

// Typing at standing desk (frame A and B for hand movement)
const POSE_STANDING_TYPE_A = {
    ...POSE_STANDING_DESK,
    wrist1: {x: 24, y: -46},
    wrist2: {x: 20, y: -40}
};

const POSE_STANDING_TYPE_B = {
    ...POSE_STANDING_DESK,
    wrist1: {x: 24, y: -40},
    wrist2: {x: 20, y: -46}
};
```

- [ ] **Step 2: Commit**

```bash
git add "Themes/Stand-up.totheme/Documents/index.html"
git commit -m "feat: add all animation phase poses"
```

---

### Task 6: Animation timeline engine (phases 1-4)

**Files:**
- Modify: `Themes/Stand-up.totheme/Documents/index.html`

Replace the test rendering code in the frame function with the full timeline-driven animation engine. This task covers phases 1-4 (typing, stand up, walk to coffee, get coffee).

- [ ] **Step 1: Add scene state and timeline engine**

Replace everything from the `// === MAIN LOOP ===` comment to the end of the script with:

```javascript
// === ANIMATION STATE ===
const DURATION = 60000; // 60 seconds

// Scene layout (in character units, scaled by s = H/800)
// These are computed in the frame function relative to screen size
let sceneState = {
    deskSurfaceY: -30,       // desk surface Y relative to ground (negative = above)
    chairX: 0,               // chair X offset in screen coords (0 = initial position)
    knobPressed: false,
    cupState: 'hidden',      // hidden | on-machine | pouring | in-hand | on-desk
    cupX: 0,
    cupY: 0,
    coffeeProgress: 0,       // 0-1 for pour animation
    charX: 0,                // character X in screen coords
    charFacing: false,       // false = right, true = left
    charOnGround: true       // whether character feet are at groundY
};

// === PHASE DEFINITIONS (in seconds) ===
const P = {
    TYPING_END: 10,
    STANDUP_END: 14,
    WALK_TO_COFFEE_END: 22,
    PRESS_BUTTON: 24,
    POUR_END: 28,
    PICK_CUP: 30,
    WALK_BACK_END: 38,
    SET_CUP: 40,
    REACH_KNOB: 42,
    PUSH_KNOB: 44,
    DESK_RISE_END: 52,
    END: 60
};

// === MAIN LOOP ===
const startTime = performance.now();

function frame(now) {
    const elapsed = now - startTime;
    const tSec = Math.min(elapsed / 1000, P.END); // current time in seconds

    ctx.clearRect(0, 0, W, H);
    setLineStyle();

    const s = H / 800;

    // Layout positions (screen coordinates)
    const deskLeft = W * 0.28;
    const deskW = 100 * s;
    const chairInitX = deskLeft - 24 * s;
    const machineX = W * 0.73;
    const machineW = 30 * s;
    const charSitX = deskLeft + 28 * s;  // character X when sitting at desk
    const charStandDeskX = deskLeft + 40 * s; // character X when standing at desk
    const charAtMachineX = machineX - 10 * s; // character X at coffee machine

    // Determine current pose and position based on phase
    let pose;
    let charX;
    let facingLeft = false;
    let deskSurfaceY = -30; // sitting height
    let knobPressed = false;
    let chairOffset = 0;    // horizontal offset for chair sliding away
    let showCup = false;
    let cupScreenX = 0, cupScreenY = 0;
    let coffeeProgress = 0;
    let showStream = false;

    // Cup position on coffee machine drip tray
    const cupOnMachineX = machineX + machineW / 2 * s - 5 * s;  // Adjusted to be under spout
    const cupOnMachineY = groundY - 2 * s;

    if (tSec < P.TYPING_END) {
        // === PHASE 1: Sitting and typing ===
        const typeCycle = (elapsed % 400) / 400;
        pose = typeCycle < 0.5
            ? lerpPose(POSE_TYPING_A, POSE_TYPING_B, typeCycle * 2)
            : lerpPose(POSE_TYPING_B, POSE_TYPING_A, (typeCycle - 0.5) * 2);
        charX = charSitX;
        // Character is sitting, Y is at seat height
        drawGroundLine();
        drawChair(chairInitX, s);
        drawDesk(deskLeft, deskSurfaceY, s, false);
        drawMonitor(deskLeft, deskSurfaceY, s);
        drawKeyboard(deskLeft, deskSurfaceY, s);
        drawCoffeeMachine(machineX, s);
        drawCharacter(pose, charX, groundY - 28 * s, false);

    } else if (tSec < P.STANDUP_END) {
        // === PHASE 2: Stop typing, push back, stand up ===
        const phaseDur = P.STANDUP_END - P.TYPING_END;
        const pt = (tSec - P.TYPING_END) / phaseDur;
        const eased = smoothstep(pt);

        if (pt < 0.4) {
            // Push back from desk
            const subT = pt / 0.4;
            pose = lerpPose(POSE_SITTING, POSE_PUSH_BACK, smoothstep(subT));
            charX = charSitX;
        } else {
            // Rise to standing
            const subT = (pt - 0.4) / 0.6;
            pose = lerpPose(POSE_PUSH_BACK, POSE_STANDING, smoothstep(subT));
            charX = lerp(charSitX, charSitX - 10 * s, smoothstep(subT));
        }

        // Character Y transitions from sitting to standing
        const charY = lerp(groundY - 28 * s, groundY, eased);

        drawGroundLine();
        drawChair(chairInitX, s);
        drawDesk(deskLeft, deskSurfaceY, s, false);
        drawMonitor(deskLeft, deskSurfaceY, s);
        drawKeyboard(deskLeft, deskSurfaceY, s);
        drawCoffeeMachine(machineX, s);
        drawCharacter(pose, charX, charY, false);

    } else if (tSec < P.WALK_TO_COFFEE_END) {
        // === PHASE 3: Walk to coffee machine ===
        const phaseDur = P.WALK_TO_COFFEE_END - P.STANDUP_END;
        const pt = (tSec - P.STANDUP_END) / phaseDur;
        const eased = smoothstep(pt);

        const walkStartX = charSitX - 10 * s;
        charX = lerp(walkStartX, charAtMachineX, eased);

        const cycleSpeed = 1.2; // cycles per second
        const cycleT = ((tSec - P.STANDUP_END) * cycleSpeed) % 1;
        pose = getWalkPose(cycleT);

        drawGroundLine();
        drawChair(chairInitX, s);
        drawDesk(deskLeft, deskSurfaceY, s, false);
        drawMonitor(deskLeft, deskSurfaceY, s);
        drawKeyboard(deskLeft, deskSurfaceY, s);
        drawCoffeeMachine(machineX, s);
        drawCharacter(pose, charX, groundY, false);

    } else if (tSec < P.PICK_CUP) {
        // === PHASE 4: Get coffee (press, pour, pick up) ===
        charX = charAtMachineX;

        if (tSec < P.PRESS_BUTTON) {
            // Reaching and pressing button
            const pt = (tSec - P.WALK_TO_COFFEE_END) / (P.PRESS_BUTTON - P.WALK_TO_COFFEE_END);
            pose = lerpPose(POSE_STANDING, POSE_PRESS_BUTTON, smoothstep(pt));
        } else if (tSec < P.POUR_END) {
            // Waiting while coffee pours
            pose = POSE_WAITING;
            coffeeProgress = (tSec - P.PRESS_BUTTON) / (P.POUR_END - P.PRESS_BUTTON);
            showStream = true;
            // Show cup under spout
            showCup = true;
            cupScreenX = cupOnMachineX;
            cupScreenY = cupOnMachineY;
        } else {
            // Pick up cup
            const pt = (tSec - P.POUR_END) / (P.PICK_CUP - P.POUR_END);
            pose = lerpPose(POSE_WAITING, POSE_PICK_CUP, smoothstep(pt));
            showCup = true;
            // Cup moves from machine to hand
            const handY = groundY - 10 * s;
            cupScreenX = lerp(cupOnMachineX, charX + 26 * s, smoothstep(pt));
            cupScreenY = lerp(cupOnMachineY, handY, smoothstep(pt));
        }

        drawGroundLine();
        drawChair(chairInitX, s);
        drawDesk(deskLeft, deskSurfaceY, s, false);
        drawMonitor(deskLeft, deskSurfaceY, s);
        drawKeyboard(deskLeft, deskSurfaceY, s);
        drawCoffeeMachine(machineX, s);
        if (showStream) drawCoffeeStream(machineX, coffeeProgress, s);
        if (showCup) drawCup(cupScreenX, cupScreenY, s);
        drawCharacter(pose, charX, groundY, false);

    } else {
        // Phases 5-8 placeholder — will be implemented in next task
        drawGroundLine();
        drawChair(chairInitX, s);
        drawDesk(deskLeft, deskSurfaceY, s, false);
        drawMonitor(deskLeft, deskSurfaceY, s);
        drawKeyboard(deskLeft, deskSurfaceY, s);
        drawCoffeeMachine(machineX, s);
        charX = charAtMachineX;
        pose = POSE_STANDING;
        drawCharacter(pose, charX, groundY, false);
    }

    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
```

- [ ] **Step 2: Verify in browser**

Expected: Full animated sequence for the first 30 seconds — character types at desk, stands up, walks to coffee machine, presses button, coffee pours, picks up cup. After 30s it shows a static placeholder.

- [ ] **Step 3: Commit**

```bash
git add "Themes/Stand-up.totheme/Documents/index.html"
git commit -m "feat: implement animation phases 1-4 (typing, stand, walk, coffee)"
```

---

### Task 7: Animation timeline phases 5-8 (walk back, knob, desk rise, standing work)

**Files:**
- Modify: `Themes/Stand-up.totheme/Documents/index.html`

Replace the `else` placeholder block (the one with comment `// Phases 5-8 placeholder`) with the full implementation of phases 5 through 8.

- [ ] **Step 1: Replace the placeholder block with phases 5-8**

Replace the `} else {` block (after the phase 4 closing) with:

```javascript
    } else if (tSec < P.WALK_BACK_END) {
        // === PHASE 5: Walk back to desk with cup ===
        const phaseDur = P.WALK_BACK_END - P.PICK_CUP;
        const pt = (tSec - P.PICK_CUP) / phaseDur;
        const eased = smoothstep(pt);

        charX = lerp(charAtMachineX, charStandDeskX, eased);
        facingLeft = true;

        const cycleSpeed = 1.2;
        const cycleT = ((tSec - P.PICK_CUP) * cycleSpeed) % 1;
        pose = getWalkWithCupPose(cycleT);

        // Cup follows the character's hand
        showCup = true;
        cupScreenX = facingLeft ? charX - 18 * s : charX + 18 * s;
        cupScreenY = groundY - 30 * s;

        drawGroundLine();
        drawChair(chairInitX, s);
        drawDesk(deskLeft, deskSurfaceY, s, false);
        drawMonitor(deskLeft, deskSurfaceY, s);
        drawKeyboard(deskLeft, deskSurfaceY, s);
        drawCoffeeMachine(machineX, s);
        if (showCup) drawCup(cupScreenX, cupScreenY, s);
        drawCharacter(pose, charX, groundY, facingLeft);

    } else if (tSec < P.PUSH_KNOB) {
        // === PHASE 6: Set cup on desk, reach and push knob ===
        charX = charStandDeskX;
        facingLeft = false;

        if (tSec < P.SET_CUP) {
            // Setting cup down on desk
            const pt = (tSec - P.WALK_BACK_END) / (P.SET_CUP - P.WALK_BACK_END);
            // Transition from standing (facing right now) to set-cup pose
            pose = lerpPose(POSE_STANDING, POSE_SET_CUP, smoothstep(pt));
            showCup = true;
            const deskSurfScreenY = groundY + deskSurfaceY * s;
            cupScreenX = lerp(charX + 18 * s, deskLeft + 70 * s, smoothstep(pt));
            cupScreenY = lerp(groundY - 30 * s, deskSurfScreenY - 10 * s, smoothstep(pt));
        } else if (tSec < P.REACH_KNOB) {
            // Reaching for knob
            const pt = (tSec - P.SET_CUP) / (P.REACH_KNOB - P.SET_CUP);
            pose = lerpPose(POSE_SET_CUP, POSE_REACH_KNOB, smoothstep(pt));
            // Cup is on desk now
            showCup = true;
            const deskSurfScreenY = groundY + deskSurfaceY * s;
            cupScreenX = deskLeft + 70 * s;
            cupScreenY = deskSurfScreenY - 10 * s;
        } else {
            // Pushing knob down
            const pt = (tSec - P.REACH_KNOB) / (P.PUSH_KNOB - P.REACH_KNOB);
            pose = lerpPose(POSE_REACH_KNOB, POSE_PUSH_KNOB, smoothstep(pt));
            knobPressed = pt > 0.5;
            showCup = true;
            const deskSurfScreenY = groundY + deskSurfaceY * s;
            cupScreenX = deskLeft + 70 * s;
            cupScreenY = deskSurfScreenY - 10 * s;
        }

        drawGroundLine();
        drawChair(chairInitX, s);
        drawDesk(deskLeft, deskSurfaceY, s, knobPressed);
        drawMonitor(deskLeft, deskSurfaceY, s);
        drawKeyboard(deskLeft, deskSurfaceY, s);
        drawCoffeeMachine(machineX, s);
        if (showCup) drawCup(cupScreenX, cupScreenY, s);
        drawCharacter(pose, charX, groundY, false);

    } else if (tSec < P.DESK_RISE_END) {
        // === PHASE 7: Desk rises, chair slides away ===
        const phaseDur = P.DESK_RISE_END - P.PUSH_KNOB;
        const pt = (tSec - P.PUSH_KNOB) / phaseDur;
        const eased = smoothstep(pt);

        charX = charStandDeskX;
        const standingSurfaceY = -65; // standing desk height
        deskSurfaceY = lerp(-30, standingSurfaceY, eased);
        knobPressed = true;
        chairOffset = eased * -200 * s; // slide chair off to the left

        // Character transitions to standing desk pose
        pose = lerpPose(POSE_PUSH_KNOB, POSE_STANDING_DESK, eased);

        // Cup rises with desk
        showCup = true;
        const deskSurfScreenY = groundY + deskSurfaceY * s;
        cupScreenX = deskLeft + 70 * s;
        cupScreenY = deskSurfScreenY - 10 * s;

        drawGroundLine();
        drawChair(chairInitX + chairOffset, s);
        drawDesk(deskLeft, deskSurfaceY, s, knobPressed);
        drawMonitor(deskLeft, deskSurfaceY, s);
        drawKeyboard(deskLeft, deskSurfaceY, s);
        drawCoffeeMachine(machineX, s);
        if (showCup) drawCup(cupScreenX, cupScreenY, s);
        drawCharacter(pose, charX, groundY, false);

    } else {
        // === PHASE 8: Standing at raised desk, typing ===
        charX = charStandDeskX;
        const standingSurfaceY = -65;
        deskSurfaceY = standingSurfaceY;
        knobPressed = true;

        // Typing animation at standing desk
        const typeCycle = (elapsed % 400) / 400;
        pose = typeCycle < 0.5
            ? lerpPose(POSE_STANDING_TYPE_A, POSE_STANDING_TYPE_B, typeCycle * 2)
            : lerpPose(POSE_STANDING_TYPE_B, POSE_STANDING_TYPE_A, (typeCycle - 0.5) * 2);

        // Cup on desk
        showCup = true;
        const deskSurfScreenY = groundY + deskSurfaceY * s;
        cupScreenX = deskLeft + 70 * s;
        cupScreenY = deskSurfScreenY - 10 * s;

        drawGroundLine();
        // Chair has slid away — draw off-screen or skip
        drawDesk(deskLeft, deskSurfaceY, s, knobPressed);
        drawMonitor(deskLeft, deskSurfaceY, s);
        drawKeyboard(deskLeft, deskSurfaceY, s);
        drawCoffeeMachine(machineX, s);
        if (showCup) drawCup(cupScreenX, cupScreenY, s);
        drawCharacter(pose, charX, groundY, false);
    }
```

- [ ] **Step 2: Verify in browser**

Expected: Full 60-second animation plays through all 8 phases. Character walks back with cup, sets it down, pushes knob, desk rises while chair slides away, then character types at standing desk.

- [ ] **Step 3: Commit**

```bash
git add "Themes/Stand-up.totheme/Documents/index.html"
git commit -m "feat: implement animation phases 5-8 (walk back, knob, desk rise, standing)"
```

---

### Task 8: Polish and visual refinement

**Files:**
- Modify: `Themes/Stand-up.totheme/Documents/index.html`

Fine-tune the animation: adjust character proportions, smooth transitions between walking and standing poses, ensure the cup tracks correctly, add subtle idle motion (slight head bob during waiting), and make sure the La Linea aesthetic is consistent.

- [ ] **Step 1: Add idle motion during waiting phases**

Add a helper function after the `smoothstep` function:

```javascript
function breathe(tSec, amplitude) {
    // Subtle breathing/idle motion
    return Math.sin(tSec * 2.5) * amplitude;
}
```

Then in Phase 4, during the waiting-for-coffee section (where `pose = POSE_WAITING`), replace `pose = POSE_WAITING` with:

```javascript
const waitPose = {...POSE_WAITING};
const bob = breathe(tSec, 1.5);
waitPose.head = {x: POSE_WAITING.head.x, y: POSE_WAITING.head.y + bob};
waitPose.neck = {x: POSE_WAITING.neck.x, y: POSE_WAITING.neck.y + bob * 0.5};
waitPose.shoulder = {x: POSE_WAITING.shoulder.x, y: POSE_WAITING.shoulder.y + bob * 0.3};
pose = waitPose;
```

- [ ] **Step 2: Add transition smoothing at walk start/end**

At the beginning of Phase 3 (walk to coffee), blend the first 0.5s from standing pose into walk cycle. Replace the phase 3 pose calculation with:

```javascript
const cycleSpeed = 1.2;
const cycleT = ((tSec - P.STANDUP_END) * cycleSpeed) % 1;
const walkPose = getWalkPose(cycleT);

// Blend from standing into walk over first 0.5s
const blendIn = Math.min((tSec - P.STANDUP_END) / 0.5, 1);
pose = blendIn < 1 ? lerpPose(POSE_STANDING, walkPose, smoothstep(blendIn)) : walkPose;
```

At the end of Phase 3, blend from walk cycle into standing over the last 0.5s. Wrap the existing pose assignment:

```javascript
// Blend from walk to standing over last 0.5s
const blendOut = Math.max(0, (P.WALK_TO_COFFEE_END - tSec) / 0.5);
if (blendOut < 1) {
    pose = lerpPose(pose, POSE_STANDING, smoothstep(1 - blendOut));
}
```

Apply the same blend-in and blend-out pattern to Phase 5 (walk back with cup), using `getWalkWithCupPose` instead of `getWalkPose`, and `POSE_STANDING` for the end pose.

- [ ] **Step 3: Add subtle head look-at-screen in Phase 8**

In Phase 8, after computing the typing pose, add a subtle head turn toward the monitor:

```javascript
// Subtle looking-at-screen motion — slight head bob
const lookBob = breathe(tSec, 1.0);
pose.head = {x: pose.head.x + lookBob * 0.5, y: pose.head.y + Math.abs(lookBob) * 0.3};
```

- [ ] **Step 4: Verify full animation in browser**

Watch the complete 60-second animation. Check:
- Smooth transitions between all phases (no jarring pose snaps)
- Walk cycle blends naturally into standing poses
- Cup tracks correctly through all phases
- Idle breathing motion visible during coffee wait
- Character looks natural at standing desk
- La Linea aesthetic maintained throughout

- [ ] **Step 5: Commit**

```bash
git add "Themes/Stand-up.totheme/Documents/index.html"
git commit -m "feat: polish animation with idle breathing, walk blending, and head motion"
```

---

### Task 9: Final integration test and cleanup

**Files:**
- Modify: `Themes/Stand-up.totheme/Documents/index.html` (if needed)

- [ ] **Step 1: Remove any remaining test/debug code**

Search the file for any temporary test code, console.log statements, or commented-out blocks. Remove them.

- [ ] **Step 2: Test at different viewport sizes**

Resize the browser window to various sizes (widescreen, portrait, small window). The animation should scale proportionally and remain centered. The ground line should always span full width.

- [ ] **Step 3: Test in TimeOut app**

If the TimeOut app is available, verify the theme appears in the theme picker and plays correctly during a break.

- [ ] **Step 4: Final commit**

```bash
git add "Themes/Stand-up.totheme/Documents/index.html"
git commit -m "chore: clean up Stand-up theme for release"
```
