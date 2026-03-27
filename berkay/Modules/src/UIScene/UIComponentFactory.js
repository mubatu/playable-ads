// ui-component-factory.js
import { UIButton } from './UISceneElements/UIButton.js';
import { UIVirtualJoystick } from './UISceneElements/UIVirtualJoystick.js';
import { UISlider } from './UISceneElements/UISlider.js';
import { UIToggle } from './UISceneElements/UIToggle.js';
import { UIProgressBar } from './UISceneElements/UIProgressBar.js';
import { UITextInput } from './UISceneElements/UITextInput.js';
import { UIDropdown } from './UISceneElements/UIDropdown.js';

// Factory Map: Links component types to classes
const COMPONENT_MAP = {
    'button': UIButton,
    'joystick': UIVirtualJoystick,
    'slider': UISlider,
    'toggle': UIToggle,
    'progressBar': UIProgressBar,
    'textInput': UITextInput,
    'dropdown': UIDropdown
};

export class UIComponentFactory {
    static createComponent(type, config, container) {
        const ComponentClass = COMPONENT_MAP[type];

        if (!ComponentClass) {
            console.warn(`UI component type '${type}' is not recognized in the factory map.`);
            return null;
        }

        const component = new ComponentClass(config, container);
        component.build();
        return component;
    }

    static getAvailableComponents() {
        return Object.keys(COMPONENT_MAP);
    }

    static registerComponent(type, ComponentClass) {
        if (COMPONENT_MAP[type]) {
            console.warn(`UI component type '${type}' is already registered. Overwriting.`);
        }
        COMPONENT_MAP[type] = ComponentClass;
    }
}