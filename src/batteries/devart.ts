// import * as PIXI from "pixi.js";
// import { app } from "../../index.js";
// import { addEntity } from "./entity.js";
// import { Box, Draw, Position } from "./component.js";


// const debug_text = { text: "", color: 0xFFFFFF, size: 16, rotate: 0 }

// export function newDebugSprite(w = 0, h = 0, color = 0xFF00FF, text: Partial<typeof debug_text> = debug_text) {
//     text = { ...debug_text, ...text } as typeof debug_text;
//     const container = new PIXI.Container();

//     const graphic = new PIXI.Graphics()
//         .beginFill(color)
//         .drawRect(0, 0, w, h)
//         .endFill();
//     container.addChild(new PIXI.Sprite(app.renderer.generateTexture(graphic)));

//     if (text.text) {
//         const textStyle = new PIXI.TextStyle({
//             fontFamily: 'Arial',
//             fontSize: text.size,
//             fill: text.color,
//             align: 'center'
//         });

//         const textSprite = new PIXI.Text(text.text, textStyle);
//         textSprite.anchor.set(0.5);
//         textSprite.position.set(w / 2, h / 2);
//         textSprite.rotation = text.rotate;

//         container.addChild(textSprite);
//     }

//     return new PIXI.Sprite(app.renderer.generateTexture(container));
// }

// export function addDebugBox(x = 0, y = 0, w = 0, h = 0, color = 0xFF00FF) {
//     const sprite = newDebugSprite(w, h, color);

//     sprite.x = x;
//     sprite.y = y;

//     // app.stage.addChild(sprite);

//     return addEntity<[Position, Box, Draw]>(
//         new Position(x, y),
//         new Box(w, h),
//         new Draw(sprite),
//     );
// }
