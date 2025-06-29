'use strict';

class Background {

	game
	texture
	x
	y
	orientation	// should be rotation of the sprite
	scale
	image_url
	width
	height
	tex_u
	tex_v
	tex_s
	tex_t
	opacity
	is_visible
	is_deleted
	fit			// default, fit_horizontal, fit_vertical, stretch, center, tiled


	// other
	constructor(game) {

		this.init(game)
	}


	init(game) {
		
		this.game = game
		this.texture = null
		this.x = 0
		this.y = 0
		this.orientation = 0	// should be rotation of the sprite
		this.scale = 1
		this.image_url = ""
		this.width = 0
		this.height = 0
		this.tex_u = 0
		this.tex_v = 0
		this.tex_s = 0
		this.tex_t = 0
		this.opacity = 1.0
		this.is_visible = true
		this.is_deleted = false
		this.fit = "default"	// default, fit_horizontal, fit_vertical, stretch, center, tiled
	}


	set_image(url) {

		this.image_url = url
		this.texture = this.game.get_asset(this.image_url, this.set_image.bind(this))
		if(this.texture === null) return this

		this.tex_s = 0
		this.tex_t = 0
		this.tex_u = this.texture.width
		this.tex_v = this.texture.height

		this.set_fit(this.fit)
		return this
	}


	set_fit(fit) {

		this.fit = fit;
		if(this.texture === null) return;

		if(fit === "fit_horizontal") {
			const ratio = this.texture.width / this.texture.height;
			this.x = 0;
			this.width = this.game.width;
			this.height = Math.round(this.game.width / ratio);
			this.y = Math.round((this.game.height - this.height) / 2);
		}
		else if(fit === "fit_vertical") {
			const ratio = this.texture.width / this.texture.height;
			this.y = 0;
			this.height = this.game.height;
			this.width = Math.round(this.game.height * ratio);
			this.x = Math.round((this.game.width - this.width) / 2);
		}
		else if(fit === "stretch") {
			this.x = 0;
			this.y = 0;
			this.width = this.game.width;
			this.height = this.game.height;
		}
		else if(fit === "center") {
			this.x = Math.round((this.game.width - this.texture.width) / 2);
			this.y = Math.round((this.game.height - this.texture.height) / 2);
			this.width = this.texture.width;
			this.height = this.texture.height;
		}
		else if(fit === "tiled") {
			this.game._renderer.create_tiled(this, this.game.width, this.game.height);
			this.image_url += "-tiled";
			this.tex_u = this.game.width;
			this.tex_v = this.game.height;
			this.x = 0;
			this.y = 0;
			this.width = this.game.width;
			this.height = this.game.height;
		}
		else {	// default
			this.x = 0;
			this.y = 0;
			this.width = this.texture.width;
			this.height = this.texture.height;
		}
		return this
	}
}

export { Background };