import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { CollisionDetector } from './collision-detector';

/**
 * Handles keyboard input for moving the camera around the scene.
 * Provides WASD/arrow keys for movement, space/shift for up/down, and includes collision detection.
 */
export class KeyboardControls {
    private moveForward = false;
    private moveBackward = false;
    private moveLeft = false;
    private moveRight = false;
    private moveUp = false;
    private moveDown = false;

    private playerHeight = 2.0;

    private velocity = new THREE.Vector3();
    private direction = new THREE.Vector3();
    
    private prevTime = performance.now();

    private controls: PointerLockControls;
    private onKeyDownHandler: (event: KeyboardEvent) => void;
    private onKeyUpHandler: (event: KeyboardEvent) => void;
    private collisionDetector: CollisionDetector | null = null;

    /**
     * Creates keyboard controls for camera movement.
     * @param controls The pointer lock controls that manage the camera
     */
    constructor(controls: PointerLockControls) {
        this.controls = controls;
        this.onKeyDownHandler = this.handleKeyDown.bind(this);
        this.onKeyUpHandler = this.handleKeyUp.bind(this);
        
        document.addEventListener('keydown', this.onKeyDownHandler);
        document.addEventListener('keyup', this.onKeyUpHandler);
    }

    /**
     * Handles key press events to start movement in various directions.
     * @param event The keyboard event with the pressed key
     */
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
                if (this.controls.isLocked) {
                    this.controls.unlock();
                }
                break;
            case 'KeyI':
                this.toggleUI()
                break;
        }
    }

    /**
     * Handles key release events to stop movement.
     * @param event The keyboard event with the released key
     */
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

    /**
     * Shows or hides the UI elements when the I key is pressed.
     */
    private toggleUI(): void {
        const statsPanel = document.getElementById('stats-panel');
        const controls = document.getElementsByClassName('controls');

        const elements = [statsPanel!, ...controls] as HTMLElement[];
        for (const element of elements) {
            element.style.display = element.style.display === 'none' ? 'flex' : 'none';
        }
    }

    /**
     * Updates camera position each frame based on keyboard input.
     * Applies physics-like movement with deceleration and handles collisions if a detector is set.
     * Movement is relative to camera direction for natural first-person controls.
     */
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

            if (this.collisionDetector) {
                const currentPosition = this.controls.object.position.clone();
                
                const cameraRelativeMovement = new THREE.Vector3(
                    -this.velocity.x * delta,  // left/right
                    this.velocity.y * delta,   // up/down
                    -this.velocity.z * delta   // forward/back
                );

                const camera = this.controls.object;
                const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
                let forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
                
                forward.y = 0;
                forward.normalize();
                
                const up = new THREE.Vector3(0, 1, 0);

                const worldMovement = new THREE.Vector3()
                    .addScaledVector(right, cameraRelativeMovement.x)
                    .addScaledVector(up, cameraRelativeMovement.y)
                    .addScaledVector(forward, cameraRelativeMovement.z);

                const xMovement = new THREE.Vector3(worldMovement.x, 0, 0);
                const yMovement = new THREE.Vector3(0, worldMovement.y, 0);
                const zMovement = new THREE.Vector3(0, 0, worldMovement.z);

                let allowedXMovement = xMovement;
                if (xMovement.length() > 0.001) {
                    allowedXMovement = this.collisionDetector.getAllowedMovement(currentPosition, xMovement);
                }

                const afterXPosition = currentPosition.clone().add(allowedXMovement);

                let allowedYMovement = yMovement;
                if (yMovement.length() > 0.001) {
                    allowedYMovement = this.collisionDetector.getAllowedMovement(afterXPosition, yMovement);
                }

                const afterYPosition = afterXPosition.clone().add(allowedYMovement);

                let allowedZMovement = zMovement;
                if (zMovement.length() > 0.001) {
                    allowedZMovement = this.collisionDetector.getAllowedMovement(afterYPosition, zMovement);
                }

                const finalPosition = afterYPosition.clone().add(allowedZMovement);
                this.controls.object.position.copy(finalPosition);

                const groundHeight = this.collisionDetector.getGroundHeight(finalPosition);
                if (groundHeight !== null) {
                    const minHeight = groundHeight + this.playerHeight;
                    if (!(this.moveUp && this.controls.object.position.y > minHeight))  {
                        this.controls.object.position.y = minHeight;
                    }
                }

                const actualWorldMovement = allowedXMovement.clone().add(allowedYMovement).add(allowedZMovement);
                if (actualWorldMovement.length() < worldMovement.length() * 0.9) {
                    this.velocity.multiplyScalar(0.5);
                }
            } else {
                this.controls.moveRight(-this.velocity.x * delta);
                this.controls.moveForward(-this.velocity.z * delta);
                this.controls.object.position.y += (this.velocity.y * delta);
            }
        }

        this.prevTime = time;
    }

    /**
     * Connects a collision detector to prevent walking through walls.
     * @param detector The collision detector to use, or null to disable collision detection
     */
    public setCollisionDetector(detector: CollisionDetector | null): void {
        this.collisionDetector = detector;
    }

    /**
     * Cleans up event listeners when keyboard controls are no longer needed.
     */
    public dispose(): void {
        document.removeEventListener('keydown', this.onKeyDownHandler);
        document.removeEventListener('keyup', this.onKeyUpHandler);
    }
}

