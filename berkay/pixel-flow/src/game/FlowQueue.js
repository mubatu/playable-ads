export class FlowQueue {
    constructor(capacity) {
        this.capacity = capacity;
        this.items = [];
    }

    seed(entries) {
        this.items = entries.slice(0, this.capacity);
    }

    push(entry) {
        if (this.items.length >= this.capacity) {
            return false;
        }

        this.items.push(entry);
        return true;
    }

    popAt(index) {
        if (index < 0 || index >= this.items.length) {
            return null;
        }

        const [entry] = this.items.splice(index, 1);
        return entry || null;
    }

    isEmpty() {
        return this.items.length === 0;
    }

    snapshot() {
        return this.items.slice();
    }
}
