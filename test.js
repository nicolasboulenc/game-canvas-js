'use strict';
Init("canvas");

let shots_timer = Date.now();
let shots_per_second = 6;
let shots_speed = 20;
let spaceship_speed = 10;


let stage = Stage.create();
stage.load_backdrop("webcam");
stage.set_backdrop_fit("fit_vertical");
// stage.backdrop_style = "flip_horizontal";


let spaceship = Sprite.create();
spaceship.set_image("invaders/spaceship.png");
spaceship.load_sound("invaders/laser1.ogg");
spaceship.set_x_to(500);
spaceship.set_y_to(500);

spaceship.when_gamepad = function(gamepad) {

    spaceship.set_direction_to(gamepad.LS.direction);
    let distance = gamepad.LS.magnitude * spaceship_speed;
    spaceship.move(distance);

    if(gamepad.RT > 0) {

        let time_elapsed = Date.now() - shots_timer;
        if(time_elapsed > 1000 / shots_per_second) {

            let p = projectile.clone();
            p.go_to(spaceship);
            p.show();
            spaceship.play_sound("invaders/laser1.ogg", 1 / shots_per_second);

            shots_timer = Date.now();
        }
    }
}

spaceship.when_keyboard = function(keyboard) {

    let x = 0;
    let y = 0;

    if(keyboard.ArrowUp === "keydown")    { y = -1; }
    if(keyboard.ArrowDown === "keydown")  { y =  1; }
    if(keyboard.ArrowLeft === "keydown")  { x = -1; }
    if(keyboard.ArrowRight === "keydown") { x =  1; }

    if(x !== 0 || y !== 0) {
        const direction = Math.atan2(x, -y) * 180 / Math.PI;
        spaceship.set_direction_to(direction);
        spaceship.move(spaceship_speed);
    }

    if(keyboard.Space === "keydown") {
        let time_elapsed = Date.now() - shots_timer;
        if(time_elapsed > 1000 / shots_per_second) {

            let p = projectile.clone();
            p.go_to(spaceship);
            p.show();
            spaceship.play_sound("invaders/laser1.ogg", 1 / shots_per_second);

            shots_timer = Date.now();
        }
    }
}


let projectile = Sprite.create();
projectile.hide();
projectile.set_image("invaders/projectile.png");
projectile.set_direction_to(0);

projectile.forever = function() {

    this.move(shots_speed);
    if(this.if_out_of_screen() === true) {
        this.delete();
    }
}
