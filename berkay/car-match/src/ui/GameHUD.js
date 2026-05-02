export class GameHUD {
    constructor(options = {}) {
        this.options = {
            onPlay: () => {},
            onDownload: () => {},
            ...options
        };

        this.root = null;
        this.trayEl = null;
        this.statusEl = null;
        this.playOverlay = null;
        this.endOverlay = null;
        this.endTitleEl = null;
    }

    build() {
        this.injectStyles();

        this.root = document.createElement('div');
        this.root.className = 'cm-root';

        this.statusEl = document.createElement('div');
        this.statusEl.className = 'cm-status';

        this.trayEl = document.createElement('div');
        this.trayEl.className = 'cm-tray';

        this.playOverlay = this.createOverlay('Car Match', 'Tap visible cars to collect and match 3 colors.', 'PLAY NOW', 'cm-play-btn');
        this.endOverlay = this.createOverlay('Done', 'Great drive.', 'DOWNLOAD', 'cm-download-btn');
        this.endOverlay.classList.remove('is-visible');

        this.endTitleEl = this.endOverlay.querySelector('.cm-overlay-title');

        this.root.appendChild(this.statusEl);
        this.root.appendChild(this.trayEl);
        this.root.appendChild(this.playOverlay);
        this.root.appendChild(this.endOverlay);
        document.body.appendChild(this.root);

        this.playOverlay.querySelector('#cm-play-btn')?.addEventListener('click', () => this.options.onPlay());
        this.endOverlay.querySelector('#cm-download-btn')?.addEventListener('click', () => this.options.onDownload());
    }

    createOverlay(title, subtitle, buttonText, buttonId) {
        const overlay = document.createElement('div');
        overlay.className = 'cm-overlay is-visible';

        const titleEl = document.createElement('h2');
        titleEl.className = 'cm-overlay-title';
        titleEl.textContent = title;

        const subtitleEl = document.createElement('p');
        subtitleEl.className = 'cm-overlay-subtitle';
        subtitleEl.textContent = subtitle;

        const button = document.createElement('button');
        button.type = 'button';
        button.id = buttonId;
        button.className = 'cm-overlay-button';
        button.textContent = buttonText;

        overlay.appendChild(titleEl);
        overlay.appendChild(subtitleEl);
        overlay.appendChild(button);
        return overlay;
    }

    setStatus(text) {
        if (this.statusEl) {
            this.statusEl.textContent = text;
        }
    }

    setTray(colors, capacity) {
        if (!this.trayEl) {
            return;
        }

        this.trayEl.innerHTML = '';
        for (let index = 0; index < capacity; index += 1) {
            const slot = document.createElement('div');
            slot.className = 'cm-tray-slot';

            const color = colors[index];
            if (color !== undefined) {
                slot.style.background = `#${color.toString(16).padStart(6, '0')}`;
                slot.classList.add('is-filled');
            }

            this.trayEl.appendChild(slot);
        }
    }

    showEnd(isWin) {
        if (this.endTitleEl) {
            this.endTitleEl.textContent = isWin ? 'You Win!' : 'You Lose!';
        }
        this.endOverlay?.classList.add('is-visible');
    }

    hidePlay() {
        this.playOverlay?.classList.remove('is-visible');
    }

    injectStyles() {
        const styleId = 'cm-hud-style';
        if (document.getElementById(styleId)) {
            return;
        }

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .cm-root {
                position: fixed;
                inset: 0;
                pointer-events: none;
                font-family: Arial, sans-serif;
                color: #fff;
                z-index: 20;
            }
            .cm-status {
                position: absolute;
                top: 16px;
                left: 16px;
                background: rgba(9, 19, 34, 0.82);
                border: 1px solid rgba(255, 255, 255, 0.16);
                border-radius: 12px;
                padding: 10px 12px;
                font-size: 14px;
                max-width: 260px;
            }
            .cm-tray {
                position: absolute;
                left: 50%;
                bottom: 24px;
                transform: translateX(-50%);
                display: grid;
                grid-template-columns: repeat(7, 52px);
                gap: 8px;
            }
            .cm-tray-slot {
                width: 52px;
                height: 52px;
                border-radius: 12px;
                border: 2px solid rgba(255, 255, 255, 0.2);
                background: rgba(255, 255, 255, 0.06);
                box-shadow: inset 0 0 0 2px rgba(12, 24, 44, 0.4);
            }
            .cm-tray-slot.is-filled {
                border-color: rgba(255, 255, 255, 0.65);
                box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.58);
            }
            .cm-overlay {
                position: absolute;
                inset: 0;
                display: none;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                gap: 12px;
                text-align: center;
                background: rgba(5, 11, 21, 0.66);
                pointer-events: auto;
            }
            .cm-overlay.is-visible {
                display: flex;
            }
            .cm-overlay-title {
                margin: 0;
                font-size: 42px;
                letter-spacing: 0.6px;
            }
            .cm-overlay-subtitle {
                margin: 0;
                max-width: 420px;
                line-height: 1.35;
                opacity: 0.9;
            }
            .cm-overlay-button {
                margin-top: 8px;
                border: none;
                border-radius: 999px;
                padding: 14px 28px;
                font-weight: 700;
                font-size: 18px;
                color: #fff;
                background: linear-gradient(180deg, #ff9a2f 0%, #ff4d2e 100%);
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    }
}
