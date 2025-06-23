
window.addEventListener("keydown", window_on_keydown)
window.addEventListener("keyup", window_on_keyup)

let kb_left = false
let kb_right = false
let kb_up = false
let kb_down = false
let kb_jump = false

const canvas = document.getElementById("display")
const ctx = canvas.getContext("2d")

const floor = 300
const jump_duration = 600
const jump_height = 140

const animation_idle_dtime = 350
const animation_move_dtime = 70

const STATE_NONE	= 0
const STATE_IDLE	= 1
const STATE_MOVE	= 2
const STATE_KICK	= 4
const STATE_HURT	= 8
const STATE_CROUCH	= 16
const STATE_SNEAK	= 32
const STATE_JUMP	= 64

const dino_sprites = document.createElement("img")
dino_sprites.src = "DinoSprites - doux x4.png"
let dino_x = 220
let dino_y = floor
let dino_state = STATE_IDLE
let dino_special = ""

let animation_start_time = Date.now()

window.requestAnimationFrame(draw)


function draw(timestamp) {

    // process input
    if((kb_up || kb_jump) && !(dino_state & STATE_JUMP)) {
        dino_state = dino_state | STATE_JUMP
        animation_start_time = Date.now()
    }
    if(kb_right) {
        
    }


    let new_state = STATE_NONE
    if(evt.key === " " || evt.key === "w") {
        new_state = STATE_JUMP
    }
    else if(evt.key === "a") {
        new_state = STATE_MOVE
        dino_special = "reversed"
    }
    else if(evt.key === "d") {
        new_state = STATE_MOVE
        dino_special = ""
    }
    else if(evt.key === "s") {
    }

    if(new_state !== STATE_NONE && !(new_state & dino_state)) {
        if(new_state & STATE_MOVE) {
            dino_state = dino_state ^ STATE_IDLE
        }
        dino_state = dino_state | new_state
        animation_start_time = Date.now()
    }

    state_debug(dino_state)

    // update stuff
    if(dino_state & STATE_JUMP) {
        const y = jump(animation_start_time, jump_height, jump_duration)
        dino_y = floor - y

        if (dino_y > floor) {
            dino_y = floor;
            dino_state = dino_state ^ STATE_JUMP;
        }
    }

    // figure out which frame to draw
    let frames = dino_animations["idle"]
    let frame = frames[0]
    let frame_index = 0
    
    if(dino_state & STATE_JUMP) {
        frames = dino_animations["jump"]
        const actual_duration = Math.min(Date.now() - animation_start_time, jump_duration - 1)
        frame_index = Math.floor(actual_duration / jump_duration * frames.length)
        frame = frames[frame_index]
    }
    else if(dino_state & STATE_IDLE) {
        frames = dino_animations["idle"]
        frame_index = Math.floor((Date.now() - animation_start_time) / animation_idle_dtime) % frames.length
        frame = frames[frame_index]
    }
    else if(dino_state & STATE_MOVE) {
        frames = dino_animations["move"]
        frame_index = Math.floor((Date.now() - animation_start_time) / animation_move_dtime) % frames.length
        frame = frames[frame_index]
    }

    // draw stuff
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.translate(dino_x, dino_y);
    if(dino_special === "reversed") {
        ctx.translate(frame.w, 0);
        ctx.scale(-1,1);
        ctx.drawImage(dino_sprites, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h)
    }
    else {
        ctx.drawImage(dino_sprites, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h)
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    window.requestAnimationFrame(draw)
}


function window_on_keydown(evt) {

    if(evt.key === "w") {
        kb_up = true
    }
    else if(evt.key === "a") {
        kb_left = true
    }
    else if(evt.key === "d") {
        kb_right = true
    }
    else if(evt.key === "s") {
        kb_down = true
    }
    else if(evt.key === " ") {
        kb_jump = true
    }
}


function window_on_keyup(evt) {

    if(evt.key === "w") {
        kb_up = false
    }
    else if(evt.key === "a") {
        kb_left = false
    }
    else if(evt.key === "d") {
        kb_right = false
    }
    else if(evt.key === "s") {
        kb_down = false
    }
    else if(evt.key === " ") {
        kb_jump = false
    }


    if(evt.key === "a" ||  evt.key === "d") {
        dino_state = dino_state ^ STATE_MOVE;
        dino_state = dino_state | STATE_IDLE;
        // do not reset time if in jump
        if(dino_state ===  STATE_IDLE) {
            animation_start_time = Date.now()
        }
    }

    // if(new_state !== "" && new_state !== dino_state) {
    // 	dino_state = new_state
    // 	animation_start_time = Date.now()
    // }

    state_debug(dino_state)
}


function jump(stime, height, duration) {

    const const_x = Math.sqrt(height);

    let t = Date.now() - stime
    t = t - duration / 2
    t = t * const_x / (duration / 2);

    return height - t * t
}


function state_debug(state) {

    const states = []
    if(state & STATE_IDLE) {
        states.push("idle")
    }
    if(state & STATE_MOVE) {
        states.push("move")
    }
    if(state & STATE_KICK) {
        states.push("kick")
    }
    if(state & STATE_HURT) {
        states.push("hurt")
    }
    if(state & STATE_CROUCH) {
        states.push("crouch")
    }
    if(state & STATE_SNEAK) {
        states.push("sneak")
    }
    if(state & STATE_JUMP) {
        states.push("jump")
    }

    console.log(states.join(" | "))
}
