const container = document.getElementById('countdown-container');
const TOTAL_SECONDS = 15;
const Z_SPACING = 1200;
const X_SHIFT = -250;
const Y_SHIFT = -100;

// 16 colors spanning the rainbow spectrum
const rainbowColors = [
    '#ff0000', // 15: Red
    '#ff4400', // 14: Red-Orange
    '#ff8800', // 13: Orange
    '#ffbb00', // 12: Orange-Yellow
    '#ffff00', // 11: Yellow
    '#ccff00', // 10: Yellow-Green
    '#88ff00', // 9: Lime
    '#00ff00', // 8: Green
    '#00ff88', // 7: Green-Cyan
    '#00ffff', // 6: Cyan
    '#0088ff', // 5: Blue
    '#0000ff', // 4: Blue
    '#4b0082', // 3: Indigo
    '#6a00ff', // 2: Indigo-Violet
    '#8b00ff', // 1: Violet
    '#c000ff'  // 0: Deep Violet
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
    div.dataset.neon = color; // Save for particles
}

function createNumbers() {
    for (let i = 0; i <= TOTAL_SECONDS; i++) {
        const div = document.createElement('div');
        div.className = 'number';
        div.textContent = i;
        div.id = `num-${i}`;

        // Rainbow color logic spanning the full spectrum for the 16 numbers (15 down to 0)
        // number 15 = index 0 (Red), number 0 = index 15 (Violet)
        const colorIndex = TOTAL_SECONDS - i;
        applyNeonStyle(div, rainbowColors[colorIndex]);

        // Corridor positioning
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
    if (current < 0) {
        // Stop the countdown
        return;
    }

    const frontNum = document.getElementById(`num-${current}`);
    if (frontNum) {
        dissolve(frontNum);
    }

    current--;
    updateStack();

    if (current >= 0) {
        setTimeout(tick, 1000);
    } else {
        // Special case for zero: also vaporize it after 1 second
        setTimeout(() => {
            const zeroNum = document.getElementById('num-0');
            if (zeroNum) {
                dissolve(zeroNum);
            }
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

// Ease-in-out cubic
function easeInOut(t) {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Slow fade-in at start, fast fade-out at end
function easeFadeOut(t) {
    return 1 - t * t * t;
}

function dissolve(el) {
    const duration = 900; // ms
    const startTime = performance.now();

    el.style.transition = 'none';

    const currentTransform = el.style.transform;

    function animate(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const ease = easeInOut(progress);

        // Z moves forward with eased motion
        const zForward = ease * 1000;

        // Curved path: drift sideways then back (sine arc)
        const xDrift = Math.sin(progress * Math.PI) * 200;
        // Gentle upward arc
        const yDrift = -Math.sin(progress * Math.PI) * 120;

        // Slight rotation wobble for organic feel
        const rotateZ = Math.sin(progress * Math.PI * 1.5) * 8;
        const rotateY = Math.sin(progress * Math.PI) * 12;

        // Smooth fade using separate easing
        const opacity = easeFadeOut(progress);

        // Neon glow fades with the number
        const neonColor = el.dataset.neon || '#0ff';
        const glowStrength = opacity;
        el.style.textShadow = `
            0 0 ${5 * glowStrength}px #fff,
            0 0 ${10 * glowStrength}px #fff,
            0 0 ${20 * glowStrength}px ${neonColor},
            0 0 ${40 * glowStrength}px ${neonColor},
            0 0 ${60 * glowStrength}px ${neonColor}
        `;

        el.style.transform = `${currentTransform} translate3d(${xDrift}px, ${yDrift}px, ${zForward}px) rotateZ(${rotateZ}deg) rotateY(${rotateY}deg)`;
        el.style.opacity = opacity;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            if (el.parentNode) {
                el.remove();
            }
        }
    }

    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', () => {
    createNumbers();
    // Start after a short delay
    setTimeout(tick, 1000);
});
