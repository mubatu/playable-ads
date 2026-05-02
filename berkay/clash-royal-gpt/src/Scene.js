import * as THREE from 'three';
import '../../../reusables/components/HandTutorial.js';
import { RiverBridgePathfinder } from '../../../reusables/components/RiverBridgePathfinder.js';
import { Timer } from '../../../reusables/components/Timer.js';
import { UIScene } from '../../../reusables/UIScene/UIScene.js';
import { getClashRoyalGptPlayableUIConfig } from '../../../reusables/UIScene/UISceneSettings.js';
import { ObjectPool } from '../../../reusables/components/ObjectPool.js';
import {
    ARENA,
    CAMERA,
    ENEMY_AI,
    ENEMY_TOWER_COMBAT,
    HAND_CARDS,
    MATCH,
    PLAYER_TOWER_COMBAT,
    PROJECTILE,
    TOWER_HP_BAR,
    TOWER_LAYOUT,
    UNIT_VS_UNIT_REACH
} from './config/arena.js';
import { createHpBarSprite, setHpBarRatio } from './js/HpBarSprite.js';
import { RoyaleProjectileFactory } from './js/RoyaleProjectileFactory.js';
import { createTowerHpBarSprite, setTowerHpBar } from './js/TowerHpBarSprite.js';

const HAND_ICON_SVG = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">',
    '<circle cx="64" cy="64" r="61" fill="#ffffff" fill-opacity="0.08"/>',
    '<path d="M51 106c-10-10-15-23-15-36 0-9 5-15 11-15 5 0 8 3 10 7V30c0-5 4-9 9-9s9 4 9 9v21h2V35c0-5 4-9 9-9s9 4 9 9v20h2V43c0-5 4-9 9-9s9 4 9 9v34c0 24-16 43-41 43H74c-9 0-17-5-23-14z" fill="#ffffff"/>',
    '</svg>'
].join('');

const TMP = new THREE.Vector3();
const TMP_FROM = new THREE.Vector3();
const TMP_TO = new THREE.Vector3();

export class Scene {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.groundPlane = null;
        this.pathfinder = new RiverBridgePathfinder({
            riverZMin: ARENA.riverZMin,
            riverZMax: ARENA.riverZMax,
            bridgeXs: ARENA.bridgeXs
        });

        this.towers = [];
        this.units = [];
        this.projectilePool = null;
        this.flyingProjectiles = [];
        this.elixir = MATCH.elixirInitial;
        this.enemyElixir = MATCH.elixirInitial;
        this.matchElapsed = 0;
        this.doubleElixirStartsAt = Math.max(0, MATCH.durationSeconds - MATCH.doubleElixirLastSeconds);
        this.enemyThinkTimer = 0;
        this.enemyNextThink = ENEMY_AI.minThinkSeconds;
        this.enemyDeployCount = 0;
        this.enemyGiantDeployCount = 0;

        this.gameState = 'waiting';
        this.uiScene = null;
        this.introOverlay = null;
        this.elixirBar = null;
        this.cardRail = null;
        this.timer = null;
        this.handTutorial = null;

        this.selectedCardIndex = 0;

