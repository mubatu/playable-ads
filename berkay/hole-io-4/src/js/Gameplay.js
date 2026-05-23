import * as THREE from 'three';
import { getDiameter, grow, updateHole } from './Hole.js';
import { burst, updateParticles } from './ParticleFX.js';
import { addScore, showEndScreen, updateTimerUI } from './Hud.js';

var DEG2RAD = Math.PI / 180;

function moveHole(state, delta) {
    var cmd = state.move;
    var len = Math.sqrt(cmd.x * cmd.x + cmd.y * cmd.y);
    if (len < 0.05) {
        return;
    }
    var nx = cmd.x / len;
    var nz = cmd.y / len;
    var speed = state.config.hole.speed;
    var half = state.config.ground.size / 2 - 1;

    state.hole.position.x += nx * speed * delta;
    state.hole.position.z += nz * speed * delta;
    state.hole.position.x = Math.max(-half, Math.min(half, state.hole.position.x));
    state.hole.position.z = Math.max(-half, Math.min(half, state.hole.position.z));
}

function updateCamera(state, delta) {
    var camConf = state.config.camera;
    var diameter = getDiameter(state.hole);
    var dist = camConf.baseDistance + diameter * camConf.distancePerDiameter;
    var tilt = camConf.tilt * DEG2RAD;

    var hx = state.hole.position.x;
    var hz = state.hole.position.z;

    var desiredX = hx;
    var desiredY = Math.sin(tilt) * dist;
    var desiredZ = hz + Math.cos(tilt) * dist;

    var lag = camConf.lag * delta;
    if (lag > 1) {
        lag = 1;
    }
    state.camera.position.x += (desiredX - state.camera.position.x) * lag;
    state.camera.position.y += (desiredY - state.camera.position.y) * lag;
    state.camera.position.z += (desiredZ - state.camera.position.z) * lag;

    state.cameraTarget.x += (hx - state.cameraTarget.x) * lag;
    state.cameraTarget.z += (hz - state.cameraTarget.z) * lag;
    state.camera.lookAt(state.cameraTarget);
}

function growthAmount(state, category) {
    var g = state.config.hole.growth;
    return g[category];
}

function consumeObject(state, item) {
    item.consumed = true;
    var color = '#ffd27f';
    var mesh = item.group;

    // pull-in + shrink animation, then remove
    var startScale = mesh.scale.x;
    var duration = 0.3;
    var elapsed = 0;
    var holePos = state.hole.position;

    burst(state.particles, mesh.position, color);
    addScore(state, state.config.scoring[item.category]);
    grow(state.hole, growthAmount(state, item.category));

    item.anim = function (delta) {
        elapsed += delta;
        var t = Math.min(elapsed / duration, 1);
        mesh.position.x += (holePos.x - mesh.position.x) * 0.3;
        mesh.position.z += (holePos.z - mesh.position.z) * 0.3;
        mesh.position.y = item.baseY - t * 1.5;
        mesh.scale.setScalar(startScale * (1 - t));
        mesh.rotation.y += delta * 6;
        if (t >= 1) {
            state.consumablesGroup.remove(mesh);
            item.done = true;
            return true;
        }
        return false;
    };
}

function checkConsumption(state) {
    var holeRadius = getDiameter(state.hole) / 2;
    var hx = state.hole.position.x;
    var hz = state.hole.position.z;
    var i;
    for (i = 0; i < state.consumables.length; i += 1) {
        var item = state.consumables[i];
        if (item.consumed) {
            continue;
        }
        var dx = item.group.position.x - hx;
        var dz = item.group.position.z - hz;
        var dist = Math.sqrt(dx * dx + dz * dz);
        // object center must be over the hole AND fit by size
        if (dist < holeRadius && item.width <= getDiameter(state.hole)) {
            consumeObject(state, item);
        }
    }
}

function runAnimations(state, delta) {
    var i;
    for (i = 0; i < state.consumables.length; i += 1) {
        var item = state.consumables[i];
        if (item.anim && !item.done) {
            item.anim(delta);
        }
    }
}

export function updateGameplay(state, delta) {
    updateHole(state.hole, delta);
    updateParticles(state.particles, delta);
    runAnimations(state, delta);
    updateCamera(state, delta);

    if (!state.running || state.ended) {
        return;
    }

    moveHole(state, delta);
    checkConsumption(state);

    state.timeLeft -= delta;
    if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        state.ended = true;
        state.running = false;
        showEndScreen(state);
    }
    updateTimerUI(state);
}
