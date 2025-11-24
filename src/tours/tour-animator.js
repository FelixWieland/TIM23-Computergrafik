import * as THREE from 'three';

/**
 * Handles animating tour parameters with smooth transitions.
 * Animates camera position, rotation, and all scene settings between tour steps using easing functions.
 * Each animation runs until complete, then resolves a promise to allow chaining tour steps.
 */
export class TourAnimator {
    isAnimatingTour = false;
    wasPointerLocked = false;
    enableEasing = true;
    startTime = 0;
    duration = 0;
    parameter = null;
    camera = null;
    customScene = null;
    fogSlider = null;
    cloudControl = null;
    lanternControl = null;
    resolveCallback = null;
    startPosition = new THREE.Vector3();
    startRotation = { pitch: 0, yaw: 0 };
    startCloudSpeed = 0;
    startCloudAmount = 0;
    startFogValue = 0;
    startWarmth = 0;
    startIntensity = 0;
    startDateTime = new Date();
    targetPosition = new THREE.Vector3();
    targetRotation = { pitch: 0, yaw: 0 };
    targetCloudSpeed = 0;
    targetCloudAmount = 0;
    targetFogValue = 0;
    targetWarmth = 0;
    targetIntensity = 0;
    targetDateTime = new Date();

    /**
     * Performs linear interpolation between two numbers.
     * @param start Starting value
     * @param end Ending value
     * @param t Progress from 0 to 1
     * @return Interpolated value
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    }

    /**
     * Performs linear interpolation between two 3D vectors.
     * @param start Starting vector
     * @param end Ending vector
     * @param t Progress from 0 to 1
     * @return Interpolated vector
     */
    lerpVector3(start, end, t) {
        return new THREE.Vector3(this.lerp(start.x, end.x, t), this.lerp(start.y, end.y, t), this.lerp(start.z, end.z, t));
    }

    /**
     * Normalizes an angle to the range -PI to PI for smooth rotation interpolation.
     * @param angle Angle in radians
     * @return Normalized angle
     */
    normalizeAngle(angle) {
        while (angle > Math.PI)
            angle -= 2 * Math.PI;
        while (angle < -Math.PI)
            angle += 2 * Math.PI;
        return angle;
    }

