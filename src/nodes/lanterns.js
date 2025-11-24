import { Group, PointLight, Box3, Mesh, MeshStandardMaterial, Color, AmbientLight, DirectionalLight } from "three";
import { Gltf } from "./gltf";
/**
 * Manages lanterns placed throughout the scene with adjustable lighting.
 * Each lantern has its own point light that can be configured for color warmth and intensity.
 */
export class Lanterns extends Gltf {
    scene;
    laternGltf = null;
    lanternGroup;
    lanternInstances = [];
    lights = [];
    isEnabled = true;
    debugLightingEnabled = false;
    debugAmbientLight = null;
    debugDirectionalLight = null;
    debugAmbientLight2 = null;
    lanternPositions = [
        { x: 0, y: 0, z: 0 },
        { x: 100, y: 0, z: 100 },
        { x: -100, y: 0, z: 100 },
        { x: 100, y: 0, z: -100 },
        { x: -100, y: 0, z: -100 },
        { x: 200, y: 0, z: 0 },
        { x: -200, y: 0, z: 0 },
        { x: 0, y: 0, z: 200 },
        { x: 0, y: 0, z: -200 },
        { x: 150, y: 0, z: 150 },
        { x: -150, y: 0, z: 150 },
        { x: 150, y: 0, z: -150 },
        { x: -150, y: 0, z: -150 },
        { x: 300, y: 0, z: 0 },
        { x: -300, y: 0, z: 0 },
        { x: 0, y: 0, z: 300 },
        { x: 50, y: 0, z: 50 },
        { x: -50, y: 0, z: -50 },
        { x: 250, y: 0, z: 100 },
    ];

    /**
     * Creates the lantern system and starts loading lantern models.
     * @param scene The Three.js scene to add lanterns to
     */
    constructor(scene) {
        super("/models/Lamp.optim.glb");
        this.scene = scene;
        this.lanternGroup = new Group();
        this.getGltf().then(this.setup.bind(this));
    }

    /**
     * Creates a single lantern with its light at a specific position.
     * @param x X coordinate in world space
     * @param y Y coordinate in world space
     * @param z Z coordinate in world space
     * @return The lantern group containing the model and light
     */
    createLantern(x, y, z) {
        if (!this.laternGltf) {
            throw new Error("GLTF not loaded yet");
        }
        const lanternClone = this.laternGltf.scene.clone(true);
        lanternClone.position.set(x, y + 0.1, z);
        lanternClone.scale.set(1, 1.7, 1);
        this.ensureMaterialsRespondToLights(lanternClone);
        lanternClone.updateMatrixWorld(true);
        this.addLightToLantern(lanternClone);
        return lanternClone;
    }

    /**
     * Converts basic materials to standard materials so they respond to lighting.
     * This ensures lanterns look realistic under scene lighting.
     * @param object The 3D object to update materials for
     */
    ensureMaterialsRespondToLights(object) {
        object.traverse((child) => {
            if (child instanceof Mesh && child.material) {
                const material = child.material;
                if (material.type === 'MeshBasicMaterial' ||
                    material.isMeshBasicMaterial) {
                    const basicMat = material;
                    const standardMat = new MeshStandardMaterial({
                        color: basicMat.color,
                        map: basicMat.map,
                        transparent: basicMat.transparent,
                        opacity: basicMat.opacity,
                        roughness: 0.7,
                        metalness: 0.1,
                    });
                    child.material = standardMat;
                }
                else if (material.isMeshStandardMaterial ||
                    material.isMeshPhongMaterial ||
                    material.isMeshLambertMaterial) {
                    const mat = material;
                    if (mat.roughness !== undefined) {
                        mat.roughness = mat.roughness || 0.7;
                    }
                    if (mat.metalness !== undefined) {
                        mat.metalness = mat.metalness || 0.1;
                    }
                }
            }
        });
    }

    /**
     * Adds a point light to a lantern positioned at the top of the lantern model.
     * @param lanternClone The lantern object to add a light to
     * @return The created point light
     */
    addLightToLantern(lanternClone) {
        const box = new Box3().setFromObject(lanternClone);
        const topY = box.max.y + 1;
        const centerX = (box.min.x + box.max.x) / 2;
        const centerZ = (box.min.z + box.max.z) / 2;
        const light = new PointLight(0xffaa44, 10.0, 500, 0.8);
        light.position.set(centerX, topY, centerZ);
        light.decay = 0.8;
        this.scene.add(light);
        this.lights.push(light);
        return light;
    }

