/**
 * Generic A* on a 2D rectangular grid (4-connected).
 * Reusable across grid-based games.
 */
function key(c, r) {
    return c * 100000 + r;
}

function reconstruct(cameFrom, currentKey) {
    const out = [];
    let k = currentKey;
    while (cameFrom.has(k)) {
        const c = Math.floor(k / 100000);
        const r = k - c * 100000;
        out.push({ c, r });
        k = cameFrom.get(k);
    }
    return out.reverse();
}

/**
 * @param {object} args
 * @param {number} args.cols
 * @param {number} args.rows
 * @param {{c:number,r:number}} args.start
 * @param {Array<{c:number,r:number}>} args.goals - any of these tiles is a valid goal
 * @param {(c:number,r:number)=>boolean} args.isWalkable
 * @returns {Array<{c:number,r:number}>|null} path excluding the start tile, or null if no path
 */
export function aStar({ cols, rows, start, goals, isWalkable }) {
    if (!goals || goals.length === 0) {
        return null;
    }
    const goalSet = new Set(goals.map((g) => key(g.c, g.r)));
    const heuristic = (c, r) => {
        let best = Infinity;
        for (let i = 0; i < goals.length; i += 1) {
            const d = Math.abs(c - goals[i].c) + Math.abs(r - goals[i].r);
            if (d < best) {
                best = d;
            }
        }
        return best;
    };

    const startKey = key(start.c, start.r);
    const open = [{ c: start.c, r: start.r, k: startKey, f: heuristic(start.c, start.r) }];
    const cameFrom = new Map();
    const gScore = new Map([[startKey, 0]]);

    while (open.length > 0) {
        let bestIdx = 0;
        for (let i = 1; i < open.length; i += 1) {
            if (open[i].f < open[bestIdx].f) {
                bestIdx = i;
            }
        }
        const current = open.splice(bestIdx, 1)[0];

        if (goalSet.has(current.k)) {
            return reconstruct(cameFrom, current.k);
        }

        const dirs = [
            { c: current.c + 1, r: current.r },
            { c: current.c - 1, r: current.r },
            { c: current.c, r: current.r + 1 },
            { c: current.c, r: current.r - 1 }
        ];
        for (let i = 0; i < dirs.length; i += 1) {
            const n = dirs[i];
            if (n.c < 0 || n.r < 0 || n.c >= cols || n.r >= rows) {
                continue;
            }
            const nk = key(n.c, n.r);
            if (!isWalkable(n.c, n.r) && !goalSet.has(nk)) {
                continue;
            }
            const tentative = (gScore.get(current.k) ?? Infinity) + 1;
            if (tentative < (gScore.get(nk) ?? Infinity)) {
                cameFrom.set(nk, current.k);
                gScore.set(nk, tentative);
                const f = tentative + heuristic(n.c, n.r);
                let inOpen = false;
                for (let j = 0; j < open.length; j += 1) {
                    if (open[j].k === nk) {
                        open[j].f = f;
                        inOpen = true;
                        break;
                    }
                }
                if (!inOpen) {
                    open.push({ c: n.c, r: n.r, k: nk, f });
                }
            }
        }
    }
    return null;
}
