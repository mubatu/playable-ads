import { Mesh, PlaneGeometry, MeshBasicMaterial, Group, SphereGeometry, CircleGeometry } from 'three';
import { createGradientTexture } from '../../../../reusables/components/VisualUtils.js';

export function buildWorld(state) {
    var config = state.config;
    var world = config.world;
    var group = state.worldGroup;
    var bgTexture = createGradientTexture(config.background.gradientTop, config.background.gradientBottom, 4, 256);
    var bgMesh = new Mesh(
        new PlaneGeometry(world.width + 10, world.height + 10),
        new MeshBasicMaterial({ map: bgTexture })
    );

    bgMesh.position.z = -2;
    group.add(bgMesh);

    buildSurface(group, world);
    buildSeabed(group, world);
    buildCorals(group, world);
    buildLightRays(group, world);

    return group;
}

function buildSurface(group, world) {
    var surfaceLine = new Mesh(
        new PlaneGeometry(world.width + 10, 0.15),
        new MeshBasicMaterial({ color: '#4db8cc', transparent: true, opacity: 0.65 })
    );
    surfaceLine.position.set(0, world.surfaceY, -1);
    group.add(surfaceLine);

    var shimmer = new Mesh(
        new PlaneGeometry(world.width + 10, 1.5),
        new MeshBasicMaterial({ color: '#89d4e0', transparent: true, opacity: 0.12 })
    );
    shimmer.position.set(0, world.surfaceY + 0.6, -1.5);
    group.add(shimmer);
}

function buildSeabed(group, world) {
    var seabed = new Mesh(
        new PlaneGeometry(world.width + 10, 2.5),
        new MeshBasicMaterial({ color: '#17331f' })
    );
    seabed.position.set(0, world.seabedY - 1.2, -1);
    group.add(seabed);

    var sandLayer = new Mesh(
        new PlaneGeometry(world.width + 10, 0.4),
        new MeshBasicMaterial({ color: '#c2a64e', transparent: true, opacity: 0.5 })
    );
    sandLayer.position.set(0, world.seabedY + 0.1, -0.9);
    group.add(sandLayer);
}

function buildCorals(group, world) {
    var colors = ['#e04060', '#ff6b9d', '#45c490', '#f5a623', '#9b59b6'];
    var halfW = world.width * 0.45;
    var i;
    var j;

    for (i = 0; i < 18; i += 1) {
        var coralGroup = new Group();
        var color = colors[Math.floor(Math.random() * colors.length)];

        for (j = 0; j < 3 + Math.floor(Math.random() * 3); j += 1) {
            var branch = new Mesh(
                new SphereGeometry(0.14 + Math.random() * 0.18, 6, 5),
                new MeshBasicMaterial({ color: color })
            );
            branch.position.set((Math.random() - 0.5) * 0.4, Math.random() * 0.45, 0);
            branch.scale.set(0.6 + Math.random() * 0.5, 1 + Math.random() * 0.8, 0.5);
            coralGroup.add(branch);
        }

        coralGroup.position.set((Math.random() - 0.5) * halfW * 2, world.seabedY + 0.25 + Math.random() * 0.5, -0.5);
        group.add(coralGroup);
    }
}

function buildLightRays(group, world) {
    var i;

    for (i = 0; i < 6; i += 1) {
        var ray = new Mesh(
            new PlaneGeometry(0.28, world.height * 0.75),
            new MeshBasicMaterial({ color: '#b9f2ff', transparent: true, opacity: 0.06 })
        );
        ray.position.set(-world.width * 0.35 + i * world.width * 0.14, world.surfaceY - 4, -1.4);
        ray.rotation.z = -0.18;
        group.add(ray);
    }

    for (i = 0; i < 12; i += 1) {
        var glow = new Mesh(
            new CircleGeometry(0.04 + Math.random() * 0.05, 8),
            new MeshBasicMaterial({ color: '#c7f7ff', transparent: true, opacity: 0.25 })
        );
        glow.position.set((Math.random() - 0.5) * world.width, world.seabedY + Math.random() * world.height, -0.7);
        group.add(glow);
    }
}
