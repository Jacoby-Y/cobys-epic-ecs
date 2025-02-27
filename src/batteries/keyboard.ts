import signal from "cobys-epic-engine/signal";

export const Keyboard: Record<string, boolean> = {}

export function initKeyboard() {
    window.addEventListener("keydown", (e)=>{
        const { key } = e;
    
        Keyboard[key] = true;
    
        signal.emit("KeyDown", e);
        signal.emit("UpdateKeyboard", {
            down: true,
            e,
        });
    });
    
    window.addEventListener("keyup", (e)=>{
        const { key } = e;

        Keyboard[key] = false;
    
        signal.emit("KeyUp", e);
        signal.emit("UpdateKeyboard", {
            down: false,
            e,
        });
    });
}