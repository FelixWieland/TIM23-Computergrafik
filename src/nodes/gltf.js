import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

/**
 * Handles loading of 3D models in GLTF format.
 * Provides a convenient wrapper around the GLTF loader with caching support.
 */
export class Gltf {
    url;
    gltf;
    loadedGltf = null;

    /**
     * Creates a new GLTF model loader and starts loading the file.
     * @param url Path to the GLTF or GLB file to load
     */
    constructor(url) {
        this.url = url;
        this.gltf = loader.loadAsync(url);
    }
    
    /**
     * Gets the loaded GLTF model, waiting for it to finish loading if necessary.
     * Results are cached after first load for better performance.
     * @return Promise that resolves to the loaded GLTF object
     */
    async getGltf() {
        if (this.loadedGltf !== null)
            return this.loadedGltf;
        const loadedGltf = await this.gltf;
        loadedGltf.scene.position.set(0, 0, 0);
        loadedGltf.scene.scale.set(1, 1, 1);
        loadedGltf.scene.rotation.set(0, 0, 0);
        this.loadedGltf = loadedGltf;
        return this.loadedGltf;
    }
}
