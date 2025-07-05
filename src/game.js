'use strict';

import { Mouse } from "./mouse.js";
import { Gamepads } from "./gamepads.js";
import { Keyboard } from "./keyboard.js";

import { Sprite } from "./sprite.js";
import { Sounds } from "./sounds.js";
import { Background } from "./background.js";

import { Renderer } from "./renderer.js";


class Game {

	_container
	_canvas
	_renderer
	_sounds
	_mouse
	_gamepads
	_keyboard
	_stage
	_entities
	_assets
	_assets_loading
	_assets_listeners
	_on_update
	_on_collision
	_collision_checks
	_timestamp
	_frame_count
	_elapsed_time

	when_mouse
	when_mouse_changed

	when_gamepad
	when_gamepad_changed

	when_keyboard
	when_keyboard_changed

	get width() { return this._canvas.width }
	get height() { return this._canvas.height }
	get bounds() { return { left: 0, top: 0, right: this._canvas.width,	bottom: this._canvas.height } }
	set_size(width, height) { this._canvas.width = width; this._canvas.height = height; }
	set_scale(scale) { this._renderer.set_scale(scale); }

	constructor() {

		this._container = null
		this._canvas = null
		this._renderer = null
		this._sounds = null
		this._mouse = null
		this._gamepads = null
		this._keyboard = null
		this._stage = null
		this._entities = null
		this._assets = null
		this._assets_loading = null
		this._assets_listeners = null
		this._on_update = null
		this._on_collision = null
		this._collision_checks = null
		this._timestamp = 0
		this._frame_count = 0
		this._elapsed_time = 0
		this.when_mouse = null
		this.when_mouse_changed = null
		this.when_gamepad = null
		this.when_gamepad_changed = null
		this.when_keyboard = null
		this.when_keyboard_changed = null
	}

	init(container_id, width=1280, height=720) {

		this._container = document.getElementById(container_id);
		this._canvas = document.createElement("canvas");
		this.set_size(width, height);
		this._container.append(this._canvas);

		this._renderer = new Renderer()
		this._renderer.init(this._canvas);
		this._sounds = new Sounds()
		this._sounds.init()
		this._gamepads = new Gamepads();
		this._gamepads.init();
		this._keyboard = Keyboard;
		this._keyboard.init(window);
		this._mouse = Mouse;
		this._mouse.init(this._canvas);

		this._entities = [];
		this._assets = [];
		this._assets_loading = {};
		this._assets_listeners = {};
		this.on_update = null;
		this._collision_checks = [];
	}

	start() {
		requestAnimationFrame(this.loop.bind(this));

		let entities = this._entities.filter(e => e._is_deleted === false);
		entities.forEach(e => {
			if(e.when_start !== null) {
				e.when_start();
			}
		});
	}

	loop(timestamp=0) {

		let elapsed_time = timestamp - this._timestamp;
		this._elapsed_time = elapsed_time;
		this._timestamp = timestamp;

		// inputs
		this._gamepads.poll();
		let gp_state = this._gamepads.get_state(0);
		if(gp_state !== null) {
			if(this.when_gamepad !== null) {
				this.when_gamepad(gp_state);
			}
			if(this.when_gamepad_changed !== null && gp_state._changed === true) {
				this.when_gamepad_changed(gp_state);
			}
		}

		let kb_state = this._keyboard.get_state();
		// if(kb_state !== null) {
			if(this.when_keyboard_changed !== null && kb_state.changed === true) {
				this.when_keyboard_changed(kb_state);
			}
		// }

		let ms_state = this._mouse.get_state();
		if(this.when_mouse !== null) {
			this.when_mouse(ms_state);
		}
		if(this.when_mouse_changed !== null && ms_state.changed === true) {
			this.when_mouse_changed(ms_state);
		}



		// entities.forEach(e => {
		// 	if(e.when_keyboard !== null) {
		// 		e.when_keyboard(this.keyboard.state);
		// 	}
		// });

		// logic
		let entities = this._entities.filter(e => e._is_deleted === false);


		entities.forEach(e => {
			if(e.forever !== null) {
				e.forever(elapsed_time);
			}
		});

		if(this.on_update !== null) {
			this.on_update(elapsed_time);
		}
		this.collisions();

		// render
		this._renderer.buffer(entities);
		this._renderer.render();

		let t = requestAnimationFrame(this.loop.bind(this));
	}

