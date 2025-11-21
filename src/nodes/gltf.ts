import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

export class Gltf {
    url: string;
    gltf: Promise<GLTF>
    loadedGltf: GLTF | null = null;

    
    public constructor(url: string) {
        this.url = url;
        this.gltf = loader.loadAsync(url)
    }

    public async getGltf() {
        if (this.loadedGltf !== null) return this.loadedGltf;

        const loadedGltf = await this.gltf
        loadedGltf.scene.position.set(0, 0, 0);
        loadedGltf.scene.scale.set(1, 1, 1);
        loadedGltf.scene.rotation.set(0, 0, 0);
        this.loadedGltf = loadedGltf;
        
        return this.loadedGltf;
    }
}