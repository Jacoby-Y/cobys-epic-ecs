import Component, { Position, RigidBody } from "../component/index.js";

console.clear();

type Components = Record<string, Component[]>;
type ComponentCache = Record<string, Record<string, Component[]>>;
type ClassInstance = new (...args: any[])=> any;


let entity_counter = 0;
const component_arrays: Components = {}
const component_cache: ComponentCache = {}


/** Create entity by giving component name and data one after another */
export function addEntity(...components: Component[]) {
    // if (component_parts.length % 2 != 0) throw "<addEntity()> Param amount must be odd";

    // for (let i = 0; i < component_parts.length; i += 2) {
    //     const [name, data] = [component_parts[i], component_parts[i + 1] as Component];
        
    //     if (typeof name != "string") throw "<addEntity()> Params must have a string (component name) in even indices";
    //     if (typeof data == "string") throw "<addEntity()> Params must have an object (component data) in odd indices";
    //     if (component_arrays[name] == undefined) component_arrays[name] = [];

    //     data._id = entity_counter;

    //     component_arrays[name].push(data);
    // }

    for (let i = 0; i < components.length; i++) {
        const comp = components[i];
        const name = Object.getPrototypeOf(comp).constructor.name;

        if (component_arrays[name] == undefined) component_arrays[name] = [];

        comp._id = entity_counter;

        component_arrays[name].push(comp);
    }

    return entity_counter++;
}

const blankComponentQuery = (names: string[])=> names.map(_ => []);
export function queryEntities(...instances: ClassInstance[] | string[]) {
    if (instances.length == 0) throw "<queryEntities()> Must give at least one param";

    const names = typeof instances[0] == "string" ? (instances as string[]) : instances.map(i => (i as ClassInstance).name);

    if (names.length == 1) return [component_arrays[names[0]] ?? []];

    const key = names.toSorted().join(":");

    if (component_cache[key] != undefined) {
        const cache = component_cache[key];
        return names.map(name => cache[name]);
    }

    const comps = names.map(name => component_arrays[name] ?? null);

    if (comps.includes(null)) return blankComponentQuery(names);

    lineupWithSmallest(comps);

    component_cache[key] = Object.fromEntries(
        names.map((name, i)=> [name, comps[i]])
    );

    return comps;
}

function lineupWithSmallest(comps: Component[][], second_pass = false) {
    const smallest = comps.reduce((p, c)=> c.length < p.length ? c : p);

    const ids = new Set(smallest.map(comp => comp._id));

    for (let i = 0; i < comps.length; i++) {
        if (comps[i] == smallest) continue;

        for (let j = 0; j < comps[i].length; j++) {
            const comp = comps[i][j];
            
            if (!ids.has(comp._id)) {
                comps[i].splice(j, 1);
                j--;
            }
        }
    }

    
    let same_lengths = true;
    let match_length = comps[0].length;
    for (let i = 0; i < comps.length; i++) {
        if (comps[i].length != match_length) {
            same_lengths = false;
            break;
        }
    }
    
    if (!same_lengths && !second_pass) {
        return lineupWithSmallest(comps, false);
    }
}


export function deleteEntity(id: number) {
    const all_components = Object.values(component_arrays);

    for (let i = 0; i < all_components.length; i++) {
        const components = all_components[i];
        
        const idx = components.findIndex(({ _id })=> id == _id);
        if (idx >= 0) components.splice(idx, 1);
    }
}

function addToCache(names: string[]) {

}

function removeFromCache(names: string[]) {

}
