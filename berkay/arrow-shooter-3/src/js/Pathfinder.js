import { cellKey, dirFromName } from './utils.js';

export function findPathToEdge(rows, cols, arrowCells, headDirection, blockedKeys) {
  const ownKeys = new Set(arrowCells.map(function (c) {
    return cellKey(c[0], c[1]);
  }));
  const head = arrowCells[arrowCells.length - 1];
  const dir = dirFromName(headDirection);
  const startRow = head[0] + dir.dr;
  const startCol = head[1] + dir.dc;

  if (startRow < 0 || startRow >= rows || startCol < 0 || startCol >= cols) {
    return {
      path: [[head[0], head[1]]],
      exitEdge: edgeFromStep(head[0], head[1], dir)
    };
  }

  const queue = [[startRow, startCol]];
  const came = new Map();
  came.set(cellKey(startRow, startCol), null);

  while (queue.length) {
    const current = queue.shift();
    const row = current[0];
    const col = current[1];
    const key = cellKey(row, col);

    if (isEdgeCell(row, col, rows, cols)) {
      return {
        path: reconstructPath(came, row, col, head),
        exitEdge: edgeFromCell(row, col, rows, cols)
      };
    }

    const neighbors = [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1]
    ];

    for (let i = 0; i < neighbors.length; i += 1) {
      const nr = neighbors[i][0];
      const nc = neighbors[i][1];
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
        continue;
      }

      const nKey = cellKey(nr, nc);
      if (came.has(nKey)) {
        continue;
      }

      if (blockedKeys.has(nKey) && !ownKeys.has(nKey)) {
        continue;
      }

      came.set(nKey, [row, col]);
      queue.push([nr, nc]);
    }
  }

  return null;
}

function reconstructPath(came, endRow, endCol, head) {
  const path = [[endRow, endCol]];
  let key = cellKey(endRow, endCol);

  while (came.get(key)) {
    const prev = came.get(key);
    path.unshift([prev[0], prev[1]]);
    key = cellKey(prev[0], prev[1]);
  }

  path.unshift([head[0], head[1]]);
  return path;
}

function isEdgeCell(row, col, rows, cols) {
  return row === 0 || row === rows - 1 || col === 0 || col === cols - 1;
}

function edgeFromCell(row, col, rows, cols) {
  if (row === 0) {
    return 'top';
  }
  if (row === rows - 1) {
    return 'bottom';
  }
  if (col === 0) {
    return 'left';
  }
  return 'right';
}

function edgeFromStep(row, col, dir) {
  if (dir.name === 'up') {
    return 'top';
  }
  if (dir.name === 'down') {
    return 'bottom';
  }
  if (dir.name === 'left') {
    return 'left';
  }
  return 'right';
}

export function buildBlockedKeys(arrows, ignoreId) {
  const blocked = new Set();
  arrows.forEach(function (arrow) {
    if (arrow.id === ignoreId || arrow.state === 'destroyed') {
      return;
    }
    if (arrow.state !== 'board' && arrow.state !== 'moving') {
      return;
    }
    arrow.cells.forEach(function (cell) {
      blocked.add(cellKey(cell[0], cell[1]));
    });
  });
  return blocked;
}
