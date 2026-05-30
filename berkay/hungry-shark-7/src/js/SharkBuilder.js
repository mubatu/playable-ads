import { Mesh, PlaneGeometry, MeshBasicMaterial, Group } from 'three';

// Aspect of the shark texture (square canvas, but art is wider than tall).
var SPRITE_W = 1.0;
var SPRITE_H = 1.0;

export function buildShark(state) {
    var group = new Group();

    var geo = new PlaneGeometry(SPRITE_W, SPRITE_H);
    var mat = new MeshBasicMaterial({ map: state.textures.shark, transparent: true, depthWrite: false });
    var sprite = new Mesh(geo, mat);
    group.add(sprite);

    group.userData.sprite = sprite;
    group.userData.material = mat;

    var size = state.shark.size;
    group.scale.set(size, size, 1);
    group.position.z = 1;

    return group;
}
