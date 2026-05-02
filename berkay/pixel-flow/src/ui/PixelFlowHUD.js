export class PixelFlowHUD {
    constructor({ onPlay, onQueueTap, onDownload }) {
        this.onPlay = onPlay;
        this.onQueueTap = onQueueTap;
        this.onDownload = onDownload;

        this.root = null;
        this.statusEl = null;
        this.progressEl = null;
        this.queueEl = null;
        this.playOverlay = null;
        this.endOverlay = null;
        this.endTitleEl = null;
    }

    build() {
        this.injectStyles();

        this.root = document.createElement('div');
        this.root.className = 'pf-root';

        this.statusEl = document.createElement('div');
        this.statusEl.className = 'pf-status';

        this.progressEl = document.createElement('div');
        this.progressEl.className = 'pf-progress';

        this.queueEl = document.createElement('div');
        this.queueEl.className = 'pf-queue';

        this.playOverlay = this.createOverlay('Pixel Flow!', 'Tap pigs from the 5-slot queue and clear matching pixels.', 'PLAY NOW', 'pf-play-btn');
        this.endOverlay = this.createOverlay('Done', 'Great flow.', 'DOWNLOAD', 'pf-download-btn');
        this.endOverlay.classList.remove('is-visible');
        this.endTitleEl = this.endOverlay.querySelector('.pf-overlay-title');

        this.root.appendChild(this.statusEl);
        this.root.appendChild(this.progressEl);
        this.root.appendChild(this.queueEl);
        this.root.appendChild(this.playOverlay);
        this.root.appendChild(this.endOverlay);
        document.body.appendChild(this.root);

        this.playOverlay.querySelector('#pf-play-btn')?.addEventListener('click', () => this.onPlay());
        this.endOverlay.querySelector('#pf-download-btn')?.addEventListener('click', () => this.onDownload());
    }

    createOverlay(title, subtitle, buttonText, id) {
        const overlay = document.createElement('div');
        overlay.className = 'pf-overlay is-visible';

        const titleEl = document.createElement('h2');
        titleEl.className = 'pf-overlay-title';
        titleEl.textContent = title;

        const subtitleEl = document.createElement('p');
        subtitleEl.className = 'pf-overlay-subtitle';
        subtitleEl.textContent = subtitle;

        const button = document.createElement('button');
        button.type = 'button';
        button.id = id;
        button.className = 'pf-overlay-button';
        button.textContent = buttonText;

        overlay.appendChild(titleEl);
        overlay.appendChild(subtitleEl);
        overlay.appendChild(button);
        return overlay;
    }

    hidePlayOverlay() {
        this.playOverlay?.classList.remove('is-visible');
    }

    setStatus(text) {
        if (this.statusEl) {
            this.statusEl.textContent = text;
        }
    }

    setProgress(cleared, total) {
        if (this.progressEl) {
            this.progressEl.textContent = `Pixels: ${cleared}/${total}`;
        }
    }

    setQueue(entries, capacity) {
        if (!this.queueEl) {
            return;
        }

        this.queueEl.innerHTML = '';
        for (let index = 0; index < capacity; index += 1) {
            const entry = entries[index];
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'pf-queue-slot';

            if (entry) {
                button.style.background = `#${entry.color.toString(16).padStart(6, '0')}`;
                button.textContent = `${entry.ammo}`;
                button.disabled = false;
                button.addEventListener('click', () => this.onQueueTap(index));
            } else {
                button.classList.add('is-empty');
                button.disabled = true;
                button.textContent = '';
            }

            this.queueEl.appendChild(button);
        }
    }

    showEnd(isWin) {
        if (this.endTitleEl) {
            this.endTitleEl.textContent = isWin ? 'You Win!' : 'You Lose!';
        }
        this.endOverlay?.classList.add('is-visible');
    }

    getQueueButtonCenter(index) {
        if (!this.queueEl || index < 0 || index >= this.queueEl.children.length) {
            return null;
        }

        const element = this.queueEl.children[index];
        const rect = element.getBoundingClientRect();
        return {
            x: rect.left + rect.width * 0.5,
            y: rect.top + rect.height * 0.5
        };
    }

    injectStyles() {
        const styleId = 'pf-hud-style';
        if (document.getElementById(styleId)) {
            return;
        }

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .pf-root { position: fixed; inset: 0; pointer-events: none; z-index: 30; font-family: Arial, sans-serif; color: #fff; }
            .pf-status, .pf-progress {
                position: absolute;
                left: 16px;
                background: rgba(7, 13, 26, 0.8);
                border: 1px solid rgba(255,255,255,0.18);
                border-radius: 12px;
                padding: 9px 12px;
                font-size: 14px;
                max-width: 280px;
            }
            .pf-status { top: 16px; }
            .pf-progress { top: 66px; }
            .pf-queue {
                position: absolute;
                left: 50%;
                bottom: 24px;
                transform: translateX(-50%);
                display: grid;
                grid-template-columns: repeat(5, 62px);
                gap: 10px;
                pointer-events: auto;
            }
            .pf-queue-slot {
                width: 62px; height: 62px;
                border: 2px solid rgba(255,255,255,0.6);
                border-radius: 14px;
                color: #fff;
                font-weight: 700;
                font-size: 20px;
                cursor: pointer;
                text-shadow: 0 1px 2px rgba(0,0,0,0.4);
            }
            .pf-queue-slot.is-empty {
                border-color: rgba(255,255,255,0.2);
                background: rgba(255,255,255,0.08) !important;
                cursor: default;
            }
            .pf-overlay {
                position: absolute; inset: 0;
                display: none; align-items: center; justify-content: center; flex-direction: column;
                gap: 10px; text-align: center; pointer-events: auto;
                background: rgba(4, 9, 20, 0.68);
            }
            .pf-overlay.is-visible { display: flex; }
            .pf-overlay-title { margin: 0; font-size: 46px; }
            .pf-overlay-subtitle { margin: 0; max-width: 420px; line-height: 1.35; }
            .pf-overlay-button {
                margin-top: 8px; border: none; border-radius: 999px; padding: 14px 28px;
                font-size: 18px; font-weight: 700; color: #fff; cursor: pointer;
                background: linear-gradient(180deg, #65ccff 0%, #2f67ff 100%);
            }
        `;
        document.head.appendChild(style);
    }
}
