import { Group, Mesh, SphereGeometry, BoxGeometry, ConeGeometry, CylinderGeometry, TorusGeometry, MeshBasicMaterial, PlaneGeometry } from 'three';

export function createShark(config) {
    var shark = config.shark;
    var s = shark.size;
    var group = new Group();

    var body = new Mesh(
        new SphereGeometry(s * 0.5, 10, 7),
        new MeshBasicMaterial({ color: shark.bodyColor })
    );
    body.scale.set(2.2, 1.0, 0.7);
    group.add(body);

    var belly = new Mesh(
        new SphereGeometry(s * 0.44, 8, 6),
        new MeshBasicMaterial({ color: shark.bellyColor })
    );
    belly.scale.set(2.0, 0.55, 0.5);
    belly.position.set(0, -s * 0.18, 0.05);
    group.add(belly);

    var snout = new Mesh(
        new SphereGeometry(s * 0.28, 7, 5),
        new MeshBasicMaterial({ color: shark.bodyColor })
    );
    snout.scale.set(1.4, 0.75, 0.6);
    snout.position.set(s * 1.05, -s * 0.05, 0);
    group.add(snout);

    var dorsal = new Mesh(
        new ConeGeometry(s * 0.22, s * 0.55, 5),
        new MeshBasicMaterial({ color: shark.finColor })
    );
    dorsal.rotation.z = -0.25;
    dorsal.position.set(s * 0.05, s * 0.55, 0);
    group.add(dorsal);

    var pectLeft = new Mesh(
        new ConeGeometry(s * 0.14, s * 0.45, 4),
        new MeshBasicMaterial({ color: shark.finColor })
    );
    pectLeft.rotation.z = 1.4;
    pectLeft.position.set(s * 0.15, -s * 0.1, s * 0.35);
    group.add(pectLeft);

    var pectRight = pectLeft.clone();
    pectRight.position.set(s * 0.15, -s * 0.1, -s * 0.35);
    group.add(pectRight);

    var tailGroup = new Group();
    tailGroup.position.set(-s * 1.05, 0, 0);

    var tailFin = new Mesh(
        new ConeGeometry(s * 0.18, s * 0.6, 4),
        new MeshBasicMaterial({ color: shark.finColor })
    );
    tailFin.rotation.z = Math.PI / 2;
    tailFin.position.set(0, s * 0.22, 0);

    var tailFinLower = new Mesh(
        new ConeGeometry(s * 0.14, s * 0.44, 4),
        new MeshBasicMaterial({ color: shark.finColor })
    );
    tailFinLower.rotation.z = Math.PI * 0.6;
    tailFinLower.position.set(0, -s * 0.14, 0);

    tailGroup.add(tailFin);
    tailGroup.add(tailFinLower);
    group.add(tailGroup);

    var eyeWhite = new Mesh(
        new SphereGeometry(s * 0.1, 6, 5),
        new MeshBasicMaterial({ color: '#ffffff' })
    );
    eyeWhite.position.set(s * 0.85, s * 0.12, s * 0.35);
    group.add(eyeWhite);

    var pupil = new Mesh(
        new SphereGeometry(s * 0.055, 5, 4),
        new MeshBasicMaterial({ color: '#111111' })
    );
    pupil.position.set(s * 0.92, s * 0.12, s * 0.38);
    group.add(pupil);

    group.userData.tailFin = tailFin;
    group.userData.tailFinLower = tailFinLower;
    group.userData.tailGroup = tailGroup;
    group.userData.isShark = true;

    return group;
}

export function createSmallFish() {
    var colors = ['#ff9f43', '#ee5a24', '#1289a7', '#c4e538', '#a29bfe', '#fd79a8', '#fdcb6e'];
    var color = colors[Math.floor(Math.random() * colors.length)];
    var scale = 0.22 + Math.random() * 0.12;
    var group = new Group();

    var body = new Mesh(
        new SphereGeometry(scale, 7, 5),
        new MeshBasicMaterial({ color: color })
    );
    body.scale.set(1.8, 1.0, 0.6);
    group.add(body);

    var tail = new Mesh(
        new ConeGeometry(scale * 0.5, scale * 0.9, 4),
        new MeshBasicMaterial({ color: color })
    );
    tail.rotation.z = Math.PI / 2;
    tail.position.set(-scale * 1.3, 0, 0);
    group.add(tail);

    group.userData.radius = scale * 1.1;
    group.userData.scoreValue = 5;
    group.userData.hungerValue = 12;
    group.userData.healValue = 3;
    group.userData.type = 'smallFish';
    group.userData.speed = 1.5 + Math.random() * 2.0;
    group.userData.swimDir = Math.random() > 0.5 ? 1 : -1;
    group.userData.wobblePhase = Math.random() * Math.PI * 2;
    group.userData.baseY = 0;

    return group;
}

