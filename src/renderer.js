'use strict';

import { Texture } from "./game.js";

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

		return this;
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

	load_texture: async function(url, data=null) {

		let texture = Texture.create();
		this._textures.push(texture);
		await texture.load(url, data);
		// async/await, anything could happen between these 2 lines !!!!
		// equiv to return promise
		return texture;
	},

	buffer: function(sprites) {

		// this._sprites = [];
		// let visible = sprites.filter(s => s._is_visible );
		// visible.forEach(s => { this.sprites.push(s); });

		if(this._background !== null) {
			this._sprites = [this._background].concat( sprites.filter(s => s._is_visible) );	
		}
		else {
			this._sprites = sprites.filter(s => s._is_visible);
		}
	},

	render: function() {

		const canvas = this._ctx.canvas;

		// this._ctx.fillStyle = "#93bbec";
		this._ctx.fillStyle = "#black";
		this._ctx.fillRect (0, 0, canvas.width, canvas.height);

		if(this._textures.length === 0) return;

		this._ctx.imageSmoothingEnabled = false;
		this._ctx.scale(this._scale, this._scale);

		// if(this._background !== null) {
		// 	const y_offset = Math.floor((canvas.height - (this._background.canvas.height * this._scale)) / this._scale);
		// 	this._ctx.drawImage(this._background.canvas, 0, y_offset);
		// }

		let buffer_index = 0;
		let buffer_count = this._sprites.length;
		while(buffer_index < buffer_count) {

			let sprite = this._sprites[buffer_index];

			let texture = this._textures.find((tex) => {
				return tex._url === sprite._image_url;
			});

			if(typeof texture !== "undefined" && texture._is_loaded === true) {

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
					this._buffer.drawImage(texture._image,
						sprite._tex_s, sprite._tex_t, sprite._tex_u, sprite._tex_v,
						flip * sprite._width, 0, sprite._width, sprite._height);

					this._ctx.drawImage(this._buffer.canvas,
						0, 0, sprite._width * sprite._scale, sprite._height * sprite._scale,
						0, 0, sprite._width * sprite._scale, sprite._height * sprite._scale);

					this._buffer.resetTransform();
				}
				else {
					this._ctx.drawImage(texture._image,
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
			return tex._url === tileset._image_url;
		});

		level._level.layers[0].data.forEach((id, index) => {
			if(id === 0) return;
			const x = (index % level._level.width) * tileset._tile_width;
			const y = Math.floor(index / level._level.width) * tileset._tile_width;
			const tile = tileset.get_tile(id - 1);
			this._background.drawImage(texture._image,
				tile.x, tile.y, tile.w, tile.h,
				x, y, tile.w, tile.h);
		});
	},

	create_tiled: function(sprite, width, height) {

		// should use buffer here

		let texture = this._textures.find((tex) => {
			return tex._url === sprite._image_url;
		});

		if(typeof texture !== "undefined" && texture._is_loaded === true)

		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		canvas.width = width;
		canvas.height = height;

		const cols = Math.ceil(width / sprite._width);
		const rows = Math.ceil(height / sprite._height);

		for(let y=0; y<rows; y++) {
			for(let x=0; x<cols; x++) {
				ctx.drawImage( sprite._image,
					sprite.tex_u, sprite.tex_v, sprite.tex_s, sprite.tex_t,
					x * sprite._width, y * sprite._height, sprite._width, sprite._height );	
			}
		}

		const data = canvas.toDataURL();
		const texture = Texture.create();
		this._load_texture(`${sprite._image_url+"-tiled"}`, data, "data-url");
	}
};

export { Renderer };