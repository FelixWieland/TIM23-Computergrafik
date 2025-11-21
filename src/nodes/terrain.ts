import type { Scene } from "three";
import { Gltf } from "./gltf";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

export class Terrain extends Gltf {
    scene: Scene;
    terrainGltf: GLTF | null = null;

    public constructor(scene: Scene) {
        super("/models/Terrain.optim.glb");
        this.scene = scene;
        this.getGltf().then(this.setup.bind(this))
    }

    public setup(gltf: GLTF) {
        this.terrainGltf = gltf;
        this.scene.add(this.terrainGltf.scene);
    }

    public animate() {
        if (this.terrainGltf === null) return;
    }
}