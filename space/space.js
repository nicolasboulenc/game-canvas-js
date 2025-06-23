"use strict";

import { Game, Timer } from "../src/game.js";

Game.init("game_container", 800, 600);
Game.load_tileset("red.json");
Game.load_tileset("exhaust.json");
Game.load_tileset("projectiles.json");
Game.load_image("PixelBackgroundSeamless.png");
Game.load_sound("mixkit-short-laser-gun-shot-1670.wav");

const spaceship = Game.create_sprite();
spaceship.set_tileset("red.json");
spaceship.set_position(500, 500);

const exhaust_left = Game.create_sprite();
exhaust_left.set_tileset("exhaust.json");
exhaust_left.set_animation([0, 1, 2, 3, 4, 5], 1/15);

const exhaust_right = Game.create_sprite();
exhaust_right.set_tileset("exhaust.json");
exhaust_right.set_animation([0, 1, 2, 3, 4, 5], 1/15);


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


const background = Game.create_background();
background.set_image("PixelBackgroundSeamless.png");
background.set_fit("tiled");	// default, fit_horizontal, fit_vertical, stretch, center, tiled


Game.start();


spaceship.forever = function(elapsed_time) {

	// console.log(spaceship._x, spaceship._y);
	spaceship.move();

	exhaust_left.set_x(spaceship.x - 4);
	exhaust_left.set_y(spaceship.y + 52);
	exhaust_left.animate();

	exhaust_right.set_x(spaceship.x + 2);
	exhaust_right.set_y(spaceship.y + 52);
	exhaust_right.animate();


	if(minigun_is_on === true && minigun_timer.is_up(elapsed_time) === true) {
		Game._sounds.play("mixkit-short-laser-gun-shot-1670.wav", 1)

		minigun_proj[minigun_index].set_x(spaceship.x - 17);
		minigun_proj[minigun_index].set_y(spaceship.y + 24);
		minigun_index = (minigun_index + 1) % minigun_proj.length;

		minigun_proj[minigun_index].set_x(spaceship.x + 17);
		minigun_proj[minigun_index].set_y(spaceship.y + 24);
		minigun_index = (minigun_index + 1) % minigun_proj.length;
	}

	for(let i=0; i<50; i++) {
		if(minigun_proj[i].is_off_screen() === false) {
			minigun_proj[i].move();
		}
	}
}


Game.when_mouse = function(mouse) {

	// spaceship.direction = 0;
	// spaceship.set_speed(0);
	// spaceship.set_x(mouse.x);
	// spaceship.set_y(mouse.y);
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
Game.when_gamepad = function(gamepad) {

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
		minigun_is_on = true;
	}
	else if(gamepad.A === 0) {
		minigun_is_on = false;
	}
}
