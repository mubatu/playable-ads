import * as THREE from 'three';

const SPHERE_GEO = new THREE.SphereGeometry(0.08, 10, 8);

export class RoyaleProjectileFactory {
    static create() {
        const mesh = new THREE.Mesh(
            SPHERE_GEO,
            new THREE.MeshStandardMaterial({
                color: 0x1a1a1a,
                roughness: 0.4,
                metalness: 0.7,
                emissive: 0x221008
            })
        );
        mesh.visible = false;
        return mesh;
    }

    static styleMelee(mesh) {
        mesh.scale.setScalar(1);
        mesh.material.color.setHex(0x3e2723);
        mesh.material.emissive.setHex(0x1a0e08);
    }

    static styleRanged(mesh) {
        mesh.scale.setScalar(0.78);
        mesh.material.color.setHex(0xffb74d);
        mesh.material.emissive.setHex(0x4a2510);
    }

    static styleKingBolt(mesh) {
        mesh.scale.setScalar(1.15);
        mesh.material.color.setHex(0x7e57c2);
        mesh.material.emissive.setHex(0x311b92);
    }

    static styleEnemyTower(mesh) {
        mesh.scale.setScalar(0.92);
        mesh.material.color.setHex(0x42a5f5);
        mesh.material.emissive.setHex(0x0d47a1);
    }
}
