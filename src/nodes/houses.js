import { Gltf } from "./gltf";

/**
 * Loads and manages all the house buildings in the scene.
 */
export class Houses extends Gltf {
    scene;
    housesGltf = null;

    /**
     * Creates the houses and starts loading their 3D models.
     * @param scene The Three.js scene to add houses to
     */
    constructor(scene) {
        super("/models/Haeuser.optim.glb");
        this.scene = scene;
        this.getGltf().then(this.setup.bind(this));
    }

    /**
     * Adds the loaded house models to the scene.
     * @param gltf The loaded houses GLTF object
     */
    setup(gltf) {
        this.housesGltf = gltf;
        this.scene.add(this.housesGltf.scene);
    }
    
    /**
     * Updates the houses each frame (currently no animation).
     */
    animate() {
        if (this.housesGltf === null)
            return;
    }
}
