(function () {
    const TOTAL_SECONDS = 15;
    const rainbowColors = [
        '#ff0000', '#ff4400', '#ff8800', '#ffbb00', '#ffff00',
        '#ccff00', '#88ff00', '#00ff00', '#00ff88', '#00ffff',
        '#0088ff', '#0000ff', '#4b0082', '#6a00ff', '#8b00ff', '#c000ff'
    ];

    function createPlaneSVG(color) {
        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '-20 -40 40 80');
        svg.setAttribute('width', '44');
        svg.setAttribute('height', '88');
        svg.style.overflow = 'visible';

        function shape(tag, attrs) {
            const e = document.createElementNS(ns, tag);
            for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
            return e;
        }

        const light = 'rgba(255,255,255,0.18)';

        // Engine glow
        svg.appendChild(shape('ellipse', { cx: '0', cy: '14', rx: '6', ry: '4', fill: 'rgba(255,200,80,0.25)' }));

        // Fuselage
        svg.appendChild(shape('path', {
            d: 'M0,-37 C5,-28 6,-6 6,14 L5,26 C4,32 2,36 0,37 C-2,36 -4,32 -5,26 L-6,14 C-6,-6 -5,-28 0,-37 Z',
            fill: color
        }));

        // Fuselage highlight
        svg.appendChild(shape('path', {
            d: 'M0,-35 C2,-26 3,-6 3,10 L2,22 C1.5,28 0.5,32 0,33',
            fill: 'none', stroke: light, 'stroke-width': '2.5', 'stroke-linecap': 'round'
        }));

        // Left wing
        svg.appendChild(shape('path', {
            d: 'M-6,6 L-34,26 C-35,27 -34,30 -33,30 L-6,18 Z',
            fill: color
        }));

        // Right wing
        svg.appendChild(shape('path', {
            d: 'M6,6 L34,26 C35,27 34,30 33,30 L6,18 Z',
            fill: color
        }));

        // Wing highlights
        svg.appendChild(shape('path', {
            d: 'M-6,8 L-30,26', fill: 'none', stroke: light, 'stroke-width': '1.2', 'stroke-linecap': 'round'
        }));
        svg.appendChild(shape('path', {
            d: 'M6,8 L30,26', fill: 'none', stroke: light, 'stroke-width': '1.2', 'stroke-linecap': 'round'
        }));

        // Left tail fin
        svg.appendChild(shape('path', {
            d: 'M-5,24 L-20,37 C-21,38 -20,40 -19,40 L-5,31 Z',
            fill: color
        }));

        // Right tail fin
        svg.appendChild(shape('path', {
            d: 'M5,24 L20,37 C21,38 20,40 19,40 L5,31 Z',
            fill: color
        }));

        // Cockpit
        svg.appendChild(shape('ellipse', {
            cx: '0', cy: '-22', rx: '3', ry: '8',
            fill: 'rgba(180,230,255,0.55)', stroke: 'rgba(255,255,255,0.3)', 'stroke-width': '0.5'
        }));

        // Engine exhaust glow
        svg.appendChild(shape('ellipse', {
            cx: '0', cy: '36', rx: '4', ry: '3',
            fill: 'rgba(255,160,40,0.45)'
        }));

        return svg;
    }

    window.startPlanes = function () {
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        const planes = [];

        for (let i = 0; i < TOTAL_SECONDS; i++) {
            const color = rainbowColors[i];
            const wrap = document.createElement('div');
            wrap.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;transform-origin:22px 44px;';
            wrap.appendChild(createPlaneSVG(color));
            document.body.appendChild(wrap);

            const baseX = (5 + (i / (TOTAL_SECONDS - 1)) * 90) / 100 * vw;

            planes.push({
                el: wrap,
                x: baseX,
                y: vh + 60 + Math.random() * 200,   // stagger start heights
                baseSpeed: 1.2 + Math.random() * 1.4,
                vx: 0,
                vxFreq: 0.006 + Math.random() * 0.006,
                vxPhase: Math.random() * Math.PI * 2,
                vxAmp: 1.2 + Math.random() * 1.8,
                rotation: 0,
                exiting: false,
                exitDir: 0,
                exitSpeed: 0,
                removed: false
            });
        }

        let frame = 0;
        let current = TOTAL_SECONDS;

        function tick() {
            if (current <= 0) return;
            const exitIndex = TOTAL_SECONDS - current;
            if (planes[exitIndex] && !planes[exitIndex].removed) {
                planes[exitIndex].exiting = true;
                planes[exitIndex].exitDir = Math.random() < 0.5 ? -1 : 1;
            }
            current--;
            if (current > 0) setTimeout(tick, 1000);
        }

        setTimeout(tick, 1000);

        function animate() {
            frame++;
            for (const p of planes) {
                if (p.removed) continue;

                if (!p.exiting) {
                    p.y -= p.baseSpeed;
                    p.vx = Math.sin(frame * p.vxFreq + p.vxPhase) * p.vxAmp;
                    p.x += p.vx;
                    p.rotation += (p.vx * 5 - p.rotation) * 0.08;

                    // Recycle naturally exited planes back from the bottom
                    if (p.y < -100) {
                        p.y = vh + 60;
                        p.x = (5 + Math.random() * 90) / 100 * vw;
                        p.vxPhase = Math.random() * Math.PI * 2;
                    }
                } else {
                    const targetRot = p.exitDir * 42;
                    p.rotation += (targetRot - p.rotation) * 0.09;
                    p.exitSpeed = Math.min(p.exitSpeed + 0.4, 18);
                    p.x += p.exitDir * p.exitSpeed;
                    p.y -= p.baseSpeed * 0.6;

                    if (p.x < -120 || p.x > vw + 120) {
                        p.el.remove();
                        p.removed = true;
                        continue;
                    }
                }

                p.el.style.transform = `translate(${p.x - 22}px, ${p.y - 44}px) rotate(${p.rotation}deg)`;
            }
            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    };
})();
