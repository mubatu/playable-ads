// ui-button.js
import { UISceneElement } from './UISceneElement.js';

export class UIButton extends UISceneElement {
    build() {
        this.element = document.createElement('button');
        this.element.id = this.config.id;
        this.element.innerText = this.config.text;

        // Apply CSS styles
        if (this.config.styles) {
            Object.assign(this.element.style, this.config.styles);
        }

        // Prevent text selection while dragging or clicking controls
        Object.assign(this.element.style, {
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none'
        });

        // Attach specific behavior
        if (this.config.onClick) {
            this.element.addEventListener('click', this.config.onClick);
        }

        // Clicking button shouldn't stop joystick input
        this.element.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        // Make it clickable and add to the master container
        this.activate();
        this.container.appendChild(this.element);
    }
}