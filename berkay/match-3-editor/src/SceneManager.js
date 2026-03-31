import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export class SceneManager {
    constructor(gridWidth, gridHeight) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a);

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        const maxDim = Math.max(gridWidth, gridHeight);
        this.camera.position.set(gridWidth / 2, gridHeight / 2, maxDim);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(gridWidth / 2 - 0.5, gridHeight / 2 - 0.5, 0);

        this.createGrid();

        window.addEventListener("resize", this.onResize.bind(this));
    }

    createGrid() {
        // Adding the width and height segments creates a proper visible wireframe grid!
        const geo = new THREE.PlaneGeometry(
            this.gridWidth,
            this.gridHeight,
            this.gridWidth,
            this.gridHeight
        );

        const mat = new THREE.MeshBasicMaterial({
            color: 0x444444,
            wireframe: true,
            transparent: true,
            opacity: 0.5
        });

        this.grid = new THREE.Mesh(geo, mat);
        this.grid.position.set(this.gridWidth / 2 - 0.5, this.gridHeight / 2 - 0.5, 0);

        this.scene.add(this.grid);
    }

    resizeGrid(newWidth, newHeight) {
        this.gridWidth = newWidth;
        this.gridHeight = newHeight;

        // 1. Destroy the old grid to prevent memory leaks
        if (this.grid) {
            this.grid.geometry.dispose();
            this.grid.material.dispose();
            this.scene.remove(this.grid);
        }

        // 2. Generate the new grid
        this.createGrid();

        // 3. Recenter the camera and controls based on the new size
        const maxDim = Math.max(newWidth, newHeight);
        this.camera.position.set(newWidth / 2, newHeight / 2, maxDim);
        this.controls.target.set(newWidth / 2 - 0.5, newHeight / 2 - 0.5, 0);
        this.controls.update();
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}