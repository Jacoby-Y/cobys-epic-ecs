
type ClassType = new (...args: any[])=> any;


const scoreboards: Record<string, object> = {};


/** Give an instance of a class */
export function setScoreboard(instance: object) {
    const name = Object.getPrototypeOf(instance).constructor.name;

    if (name == "Object") throw "<setScoreboard()> must be given an instance of a class, not an object literal";

    scoreboards[name] = instance;
}

export function setScoreboardObj(name: string, obj: object) {
    scoreboards[name] = obj;
}

export function getScoreboard<T = any>(arg: string | ClassType): T {

    const name = (typeof arg == "string" ? arg : arg.name);

    return (scoreboards[name] ?? null) as T;
}
