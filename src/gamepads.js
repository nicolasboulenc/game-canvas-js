'use strict';

class Gamepad_State {

	changed = false
	A = 0
	B = 0
	X = 0
	Y = 0
	LB = 0
	RB = 0
	LT = 0
	RT = 0
	BACK = 0
	START = 0
	LSB = 0
	RSB = 0
	DPAD_UP = 0
	DPAD_DOWN = 0
	DPAD_LEFT = 0
	DPAD_RIGHT = 0
	LSH = 0
	LSV = 0
	RSH = 0
	RSV = 0
	LS = { direction: 0, magnitude: 0 }   // direction in degres between -180 and 180, magnitude between 0 and 1
	RS = { direction: 0, magnitude: 0 }   // direction in degres between -180 and 180, magnitude between 0 and 1
}


class Gamepads {

	gamepads
	states
	deadzone
	on_change

	get count() { return this.gamepads.length }

	constructor() {
		this.init()
	}

	init() {
		this.gamepads = [];
		this.states = [];
		this.deadzone = 0.17;
		window.addEventListener("gamepadconnected", this.on_connected.bind(this), false);
		window.addEventListener("gamepaddisconnected", this.on_disconnected.bind(this), false);
		return this;
	}

	deinit() {
		window.addEventListener("gamepadconnected", this.on_connected.bind(this), false);
		window.addEventListener("gamepaddisconnected", this.on_disconnected.bind(this), false);
		return this;
	}

	poll() {
		// according to chrome need to poll this every frame, not necessary on firefox
		this.gamepads = [];
		const gamepads = navigator.getGamepads();
		for(const gamepad of gamepads) {
			this.gamepads.push(gamepad);
		}
		return this
	}

	on_connected(evt) {
		let gamepad = evt.gamepad;
		this.gamepads[gamepad.index] = gamepad;
		this.states[gamepad.index] = new Gamepad_State()
	}

	on_disconnected(evt) {
		let gamepad = evt.gamepad;
		delete this.gamepads[gamepad.index];
		delete this.states[gamepad.index];
	}

	_detect() {
		this.gamepads.forEach(g => {
			g.buttons.forEach( (b, i) => {
				if(b.value !== 0) console.log("Button " + i, b);
			});
			g.axes.forEach( (a, i) => {
				if(a < -this.deadzone || a > this.deadzone) console.log("Axis " + i, a);
			});
		});
	}

	get_state(gamepad_index) {

		if(typeof this.states[gamepad_index] !== "undefined") {

			let gamepad = this.gamepads[gamepad_index];
			const state = this.states[gamepad_index];

			// update values
			state._changed = !(state.A === gamepad.buttons[0].value &&
				state.B === gamepad.buttons[1].value &&
				state.X === gamepad.buttons[2].value &&
				state.Y === gamepad.buttons[3].value &&
				state.LB === gamepad.buttons[4].value &&
				state.RB === gamepad.buttons[5].value &&
				state.BACK === gamepad.buttons[8].value &&
				state.START === gamepad.buttons[9].value &&
				state.LSB === gamepad.buttons[10].value &&
				state.RSB === gamepad.buttons[11].value &&
				state.DPAD_UP === gamepad.buttons[12].value &&
				state.DPAD_DOWN === gamepad.buttons[13].value &&
				state.DPAD_LEFT === gamepad.buttons[14].value &&
				state.DPAD_RIGHT === gamepad.buttons[15].value);

			state.A = gamepad.buttons[0].value;
			state.B = gamepad.buttons[1].value;
			state.X = gamepad.buttons[2].value;
			state.Y = gamepad.buttons[3].value;
			state.LB = gamepad.buttons[4].value;
			state.RB = gamepad.buttons[5].value;
			state.LT = gamepad.buttons[6].value;
			state.RT = gamepad.buttons[7].value;
			state.BACK = gamepad.buttons[8].value;
			state.START = gamepad.buttons[9].value;
			state.LSB = gamepad.buttons[10].value;
			state.RSB = gamepad.buttons[11].value;
			state.DPAD_UP = gamepad.buttons[12].value;
			state.DPAD_DOWN = gamepad.buttons[13].value;
			state.DPAD_LEFT = gamepad.buttons[14].value;
			state.DPAD_RIGHT = gamepad.buttons[15].value;
			state.LSH = gamepad.axes[0];
			state.LSV = gamepad.axes[1];
			state.RSH = gamepad.axes[2];
			state.RSV = gamepad.axes[3];

			// calculate values
			if(state.LSH < -this.deadzone || state.LSH > this.deadzone || state.LSV < -this.deadzone || state.LSV > this.deadzone) {
				state.LS.direction = Math.atan2(state.LSH, -state.LSV) * 180 / Math.PI;
				state.LS.magnitude = Math.min(Math.sqrt(state.LSH * state.LSH + state.LSV * state.LSV), 1.0);
			}
			else {
				state.LS.direction = 0;
				state.LS.magnitude = 0;
			}

			if(state.RSH < -this.deadzone || state.RSH > this.deadzone || state.RSV < -this.deadzone || state.RSV > this.deadzone) {
				state.RS.direction = Math.atan2(state.RSH, -state.RSV) * 180 / Math.PI;
				state.RS.magnitude = Math.min(Math.sqrt(state.RSH * state.RSH + state.RSV * state.RSV));
			}
			else {
				state.RS.direction = 0;
				state.RS.magnitude = 0;
			}

			// if(state._changed === true && this.on_change !== null) this.on_change(state);

			return state;
		}
		else {
			return null;
		}
	}
}

export { Gamepads };