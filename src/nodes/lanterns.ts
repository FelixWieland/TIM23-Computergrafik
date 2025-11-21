import type { Scene } from "three";
import { Group, PointLight, Box3, Mesh, MeshStandardMaterial, Color } from "three";
import { Gltf } from "./gltf";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

export class Lanterns extends Gltf {
    scene: Scene;
    laternGltf: GLTF | null = null;
    private lanternGroup: Group;
    private lanternInstances: Group[] = [];
    private lights: PointLight[] = [];
    private isEnabled: boolean = true;
    
    private lanternPositions: Array<{ x: number; y: number; z: number }> = [
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
        { x: 0, y: 0, z: -300 },
        { x: 50, y: 0, z: 50 },
        { x: -50, y: 0, z: -50 },
        { x: 250, y: 0, z: 100 },
    ];

    public constructor(scene: Scene) {
        super("/models/Lamp.optim.glb");
        this.scene = scene;
        this.lanternGroup = new Group();
        this.getGltf().then(this.setup.bind(this))
    }

    private createLantern(x: number, y: number, z: number): Group {
        if (!this.laternGltf) {
            throw new Error("GLTF not loaded yet");
        }

        const lanternClone = this.laternGltf.scene.clone(true);
        lanternClone.position.set(x, y+0.1, z);
        lanternClone.scale.set(1, 1.7, 1);
        
        this.ensureMaterialsRespondToLights(lanternClone);
        lanternClone.updateMatrixWorld(true);
        this.addLightToLantern(lanternClone);
        
        return lanternClone;
    }

    private ensureMaterialsRespondToLights(object: Group) {
        object.traverse((child) => {
            if (child instanceof Mesh && child.material) {
                const material = child.material;
                
                if (material.type === 'MeshBasicMaterial' || 
                    (material as any).isMeshBasicMaterial) {
                    const basicMat = material as any;
                    const standardMat = new MeshStandardMaterial({
                        color: basicMat.color,
                        map: basicMat.map,
                        transparent: basicMat.transparent,
                        opacity: basicMat.opacity,
                        roughness: 0.7,
                        metalness: 0.1,
                    });
                    child.material = standardMat;
                } else if ((material as any).isMeshStandardMaterial || 
                          (material as any).isMeshPhongMaterial ||
                          (material as any).isMeshLambertMaterial) {
                    const mat = material as any;
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

    private addLightToLantern(lanternClone: Group) {
        const box = new Box3().setFromObject(lanternClone);
        const topY = box.max.y+1;
        const centerX = (box.min.x + box.max.x) / 2;
        const centerZ = (box.min.z + box.max.z) / 2;
        
        const light = new PointLight(0xffaa44, 10.0, 500, 0.8);
        light.position.set(centerX, topY, centerZ);
        light.decay = 0.8;
        
        this.scene.add(light);
        this.lights.push(light);
        
        return light;
    }

    public setup(gltf: GLTF) {
        this.laternGltf = gltf;

        this.lanternPositions.forEach((pos) => {
            const lanternClone = this.createLantern(pos.x, pos.y, pos.z);
            this.lanternInstances.push(lanternClone);
            this.lanternGroup.add(lanternClone);
        });
        
        this.scene.add(this.lanternGroup);
    }

    public addLantern(x: number, y: number, z: number) {
        if (!this.laternGltf) return;
        
        const lanternClone = this.createLantern(x, y, z);
        this.lanternInstances.push(lanternClone);
        this.lanternGroup.add(lanternClone);
        this.lanternPositions.push({ x, y, z });
    }

    public setWarmth(warmth: number) {
        const coolColor = new Color(0xffffff);
        const warmColor = new Color(0xffaa44);
        const color = new Color().lerpColors(coolColor, warmColor, warmth);
        
        this.lights.forEach(light => {
            light.color.copy(color);
        });
    }

    public setIntensity(intensity: number) {
        this.lights.forEach(light => {
            light.intensity = intensity;
        });
    }

    public setEnabled(enabled: boolean) {
        this.isEnabled = enabled;
        this.lights.forEach(light => {
            light.visible = enabled;
        });
    }

    public getEnabled(): boolean {
        return this.isEnabled;
    }

    public animate() {
        if (this.laternGltf === null) return;
    }
}