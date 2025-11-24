import { Gltf } from "./gltf";
/**
 * Loads and manages the gardens and courtyards in the scene.
 */
export class Gardens extends Gltf {
    scene;
    gardensGltf = null;

    /**
     * Creates the gardens and starts loading their 3D models.
     * @param scene The Three.js scene to add gardens to
     */
    constructor(scene) {
        super("/models/GaertenHoefe.optim.glb");
        this.scene = scene;
        this.getGltf().then(this.setup.bind(this));
    }

    /**
     * Adds the loaded garden models to the scene.
     * @param gltf The loaded gardens GLTF object
     */
    setup(gltf) {
        this.gardensGltf = gltf;
        this.scene.add(this.gardensGltf.scene);
    }
    
    /**
     * Updates the gardens each frame (currently no animation).
     */
    animate() {
        if (this.gardensGltf === null)
            return;
    }
}
