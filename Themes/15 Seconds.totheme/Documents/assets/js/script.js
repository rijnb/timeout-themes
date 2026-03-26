const container = document.getElementById('countdown-container');
const TOTAL_SECONDS = 15;
const Z_SPACING = 300;

function createNumbers() {
    for (let i = 0; i <= TOTAL_SECONDS; i++) {
        const div = document.createElement('div');
        div.className = 'number';
        div.textContent = i;
        div.id = `num-${i}`;
        // Initial stack: further numbers have negative translateZ
        const initialZ = -(TOTAL_SECONDS - i) * Z_SPACING;
        div.style.transform = `translate(-50%, -50%) translateZ(${initialZ}px)`;
        container.appendChild(div);
    }
}

let current = TOTAL_SECONDS;
function tick() {
    if (current < 0) {
        // Option: loop or stop
        // current = TOTAL_SECONDS;
        // createNumbers();
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
    }
}

function updateStack() {
    const numbers = document.querySelectorAll('.number');
    numbers.forEach(num => {
        const val = parseInt(num.textContent);
        if (val <= current) {
            const z = -(current - val) * Z_SPACING;
            num.style.transform = `translate(-50%, -50%) translateZ(${z}px)`;
            num.style.opacity = '1';
        }
    });
}

function vaporize(el) {
    const rect = el.getBoundingClientRect();
    const count = 100; // More particles for better effect

    // Position of the number in screen coordinates
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';

        // Randomly scatter within the number's bounding box
        p.style.left = (centerX + (Math.random() - 0.5) * rect.width) + 'px';
        p.style.top = (centerY + (Math.random() - 0.5) * rect.height) + 'px';

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 15 + 5;
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
