import { growHole } from './Hole.js';
import { emitParticles } from './ParticleFX.js';
import { addScore } from './Hud.js';

var CONSUME_DURATION = 0.35;

function lerp(a, b, t) {
    return a + (b - a) * t;
}

export function updateMovement(state, delta) {
    if (state.gameOver || !state.joystickCommand) {
        return;
    }

    var cmd = state.joystickCommand;
    var speed = state.config.hole.speed;
    var hole = state.hole;
    var halfMap = state.config.map.size / 2 - 1;

    var dx = cmd.x * speed * delta;
    var dz = cmd.y * speed * delta;

    hole.group.position.x += dx;
    hole.group.position.z += dz;

    hole.group.position.x = Math.max(-halfMap, Math.min(halfMap, hole.group.position.x));
    hole.group.position.z = Math.max(-halfMap, Math.min(halfMap, hole.group.position.z));
}

export function updateConsumption(state, delta) {
    if (state.gameOver) {
        return;
    }

    var objects = state.environment.objects;
    var hole = state.hole;
    var holePos = hole.group.position;
    var i, obj, dist, objSize, growth, points, color;

    for (i = objects.length - 1; i >= 0; i -= 1) {
        obj = objects[i];
        if (obj.userData.consuming) {
            updateConsumeAnimation(state, obj, delta);
            continue;
        }
        if (!obj.visible) {
            continue;
        }

        objSize = obj.userData.objectSize;
        if (objSize > hole.diameter) {
            continue;
        }

        dist = Math.sqrt(
            Math.pow(holePos.x - obj.position.x, 2) +
            Math.pow(holePos.z - obj.position.z, 2)
        );

        if (dist < hole.radius * 0.8) {
            startConsumeAnimation(state, obj, i);
        }
    }
}

function startConsumeAnimation(state, obj, index) {
    obj.userData.consuming = true;
    obj.userData.consumeTime = 0;
    obj.userData.consumeDuration = CONSUME_DURATION;
    obj.userData.startPos = obj.position.clone();
    obj.userData.startScale = obj.scale.clone();
    obj.userData.objectIndex = index;
}

function updateConsumeAnimation(state, obj, delta) {
    obj.userData.consumeTime += delta;
    var t = Math.min(obj.userData.consumeTime / obj.userData.consumeDuration, 1);
    var holePos = state.hole.group.position;

    obj.position.x = lerp(obj.userData.startPos.x, holePos.x, t);
    obj.position.z = lerp(obj.userData.startPos.z, holePos.z, t);
    obj.position.y = -t * 1.5;

    var s = 1 - t;
    obj.scale.set(
        obj.userData.startScale.x * s,
        obj.userData.startScale.y * s,
        obj.userData.startScale.z * s
    );

    if (t >= 1) {
        finishConsume(state, obj);
    }
}

function finishConsume(state, obj) {
    var category = obj.userData.category;
    var config = state.config;
    var growth, points, color;

    if (category === 'small') {
        growth = config.hole.growthSmall;
        points = config.scoring.smallPoints;
        color = 0x44FF44;
    } else if (category === 'medium') {
        growth = config.hole.growthMedium;
        points = config.scoring.mediumPoints;
        color = 0x44AAFF;
    } else {
        growth = config.hole.growthLarge;
        points = config.scoring.largePoints;
        color = 0xFF44FF;
    }

    growHole(state.hole, growth, config.hole.maxDiameter);
    addScore(state, points);
    emitParticles(state.particlePool, state.hole.group.position, color, 8);

    obj.visible = false;
    obj.userData.consuming = false;

    var idx = state.environment.objects.indexOf(obj);
    if (idx !== -1) {
        state.environment.objects.splice(idx, 1);
    }
    state.consumedCount += 1;
}

export function updateCamera(state, delta) {
    var config = state.config.camera;
    var holePos = state.hole.group.position;
    var cam = state.camera;
    var angleRad = (config.angle * Math.PI) / 180;
    var dist = config.baseDistance + (state.hole.diameter - state.config.hole.initialDiameter) * config.zoomOutPerUnit;
    var targetY = Math.sin(angleRad) * dist;
    var targetZOffset = Math.cos(angleRad) * dist;
    var smoothing = config.smoothing;

    var targetX = holePos.x;
    var targetZ = holePos.z + targetZOffset;

    cam.position.x += (targetX - cam.position.x) * smoothing;
    cam.position.y += (targetY - cam.position.y) * smoothing;
    cam.position.z += (targetZ - cam.position.z) * smoothing;

    state.cameraLookTarget.x += (holePos.x - state.cameraLookTarget.x) * smoothing;
    state.cameraLookTarget.z += (holePos.z - state.cameraLookTarget.z) * smoothing;

    cam.lookAt(state.cameraLookTarget);
}
