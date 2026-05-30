import { Group, Mesh, Shape, ShapeGeometry, CircleGeometry, RingGeometry, MeshBasicMaterial, Color } from 'three';

function fishShape(length, height) {
    var s = new Shape();
    s.moveTo(-length, 0);
    s.bezierCurveTo(-length * 0.6, height, length * 0.6, height, length, 0);
    s.bezierCurveTo(length * 0.6, -height, -length * 0.6, -height, -length, 0);
    return s;
}

export function createSmallFish() {
    var group = new Group();
    var color = ['#ff8a3d', '#ffd43b', '#7ee787', '#ff7eb9'][Math.floor(Math.random() * 4)];
    var body = new Mesh(new ShapeGeometry(fishShape(0.32, 0.16)), new MeshBasicMaterial({ color: new Color(color) }));
    group.add(body);
    var tail = new Shape();
    tail.moveTo(-0.32, 0);
    tail.lineTo(-0.55, 0.18);
    tail.lineTo(-0.45, 0);
    tail.lineTo(-0.55, -0.18);
    var tailMesh = new Mesh(new ShapeGeometry(tail), new MeshBasicMaterial({ color: new Color(color) }));
    group.add(tailMesh);
    var eye = new Mesh(new CircleGeometry(0.04, 10), new MeshBasicMaterial({ color: new Color('#111') }));
    eye.position.set(0.18, 0.05, 0.01);
    group.add(eye);
    group.userData = { type: 'smallFish', radius: 0.4, baseColor: color, tail: tailMesh };
    return group;
}

export function createMediumFish() {
    var group = new Group();
    var color = '#5fb3d4';
    var body = new Mesh(new ShapeGeometry(fishShape(0.6, 0.32)), new MeshBasicMaterial({ color: new Color(color) }));
    group.add(body);
    var belly = new Mesh(new ShapeGeometry(fishShape(0.55, 0.18)), new MeshBasicMaterial({ color: new Color('#d4ecf6') }));
    belly.position.y = -0.05; belly.position.z = 0.005;
    group.add(belly);
    var tail = new Shape();
    tail.moveTo(-0.6, 0);
    tail.lineTo(-0.95, 0.3);
    tail.lineTo(-0.8, 0);
    tail.lineTo(-0.95, -0.3);
    var tailMesh = new Mesh(new ShapeGeometry(tail), new MeshBasicMaterial({ color: new Color(color) }));
    group.add(tailMesh);
    var eye = new Mesh(new CircleGeometry(0.06, 12), new MeshBasicMaterial({ color: new Color('#111') }));
    eye.position.set(0.35, 0.08, 0.01);
    group.add(eye);
    group.userData = { type: 'mediumFish', radius: 0.7, baseColor: color, tail: tailMesh };
    return group;
}

export function createCoin() {
    var group = new Group();
    var disc = new Mesh(new CircleGeometry(0.22, 24), new MeshBasicMaterial({ color: new Color('#ffd24a') }));
    group.add(disc);
    var rim = new Mesh(new RingGeometry(0.16, 0.21, 24), new MeshBasicMaterial({ color: new Color('#b8860b') }));
    rim.position.z = 0.005;
    group.add(rim);
    group.userData = { type: 'coin', radius: 0.28 };
    return group;
}

export function createMine() {
    var group = new Group();
    var body = new Mesh(new CircleGeometry(0.45, 24), new MeshBasicMaterial({ color: new Color('#2a2a2a') }));
    group.add(body);
    for (var i = 0; i < 8; i++) {
        var spike = new Mesh(new CircleGeometry(0.09, 8), new MeshBasicMaterial({ color: new Color('#444') }));
        var ang = (i / 8) * Math.PI * 2;
        spike.position.set(Math.cos(ang) * 0.5, Math.sin(ang) * 0.5, -0.01);
        group.add(spike);
    }
    var dot = new Mesh(new CircleGeometry(0.08, 12), new MeshBasicMaterial({ color: new Color('#ff3030') }));
    dot.position.z = 0.01;
    group.add(dot);
    group.userData = { type: 'mine', radius: 0.55 };
    return group;
}

export function createJellyfish() {
    var group = new Group();
    var color = '#e07ad6';
    var cap = new Shape();
    cap.moveTo(-0.35, 0);
    cap.bezierCurveTo(-0.35, 0.5, 0.35, 0.5, 0.35, 0);
    cap.lineTo(-0.35, 0);
    var capMesh = new Mesh(new ShapeGeometry(cap), new MeshBasicMaterial({ color: new Color(color), transparent: true, opacity: 0.85 }));
    group.add(capMesh);
    // tendrils
    for (var i = -2; i <= 2; i++) {
        var t = new Mesh(new ShapeGeometry((function () {
            var s = new Shape();
            s.moveTo(-0.03, 0);
            s.lineTo(0.03, 0);
            s.lineTo(0.03, -0.45);
            s.lineTo(-0.03, -0.45);
            return s;
        })()), new MeshBasicMaterial({ color: new Color('#f4a3e8'), transparent: true, opacity: 0.7 }));
        t.position.x = i * 0.13;
        t.position.y = -0.05;
        group.add(t);
    }
    group.userData = { type: 'jellyfish', radius: 0.45 };
    return group;
}
