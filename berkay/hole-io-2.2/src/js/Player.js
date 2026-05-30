import * as THREE from 'three';

export function createPlayer(config) {
    const diameter = config.player.initialDiameter;
    const radius = diameter / 2;

    // Create the black hole visual
    const geometry = new THREE.CircleGeometry(radius, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = 0.01;
    mesh.castShadow = false;
    mesh.receiveShadow = true;

    // Create outer rim for visibility
    const rimGeometry = new THREE.CircleGeometry(radius + 0.05, 32);
    const rimMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 });
    const rimMesh = new THREE.Mesh(rimGeometry, rimMaterial);
    rimMesh.position.z = 0.005;
    rimMesh.scale.z = 0.1;

    const group = new THREE.Group();
    group.add(rimMesh);
    group.add(mesh);
    group.position.set(0, 0, 0);

    const player = {
        group: group,
        mesh: mesh,
        rimMesh: rimMesh,
        position: new THREE.Vector3(0, 0, 0),
        velocity: new THREE.Vector3(0, 0, 0),
        currentDiameter: diameter,
        maxDiameter: config.player.maxDiameter,
        moveSpeed: config.player.moveSpeed,
        consumeAnimationDuration: config.player.consumeAnimationDuration,
        animatingConsumes: [],

        updatePosition(delta, joystickX, joystickY) {
            const direction = new THREE.Vector3(joystickX, joystickY, 0).normalize();
            if (direction.length() > 0) {
                this.velocity.x = direction.x * this.moveSpeed;
                this.velocity.y = direction.y * this.moveSpeed;
            } else {
                this.velocity.x *= 0.9;
                this.velocity.y *= 0.9;
            }

            this.position.x += this.velocity.x * delta;
            this.position.y += this.velocity.y * delta;

            // Clamp to world bounds
            const bound = 20;
            this.position.x = Math.max(-bound, Math.min(bound, this.position.x));
            this.position.y = Math.max(-bound, Math.min(bound, this.position.y));

            this.group.position.copy(this.position);
        },

        getRadius() {
            return this.currentDiameter / 2;
        },

        grow(amount) {
            const newDiameter = Math.min(this.currentDiameter + amount, this.maxDiameter);
            const scale = newDiameter / this.currentDiameter;

            this.currentDiameter = newDiameter;
            this.mesh.scale.multiplyScalar(scale);
            this.rimMesh.scale.x *= scale;
            this.rimMesh.scale.y *= scale;
        },

        animateConsume(targetMesh) {
            const consume = {
                mesh: targetMesh,
                startPosition: targetMesh.position.clone(),
                startScale: targetMesh.scale.clone(),
                duration: this.consumeAnimationDuration,
                elapsed: 0
            };
            this.animatingConsumes.push(consume);
        },

        updateAnimations(delta) {
            for (let i = this.animatingConsumes.length - 1; i >= 0; i--) {
                const consume = this.animatingConsumes[i];
                consume.elapsed += delta;

                if (consume.elapsed >= consume.duration) {
                    this.animatingConsumes.splice(i, 1);
                    continue;
                }

                const progress = consume.elapsed / consume.duration;
                const easeProgress = 1 - (1 - progress) * (1 - progress);

                consume.mesh.position.lerp(this.position, easeProgress * 0.3);
                consume.mesh.position.z -= easeProgress * 0.5;
                consume.mesh.scale.multiplyScalar(1 - easeProgress * 0.5);
                consume.mesh.material.opacity = 1 - easeProgress;
            }
        },

        reset() {
            this.position.set(0, 0, 0);
            this.velocity.set(0, 0, 0);
            this.currentDiameter = 1.5;
            this.mesh.scale.set(1, 1, 1);
            this.rimMesh.scale.set(1, 1, 1);
            this.group.position.copy(this.position);
            this.animatingConsumes = [];
        }
    };

    return player;
}
