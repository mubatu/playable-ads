import * as THREE from 'three';
import '../../../resuables/components/HandTutorial.js';
import { Timer } from '../../../resuables/components/Timer.js';
import { ObjectPool } from '../../../resuables/components/ObjectPool.js';
import { CarFactory } from './game/CarFactory.js';
import { TrayMatcher } from './game/TrayMatcher.js';
import { GameHUD } from './ui/GameHUD.js';

const HAND_ICON_SVG = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">',
    '<circle cx="64" cy="64" r="61" fill="#ffffff" fill-opacity="0.08"/>',
    '<path d="M51 106c-10-10-15-23-15-36 0-9 5-15 11-15 5 0 8 3 10 7V30c0-5 4-9 9-9s9 4 9 9v21h2V35c0-5 4-9 9-9s9 4 9 9v20h2V43c0-5 4-9 9-9s9 4 9 9v34c0 24-16 43-41 43H74c-9 0-17-5-23-14z" fill="#ffffff"/>',
    '</svg>'
].join('');

const LEVEL = {
    rows: 4,
    cols: 6,
    trayCapacity: 7,
    colors: [0xff5b5b, 0xffba49, 0x4dcc8a, 0x57a4ff]
};

export class Scene {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();

        this.gridCars = [];
        this.pool = null;
        this.trayMatcher = null;
        this.hud = null;
        this.timer = null;
        this.handTutorial = null;
        this.hasShownInteraction = false;

        this.gameState = 'waiting';
        this.clearedCount = 0;
        this.totalCars = 0;

