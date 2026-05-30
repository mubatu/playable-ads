export function bindInteractions(state) {
    var keys = {};
    window.addEventListener('keydown', function (e) {
        keys[e.key.toLowerCase()] = true;
        if (e.key === ' ' || e.key === 'Shift') state.isBoosting = true;
        updateKeyMove();
    });
    window.addEventListener('keyup', function (e) {
        keys[e.key.toLowerCase()] = false;
        if (e.key === ' ' || e.key === 'Shift') state.isBoosting = false;
        updateKeyMove();
    });

    function updateKeyMove() {
        var x = 0, y = 0;
        if (keys['arrowleft'] || keys['a']) x -= 1;
        if (keys['arrowright'] || keys['d']) x += 1;
        if (keys['arrowup'] || keys['w']) y += 1;
        if (keys['arrowdown'] || keys['s']) y -= 1;
        if (x !== 0 || y !== 0) {
            state.moveCommand.x = x;
            state.moveCommand.y = y;
        } else if (state._keyboardLast) {
            state.moveCommand.x = 0;
            state.moveCommand.y = 0;
        }
        state._keyboardLast = (x !== 0 || y !== 0);
    }
}
