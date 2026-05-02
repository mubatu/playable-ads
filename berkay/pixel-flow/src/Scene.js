import * as THREE from 'three';
import '../../../resuables/components/HandTutorial.js';
import { Timer } from '../../../resuables/components/Timer.js';
import { ObjectPool } from '../../../resuables/components/ObjectPool.js';
import { PixelGrid } from './game/PixelGrid.js';
import { ShooterFactory } from './game/ShooterFactory.js';
import { FlowQueue } from './game/FlowQueue.js';
import { PixelFlowHUD } from './ui/PixelFlowHUD.js';

const LEVEL = {
    queueCapacity: 5,
    rows: 8,
    cols: 8,
    duration: 55,
    maxActiveShooters: 3,
    colors: [0xff5e7d, 0x58a7ff, 0xffcf4d, 0x60d394]
};

const HAND_ICON_SVG = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">',
    '<circle cx="64" cy="64" r="61" fill="#ffffff" fill-opacity="0.08"/>',
    '<path d="M51 106c-10-10-15-23-15-36 0-9 5-15 11-15 5 0 8 3 10 7V30c0-5 4-9 9-9s9 4 9 9v21h2V35c0-5 4-9 9-9s9 4 9 9v20h2V43c0-5 4-9 9-9s9 4 9 9v34c0 24-16 43-41 43H74c-9 0-17-5-23-14z" fill="#ffffff"/>',
    '</svg>'
].join('');

export class Scene {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();

        this.grid = null;
        this.queue = null;
        this.shooterPool = null;
        this.activeShooters = [];

        this.hud = null;
        this.timer = null;
        this.handTutorial = null;

        this.gameState = 'waiting';
        this.lastQueueSignature = '';

