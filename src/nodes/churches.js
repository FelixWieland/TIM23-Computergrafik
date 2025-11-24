import { Gltf } from "./gltf";

/**
 * Loads and manages the church buildings and fountains in the scene.
 */
export class Churches extends Gltf {
    scene;
    churchesGltf = null;

    /**
     * Creates the churches and starts loading their 3D models.
     * @param scene The Three.js scene to add churches to
     */
    constructor(scene) {
        super("/models/KirchenBrunnen.optim.glb");
        this.scene = scene;
        this.getGltf().then(this.setup.bind(this));
    }

    /**
     * Adds the loaded church models to the scene.
     * @param gltf The loaded churches GLTF object
     */
    setup(gltf) {
        this.churchesGltf = gltf;
        this.scene.add(this.churchesGltf.scene);
    }
    
    /**
     * Updates the churches each frame (currently no animation).
     */
    animate() {
        if (this.churchesGltf === null)
            return;
    }
}
