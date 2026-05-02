import * as THREE from 'three';
import { createHpBarSprite, setHpBarRatio } from './HpBarSprite.js';

const BODY_GEO = new THREE.CapsuleGeometry(0.18, 0.32, 4, 8);
const HEAD_GEO = new THREE.SphereGeometry(0.16, 12, 10);
const HORN_GEO = new THREE.ConeGeometry(0.05, 0.18, 8);

export const UNIT_SPECS = {
    barbarian: {
        hp: 90,
        damage: 18,
        attackRange: 0.65,
        attackInterval: 0.85,
        moveSpeed: 1.95,
        wallDamageBonus: 1.4,
        bodyColor: 0xff8a3d,
        helmColor: 0xc7a564
    }
};

export class UnitFactory {
    static spec(type) {
        return UNIT_SPECS[type];
    }

    static create(type = 'barbarian') {
        const spec = UNIT_SPECS[type];
        const root = new THREE.Group();
        const bodyMat = new THREE.MeshStandardMaterial({ color: spec.bodyColor, roughness: 0.66 });
        const body = new THREE.Mesh(BODY_GEO, bodyMat);
        body.position.y = 0.32;
        root.add(body);

        const head = new THREE.Mesh(HEAD_GEO, new THREE.MeshStandardMaterial({ color: 0xf2c39d, roughness: 0.6 }));
        head.position.y = 0.7;
        root.add(head);

        const helmMat = new THREE.MeshStandardMaterial({ color: spec.helmColor, roughness: 0.4, metalness: 0.6 });
        const helm = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), helmMat);
        helm.position.y = 0.78;
        root.add(helm);

        const hornL = new THREE.Mesh(HORN_GEO, helmMat);
        hornL.position.set(-0.16, 0.85, 0);
        hornL.rotation.z = Math.PI * 0.45;
        root.add(hornL);
        const hornR = new THREE.Mesh(HORN_GEO, helmMat);
        hornR.position.set(0.16, 0.85, 0);
        hornR.rotation.z = -Math.PI * 0.45;
        root.add(hornR);

        const hpBar = createHpBarSprite({ yOffset: 0.95, scaleX: 0.7, scaleY: 0.13 });
        root.add(hpBar);

        root.userData.bodyMaterial = bodyMat;
        root.userData.hpBar = hpBar;
        root.visible = false;
        return root;
    }

    static setHp(root, ratio) {
        setHpBarRatio(root.userData.hpBar, ratio);
    }
}
