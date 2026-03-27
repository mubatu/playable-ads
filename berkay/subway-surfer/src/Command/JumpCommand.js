// jump-command.js
export class JumpCommand {
    constructor() {
        this.isJumping = false;
        this.jumpForce = 0;
        this.gravity = -9.81;
        this.velocity = 0;
    }

    execute(target, jumpForce = 5) {
        if (!this.isJumping) {
            this.isJumping = true;
            this.jumpForce = jumpForce;
            this.velocity = jumpForce;
        }
    }

    update(target, deltaTime) {
        if (this.isJumping) {
            // Apply gravity
            this.velocity += this.gravity * deltaTime;
            target.position.y += this.velocity * deltaTime;

            // Check if landed (assuming ground is at y=0)
            if (target.position.y <= 0) {
                target.position.y = 0;
                this.isJumping = false;
                this.velocity = 0;
            }
        }
    }

    isActive() {
        return this.isJumping;
    }
}