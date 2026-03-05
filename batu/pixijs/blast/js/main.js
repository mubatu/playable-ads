import { Grid } from './grid.js';

(async () => {
    const app = new PIXI.Application();

    await app.init({
        resizeTo: window,
        backgroundColor: 0x1a1a2e,
        antialias: true,
    });

    document.body.appendChild(app.canvas);

    const grid = new Grid(app);
    await grid.loadTextures();
    grid.build();

    // Handle window resize
    window.addEventListener('resize', () => {
        grid.resize();
    });
})();
