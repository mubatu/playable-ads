import * as THREE from 'three';
import '../../../resuables/components/HandTutorial.js';
import { ObjectPool } from '../../../resuables/components/ObjectPool.js';
import { PixelGrid } from './game/PixelGrid.js';
import { ShooterFactory } from './game/ShooterFactory.js';
import { SquarePath } from './game/SquarePath.js';
import { QueueLanes } from './game/QueueLanes.js';
import { ShooterBucket } from './game/ShooterBucket.js';
import { BulletFactory } from './game/BulletFactory.js';
import { PixelFlowHUD } from './ui/PixelFlowHUD.js';
import { DEFAULT_LEVEL } from './levels/defaultLevel.js';
import { buildInitialQueues, countPixelsByColorIndex } from './levels/buildInitialQueues.js';

const HAND_ICON_SVG = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">',
    '<circle cx="64" cy="64" r="61" fill="#ffffff" fill-opacity="0.08"/>',
    '<path d="M51 106c-10-10-15-23-15-36 0-9 5-15 11-15 5 0 8 3 10 7V30c0-5 4-9 9-9s9 4 9 9v21h2V35c0-5 4-9 9-9s9 4 9 9v20h2V43c0-5 4-9 9-9s9 4 9 9v34c0 24-16 43-41 43H74c-9 0-17-5-23-14z" fill="#ffffff"/>',
    '</svg>'
].join('');

export class Scene {
    constructor(level = DEFAULT_LEVEL) {
        this.level = level;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();

        this.grid = null;
        this.path = null;
        this.queueLanes = null;
        this.bucket = null;
        this.shooterPool = null;
        this.bulletPool = null;
        this.activeShooters = [];
        this.flyingBullets = [];

        this.hud = null;
        this.handTutorial = null;
        this.gameState = 'waiting';

        this.lastLaneSig = '';
        this.lastBucketSig = '';

        this.animate = this.animate.bind(this);
        this.onResize = this.onResize.bind(this);
    }

    build() {
        this.setupRenderer();
        this.setupWorld();
        this.setupGridAndPath();
        this.setupQueues();
        this.setupPools();
        this.setupHUD();
        this.bindEvents();
        this.renderer.setAnimationLoop(this.animate);
    }

