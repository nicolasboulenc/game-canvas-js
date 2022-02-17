"use strict";

import { Game, Sprite, Timer } from "../src/game.js";

Game.init("game_container", 800, 800);
Game.load_tileset("red.json");
Game.load_tileset("exhaust.json");
Game.load_tileset("projectiles.json");

const spaceship = Game.create_sprite();
spaceship.set_tileset("red.json");
spaceship.set_position(500, 500);

const exhaust = Game.create_sprite();
exhaust.set_tileset("exhaust.json");
exhaust.set_position(500, 536);
exhaust.set_animation([0, 1, 2, 3, 4, 5], 1/15);

const minigun_proj = [];
for(let i=0; i<50; i++) {
	const projectile = Game.create_sprite();
	projectile.set_tileset("projectiles.json");
	projectile.set_direction(0);
	projectile.set_speed(800);
	minigun_proj.push(projectile);
}

let minigun_is_on = false;
let minigun_timer = Timer.create(1/7);
let minigun_index = 0;

Game.start();


spaceship.forever = function(elapsed_time) {

	spaceship.move();

	exhaust.set_x(spaceship.x);
	exhaust.set_y(spaceship.y + 52);
	exhaust.animate();

	if(minigun_is_on === true && minigun_timer.is_up(elapsed_time) === true) {
		minigun_proj[minigun_index].set_x(spaceship.x);
		minigun_proj[minigun_index].set_y(spaceship.y);
		minigun_index = (minigun_index + 1) % minigun_proj.length;
	}

	for(let i=0; i<50; i++) {
		if(minigun_proj[i].is_off_screen() === false) {
			minigun_proj[i].move();
		}
	}
}


Game.when_mouse = function(mouse) {

	spaceship.direction = 0;
	spaceship.set_speed(0);
	spaceship.set_x(mouse.x);
	spaceship.set_y(mouse.y);
}


Game.when_mouse_changed = function(mouse) {

	if(mouse.LB === 1) {
		minigun_is_on = true;
	}
	else if(mouse.LB === 0) {
		minigun_is_on = false;
	}
}


Game.when_keyboard_changed = function(keyboard) {

	// move ship with arrows
	spaceship.direction = 0;
	spaceship.set_speed(0);
	spaceship.set_costume(0);

	if(keyboard.KeyW === 1 && keyboard.KeyD === 1) {
		spaceship.direction = 45;
		spaceship.set_speed(300);
		spaceship.set_costume(4);
	}
	else if(keyboard.KeyD === 1 && keyboard.KeyS === 1) {
		spaceship.direction = 135;
		spaceship.set_speed(300);
		spaceship.set_costume(4);
	}
	else if(keyboard.KeyS === 1 && keyboard.KeyA === 1) {
		spaceship.direction = -135;
		spaceship.set_speed(300);
		spaceship.set_costume(2);
	}
	else if(keyboard.KeyA === 1 && keyboard.KeyW === 1) {
		spaceship.direction = -45;
		spaceship.set_speed(300);
		spaceship.set_costume(2);
	}
	else if(keyboard.KeyW === 1) {
		spaceship.direction = 0;
		spaceship.set_speed(300);
	}
	else if(keyboard.KeyS === 1) {
		spaceship.direction = 180;
		spaceship.set_speed(300);
	}
	else if(keyboard.KeyA === 1) {
		spaceship.direction = -90;
		spaceship.set_speed(300);
		spaceship.set_costume(2);
	}
	else if(keyboard.KeyD === 1) {
		spaceship.direction = 90;
		spaceship.set_speed(300);
		spaceship.set_costume(4);
	}
}

// we have to use when_gamepad for analog sticks
// Game.when_gamepad = function(gamepad) {

// 	move ship with left stick "LS"
// 	spaceship.direction = gamepad.LS.direction;
// 	spaceship.set_speed(gamepad.LS.magnitude * 300);
// 	spaceship.move();

// 	if( spaceship.direction > 75 && spaceship.direction < 105 ) {
// 		if( gamepad.LS.magnitude > 0.50 ) {
// 			spaceship.set_costume(4);
// 		}
// 		else if( gamepad.LS.magnitude > 0.25 ) {
// 			spaceship.set_costume(3);
// 		}
// 	}

// 	if( spaceship.direction < -75 && spaceship.direction > -105 ) {
// 		if( gamepad.LS.magnitude > 0.50 ) {
// 			spaceship.set_costume(2);
// 		}
// 		else if( gamepad.LS.magnitude > 0.25 ) {
// 			spaceship.set_costume(1);
// 		}
// 	}
// }


// Game.when_gamepad_changed = function() {

// 	move ship with DPAD
// 	spaceship.set_speed(0);

// 	if(gamepad.DPAD_UP === 1) {
// 		spaceship.direction = 0;
// 		spaceship.set_speed(300);
// 	}
// 	else if(gamepad.DPAD_DOWN === 1) {
// 		spaceship.direction = 180;
// 		spaceship.set_speed(300);
// 	}

// 	if(gamepad.DPAD_LEFT === 1) {
// 		spaceship.direction = -90;
// 		spaceship.set_speed(300);
// 	}
// 	else if(gamepad.DPAD_RIGHT === 1) {
// 		spaceship.direction = 90;
// 		spaceship.set_speed(300);
// 	}

// 	spaceship.move();
// }

