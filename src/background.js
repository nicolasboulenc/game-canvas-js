'use strict';

const Background = {

	// other
	create: function() {
		const obj = Object.create(this);

		obj._x = 0;
		obj._y = 0;
		obj._orientation = 0;	// should be rotation of the sprite

		obj._scale = 1;

		obj._game = null;
		obj._texture = null;
		obj._image_url = "";
		obj._width = 0;
		obj._height = 0;
		obj._tex_u = 0;
		obj._tex_v = 0;
		obj._tex_s = 0;
		obj._tex_t = 0;
		obj._opacity = 1.0;
		obj._is_visible = true;
		obj._is_deleted = false;

		obj._fit = "default";	// default, fit_horizontal, fit_vertical, stretch, center, tiled

		return obj;
	},

	set_image: function(url) {

		this._image_url = url;
		let texture = this._game.get_asset(this._image_url, this.set_image.bind(this));
		if(texture === null) return;

		this._texture = texture;

		this._tex_s = 0;
		this._tex_t = 0;
		this._tex_u = this._texture._width;
		this._tex_v = this._texture._height;

		this.set_fit(this._fit);

		// this._x = 0;
		// this._y = 0;
		// this._width = texture._width;
		// this._height = texture._height;
		// this._tex_u = this._width;
		// this._tex_v = this._height;
	},

	set_fit: function(fit) {

		this._fit = fit;
		if(this._texture === null) return;

		if(fit === "fit_horizontal") {
			const ratio = this._texture._width / this._texture._height;
			this._x = 0;
			this._width = this._game.width;
			this._height = Math.round(this._game.width / ratio);
			this._y = Math.round((this._game.height - this._height) / 2);
		}
		else if(fit === "fit_vertical") {
			const ratio = this._texture._width / this._texture._height;
			this._y = 0;
			this._height = this._game.height;
			this._width = Math.round(this._game.height * ratio);
			this._x = Math.round((this._game.width - this._width) / 2);
		}
		else if(fit === "stretch") {
			this._x = 0;
			this._y = 0;
			this._width = this._game.width;
			this._height = this._game.height;
		}
		else if(fit === "center") {
			this._x = Math.round((this._game.width - this._texture._width) / 2);
			this._y = Math.round((this._game.height - this._texture._height) / 2);
			this._width = this._texture._width;
			this._height = this._texture._height;
		}
		else if(fit === "tiled") {
			this._game._renderer.create_tiled(this, this._game.width, this._game.height);
			this._image_url += "-tiled"; 
			this._x = 0;
			this._y = 0;
			this._width = this._game.width;
			this._height = this._game.height;
		}
		else {	// default
			this._x = 0;
			this._y = 0;
			this._width = this._texture._width;
			this._height = this._texture._height;
		}
	}
};

export { Background };