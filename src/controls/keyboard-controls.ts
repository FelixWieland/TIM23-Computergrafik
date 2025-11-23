import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export class KeyboardControls {
    // Movement flags
    private moveForward = false;
    private moveBackward = false;
    private moveLeft = false;
    private moveRight = false;
    private moveUp = false;
    private moveDown = false;

    // Physics and movement properties
    private velocity = new THREE.Vector3();
    private direction = new THREE.Vector3();
    
    // Time tracking
    private prevTime = performance.now();

    private controls: PointerLockControls;
    private onKeyDownHandler: (event: KeyboardEvent) => void;
    private onKeyUpHandler: (event: KeyboardEvent) => void;
    private saveIntervalId: number | null = null;

    constructor(controls: PointerLockControls) {
        this.controls = controls;
        this.onKeyDownHandler = this.handleKeyDown.bind(this);
        this.onKeyUpHandler = this.handleKeyUp.bind(this);
        
        document.addEventListener('keydown', this.onKeyDownHandler);
        document.addEventListener('keyup', this.onKeyUpHandler);
        
        // Restore camera position and rotation from session storage
        this.restoreCameraState();
        
        // Save camera state periodically (every second)
        this.saveIntervalId = window.setInterval(() => this.saveCameraState(), 1000);
        
        // Also save when controls are unlocked
        this.controls.addEventListener('unlock', () => this.saveCameraState());
    }

    private handleKeyDown(event: KeyboardEvent): void {
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
            case 'Enter':
                // Exit pointer lock when Enter is pressed
                if (this.controls.isLocked) {
                    this.controls.unlock();
                }
                break;
        }
    }

    private handleKeyUp(event: KeyboardEvent): void {
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
    }

    // Update camera position based on keyboard input and physics
    public update(): void {
        const time = performance.now();

        if (this.controls.isLocked === true) {
            const delta = (time - this.prevTime) / 1000;

            this.velocity.x -= this.velocity.x * 10.0 * delta;
            this.velocity.z -= this.velocity.z * 10.0 * delta;
            this.velocity.y -= this.velocity.y * 10.0 * delta; 

            this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
            this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
            this.direction.normalize();

            if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * 100.0 * 4 * delta;
            if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * 100.0 * 4 * delta;

            if (this.moveUp) this.velocity.y += 100.0 * 4 * delta; // Fly up
            if (this.moveDown) this.velocity.y -= 100.0 * 4 * delta; // Fly down

            this.controls.moveRight(-this.velocity.x * delta);
            this.controls.moveForward(-this.velocity.z * delta);
            this.controls.object.position.y += (this.velocity.y * delta);
        }

        this.prevTime = time;
    }

    // Save camera position and rotation to session storage
    private saveCameraState(): void {
        const camera = this.controls.object;
        const position = camera.position;
        const rotation = camera.rotation;
        
        const cameraState = {
            position: {
                x: position.x,
                y: position.y,
                z: position.z
            },
            rotation: {
                x: rotation.x,
                y: rotation.y,
                z: rotation.z
            }
        };
        
        try {
            sessionStorage.setItem('cameraState', JSON.stringify(cameraState));
        } catch (error) {
            console.warn('Failed to save camera state to session storage:', error);
        }
    }

    // Restore camera position and rotation from session storage
    private restoreCameraState(): void {
        try {
            const savedState = sessionStorage.getItem('cameraState');
            if (savedState) {
                const cameraState = JSON.parse(savedState);
                const camera = this.controls.object;
                
                // Restore position
                if (cameraState.position) {
                    camera.position.set(
                        cameraState.position.x,
                        cameraState.position.y,
                        cameraState.position.z
                    );
                }
                
                // Restore rotation
                if (cameraState.rotation) {
                    camera.rotation.set(
                        cameraState.rotation.x,
                        cameraState.rotation.y,
                        cameraState.rotation.z
                    );
                }
            }
        } catch (error) {
            console.warn('Failed to restore camera state from session storage:', error);
        }
    }

    // Cleanup method to remove event listeners
    public dispose(): void {
        document.removeEventListener('keydown', this.onKeyDownHandler);
        document.removeEventListener('keyup', this.onKeyUpHandler);
        
        // Clear the save interval
        if (this.saveIntervalId !== null) {
            clearInterval(this.saveIntervalId);
            this.saveIntervalId = null;
        }
    }
}

