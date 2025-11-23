import type { Scene } from "three";
import { Gltf } from "./gltf";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Loads and manages the gardens and courtyards in the scene.
 */
export class Gardens extends Gltf {
    scene: Scene;
    gardensGltf: GLTF | null = null;

    /**
     * Creates the gardens and starts loading their 3D models.
     * @param scene The Three.js scene to add gardens to
     */
    public constructor(scene: Scene) {
        super("/models/GaertenHoefe.optim.glb");
        this.scene = scene;
        this.getGltf().then(this.setup.bind(this))
    }

    /**
     * Adds the loaded garden models to the scene.
     * @param gltf The loaded gardens GLTF object
     */
    public setup(gltf: GLTF) {
        this.gardensGltf = gltf;
        this.scene.add(this.gardensGltf.scene);
    }

    /**
     * Updates the gardens each frame (currently no animation).
     */
    public animate() {
        if (this.gardensGltf === null) return;
    }
}