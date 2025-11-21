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

    constructor(controls: PointerLockControls) {
        this.controls = controls;
        this.onKeyDownHandler = this.handleKeyDown.bind(this);
        this.onKeyUpHandler = this.handleKeyUp.bind(this);
        
        document.addEventListener('keydown', this.onKeyDownHandler);
        document.addEventListener('keyup', this.onKeyUpHandler);
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

    // Cleanup method to remove event listeners
    public dispose(): void {
        document.removeEventListener('keydown', this.onKeyDownHandler);
        document.removeEventListener('keyup', this.onKeyUpHandler);
    }
}

