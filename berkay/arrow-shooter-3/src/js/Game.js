import * as THREE from 'three';
import { cellKey, dirFromName, lerp } from './utils.js';
import { findPathToEdge, buildBlockedKeys } from './Pathfinder.js';
import {
  buildConveyorPath,
  sampleConveyorPath,
  createConveyorTrack,
  getEntryDistance
} from './Conveyor.js';
import { rebuildArrowMeshes, setArrowUnitsFromWorld } from './ArrowMeshes.js';
import {
  createShooterSystem,
  updateShooterLabels,
  tryFireShooters,
  updateBullets,
  getActiveShooterColors,
  isShooterBusy
} from './ShooterSystem.js';
import { createHud, showEndOverlay, hideEndOverlay } from './Hud.js';
import { scheduleTutorial, dismissTutorial } from './Tutorial.js';
import { createSfx } from './Sfx.js';

export function createGame(config, appRoot) {
  const colorMap = config.arrow.colors;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(config.visual.fogColor);
  scene.fog = new THREE.Fog(
    config.visual.fogColor,
    config.visual.fogNear,
    config.visual.fogFar
  );

  const camera = new THREE.PerspectiveCamera(
    config.camera.fov,
    window.innerWidth / window.innerHeight,
    config.camera.near,
    config.camera.far
  );
  camera.position.set(config.camera.position.x, config.camera.position.y, config.camera.position.z);
  camera.lookAt(config.camera.target.x, config.camera.target.y, config.camera.target.z);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  appRoot.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, config.visual.ambientIntensity);
  const sun = new THREE.DirectionalLight(0xffffff, config.visual.sunIntensity);
  sun.position.set(
    config.visual.sunPosition.x,
    config.visual.sunPosition.y,
    config.visual.sunPosition.z
  );
  sun.castShadow = true;
  scene.add(ambient, sun);

  const boardGroup = buildBoardMesh(config);
  scene.add(boardGroup);

  const conveyorPath = buildConveyorPath(config.board, config.conveyor);
  const topLaneZ = conveyorPath.points[0].z;
  const conveyorTrack = createConveyorTrack(conveyorPath, config.conveyor, config.board);
  scene.add(conveyorTrack);

  const arrowsGroup = new THREE.Group();
  boardGroup.add(arrowsGroup);

  const shooterSystem = createShooterSystem(scene, config, colorMap);
  updateShooterLabels(shooterSystem);

  const sfx = createSfx(config.sfx.volume);
  const hud = createHud();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const clock = new THREE.Clock();

  const state = {
    clock: clock,
    config: config,
    scene: scene,
    camera: camera,
    renderer: renderer,
    boardGroup: boardGroup,
    arrowsGroup: arrowsGroup,
    conveyorPath: conveyorPath,
    topLaneZ: topLaneZ,
    conveyorArrows: [],
    arrows: [],
    shooterSystem: shooterSystem,
    sfx: sfx,
    hud: hud,
    score: 0,
    ended: false,
    jamGrace: 0,
    hasUserInteracted: false,
    tutorial: null,
    tutorialDelayId: null,
    incomingCount: 0,
    cellToWorld: null,
    raycaster: raycaster,
    pointer: pointer
  };

  state.cellToWorld = function (row, col) {
    return cellToWorld(config.board, row, col);
  };

  resetLevel(state);
  bindInput(state);
  resize(state);
  window.addEventListener('resize', function () {
    resize(state);
  });

  function frame() {
    const delta = Math.min(clock.getDelta(), 0.05);
    updateGame(state, delta);
    if (state.tutorial) {
      state.tutorial.update(performance.now());
    }
    renderer.render(scene, camera);
    if (!state.ended) {
      requestAnimationFrame(frame);
    }
  }
  requestAnimationFrame(frame);

  scheduleTutorial(state);
  return state;
}

function cellToWorld(boardCfg, row, col) {
  const cell = boardCfg.cellSize;
  const x = boardCfg.position.x + (col - (boardCfg.columns - 1) / 2) * cell;
  const z = boardCfg.position.z + (row - (boardCfg.rows - 1) / 2) * cell;
  const y = boardCfg.position.y + boardCfg.panelDepth + 0.14;
  return { x: x, y: y, z: z };
}

