// attack-command.js
export class AttackCommand {
    constructor() {
        this.isAttacking = false;
        this.attackDuration = 0.5; // seconds
        this.elapsedTime = 0;
        this.damage = 10;
        this.range = 2;
    }

    execute(target, damage = 10, range = 2) {
        if (!this.isAttacking) {
            this.isAttacking = true;
            this.elapsedTime = 0;
            this.damage = damage;
            this.range = range;
            // Trigger attack animation or effect here
            console.log(`Attacking with ${damage} damage in ${range} range`);
        }
    }

    update(target, deltaTime) {
        if (this.isAttacking) {
            this.elapsedTime += deltaTime;

            if (this.elapsedTime >= this.attackDuration) {
                this.isAttacking = false;
                this.elapsedTime = 0;
            }
        }
    }

    isActive() {
        return this.isAttacking;
    }

    getProgress() {
        return Math.min(1, this.elapsedTime / this.attackDuration);
    }
}