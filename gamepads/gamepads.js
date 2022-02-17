"use strict";

import { Game, Sprite } from "../src/game.js";

Game.init("game_container", 800, 800);
Game.load_tileset("red.json");
Game.load_tileset("exhaust.json");

const spaceship = Sprite.create();
spaceship.set_tileset("red.json");
spaceship.set_position(500, 500);

const exhaust = Sprite.create();
exhaust.set_tileset("exhaust.json");
exhaust.set_position(500, 536);
exhaust.set_animation([0, 1, 2, 3, 4, 5], 1/15);


Game.start();

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

	// spaceship.move();
}


spaceship.forever = function(elapsed_time) {

	spaceship.move();
}


exhaust.forever = function(elapsed_time) {

	exhaust.set_x(spaceship.x);
	exhaust.set_y(spaceship.y + 52);
	exhaust.animate();
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

