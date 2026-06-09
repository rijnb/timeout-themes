(function () {
    const TOTAL_SECONDS = 15;
    const rainbowColors = [
        '#ff0000', '#ff4400', '#ff8800', '#ffbb00', '#ffff00',
        '#ccff00', '#88ff00', '#00ff00', '#00ff88', '#00ffff',
        '#0088ff', '#0000ff', '#4b0082', '#6a00ff', '#8b00ff', '#c000ff'
    ];

    let styleInjected = false;

    function injectStyle() {
        if (styleInjected) return;
        styleInjected = true;
        const style = document.createElement('style');
        style.textContent =
            '@keyframes birdFlap { 0%,100% { transform: scaleX(1); } 50% { transform: scaleX(0.55); } }' +
            '.bird-wings { transform-box: fill-box; transform-origin: center; animation: birdFlap 0.6s ease-in-out infinite; }';
        document.head.appendChild(style);
    }

    function createBirdSVG(color, flapDuration, flapDelay) {
        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        // Oriented so the bird "faces" up (negative Y), like the planes did.
        svg.setAttribute('viewBox', '-30 -28 60 52');
        svg.setAttribute('width', '60');
        svg.setAttribute('height', '52');
        svg.style.overflow = 'visible';

        function shape(tag, attrs) {
            const e = document.createElementNS(ns, tag);
            for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
            return e;
        }

        const light = 'rgba(255,255,255,0.22)';

        // Body (slim teardrop, head at the top)
        svg.appendChild(shape('path', {
            d: 'M0,-20 C3,-14 3,-2 2,8 C1.5,14 0.5,18 0,20 C-0.5,18 -1.5,14 -2,8 C-3,-2 -3,-14 0,-20 Z',
            fill: color
        }));

        // Body highlight
        svg.appendChild(shape('path', {
            d: 'M0,-18 C1.5,-12 1.5,-2 1,8 C0.7,13 0.3,16 0,18',
            fill: 'none', stroke: light, 'stroke-width': '1.6', 'stroke-linecap': 'round'
        }));

        // Beak
        svg.appendChild(shape('path', {
            d: 'M0,-26 L2,-19 L-2,-19 Z',
            fill: 'rgba(255,190,60,0.9)'
        }));

        // Flapping wings group
        const wings = shape('g', { class: 'bird-wings' });
        wings.style.animationDuration = flapDuration + 's';
        wings.style.animationDelay = flapDelay + 's';

        // Left wing
        wings.appendChild(shape('path', {
            d: 'M-2,-6 C-14,-14 -22,-10 -28,0 C-20,-6 -12,-4 -2,0 Z',
            fill: color
        }));
        // Right wing
        wings.appendChild(shape('path', {
            d: 'M2,-6 C14,-14 22,-10 28,0 C20,-6 12,-4 2,0 Z',
            fill: color
        }));
        // Wing highlights
        wings.appendChild(shape('path', {
            d: 'M-3,-5 C-12,-10 -19,-8 -25,-1', fill: 'none', stroke: light, 'stroke-width': '1', 'stroke-linecap': 'round'
        }));
        wings.appendChild(shape('path', {
            d: 'M3,-5 C12,-10 19,-8 25,-1', fill: 'none', stroke: light, 'stroke-width': '1', 'stroke-linecap': 'round'
        }));
        svg.appendChild(wings);

        // Tail
        svg.appendChild(shape('path', {
            d: 'M0,16 L4,24 L0,21 L-4,24 Z',
            fill: color
        }));

        return svg;
    }

    window.startBirds = function () {
        injectStyle();

        const vw = window.innerWidth;
        const vh = window.innerHeight;

        const HALF_W = 30; // half of svg width  -> rotation pivot
        const HALF_H = 26; // half of svg height

        const birds = [];

        for (let i = 0; i < TOTAL_SECONDS; i++) {
            const color = rainbowColors[i];
            const wrap = document.createElement('div');
            wrap.style.cssText = `position:fixed;left:0;top:0;pointer-events:none;transform-origin:${HALF_W}px ${HALF_H}px;`;
            wrap.appendChild(createBirdSVG(color, 0.5 + Math.random() * 0.4, Math.random() * 0.6));
            document.body.appendChild(wrap);

            const baseX = (5 + (i / (TOTAL_SECONDS - 1)) * 90) / 100 * vw;

            birds.push({
                el: wrap,
                x: baseX,
                y: vh + 60 + Math.random() * 200,   // stagger start heights
                speed: 1.2 + Math.random() * 1.4,
                baseSpeed: 1.2 + Math.random() * 1.4,
                angle: 0,                            // 0 = flying straight up; +ve leans right
                // Two layered low-frequency sines make the wander path organic but smooth.
                wFreq1: 0.004 + Math.random() * 0.004,
                wPhase1: Math.random() * Math.PI * 2,
                wAmp1: 0.18 + Math.random() * 0.14,  // radians (~10-18 deg)
                wFreq2: 0.011 + Math.random() * 0.006,
                wPhase2: Math.random() * Math.PI * 2,
                wAmp2: 0.06 + Math.random() * 0.06,
                exiting: false,
                exitDir: 0,
                removed: false
            });
        }

        let frame = 0;
        let current = TOTAL_SECONDS;

        function tick() {
            if (current <= 0) return;
            const exitIndex = TOTAL_SECONDS - current;
            if (birds[exitIndex] && !birds[exitIndex].removed) {
                birds[exitIndex].exiting = true;
                birds[exitIndex].exitDir = Math.random() < 0.5 ? -1 : 1;
            }
            current--;
            if (current > 0) setTimeout(tick, 1000);
        }

        setTimeout(tick, 1000);

        // Gentle easing factors -> the bird never turns or accelerates abruptly.
        const TURN_EASE = 0.025;
        const SPEED_EASE = 0.02;

        function animate() {
            frame++;
            for (const b of birds) {
                if (b.removed) continue;

                let targetAngle, targetSpeed;

                if (!b.exiting) {
                    targetAngle =
                        Math.sin(frame * b.wFreq1 + b.wPhase1) * b.wAmp1 +
                        Math.sin(frame * b.wFreq2 + b.wPhase2) * b.wAmp2;
                    targetSpeed = b.baseSpeed;
                } else {
                    // Peel away to the side and pick up a little speed, all gradually.
                    targetAngle = b.exitDir * 1.15; // ~66 deg lean, eased into slowly
                    targetSpeed = b.baseSpeed * 2.6;
                }

                // Slowly steer heading and speed toward their targets.
                b.angle += (targetAngle - b.angle) * TURN_EASE;
                b.speed += (targetSpeed - b.speed) * SPEED_EASE;

                // Velocity follows the heading exactly, so the bird always faces
                // where it is going -> no decoupled snapping.
                const vx = Math.sin(b.angle) * b.speed;
                const vy = -Math.cos(b.angle) * b.speed;
                b.x += vx;
                b.y += vy;

                if (!b.exiting) {
                    // Recycle naturally exited birds back from the bottom.
                    if (b.y < -100) {
                        b.y = vh + 60;
                        b.x = (5 + Math.random() * 90) / 100 * vw;
                        b.wPhase1 = Math.random() * Math.PI * 2;
                        b.wPhase2 = Math.random() * Math.PI * 2;
                    }
                } else if (b.x < -140 || b.x > vw + 140 || b.y < -160) {
                    b.el.remove();
                    b.removed = true;
                    continue;
                }

                const rotation = b.angle * 180 / Math.PI;
                b.el.style.transform = `translate(${b.x - HALF_W}px, ${b.y - HALF_H}px) rotate(${rotation}deg)`;
            }
            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    };
})();
