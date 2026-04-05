# 15 Seconds Multi-Mode Countdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add balloon-pop and animal-race countdown modes to the 15 Seconds theme, randomly selected at load time.

**Architecture:** Three self-contained JS modules (countdown-neon.js, countdown-balloons.js, countdown-animals.js), each wrapped in an IIFE that exposes one global `start*()` function. A minimal dispatcher in script.js picks one at random. index.html loads all four scripts.

**Tech Stack:** Vanilla JS, CSS keyframe animations, requestAnimationFrame, DOM manipulation.

---

## File Map

| Action | Path |
|--------|------|
| Create | `Themes/15 Seconds.totheme/Documents/assets/js/countdown-neon.js` |
| Create | `Themes/15 Seconds.totheme/Documents/assets/js/countdown-balloons.js` |
| Create | `Themes/15 Seconds.totheme/Documents/assets/js/countdown-animals.js` |
| Modify | `Themes/15 Seconds.totheme/Documents/assets/js/script.js` |
| Modify | `Themes/15 Seconds.totheme/Documents/index.html` |

---

## Task 1: Extract neon mode into countdown-neon.js

**Files:**
- Create: `Themes/15 Seconds.totheme/Documents/assets/js/countdown-neon.js`
- Modify: `Themes/15 Seconds.totheme/Documents/assets/js/script.js`

- [ ] **Step 1: Create countdown-neon.js**

Wrap the entire existing `script.js` content in an IIFE, remove the `DOMContentLoaded` listener, and expose `startNeon` as a global. Create the file with this exact content:

