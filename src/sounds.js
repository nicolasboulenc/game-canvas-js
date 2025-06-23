'use strict';

const Sounds = {

	_volume: 100,
	_sounds: null,
	_context: null,

	init: function() {
		this._volume = 100;
		this._sounds = [];
		this._context = new window.AudioContext();
		document.addEventListener("mousedown", this._on_user_interact.bind(this));
		return this;
	},

	load: async function(url) {
		const sound = Sound.create();
		this._sounds.push(sound);
		await sound.load(url);
		// async/await, anything could happen between these 2 lines !!!!
		// equiv to return promise
		if(this._context.state === "running") {
			console.log("decoding audio data.")
			sound._buffer = await this._context.decodeAudioData(sound._data);
			// async/await, anything could happen between these 2 lines !!!!
			// equiv to return promise
		}
		return sound;
	},

	play: function(sound_id, duration) {
		let sound = this._sounds.find(s => s._url === sound_id);
		if(typeof sound !== "undefined") {
			const source = this._context.createBufferSource();
			source.buffer = sound._buffer;
			source.connect(this._context.destination);
			source.start(0, 0, duration);
		}
	},

	_on_user_interact: async function() {
		if(this._context.state === "suspended") {
			await this._context.resume();
			// decode all data
			for(let sound of this._sounds) {
				if(sound._buffer === null) {
					console.log(`decoding ${sound._url}`);
					sound._buffer = await this._context.decodeAudioData(sound._data);
				}
			}
		}
	},

	start_sound: function() {},
	stop_all_sounds: function() {},
	change_effect_by: function() {},
	set_effect_to: function() {},
	change_colume_by: function() {},
	set_volume_to: function() {}
};


const Sound = {

	create: function() {
		const obj = Object.create(this);

		obj._url = "";
		obj._is_loaded = false;
		obj._data = null;
		obj._buffer = null;

		return obj;
	},

	load: async function(url) {

		this._url = url;
		const response = await fetch(url);
		// async/await, anything could happen between these 2 lines !!!!
		// equiv to return promise
		this._data = await response.arrayBuffer();
		// async/await, anything could happen between these 2 lines !!!!
		// equiv to return promise
		this._is_loaded = true;

		return this;
	}
};

export { Sounds };