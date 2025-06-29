'use strict';

class Background {

	// other
	constructor() {

		this._x = 0;
		this._y = 0;
		this._orientation = 0;	// should be rotation of the sprite

		this._scale = 1;

		this._game = null;
		// this._texture = null;
		this._image_url = "";
		this._width = 0;
		this._height = 0;
		this._tex_u = 0;
		this._tex_v = 0;
		this._tex_s = 0;
		this._tex_t = 0;
		this._opacity = 1.0;
		this._is_visible = true;
		this._is_deleted = false;

		this._fit = "default";	// default, fit_horizontal, fit_vertical, stretch, center, tiled
	}

	set_image(url) {

		this._image_url = url;
		let texture = this._game.get_asset(this._image_url, this.set_image.bind(this));
		if(texture === null) return;

		// this._texture = texture;

		this._tex_s = 0;
		this._tex_t = 0;
		this._tex_u = texture._width;
		this._tex_v = texture._height;

		this.set_fit(this._fit);
	}

	set_fit(fit) {

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
			this._tex_u = this._game.width;
			this._tex_v = this._game.height;
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
}

export { Background };