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
    // Initial implementation (will be enhanced in Task 4)
    el.style.opacity = '0';
    el.style.transform += ' scale(1.5)';
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
