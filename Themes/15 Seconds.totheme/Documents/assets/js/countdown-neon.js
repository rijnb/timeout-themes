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
