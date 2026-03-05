import Phaser from 'phaser';

class UIScene extends Phaser.Scene {
    constructor() { super('UIScene'); }

    create() {
        const { width, height } = this.scale;
        const btnBg = this.add.rectangle(width / 2, height - 100, 250, 60, 0xffcc00, 1)
            .setInteractive({ useHandCursor: true }).setOrigin(0.5);
        const btnText = this.add.text(width / 2, height - 100, 'PLAY NOW', {
            fontFamily: 'Arial Black', fontSize: 24, color: '#000000'
        }).setOrigin(0.5);

        this.tweens.add({ targets: [btnBg, btnText], scaleX: 1.1, scaleY: 1.1, yoyo: true, repeat: -1, duration: 800 });

        btnBg.on('pointerdown', () => { alert("Redirecting to App Store..."); });

        // Event Bridge: Send swipe data to Three.js
        this.input.on('pointermove', (pointer) => {
            if (pointer.isDown) {
                const deltaX = pointer.x - pointer.prevPosition.x;
                const deltaY = pointer.y - pointer.prevPosition.y;
                window.dispatchEvent(new CustomEvent('rotate3DModel', { detail: { x: deltaX, y: deltaY } }));
            }
        });
    }
}

export function initPhaser() {
    return new Phaser.Game({
        type: Phaser.CANVAS, width: window.innerWidth, height: window.innerHeight,
        parent: 'phaser-container', transparent: true,
        scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
        scene: [UIScene]
    });
}