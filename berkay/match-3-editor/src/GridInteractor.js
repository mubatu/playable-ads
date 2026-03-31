import * as THREE from "three";

export class GridInteractor {
    constructor(sceneManager, levelManager) {
        this.sceneManager = sceneManager;
        this.levelManager = levelManager;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.currentTexture = null;

        this.createPreview();

        window.addEventListener("mousemove", this.onMove.bind(this));
        window.addEventListener("mousedown", this.onClick.bind(this));
        window.addEventListener("contextmenu", e => e.preventDefault());
    }

    createPreview() {
        this.preview = new THREE.Mesh(
            new THREE.PlaneGeometry(0.8, 0.8),
            new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.4, transparent: true })
        );
        this.sceneManager.scene.add(this.preview);
    }

    setTexture(tex) {
        this.currentTexture = tex;
        this.preview.material.map = tex ? tex.texture : null;
    }

    getGridPos(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);
        const hit = this.raycaster.intersectObject(this.sceneManager.grid);

        if (!hit.length) return null;

        const p = hit[0].point;
        return {
            x: Math.round(p.x),
            y: Math.round(p.y)
        };
    }

    onMove(e) {
        const pos = this.getGridPos(e);
        if (!pos) return;

        this.preview.position.set(pos.x, pos.y, 0.05);
    }

    onClick(e) {
        if (!this.currentTexture) return;

        const pos = this.getGridPos(e);
        if (!pos) return;

        if (e.button === 2) {
            this.levelManager.remove(pos.x, pos.y);
        } else {
            this.levelManager.add(pos.x, pos.y, this.currentTexture);
        }
    }
}