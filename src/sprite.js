'use strict';

import { Animation } from "./game.js";

class Sprite {

	get x() { return Math.round(this._x + this._width / 2); }
	get y() { return Math.round(this._y + this._height / 2); }
	get width() { return this._width; }
	get height() { return this._height; }

	get direction() { return this._direction; }
	set direction(value) { this._direction = value; }

	get size() { return this._size; }
	get mouse_down() { return this._mouse_down; }
	get mouse_x() { return this._mouse_x; }
	get mouse_y() { return this._mouse_y; }
	get speed() { return this._speed; }
	get acceleration() { return this._acceleration; }
	set acceleration(value) { this._acceleration = value; }
	get style() { return this._style; }

	constructor() {

		this._x = 0;
		this._y = 0;
		this._direction = 0;		// should be direction of travel
		this._orientation = 0;	// should be rotation of the sprite

		// looks
		this._tileset = null;
		this._costumes = [];		// should use the tileset thisect instead?
		this._costume_index = -1;
		this._animation = null;
		this._size = 100;
		this._scale = 1;
		this._bubble = null;

		// events
		this.when_start = null;
		this.when_clicked = null;

		// control
		this.forever = null;
		this.when_i_start_as_a_clone = null;

		// sensing
		this._mouse_down = false;
		this._mouse_x = 0;
		this._mouse_y = 0;

		// other
		this._game = null;
		this._image_url = "";
		this._tileset_url = "";
		this._width = 0;
		this._height = 0;
		this._tex_u = 0;
		this._tex_v = 0;
		this._tex_s = 0;
		this._tex_t = 0;
		this._opacity = 1.0;
		this._speed = 0;
		this._acceleration = 1.0;
		this._is_visible = true;
		this._is_deleted = false;

		this._animation = new Animation();
	}

	set_x(value) {
		this._x = Math.round(value - this._width / 2);
		if(this._bubble !== null) this._update_bubble_position();
	}

	set_y(value) {
		this._y = Math.round(value - this._height);
		if(this._bubble !== null) this._update_bubble_position();
	}

	set_position(...args) {
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
	}

	set_speed(value) {
		this._speed = value;
	}

	set_scale(scale) {
		this._scale = scale;
	}

	set_direction(direction) {
		this._direction = direction;
	}

	// point_towards: function(obj) {
	// 	if( (typeof obj === "object") && (obj instanceof Sprite) ) {
	// 		const x = this.x - obj.x;
	// 		const y = this.y - obj.y;
	// 		this._direction = Math.atan2(x, -y) * 180 / Math.PI;
	// 	}
	// },

	// motion
	move() {

		const elapsed_time = this._game._elapsed_time;

		let rad = -this._direction * Math.PI / 180 + Math.PI / 2;
		this._x += Math.cos(rad) * this._speed * this._acceleration * elapsed_time / 1000;
		// this._x = Math.round(this._x);

		this._y -= Math.sin(rad) * this._speed * this._acceleration * elapsed_time / 1000;
		// this._y = Math.round(this._y);
	}

	// 	glide(seconds, position) {}
	// 	glide(seconds, x, y) {}


	// 	if_on_edge_bounce() {}
	// 	set_rotation_style(style) {}

	// looks
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
	}

	_update_bubble_position() {
		this._bubble.style.top = `${this._y * this._game._renderer._scale - this._bubble.scrollHeight}px`;
		this._bubble.style.left = `${(this._x + this._width) * this._game._renderer._scale}px`;
	}

	// 	think(message, seconds=-1) {}
	set_costume(costume_index) {
		if(this._costumes.length === 0) return;
		this._costume_index = costume_index % this._costumes.length;
		this._tex_s = this._costumes[this._costume_index].x;
		this._tex_t = this._costumes[this._costume_index].y;
		this._tex_u = this._costumes[this._costume_index].w;
		this._tex_v = this._costumes[this._costume_index].h;
		this._width = this._costumes[this._costume_index].w;
		this._height = this._costumes[this._costume_index].h;
	}

	next_costume() {
		this._costume_index = (this._costume_index + 1) % this._costumes.length;
		this._tex_s = this._costumes[this._costume_index].x;
		this._tex_t = this._costumes[this._costume_index].y;
		this._tex_u = this._costumes[this._costume_index].w;
		this._tex_v = this._costumes[this._costume_index].h;
		this._width = this._costumes[this._costume_index].w;
		this._height = this._costumes[this._costume_index].h;
	}

	set_animation(frames, interval) {
		this._animation.set(frames, interval);
	}

	animate() {
		this.set_costume(this._animation.get_frame());
	}

	set_style(style) {
		this._style = style;
	}

	// 	switch_backdrop_to(backdrop) {}
	// 	next_backdrop() {}
	// 	change_size_by(amount) {}
	// 	set_size_to(value) {}
	// 	change_effect_by(effect, amount) {}
	// 	set_effect_to(effect, value) {}
	// 	clear_graphic_effect() {}

	show() {
		this._is_visible = true;
	}

	hide() {
		this._is_visible = false;
	}

	// 	go_to_layer(layer) {}
	//  go_forward_layer(amount) {}

	//     // sensing
	//     touching(what) {}
	//     touching_color(color) {}
	//     distance_to(what) {}
	//     ask_and_wait(question) {}

	// other


	set_image(url) {

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
	}

	set_tileset(url) {

		this._tileset_url = url;
		const tileset = this._game.get_asset(this._tileset_url, this.set_tileset.bind(this));
		if(tileset === null) return;
		this._tileset = tileset;
		this._costume_index = 0;
		for(let i=0; i<this._tileset._columns; i++) {
			this._costumes.push({ x: i * this._tileset._tile_width, y: 0, w: this._tileset._tile_width, h: this._tileset._tile_height});
		}
		return this.set_image(tileset._image_url);
	}

	is_off_screen() {
		return ( ( this._x + this._width < this._game.bounds.left ||
					this._x > this._game.bounds.right ) ||
					( this._y + this._height < this._game.bounds.top ||
					this._y > this._game.bounds.bottom ) );
	}
}

export { Sprite };