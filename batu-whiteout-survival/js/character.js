/**
 * character.js — Procedural timberman (lumberjack) built from primitives
 * Positioned at the world origin (center of camera view).
 */

const Character = (function () {
    'use strict';

    // ---- Palette ----
    const SKIN   = 0xE8B89D;
    const SHIRT  = 0xCC3333;  // red flannel
    const PANTS  = 0x3B5998;  // dark blue jeans
    const BOOTS  = 0x3E2723;  // dark brown
    const HAIR   = 0x4E3524;  // dark brown hair
    const BELT   = 0x2E2E2E;  // black belt
    const AXE_HANDLE = 0x6D4C2E;
    const AXE_HEAD   = 0x999999;

    // ---- Shared materials ----
    const mat = (color) => new THREE.MeshLambertMaterial({ color });

    const skinMat   = mat(SKIN);
    const shirtMat  = mat(SHIRT);
    const pantsMat  = mat(PANTS);
    const bootsMat  = mat(BOOTS);
    const hairMat   = mat(HAIR);
    const beltMat   = mat(BELT);
    const axeHMat   = mat(AXE_HANDLE);
    const axeMMat   = mat(AXE_HEAD);

    // ---- Helper: box mesh ----
    function box(w, h, d, material) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    // ---- Build character group ----
    const group = new THREE.Group();

    // -- Torso (red flannel shirt) --
    const torso = box(1.0, 1.2, 0.6, shirtMat);
    torso.position.y = 2.1;
    group.add(torso);

    // -- Belt --
    const belt = box(1.05, 0.15, 0.65, beltMat);
    belt.position.y = 1.45;
    group.add(belt);

    // -- Head --
    const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.75, 0.7),
        skinMat
    );
    head.castShadow = true;
    head.position.y = 3.1;
    group.add(head);

    // -- Hair (flat cap on top) --
    const hair = box(0.75, 0.2, 0.75, hairMat);
    hair.position.y = 3.55;
    group.add(hair);

    // -- Eyes (two small dark cubes) --
    const eyeGeo = new THREE.BoxGeometry(0.1, 0.1, 0.05);
    const eyeMat = mat(0x222222);
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.18, 3.15, 0.35);
    group.add(eyeL);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.18, 3.15, 0.35);
    group.add(eyeR);

    // -- Arms --
    //  Left arm (pivot at shoulder)
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.7, 2.55, 0);
    const leftArmMesh = box(0.3, 1.0, 0.35, shirtMat);
    leftArmMesh.position.y = -0.45;
    leftArm.add(leftArmMesh);
    // Left hand
    const leftHand = box(0.25, 0.25, 0.25, skinMat);
    leftHand.position.y = -1.0;
    leftArm.add(leftHand);
    group.add(leftArm);

    //  Right arm (pivot at shoulder)
    const rightArm = new THREE.Group();
    rightArm.position.set(0.7, 2.55, 0);
    const rightArmMesh = box(0.3, 1.0, 0.35, shirtMat);
    rightArmMesh.position.y = -0.45;
    rightArm.add(rightArmMesh);
    // Right hand
    const rightHand = box(0.25, 0.25, 0.25, skinMat);
    rightHand.position.y = -1.0;
    rightArm.add(rightHand);
    group.add(rightArm);

    // -- Legs --
    //  Left leg (pivot at hip)
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.25, 1.35, 0);
    const leftLegMesh = box(0.4, 1.0, 0.45, pantsMat);
    leftLegMesh.position.y = -0.5;
    leftLeg.add(leftLegMesh);
    // Left boot
    const leftBoot = box(0.42, 0.35, 0.55, bootsMat);
    leftBoot.position.set(0, -1.1, 0.05);
    leftLeg.add(leftBoot);
    group.add(leftLeg);

    //  Right leg (pivot at hip)
    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.25, 1.35, 0);
    const rightLegMesh = box(0.4, 1.0, 0.45, pantsMat);
    rightLegMesh.position.y = -0.5;
    rightLeg.add(rightLegMesh);
    // Right boot
    const rightBoot = box(0.42, 0.35, 0.55, bootsMat);
    rightBoot.position.set(0, -1.1, 0.05);
    rightLeg.add(rightBoot);
    group.add(rightLeg);

    // -- Axe (attached to right hand) --
    const axeGroup = new THREE.Group();
    // Handle
    const handle = box(0.08, 0.9, 0.08, axeHMat);
    handle.position.y = -0.35;
    axeGroup.add(handle);
    // Head (blade)
    const blade = box(0.35, 0.3, 0.06, axeMMat);
    blade.position.set(0.15, -0.75, 0);
    axeGroup.add(blade);
    axeGroup.position.set(0, -0.85, 0.2);
    axeGroup.rotation.x = -0.3;
    rightArm.add(axeGroup);

    // ---- Place at world origin ----
    group.position.set(0, 0, 0);

    // ---- Shadow blob (circle under feet) ----
    const shadowGeo = new THREE.CircleGeometry(0.6, 16);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.25,
        depthWrite: false,
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.position.y = 0.02; // just above ground to avoid z-fight
    group.add(shadow);

    GameScene.scene.add(group);

    return {
        group,
        leftArm,
        rightArm,
        leftLeg,
        rightLeg,
    };
})();