        this.animate = this.animate.bind(this);
        this.onResize = this.onResize.bind(this);
    }

    build() {
        this.setupRenderer();
        this.setupWorld();
        this.setupSystems();
        this.bindEvents();
        this.renderer.setAnimationLoop(this.animate);
    }

    setupRenderer() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a1627);
        this.scene.fog = new THREE.Fog(0x0a1627, 10, 30);

        this.camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 1.4, 9.4);
        this.camera.lookAt(0, 0.9, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        document.body.style.margin = '0';
        document.body.style.overflow = 'hidden';
        document.body.appendChild(this.renderer.domElement);
    }

    setupWorld() {
        const ambient = new THREE.AmbientLight(0xffffff, 1.0);
        this.scene.add(ambient);

        const key = new THREE.DirectionalLight(0xd1e0ff, 1.2);
        key.position.set(-4, 8, 7);
        this.scene.add(key);

        const fill = new THREE.DirectionalLight(0xffbb8a, 0.65);
        fill.position.set(5, -2, 6);
        this.scene.add(fill);

        const boardBase = new THREE.Mesh(
            new THREE.PlaneGeometry(7.5, 7.5),
            new THREE.MeshStandardMaterial({ color: 0x182a49, roughness: 0.9 })
        );
        boardBase.position.set(0, 1.9, -0.28);
        this.scene.add(boardBase);

        const conveyor = new THREE.Mesh(
            new THREE.BoxGeometry(10.2, 0.36, 0.92),
            new THREE.MeshStandardMaterial({ color: 0x243a66, roughness: 0.8, metalness: 0.1 })
        );
        conveyor.position.set(0, -1.7, 0.2);
        this.scene.add(conveyor);
    }

    setupSystems() {
        this.grid = new PixelGrid(this.scene, {
            rows: LEVEL.rows,
            cols: LEVEL.cols,
            palette: LEVEL.colors
        });
        this.grid.build();

        this.queue = new FlowQueue(LEVEL.queueCapacity);
        this.queue.seed(this.createInitialQueue());

        this.shooterPool = new ObjectPool(
            () => ShooterFactory.create(),
            (shooter) => {
                shooter.visible = false;
                shooter.userData.ammo = 0;
            },
            12
        );

        this.hud = new PixelFlowHUD({
            onPlay: () => this.startGame(),
            onQueueTap: (index) => this.launchFromQueue(index),
            onDownload: () => window.open('https://www.google.com', '_blank')
        });
        this.hud.build();
        this.refreshHUD('Tap PLAY NOW to begin flow.');
    }

    createInitialQueue() {
        const entries = [];
        for (let index = 0; index < LEVEL.queueCapacity; index += 1) {
            entries.push({
                color: LEVEL.colors[index % LEVEL.colors.length],
                ammo: 3 + (index % 3)
            });
        }
        return entries;
    }

    startGame() {
        if (this.gameState !== 'waiting') {
            return;
        }

        this.gameState = 'playing';
        this.hud.hidePlayOverlay();
        this.timer = new Timer(LEVEL.duration, 'circular', () => this.finish(false));
        this.timer.element.style.top = '16px';
        this.timer.element.style.right = '16px';
        this.timer.element.style.left = 'auto';
        this.timer.element.style.transform = 'none';
        this.timer.element.style.zIndex = '80';

        this.refreshHUD('Tap any queue slot to deploy a pig.');
        this.showQueueTutorial();
    }

    launchFromQueue(index) {
        if (this.gameState !== 'playing') {
            return;
        }

        if (this.activeShooters.length >= LEVEL.maxActiveShooters) {
            this.refreshHUD('Conveyor crowded. Wait for a pig to finish.');
            return;
        }

        const entry = this.queue.popAt(index);
        if (!entry) {
            return;
        }

        if (this.handTutorial) {
            this.stopTutorial();
        }

        const shooter = this.shooterPool.get();
        ShooterFactory.configure(shooter, entry);
        shooter.position.set(-4.7, -1.65, 0.55);
        shooter.visible = true;
        this.scene.add(shooter);

        this.activeShooters.push({
            mesh: shooter,
            color: entry.color,
            ammo: entry.ammo,
            progress: 0,
            fireCooldown: 0
        });

        this.refreshHUD('Flow running...');
    }

    updateActiveShooters(delta) {
        for (let index = this.activeShooters.length - 1; index >= 0; index -= 1) {
            const shooter = this.activeShooters[index];
            shooter.progress += delta * 0.28;
            shooter.fireCooldown = Math.max(0, shooter.fireCooldown - delta);

            const x = -4.7 + shooter.progress * 9.4;
            shooter.mesh.position.x = x;
            shooter.mesh.rotation.y = Math.PI * 0.5;

            if (shooter.ammo > 0 && shooter.fireCooldown <= 0) {
                const hit = this.grid.consumeMatchingCell(shooter.color);
                if (hit) {
                    shooter.ammo -= 1;
                    ShooterFactory.setAmmo(shooter.mesh, shooter.ammo);
                    shooter.fireCooldown = 0.22;
                }
            }

            if (shooter.progress >= 1) {
                this.activeShooters.splice(index, 1);
                this.completeShooterRun(shooter);
            }
        }
    }

    completeShooterRun(shooter) {
        if (shooter.ammo > 0) {
            const added = this.queue.push({ color: shooter.color, ammo: shooter.ammo });
            if (!added) {
                this.finish(false);
            }
        }

        this.shooterPool.release(shooter.mesh);
        this.refreshHUD('Manage queue and matching colors.');
    }

    showQueueTutorial() {
        if (!window.HandTutorial) {
            return;
        }

        const point = this.hud.getQueueButtonCenter(0);
        if (!point) {
            return;
        }

        this.handTutorial = new window.HandTutorial({
            container: document.body,
            renderer: this.renderer,
            camera: this.camera,
            assetUrl: `data:image/svg+xml;utf8,${encodeURIComponent(HAND_ICON_SVG)}`,
            gesture: 'tap',
            from: {
                space: 'screen',
                x: point.x / window.innerWidth,
                y: point.y / window.innerHeight
            },
            size: 108,
            duration: 1.15,
            loop: true,
            zIndex: 70
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

    refreshHUD(statusText) {
        this.hud.setStatus(statusText);
        const queueSnapshot = this.queue.snapshot();
        const queueSignature = queueSnapshot.map((entry) => `${entry.color}:${entry.ammo}`).join('|');
        if (queueSignature !== this.lastQueueSignature) {
            this.hud.setQueue(queueSnapshot, LEVEL.queueCapacity);
            this.lastQueueSignature = queueSignature;
        }
        this.hud.setProgress(this.grid.total - this.grid.remaining, this.grid.total);
    }

    checkEndConditions() {
        if (this.grid.remaining <= 0) {
            this.finish(true);
            return;
        }

        if (this.queue.isEmpty() && this.activeShooters.length === 0 && this.grid.remaining > 0) {
            this.finish(false);
        }
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
        this.hud.setStatus(isWin ? 'Pixel board cleared.' : 'Flow broken. Try another sequence.');
    }

    animate() {
        const delta = this.clock.getDelta();

        if (this.gameState === 'playing') {
            if (this.timer) {
                this.timer.update(delta);
            }
            this.updateActiveShooters(delta);
            this.hud.setProgress(this.grid.total - this.grid.remaining, this.grid.total);
            this.checkEndConditions();
        }

        if (this.handTutorial && this.gameState === 'playing') {
            this.handTutorial.update(performance.now());
        }

        this.renderer.render(this.scene, this.camera);
    }

    bindEvents() {
        window.addEventListener('resize', this.onResize);
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
