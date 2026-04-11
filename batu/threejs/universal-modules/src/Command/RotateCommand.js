// rotate-command.js
export class RotateCommand {
    constructor() {
        this.rotationSpeed = 0; // radians per second
        this.axis = 'y'; // 'x', 'y', or 'z'
    }

    execute(target, speed = 1, axis = 'y') {
        this.rotationSpeed = speed;
        this.axis = axis;
    }

    update(target, deltaTime) {
        if (this.rotationSpeed !== 0) {
            const rotationAmount = this.rotationSpeed * deltaTime;
            switch (this.axis) {
                case 'x':
                    target.rotation.x += rotationAmount;
                    break;
                case 'y':
                    target.rotation.y += rotationAmount;
                    break;
                case 'z':
                    target.rotation.z += rotationAmount;
                    break;
            }
        }
    }

    stop() {
        this.rotationSpeed = 0;
    }

    isActive() {
        return this.rotationSpeed !== 0;
    }
}