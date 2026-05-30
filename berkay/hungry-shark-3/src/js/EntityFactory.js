import { Group, Mesh, SphereGeometry, ConeGeometry, CircleGeometry, MeshBasicMaterial } from 'three';

var SMALL_FISH_COLORS = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#74c0fc', '#da77f2'];
var MEDIUM_FISH_COLORS = ['#e64980', '#7950f2', '#1098ad', '#2b8a3e', '#e67700'];

export function createSmallFish() {
    var group = createFish(0.2, SMALL_FISH_COLORS, 'smallFish');
    group.userData.radius = 0.25;
    group.userData.scoreValue = 10;
    group.userData.hungerValue = 15;
    group.userData.healValue = 5;
    group.userData.speed = 1.0 + Math.random() * 1.5;
    return group;
}

export function createMediumFish() {
    var group = createFish(0.35, MEDIUM_FISH_COLORS, 'mediumFish');
    group.userData.radius = 0.42;
    group.userData.scoreValue = 25;
    group.userData.hungerValue = 25;
    group.userData.healValue = 10;
    group.userData.speed = 0.8 + Math.random() * 1.0;
    return group;
}

function createFish(size, colors, type) {
    var group = new Group();
    var color = colors[Math.floor(Math.random() * colors.length)];
    var mat = new MeshBasicMaterial({ color: color });
    var body = new Mesh(new SphereGeometry(size, 10, 8), mat);
    var tail = new Mesh(new ConeGeometry(size * 0.55, size * 0.9, 6), mat);
    var eye = new Mesh(new CircleGeometry(size * 0.15, 8), new MeshBasicMaterial({ color: '#ffffff' }));

    body.scale.set(1.55, 0.82, 0.45);
    tail.rotation.z = Math.PI / 2;
    tail.position.set(-size * 1.45, 0, 0);
    eye.position.set(size * 0.72, size * 0.22, size * 0.42);

    group.add(body);
    group.add(tail);
    group.add(eye);

    group.userData.type = type;
    group.userData.dir = Math.random() > 0.5 ? 1 : -1;
    group.userData.baseY = 0;
    group.userData.bobPhase = Math.random() * Math.PI * 2;
    return group;
}

export function createHuman() {
    var group = new Group();
    var skin = new MeshBasicMaterial({ color: '#f1c27d' });
    var suit = new MeshBasicMaterial({ color: '#ff4d6d' });

    var head = new Mesh(new CircleGeometry(0.12, 12), skin);
    head.position.set(0.16, 0.1, 0.12);
    group.add(head);

    var body = new Mesh(new SphereGeometry(0.16, 8, 6), suit);
    body.scale.set(1.4, 0.45, 0.35);
    body.position.set(-0.05, 0, 0);
    group.add(body);

    var leg = new Mesh(new SphereGeometry(0.05, 6, 5), skin);
    leg.scale.set(2.2, 0.5, 0.4);
    leg.position.set(-0.28, -0.08, 0);
    group.add(leg);

    group.userData.type = 'human';
    group.userData.radius = 0.34;
    group.userData.scoreValue = 45;
    group.userData.hungerValue = 35;
    group.userData.healValue = 15;
    group.userData.speed = 0.55 + Math.random() * 0.35;
    group.userData.dir = Math.random() > 0.5 ? 1 : -1;
    group.userData.baseY = 0;
    group.userData.bobPhase = Math.random() * Math.PI * 2;
    return group;
}

export function createCoin() {
    var group = new Group();
    var coin = new Mesh(new CircleGeometry(0.18, 16), new MeshBasicMaterial({ color: '#ffd700' }));
    var inner = new Mesh(new CircleGeometry(0.11, 12), new MeshBasicMaterial({ color: '#ffed4a' }));

    inner.position.z = 0.01;
    group.add(coin);
    group.add(inner);

    group.userData.type = 'coin';
    group.userData.radius = 0.22;
    group.userData.bobPhase = Math.random() * Math.PI * 2;
    group.userData.baseY = 0;
    return group;
}

export function createMine() {
    var group = new Group();
    var body = new Mesh(new SphereGeometry(0.3, 10, 8), new MeshBasicMaterial({ color: '#333333' }));
    var spikeMat = new MeshBasicMaterial({ color: '#555555' });
    var i;

    group.add(body);

    for (i = 0; i < 8; i += 1) {
        var spike = new Mesh(new ConeGeometry(0.06, 0.18, 5), spikeMat);
        var angle = (i / 8) * Math.PI * 2;
        spike.position.set(Math.cos(angle) * 0.3, Math.sin(angle) * 0.3, 0);
        spike.rotation.z = angle - Math.PI / 2;
        group.add(spike);
    }

    group.userData.type = 'mine';
    group.userData.radius = 0.35;
    group.userData.bobPhase = Math.random() * Math.PI * 2;
    group.userData.baseY = 0;
    return group;
}

export function createJellyfish() {
    var group = new Group();
    var color = ['#da77f2', '#748ffc', '#66d9e8', '#ffa8d4'][Math.floor(Math.random() * 4)];
    var mat = new MeshBasicMaterial({ color: color, transparent: true, opacity: 0.72 });
    var bell = new Mesh(new SphereGeometry(0.25, 10, 8), mat);
    var i;

    bell.scale.set(1, 0.7, 0.5);
    group.add(bell);

    for (i = 0; i < 4; i += 1) {
        var tentacle = new Mesh(new SphereGeometry(0.03, 5, 4), mat);
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

export function createEnemyShark() {
    var group = createFish(0.48, ['#607d8b', '#455a64', '#78909c'], 'enemyShark');
    group.userData.radius = 0.55;
    group.userData.speed = 0.95 + Math.random() * 0.5;
    group.scale.set(1.25, 1.25, 1.25);
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
