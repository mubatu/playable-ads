/**
 * score.js — Wood score counter with HUD display
 * Shows a wood icon + count at top-center of screen.
 */

const Score = (function () {
    'use strict';

    const WOOD_PER_TREE = 3;

    let woodCount = 0;

    // ---- Build HUD element ----
    const hud = document.createElement('div');
    hud.id = 'score-hud';

    // Wood icon — inline SVG log/plank
    hud.innerHTML =
        '<svg class="wood-icon" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">' +
            // Log body
            '<rect x="4" y="14" width="32" height="14" rx="3" fill="#8B6914"/>' +
            // Lighter top face
            '<rect x="4" y="14" width="32" height="5" rx="2" fill="#A68432"/>' +
            // Wood rings on end
            '<ellipse cx="35" cy="21" rx="4" ry="7" fill="#6D4C2E"/>' +
            '<ellipse cx="35" cy="21" rx="2.5" ry="4.5" fill="#8B6914"/>' +
            '<ellipse cx="35" cy="21" rx="1" ry="2" fill="#A68432"/>' +
        '</svg>' +
        '<span id="score-value">0</span>';

    document.body.appendChild(hud);

    const valueEl = document.getElementById('score-value');

    // ---- API ----
    function addTree(screenX, screenY) {
        woodCount += WOOD_PER_TREE;
        valueEl.textContent = woodCount;
        showPopup('+' + WOOD_PER_TREE, screenX, screenY);
    }

    /**
     * Spawn a floating "+N" text at a screen position that rises and fades out.
     * @param {string} text
     * @param {number} x — screen X in px
     * @param {number} y — screen Y in px
     */
    function showPopup(text, x, y) {
        const el = document.createElement('div');
        el.className = 'score-popup';
        el.textContent = text;
        el.style.left = x + 'px';
        el.style.top  = y + 'px';
        document.body.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
    }

    function getWood() {
        return woodCount;
    }

    return { addTree, getWood, WOOD_PER_TREE };
})();
