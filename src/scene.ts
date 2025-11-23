import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { Sun } from './ambient/sun';
import { Fog } from './ambient/fog';
import { Clouds } from './ambient/clouds';
import { getReferenceDistance } from './util';
import { Sky } from './ambient/sky';
import { Churches } from './nodes/churches';
import { CityWall } from './nodes/cityWall';
import { Gardens } from './nodes/gardens';
import { Houses } from './nodes/houses';
import { Terrain } from './nodes/terrain';
import { Trees } from './nodes/trees';
import { Lanterns } from './nodes/lanterns';
import { Water } from './ambient/water';
import { KeyboardControls } from './controls/keyboard-controls';
import { Clocks } from './nodes/clocks';
import { CollisionDetector } from './controls/collision-detector';
import { TourAnimator } from './tours/tour-animator';

/**
 * Manages the main 3D scene and all its components.
 * This class sets up the camera, lighting, ambient effects, and all 3D objects in the world.
 * It also handles the animation loop for updating all scene elements.
 */
export class Scene {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls!: PointerLockControls;
    private keyboardControls!: KeyboardControls;
    private collisionDetector!: CollisionDetector;

    private tourAnimator: TourAnimator | null = null;

    // Ambient
    private sun!: Sun;
    private fog!: Fog;
    private sky!: Sky;
    private clouds!: Clouds;
    private water!: Water;

    // Nodes
    private churches!: Churches
    private terrain!: Terrain
    private gardens!: Gardens
    private houses!: Houses
    private trees!: Trees
    private cityWall!: CityWall
    private lanterns!: Lanterns
    private clocks!: Clocks

    /**
     * Creates a new scene manager with all necessary components.
     * @param scene The Three.js scene object that holds all 3D objects
     * @param camera The perspective camera used to view the scene
     * @param renderer The WebGL renderer that draws everything to the screen
     */
    constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.setup()
    }

    /**
     * Initializes all scene components including lighting, camera, controls, ambient effects, and 3D models.
     * This sets up the sun, sky, fog, clouds, water, terrain, buildings, and other objects.
     */
    public setup() {
        // Setup camera, debug lighting, pointer lock controls, keyboard controls
        this.setupDebugLighting()
        this.setupCamera();
        this.setupPointerLockControls();

        // Create ambient
        this.sun = new Sun(this.scene)
        this.sky = new Sky(this.scene, this.sun)
        this.fog = new Fog(this.scene, 0xcccccc, 0.0)
        this.clouds = new Clouds(this.scene, this.camera)
        this.water = new Water(this.scene, this.renderer, this.camera, this.sun.getLight())

        // Initialize all nodes
        this.terrain = new Terrain(this.scene)
        this.trees = new Trees(this.scene)
        this.cityWall = new CityWall(this.scene)
        this.churches = new Churches(this.scene)
        this.houses = new Houses(this.scene)
        this.gardens = new Gardens(this.scene)
        this.lanterns = new Lanterns(this.scene)
        this.clocks = new Clocks(this.scene)
    }

    /**
     * Adds debug lighting to the scene for development purposes.
     * Creates ambient and directional lights to make objects visible during debugging.
     */
    private setupDebugLighting() {
        // return;
        
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        const debugLight = new THREE.DirectionalLight(0xffffff, 1.0);
        debugLight.position.set(100, 100, 100);
        debugLight.target.position.set(0, 0, 0);
        debugLight.castShadow = false; // Disable shadows for debugging
        this.scene.add(debugLight);
        this.scene.add(debugLight.target);
        const debugAmbientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(debugAmbientLight);
    }

    /**
     * Positions the camera at its starting location and configures its rotation order.
     * Sets the camera above and slightly behind the origin point.
     */
    private setupCamera() {
        const distance = getReferenceDistance();
        this.camera.position.set(0, distance * 0.1, distance * 0.2);
        this.camera.lookAt(0, 1, 0);
        this.camera.rotation.order = 'YXZ';
    }

    /**
     * Sets up first-person camera controls using pointer lock.
     * Enables mouse-look camera movement and keyboard-based player movement with collision detection.
     */
    private setupPointerLockControls() {
        this.controls = new PointerLockControls(this.camera, document.body);
        this.scene.add(this.controls.object);
        const blocker = document.getElementById('blocker');
        if (blocker) {
            blocker.addEventListener('click', () => {
                blocker.style.display = 'none';
                this.controls.lock();
            });
        }
        this.controls.addEventListener('unlock', () => {
            if (blocker) blocker.style.display = 'block';
        });
        
        this.keyboardControls = new KeyboardControls(this.controls);
        
        this.collisionDetector = new CollisionDetector(this.scene);
        this.keyboardControls.setCollisionDetector(this.collisionDetector);
    }

    /**
     * Gets the sun controller that manages sunlight and time of day.
     * @return The sun instance
     */
    public getSun(): Sun {
        return this.sun;
    }

    /**
     * Gets the fog controller that manages scene fog density and color.
     * @return The fog instance
     */
    public getFog(): Fog {
        return this.fog;
    }

    /**
     * Gets the clouds controller that manages volumetric cloud rendering.
     * @return The clouds instance
     */
    public getClouds(): Clouds {
        return this.clouds;
    }

    /**
     * Gets the lanterns controller that manages all lantern lights in the scene.
     * @return The lanterns instance
     */
    public getLanterns(): Lanterns {
        return this.lanterns;
    }

    /**
     * Gets the clocks controller that manages all animated clocks in the scene.
     * @return The clocks instance
     */
    public getClocks(): Clocks {
        return this.clocks;
    }

    /**
     * Gets the perspective camera used to view the scene.
     * @return The Three.js camera instance
     */
    public getCamera(): THREE.PerspectiveCamera {
        return this.camera;
    }

    /**
     * Gets the pointer lock controls used for first-person camera movement.
     * @return The pointer lock controls instance
     */
    public getControls(): PointerLockControls {
        return this.controls;
    }

    /**
     * Sets the tour animator that handles automated camera tours.
     * @param tourAnimator The tour animator instance to use for guided tours
     */
    public setTourAnimator(tourAnimator: TourAnimator): void {
        this.tourAnimator = tourAnimator;
    }

    /**
     * Updates all animated elements in the scene for the current frame.
     * This includes the sun position, clouds, water, clocks, and all 3D objects.
     * Called every frame to keep the scene moving and responsive.
     */
    public animate() {
        this.keyboardControls.update();
        let solarInfo: { azimuth: number, elevation: number, isDay: boolean } | null = null;
        if (this.sun) {
            this.sun.update();
            solarInfo = this.sun.getSolarInfo();
            if (this.fog) {
                this.fog.updateColorForSunElevation(solarInfo.elevation);
            }
        }
        if (solarInfo && this.sun && this.clouds) {
            this.clouds.updateLightingForSun(solarInfo.elevation, this.sun.getSunMesh().position);
        }
        
        if (this.clouds) {
            this.clouds.animate();
        }
        if (this.tourAnimator) {
            this.tourAnimator.animate();
        }
        if (this.sky) {
            this.sky.animate();
        }
        if (this.water) {
            this.water.animate();
        }
        if (this.clocks) {
            this.clocks.animate();
        }
        if (this.churches) {
            this.churches.animate();
        }
        if (this.trees) {
            this.trees.animate();
        }
        if (this.cityWall) {
            this.cityWall.animate();
        }
        if (this.houses) {
            this.houses.animate();
        }
        if (this.gardens) {
            this.gardens.animate();
        }
        if (this.lanterns) {
            this.lanterns.animate();
        }
        if (this.trees) {
            this.terrain.animate();
        }
    }
}