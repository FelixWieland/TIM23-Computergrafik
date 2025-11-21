import type { Scene } from "three";
import { Gltf } from "./gltf";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

export class Trees extends Gltf {
    scene: Scene;
    treesGltf: GLTF | null = null;

    public constructor(scene: Scene) {
        super("/models/Baume.optim.glb");
        this.scene = scene;
        this.getGltf().then(this.setup.bind(this))
    }

    public setup(gltf: GLTF) {
        this.treesGltf = gltf;
        this.scene.add(this.treesGltf.scene);
    }

    public animate() {
        if (this.treesGltf === null) return;
    }
}