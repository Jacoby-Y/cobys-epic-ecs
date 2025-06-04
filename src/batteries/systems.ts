import { BodyCollider, Box, Controlled, Position, StaticCollider, Velocity, Animation, Timer } from "../component";
import { queryEntities } from "../entity";
import { addSystem } from "../system";
import { Draw, DrawGroup, camera, delta_time } from "./pixi";


export function initSystems() {
    addSystem([Position, Velocity], (pos: Position, vel: Velocity)=>{
        vel.movePosition(pos);
    });
    
    addSystem([Position, Draw], (pos: Position, draw: Draw)=>{
        const [x, y] = camera.getOffset(pos);
        // console.log(pos.x, pos.y, x, y)
        draw.setPosition(x, y);
    });

    addSystem([Position, DrawGroup], (pos: Position, group: DrawGroup)=>{
        group.eachDraw((draw)=>{
            const [x, y] = camera.getOffset(pos);
            draw.setPosition(x, y);
        });
    });
    
    addSystem([Position, Controlled], (pos: Position, con: Controlled)=>{
        pos.x += con.move_x * con.speed * delta_time;
        pos.y += con.move_y * con.speed * delta_time;
    });
    
    addSystem([Controlled], (con: Controlled)=>{
        con.update?.();
    });
    
    addSystem([Position, Box, StaticCollider], (pos: Position, box: Box, _sc)=>{
        const body_colliders = queryEntities(Position, Box, BodyCollider);
        
        for (let i = 0; i < body_colliders[0].length; i++) {
            const body_pos = body_colliders[0][i];
            const body_box = body_colliders[1][i];
    
            BodyCollider.collideBody(
                [body_pos, body_box],
                [pos, box]
            );
        }
    });
    
    addSystem([Animation], (animation: Animation)=>{
        animation.addTime(delta_time);
    });

    addSystem([Draw, Controlled], (draw: Draw, con: Controlled)=>{
        if (con.move_x < 0) {
            draw.sprite.scale.x = -1;
        }
        if (con.move_x > 0) {
            draw.sprite.scale.x = 1;
        }
    });
    
    addSystem([Timer], (timer: Timer)=>{
        timer.tickTime(delta_time);
    });
    
}
