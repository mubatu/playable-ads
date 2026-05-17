import THREE from 'three';
import { createTextPlane, getColorValue } from './Board.js';

function sideOrderValue(shooter) {
    if (shooter.side === 'top') {
        return shooter.laneIndex;
    }
    if (shooter.side === 'right') {
        return 100 + shooter.laneIndex;
    }
    if (shooter.side === 'bottom') {
        return 200 - shooter.laneIndex;
    }
    return 300 - shooter.laneIndex;
}

function getNormal(side) {
    if (side === 'top') {
        return new THREE.Vector3(0, 1, 0);
    }
    if (side === 'right') {
        return new THREE.Vector3(1, 0, 0);
    }
    if (side === 'bottom') {
        return new THREE.Vector3(0, -1, 0);
    }
    return new THREE.Vector3(-1, 0, 0);
}

function createBeam(state, from, to, color) {
    var length = from.distanceTo(to);
    var geometry = new THREE.BoxGeometry(0.08, length, 0.06);
    var material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.88
    });
    var mesh = new THREE.Mesh(geometry, material);
    var midpoint = from.clone().lerp(to, 0.5);
    var angle = Math.atan2(to.y - from.y, to.x - from.x);

    mesh.position.copy(midpoint);
    mesh.position.z = 0.8;
    mesh.rotation.z = angle - Math.PI * 0.5;
    state.boardGroup.add(mesh);
    state.activeBeams.push({ mesh: mesh, time: state.config.shooter.shotAnimationSeconds });
}

export function createShooters(state, level) {
    var shooters = [];
    var group = new THREE.Group();
    var geometry = new THREE.BoxGeometry(0.86, 0.86, 0.36);
    var i;
    var data;
    var color;
    var material;
    var shooterGroup;
    var body;
    var label;
    var slotPosition;
    var normal;
    var distance;

    for (i = 0; i < level.shooters.length; i += 1) {
        data = level.shooters[i];
        color = getColorValue(state.config, data.color);
        material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.44,
            metalness: 0.08,
            transparent: data.isBlocked,
            opacity: data.isBlocked ? 0.45 : 1
        });
        shooterGroup = new THREE.Group();
        body = new THREE.Mesh(geometry, material);
        label = createTextPlane(data.shots, {
            width: 160,
            height: 120,
            fontSize: 76,
            worldWidth: 0.68,
            worldHeight: 0.48
        });
        slotPosition = state.framePath.getSlotPosition(data.directSlotIndex);
        normal = getNormal(data.side);
        distance = data.isBlocked ? 1.68 : 1.08;

        body.position.z = 0.32;
        label.position.z = 0.62;
        shooterGroup.add(body);
        shooterGroup.add(label);
        shooterGroup.position.copy(slotPosition.clone().add(normal.multiplyScalar(distance)));
        group.add(shooterGroup);

        shooters.push({
            id: data.id,
            color: data.color,
            shots: data.shots,
            side: data.side,
            laneIndex: data.laneIndex,
            isBlocked: data.isBlocked,
            directSlotIndex: data.directSlotIndex,
            group: shooterGroup,
            label: label,
            body: body,
            shotFlashTime: 0
        });
    }

    shooters.sort(function (a, b) {
        return sideOrderValue(a) - sideOrderValue(b);
    });

    state.shooters = shooters;
    return group;
}

export function hasAnyValidShot(state) {
    var i;
    var shooter;
    var cell;

    for (i = 0; i < state.shooters.length; i += 1) {
        shooter = state.shooters[i];
        cell = state.framePath.slots[shooter.directSlotIndex];
        if (!shooter.isBlocked && shooter.shots > 0 && cell && cell.color === shooter.color) {
            return true;
        }
    }
    return false;
}

export function resolveAllShots(state) {
    var claims = [];
    var destroyed = {};
    var i;
    var shooter;
    var cell;
    var claim;
    var from;
    var to;

    for (i = 0; i < state.shooters.length; i += 1) {
        shooter = state.shooters[i];
        if (shooter.isBlocked || shooter.shots <= 0) {
            continue;
        }

        cell = state.framePath.slots[shooter.directSlotIndex];
        if (cell && cell.color === shooter.color) {
            claims.push({ shooter: shooter, targetIndex: shooter.directSlotIndex });
        }
    }

    for (i = 0; i < claims.length; i += 1) {
        claim = claims[i];
        if (destroyed[claim.targetIndex] || !state.framePath.slots[claim.targetIndex]) {
            continue;
        }

        cell = state.framePath.slots[claim.targetIndex];
        state.framePath.destroyCellAt(claim.targetIndex);
        claim.shooter.shots -= 1;
        claim.shooter.shotFlashTime = state.config.shooter.shotAnimationSeconds;
        from = claim.shooter.group.position.clone();
        to = state.framePath.getSlotPosition(claim.targetIndex);
        createBeam(state, from, to, getColorValue(state.config, cell.color));
        destroyed[claim.targetIndex] = true;
    }

    updateShooterLabels(state);
}

export function updateShooterLabels(state) {
    var i;
    var shooter;
    var label;

    for (i = 0; i < state.shooters.length; i += 1) {
        shooter = state.shooters[i];
        if (shooter._lastLabelValue === shooter.shots) {
            continue;
        }
        if (shooter.label.parent) {
            shooter.label.parent.remove(shooter.label);
        }
        label = createTextPlane(shooter.shots, {
            width: 160,
            height: 120,
            fontSize: 76,
            worldWidth: 0.68,
            worldHeight: 0.48
        });
        label.position.z = 0.62;
        shooter.group.add(label);
        shooter.label = label;
        shooter._lastLabelValue = shooter.shots;
    }
}

export function updateShotEffects(state, dt) {
    var remaining = [];
    var i;
    var beam;
    var shooter;

    for (i = 0; i < state.activeBeams.length; i += 1) {
        beam = state.activeBeams[i];
        beam.time -= dt;
        beam.mesh.material.opacity = Math.max(0, beam.time / state.config.shooter.shotAnimationSeconds);
        if (beam.time > 0) {
            remaining.push(beam);
        } else if (beam.mesh.parent) {
            beam.mesh.parent.remove(beam.mesh);
        }
    }
    state.activeBeams = remaining;

    for (i = 0; i < state.shooters.length; i += 1) {
        shooter = state.shooters[i];
        if (shooter.shotFlashTime > 0) {
            shooter.shotFlashTime -= dt;
            shooter.group.scale.setScalar(1 + shooter.shotFlashTime * 1.8);
        } else {
            shooter.group.scale.setScalar(shooter.shots > 0 ? 1 : 0.82);
        }
    }
}
