import type { Scene } from "three";
import { Gltf } from "./gltf";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

export class CityWall extends Gltf {
    scene: Scene;
    cityWallGltf: GLTF | null = null;

    public constructor(scene: Scene) {
        super("/models/MauerBrueckenTuerme.optim.glb");
        this.scene = scene;
        this.getGltf().then(this.setup.bind(this))
    }

    public setup(gltf: GLTF) {
        this.cityWallGltf = gltf;
        this.scene.add(this.cityWallGltf.scene);
    }

    public animate() {
        if (this.cityWallGltf === null) return;
    }
}