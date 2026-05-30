import { Mesh, PlaneGeometry, MeshBasicMaterial } from 'three';

var TEXTURE_BY_TYPE = {
    smallFish: 'smallFish',
    mediumFish: 'mediumFish',
    bigFish: 'bigFish',
    coin: 'coin',
    mine: 'mine',
    jellyfish: 'jellyfish'
};

var SWIMMERS = { smallFish: true, mediumFish: true, bigFish: true };

export function createEntity(state, type) {
    var cfg = state.config.entities[type];
    var texture = state.textures[TEXTURE_BY_TYPE[type]];
    var visual = cfg.radius * 2.2;

    var geo = new PlaneGeometry(visual, visual);
    var mat = new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
    var mesh = new Mesh(geo, mat);
    mesh.position.z = 0;

    var entity = {
        type: type,
        mesh: mesh,
        material: mat,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: cfg.radius,
        baseScale: visual,
        score: cfg.score || 0,
        hunger: cfg.hunger || 0,
        tier: cfg.tier === undefined ? 0 : cfg.tier,
        speed: cfg.speed || 0,
        edible: type !== 'mine' && type !== 'jellyfish',
        hazard: type === 'mine' || type === 'jellyfish',
        swimmer: !!SWIMMERS[type],
        alive: true,
        phase: Math.random() * Math.PI * 2,
        facing: 1
    };

    state.entityGroup.add(mesh);
    return entity;
}

export function placeEntityRandom(state, entity, offscreen) {
    var world = state.config.world;
    var margin = 1.5;

    if (offscreen) {
        // spawn just outside current view edge based on shark position
        var side = Math.random() < 0.5 ? -1 : 1;
        entity.x = state.shark.x + side * (state.viewHalfW + margin);
        entity.x = Math.max(-world.width * 0.5 + margin, Math.min(world.width * 0.5 - margin, entity.x));
        entity.y = (Math.random() - 0.5) * (world.height - 2 * margin);
    } else {
        entity.x = (Math.random() - 0.5) * (world.width - 2 * margin);
        entity.y = (Math.random() - 0.5) * (world.height - 2 * margin);
    }

    if (entity.type === 'coin') {
        entity.y = Math.min(entity.y, world.surfaceY - 1);
    }

    if (entity.swimmer) {
        entity.facing = Math.random() < 0.5 ? -1 : 1;
        entity.vx = entity.facing * entity.speed;
        entity.vy = 0;
    } else if (entity.type === 'jellyfish') {
        entity.vy = entity.speed;
    }

    entity.alive = true;
    entity.mesh.visible = true;
    syncEntityMesh(entity);
}

export function syncEntityMesh(entity) {
    entity.mesh.position.x = entity.x;
    entity.mesh.position.y = entity.y;
    if (entity.swimmer) {
        // fish texture faces right; flip when moving left
        entity.mesh.scale.x = entity.facing < 0 ? -1 : 1;
    }
}
