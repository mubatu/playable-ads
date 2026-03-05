/**
 * Timberman - A player character controlled by a virtual joystick
 * Procedurally drawn lumberjack with idle & walk animations
 */
export class Timberman {
    constructor(app, terrain, joystick) {
        this.app = app;
        this.terrain = terrain;
        this.joystick = joystick;

        this.container = new PIXI.Container();
        this.container.sortableChildren = true;
        this.app.stage.addChild(this.container);

        // Position (world coords)
        const bounds = this.terrain.bounds;
        this.x = bounds.cx;
        this.y = bounds.cy;

        // Movement
        this.speed = 2.5;
        this.moving = false;
        this.facingRight = true;

        // Animation
        this.animTime = 0;
        this.bobAmount = 0;

        // Build the character graphics
        this.character = new PIXI.Container();
        this.container.addChild(this.character);
        this._buildCharacter();

        // Position initially
        this.character.x = this.x;
        this.character.y = this.y;

        // Game loop
        this.app.ticker.add(this._update, this);
    }

    _buildCharacter() {
        // Clear previous
        this.character.removeChildren();

        // Shadow
        this.shadow = new PIXI.Graphics();
        this.shadow.ellipse(0, 0, 14, 6);
        this.shadow.fill({ color: 0x000000, alpha: 0.2 });
        this.character.addChild(this.shadow);

        // Body group (will bob up/down)
        this.bodyGroup = new PIXI.Container();
        this.character.addChild(this.bodyGroup);

        // Boots
        this.leftBoot = new PIXI.Graphics();
        this.leftBoot.roundRect(-10, -6, 8, 8, 2);
        this.leftBoot.fill(0x3d2b1f);
        this.bodyGroup.addChild(this.leftBoot);

        this.rightBoot = new PIXI.Graphics();
        this.rightBoot.roundRect(2, -6, 8, 8, 2);
        this.rightBoot.fill(0x3d2b1f);
        this.bodyGroup.addChild(this.rightBoot);

        // Legs (pants)
        const legs = new PIXI.Graphics();
        legs.roundRect(-9, -16, 7, 12, 1);
        legs.roundRect(2, -16, 7, 12, 1);
        legs.fill(0x4a6741);
        this.bodyGroup.addChild(legs);

        // Torso (red flannel shirt)
        const torso = new PIXI.Graphics();
        torso.roundRect(-11, -34, 22, 20, 3);
        torso.fill(0xcc3333);
        this.bodyGroup.addChild(torso);

        // Flannel pattern (darker stripes)
        const stripes = new PIXI.Graphics();
        for (let i = 0; i < 4; i++) {
            stripes.rect(-11, -34 + i * 5, 22, 2);
        }
        stripes.fill({ color: 0x991111, alpha: 0.4 });
        this.bodyGroup.addChild(stripes);

        // Belt
        const belt = new PIXI.Graphics();
        belt.rect(-11, -16, 22, 3);
        belt.fill(0x3d2b1f);
        this.bodyGroup.addChild(belt);

        // Arms
        this.leftArm = new PIXI.Graphics();
        this.leftArm.roundRect(-16, -32, 6, 16, 2);
        this.leftArm.fill(0xcc3333);
        this.bodyGroup.addChild(this.leftArm);

        this.rightArm = new PIXI.Graphics();
        this.rightArm.roundRect(10, -32, 6, 16, 2);
        this.rightArm.fill(0xcc3333);
        this.bodyGroup.addChild(this.rightArm);

        // Hands (skin color)
        this.leftHand = new PIXI.Graphics();
        this.leftHand.circle(-13, -14, 3);
        this.leftHand.fill(0xe8b89d);
        this.bodyGroup.addChild(this.leftHand);

        this.rightHand = new PIXI.Graphics();
        this.rightHand.circle(13, -14, 3);
        this.rightHand.fill(0xe8b89d);
        this.bodyGroup.addChild(this.rightHand);

        // Head
        const head = new PIXI.Graphics();
        head.circle(0, -42, 10);
        head.fill(0xe8b89d);
        this.bodyGroup.addChild(head);

        // Eyes
        const leftEye = new PIXI.Graphics();
        leftEye.circle(-4, -44, 1.5);
        leftEye.fill(0x222222);
        this.bodyGroup.addChild(leftEye);

        const rightEye = new PIXI.Graphics();
        rightEye.circle(4, -44, 1.5);
        rightEye.fill(0x222222);
        this.bodyGroup.addChild(rightEye);

        // Beard
        const beard = new PIXI.Graphics();
        beard.moveTo(-6, -39);
        beard.quadraticCurveTo(-7, -33, 0, -31);
        beard.quadraticCurveTo(7, -33, 6, -39);
        beard.fill(0x5c3a1e);
        this.bodyGroup.addChild(beard);

        // Beanie / hat
        const hat = new PIXI.Graphics();
        hat.roundRect(-10, -55, 20, 12, 4);
        hat.fill(0x2255aa);
        this.bodyGroup.addChild(hat);

        // Hat brim
        const brim = new PIXI.Graphics();
        brim.roundRect(-11, -45, 22, 4, 2);
        brim.fill(0x1a4488);
        this.bodyGroup.addChild(brim);

        // Axe (on right side)
        this.axeGroup = new PIXI.Container();
        this.bodyGroup.addChild(this.axeGroup);

        // Axe handle
        const handle = new PIXI.Graphics();
        handle.rect(14, -30, 3, 22);
        handle.fill(0x8B6914);
        this.axeGroup.addChild(handle);

        // Axe head
        const axeHead = new PIXI.Graphics();
        axeHead.moveTo(17, -30);
        axeHead.lineTo(28, -34);
        axeHead.lineTo(28, -24);
        axeHead.closePath();
        axeHead.fill(0xaaaaaa);
        this.axeGroup.addChild(axeHead);

        // Axe head shine
        const shine = new PIXI.Graphics();
        shine.moveTo(20, -30);
        shine.lineTo(25, -32);
        shine.lineTo(25, -27);
        shine.closePath();
        shine.fill({ color: 0xdddddd, alpha: 0.6 });
        this.axeGroup.addChild(shine);
    }

