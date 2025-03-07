import { app } from "./pixi";

interface Position {
    x: number,
    y: number
}

export class Camera {
    target = { x: 0, y: 0 }
    offset = { x: 0, y: 0 }
    position: { readonly x: number; readonly y: number; };

    constructor() {
        const self = this;

        this.position = {
            get x() { return self.target.x + self.offset.x },
            get y() { return self.target.y + self.offset.y },
        }
    }

    centerPosition() {
        this.target.x = app.view.width / 2;
        this.target.y = app.view.height / 2;
    }

    setTarget(target: Position) {
        this.target = target;
    }

    setOffset(offset: Position) {
        this.offset = offset;
    }

    getOffset(pos: Position): [number, number] {
        // Must divide by 32 (aka: # / 16 / 2) because scale is 16 and we also need the center point

        const offx = app.view.width + (pos.x - this.target.x) - this.offset.x;
        const offy = app.view.height + (pos.y - this.target.y) - this.offset.y;

        return [offx, offy];
    }

    reset() {
        this.target.x = app.view.width / 2;
        this.target.y = app.view.height / 2;
        this.offset = { x: 0, y: 0 };
    }
}