export function createMediumFish() {
    var colors = ['#6c5ce7', '#00b894', '#e17055', '#74b9ff', '#a29bfe'];
    var color = colors[Math.floor(Math.random() * colors.length)];
    var scale = 0.45 + Math.random() * 0.2;
    var group = new Group();

    var body = new Mesh(
        new SphereGeometry(scale, 8, 6),
        new MeshBasicMaterial({ color: color })
    );
    body.scale.set(2.0, 1.0, 0.65);
    group.add(body);

    var dorsal = new Mesh(
        new ConeGeometry(scale * 0.35, scale * 0.6, 4),
        new MeshBasicMaterial({ color: color })
    );
    dorsal.rotation.z = -0.2;
    dorsal.position.set(0, scale * 0.7, 0);
    group.add(dorsal);

    var tail = new Mesh(
        new ConeGeometry(scale * 0.45, scale * 0.9, 4),
        new MeshBasicMaterial({ color: color })
    );
    tail.rotation.z = Math.PI / 2;
    tail.position.set(-scale * 1.6, 0, 0);
    group.add(tail);

    var eyeW = new Mesh(
        new SphereGeometry(scale * 0.15, 5, 4),
        new MeshBasicMaterial({ color: '#ffffff' })
    );
    eyeW.position.set(scale * 1.1, scale * 0.15, scale * 0.4);
    group.add(eyeW);

    group.userData.radius = scale * 1.3;
    group.userData.scoreValue = 20;
    group.userData.hungerValue = 25;
    group.userData.healValue = 8;
    group.userData.type = 'mediumFish';
    group.userData.speed = 1.0 + Math.random() * 1.5;
    group.userData.swimDir = Math.random() > 0.5 ? 1 : -1;
    group.userData.wobblePhase = Math.random() * Math.PI * 2;
    group.userData.baseY = 0;

    return group;
}

export function createHuman() {
    var group = new Group();
    var skinColor = '#f5cba7';
    var swimColor = ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6'][Math.floor(Math.random() * 4)];

    var body = new Mesh(
        new CylinderGeometry(0.12, 0.1, 0.45, 6),
        new MeshBasicMaterial({ color: swimColor })
    );
    group.add(body);

    var head = new Mesh(
        new SphereGeometry(0.14, 7, 6),
        new MeshBasicMaterial({ color: skinColor })
    );
    head.position.y = 0.33;
    group.add(head);

    var armL = new Mesh(
        new CylinderGeometry(0.05, 0.04, 0.32, 5),
        new MeshBasicMaterial({ color: skinColor })
    );
    armL.position.set(0.22, 0.08, 0);
    armL.rotation.z = 0.8;
    group.add(armL);

    var armR = armL.clone();
    armR.position.set(-0.22, 0.08, 0);
    armR.rotation.z = -0.8;
    group.add(armR);

    group.userData.radius = 0.32;
    group.userData.scoreValue = 35;
    group.userData.hungerValue = 40;
    group.userData.healValue = 15;
    group.userData.type = 'human';
    group.userData.speed = 0.8 + Math.random() * 0.6;
    group.userData.swimDir = Math.random() > 0.5 ? 1 : -1;
    group.userData.swimPhase = Math.random() * Math.PI * 2;
    group.userData.baseY = 0;

    return group;
}

export function createTurtle() {
    var group = new Group();

    var shell = new Mesh(
        new SphereGeometry(0.32, 8, 6),
        new MeshBasicMaterial({ color: '#2d6a4f' })
    );
    shell.scale.set(1.2, 0.7, 0.9);
    group.add(shell);

    var head = new Mesh(
        new SphereGeometry(0.15, 6, 5),
        new MeshBasicMaterial({ color: '#40916c' })
    );
    head.position.set(0.42, 0.05, 0);
    group.add(head);

    var flipperPositions = [
        { x: 0.15, y: 0, z: 0.3 },
        { x: 0.15, y: 0, z: -0.3 },
        { x: -0.2, y: 0, z: 0.28 },
        { x: -0.2, y: 0, z: -0.28 }
    ];
    flipperPositions.forEach(function (p) {
        var flip = new Mesh(
            new SphereGeometry(0.11, 5, 4),
            new MeshBasicMaterial({ color: '#52b788' })
        );
        flip.scale.set(1.5, 0.4, 0.7);
        flip.position.set(p.x, p.y, p.z);
        group.add(flip);
    });

    group.userData.radius = 0.38;
    group.userData.scoreValue = 15;
    group.userData.hungerValue = 20;
    group.userData.healValue = 6;
    group.userData.type = 'turtle';
    group.userData.speed = 0.5 + Math.random() * 0.8;
    group.userData.swimDir = Math.random() > 0.5 ? 1 : -1;
    group.userData.wobblePhase = Math.random() * Math.PI * 2;
    group.userData.baseY = 0;

    return group;
}

