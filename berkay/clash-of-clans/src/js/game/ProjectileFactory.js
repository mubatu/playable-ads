import * as THREE from 'three';

const SPHERE_GEO = new THREE.SphereGeometry(0.09, 10, 8);

const CANNON_COLOR = 0x111111;
const CANNON_EMISSIVE = 0x222222;
const MORTAR_COLOR = 0x6b3e1a;
const MORTAR_EMISSIVE = 0x3d220c;

export class ProjectileFactory {
    static create() {
        const mesh = new THREE.Mesh(
            SPHERE_GEO,
            new THREE.MeshStandardMaterial({
                color: CANNON_COLOR,
                roughness: 0.4,
                metalness: 0.7,
                emissive: CANNON_EMISSIVE
            })
        );
        mesh.visible = false;
        return mesh;
    }

    static styleCannonRound(mesh) {
        mesh.material.color.setHex(CANNON_COLOR);
        mesh.material.emissive.setHex(CANNON_EMISSIVE);
        mesh.scale.setScalar(1);
    }

    static styleMortarRound(mesh) {
        mesh.material.color.setHex(MORTAR_COLOR);
        mesh.material.emissive.setHex(MORTAR_EMISSIVE);
        mesh.scale.setScalar(1.18);
    }
}
