import * as THREE from 'three';
import { GAME_STATUS } from './GameState.js';

export function createSlots(state) {
    var slotsGroup = new THREE.Group();
    var count = state.config.slots.count;
    var size = state.config.slots.size;
    var gap = state.config.slots.gap;
    var offsetY = state.config.slots.offsetY;

    var totalWidth = count * size + (count - 1) * gap;
    var startX = -totalWidth / 2 + size / 2;

    slotsGroup.position.y = offsetY;
    
    // Background for slots
    var bgMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.5, transparent: true });
    
    state.slotPositions = [];
    
    for (var i = 0; i < count; i++) {
        var posX = startX + i * (size + gap);
        var bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), bgMaterial);
        bgMesh.position.set(posX, 0, -0.1);
        slotsGroup.add(bgMesh);
        
        state.slotPositions.push(new THREE.Vector3(posX, offsetY, 0));
    }
    
    state.slotsGroup = slotsGroup;
    return slotsGroup;
}

export function addToSlot(state, color, sourceMesh) {
    if (state.status !== GAME_STATUS.PLAYING) return;
    
    var slotIndex = state.slots.length;
    if (slotIndex >= state.config.slots.count) return; // Should not happen if logic is correct
    
    state.slots.push(color);
    
    // Animate mesh to slot
    var targetPos = state.slotPositions[slotIndex];
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(state.config.slots.size, state.config.slots.size), state.materials[color]);
    mesh.position.copy(sourceMesh.getWorldPosition(new THREE.Vector3()));
    state.sceneManager.addObject(mesh);
    
    // Simple manual tween
    state.animations.push({
        mesh: mesh,
        startPos: mesh.position.clone(),
        targetPos: targetPos.clone(),
        progress: 0,
        duration: 0.3,
        onComplete: function() {
            mesh.position.copy(targetPos);
            checkSlots(state);
        }
    });
}

function checkSlots(state) {
    if (state.slots.length === 0) return;
    
    // Check if colors match
    var firstColor = state.slots[0];
    var allMatch = state.slots.every(c => c === firstColor);
    
    if (!allMatch) {
        state.status = GAME_STATUS.GAME_OVER;
        return;
    }
    
    if (state.slots.length === state.config.slots.count) {
        // Clear slots
        state.clears++;
        state.slots = [];
        
        // Remove meshes from slots
        for (var i = state.sceneManager.objects.length - 1; i >= 0; i--) {
            var obj = state.sceneManager.objects[i];
            if (obj.geometry && obj.geometry.parameters.width === state.config.slots.size) {
                // Approximate check to remove slot tiles
                if (obj.position.y === state.config.slots.offsetY) {
                    state.sceneManager.removeObject(obj);
                }
            }
        }
        
        if (state.clears >= state.config.gameplay.winConditionClears) {
            state.status = GAME_STATUS.WIN;
        }
    }
}
