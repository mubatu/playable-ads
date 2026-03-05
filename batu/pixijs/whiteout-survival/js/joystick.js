/**
 * Joystick - Virtual joystick that appears wherever the user touches/clicks.
 * Works with both touch (mobile) and mouse (desktop).
 * Rendered as a PixiJS overlay so it stays on top of the game scene.
 */
export class Joystick {
    constructor(app) {
        this.app = app;

        // Config
        this.baseRadius = 50;
        this.thumbRadius = 20;
        this.maxDist = this.baseRadius;

        // State
        this.active = false;
        this.originX = 0;
        this.originY = 0;
        this.direction = { x: 0, y: 0 }; // normalized -1..1
        this._trackingId = null;

        // Container rendered on top of everything
        this.container = new PIXI.Container();
        this.container.zIndex = 999999;
        this.app.stage.addChild(this.container);

        // Base circle (outer ring)
        this.base = new PIXI.Graphics();
        this.container.addChild(this.base);

        // Thumb (inner knob)
        this.thumb = new PIXI.Graphics();
        this.container.addChild(this.thumb);

        this.container.visible = false;

        this._setupEvents();
    }

    _drawBase(x, y) {
        this.base.clear();
        // Outer ring
        this.base.circle(x, y, this.baseRadius);
        this.base.fill({ color: 0x000000, alpha: 0.15 });
        this.base.circle(x, y, this.baseRadius);
        this.base.stroke({ color: 0xffffff, width: 2, alpha: 0.35 });
    }

    _drawThumb(x, y) {
        this.thumb.clear();
        this.thumb.circle(x, y, this.thumbRadius);
        this.thumb.fill({ color: 0xffffff, alpha: 0.5 });
        this.thumb.circle(x, y, this.thumbRadius);
        this.thumb.stroke({ color: 0xffffff, width: 2, alpha: 0.7 });
    }

    _show(x, y) {
        this.originX = x;
        this.originY = y;
        this._drawBase(x, y);
        this._drawThumb(x, y);
        this.container.visible = true;
        this.active = true;
    }

    _hide() {
        this.container.visible = false;
        this.direction.x = 0;
        this.direction.y = 0;
        this.active = false;
        this._trackingId = null;
    }

    _move(px, py) {
        let dx = px - this.originX;
        let dy = py - this.originY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Clamp to base radius
        if (dist > this.maxDist) {
            dx = (dx / dist) * this.maxDist;
            dy = (dy / dist) * this.maxDist;
        }

        // Update thumb position
        this._drawThumb(this.originX + dx, this.originY + dy);

        // Normalize to -1..1
        this.direction.x = dx / this.maxDist;
        this.direction.y = dy / this.maxDist;
    }

    _setupEvents() {
        const canvas = this.app.canvas;

        // --- Touch events ---
        canvas.addEventListener('touchstart', (e) => {
            if (this.active) return;
            const t = e.changedTouches[0];
            this._trackingId = t.identifier;
            this._show(t.clientX, t.clientY);
            e.preventDefault();
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            if (!this.active) return;
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === this._trackingId) {
                    this._move(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
                    break;
                }
            }
            e.preventDefault();
        }, { passive: false });

        canvas.addEventListener('touchend', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === this._trackingId) {
                    this._hide();
                    break;
                }
            }
        });

        canvas.addEventListener('touchcancel', () => this._hide());

        // --- Mouse fallback (desktop testing) ---
        canvas.addEventListener('mousedown', (e) => {
            if (this.active) return;
            this._show(e.clientX, e.clientY);
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.active) return;
            this._move(e.clientX, e.clientY);
        });

        window.addEventListener('mouseup', () => {
            if (this.active) this._hide();
        });
    }

    isActive() {
        return this.active;
    }
}
