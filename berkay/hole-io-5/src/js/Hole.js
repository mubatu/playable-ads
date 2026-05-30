import * as THREE from 'three';

function createHoleTexture() {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var size = 256;
    var gradient;
    canvas.width = size;
    canvas.height = size;

    gradient = ctx.createRadialGradient(size * 0.5, size * 0.5, size * 0.05, size * 0.5, size * 0.5, size * 0.5);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(0.55, '#0a0a0a');
    gradient.addColorStop(0.75, 'rgba(20,20,20,0.85)');
    gradient.addColorStop(0.92, 'rgba(40,40,40,0.35)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    var texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

export function createHole(config) {
    var holeCfg = config.hole;
    var diameter = holeCfg.initialDiameter || 1.5;
    var group = new THREE.Group();
    var texture = createHoleTexture();
    var disc = new THREE.Mesh(
        new THREE.CircleGeometry(0.5, 48),
        new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide
        })
    );
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = 0.03;

    var ring = new THREE.Mesh(
        new THREE.RingGeometry(0.48, 0.5, 48),
        new THREE.MeshBasicMaterial({
            color: 0x111111,
            transparent: true,
            opacity: 0.6,
            depthWrite: false,
            side: THREE.DoubleSide
        })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.025;

    group.add(ring);
    group.add(disc);

    return {
        group: group,
        disc: disc,
        ring: ring,
        diameter: diameter,
        pulseTime: 0,
        x: 0,
        z: 0,
        getRadius: function () {
            return this.diameter * 0.5;
        },
        setDiameter: function (next) {
            this.diameter = Math.min(next, holeCfg.maxDiameter || 10);
            var scale = this.diameter;
            this.group.scale.set(scale, scale, scale);
        },
        setPosition: function (x, z) {
            this.x = x;
            this.z = z;
            this.group.position.set(x, 0, z);
        },
        triggerPulse: function () {
            this.pulseTime = holeCfg.pulseDuration || 0.25;
        },
        update: function (delta) {
            if (this.pulseTime > 0) {
                this.pulseTime -= delta;
                var t = Math.max(this.pulseTime, 0) / (holeCfg.pulseDuration || 0.25);
                var bounce = 1 + (1 - t) * 0.08;
                this.group.scale.set(this.diameter * bounce, this.diameter * bounce, this.diameter * bounce);
            } else {
                this.group.scale.set(this.diameter, this.diameter, this.diameter);
            }

            this.disc.material.opacity = 0.95 + Math.sin(performance.now() * 0.004) * 0.03;
        },
        reset: function () {
            this.diameter = holeCfg.initialDiameter || 1.5;
            this.pulseTime = 0;
            this.setPosition(0, 0);
            this.setDiameter(this.diameter);
        }
    };
}