    setupRenderer() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0b1528);

        this.camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 5.4, 6.2);
        this.camera.lookAt(0, 0.25, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        document.body.style.margin = '0';
        document.body.style.overflow = 'hidden';
        document.body.appendChild(this.renderer.domElement);
    }

    setupWorld() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.95);
        this.scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xe3ecff, 1.05);
        sun.position.set(-5, 12, 8);
        this.scene.add(sun);

        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(40, 40),
            new THREE.MeshStandardMaterial({ color: 0x1a2d4a, roughness: 0.92 })
        );
        ground.rotation.x = -Math.PI * 0.5;
        ground.position.y = -0.02;
        this.scene.add(ground);
    }

    setupGridAndPath() {
        this.grid = new PixelGrid(this.scene, {
            rows: this.level.rows,
            cols: this.level.cols,
            cellSize: this.level.cellSize,
            colors: this.level.colors,
            gridColorIndices: this.level.gridColorIndices
        });
        this.grid.build();

        const b = this.grid.getBounds();
        this.path = new SquarePath(b, this.level.pathPadding);
    }

    setupQueues() {
        const built =
            Array.isArray(this.level.lanes) && this.level.lanes.length > 0
                ? this.level.lanes.map((lane) => lane.map((e) => ({ ...e })))
                : buildInitialQueues(this.level);

        const laneData = built.map((lane) =>
            lane.map((e) => ({
                color: this.level.colors[e.colorIndex % this.level.colors.length],
                ammo: e.ammo
            }))
        );
        this.queueLanes = new QueueLanes(laneData);
        this.bucket = new ShooterBucket(this.level.bucketCapacity);
        this.verifyAmmoMatchesPixels(built);
    }

    verifyAmmoMatchesPixels(builtLanes) {
        const numColors = this.level.colors.length;
        const pixels = countPixelsByColorIndex(this.level.gridColorIndices, numColors);
        const ammo = Array(numColors).fill(0);
        for (let L = 0; L < builtLanes.length; L += 1) {
            const lane = builtLanes[L];
            for (let i = 0; i < lane.length; i += 1) {
                const e = lane[i];
                ammo[e.colorIndex % numColors] += e.ammo;
            }
        }
        for (let c = 0; c < numColors; c += 1) {
            if (ammo[c] !== pixels[c]) {
                console.warn('[PixelFlow] ammo vs pixels mismatch', { colorIndex: c, ammo: ammo[c], pixels: pixels[c] });
            }
        }
    }

    setupPools() {
        this.shooterPool = new ObjectPool(
            () => ShooterFactory.create(),
            (shooter) => {
                shooter.visible = false;
                shooter.userData.ammo = 0;
                if (shooter.parent) {
                    shooter.parent.remove(shooter);
                }
            },
            16
        );
        this.bulletPool = new ObjectPool(
            () => BulletFactory.create(),
            (mesh) => {
                mesh.visible = false;
                if (mesh.parent) {
                    mesh.parent.remove(mesh);
                }
            },
            40
        );
    }

    setupHUD() {
        this.hud = new PixelFlowHUD({
            onPlay: () => this.startGame(),
            onQueueFrontTap: (lane) => this.deployFromLane(lane),
            onBucketTap: (slot) => this.deployFromBucket(slot),
            onDownload: () => window.open('https://www.google.com', '_blank')
        });
        this.hud.build({
            laneCount: this.level.laneCount,
            maxLaneDepth: this.level.maxLaneDepth,
            bucketCapacity: this.level.bucketCapacity
        });
        this.syncUI(true);
        this.hud.setStatus(
            'Tap PLAY NOW. Queue: front pig only. Bucket: tap any pig. Max ' +
                (this.level.maxPathShooters ?? 5) +
                ' on the path.'
        );
    }

    startGame() {
        if (this.gameState !== 'waiting') {
            return;
        }
        this.gameState = 'playing';
        this.hud.hidePlayOverlay();
        this.syncUI(true);
        this.hud.setStatus('Clear edge pixels first — shots stop on the first blocking color.');
        this.showTutorial();
    }

    deployFromLane(laneIndex) {
        if (this.gameState !== 'playing') {
            return;
        }
        const cap = this.level.maxPathShooters ?? 5;
        if (this.activeShooters.length >= cap) {
            this.hud.setStatus(`Path full (${cap} max). Wait for a pig to finish a lap or run out of ammo.`);
            return;
        }
        const entry = this.queueLanes.popFront(laneIndex);
        if (!entry) {
            return;
        }
        this.stopTutorial();
        this.spawnRunner(entry);
        this.syncUI(true);
    }

    deployFromBucket(slotIndex) {
        if (this.gameState !== 'playing') {
            return;
        }
        const cap = this.level.maxPathShooters ?? 5;
        if (this.activeShooters.length >= cap) {
            this.hud.setStatus(`Path full (${cap} max). Wait before launching from the bucket.`);
            return;
        }
        const entry = this.bucket.takeAt(slotIndex);
        if (!entry) {
            return;
        }
        this.stopTutorial();
        this.spawnRunner(entry);
        this.syncUI(true);
    }

    spawnRunner(entry) {
        const mesh = this.shooterPool.get();
        ShooterFactory.configure(mesh, entry);
        const py = this.level.pathY;
        mesh.position.set(0, py, 0);
        this.scene.add(mesh);
        this.activeShooters.push({
            mesh,
            color: entry.color,
            ammo: entry.ammo,
            t: 0,
            fireCooldown: 0
        });
    }

    completeLap(run) {
        const idx = this.activeShooters.indexOf(run);
        if (idx !== -1) {
            this.activeShooters.splice(idx, 1);
        }
        if (run.ammo > 0) {
            if (!this.bucket.tryAdd({ color: run.color, ammo: run.ammo })) {
                this.finish(false);
            }
        }
        this.shooterPool.release(run.mesh);
    }

    despawnRunner(run) {
        const idx = this.activeShooters.indexOf(run);
        if (idx !== -1) {
            this.activeShooters.splice(idx, 1);
        }
        this.shooterPool.release(run.mesh);
    }

    spawnBullet(from, to, color) {
        const mesh = this.bulletPool.get();
        BulletFactory.setColor(mesh, color);
        mesh.position.copy(from);
        mesh.visible = true;
        this.scene.add(mesh);
        this.flyingBullets.push({
            mesh,
            from: from.clone(),
            to: to.clone(),
            elapsed: 0,
            duration: 0.12
        });
    }

    updateBullets(delta) {
        for (let i = this.flyingBullets.length - 1; i >= 0; i -= 1) {
            const b = this.flyingBullets[i];
            b.elapsed += delta;
            const a = Math.min(1, b.elapsed / b.duration);
            b.mesh.position.lerpVectors(b.from, b.to, a);
            if (b.elapsed >= b.duration) {
                this.bulletPool.release(b.mesh);
                this.flyingBullets.splice(i, 1);
            }
        }
    }

    updateRunners(delta) {
        const speed = this.level.pathSpeed;
        const perim = this.path.perimeter;

        for (let i = this.activeShooters.length - 1; i >= 0; i -= 1) {
            const run = this.activeShooters[i];
            run.t += (speed * delta) / perim;
            if (run.t >= 1) {
                this.completeLap(run);
                continue;
            }

            const st = this.path.sample(run.t);
            const py = this.level.pathY;
            run.mesh.position.set(st.x, py, st.z);
            run.mesh.lookAt(0, py, 0);

            run.fireCooldown -= delta;

            if (run.ammo > 0 && run.fireCooldown <= 0) {
                const hit = this.grid.tryShootFromSide(st.side, st.x, st.z, run.color);
                if (hit) {
                    run.ammo -= 1;
                    ShooterFactory.setAmmo(run.mesh, run.ammo);
                    run.fireCooldown = 0.22;
                    const muzzle = new THREE.Vector3(st.x, py + 0.12, st.z);
                    this.spawnBullet(muzzle, hit.worldHit, run.color);
                }
            }

            if (run.ammo <= 0) {
                this.despawnRunner(run);
            }
        }
    }

    syncUI(force) {
        const laneSnap = this.queueLanes.snapshot();
        const laneSig = laneSnap.map((l) => l.map((e) => `${e.color}:${e.ammo}`).join(',')).join('|');
        if (force || laneSig !== this.lastLaneSig) {
            this.lastLaneSig = laneSig;
            this.hud.updateLanes(laneSnap);
        }

        const bucketSnap = this.bucket.snapshot();
        const bucketSig = bucketSnap.map((e) => (e ? `${e.color}:${e.ammo}` : '-')).join('|');
        if (force || bucketSig !== this.lastBucketSig) {
            this.lastBucketSig = bucketSig;
            this.hud.updateBucket(bucketSnap);
        }

        this.hud.setProgress(this.grid.total - this.grid.remaining, this.grid.total);
    }

    checkEnd() {
        if (this.grid.remaining <= 0) {
            this.finish(true);
            return;
        }
        if (
            this.queueLanes.isEveryLaneEmpty() &&
            this.activeShooters.length === 0 &&
            this.bucket.countFilled() === 0 &&
            this.grid.remaining > 0
        ) {
            this.finish(false);
        }
    }

    finish(isWin) {
        if (this.gameState === 'ended') {
            return;
        }
        this.gameState = 'ended';
        this.stopTutorial();
        this.hud.showEnd(isWin);
        this.hud.setStatus(
            isWin ? 'Board cleared.' : 'Bucket overflow or no moves left.'
        );
    }

    showTutorial() {
        if (!window.HandTutorial) {
            return;
        }
        requestAnimationFrame(() => {
            let point = null;
            for (let lane = 0; lane < this.level.laneCount; lane += 1) {
                if (this.queueLanes.peekFront(lane)) {
                    point = this.hud.getFrontSlotCenter(lane);
                    if (point) {
                        break;
                    }
                }
            }
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
                size: 100,
                duration: 1.05,
                loop: true,
                zIndex: 70
            });
            this.handTutorial.play();
        });
    }

    stopTutorial() {
        if (!this.handTutorial) {
            return;
        }
        this.handTutorial.destroy();
        this.handTutorial = null;
    }

    animate() {
        const delta = this.clock.getDelta();

        if (this.gameState === 'playing') {
            this.updateRunners(delta);
            this.updateBullets(delta);
            this.syncUI(false);
            this.checkEnd();
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