```javascript
(function () {
    const container = document.getElementById('countdown-container');
    const TOTAL_SECONDS = 15;
    const Z_SPACING = 1200;
    const X_SHIFT = -580;
    const Y_SHIFT = -30;

    const rainbowColors = [
        '#ff0000', '#ff4400', '#ff8800', '#ffbb00', '#ffff00',
        '#ccff00', '#88ff00', '#00ff00', '#00ff88', '#00ffff',
        '#0088ff', '#0000ff', '#4b0082', '#6a00ff', '#8b00ff', '#c000ff'
    ];

    function applyNeonStyle(div, color) {
        div.style.color = '#fff';
        div.style.textShadow = `
            0 0 5px #fff,
            0 0 10px #fff,
            0 0 20px ${color},
            0 0 40px ${color},
            0 0 60px ${color}
        `;
        div.dataset.neon = color;
    }

    function createNumbers() {
        for (let i = 0; i <= TOTAL_SECONDS; i++) {
            const div = document.createElement('div');
            div.className = 'number';
            div.textContent = i;
            div.id = `num-${i}`;
            const colorIndex = TOTAL_SECONDS - i;
            applyNeonStyle(div, rainbowColors[colorIndex]);
            const offset = TOTAL_SECONDS - i;
            const z = -offset * Z_SPACING;
            const x = offset * X_SHIFT;
            const y = offset * Y_SHIFT;
            div.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px)`;
            container.appendChild(div);
        }
    }

    let current = TOTAL_SECONDS;

    function tick() {
        if (current < 0) return;
        const frontNum = document.getElementById(`num-${current}`);
        if (frontNum) dissolve(frontNum);
        current--;
        updateStack();
        if (current >= 0) {
            setTimeout(tick, 1000);
        } else {
            setTimeout(() => {
                const zeroNum = document.getElementById('num-0');
                if (zeroNum) dissolve(zeroNum);
            }, 1000);
        }
    }

    function updateStack() {
        const numbers = document.querySelectorAll('.number');
        numbers.forEach(num => {
            const val = parseInt(num.textContent);
            if (val <= current) {
                const offset = current - val;
                const z = -offset * Z_SPACING;
                const x = offset * X_SHIFT;
                const y = offset * Y_SHIFT;
                num.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px)`;
                num.style.opacity = '1';
            }
        });
    }

    function easeInOut(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function easeFadeOut(t) {
        return 1 - t * t * t;
    }

    function dissolve(el) {
        const duration = 900;
        const startTime = performance.now();
        el.style.transition = 'none';
        const currentTransform = el.style.transform;
        function animate(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const ease = easeInOut(progress);
            const zForward = ease * 1000;
            const xDrift = Math.sin(progress * Math.PI) * 200;
            const yDrift = -Math.sin(progress * Math.PI) * 120;
            const rotateZ = Math.sin(progress * Math.PI * 1.5) * 8;
            const rotateY = Math.sin(progress * Math.PI) * 12;
            const opacity = easeFadeOut(progress);
            const neonColor = el.dataset.neon || '#0ff';
            const g = opacity;
            el.style.textShadow = `
                0 0 ${5 * g}px #fff,
                0 0 ${10 * g}px #fff,
                0 0 ${20 * g}px ${neonColor},
                0 0 ${40 * g}px ${neonColor},
                0 0 ${60 * g}px ${neonColor}
            `;
            el.style.transform = `${currentTransform} translate3d(${xDrift}px, ${yDrift}px, ${zForward}px) rotateZ(${rotateZ}deg) rotateY(${rotateY}deg)`;
            el.style.opacity = opacity;
            if (progress < 1) requestAnimationFrame(animate);
            else if (el.parentNode) el.remove();
        }
        requestAnimationFrame(animate);
    }

    window.startNeon = function () {
        createNumbers();
        setTimeout(tick, 1000);
    };
})();
```

- [ ] **Step 2: Replace script.js with dispatcher stub**

Overwrite `script.js` with a temporary stub (we'll add the other two modes in Tasks 3 and 4, then wire the real dispatcher in Task 5):

```javascript
// Dispatcher — populated in Task 5
window.startNeon && window.startNeon();
```

- [ ] **Step 3: Update index.html to load the new neon module**

Replace the single `<script src="assets/js/script.js">` tag with:

```html
    <script src="assets/js/countdown-neon.js"></script>
    <script src="assets/js/script.js"></script>
```

- [ ] **Step 4: Open the theme in a browser and verify neon mode still works**

Open `Themes/15 Seconds.totheme/Documents/index.html` directly in a browser.

Expected: the 3D neon corridor countdown runs exactly as before — numbers recede diagonally, dissolve at the front, rainbow colours.

- [ ] **Step 5: Commit**

```bash
git add "Themes/15 Seconds.totheme/Documents/assets/js/countdown-neon.js" \
        "Themes/15 Seconds.totheme/Documents/assets/js/script.js" \
        "Themes/15 Seconds.totheme/Documents/index.html"
git commit -m "refactor: extract neon countdown into countdown-neon.js"
```

---

## Task 2: Implement countdown-balloons.js

**Files:**
- Create: `Themes/15 Seconds.totheme/Documents/assets/js/countdown-balloons.js`

- [ ] **Step 1: Create countdown-balloons.js**

```javascript
(function () {
    const TOTAL_SECONDS = 15;
    const rainbowColors = [
        '#ff0000', '#ff4400', '#ff8800', '#ffbb00', '#ffff00',
        '#ccff00', '#88ff00', '#00ff00', '#00ff88', '#00ffff',
        '#0088ff', '#0000ff', '#4b0082', '#6a00ff', '#8b00ff', '#c000ff'
    ];

    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes b-sway {
                0%   { transform: translateX(0) rotate(0deg); }
                25%  { transform: translateX(var(--sway)) rotate(2deg); }
                75%  { transform: translateX(calc(var(--sway) * -1)) rotate(-2deg); }
                100% { transform: translateX(0) rotate(0deg); }
            }
            .b-wrap {
                position: absolute;
                display: flex;
                flex-direction: column;
                align-items: center;
                transition: top 0.9s ease-in-out;
                animation: b-sway var(--dur) var(--delay) ease-in-out infinite;
            }
            .b-body {
                width: 64px;
                height: 80px;
                border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.8rem;
                font-weight: 900;
                color: #fff;
                text-shadow: 0 1px 4px rgba(0,0,0,0.6);
                user-select: none;
            }
            .b-string {
                width: 2px;
                height: 36px;
                background: rgba(255,255,255,0.35);
            }
        `;
        document.head.appendChild(style);
    }

    function createBalloons(container) {
        for (let i = TOTAL_SECONDS; i >= 0; i--) {
            const colorIndex = TOTAL_SECONDS - i;
            const color = rainbowColors[colorIndex];

            const wrap = document.createElement('div');
            wrap.className = 'b-wrap';
            wrap.id = `balloon-${i}`;

            // Spread 16 balloons across 6% – 94% of viewport width
            const xPercent = 6 + (colorIndex / TOTAL_SECONDS) * 88;
            const swayPx = 10 + Math.floor(Math.random() * 11);
            const dur = (2 + Math.random() * 2).toFixed(2);
            const delay = (Math.random() * 2).toFixed(2);

            wrap.style.left = `calc(${xPercent}% - 32px)`;
            wrap.style.top = '12%';
            wrap.style.setProperty('--sway', `${swayPx}px`);
            wrap.style.setProperty('--dur', `${dur}s`);
            wrap.style.setProperty('--delay', `${delay}s`);

            const body = document.createElement('div');
            body.className = 'b-body';
            body.style.background =
                `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.5), ${color} 65%)`;
            body.textContent = i;

            const string = document.createElement('div');
            string.className = 'b-string';

            wrap.appendChild(body);
            wrap.appendChild(string);
            container.appendChild(wrap);
        }
    }

    function popBalloon(wrap, color) {
        // Stop swaying
        wrap.style.animation = 'none';
        wrap.style.transition = 'transform 0.1s ease-out';
        wrap.style.transform = 'scale(1.3)';

        setTimeout(() => {
            wrap.style.transition = 'transform 0.15s ease-in, opacity 0.15s ease-in';
            wrap.style.transform = 'scale(0)';
            wrap.style.opacity = '0';
            setTimeout(() => wrap.remove(), 160);
        }, 100);

        // Emit 7 particles from the balloon centre
        const rect = wrap.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height * 0.35;
        const count = 7;

        for (let p = 0; p < count; p++) {
            const angle = (p / count) * Math.PI * 2;
            const dist = 40 + Math.random() * 40;
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist;

            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: ${color};
                pointer-events: none;
                left: ${cx - 4}px;
                top: ${cy - 4}px;
            `;
            document.body.appendChild(particle);

            const start = performance.now();
            (function animateParticle(now) {
                const progress = Math.min((now - start) / 500, 1);
                const eased = 1 - Math.pow(1 - progress, 2);
                particle.style.transform = `translate(${dx * eased}px, ${dy * eased}px)`;
                particle.style.opacity = `${1 - progress}`;
                if (progress < 1) requestAnimationFrame(animateParticle);
                else particle.remove();
            })(performance.now());
        }
    }

    window.startBalloons = function () {
        injectStyles();

        const container = document.getElementById('countdown-container');
        container.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;';

        createBalloons(container);

        let current = TOTAL_SECONDS;

        function tick() {
            if (current < 0) return;

            const wrap = document.getElementById(`balloon-${current}`);
            if (wrap) popBalloon(wrap, rainbowColors[TOTAL_SECONDS - current]);

            current--;

            // Remaining balloons drift down ~3.5% each tick
            container.querySelectorAll('.b-wrap').forEach(el => {
                el.style.top = `${parseFloat(el.style.top) + 3.5}%`;
            });

            if (current >= 0) setTimeout(tick, 1000);
        }

        setTimeout(tick, 1000);
    };
})();
```

- [ ] **Step 2: Add the balloon script to index.html**

Add it between the neon and dispatcher script tags:

```html
    <script src="assets/js/countdown-neon.js"></script>
    <script src="assets/js/countdown-balloons.js"></script>
    <script src="assets/js/script.js"></script>
```

- [ ] **Step 3: Temporarily force balloons in script.js**

Replace the contents of `script.js` with:

```javascript
// Temp: force balloons for testing
window.startBalloons();
```

- [ ] **Step 4: Open in browser and verify balloon mode**

Open `Themes/15 Seconds.totheme/Documents/index.html`.

Expected:
- 16 colourful CSS balloons spread horizontally near the top, all gently swaying independently.
- Each second, the current number's balloon scales up briefly then vanishes with 7 radial particles.
- Remaining balloons drift slowly downward.
- Screen is empty after balloon 0 pops.

- [ ] **Step 5: Commit**

```bash
git add "Themes/15 Seconds.totheme/Documents/assets/js/countdown-balloons.js" \
        "Themes/15 Seconds.totheme/Documents/assets/js/script.js" \
        "Themes/15 Seconds.totheme/Documents/index.html"
git commit -m "feat: add balloon pop countdown mode"
```

---

## Task 3: Implement countdown-animals.js

**Files:**
- Create: `Themes/15 Seconds.totheme/Documents/assets/js/countdown-animals.js`

- [ ] **Step 1: Create countdown-animals.js**

```javascript
(function () {
    const TOTAL_SECONDS = 15;
    const rainbowColors = [
        '#ff0000', '#ff4400', '#ff8800', '#ffbb00', '#ffff00',
        '#ccff00', '#88ff00', '#00ff00', '#00ff88', '#00ffff',
        '#0088ff', '#0000ff', '#4b0082', '#6a00ff', '#8b00ff', '#c000ff'
    ];

    // Lane 0 (number 15) → slowest-looking; lane 15 (number 0) → fastest-looking
    const animals = ['🐌', '🐢', '🦔', '🐿️', '🐓', '🦆', '🐧', '🐻',
                     '🦒', '🐘', '🦊', '🐇', '🦁', '🐆', '🦅', '🐝'];

    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .a-lane {
                position: absolute;
                left: 0;
                right: 0;
                height: 1px;
                background: rgba(255,255,255,0.07);
            }
            .a-racer {
                position: absolute;
                display: flex;
                flex-direction: column;
                align-items: center;
                left: 0;
            }
            .a-emoji {
                font-size: 3rem;
                line-height: 1;
                user-select: none;
            }
            .a-label {
                font-size: 0.85rem;
                font-weight: 900;
                margin-top: 2px;
                user-select: none;
            }
        `;
        document.head.appendChild(style);
    }

    function buildLanes(container) {
        const laneCount = TOTAL_SECONDS + 1; // 16 lanes
        // Distribute lanes from 5% to 95% vertically
        for (let laneIndex = 0; laneIndex < laneCount; laneIndex++) {
            const number = TOTAL_SECONDS - laneIndex;
            const yPercent = 5 + (laneIndex / (laneCount - 1)) * 90;
            const color = rainbowColors[laneIndex];
            const animal = animals[laneIndex];

            // Track line
            const lane = document.createElement('div');
            lane.className = 'a-lane';
            lane.style.top = `${yPercent}%`;
            container.appendChild(lane);

            // Racer (starts off left edge, emoji height ~48px + label ~18px = 66px total)
            const racer = document.createElement('div');
            racer.className = 'a-racer';
            racer.id = `racer-${number}`;
            // Position so the bottom of the racer sits on the lane line
            racer.style.top = `calc(${yPercent}% - 66px)`;
            racer.style.transform = 'translateX(-100px)';

            const emoji = document.createElement('div');
            emoji.className = 'a-emoji';
            emoji.textContent = animal;

            const label = document.createElement('div');
            label.className = 'a-label';
            label.style.color = color;
            label.textContent = number;

            racer.appendChild(emoji);
            racer.appendChild(label);
            container.appendChild(racer);
        }
    }

    // Animate a single racer across the screen (left to right)
    // TRAVERSE_MS: time to cross the full viewport width
    const TRAVERSE_MS = 3500;

    function runRacer(number) {
        const racer = document.getElementById(`racer-${number}`);
        if (!racer) return;

        const startX = -100;
        const endX = window.innerWidth + 100;
        const distance = endX - startX;
        const startTime = performance.now();

        (function animate(now) {
            const progress = Math.min((now - startTime) / TRAVERSE_MS, 1);
            racer.style.transform = `translateX(${startX + distance * progress}px)`;
            if (progress < 1) requestAnimationFrame(animate);
            else racer.remove();
        })(performance.now());
    }

    window.startAnimals = function () {
        injectStyles();

        const container = document.getElementById('countdown-container');
        container.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;';

        buildLanes(container);

        // Staggered entry: animal 15 enters at 1s, 14 at 2s, ..., 0 at 16s
        for (let i = TOTAL_SECONDS; i >= 0; i--) {
            const delay = (TOTAL_SECONDS - i + 1) * 1000;
            setTimeout(() => runRacer(i), delay);
        }
    };
})();
```

- [ ] **Step 2: Add the animals script to index.html**

```html
    <script src="assets/js/countdown-neon.js"></script>
    <script src="assets/js/countdown-balloons.js"></script>
    <script src="assets/js/countdown-animals.js"></script>
    <script src="assets/js/script.js"></script>
```

- [ ] **Step 3: Temporarily force animals in script.js**

```javascript
// Temp: force animals for testing
window.startAnimals();
```

- [ ] **Step 4: Open in browser and verify animal mode**

Open `Themes/15 Seconds.totheme/Documents/index.html`.

Expected:
- 16 horizontal track lines visible on black background.
- Starting at t=1s, 🐌 enters from the left on lane 1 (top) with label "15".
- Each second another animal enters its lane, one second apart.
- All moving animals are visible simultaneously, all at the same speed.
- Each racer exits the right edge and disappears.
- Number labels above animals use rainbow colours.

- [ ] **Step 5: Commit**

```bash
git add "Themes/15 Seconds.totheme/Documents/assets/js/countdown-animals.js" \
        "Themes/15 Seconds.totheme/Documents/assets/js/script.js" \
        "Themes/15 Seconds.totheme/Documents/index.html"
git commit -m "feat: add animal race countdown mode"
```

---

## Task 4: Wire the random dispatcher

**Files:**
- Modify: `Themes/15 Seconds.totheme/Documents/assets/js/script.js`

- [ ] **Step 1: Replace script.js with the final dispatcher**

```javascript
(function () {
    const modes = [window.startNeon, window.startBalloons, window.startAnimals];
    modes[Math.floor(Math.random() * modes.length)]();
})();
```

- [ ] **Step 2: Verify all three modes are reachable**

Reload the page 6+ times in the browser. You should see each of the three modes appear. (With 3 equal-probability modes, expect each to appear roughly once in three reloads.)

If you want to force-test a specific mode temporarily, add `// ` before the modes line and call one directly — then revert.

- [ ] **Step 3: Final commit**

```bash
git add "Themes/15 Seconds.totheme/Documents/assets/js/script.js"
git commit -m "feat: random mode dispatcher for 15 Seconds theme"
```
