import * as THREE from 'three';
import { createTextPlane, getColor, makeMaterial } from './Utils.js';
import { destroyFrameCell } from './FramePath.js';

function updateShooterLabel(shooter) {
    if (!shooter.label) {
        return;
    }

    if (shooter.label.parent) {
        shooter.label.parent.remove(shooter.label);
    }
    if (shooter.label.geometry) {
        shooter.label.geometry.dispose();
    }
    if (shooter.label.material) {
        if (shooter.label.material.map) {
            shooter.label.material.map.dispose();
        }
        shooter.label.material.dispose();
    }

    shooter.label = createTextPlane(String(shooter.shots), 0.62, 0.62, {
        color: '#ffffff',
        fontSize: 66,
        strokeWidth: 8
    });
    shooter.label.position.z = 0.38;
    shooter.label.rotation.z = -shooter.group.rotation.z;
    shooter.group.add(shooter.label);
}

function getDirectSlotIndex(shooterConfig) {
    if (typeof shooterConfig.directSlotIndex === 'number') {
        return shooterConfig.directSlotIndex;
    }

    if (Array.isArray(shooterConfig.visibleSlots) && shooterConfig.visibleSlots.length === 1) {
        return shooterConfig.visibleSlots[0];
    }

    if (shooterConfig.side === 'top') {
        return Math.min(Math.max(shooterConfig.laneIndex, 0), 9);
    }
    if (shooterConfig.side === 'right') {
        return 10 + Math.min(Math.max(shooterConfig.laneIndex, 0), 7);
    }
    if (shooterConfig.side === 'bottom') {
        return 18 + Math.min(Math.max(shooterConfig.laneIndex, 0), 9);
    }

    return 28 + Math.min(Math.max(shooterConfig.laneIndex, 0), 7);
}

function getShooterPosition(state, shooterConfig) {
    var positions = state.framePath.positions;
    var slotIndex = getDirectSlotIndex(shooterConfig);
    var source = positions[slotIndex] || positions[0];
    var offset = state.boardMetrics.cellSize * 0.95;

    if (shooterConfig.side === 'top') {
        return { x: source.x, y: source.y + offset, angle: Math.PI };
    }
    if (shooterConfig.side === 'right') {
        return { x: source.x + offset, y: source.y, angle: Math.PI * 0.5 };
    }
    if (shooterConfig.side === 'bottom') {
        return { x: source.x, y: source.y - offset, angle: 0 };
    }

    return { x: source.x - offset, y: source.y, angle: -Math.PI * 0.5 };
}

function createShooterMesh(state, shooterConfig) {
    var group = new THREE.Group();
    var color = getColor(state.config, shooterConfig.color);
    var body = new THREE.Mesh(
        new THREE.BoxGeometry(0.86, 0.86, 0.28),
        makeMaterial(color, shooterConfig.isBlocked ? 0.45 : 1)
    );
    var barrel = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.62, 0.18),
        makeMaterial(0xffffff, shooterConfig.isBlocked ? 0.25 : 0.65)
    );
    var placement = getShooterPosition(state, shooterConfig);

    body.position.z = 0.28;
    barrel.position.set(0, -0.47, 0.38);
    group.add(body);
    group.add(barrel);
    group.position.set(placement.x, placement.y, 0);
    group.rotation.z = placement.angle;
    group.userData.baseScale = 1;

    return group;
}

export function buildShooters(state) {
    var shooters = [];
    var shooterGroup = new THREE.Group();

    state.level.shooters.forEach(function (source) {
        var shooter = {
            id: source.id,
            color: source.color,
            shots: source.shots,
            side: source.side,
            laneIndex: source.laneIndex,
            isBlocked: source.isBlocked,
            visibleSlots: source.visibleSlots.slice(),
            directSlotIndex: getDirectSlotIndex(source),
            group: createShooterMesh(state, source),
            label: null,
            fireTime: 0
        };

        shooter.label = createTextPlane(String(shooter.shots), 0.62, 0.62, {
            color: '#ffffff',
            fontSize: 66,
            strokeWidth: 8
        });
        shooter.label.position.z = 0.52;
        shooter.label.rotation.z = -shooter.group.rotation.z;
        shooter.group.add(shooter.label);
        shooterGroup.add(shooter.group);
        shooters.push(shooter);
    });

    state.shooters = shooters;
    state.shooterGroup = shooterGroup;
    state.board.add(shooterGroup);
}

export function findShooterTarget(shooter, state) {
    var slotIndex = shooter.directSlotIndex;
    var cell;

    if (shooter.isBlocked || shooter.shots <= 0) {
        return null;
    }

    cell = state.framePath.slots[slotIndex];
    if (cell && cell.color === shooter.color) {
        return slotIndex;
    }

    return null;
}

function addBeam(state, shooter, targetSlotIndex) {
    var target = state.framePath.positions[targetSlotIndex];
    var start = shooter.group.position;
    var dx = target.x - start.x;
    var dy = target.y - start.y;
    var length = Math.sqrt(dx * dx + dy * dy);
    var beam = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, Math.max(length, 0.1), 0.06),
        makeMaterial(getColor(state.config, shooter.color), 0.74)
    );

    beam.position.set((start.x + target.x) * 0.5, (start.y + target.y) * 0.5, 0.68);
    beam.rotation.z = Math.atan2(-dx, dy);
    beam.userData.life = state.config.shooter.shotAnimationSeconds;
    state.fxGroup.add(beam);
    state.activeBeams.push(beam);
}

export function resolveShooterShots(state) {
    var claims = [];
    var destroyed = {};

    state.shooters.forEach(function (shooter) {
        var targetIndex = findShooterTarget(shooter, state);
        if (targetIndex !== null) {
            claims.push({ shooter: shooter, targetIndex: targetIndex });
        }
    });

    claims.forEach(function (claim) {
        if (destroyed[claim.targetIndex] || !state.framePath.slots[claim.targetIndex]) {
            return;
        }

        destroyFrameCell(state, claim.targetIndex);
        state.destroyedCells += 1;
        claim.shooter.shots -= 1;
        claim.shooter.fireTime = state.config.shooter.shotAnimationSeconds;
        updateShooterLabel(claim.shooter);
        addBeam(state, claim.shooter, claim.targetIndex);
        destroyed[claim.targetIndex] = true;
    });
}

export function hasAnyValidShot(state) {
    var i;
    for (i = 0; i < state.shooters.length; i += 1) {
        if (findShooterTarget(state.shooters[i], state) !== null) {
            return true;
        }
    }
    return false;
}

export function updateShooterVisuals(state, delta) {
    var i;
    var beam;

    state.shooters.forEach(function (shooter) {
        if (shooter.fireTime > 0) {
            shooter.fireTime = Math.max(shooter.fireTime - delta, 0);
            shooter.group.scale.setScalar(1 + shooter.fireTime * 2.2);
        } else {
            shooter.group.scale.setScalar(1);
        }

        shooter.group.children.forEach(function (child) {
            if (child.material && shooter.shots <= 0) {
                child.material.opacity = 0.48;
                child.material.transparent = true;
            }
        });
    });

    for (i = state.activeBeams.length - 1; i >= 0; i -= 1) {
        beam = state.activeBeams[i];
        beam.userData.life -= delta;
        if (beam.material) {
            beam.material.opacity = Math.max(beam.userData.life / state.config.shooter.shotAnimationSeconds, 0);
        }
        if (beam.userData.life <= 0) {
            if (beam.parent) {
                beam.parent.remove(beam);
            }
            beam.geometry.dispose();
            beam.material.dispose();
            state.activeBeams.splice(i, 1);
        }
    }
}
