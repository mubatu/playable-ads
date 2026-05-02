export class TrayMatcher {
    constructor(capacity, onMatchResolved) {
        this.capacity = capacity;
        this.onMatchResolved = onMatchResolved || (() => {});
        this.slots = [];
    }

    canAdd() {
        return this.slots.length < this.capacity;
    }

    addCar(carData) {
        if (!this.canAdd()) {
            return { accepted: false, matched: false };
        }

        this.slots.push(carData);
        const color = carData.color;
        const sameColorItems = this.slots.filter((entry) => entry.color === color);

        if (sameColorItems.length < 3) {
            return { accepted: true, matched: false };
        }

        const removeRefs = new Set(sameColorItems.slice(0, 3).map((entry) => entry.ref));
        const matched = [];
        this.slots = this.slots.filter((entry) => {
            if (!removeRefs.has(entry.ref)) {
                return true;
            }

            matched.push(entry);
            return false;
        });

        this.onMatchResolved(matched);
        return { accepted: true, matched: true, matchedEntries: matched };
    }
}
