"use strict";
const app = new PIXI.Application({ backgroundColor: 0xf9f8e4 });
document.body.appendChild(app.view);

PIXI.Loader.shared.add("zookeeper/pixijs.json").load(setup);

const ticker = PIXI.Ticker.shared;
ticker.autoStart = false;
ticker.stop();

const renderer = PIXI.autoDetectRenderer();

const grid = [];
const grid_rows = 8;
const grid_cols = 8;
const margin = 4;
const elems = ["elephant", "frog", "girafe", "hippo", "lion", "monkey", "panda", "rabbit", "cursor"];

let cursor = null;
let cursor_x = 0;
let cursor_y = 0;

let select_1 = null;
let select_1_x = -2;
let select_1_y = -2;

let select_2 = null;
let select_2_x = -2;
let select_2_y = -2;

let is_swaping = false;

let sprite1 = null;
let sprite1_target_x = -2;
let sprite1_target_y = -2;
let sprite1_direction = 0;

let sprite2 = null;
let sprite2_target_x = -2;
let sprite2_target_y = -2;
let sprite2_direction = 0;

Gamepads.init();
Gamepads.setup();
Gamepads.on_change = function(state) {

    if(state.DPAD_UP === 1) {
        if(cursor_y > 0) cursor_y--;
    }
    if(state.DPAD_DOWN === 1) {
        if(cursor_y < grid_rows - 1) cursor_y++;
    }
    if(state.DPAD_LEFT === 1) {
        if(cursor_x > 0) cursor_x--;
    }
    if(state.DPAD_RIGHT === 1) {
        if(cursor_x < grid_cols - 1) cursor_x++;
    }
    cursor.x = cursor_x * (cursor.width + margin) + margin + margin;
    cursor.y = cursor_y * (cursor.width + margin) + margin + margin;

    if(state.A === 1) {

        // if select 1 is not set or second click is non-adjacent
        if( select_1_x === -2 || is_valid_placement(select_1_x, select_1_y, cursor_x, cursor_y) === false ) {

            select_1_x = cursor_x;
            select_1_y = cursor_y;
            select_1.x = select_1_x * (select_1.width + margin) + margin + margin;
            select_1.y = select_1_y * (select_1.height + margin) + margin + margin;
        }
        else {

            if(is_valid_swap(select_1_x, select_1_y, cursor_x, cursor_y) === true) {

                select_2_x = cursor_x;
                select_2_y = cursor_y;
                select_2.x = select_2_x * (select_2.width + margin) + margin + margin;
                select_2.y = select_2_y * (select_2.height + margin) + margin + margin;

                swap_animate(select_1_x, select_1_y, select_2_x, select_2_y);
                swap(select_1_x, select_1_y, select_2_x, select_2_y);
            }

            select_1_x = -2;
            select_1_y = -2;
            select_1.x = select_1_x * (select_1.width + margin) + margin + margin;
            select_1.y = select_1_y * (select_1.height + margin) + margin + margin;

            select_2_x = -2;
            select_2_y = -2;
            select_2.x = select_2_x * (select_2.width + margin) + margin + margin;
            select_2.y = select_2_y * (select_2.height + margin) + margin + margin;
        }
    }
}

function is_valid_placement(x1, y1, x2, y2) {

    return  (x1 === x2 + 1 && y1 === y2) ||
            (x1 === x2 - 1 && y1 === y2) ||
            (x1 === x2 && y1 === y2 + 1) ||
            (x1 === x2 && y1 === y2 - 1);
}

function is_valid_swap(x1, y1, x2, y2) {

    // swap
    let t = grid[y1 * grid_cols + x1];
    grid[y1 * grid_cols + x1] = grid[y2 * grid_cols + x2];
    grid[y2 * grid_cols + x2] = t;

    let is_valid = false;
    is_valid ||= validate_swap(x1, y1);
    is_valid ||= validate_swap(x2, y2);

    // un-swap
    t = grid[y1 * grid_cols + x1];
    grid[y1 * grid_cols + x1] = grid[y2 * grid_cols + x2];
    grid[y2 * grid_cols + x2] = t;

    return is_valid;
}

function validate_swap(x, y) {

    let is_valid = false
    // up
    if(y >= 2) {
        is_valid ||= (grid[y * grid_cols + x].animal === grid[(y - 1) * grid_cols + x].animal && grid[(y - 1) * grid_cols + x].animal === grid[(y - 2) * grid_cols + x].animal);
    }
    // down
    if(y <= grid_rows - 3) {
        is_valid ||= (grid[y * grid_cols + x].animal === grid[(y + 1) * grid_cols + x].animal && grid[(y + 1) * grid_cols + x].animal === grid[(y + 2) * grid_cols + x].animal);
    }
    // mid vertical
    if(y >= 1 && y <= grid_rows - 2) {
        is_valid ||= (grid[(y - 1) * grid_cols + x].animal === grid[y * grid_cols + x].animal && grid[y * grid_cols + x].animal === grid[(y + 1) * grid_cols + x].animal);
    }
    // left
    if(x >= 2) {
        is_valid ||= (grid[y * grid_cols + x].animal === grid[y * grid_cols + (x - 1)].animal && grid[y * grid_cols + (x - 1)].animal === grid[y * grid_cols + (x - 2)].animal);
    }
    // right
    if(x <= grid_cols - 3) {
        is_valid ||= (grid[y * grid_cols + x].animal === grid[y * grid_cols + (x + 1)].animal && grid[y * grid_cols + (x + 1)].animal === grid[y * grid_cols + (x + 2)].animal);
    }
    // mid horizontal
    if(x >= 1 && x <= grid_cols - 2) {
        is_valid ||= (grid[y * grid_cols + (x - 1)].animal === grid[y * grid_cols + x].animal && grid[y * grid_cols + x].animal === grid[y * grid_cols + (x + 1)].animal);
    }

    return is_valid;
}

