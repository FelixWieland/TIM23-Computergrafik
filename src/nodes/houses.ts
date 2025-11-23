import type { Scene } from "three";
import { Gltf } from "./gltf";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Loads and manages all the house buildings in the scene.
 */
export class Houses extends Gltf {
    scene: Scene;
    housesGltf: GLTF | null = null;

    /**
     * Creates the houses and starts loading their 3D models.
     * @param scene The Three.js scene to add houses to
     */
    public constructor(scene: Scene) {
        super("/models/Haeuser.optim.glb");
        this.scene = scene;
        this.getGltf().then(this.setup.bind(this))
    }

    /**
     * Adds the loaded house models to the scene.
     * @param gltf The loaded houses GLTF object
     */
    public setup(gltf: GLTF) {
        this.housesGltf = gltf;
        this.scene.add(this.housesGltf.scene);
    }

    /**
     * Updates the houses each frame (currently no animation).
     */
    public animate() {
        if (this.housesGltf === null) return;
    }
}