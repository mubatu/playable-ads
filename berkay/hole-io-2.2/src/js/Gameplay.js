import * as THREE from 'three';

export function checkCollisions(player, objects) {
    const playerRadius = player.getRadius();
    const playerPos = player.position;
    const consumed = [];

    for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        if (obj.consumed) continue;

        const dx = obj.worldPosition.x - playerPos.x;
        const dy = obj.worldPosition.y - playerPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Can consume if object diameter is less than hole diameter
        if (distance < playerRadius + playerRadius * 0.2 && obj.diameter <= player.currentDiameter) {
            obj.consumed = true;
            consumed.push(obj);
        }
    }

    return consumed;
}

export function updateConsumptions(state, consumedObjects) {
    let totalScore = 0;

    consumedObjects.forEach(obj => {
        state.player.animateConsume(obj.mesh);
        totalScore += obj.points;

        // Calculate hole growth based on object size
        let growAmount = 0.05;
        if (obj.type === 'medium') growAmount = 0.1;
        if (obj.type === 'large') growAmount = 0.2;

        state.player.grow(growAmount);
        state.consumedCount++;
    });

    state.score += totalScore;
    return totalScore;
}

export function updateCamera(state) {
    const player = state.player;
    const config = state.config;

    // Calculate camera distance based on hole size
    const sizeRatio = player.currentDiameter / player.maxDiameter;
    const distance = config.camera.distance + sizeRatio * (config.camera.maxDistance - config.camera.distance);

    // Fixed camera angle following player
    const rotX = THREE.MathUtils.degToRad(config.camera.rotationX);
    const targetX = player.position.x;
    const targetY = player.position.y;
    const targetZ = distance * 0.5;

    // Smoothly interpolate camera position
    state.camera.position.lerp(
        new THREE.Vector3(targetX, targetY + 5, targetZ),
        0.1
    );

    state.camera.lookAt(targetX, targetY, 0);
}

export function checkGameOver(state) {
    if (state.gameTime >= state.gameDuration) {
        state.gameOver = true;
        return true;
    }
    return false;
}
