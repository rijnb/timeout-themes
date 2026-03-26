const container = document.getElementById('countdown-container');
const TOTAL_SECONDS = 15;
const Z_SPACING = 3600; // 3x spacing for a massive corridor
const X_SHIFT = -750; // 3x shifted to the side
const Y_SHIFT = -300; // 3x vertical shift

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
        0 0 10px #fff,
        0 0 20px #fff,
        0 0 40px ${color},
        0 0 80px ${color},
        0 0 120px ${color},
        0 0 200px ${color}
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
        vaporize(frontNum);
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
                vaporize(zeroNum);
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

function vaporize(el) {
    const rect = el.getBoundingClientRect();
    const count = 120; // Increased
    const neonColor = el.dataset.neon || '#0ff';

    // Position of the number in screen coordinates
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';

        // Match particle color to number color
        p.style.background = neonColor;
        p.style.boxShadow = `0 0 10px ${neonColor}`;

        // Randomly scatter within the number's bounding box
        p.style.left = (centerX + (Math.random() - 0.5) * rect.width) + 'px';
        p.style.top = (centerY + (Math.random() - 0.5) * rect.height) + 'px';

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 20 + 8; // More explosive
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;

        document.body.appendChild(p);

        let opacity = 1;
        const animate = () => {
            const currentLeft = parseFloat(p.style.left);
            const currentTop = parseFloat(p.style.top);

            p.style.left = (currentLeft + vx) + 'px';
            p.style.top = (currentTop + vy) + 'px';

            opacity -= 0.015;
            p.style.opacity = opacity;

            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                p.remove();
            }
        };
        requestAnimationFrame(animate);
    }

    // Fade out the original element
    el.style.opacity = '0';
    el.style.transform += ' scale(2) translateZ(500px)';

    setTimeout(() => {
        if (el.parentNode) {
            el.remove();
        }
    }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    createNumbers();
    // Start after a short delay
    setTimeout(tick, 1000);
});
