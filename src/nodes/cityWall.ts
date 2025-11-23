import type { Scene } from "three";
import { Gltf } from "./gltf";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Loads and manages the city walls, bridges, and towers.
 */
export class CityWall extends Gltf {
    scene: Scene;
    cityWallGltf: GLTF | null = null;

    /**
     * Creates the city walls and starts loading their 3D models.
     * @param scene The Three.js scene to add the walls to
     */
    public constructor(scene: Scene) {
        super("/models/MauerBrueckenTuerme.optim.glb");
        this.scene = scene;
        this.getGltf().then(this.setup.bind(this))
    }

    /**
     * Adds the loaded city wall models to the scene.
     * @param gltf The loaded city walls GLTF object
     */
    public setup(gltf: GLTF) {
        this.cityWallGltf = gltf;
        this.scene.add(this.cityWallGltf.scene);
    }

    /**
     * Updates the city walls each frame (currently no animation).
     */
    public animate() {
        if (this.cityWallGltf === null) return;
    }
}