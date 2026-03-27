// ui-dropdown.js
import { UISceneElement } from './UISceneElement.js';

export class UIDropdown extends UISceneElement {
    constructor(config, container) {
        super(config, container);
        this.options = config.options || [];
        this.selectedIndex = config.selectedIndex || 0;
        this.onSelect = config.onSelect || (() => {});
        this.isOpen = false;
    }

    build() {
        this.element = document.createElement('div');
        this.element.id = this.config.id;

        Object.assign(this.element.style, {
            position: 'absolute',
            cursor: 'pointer',
            userSelect: 'none',
            ...this.config.styles
        });

        // Create selected value display
        this.selectedDiv = document.createElement('div');
        Object.assign(this.selectedDiv.style, {
            padding: '8px 12px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        });

        this.selectedText = document.createElement('span');
        this.selectedText.textContent = this.options[this.selectedIndex]?.label || '';

        this.arrow = document.createElement('span');
        this.arrow.textContent = '▼';
        this.arrow.style.fontSize = '12px';

        this.selectedDiv.appendChild(this.selectedText);
        this.selectedDiv.appendChild(this.arrow);

        // Create options container
        this.optionsContainer = document.createElement('div');
        Object.assign(this.optionsContainer.style, {
            position: 'absolute',
            top: '100%',
            left: '0',
            right: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            maxHeight: '200px',
            overflowY: 'auto',
            display: 'none',
            zIndex: '1000'
        });

        this.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.textContent = option.label;
            Object.assign(optionDiv.style, {
                padding: '8px 12px',
                color: '#ffffff',
                cursor: 'pointer',
                borderBottom: index < this.options.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
            });

            optionDiv.addEventListener('mouseenter', () => {
                optionDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            });

            optionDiv.addEventListener('mouseleave', () => {
                optionDiv.style.backgroundColor = 'transparent';
            });

            optionDiv.addEventListener('click', () => {
                this.selectOption(index);
            });

            this.optionsContainer.appendChild(optionDiv);
        });

        this.element.appendChild(this.selectedDiv);
        this.element.appendChild(this.optionsContainer);

        this.activate();
        this.container.appendChild(this.element);

        // Event listeners
        this.selectedDiv.addEventListener('click', () => this.toggle());
        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.close();
            }
        });
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.isOpen = true;
        this.optionsContainer.style.display = 'block';
        this.arrow.textContent = '▲';
    }

    close() {
        this.isOpen = false;
        this.optionsContainer.style.display = 'none';
        this.arrow.textContent = '▼';
    }

    selectOption(index) {
        if (index >= 0 && index < this.options.length) {
            this.selectedIndex = index;
            this.selectedText.textContent = this.options[index].label;
            this.onSelect(this.options[index], index);
            this.close();
        }
    }

    getSelectedOption() {
        return this.options[this.selectedIndex];
    }

    getSelectedIndex() {
        return this.selectedIndex;
    }
}