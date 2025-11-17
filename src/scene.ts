import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { Sun } from './ambient/sun';
import { Fog } from './ambient/fog';
import { Clouds } from './ambient/clouds';
import { coordsToPixel, pixelToCoords, getReferenceDistance } from './util';
import { loadModels } from './loader';
import { modelPaths } from './models';

export class Scene {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private controls!: PointerLockControls;
    private sky!: Sky;
    private skySun!: THREE.Vector3;
    private sun!: Sun;
    private fog!: Fog;
    private clouds!: Clouds;
    
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

    constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, _renderer: THREE.WebGLRenderer) {
        this.scene = scene;
        this.camera = camera;
    }

    public setup() {
        this.createSky();
        this.createSun();
        this.createFog();
        this.createClouds();
        this.setupLighting();
        this.setupCamera();
        this.setupPointerLockControls();
        this.setupKeyboardControls();
        this.demonstrateCoordinateConversion();
        this.loadModels();
    }

    private loadModels() {
        // Load the models
        loadModels(modelPaths, 'glb').then(models => {
            console.log('Glb Models loaded:', models);
            models.forEach(model => {
                this.scene.add(model);
            })
        });
    }

    private createSky() {
        // Create realistic sky shader
        this.sky = new Sky();
        
        // Scale the sky to be large enough for our world
        const distance = getReferenceDistance();
        this.sky.scale.setScalar(distance * 3); // 3 times the table size
        
        this.scene.add(this.sky);
        
        // Create sun vector for sky shader
        this.skySun = new THREE.Vector3();
        
        // Configure sky parameters for realistic appearance
        const uniforms = this.sky.material.uniforms;
        uniforms['turbidity'].value = 10;
        uniforms['rayleigh'].value = 3;
        uniforms['mieCoefficient'].value = 0.005;
        uniforms['mieDirectionalG'].value = 0.7;
        
        // Set initial sun position (elevation: 45 degrees, azimuth: 180 degrees)
        const elevation = 45; // degrees
        const azimuth = 180; // degrees
        
        const phi = THREE.MathUtils.degToRad(90 - elevation);
        const theta = THREE.MathUtils.degToRad(azimuth);
        
        this.skySun.setFromSphericalCoords(1, phi, theta);
        uniforms['sunPosition'].value.copy(this.skySun);
        
        console.log(`Sky created with scale: ${(distance * 3).toFixed(2)}m`);
        console.log(`Sun position: (${this.skySun.x.toFixed(3)}, ${this.skySun.y.toFixed(3)}, ${this.skySun.z.toFixed(3)})`);
    }

    private createSun() {
        // Create the sun instance
        this.sun = new Sun(this.scene);
    }

    private createFog() {
        // Create fog instance (default: no fog, can be controlled via slider)
        this.fog = new Fog(this.scene, 0xcccccc, 0.0);
    }

    private createClouds() {
        // Create clouds instance
        this.clouds = new Clouds(this.scene, this.camera);
    }

    private setupLighting() {
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
        // Position the camera at a reasonable height to see the large table and terrain
        const distance = getReferenceDistance();
        // Position camera closer to the table for better visibility of terrain
        this.camera.position.set(0, distance * 0.1, distance * 0.2);
        this.camera.lookAt(0, 1, 0); // Look at the terrain level
        
        console.log(`Camera positioned at: (0, ${(distance * 0.1).toFixed(2)}, ${(distance * 0.2).toFixed(2)})`);
        console.log(`Camera looking at: (0, 1, 0)`);
    }

    private setupPointerLockControls() {
        // Create pointer lock controls
        this.controls = new PointerLockControls(this.camera, document.body);
        this.scene.add(this.controls.object);

        // Get UI elements
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

        // No need for raycaster since we're flying
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
                    // T key is handled in keydown, no need to handle in keyup
                    break;
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
    }

    private demonstrateCoordinateConversion() {
        console.log('=== Coordinate Conversion Demonstration ===');
        
        // Test the two reference points
        const point1 = coordsToPixel(48.0951, 9.7824);
        const point2 = coordsToPixel(48.1017, 9.7972);
        
        console.log('Point 1 (48.0951, 9.7824):', point1);
        console.log('Point 2 (48.1017, 9.7972):', point2);
        
        // Convert back to verify
        const backToCoords1 = pixelToCoords(point1.x, point1.y, point1.z);
        const backToCoords2 = pixelToCoords(point2.x, point2.y, point2.z);
        
        console.log('Converted back to coords 1:', backToCoords1);
        console.log('Converted back to coords 2:', backToCoords2);
        
        // Calculate distance in 3D space
        const distance3D = Math.sqrt(
            Math.pow(point2.x - point1.x, 2) + 
            Math.pow(point2.z - point1.z, 2)
        );
        
        console.log(`Distance in 3D space: ${distance3D.toFixed(2)} meters`);
        console.log(`Reference distance: ${getReferenceDistance().toFixed(2)} meters`);
        console.log('==========================================');
    }

    private updatePhysics() {
        const time = performance.now();

        if (this.controls.isLocked === true) {
            const delta = (time - this.prevTime) / 1000;

            // Apply friction to horizontal movement
            this.velocity.x -= this.velocity.x * 10.0 * delta;
            this.velocity.z -= this.velocity.z * 10.0 * delta;
            this.velocity.y -= this.velocity.y * 10.0 * delta; // Also apply friction to vertical movement

            // Calculate movement direction
            this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
            this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
            this.direction.normalize(); // ensures consistent movements in all directions

            // Apply horizontal movement forces
            if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * 400.0 * 4 * delta;
            if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * 400.0 * 4 * delta;

            // Apply vertical movement forces (flying)
            if (this.moveUp) this.velocity.y += 400.0 * 4 * delta; // Fly up
            if (this.moveDown) this.velocity.y -= 400.0 * 4 * delta; // Fly down

            // Apply movement
            this.controls.moveRight(-this.velocity.x * delta);
            this.controls.moveForward(-this.velocity.z * delta);
            this.controls.object.position.y += (this.velocity.y * delta);
        }

        this.prevTime = time;
    }

    private updateSkySunPosition() {
        // Get the sun's position from our Sun class
        const sunPosition = this.sun.getSunMesh().position;
        
        // Normalize the sun position for the sky shader
        this.skySun.copy(sunPosition).normalize();
        
        // Update the sky shader's sun position
        const uniforms = this.sky.material.uniforms;
        uniforms['sunPosition'].value.copy(this.skySun);
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

    public animate() {
        // Update physics and movement
        this.updatePhysics();

        // Update sky sun position to match our sun's position
        if (this.sky && this.sun) {
            this.updateSkySunPosition();
        }
        
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
        
        // Update clouds
        if (this.clouds) {
            this.clouds.update();
        }
    }
}