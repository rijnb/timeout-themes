(function () {
    const modes = [window.startNeon, window.startBalloons, window.startBirds].filter(Boolean);
    if (modes.length) modes[Math.floor(Math.random() * modes.length)]();
})();
