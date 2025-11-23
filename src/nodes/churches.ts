import type { Scene } from "three";
import { Gltf } from "./gltf";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Loads and manages the church buildings and fountains in the scene.
 */
export class Churches extends Gltf {
    scene: Scene;
    churchesGltf: GLTF | null = null;

    /**
     * Creates the churches and starts loading their 3D models.
     * @param scene The Three.js scene to add churches to
     */
    public constructor(scene: Scene) {
        super("/models/KirchenBrunnen.optim.glb");
        this.scene = scene;
        this.getGltf().then(this.setup.bind(this))
    }

    /**
     * Adds the loaded church models to the scene.
     * @param gltf The loaded churches GLTF object
     */
    public setup(gltf: GLTF) {
        this.churchesGltf = gltf;
        this.scene.add(this.churchesGltf.scene);
    }

    /**
     * Updates the churches each frame (currently no animation).
     */
    public animate() {
        if (this.churchesGltf === null) return;
    }
}