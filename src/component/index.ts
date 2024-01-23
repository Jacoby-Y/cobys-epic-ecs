
export default class Component {
    constructor(
        public _id: number = -1
    ) { }
}


export class Position extends Component {
    constructor(
        public x: number = 0,
        public y: number = 0,
    ) {
        super();
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
        pos.x += this.vx * this.drag_x * mult;
        pos.y += this.vy * this.drag_y * mult;
    }

    addForce(angle: number, force: number) {
        this.vx += Math.cos(angle) * force;
        this.vy += Math.sin(angle) * force;
    }
}