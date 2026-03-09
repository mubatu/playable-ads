import { Terrain } from './terrain.js';
import { Trees } from './trees.js';
import { Joystick } from './joystick.js';
import { Timberman } from './timberman.js';

(async () => {
    const app = new PIXI.Application();

    await app.init({
        resizeTo: window,
        backgroundColor: 0x87CEEB, // Sky blue
        antialias: true,
    });

    document.body.appendChild(app.canvas);

    // Enable depth sorting on stage
    app.stage.sortableChildren = true;

    // Build scene
    const terrain = new Terrain(app);
    terrain.draw();

    const trees = new Trees(app, terrain);
    trees.draw();

    const joystick = new Joystick(app);
    const timberman = new Timberman(app, terrain, joystick);

    // Handle window resize
    window.addEventListener('resize', () => {
        terrain.resize();
        trees.resize();
        timberman.resize();
    });
})();
