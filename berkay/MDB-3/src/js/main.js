import * as THREE from 'three';

/** Clear pointing-hand SVG (index finger up); fingertip near top-center for HandTutorial anchor. */
function getBuiltInHandDataUrl() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100" height="120">
<path fill="#f4f4f8" stroke="#141418" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"
  d="M48 8 L52 8 L56 18 L58 52 L62 54 L68 48 L72 38 L76 36 L80 40 L80 48 L74 62 L68 72 L62 78 L58 88 L54 98 L42 100 L34 94 L30 82 L32 58 L34 28 L38 14 Z"/>
<path fill="none" stroke="#141418" stroke-width="1.8" d="M46 26 Q44 20 48 16"/>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function shrinkPoly(verts, factor) {
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < verts.length; i += 1) {
    cx += verts[i][0];
    cy += verts[i][1];
  }
  cx /= verts.length;
  cy /= verts.length;
  return verts.map(([x, y]) => [cx + (x - cx) * factor, cy + (y - cy) * factor]);
}

function pointInPoly(px, py, verts) {
  let inside = false;
  for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
    const xi = verts[i][0];
    const yi = verts[i][1];
    const xj = verts[j][0];
    const yj = verts[j][1];
    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function distSqPointSeg(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = dx * dx + dy * dy;
  if (len < 1e-9) {
    const qx = px - x1;
    const qy = py - y1;
    return qx * qx + qy * qy;
  }
  let t = ((px - x1) * dx + (py - y1) * dy) / len;
  t = Math.max(0, Math.min(1, t));
  const qx = px - (x1 + t * dx);
  const qy = py - (y1 + t * dy);
  return qx * qx + qy * qy;
}

function circleHitsPoly(cx, cy, r, verts) {
  if (pointInPoly(cx, cy, verts)) return true;
  const r2 = r * r;
  for (let i = 0; i < verts.length; i += 1) {
    const j = (i + 1) % verts.length;
    if (distSqPointSeg(cx, cy, verts[i][0], verts[i][1], verts[j][0], verts[j][1]) < r2) {
      return true;
    }
  }
  return false;
}

function polyToShape(verts) {
  const shape = new THREE.Shape();
  shape.moveTo(verts[0][0], verts[0][1]);
  for (let i = 1; i < verts.length; i += 1) {
    shape.lineTo(verts[i][0], verts[i][1]);
  }
  shape.closePath();
  return shape;
}

const COLLIDE_SHRINK = 0.86;
const WORLD_TOP = 7.1;
const WORLD_BOTTOM = -7.1;
const BIRD_RADIUS = 0.34;
const GRAVITY = -22;
const FLAP_VY = 7.8;
const SCROLL_SPEED = 4.2;
const WIN_PASSES = 10;
const CTA_URL = 'https://www.google.com';

function makeObstacleBlueprint(index) {
  const t = index % 4;
  const polys = [];

  if (t === 0) {
    polys.push(
      shrinkPoly(
        [
          [-2.2, WORLD_TOP + 1],
          [2.2, WORLD_TOP + 1],
          [0, 2.4]
        ],
        COLLIDE_SHRINK
      )
    );
    polys.push(
      shrinkPoly(
        [
          [-2.2, WORLD_BOTTOM - 1],
          [2.2, WORLD_BOTTOM - 1],
          [0, -2.4]
        ],
        COLLIDE_SHRINK
      )
    );
  } else if (t === 1) {
    polys.push(
      shrinkPoly(
        [
          [-1.6, WORLD_TOP + 1],
          [1.6, WORLD_TOP + 1],
          [0, 1.9]
        ],
        COLLIDE_SHRINK
      )
    );
    polys.push(
      shrinkPoly(
        [
          [-1.6, WORLD_BOTTOM - 1],
          [1.6, WORLD_BOTTOM - 1],
          [0, -1.9]
        ],
        COLLIDE_SHRINK
      )
    );
    polys.push(
      shrinkPoly(
        [
          [0, 1.15],
          [0.85, 0],
          [0, -1.15],
          [-0.85, 0]
        ],
        COLLIDE_SHRINK
      )
    );
  } else if (t === 2) {
    polys.push(
      shrinkPoly(
        [
          [-0.9, WORLD_TOP + 1],
          [0.9, WORLD_TOP + 1],
          [0, 2.9]
        ],
        COLLIDE_SHRINK
      )
    );
    polys.push(
      shrinkPoly(
        [
          [-2.4, WORLD_BOTTOM - 1],
          [2.4, WORLD_BOTTOM - 1],
          [0, -1.6]
        ],
        COLLIDE_SHRINK
      )
    );
  } else {
    polys.push(
      shrinkPoly(
        [
          [-2.4, WORLD_TOP + 1],
          [2.4, WORLD_TOP + 1],
          [-0.4, 1.5]
        ],
        COLLIDE_SHRINK
      )
    );
    polys.push(
      shrinkPoly(
        [
          [-2.4, WORLD_BOTTOM - 1],
          [2.4, WORLD_BOTTOM - 1],
          [0.5, -2.2]
        ],
        COLLIDE_SHRINK
      )
    );
  }

  return polys;
}

async function main() {
  window.THREE = THREE;
  await import('../../../../reusables/components/HandTutorial.js');

  const root = document.getElementById('game-root');
  const hud = document.getElementById('hud');
  const endCard = document.getElementById('end-card');
  const endTitle = document.getElementById('end-title');
  const endSub = document.getElementById('end-sub');
  const btnDownload = document.getElementById('btn-download');
  const btnRetry = document.getElementById('btn-retry');

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x12121a, 1);
  root.insertBefore(renderer.domElement, root.firstChild);

  const scene = new THREE.Scene();
  let camera;

  function updateCamera() {
    const w = renderer.domElement.clientWidth || window.innerWidth;
    const h = renderer.domElement.clientHeight || window.innerHeight;
    const aspect = Math.max(w / h, 0.01);
    const viewH = 14;
    const viewW = viewH * aspect;
    camera = new THREE.OrthographicCamera(-viewW / 2, viewW / 2, viewH / 2, -viewH / 2, 0.1, 200);
    camera.position.set(0, 0, 50);
    camera.lookAt(0, 0, 0);
    renderer.setSize(w, h, false);
    return { viewW, viewH };
  }

  let { viewW } = updateCamera();

  const lineMat = new THREE.LineBasicMaterial({ color: 0xe2e2ee, linewidth: 1 });
  const birdMat = new THREE.MeshBasicMaterial({ color: 0xffeb66 });
  const bird = new THREE.Mesh(new THREE.CircleGeometry(BIRD_RADIUS * 1.05, 20), birdMat);
  bird.position.z = 1;
  scene.add(bird);

  const obstacles = [];
  const obstacleGroup = new THREE.Group();
  scene.add(obstacleGroup);
  let spawnCounter = 0;

  function buildObstacleMeshes(blueprintPolys) {
    const g = new THREE.Group();
    for (let p = 0; p < blueprintPolys.length; p += 1) {
      const shape = polyToShape(blueprintPolys[p]);
      const geom = new THREE.ShapeGeometry(shape);
      const edges = new THREE.EdgesGeometry(geom);
      const line = new THREE.LineSegments(edges, lineMat);
      line.position.z = 0;
      g.add(line);
      geom.dispose();
    }
    return g;
  }

  function spawnObstacle(index, worldX) {
    const blueprint = makeObstacleBlueprint(index % 8);
    const mesh = buildObstacleMeshes(blueprint);
    mesh.position.x = worldX;
    obstacleGroup.add(mesh);
    obstacles.push({
      x: worldX,
      blueprint,
      mesh,
      counted: false
    });
  }

  let birdX = 0;
  let birdY = 0;
  let birdVy = 0;

  function placeBirdFromCamera() {
    birdX = -viewW / 2 + 2.6;
    bird.position.x = birdX;
    bird.position.y = birdY;
  }

  placeBirdFromCamera();

  let passes = 0;
  let phase = 'idle';
  let handTutorial = null;

  function resetRound() {
    phase = 'idle';
    passes = 0;
    birdY = 0.5;
    birdVy = 0;
    bird.position.y = birdY;
    placeBirdFromCamera();
    hud.textContent = `0 / ${WIN_PASSES}`;
    endCard.classList.remove('visible');

    while (obstacleGroup.children.length) {
      obstacleGroup.remove(obstacleGroup.children[0]);
    }
    obstacles.length = 0;
    spawnCounter = 0;

    let x = birdX + 5.5;
    for (let i = 0; i < 14; i += 1) {
      spawnObstacle(spawnCounter, x);
      spawnCounter += 1;
      x += 4.2 + (i % 3) * 0.35;
    }

    if (handTutorial) {
      handTutorial.destroy();
      handTutorial = null;
    }
    handTutorial = new window.HandTutorial({
      container: root,
      renderer,
      camera,
      assetUrl: getBuiltInHandDataUrl(),
      gesture: 'tap',
      from: { space: 'screen', x: 0.5, y: 0.52 },
      to: { space: 'screen', x: 0.5, y: 0.52 },
      duration: 1.15,
      loop: true,
      loopDelay: 0.4,
      size: 132,
      rotation: -12,
      anchor: { x: 0.52, y: 0.14 },
      offset: { x: 0, y: 8 },
      zIndex: 15,
      pulseColor: 'rgba(255, 235, 120, 0.55)',
      trailColor: 'rgba(255, 255, 255, 0.25)',
      hideOnComplete: false
    });
    handTutorial.play();
  }

  function showEnd(won) {
    if (phase === 'won' || phase === 'lost') return;
    phase = won ? 'won' : 'lost';
    if (handTutorial) {
      handTutorial.stop();
      handTutorial.destroy();
      handTutorial = null;
    }
    endTitle.textContent = won ? 'You win!' : 'Game over';
    endSub.textContent = won ? 'You cleared 10 obstacles.' : 'Avoid the spikes and gaps.';
    btnRetry.classList.toggle('hidden', won);
    endCard.classList.add('visible');
  }

  btnDownload.addEventListener('click', () => {
    window.location.href = CTA_URL;
  });

  btnRetry.addEventListener('click', () => {
    resetRound();
  });

  function onTap() {
    if (phase === 'idle') {
      phase = 'playing';
      if (handTutorial) {
        handTutorial.stop();
        handTutorial.destroy();
        handTutorial = null;
      }
      birdVy = FLAP_VY;
      return;
    }
    if (phase === 'playing') {
      birdVy = FLAP_VY;
    }
  }

  root.addEventListener('pointerdown', (e) => {
    if (endCard.classList.contains('visible')) return;
    e.preventDefault();
    onTap();
  });

  window.addEventListener(
    'resize',
    () => {
      const next = updateCamera();
      viewW = next.viewW;
      placeBirdFromCamera();
    },
    false
  );

  resetRound();

  const clock = new THREE.Clock();

  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);
    const now = performance.now();

    if (handTutorial && phase === 'idle') {
      handTutorial.update(now);
    }

    if (phase === 'playing') {
      birdVy += GRAVITY * dt;
      birdY += birdVy * dt;
      bird.position.y = birdY;

      for (let i = 0; i < obstacles.length; i += 1) {
        obstacles[i].x -= SCROLL_SPEED * dt;
        obstacles[i].mesh.position.x = obstacles[i].x;
      }

      if (birdY + BIRD_RADIUS > WORLD_TOP || birdY - BIRD_RADIUS < WORLD_BOTTOM) {
        showEnd(false);
      }

      if (phase === 'playing') {
        for (let i = 0; i < obstacles.length; i += 1) {
          const ob = obstacles[i];
          for (let p = 0; p < ob.blueprint.length; p += 1) {
            const worldPoly = ob.blueprint[p].map(([vx, vy]) => [vx + ob.x, vy]);
            if (circleHitsPoly(birdX, birdY, BIRD_RADIUS, worldPoly)) {
              showEnd(false);
              break;
            }
          }
          if (phase !== 'playing') break;
        }
      }

      if (phase === 'playing') {
        for (let i = 0; i < obstacles.length; i += 1) {
          const ob = obstacles[i];
          if (!ob.counted && ob.x + 0.5 < birdX) {
            ob.counted = true;
            passes += 1;
            hud.textContent = `${passes} / ${WIN_PASSES}`;
            if (passes >= WIN_PASSES) {
              showEnd(true);
            }
          }
        }
      }

      while (obstacles.length && obstacles[0].x < birdX - 12) {
        const dead = obstacles.shift();
        obstacleGroup.remove(dead.mesh);
        const maxX =
          obstacles.length > 0 ? obstacles[obstacles.length - 1].x : birdX;
        spawnObstacle(spawnCounter, maxX + 4.2 + (spawnCounter % 3) * 0.35);
        spawnCounter += 1;
      }
    }

    renderer.render(scene, camera);
  });
}

main().catch((err) => {
  console.error(err);
});
