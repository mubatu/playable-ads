const HandTutorialDemoScene = (function () {
    'use strict';

    class HandTutorialDemoScene {
        constructor(container) {
            this.container = container;
            this.scene = new THREE.Scene();
            this.scene.fog = new THREE.Fog(0x0b1524, 8, 22);

            this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            this.renderer.outputColorSpace = THREE.SRGBColorSpace;
            this.renderer.domElement.style.touchAction = 'none';
            this.container.appendChild(this.renderer.domElement);

            this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
            this.camera.position.set(0, 6.4, 7.2);
            this.camera.lookAt(0, 0.6, 0);

            this.raycaster = new THREE.Raycaster();
            this.pointer = new THREE.Vector2();
            this.pickPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.38);

            this.startMarker = this._createMarker(0xf8ca76);
            this.endMarker = this._createMarker(0xff9966);
            this.scene.add(this.startMarker);
            this.scene.add(this.endMarker);

            this._buildLights();
            this._buildBackdrop();
            this.resize();

            this.handleResize = this.resize.bind(this);
            window.addEventListener('resize', this.handleResize);
        }

        _buildLights() {
            const hemi = new THREE.HemisphereLight(0xbbe0ff, 0x08111c, 1.2);
            this.scene.add(hemi);

            const key = new THREE.DirectionalLight(0xfff5d8, 1.45);
            key.position.set(6, 10, 4);
            this.scene.add(key);

            const rim = new THREE.PointLight(0x6fc6ff, 16, 18, 2);
            rim.position.set(-4, 4, -4);
            this.scene.add(rim);
        }

        _buildBackdrop() {
            const floor = new THREE.Mesh(
                new THREE.CylinderGeometry(6.8, 7.6, 0.38, 52),
                new THREE.MeshStandardMaterial({
                    color: 0x12263f,
                    metalness: 0.1,
                    roughness: 0.78
                })
            );
            floor.position.y = -0.45;
            this.scene.add(floor);

            const glow = new THREE.Mesh(
                new THREE.CircleGeometry(4.5, 48),
                new THREE.MeshBasicMaterial({
                    color: 0x3f7db6,
                    transparent: true,
                    opacity: 0.16
                })
            );
            glow.rotation.x = -Math.PI * 0.5;
            glow.position.y = -0.24;
            this.scene.add(glow);
        }

        _createMarker(color) {
            const marker = new THREE.Mesh(
                new THREE.TorusGeometry(0.38, 0.06, 16, 40),
                new THREE.MeshBasicMaterial({
                    color: color,
                    transparent: true,
                    opacity: 0.95
                })
            );
            marker.rotation.x = Math.PI * 0.5;
            return marker;
        }

        resize() {
            const width = Math.max(this.container.clientWidth, 1);
            const height = Math.max(this.container.clientHeight, 1);

            this.renderer.setSize(width, height);
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }

        update(now) {
            const time = now * 0.001;
            const pulse = 1 + Math.sin(time * 1.8) * 0.05;
            this.startMarker.scale.setScalar(pulse);
            this.endMarker.scale.setScalar(1 + Math.cos(time * 1.8) * 0.05);

            this.renderer.render(this.scene, this.camera);
        }

        getDefaultPoints(space) {
            if (space === 'screen') {
                return {
                    from: { space: 'screen', x: 0.32, y: 0.66 },
                    to: { space: 'screen', x: 0.58, y: 0.48 }
                };
            }

            return {
                from: { space: 'world', x: -2.15, y: 0.64, z: 0.2 },
                to: { space: 'world', x: 2.15, y: 0.64, z: 0.2 }
            };
        }

        pickPoint(event, space) {
            const rect = this.renderer.domElement.getBoundingClientRect();
            const clientX = event.clientX;
            const clientY = event.clientY;

            this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
            this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
            this.raycaster.setFromCamera(this.pointer, this.camera);

            if (space === 'screen') {
                return {
                    space: 'screen',
                    x: (clientX - rect.left) / rect.width,
                    y: (clientY - rect.top) / rect.height
                };
            }

            const fallback = new THREE.Vector3();
            const hasPlaneHit = this.raycaster.ray.intersectPlane(this.pickPlane, fallback);

            if (!hasPlaneHit) {
                return null;
            }

            return {
                space: 'world',
                x: fallback.x,
                y: 0.64,
                z: fallback.z
            };
        }

        setMarkers(from, to, space) {
            const showWorldMarkers = space === 'world';

            this.startMarker.visible = showWorldMarkers;
            this.endMarker.visible = showWorldMarkers;

            if (!showWorldMarkers) {
                return;
            }

            this.startMarker.position.set(from.x, from.y, from.z);
            this.endMarker.position.set(to.x, to.y, to.z);
        }

        destroy() {
            window.removeEventListener('resize', this.handleResize);
            this.renderer.dispose();

            if (this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }
    }

    return HandTutorialDemoScene;
})();

window.HandTutorialDemoScene = HandTutorialDemoScene;
