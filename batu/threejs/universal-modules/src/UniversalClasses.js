import * as THREE from 'three';

export class CameraController {
    constructor(camera, target = new THREE.Vector3(0, 0, 0)) {
        this.camera = camera;
        this.target = target;
        this.offset = new THREE.Vector3(0, 5, 10);
        this.lookAtOffset = new THREE.Vector3(0, 0, -5);
    }

    update(delta) {
        const targetPosition = this.target.clone().add(this.offset);
        this.camera.position.lerp(targetPosition, delta * 2);
        const lookAtTarget = this.target.clone().add(this.lookAtOffset);
        this.camera.lookAt(lookAtTarget);
    }

    setOffset(offset) {
        this.offset.copy(offset);
    }

    setLookAtOffset(offset) {
        this.lookAtOffset.copy(offset);
    }
}

export class LightManager {
    constructor(scene) {
        this.scene = scene;
        this.lights = [];
    }

    addAmbientLight(color = 0xffffff, intensity = 0.5) {
        const light = new THREE.AmbientLight(color, intensity);
        this.scene.add(light);
        this.lights.push(light);
        return light;
    }

    addDirectionalLight(color = 0xffffff, intensity = 1, position = new THREE.Vector3(10, 10, 5)) {
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.copy(position);
        this.scene.add(light);
        this.lights.push(light);
        return light;
    }

    addPointLight(color = 0xffffff, intensity = 1, position = new THREE.Vector3(0, 0, 0), distance = 0, decay = 1) {
        const light = new THREE.PointLight(color, intensity, distance, decay);
        light.position.copy(position);
        this.scene.add(light);
        this.lights.push(light);
        return light;
    }

    removeLight(light) {
        this.scene.remove(light);
        this.lights = this.lights.filter(l => l !== light);
    }
}

export class SceneManager {
    constructor(scene, renderer) {
        this.scene = scene;
        this.renderer = renderer;
        this.objects = [];
    }

    addObject(object) {
        this.scene.add(object);
        this.objects.push(object);
        return object;
    }

    removeObject(object) {
        this.scene.remove(object);
        this.objects = this.objects.filter(o => o !== object);
    }

    update(delta) {
        // Update all objects if they have update method
        this.objects.forEach(obj => {
            if (obj.update) obj.update(delta);
        });
    }

    render(camera) {
        this.renderer.render(this.scene, camera);
    }
}

export class InputManager {
    constructor() {
        this.keys = {};
        this.mouse = { x: 0, y: 0, buttons: {} };
        this.touch = { touches: [] };

        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        window.addEventListener('mousedown', (e) => this.mouse.buttons[e.button] = true);
        window.addEventListener('mouseup', (e) => this.mouse.buttons[e.button] = false);
        window.addEventListener('touchstart', (e) => this.touch.touches = e.touches);
        window.addEventListener('touchmove', (e) => this.touch.touches = e.touches);
        window.addEventListener('touchend', (e) => this.touch.touches = e.touches);
    }

    isKeyPressed(key) {
        return !!this.keys[key];
    }

    isMouseButtonPressed(button) {
        return !!this.mouse.buttons[button];
    }

    getMousePosition() {
        return { x: this.mouse.x, y: this.mouse.y };
    }

    getTouches() {
        return this.touch.touches;
    }
}