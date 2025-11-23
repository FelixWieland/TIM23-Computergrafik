import type { Scene } from "three";
import { Gltf } from "./gltf";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Loads and manages the terrain mesh that forms the ground of the scene.
 */
export class Terrain extends Gltf {
    scene: Scene;
    terrainGltf: GLTF | null = null;

    /**
     * Creates the terrain and starts loading its 3D model.
     * @param scene The Three.js scene to add the terrain to
     */
    public constructor(scene: Scene) {
        super("/models/Terrain.optim.glb");
        this.scene = scene;
        this.getGltf().then(this.setup.bind(this))
    }

    /**
     * Adds the loaded terrain model to the scene.
     * @param gltf The loaded terrain GLTF object
     */
    public setup(gltf: GLTF) {
        this.terrainGltf = gltf;
        this.scene.add(this.terrainGltf.scene);
    }

    /**
     * Updates the terrain each frame (currently no animation).
     */
    public animate() {
        if (this.terrainGltf === null) return;
    }
}