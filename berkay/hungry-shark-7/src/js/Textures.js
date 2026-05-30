import { CanvasTexture, LinearFilter } from 'three';

function makeCanvas(size) {
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    return canvas;
}

function toTexture(canvas) {
    var texture = new CanvasTexture(canvas);
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    return texture;
}

// Side-view shark facing right. Drawn on a 256x256 canvas.
export function createSharkTexture(colors) {
    var c = makeCanvas(256);
    var ctx = c.getContext('2d');
    var body = colors.body || '#4a6fa5';
    var belly = colors.belly || '#dbe8f5';
    var fin = colors.fin || '#35527d';

    ctx.clearRect(0, 0, 256, 256);

    // Tail fin
    ctx.fillStyle = fin;
    ctx.beginPath();
    ctx.moveTo(28, 128);
    ctx.lineTo(2, 78);
    ctx.lineTo(40, 128);
    ctx.lineTo(2, 178);
    ctx.closePath();
    ctx.fill();

    // Body
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(30, 128);
    ctx.quadraticCurveTo(70, 64, 170, 96);
    ctx.quadraticCurveTo(236, 112, 248, 138);
    ctx.quadraticCurveTo(220, 150, 170, 156);
    ctx.quadraticCurveTo(80, 176, 30, 128);
    ctx.closePath();
    ctx.fill();

    // Belly
    ctx.fillStyle = belly;
    ctx.beginPath();
    ctx.moveTo(60, 150);
    ctx.quadraticCurveTo(120, 178, 200, 150);
    ctx.quadraticCurveTo(120, 168, 60, 150);
    ctx.closePath();
    ctx.fill();

    // Dorsal fin
    ctx.fillStyle = fin;
    ctx.beginPath();
    ctx.moveTo(96, 92);
    ctx.lineTo(120, 44);
    ctx.lineTo(146, 90);
    ctx.closePath();
    ctx.fill();

    // Pectoral fin
    ctx.beginPath();
    ctx.moveTo(140, 150);
    ctx.lineTo(160, 196);
    ctx.lineTo(186, 150);
    ctx.closePath();
    ctx.fill();

    // Mouth
    ctx.strokeStyle = '#1b2c44';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(214, 142);
    ctx.lineTo(244, 138);
    ctx.stroke();

    // Teeth
    ctx.fillStyle = '#ffffff';
    var tx;
    for (tx = 216; tx < 244; tx += 8) {
        ctx.beginPath();
        ctx.moveTo(tx, 138);
        ctx.lineTo(tx + 4, 138);
        ctx.lineTo(tx + 2, 146);
        ctx.closePath();
        ctx.fill();
    }

    // Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(206, 120, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#10131a';
    ctx.beginPath();
    ctx.arc(209, 121, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Gills
    ctx.strokeStyle = fin;
    ctx.lineWidth = 3;
    var gx;
    for (gx = 0; gx < 3; gx += 1) {
        ctx.beginPath();
        ctx.arc(182 - gx * 9, 130, 16, -0.7, 0.7);
        ctx.stroke();
    }

    return toTexture(c);
}

// Generic fish facing right.
export function createFishTexture(bodyColor, finColor) {
    var c = makeCanvas(128);
    var ctx = c.getContext('2d');

    ctx.clearRect(0, 0, 128, 128);

    // tail
    ctx.fillStyle = finColor;
    ctx.beginPath();
    ctx.moveTo(20, 64);
    ctx.lineTo(2, 40);
    ctx.lineTo(30, 64);
    ctx.lineTo(2, 88);
    ctx.closePath();
    ctx.fill();

    // body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(72, 64, 48, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // top fin
    ctx.fillStyle = finColor;
    ctx.beginPath();
    ctx.moveTo(60, 40);
    ctx.lineTo(78, 18);
    ctx.lineTo(92, 42);
    ctx.closePath();
    ctx.fill();

    // eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(98, 58, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(100, 59, 4, 0, Math.PI * 2);
    ctx.fill();

    return toTexture(c);
}

export function createCoinTexture() {
    var c = makeCanvas(128);
    var ctx = c.getContext('2d');
    var grad = ctx.createRadialGradient(54, 54, 6, 64, 64, 56);
    grad.addColorStop(0, '#fff6c2');
    grad.addColorStop(0.5, '#ffd33a');
    grad.addColorStop(1, '#e09b16');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(64, 64, 54, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#b9760d';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(64, 64, 50, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#e0a020';
    ctx.font = 'bold 56px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 64, 68);

    return toTexture(c);
}

export function createMineTexture() {
    var c = makeCanvas(128);
    var ctx = c.getContext('2d');

    // spikes
    ctx.fillStyle = '#2a2f36';
    var i;
    for (i = 0; i < 12; i += 1) {
        var a = (i / 12) * Math.PI * 2;
        ctx.save();
        ctx.translate(64, 64);
        ctx.rotate(a);
        ctx.beginPath();
        ctx.moveTo(0, -56);
        ctx.lineTo(-7, -34);
        ctx.lineTo(7, -34);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    var grad = ctx.createRadialGradient(52, 52, 8, 64, 64, 40);
    grad.addColorStop(0, '#555c66');
    grad.addColorStop(1, '#23272d');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(64, 64, 38, 0, Math.PI * 2);
    ctx.fill();

    // warning lights
    ctx.fillStyle = '#ff4733';
    for (i = 0; i < 4; i += 1) {
        var ang = (i / 4) * Math.PI * 2 + 0.4;
        ctx.beginPath();
        ctx.arc(64 + Math.cos(ang) * 22, 64 + Math.sin(ang) * 22, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    return toTexture(c);
}

export function createJellyfishTexture() {
    var c = makeCanvas(128);
    var ctx = c.getContext('2d');

    var grad = ctx.createRadialGradient(64, 44, 6, 64, 48, 44);
    grad.addColorStop(0, 'rgba(255, 180, 235, 0.95)');
    grad.addColorStop(1, 'rgba(196, 96, 200, 0.85)');
    ctx.fillStyle = grad;

    // dome
    ctx.beginPath();
    ctx.arc(64, 50, 40, Math.PI, 0);
    ctx.lineTo(104, 56);
    ctx.quadraticCurveTo(64, 78, 24, 56);
    ctx.closePath();
    ctx.fill();

    // tentacles
    ctx.strokeStyle = 'rgba(220, 130, 220, 0.85)';
    ctx.lineWidth = 5;
    var t;
    for (t = 0; t < 5; t += 1) {
        var x = 36 + t * 14;
        ctx.beginPath();
        ctx.moveTo(x, 58);
        ctx.quadraticCurveTo(x + 8, 84, x - 4, 110);
        ctx.stroke();
    }

    return toTexture(c);
}

export function createBubbleTexture() {
    var c = makeCanvas(64);
    var ctx = c.getContext('2d');
    var grad = ctx.createRadialGradient(26, 26, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255,255,255,0.9)');
    grad.addColorStop(0.7, 'rgba(200,230,255,0.35)');
    grad.addColorStop(1, 'rgba(200,230,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();
    return toTexture(c);
}

export function createParticleTexture(color) {
    var c = makeCanvas(64);
    var ctx = c.getContext('2d');
    var grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();
    return toTexture(c);
}
