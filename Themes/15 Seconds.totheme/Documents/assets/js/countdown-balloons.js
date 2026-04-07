(function () {
    const TOTAL_SECONDS = 15;
    const rainbowColors = [
        '#ff0000', '#ff4400', '#ff8800', '#ffbb00', '#ffff00',
        '#ccff00', '#88ff00', '#00ff00', '#00ff88', '#00ffff',
        '#0088ff', '#0000ff', '#4b0082', '#6a00ff', '#8b00ff', '#c000ff'
    ];

    function injectStyles() {
        if (document.getElementById('b-styles')) return;
        const style = document.createElement('style');
        style.id = 'b-styles';
        style.textContent = `
            @keyframes b-float {
                0% { transform: translateY(0) translateX(0) rotate(0deg); }
                25% { transform: translateY(-25vh) translateX(var(--sway)) rotate(2deg); }
                75% { transform: translateY(-75vh) translateX(calc(var(--sway) * -1)) rotate(-2deg); }
                100% { transform: translateY(-100vh) translateX(0) rotate(0deg); }
            }
            .b-wrap {
                position: absolute;
                display: flex;
                flex-direction: column;
                align-items: center;
                animation: b-float var(--float-dur) var(--delay) linear forwards;
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
            const floatDur = 16 + Math.random() * 4;
            const delay = (Math.random() * 2).toFixed(2);

            wrap.style.left = `calc(${xPercent}% - 32px)`;
            wrap.style.bottom = '0%';
            wrap.style.setProperty('--sway', `${swayPx}px`);
            wrap.style.setProperty('--float-dur', `${floatDur}s`);
            wrap.style.setProperty('--delay', `${delay}s`);
            wrap.dataset.explosionTime = i;

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
        // Get the explosion position BEFORE changing animation
        const body = wrap.querySelector('.b-body');
        const rect = body.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        // Immediately hide the balloon
        wrap.style.display = 'none';

        // First wave: 30 particles in all directions
        const primaryCount = 30;
        for (let p = 0; p < primaryCount; p++) {
            const angle = (p / primaryCount) * Math.PI * 2;
            const dist = 80 + Math.random() * 120;
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist;
            const size = 4 + Math.random() * 8;
            const rotation = Math.random() * 360;

            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: ${color};
                pointer-events: none;
                left: ${cx - size/2}px;
                top: ${cy - size/2}px;
                box-shadow: 0 0 ${size * 1.5}px ${color};
            `;
            document.body.appendChild(particle);

            const start = performance.now();
            (function animateParticle(now) {
                const progress = Math.min((now - start) / 800, 1);
                const eased = 1 - Math.pow(1 - progress, 1.5);
                const falloff = Math.max(0, 1 - progress * 0.5);
                particle.style.transform = `translate(${dx * eased}px, ${dy * eased + 30 * progress * progress}px) rotate(${rotation * progress}deg) scale(${falloff})`;
                particle.style.opacity = `${Math.max(0, 1 - progress)}`;
                if (progress < 1) requestAnimationFrame(animateParticle);
                else particle.remove();
            })(performance.now());
        }

        // Second wave: glow particles for extra drama
        setTimeout(() => {
            const secondaryCount = 15;
            for (let p = 0; p < secondaryCount; p++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 40 + Math.random() * 80;
                const dx = Math.cos(angle) * dist;
                const dy = Math.sin(angle) * dist;

                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: fixed;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: ${color};
                    pointer-events: none;
                    left: ${cx - 6}px;
                    top: ${cy - 6}px;
                    box-shadow: 0 0 20px ${color}, inset 0 0 10px rgba(255,255,255,0.6);
                    opacity: 0.8;
                `;
                document.body.appendChild(particle);

                const start = performance.now();
                (function animateParticle(now) {
                    const progress = Math.min((now - start) / 600, 1);
                    const eased = 1 - Math.pow(1 - progress, 2);
                    particle.style.transform = `translate(${dx * eased}px, ${dy * eased}px) scale(${1 - progress})`;
                    particle.style.opacity = `${0.8 * (1 - progress)}`;
                    if (progress < 1) requestAnimationFrame(animateParticle);
                    else particle.remove();
                })(performance.now());
            }
        }, 60);
    }

    window.startBalloons = function () {
        injectStyles();

        const container = document.getElementById('countdown-container');
        container.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;overflow:hidden;';

        createBalloons(container);

        let current = TOTAL_SECONDS;

        function tick() {
            if (current < 0) return;

            const wrap = document.getElementById(`balloon-${current}`);
            if (wrap) popBalloon(wrap, rainbowColors[TOTAL_SECONDS - current]);

            current--;

            if (current >= 0) setTimeout(tick, 1000);
        }

        setTimeout(tick, 1000);
    };
})();
