'use strict';

import { Mouse } from "./mouse.js";
import { Gamepads } from "./gamepads.js";
import { Keyboard } from "./keyboard.js";

import { Sprite } from "./sprite.js";
import { Sounds } from "./sounds.js";
import { Background } from "./background.js";

import { Renderer } from "./renderer.js";


const Game = {

	_container: null,
	_canvas: null,
	_renderer: null,
	_sounds: null,
	_mouse: null,
	_gamepads: null,
	_keyboard: null,
	_stage: null,
	_entities: null,
	_assets: null,
	_assets_loading: null,
	_assets_listeners: null,
	_on_update: null,
	_on_collision: null,
	_collision_checks: null,
	_timestamp: 0,
	_frame_count: 0,
	_elapsed_time: 0,

	when_mouse: null,
	when_mouse_changed: null,

	when_gamepad: null,
	when_gamepad_changed: null,

	when_keyboard: null,
	when_keyboard_changed: null,

	get width() { return this._canvas.width },
	get height() { return this._canvas.height },
	get bounds() { return { left: 0, top: 0, right: this._canvas.width,	bottom: this._canvas.height } },
	set_size(width, height) { this._canvas.width = width; this._canvas.height = height; },
	set_scale: function(scale) { this._renderer.set_scale(scale); },

	init: function(container_id, width=1280, height=720) {

		this._container = document.getElementById(container_id);
		this._canvas = document.createElement("canvas");
		this.set_size(width, height);
		this._container.append(this._canvas);

		this._renderer = Renderer.init(this._canvas);
		this._sounds = Sounds.init();
		this._gamepads = Gamepads.init();
		this._keyboard = Keyboard.init();
		this._mouse = Mouse;
		this._mouse.init(this._canvas);

		this._entities = [];
		this._assets = [];
		this._assets_loading = {};
		this._assets_listeners = {};
		this.on_update = null;
		this._collision_checks = [];
	},

	start: function() {
		requestAnimationFrame(this.loop.bind(this));

		let entities = this._entities.filter(e => e._is_deleted === false);
		entities.forEach(e => {
			if(e.when_start !== null) {
				e.when_start();
			}
		});
	},

	loop: function(timestamp=0) {

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
			if(this.when_keyboard_changed !== null && kb_state._changed === true) {
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
	},

	collisions: function() {

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
	},

	buffer_clear: function() {
		this._entities = [];
	},

	create_sprite: function() {
		const sprite = Sprite.create();
		sprite._game = this;
		this._entities.push(sprite);
		return sprite;
	},

	clone_sprite: function(sprite) {

		let clone = this._entities.find(e => e.is_deleted);
		if(typeof clone === "undefined") {
			clone = Object.create(Sprite);
			this._entities.push(clone);
		}
		clone = Object.assign(clone, sprite);
		clone.is_deleted = false;
		return clone;
	},

	delete_sprite: function(sprite) {

		const s = this._entities.find(e => e === sprite);
		if(typeof s !== "undefined") {
			s.is_deleted = true;
		}
	},

	create_background: function() {
		const background = Background.create();
		background._game = this;
		this._renderer._background = background;
		return background;
	},

	get_asset: function(url, callback) {

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
	},

	load_image: async function(url) {

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
	},

	load_tileset: async function(url) {

		if(typeof this._assets_loading[url] === "undefined") {

			this._assets_loading[url] = true;
			const tileset = Tileset.create();
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
	},

	load_sound: async function(url) {

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
};


const Animation = {

	create: function(frames=[], interval=1/15) {
		const obj = Object.create(this);

		obj._index = 0;
		obj._timer = 0;
		obj._frames = frames;
		obj._interval = interval * 1000;

		return obj;
	},

	set: function(frames, interval) {
		this._index = 0;
		this._timer = 0;
		this._frames = frames;
		this._interval = interval * 1000;
	},

	get_frame: function() {
		const now = Date.now();
		if(now - this._timer > this._interval) {
			this._timer = now;
			this._index = (this._index + 1) % this._frames.length;
		}
		return this._frames[this._index];
	}
};


const Level = {

	_game: null,
	_level: null,

	create: function() {
		const obj = Object.create(this);
		obj._game = Game;
		return obj;
	},

	load: function(url) {
		return fetch(url)
			.then( resp => resp.json() )
			.then( level => {
				this._level = level;
				this._game._level = level;
			})
			.catch(err => { console.error(err); });
	}
}


const Texture = {

	create: function() {
		const obj = Object.create(this);

		obj._url = "";
		obj._image = null;
		obj._is_loaded = false;
		obj._id = 0;
		obj._width = 0;
		obj._height = 0;

		return obj;
	},

	load: async function(url, type="image", data=null) {

		this._url = url;
		this._id = url;

		if(type === "image") {
			const image = new Image();
			image.src = url;
			await image.decode();
			// async/await, anything could happen between these 2 lines !!!!
			// equiv to return promise
			this._image = image;
			this._width = image.width;
			this._height = image.height;
			this._is_loaded = true;
		}
		else if(type === "data") {
			const image = new Image();
			image.src = data;
			await image.decode();
			// async/await, anything could happen between these 2 lines !!!!
			// equiv to return promise
			this._image = image;
			this._width = image.width;
			this._height = image.height;
			this._is_loaded = true;
			return this;
		}
		else if(type === "webcam") {
			const webcam = Object.create(Webcam);
			webcam.init();
			await webcam.stream();
			// async/await, anything could happen between these 2 lines !!!!
			// equiv to return promise
			this._image = webcam._video_element;
			this._width = webcam._video_element.videoWidth;
			this._height = webcam._video_element.videoHeight;
			this._is_loaded = true;
		}

		return this;
	}
};


const Tileset = {

	create: function() {
		const obj = Object.create(this);

		obj._game = null;
		obj._image_url = "";
		obj._columns = 0;
		obj._image_height = 0;
		obj._image_width = 0;
		obj._margin = 0;
		obj._spacing = 0;
		obj._tile_height = 0;
		obj._tile_width = 0;
		obj._tiles = [];

		obj._game = Game;
		return obj;
	},

	load: async function(url) {

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
	},

	get_tile: function(id) {
		const x = id % this._columns * (this._tile_width + 1) + 1;
		const y = Math.floor(id / this._columns) * (this._tile_height + 1) + 1;
		return { "id": id, "x": x, "y": y, "w": this._tile_width, "h": this._tile_height };
	},
};


const Webcam = {

	_video_element: null,
	_devices: [],

	init: function() {
		this._video_element = document.createElement("video");
		this._video_element.setAttribute("autoplay", true);
		this._video_element.setAttribute("id", "webcam");
		this._video_element.setAttribute("hidden", true);
		document.getElementsByTagName("body")[0].appendChild(this._video_element);
		return this;
	},

	enumerate_devices: function() {
		return new Promise((resolve, reject) => {
			navigator.mediaDevices.enumerateDevices()
				.then(devices => {
					this._devices = devices;
					resolve(devices);
				})
				.catch(err => reject(err));
		});
	},

	stream: function(device_id="") {
		const constraints = {
			// audio: { deviceId: {exact: this._devices[1].deviceId} },
			// video: { deviceId: {exact: device_id} }
			video: true
		};

		return new Promise((resolve, reject) => {
			navigator.mediaDevices.getUserMedia(constraints)
				.then(stream => {
					this._video_element.srcObject = stream;
					this._video_element.onloadedmetadata = function(e) { resolve(stream); };
				})
				.catch(err => reject(err));
		});
	}
};



const Timer = {

	create: function(interval=1/15) {
		const obj = Object.create(this);

		obj._acc = 0;
		obj._interval = interval * 1000;

		return obj;
	},

	is_up: function(elapsed_time) {

		this._acc += elapsed_time;

		if(this._acc > this._interval) {
			this._acc -= this._interval;
			return true;
		}
		else {
			return false;
		}
	}
};

// function Overlap(r1, r2) {
// 	return !(	r2._x > r1._x + r1._width ||
// 				r2._x + r2._width < r1._x ||
// 				r2._y > r1._y + r1._height ||
// 				r2._y + r2._height < r1._y	);
// }

export { Game, Sprite, Animation, Texture, Timer };