import * as THREE from 'three';

export var DIRECTIONS = {
    up: { row: -1, col: 0, angle: 0, symbol: '^' },
    right: { row: 0, col: 1, angle: -90, symbol: '>' },
    down: { row: 1, col: 0, angle: 180, symbol: 'v' },
    left: { row: 0, col: -1, angle: 90, symbol: '<' }
};

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function cellKey(cell) {
    return cell.row + ':' + cell.col;
}

export function getColor(config, key) {
    return config.colors[key] || config.colors.white || 0xffffff;
}

export function makeMaterial(color, opacity) {
    return new THREE.MeshBasicMaterial({
        color: color,
        transparent: typeof opacity === 'number' && opacity < 1,
        opacity: typeof opacity === 'number' ? opacity : 1
    });
}

export function createTextTexture(text, options) {
    var settings = options || {};
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var size = settings.size || 128;
    var fontSize = settings.fontSize || 64;

    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = settings.background || 'rgba(0, 0, 0, 0)';
    if (settings.background) {
        ctx.fillRect(0, 0, size, size);
    }
    ctx.font = (settings.weight || '800') + ' ' + fontSize + 'px ' + (settings.fontFamily || 'Arial, sans-serif');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = settings.color || '#ffffff';
    ctx.strokeStyle = settings.stroke || 'rgba(0, 0, 0, 0.22)';
    ctx.lineWidth = settings.strokeWidth || 8;
    if (settings.strokeWidth !== 0) {
        ctx.strokeText(String(text), size / 2, size / 2 + (settings.offsetY || 0));
    }
    ctx.fillText(String(text), size / 2, size / 2 + (settings.offsetY || 0));

    var texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
}

export function createTextPlane(text, width, height, options) {
    var texture = createTextTexture(text, options);
    var material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
    });
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
    mesh.userData.texture = texture;
    return mesh;
}

export function disposeObject(object) {
    if (!object) {
        return;
    }

    object.traverse(function (child) {
        if (child.geometry) {
            child.geometry.dispose();
        }
        if (child.material) {
            if (child.material.map) {
                child.material.map.dispose();
            }
            child.material.dispose();
        }
        if (child.userData && child.userData.texture) {
            child.userData.texture.dispose();
        }
    });
}

export function worldPointFromEvent(event, state) {
    var rect = state.renderer.domElement.getBoundingClientRect();
    var pointer = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1)
    );

    state.raycaster.setFromCamera(pointer, state.camera);
    return pointer;
}
