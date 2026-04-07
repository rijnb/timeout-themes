(function () {
    const modes = [window.startNeon, window.startBalloons, window.startPlanes].filter(Boolean);
    if (modes.length) modes[Math.floor(Math.random() * modes.length)]();
})();
