import * as THREE from 'three';

export class BulletFactory {
    static create() {
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 8, 8),
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.95 })
        );
        mesh.visible = false;
        return mesh;
    }

    static setColor(mesh, colorHex) {
        mesh.material.color.setHex(colorHex);
    }
}