        this.animate = this.animate.bind(this);
        this.onResize = this.onResize.bind(this);
        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPlayClicked = this.onPlayClicked.bind(this);
        this.onCardActivate = this.onCardActivate.bind(this);
    }

    build() {
        this.setupRenderer();
        this.setupLights();
        this.buildArena();
        this.setupProjectilePool();
        this.setupUI();
        this.bindEvents();
        this.renderer.setAnimationLoop(this.animate);
    }

    setupRenderer() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87b8e8);

        this.camera = new THREE.PerspectiveCamera(
            CAMERA.fov,
            window.innerWidth / window.innerHeight,
            0.1,
            500
        );
        this.camera.position.set(CAMERA.position[0], CAMERA.position[1], CAMERA.position[2]);
        this.camera.lookAt(CAMERA.lookAt[0], CAMERA.lookAt[1], CAMERA.lookAt[2]);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);
    }

    setupLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.78);
        this.scene.add(ambient);
        const sun = new THREE.DirectionalLight(0xfff4e0, 1.05);
        sun.position.set(10, 22, 12);
        sun.castShadow = true;
        sun.shadow.mapSize.set(1024, 1024);
        sun.shadow.camera.left = -20;
        sun.shadow.camera.right = 20;
        sun.shadow.camera.top = 20;
        sun.shadow.camera.bottom = -20;
        this.scene.add(sun);
    }

    buildArena() {
        const { sizeX, sizeZ, groundColor, riverColor, bridgeColor, riverZMin, riverZMax, bridgeXs, bridgeHalfWidth, bridgeDepth } =
            ARENA;

        const cx = sizeX * 0.5;
        const cz = sizeZ * 0.5;

        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(sizeX + 1.2, sizeZ + 1.2),
            new THREE.MeshStandardMaterial({ color: groundColor, roughness: 0.72, metalness: 0.08 })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(cx, 0, cz);
        ground.receiveShadow = true;
        this.scene.add(ground);

        const riverH = riverZMax - riverZMin;
        const riverZCenter = (riverZMin + riverZMax) * 0.5;
        const river = new THREE.Mesh(
            new THREE.PlaneGeometry(sizeX + 1.2, riverH),
            new THREE.MeshStandardMaterial({ color: riverColor, roughness: 0.35, metalness: 0.05 })
        );
        river.rotation.x = -Math.PI / 2;
        river.position.set(cx, 0.02, riverZCenter);
        this.scene.add(river);

        for (let i = 0; i < bridgeXs.length; i += 1) {
            const bx = bridgeXs[i];
            const bridge = new THREE.Mesh(
                new THREE.BoxGeometry(bridgeHalfWidth * 2, 0.12, bridgeDepth),
                new THREE.MeshStandardMaterial({ color: bridgeColor, roughness: 0.8 })
            );
            bridge.position.set(bx, 0.06, riverZCenter);
            bridge.castShadow = true;
            bridge.receiveShadow = true;
            this.scene.add(bridge);
        }

        this.groundPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(sizeX * 2, sizeZ * 2),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        this.groundPlane.rotation.x = -Math.PI / 2;
        this.scene.add(this.groundPlane);

        for (let i = 0; i < TOWER_LAYOUT.length; i += 1) {
            this.spawnTower(TOWER_LAYOUT[i]);
        }
    }

    spawnTower(def) {
        const geom = new THREE.CylinderGeometry(def.radius, def.radius * 1.05, def.height, 16);
        const mat = new THREE.MeshStandardMaterial({
            color: def.color,
            roughness: 0.65,
            metalness: 0.12
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(def.x, def.height * 0.5, def.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);

        const hpSprite = createTowerHpBarSprite({
            yOffset: def.height * 0.5 + (def.kind === 'king' ? 0.45 : 0.38),
            scaleX: TOWER_HP_BAR.scaleX,
            scaleY: TOWER_HP_BAR.scaleY
        });
        mesh.add(hpSprite);
        setTowerHpBar(hpSprite, def.hp, def.hp);

        const tower = {
            id: def.id,
            team: def.team,
            kind: def.kind,
            hp: def.hp,
            maxHp: def.hp,
            alive: true,
            mesh,
            x: def.x,
            z: def.z,
            radius: def.radius,
            hpSprite,
            fireY: mesh.position.y + def.height * 0.42,
            attackTimer: 0
        };

        if (def.team === 'enemy' && ENEMY_TOWER_COMBAT[def.kind]) {
            const c = ENEMY_TOWER_COMBAT[def.kind];
            tower.attackRange = c.range;
            tower.attackDps = c.dps;
            tower.attackInterval = c.fireInterval;
        }
        if (def.team === 'player' && PLAYER_TOWER_COMBAT[def.kind]) {
            const c = PLAYER_TOWER_COMBAT[def.kind];
            tower.attackRange = c.range;
            tower.attackDps = c.dps;
            tower.attackInterval = c.fireInterval;
        }

        this.towers.push(tower);
    }

    setupProjectilePool() {
        this.projectilePool = new ObjectPool(
            () => RoyaleProjectileFactory.create(),
            (mesh) => {
                mesh.visible = false;
                if (mesh.parent) {
                    mesh.parent.remove(mesh);
                }
            },
            32
        );
        this.flyingProjectiles = [];
    }

    queueCombatProjectile(from, to, arcHeight, style, onImpact) {
        if (!this.projectilePool) {
            return;
        }
        const mesh = this.projectilePool.get();
        if (style === 'ranged') {
            RoyaleProjectileFactory.styleRanged(mesh);
        } else if (style === 'king') {
            RoyaleProjectileFactory.styleKingBolt(mesh);
        } else if (style === 'tower') {
            RoyaleProjectileFactory.styleEnemyTower(mesh);
        } else {
            RoyaleProjectileFactory.styleMelee(mesh);
        }
        const dist = from.distanceTo(to);
        const duration = Math.max(0.11, dist / PROJECTILE.speed);
        mesh.position.copy(from);
        mesh.visible = true;
        this.scene.add(mesh);
        this.flyingProjectiles.push({
            mesh,
            from: from.clone(),
            to: to.clone(),
            elapsed: 0,
            duration,
            arcHeight,
            onImpact
        });
    }

    updateProjectiles(delta) {
        for (let i = this.flyingProjectiles.length - 1; i >= 0; i -= 1) {
            const p = this.flyingProjectiles[i];
            p.elapsed += delta;
            const a = Math.min(1, p.elapsed / p.duration);
            p.mesh.position.lerpVectors(p.from, p.to, a);
            const arc = p.arcHeight ?? 0.35;
            p.mesh.position.y = p.from.y + (p.to.y - p.from.y) * a + Math.sin(a * Math.PI) * arc;
            if (p.elapsed >= p.duration) {
                if (typeof p.onImpact === 'function') {
                    p.onImpact();
                }
                this.projectilePool.release(p.mesh);
                this.flyingProjectiles.splice(i, 1);
            }
        }
    }

    setupUI() {
        const cardItems = HAND_CARDS.map((c) => ({
            id: c.id,
            title: c.title,
            cost: c.cost,
            accentColor: c.accentColor
        }));

        this.uiScene = new UIScene({
            buttons: [],
            joysticks: [],
            ...getClashRoyalGptPlayableUIConfig({
                cardItems,
                elixirMax: MATCH.elixirMax,
                elixirInitial: MATCH.elixirInitial,
                onPrimaryClick: this.onPlayClicked,
                onCardActivate: this.onCardActivate
            })
        });

        this.introOverlay = this.uiScene.getByConfigId('crgpt-intro');
        this.elixirBar = this.uiScene.getByConfigId('crgpt-elixir-bar');
        this.cardRail = this.uiScene.getByConfigId('crgpt-hand');
        this.cardRail?.applyElixirAvailability(this.elixir);
    }

    onPlayClicked() {
        if (this.gameState !== 'waiting') {
            return;
        }
        this.gameState = 'playing';
        this.introOverlay?.hide();

        this.enemyDeployCount = 0;
        this.enemyGiantDeployCount = 0;

        this.timer = new Timer(MATCH.durationSeconds, 'circular', () => this.finish('time', this.resolveTimeWin()));
        this.timer.element.style.top = '12px';
        this.timer.element.style.right = '14px';
        this.timer.element.style.left = 'auto';
        this.timer.element.style.transform = 'none';
        this.timer.element.style.zIndex = '72';

        this.enemyThinkTimer = 0;
        this.enemyNextThink = ENEMY_AI.minThinkSeconds + Math.random() * (ENEMY_AI.maxThinkSeconds - ENEMY_AI.minThinkSeconds);

        this.showHandTutorial();
    }

    onCardActivate(index) {
        this.selectedCardIndex = index;
    }

    showHandTutorial() {
        if (!window.HandTutorial || !this.cardRail) {
            return;
        }
        const from = this.cardRail.getSlotScreenFraction(0);
        TMP.set(5, 0, 5.5);
        TMP.project(this.camera);
        const to = { space: 'screen', x: TMP.x * 0.5 + 0.5, y: -TMP.y * 0.5 + 0.5 };

        this.handTutorial = new window.HandTutorial({
            container: document.body,
            renderer: this.renderer,
            camera: this.camera,
            assetUrl: `data:image/svg+xml;utf8,${encodeURIComponent(HAND_ICON_SVG)}`,
            gesture: 'drag',
            from: { space: 'screen', x: from.x, y: from.y },
            to,
            duration: 1.35,
            loop: true,
            loopDelay: 0.4,
            size: 108,
            zIndex: 96
        });
        this.handTutorial.play();
    }

    stopHandTutorial() {
        if (this.handTutorial) {
            this.handTutorial.destroy();
            this.handTutorial = null;
        }
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

    screenToGround(clientX, clientY) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        this.pointer.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
        this.raycaster.setFromCamera(this.pointer, this.camera);
        const hits = this.raycaster.intersectObject(this.groundPlane, false);
        if (hits.length === 0) {
            return null;
        }
        return hits[0].point;
    }

    isTroopDeployOk(x, z) {
        if (x < ARENA.deployAbsXMin || x > ARENA.deployAbsXMax) {
            return false;
        }
        return z >= ARENA.deployZMin && z <= ARENA.deployZMax;
    }

    isSpellDeployOk(x, z) {
        return x >= ARENA.deployAbsXMin && x <= ARENA.spellAbsXMax && z >= ARENA.spellZMin && z <= ARENA.spellZMax;
    }

    onPointerDown(event) {
        if (this.gameState !== 'playing') {
            return;
        }
        const p = this.screenToGround(event.clientX, event.clientY);
        if (!p) {
            return;
        }

        const card = HAND_CARDS[this.selectedCardIndex];
        if (!card) {
            return;
        }

        if (card.type === 'spell') {
            if (!this.isSpellDeployOk(p.x, p.z)) {
                return;
            }
            if (this.elixir < card.cost) {
                return;
            }
            this.elixir -= card.cost;
            this.applySpell(card, p.x, p.z);
            this.refreshElixirUI();
            this.stopHandTutorial();
            return;
        }

        if (!this.isTroopDeployOk(p.x, p.z)) {
            return;
        }
        if (this.elixir < card.cost) {
            return;
        }
        this.elixir -= card.cost;
        this.spawnTroopsFromCard(card, p.x, p.z, 'player');
        this.refreshElixirUI();
        this.stopHandTutorial();
    }

    refreshElixirUI() {
        this.elixirBar?.setValue(this.elixir);
        this.cardRail?.applyElixirAvailability(this.elixir);
    }

    applySpell(card, x, z) {
        const r = card.spellRadius;
        const dmg = card.spellDamage;
        const enemyOnly = card.spellEnemyOnly !== false;
        for (let i = 0; i < this.towers.length; i += 1) {
            const t = this.towers[i];
            if (!t.alive) {
                continue;
            }
            if (enemyOnly && t.team !== 'enemy') {
                continue;
            }
            const dx = t.x - x;
            const dz = t.z - z;
            if (dx * dx + dz * dz <= r * r) {
                this.damageTower(t, dmg);
            }
        }
        this.spawnSpellRing(x, z, r);
    }

    spawnSpellRing(x, z, radius) {
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(radius * 0.85, radius, 32),
            new THREE.MeshBasicMaterial({
                color: 0xff5722,
                transparent: true,
                opacity: 0.75,
                side: THREE.DoubleSide
            })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(x, 0.08, z);
        this.scene.add(ring);
        const start = performance.now();
        const dur = 420;
        const step = () => {
            const a = (performance.now() - start) / dur;
            if (a >= 1) {
                this.scene.remove(ring);
                ring.geometry.dispose();
                ring.material.dispose();
                return;
            }
            ring.scale.setScalar(0.6 + a * 0.9);
            ring.material.opacity = 0.75 * (1 - a);
            requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    spawnTroopsFromCard(card, x, z, team) {
        const n = card.spawnCount || 1;
        const spread = card.spawnSpread || 0;
        for (let i = 0; i < n; i += 1) {
            const ox = (i - (n - 1) * 0.5) * spread;
            this.spawnUnit(card, x + ox, z, team);
        }
    }

    spawnUnit(card, x, z, team) {
        const scale = card.meshScale || 0.22;
        const color = team === 'enemy' ? (card.enemyMeshColor || 0x37474f) : (card.meshColor || 0x888888);
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(scale, scale * 1.2, scale * 0.65),
            new THREE.MeshStandardMaterial({
                color,
                roughness: 0.55,
                metalness: 0.1
            })
        );
        mesh.position.set(x, scale * 0.6, z);
        mesh.castShadow = true;
        this.scene.add(mesh);

        const hpSprite = createHpBarSprite({ yOffset: scale * 1.45, scaleX: 0.38, scaleY: 0.075 });
        mesh.add(hpSprite);
        setHpBarRatio(hpSprite, 1);

        const isRanged = (card.range || 0) > 1.2;
        this.units.push({
            mesh,
            team,
            hp: card.hp,
            maxHp: card.hp,
            dps: card.dps,
            speed: card.speed,
            range: card.range,
            alive: true,
            attackTimer: 0,
            hpSprite,
            isRanged,
            muzzleY: mesh.position.y + scale * 0.55
        });
    }

    damageTower(tower, amount) {
        if (!tower.alive) {
            return;
        }
        tower.hp -= amount;
        if (tower.hp <= 0) {
            tower.hp = 0;
            tower.alive = false;
            tower.mesh.visible = false;
            setTowerHpBar(tower.hpSprite, 0, tower.maxHp);
        } else {
            setTowerHpBar(tower.hpSprite, tower.hp, tower.maxHp);
        }
    }

    damageUnit(unit, amount) {
        if (!unit.alive) {
            return;
        }
        unit.hp -= amount;
        if (unit.hp <= 0) {
            unit.hp = 0;
            unit.alive = false;
            unit.mesh.visible = false;
            setHpBarRatio(unit.hpSprite, 0);
        } else {
            setHpBarRatio(unit.hpSprite, unit.hp / unit.maxHp);
        }
    }

    findNearestUnitInRange(originX, originZ, maxRange, targetTeam) {
        const maxR2 = maxRange * maxRange;
        let best = null;
        let bestD2 = Infinity;
        for (let i = 0; i < this.units.length; i += 1) {
            const u = this.units[i];
            if (!u.alive || u.team !== targetTeam) {
                continue;
            }
            const dx = u.mesh.position.x - originX;
            const dz = u.mesh.position.z - originZ;
            const d2 = dx * dx + dz * dz;
            if (d2 <= maxR2 && d2 < bestD2) {
                bestD2 = d2;
                best = u;
            }
        }
        return best;
    }

    tickTowerAttacks(delta) {
        if (this.gameState !== 'playing') {
            return;
        }
        for (let i = 0; i < this.towers.length; i += 1) {
            const tower = this.towers[i];
            if (!tower.alive || typeof tower.attackRange !== 'number') {
                continue;
            }
            const foeTeam = tower.team === 'enemy' ? 'player' : 'enemy';
            const target = this.findNearestUnitInRange(tower.x, tower.z, tower.attackRange, foeTeam);
            if (!target) {
                continue;
            }
            tower.attackTimer += delta;
            if (tower.attackTimer < tower.attackInterval) {
                continue;
            }
            tower.attackTimer = 0;
            const dmg = tower.attackDps * tower.attackInterval;
            TMP_FROM.set(tower.x, tower.fireY, tower.z);
            TMP_TO.set(target.mesh.position.x, target.mesh.position.y + 0.12, target.mesh.position.z);
            const projStyle = tower.kind === 'king' ? 'king' : 'tower';
            this.queueCombatProjectile(TMP_FROM, TMP_TO, PROJECTILE.towerArc, projStyle, () => {
                if (target.alive) {
                    this.damageUnit(target, dmg);
                }
            });
        }
    }

    findNearestEnemyTower(x, z, team) {
        let best = null;
        let bestD = Infinity;
        const enemyTeam = team === 'player' ? 'enemy' : 'player';
        for (let i = 0; i < this.towers.length; i += 1) {
            const t = this.towers[i];
            if (!t.alive || t.team !== enemyTeam) {
                continue;
            }
            const dx = t.x - x;
            const dz = t.z - z;
            const d = dx * dx + dz * dz;
            if (d < bestD) {
                bestD = d;
                best = t;
            }
        }
        return best;
    }

    /**
     * Nearest enemy unit or tower for movement and combat (Clash-style: closest valid target).
     * @returns {{ kind: 'unit'|'tower', ref: object, x: number, z: number, distSq: number }|null}
     */
    findNearestEnemyCombatTarget(x, z, team) {
        const enemyTeam = team === 'player' ? 'enemy' : 'player';
        let best = null;
        let bestD2 = Infinity;

        for (let i = 0; i < this.units.length; i += 1) {
            const u = this.units[i];
            if (!u.alive || u.team !== enemyTeam) {
                continue;
            }
            const px = u.mesh.position.x;
            const pz = u.mesh.position.z;
            const dx = px - x;
            const dz = pz - z;
            const d2 = dx * dx + dz * dz;
            if (d2 < bestD2) {
                bestD2 = d2;
                best = { kind: 'unit', ref: u, x: px, z: pz, distSq: d2 };
            }
        }

        for (let i = 0; i < this.towers.length; i += 1) {
            const t = this.towers[i];
            if (!t.alive || t.team !== enemyTeam) {
                continue;
            }
            const dx = t.x - x;
            const dz = t.z - z;
            const d2 = dx * dx + dz * dz;
            if (d2 < bestD2) {
                bestD2 = d2;
                best = { kind: 'tower', ref: t, x: t.x, z: t.z, distSq: d2 };
            }
        }

        return best;
    }

    tickElixir(delta) {
        if (this.gameState !== 'playing') {
            return;
        }
        this.matchElapsed += delta;
        let rate = MATCH.elixirPerSecond;
        if (this.matchElapsed >= this.doubleElixirStartsAt) {
            rate *= MATCH.doubleElixirMultiplier;
        }
        this.elixir = Math.min(MATCH.elixirMax, this.elixir + rate * delta);
        this.enemyElixir = Math.min(MATCH.elixirMax, this.enemyElixir + rate * delta);
        this.refreshElixirUI();
    }

    countAliveUnits(team) {
        let n = 0;
        for (let i = 0; i < this.units.length; i += 1) {
            if (this.units[i].alive && this.units[i].team === team) {
                n += 1;
            }
        }
        return n;
    }

    tickEnemyAi(delta) {
        if (this.gameState !== 'playing') {
            return;
        }
        const maxDeploys = typeof ENEMY_AI.maxDeploysPerMatch === 'number' ? ENEMY_AI.maxDeploysPerMatch : Infinity;
        const maxConcurrent = typeof ENEMY_AI.maxConcurrentUnits === 'number' ? ENEMY_AI.maxConcurrentUnits : Infinity;
        const maxCardCost = typeof ENEMY_AI.maxCardCost === 'number' ? ENEMY_AI.maxCardCost : 99;
        const giantCap = typeof ENEMY_AI.giantDeploysMax === 'number' ? ENEMY_AI.giantDeploysMax : 0;

        if (this.enemyDeployCount >= maxDeploys) {
            return;
        }
        if (this.countAliveUnits('enemy') >= maxConcurrent) {
            return;
        }

        this.enemyThinkTimer += delta;
        if (this.enemyThinkTimer < this.enemyNextThink) {
            return;
        }
        this.enemyThinkTimer = 0;
        this.enemyNextThink = ENEMY_AI.minThinkSeconds + Math.random() * (ENEMY_AI.maxThinkSeconds - ENEMY_AI.minThinkSeconds);

        const pool = ENEMY_AI.troopIds.map((id) => HAND_CARDS.find((c) => c.id === id)).filter(Boolean);
        const affordable = pool.filter((c) => {
            if (!c || c.type !== 'troop' || c.cost > this.enemyElixir) {
                return false;
            }
            if (c.cost > maxCardCost) {
                return false;
            }
            if (c.id === 'giant' && this.enemyGiantDeployCount >= giantCap) {
                return false;
            }
            return true;
        });
        if (affordable.length === 0) {
            return;
        }
        const card = affordable[Math.floor(Math.random() * affordable.length)];
        this.enemyElixir -= card.cost;
        const x = ENEMY_AI.spawnXMin + Math.random() * (ENEMY_AI.spawnXMax - ENEMY_AI.spawnXMin);
        const z = ENEMY_AI.spawnZMin + Math.random() * (ENEMY_AI.spawnZMax - ENEMY_AI.spawnZMin);
        this.spawnTroopsFromCard(card, x, z, 'enemy');
        this.enemyDeployCount += 1;
        if (card.id === 'giant') {
            this.enemyGiantDeployCount += 1;
        }
    }

    updateUnits(delta) {
        for (let u = this.units.length - 1; u >= 0; u -= 1) {
            const unit = this.units[u];
            if (!unit.alive) {
                this.scene.remove(unit.mesh);
                this.units.splice(u, 1);
                continue;
            }

            const ux = unit.mesh.position.x;
            const uz = unit.mesh.position.z;
            const combat = this.findNearestEnemyCombatTarget(ux, uz, unit.team);
            if (!combat) {
                continue;
            }

            const dist = Math.sqrt(combat.distSq);
            const reach =
                combat.kind === 'tower'
                    ? combat.ref.radius + unit.range
                    : unit.range + UNIT_VS_UNIT_REACH;

            if (dist <= reach) {
                unit.attackTimer += delta;
                if (unit.attackTimer >= 0.45) {
                    unit.attackTimer = 0;
                    const dmg = unit.dps * 0.45;
                    TMP_FROM.set(ux, unit.muzzleY, uz);
                    if (combat.kind === 'tower') {
                        const t = combat.ref;
                        TMP_TO.set(t.x, t.mesh.position.y, t.z);
                        const arc = unit.isRanged ? PROJECTILE.archerArc : PROJECTILE.meleeArc;
                        const style = unit.isRanged ? 'ranged' : 'melee';
                        this.queueCombatProjectile(TMP_FROM, TMP_TO, arc, style, () => {
                            if (t.alive) {
                                this.damageTower(t, dmg);
                            }
                        });
                    } else {
                        const foe = combat.ref;
                        TMP_TO.set(foe.mesh.position.x, foe.mesh.position.y + 0.08, foe.mesh.position.z);
                        const arc = unit.isRanged ? PROJECTILE.archerArc : PROJECTILE.meleeArc;
                        const style = unit.isRanged ? 'ranged' : 'melee';
                        this.queueCombatProjectile(TMP_FROM, TMP_TO, arc, style, () => {
                            if (foe.alive) {
                                this.damageUnit(foe, dmg);
                            }
                        });
                    }
                }
                unit.mesh.lookAt(combat.x, unit.mesh.position.y, combat.z);
                continue;
            }

            const tx = combat.x;
            const tz = combat.z;
            const sub = this.pathfinder.getSubTarget(ux, uz, tx, tz);
            const dx = sub.x - ux;
            const dz = sub.z - uz;
            const moveDist = Math.sqrt(dx * dx + dz * dz);
            const inv = 1 / Math.max(moveDist, 0.001);
            const step = unit.speed * delta;
            unit.mesh.position.x = ux + dx * inv * step;
            unit.mesh.position.z = uz + dz * inv * step;
            unit.mesh.lookAt(sub.x, unit.mesh.position.y, sub.z);
        }
    }

    countDestroyed(team) {
        let n = 0;
        for (let i = 0; i < this.towers.length; i += 1) {
            const t = this.towers[i];
            if (t.team === team && !t.alive) {
                n += 1;
            }
        }
        return n;
    }

    resolveTimeWin() {
        const p = this.countDestroyed('enemy');
        const e = this.countDestroyed('player');
        if (p > e) {
            return true;
        }
        if (e > p) {
            return false;
        }
        return false;
    }

    checkVictory() {
        const ek = this.towers.find((t) => t.id === 'ek');
        const pk = this.towers.find((t) => t.id === 'pk');
        if (ek && !ek.alive) {
            this.finish('king', true);
            return;
        }
        if (pk && !pk.alive) {
            this.finish('king', false);
        }
    }

    finish(reason, won) {
        if (this.gameState === 'ended') {
            return;
        }
        this.gameState = 'ended';
        this.stopHandTutorial();
        if (this.timer) {
            this.timer.destroy();
            this.timer = null;
        }
        const title = won ? 'Victory!' : 'Defeat';
        const sub =
            reason === 'king'
                ? won
                    ? 'Enemy King tower destroyed.'
                    : 'Your King tower fell.'
                : won
                  ? `Time is up. Towers destroyed: ${this.countDestroyed('enemy')} enemy, ${this.countDestroyed('player')} yours.`
                  : `Time is up. Towers destroyed: ${this.countDestroyed('enemy')} enemy, ${this.countDestroyed('player')} yours.`;
        this.introOverlay?.show();
        if (this.introOverlay?.element) {
            const h2 = this.introOverlay.element.querySelector('.rs-ui-intro-overlay__title');
            const p = this.introOverlay.element.querySelector('.rs-ui-intro-overlay__subtitle');
            const btn = this.introOverlay.element.querySelector('.rs-ui-intro-overlay__button');
            if (h2) {
                h2.textContent = title;
            }
            if (p) {
                p.textContent = sub;
            }
            if (btn) {
                btn.textContent = 'CLOSE';
                btn.onclick = () => this.introOverlay?.hide();
            }
        }
    }

    animate() {
        const delta = this.clock.getDelta();

        if (this.gameState === 'playing') {
            if (this.timer) {
                this.timer.update(delta);
            }
            this.tickElixir(delta);
            this.tickEnemyAi(delta);
            this.updateProjectiles(delta);
            this.updateUnits(delta);
            this.tickTowerAttacks(delta);
            this.checkVictory();
        }

        if (this.handTutorial && this.gameState === 'playing') {
            this.handTutorial.update(performance.now());
        }

        this.renderer.render(this.scene, this.camera);
    }
}
