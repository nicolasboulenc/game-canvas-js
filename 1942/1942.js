"use strict";

import { Timer } from "../src/game.js"
import { Keyboard } from "../src/keyboard.js"
import { Mouse } from "../src/mouse.js"
import { Gamepads } from "../src/gamepads.js"


const player_projectiles = []

let gun_is_on = false;
let gun_timer = new Timer(1/7);
let gun_index = 0;


window.requestAnimationFrame(loop)


function loop(timems) {

	window.requestAnimationFrame(loop)

	// update


}



spaceship.forever = function(elapsed_time) {

	// console.log(spaceship._x, spaceship._y);
	spaceship.move();

	exhaust_left.set_x(spaceship.x - 4);
	exhaust_left.set_y(spaceship.y + 52);
	exhaust_left.animate();

	exhaust_right.set_x(spaceship.x + 2);
	exhaust_right.set_y(spaceship.y + 52);
	exhaust_right.animate();


	if(gun_is_on === true && gun_timer.is_up(elapsed_time) === true) {
		game._sounds.play("mixkit-short-laser-gun-shot-1670.wav", 1)

		gun_proj[gun_index].set_x(spaceship.x - 17);
		gun_proj[gun_index].set_y(spaceship.y + 24);
		gun_index = (gun_index + 1) % gun_proj.length;

		gun_proj[gun_index].set_x(spaceship.x + 17);
		gun_proj[gun_index].set_y(spaceship.y + 24);
		gun_index = (gun_index + 1) % gun_proj.length;
	}

	for(let i=0; i<50; i++) {
		if(gun_proj[i].is_off_screen() === false) {
			gun_proj[i].move();
		}
	}
}


game.when_mouse = function(mouse) {

	// spaceship.direction = 0;
	// spaceship.set_speed(0);
	// spaceship.set_x(mouse.x);
	// spaceship.set_y(mouse.y);
}


game.when_mouse_changed = function(mouse) {

	if(mouse.LB === 1) {
		gun_is_on = true;
	}
	else if(mouse.LB === 0) {
		gun_is_on = false;
	}
}


game.when_keyboard_changed = function(keyboard) {

	// move ship with arrows
	spaceship.direction = 0;
	spaceship.set_speed(0);
	spaceship.set_costume(0);

	if(keyboard.KeyW === 1 && keyboard.KeyD === 1) {
		spaceship.direction = 45;
		spaceship.set_speed(300);
		spaceship.set_costume(4);
		console.log('tt');
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
game.when_gamepad = function(gamepad) {

	// move ship with left stick "LS"
	spaceship.direction = gamepad.LS.direction;
	spaceship.set_speed(gamepad.LS.magnitude * 300);
	spaceship.move();

	if( spaceship.direction > 75 && spaceship.direction < 105 ) {
		if( gamepad.LS.magnitude > 0.50 ) {
			spaceship.set_costume(4);
		}
		else if( gamepad.LS.magnitude > 0.25 ) {
			spaceship.set_costume(3);
		}
	}

	if( spaceship.direction < -75 && spaceship.direction > -105 ) {
		if( gamepad.LS.magnitude > 0.50 ) {
			spaceship.set_costume(2);
		}
		else if( gamepad.LS.magnitude > 0.25 ) {
			spaceship.set_costume(1);
		}
	}

	if( gamepad.LS.magnitude === 0 ) {
		spaceship.set_costume(0);
	}
}

Game.when_gamepad_changed = function(gamepad) {

	if(gamepad.A === 1) {
		gun_is_on = true;
	}
	else if(gamepad.A === 0) {
		gun_is_on = false;
	}
}
