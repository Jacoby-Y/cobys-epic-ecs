import Component from "../component";
import * as PIXI from "pixi.js";
import { Camera } from "./camera";


export default PIXI;

export let app: PIXI.Application;
export let camera = new Camera();
export let delta_time = 16;
export const updateDelta = ()=>{ delta_time = app.ticker.deltaMS }


export function createApp(width: number, height: number, background: PIXI.ColorSource, performance = true) {
    app = new PIXI.Application({
        width,
        height,
        background,
        ...(performance ? {
            antialias: false,
            autoDensity: false,
            preserveDrawingBuffer: false,
            resolution: 1,
            powerPreference: "low-power",
        } : {})
    });

    app.ticker.add(updateDelta);

    if (performance) PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;

    return app;
}


export class Draw extends Component {
    sprite: PIXI.Sprite
    offset = { x: 0, y: 0 }

    constructor(
        sprite: string | PIXI.Sprite | PIXI.RenderTexture,
        anchor_x: number = 0,
        anchor_y: number = 0,
    ) {
        super();
        if (sprite instanceof PIXI.Sprite == false) this.sprite = PIXI.Sprite.from(sprite);
        else this.sprite = sprite;

        this.sprite.anchor.set(anchor_x, anchor_y);

        app.stage.addChild(this.sprite);
    }

    zIndex(index: number) {
        this.sprite.zIndex = index;

        return this;
    } 

    setAnchor(x: number, y?: number) {
        if (y == undefined) y = x;
        
        this.sprite.anchor.set(x, y);
        return this;
    }

    setPosition(x = this.sprite.position.x, y = this.sprite.position.y) {
        this.sprite.position.set(
            x + this.offset.x,
            y + this.offset.y,
        );
        return this;
    }

    setScale(x: number, y?: number) {
        if (y == undefined) y = x;
        
        this.sprite.scale.set(x, y);
        // this.sprite.scale.set(x * (UI_SCALE/SCALE), y * (UI_SCALE/SCALE));
        return this;
    }

    setOffset(x: number, y?: number) {
        if (y == undefined) y = x;
        
        this.offset = { x, y };

        this.setPosition();
        
        return this;
    }

    setRotation(ang: number) {
        this.sprite.rotation = ang;

        return this;
    }

    setSize(w: number, h?: number) {
        if (h == undefined) h = w;
        
        this.sprite.width = w;
        this.sprite.height = h;
        // this.sprite.scale.set(x * (UI_SCALE/SCALE), y * (UI_SCALE/SCALE));
        return this;
    }

    setAlpha(a: number) {
        this.sprite.alpha = a;
        
        return this;
    }

    setVisible(vis: boolean = !this.sprite.visible) {
        this.sprite.visible = vis;
        return this;
    }

    $onDestroy() {
        app.stage.removeChild(this.sprite);
    }
}

export class DrawGroup extends Component {
    each_draws: [string, Draw][] = []

    constructor(
        public draws: Record<string, Draw>
    ) {
        super();
        this.each_draws = Object.entries(this.draws);
    }

    deleteDraw(id: string) {
        if (this.draws[id]) {
            this.draws[id].$onDestroy();
            delete this.draws[id];
        }

        this.setEachDraws();
    }

    setDraw(id: string, draw: Draw) {
        if (this.draws[id]) {
            this.draws[id].$onDestroy();
        }

        this.draws[id] = draw;

        this.setEachDraws();
    }

    private setEachDraws() {
        this.each_draws = Object.entries(this.draws);
    }

    eachDraw(fn: (draw: Draw)=> void) {
        for (let i = 0; i < this.each_draws.length; i++) fn(this.each_draws[i][1]);
    }

    $onDestroy(): void {
        this.eachDraw(d => d.$onDestroy());
    }
}

export function resetStage() {
    app.stage.children.forEach(child => {
        app.stage.removeChild(child);
    });
}

export function setResolution(res = 1) {
    app.renderer.resolution = res;
    app.renderer.view.style.width = `${1920}px`;
    app.renderer.view.style.height = `${1080}px`;
    app.renderer.resize(1920, 1080);
}