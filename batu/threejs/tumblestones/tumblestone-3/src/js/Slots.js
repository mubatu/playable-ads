import * as THREE from 'three';
import { createRoundedRectTexture } from '../../../../reusables/components/VisualUtils.js';

function getAccentColor(state) {
    var accentMap = state.colorPalette || {};
    var current = state.currentCollectionColor;

    if (current && accentMap[current]) {
        return accentMap[current].accent;
    }

    return state.config.slots.emptyColor;
}

export function buildSlots(state) {
    var config = state.config.slots;
    var slotSize = state.boardMetrics.cellSize * config.sizeScale;
    var totalWidth = ((config.count - 1) * config.spacing);
    var slotTexture = createRoundedRectTexture(96, 18);
    var slotGeometry = new THREE.PlaneGeometry(slotSize, slotSize);
    var slotMaterial = new THREE.MeshBasicMaterial({
        map: slotTexture,
        color: new THREE.Color(config.emptyColor),
        transparent: true,
        opacity: 0.9
    });
    var i;

    state.slotsGroup.clear();
    state.slotBackgrounds = [];
    state.slotTargets = [];

    for (i = 0; i < config.count; i += 1) {
        var x = (i * config.spacing) - (totalWidth * 0.5);
        var slot = new THREE.Mesh(slotGeometry, slotMaterial.clone());

        slot.position.set(x, config.offsetY, 0.08);
        slot.renderOrder = 1;
        state.slotsGroup.add(slot);
        state.slotBackgrounds.push(slot);
        state.slotTargets.push(new THREE.Vector3(x, config.offsetY, state.config.tiles.collectedZ));
    }
}

export function refreshSlotState(state) {
    var i;
    var accent = getAccentColor(state);
    var activeColor = new THREE.Color(accent);
    var emptyColor = new THREE.Color(state.config.slots.emptyColor);

    for (i = 0; i < state.slotBackgrounds.length; i += 1) {
        var occupied = Boolean(state.collectedTiles[i]);
        var background = state.slotBackgrounds[i];

        background.material.color.copy(occupied ? activeColor : emptyColor);
        background.material.opacity = occupied ? 0.96 : 0.84;
    }
}

