/**
 * joystick.js — Virtual joystick that appears wherever the user touches
 * Works with both touch (mobile) and mouse (desktop testing).
 */

const Joystick = (function () {
    'use strict';

    const BASE_RADIUS = 50;   // px — outer ring
    const THUMB_RADIUS = 22;  // px — inner knob
    const MAX_DIST = BASE_RADIUS;

    // ---- DOM elements ----
    const container = document.createElement('div');
    container.id = 'joystick-container';

    const base = document.createElement('div');
    base.id = 'joystick-base';

    const thumb = document.createElement('div');
    thumb.id = 'joystick-thumb';

    base.appendChild(thumb);
    container.appendChild(base);
    document.body.appendChild(container);

    // ---- State ----
    let active = false;
    let originX = 0;
    let originY = 0;
    const direction = { x: 0, y: 0 };  // normalized -1..1
    let trackingId = null;              // touch identifier being tracked

    // ---- Show / hide ----
    function show(x, y) {
        originX = x;
        originY = y;
        base.style.left = (x - BASE_RADIUS) + 'px';
        base.style.top  = (y - BASE_RADIUS) + 'px';
        thumb.style.left = (BASE_RADIUS - THUMB_RADIUS) + 'px';
        thumb.style.top  = (BASE_RADIUS - THUMB_RADIUS) + 'px';
        container.style.display = 'block';
    }

    function hide() {
        container.style.display = 'none';
        direction.x = 0;
        direction.y = 0;
        active = false;
        trackingId = null;
    }

    function move(px, py) {
        let dx = px - originX;
        let dy = py - originY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Clamp to base radius
        if (dist > MAX_DIST) {
            dx = dx / dist * MAX_DIST;
            dy = dy / dist * MAX_DIST;
        }

        // Move thumb visually
        thumb.style.left = (BASE_RADIUS + dx - THUMB_RADIUS) + 'px';
        thumb.style.top  = (BASE_RADIUS + dy - THUMB_RADIUS) + 'px';

        // Normalise to -1..1
        direction.x = dx / MAX_DIST;
        direction.y = dy / MAX_DIST;
    }

    // ---- Touch events ----
    window.addEventListener('touchstart', (e) => {
        if (active) return;
        const t = e.changedTouches[0];
        trackingId = t.identifier;
        active = true;
        show(t.clientX, t.clientY);
        e.preventDefault();
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        if (!active) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === trackingId) {
                move(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
                break;
            }
        }
        e.preventDefault();
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === trackingId) {
                hide();
                break;
            }
        }
    });

    window.addEventListener('touchcancel', () => hide());

    // ---- Mouse fallback (for desktop testing) ----
    window.addEventListener('mousedown', (e) => {
        if (active) return;
        active = true;
        show(e.clientX, e.clientY);
    });

    window.addEventListener('mousemove', (e) => {
        if (!active) return;
        move(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', () => hide());

    // Start hidden
    hide();

    return { direction, isActive: () => active };
})();
