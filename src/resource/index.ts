
type ClassType = new (...args: any[])=> any;


let resources: Record<string, object> = {};


/** Give an instance of a class */
export function setResource(instance: object) {
    const name = Object.getPrototypeOf(instance).constructor.name;

    if (name == "Object") throw "<setResource()> must be given an instance of a class, not an object literal";

    resources[name] = instance;
}

export function setResourceObj(name: string, obj: object) {
    resources[name] = obj;
}

export function getResource<T extends new (...args: any[]) => any>(arg: T): InstanceType<T> {
    return (resources[arg.name] ?? null) as InstanceType<T>;
}

export function getResourceObj<T = any>(arg: string): T {
    return (resources[arg] ?? null) as T;
}

export function deleteResources() {
    resources = {};
}
