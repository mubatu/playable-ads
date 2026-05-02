/**
 * Multi-lane queues: only the front shooter (top of each column) is clickable.
 * Bucket: dense left-packed list — any visible pig is clickable at any time (not queue-like).
 */
export class PixelFlowHUD {
    constructor({ onPlay, onQueueFrontTap, onBucketTap, onDownload }) {
        this.onPlay = onPlay;
        this.onQueueFrontTap = onQueueFrontTap;
        this.onBucketTap = onBucketTap;
        this.onDownload = onDownload;

        this.root = null;
        this.statusEl = null;
        this.progressEl = null;
        this.lanesRow = null;
        this.laneSlotButtons = [];
        this.bucketRow = null;
        this.bucketButtons = [];
        this.laneCount = 0;
        this.maxLaneDepth = 0;
        this.bucketCapacity = 0;
        this.playOverlay = null;
        this.endOverlay = null;
        this.endTitleEl = null;
    }

    build({ laneCount, maxLaneDepth, bucketCapacity }) {
        this.laneCount = laneCount;
        this.maxLaneDepth = maxLaneDepth;
        this.bucketCapacity = bucketCapacity;
        this.injectStyles();

        this.root = document.createElement('div');
        this.root.className = 'pf-root';

        this.statusEl = document.createElement('div');
        this.statusEl.className = 'pf-status';

        this.progressEl = document.createElement('div');
        this.progressEl.className = 'pf-progress';

        this.lanesRow = document.createElement('div');
        this.lanesRow.className = 'pf-lanes-row';

        for (let lane = 0; lane < laneCount; lane += 1) {
            const col = document.createElement('div');
            col.className = 'pf-lane';
            const stack = document.createElement('div');
            stack.className = 'pf-lane-stack';
            const buttons = [];
            for (let depth = 0; depth < maxLaneDepth; depth += 1) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'pf-queue-slot pf-queue-slot--stacked';
                const laneIndex = lane;
                btn.addEventListener('click', () => {
                    if (btn.dataset.front === '1' && btn.dataset.empty !== '1') {
                        this.onQueueFrontTap(laneIndex);
                    }
                });
                stack.appendChild(btn);
                buttons.push(btn);
            }
            col.appendChild(stack);
            this.lanesRow.appendChild(col);
            this.laneSlotButtons.push(buttons);
        }

        const bucketWrap = document.createElement('div');
        bucketWrap.className = 'pf-bucket-wrap';
        const bucketLabel = document.createElement('div');
        bucketLabel.className = 'pf-bucket-label';
        bucketLabel.textContent = 'Bucket';
        this.bucketRow = document.createElement('div');
        this.bucketRow.className = 'pf-bucket-row';

