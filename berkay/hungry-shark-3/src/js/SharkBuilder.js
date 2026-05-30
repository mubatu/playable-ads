import { Group, Mesh, SphereGeometry, ConeGeometry, MeshBasicMaterial, CircleGeometry } from 'three';

export function buildShark(config) {
    var group = new Group();
    var bodyMat = new MeshBasicMaterial({ color: config.bodyColor });
    var bellyMat = new MeshBasicMaterial({ color: config.bellyColor });
    var finMat = new MeshBasicMaterial({ color: config.finColor });
    var eyeMat = new MeshBasicMaterial({ color: config.eyeColor });
    var pupilMat = new MeshBasicMaterial({ color: config.pupilColor });
    var mouthMat = new MeshBasicMaterial({ color: '#cc2222' });
    var s = config.size;

    group.name = 'shark';

    var body = new Mesh(new SphereGeometry(s * 0.5, 16, 12), bodyMat);
    body.scale.set(1.8, 0.7, 0.5);
    group.add(body);

    var belly = new Mesh(new SphereGeometry(s * 0.45, 12, 8), bellyMat);
    belly.scale.set(1.5, 0.5, 0.5);
    belly.position.set(0, -s * 0.1, 0.01);
    group.add(belly);

    var snout = new Mesh(new ConeGeometry(s * 0.25, s * 0.6, 8), bodyMat);
    snout.rotation.z = -Math.PI / 2;
    snout.position.set(s * 0.7, 0, 0);
    group.add(snout);

    var tailFin = new Mesh(new ConeGeometry(s * 0.35, s * 0.5, 6), finMat);
    tailFin.rotation.z = Math.PI / 2;
    tailFin.position.set(-s * 0.8, s * 0.1, 0);
    group.add(tailFin);

    var lowerTail = new Mesh(new ConeGeometry(s * 0.2, s * 0.35, 6), finMat);
    lowerTail.rotation.z = Math.PI * 0.6;
    lowerTail.position.set(-s * 0.7, -s * 0.1, 0);
    group.add(lowerTail);

    var dorsalFin = new Mesh(new ConeGeometry(s * 0.15, s * 0.4, 6), finMat);
    dorsalFin.position.set(-s * 0.1, s * 0.4, 0);
    group.add(dorsalFin);

    var pectoralFin = new Mesh(new ConeGeometry(s * 0.1, s * 0.3, 5), finMat);
    pectoralFin.rotation.z = Math.PI * 0.7;
    pectoralFin.position.set(s * 0.1, -s * 0.25, 0.15);
    group.add(pectoralFin);

    var eye = new Mesh(new CircleGeometry(s * 0.08, 12), eyeMat);
    eye.position.set(s * 0.35, s * 0.12, 0.2);
    group.add(eye);

    var pupil = new Mesh(new CircleGeometry(s * 0.04, 10), pupilMat);
    pupil.position.set(s * 0.37, s * 0.12, 0.21);
    group.add(pupil);

    var mouth = new Mesh(new SphereGeometry(s * 0.12, 8, 6), mouthMat);
    mouth.scale.set(1.5, 0.4, 0.5);
    mouth.position.set(s * 0.55, -s * 0.08, 0);
    group.add(mouth);

    group.userData.tailFin = tailFin;
    group.userData.lowerTail = lowerTail;
    group.userData.body = body;
    group.userData.baseScale = s;

    return group;
}
