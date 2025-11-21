import type { Scene } from "three";
import { Gltf } from "./gltf";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

export class Houses extends Gltf {
    scene: Scene;
    housesGltf: GLTF | null = null;

    public constructor(scene: Scene) {
        super("/models/Haeuser.optim.glb");
        this.scene = scene;
        this.getGltf().then(this.setup.bind(this))
    }

    public setup(gltf: GLTF) {
        this.housesGltf = gltf;
        this.scene.add(this.housesGltf.scene);
    }

    public animate() {
        if (this.housesGltf === null) return;
    }
}