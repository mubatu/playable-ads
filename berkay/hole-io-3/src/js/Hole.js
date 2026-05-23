import * as THREE from 'three';

export function createPlayerHole(config) {
    var group = new THREE.Group();
    group.position.set(0, 0, 0);

    var diameter = config.player.initialDiameter;
    var radius = diameter / 2;

    // Canvas-based radial gradient for the hole
    var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    var ctx = canvas.getContext('2d');
    drawHoleCanvas(ctx, 256);

    var texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;

    var geo = new THREE.CircleGeometry(radius, 48);
    var mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
    var holeMesh = new THREE.Mesh(geo, mat);
    holeMesh.rotation.x = -Math.PI / 2;
    holeMesh.position.y = 0.05;
    group.add(holeMesh);

    // Outer glow ring
    var glowGeo = new THREE.CircleGeometry(radius * 1.25, 48);
    var glowMat = new THREE.MeshBasicMaterial({
        color: 0x111111,
        transparent: true,
        opacity: 0.25,
        depthWrite: false
    });
    var glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.rotation.x = -Math.PI / 2;
    glowMesh.position.y = 0.02;
    group.add(glowMesh);

    group.userData = {
        diameter: diameter,
        maxDiameter: config.player.maxDiameter,
        holeMesh: holeMesh,
        glowMesh: glowMesh,
        texture: texture,
        canvas: canvas,
        pulseTime: 0,
        growPulse: 0
    };

    return group;
}

function drawHoleCanvas(ctx, size) {
    ctx.clearRect(0, 0, size, size);
    var cx = size / 2;
    var cy = size / 2;
    var gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, cx);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(0.6, 'rgba(5, 5, 15, 0.95)');
    gradient.addColorStop(0.85, 'rgba(20, 20, 40, 0.6)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, cx, 0, Math.PI * 2);
    ctx.fill();
}

export function updatePlayerHole(holeGroup, delta) {
    var ud = holeGroup.userData;
    ud.pulseTime += delta;

    // Subtle idle pulse
    var idlePulse = 1 + Math.sin(ud.pulseTime * 3) * 0.015;

    // Grow pulse fades out quickly after consuming
    if (ud.growPulse > 0) {
        ud.growPulse = Math.max(0, ud.growPulse - delta * 4);
    }
    var growScale = 1 + ud.growPulse * 0.12;

    var finalScale = idlePulse * growScale;
    holeGroup.scale.set(finalScale, 1, finalScale);
}

export function growHole(holeGroup, sizeIncrease) {
    var ud = holeGroup.userData;
    var newDiameter = Math.min(ud.diameter + sizeIncrease, ud.maxDiameter);
    ud.diameter = newDiameter;
    var radius = newDiameter / 2;

    ud.holeMesh.geometry.dispose();
    ud.holeMesh.geometry = new THREE.CircleGeometry(radius, 48);

    ud.glowMesh.geometry.dispose();
    ud.glowMesh.geometry = new THREE.CircleGeometry(radius * 1.25, 48);

    ud.growPulse = 1;
}

export function getHoleDiameter(holeGroup) {
    return holeGroup.userData.diameter;
}
