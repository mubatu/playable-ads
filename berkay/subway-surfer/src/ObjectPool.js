// object-pool.js
import * as THREE from 'three';
export class ObjectPool {
    constructor(createFunc, resetFunc = null, initialSize = 10) {
        this.createFunc = createFunc;
        this.resetFunc = resetFunc;
        this.pool = [];
        this.active = new Set();

        // Pre-populate the pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFunc());
        }
    }

    get() {
        let obj;

        if (this.pool.length > 0) {
            obj = this.pool.pop();
        } else {
            obj = this.createFunc();
        }

        this.active.add(obj);
        return obj;
    }

    release(obj) {
        if (this.active.has(obj)) {
            this.active.delete(obj);

            // Reset the object if reset function is provided
            if (this.resetFunc) {
                this.resetFunc(obj);
            }

            this.pool.push(obj);
        }
    }

    releaseAll() {
        for (const obj of this.active) {
            if (this.resetFunc) {
                this.resetFunc(obj);
            }
            this.pool.push(obj);
        }
        this.active.clear();
    }

    getActiveCount() {
        return this.active.size;
    }

    getPoolSize() {
        return this.pool.length;
    }

    getTotalSize() {
        return this.active.size + this.pool.length;
    }

    // Clean up method to remove excess pooled objects
    trim(maxSize) {
        if (this.pool.length > maxSize) {
            this.pool.splice(maxSize);
        }
    }
}

// Specialized pool for Three.js objects
export class ThreeObjectPool extends ObjectPool {
    constructor(createFunc, resetFunc = null, initialSize = 10) {
        super(createFunc, resetFunc, initialSize);
    }

    // Override release to handle Three.js specific cleanup
    release(obj) {
        // Remove from scene if it has a parent
        if (obj.parent) {
            obj.parent.remove(obj);
        }

        // Reset position, rotation, scale
        if (obj.position) obj.position.set(0, 0, 0);
        if (obj.rotation) obj.rotation.set(0, 0, 0);
        if (obj.scale) obj.scale.set(1, 1, 1);

        // Make invisible
        if (obj.visible !== undefined) obj.visible = false;

        super.release(obj);
    }
}

// Factory for creating different types of pools
export class PoolFactory {
    static createObjectPool(createFunc, resetFunc = null, initialSize = 10) {
        return new ObjectPool(createFunc, resetFunc, initialSize);
    }

    static createThreeObjectPool(createFunc, resetFunc = null, initialSize = 10) {
        return new ThreeObjectPool(createFunc, resetFunc, initialSize);
    }

    // Create a pool for bullet/projectile objects
    static createBulletPool(scene, initialSize = 20) {
        const createFunc = () => {
            const geometry = new THREE.SphereGeometry(0.1, 8, 8);
            const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const bullet = new THREE.Mesh(geometry, material);
            bullet.visible = false;
            return bullet;
        };

        const resetFunc = (bullet) => {
            bullet.position.set(0, 0, 0);
            bullet.visible = false;
        };

        return new ThreeObjectPool(createFunc, resetFunc, initialSize);
    }

    // Create a pool for particle effects
    static createParticlePool(scene, initialSize = 50) {
        const createFunc = () => {
            const geometry = new THREE.SphereGeometry(0.05, 4, 4);
            const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const particle = new THREE.Mesh(geometry, material);
            particle.visible = false;
            return particle;
        };

        const resetFunc = (particle) => {
            particle.position.set(0, 0, 0);
            particle.scale.set(1, 1, 1);
            particle.visible = false;
        };

        return new ThreeObjectPool(createFunc, resetFunc, initialSize);
    }
}