	collisions() {

		this._collision_checks.forEach(c => {

			this._entities
				.filter(s => s.is_active === true && s._image_url === c.a)
				.forEach(sa => {
					this._entities
						.filter(s => s.is_active === true && s._image_url === c.b)
						.forEach(sb => {
							if(Overlap(sa, sb) === true) {
								this.on_collision(sa, sb);
							}
						});
				});
		});
	}

	buffer_clear() {
		this._entities = [];
	}

	create_sprite() {
		const sprite = new Sprite()
		sprite._game = this;
		this._entities.push(sprite);
		return sprite;
	}

	clone_sprite(sprite) {

		let clone = this._entities.find(e => e.is_deleted);
		if(typeof clone === "undefined") {
			clone = Object.create(Sprite);
			this._entities.push(clone);
		}
		clone = Object.assign(clone, sprite);
		clone.is_deleted = false;
		return clone;
	}

	delete_sprite(sprite) {

		const s = this._entities.find(e => e === sprite);
		if(typeof s !== "undefined") {
			s.is_deleted = true;
		}
	}

	create_background() {
		const background = new Background(this);
		this._renderer._background = background;
		return background;
	}

	get_asset(url, callback) {

		if(typeof this._assets_loading[url] === "undefined") {
			console.log(`Error: requested unknown asset ${url} !`);
			return;
		}

		if(this._assets_loading[url] === true) {
			if(typeof this._assets_listeners[url] === "undefined") {
				this._assets_listeners[url] = [];
			}
			this._assets_listeners[url].push(callback);
			return null;
		}
		else {
			return this._assets[url];
		}
	}

	async load_image(url) {

		if(typeof this._assets_loading[url] === "undefined") {

			this._assets_loading[url] = true;
			const texture = await this._renderer.load_texture(url);
			// async/await, anything could happen between these 2 lines !!!!
			// equiv to return promise
			this._assets[url] = texture;
			this._assets_loading[url] = false;
			if(typeof this._assets_listeners[url] !== "undefined") {
				for(const callback of this._assets_listeners[url]) {
					callback(url);
				}
			}
		}
	}

	async load_tileset(url) {

		if(typeof this._assets_loading[url] === "undefined") {

			this._assets_loading[url] = true;
			const tileset = new Tileset();
			tileset._game = this
			this._assets[url] = tileset;
			await tileset.load(url);
			// async/await, anything could happen between these 2 lines !!!!
			// equiv to return promise
			this._assets_loading[url] = false;
			if(typeof this._assets_listeners[url] !== "undefined") {
				for(const callback of this._assets_listeners[url]) {
					callback(url);
				}
			}
		}
	}

	async load_sound(url) {

		if(typeof this._assets_loading[url] === "undefined") {

			this._assets_loading[url] = true;
			const sound = await this._sounds.load(url);
			// async/await, anything could happen between these 2 lines !!!!
			// equiv to return promise
			this._assets[url] = sound;
			this._assets_loading[url] = false;
			if(typeof this._assets_listeners[url] !== "undefined") {
				for(const callback of this._assets_listeners[url]) {
					callback(url);
				}
			}
		}
	}
}


class Animation {

	index
	timer
	frames
	interval

	constructor(frames=[], interval=1/15) {
		this.index = 0;
		this.timer = 0;
		this.frames = frames;
		this.interval = interval * 1000;
	}

	set(frames, interval) {
		this.index = 0;
		this.timer = 0;
		this.frames = frames;
		this.interval = interval * 1000;
	}

	get_frame() {
		const now = Date.now();
		if(now - this.timer > this.interval) {
			this.timer = now;
			this.index = (this.index + 1) % this.frames.length;
		}
		return this.frames[this.index];
	}
}


