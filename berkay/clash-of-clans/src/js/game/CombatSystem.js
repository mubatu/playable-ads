import * as THREE from 'three';
import { aStar } from './AStar.js';
import { BUILDING_SPECS } from './BuildingFactory.js';
import { UnitFactory } from './UnitFactory.js';

const TMP_VEC = new THREE.Vector3();

/**
 * RTS-style combat:
 *  - Units pick the nearest still-alive attackable building, A*-path to a tile adjacent
 *    to its footprint, and attack it. If no path is available, they target the nearest
 *    wall along the way and break through.
 *  - Cannons: direct shot at one unit (`onFire(from, to, target)`).
 *  - Mortars: lobs a shell to the target point; on impact, splash-damages every unit in `blastRadius`.
 */
export class CombatSystem {
    constructor({ grid, level }) {
        this.grid = grid;
        this.level = level;
        this.buildings = [];
        this.units = [];
    }

    addBuilding(building) {
        this.buildings.push(building);
    }

    addUnit(unit) {
        this.units.push(unit);
    }

    coreBuilding() {
        for (let i = 0; i < this.buildings.length; i += 1) {
            if (BUILDING_SPECS[this.buildings[i].type].isCore && this.buildings[i].alive) {
                return this.buildings[i];
            }
        }
        return null;
    }

    aliveAttackableBuildings() {
        const out = [];
        for (let i = 0; i < this.buildings.length; i += 1) {
            const b = this.buildings[i];
            if (b.alive && BUILDING_SPECS[b.type].isAttackable) {
                out.push(b);
            }
        }
        return out;
    }

    aliveCannons() {
        const out = [];
        for (let i = 0; i < this.buildings.length; i += 1) {
            const b = this.buildings[i];
            if (b.alive && b.type === 'cannon') {
                out.push(b);
            }
        }
        return out;
    }

    aliveUnits() {
        const out = [];
        for (let i = 0; i < this.units.length; i += 1) {
            if (this.units[i].alive) {
                out.push(this.units[i]);
            }
        }
        return out;
    }

    nearestBuildingTo(unit) {
        const candidates = [];
        for (let i = 0; i < this.buildings.length; i += 1) {
            const b = this.buildings[i];
            if (!b.alive || !BUILDING_SPECS[b.type].isAttackable || BUILDING_SPECS[b.type].isWall) {
                continue;
            }
            candidates.push(b);
        }
        let best = null;
        let bestD = Infinity;
        for (let i = 0; i < candidates.length; i += 1) {
            const c = candidates[i];
            const d = TMP_VEC.copy(c.center).distanceToSquared(unit.mesh.position);
            if (d < bestD) {
                best = c;
                bestD = d;
            }
        }
        return best;
    }

    nearestWallTo(unit) {
        let best = null;
        let bestD = Infinity;
        for (let i = 0; i < this.buildings.length; i += 1) {
            const b = this.buildings[i];
            if (!b.alive || b.type !== 'wall') {
                continue;
            }
            const d = TMP_VEC.copy(b.center).distanceToSquared(unit.mesh.position);
            if (d < bestD) {
                best = b;
                bestD = d;
            }
        }
        return best;
    }

    planPathToBuilding(unit, building) {
        const startWorld = unit.mesh.position;
        const start = this.grid.worldToGrid(startWorld.x, startWorld.z);
        const goals = this.grid.tilesAdjacentToFootprint(building.c0, building.r0, building.size, building.size);
        if (goals.length === 0) {
            return null;
        }
        return aStar({
            cols: this.grid.cols,
            rows: this.grid.rows,
            start,
            goals,
            isWalkable: (c, r) => this.grid.isWalkable(c, r)
        });
    }