function swap(x1, y1, x2, y2) {

    const t = grid[y1 * grid_cols + x1];
    grid[y1 * grid_cols + x1] = grid[y2 * grid_cols + x2];
    grid[y2 * grid_cols + x2] = t;
}

function swap_animate() {

    // init animation
    if(is_swaping === false) {

        sprite1 = grid[select_1_y * grid_cols + select_1_x].sprite;
        sprite1_target_x = select_2_x * (sprite1.width + margin) + margin + margin;
        sprite1_target_y = select_2_y * (sprite1.height + margin) + margin + margin;
        sprite1_direction = 1;
        if(select_1_x > select_2_x || select_1_y > select_2_y) {
            sprite1_direction = -1;
        }

        sprite2 = grid[select_2_y * grid_cols + select_2_x].sprite;
        sprite2_target_x = select_1_x * (sprite2.width + margin) + margin + margin;
        sprite2_target_y = select_1_y * (sprite2.height + margin) + margin + margin;
        sprite2_direction = -sprite1_direction;

        is_swaping = true;
    }

    const seconds = 0.3;
    const div = sprite1.width / (sprite1.width / (60 * seconds));
    const step_x = Math.round( Math.abs(sprite1_target_x - sprite2_target_x) / div);
    const step_y = Math.round( Math.abs(sprite1_target_y - sprite2_target_y) / div);
    sprite1.x += step_x * sprite1_direction;
    sprite1.y += step_y * sprite1_direction;
    sprite2.x += step_x * sprite2_direction;
    sprite2.y += step_y * sprite2_direction;

    // terminate animation
    if( ( sprite1_direction ===  1 && sprite1.x > sprite1_target_x ) ||
        ( sprite1_direction === -1 && sprite1.x < sprite1_target_x ) ||
        ( sprite1_direction ===  1 && sprite1.y > sprite1_target_y ) ||
        ( sprite1_direction === -1 && sprite1.y < sprite1_target_y ) ) {

            sprite1.x = sprite1_target_x;
            sprite1.y = sprite1_target_y;
            sprite1 = null;
            sprite1_target_x = -2;
            sprite1_target_y = -2;

            sprite2.x = sprite2_target_x;
            sprite2.y = sprite2_target_y;
            sprite2 = null;
            sprite2_target_x = -2;
            sprite2_target_y = -2;

            is_swaping = false;
    }
}



function setup() {

    const sheet = PIXI.Loader.shared.resources["zookeeper/pixijs.json"].spritesheet;
console.log(sheet);
    let grid_index = 0;

    while(grid_index < grid_rows * grid_cols) {

        const r = Math.floor(Math.random() * (elems.length - 1) );
        const animal = elems[r];
        const sprite = new PIXI.AnimatedSprite(sheet.animations[animal]);
        sprite.x = grid_index % grid_cols * (sprite.width + margin) + margin + margin;
        sprite.y = Math.floor(grid_index / grid_cols) * (sprite.height + margin) + margin + margin;
        grid.push({ animal: animal, sprite: sprite });
        app.stage.addChild(sprite);
        grid_index++;
    }

    cursor = new PIXI.AnimatedSprite(sheet.animations["cursor"]);
    cursor.x = cursor_x * (cursor.width + margin) + margin + margin;
    cursor.y = cursor_y * (cursor.height + margin) + margin + margin;
    app.stage.addChild(cursor);

    select_1 = new PIXI.AnimatedSprite(sheet.animations["cursor"]);
    select_1.gotoAndStop(1);
    select_1.x = select_1_x * (cursor.width + margin) + margin + margin;
    select_1.y = select_1_y * (cursor.height + margin) + margin + margin;
    app.stage.addChild(select_1);

    select_2 = new PIXI.AnimatedSprite(sheet.animations["cursor"]);
    select_2.gotoAndStop(2);
    select_2.x = select_2_x * (cursor.width + margin) + margin + margin;
    select_2.y = select_2_y * (cursor.height + margin) + margin + margin;
    app.stage.addChild(select_2);

    // app.ticker.add(loop);
    loop(performance.now());
}


function loop(time) {

    Gamepads.get_state(0);
    if(is_swaping === true) {
        swap_animate();
    }
    ticker.update(time);
    renderer.render(app.stage);
    requestAnimationFrame(loop);
}


// app.loader
//     .add('examples/assets/spritesheet/fighter.json')
//     .load(onAssetsLoaded);

// function onAssetsLoaded() {
//     // create an array of textures from an image path
//     const frames = [];

//     for (let i = 0; i < 30; i++) {
//         const val = i < 10 ? `0${i}` : i;

//         // magically works since the spritesheet was loaded with the pixi loader
//         frames.push(PIXI.Texture.from(`rollSequence00${val}.png`));
//     }

//     // create an AnimatedSprite (brings back memories from the days of Flash, right ?)
//     const anim = new PIXI.AnimatedSprite(frames);

//     /*
//      * An AnimatedSprite inherits all the properties of a PIXI sprite
//      * so you can change its position, its anchor, mask it, etc
//      */
//     anim.x = app.screen.width / 2;
//     anim.y = app.screen.height / 2;
//     anim.anchor.set(0.5);
//     anim.animationSpeed = 0.5;
//     anim.play();

//     app.stage.addChild(anim);

//     // Animate the rotation
//     app.ticker.add(() => {
//         anim.rotation += 0.01;
//     });
// }