import * as THREE from 'three';
import { dirFromName } from './utils.js';

const sharedGeometries = {};

function getBox(w, h, d) {
  const key = w + '_' + h + '_' + d;
  if (!sharedGeometries[key]) {
    sharedGeometries[key] = new THREE.BoxGeometry(w, h, d);
  }
  return sharedGeometries[key];
}

export function createArrowGroup(arrowCfg, colorHex, arrowSettings) {
  const group = new THREE.Group();
  group.userData.arrowId = arrowCfg.id;
  return group;
}

export function rebuildArrowMeshes(group, cells, headDirection, colorHex, arrowSettings, cellToWorld) {
  while (group.children.length) {
    group.remove(group.children[0]);
  }

  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    metalness: 0.2,
    roughness: 0.45
  });
  const connectorMat = new THREE.MeshStandardMaterial({
    color: '#8a95ad',
    metalness: 0.15,
    roughness: 0.6
  });
  const uw = arrowSettings.unitWidth;
  const ud = arrowSettings.unitDepth;
  const uh = arrowSettings.unitHeight;
  const dir = dirFromName(headDirection);

  for (let i = 0; i < cells.length; i += 1) {
    const world = cellToWorld(cells[i][0], cells[i][1]);
    const isHead = i === cells.length - 1;
    const piece = new THREE.Group();

    if (isHead) {
      const body = new THREE.Mesh(getBox(uw, uh, ud * 0.65), mat);
      body.position.y = uh * 0.5;
      body.castShadow = true;
      piece.add(body);
      const tip = new THREE.Mesh(
        new THREE.ConeGeometry(uw * 0.42 * arrowSettings.headScale, uh * 0.9, 4),
        mat
      );
      tip.rotation.x = Math.PI / 2;
      tip.rotation.y = Math.PI / 4;
      if (dir.name === 'up') {
        tip.position.set(0, uh * 0.5, -ud * 0.42);
        tip.rotation.z = 0;
      } else if (dir.name === 'down') {
        tip.position.set(0, uh * 0.5, ud * 0.42);
        tip.rotation.z = Math.PI;
      } else if (dir.name === 'left') {
        tip.position.set(-ud * 0.42, uh * 0.5, 0);
        tip.rotation.z = Math.PI / 2;
      } else {
        tip.position.set(ud * 0.42, uh * 0.5, 0);
        tip.rotation.z = -Math.PI / 2;
      }
      tip.castShadow = true;
      piece.add(tip);
    } else {
      const body = new THREE.Mesh(getBox(uw, uh, ud), mat);
      body.position.y = uh * 0.5;
      body.castShadow = true;
      piece.add(body);
    }

    piece.position.set(world.x, world.y, world.z);
    if (!isHead && i < cells.length - 1) {
      const next = cellToWorld(cells[i + 1][0], cells[i + 1][1]);
      const midX = (world.x + next.x) * 0.5;
      const midZ = (world.z + next.z) * 0.5;
      const conn = new THREE.Mesh(
        getBox(arrowSettings.connectorWidth, arrowSettings.connectorHeight, ud * 0.35),
        connectorMat
      );
      conn.position.set(midX - world.x, uh * 0.35, midZ - world.z);
      piece.add(conn);
    }

    group.add(piece);
  }
}

export function setArrowUnitsFromWorld(group, worldPoints, headDirection, colorHex, arrowSettings) {
  while (group.children.length) {
    group.remove(group.children[0]);
  }

  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    metalness: 0.2,
    roughness: 0.45
  });
  const connectorMat = new THREE.MeshStandardMaterial({
    color: '#8a95ad',
    metalness: 0.15,
    roughness: 0.6
  });
  const uw = arrowSettings.unitWidth;
  const ud = arrowSettings.unitDepth;
  const uh = arrowSettings.unitHeight;

  for (let i = 0; i < worldPoints.length; i += 1) {
    const wp = worldPoints[i];
    const isHead = i === worldPoints.length - 1;
    const piece = new THREE.Group();
    const body = new THREE.Mesh(
      getBox(uw, uh, isHead ? ud * 0.65 : ud),
      mat
    );
    body.position.y = uh * 0.5;
    body.castShadow = true;
    piece.add(body);
    if (isHead) {
      const tip = new THREE.Mesh(
        new THREE.ConeGeometry(uw * 0.35 * arrowSettings.headScale, uh * 0.75, 4),
        mat
      );
      tip.rotation.x = Math.PI / 2;
      tip.position.set(0, uh * 0.55, -ud * 0.35);
      piece.add(tip);
    }
    piece.position.set(wp.x, wp.y, wp.z);
    if (i < worldPoints.length - 1) {
      const next = worldPoints[i + 1];
      const conn = new THREE.Mesh(
        getBox(arrowSettings.connectorWidth, arrowSettings.connectorHeight, ud * 0.3),
        connectorMat
      );
      conn.position.set((next.x - wp.x) * 0.5, uh * 0.35, (next.z - wp.z) * 0.5);
      piece.add(conn);
    }
    group.add(piece);
  }
}
