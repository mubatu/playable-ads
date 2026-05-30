import { Group, Mesh, Shape, ShapeGeometry, CircleGeometry, MeshBasicMaterial, Color } from 'three';

export function buildShark(cfg) {
    var group = new Group();
    var s = cfg.size;

    // body — elongated teardrop
    var bodyShape = new Shape();
    bodyShape.moveTo(-1.0 * s, 0);
    bodyShape.bezierCurveTo(-0.8 * s, 0.45 * s, 0.4 * s, 0.45 * s, 1.0 * s, 0.05 * s);
    bodyShape.bezierCurveTo(0.4 * s, -0.4 * s, -0.8 * s, -0.4 * s, -1.0 * s, 0);
    var body = new Mesh(new ShapeGeometry(bodyShape), new MeshBasicMaterial({ color: new Color(cfg.bodyColor) }));
    group.add(body);

    // belly
    var bellyShape = new Shape();
    bellyShape.moveTo(-0.85 * s, -0.05 * s);
    bellyShape.bezierCurveTo(-0.5 * s, -0.32 * s, 0.4 * s, -0.32 * s, 0.85 * s, -0.05 * s);
    bellyShape.bezierCurveTo(0.4 * s, 0.0, -0.5 * s, 0.0, -0.85 * s, -0.05 * s);
    var belly = new Mesh(new ShapeGeometry(bellyShape), new MeshBasicMaterial({ color: new Color(cfg.bellyColor) }));
    belly.position.z = 0.01;
    group.add(belly);

    // dorsal fin
    var dorsal = new Shape();
    dorsal.moveTo(-0.1 * s, 0.3 * s);
    dorsal.lineTo(0.15 * s, 0.75 * s);
    dorsal.lineTo(0.25 * s, 0.3 * s);
    var dorsalMesh = new Mesh(new ShapeGeometry(dorsal), new MeshBasicMaterial({ color: new Color(cfg.finColor) }));
    group.add(dorsalMesh);

    // tail
    var tail = new Shape();
    tail.moveTo(-1.0 * s, 0);
    tail.lineTo(-1.5 * s, 0.45 * s);
    tail.lineTo(-1.2 * s, 0);
    tail.lineTo(-1.5 * s, -0.4 * s);
    var tailMesh = new Mesh(new ShapeGeometry(tail), new MeshBasicMaterial({ color: new Color(cfg.finColor) }));
    group.add(tailMesh);

    // eye
    var eye = new Mesh(new CircleGeometry(0.09 * s, 16), new MeshBasicMaterial({ color: new Color(cfg.eyeColor) }));
    eye.position.set(0.55 * s, 0.12 * s, 0.02);
    group.add(eye);
    var pupil = new Mesh(new CircleGeometry(0.05 * s, 12), new MeshBasicMaterial({ color: new Color(cfg.pupilColor) }));
    pupil.position.set(0.6 * s, 0.12 * s, 0.03);
    group.add(pupil);

    // mouth (red slice)
    var mouth = new Mesh(
        new ShapeGeometry((function () {
            var sh = new Shape();
            sh.moveTo(0.7 * s, -0.05 * s);
            sh.lineTo(0.95 * s, 0);
            sh.lineTo(0.7 * s, 0.06 * s);
            return sh;
        })()),
        new MeshBasicMaterial({ color: new Color('#7a0d12') })
    );
    mouth.position.z = 0.015;
    group.add(mouth);

    group.userData.bodyMaterial = body.material;
    group.userData.bellyMaterial = belly.material;
    group.userData.finMaterials = [dorsalMesh.material, tailMesh.material];
    group.userData.baseColors = {
        body: cfg.bodyColor,
        belly: cfg.bellyColor,
        fin: cfg.finColor
    };
    group.userData.tailMesh = tailMesh;
    return group;
}

export function updateShark(state, delta) {
    if (!state.sharkGroup || state.gameOver) return;

    var cfg = state.config.shark;
    var mc = state.moveCommand;
    // Joystick reports y in screen space (down is positive); invert so up-on-stick is up in world.
    var inX = mc.x;
    var inY = -mc.y;
    var mag = Math.sqrt(inX * inX + inY * inY);
    var w = state.config.world;

    if (mag > 0.05) {
        var dx = inX / mag;
        var dy = inY / mag;
        var target = Math.atan2(dy, dx);
        var diff = target - state.sharkAngle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        state.sharkAngle += diff * Math.min(cfg.turnSpeed * delta, 1);

        var speed = state.isBoosting ? cfg.boostSpeed : cfg.speed;
        var s = Math.min(mag, 1) * speed;
        state.sharkVelX = Math.cos(state.sharkAngle) * s;
        state.sharkVelY = Math.sin(state.sharkAngle) * s;
    } else {
        state.sharkVelX *= 0.92;
        state.sharkVelY *= 0.92;
    }

    state.sharkX += state.sharkVelX * delta;
    state.sharkY += state.sharkVelY * delta;

    var halfW = w.width / 2 - 0.5;
    if (state.sharkX < -halfW) state.sharkX = -halfW;
    if (state.sharkX > halfW) state.sharkX = halfW;
    if (state.sharkY < w.seabedY + 0.6) state.sharkY = w.seabedY + 0.6;
    if (state.sharkY > w.surfaceY) state.sharkY = w.surfaceY;

    state.sharkGroup.position.x = state.sharkX;
    state.sharkGroup.position.y = state.sharkY;

    // face direction; mirror vertically when angled past straight-up/down so belly stays toward seabed.
    var flipY = Math.cos(state.sharkAngle) < 0 ? -1 : 1;
    state.sharkGroup.rotation.z = state.sharkAngle;
    state.sharkGroup.scale.y = flipY;

    // tail wag
    var tail = state.sharkGroup.userData.tailMesh;
    if (tail) tail.rotation.z = Math.sin(state.elapsedTime * 12) * 0.25;

    // gold rush tint
    if (state.isGoldRush) {
        state.sharkGroup.userData.bodyMaterial.color.set('#f6c84c');
        state.sharkGroup.userData.bellyMaterial.color.set('#fff2b8');
        state.sharkGroup.userData.finMaterials[0].color.set('#d49b1f');
        state.sharkGroup.userData.finMaterials[1].color.set('#d49b1f');
    } else {
        var bc = state.sharkGroup.userData.baseColors;
        state.sharkGroup.userData.bodyMaterial.color.set(bc.body);
        state.sharkGroup.userData.bellyMaterial.color.set(bc.belly);
        state.sharkGroup.userData.finMaterials[0].color.set(bc.fin);
        state.sharkGroup.userData.finMaterials[1].color.set(bc.fin);
    }
}
