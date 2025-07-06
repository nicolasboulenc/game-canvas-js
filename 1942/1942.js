"use strict";


class Player {
	x
	y
	direction
	speed
	speed_max
	life

	constructor() {
		this.x = 0
		this.y = 0
		this.direction = Math.PI/2
		this.speed = 0
		this.speed_max = 200
		this.life = 3
	}
}


class Enemy {
	x
	y
	direction
	speed
	speed_max
	life

	type
	status

	constructor() {
		this.x = 0
		this.y = 0
		this.direction = -Math.PI/2
		this.speed = 0
		this.speed_max = 100
		this.life = 3

		this.type = "standard"
		this.status = "inactive"
	}
}


class Projectile {
	x
	y
	direction
	speed
	speed_max
	damage

	type
	status

	constructor(x, y) {
		this.x = 0
		this.y = 0
		this.direction = -Math.PI/2
		this.speed = 0
		this.speed_max = 400
		this.damage = 1

		this.type = "standard"
		this.status = "inactive"
	}
}


class Projectiles {

	default_direction
	default_acceleration
	default_speed
	default_speed_max
	default_damage
	list

	constructor() {

		this.default_direction = 0
		this.default_acceleration = 0
		this.default_speed = 0
		this.default_speed_max = 0
		this.default_damage = 0
		this.list = []
	}

	defaults(direction, speed, speed_max, damage) {

		this.default_direction = direction
		this.default_speed = speed
		this.default_speed_max = speed_max
		this.default_damage = damage
	}

	make() {

		let projectile_new = null
		for(const projectile of this.list) {
			if(projectile.status === "inactive") {
				projectile_new = projectile
				break
			}
		}

		if(projectile_new === null) {
			projectile_new = new Projectile()
			this.list.push(projectile_new)
		}

		this.init(projectile_new)
		return projectile_new
	}

	init(projectile) {

		projectile.direction = this.default_direction
		projectile.speed = this.default_speed
		projectile.speed_max = this.default_speed_max
		projectile.damage = this.default_damage
		projectile.type = "standard"
		projectile.status = "active"
	}
}


export { Player, Enemy, Projectiles }