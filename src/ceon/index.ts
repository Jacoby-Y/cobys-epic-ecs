import Component from "../component";
import { addEntity } from "../entity";

type ClassType = new (...args: any[])=> any;
type Classes = Record<string, ClassType>;

const keyword: any = {
    true: true,
    false: false,
    null: null,
}


/** Coby's Epic (ECS) Object Notation. Pronounced like: Sea-on */
export function compileCeon(classes: Classes, lang_string: string, auto_add_entities = true) {
    const trimmed = split(lang_string, "\n")
        .map(s => s.slice(0, 2) == "//" ? "" : split(s, "//")[0])
        .filter(s => s)
        .join("");

    if (trimmed == "") throw "<compileCeon()> Can't compile CEON; string is empty";

    const entities = split(trimmed, "}{").map(str => {
        if (str[0] == "{") return str.slice(1);
        if (str[str.length-1] == "}") return str.slice(0, -1);
        return str;
    });

    const new_entities: Component[][] = [];

    for (const entity of entities) {
        const comps = split(entity, ")");
        const entity_comps = [];
        
        for (const comp of comps) {
            const [name, args] = split(comp, "(");

            const Comp = classes[name];

            if (Comp == undefined) throw `<compileCeon()> Class "${name}" not found in class set`;
            if (typeof Comp != "function") throw `<compileCeon()> Class "${name}" is found, but is not a constructor function`;

            const clean_args = (args ?? "").split(",").map(s => s.trim()).map(s => {
                s = s.trim();
                if (s[0] == '"') return s.slice(1, -1);
                if (keyword[s] !== undefined) return keyword[s];
                if (isFinite(parseFloat(s))) return parseFloat(s);
                return null;
            }).filter(s => s) as never[];

            //@ts-ignore
            entity_comps.push(new Comp(...clean_args));
        }

        new_entities.push(entity_comps);
    }

    if (auto_add_entities) addCompiledEntities(new_entities);

    return new_entities;
}

/** Fetch file and compile CEON */
export async function fetchCompileCeon(classes: Classes, path: string, auto_add_entities = true) {
    const res = await fetch(path);

    if (!res.ok) throw `Can't load entities from "${path}"`;

    const content = await res.text();

    compileCeon(classes, content, auto_add_entities);
}

function split(input: string, splitter: string): string[] {
    let build: string[] = [""];
    let build_i = 0;

    let quoting = false;
    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        
        if (char == '"') {
            quoting = !quoting;
        } else if (!quoting && input.slice(i, i + splitter.length) == splitter) {
            i += splitter.length - 1;
            build_i++;
            build[build_i] = "";
            continue;
        } 
        
        build[build_i] += input[i];
    }

    return build.map(s => s.trim()).filter(s => s);
}

function addCompiledEntities(entities: Component[][]) {
    for (const comps of entities) {
        addEntity(...comps);
    }
}
