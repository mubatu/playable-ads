import * as THREE from 'three';

const CAR_BODY_GEOMETRY = new THREE.BoxGeometry(0.82, 0.34, 1.12);
const CAR_TOP_GEOMETRY = new THREE.BoxGeometry(0.58, 0.22, 0.56);
const WHEEL_GEOMETRY = new THREE.CylinderGeometry(0.11, 0.11, 0.1, 14);
WHEEL_GEOMETRY.rotateZ(Math.PI * 0.5);

const WHEEL_MATERIAL = new THREE.MeshStandardMaterial({ color: 0x202226, roughness: 0.92, metalness: 0.1 });
const WINDOW_MATERIAL = new THREE.MeshStandardMaterial({ color: 0xb6def8, roughness: 0.2, metalness: 0.2 });

function createWheel(offsetX, offsetZ) {
    const wheel = new THREE.Mesh(WHEEL_GEOMETRY, WHEEL_MATERIAL);
    wheel.position.set(offsetX, -0.13, offsetZ);
    return wheel;
}

export class CarFactory {
    static create(colorHex) {
        const root = new THREE.Group();

        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: colorHex,
            roughness: 0.56,
            metalness: 0.18
        });

        const body = new THREE.Mesh(CAR_BODY_GEOMETRY, bodyMaterial);
        body.position.y = 0;
        root.add(body);

        const top = new THREE.Mesh(CAR_TOP_GEOMETRY, WINDOW_MATERIAL);
        top.position.y = 0.23;
        root.add(top);

        root.add(createWheel(-0.31, -0.36));
        root.add(createWheel(0.31, -0.36));
        root.add(createWheel(-0.31, 0.36));
        root.add(createWheel(0.31, 0.36));

        root.userData.bodyMaterial = bodyMaterial;
        root.userData.color = colorHex;
        root.userData.isBlocked = false;
        root.userData.isCollected = false;

        return root;
    }

    static recolor(car, colorHex) {
        if (!car || !car.userData.bodyMaterial) {
            return;
        }

        car.userData.bodyMaterial.color.setHex(colorHex);
        car.userData.color = colorHex;
    }
}