    assignTarget(unit) {
        const ranked = [];
        for (let i = 0; i < this.buildings.length; i += 1) {
            const b = this.buildings[i];
            if (!b.alive || !BUILDING_SPECS[b.type].isAttackable || BUILDING_SPECS[b.type].isWall) {
                continue;
            }
            const d = TMP_VEC.copy(b.center).distanceToSquared(unit.mesh.position);
            ranked.push({ b, d });
        }
        ranked.sort((a, b) => a.d - b.d);

        for (let i = 0; i < ranked.length; i += 1) {
            const building = ranked[i].b;
            const path = this.planPathToBuilding(unit, building);
            if (path !== null) {
                unit.target = building;
                unit.path = path;
                unit.pathIndex = 0;
                return;
            }
        }

        const walls = [];
        for (let i = 0; i < this.buildings.length; i += 1) {
            const b = this.buildings[i];
            if (!b.alive || b.type !== 'wall') {
                continue;
            }
            walls.push({ b, d: TMP_VEC.copy(b.center).distanceToSquared(unit.mesh.position) });
        }
        walls.sort((a, b) => a.d - b.d);
        for (let i = 0; i < walls.length; i += 1) {
            const wall = walls[i].b;
            const wallPath = this.planPathToBuilding(unit, wall);
            if (wallPath !== null) {
                unit.target = wall;
                unit.path = wallPath;
                unit.pathIndex = 0;
                return;
            }
        }

        if (ranked.length > 0) {
            unit.target = ranked[0].b;
            unit.path = [];
            unit.pathIndex = 0;
            return;
        }
        unit.target = null;
        unit.path = null;
    }

    isInAttackRange(unit, building) {
        const spec = UnitFactory.spec(unit.type);
        const g = this.grid.worldToGrid(unit.mesh.position.x, unit.mesh.position.z);
        const adjacent = this.grid.tilesAdjacentToFootprint(
            building.c0,
            building.r0,
            building.size,
            building.size
        );
        for (let i = 0; i < adjacent.length; i += 1) {
            const t = adjacent[i];
            if (t.c === g.c && t.r === g.r) {
                return true;
            }
        }
        const edgeDist = this.grid.distanceXZToFootprintAabb(
            unit.mesh.position.x,
            unit.mesh.position.z,
            building.c0,
            building.r0,
            building.size,
            building.size
        );
        return edgeDist <= spec.attackRange + 0.06;
    }

    damageBuilding(building, dmg, onDeath) {
        building.hp -= dmg;
        if (building.hp <= 0) {
            building.alive = false;
            building.hp = 0;
            this.grid.clearFootprint(building.c0, building.r0, building.size, building.size);
            if (building.mesh) {
                building.mesh.visible = false;
            }
            if (onDeath) {
                onDeath(building);
            }
        }
        building.onHpChanged?.();
    }

    damageUnit(unit, dmg) {
        unit.hp -= dmg;
        const spec = UnitFactory.spec(unit.type);
        UnitFactory.setHp(unit.mesh, unit.hp / spec.hp);
        if (unit.hp <= 0) {
            unit.alive = false;
            unit.hp = 0;
            unit.mesh.visible = false;
        }
    }

    /** Splash damage in XZ around an impact point (mortar shells). */
    damageUnitsInRadius(worldX, worldZ, radius, damage) {
        if (damage <= 0 || radius <= 0) {
            return;
        }
        const r2 = radius * radius;
        for (let i = 0; i < this.units.length; i += 1) {
            const u = this.units[i];
            if (!u.alive) {
                continue;
            }
            const dx = u.mesh.position.x - worldX;
            const dz = u.mesh.position.z - worldZ;
            if (dx * dx + dz * dz <= r2) {
                this.damageUnit(u, damage);
            }
        }
    }

