import * as THREE from "three";

export class AssetManager {
    constructor() {
        this.projectRoot = null;
        this.textureLoader = new THREE.TextureLoader();
        this.cache = new Map(); // url -> texture
        this.assets = [];
    }

    async connectFolder() {
        this.projectRoot = await window.showDirectoryPicker();
        await this.loadExistingAssets();
    }

    async loadExistingAssets() {
        const dir = await this.projectRoot.getDirectoryHandle("photos", { create: true });

        for await (const entry of dir.values()) {
            if (entry.kind !== "file") continue;

            const file = await entry.getFile();
            const url = URL.createObjectURL(file);

            this.assets.push({ url, name: entry.name });
        }
    }

    getTexture(url) {
        if (this.cache.has(url)) return this.cache.get(url);

        const tex = this.textureLoader.load(url);
        this.cache.set(url, tex);
        return tex;
    }
}