    /**
     * Creates all lantern instances at their predefined positions.
     * @param gltf The loaded lantern GLTF model
     */
    setup(gltf) {
        this.laternGltf = gltf;
        this.lanternPositions.forEach((pos) => {
            const lanternClone = this.createLantern(pos.x, pos.y, pos.z);
            this.lanternInstances.push(lanternClone);
            this.lanternGroup.add(lanternClone);
        });
        this.setWarmth(0.6);
        this.setIntensity(30.0);
        this.scene.add(this.lanternGroup);
    }

    /**
     * Adds a new lantern at a custom position.
     * @param x X coordinate
     * @param y Y coordinate
     * @param z Z coordinate
     */
    addLantern(x, y, z) {
        if (!this.laternGltf)
            return;
        const lanternClone = this.createLantern(x, y, z);
        this.lanternInstances.push(lanternClone);
        this.lanternGroup.add(lanternClone);
        this.lanternPositions.push({ x, y, z });
    }

    /**
     * Adjusts the color temperature of all lantern lights.
     * @param warmth Color warmth (0 = cool white, 1 = warm orange)
     */
    setWarmth(warmth) {
        const coolColor = new Color(0xffffff);
        const warmColor = new Color(0xffaa44);
        const color = new Color().lerpColors(coolColor, warmColor, warmth);
        this.lights.forEach(light => {
            light.color.copy(color);
        });
    }

    /**
     * Changes how bright all lantern lights are.
     * @param intensity Light intensity (higher = brighter)
     */
    setIntensity(intensity) {
        this.lights.forEach(light => {
            light.intensity = intensity;
        });
    }

    /**
     * Turns all lantern lights on or off.
     * @param enabled Whether the lights should be on
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        this.lights.forEach(light => {
            light.visible = enabled;
        });
    }

    /**
     * Checks if the lantern lights are currently enabled.
     * @return True if lights are on, false if off
     */
    getEnabled() {
        return this.isEnabled;
    }

    /**
     * Updates the lanterns each frame (currently no animation).
     */
    animate() {
        if (this.laternGltf === null)
            return;
    }

    /**
     * Enables or disables debug lighting for development purposes.
     * Creates ambient and directional lights to make objects visible during debugging.
     * @param enabled Whether debug lighting should be enabled
     */
    setDebugLighting(enabled) {
        if (this.debugLightingEnabled === enabled)
            return;
        this.debugLightingEnabled = enabled;
        if (enabled) {
            // Create debug lights if they don't exist
            if (!this.debugAmbientLight) {
                this.debugAmbientLight = new AmbientLight(0x404040, 0.3);
                this.scene.add(this.debugAmbientLight);
            }
            if (!this.debugDirectionalLight) {
                this.debugDirectionalLight = new DirectionalLight(0xffffff, 1.0);
                this.debugDirectionalLight.position.set(100, 100, 100);
                this.debugDirectionalLight.target.position.set(0, 0, 0);
                this.debugDirectionalLight.castShadow = false; // Disable shadows for debugging
                this.scene.add(this.debugDirectionalLight);
                this.scene.add(this.debugDirectionalLight.target);
            }
            if (!this.debugAmbientLight2) {
                this.debugAmbientLight2 = new AmbientLight(0xffffff, 0.8);
                this.scene.add(this.debugAmbientLight2);
            }
        }
        else {
            // Remove debug lights
            if (this.debugAmbientLight) {
                this.scene.remove(this.debugAmbientLight);
                this.debugAmbientLight.dispose();
                this.debugAmbientLight = null;
            }
            if (this.debugDirectionalLight) {
                this.scene.remove(this.debugDirectionalLight);
                this.scene.remove(this.debugDirectionalLight.target);
                this.debugDirectionalLight.dispose();
                this.debugDirectionalLight = null;
            }
            if (this.debugAmbientLight2) {
                this.scene.remove(this.debugAmbientLight2);
                this.debugAmbientLight2.dispose();
                this.debugAmbientLight2 = null;
            }
        }
    }
    
    /**
     * Checks if debug lighting is currently enabled.
     * @return True if debug lighting is on, false if off
     */
    getDebugLighting() {
        return this.debugLightingEnabled;
    }
}