export function createSeal() {
    var group = new Group();

    var body = new Mesh(
        new SphereGeometry(0.35, 8, 6),
        new MeshBasicMaterial({ color: '#6d4c41' })
    );
    body.scale.set(2.0, 1.0, 0.7);
    group.add(body);

    var head = new Mesh(
        new SphereGeometry(0.22, 7, 6),
        new MeshBasicMaterial({ color: '#795548' })
    );
    head.position.set(0.65, 0.1, 0);
    group.add(head);

    var eyeL = new Mesh(
        new SphereGeometry(0.055, 5, 4),
        new MeshBasicMaterial({ color: '#111111' })
    );
    eyeL.position.set(0.82, 0.14, 0.15);
    group.add(eyeL);

    var eyeR = eyeL.clone();
    eyeR.position.set(0.82, 0.14, -0.15);
    group.add(eyeR);

    var flipL = new Mesh(
        new SphereGeometry(0.14, 5, 4),
        new MeshBasicMaterial({ color: '#5d4037' })
    );
    flipL.scale.set(0.8, 0.3, 1.8);
    flipL.position.set(-0.5, -0.18, 0.3);
    group.add(flipL);

    var flipR = flipL.clone();
    flipR.position.set(-0.5, -0.18, -0.3);
    group.add(flipR);

    group.userData.radius = 0.42;
    group.userData.scoreValue = 20;
    group.userData.hungerValue = 30;
    group.userData.healValue = 10;
    group.userData.type = 'seal';
    group.userData.speed = 1.0 + Math.random() * 1.2;
    group.userData.swimDir = Math.random() > 0.5 ? 1 : -1;
    group.userData.wobblePhase = Math.random() * Math.PI * 2;
    group.userData.baseY = 0;

    return group;
}

export function createCoin() {
    var coin = new Mesh(
        new CylinderGeometry(0.2, 0.2, 0.06, 12),
        new MeshBasicMaterial({ color: '#ffd700' })
    );
    coin.rotation.x = Math.PI / 2;
    coin.userData.radius = 0.22;
    coin.userData.type = 'coin';
    coin.userData.wobblePhase = Math.random() * Math.PI * 2;
    coin.userData.baseY = 0;
    return coin;
}

export function createMine() {
    var group = new Group();

    var body = new Mesh(
        new SphereGeometry(0.35, 8, 7),
        new MeshBasicMaterial({ color: '#2d2d2d' })
    );
    group.add(body);

    var spikeCount = 8;
    for (var i = 0; i < spikeCount; i++) {
        var angle = (i / spikeCount) * Math.PI * 2;
        var spike = new Mesh(
            new CylinderGeometry(0.04, 0.04, 0.28, 5),
            new MeshBasicMaterial({ color: '#1a1a1a' })
        );
        spike.position.set(
            Math.cos(angle) * 0.42,
            Math.sin(angle) * 0.42,
            0
        );
        spike.rotation.z = angle + Math.PI / 2;
        group.add(spike);
    }

    group.userData.radius = 0.38;
    group.userData.type = 'mine';

    return group;
}

export function createJellyfish() {
    var group = new Group();
    var colors = ['#9b59b6', '#8e44ad', '#6c3483'];
    var color = colors[Math.floor(Math.random() * colors.length)];

    var bell = new Mesh(
        new SphereGeometry(0.28, 8, 6),
        new MeshBasicMaterial({ color: color, transparent: true, opacity: 0.75 })
    );
    bell.scale.set(1.0, 0.65, 1.0);
    group.add(bell);

    for (var i = 0; i < 5; i++) {
        var tentacle = new Mesh(
            new CylinderGeometry(0.025, 0.01, 0.55 + Math.random() * 0.3, 4),
            new MeshBasicMaterial({ color: color, transparent: true, opacity: 0.55 })
        );
        tentacle.position.set(
            (Math.random() - 0.5) * 0.3,
            -0.45 - Math.random() * 0.1,
            (Math.random() - 0.5) * 0.3
        );
        group.add(tentacle);
    }

    group.userData.radius = 0.30;
    group.userData.type = 'jellyfish';
    group.userData.wobblePhase = Math.random() * Math.PI * 2;
    group.userData.baseY = 0;

    return group;
}
