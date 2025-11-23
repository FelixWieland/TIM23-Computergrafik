import type { Scene } from "three";
import * as THREE from "three";

interface WaterLayer {
    mesh: THREE.Mesh;
    normals: THREE.Texture;
    animationOffset: number;
}

export class Water {
    scene: Scene;
    water: THREE.Mesh | null = null;
    water2: THREE.Mesh | null = null;
    riverbed: THREE.Mesh | null = null;
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    sun: THREE.DirectionalLight | null = null;
    private waterLayers: WaterLayer[] = [];
    private time: number = 0;
    private readonly waterSize = 950;

    public constructor(
        scene: Scene,
        renderer: THREE.WebGLRenderer,
        camera: THREE.PerspectiveCamera,
        sun?: THREE.DirectionalLight
    ) {
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;
        if (sun) {
            this.sun = sun;
        }
        this.setup();
    }

    public setup() {
        this.water = this.setupWater(-3, 0.7, 0);
        this.water2 = this.setupWater(-10, 0.7, Math.PI / 2);
        this.setupRiverbed(-20);
    }

    private setupWater(y: number, transparency: number, animationOffset: number): THREE.Mesh {
        const textureLoader = new THREE.TextureLoader();
        const waterGeometry = new THREE.PlaneGeometry(this.waterSize, this.waterSize);
        const waterNormals = textureLoader.load(
            "/textures/waternormals.jpg",
            (texture) => {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(4, 4);
            }
        );
        const waterMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a8ca6, // Blue-green water color
            transparent: true,
            opacity: transparency,
            normalMap: waterNormals,
            roughness: 0.8,
            metalness: 0.1,
        });

        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.position.y = y;
        water.position.z = 20;

        this.waterLayers.push({
            mesh: water,
            normals: waterNormals,
            animationOffset: animationOffset
        });

        this.scene.add(water);
        return water;
    }

    private setupRiverbed(y: number): THREE.Mesh {
        const textureLoader = new THREE.TextureLoader();
        const riverbedGeometry = new THREE.PlaneGeometry(this.waterSize, this.waterSize);
        const riverbedTexture = textureLoader.load(
            "/textures/riverbed.jpg",
            (texture) => {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(8, 8);
            }
        );
        const riverbedMaterial = new THREE.MeshStandardMaterial({
            map: riverbedTexture,
            transparent: false,
            roughness: 0.9,
            metalness: 0.1,
        });
        const riverbed = new THREE.Mesh(riverbedGeometry, riverbedMaterial);
        riverbed.rotation.x = -Math.PI / 2;
        riverbed.position.y = y;
        riverbed.position.z = 20;

        this.riverbed = riverbed;
        this.scene.add(riverbed);
        return riverbed;
    }

    public animate() {
        if (this.waterLayers.length === 0) return;
        this.time += 0.05;
        for (const layer of this.waterLayers) {
            const offsetTime = this.time + layer.animationOffset;
            layer.normals.offset.x = Math.sin(offsetTime * 3.0) * 0.001;
            layer.normals.offset.y = Math.cos(offsetTime * 2.5) * 0.001;
        }
    }
}