function buildBoardMesh(config) {
  const group = new THREE.Group();
  const b = config.board;
  const cell = b.cellSize;
  const w = b.columns * cell;
  const h = b.rows * cell;
  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.6, b.panelDepth, h + 0.6),
    new THREE.MeshStandardMaterial({ color: b.panelColor, roughness: 0.85, metalness: 0.1 })
  );
  panel.position.set(b.position.x, b.position.y, b.position.z);
  panel.receiveShadow = true;
  group.add(panel);

  const cellMat = new THREE.MeshStandardMaterial({ color: b.cellColor, roughness: 0.75 });
  for (let r = 0; r < b.rows; r += 1) {
    for (let c = 0; c < b.columns; c += 1) {
      const tile = new THREE.Mesh(
        new THREE.BoxGeometry(cell * 0.88, 0.06, cell * 0.88),
        cellMat
      );
      const wp = cellToWorld(b, r, c);
      tile.position.set(wp.x, b.position.y + b.panelDepth * 0.5 + 0.03, wp.z);
      tile.receiveShadow = true;
      group.add(tile);
    }
  }

  group.position.set(0, 0, 0);
  return group;
}

function resetLevel(state) {
  const config = state.config;
  hideEndOverlay();
  state.ended = false;
  state.score = 0;
  state.jamGrace = 0;
  state.incomingCount = 0;
  state.conveyorArrows = [];
  state.hasUserInteracted = false;

  while (state.arrowsGroup.children.length) {
    state.arrowsGroup.remove(state.arrowsGroup.children[0]);
  }

  state.arrows = config.level.arrows.map(function (def) {
    const group = new THREE.Group();
    state.arrowsGroup.add(group);
    const arrow = {
      id: def.id,
      colorName: def.color,
      colorHex: config.arrow.colors[def.color],
      headDirection: def.headDirection,
      cells: def.cells.map(function (c) {
        return [c[0], c[1]];
      }),
      state: 'board',
      group: group,
      shakeTime: 0,
      move: null,
      pathDistance: 0,
      unitWorldPoints: [],
      exitEdge: null
    };
    rebuildArrowMeshes(
      group,
      arrow.cells,
      arrow.headDirection,
      arrow.colorHex,
      config.arrow,
      state.cellToWorld
    );
    return arrow;
  });

  if (state.hud) {
    state.hud.setScore(0);
    refreshHud(state);
  }
  resetShooters(state);
  updateShooterLabels(state.shooterSystem);
  scheduleTutorial(state);
}

function resetShooters(state) {
  const config = state.config;
  state.shooterSystem.activeBullets.forEach(function (b) {
    b.mesh.visible = false;
    state.shooterSystem.bulletPool.release(b);
  });
  state.shooterSystem.activeBullets.length = 0;
  state.shooterSystem.pendingHitArrowId = null;

  config.shooters.slots.forEach(function (slotCfg, index) {
    const slot = state.shooterSystem.slots[index];
    slot.colorName = slotCfg.color;
    slot.colorHex = config.arrow.colors[slotCfg.color];
    slot.bullets = slotCfg.bullets || config.shooters.bulletCount;
    slot.queue = (slotCfg.queue || []).slice();
    slot.swapping = false;
    slot.fireCooldown = 0;
  });
}

function refreshHud(state) {
  const boardLeft = state.arrows.filter(function (a) {
    return a.state === 'board' || a.state === 'moving';
  }).length;
  const cap = state.config.conveyor.capacity;
  state.hud.setArrowsLeft(boardLeft);
  state.hud.setConveyor(state.conveyorArrows.length, cap);
  state.hud.setScore(state.score);
}

function bindInput(state) {
  const dom = state.renderer.domElement;

  function onPointer(event) {
    if (state.ended) {
      return;
    }

    if (!state.hasUserInteracted) {
      state.sfx.unlock();
      dismissTutorial(state);
      state.hasUserInteracted = true;
    }

    const rect = dom.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    state.pointer.set(x, y);
    state.raycaster.setFromCamera(state.pointer, state.camera);

    const hits = state.raycaster.intersectObjects(state.arrowsGroup.children, true);
    if (!hits.length) {
      return;
    }

    let node = hits[0].object;
    while (node && !node.parent) {
      node = node.parent;
    }
    while (node && node.parent !== state.arrowsGroup) {
      node = node.parent;
    }
    if (!node) {
      return;
    }

    const arrow = state.arrows.find(function (a) {
      return a.group === node && a.state === 'board';
    });
    if (!arrow) {
      return;
    }

    tryReleaseArrow(state, arrow);
  }

  dom.addEventListener('pointerdown', onPointer);
}

