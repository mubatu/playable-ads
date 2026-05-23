import * as THREE from 'three';
import { lerp } from './utils.js';

export function buildConveyorPath(boardCfg, conveyorCfg) {
  const cell = boardCfg.cellSize;
  const hw = (boardCfg.columns * cell) / 2 + conveyorCfg.margin;
  const hh = (boardCfg.rows * cell) / 2 + conveyorCfg.margin;
  const y = boardCfg.position.y + boardCfg.panelDepth * 0.5 + 0.08;
  const bx = boardCfg.position.x;
  const bz = boardCfg.position.z;
  const step = cell * 0.55;
  const points = [];

  function addLine(x0, z0, x1, z1) {
    const dx = x1 - x0;
    const dz = z1 - z0;
    const len = Math.hypot(dx, dz);
    const count = Math.max(2, Math.ceil(len / step));
    for (let i = 0; i <= count; i += 1) {
      const t = i / count;
      points.push(new THREE.Vector3(bx + lerp(x0, x1, t), y, bz + lerp(z0, z1, t)));
    }
  }

  const left = -hw;
  const right = hw;
  const top = -hh;
  const bottom = hh;

  addLine(left, top, right, top);
  addLine(right, top, right, bottom);
  addLine(right, bottom, left, bottom);
  addLine(left, bottom, left, top);

  const cumulative = [0];
  for (let i = 1; i < points.length; i += 1) {
    cumulative.push(cumulative[i - 1] + points[i].distanceTo(points[i - 1]));
  }

  return {
    points: points,
    cumulative: cumulative,
    totalLength: cumulative[cumulative.length - 1]
  };
}

export function sampleConveyorPath(pathData, distance) {
  const total = pathData.totalLength;
  let d = distance % total;
  if (d < 0) {
    d += total;
  }

  const cumulative = pathData.cumulative;
  const points = pathData.points;
  let idx = 0;
  while (idx < cumulative.length - 1 && cumulative[idx + 1] < d) {
    idx += 1;
  }

  const segStart = cumulative[idx];
  const segEnd = cumulative[idx + 1] || segStart;
  const t = segEnd === segStart ? 0 : (d - segStart) / (segEnd - segStart);
  const a = points[idx];
  const b = points[Math.min(idx + 1, points.length - 1)];
  const pos = new THREE.Vector3().lerpVectors(a, b, t);
  const tangent = new THREE.Vector3().subVectors(b, a).normalize();
  return { position: pos, tangent: tangent };
}

export function createConveyorTrack(pathData, conveyorCfg, boardCfg) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: conveyorCfg.trackColor,
    metalness: 0.35,
    roughness: 0.55
  });
  const geom = new THREE.BoxGeometry(conveyorCfg.trackWidth, 0.12, 0.12);

  for (let i = 0; i < pathData.points.length - 1; i += 2) {
    const a = pathData.points[i];
    const b = pathData.points[i + 1];
    const seg = new THREE.Mesh(geom, mat);
    const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    seg.position.copy(mid);
    const angle = Math.atan2(b.x - a.x, b.z - a.z);
    seg.rotation.y = angle;
    const len = a.distanceTo(b);
    seg.scale.z = len / 0.12;
    group.add(seg);
  }

  group.position.y = boardCfg.position.y;
  return group;
}

export function getEntryDistance(pathData, edge, boardCfg) {
  const cell = boardCfg.cellSize;
  const hw = (boardCfg.columns * cell) / 2;
  const hh = (boardCfg.rows * cell) / 2;
  const bx = boardCfg.position.x;
  const bz = boardCfg.position.z;
  let target;

  if (edge === 'top') {
    target = new THREE.Vector3(bx, 0, bz - hh - boardCfg.cellSize * 0.2);
  } else if (edge === 'bottom') {
    target = new THREE.Vector3(bx, 0, bz + hh + boardCfg.cellSize * 0.2);
  } else if (edge === 'left') {
    target = new THREE.Vector3(bx - hw - boardCfg.cellSize * 0.2, 0, bz);
  } else {
    target = new THREE.Vector3(bx + hw + boardCfg.cellSize * 0.2, 0, bz);
  }

  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < pathData.points.length; i += 1) {
    const p = pathData.points[i];
    const d = p.distanceTo(target);
    if (d < bestDist) {
      bestDist = d;
      best = pathData.cumulative[i];
    }
  }
  return best;
}
