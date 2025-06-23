'use strict';

import { Game } from "../src/game.js";

// global variables
const fire_rate = 6;
let fire_timestamp = 0;

const canvas = document.getElementById("canvas");
const game = Game.create(canvas);

Game.init("canvas", 800, 600);

// create spaceship
const spaceship = Entity.create(game);
spaceship.load_texture("invaders/spaceship.png");
spaceship.speed = 300;
spaceship.acceleration = 0;
spaceship.set_position(500, 900);
game.entity_add(spaceship);

spaceship.forever = function(elapsed_time) {
    this.step(elapsed_time);
};

// create projectiles
const projectiles = [];
for(let i=0; i<10; i++) {
    let projectile = Entity.create(game);
    projectile.load_texture("invaders/projectile.png");
    projectile.speed = 500;
    projectile.set_direction(0);
    projectile._is_visible = false;
    projectile.is_active = false;
    projectile.forever = function(elapsed_time) {
        this.step(elapsed_time);
        if(this.is_inside(game.bounds) !== true) {
            this.is_active = false;
        }
    };
    projectiles.push(projectile);
    game.entity_add(projectile);
}

// create invaders
for(let row=0; row<4; row++) {
    for(let col=0; col<6; col++) {
        let invader = Entity.create(game);
        invader.load_texture("invaders/invader.png");
        invader_init(invader, col, row);
        game.entity_add(invader);
    }
}

// create stars
// const stars = [];
// for(let i=32; i>7; i/=2) {
//     for(let n=0; n<i; n++) {
//         let star = new Entity("invaders/star.png");
//         star_init(star);
//         stars.push(star);
//     }
// }

game.on_update = update;
game.collision_checks.push({a: "invaders/projectile.png", b: "invaders/invader.png"});
game.on_collision = collision;

game.on_gamepad = function(gamepad) {

    // left stick controls spaceship
    spaceship.set_direction(gamepad.LS.direction);
    spaceship.acceleration = gamepad.LS.magnitude;

    // A button shoots
    if(gamepad.A === 1) {
        let now = Date.now();
        if(now > fire_timestamp + 1000 / fire_rate) {
            let projectile = projectiles.find(p => { return p.is_active === false; });
            if(typeof projectile !== "undefined") {
                let pos = spaceship.get_position();
                projectile.set_position(pos.x, pos.y - spaceship._height / 2);
                projectile._is_visible = true;
                projectile.is_active = true;
                fire_timestamp = now;
            }
        }
    }
};

game.start();

function update(elapsed_time) {

	// update invaders
	// for(let row=0; row<4; row++) {
	// 	for(let col=0; col<6; col++) {
	// 		let invader = invaders[row * 6 + col];
	// 		if(invader.is_active === true) {
	// 			invader.step(elapsed_time);
	// 			let origin = 100 + col * (72 + 72);
	// 			if(invader.x > origin + 84) {
	// 				invader.set_direction(-90);
	// 			}
	// 			else if(invader.x < origin - 84) {
	// 				invader.set_direction(90);
	// 			}
	// 		}
	// 	}
	// }

	// update stars
	// let opacity_speed = 0.5;
	// stars.forEach(s => {
	// 	let increment = s.direction * opacity_speed * elapsed_time / 1000
	// 	s.opacity += increment;
	// 	if(s.opacity > 1.0) {
	// 		s.opacity -= increment;
	// 		s.direction = -1.0;
	// 	}
	// 	if(s.opacity < 0.0) {
	// 		s.opacity -= increment;
	// 		s.direction = 1.0;
	// 		s.x = Math.floor(Math.random() * game.bounds.right);
	// 		s.y = Math.floor(Math.random() * game.bounds.bottom);
	// 	}
	// });
}

function collision(a, b) {
	console.log(a, b);
	a.is_active = false;
	a._is_visible = false;
	b.is_active = false;
	b._is_visible = false;
}

function invader_init(invader, col, row) {
	invader._x = 100 + col * (72 + 72);
	invader._y = 16 + row * (56 + 16);
	invader.set_direction(90);
    invader.speed = 100;
    invader.acceleration = 1;
}

function star_init(star) {
	star._x = Math.floor(Math.random() * game.bounds.right);
	star._y = Math.floor(Math.random() * game.bounds.bottom);
	star._opacity = Math.random();
	star.direction = 1;
}