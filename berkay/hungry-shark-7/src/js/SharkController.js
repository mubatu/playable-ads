var DEADZONE = 0.12;

function lerpAngle(a, b, t) {
    var diff = b - a;
    while (diff > Math.PI) { diff -= Math.PI * 2; }
    while (diff < -Math.PI) { diff += Math.PI * 2; }
    return a + diff * t;
}

export function updateShark(state, delta) {
    if (!state.gameStarted || state.gameOver) {
        return;
    }

    var cfg = state.config.shark;
    var shark = state.shark;
    var world = state.config.world;

    var dirX = state.move.x;
    var dirY = -state.move.y;
    var mag = Math.sqrt(dirX * dirX + dirY * dirY);

    var targetAngle = shark.angle;
    var speed = cfg.driftSpeed;

    var wantBoost = state.boosting && state.boost > 1;

    if (mag > DEADZONE) {
        targetAngle = Math.atan2(dirY, dirX);
        speed = wantBoost ? cfg.boostSpeed : cfg.speed;
    } else if (wantBoost) {
        speed = cfg.boostSpeed * 0.7;
    }

    // smooth rotation toward target
    shark.angle = lerpAngle(shark.angle, targetAngle, cfg.turnSmoothing * (delta * 60));

    shark.vx = Math.cos(shark.angle);
    shark.vy = Math.sin(shark.angle);

    shark.x += shark.vx * speed * delta;
    shark.y += shark.vy * speed * delta;

    // clamp to world bounds
    var half = shark.size * 0.5;
    var maxX = world.width * 0.5 - half;
    var maxY = world.height * 0.5 - half;
    if (shark.x > maxX) { shark.x = maxX; }
    if (shark.x < -maxX) { shark.x = -maxX; }
    if (shark.y > maxY) { shark.y = maxY; }
    if (shark.y < -maxY) { shark.y = -maxY; }

    // grow with score
    var targetSize = Math.min(cfg.baseSize + state.score * cfg.growthPerScore, cfg.maxSize);
    shark.size += (targetSize - shark.size) * 0.05;

    // boost meter
    if (wantBoost && mag > DEADZONE) {
        state.boost = Math.max(0, state.boost - state.config.boost.drainRate * delta);
    } else {
        state.boost = Math.min(state.config.boost.max, state.boost + state.config.boost.regenRate * delta);
    }

    applySharkTransform(state);
}

export function applySharkTransform(state) {
    var group = state.sharkGroup;
    if (!group) { return; }
    var shark = state.shark;

    group.position.x = shark.x;
    group.position.y = shark.y;
    group.rotation.z = shark.angle;

    var facingLeft = Math.cos(shark.angle) < 0;
    var sprite = group.userData.sprite;
    sprite.scale.y = facingLeft ? -1 : 1;

    group.scale.x = shark.size;
    group.scale.y = shark.size;
}

export function getMouthPosition(state) {
    var shark = state.shark;
    var reach = shark.size * state.config.shark.mouthOffset;
    return {
        x: shark.x + Math.cos(shark.angle) * reach,
        y: shark.y + Math.sin(shark.angle) * reach
    };
}
