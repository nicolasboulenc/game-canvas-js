"use strict";

import { Timer } from "../src/game.js"
import { Keyboard } from "../src/keyboard.js"
import { Mouse } from "../src/mouse.js"
import { Gamepads } from "../src/gamepads.js"


const inputs = {
	gamepads: null,
	keyboard: null,
	mouse: null
}

const app = {
	time_ms: 0,
	ctx: null
}

const SPEED_MAX = 100
const PLAYER_WIDTH = 100
const PLAYER_HEIGHT = 100
const player_entity = {
	position: {x: PLAYER_WIDTH/2, y: PLAYER_HEIGHT/2},
	direction: 0,
	speed: 0
}

const player_projectiles = []

let gun_is_on = false
let gun_timer = new Timer(1/7)
let gun_index = 0

init()
window.requestAnimationFrame(loop)


function init() {
	
	const canvas = document.createElement("canvas")
	app.ctx = canvas.getContext("2d")
	document.querySelector("#game-container").append(canvas)

	const observer = new ResizeObserver(when_resize)
	observer.observe(canvas)

	inputs.gamepads = Gamepads.init()
	inputs.keyboard = Keyboard.init(window)
	inputs.mouse = Mouse.init(canvas)
}

function loop(time_ms) {

	window.requestAnimationFrame(loop)
	let time_elapsed = time_ms - app.time_ms
	app.time_ms = time_ms


	// inputs
	inputs.gamepads.poll()
	let gamepad = inputs.gamepads.get_state(0)
	if(gamepad !== null) {
		when_gamepad(gamepad)
	}

	let keyboard = inputs.keyboard.get_state()
	if(keyboard !== null) {
		when_keyboard(keyboard)
	}

	let mouse = inputs.mouse.get_state()
	if(mouse !== null) {
		when_mouse(mouse)
	}


	// update logic
	player_entity.position.x += Math.cos(player_entity.direction) * player_entity.speed * time_elapsed / 1000
	player_entity.position.y += Math.sin(player_entity.direction) * player_entity.speed * time_elapsed / 1000 * -1

	if(gun_is_on === true && gun_timer.is_up(time_elapsed) === true) {

		// player_projectiles[gun_index].set_x(player_entity.x - 17);
		// player_projectiles[gun_index].set_y(player_entity.y + 24);
		// gun_index = (gun_index + 1) % player_projectiles.length;

		// player_projectiles[gun_index].set_x(player_entity.x + 17);
		// player_projectiles[gun_index].set_y(player_entity.y + 24);
		// gun_index = (gun_index + 1) % player_projectiles.length;
	}

	// for(let i=0; i<50; i++) {
	// 	if(player_projectiles[i].is_off_screen() === false) {
	// 		player_projectiles[i].move();
	// 	}
	// }


	// draw
	app.ctx.clearRect(0, 0, app.ctx.canvas.width, app.ctx.canvas.height)

	app.ctx.fillStyle = "yellow"
	app.ctx.fillRect(player_entity.position.x - PLAYER_WIDTH/2, player_entity.position.y - PLAYER_HEIGHT/4, PLAYER_WIDTH, 20)
	app.ctx.fillRect(player_entity.position.x - 5/2, player_entity.position.y - PLAYER_HEIGHT/2, 10, PLAYER_HEIGHT)
	app.ctx.fillRect(player_entity.position.x - PLAYER_WIDTH/4, player_entity.position.y + PLAYER_HEIGHT/4, PLAYER_WIDTH/2, 10)
}


function when_resize(entries, observer) {
	for (const entry of entries) {
		entry.target.width = entry.contentRect.width
		entry.target.height = entry.contentRect.height
	}
}


function when_mouse(mouse) {

	if(mouse.changed === false) return

	if(mouse.LB === 1) {
		gun_is_on = true;
	}
	else if(mouse.LB === 0) {
		gun_is_on = false;
	}
}


function when_keyboard(keyboard) {

	if(keyboard.changed === false) return

	// move ship with arrows
	player_entity.direction = Math.PI/2
	player_entity.speed = 0

	if(keyboard.KeyW === 1 && keyboard.KeyD === 1) {
		player_entity.direction = Math.PI/2
		player_entity.speed = SPEED_MAX
	}
	else if(keyboard.KeyD === 1 && keyboard.KeyS === 1) {
		player_entity.direction = -Math.PI/4
		player_entity.speed = SPEED_MAX
	}
	else if(keyboard.KeyS === 1 && keyboard.KeyA === 1) {
		player_entity.direction = -3*Math.PI/4
		player_entity.speed = SPEED_MAX
	}
	else if(keyboard.KeyA === 1 && keyboard.KeyW === 1) {
		player_entity.direction = 3*Math.PI/4
		player_entity.speed = SPEED_MAX
	}
	else if(keyboard.KeyW === 1) {
		player_entity.direction = Math.PI/2
		player_entity.speed = SPEED_MAX
	}
	else if(keyboard.KeyS === 1) {
		player_entity.direction = -Math.PI/2
		player_entity.speed = SPEED_MAX
	}
	else if(keyboard.KeyA === 1) {
		player_entity.direction = Math.PI
		player_entity.speed = SPEED_MAX
	}
	else if(keyboard.KeyD === 1) {
		player_entity.direction = 0
		player_entity.speed = SPEED_MAX
	}
}


function when_gamepad(gamepad) {

	// move ship with left stick "LS"
	player_entity.direction = gamepad.LS.direction;
	player_entity.set_speed(gamepad.LS.magnitude * 300);
	player_entity.move();

	if( player_entity.direction > 75 && player_entity.direction < 105 ) {
		if( gamepad.LS.magnitude > 0.50 ) {
			player_entity.set_costume(4);
		}
		else if( gamepad.LS.magnitude > 0.25 ) {
			player_entity.set_costume(3);
		}
	}

	if( player_entity.direction < -75 && player_entity.direction > -105 ) {
		if( gamepad.LS.magnitude > 0.50 ) {
			}
		else if( gamepad.LS.magnitude > 0.25 ) {
			player_entity.set_costume(1);
		}
	}

	if( gamepad.LS.magnitude === 0 ) {
		player_entity.set_costume(0);
	}

	if(gamepad.changed === false) return

	if(gamepad.A === 1) {
		gun_is_on = true;
	}
	else if(gamepad.A === 0) {
		gun_is_on = false;
	}
}
