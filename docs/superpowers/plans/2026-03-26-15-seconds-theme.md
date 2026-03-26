# 15 Seconds Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a 3D neon countdown theme "15 Seconds" that features vaporizing numbers.

**Architecture:** A web-based theme using CSS 3D transforms (`perspective`, `translateZ`) for depth and a JavaScript-driven particle system for the "vaporize" dissolve effect.

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript (to minimize dependencies, similar to existing themes).

---

### Task 1: Initialize Theme Directory and Metadata

**Files:**
- Create: `Themes/15 Seconds.totheme/Info.json`
- Create: `Themes/15 Seconds.totheme/Documents/index.html`

- [ ] **Step 1: Create Info.json**
```json
{
  "author": {
    "name" : "Junie",
    "email" : "junie@jetbrains.com",
    "url" : "https://github.com/JetBrains/junie"
  },
  "comments": "A 3D neon countdown from 15 with vaporizing numbers.",
  "rootDocument": "index.html",
  "created": "2026-03-26",
  "identifier": "15-seconds-3d-neon",
  "version": 1,
  "modified": "2026-03-26",
  "name": "15 Seconds"
}
```

- [ ] **Step 2: Create basic index.html structure**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>15 Seconds</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <div id="scene">
        <div id="countdown-container"></div>
    </div>
    <script src="assets/js/script.js"></script>
</body>
</html>
```

- [ ] **Step 3: Commit**
```bash
git add "Themes/15 Seconds.totheme/Info.json" "Themes/15 Seconds.totheme/Documents/index.html"
git commit -m "chore: initialize 15 Seconds theme structure"
```

---

### Task 2: Implement 3D Scene and Neon Styling

**Files:**
- Create: `Themes/15 Seconds.totheme/Documents/assets/css/style.css`

- [ ] **Step 1: Define CSS for 3D perspective and Neon effects**
```css
body {
    margin: 0;
    background: #000;
    overflow: hidden;
    color: #fff;
    font-family: sans-serif;
}
#scene {
    perspective: 1000px;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}
#countdown-container {
    position: relative;
    transform-style: preserve-3d;
}
.number {
    position: absolute;
    font-size: 20rem;
    font-weight: bold;
    transform: translate(-50%, -50%);
    transition: transform 1s ease-in-out, opacity 1s;
    text-shadow: 
        0 0 5px #fff,
        0 0 10px #fff,
        0 0 20px #0ff,
        0 0 30px #0ff,
        0 0 40px #0ff,
        0 0 55px #0ff,
        0 0 75px #0ff;
}
.particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: #0ff;
    box-shadow: 0 0 5px #0ff;
    pointer-events: none;
}
```

- [ ] **Step 2: Commit**
```bash
mkdir -p "Themes/15 Seconds.totheme/Documents/assets/css"
git add "Themes/15 Seconds.totheme/Documents/assets/css/style.css"
git commit -m "feat: add 3D scene and neon styles"
```

---

### Task 3: Implement Countdown Logic and 3D Stacking

**Files:**
- Create: `Themes/15 Seconds.totheme/Documents/assets/js/script.js`

- [ ] **Step 1: Write core countdown and stacking logic**
```javascript
const container = document.getElementById('countdown-container');
const TOTAL_SECONDS = 15;
const Z_SPACING = 200;

function createNumbers() {
    for (let i = 0; i <= TOTAL_SECONDS; i++) {
        const div = document.createElement('div');
        div.className = 'number';
        div.textContent = i;
        div.id = `num-${i}`;
        div.style.transform = `translate(-50%, -50%) translateZ(${- (TOTAL_SECONDS - i) * Z_SPACING}px)`;
        container.appendChild(div);
    }
}

let current = TOTAL_SECONDS;
function tick() {
    if (current < 0) return;
    const frontNum = document.getElementById(`num-${current}`);
    if (frontNum) {
        vaporize(frontNum);
    }
    current--;
    updateStack();
    setTimeout(tick, 1000);
}

function updateStack() {
    const numbers = document.querySelectorAll('.number');
    numbers.forEach(num => {
        const val = parseInt(num.textContent);
        if (val <= current) {
            const z = - (current - val) * Z_SPACING;
            num.style.transform = `translate(-50%, -50%) translateZ(${z}px)`;
        }
    });
}

function vaporize(el) {
    // Basic fade for now, Task 4 implements particles
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 1000);
}

createNumbers();
setTimeout(tick, 1000);
```

- [ ] **Step 2: Commit**
```bash
mkdir -p "Themes/15 Seconds.totheme/Documents/assets/js"
git add "Themes/15 Seconds.totheme/Documents/assets/js/script.js"
git commit -m "feat: implement countdown logic and 3D stacking"
```

---

### Task 4: Implement Neon Vaporize (Particle System)

**Files:**
- Modify: `Themes/15 Seconds.totheme/Documents/assets/js/script.js`

- [ ] **Step 1: Add particle generation to vaporize function**
```javascript
function vaporize(el) {
    const rect = el.getBoundingClientRect();
    const count = 50;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = (rect.left + rect.width / 2) + 'px';
        p.style.top = (rect.top + rect.height / 2) + 'px';
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 10 + 5;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        document.body.appendChild(p);
        
        let opacity = 1;
        const animate = () => {
            p.style.left = (parseFloat(p.style.left) + vx) + 'px';
            p.style.top = (parseFloat(p.style.top) + vy) + 'px';
            opacity -= 0.02;
            p.style.opacity = opacity;
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                p.remove();
            }
        };
        requestAnimationFrame(animate);
    }
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 1000);
}
```

- [ ] **Step 2: Commit**
```bash
git add "Themes/15 Seconds.totheme/Documents/assets/js/script.js"
git commit -m "feat: implement neon vaporize particle effect"
```

---

### Task 5: Final Verification and Polishing

- [ ] **Step 1: Verify file paths and Info.json consistency**
- [ ] **Step 2: Ensure the countdown starts at 15 and moves forward correctly**
- [ ] **Step 3: Commit any final tweaks**
```bash
git commit -m "fix: final polish for 15 Seconds theme" --allow-empty
```
