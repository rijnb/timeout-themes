(function () {
    const modes = [window.startNeon, window.startBalloons, window.startAnimals];
    modes[Math.floor(Math.random() * modes.length)]();
})();
