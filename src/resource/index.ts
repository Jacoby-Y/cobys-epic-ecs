
type ClassType<T = any> = new (...args: any[]) => T;
type ResourceListener<T extends ClassType> = (resource: InstanceType<T>)=> void;

let resources: Record<string, object> = {};
let resource_listeners: Record<string, ResourceListener<any>[]> = {};


/** Give an instance of a class */
export function setResource(instance: object) {
    const name = Object.getPrototypeOf(instance).constructor.name;

    if (name == "Object") throw "<setResource()> must be given an instance of a class, not an object literal";

    resources[name] = instance;
}

export function setResourceObj(name: string, obj: object) {
    resources[name] = obj;
}

export function getResource<T extends ClassType>(cls: T): InstanceType<T> {
    return (resources[cls.name] ?? null) as InstanceType<T>;
}

export function getResourceObj<T = any>(name: string): T {
    return (resources[name] ?? null) as T;
}

export function deleteResources() {
    resources = {};
    resource_listeners = {};
}


export function resourceListener<T extends ClassType>(cls: T, func: ResourceListener<T>) {
    if (!resource_listeners[cls.name]) resource_listeners[cls.name] = [func];
    else !resource_listeners[cls.name].push(func);

    func(getResource(cls));

    return function() {
        if (!resource_listeners[cls.name].includes(func)) return;
        resource_listeners[cls.name].splice(resource_listeners[cls.name].indexOf(func), 1);
    }
}

export function resourceUpdate<T extends ClassType>(cls: T) {
    const rl = resource_listeners[cls.name];
    const res = getResource(cls)

    if (!rl || !res) return;

    for (let i = 0; i < rl.length; i++) {
        rl[i](res);
    }
}
