import * as THREE from 'three';

const BODY_GEOMETRY = new THREE.SphereGeometry(0.3, 18, 16);
const NOSE_GEOMETRY = new THREE.CylinderGeometry(0.08, 0.12, 0.18, 16);
NOSE_GEOMETRY.rotateX(Math.PI * 0.5);

function buildLabelSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.85, 0.4, 1);
    sprite.position.set(0, 0.6, 0);
    sprite.userData.canvas = canvas;
    sprite.userData.context = canvas.getContext('2d');
    sprite.userData.texture = texture;
    return sprite;
}

function renderLabel(sprite, ammo) {
    const ctx = sprite.userData.context;
    if (!ctx) {
        return;
    }

    ctx.clearRect(0, 0, 128, 64);
    ctx.fillStyle = 'rgba(8, 17, 31, 0.85)';
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(8, 10, 112, 44, 16);
    } else {
        ctx.rect(8, 10, 112, 44);
    }
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(ammo), 64, 34);
    sprite.userData.texture.needsUpdate = true;
}

export class ShooterFactory {
    static create() {
        const root = new THREE.Group();
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff89b0, roughness: 0.5, metalness: 0.1 });
        const body = new THREE.Mesh(BODY_GEOMETRY, bodyMaterial);
        root.add(body);

        const nose = new THREE.Mesh(NOSE_GEOMETRY, new THREE.MeshStandardMaterial({ color: 0xffb5cf, roughness: 0.7 }));
        nose.position.set(0, -0.02, 0.3);
        root.add(nose);

        const label = buildLabelSprite();
        root.add(label);

        root.userData.bodyMaterial = bodyMaterial;
        root.userData.label = label;
        root.userData.color = 0xffffff;
        root.userData.ammo = 0;
        root.scale.setScalar(0.78);
        root.visible = false;
        return root;
    }

    static configure(shooter, { color, ammo }) {
        shooter.userData.color = color;
        shooter.userData.ammo = ammo;
        shooter.userData.bodyMaterial.color.setHex(color);
        renderLabel(shooter.userData.label, ammo);
        shooter.visible = true;
    }

    static setAmmo(shooter, ammo) {
        shooter.userData.ammo = ammo;
        renderLabel(shooter.userData.label, ammo);
    }
}
