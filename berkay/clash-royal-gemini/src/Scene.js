import * as THREE from 'three';
import '../../../reusables/components/HandTutorial.js';
import { Timer } from '../../../reusables/components/Timer.js';
import { UIScene } from '../../../reusables/UIScene/UIScene.js';
import { getRoyalePlayableUIConfig } from '../../../reusables/UIScene/UISceneSettings.js';
import { ObjectPool } from '../../../reusables/components/ObjectPool.js';
import {
    ARENA,
    CAMERA,
    ENEMY_TOWER_COMBAT,
    HAND_CARDS,
    MATCH,
    PROJECTILE,
    TOWER_HP_BAR,
    TOWER_LAYOUT
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

        this.towers = [];
        this.units = [];
        this.projectilePool = null;
        this.flyingProjectiles = [];
        this.elixir = MATCH.elixirInitial;
        this.matchElapsed = 0;
        this.doubleElixirStartsAt = Math.max(0, MATCH.durationSeconds - MATCH.doubleElixirLastSeconds);

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
        const { sizeX, sizeZ, groundColor, riverColor, bridgeColor, riverHalfWidth, bridgePositionsX, bridgeHalfWidth } =
            ARENA;

        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(sizeX + 6, sizeZ + 6),
            new THREE.MeshStandardMaterial({ color: groundColor, roughness: 0.72, metalness: 0.08 })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        const river = new THREE.Mesh(
            new THREE.PlaneGeometry(sizeX + 6, riverHalfWidth * 2),
            new THREE.MeshStandardMaterial({ color: riverColor, roughness: 0.35, metalness: 0.05 })
        );
        river.rotation.x = -Math.PI / 2;
        river.position.y = 0.02;
        this.scene.add(river);

        for (let i = 0; i < bridgePositionsX.length; i += 1) {
            const bx = bridgePositionsX[i];
            const bridge = new THREE.Mesh(
                new THREE.BoxGeometry(bridgeHalfWidth * 2, 0.12, riverHalfWidth * 2 + 0.4),
                new THREE.MeshStandardMaterial({ color: bridgeColor, roughness: 0.8 })
            );
            bridge.position.set(bx, 0.06, 0);
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
            yOffset: def.height * 0.5 + (def.kind === 'king' ? 0.75 : 0.55),
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

    /**
     * CoC-style ballistic: lerp position + sine arc; damage on arrival.
     */
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
            ...getRoyalePlayableUIConfig({
                cardItems,
                elixirMax: MATCH.elixirMax,
                elixirInitial: MATCH.elixirInitial,
                onPrimaryClick: this.onPlayClicked,
                onCardActivate: this.onCardActivate
            })
        });

        this.introOverlay = this.uiScene.getByConfigId('royale-intro');
        this.elixirBar = this.uiScene.getByConfigId('royale-elixir-bar');
        this.cardRail = this.uiScene.getByConfigId('royale-hand');
        this.cardRail?.applyElixirAvailability(this.elixir);
    }

    onPlayClicked() {
        if (this.gameState !== 'waiting') {
            return;
        }
        this.gameState = 'playing';
        this.introOverlay?.hide();

        this.timer = new Timer(MATCH.durationSeconds, 'circular', () => this.finish('time', false));
        this.timer.element.style.top = '12px';
        this.timer.element.style.right = '14px';
        this.timer.element.style.left = 'auto';
        this.timer.element.style.transform = 'none';
        this.timer.element.style.zIndex = '72';

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
        TMP.set(0, 0, 8);
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
        if (Math.abs(x) > ARENA.deployAbsXMax) {
            return false;
        }
        return z >= ARENA.deployZMin && z <= ARENA.deployZMax;
    }

    isSpellDeployOk(x, z) {
        if (Math.abs(x) > ARENA.deployAbsXMax + 1) {
            return false;
        }
        return Math.abs(z) < ARENA.sizeZ * 0.48;
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
        this.spawnTroopsFromCard(card, p.x, p.z);
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

    spawnTroopsFromCard(card, x, z) {
        const n = card.spawnCount || 1;
        const spread = card.spawnSpread || 0;
        for (let i = 0; i < n; i += 1) {
            const ox = (i - (n - 1) * 0.5) * spread;
            this.spawnUnit(card, x + ox, z);
        }
    }

    spawnUnit(card, x, z) {
        const scale = card.meshScale || 0.4;
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(scale, scale * 1.2, scale * 0.65),
            new THREE.MeshStandardMaterial({
                color: card.meshColor || 0x888888,
                roughness: 0.55,
                metalness: 0.1
            })
        );
        mesh.position.set(x, scale * 0.6, z);
        mesh.castShadow = true;
        this.scene.add(mesh);

        const hpSprite = createHpBarSprite({ yOffset: scale * 1.5, scaleX: 0.55, scaleY: 0.1 });
        mesh.add(hpSprite);
        setHpBarRatio(hpSprite, 1);

        const isRanged = (card.range || 0) > 1.5;
        this.units.push({
            mesh,
            team: 'player',
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

    findNearestPlayerUnitInRange(originX, originZ, maxRange) {
        const maxR2 = maxRange * maxRange;
        let best = null;
        let bestD2 = Infinity;
        for (let i = 0; i < this.units.length; i += 1) {
            const u = this.units[i];
            if (!u.alive || u.team !== 'player') {
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

    tickEnemyTowerAttacks(delta) {
        if (this.gameState !== 'playing') {
            return;
        }
        for (let i = 0; i < this.towers.length; i += 1) {
            const tower = this.towers[i];
            if (!tower.alive || tower.team !== 'enemy' || typeof tower.attackRange !== 'number') {
                continue;
            }
            const target = this.findNearestPlayerUnitInRange(tower.x, tower.z, tower.attackRange);
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
            TMP_TO.set(target.mesh.position.x, target.mesh.position.y + 0.22, target.mesh.position.z);
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
        this.refreshElixirUI();
    }

    updateUnits(delta) {
        for (let u = this.units.length - 1; u >= 0; u -= 1) {
            const unit = this.units[u];
            if (!unit.alive) {
                this.scene.remove(unit.mesh);
                this.units.splice(u, 1);
                continue;
            }

            const target = this.findNearestEnemyTower(unit.mesh.position.x, unit.mesh.position.z, unit.team);
            if (!target) {
                continue;
            }

            const ux = unit.mesh.position.x;
            const uz = unit.mesh.position.z;
            const dx = target.x - ux;
            const dz = target.z - uz;
            const dist = Math.sqrt(dx * dx + dz * dz);
            const reach = target.radius + unit.range;

            if (dist <= reach) {
                unit.attackTimer += delta;
                if (unit.attackTimer >= 0.45) {
                    unit.attackTimer = 0;
                    const dmg = unit.dps * 0.45;
                    TMP_FROM.set(ux, unit.muzzleY, uz);
                    TMP_TO.set(target.x, target.mesh.position.y, target.z);
                    const arc = unit.isRanged ? PROJECTILE.archerArc : PROJECTILE.meleeArc;
                    const style = unit.isRanged ? 'ranged' : 'melee';
                    this.queueCombatProjectile(TMP_FROM, TMP_TO, arc, style, () => {
                        if (target.alive) {
                            this.damageTower(target, dmg);
                        }
                    });
                }
                continue;
            }

            const inv = 1 / Math.max(dist, 0.001);
            const step = unit.speed * delta;
            const nx = ux + dx * inv * step;
            const nz = uz + dz * inv * step;
            unit.mesh.position.x = nx;
            unit.mesh.position.z = nz;
            unit.mesh.lookAt(target.x, unit.mesh.position.y, target.z);
        }
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
        const sub = won
            ? 'Enemy King tower destroyed.'
            : reason === 'time'
              ? 'Time is up.'
              : 'Your King tower fell.';
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
            this.updateProjectiles(delta);
            this.updateUnits(delta);
            this.tickEnemyTowerAttacks(delta);
            this.checkVictory();
        }

        if (this.handTutorial && this.gameState === 'playing') {
            this.handTutorial.update(performance.now());
        }

        this.renderer.render(this.scene, this.camera);
    }
}
