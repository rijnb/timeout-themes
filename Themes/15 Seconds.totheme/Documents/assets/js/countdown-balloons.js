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
