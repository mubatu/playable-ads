// scale-command.js
export class ScaleCommand {
    constructor() {
        this.targetScale = 1;
        this.currentScale = 1;
        this.scaleSpeed = 2; // units per second
    }

    execute(target, scale = 1, speed = 2) {
        this.targetScale = scale;
        this.scaleSpeed = speed;
    }

    update(target, deltaTime) {
        if (this.currentScale !== this.targetScale) {
            const direction = this.targetScale > this.currentScale ? 1 : -1;
            const scaleChange = this.scaleSpeed * deltaTime * direction;

            if (Math.abs(this.targetScale - this.currentScale) < Math.abs(scaleChange)) {
                this.currentScale = this.targetScale;
            } else {
                this.currentScale += scaleChange;
            }

            target.scale.setScalar(this.currentScale);
        }
    }

    setScale(target, scale) {
        this.currentScale = scale;
        this.targetScale = scale;
        target.scale.setScalar(scale);
    }

    isActive() {
        return this.currentScale !== this.targetScale;
    }
}