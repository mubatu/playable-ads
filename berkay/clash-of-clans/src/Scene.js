import * as THREE from 'three';
import '../../../reusables/components/HandTutorial.js';
import { Timer } from '../../../reusables/components/Timer.js';
import { ObjectPool } from '../../../reusables/components/ObjectPool.js';
import { Grid } from './game/Grid.js';
import { BuildingFactory, BUILDING_SPECS } from './game/BuildingFactory.js';
import { UnitFactory } from './game/UnitFactory.js';
import { ProjectileFactory } from './game/ProjectileFactory.js';
import { CombatSystem } from './game/CombatSystem.js';
import { UIScene } from '../../../reusables/UIScene/UIScene.js';
import { getCocPlayableUIConfig } from '../../../reusables/UIScene/UISceneSettings.js';
import { CocHUD } from './ui/CocHUD.js';
import { DEFAULT_LEVEL } from './levels/defaultLevel.js';
import { createHpBarSprite, setHpBarRatio } from './game/HpBarSprite.js';

const HAND_ICON_SVG = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">',
    '<circle cx="64" cy="64" r="61" fill="#ffffff" fill-opacity="0.08"/>',
    '<path d="M51 106c-10-10-15-23-15-36 0-9 5-15 11-15 5 0 8 3 10 7V30c0-5 4-9 9-9s9 4 9 9v21h2V35c0-5 4-9 9-9s9 4 9 9v20h2V43c0-5 4-9 9-9s9 4 9 9v34c0 24-16 43-41 43H74c-9 0-17-5-23-14z" fill="#ffffff"/>',
    '</svg>'
].join('');

const TMP_VEC = new THREE.Vector3();

export class Scene {
    constructor(level = DEFAULT_LEVEL) {
        this.level = level;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.groundPlane = null;

        this.grid = null;
        this.combat = null;
        this.unitPool = null;
        this.projectilePool = null;
        this.flyingProjectiles = [];
        this.handTutorial = null;
        this.hud = null;
        this.uiScene = null;
        this.introOverlay = null;
        this.deployBadge = null;
        this.timer = null;
        this.onCocPlayClicked = this.onCocPlayClicked.bind(this);

        this.gameState = 'waiting';
        this.gold = 1500;
        this.elixir = 1500;
        this.barbariansLeft = level.barbarianStock;

        this.animate = this.animate.bind(this);
        this.onResize = this.onResize.bind(this);
        this.onPointerDown = this.onPointerDown.bind(this);
    }

    build() {
        this.setupRenderer();
        this.setupWorld();
        this.setupGrid();
        this.setupBase();
        this.setupPools();
        this.setupHUD();
        this.bindEvents();
        this.renderer.setAnimationLoop(this.animate);
    }

