import { Gltf } from "./gltf";

/**
 * Loads and manages all the trees in the scene.
 */
export class Trees extends Gltf {
    scene;
    treesGltf = null;

    /**
     * Creates the trees and starts loading their 3D models.
     * @param scene The Three.js scene to add trees to
     */
    constructor(scene) {
        super("/models/Baume.optim.glb");
        this.scene = scene;
        this.getGltf().then(this.setup.bind(this));
    }

    /**
     * Adds the loaded tree models to the scene.
     * @param gltf The loaded trees GLTF object
     */
    setup(gltf) {
        this.treesGltf = gltf;
        this.scene.add(this.treesGltf.scene);
    }
    
    /**
     * Updates the trees each frame (currently no animation).
     */
    animate() {
        if (this.treesGltf === null)
            return;
    }
}
