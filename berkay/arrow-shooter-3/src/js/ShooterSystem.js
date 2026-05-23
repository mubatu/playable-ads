import * as THREE from 'three';
import { ObjectPool } from '../../../../reusables/components/ObjectPool.js';

export function createShooterSystem(scene, config, colorMap) {
  const group = new THREE.Group();
  const slots = config.shooters.slots.map(function (slotCfg, index) {
    const slotGroup = new THREE.Group();
    slotGroup.position.set(slotCfg.x, config.shooters.y, config.shooters.z);
    const color = colorMap[slotCfg.color] || '#ffffff';
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.5, 0.35, 12),
      new THREE.MeshStandardMaterial({ color: '#2a3550', metalness: 0.4, roughness: 0.5 })
    );
    base.position.y = 0.18;
    base.castShadow = true;
    const barrel = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.28, 0.7),
      new THREE.MeshStandardMaterial({ color: color, metalness: 0.25, roughness: 0.4 })
    );
    barrel.position.set(0, 0.55, -0.35);
    barrel.castShadow = true;
    slotGroup.add(base);
    slotGroup.add(barrel);
    slotGroup.userData.barrel = barrel;
    group.add(slotGroup);

    return {
      index: index,
      group: slotGroup,
      x: slotCfg.x,
      colorName: slotCfg.color,
      colorHex: color,
      bullets: slotCfg.bullets || config.shooters.bulletCount,
      queue: (slotCfg.queue || []).slice(),
      swapping: false,
      swapTimer: 0,
      fireCooldown: 0,
      label: createBulletLabel(slotGroup)
    };
  });

  scene.add(group);

  const bulletPool = new ObjectPool(
    function () {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 8),
        new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.35 })
      );
      mesh.visible = false;
      mesh.castShadow = true;
      scene.add(mesh);
      return { mesh: mesh, active: false, target: null, arrowId: null, speed: config.shooters.bulletSpeed };
    },
    function (bullet) {
      bullet.active = false;
      bullet.target = null;
      bullet.arrowId = null;
      bullet.mesh.visible = false;
    },
    12
  );

  const activeBullets = [];

  return {
    group: group,
    slots: slots,
    bulletPool: bulletPool,
    activeBullets: activeBullets,
    pendingHitArrowId: null
  };
}

function createBulletLabel(slotGroup) {
  return {
    set: function (count) {
      if (slotGroup.userData.countSprite) {
        slotGroup.remove(slotGroup.userData.countSprite);
      }
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(8,12,24,0.75)';
      ctx.beginPath();
      ctx.arc(32, 32, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(count), 32, 36);
      const tex = new THREE.CanvasTexture(canvas);
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(0.9, 0.9, 1);
      sprite.position.set(0, 1.05, 0);
      slotGroup.add(sprite);
      slotGroup.userData.countSprite = sprite;
    }
  };
}

export function updateShooterLabels(shooterSystem) {
  shooterSystem.slots.forEach(function (slot) {
    slot.label.set(slot.bullets);
    if (slot.group.userData.barrel) {
      slot.group.userData.barrel.material.color.set(slot.colorHex);
    }
  });
}

export function tryFireShooters(shooterSystem, config, conveyorArrows, colorMap, topLaneZ) {
  if (shooterSystem.pendingHitArrowId) {
    return null;
  }

  const aimX = config.shooters.aimThresholdX;
  const aimZ = config.shooters.aimThresholdZ;

  for (let s = 0; s < shooterSystem.slots.length; s += 1) {
    const slot = shooterSystem.slots[s];
    if (slot.swapping || slot.bullets <= 0 || slot.fireCooldown > 0) {
      continue;
    }

    let best = null;
    let bestDist = Infinity;

    for (let a = 0; a < conveyorArrows.length; a += 1) {
      const arrow = conveyorArrows[a];
      if (arrow.colorName !== slot.colorName || arrow.unitWorldPoints.length === 0) {
        continue;
      }

      for (let u = 0; u < arrow.unitWorldPoints.length; u += 1) {
        const pt = arrow.unitWorldPoints[u];
        const dx = Math.abs(pt.x - slot.x);
        const dz = Math.abs(pt.z - topLaneZ);
        if (dx <= aimX && dz <= aimZ) {
          const dist = dx + dz;
          if (dist < bestDist) {
            bestDist = dist;
            best = { arrow: arrow, unitIndex: u, point: pt };
          }
        }
      }
    }

    if (best) {
      slot.fireCooldown = config.shooters.fireInterval;
      slot.bullets -= 1;
      updateShooterLabels(shooterSystem);

      const bullet = shooterSystem.bulletPool.get();
      bullet.active = true;
      bullet.arrowId = best.arrow.id;
      bullet.target = best.point.clone();
      bullet.mesh.material.color.set(slot.colorHex);
      bullet.mesh.position.set(slot.x, config.shooters.y + 0.55, config.shooters.z);
      bullet.mesh.visible = true;
      shooterSystem.activeBullets.push(bullet);
      shooterSystem.pendingHitArrowId = best.arrow.id;

      if (slot.bullets <= 0 && slot.queue.length) {
        beginShooterSwap(shooterSystem, slot, config, colorMap);
      }

      return { slot: slot, bullet: bullet, unitIndex: best.unitIndex };
    }
  }

  return null;
}

function beginShooterSwap(shooterSystem, slot, config, colorMap) {
  slot.swapping = true;
  slot.swapTimer = 0.55;
  const nextColor = slot.queue.shift();
  window.setTimeout(function () {
    slot.colorName = nextColor;
    slot.colorHex = colorMap[nextColor] || '#ffffff';
    slot.bullets = config.shooters.bulletCount;
    slot.swapping = false;
    updateShooterLabels(shooterSystem);
  }, 550);
}

export function updateBullets(shooterSystem, config, delta, onHit) {
  for (let i = shooterSystem.activeBullets.length - 1; i >= 0; i -= 1) {
    const bullet = shooterSystem.activeBullets[i];
    if (!bullet.active || !bullet.target) {
      continue;
    }

    const pos = bullet.mesh.position;
    const to = bullet.target;
    const dir = new THREE.Vector3().subVectors(to, pos);
    const dist = dir.length();
    dir.normalize();
    const step = config.shooters.bulletSpeed * delta;

    if (dist <= step + 0.05) {
      bullet.mesh.position.copy(to);
      bullet.mesh.visible = false;
      bullet.active = false;
      shooterSystem.activeBullets.splice(i, 1);
      shooterSystem.bulletPool.release(bullet);
      shooterSystem.pendingHitArrowId = null;
      if (onHit) {
        onHit(bullet.arrowId);
      }
    } else {
      pos.addScaledVector(dir, step);
    }
  }

  shooterSystem.slots.forEach(function (slot) {
    if (slot.fireCooldown > 0) {
      slot.fireCooldown -= delta;
    }
  });
}

export function getActiveShooterColors(shooterSystem) {
  const colors = [];
  shooterSystem.slots.forEach(function (slot) {
    if (slot.bullets > 0 || slot.swapping) {
      colors.push(slot.colorName);
    }
    slot.queue.forEach(function (c) {
      colors.push(c);
    });
  });
  return colors;
}

export function isShooterBusy(shooterSystem) {
  return shooterSystem.slots.some(function (s) {
    return s.swapping;
  }) || shooterSystem.activeBullets.length > 0 || shooterSystem.pendingHitArrowId;
}