    setupRenderer() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x97c97c);

        this.camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(9, 13, 13);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.style.margin = '0';
        document.body.style.overflow = 'hidden';
        document.body.appendChild(this.renderer.domElement);
    }

    setupWorld() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.65);
        this.scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xfff4d4, 1.0);
        sun.position.set(10, 20, 10);
        sun.castShadow = true;
        sun.shadow.mapSize.set(1024, 1024);
        sun.shadow.camera.left = -12;
        sun.shadow.camera.right = 12;
        sun.shadow.camera.top = 12;
        sun.shadow.camera.bottom = -12;
        this.scene.add(sun);

        const groundSize = Math.max(this.level.cols, this.level.rows) * this.level.tileSize + 4;
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(groundSize, groundSize),
            new THREE.MeshStandardMaterial({ color: 0x6fa251, roughness: 0.95 })
        );
        ground.rotation.x = -Math.PI * 0.5;
        ground.receiveShadow = true;
        this.scene.add(ground);

        const grid = new THREE.GridHelper(this.level.cols * this.level.tileSize, this.level.cols, 0x4d7838, 0x4d7838);
        grid.material.opacity = 0.32;
        grid.material.transparent = true;
        grid.position.y = 0.01;
        this.scene.add(grid);

        this.groundPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(groundSize * 4, groundSize * 4),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        this.groundPlane.rotation.x = -Math.PI * 0.5;
        this.scene.add(this.groundPlane);
    }

    setupGrid() {
        this.grid = new Grid({
            cols: this.level.cols,
            rows: this.level.rows,
            tileSize: this.level.tileSize
        });
    }

    setupBase() {
        this.combat = new CombatSystem({ grid: this.grid, level: this.level });

        const placeBuilding = (type, c, r) => {
            const spec = BUILDING_SPECS[type];
            const ok = this.grid.placeFootprint(c, r, spec.size, spec.size, type);
            if (!ok) {
                console.warn('[CoC] could not place', type, c, r);
                return null;
            }
            const mesh = BuildingFactory.create(type, this.level.tileSize);
            mesh.castShadow = true;
            mesh.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            const center = this.grid.footprintCenter(c, r, spec.size, spec.size);
            mesh.position.copy(center);
            this.scene.add(mesh);

            const building = {
                type,
                size: spec.size,
                c0: c,
                r0: r,
                center,
                mesh,
                hp: spec.hp,
                maxHp: spec.hp,
                alive: true,
                fireTimer: 0
            };
            if (spec.isAttackable) {
                const barY = spec.hpBarY ?? spec.size * 0.45 + 0.5;
                const hpSprite = createHpBarSprite({
                    yOffset: barY,
                    scaleX: Math.min(1.35, 0.55 + spec.size * 0.22),
                    scaleY: 0.15
                });
                mesh.add(hpSprite);
                building.onHpChanged = () => {
                    const ratio = building.maxHp > 0 ? Math.max(0, building.hp / building.maxHp) : 0;
                    setHpBarRatio(hpSprite, ratio);
                };
                setHpBarRatio(hpSprite, 1);
            }
            this.combat.addBuilding(building);
            return building;
        };

        for (let i = 0; i < this.level.buildings.length; i += 1) {
            const def = this.level.buildings[i];
            placeBuilding(def.type, def.c, def.r);
        }
        for (let i = 0; i < this.level.walls.length; i += 1) {
            const def = this.level.walls[i];
            placeBuilding('wall', def.c, def.r);
        }
    }

    setupPools() {
        this.unitPool = new ObjectPool(
            () => UnitFactory.create('barbarian'),
            (mesh) => {
                mesh.visible = false;
                if (mesh.parent) {
                    mesh.parent.remove(mesh);
                }
            },
            this.level.barbarianStock + 4
        );
        this.projectilePool = new ObjectPool(
            () => ProjectileFactory.create(),
            (mesh) => {
                mesh.visible = false;
                ProjectileFactory.styleCannonRound(mesh);
                if (mesh.parent) {
                    mesh.parent.remove(mesh);
                }
            },
            20
        );
    }

    setupHUD() {
        this.uiScene = new UIScene({
            buttons: [],
            joysticks: [],
            ...getCocPlayableUIConfig(this.level.barbarianStock)
        });
        this.introOverlay = this.uiScene.getByConfigId('coc-intro');
        this.deployBadge = this.uiScene.getByConfigId('coc-deploy-badge');
        window.addEventListener('coc-play-clicked', this.onCocPlayClicked);

        this.hud = new CocHUD({
            onDownload: () => window.open('https://www.google.com', '_blank')
        });
        this.hud.build();
        this.hud.setResources({ gold: this.gold, elixir: this.elixir });
        this.syncDeployBadgeCount();
        this.hud.setStatus('Tap PLAY NOW to attack the base.');
    }

    onCocPlayClicked() {
        this.startGame();
    }

    syncDeployBadgeCount() {
        this.deployBadge?.setCount(this.barbariansLeft, this.level.barbarianStock);
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

    /**
     * Picks the walkable perimeter tile whose center is closest to the hit point.
     * Plain round-to-cell often maps border clicks to the first *interior* column (e.g. c=1),
     * which then fails the old perimeter check even though the player aimed at the edge.
     */
    pickWalkablePerimeterDeployCell(worldX, worldZ) {
        const ts = this.grid.tileSize;
        const maxDist = ts * 1.65;
        const maxD2 = maxDist * maxDist;
        let bestC = -1;
        let bestR = -1;
        let bestD2 = Infinity;
        const perimeter = this.grid.perimeterCells();
        for (let i = 0; i < perimeter.length; i += 1) {
            const { c, r } = perimeter[i];
            if (!this.grid.isWalkable(c, r)) {
                continue;
            }
            TMP_VEC.copy(this.grid.gridToWorld(c, r));
            const dx = worldX - TMP_VEC.x;
            const dz = worldZ - TMP_VEC.z;
            const d2 = dx * dx + dz * dz;
            if (d2 < bestD2) {
                bestD2 = d2;
                bestC = c;
                bestR = r;
            }
        }
        if (bestC < 0 || bestD2 > maxD2) {
            return null;
        }
        return { c: bestC, r: bestR };
    }

    onPointerDown(event) {
        if (this.gameState !== 'playing' || this.barbariansLeft <= 0) {
            return;
        }

        const rect = this.renderer.domElement.getBoundingClientRect();
        this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
        this.raycaster.setFromCamera(this.pointer, this.camera);
        const hits = this.raycaster.intersectObject(this.groundPlane, false);
        if (hits.length === 0) {
            return;
        }
        const point = hits[0].point;
        const picked = this.pickWalkablePerimeterDeployCell(point.x, point.z);
        if (!picked) {
            let anyOpen = false;
            const perimeter = this.grid.perimeterCells();
            for (let i = 0; i < perimeter.length; i += 1) {
                const { c, r } = perimeter[i];
                if (this.grid.isWalkable(c, r)) {
                    anyOpen = true;
                    break;
                }
            }
            this.hud.setStatus(
                anyOpen
                    ? 'Tap closer to the green border strip to deploy there.'
                    : 'No open border tiles — all edge cells are blocked.'
            );
            return;
        }
        this.spawnBarbarian(picked.c, picked.r);
    }

    spawnBarbarian(c, r) {
        if (this.barbariansLeft <= 0) {
            return;
        }
        const mesh = this.unitPool.get();
        const spec = UnitFactory.spec('barbarian');
        const world = this.grid.gridToWorld(c, r);
        mesh.position.set(world.x, 0, world.z);
        mesh.visible = true;
        UnitFactory.setHp(mesh, 1);
        this.scene.add(mesh);

        const unit = {
            type: 'barbarian',
            mesh,
            hp: spec.hp,
            alive: true,
            target: null,
            path: null,
            pathIndex: 0,
            attackTimer: 0
        };
        this.combat.addUnit(unit);

        this.barbariansLeft -= 1;
        this.syncDeployBadgeCount();
        this.elixir = Math.max(0, this.elixir - 25);
        this.hud.setResources({ gold: this.gold, elixir: this.elixir });

        if (this.handTutorial) {
            this.stopTutorial();
        }
    }

    startGame() {
        if (this.gameState !== 'waiting') {
            return;
        }
        this.gameState = 'playing';
        this.introOverlay?.hide();
        this.hud.setStatus('Tap any outer edge tile to deploy a Barbarian. Destroy the Town Hall!');

        this.timer = new Timer(this.level.durationSeconds, 'circular', () => this.finish(false, 'Time expired.'));
        this.timer.element.style.top = '12px';
        this.timer.element.style.right = '14px';
        this.timer.element.style.left = 'auto';
        this.timer.element.style.transform = 'none';
        this.timer.element.style.zIndex = '40';

        this.showTutorial();
    }

    showTutorial() {
        if (!window.HandTutorial) {
            return;
        }
        const candidates = this.grid.perimeterCells().filter((cell) => this.grid.isWalkable(cell.c, cell.r));
        if (candidates.length === 0) {
            return;
        }
        const target = candidates[Math.floor(candidates.length / 2)];
        const world = this.grid.gridToWorld(target.c, target.r);
        TMP_VEC.copy(world).project(this.camera);
        const fromX = TMP_VEC.x * 0.5 + 0.5;
        const fromY = -TMP_VEC.y * 0.5 + 0.5;

        this.handTutorial = new window.HandTutorial({
            container: document.body,
            renderer: this.renderer,
            camera: this.camera,
            assetUrl: `data:image/svg+xml;utf8,${encodeURIComponent(HAND_ICON_SVG)}`,
            gesture: 'tap',
            from: { space: 'screen', x: fromX, y: fromY },
            size: 110,
            duration: 1.05,
            loop: true,
            zIndex: 28
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

    spawnCannonProjectile(from, to, target) {
        const cfg = this.level.cannon;
        const mesh = this.projectilePool.get();
        ProjectileFactory.styleCannonRound(mesh);
        mesh.position.copy(from);
        mesh.visible = true;
        this.scene.add(mesh);
        this.flyingProjectiles.push({
            mesh,
            from: from.clone(),
            to: to.clone(),
            elapsed: 0,
            duration: Math.max(0.18, from.distanceTo(to) / cfg.projectileSpeed),
            kind: 'cannon',
            target,
            arcHeight: 0.6
        });
    }

    spawnMortarProjectile(from, to) {
        const cfg = this.level.mortar;
        if (!cfg) {
            return;
        }
        const mesh = this.projectilePool.get();
        ProjectileFactory.styleMortarRound(mesh);
        mesh.position.copy(from);
        mesh.visible = true;
        this.scene.add(mesh);
        this.flyingProjectiles.push({
            mesh,
            from: from.clone(),
            to: to.clone(),
            elapsed: 0,
            duration: Math.max(0.28, from.distanceTo(to) / cfg.projectileSpeed),
            kind: 'mortar',
            blastRadius: cfg.blastRadius,
            damage: cfg.damage,
            arcHeight: 1.2
        });
    }

    updateProjectiles(delta) {
        for (let i = this.flyingProjectiles.length - 1; i >= 0; i -= 1) {
            const p = this.flyingProjectiles[i];
            p.elapsed += delta;
            const a = Math.min(1, p.elapsed / p.duration);
            p.mesh.position.lerpVectors(p.from, p.to, a);
            const arc = p.arcHeight ?? 0.6;
            p.mesh.position.y = p.from.y + (p.to.y - p.from.y) * a + Math.sin(a * Math.PI) * arc;
            if (p.elapsed >= p.duration) {
                if (p.kind === 'mortar') {
                    this.combat.damageUnitsInRadius(p.to.x, p.to.z, p.blastRadius, p.damage);
                } else if (p.target && p.target.alive) {
                    this.combat.damageUnit(p.target, this.level.cannon.damage);
                }
                this.projectilePool.release(p.mesh);
                this.flyingProjectiles.splice(i, 1);
            }
        }
    }

    refreshHUDFromCombat(elapsed) {
        const total = this.level.durationSeconds;
        const remaining = Math.max(0, Math.ceil(total - elapsed));
        const aliveUnits = this.combat.aliveUnits().length;
        this.hud.setStatus(
            `Time: ${remaining}s | Barbs out: ${aliveUnits} | Stock: ${this.barbariansLeft} | Town Hall: ${this.formatHpForCore()}`
        );
    }

    formatHpForCore() {
        const core = this.combat.coreBuilding();
        if (!core) {
            return 'destroyed';
        }
        const ratio = Math.max(0, core.hp / core.maxHp);
        const pct = Math.round(ratio * 100);
        return `${pct}%`;
    }

    checkEnd() {
        const core = this.combat.coreBuilding();
        if (!core) {
            this.finish(true, 'Town Hall destroyed.');
            return;
        }
        if (this.barbariansLeft <= 0 && this.combat.aliveUnits().length === 0 && core.alive) {
            this.finish(false, 'Out of Barbarians.');
        }
    }

    finish(isWin, subtitle) {
        if (this.gameState === 'ended') {
            return;
        }
        this.gameState = 'ended';
        this.stopTutorial();
        if (this.timer) {
            this.timer.destroy();
            this.timer = null;
        }
        this.hud.showEnd(isWin, subtitle);
        this.hud.setStatus(isWin ? 'Victory! The base has fallen.' : 'Defeat. The base survived.');
    }

    animate() {
        const delta = this.clock.getDelta();
        if (this.gameState === 'playing') {
            if (this.timer) {
                this.timer.update(delta);
            }
            this.combat.updateUnits(delta, {
                onBuildingDeath: (b) => {
                    if (b.type === 'goldStorage') {
                        this.gold += 350;
                        this.hud.setResources({ gold: this.gold, elixir: this.elixir });
                    } else if (b.type === 'elixirStorage') {
                        this.elixir += 350;
                        this.hud.setResources({ gold: this.gold, elixir: this.elixir });
                    }
                }
            });
            this.combat.updateCannons(delta, {
                onFire: (from, to, target) => this.spawnCannonProjectile(from, to, target)
            });
            this.combat.updateMortars(delta, {
                onFire: (from, to) => this.spawnMortarProjectile(from, to)
            });
            this.updateProjectiles(delta);
            const elapsed = this.timer ? this.level.durationSeconds - this.timer.timeRemaining : 0;
            this.refreshHUDFromCombat(elapsed);
            this.checkEnd();
        }

        if (this.handTutorial && this.gameState === 'playing') {
            this.handTutorial.update(performance.now());
        }

        this.renderer.render(this.scene, this.camera);
    }
}
