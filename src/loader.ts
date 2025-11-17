import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

/**
 * Loads multiple GLB models from the provided paths and returns them as an array.
 * Supports both standard GLB and Draco-compressed GLB files.
 * @param paths - Array of paths to GLB model files
 * @param format - Format of the models: 'glb' for standard GLB, 'draco' for Draco-compressed GLB
 * @returns Promise that resolves to an array of loaded THREE.Group models
 */
export async function loadModels(paths: string[], format: 'glb' | 'draco' = 'glb'): Promise<THREE.Group[]> {
    try {
        // Create GLTFLoader
        const loader = new GLTFLoader();
        
        // Configure Draco loader if format is 'draco'
        if (format === 'draco') {
            const dracoLoader = new DRACOLoader();
            // Set decoder path (using CDN, can be changed to local path if needed)
            dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
            // Alternative: use local path if you have draco decoder files
            // dracoLoader.setDecoderPath('/draco/');
            loader.setDRACOLoader(dracoLoader);
        }
        
        // Load all models in parallel
        const gltfPromises = paths.map(path => loader.loadAsync(path));
        const gltfResults = await Promise.all(gltfPromises);
        
        // Extract the scene (THREE.Group) from each GLTF result
        const models = gltfResults.map(gltf => {
            const model = gltf.scene;
            model.position.set(0, 0, 0);
            model.scale.set(1, 1, 1);
            model.rotation.set(0, 0, 0);
            return model;
        });
        
        return models;
    } catch (error) {
        console.error('Error loading models:', error);
        throw error;
    }
}

