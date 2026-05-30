import { Mesh, PlaneGeometry, MeshBasicMaterial, Color } from 'three';
import { Background } from '../../../../reusables/components/Background.js';

export function buildWorld(state) {
    var background = new Background(state.config.background, state.bgTexture);
    background.mesh.position.z = -5;
    state.scene.add(background.mesh);

    var world = state.config.world;

    // surface band
    var surfaceMat = new MeshBasicMaterial({ color: new Color('#7cc3ff'), transparent: true, opacity: 0.18 });
    var surface = new Mesh(new PlaneGeometry(world.width * 2, 1.2), surfaceMat);
    surface.position.set(0, world.surfaceY, -4);
    state.worldGroup.add(surface);

    // seabed band
    var bedMat = new MeshBasicMaterial({ color: new Color('#1a3554') });
    var bed = new Mesh(new PlaneGeometry(world.width * 2, 1.8), bedMat);
    bed.position.set(0, world.seabedY - 0.4, -4);
    state.worldGroup.add(bed);

    // ambient bubbles
    for (var i = 0; i < 14; i++) {
        var b = new Mesh(
            new PlaneGeometry(0.25 + Math.random() * 0.25, 0.25 + Math.random() * 0.25),
            new MeshBasicMaterial({ color: new Color('#bfe1ff'), transparent: true, opacity: 0.35 })
        );
        b.position.set(
            (Math.random() - 0.5) * world.width,
            world.seabedY + Math.random() * (world.surfaceY - world.seabedY),
            -3
        );
        b.userData = { speed: 0.4 + Math.random() * 0.8 };
        state.worldGroup.add(b);
        state.bubbles.push(b);
    }
}

export function updateBubbles(state, delta) {
    var w = state.config.world;
    for (var i = 0; i < state.bubbles.length; i++) {
        var b = state.bubbles[i];
        b.position.y += b.userData.speed * delta;
        b.position.x += Math.sin(state.elapsedTime + i) * 0.01;
        if (b.position.y > w.surfaceY) {
            b.position.y = w.seabedY;
            b.position.x = (Math.random() - 0.5) * w.width;
        }
    }
}
