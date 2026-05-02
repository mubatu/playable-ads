import * as THREE from 'three';

export function createHpBarSprite({ yOffset = 0.55, scaleX = 0.42, scaleY = 0.09 } = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 12;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const s = new THREE.Sprite(mat);
    s.scale.set(scaleX, scaleY, 1);
    s.position.set(0, yOffset, 0);
    s.renderOrder = 10;
    s.userData.canvas = canvas;
    s.userData.context = canvas.getContext('2d');
    s.userData.texture = tex;
    return s;
}

export function setHpBarRatio(sprite, ratio) {
    const ctx = sprite.userData.context;
    if (!ctx) {
        return;
    }
    ctx.clearRect(0, 0, 64, 12);
    ctx.fillStyle = 'rgba(8, 17, 31, 0.9)';
    ctx.fillRect(0, 0, 64, 12);
    const r = Math.max(0, Math.min(1, ratio));
    const w = r * 60;
    const c = r > 0.5 ? '#5fd16a' : r > 0.2 ? '#ffcc4a' : '#ff5050';
    ctx.fillStyle = c;
    ctx.fillRect(2, 2, w, 8);
    sprite.userData.texture.needsUpdate = true;
}
