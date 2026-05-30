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

    var surfaceGeo = new PlaneGeometry(world.width + 10, 0.15);
    var surfaceMat = new MeshBasicMaterial({ color: '#4db8cc', transparent: true, opacity: 0.6 });
    var surfaceLine = new Mesh(surfaceGeo, surfaceMat);
    surfaceLine.position.set(0, world.surfaceY, -1);
    group.add(surfaceLine);

    var surfaceShimmer = new Mesh(
        new PlaneGeometry(world.width + 10, 1.5),
        new MeshBasicMaterial({ color: '#89d4e0', transparent: true, opacity: 0.12 })
    );
    surfaceShimmer.position.set(0, world.surfaceY + 0.6, -1.5);
    group.add(surfaceShimmer);

    var seabedGeo = new PlaneGeometry(world.width + 10, 2.5);
    var seabedMat = new MeshBasicMaterial({ color: '#1a3320' });
    var seabed = new Mesh(seabedGeo, seabedMat);
    seabed.position.set(0, world.seabedY - 1.2, -1);
    group.add(seabed);

    var sandLayer = new Mesh(
        new PlaneGeometry(world.width + 10, 0.4),
        new MeshBasicMaterial({ color: '#c2a64e', transparent: true, opacity: 0.5 })
    );
    sandLayer.position.set(0, world.seabedY + 0.1, -0.9);
    group.add(sandLayer);

    buildCorals(group, world);
    buildRocks(group, world);

    return group;
}

function buildCorals(group, world) {
    var coralColors = ['#e04060', '#ff6b9d', '#45c490', '#f5a623', '#9b59b6'];
    var halfW = world.width * 0.45;

    for (var i = 0; i < 15; i++) {
        var cx = (Math.random() - 0.5) * halfW * 2;
        var cy = world.seabedY + 0.3 + Math.random() * 0.5;
        var color = coralColors[Math.floor(Math.random() * coralColors.length)];
        var coralGroup = new Group();

        for (var j = 0; j < 3 + Math.floor(Math.random() * 3); j++) {
            var branch = new Mesh(
                new SphereGeometry(0.15 + Math.random() * 0.2, 6, 5),
                new MeshBasicMaterial({ color: color })
            );
            branch.position.set(
                (Math.random() - 0.5) * 0.4,
                Math.random() * 0.4,
                0
            );
            branch.scale.set(0.6 + Math.random() * 0.5, 1 + Math.random() * 0.8, 0.5);
            coralGroup.add(branch);
        }

        coralGroup.position.set(cx, cy, -0.5);
        group.add(coralGroup);
    }
}

function buildRocks(group, world) {
    var halfW = world.width * 0.45;

    for (var i = 0; i < 8; i++) {
        var rock = new Mesh(
            new SphereGeometry(0.3 + Math.random() * 0.4, 6, 5),
            new MeshBasicMaterial({ color: '#3a3a3a' })
        );
        rock.scale.set(1 + Math.random(), 0.6 + Math.random() * 0.4, 0.5);
        rock.position.set(
            (Math.random() - 0.5) * halfW * 2,
            world.seabedY + 0.2,
            -0.6
        );
        group.add(rock);
    }
}
