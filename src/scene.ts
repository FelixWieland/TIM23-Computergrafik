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

export class Scene {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls!: PointerLockControls;
    private keyboardControls!: KeyboardControls;
    private collisionDetector!: CollisionDetector;

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

    constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.setup()
    }

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

    private setupDebugLighting() {
        // return;
        
        // Add ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        
        // Add bright debugging light for building visibility
        const debugLight = new THREE.DirectionalLight(0xffffff, 1.0);
        debugLight.position.set(100, 100, 100);
        debugLight.target.position.set(0, 0, 0);
        debugLight.castShadow = false; // Disable shadows for debugging
        this.scene.add(debugLight);
        this.scene.add(debugLight.target);
        
        // Add additional ambient light for debugging
        const debugAmbientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(debugAmbientLight);
        
        console.log('Buildings: Debug lighting added - bright directional and ambient lights');
        
        // Note: Sun provides the main directional light
    }

    private setupCamera() {
        const distance = getReferenceDistance();
        this.camera.position.set(0, distance * 0.1, distance * 0.2);
        this.camera.lookAt(0, 1, 0);
    }

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

    public getSun(): Sun {
        return this.sun;
    }

    public getFog(): Fog {
        return this.fog;
    }

    public getClouds(): Clouds {
        return this.clouds;
    }

    public getLanterns(): Lanterns {
        return this.lanterns;
    }

    public getClocks(): Clocks {
        return this.clocks;
    }

    // public getCollisionDetector(): CollisionDetector {
    //     return this.collisionDetector;
    // }

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
            this.clouds.update();
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
    }
}