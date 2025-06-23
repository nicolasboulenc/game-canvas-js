
const app = {
    cursor: null,
    cursor_direction: 0,
    cursor_acceleration: 0,
    cursor_speed: 700,
    timestamp: 0,
};

Gamepads.init();
Gamepads.setup();

app.cursor = SVG("#cursor");

loop();

function loop(timestamp) {

    const elapse_time = timestamp - app.timestamp;
    app.timestamp = timestamp;

    // cursor.attr({x: cursor.x() + 1, y: cursor.y() + 1});

    const state = Gamepads.get_state(0);
    if(state !== null) {

        // direction in rag pointing north
        app.cursor_direction = -state.LS.direction * Math.PI / 180 + Math.PI / 2
        app.cursor_acceleration = state.LS.magnitude;

        const factor = app.cursor_speed * app.cursor_acceleration * elapse_time / 1000;
        const x = app.cursor.x() + Math.round( Math.cos(app.cursor_direction) * factor );
        const y = app.cursor.y() - Math.round( Math.sin(app.cursor_direction) * factor );

        app.cursor.move(x, y);
    }

    requestAnimationFrame(loop);
}
