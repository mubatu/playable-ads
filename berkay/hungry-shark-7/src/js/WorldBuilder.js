import { Mesh, PlaneGeometry, MeshBasicMaterial, CanvasTexture, LinearFilter } from 'three';

function createBackgroundTexture(world) {
    var canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 256;
    var ctx = canvas.getContext('2d');
    var grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, world.gradientTop || '#1f86c9');
    grad.addColorStop(0.5, world.gradientMid || '#0a548f');
    grad.addColorStop(1, world.gradientBottom || '#04223f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 256);

    // light rays near surface
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#bfe6ff';
    ctx.fillRect(0, 0, 16, 40);
    ctx.globalAlpha = 1;

    var texture = new CanvasTexture(canvas);
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    return texture;
}

function createBubbleSprite(texture) {
    var geo = new PlaneGeometry(1, 1);
    var mat = new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
    var mesh = new Mesh(geo, mat);
    return mesh;
}

export function buildWorld(state) {
    var world = state.config.world;

    var bgGeo = new PlaneGeometry(world.width, world.height);
    var bgMat = new MeshBasicMaterial({ map: createBackgroundTexture(world) });
    var bg = new Mesh(bgGeo, bgMat);
    bg.position.z = -6;
    state.worldGroup.add(bg);

    // seabed strip
    var sandGeo = new PlaneGeometry(world.width, 2.4);
    var sandMat = new MeshBasicMaterial({ color: '#caa86a' });
    var sand = new Mesh(sandGeo, sandMat);
    sand.position.set(0, world.seabedY - 0.4, -5);
    state.worldGroup.add(sand);

    // ambient bubbles
    var i;
    for (i = 0; i < 26; i += 1) {
        var sprite = createBubbleSprite(state.textures.bubble);
        var scale = 0.18 + Math.random() * 0.4;
        sprite.scale.set(scale, scale, 1);
        sprite.position.set(
            (Math.random() - 0.5) * world.width,
            (Math.random() - 0.5) * world.height,
            -3
        );
        sprite.userData.speed = 0.6 + Math.random() * 1.2;
        sprite.userData.swayPhase = Math.random() * Math.PI * 2;
        state.worldGroup.add(sprite);
        state.bubbles.push(sprite);
    }
}

export function updateBubbles(state, delta) {
    var world = state.config.world;
    var i;
    for (i = 0; i < state.bubbles.length; i += 1) {
        var b = state.bubbles[i];
        b.position.y += b.userData.speed * delta;
        b.position.x += Math.sin(state.elapsedTime * 1.5 + b.userData.swayPhase) * 0.2 * delta;
        if (b.position.y > world.height * 0.5) {
            b.position.y = -world.height * 0.5;
            b.position.x = (Math.random() - 0.5) * world.width;
        }
    }
}
