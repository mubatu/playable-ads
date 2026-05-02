/**
 * Dense FIFO-style storage (not fixed-slot holes): pigs are packed from index 0.
 * Any index 0..length-1 is clickable; removing one compacts the list.
 */
export class ShooterBucket {
    constructor(capacity) {
        this.capacity = capacity;
        /** @type {Array<{color:number, ammo:number}>} */
        this.items = [];
    }

    tryAdd(entry) {
        if (this.items.length >= this.capacity) {
            return false;
        }
        this.items.push({ color: entry.color, ammo: entry.ammo });
        return true;
    }

    /**
     * @param {number} index - visual slot index (0 = leftmost pig in the bucket row)
     */
    takeAt(index) {
        if (index < 0 || index >= this.items.length) {
            return null;
        }
        const [removed] = this.items.splice(index, 1);
        return removed || null;
    }

    /** Padded to capacity for fixed HUD buttons; only indices < items.length are filled. */
    snapshot() {
        const row = Array(this.capacity).fill(null);
        for (let i = 0; i < this.items.length; i += 1) {
            row[i] = this.items[i];
        }
        return row;
    }

    countFilled() {
        return this.items.length;
    }
}
