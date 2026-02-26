import * as THREE from "three";

export class Box {
  constructor({ scene, position, color, name }) {
    this.name = name;

    this.geometry = new THREE.BoxGeometry();
    this.material = new THREE.MeshStandardMaterial({ color });
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.mesh.position.copy(position);
    this.mesh.userData.box = this; // IMPORTANT for raycasting

    this.isAnimating = false;
    this.counter = 0;

    scene.add(this.mesh);
  }

  toggleAnimation() {
    this.isAnimating = !this.isAnimating;
    this.counter++;
    this.updateCounterUI();
  }

  update() {
    if (this.isAnimating) {
      this.mesh.rotation.x += 0.02;
      this.mesh.rotation.y += 0.02;
    }
  }

  updateCounterUI() {
    const el = document.getElementById(`counter-${this.name}`);
    if (el) {
      el.innerText = `${this.name}: ${this.counter}`;
    }
  }
}