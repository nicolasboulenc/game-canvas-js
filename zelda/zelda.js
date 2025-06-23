"use strict";

Game.init("screen");

let link = Sprite.create();
link.load("link.json");
link.set_position(500, 500);
link._scale = 4;

// set how slow or quick the animation is going
const animation_ratio = 2;
let animation_index = 0;

let is_walking = false;
let direction = "S";
const walk_N_anim = [36, 37, 38, 39, 40, 41, 42, 43, 44];
const walk_NE_anim = [30, 31, 32, 33, 34, 35];
const walk_E_anim = [16, 17, 18, 19, 20, 21, 22, 23, 24];
const walk_SW_anim = [15, 11, 12, 13, 14, 15];
const walk_SE_anim = walk_SW_anim;
const walk_S_anim = [2, 3, 4, 5, 6, 7, 8, 9, 10];
const walk_W_anim = walk_E_anim;
const walk_NW_anim = walk_NE_anim;
let anim_index = 0;

link.forever = function() {
	// check if time to animate
	if((animation_index++ % animation_ratio) === 0) {

		// running animation
		if(is_walking) {
			const step1 = 12;
			const step2 = 7;
			link.set_style("");
			if(direction === "N") {
				anim_index = (anim_index + 1) % walk_N_anim.length;
				link.set_costume(walk_N_anim[anim_index]);
				link.change_y_by(-step1);
			}
			else if(direction === "NE") {
				anim_index = (anim_index + 1) % walk_NE_anim.length;
				link.set_costume(walk_NE_anim[anim_index]);
				link.change_x_by(step2);
				link.change_y_by(-step2);
			}
			else if(direction === "E") {
				anim_index = (anim_index + 1) % walk_E_anim.length;
				link.set_costume(walk_E_anim[anim_index]);
				link.change_x_by(step1);
			}
			else if(direction === "SE") {
				anim_index = (anim_index + 1) % walk_SE_anim.length;
				link.set_costume(walk_SE_anim[anim_index]);
				link.set_style("flip_horizontal");
				link.change_x_by(step2);
				link.change_y_by(step2);
			}
			else if(direction === "S") {
				anim_index = (anim_index + 1) % walk_S_anim.length;
				link.set_costume(walk_S_anim[anim_index]);
				link.change_y_by(step1);
			}
			else if(direction === "SW") {
				anim_index = (anim_index + 1) % walk_SW_anim.length;
				link.set_costume(walk_SW_anim[anim_index]);
				link.change_x_by(-step2);
				link.change_y_by(step2);
			}
			else if(direction === "W") {
				anim_index = (anim_index + 1) % walk_W_anim.length;
				link.set_costume(walk_W_anim[anim_index]);
				link.set_style("flip_horizontal");
				link.change_x_by(-step1);
			}
			else if(direction === "NW") {
				anim_index = (anim_index + 1) % walk_NW_anim.length;
				link.set_costume(walk_NW_anim[anim_index]);
				link.set_style("flip_horizontal");
				link.change_x_by(-step2);
				link.change_y_by(-step2);
			}
		}
		else {
			anim_index = 0;
			link.set_costume(2);
		}
	}
}


Game.when_gamepad_changed = function(gamepad) {
	if(gamepad.A === 1) {
		link.set_position(500, 500);
	}
}


Game.when_gamepad = function(gamepad) {

	is_walking = false;
	if(gamepad.LS.magnitude > 0.4) {
		is_walking = true;
		if(gamepad.LS.direction >= -22 && gamepad.LS.direction < 23) {
			direction = "N";
		}
		else if(gamepad.LS.direction >= 23 && gamepad.LS.direction < 68) {
			direction = "NE";
		}
		else if(gamepad.LS.direction >= 68 && gamepad.LS.direction < 113) {
			direction = "E";
		}
		else if(gamepad.LS.direction >= 113 && gamepad.LS.direction < 158) {
			direction = "SE";
		}
		else if(gamepad.LS.direction >= 158 || gamepad.LS.direction < -158) {
			direction = "S";
		}
		else if(gamepad.LS.direction >= -158 && gamepad.LS.direction < -113) {
			direction = "SW";
		}
		else if(gamepad.LS.direction >= -113 && gamepad.LS.direction < -68) {
			direction = "W";
		}
		else if(gamepad.LS.direction >= -68 && gamepad.LS.direction < -23) {
			direction = "NW";
		}
	}
}

Game.start();