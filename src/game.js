'use strict';

import {Keyboard} from "./keyboard.js";

const Animation = {

	_index: 0,
	_frames: [],
	_interval: 1/15 * 1000,
	_timer: 0,

	create: function(frames=[], interval=1/15) {
		const obj = Object.create(this);
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

const Audio = {

	volume: 100,
	sounds: null,
	context: null,

	init: function() {
		this.volume = 100;
		this.sounds = [];
		this.context = new window.AudioContext();
	},

	load_sound: function(url) {
		let sound = this.sounds.find(s => s.url === url);
		if(typeof sound === "undefined") {
			sound = Object.create(Sound);
			sound.load(url)
			.then( dat => this.context.decodeAudioData(dat) )
			.then( buf => sound.buffer = buf )
			.catch( err => console.error(err) );
			this.sounds.push(sound);
		}
	},

	play_sound: function(sound_id, duration) {
		let sound = this.sounds.find(s => s.id === sound_id);
		if(typeof sound !== "undefined") {
			const source = this.context.createBufferSource();
			source.buffer = sound.buffer;
			source.connect(this.context.destination);
			source.start(0, 0, duration);
		}
	},

	start_sound: function() {},
	stop_all_sounds: function() {},
	change_effect_by: function() {},
	set_effect_to: function() {},
	change_colume_by: function() {},
	set_volume_to: function() {}
};


const Entity = {

	game: null,

    when_touching: null,
    forever: null,

    // sprite related
    _x: 0,
    _y: 0,
    _width: 0,
    _height: 0,
    _opacity: 1.0,
    _is_visible: true,

    // "physics" related
    speed: 0,
    acceleration: 1,
    direction: 0, // in degrees 0 facing north
    is_active: true,

    // texture
    _image_url: "", // used as texture id
    _tex_s: 0,
    _tex_t: 0,
    _tex_u: 0,
    _tex_v: 0,

    // animation
    frame: 0,

    _is_deleted: false,
    when_keyboard: null,
    when_keyboard_changed: null,
    when_gamepad: null,

	create: function(game) {
        const entity = Object.create(this);
        entity.init(game);
        return entity;
	},

	init: function(game) {

		this.game = game;

        this.when_touching = null;
		this.forever = null;

		// sprite related
		this._x = 0;
		this._y = 0;
		this._width = 0;
		this._height = 0;
		this._opacity = 1.0;
		this._is_visible = true;

		// "physics" related
		this.speed = 0;
		this.acceleration = 1;
		this.direction = 0; // in degrees 0 facing north
		this.is_active = true;

		// texture
		this._image_url = ""; // used as texture id
		this._tex_s = 0;
		this._tex_t = 0;
		this._tex_u = this._tex_s + this._width;
		this._tex_v = this._tex_t + this._height;

		// animation
        this.frame = 0;

        this._is_deleted = false;
	},

	load_texture: function(url) {
		this._image_url = url;
		this.game.load_texture(url)
			.then( texture => {
				this._width = texture.width;
				this._height = texture.height;
				this._tex_u = this._tex_s + this._width;
				this._tex_v = this._tex_t + this._height;
			})
			.catch( err => { reject(err); });
	},

	clone: function() {

		// let clone = Object.create();
		// clone.is_visible = this.is_visible;
		// clone.is_active = this.is_active;
		// clone.speed = this.speed;
		// clone.direction = this.direction;
		// clone.opacity = this.opacity;
		// clone.url = this.url;	// used as texture id
		// clone.s = this.s;
		// clone.t = this.t;
		// clone.u = this.u;
		// clone.v = this.v;

		// return clone;
	},

	get_direction: function() {
		return this.direction * 180 / Math.PI - Math.PI / 2;
	},

	set_direction: function(angle_degrees) {
		this.direction = -angle_degrees * Math.PI / 180 + Math.PI / 2
	},

	get_position: function() {
		return { x: this._x + this._width / 2, y: this._y + this._height / 2 };
	},

	set_position: function(x, y) {
		this._x = x - this._width / 2;
		this._y = y - this._height / 2;
	},

	step: function(elapse_time) {

		let rad = -this.direction * Math.PI / 180 + Math.PI / 2;
		this._x += Math.cos(this.direction) * this.speed * this.acceleration * elapse_time / 1000;
		this._x = Math.round(this._x);

		this._y -= Math.sin(this.direction) * this.speed * this.acceleration * elapse_time / 1000;
		this._y = Math.round(this._y);
	},

	is_inside: function(bounds) {

		let ax = this._x;
		let ay = this._y;

		let bx = this._x + this._width;
		let by = this._y + this._height;

		return  bx > bounds.left && ax < bounds.right &&
				by > bounds.top && ay < bounds.bottom;
	}
};


const Game = {

	_container: null,
	_canvas: null,
	_renderer: null,
	_audio: null,
	_gamepads: null,
	_keyboard: null,
	_stage: null,
	_background: null,
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
		this._renderer = Object.create(Renderer);
		this._renderer.init(this._canvas);
		this._audio = Object.create(Audio);
		this._audio.init();
		this._gamepads = Object.create(Gamepads);
		this._gamepads.init();
		this._gamepads.setup();
		this._keyboard = Keyboard.create();
		this._keyboard.setup();
		this._entities = [];
		this._assets = [];
		this._assets_loading = {};
		this._assets_listeners = {};
		this.on_update = null;
		// this.on_collision = null;
		// this.on_gamepad = null;
		this._collision_checks = [];
        // this.timestamp = 0;
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
		if(kb_state !== null) {
			if(this.when_keyboard_changed !== null && kb_state._changed === true) {
				this.when_keyboard_changed(kb_state);
			}
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

		if(this._background !== null) {
			entities = [this._background].concat(entities);
		}

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

	entity_add: function(sprite) {
		this._entities.push(sprite);
	},

	entity_clone: function(entity) {

		let clone = this._entities.find(e => e.is_deleted);
		if(typeof clone === "undefined") {
			clone = Object.create(Entity);
			this._entities.push(clone);
		}
		clone = Object.assign(clone, entity);
		clone.is_deleted = false;
		return clone;
	},

	sprite_delete: function(sprite) {

		const s = this._entities.find(e => e === sprite);
		if(typeof s !== "undefined") {
			s.is_deleted = true;
		}
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
	}
};


const Gamepad_State = {

    _changed: false,
	A: 0,
	B: 0,
	X: 0,
	Y: 0,
	LB: 0,
	RB: 0,
	LT: 0,
	RT: 0,
	BACK: 0,
	START: 0,
	LSB: 0,
	RSB: 0,
	DPAD_UP: 0,
	DPAD_DOWN: 0,
	DPAD_LEFT: 0,
	DPAD_RIGHT: 0,
	LSH: 0,
	LSV: 0,
	RSH: 0,
	RSV: 0,
	LS: { direction: 0, magnitude: 0 },   // direction in degres between -180 and 180, magnitude between 0 and 1
	RS: { direction: 0, magnitude: 0 },   // direction in degres between -180 and 180, magnitude between 0 and 1
};


const Gamepads = {

	gamepads: null,
	states: null,
	deadzone: 0,
    on_change: null,

	create: function() {
        const gamepads = Object.create(this);
        gamepads.init();
        return gamepads;
    },

	init: function() {
		this.gamepads = [];
		this.states = [];
		this.deadzone = 0.17;
	},

	setup: function() {
		window.addEventListener("gamepadconnected", this.on_connected.bind(this), false);
		window.addEventListener("gamepaddisconnected", this.on_disconnected.bind(this), false);
	},

	poll: function() {
		// according to chrome need to poll this every frame, not necessary on firefox
		this.gamepads = [];
		const gamepads = navigator.getGamepads();
		for(const gamepad of gamepads) {
			this.gamepads.push(gamepad);
		}
	},

	on_connected: function(evt) {
		let gamepad = evt.gamepad;
		this.gamepads[gamepad.index] = gamepad;
		this.states[gamepad.index] = Object.create(Gamepad_State);
	},

	on_disconnected: function(evt) {
		let gamepad = evt.gamepad;
		delete this.gamepads[gamepad.index];
		delete this.states[gamepad.index];
	},

	_detect: function() {
		this.gamepads.forEach(g => {
			g.buttons.forEach( (b, i) => {
				if(b.value !== 0) console.log("Button " + i, b);
			});
			g.axes.forEach( (a, i) => {
				if(a < -this.deadzone || a > this.deadzone) console.log("Axis " + i, a);
			});
		});
	},

	get_state: function(gamepad_index) {

        if(typeof this.states[gamepad_index] !== "undefined") {

            let gamepad = this.gamepads[gamepad_index];
            const state = this.states[gamepad_index];

            // update values
            state._changed = !(state.A === gamepad.buttons[0].value &&
                state.B === gamepad.buttons[1].value &&
                state.X === gamepad.buttons[2].value &&
                state.Y === gamepad.buttons[3].value &&
                state.LB === gamepad.buttons[4].value &&
                state.RB === gamepad.buttons[5].value &&
                state.BACK === gamepad.buttons[8].value &&
                state.START === gamepad.buttons[9].value &&
                state.LSB === gamepad.buttons[10].value &&
                state.RSB === gamepad.buttons[11].value &&
                state.DPAD_UP === gamepad.buttons[12].value &&
                state.DPAD_DOWN === gamepad.buttons[13].value &&
                state.DPAD_LEFT === gamepad.buttons[14].value &&
                state.DPAD_RIGHT === gamepad.buttons[15].value);

            state.A = gamepad.buttons[0].value;
            state.B = gamepad.buttons[1].value;
            state.X = gamepad.buttons[2].value;
            state.Y = gamepad.buttons[3].value;
            state.LB = gamepad.buttons[4].value;
            state.RB = gamepad.buttons[5].value;
            state.LT = gamepad.buttons[6].value;
            state.RT = gamepad.buttons[7].value;
            state.BACK = gamepad.buttons[8].value;
            state.START = gamepad.buttons[9].value;
            state.LSB = gamepad.buttons[10].value;
            state.RSB = gamepad.buttons[11].value;
            state.DPAD_UP = gamepad.buttons[12].value;
            state.DPAD_DOWN = gamepad.buttons[13].value;
            state.DPAD_LEFT = gamepad.buttons[14].value;
            state.DPAD_RIGHT = gamepad.buttons[15].value;
            state.LSH = gamepad.axes[0];
            state.LSV = gamepad.axes[1];
            state.RSH = gamepad.axes[2];
            state.RSV = gamepad.axes[3];

            // calculate values
            if(state.LSH < -this.deadzone || state.LSH > this.deadzone || state.LSV < -this.deadzone || state.LSV > this.deadzone) {
                state.LS.direction = Math.atan2(state.LSH, -state.LSV) * 180 / Math.PI;
                state.LS.magnitude = Math.min(Math.sqrt(state.LSH * state.LSH + state.LSV * state.LSV), 1.0);
            }
            else {
                state.LS.direction = 0;
                state.LS.magnitude = 0;
            }

            if(state.RSH < -this.deadzone || state.RSH > this.deadzone || state.RSV < -this.deadzone || state.RSV > this.deadzone) {
                state.RS.direction = Math.atan2(state.RSH, -state.RSV) * 180 / Math.PI;
                state.RS.magnitude = Math.min(Math.sqrt(state.RSH * state.RSH + state.RSV * state.RSV));
            }
            else {
                state.RS.direction = 0;
                state.RS.magnitude = 0;
            }

            if(state._changed === true && this.on_change !== null) this.on_change(state);

            return state;
		}
		else {
			return null;
		}
	},

	count: function() {
		return this.gamepads.length;
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

const Renderer = {

	_ctx: null,
	_buffer: null,
	_textures: null,
	_sprites: null,
	_background: null,
	_scale: 1,

	init: function(canvas) {

		this._ctx = canvas.getContext("2d");
		const buffer_canvas = document.createElement("canvas");
		this._buffer = buffer_canvas.getContext("2d");
		// this._buffer = document.getElementById("buffer").getContext("2d");
		this._buffer.canvas.width = this._ctx.canvas.width;
		this._buffer.canvas.height = this._ctx.canvas.height;
		this._textures = [];
		this._sprites = [];
	},

	set_scale: function(scale) {this._scale = scale; },

	fix_dpi: function() {

		const canvas = this._ctx.canvas;
		let dpi = window.devicePixelRatio;
		let style_height = +getComputedStyle(canvas).getPropertyValue('height').slice(0, -2);
		let style_width = +getComputedStyle(canvas).getPropertyValue('width').slice(0, -2);
		//set the correct attributes for a crystal clear image!
		canvas.setAttribute('width', style_width * dpi);
		canvas.setAttribute('height', style_height * dpi);
	},

	load_texture: async function(url) {

		let texture = Texture.create();
		this._textures.push(texture);
		await texture.load(url);
		// async/await, anything could happen between these 2 lines !!!!
		// equiv to return promise
		return texture;
	},

	buffer: function(sprites) {

		// this.sprites = [];
		// let visible = sprites.filter(s => s._is_visible );
		// visible.forEach(s => { this.sprites.push(s); });
		this._sprites = sprites.filter(s => s._is_visible );
	},

	render: function() {

		const canvas = this._ctx.canvas;

		// this._ctx.fillStyle = "#93bbec";
		this._ctx.fillStyle = "#black";
		this._ctx.fillRect (0, 0, canvas.width, canvas.height);

		if(this._textures.length === 0) return;

		this._ctx.imageSmoothingEnabled = false;
		this._ctx.scale(this._scale, this._scale);

		if(this._background !== null) {
			const y_offset = Math.floor((canvas.height - (this._background.canvas.height * this._scale)) / this._scale);
			this._ctx.drawImage(this._background.canvas, 0, y_offset);
		}

		let buffer_index = 0;
		let buffer_count = this._sprites.length;
		while(buffer_index < buffer_count) {

			let sprite = this._sprites[buffer_index];

			let texture = this._textures.find((tex) => {
				return tex.url === sprite._image_url;
			});

			if(typeof texture !== "undefined" && texture.is_loaded === true) {

				let saved_transform = this._ctx.getTransform();

				if(sprite._opacity !== this._ctx.globalAlpha) {
					this._ctx.globalAlpha = sprite._opacity;
				}

				// this._ctx.translate(Math.round(sprite._x / this._scale), Math.round(sprite._y / this._scale));
				this._ctx.translate(Math.round(sprite._x), Math.round(sprite._y));
				this._ctx.rotate(sprite._orientation);

				if(sprite._scale !== 1 || sprite._style === "flip_horizontal") {
					this._buffer.clearRect(0, 0, sprite._width * sprite._scale, sprite._height * sprite._scale);
					this._buffer.imageSmoothingEnabled = false;
					let flip = (sprite._style === "flip_horizontal" ? -1 : 1);
					this._buffer.scale(flip * sprite._scale, sprite._scale);
					flip = (sprite._style === "flip_horizontal" ? -1 : 0);
					this._buffer.drawImage(texture.image,
						sprite._tex_s, sprite._tex_t, sprite._tex_u, sprite._tex_v,
						flip * sprite._width, 0, sprite._width, sprite._height);

					this._ctx.drawImage(this._buffer.canvas,
						0, 0, sprite._width * sprite._scale, sprite._height * sprite._scale,
						0, 0, sprite._width * sprite._scale, sprite._height * sprite._scale);

					this._buffer.resetTransform();
				}
				else {
					this._ctx.drawImage(texture.image,
						sprite._tex_s, sprite._tex_t, sprite._tex_u, sprite._tex_v,
						0, 0, sprite._width, sprite._height);
				}

				this._ctx.setTransform(saved_transform);
			}

			buffer_index++;
		}
		this._ctx.resetTransform();
	},

	render_background: function(level, tileset) {


		const canvas = document.createElement("canvas");
		// const canvas = document.getElementById("background");
		canvas.width = level._level.width * tileset._tile_width;
		canvas.height = level._level.height * tileset._tile_height;

		this._background = canvas.getContext("2d");
		this._background.imageSmoothingEnabled = false;
		// this._background.scale(4, 4);

		this._background.fillStyle = "#93bbec";
		this._background.fillRect (0, 0, this._background.canvas.width, this._background.canvas.height);

		const texture = this._textures.find((tex) => {
			return tex.url === tileset._image_url;
		});

		level._level.layers[0].data.forEach((id, index) => {
			if(id === 0) return;
			const x = (index % level._level.width) * tileset._tile_width;
			const y = Math.floor(index / level._level.width) * tileset._tile_width;
			const tile = tileset.get_tile(id - 1);
			this._background.drawImage(texture.image,
				tile.x, tile.y, tile.w, tile.h,
				x, y, tile.w, tile.h);
		});
	}
};

const Sound = {

	_url: "",
	_id: "",
	_data: null,
	_buffer: null,

	load: function(url) {

		this.url = url;
		this.id = this.url;
		return new Promise((resolve, reject) => {
			fetch(url)
				.then( resp => resp.arrayBuffer() )
				.then( data => {
					this._data = data;
					resolve(data);
				})
				.catch(err => { reject(err); });
		});
	}
};


const Sprite = {

	// motion
	_x: 0,
	_y: 0,
	_direction: 0,		// should be direction of travel
	_orientation: 0,	// should be rotation of the sprite

	// looks
	_tileset: null,
	_costumes: [],		// should use the tileset object instead?
	_costume_index: -1,
	_animation: null,
	_size: 100,
	_scale: 1,
	_bubble: null,

	// events
	when_start: null,
	when_clicked: null,

	// control
	forever: null,
	when_i_start_as_a_clone: null,

	// sensing
	_mouse_down: false,
	_mouse_x: 0,
	_mouse_y: 0,

	// other
	_game: null,
	_image_url: "",
	_tileset_url: "",
	_width: 0,
	_height: 0,
	_tex_u: 0,
	_tex_v: 0,
	_tex_s: 0,
	_tex_t: 0,
	_opacity: 1.0,
	_speed: 0,
	_acceleration: 1.0,
	_is_visible: true,
	_is_deleted: false,

	get x() { return Math.round(this._x + this._width / 2); },
	get y() { return Math.round(this._y + this._height / 2); },
	get width() { return this._width; },
	get height() { return this._height; },

	get direction() { return this._direction; },
	set direction(value) { this._direction = value; },

	get size() { return this._size; },
	get mouse_down() { return this._mouse_down; },
	get mouse_x() { return this._mouse_x; },
	get mouse_y() { return this._mouse_y; },
	get speed() { return this._speed; },
	get acceleration() { return this._acceleration; },
	set acceleration(value) { this._acceleration = value; },
	get style() { return this._style; },



	set_x: function(value) {
		this._x = Math.round(value - this._width / 2);
		if(this._bubble !== null) this._update_bubble_position();
	},
	set_y: function(value) {
		this._y = Math.round(value - this._height);
		if(this._bubble !== null) this._update_bubble_position();
	},
	change_x_by: function(amount) {
		this._x += Math.round(amount);
		if(this._bubble !== null) this._update_bubble_position();
	},
	change_y_by: function(amount) {
		this._y += Math.round(amount); 
		if(this._bubble !== null) this._update_bubble_position();
	},
	set_position: function(...args) {
		if(args.length === 1 && Sprite.isPrototypeOf(args[0]) === true) {
			const s = args[0];
			this.set_x(s.x);
			this.set_y(s.y);
			if(this._bubble !== null) this._update_bubble_position();
		}
		else if(args.length === 2 && typeof args[0] === "number" && typeof args[1] === "number") {
			this.set_x(args[0]);
			this.set_y(args[1]);
			if(this._bubble !== null) this._update_bubble_position();
		}
	},
	set_speed: function(value) {
		this._speed = value;
	},
	set_scale: function(scale) { this._scale = scale; },
	change_scale_by: function(scale) { this._scale += scale; },

	// point_towards: function(obj) {
	// 	if( (typeof obj === "object") && (obj instanceof Sprite) ) {
	// 		const x = this.x - obj.x;
	// 		const y = this.y - obj.y;
	// 		this._direction = Math.atan2(x, -y) * 180 / Math.PI;
	// 	}
	// },

	// motion
	move: function() {

		const elapsed_time = this._game._elapsed_time;

		let rad = -this._direction * Math.PI / 180 + Math.PI / 2;
		// console.log(rad);
		this._x += Math.cos(rad) * this._speed * this._acceleration * elapsed_time / 1000;
		this._x = Math.round(this._x);

		this._y -= Math.sin(rad) * this._speed * this._acceleration * elapsed_time / 1000;
		this._y = Math.round(this._y);
	},

	// 	glide(seconds, position) {}
	// 	glide(seconds, x, y) {}


	// 	if_on_edge_bounce() {}
	// 	set_rotation_style(style) {}

	//     // looks
	say(message, seconds=-1) {
		if(this._bubble === null) {
			this._bubble = document.createElement("div");
			this._bubble.style.position = "absolute";
			this._bubble.style.border = "1px solid black";
			this._bubble.style.backgroundColor = "white";
			this._bubble.style.borderRadius = "3px";
			this._bubble.style.padding = "3px";
			this._bubble.style.zIndex = 2;
			this._bubble.style.color = "black";
			this._game._container.append(this._bubble);
		}
		this._bubble.innerHTML = message;
		this._update_bubble_position();
	},
	_update_bubble_position: function() {
		this._bubble.style.top = `${this._y * this._game._renderer._scale - this._bubble.scrollHeight}px`;
		this._bubble.style.left = `${(this._x + this._width) * this._game._renderer._scale}px`;
	},
	// 	think(message, seconds=-1) {}
	set_costume: function(costume_index) {
		this._costume_index = costume_index % this._costumes.length;
		this._tex_s = this._costumes[this._costume_index].x;
		this._tex_t = this._costumes[this._costume_index].y;
		this._tex_u = this._costumes[this._costume_index].w;
		this._tex_v = this._costumes[this._costume_index].h;
		this._width = this._costumes[this._costume_index].w;
		this._height = this._costumes[this._costume_index].h;
	},
	next_costume: function() {
		this._costume_index = (this._costume_index + 1) % this._costumes.length;
		this._tex_s = this._costumes[this._costume_index].x;
		this._tex_t = this._costumes[this._costume_index].y;
		this._tex_u = this._costumes[this._costume_index].w;
		this._tex_v = this._costumes[this._costume_index].h;
		this._width = this._costumes[this._costume_index].w;
		this._height = this._costumes[this._costume_index].h;
	},
	set_animation: function(frames, interval) {
		this._animation.set(frames, interval);
	},
	animate: function() {
		this.set_costume(this._animation.get_frame());
	},
	set_style: function(style) {
		this._style = style;
	},
	// 	switch_backdrop_to(backdrop) {}
	// 	next_backdrop() {}
	// 	change_size_by(amount) {}
	// 	set_size_to(value) {}
	// 	change_effect_by(effect, amount) {}
	// 	set_effect_to(effect, value) {}
	// 	clear_graphic_effect() {}
	show: function() { this._is_visible = true; },
	hide: function() { this._is_visible = false; },
	// 	go_to_layer(layer) {}
	//  go_forward_layer(amount) {}

	clone: function() {
		// automatically added to game.
		const clone = this._game.sprite_clone(this);
		return clone;
	},

	delete: function() {
		this._game.sprite_delete(this);
	},

	//     // sensing
	//     touching(what) {}
	//     touching_color(color) {}
	//     distance_to(what) {}
	//     ask_and_wait(question) {}

	// other
	create: function() {
		const obj = Object.create(this);
		obj._game = Game;
		obj._game.entity_add(obj);
		obj._animation = Animation.create();
		return obj;
	},

	set_image: function(url) {

		this._image_url = url;
		let texture = this._game.get_asset(this._image_url, this.set_image.bind(this));
		if(texture === null) return;

		if(this._costume_index === -1) {
			this._width = texture.width;
			this._height = texture.height;
		}
		else {
			const tile = this._tileset.get_tile(this._costume_index);
			this._tex_s = tile.x;
			this._tex_t = tile.y;
			this._width = tile.w;
			this._height = tile.h;
		}
		this._x = Math.round(this._x - this._width / 2);
		this._y = Math.round(this._y - this._height / 2);
		this._tex_u = this._width;
		this._tex_v = this._height;
	},

	set_tileset: function(url) {

		this._tileset_url = url;
		const tileset = this._game.get_asset(this._tileset_url, this.set_tileset.bind(this));
		if(tileset === null) return;

		this._tileset = tileset;
		this._costume_index = 0;
		return this.set_image(tileset._image_url);
	},

	if_out_of_screen: function() {
		return ( ( this._x + this._width < this._game.bounds.left ||
					this._x > this._game.bounds.right ) ||
					( this._y + this._height < this._game.bounds.top ||
					this._y > this._game.bounds.bottom ) );
	}
};


const Stage = {

	_game: null,
	_backdrops: null,
	_backdrops_index: 0,
	_backdrop_number: 0,
	_backdrop_name: "",
	_volume: 100,
	_backdrop_fit: "default",
	_backdrop_style: "default",
	_backdrop_computed: null,
	when_keyboard_changed: null,

	get backdrop_number() { return this._backdrop_index + 1; },
	get backdrop_name() { return this._backdrop_name; },
	get volume() { return this._volume; },
	set backdrop_style(style) {
		this._backdrop_style = style;
		if(this._backdrop_computed !== null) {
			this._backdrop_computed._style = this._backdrop_style;
		}
	},

	// looks
	// what: "next", "previous", "random", _image_url
	switch_backdrop_to: function(what) {
		if(what === "next") {
			this._backdrops_index = (this._backdrops_index + 1) % this._backdrops.length;
		}
		else if(what === "previous") {
			this._backdrops_index = (this._backdrops_index - 1 + this._backdrops.length) % this._backdrops.length;
		}
		else if(what === "random") {
			this._backdrops_index = Math.floor(Math.random() * this._backdrops.length);
		}
		else {
			const index = this._backdrops.findIndex(e => what === e._image_url);
			if(index !== -1) this._backdrops_index = index;
		}
		this._game.background = this._backdrops[this._backdrops_index];
	},

	next_backdrop: function() {
		this._backdrops_index = (this._backdrops_index + 1) % this._backdrops.length;
		this._game.background = this._backdrops[this._backdrops_index];
	},

	// other
	create: function() {
		const obj = Object.create(this);
		this._game.stage = obj;
		return obj;
	},

	init: function(game) {
		this._game = game;
		this._backdrops = [];
	},

	load_backdrop: function(url) {

		this._game.load_texture(url)
			.then( texture => {

				const backdrop = {
					_image_url: url,
					_x: 0,
					_y: 0,
					_width: texture.width,
					_height: texture.height,
					_tex_s: 0,
					_tex_t: 0,
					_tex_u: texture.width,
					_tex_v: texture.height,
					_is_visible: true,
				}
				this._backdrops.push(backdrop);
				if(this._backdrops.length === 1) {
					this._backdrop_computed = this.compute_backdrop_fit(this._backdrop_fit);
					this._game.background = this._backdrop_computed;
				}
			})
			.catch( err => { console.error(err); });

		return this;
	},

	set_backdrop_fit: function(fit) {
		// fit_horizontal, fit_vertical, stretch, center
		this._backdrop_fit = fit;

		if(this._backdrops.length > 0) {
			this._backdrop_computed = this.compute_backdrop(fit);
			this._game.background = this._backdrop_computed;
		}
	},

	compute_backdrop_fit: function(fit) {
		// fit_horizontal, fit_vertical, stretch, center
		const current_backdrop = this._backdrops[this._backdrops_index];

		let x;
		let y;
		let width;
		let height;

		if(fit === "default") {
			x = 0;
			y = 0;
			width = current_backdrop._width;
			height = current_backdrop._height;
		}
		else if(fit === "fit_horizontal") {
			const ratio = current_backdrop._width / current_backdrop._height;
			x = 0;
			width = this._game.width;
			height = Math.round(this._game.width / ratio);
			y = Math.round((this._game.height - height) / 2);
		}
		else if(fit === "fit_vertical") {
			const ratio = current_backdrop._width / current_backdrop._height;
			y = 0;
			height = this._game.height;
			width = Math.round(this._game.height * ratio);
			x = Math.round((this._game.width - width) / 2);
		}
		else if(fit === "stretch") {
			x = 0;
			y = 0;
			width = this._game.width;
			height = this._game.height;
		}
		else if(fit === "center") {
			x = Math.round((this._game.width - current_backdrop._width) / 2);
			y = Math.round((this._game.height - current_backdrop._height) / 2);
			width = current_backdrop._width;
			height = current_backdrop._height;
		}

		const new_backdrop = {
			_image_url: current_backdrop._image_url,
			_x: x,
			_y: y,
			_width: width,
			_height: height,
			_tex_s: current_backdrop._tex_s,
			_tex_t: current_backdrop._tex_t,
			_tex_u: current_backdrop._width,
			_tex_v: current_backdrop._height,
			_is_visible: current_backdrop._is_visible,
			_style: this._backdrop_style
		}

		return new_backdrop;
	}
};


const Texture = {

	url: "",
	image: null,
	is_loaded: false,
	id: 0,
	width: 0,
	height: 0,

	create: function() {
		const obj = Object.create(this);
		return obj;
	},

	load: async function(url) {

		this.url = url;
		this.id = this.url;

		if(url !== "webcam") {
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
		else if(url === "webcam"){
			const webcam = Object.create(Webcam);
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
};


const Tileset = {

	_game: null,
	_image_url: "",
	_columns: 0,
	_image_height: 0,
	_image_width: 0,
	_margin: 0,
	_spacing: 0,
	_tile_height: 0,
	_tile_width: 0,
	_tiles: [],

	create: function() {
		const obj = Object.create(this);
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


function Overlap(r1, r2) {
	return !(	r2._x > r1._x + r1._width ||
				r2._x + r2._width < r1._x ||
				r2._y > r1._y + r1._height ||
				r2._y + r2._height < r1._y	);
}

export { Game, Level, Sprite, Tileset, Texture, Keyboard };