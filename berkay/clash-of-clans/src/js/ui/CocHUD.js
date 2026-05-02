/**
 * Top resource bar, status line, and end overlay.
 * Intro + deploy badge live in `UIScene` via `getCocPlayableUIConfig`.
 */
export class CocHUD {
    constructor({ onDownload }) {
        this.onDownload = onDownload;

        this.root = null;
        this.statusEl = null;
        this.goldEl = null;
        this.elixirEl = null;
        this.endOverlay = null;
        this.endTitleEl = null;
        this.endSubtitleEl = null;
    }

    build() {
        this.injectStyles();

        this.root = document.createElement('div');
        this.root.className = 'coc-root';

        const topBar = document.createElement('div');
        topBar.className = 'coc-top';

        this.goldEl = document.createElement('div');
        this.goldEl.className = 'coc-resource coc-resource--gold';
        this.goldEl.innerHTML = '<span class="coc-resource__dot"></span><span class="coc-resource__value">0</span>';

        this.elixirEl = document.createElement('div');
        this.elixirEl.className = 'coc-resource coc-resource--elixir';
        this.elixirEl.innerHTML = '<span class="coc-resource__dot"></span><span class="coc-resource__value">0</span>';

        topBar.appendChild(this.goldEl);
        topBar.appendChild(this.elixirEl);

        this.statusEl = document.createElement('div');
        this.statusEl.className = 'coc-status';

        this.endOverlay = this.createOverlay('Done', '', 'DOWNLOAD', 'coc-download-btn');
        this.endOverlay.classList.remove('is-visible');
        this.endTitleEl = this.endOverlay.querySelector('.coc-overlay-title');
        this.endSubtitleEl = this.endOverlay.querySelector('.coc-overlay-subtitle');

        this.root.appendChild(topBar);
        this.root.appendChild(this.statusEl);
        this.root.appendChild(this.endOverlay);
        document.body.appendChild(this.root);

        this.endOverlay.querySelector('#coc-download-btn')?.addEventListener('click', () => this.onDownload());
    }

    createOverlay(title, subtitle, buttonText, id) {
        const overlay = document.createElement('div');
        overlay.className = 'coc-overlay is-visible';

        const titleEl = document.createElement('h2');
        titleEl.className = 'coc-overlay-title';
        titleEl.textContent = title;

        const subtitleEl = document.createElement('p');
        subtitleEl.className = 'coc-overlay-subtitle';
        subtitleEl.textContent = subtitle;

        const button = document.createElement('button');
        button.type = 'button';
        button.id = id;
        button.className = 'coc-overlay-button';
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

    setResources({ gold, elixir }) {
        if (this.goldEl) {
            this.goldEl.querySelector('.coc-resource__value').textContent = gold.toLocaleString();
        }
        if (this.elixirEl) {
            this.elixirEl.querySelector('.coc-resource__value').textContent = elixir.toLocaleString();
        }
    }

    showEnd(isWin, subtitle) {
        if (this.endTitleEl) {
            this.endTitleEl.textContent = isWin ? 'Victory!' : 'Defeat';
        }
        if (this.endSubtitleEl) {
            this.endSubtitleEl.textContent = subtitle ?? '';
        }
        this.endOverlay?.classList.add('is-visible');
    }

    injectStyles() {
        const styleId = 'coc-hud-style';
        if (document.getElementById(styleId)) {
            return;
        }
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .coc-root {
                position: fixed; inset: 0; pointer-events: none; z-index: 30;
                font-family: 'Segoe UI', Arial, sans-serif; color: #fff;
            }
            .coc-top {
                position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
                display: flex; gap: 10px; pointer-events: auto;
            }
            .coc-resource {
                display: flex; align-items: center; gap: 8px;
                padding: 6px 14px 6px 10px;
                border-radius: 999px;
                background: rgba(7, 13, 26, 0.85);
                border: 1px solid rgba(255, 255, 255, 0.18);
                font-weight: 700; font-size: 14px;
            }
            .coc-resource__dot { width: 14px; height: 14px; border-radius: 50%; box-shadow: inset 0 0 0 2px rgba(0,0,0,0.4); }
            .coc-resource--gold .coc-resource__dot   { background: #ffce4a; }
            .coc-resource--elixir .coc-resource__dot { background: #d76dff; }
            .coc-status {
                position: absolute; top: 56px; left: 50%; transform: translateX(-50%);
                background: rgba(7, 13, 26, 0.78);
                border: 1px solid rgba(255, 255, 255, 0.14);
                border-radius: 10px; padding: 7px 12px;
                font-size: 13px; max-width: 90vw; text-align: center;
            }
            .coc-overlay {
                position: absolute; inset: 0;
                display: none; align-items: center; justify-content: center;
                flex-direction: column; gap: 12px; text-align: center;
                background: rgba(4, 9, 20, 0.72); pointer-events: auto;
            }
            .coc-overlay.is-visible { display: flex; }
            .coc-overlay-title { margin: 0; font-size: 42px; }
            .coc-overlay-subtitle { margin: 0; max-width: 460px; line-height: 1.4; font-size: 15px; opacity: 0.92; }
            .coc-overlay-button {
                margin-top: 8px; border: none; border-radius: 999px;
                padding: 13px 28px; font-size: 17px; font-weight: 700; color: #fff;
                cursor: pointer;
                background: linear-gradient(180deg, #ff9a2f 0%, #ff4d2e 100%);
                box-shadow: 0 6px 18px rgba(255, 90, 30, 0.45);
            }
        `;
        document.head.appendChild(style);
    }
}
