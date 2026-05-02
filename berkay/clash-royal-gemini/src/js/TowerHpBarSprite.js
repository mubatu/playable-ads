import * as THREE from 'three';

/**
 * Larger canvas sprite with numeric HP so tower health reads clearly at distance.
 */
export function createTowerHpBarSprite({
    yOffset = 2.8,
    scaleX = 2.35,
    scaleY = 0.42
} = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 28;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        depthTest: false,
        depthWrite: false
    });
    const s = new THREE.Sprite(mat);
    s.scale.set(scaleX, scaleY, 1);
    s.position.set(0, yOffset, 0);
    s.center.set(0.5, 0.15);
    s.renderOrder = 999;
    s.userData.canvas = canvas;
    s.userData.context = canvas.getContext('2d');
    s.userData.texture = tex;
    return s;
}

export function setTowerHpBar(sprite, currentHp, maxHp) {
    const ctx = sprite.userData.context;
    const canvas = sprite.userData.canvas;
    if (!ctx || !canvas) {
        return;
    }
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cur = Math.max(0, currentHp);
    const max = Math.max(1, maxHp);
    const ratio = Math.max(0, Math.min(1, cur / max));

    ctx.fillStyle = 'rgba(6, 12, 22, 0.92)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 2;
    const bx = 4;
    const by = 14;
    const bw = w - 8;
    const bh = 10;
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);

    const fillW = (bw - 4) * ratio;
    const c = ratio > 0.5 ? '#52d87a' : ratio > 0.2 ? '#ffcc4a' : '#ff5a5a';
    ctx.fillStyle = c;
    ctx.fillRect(bx + 2, by + 2, Math.max(0, fillW), bh - 4);

    ctx.font = 'bold 13px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = 3;
    const label = `${Math.round(cur)} / ${Math.round(max)}`;
    const tx = w * 0.5;
    const ty = 9;
    ctx.strokeText(label, tx, ty);
    ctx.fillText(label, tx, ty);

    sprite.userData.texture.needsUpdate = true;
}
