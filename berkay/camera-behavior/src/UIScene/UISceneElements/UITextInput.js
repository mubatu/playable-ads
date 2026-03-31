// ui-text-input.js
import { UISceneElement } from './UISceneElement.js';

export class UITextInput extends UISceneElement {
    constructor(config, container) {
        super(config, container);
        this.value = config.initialValue || '';
        this.placeholder = config.placeholder || '';
        this.maxLength = config.maxLength || null;
        this.onChange = config.onChange || (() => {});
        this.onSubmit = config.onSubmit || (() => {});
    }

    build() {
        this.element = document.createElement('input');
        this.element.id = this.config.id;
        this.element.type = 'text';
        this.element.value = this.value;
        this.element.placeholder = this.placeholder;

        if (this.maxLength) {
            this.element.maxLength = this.maxLength;
        }

        Object.assign(this.element.style, {
            position: 'absolute',
            padding: '8px 12px',
            fontSize: '16px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#ffffff',
            outline: 'none',
            ...this.config.styles
        });

        // Focus styles
        this.element.addEventListener('focus', () => {
            this.element.style.borderColor = '#4CAF50';
            this.element.style.boxShadow = '0 0 8px rgba(76, 175, 80, 0.5)';
        });

        this.element.addEventListener('blur', () => {
            this.element.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            this.element.style.boxShadow = 'none';
        });

        // Event listeners
        this.element.addEventListener('input', (e) => {
            this.value = e.target.value;
            this.onChange(this.value);
        });

        this.element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.onSubmit(this.value);
            }
        });

        this.activate();
        this.container.appendChild(this.element);
    }

    setValue(newValue) {
        this.value = newValue;
        this.element.value = newValue;
    }

    getValue() {
        return this.element.value;
    }

    focus() {
        this.element.focus();
    }

    blur() {
        this.element.blur();
    }
}