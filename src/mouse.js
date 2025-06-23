'use strict';

class Mouse_State {

	constructor() {

		this.changed = false;
		this.direction = 0;
		this.prev_x = 0;
		this.prev_y = 0;
		this.x = 0;
		this.y = 0;
		this.LB = 0;
		this.RB = 0;
		this.WB = 0;
		this.BB = 0;
		this.FB = 0;
	}
};


class Mouse {

	static #changed = false
	static #curr_state = new Mouse_State()
	// static #prev_state = new Mouse_State()
	static #evt_target = null

	static init(evt_target) {

		this.#evt_target = evt_target
		this.#evt_target.style.cursor = "none"
		this.#evt_target.addEventListener("mousemove", this.#on_move.bind(this))
		this.#evt_target.addEventListener("mousedown", this.#on_button.bind(this))
		this.#evt_target.addEventListener("mouseup", this.#on_button.bind(this))
		this.#evt_target.addEventListener("contextmenu", this.#on_context.bind(this))
	}

	static deinit() {

		this.#evt_target = evt_target
		this.#evt_target.style.cursor = "default"
		this.#evt_target.removeEventListener("mousemove", this.#on_move.bind(this))
		this.#evt_target.removeEventListener("mousedown", this.#on_button.bind(this))
		this.#evt_target.removeEventListener("mouseup", this.#on_button.bind(this))
		this.#evt_target.removeEventListener("contextmenu", this.#on_context.bind(this))
	}

	static get_state() {

		// todo: should calculate direction here
		this.#curr_state.changed = this.#changed;
		this.#curr_state.direction = Math.atan2(this.#curr_state.x - this.#curr_state.prev_x, -(this.#curr_state.y - this.#curr_state.prev_y)) * 180 / Math.PI;
		this.#changed = false;
		return this.#curr_state;
	}

	static #on_move(evt) {

		this.#curr_state.prev_x = this.#curr_state.x;
		this.#curr_state.prev_y = this.#curr_state.y;
		this.#curr_state.x = evt.clientX;
		this.#curr_state.y = evt.clientY;
	}

	static #on_button(evt) {

		// In chrome, prevents browser backward / forward
		evt.preventDefault();

		const LB = ( (evt.buttons & 1)  === 1 ? 1 : 0 );
		const RB = ( (evt.buttons & 2)  === 2 ? 1 : 0 );
		const WB = ( (evt.buttons & 4)  === 4 ? 1 : 0 );
		const BB = ( (evt.buttons & 8)  === 8 ? 1 : 0 );
		const FB = ( (evt.buttons & 16)  === 16 ? 1 : 0 );

		this.#changed = !(
			this.#curr_state.LB === LB &&
			this.#curr_state.RB === RB &&
			this.#curr_state.WB === WB &&
			this.#curr_state.BB === BB &&
			this.#curr_state.FB === FB
		);

		this.#curr_state.LB = LB;
		this.#curr_state.RB = RB;
		this.#curr_state.WB = WB;
		this.#curr_state.BB = BB;
		this.#curr_state.FB = FB;
	}

	static #on_context(evt) {
		evt.preventDefault();
	}
}

export { Mouse };