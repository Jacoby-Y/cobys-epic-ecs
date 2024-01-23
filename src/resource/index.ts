
type Textures = Record<string, HTMLImageElement>;

const textures: Textures = {

}


export function addTexture(id: string, src: string | HTMLImageElement): HTMLImageElement {
    if (typeof src == "string") {
        const img = new Image();
        img.src = src;
        textures[id] = img;

        img.onerror = ()=>{
            console.error("Can't load image. ID: \"" + id + '"');
        }
    } else {
        textures[id] = src;
    }

    return textures[id];
}

export function getTexture(id: string) {
    return textures[id];
}