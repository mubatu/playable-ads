import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class Human {
    constructor(scene, path = "/assets/InPlaceRun.glb", scale = 1, position = new THREE.Vector3(0, 0, 0), speed = 2) {
        this.scene = scene;
        this.speed = speed;
        this.mixer = null;
        this.model = null;
        this.boundingBox = null;

        const loader = new GLTFLoader();
        loader.load(path, (gltf) => {
            this.model = gltf.scene;
            this.model.scale.set(scale, scale, scale);
            this.model.position.copy(position);
            scene.add(this.model);

            // setup animation
            this.mixer = new THREE.AnimationMixer(this.model);
            const action = this.mixer.clipAction(gltf.animations[0]);
            action.play();

            // create bounding box
            this.boundingBox = new THREE.Box3().setFromObject(this.model);
        });
    }

    update(delta) {
        if (this.mixer) this.mixer.update(delta);
        if (this.model) {
            this.model.position.z -= this.speed * delta;
            this.boundingBox.setFromObject(this.model);
        }
    }
}