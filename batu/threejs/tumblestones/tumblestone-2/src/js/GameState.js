import * as THREE from 'three';
import { SceneManager } from '../../../../../../reusables/components/SceneManager.js';

export const GAME_STATUS = {
    PLAYING: 'playing',
    WIN: 'win',
    GAME_OVER: 'game_over'
};

export function createGameState(config) {
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    var scene = new THREE.Scene();

    var state = {
        config: config,
        clock: new THREE.Clock(),
        sceneManager: new SceneManager(scene, renderer),
        renderer: renderer,
        scene: scene,
        camera: new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 20),
        status: GAME_STATUS.PLAYING,
        
        grid: [],
        slots: [],
        clears: 0,
        
        animations: []
    };

    return state;
}

export function resetGame(state) {
    state.status = GAME_STATUS.PLAYING;
    state.clears = 0;
    state.slots = [];
    state.animations = [];
    
    // Initialize grid
    state.grid = [];
    var cols = state.config.board.columns;
    var rows = state.config.board.rows;
    var colors = state.config.gameplay.tileColors;
    
    for (var c = 0; c < cols; c++) {
        var column = [];
        for (var r = 0; r < rows; r++) {
            // Pick a random color
            var color = colors[Math.floor(Math.random() * colors.length)];
            column.push({
                color: color,
                mesh: null // To be filled by Board.js
            });
        }
        state.grid.push(column);
    }
}
