import signal from "cobys-epic-engine/signal";
import { Keyboard } from "./keyboard";
import type { Controlled } from "../component";

export const Controller = {
    horz: 0,
    vert: 0,
    get moving() { return this.horz || this.vert }
}

export function initController() {
    signal.listen("UpdateKeyboard", ()=>{
        let horz = 0;
        let vert = 0;
    
        const left = isPressed("a", "A", "ArrowLeft");
        const up = isPressed("w", "W", "ArrowUp");
        const right = isPressed("d", "D", "ArrowRight");
        const down = isPressed("s", "S", "ArrowDown");
    
        if (left && !right) horz--;
        if (right && !left) horz++;
        if (up && !down) vert--;
        if (down && !up) vert++;
    
        Controller.horz = horz;
        Controller.vert = vert;
    
        normalize();
    });
}


export function isPressed(...args: string[]) {
    return args.reduce((p, c)=> p || !!Keyboard[c], false);
}

function normalize() {
    const { horz, vert } = Controller;

    if (horz && vert) {
        Controller.horz *= 0.707;
        Controller.vert *= 0.707;
    }
}


export const controllers = {
    player(this: Controlled) {
        this.move_x = Controller.horz;
        this.move_y = Controller.vert;
    },
}
