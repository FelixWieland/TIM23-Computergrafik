import { Gltf } from "./gltf";

/**
 * Loads and manages the city walls, bridges, and towers.
 */
export class CityWall extends Gltf {
    scene;
    cityWallGltf = null;

    /**
     * Creates the city walls and starts loading their 3D models.
     * @param scene The Three.js scene to add the walls to
     */
    constructor(scene) {
        super("/models/MauerBrueckenTuerme.optim.glb");
        this.scene = scene;
        this.getGltf().then(this.setup.bind(this));
    }

    /**
     * Adds the loaded city wall models to the scene.
     * @param gltf The loaded city walls GLTF object
     */
    setup(gltf) {
        this.cityWallGltf = gltf;
        this.scene.add(this.cityWallGltf.scene);
    }
    
    /**
     * Updates the city walls each frame (currently no animation).
     */
    animate() {
        if (this.cityWallGltf === null)
            return;
    }
}