        for (let b = 0; b < bucketCapacity; b += 1) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'pf-bucket-slot';
            const idx = b;
            btn.addEventListener('click', () => {
                if (btn.dataset.empty !== '1') {
                    this.onBucketTap(idx);
                }
            });
            this.bucketRow.appendChild(btn);
            this.bucketButtons.push(btn);
        }

        bucketWrap.appendChild(bucketLabel);
        bucketWrap.appendChild(this.bucketRow);

        this.playOverlay = this.createOverlay(
            'Pixel Flow!',
            'Queues: only the front pig deploys. Bucket: tap any pig inside. Up to 5 pigs can run the path at once.',
            'PLAY NOW',
            'pf-play-btn'
        );
        this.endOverlay = this.createOverlay('Done', '', 'DOWNLOAD', 'pf-download-btn');
        this.endOverlay.classList.remove('is-visible');
        this.endTitleEl = this.endOverlay.querySelector('.pf-overlay-title');

        this.root.appendChild(this.statusEl);
        this.root.appendChild(this.progressEl);
        this.root.appendChild(this.lanesRow);
        this.root.appendChild(bucketWrap);
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

    updateLanes(snapshot) {
        for (let lane = 0; lane < this.laneCount; lane += 1) {
            const laneData = snapshot[lane] || [];
            const buttons = this.laneSlotButtons[lane];
            for (let depth = 0; depth < this.maxLaneDepth; depth += 1) {
                const btn = buttons[depth];
                const entry = laneData[depth];
                if (!entry) {
                    btn.dataset.empty = '1';
                    btn.dataset.front = '0';
                    btn.textContent = '';
                    btn.style.background = '';
                    btn.style.opacity = '0.2';
                    btn.style.visibility = 'hidden';
                    btn.style.pointerEvents = 'none';
                    continue;
                }
                btn.style.visibility = 'visible';
                btn.dataset.empty = '0';
                btn.style.background = `#${entry.color.toString(16).padStart(6, '0')}`;
                btn.textContent = String(entry.ammo);
                if (depth === 0) {
                    btn.dataset.front = '1';
                    btn.style.opacity = '1';
                    btn.style.cursor = 'pointer';
                    btn.style.pointerEvents = 'auto';
                    btn.classList.remove('pf-queue-slot--blocked');
                } else {
                    btn.dataset.front = '0';
                    btn.style.opacity = '0.38';
                    btn.style.cursor = 'default';
                    btn.style.pointerEvents = 'none';
                    btn.classList.add('pf-queue-slot--blocked');
                }
            }
        }
    }

    updateBucket(slots) {
        for (let i = 0; i < this.bucketCapacity; i += 1) {
            const btn = this.bucketButtons[i];
            const entry = slots[i];
            if (!entry) {
                btn.dataset.empty = '1';
                btn.textContent = '';
                btn.style.background = '';
                btn.style.opacity = '0.35';
                btn.style.cursor = 'default';
                btn.style.pointerEvents = 'none';
                continue;
            }
            btn.dataset.empty = '0';
            btn.style.background = `#${entry.color.toString(16).padStart(6, '0')}`;
            btn.textContent = String(entry.ammo);
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            btn.style.pointerEvents = 'auto';
        }
    }

    showEnd(isWin) {
        if (this.endTitleEl) {
            this.endTitleEl.textContent = isWin ? 'You Win!' : 'You Lose!';
        }
        this.endOverlay?.classList.add('is-visible');
    }

    getFrontSlotCenter(laneIndex) {
        const btn = this.laneSlotButtons[laneIndex]?.[0];
        if (!btn || btn.style.visibility === 'hidden') {
            return null;
        }
        const rect = btn.getBoundingClientRect();
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
                left: 12px;
                background: rgba(7, 13, 26, 0.82);
                border: 1px solid rgba(255,255,255,0.16);
                border-radius: 10px;
                padding: 8px 10px;
                font-size: 13px;
                max-width: 300px;
            }
            .pf-status { top: 10px; }
            .pf-progress { top: 52px; }
            .pf-lanes-row {
                position: absolute;
                left: 50%;
                bottom: 6vh;
                transform: translateX(-50%);
                display: flex;
                flex-direction: row;
                gap: 12px;
                pointer-events: auto;
            }
            .pf-lane-stack {
                display: flex;
                flex-direction: column;
                gap: 6px;
                align-items: center;
            }
            .pf-queue-slot--stacked {
                width: 52px;
                height: 44px;
                border: 2px solid rgba(255,255,255,0.55);
                border-radius: 10px;
                color: #fff;
                font-weight: 700;
                font-size: 17px;
                text-shadow: 0 1px 2px rgba(0,0,0,0.45);
            }
            .pf-queue-slot--blocked {
                filter: brightness(0.72);
            }
            .pf-bucket-wrap {
                position: absolute;
                left: 50%;
                bottom: 1.5vh;
                transform: translateX(-50%);
                pointer-events: auto;
                text-align: center;
            }
            .pf-bucket-label { font-size: 12px; opacity: 0.85; margin-bottom: 4px; }
            .pf-bucket-row { display: flex; flex-direction: row; gap: 8px; justify-content: center; }
            .pf-bucket-slot {
                width: 48px;
                height: 44px;
                border: 2px dashed rgba(255,255,255,0.45);
                border-radius: 10px;
                color: #fff;
                font-weight: 700;
                font-size: 16px;
                cursor: pointer;
                background: rgba(255,255,255,0.06);
            }
            .pf-overlay {
                position: absolute; inset: 0;
                display: none; align-items: center; justify-content: center; flex-direction: column;
                gap: 10px; text-align: center; pointer-events: auto;
                background: rgba(4, 9, 20, 0.7);
            }
            .pf-overlay.is-visible { display: flex; }
            .pf-overlay-title { margin: 0; font-size: 40px; }
            .pf-overlay-subtitle { margin: 0; max-width: 460px; line-height: 1.35; font-size: 15px; }
            .pf-overlay-button {
                margin-top: 8px; border: none; border-radius: 999px; padding: 12px 26px;
                font-size: 17px; font-weight: 700; color: #fff; cursor: pointer;
                background: linear-gradient(180deg, #65ccff 0%, #2f67ff 100%);
            }
        `;
        document.head.appendChild(style);
    }
}
