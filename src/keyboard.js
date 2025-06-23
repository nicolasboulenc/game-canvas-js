'use strict';

const Keyboard = {

	_changed: false,
	_state: { _changed: false },
	_proxy: null,

	init: function() {
		this._proxy = new Proxy(this._state, Keyboard_State_Handler);
		window.addEventListener("keydown", this._on_key.bind(this));
		window.addEventListener("keyup", this._on_key.bind(this));
		return this;
	},

	get_state: function() {
		this._state._changed = this._changed;
		this._changed = false;
		return this._proxy;
	},

	_on_key: function(evt) {

		const state = ( evt.type === "keydown" ? 1 : 0 );
		if( typeof this._state[evt.code] === "undefined" || 
			( typeof this._state[evt.code] !== "undefined" && this._state[evt.code] !== state ) ) {

			this._state[evt.code] = state;
			this._changed = true;
		}
	}
}


const Keyboard_State_Handler = {
	get: function(target, prop, receiver) {
		if(typeof target[prop] !== "undefined") {
			return target[prop];
		}
		else {
			return 0;
		}
	}
}

export { Keyboard };