export const DIR = {
  up: { dr: -1, dc: 0, name: 'up' },
  down: { dr: 1, dc: 0, name: 'down' },
  left: { dr: 0, dc: -1, name: 'left' },
  right: { dr: 0, dc: 1, name: 'right' }
};

export function dirFromName(name) {
  return DIR[name] || DIR.up;
}

export function cellKey(row, col) {
  return row + ',' + col;
}

export function parseCellKey(key) {
  const parts = key.split(',');
  return { row: Number(parts[0]), col: Number(parts[1]) };
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}
