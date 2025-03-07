import { Box, Position } from "../component";
import { addEntity } from "../entity";
import PIXI, { Draw, app } from "./pixi";

const devart_text = { 
    text: "", color: 0xFFFFFF, size: 16, rotate: 0,
    stroke: undefined as number, strokeThickness: undefined as number
}

export function newDevartRect(w = 0, h = 0, color = 0xFF00FF, text: Partial<typeof devart_text> = devart_text) {
    text = { ...devart_text, ...text } as typeof devart_text;
    const container = new PIXI.Container();

    const graphic = new PIXI.Graphics()
        .beginFill(color)
        .drawRect(0, 0, w, h)
        .endFill();
    container.addChild(new PIXI.Sprite(app.renderer.generateTexture(graphic)));

    if (text.text) {
        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: text.size,
            fill: text.color,
            align: 'center'
        });

        const textSprite = new PIXI.Text(text.text, textStyle);
        textSprite.anchor.set(0.5);
        textSprite.position.set(w / 2, h / 2);
        textSprite.rotation = text.rotate;

        container.addChild(textSprite);
    }

    return new PIXI.Sprite(app.renderer.generateTexture(container));
}

export function newDevartCircle(r = 0, color = 0xFF00FF, text: Partial<typeof devart_text> = devart_text) {
    text = { ...devart_text, ...text } as typeof devart_text;
    const container = new PIXI.Container();

    const graphic = new PIXI.Graphics()
        .beginFill(color)
        .drawCircle(0, 0, r)
        .endFill();
    container.addChild(new PIXI.Sprite(app.renderer.generateTexture(graphic)));

    if (text.text) {
        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: text.size,
            fill: text.color,
            align: 'center',

            stroke: text.stroke,
            strokeThickness: text.strokeThickness
        });

        const textSprite = new PIXI.Text(text.text, textStyle);
        textSprite.anchor.set(0.5);
        textSprite.position.set(r, r);
        textSprite.rotation = text.rotate;

        container.addChild(textSprite);
    }

    return new PIXI.Sprite(app.renderer.generateTexture(container));
}

export function addDevartBox(x = 0, y = 0, w = 0, h = 0, color = 0xFF00FF, alpha = 1.0) {
    const sprite = newDevartRect(w, h, color);

    sprite.x = x;
    sprite.y = y;

    // app.stage.addChild(sprite);

    return addEntity(
        new Position(x, y),
        new Box(w, h),
        new Draw(sprite).setAlpha(alpha),
    );
}

export function addDevartPath(points: { x: number, y: number }[], color = 0xFFFFFF, width = 2, offset_x = 0, offset_y = 0) {
    const graphic = new PIXI.Graphics()

    graphic.lineStyle(width, color);
    graphic.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        const { x, y } = points[i];
        graphic.lineTo(x, y);
    }

    return addEntity(
        new Position(0, 0),
        new Draw(new PIXI.Sprite(app.renderer.generateTexture(graphic))).setOffset(offset_x, offset_y),
    );
}
