import * as THREE from 'three';

export function createParticleSystem(state) {
    var container = state.particleContainer;
    var pool = [];
    var max = 40;
    var i;

    for (i = 0; i < max; i += 1) {
        var mesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.12, 0.12),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true })
        );
        mesh.visible = false;
        mesh.userData = { life: 0, velocity: new THREE.Vector3() };
        container.add(mesh);
        pool.push(mesh);
    }

    function acquire() {
        var j;
        for (j = 0; j < pool.length; j += 1) {
            if (pool[j].userData.life <= 0) {
                return pool[j];
            }
        }
        return null;
    }

    return {
        emit: function (x, y, z, color, count) {
            var k;
            var particle;
            var angle;
            var speed;

            for (k = 0; k < count; k += 1) {
                particle = acquire();
                if (!particle) {
                    return;
                }

                angle = Math.random() * Math.PI * 2;
                speed = 1.5 + Math.random() * 2.5;
                particle.visible = true;
                particle.position.set(x, y, z);
                particle.material.color.set(color || 0xffffff);
                particle.material.opacity = 1;
                particle.scale.setScalar(0.5 + Math.random() * 0.8);
                particle.userData.life = 0.35 + Math.random() * 0.15;
                particle.userData.velocity.set(
                    Math.cos(angle) * speed,
                    1 + Math.random() * 2,
                    Math.sin(angle) * speed
                );
            }
        },

        update: function (delta) {
            var j;
            var particle;
            var data;

            for (j = 0; j < pool.length; j += 1) {
                particle = pool[j];
                data = particle.userData;
                if (data.life <= 0) {
                    continue;
                }

                data.life -= delta;
                particle.position.x += data.velocity.x * delta;
                particle.position.y += data.velocity.y * delta;
                particle.position.z += data.velocity.z * delta;
                data.velocity.y -= 6 * delta;
                particle.material.opacity = Math.max(data.life / 0.35, 0);
                particle.scale.multiplyScalar(1 - delta * 1.5);

                if (data.life <= 0) {
                    particle.visible = false;
                }
            }
        },

        clear: function () {
            var j;
            for (j = 0; j < pool.length; j += 1) {
                pool[j].userData.life = 0;
                pool[j].visible = false;
            }
        }
    };
}
