import { UIVirtualJoystick } from '../../../../reusables/UIScene/UISceneElements/UIVirtualJoystick.js';
import { activateBoost } from './SharkController.js';

export function setupInteraction(state) {
    var container = document.getElementById('app') || document.body;

    var joystickConfig = {
        id: 'movement-joystick',
        maxRadius: 60,
        styles: {
            position: 'absolute',
            bottom: '40px',
            left: '40px',
            zIndex: '10'
        },
        onInit: function(command) {
            state.moveCommand = command;
        }
    };

    var joystick = new UIVirtualJoystick(joystickConfig, container);
    joystick.build();

    var boostBtn = document.createElement('button');
    boostBtn.style.position = 'absolute';
    boostBtn.style.bottom = '40px';
    boostBtn.style.right = '40px';
    boostBtn.style.width = '70px';
    boostBtn.style.height = '70px';
    boostBtn.style.borderRadius = '50%';
    boostBtn.style.background = 'linear-gradient(135deg, #ff9f43, #ff7675)';
    boostBtn.style.border = 'none';
    boostBtn.style.color = '#ffffff';
    boostBtn.style.fontSize = '14px';
    boostBtn.style.fontWeight = '800';
    boostBtn.style.zIndex = '10';
    boostBtn.style.cursor = 'pointer';
    boostBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    boostBtn.textContent = 'BOOST';

    boostBtn.addEventListener('pointerdown', function() {
        activateBoost(state);
    });

    container.appendChild(boostBtn);
}