    /**
     * Starts animating to a new tour parameter step.
     * Smoothly transitions camera, time, fog, clouds, and lanterns from current values to target values.
     * @param parameter The tour step to animate to
     * @param camera The camera to move
     * @param customScene The scene manager
     * @param timePicker Time picker control for updating time display
     * @param fogSlider Fog slider control for updating fog UI
     * @param cloudControl Cloud control for updating cloud UI
     * @param lanternControl Lantern control for updating lantern UI
     * @return Promise that resolves when animation completes
     */
    animateTourParameter(parameter, camera, customScene, timePicker, fogSlider, cloudControl, lanternControl) {
        return new Promise((resolve) => {
            if (this.isAnimatingTour && this.resolveCallback) {
                this.resolveCallback();
            }
            this.parameter = parameter;
            this.camera = camera;
            this.customScene = customScene;
            this.fogSlider = fogSlider;
            this.cloudControl = cloudControl;
            this.lanternControl = lanternControl;
            this.resolveCallback = resolve;
            this.isAnimatingTour = true;
            this.duration = parameter.duration;
            this.startTime = performance.now();
            const controls = customScene.getControls();
            this.wasPointerLocked = controls.isLocked;
            if (this.wasPointerLocked) {
                controls.unlock();
            }
            camera.up.set(0, 1, 0);
            camera.rotation.order = 'YXZ';
            this.startPosition.copy(camera.position);
            this.startRotation = {
                pitch: camera.rotation.x,
                yaw: camera.rotation.y
            };
            this.startCloudSpeed = cloudControl.getSpeed();
            this.startCloudAmount = cloudControl.getAmount();
            this.startFogValue = fogSlider.getDensity();
            this.startWarmth = lanternControl.getWarmth();
            this.startIntensity = lanternControl.getIntensity();
            if (this.targetDateTime && this.targetDateTime.getTime() !== 0) {
                this.startDateTime = new Date(this.targetDateTime);
            } else {
                const currentTime = timePicker.getTime();
                const currentHours = Math.floor(currentTime);
                const currentMinutes = Math.floor((currentTime - currentHours) * 60);
                const now = new Date();
                this.startDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), currentHours, currentMinutes);
            }
            this.targetPosition = parameter.position || this.startPosition.clone();
            this.targetRotation = parameter.cameraRotation || this.startRotation;
            this.targetCloudSpeed = parameter.cloudMovementSpeed !== undefined ? parameter.cloudMovementSpeed : this.startCloudSpeed;
            this.targetCloudAmount = parameter.cloudAmount !== undefined ? parameter.cloudAmount : this.startCloudAmount;
            this.targetFogValue = parameter.fogValue !== undefined ? parameter.fogValue : this.startFogValue;
            this.targetWarmth = parameter.colorWarmth !== undefined ? parameter.colorWarmth : this.startWarmth;
            this.targetIntensity = parameter.colorIntensity !== undefined ? parameter.colorIntensity : this.startIntensity;
            this.targetDateTime = parameter.dateTime || this.startDateTime;
        });
    }
    
    /**
     * Updates the current tour animation for this frame.
     * Interpolates all parameters based on elapsed time and applies easing.
     * Call this every frame to keep tour animations smooth.
     */
    animate() {
        if (!this.isAnimatingTour || !this.parameter || !this.camera || !this.customScene) {
            return;
        }
        const currentTime = performance.now();
        const elapsed = currentTime - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        const easedProgress = this.enableEasing
            ? (progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2)
            : progress;
        if (this.parameter.position) {
            const currentPos = this.lerpVector3(this.startPosition, this.targetPosition, easedProgress);
            this.camera.position.copy(currentPos);
        }
        if (this.parameter.cameraRotation) {
            const startEuler = new THREE.Euler(this.normalizeAngle(this.startRotation.pitch), this.normalizeAngle(this.startRotation.yaw), 0, 'YXZ');
            const targetEuler = new THREE.Euler(this.normalizeAngle(this.targetRotation.pitch), this.normalizeAngle(this.targetRotation.yaw), 0, 'YXZ');
            const startQuat = new THREE.Quaternion().setFromEuler(startEuler);
            const targetQuat = new THREE.Quaternion().setFromEuler(targetEuler);
            const currentQuat = new THREE.Quaternion().slerpQuaternions(startQuat, targetQuat, easedProgress);
            const currentEuler = new THREE.Euler().setFromQuaternion(currentQuat, 'YXZ');
            this.camera.rotation.set(currentEuler.x, currentEuler.y, 0);
        }
        if (this.parameter.cloudMovementSpeed !== undefined && this.cloudControl) {
            const currentSpeed = this.lerp(this.startCloudSpeed, this.targetCloudSpeed, easedProgress);
            this.cloudControl.setSpeed(currentSpeed);
            this.customScene.getClouds().setMovementSpeed(currentSpeed);
        }
        if (this.parameter.cloudAmount !== undefined && this.cloudControl) {
            const currentAmount = this.lerp(this.startCloudAmount, this.targetCloudAmount, easedProgress);
            this.cloudControl.setAmount(currentAmount);
            this.customScene.getClouds().setCloudAmount(currentAmount);
        }
        if (this.parameter.fogValue !== undefined && this.fogSlider) {
            const currentFog = this.lerp(this.startFogValue, this.targetFogValue, easedProgress);
            this.fogSlider.setDensity(currentFog);
            this.customScene.getFog().setDensity(currentFog);
        }
        if (this.parameter.colorWarmth !== undefined && this.lanternControl) {
            const currentWarmth = this.lerp(this.startWarmth, this.targetWarmth, easedProgress);
            this.lanternControl.setWarmth(currentWarmth);
            this.customScene.getLanterns().setWarmth(currentWarmth);
        }
        if (this.parameter.colorIntensity !== undefined && this.lanternControl) {
            const currentIntensity = this.lerp(this.startIntensity, this.targetIntensity, easedProgress);
            this.lanternControl.setIntensity(currentIntensity);
            this.customScene.getLanterns().setIntensity(currentIntensity);
        }
        if (this.parameter.dateTime) {
            const timeDiff = this.targetDateTime.getTime() - this.startDateTime.getTime();
            const currentTimeMs = this.startDateTime.getTime() + (timeDiff * easedProgress);
            const currentDate = new Date(currentTimeMs);
            const sun = this.customScene.getSun();
            const clocks = this.customScene.getClocks();
            sun.setCustomDateTime(currentDate);
            clocks.setCustomDateTime(currentDate);
        }
        if (progress >= 1) {
            if (this.parameter.position) {
                this.camera.position.copy(this.targetPosition);
            }
            if (this.parameter.cameraRotation) {
                this.camera.rotation.set(this.targetRotation.pitch, this.targetRotation.yaw, 0);
            }
            if (this.wasPointerLocked) {
                this.wasPointerLocked = false;
            }
            if (this.parameter.cloudMovementSpeed !== undefined && this.cloudControl) {
                this.cloudControl.setSpeed(this.targetCloudSpeed);
                this.customScene.getClouds().setMovementSpeed(this.targetCloudSpeed);
            }
            if (this.parameter.cloudAmount !== undefined && this.cloudControl) {
                this.cloudControl.setAmount(this.targetCloudAmount);
                this.customScene.getClouds().setCloudAmount(this.targetCloudAmount);
            }
            if (this.parameter.fogValue !== undefined && this.fogSlider) {
                this.fogSlider.setDensity(this.targetFogValue);
                this.customScene.getFog().setDensity(this.targetFogValue);
            }
            if (this.parameter.colorWarmth !== undefined && this.lanternControl) {
                this.lanternControl.setWarmth(this.targetWarmth);
                this.customScene.getLanterns().setWarmth(this.targetWarmth);
            }
            if (this.parameter.colorIntensity !== undefined && this.lanternControl) {
                this.lanternControl.setIntensity(this.targetIntensity);
                this.customScene.getLanterns().setIntensity(this.targetIntensity);
            }
            if (this.parameter.dateTime) {
                const sun = this.customScene.getSun();
                const clocks = this.customScene.getClocks();
                sun.setCustomDateTime(this.targetDateTime);
                clocks.setCustomDateTime(this.targetDateTime);
            }
            this.isAnimatingTour = false;
            this.parameter = null;
            this.camera = null;
            this.customScene = null;
            this.fogSlider = null;
            this.cloudControl = null;
            this.lanternControl = null;
            if (this.resolveCallback) {
                this.resolveCallback();
                this.resolveCallback = null;
            }
        }
    }
}
