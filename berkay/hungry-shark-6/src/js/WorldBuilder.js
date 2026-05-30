import { Mesh, PlaneGeometry, MeshBasicMaterial, Group, SphereGeometry, CylinderGeometry, ConeGeometry } from 'three';
import { createGradientTexture } from '../../../../reusables/components/VisualUtils.js';

export function buildWorld(state) {
    var config = state.config;
    var world = config.world;
    var group = state.worldGroup;

    buildBackground(group, config, world);
    buildSurface(group, world);
    buildSeabed(group, world);
    buildCorals(group, world);
    buildRocks(group, world);
    buildLightRays(group, world);
    buildBubbleParticles(state, world);

    return group;
}

function buildBackground(group, config, world) {
    var bgTexture = createGradientTexture(
        config.background.gradientTop,
        config.background.gradientBottom,
        4,
        256
    );
    var bgMesh = new Mesh(
        new PlaneGeometry(world.width + 20, world.height + 20),
        new MeshBasicMaterial({ map: bgTexture })
    );
    bgMesh.position.z = -3;
    group.add(bgMesh);
}

function buildSurface(group, world) {
    var shimmer = new Mesh(
        new PlaneGeometry(world.width + 20, 2.0),
        new MeshBasicMaterial({ color: '#48cae4', transparent: true, opacity: 0.18 })
    );
    shimmer.position.set(0, world.surfaceY + 0.8, -2);
    group.add(shimmer);

    var line = new Mesh(
        new PlaneGeometry(world.width + 20, 0.12),
        new MeshBasicMaterial({ color: '#90e0ef', transparent: true, opacity: 0.55 })
    );
    line.position.set(0, world.surfaceY, -1);
    group.add(line);

    var foam = new Mesh(
        new PlaneGeometry(world.width + 20, 0.4),
        new MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.07 })
    );
    foam.position.set(0, world.surfaceY - 0.15, -0.9);
    group.add(foam);
}

function buildSeabed(group, world) {
    var bed = new Mesh(
        new PlaneGeometry(world.width + 20, 3.0),
        new MeshBasicMaterial({ color: '#1a3320' })
    );
    bed.position.set(0, world.seabedY - 1.4, -2);
    group.add(bed);

    var sand = new Mesh(
        new PlaneGeometry(world.width + 20, 0.5),
        new MeshBasicMaterial({ color: '#c9a84c', transparent: true, opacity: 0.55 })
    );
    sand.position.set(0, world.seabedY + 0.12, -0.8);
    group.add(sand);
}

function buildCorals(group, world) {
    var colors = ['#e04060', '#ff6b9d', '#45c490', '#f5a623', '#9b59b6', '#e07020'];
    var halfW = world.width * 0.46;

    for (var i = 0; i < 20; i++) {
        var cx = (Math.random() - 0.5) * halfW * 2;
        var baseY = world.seabedY + 0.3;
        var color = colors[Math.floor(Math.random() * colors.length)];
        var coralGroup = new Group();
        var branchCount = 3 + Math.floor(Math.random() * 4);

        for (var j = 0; j < branchCount; j++) {
            var branch = new Mesh(
                new SphereGeometry(0.12 + Math.random() * 0.18, 6, 5),
                new MeshBasicMaterial({ color: color })
            );
            branch.position.set(
                (Math.random() - 0.5) * 0.5,
                Math.random() * 0.6,
                (Math.random() - 0.5) * 0.1
            );
            branch.scale.set(0.5 + Math.random() * 0.5, 1.1 + Math.random() * 0.9, 0.4);
            coralGroup.add(branch);
        }

        coralGroup.position.set(cx, baseY, -0.4);
        group.add(coralGroup);
    }
}

function buildRocks(group, world) {
    var halfW = world.width * 0.46;
    for (var i = 0; i < 12; i++) {
        var rock = new Mesh(
            new SphereGeometry(0.25 + Math.random() * 0.45, 6, 5),
            new MeshBasicMaterial({ color: i % 3 === 0 ? '#4a4040' : '#3a3a3a' })
        );
        rock.scale.set(1 + Math.random() * 0.5, 0.5 + Math.random() * 0.4, 0.5);
        rock.position.set(
            (Math.random() - 0.5) * halfW * 2,
            world.seabedY + 0.18,
            -0.5
        );
        group.add(rock);
    }
}

function buildLightRays(group, world) {
    for (var i = 0; i < 7; i++) {
        var xPos = (i / 6 - 0.5) * world.width * 0.8;
        var ray = new Mesh(
            new PlaneGeometry(0.6 + Math.random() * 0.8, world.height * 0.85),
            new MeshBasicMaterial({ color: '#caf0f8', transparent: true, opacity: 0.04 + Math.random() * 0.03 })
        );
        ray.position.set(xPos + (Math.random() - 0.5) * 3, world.surfaceY - world.height * 0.42, -2.5);
        ray.rotation.z = (Math.random() - 0.5) * 0.18;
        ray.userData.isRay = true;
        ray.userData.baseOpacity = ray.material.opacity;
        ray.userData.phase = Math.random() * Math.PI * 2;
        group.add(ray);
    }
}

function buildBubbleParticles(state, world) {
    for (var i = 0; i < 25; i++) {
        spawnBubble(state, world);
    }
}

export function spawnBubble(state, world) {
    var w = world || state.config.world;
    var bubble = new Mesh(
        new SphereGeometry(0.05 + Math.random() * 0.08, 5, 4),
        new MeshBasicMaterial({ color: '#90e0ef', transparent: true, opacity: 0.35 + Math.random() * 0.25 })
    );
    bubble.position.set(
        (Math.random() - 0.5) * w.width * 0.9,
        w.seabedY + Math.random() * (w.surfaceY - w.seabedY),
        -0.2
    );
    bubble.userData.speed = 0.5 + Math.random() * 1.2;
    bubble.userData.wobble = Math.random() * Math.PI * 2;
    bubble.userData.wobbleSpeed = 1 + Math.random() * 2;
    bubble.userData.isBubble = true;
    state.worldGroup.add(bubble);
    state.bubbles.push(bubble);
}

export function updateWorldEffects(state, delta) {
    var t = state.elapsedTime;
    var world = state.config.world;

    state.worldGroup.children.forEach(function (obj) {
        if (obj.userData.isRay) {
            obj.material.opacity = obj.userData.baseOpacity * (0.7 + 0.3 * Math.sin(t * 0.6 + obj.userData.phase));
        }
    });

    for (var i = state.bubbles.length - 1; i >= 0; i--) {
        var b = state.bubbles[i];
        b.userData.wobble += delta * b.userData.wobbleSpeed;
        b.position.x += Math.sin(b.userData.wobble) * 0.3 * delta;
        b.position.y += b.userData.speed * delta;

        if (b.position.y > world.surfaceY + 0.5) {
            state.worldGroup.remove(b);
            state.bubbles.splice(i, 1);
            spawnBubble(state, world);
        }
    }
}