function tryReleaseArrow(state, arrow) {
  const config = state.config;

  if (state.conveyorArrows.length + state.incomingCount >= config.conveyor.capacity) {
    shakeArrow(arrow, state);
    state.sfx.tap();
    return;
  }

  const blocked = buildBlockedKeys(state.arrows, arrow.id);
  const result = findPathToEdge(
    config.board.rows,
    config.board.columns,
    arrow.cells,
    arrow.headDirection,
    blocked
  );

  if (!result) {
    shakeArrow(arrow, state);
    state.sfx.tap();
    return;
  }

  if (isExitBlocked(state, result.path[result.path.length - 1], arrow)) {
    shakeArrow(arrow, state);
    state.sfx.tap();
    return;
  }

  state.sfx.tap();
  beginArrowMove(state, arrow, result);
}

function isExitBlocked(state, exitCell, arrow) {
  const radius = state.config.conveyor.exitBlockRadius;
  const exitWorld = state.cellToWorld(exitCell[0], exitCell[1]);

  for (let i = 0; i < state.conveyorArrows.length; i += 1) {
    const other = state.conveyorArrows[i];
    for (let u = 0; u < other.unitWorldPoints.length; u += 1) {
      const pt = other.unitWorldPoints[u];
      const dx = pt.x - exitWorld.x;
      const dz = pt.z - exitWorld.z;
      if (Math.hypot(dx, dz) < radius) {
        return true;
      }
    }
  }
  return false;
}

function beginArrowMove(state, arrow, pathResult) {
  const route = buildSnakeRoute(arrow.cells, pathResult.path);
  const worldRoute = route.map(function (cell) {
    const w = state.cellToWorld(cell[0], cell[1]);
    return new THREE.Vector3(w.x, w.y, w.z);
  });

  const entryDist = getEntryDistance(state.conveyorPath, pathResult.exitEdge, state.config.board);
  arrow.state = 'moving';
  arrow.exitEdge = pathResult.exitEdge;
  state.incomingCount += 1;
  arrow.move = {
    routeCells: route,
    worldRoute: worldRoute,
    progress: 0,
    speed: state.config.arrow.moveSpeed,
    entryDistance: entryDist
  };
  refreshHud(state);
}

function buildSnakeRoute(cells, edgePath) {
  const route = cells.slice();
  for (let i = 1; i < edgePath.length; i += 1) {
    const cell = edgePath[i];
    const last = route[route.length - 1];
    if (last[0] !== cell[0] || last[1] !== cell[1]) {
      route.push([cell[0], cell[1]]);
    }
  }
  return route;
}

function shakeArrow(arrow, state) {
  arrow.shakeTime = state.config.arrow.shakeDuration;
}

function updateGame(state, delta) {
  if (state.ended) {
    return;
  }

  updateMovingArrows(state, delta);
  updateConveyorArrows(state, delta);
  updateBullets(state.shooterSystem, state.config, delta, function (arrowId) {
    onBulletHit(state, arrowId);
  });

  const fired = tryFireShooters(
    state.shooterSystem,
    state.config,
    state.conveyorArrows,
    state.config.arrow.colors,
    state.topLaneZ
  );
  if (fired) {
    state.sfx.shoot();
  }

  checkJam(state, delta);
  checkWin(state);
}

function updateMovingArrows(state, delta) {
  state.arrows.forEach(function (arrow) {
    if (arrow.state !== 'moving' || !arrow.move) {
      if (arrow.shakeTime > 0) {
        arrow.shakeTime -= delta;
        const s = arrow.shakeTime * 12;
        arrow.group.position.x = Math.sin(s * 20) * 0.04;
      } else {
        arrow.group.position.x = 0;
      }
      return;
    }

    const move = arrow.move;
    move.progress += move.speed * delta;
    const maxIndex = move.worldRoute.length - 1;
    const floatIndex = Math.min(move.progress, maxIndex);
    const idx = Math.floor(floatIndex);
    const frac = floatIndex - idx;

    const unitCount = arrow.cells.length;
    const samples = [];
    for (let u = 0; u < unitCount; u += 1) {
      const lag = u;
      const sampleIndex = Math.max(0, Math.min(maxIndex, floatIndex - lag));
      const si = Math.floor(sampleIndex);
      const sf = sampleIndex - si;
      const a = move.worldRoute[si];
      const b = move.worldRoute[Math.min(si + 1, maxIndex)];
      samples.push(
        new THREE.Vector3(lerp(a.x, b.x, sf), lerp(a.y, b.y, sf), lerp(a.z, b.z, sf))
      );
    }

    setArrowUnitsFromWorld(arrow.group, samples, arrow.headDirection, arrow.colorHex, state.config.arrow);
    arrow.group.position.x = 0;

    if (floatIndex >= maxIndex) {
      finishArrowToConveyor(state, arrow);
    }
  });
}

