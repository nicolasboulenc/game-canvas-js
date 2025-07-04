"use strict";

class Keyboard {

	static #changed = false
	static #state = { changed: false }
	static #target = null

	static init(target=window) {

		this.#target = target
		this.#target.addEventListener("keydown", this.#on_key.bind(this))
		this.#target.addEventListener("keyup", this.#on_key.bind(this))
		return this
	}

	static deinit() {

		this.#target.removeEventListener("keydown", this.#on_key.bind(this))
		this.#target.removeEventListener("keyup", this.#on_key.bind(this))
		return this
	}

	static get_state() {

		this.#state.changed = this.#changed
		this.#changed = false
		return this.#state
	}

	static #on_key(evt) {

		const state = ( evt.type === "keydown" ? 1 : 0 );
		if( typeof this.#state[evt.code] === "undefined" || 
			( typeof this.#state[evt.code] !== "undefined" && this.#state[evt.code] !== state ) ) {

			this.#state[evt.code] = state;
			this.#changed = true;
		}
	}
}

export { Keyboard };