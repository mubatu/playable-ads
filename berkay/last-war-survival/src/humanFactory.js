import { Human } from "./human";
import * as THREE from "three";

export class HumanFactory {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.activeHumans = [];
        this.pool = [];
        this.lanes = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
    }

    produce(quantity = 1) {
        const used = new Set();
        for (let i = 0; i < quantity; i++) {
            let x;
            do {
                x = this.lanes[Math.floor(Math.random() * this.lanes.length)];
            } while (used.has(x));
            used.add(x);

            let human;
            if (this.pool.length > 0) {
                human = this.pool.pop();
                human.model.position.set(x, -1, -50);
                if (human.model) human.model.visible = true; // <-- Add this: Unhide recycled human
            } else {
                human = new Human(this.scene, "/assets/InPlaceRun.glb", 1, new THREE.Vector3(x, -1, -50), -3);
            }

            this.activeHumans.push(human);
        }
    }

    update(delta) {
        for (let i = this.activeHumans.length - 1; i >= 0; i--) {
            const human = this.activeHumans[i];
            human.update(delta);

            for (let j = this.player.activeBullets.length - 1; j >= 0; j--) {
                const bullet = this.player.activeBullets[j];
                const bulletSphere = new THREE.Sphere(bullet.position, 0.1);

                if (human.boundingBox && human.boundingBox.intersectsSphere(bulletSphere)) {
                    // Hide human and return to pool
                    if (human.model) human.model.visible = false; // <-- Add this
                    this.activeHumans.splice(i, 1);
                    this.pool.push(human);

                    // Hide bullet and return to pool
                    bullet.visible = false; // <-- Add this
                    this.player.activeBullets.splice(j, 1);
                    this.player.bulletPool.push(bullet);
                    break;
                }
            }

            // human vs player
            if (human.boundingBox && human.boundingBox.intersectsBox(this.player.boundingBox)) {
                console.log("Player hit! Game Over");
                // optional: stop game loop here
            }

            // recycle humans out of bounds
            if (human.model && human.model.position.z > 10) {
                this.activeHumans.splice(i, 1);
                this.pool.push(human);
            }
        }
    }
}