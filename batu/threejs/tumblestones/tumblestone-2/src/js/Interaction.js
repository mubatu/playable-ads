import * as THREE from 'three';
import { GAME_STATUS } from './GameState.js';
import { updateOutlines } from './Board.js';
import { addToSlot } from './Slots.js';

export function bindInteractions(state) {
    var raycaster = new THREE.Raycaster();
    var pointer = new THREE.Vector2();

    function onPointerDown(event) {
        if (state.status !== GAME_STATUS.PLAYING) return;
        
        // Handle both touch and mouse
        var clientX = event.clientX;
        var clientY = event.clientY;
        if (event.touches && event.touches.length > 0) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        }

        pointer.x = (clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(pointer, state.camera);

        // Intersect against tiles
        var intersects = raycaster.intersectObjects(state.boardGroup.children, false);
        
        if (intersects.length > 0) {
            var mesh = intersects[0].object;
            var userData = mesh.userData;
            
            if (userData && userData.col !== undefined && userData.row !== undefined) {
                var c = userData.col;
                var r = userData.row;
                var cell = state.grid[c][r];
                
                // Only allow if outline is visible (meaning it's the lowest available)
                if (cell && cell.outlineMesh && cell.outlineMesh.visible) {
                    
                    // Add to slots
                    addToSlot(state, cell.color, mesh);
                    
                    // Remove from board
                    state.boardGroup.remove(mesh);
                    cell.mesh = null;
                    cell.outlineMesh = null;
                    
                    updateOutlines(state);
                    
                    if (state.tutorial) {
                        state.tutorial.destroy();
                        state.tutorial = null;
                    }
                }
            }
        }
    }

    window.addEventListener('pointerdown', onPointerDown);
}
