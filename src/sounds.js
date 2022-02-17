'use strict';

const Sounds = {

	_volume: 100,
	_sounds: null,
	_context: null,

	init: function() {
		this._volume = 100;
		this._sounds = [];
		this._context = new window.AudioContext();
	},

	load_sound: async function(url) {
		const sound = Sound.create();
		await sound.load(url);
		sound._buffer = this.context.decodeAudioData(sound._data);
		this._sounds.push(sound);
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


const Sound = {

	create: function() {
		const obj = Object.create(this);

		obj._url = "";
		obj._is_loaded = false;
		obj._id = 0;
		obj._data = null;
		obj._buffer = null;

		return obj;
	},

	load: async function(url) {

		this._url = url;
		this._id = this.url;
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