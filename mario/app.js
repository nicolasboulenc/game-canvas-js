"use strict";

import {Game, Level, Sprite, Tileset} from "../src/game.js";

Game.init("game_container", 1920, 1080);
Game.set_scale(4);

let mario = Sprite.create();
mario.load("mario1.json")
	.then((t) => {
		mario.set_position(24, 64);
		mario.set_animation([4, 3, 2], 1/15);
		mario.say("Hello world!!!");
	})

let is_running = false;
let direction = 1;

const level = Level.create();
level.load("level1-1.json");

const tileset = Tileset.create();
tileset.load("tileset.json");

Promise.all([level.load("level1-1.json"), tileset.load("tileset.json")])
.then((l, t) => {
	Game.renderer.render_background(level, tileset);
})


mario.forever = function(elapsed_time) {

	// running animation
	if(is_running) {
		mario.animate();
	}
	else {
		mario.set_costume(0);
	}

	if(is_running) {
		mario.change_x_by(direction * 5);
	}
}


Game.when_gamepad_changed = function(gamepad) {
	if(gamepad.Y === 1) {
		mario.set_position(100, 100);
	}
}


Game.when_gamepad = function(gamepad) {

	is_running = false;

	if(gamepad.LS.magnitude > 0.4) {

		if(Math.abs(gamepad.LSH) > Math.abs(gamepad.LSV)) {
			// then run
			is_running = true;
			if(gamepad.LSH >= 0) {
				mario.set_style("");
				direction = 1;
			}
			else {
				mario.set_style("flip_horizontal");
				direction = -1;
			}
		}
	}
}

Game.start();