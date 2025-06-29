'use strict';

class Sounds {

	_volume
	_sounds
	_context

	constructor() {

		this._volume = 100
		this._sounds = null
		this._context = null
	}

	init() {

		this._volume = 100;
		this._sounds = [];
		this._context = new window.AudioContext();
		document.addEventListener("mousedown", this._on_user_interact.bind(this));
		return this;
	}

	async load(url) {
		const sound = new Sound();
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
	}

	play(sound_id, duration) {
		let sound = this._sounds.find(s => s._url === sound_id);
		if(typeof sound !== "undefined") {
			const source = this._context.createBufferSource();
			source.buffer = sound._buffer;
			source.connect(this._context.destination);
			source.start(0, 0, duration);
		}
	}

	async _on_user_interact() {
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
	}

	start_sound() {}
	stop_all_sounds() {}
	change_effect_by() {}
	set_effect_to() {}
	change_colume_by() {}
	set_volume_to() {}
}


class Sound {

	constructor() {

		this._url = ""
		this._is_loaded = false
		this._data = null
		this._buffer = null
	}

	async load(url) {

		this._url = url
		const response = await fetch(url)
		// async/await, anything could happen between these 2 lines !!!!
		// equiv to return promise
		this._data = await response.arrayBuffer()
		// async/await, anything could happen between these 2 lines !!!!
		// equiv to return promise
		this._is_loaded = true

		return this
	}
}

export { Sounds };