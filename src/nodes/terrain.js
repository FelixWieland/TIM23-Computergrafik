import { Gltf } from "./gltf";

/**
 * Loads and manages the terrain mesh that forms the ground of the scene.
 */
export class Terrain extends Gltf {
    scene;
    terrainGltf = null;

    /**
     * Creates the terrain and starts loading its 3D model.
     * @param scene The Three.js scene to add the terrain to
     */
    constructor(scene) {
        super("/models/Terrain.optim.glb");
        this.scene = scene;
        this.getGltf().then(this.setup.bind(this));
    }

    /**
     * Adds the loaded terrain model to the scene.
     * @param gltf The loaded terrain GLTF object
     */
    setup(gltf) {
        this.terrainGltf = gltf;
        this.scene.add(this.terrainGltf.scene);
    }
    
    /**
     * Updates the terrain each frame (currently no animation).
     */
    animate() {
        if (this.terrainGltf === null)
            return;
    }
}
