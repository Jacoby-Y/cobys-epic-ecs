//> Taken out of import paths because it SUCKS
// "./batteries-pixi": {
//     "types": "./batteries/pixi.d.ts",
//     "default": "./batteries/pixi.js"
// },


import Component from "../component";
import * as PIXI from "pixi.js";
import { Camera } from "./camera";


export default PIXI;

export let delta_time = 16;

let delta_updater: PIXI.Ticker;


export class PixiCtx {
    app: PIXI.Application;

    constructor(
        public camera: Camera,
        element: HTMLElement | HTMLCanvasElement,
        bg_color = 0x212121,
        public scale = 1,
    ) {
        const given_canvas = element.tagName == "CANVAS"

        this.app = new PIXI.Application({
            background: bg_color,
            antialias: false,
            view: given_canvas ? element as HTMLCanvasElement : null,
        });

        if (!given_canvas) element.appendChild(this.app.view as unknown as Node);

        this.app.stage.scale.set(scale, scale);
        // PIXI.TextureStyle.defaultOptions.scaleMode = "nearest";
        PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;

        if (!delta_updater) {
            delta_updater = this.app.ticker.add(()=>{
                delta_time = this.app.ticker.deltaMS;
            });
        }

        if (!camera.ctx) camera.ctx = this;
    }

    resetStage() {
        this.app.stage.removeChild();
    }
}

export class Draw extends Component {
    sprite: PIXI.Sprite

    constructor(
        public ctx: PixiCtx,
        sprite: string | PIXI.Sprite,
        anchor_x: number = 0,
        anchor_y: number = 0,
    ) {
        super();
        if (typeof sprite == "string") this.sprite = PIXI.Sprite.from(sprite);
        else this.sprite = sprite;

        this.sprite.anchor.set(anchor_x, anchor_y);

        ctx.app.stage.addChild(this.sprite);
    }

    zIndex(index: number) {
        this.sprite.zIndex = index;

        return this;
    } 

    setAnchor(x: number, y: number) {
        this.sprite.anchor.set(x, y);
        return this;
    }

    setPosition(x: number, y: number) {
        this.sprite.position.set(x, y);
        return this;
    }

    setScale(x: number, y: number) {
        this.sprite.scale.set(x, y);
        return this;
    }

    $onDestroy() {
        this.ctx.app.stage.removeChild(this.sprite);
    }
}
