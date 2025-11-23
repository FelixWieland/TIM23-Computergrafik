import * as THREE from 'three';
import { type TourParameter } from './tour';
import { Scene } from '../scene';
import { FogSlider } from '../controls/fog-slider';
import { CloudControl } from '../controls/cloud-control';
import { LanternControl } from '../controls/lantern-control';
import { TimePicker } from '../controls/time-picker';

export class TourAnimator {
    private isAnimatingTour: boolean = false;
    private wasPointerLocked: boolean = false;

    private startTime: number = 0;
    private duration: number = 0;
    private parameter: TourParameter | null = null;
    private camera: THREE.PerspectiveCamera | null = null;
    private customScene: Scene | null = null;
    private fogSlider: FogSlider | null = null;
    private cloudControl: CloudControl | null = null;
    private lanternControl: LanternControl | null = null;
    private resolveCallback: (() => void) | null = null;

    private startPosition: THREE.Vector3 = new THREE.Vector3();
    private startRotation: { pitch: number; yaw: number } = { pitch: 0, yaw: 0 };
    private startCloudSpeed: number = 0;
    private startCloudAmount: number = 0;
    private startFogValue: number = 0;
    private startWarmth: number = 0;
    private startIntensity: number = 0;
    private startDateTime: Date = new Date();

    private targetPosition: THREE.Vector3 = new THREE.Vector3();
    private targetRotation: { pitch: number; yaw: number } = { pitch: 0, yaw: 0 };
    private targetCloudSpeed: number = 0;
    private targetCloudAmount: number = 0;
    private targetFogValue: number = 0;
    private targetWarmth: number = 0;
    private targetIntensity: number = 0;
    private targetDateTime: Date = new Date();

    private lerp(start: number, end: number, t: number): number {
        return start + (end - start) * t;
    }

    private lerpVector3(start: THREE.Vector3, end: THREE.Vector3, t: number): THREE.Vector3 {
        return new THREE.Vector3(
            this.lerp(start.x, end.x, t),
            this.lerp(start.y, end.y, t),
            this.lerp(start.z, end.z, t)
        );
    }

    private normalizeAngle(angle: number): number {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    }

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

            const currentTime = timePicker.getTime();
            const currentHours = Math.floor(currentTime);
            const currentMinutes = Math.floor((currentTime - currentHours) * 60);
            const now = new Date();
            this.startDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), currentHours, currentMinutes);

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

    public animate(): void {
        if (!this.isAnimatingTour || !this.parameter || !this.camera || !this.customScene) {
            return;
        }

        const currentTime = performance.now();
        const elapsed = currentTime - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        
        const easedProgress = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        if (this.parameter.position) {
            const currentPos = this.lerpVector3(this.startPosition, this.targetPosition, easedProgress);
            this.camera.position.copy(currentPos);
        }

        if (this.parameter.cameraRotation) {
            const startEuler = new THREE.Euler(
                this.normalizeAngle(this.startRotation.pitch),
                this.normalizeAngle(this.startRotation.yaw),
                0,
                'YXZ'
            );
            const targetEuler = new THREE.Euler(
                this.normalizeAngle(this.targetRotation.pitch),
                this.normalizeAngle(this.targetRotation.yaw),
                0,
                'YXZ'
            );
            
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
        }if (this.parameter.colorIntensity !== undefined && this.lanternControl) {
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

