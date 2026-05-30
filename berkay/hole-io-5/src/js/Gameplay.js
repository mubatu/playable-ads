import { createCityEnvironment } from './CityEnvironment.js';
import { createHole } from './Hole.js';
import { createCameraController } from './CameraController.js';
import { createParticleSystem } from './Particles.js';
import {
    addScore,
    showEndScreen,
    showEndButtons,
    hideEndButtons
} from './Hud.js';
import { updateTimerDisplay } from './GameState.js';
import { dismissTutorial } from './Tutorial.js';

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function tryConsumeObject(state, obj, hole) {
    if (obj.consumed) {
        return;
    }

    var dx = obj.x - hole.x;
    var dz = obj.z - hole.z;
    var dist = Math.sqrt(dx * dx + dz * dz);
    var holeRadius = hole.getRadius();

    if (dist >= holeRadius) {
        return;
    }

    if (obj.size > hole.diameter) {
        return;
    }

    obj.consumed = true;
    obj.consumeTime = 0;

    addScore(state, obj.score);
    state.audio.playConsume();

    var growth = obj.growth || state.config.hole.growthSmall;
    hole.setDiameter(hole.diameter + growth);
    hole.triggerPulse();
    state.audio.playGrowth();

    state.particles.emit(hole.x, 0.2, hole.z, 0xf1c40f, 6);
}

function updateConsumingObjects(objects, delta) {
    var i;
    var obj;
    var t;
    var scale;

    for (i = 0; i < objects.length; i += 1) {
        obj = objects[i];
        if (!obj.consumed || obj.group.visible === false) {
            continue;
        }

        obj.consumeTime += delta;
        t = clamp(obj.consumeTime / obj.consumeDuration, 0, 1);
        scale = 1 - t;
        obj.group.scale.set(scale, scale, scale);
        obj.group.position.y = -t * 1.2;

        if (t >= 1) {
            obj.group.visible = false;
        }
    }
}

export function updateGameplay(state, delta) {
    var hole = state.hole;
    var city = state.city;
    var move = state.moveCommand;
    var tutorialMax = state.config.session.tutorialMaxSeconds || 3;
    var halfMap;
    var speed;
    var dirX;
    var dirZ;
    var len;
    var i;

    if (state.gameEnded || !hole || !city) {
        return;
    }

    if (state.tutorialActive) {
        state.tutorialTimer += delta;
        if (state.tutorialTimer >= tutorialMax) {
            dismissTutorial(state);
        }
    }

    if (!state.sessionStarted) {
        state.sessionStarted = true;
    }

    if (move && (Math.abs(move.x) > 0.05 || Math.abs(move.y) > 0.05)) {
        state.audio.unlock();
        if (state.tutorialActive) {
            dismissTutorial(state);
        }
    }

    speed = state.config.hole.moveSpeed || 5;
    dirX = move ? move.x : 0;
    dirZ = move ? move.y : 0;
    len = Math.sqrt(dirX * dirX + dirZ * dirZ);

    if (len > 0.001) {
        dirX /= len;
        dirZ /= len;
        hole.setPosition(
            hole.x + dirX * speed * delta,
            hole.z + dirZ * speed * delta
        );
    }

    halfMap = (city.groundSize || 42) * 0.5 - hole.getRadius();
    hole.setPosition(
        clamp(hole.x, -halfMap, halfMap),
        clamp(hole.z, -halfMap, halfMap)
    );

    hole.update(delta);

    for (i = 0; i < city.objects.length; i += 1) {
        tryConsumeObject(state, city.objects[i], hole);
    }

    updateConsumingObjects(city.objects, delta);
    state.particles.update(delta);
    state.cameraCtrl.update(delta, hole.x, hole.z, hole.diameter);

    state.timeRemaining -= delta;
    updateTimerDisplay(state);

    if (state.timeRemaining <= 0) {
        endSession(state);
    }
}

function endSession(state) {
    if (state.gameEnded) {
        return;
    }

    state.gameEnded = true;

    if (state.tutorialTextEl) {
        state.tutorialTextEl.hidden = true;
    }

    if (state.ui.endOverlay) {
        state.ui.endOverlay.setTitle("Time's Up!");
        state.ui.endOverlay.setSubtitle('Final Score: ' + state.score);
    }

    showEndScreen(state);
    showEndButtons(state);
}

export function primeGameplay(state) {
    hideEndButtons(state);
    updateTimerDisplay(state);
}

export function initWorld(state) {
    var city = createCityEnvironment(state.config);
    var hole = createHole(state.config);
    var cameraCtrl = createCameraController(state.camera, state.config);

    state.cityContainer.add(city.container);
    state.holeContainer.add(hole.group);
    state.city = city;
    state.hole = hole;
    state.cameraCtrl = cameraCtrl;
    state.particles = createParticleSystem(state);

    hole.setDiameter(hole.diameter);
    cameraCtrl.update(0, 0, 0, hole.diameter);
}
