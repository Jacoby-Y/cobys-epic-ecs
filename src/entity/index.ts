import Component from "../component/index.js";
import { prerunEntitySystems } from "../system/index.js";

type Components = Record<string, Component[]>;
type ComponentCache = Record<string, Record<string, Component[]>>;
type ClassType<T = any> = new (...args: any[]) => T;

let entity_counter = 0;
let component_arrays: Components = {}
let component_cache: ComponentCache = {}
let component_pools = new Set<string>();


export let entity_updates: [number, Function][] = []


type CompArgs<T extends Component> = ConstructorParameters<CompCon<T>>;
type Reassigner<T extends Component = Component> = [CompCon<T>, CompArgs<T>];
type CompCon<T extends Component = Component> = new (...args: any[]) => T;
export function reassign<T extends Component>(Class: CompCon<T>, ...args: CompArgs<T>): Reassigner<T> {
    component_pools.add(Class.name);
    return [Class, args];
}

/** Create entity by giving component name and data one after another */
export function addEntity<T extends (Component|Reassigner)[]>(...components: T) {
    let result_components: Component[] = [];

    for (let i = 0; i < components.length; i++) {
        const comp = components[i];
        let name: string;
        let reassign = false;

        if (comp instanceof Component) {
            name = Object.getPrototypeOf(comp).constructor.name;
        } else {
            name = (comp as Reassigner)[0].name;
            reassign = true;
        }

        if (component_arrays[name] == undefined) component_arrays[name] = [];

        // comp._id = entity_counter;
        
        let assigned = false;
        if (reassign && component_pools.has(name)) {
            for (let i = component_arrays[name].length-1; i >= 0; i--) {
                const old = component_arrays[name][i];
                if (old._id < 0) {
                    old._id = entity_counter;
                    const args = (comp as Reassigner)[1];
                    assigned = !!old.$reconstruct(...args);

                    if (!assigned) {
                        console.error("Trying to reassign component when $reconstruct function isn't defined or doesn't return \"this\"");
                        old._id = -1;
                    } else {
                        result_components.push(old);
                    }
                    break;
                }
            }
        } 
        if (!assigned) {
            if (reassign) {
                const [cls, args] = (comp as Reassigner);
                component_arrays[name].push(new cls(...args));
            } else {
                component_arrays[name].push(comp as Component);
            }

            const new_comp = component_arrays[name][component_arrays[name].length-1];
            new_comp._id = entity_counter;
            result_components.push(new_comp);
        }
    }

    component_cache = {};

    prerunEntitySystems(result_components);

    return {
        id: entity_counter++,
        start(func: (...components: T)=> void) {
            func(...components);
            return this;
        },
        update(func: (...components: T)=> void) {
            entity_updates.push([this.id, ()=> func(...components)]);
            return this;
        }
    }
}

// <T extends ClassType[]>(component_classes: [...T], systemFunc: SystemFunc<{ [K in keyof T]: InstanceType<T[K]> }>) {
const blankComponentQuery = (names: string[])=> names.map(_ => []);
export function queryEntities<T extends ClassType[]>(...args: [...T]): { [K in keyof T]: InstanceType<T[K]>[] } {
    if (args.length == 0) throw "<queryEntities()> Must give at least one param";

    const names = args.map(i => (i as ClassType).name);
    
    //@ts-ignore
    return queryEntitiesNames(...names);
}

export function queryEntitiesNames(...names: string[]) {
    if (names.length == 1) return [component_arrays[names[0]]?.filter(c => c._id >= 0) ?? []];

    const key = names.toSorted().join("|");

    if (component_cache[key] != undefined) {
        const cache = component_cache[key];
        return names.map(name => cache[name]);
    }

    const all_comps = names.map(name => component_arrays[name]?.filter(c => c._id >= 0) ?? null);

    if (all_comps.includes(null)) return blankComponentQuery(names);

    const comps = all_comps.map(arr => [...arr]);

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

    const entity_update_index = entity_updates.findIndex((up => up[0] == id));
    if (entity_update_index >= 0) entity_updates.splice(entity_update_index, 1);

    for (let i = 0; i < all_components.length; i++) {
        const components = all_components[i];
        
        const index = components.findIndex(({ _id })=> id == _id);
        if (index >= 0) {
            const comp = components[index];
            const name = Object.getPrototypeOf(comp).constructor.name;
            // const [removed] = components.splice(index, 1);
            // removed.$onDestroy();

            comp.$onDestroy();

            if (component_pools.has(name)) {
                comp._id = -1;
            } else {
                components.splice(index, 1);
            }
        }
    }

    component_cache = {}
}

function addToCache(names: string[]) {

}

function removeFromCache(names: string[]) {

}


export function getEntity(id: number) {
    return Object.values(component_arrays).map(arr => arr.find(c => c._id == id)).filter(comp => comp != undefined);
}

export function getEntityObj(id: number) {
    return Object.fromEntries(
        Object
            .values(component_arrays)
            .map(arr => arr.find(c => c._id == id))
            .filter(comp => comp != undefined)
            .map(comp => [Object.getPrototypeOf(comp).constructor.name, comp])
    );
}

export function deleteAllEntities() {
    const all_components = Object.values(component_arrays).flat();

    for (let i = 0; i < all_components.length; i++) {
        const comp = all_components[i];
        comp.$onDestroy();
    }

    component_arrays = {};
    component_cache = {};
    entity_updates = [];
}
