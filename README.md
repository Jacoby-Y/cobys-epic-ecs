## Coby's Epic ECS

A barebones Entity Component System made to work well with [cobys-epic-engine](https://github.com/Jacoby-Y/cobys-epic-engine)

Checkout a demo [here](https://github.com/Jacoby-Y/cobys-epic-platformer-demo/)

___

#### Roadmap:
- [ ] Easy way of adding/using resources (textures, audio, etc.)
- [ ] Create a bunch of built-in components and systems
    - [ ] Tilemap
    - [ ] Colliders

___

#### Add To Project
```bash
# Just install it using npm (or pnpm, like I do)

npm i cobys-epic-ecs@latest
```

___

#### Building The ECS
```bash
git clone https://github.com/Jacoby-Y/cobys-epic-ecs.git
cd cobys-epic-ecs
npm i

# Will compile and build package in /pkg
npm run build

# If you want to use your local version...
cd pkg
npm link
cd ~/path/to/other/project
npm link cobys-epic-ecs
```
