'use strict';

const Keyboard = {

	_changed: false,
	_state: { _changed: false },
	_proxy: null,

	get_state: function() {
		this._state._changed = this._changed;
		this._changed = false;
		return this._proxy;
	},

	create: function() {
		const obj = Object.create(this);
		obj._proxy = new Proxy(this._state, Keyboard_State_Handler);
		return obj;
	},

	setup: function() {
		window.addEventListener("keydown", this._on_key.bind(this));
		window.addEventListener("keyup", this._on_key.bind(this));
	},

	_on_key: function(evt) {
		this._state[evt.code] = ( evt.type === "keydown" ? 1 : 0 );
		this._changed = true;
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