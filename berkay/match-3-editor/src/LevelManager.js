import * as THREE from "three";

export class LevelManager {
    constructor(scene, assetManager) {
        this.scene = scene;
        this.assetManager = assetManager;

        this.grid = new Map(); // "x,y" -> mesh
        this.history = [];
        this.future = [];
    }

    key(x, y) {
        return `${x},${y}`;
    }

    clear() {
        this.grid.forEach(entry => {
            this.scene.remove(entry.mesh);
        });
        this.grid.clear();
        this.history = [];
        this.future = [];
    }

    add(x, y, texture) {
        const key = this.key(x, y);

        // replace instead of ignore
        if (this.grid.has(key)) {
            this.remove(x, y);
        }

        const tex = this.assetManager.getTexture(texture.url);

        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(0.8, 0.8),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true })
        );

        mesh.position.set(x, y, 0.1);

        this.scene.add(mesh);
        this.grid.set(key, { mesh, texture });

        this.history.push({ type: "add", x, y, texture });
        this.future.length = 0;
    }

    remove(x, y) {
        const key = this.key(x, y);
        const entry = this.grid.get(key);
        if (!entry) return;

        this.scene.remove(entry.mesh);
        this.grid.delete(key);

        this.history.push({ type: "remove", x, y, texture: entry.texture });
        this.future.length = 0;
    }

    undo() {
        const action = this.history.pop();
        if (!action) return;

        this.future.push(action);

        if (action.type === "add") {
            this.remove(action.x, action.y);
        } else {
            this.add(action.x, action.y, action.texture);
        }
    }

    redo() {
        const action = this.future.pop();
        if (!action) return;

        if (action.type === "add") {
            this.add(action.x, action.y, action.texture);
        } else {
            this.remove(action.x, action.y);
        }
    }
}