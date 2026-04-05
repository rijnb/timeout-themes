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
        if (document.getElementById('a-styles')) return;
        const style = document.createElement('style');
        style.id = 'a-styles';
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
