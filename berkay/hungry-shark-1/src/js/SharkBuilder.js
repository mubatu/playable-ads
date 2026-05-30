import { Group, Mesh, SphereGeometry, ConeGeometry, MeshBasicMaterial, CircleGeometry } from 'three';

export function buildShark(config) {
    var group = new Group();
    group.name = 'shark';

    var bodyMat = new MeshBasicMaterial({ color: config.bodyColor });
    var bellyMat = new MeshBasicMaterial({ color: config.bellyColor });
    var finMat = new MeshBasicMaterial({ color: config.finColor });
    var eyeMat = new MeshBasicMaterial({ color: config.eyeColor });
    var pupilMat = new MeshBasicMaterial({ color: config.pupilColor });

    var s = config.size;

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

    var tailFinLower = new Mesh(new ConeGeometry(s * 0.2, s * 0.35, 6), finMat);
    tailFinLower.rotation.z = Math.PI * 0.6;
    tailFinLower.position.set(-s * 0.7, -s * 0.1, 0);
    group.add(tailFinLower);

    var dorsalFin = new Mesh(new ConeGeometry(s * 0.15, s * 0.4, 6), finMat);
    dorsalFin.position.set(-s * 0.1, s * 0.4, 0);
    group.add(dorsalFin);

    var pectoralFinL = new Mesh(new ConeGeometry(s * 0.1, s * 0.3, 5), finMat);
    pectoralFinL.rotation.z = Math.PI * 0.7;
    pectoralFinL.position.set(s * 0.1, -s * 0.25, 0.15);
    group.add(pectoralFinL);

    var pectoralFinR = new Mesh(new ConeGeometry(s * 0.1, s * 0.3, 5), finMat);
    pectoralFinR.rotation.z = Math.PI * 0.7;
    pectoralFinR.position.set(s * 0.1, -s * 0.25, -0.15);
    group.add(pectoralFinR);

    var eyeL = new Mesh(new CircleGeometry(s * 0.08, 12), eyeMat);
    eyeL.position.set(s * 0.35, s * 0.12, 0.2);
    group.add(eyeL);

    var pupilL = new Mesh(new CircleGeometry(s * 0.04, 10), pupilMat);
    pupilL.position.set(s * 0.37, s * 0.12, 0.21);
    group.add(pupilL);

    var eyeR = new Mesh(new CircleGeometry(s * 0.08, 12), eyeMat);
    eyeR.position.set(s * 0.35, s * 0.12, -0.2);
    group.add(eyeR);

    var pupilR = new Mesh(new CircleGeometry(s * 0.04, 10), pupilMat);
    pupilR.position.set(s * 0.37, s * 0.12, -0.21);
    group.add(pupilR);

    var mouth = new Mesh(new SphereGeometry(s * 0.12, 8, 6), new MeshBasicMaterial({ color: '#cc2222' }));
    mouth.scale.set(1.5, 0.4, 0.5);
    mouth.position.set(s * 0.55, -s * 0.08, 0);
    group.add(mouth);

    group.userData.tailFin = tailFin;
    group.userData.tailFinLower = tailFinLower;
    group.userData.dorsalFin = dorsalFin;
    group.userData.body = body;

    return group;
}