        this.animate = this.animate.bind(this);
        this.onResize = this.onResize.bind(this);
        this.onPointerDown = this.onPointerDown.bind(this);
    }

    build() {
        this.setupRenderer();
        this.setupWorld();
        this.setupCars();
        this.setupHUD();
        this.bindEvents();
        this.renderer.setAnimationLoop(this.animate);
    }

    setupRenderer() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x7ec9ff);

        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 7.2, 7.8);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.domElement.style.touchAction = 'none';
        document.body.style.margin = '0';
        document.body.appendChild(this.renderer.domElement);
    }

    setupWorld() {
        const ambient = new THREE.AmbientLight(0xffffff, 1.0);
        this.scene.add(ambient);

        const key = new THREE.DirectionalLight(0xffffff, 1.0);
        key.position.set(6, 10, 8);
        this.scene.add(key);

        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(15, 15),
            new THREE.MeshStandardMaterial({ color: 0x365b72, roughness: 0.9, metalness: 0.05 })
        );
        floor.rotation.x = -Math.PI * 0.5;
        floor.position.y = -0.25;
        this.scene.add(floor);
    }

    setupCars() {
        this.pool = new ObjectPool(
            () => CarFactory.create(LEVEL.colors[0]),
            (car) => {
                car.visible = false;
                car.userData.isBlocked = false;
                car.userData.isCollected = false;
            },
            LEVEL.rows * LEVEL.cols
        );

        let colorIndex = 0;
        for (let row = 0; row < LEVEL.rows; row += 1) {
            for (let col = 0; col < LEVEL.cols; col += 1) {
                const car = this.pool.get();
                const color = LEVEL.colors[colorIndex % LEVEL.colors.length];
                colorIndex += 1;

                CarFactory.recolor(car, color);
                car.position.set((col - (LEVEL.cols - 1) * 0.5) * 1.15, 0, (row - (LEVEL.rows - 1) * 0.5) * 1.45);
                car.lookAt(this.camera.position.x, car.position.y, this.camera.position.z);
                car.visible = true;
                car.userData.grid = { row, col };

                this.gridCars.push(car);
                this.scene.add(car);
            }
        }

        this.totalCars = this.gridCars.length;
        this.updateBlockedStates();

        this.trayMatcher = new TrayMatcher(LEVEL.trayCapacity, (matchedEntries) => {
            for (let index = 0; index < matchedEntries.length; index += 1) {
                const entry = matchedEntries[index];
                this.clearedCount += 1;
                this.pool.release(entry.ref);
            }
            this.updateStatus();
        });
    }

    setupHUD() {
        this.hud = new GameHUD({
            onPlay: () => this.startGame(),
            onDownload: () => window.open('https://www.google.com', '_blank')
        });
        this.hud.build();
        this.hud.setTray([], LEVEL.trayCapacity);
        this.updateStatus();
    }

    startGame() {
        if (this.gameState !== 'waiting') {
            return;
        }

        this.gameState = 'playing';
        this.hud.hidePlay();
        this.timer = new Timer(50, 'circular', () => this.finish(false));
        this.timer.element.style.top = '16px';
        this.timer.element.style.left = 'auto';
        this.timer.element.style.right = '16px';
        this.timer.element.style.transform = 'none';
        this.timer.element.style.zIndex = '60';
        this.updateStatus();
        this.showTutorial();
    }

    updateBlockedStates() {
        for (let i = 0; i < this.gridCars.length; i += 1) {
            const car = this.gridCars[i];
            if (car.userData.isCollected || !car.visible) {
                continue;
            }

            const cameraSideBlocked = this.hasCarAt(car.userData.grid.row + 1, car.userData.grid.col);
            car.userData.isBlocked = cameraSideBlocked;
            car.position.y = car.userData.isBlocked ? -0.06 : 0;
        }
    }

    hasCarAt(row, col) {
        for (let i = 0; i < this.gridCars.length; i += 1) {
            const car = this.gridCars[i];
            if (!car.visible || car.userData.isCollected) {
                continue;
            }
            if (car.userData.grid.row === row && car.userData.grid.col === col) {
                return true;
            }
        }
        return false;
    }

    onPointerDown(event) {
        if (this.gameState !== 'playing') {
            return;
        }

        const rect = this.renderer.domElement.getBoundingClientRect();
        this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
        this.raycaster.setFromCamera(this.pointer, this.camera);

        const hits = this.raycaster.intersectObjects(this.gridCars, true);
        if (!hits.length) {
            return;
        }

        const selectedCar = this.resolveCarGroup(hits[0].object);
        if (!selectedCar || selectedCar.userData.isBlocked || selectedCar.userData.isCollected || !selectedCar.visible) {
            return;
        }

        if (!this.hasShownInteraction) {
            this.hasShownInteraction = true;
            this.stopTutorial();
        }

        const result = this.trayMatcher.addCar({
            color: selectedCar.userData.color,
            ref: selectedCar
        });

        if (!result.accepted) {
            this.finish(false);
            return;
        }

        selectedCar.visible = false;
        selectedCar.userData.isCollected = true;
        this.updateBlockedStates();
        this.refreshTray();

        if (this.clearedCount >= this.totalCars) {
            this.finish(true);
        } else if (!result.matched && !this.trayMatcher.canAdd()) {
            this.finish(false);
        } else {
            this.updateStatus();
        }
    }

    resolveCarGroup(mesh) {
        let current = mesh;
        while (current && !current.userData?.grid) {
            current = current.parent;
        }
        return current;
    }

    refreshTray() {
        const colors = this.trayMatcher.slots.map((entry) => entry.color);
        this.hud.setTray(colors, LEVEL.trayCapacity);
    }

    showTutorial() {
        const firstPlayable = this.gridCars.find((car) => car.visible && !car.userData.isCollected && !car.userData.isBlocked);
        if (!firstPlayable || !window.HandTutorial) {
            return;
        }

        const projected = firstPlayable.position.clone().project(this.camera);
        const from = {
            space: 'screen',
            x: projected.x * 0.5 + 0.5,
            y: (-projected.y * 0.5) + 0.5
        };

        this.handTutorial = new window.HandTutorial({
            container: document.body,
            renderer: this.renderer,
            camera: this.camera,
            assetUrl: `data:image/svg+xml;utf8,${encodeURIComponent(HAND_ICON_SVG)}`,
            gesture: 'tap',
            from,
            duration: 1.1,
            loop: true,
            size: 110,
            zIndex: 50
        });
        this.handTutorial.play();
    }

    stopTutorial() {
        if (!this.handTutorial) {
            return;
        }
        this.handTutorial.destroy();
        this.handTutorial = null;
    }

    updateStatus() {
        const remaining = this.totalCars - this.clearedCount;
        if (this.gameState === 'waiting') {
            this.hud.setStatus('Tap PLAY NOW. Collect only cars with a free side and match 3 colors in tray.');
            return;
        }
        if (this.gameState === 'ended') {
            return;
        }
        this.hud.setStatus(`Cars left: ${remaining} | Tray: ${this.trayMatcher.slots.length}/${LEVEL.trayCapacity}`);
    }

    finish(isWin) {
        if (this.gameState === 'ended') {
            return;
        }

        this.gameState = 'ended';
        this.stopTutorial();
        if (this.timer) {
            this.timer.destroy();
            this.timer = null;
        }
        this.hud.showEnd(isWin);
        this.hud.setStatus(isWin ? 'All traffic cleared.' : 'Tray overflow or time ended.');
    }

    animate() {
        const delta = this.clock.getDelta();
        if (this.timer && this.gameState === 'playing') {
            this.timer.update(delta);
        }

        if (this.handTutorial && this.gameState === 'playing') {
            this.handTutorial.update(performance.now());
        }

        this.renderer.render(this.scene, this.camera);
    }

    bindEvents() {
        window.addEventListener('resize', this.onResize);
        this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    }

    onResize() {
        if (!this.camera || !this.renderer) {
            return;
        }
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
