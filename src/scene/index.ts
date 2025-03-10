import { deleteAllEntities } from "../entity";
import { deleteResources } from "../resource";

/** Functions by scene ID that run to load that scene */
const scenes: Record<string, Function[]> = {}
/** All onPreload functions that run before loading a scene */
const on_preload: Function[] = [];
/** All onLoad functions that run after loading a scene */
const on_load: Function[] = [];
/** onPreload functions that run before loading a specific scene */
const on_preload_scene: Record<string, Function[]> = {}
/** onLoad functions that run after loading a specific scene */
const on_load_scene: Record<string, Function[]> = {}

let cleanup_functions: Function[] = [];

/** Scene currently initializing */
let initializing_scene: string = null;
let scene_updaters: [string, Function][] = []


export function addSceneLoader(id: string, func: Function, args?: any[]) {
    if (scenes[id] == undefined) scenes[id] = [];

    scenes[id].push(()=> func(...(args ?? [])));
}

/** Deletes entities be default */
export function loadScene(id: string, delete_entities = true) {
    if (scenes[id] == undefined) throw `Scene with id "${id}" doesn't exist`;

    if (delete_entities) {
        deleteAllEntities();
        deleteResources();
        scene_updaters = [];
    }

    runPreloads(id);

    let cleanups: Function[] = [];
    initializing_scene = id;
    for (let i = 0; i < scenes[id].length; i++) {
        const res = scenes[id][i]();
        if (typeof res == "function") cleanups.push(res);
    }
    initializing_scene = null;

    if (delete_entities) {
        for (let i = 0; i < cleanup_functions.length; i++) {
            cleanup_functions[i]();
        }

        cleanup_functions = cleanups;
    } else {
        cleanup_functions.push(...cleanups);
    }

    runLoads(id);
}

export function onScenePreload(id: string | null, func: Function) {
    if (id == null) on_preload.push(func);
    else {
        if (on_preload_scene[id] == undefined) on_preload_scene[id] = [];
        on_preload_scene[id].push(func);
    }
}

export function onSceneLoad(id: string | null, func: Function) {
    if (id == null) on_load.push(func);
    else {
        if (on_load_scene[id] == undefined) on_load_scene[id] = [];
        on_load_scene[id].push(func);
    }
}

export function addSceneUpdater(func: Function) {
    if (!initializing_scene) throw "Invalid or non-present scene currently initializing";

    scene_updaters.push([initializing_scene, func]);
}

export function runSceneUpdaters() {
    for (let i = 0; i < scene_updaters.length; i++) {
        scene_updaters[i][1]();
    }
}


function runPreloads(id: string) {
    const preloads = on_preload.concat(on_preload_scene[id] || []);

    for (let i = 0; i < preloads.length; i++) preloads[i]();
}

function runLoads(id: string) {
    const loads = on_load.concat(on_load_scene[id] || []);

    for (let i = 0; i < loads.length; i++) loads[i]();
}