    _update(ticker) {
        const dt = ticker.deltaTime;
        const dir = this.joystick.direction;
        const magnitude = Math.sqrt(dir.x * dir.x + dir.y * dir.y);

        // Move based on joystick input
        if (this.joystick.isActive() && magnitude > 0.1) {
            this.moving = true;

            const vx = dir.x * this.speed * dt;
            const vy = dir.y * this.speed * dt;

            let newX = this.x + vx;
            let newY = this.y + vy;

            // Clamp to terrain ellipse
            const bounds = this.terrain.bounds;
            const ex = (newX - bounds.cx) / bounds.radiusX;
            const ey = (newY - bounds.cy) / bounds.radiusY;
            const edist = Math.sqrt(ex * ex + ey * ey);

            if (edist > 1) {
                newX = bounds.cx + (ex / edist) * bounds.radiusX * 0.98;
                newY = bounds.cy + (ey / edist) * bounds.radiusY * 0.98;
            }

            this.x = newX;
            this.y = newY;

            // Face direction of movement
            if (Math.abs(dir.x) > 0.1) {
                this.facingRight = dir.x > 0;
            }
        } else {
            this.moving = false;
        }

        // Animation
        if (this.moving) {
            this.animTime += dt * 0.15;
            this.bobAmount = Math.sin(this.animTime * Math.PI * 2) * 2;

            // Leg animation (walk cycle)
            const legSwing = Math.sin(this.animTime * Math.PI * 2) * 3;
            this.leftBoot.y = legSwing;
            this.rightBoot.y = -legSwing;

            // Arm swing
            this.leftArm.y = -legSwing * 0.5;
            this.rightArm.y = legSwing * 0.5;
            this.leftHand.y = -legSwing * 0.5;
            this.rightHand.y = legSwing * 0.5;
        } else {
            // Idle breathing
            this.animTime += dt * 0.03;
            this.bobAmount = Math.sin(this.animTime * Math.PI * 2) * 0.5;

            // Reset leg positions
            this.leftBoot.y = 0;
            this.rightBoot.y = 0;
            this.leftArm.y = 0;
            this.rightArm.y = 0;
            this.leftHand.y = 0;
            this.rightHand.y = 0;
        }

        // Apply bob to body
        this.bodyGroup.y = this.bobAmount;

        // Flip character based on facing direction
        this.character.scale.x = this.facingRight ? 1 : -1;

        // Update position
        this.character.x = this.x;
        this.character.y = this.y;

        // Z-index for depth sorting with trees
        this.character.zIndex = Math.floor(this.y);
        this.container.zIndex = Math.floor(this.y);
    }

    resize() {
        // Re-clamp position to new terrain bounds
        const bounds = this.terrain.bounds;
        const dx = (this.x - bounds.cx) / bounds.radiusX;
        const dy = (this.y - bounds.cy) / bounds.radiusY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1) {
            this.x = bounds.cx + (dx / dist) * bounds.radiusX * 0.9;
            this.y = bounds.cy + (dy / dist) * bounds.radiusY * 0.9;
        }

        this.character.x = this.x;
        this.character.y = this.y;
    }

    destroy() {
        this.app.ticker.remove(this._update, this);
        this.container.destroy({ children: true });
    }
}
