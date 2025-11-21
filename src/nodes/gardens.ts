import type { Scene } from "three";
import { Gltf } from "./gltf";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

export class Gardens extends Gltf {
    scene: Scene;
    gardensGltf: GLTF | null = null;

    public constructor(scene: Scene) {
        super("/models/GaertenHoefe.optim.glb");
        this.scene = scene;
        this.getGltf().then(this.setup.bind(this))
    }

    public setup(gltf: GLTF) {
        this.gardensGltf = gltf;
        this.scene.add(this.gardensGltf.scene);
    }

    public animate() {
        if (this.gardensGltf === null) return;
    }
}