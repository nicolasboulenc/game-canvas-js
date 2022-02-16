'use strict';

import { Game, Animation } from "./game.js";

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
		for(let i=0; i<this._tileset._columns; i++) {
			this._costumes.push({ x: i * this._tileset._tile_width, y: 0, w: this._tileset._tile_width, h: this._tileset._tile_height});
		}
		return this.set_image(tileset._image_url);
	},

	if_out_of_screen: function() {
		return ( ( this._x + this._width < this._game.bounds.left ||
					this._x > this._game.bounds.right ) ||
					( this._y + this._height < this._game.bounds.top ||
					this._y > this._game.bounds.bottom ) );
	}
};

export { Sprite };