import { initController } from "./controller.js";
import { initKeyboard } from "./keyboard.js";
import { initSystems } from "./systems.js";

export * from "./camera.js";
export * from "./controller.js";
export * from "./keyboard.js";
export * from "./pixi.js";
export * from "./systems.js";


export function initAll() {
    initSystems();
    initKeyboard();
    initController();
}
