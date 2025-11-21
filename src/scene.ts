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
import { Water } from './ambient/water';
import { Lanterns } from './nodes/lanterns';

export class Scene {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls!: PointerLockControls;

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

    // Physics and movement properties
    private velocity = new THREE.Vector3();
    private direction = new THREE.Vector3();
    
    // Movement flags
    private moveForward = false;
    private moveBackward = false;
    private moveLeft = false;
    private moveRight = false;
    private moveUp = false;
    private moveDown = false;
    
    // Time tracking
    private prevTime = performance.now();

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
        this.setupKeyboardControls();

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
    }

    private setupDebugLighting() {
        return;
        
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
    }

    private setupKeyboardControls() {
        const onKeyDown = (event: KeyboardEvent) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.moveForward = true;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.moveLeft = true;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.moveBackward = true;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.moveRight = true;
                    break;
                case 'Space':
                    this.moveUp = true;
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    this.moveDown = true;
                    break;
            }
        };

        const onKeyUp = (event: KeyboardEvent) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.moveForward = false;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.moveLeft = false;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.moveBackward = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.moveRight = false;
                    break;
                case 'Space':
                    this.moveUp = false;
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    this.moveDown = false;
                    break;
                case 'KeyT':
                    break;
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
    }

   

    private updatePhysics() {
        const time = performance.now();

        if (this.controls.isLocked === true) {
            const delta = (time - this.prevTime) / 1000;

            this.velocity.x -= this.velocity.x * 10.0 * delta;
            this.velocity.z -= this.velocity.z * 10.0 * delta;
            this.velocity.y -= this.velocity.y * 10.0 * delta; 

            this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
            this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
            this.direction.normalize();

            if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * 400.0 * 4 * delta;
            if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * 400.0 * 4 * delta;

            if (this.moveUp) this.velocity.y += 400.0 * 4 * delta; // Fly up
            if (this.moveDown) this.velocity.y -= 400.0 * 4 * delta; // Fly down

            this.controls.moveRight(-this.velocity.x * delta);
            this.controls.moveForward(-this.velocity.z * delta);
            this.controls.object.position.y += (this.velocity.y * delta);
        }

        this.prevTime = time;
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

    public animate() {
        this.updatePhysics();
        
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
        
        // Update sky
        if (this.sky) {
            this.sky.animate();
        }
        
        // Update water
        if (this.water) {
            this.water.animate();
        }
    }
}