function finishArrowToConveyor(state, arrow) {
  const entryDist =
    arrow.move && arrow.move.entryDistance != null
      ? arrow.move.entryDistance
      : getEntryDistance(state.conveyorPath, arrow.exitEdge || 'top', state.config.board);

  arrow.state = 'conveyor';
  arrow.move = null;
  state.incomingCount = Math.max(0, state.incomingCount - 1);
  const spacing = state.config.conveyor.unitSpacing;
  const stagger = state.conveyorArrows.length * spacing * 1.1;
  arrow.pathDistance = entryDist - stagger;

  const offsets = [];
  for (let i = 0; i < arrow.cells.length; i += 1) {
    offsets.push(i * spacing);
  }
  arrow.unitOffsets = offsets;
  arrow.unitWorldPoints = [];
  state.conveyorArrows.push(arrow);
  refreshHud(state);
}

function updateConveyorArrows(state, delta) {
  const speed = state.config.conveyor.speed;
  state.conveyorArrows.forEach(function (arrow) {
    arrow.pathDistance += speed * delta;
    arrow.unitWorldPoints = [];
    const points = [];
    for (let i = 0; i < arrow.unitOffsets.length; i += 1) {
      const sample = sampleConveyorPath(
        state.conveyorPath,
        arrow.pathDistance - arrow.unitOffsets[i]
      );
      points.push(
        new THREE.Vector3(
          sample.position.x,
          sample.position.y + 0.12,
          sample.position.z
        )
      );
      arrow.unitWorldPoints.push(points[points.length - 1]);
    }
    setArrowUnitsFromWorld(arrow.group, points, arrow.headDirection, arrow.colorHex, state.config.arrow);
  });
}

function onBulletHit(state, arrowId) {
  state.sfx.hit();
  const arrow = state.conveyorArrows.find(function (a) {
    return a.id === arrowId;
  });
  if (!arrow) {
    return;
  }

  if (arrow.unitOffsets.length <= 1) {
    const idx = state.conveyorArrows.indexOf(arrow);
    if (idx >= 0) {
      state.conveyorArrows.splice(idx, 1);
    }
    state.arrowsGroup.remove(arrow.group);
    arrow.state = 'destroyed';
    state.score += state.config.scoring.perArrow;
    state.hud.setScore(state.score);
    state.hud.showScorePopup(state.config.scoring.perArrow);
    refreshHud(state);
    return;
  }

  arrow.unitOffsets.pop();
  refreshHud(state);
}

function canEverMatch(state) {
  const shooterColors = getActiveShooterColors(state.shooterSystem);
  return state.conveyorArrows.some(function (arrow) {
    return shooterColors.indexOf(arrow.colorName) >= 0;
  });
}

function checkJam(state, delta) {
  const cap = state.config.conveyor.capacity;
  if (state.conveyorArrows.length < cap) {
    state.jamGrace = 0;
    return;
  }
  if (state.incomingCount > 0) {
    state.jamGrace = 0;
    return;
  }
  if (isShooterBusy(state.shooterSystem)) {
    state.jamGrace = 0;
    return;
  }
  if (canEverMatch(state)) {
    state.jamGrace = 0;
    return;
  }

  state.jamGrace += delta * 1000;
  if (state.jamGrace >= state.config.conveyor.jamGraceMs) {
    endGame(state, false);
  }
}

function checkWin(state) {
  const boardLeft = state.arrows.some(function (a) {
    return a.state === 'board' || a.state === 'moving';
  });
  if (boardLeft) {
    return;
  }
  if (state.conveyorArrows.length > 0) {
    return;
  }
  if (state.incomingCount > 0) {
    return;
  }
  if (isShooterBusy(state.shooterSystem)) {
    return;
  }
  endGame(state, true);
}

function endGame(state, won) {
  if (state.ended) {
    return;
  }
  state.ended = true;
  if (won) {
    state.sfx.win();
  } else {
    state.sfx.lose();
  }
  dismissTutorial(state);
  showEndOverlay(state.config, won, function () {
    resetLevel(state);
    state.ended = false;
    requestAnimationFrame(function loop() {
      if (state.ended) {
        return;
      }
      const delta = Math.min(state.clock.getDelta(), 0.05);
      updateGame(state, delta);
      if (state.tutorial) {
        state.tutorial.update(performance.now());
      }
      state.renderer.render(state.scene, state.camera);
      requestAnimationFrame(loop);
    });
  });
}

function resize(state) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  state.camera.aspect = w / h;
  state.camera.updateProjectionMatrix();
  state.renderer.setSize(w, h);
}

export function resetGame(state) {
  resetLevel(state);
}
