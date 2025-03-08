import { entity_updates, queryEntities, queryEntitiesNames } from "../entity/index.js";
import Component from "../component/index.js";


// type SystemFunc = (...comps: any[])=> void;
type SystemFunc<T extends any[]> = (...comps: T) => void;
type BulkSystemFunc = (...comps: any[][])=> void;

type Systems = Record<string, SystemFunc<any>[]>;
type BulkSystems = Record<string, BulkSystemFunc[]>;

type ClassType<T = any> = new (...args: any[]) => T;
// type ClassType = new (...args: any[])=> any;

export const systems: Systems = {}
const bulk_systems: BulkSystems = {}

export function addSystem<T extends ClassType[]>(component_classes: [...T], systemFunc: SystemFunc<{ [K in keyof T]: InstanceType<T[K]> }>) {
    const component_names = component_classes.map(cls => cls.name);
    
    const key = component_names.join("|");

    if (systems[key] == undefined) systems[key] = [];
    systems[key].push(systemFunc);
}

export function addBulkSystem(component_classes: ClassType[], systemFunc: BulkSystemFunc) {
    const component_names = component_classes.map(cls => cls.name);
    
    const key = component_names.join("|");

    if (bulk_systems[key] == undefined) bulk_systems[key] = [];
    bulk_systems[key].push(systemFunc);
}

export function runAllSystems() {
    for (let i = 0; i < entity_updates.length; i++) {
        const [_, func] = entity_updates[i];
        func();
    }

    const keys = Object.keys(systems).map(key => key.split("|"));
    const bulk_keys = Object.keys(bulk_systems).map(key => key.split("|"));

    for (let i = 0; i < keys.length; i++) {
        const component_names = keys[i];
        const components = queryEntitiesNames(...component_names);
        const key = component_names.join("|");
        runSystem(key, components);
    }

    for (let i = 0; i < bulk_keys.length; i++) {
        const component_names = bulk_keys[i];
        const components = queryEntitiesNames(...component_names);
        const key = component_names.join("|");
        runBulkSystem(key, components);
    }
}

export function prerunEntitySystems<T extends Component[]>(components: T) {
    const entries = components.map(c => [Object.getPrototypeOf(c).constructor.name, c]);
    const map = Object.fromEntries(entries);
    const names = new Set(entries.map(v => v[0]));

    const system_keys = Object.keys(systems).map(v => v.split("|"));

    outer:
    for (let i = 0; i < system_keys.length; i++) {
        const keys = system_keys[i];
        
        for (let j = 0; j < keys.length; j++) {
            if (!names.has(keys[j])) continue outer;
        }

        const args = keys.map(key => map[key]);

        let funcs = systems[keys.join("|")];
        for (let j = 0; j < funcs.length; j++) {
            funcs[j](...args);
        }
    }
}

function runSystem(key: string, components: Component[][]) {
    if (components[0].length == 0) return;

    const sys_funcs = systems[key] ?? [];

    for (let i = 0; i < sys_funcs.length; i++) {
        const func = sys_funcs[i];

        for (let j = 0; j < components[0].length; j++) {
            let params = [];

            for (let k = 0; k < components.length; k++) {
                params.push(components[k][j]);
            }

            func(...params);
        }

    }
}

function runBulkSystem(key: string, components: Component[][]) {
    if (components[0].length == 0) return;

    const sys_funcs = bulk_systems[key] ?? [];

    for (let i = 0; i < sys_funcs.length; i++) {
        const func = sys_funcs[i];

        func(...components);
    }
}