    updateUnits(delta, { onBuildingDeath }) {
        const speed = 1.95;
        for (let i = 0; i < this.units.length; i += 1) {
            const u = this.units[i];
            if (!u.alive) {
                continue;
            }

            if (!u.target || !u.target.alive) {
                this.assignTarget(u);
            }
            if (!u.target) {
                continue;
            }

            const spec = UnitFactory.spec(u.type);
            if (this.isInAttackRange(u, u.target)) {
                u.attackTimer = (u.attackTimer ?? 0) - delta;
                if (u.attackTimer <= 0) {
                    const isWall = u.target.type === 'wall';
                    const dmg = isWall ? spec.damage * spec.wallDamageBonus : spec.damage;
                    this.damageBuilding(u.target, dmg, onBuildingDeath);
                    u.attackTimer = spec.attackInterval;
                }
                continue;
            }

            if (!u.path || u.pathIndex >= u.path.length) {
                this.assignTarget(u);
                if (!u.path || u.path.length === 0) {
                    continue;
                }
            }

            const next = u.path[u.pathIndex];
            if (!this.grid.isWalkable(next.c, next.r)) {
                this.assignTarget(u);
                continue;
            }

            const tgtWorld = this.grid.gridToWorld(next.c, next.r);
            tgtWorld.y = u.mesh.position.y;
            const dir = TMP_VEC.copy(tgtWorld).sub(u.mesh.position);
            const dist = dir.length();
            if (dist < 0.05) {
                u.pathIndex += 1;
                continue;
            }
            dir.normalize();
            u.mesh.position.addScaledVector(dir, Math.min(spec.moveSpeed, dist / Math.max(delta, 1e-4)) * delta);
            u.mesh.lookAt(u.mesh.position.x + dir.x, u.mesh.position.y, u.mesh.position.z + dir.z);
        }
    }

    updateCannons(delta, { onFire }) {
        const cfg = this.level.cannon;
        for (let i = 0; i < this.buildings.length; i += 1) {
            const b = this.buildings[i];
            if (!b.alive || b.type !== 'cannon') {
                continue;
            }
            b.fireTimer = (b.fireTimer ?? 0) - delta;

            let best = null;
            let bestD = cfg.range * cfg.range;
            for (let j = 0; j < this.units.length; j += 1) {
                const u = this.units[j];
                if (!u.alive) {
                    continue;
                }
                const d = TMP_VEC.copy(u.mesh.position).distanceToSquared(b.center);
                if (d <= bestD) {
                    bestD = d;
                    best = u;
                }
            }

            if (!best) {
                continue;
            }

            const dx = best.mesh.position.x - b.center.x;
            const dz = best.mesh.position.z - b.center.z;
            if (b.mesh?.userData.barrel) {
                b.mesh.rotation.y = Math.atan2(dx, dz);
            }

            if (b.fireTimer <= 0) {
                const from = b.center.clone();
                from.y = 0.6;
                const to = best.mesh.position.clone();
                to.y = 0.5;
                onFire(from, to, best);
                b.fireTimer = cfg.fireInterval;
            }
        }
    }

    updateMortars(delta, { onFire }) {
        const cfg = this.level.mortar;
        if (!cfg) {
            return;
        }
        for (let i = 0; i < this.buildings.length; i += 1) {
            const b = this.buildings[i];
            if (!b.alive || b.type !== 'mortar') {
                continue;
            }
            b.fireTimer = (b.fireTimer ?? 0) - delta;

            let best = null;
            let bestD = cfg.range * cfg.range;
            for (let j = 0; j < this.units.length; j += 1) {
                const u = this.units[j];
                if (!u.alive) {
                    continue;
                }
                const d = TMP_VEC.copy(u.mesh.position).distanceToSquared(b.center);
                if (d <= bestD) {
                    bestD = d;
                    best = u;
                }
            }

            if (!best) {
                continue;
            }

            const dx = best.mesh.position.x - b.center.x;
            const dz = best.mesh.position.z - b.center.z;
            if (b.mesh?.userData.barrel) {
                b.mesh.rotation.y = Math.atan2(dx, dz);
            }

            if (b.fireTimer <= 0) {
                const from = b.center.clone();
                from.y = 0.85;
                const to = best.mesh.position.clone();
                to.y = 0.05;
                onFire(from, to);
                b.fireTimer = cfg.fireInterval;
            }
        }
    }
}
