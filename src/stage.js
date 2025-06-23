'use strict';

const Stage = {

	get backdrop_number() { return this._backdrop_index + 1; },
	get backdrop_name() { return this._backdrop_name; },
	get volume() { return this._volume; },
	set backdrop_style(style) {
		this._backdrop_style = style;
		if(this._backdrop_computed !== null) {
			this._backdrop_computed._style = this._backdrop_style;
		}
	},

	// other
	create: function() {
		const obj = Object.create(this);

		obj._game = null;
		obj._backdrops = [];
		obj._backdrops_index = 0;
		obj._backdrop_number = 0;
		obj._backdrop_name = "";
		obj._volume = 100;
		obj._backdrop_fit = "default";
		obj._backdrop_style = "default";
		obj._backdrop_computed = null;

		this._game.stage = obj;
		return obj;
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

export { Stage };