class Level {

	game
	level

	constructor(game) {
		this.game = game;
	}

	load(url) {
		return fetch(url)
			.then( resp => resp.json() )
			.then( level => {
				this.level = level;
				this.game._level = level;
			})
			.catch(err => { console.error(err); });
	}
}


class Texture {

	url
	image
	is_loaded
	id
	width
	height

	constructor() {

		this.url = "";
		this.image = null;
		this.is_loaded = false;
		this.id = 0;
		this.width = 0;
		this.height = 0;
	}

	async load(url, type="image", data=null) {

		this.url = url;
		this.id = url;

		if(type === "image") {
			const image = new Image();
			image.src = url;
			await image.decode();
			// async/await, anything could happen between these 2 lines !!!!
			// equiv to return promise
			this.image = image;
			this.width = image.width;
			this.height = image.height;
			this.is_loaded = true;
		}
		else if(type === "data") {
			const image = new Image();
			image.src = data;
			await image.decode();
			// async/await, anything could happen between these 2 lines !!!!
			// equiv to return promise
			this.image = image;
			this.width = image.width;
			this.height = image.height;
			this.is_loaded = true;
			return this;
		}
		else if(type === "webcam") {
			const webcam = new Webcams();
			webcam.init();
			await webcam.stream();
			// async/await, anything could happen between these 2 lines !!!!
			// equiv to return promise
			this.image = webcam._video_element;
			this.width = webcam._video_element.videoWidth;
			this.height = webcam._video_element.videoHeight;
			this.is_loaded = true;
		}

		return this;
	}
}


class Tileset {
	
	constructor() {

		this._game = null;
		this._image_url = "";
		this._columns = 0;
		this._image_height = 0;
		this._image_width = 0;
		this._margin = 0;
		this._spacing = 0;
		this._tile_height = 0;
		this._tile_width = 0;
		this._tiles = [];
		this._game = Game;
	}

	async load(url) {

		const response = await fetch(url);
		// async/await, anything could happen between these 2 lines !!!!
		// equiv to return promise
		const tileset = await response.json();
		// async/await, anything could happen between these 2 lines !!!!
		// equiv to return promise
		this._image_url = tileset.image;
		this._columns = tileset.columns;
		this._image_height = tileset.imageheight;
		this._image_width = tileset.imagewidth;
		this._margin = tileset.margin;
		this._spacing = tileset.spacing;
		this._tile_height = tileset.tileheight;
		this._tile_width = tileset.tilewidth;
		this._tiles = tileset.tiles;

		await this._game.load_image(tileset.image);
	}

	get_tile(id) {
		const x = id % this._columns * (this._tile_width + 1) + 1;
		const y = Math.floor(id / this._columns) * (this._tile_height + 1) + 1;
		return { "id": id, "x": x, "y": y, "w": this._tile_width, "h": this._tile_height };
	}
}


class Timer {

	#acc
	#interval
	#time
	#is_running

	constructor(interval=1/15) {
		this.#acc = 0
		this.#interval = interval * 1000
		this.#time = performance.now()
		this.#is_running = false
	}

	get is_running() { return this.#is_running }

	start() {
		this.#time = performance.now()
		this.#acc = this.#interval
		this.#is_running = true
	}

	stop() {
		this.#is_running = false
	}

	is_up() {

		if(this.#is_running === false) return false

		const time_elapsed = performance.now() - this.#time
		this.#time += time_elapsed
		this.#acc += time_elapsed

		if(this.#acc > this.#interval) {
			this.#acc -= this.#interval
			return true
		}
		else {
			return false
		}
	}
}

// function Overlap(r1, r2) {
// 	return !(	r2._x > r1._x + r1._width ||
// 				r2._x + r2._width < r1._x ||
// 				r2._y > r1._y + r1._height ||
// 				r2._y + r2._height < r1._y	);
// }

export { Game, Sprite, Animation, Texture, Timer };