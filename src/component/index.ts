import { deleteEntity } from "../entity";

export default class Component {
    constructor(
        public _id: number = -1
    ) { }

    $onDestroy() {}
    $reconstruct(...args: any[]): Component | void {}
}


export class Position extends Component {
    constructor(
        public x: number = 0,
        public y: number = 0,
    ) {
        super();
    }

    $reconstruct(x: number, y: number) {
        this.x = x;
        this.y = y;

        return this;
    }
}

export class RigidBody extends Component {
    constructor(
        public vx = 0,
        public vy = 0,
        public gravity = 0,
        public drag_x = 1,
        public drag_y = 1,
    ) {
        super();
    }

    addGravity() {
        this.vy += this.gravity;
    }

    movePosition(pos: Position, mult = 1) {
        pos.x += this.vx * mult;
        pos.y += this.vy * mult;

        this.vx *= this.drag_x;
        this.vy *= this.drag_y;
    }

    addForce(angle: number, force: number) {
        this.vx += Math.cos(angle) * force;
        this.vy += Math.sin(angle) * force;
    }
}

export class Velocity extends Component {
    constructor(
        public x = 0,
        public y = 0,
        public drag = 1,
    ) {
        super();
    }

    movePosition(pos: Position) {
        pos.x += this.x;
        pos.y += this.y;
        this.x *= this.drag;
        this.y *= this.drag;

        return this;
    }

    addForce(dir: number, vel: number) {
        this.x = Math.cos(dir) * vel;
        this.y = Math.sin(dir) * vel;

        return this;
    }
}

export class Box extends Component {
    off_x: number = 0;
    off_y: number = 0;

    constructor(
        public width: number,
        public height: number,
        public color: string | null = null,
        public enabled = true
    ) {
        super();
    }

    setOffset(x: number, y: number) {
        this.off_x = x;
        this.off_y = y;
        
        return this;
    }

    $reconstruct(
        width: number,
        height: number,
        color: string | null = null,
        enabled = true
    ) {
        this.width = width;
        this.height = height;
        this.color = color;
        this.enabled = enabled;

        this.off_x = 0;
        this.off_y = 0;

        return this;
    }
}

export class Controlled extends Component {
    move_x = 0;
    move_y = 0;

    constructor(
        public speed: number,
        public update?: Function,
    ) {
        super();
    }

    moving() {
        return this.move_x || this.move_y;
    }
}

/** Requires: Position and Box */
export class StaticCollider extends Component {

}

/** Requires: Position and Box */
export class BodyCollider extends Component {

    /** Takes in the positions and boxes of, and collides, a BodyCollider and StaticCollider entities */
    static checkCollision(body: [Position, Box], collider: [Position, Box]) {
        const [_pos1, box1] = body;
        const [_pos2, box2] = collider;

        const pos1 = { 
            x: _pos1.x + box1.off_x,
            y: _pos1.y + box1.off_y,
        }

        const pos2 = { 
            x: _pos2.x + box2.off_x,
            y: _pos2.y + box2.off_y,
        }

        

        const left1 = pos1.x;
        const right1 = pos1.x + box1.width;
        const top1 = pos1.y;
        const bottom1 = pos1.y + box1.height;
    
        const left2 = pos2.x;
        const right2 = pos2.x + box2.width;
        const top2 = pos2.y;
        const bottom2 = pos2.y + box2.height;
    
        // Check for collision
        if (
            left1 < right2 &&
            right1 > left2 &&
            top1 < bottom2 &&
            bottom1 > top2
        ) {
            // Collision occurred
            return true;
        }
    
        // No collision
        return false;
    }

    /** Checks collision of BodyCollider with StaticCollider and moves appropriately */
    static collideBody(body: [Position, Box], collider: [Position, Box]) {
        if (!BodyCollider.checkCollision(body, collider)) return;

        const [_pos1, box1] = body;
        const [_pos2, box2] = collider;

        const pos1 = { 
            x: _pos1.x + box1.off_x,
            y: _pos1.y + box1.off_y,
        }

        const pos2 = { 
            x: _pos2.x + box2.off_x,
            y: _pos2.y + box2.off_y,
        }

        const right = Math.abs((pos2.x) - (pos1.x + box1.width));
        const left = Math.abs((pos2.x + box2.width) - (pos1.x));
        const top = Math.abs((pos1.y + box1.height) - pos2.y);
        const bottom = Math.abs((pos2.y + box2.height) - pos1.y);

        // Side in which the entity (with BodyCollider) is of the StaticCollider
        const closest = Math.min(left, right, top, bottom);

        if (closest == top) {
            _pos1.y = pos2.y - box1.height - box1.off_y - 0.02;
        }
        else if (closest == bottom) {
            _pos1.y = pos2.y + box2.height - box1.off_y + 0.02;
        }
        else if (closest == left) {
            _pos1.x = pos2.x + box2.width - box1.off_x + 0.02;
        }
        else if (closest == right) {
            _pos1.x = pos2.x - box1.width - box1.off_x - 0.02;
        }
        // else return;
        // console.log("Moved " + box1.color + " color box");
    }
}

/** Creates a value that moves between 0 and 1, then back to 0, in the time given (in milliseconds) */
export class Animation extends Component {
    constructor(
        public max_time: number,
        public time = 0,
        private increasing = true,
    ) {
        super();
    }

    addTime(delta_time: number) {
        if (this.increasing) {
            this.time += delta_time;

            if (this.time >= this.max_time) {
                this.time = this.max_time;
                this.increasing = false;
            }
        } else {
            this.time -= delta_time;

            if (this.time <= 0) {
                this.time = 0;
                this.increasing = true;
            }
        }
    }

    /** Gets the percentage of the time moving back and forth from 0 and max_time */
    get fullPercentage() {
        return this.time / this.max_time;
    }

    /** Gets percentage of time only moving forward */
    get halfPercentage() {
        if (this.increasing) {
            return this.fullPercentage;
        }
        return 1 - this.fullPercentage;
    }
}

export class Timer extends Component {
    max_time: number;
    enabled = true;

    constructor(
        public time: number,
        public onDone: Function = null,
    ) {
        super();
        
        this.max_time = time;
    }

    tickTime(ms: number) {
        if (!this.enabled) return;

        this.time -= ms;

        if (this.time <= 0) {
            const res = this.onDone?.();
            
            if (res === false) {
                this.enabled = false;
            } else if (typeof res == "number") {
                this.time = res;
            } else {
                this.time = this.max_time;
            }
        }
    }

    /** <onDone> preset function choices */
    static on_done = {
        delete(this: Timer) {
            deleteEntity(this._id);
        }
    }
}
