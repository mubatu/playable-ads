/** Multiple FIFO lanes; index 0 in each lane is the front (only deployable). */
export class QueueLanes {
    constructor(laneArrays) {
        this.lanes = laneArrays.map((lane) => lane.map((e) => ({ color: e.color, ammo: e.ammo })));
    }

    peekFront(laneIndex) {
        const lane = this.lanes[laneIndex];
        if (!lane || lane.length === 0) {
            return null;
        }
        return lane[0];
    }

    popFront(laneIndex) {
        const lane = this.lanes[laneIndex];
        if (!lane || lane.length === 0) {
            return null;
        }
        return lane.shift();
    }

    snapshot() {
        return this.lanes.map((lane) => lane.map((e) => ({ color: e.color, ammo: e.ammo })));
    }

    isEveryLaneEmpty() {
        return this.lanes.every((lane) => lane.length === 0);
    }
}
