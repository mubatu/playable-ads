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

        this.bulletPool = [];
        this.activeBullets = [];
        this.shootInterval = 0.3;
        this.shootTimer = 0;

        // input handling
        this.keys = {};
        window.addEventListener("keydown", (e) => this.keys[e.code] = true);
        window.addEventListener("keyup", (e) => this.keys[e.code] = false);
    }

    update(delta) {
        // handle horizontal input
        if (this.keys["ArrowLeft"]) this.direction = -1;
        else if (this.keys["ArrowRight"]) this.direction = 1;
        else this.direction = 0;

        this.mesh.position.x += this.direction * this.speed * delta;
        this.mesh.position.x = THREE.MathUtils.clamp(this.mesh.position.x, -5, 5);

        // automatic shooting
        this.shootTimer += delta;
        if (this.shootTimer >= this.shootInterval) {
            this.shoot();
            this.shootTimer = 0;
        }

        const bulletSpeed = 10;

        for (let i = this.activeBullets.length - 1; i >= 0; i--) {
            const b = this.activeBullets[i];
            b.position.z -= bulletSpeed * delta;

            if (b.position.z < -50) {
                this.activeBullets.splice(i, 1);
                b.visible = false; // <-- Add this: Hide bullet instead of teleporting it
                this.bulletPool.push(b);
            }
        }

        this.boundingBox.setFromObject(this.mesh);
    }

    shoot() {
        let bullet;
        if (this.bulletPool.length > 0) {
            bullet = this.bulletPool.pop();
            bullet.visible = true; // <-- Add this: Unhide recycled bullet
        } else {
            const geom = new THREE.SphereGeometry(0.1, 8, 8);
            const mat = new THREE.MeshStandardMaterial({ color: 0xffff00 });
            bullet = new THREE.Mesh(geom, mat);
            this.scene.add(bullet);
        }

        bullet.position.copy(this.mesh.position);
        this.activeBullets.push(bullet);
    }
}