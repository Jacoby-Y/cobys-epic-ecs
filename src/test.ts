import { Box, Position } from "./component/index.js";
import { addEntity, deleteEntity, queryEntities, reassign } from "./entity/index.js";
import { addSystem, runAllSystems } from "./system/index.js";
// import { component_arrays } from "./entity/index.js";

addSystem([Position], (pos)=>{
    console.log(pos.x++, pos.y++);
});

addSystem([Position, Box], (pos, box)=>{
    box.width += pos.x;
    box.height += pos.y;
    console.log(box.width, box.height);
});

addEntity(
    new Position(1, 1),
    new Box(10, 10),
);

runAllSystems();
runAllSystems();

// Runs three times, because it automatically runs relevant systems when adding an entity

/*
// Add entity, with Position being pooled and reassigned if it's deleted
const { id } = addEntity(
    // new Position(1, 2),
    reassign(Position, 1, 2),
    // new Box(10, 20),
    reassign(Box, 10, 20)
);

// console.log(queryEntities(Position, Box));

console.log(component_arrays)
deleteEntity(id);
console.log(component_arrays)

// console.log(queryEntities(Position, Box));


addEntity(
    // new Position(1, 2),
    reassign(Position, 3, 4),
    // new Box(10, 20),
    reassign(Box, 30, 40)
);

console.log(component_arrays)
*/
