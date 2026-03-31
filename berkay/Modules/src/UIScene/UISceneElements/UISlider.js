// ui-slider.js
import { UISceneElement } from './UISceneElement.js';

export class UISlider extends UISceneElement {
    constructor(config, container) {
        super(config, container);
        this.value = config.initialValue || 0;
        this.min = config.min || 0;
        this.max = config.max || 100;
        this.step = config.step || 1;
        this.onValueChange = config.onValueChange || (() => {});
    }

    build() {
        // Create container
        this.element = document.createElement('div');
        this.element.id = this.config.id;

        Object.assign(this.element.style, {
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            ...this.config.styles
        });

        // Create track
        this.track = document.createElement('div');
        Object.assign(this.track.style, {
            flex: '1',
            height: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '3px',
            position: 'relative',
            cursor: 'pointer'
        });

        // Create fill
        this.fill = document.createElement('div');
        Object.assign(this.fill.style, {
            height: '100%',
            backgroundColor: '#4CAF50',
            borderRadius: '3px',
            width: '0%'
        });

        // Create thumb
        this.thumb = document.createElement('div');
        Object.assign(this.thumb.style, {
            position: 'absolute',
            width: '20px',
            height: '20px',
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            cursor: 'pointer',
            top: '50%',
            left: '0%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        });

        // Create value display
        this.valueDisplay = document.createElement('span');
        this.valueDisplay.textContent = this.value;
        Object.assign(this.valueDisplay.style, {
            marginLeft: '10px',
            color: '#ffffff',
            fontSize: '14px',
            minWidth: '30px',
            textAlign: 'center'
        });

        this.track.appendChild(this.fill);
        this.track.appendChild(this.thumb);
        this.element.appendChild(this.track);
        this.element.appendChild(this.valueDisplay);

        this.activate();
        this.container.appendChild(this.element);

        this.updateUI();
        this.bindEvents();
    }

    bindEvents() {
        const handleInteraction = (clientX) => {
            const rect = this.track.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            this.setValue(this.min + ratio * (this.max - this.min));
        };

        this.track.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            handleInteraction(e.clientX);
            this.isDragging = true;
        });

        this.thumb.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            this.isDragging = true;
        });

        window.addEventListener('pointermove', (e) => {
            if (this.isDragging) {
                handleInteraction(e.clientX);
            }
        });

        window.addEventListener('pointerup', () => {
            this.isDragging = false;
        });
    }

    setValue(newValue) {
        this.value = Math.max(this.min, Math.min(this.max, newValue));
        this.value = Math.round(this.value / this.step) * this.step;
        this.updateUI();
        this.onValueChange(this.value);
    }

    updateUI() {
        const percentage = ((this.value - this.min) / (this.max - this.min)) * 100;
        this.fill.style.width = `${percentage}%`;
        this.thumb.style.left = `${percentage}%`;
        this.valueDisplay.textContent = this.value;
    }

    destroy() {
        window.removeEventListener('pointermove', this.handleMove);
        window.removeEventListener('pointerup', this.handleUp);
        super.destroy();
    }
}