import { Group, Mesh, SphereGeometry, ConeGeometry, CircleGeometry, MeshBasicMaterial } from 'three';

var FISH_COLORS_SMALL = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#74c0fc', '#da77f2'];
var FISH_COLORS_MEDIUM = ['#e64980', '#7950f2', '#1098ad', '#2b8a3e', '#e67700'];

export function createSmallFish() {
    var group = new Group();
    var color = FISH_COLORS_SMALL[Math.floor(Math.random() * FISH_COLORS_SMALL.length)];
    var mat = new MeshBasicMaterial({ color: color });

    var body = new Mesh(new SphereGeometry(0.2, 8, 6), mat);
    body.scale.set(1.5, 0.8, 0.4);
    group.add(body);

    var tail = new Mesh(new ConeGeometry(0.12, 0.2, 5), mat);
    tail.rotation.z = Math.PI / 2;
    tail.position.set(-0.3, 0, 0);
    group.add(tail);

    var eye = new Mesh(new CircleGeometry(0.04, 8), new MeshBasicMaterial({ color: '#ffffff' }));
    eye.position.set(0.15, 0.05, 0.09);
    group.add(eye);

    group.userData.type = 'smallFish';
    group.userData.radius = 0.25;
    group.userData.scoreValue = 10;
    group.userData.hungerValue = 15;
    group.userData.healValue = 5;
    group.userData.speed = 1.0 + Math.random() * 1.5;
    group.userData.dir = Math.random() > 0.5 ? 1 : -1;
    group.userData.baseY = 0;
    group.userData.bobPhase = Math.random() * Math.PI * 2;

    return group;
}

export function createMediumFish() {
    var group = new Group();
    var color = FISH_COLORS_MEDIUM[Math.floor(Math.random() * FISH_COLORS_MEDIUM.length)];
    var mat = new MeshBasicMaterial({ color: color });

    var body = new Mesh(new SphereGeometry(0.35, 10, 8), mat);
    body.scale.set(1.6, 0.9, 0.5);
    group.add(body);

    var tail = new Mesh(new ConeGeometry(0.2, 0.3, 6), mat);
    tail.rotation.z = Math.PI / 2;
    tail.position.set(-0.5, 0, 0);
    group.add(tail);

    var dorsalFin = new Mesh(new ConeGeometry(0.08, 0.2, 5), mat);
    dorsalFin.position.set(0, 0.3, 0);
    group.add(dorsalFin);

    var eye = new Mesh(new CircleGeometry(0.06, 8), new MeshBasicMaterial({ color: '#ffffff' }));
    eye.position.set(0.25, 0.08, 0.18);
    group.add(eye);

    var pupil = new Mesh(new CircleGeometry(0.03, 6), new MeshBasicMaterial({ color: '#111111' }));
    pupil.position.set(0.27, 0.08, 0.19);
    group.add(pupil);

    group.userData.type = 'mediumFish';
    group.userData.radius = 0.4;
    group.userData.scoreValue = 25;
    group.userData.hungerValue = 25;
    group.userData.healValue = 10;
    group.userData.speed = 0.8 + Math.random() * 1.0;
    group.userData.dir = Math.random() > 0.5 ? 1 : -1;
    group.userData.baseY = 0;
    group.userData.bobPhase = Math.random() * Math.PI * 2;

    return group;
}

export function createCoin() {
    var group = new Group();
    var coin = new Mesh(
        new CircleGeometry(0.18, 12),
        new MeshBasicMaterial({ color: '#ffd700' })
    );
    group.add(coin);

    var inner = new Mesh(
        new CircleGeometry(0.12, 10),
        new MeshBasicMaterial({ color: '#ffed4a' })
    );
    inner.position.z = 0.01;
    group.add(inner);

    group.userData.type = 'coin';
    group.userData.radius = 0.22;
    group.userData.bobPhase = Math.random() * Math.PI * 2;
    group.userData.baseY = 0;

    return group;
}

export function createMine() {
    var group = new Group();

    var body = new Mesh(
        new SphereGeometry(0.3, 10, 8),
        new MeshBasicMaterial({ color: '#333333' })
    );
    group.add(body);

    var spikeMat = new MeshBasicMaterial({ color: '#555555' });
    for (var i = 0; i < 6; i++) {
        var spike = new Mesh(new ConeGeometry(0.06, 0.18, 5), spikeMat);
        var angle = (i / 6) * Math.PI * 2;
        spike.position.set(Math.cos(angle) * 0.3, Math.sin(angle) * 0.3, 0);
        spike.rotation.z = angle - Math.PI / 2;
        group.add(spike);
    }

    var indicator = new Mesh(
        new CircleGeometry(0.06, 8),
        new MeshBasicMaterial({ color: '#ff0000' })
    );
    indicator.position.z = 0.15;
    group.add(indicator);

    group.userData.type = 'mine';
    group.userData.radius = 0.35;
    group.userData.bobPhase = Math.random() * Math.PI * 2;
    group.userData.baseY = 0;

    return group;
}

export function createJellyfish() {
    var group = new Group();
    var colors = ['#da77f2', '#748ffc', '#66d9e8', '#ffa8d4'];
    var color = colors[Math.floor(Math.random() * colors.length)];

    var bell = new Mesh(
        new SphereGeometry(0.25, 10, 8),
        new MeshBasicMaterial({ color: color, transparent: true, opacity: 0.7 })
    );
    bell.scale.set(1, 0.7, 0.5);
    group.add(bell);

    var tentacleMat = new MeshBasicMaterial({ color: color, transparent: true, opacity: 0.5 });
    for (var i = 0; i < 4; i++) {
        var tentacle = new Mesh(new SphereGeometry(0.03, 5, 4), tentacleMat);
        tentacle.scale.set(1, 5, 1);
        tentacle.position.set((i - 1.5) * 0.1, -0.35, 0);
        group.add(tentacle);
    }

    group.userData.type = 'jellyfish';
    group.userData.radius = 0.3;
    group.userData.bobPhase = Math.random() * Math.PI * 2;
    group.userData.baseY = 0;
    group.userData.speed = 0.3 + Math.random() * 0.4;
    group.userData.dir = Math.random() > 0.5 ? 1 : -1;

    return group;
}

export function createBubble() {
    var bubble = new Mesh(
        new CircleGeometry(0.04 + Math.random() * 0.06, 8),
        new MeshBasicMaterial({ color: '#aaddff', transparent: true, opacity: 0.3 + Math.random() * 0.3 })
    );
    bubble.userData.speed = 0.5 + Math.random() * 1.0;
    bubble.userData.wobblePhase = Math.random() * Math.PI * 2;
    return bubble;
}
