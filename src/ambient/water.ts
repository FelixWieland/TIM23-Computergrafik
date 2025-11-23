import type { Scene } from "three";
import * as THREE from "three";

/**
 * Represents a single water layer with its visual properties.
 */
interface WaterLayer {
    mesh: THREE.Mesh;
    normals: THREE.Texture;
    animationOffset: number;
}

/**
 * Creates and manages animated water surfaces with flowing effects.
 * Uses multiple layers of water at different depths with animated normal maps for realistic water movement.
 */
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

    /**
     * Creates a new water system with multiple layers and a riverbed.
     * @param scene The Three.js scene to add water to
     * @param renderer The WebGL renderer used for rendering
     * @param camera The camera used to view the water
     * @param sun Optional directional light that illuminates the water
     */
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

    /**
     * Creates the water layers and riverbed at different depths.
     * Sets up two water layers with different animation offsets for varied movement.
     */
    public setup() {
        this.water = this.setupWater(-3, 0.7, 0);
        this.water2 = this.setupWater(-10, 0.7, Math.PI / 2);
        this.setupRiverbed(-20);
    }

    /**
     * Creates a single water layer with animated normal maps for ripple effects.
     * @param y The vertical position of the water layer
     * @param transparency How see-through the water is (0 = opaque, 1 = transparent)
     * @param animationOffset Phase offset for animation to create varied movement
     * @return The water mesh that was created
     */
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

    /**
     * Creates the riverbed floor beneath the water layers.
     * @param y The vertical position of the riverbed
     * @return The riverbed mesh that was created
     */
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

    /**
     * Updates water animation every frame by moving the normal map textures.
     * Creates flowing water effects by shifting ripple patterns over time.
     */
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

