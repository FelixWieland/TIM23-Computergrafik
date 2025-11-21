import type { Scene } from "three";
import { Gltf } from "./gltf";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

export class Churches extends Gltf {
    scene: Scene;
    churchesGltf: GLTF | null = null;

    public constructor(scene: Scene) {
        super("/models/KirchenBrunnen.optim.glb");
        this.scene = scene;
        this.getGltf().then(this.setup.bind(this))
    }

    public setup(gltf: GLTF) {
        this.churchesGltf = gltf;
        this.scene.add(this.churchesGltf.scene);
    }

    public animate() {
        if (this.churchesGltf === null) return;
    }
}