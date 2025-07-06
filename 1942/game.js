"use strict";

import { Timer } from "../src/game.js"
import { Keyboard } from "../src/keyboard.js"
import { Mouse } from "../src/mouse.js"
import { Gamepads } from "../src/gamepads.js"
import { Player, Projectiles } from "./1942.js"


const inputs = {
	gamepads: null,
	keyboard: null,
	mouse: null
}

const app = {
	time_ms: 0,
	ctx: null
}


const PLAYER_WIDTH = 100
const PLAYER_HEIGHT = 80
const player_entity = new Player()
const player_projectiles = new Projectiles()
const PROJECTILE_SPEED_MAX = 400

let gun_is_on = false
let gun_timer = new Timer(1/7)
let gun_index = 0

const enemy_entities = []
const enemy_projectiles = []
const enemy_timer = new Timer(3)


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

	player_entity.x = app.ctx.canvas.width / 2
	player_entity.y = app.ctx.canvas.height - PLAYER_HEIGHT
	player_projectiles.defaults(-Math.PI/2, 400, 400, 1)

	enemy_timer.start()
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
	player_entity.x += Math.cos(player_entity.direction) * player_entity.speed * time_elapsed / 1000
	player_entity.y += Math.sin(player_entity.direction) * player_entity.speed * time_elapsed / 1000 * -1

	if(gun_is_on === true && gun_timer.is_up() === true) {
		let projectile = player_projectiles.make()
		projectile.x = player_entity.x - PLAYER_WIDTH/4 
		projectile.y = player_entity.y - 24

		projectile = player_projectiles.make()
		projectile.x = player_entity.x + PLAYER_WIDTH/4
		projectile.y = player_entity.y - 24
	}

	// enemy waves
	if( enemy_timer.is_up(time_elapsed) ) {
		const enemy = { x: 0, y: 0, speed: 0, direction: -Math.PI/2, type: "standard", status: "active", life: 3 }
		enemy.x = Math.random() * app.ctx.canvas.width
		enemy.speed = 100
		enemy_entities.push(enemy)
	}

	// enemy update
	for(const enemy of enemy_entities) {

		if(enemy.status === "inactive") continue

		enemy.x += Math.cos(enemy.direction) * enemy.speed * time_elapsed / 1000
		enemy.y += Math.sin(enemy.direction) * enemy.speed * time_elapsed / 1000 * -1
	}

	// projectiles update
	for(let projectile of player_projectiles.list) {
		
		if(projectile.status === "inactive") continue

		if(	projectile.x >= 0 && projectile.x <= app.ctx.canvas.width &&
			projectile.y >= 0 && projectile.y <= app.ctx.canvas.height	) {
			projectile.y += PROJECTILE_SPEED_MAX * time_elapsed / 1000 * -1
		}
		else {
			// out of screen
			projectile.status = "inactive"
		}
	}

	// collision enemy / projectiles
	for(const enemy of enemy_entities) {
		if(enemy.status !== "inactive") {

			for(const projectile of player_projectiles.list) {

				if(projectile.status === "inactive") continue

				if(	projectile.x > enemy.x - 10 && projectile.x < enemy.x + 10 && 
					projectile.y > enemy.y - 10 && projectile.y < enemy.y + 10	) {
					
					enemy.life -= projectile.damage
					projectile.status = "inactive"
					if(enemy.life <= 0) {
						enemy.status = "inactive"
					}
				}
			}
		}
	}


	// draw
	app.ctx.fillStyle = "#0af"
	app.ctx.fillRect(0, 0, app.ctx.canvas.width, app.ctx.canvas.height)

	app.ctx.fillStyle = "yellow"
	app.ctx.fillRect(player_entity.x - 10/2, player_entity.y - PLAYER_HEIGHT/2, 10, PLAYER_HEIGHT)
	app.ctx.fillRect(player_entity.x - PLAYER_WIDTH/2, player_entity.y - PLAYER_HEIGHT/4, PLAYER_WIDTH, 20)
	app.ctx.fillRect(player_entity.x - PLAYER_WIDTH/4, player_entity.y + PLAYER_HEIGHT/4, PLAYER_WIDTH/2, 10)
	app.ctx.fillStyle = "red"
	app.ctx.fillRect(player_entity.x - 1, player_entity.y -1, 2, 2)

	app.ctx.fillStyle = "orange"
	for(let projectile of player_projectiles.list) {
		if(projectile.status === "inactive") continue
		if(	projectile.x > 0 && projectile.x < app.ctx.canvas.width &&
			projectile.y > 0 && projectile.y < app.ctx.canvas.height	) {
			app.ctx.fillRect(projectile.x - 2, projectile.y - 2, 4, 4)
		}
	}

	app.ctx.fillStyle = "black"
	for(let enemy of enemy_entities) {
		if(enemy.status !== "inactive") {
			app.ctx.fillRect(enemy.x - 10, enemy.y - 10, 20, 20)
		}
	}
}


function when_resize(entries, observer) {
	for (const entry of entries) {
		entry.target.width = entry.contentRect.width
		entry.target.height = entry.contentRect.height
	}
	player_entity.x = app.ctx.canvas.width / 2
	player_entity.y = app.ctx.canvas.height - PLAYER_HEIGHT
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
		player_entity.direction = Math.PI/4
		player_entity.speed = player_entity.speed_max
	}
	else if(keyboard.KeyD === 1 && keyboard.KeyS === 1) {
		player_entity.direction = -Math.PI/4
		player_entity.speed = player_entity.speed_max
	}
	else if(keyboard.KeyS === 1 && keyboard.KeyA === 1) {
		player_entity.direction = -3*Math.PI/4
		player_entity.speed = player_entity.speed_max
	}
	else if(keyboard.KeyA === 1 && keyboard.KeyW === 1) {
		player_entity.direction = 3*Math.PI/4
		player_entity.speed = player_entity.speed_max
	}
	else if(keyboard.KeyW === 1) {
		player_entity.direction = Math.PI/2
		player_entity.speed = player_entity.speed_max
	}
	else if(keyboard.KeyS === 1) {
		player_entity.direction = -Math.PI/2
		player_entity.speed = player_entity.speed_max
	}
	else if(keyboard.KeyA === 1) {
		player_entity.direction = Math.PI
		player_entity.speed = player_entity.speed_max
	}
	else if(keyboard.KeyD === 1) {
		player_entity.direction = 0
		player_entity.speed = player_entity.speed_max
	}

	if(keyboard.Space === 1) {
		gun_is_on = true
		if(gun_timer.is_running === false) {
			gun_timer.start()
			console.log("start")
		}
	}
	else {
		gun_is_on = false
		gun_timer.stop()
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
