import * as THREE from "three";

export class Player {
    constructor(scene, position = new THREE.Vector3(0, 0, 0), speed = 10) {
        this.scene = scene;
        this.speed = speed; // units per second
        this.direction = 0; // -1 = left, 1 = right, 0 = idle

        // capsule player
        const geometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        scene.add(this.mesh);

        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
        this.previousPosition = this.mesh.position.clone();
    }

    attachCamera(camera) {
        this.camera = camera;
    }

    update(delta) {
        this.previousPosition.copy(this.mesh.position);
        if (window.playerMovementCommand) {
            window.playerMovementCommand.execute(this.mesh, 0.05);
        }
        if (window.isJumpRequested && window.playerJumpCommand) {
            window.playerJumpCommand.execute(this.mesh, 10);
            window.isJumpRequested = false; // Reset trigger
        }

        if (window.playerJumpCommand) {
            window.playerJumpCommand.update(this.mesh, delta);
        }

        const displacement = new THREE.Vector3().subVectors(this.mesh.position, this.previousPosition);
        this.camera.position.add(displacement);
        this.boundingBox.setFromObject(this.mesh);
    }
}