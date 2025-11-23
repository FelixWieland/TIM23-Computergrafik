import * as THREE from 'three';
import { type TourParameter } from './tour';
import { Scene } from '../scene';
import { FogSlider } from '../controls/fog-slider';
import { CloudControl } from '../controls/cloud-control';
import { LanternControl } from '../controls/lantern-control';
import { TimePicker } from '../controls/time-picker';

export class TourAnimator {
    private isAnimatingTour: boolean = false;
    private currentTourAnimation: number | null = null;
    private wasPointerLocked: boolean = false;

    // Helper function to lerp (linear interpolation)
    private lerp(start: number, end: number, t: number): number {
        return start + (end - start) * t;
    }

    // Helper function to lerp Vector3
    private lerpVector3(start: THREE.Vector3, end: THREE.Vector3, t: number): THREE.Vector3 {
        return new THREE.Vector3(
            this.lerp(start.x, end.x, t),
            this.lerp(start.y, end.y, t),
            this.lerp(start.z, end.z, t)
        );
    }

    // Helper function to normalize angle to [-PI, PI]
    private normalizeAngle(angle: number): number {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    }

    // Function to animate a single tour parameter
    public animateTourParameter(
        parameter: TourParameter,
        camera: THREE.PerspectiveCamera,
        customScene: Scene,
        timePicker: TimePicker,
        fogSlider: FogSlider,
        cloudControl: CloudControl,
        lanternControl: LanternControl
    ): Promise<void> {
        return new Promise((resolve) => {
            if (this.isAnimatingTour) {
                // Cancel previous animation
                if (this.currentTourAnimation !== null) {
                    cancelAnimationFrame(this.currentTourAnimation);
                }
            }

            this.isAnimatingTour = true;
            const duration = parameter.duration * 1000; // Convert to milliseconds
            const startTime = performance.now();

            // Get controls and unlock if locked (to allow manual rotation setting)
            const controls = customScene.getControls();
            this.wasPointerLocked = controls.isLocked;
            if (this.wasPointerLocked) {
                controls.unlock();
            }

            // Ensure camera up vector is correct
            camera.up.set(0, 1, 0);
            
            // Ensure rotation order is correct for first-person camera
            camera.rotation.order = 'YXZ';

            // Get current values - use the same approach as CoordinatesDisplay
            const startPosition = camera.position.clone();
            // Always set roll to 0 - don't preserve it to avoid unwanted tilting
            const startRotation = {
                pitch: camera.rotation.x,  // pitch is rotation.x (in radians)
                yaw: camera.rotation.y     // yaw is rotation.y (in radians)
            };

            const startCloudSpeed = cloudControl.getSpeed();
            const startCloudAmount = cloudControl.getAmount();
            const startFogValue = fogSlider.getDensity();
            const startWarmth = lanternControl.getWarmth();
            const startIntensity = lanternControl.getIntensity();

            // Get current date/time for animation
            const currentTime = timePicker.getTime();
            const currentHours = Math.floor(currentTime);
            const currentMinutes = Math.floor((currentTime - currentHours) * 60);
            const now = new Date();
            const startDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), currentHours, currentMinutes);

            // Get target values (use current if not specified)
            const targetPosition = parameter.position || startPosition.clone();
            const targetRotation = parameter.cameraRotation || startRotation;
            const targetCloudSpeed = parameter.cloudMovementSpeed !== undefined ? parameter.cloudMovementSpeed : startCloudSpeed;
            const targetCloudAmount = parameter.cloudAmount !== undefined ? parameter.cloudAmount : startCloudAmount;
            const targetFogValue = parameter.fogValue !== undefined ? parameter.fogValue : startFogValue;
            const targetWarmth = parameter.colorWarmth !== undefined ? parameter.colorWarmth : startWarmth;
            const targetIntensity = parameter.colorIntensity !== undefined ? parameter.colorIntensity : startIntensity;
            const targetDateTime = parameter.dateTime || startDateTime;

            const animate = (currentTime: number) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Use easing function for smoother animation (ease-in-out)
                const easedProgress = progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                // Interpolate camera position
                if (parameter.position) {
                    const currentPos = this.lerpVector3(startPosition, targetPosition, easedProgress);
                    camera.position.copy(currentPos);
                }

                // Interpolate camera rotation - using quaternion slerp to avoid roll
                if (parameter.cameraRotation) {
                    // Convert start and target rotations to quaternions (with roll = 0)
                    const startEuler = new THREE.Euler(
                        this.normalizeAngle(startRotation.pitch),
                        this.normalizeAngle(startRotation.yaw),
                        0,
                        'YXZ'
                    );
                    const targetEuler = new THREE.Euler(
                        this.normalizeAngle(targetRotation.pitch),
                        this.normalizeAngle(targetRotation.yaw),
                        0,
                        'YXZ'
                    );
                    
                    const startQuat = new THREE.Quaternion().setFromEuler(startEuler);
                    const targetQuat = new THREE.Quaternion().setFromEuler(targetEuler);
                    
                    // Spherical linear interpolation to avoid gimbal lock and roll
                    const currentQuat = new THREE.Quaternion().slerpQuaternions(startQuat, targetQuat, easedProgress);
                    
                    // Convert back to Euler with YXZ order to preserve zero roll
                    const currentEuler = new THREE.Euler().setFromQuaternion(currentQuat, 'YXZ');
                    
                    // Set rotation with roll always 0 to prevent unwanted tilting
                    camera.rotation.set(currentEuler.x, currentEuler.y, 0);
                }

                // Interpolate cloud movement speed
                if (parameter.cloudMovementSpeed !== undefined) {
                    const currentSpeed = this.lerp(startCloudSpeed, targetCloudSpeed, easedProgress);
                    cloudControl.setSpeed(currentSpeed);
                    customScene.getClouds().setMovementSpeed(currentSpeed);
                }

                // Interpolate cloud amount
                if (parameter.cloudAmount !== undefined) {
                    const currentAmount = this.lerp(startCloudAmount, targetCloudAmount, easedProgress);
                    cloudControl.setAmount(currentAmount);
                    customScene.getClouds().setCloudAmount(currentAmount);
                }

                // Interpolate fog value
                if (parameter.fogValue !== undefined) {
                    const currentFog = this.lerp(startFogValue, targetFogValue, easedProgress);
                    fogSlider.setDensity(currentFog);
                    customScene.getFog().setDensity(currentFog);
                }

                // Interpolate lantern warmth
                if (parameter.colorWarmth !== undefined) {
                    const currentWarmth = this.lerp(startWarmth, targetWarmth, easedProgress);
                    lanternControl.setWarmth(currentWarmth);
                    customScene.getLanterns().setWarmth(currentWarmth);
                }

                // Interpolate lantern intensity
                if (parameter.colorIntensity !== undefined) {
                    const currentIntensity = this.lerp(startIntensity, targetIntensity, easedProgress);
                    lanternControl.setIntensity(currentIntensity);
                    customScene.getLanterns().setIntensity(currentIntensity);
                }

                // Interpolate date/time
                if (parameter.dateTime) {
                    // Calculate time difference in milliseconds
                    const timeDiff = targetDateTime.getTime() - startDateTime.getTime();
                    const currentTimeMs = startDateTime.getTime() + (timeDiff * easedProgress);
                    const currentDate = new Date(currentTimeMs);
                    
                    const sun = customScene.getSun();
                    const clocks = customScene.getClocks();
                    sun.setCustomDateTime(currentDate);
                    clocks.setCustomDateTime(currentDate);
                }

                if (progress < 1) {
                    this.currentTourAnimation = requestAnimationFrame(animate);
                } else {
                    // Animation complete - set final values
                    if (parameter.position) {
                        camera.position.copy(targetPosition);
                    }
                    if (parameter.cameraRotation) {
                        // Set rotation atomically using set() to avoid gimbal lock issues
                        // Always set roll to 0 to prevent unwanted camera tilting
                        camera.rotation.set(targetRotation.pitch, targetRotation.yaw, 0);
                    }

                    // Re-lock pointer if it was locked before
                    if (this.wasPointerLocked) {
                        // Don't auto-lock, let user click to lock again
                        this.wasPointerLocked = false;
                    }
                    if (parameter.cloudMovementSpeed !== undefined) {
                        cloudControl.setSpeed(targetCloudSpeed);
                        customScene.getClouds().setMovementSpeed(targetCloudSpeed);
                    }
                    if (parameter.cloudAmount !== undefined) {
                        cloudControl.setAmount(targetCloudAmount);
                        customScene.getClouds().setCloudAmount(targetCloudAmount);
                    }
                    if (parameter.fogValue !== undefined) {
                        fogSlider.setDensity(targetFogValue);
                        customScene.getFog().setDensity(targetFogValue);
                    }
                    if (parameter.colorWarmth !== undefined) {
                        lanternControl.setWarmth(targetWarmth);
                        customScene.getLanterns().setWarmth(targetWarmth);
                    }
                    if (parameter.colorIntensity !== undefined) {
                        lanternControl.setIntensity(targetIntensity);
                        customScene.getLanterns().setIntensity(targetIntensity);
                    }

                    // Set final date/time
                    if (parameter.dateTime) {
                        const sun = customScene.getSun();
                        const clocks = customScene.getClocks();
                        sun.setCustomDateTime(targetDateTime);
                        clocks.setCustomDateTime(targetDateTime);
                    }

                    this.isAnimatingTour = false;
                    this.currentTourAnimation = null;
                    resolve();
                }
            };

            this.currentTourAnimation = requestAnimationFrame(animate);
        });
    }
}

