import type { Scene } from "three";
import { Gltf } from "./gltf";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Loads and manages all the trees in the scene.
 */
export class Trees extends Gltf {
    scene: Scene;
    treesGltf: GLTF | null = null;

    /**
     * Creates the trees and starts loading their 3D models.
     * @param scene The Three.js scene to add trees to
     */
    public constructor(scene: Scene) {
        super("/models/Baume.optim.glb");
        this.scene = scene;
        this.getGltf().then(this.setup.bind(this))
    }

    /**
     * Adds the loaded tree models to the scene.
     * @param gltf The loaded trees GLTF object
     */
    public setup(gltf: GLTF) {
        this.treesGltf = gltf;
        this.scene.add(this.treesGltf.scene);
    }

    /**
     * Updates the trees each frame (currently no animation).
     */
    public animate() {
        if (this.treesGltf === null) return;
    }
}