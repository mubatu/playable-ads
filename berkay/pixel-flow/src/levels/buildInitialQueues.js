/**
 * Builds lane stacks so that for each color index c, sum(ammo of shooters with c) === pixel count of c.
 * Shooters are shuffled and randomly placed across lanes (mixed colors per lane), respecting maxDepth.
 */

export function countPixelsByColorIndex(gridColorIndices, numColors) {
    const counts = Array(numColors).fill(0);
    for (let r = 0; r < gridColorIndices.length; r += 1) {
        const row = gridColorIndices[r];
        for (let c = 0; c < row.length; c += 1) {
            const idx = row[c] % numColors;
            counts[idx] += 1;
        }
    }
    return counts;
}

function shuffleInPlace(array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = array[i];
        array[i] = array[j];
        array[j] = t;
    }
    return array;
}

/** Split n into `pieces` positive integers summing to n, each at most maxChunk (guaranteed if pieces = ceil(n/maxChunk)). */
function splitEvenish(n, pieces, maxChunk) {
    if (n === 0) {
        return [];
    }
    if (pieces <= 0) {
        return [];
    }
    const base = Math.floor(n / pieces);
    let rem = n % pieces;
    const out = [];
    for (let i = 0; i < pieces; i += 1) {
        const extra = i < rem ? 1 : 0;
        out.push(base + extra);
    }
    shuffleInPlace(out);
    const maxPart = out.length ? Math.max(...out) : 0;
    if (maxPart > maxChunk) {
        return splitEvenish(n, pieces + 1, maxChunk);
    }
    return out;
}

function minMaxChunkForCapacity(counts, capacity, startChunk) {
    let maxChunk = Math.max(1, startChunk);
    const safety = 500;
    let iter = 0;
    while (iter < safety) {
        const totalPieces = counts.reduce((sum, n) => sum + (n > 0 ? Math.ceil(n / maxChunk) : 0), 0);
        if (totalPieces <= capacity) {
            return maxChunk;
        }
        maxChunk += 1;
        iter += 1;
    }
    return maxChunk;
}

/**
 * @param {object} level - needs gridColorIndices, colors.length, laneCount, maxLaneDepth, optional queueMaxChunk (default 6)
 * @returns {Array<Array<{colorIndex:number, ammo:number}>>}
 */
export function buildInitialQueues(level) {
    const numColors = level.colors.length;
    const counts = countPixelsByColorIndex(level.gridColorIndices, numColors);
    const capacity = level.laneCount * level.maxLaneDepth;
    const startChunk = level.queueMaxChunk ?? 6;

    const maxChunk = minMaxChunkForCapacity(counts, capacity, startChunk);

    const flat = [];
    for (let c = 0; c < numColors; c += 1) {
        const n = counts[c];
        if (n <= 0) {
            continue;
        }
        const pieces = Math.ceil(n / maxChunk);
        const ammos = splitEvenish(n, pieces, maxChunk);
        for (let i = 0; i < ammos.length; i += 1) {
            flat.push({ colorIndex: c, ammo: ammos[i] });
        }
    }

    shuffleInPlace(flat);

    const lanes = Array.from({ length: level.laneCount }, () => []);
    for (let i = 0; i < flat.length; i += 1) {
        const entry = flat[i];
        const candidates = [];
        for (let L = 0; L < level.laneCount; L += 1) {
            if (lanes[L].length < level.maxLaneDepth) {
                candidates.push(L);
            }
        }
        if (candidates.length === 0) {
            break;
        }
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        lanes[pick].push(entry);
    }

    return lanes;
}
