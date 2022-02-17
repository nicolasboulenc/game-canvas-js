'use strict';

const Mouse_State = {

	create: function() {

		const obj = Object.create(this);

		obj.changed = false;
		obj.direction = 0;
		obj.x = 0;
		obj.y = 0;
		obj.LB = 0;
		obj.RB = 0;
		obj.WB = 0;
		obj.BB = 0;
		obj.FB = 0;

		return obj;
	},
};


const Mouse = {

	_changed: false,
	_state: null,
	_deadzone: 10,

	init: function(container) {

		this._prev_state = Mouse_State.create();
		this._state = Mouse_State.create();

		container.style.cursor = "none";
		container.addEventListener("mousemove", this._on_move.bind(this));
		container.addEventListener("mousedown", this._on_button.bind(this));
		container.addEventListener("mouseup", this._on_button.bind(this));
		container.addEventListener("contextmenu", this._on_context.bind(this));
		return this;
	},

	get_state: function() {

		// todo: should calculate direction here
		this._state.changed = this._changed;
		this._changed = false;
		return this._state;
	},

	_on_move: function(evt) {

		this._state._prev_x = this._state.x;
		this._state._prev_y = this._state.y;
		this._state.x = evt.clientX;
		this._state.y = evt.clientY;
	},

	_on_button: function(evt) {

		// In chrome, prevents browser backward / forward
		evt.preventDefault();

		const LB = ( (evt.buttons & 1)  === 1 ? 1 : 0 );
		const RB = ( (evt.buttons & 2)  === 2 ? 1 : 0 );
		const WB = ( (evt.buttons & 4)  === 4 ? 1 : 0 );
		const BB = ( (evt.buttons & 8)  === 8 ? 1 : 0 );
		const FB = ( (evt.buttons & 16)  === 16 ? 1 : 0 );

		this._changed = !(
			this._state.LB === LB &&
			this._state.RB === RB &&
			this._state.WB === WB &&
			this._state.BB === BB &&
			this._state.FB === FB
		);

		this._state.LB = LB;
		this._state.RB = RB;
		this._state.WB = WB;
		this._state.BB = BB;
		this._state.FB = FB;
	},

	_on_context: function(evt) {
		evt.preventDefault();
	}
}

export { Mouse };