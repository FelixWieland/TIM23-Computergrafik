import * as THREE from 'three';
import { Scene } from '../scene';
import { TimePicker } from './time-picker';
import { FogSlider } from './fog-slider';
import { CloudControl } from './cloud-control';
import { LanternControl } from './lantern-control';
import { getReferenceDistance } from '../util';

export class CopySettingsControl {
    private button: HTMLButtonElement;

    constructor() {
        this.button = document.getElementById('copy-settings') as HTMLButtonElement;
        if (!this.button) {
            console.error('Copy settings button not found');
            return;
        }
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.button.addEventListener('click', () => {
            this.copyCurrentSettings();
        });
    }

    public setHandlers(
        camera: THREE.PerspectiveCamera,
        customScene: Scene,
        timePicker: TimePicker,
        fogSlider: FogSlider,
        cloudControl: CloudControl,
        lanternControl: LanternControl
    ): void {
        this.camera = camera;
        this.customScene = customScene;
        this.timePicker = timePicker;
        this.fogSlider = fogSlider;
        this.cloudControl = cloudControl;
        this.lanternControl = lanternControl;
    }

    private camera?: THREE.PerspectiveCamera;
    private customScene?: Scene;
    private timePicker?: TimePicker;
    private fogSlider?: FogSlider;
    private cloudControl?: CloudControl;
    private lanternControl?: LanternControl;

    private copyCurrentSettings(): void {
        if (!this.camera || !this.customScene || !this.timePicker || 
            !this.fogSlider || !this.cloudControl || !this.lanternControl) {
            console.error('Copy settings handlers not set');
            return;
        }

        const distance = getReferenceDistance();
        const pos = this.camera.position;
        
        // Get current time from time picker
        const currentTime = this.timePicker.getTime();
        const hours = Math.floor(currentTime);
        const minutes = Math.floor((currentTime - hours) * 60);
        const now = new Date();
        const dateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

        // Format the position using distance multiplier if possible
        const formatPosition = (pos: THREE.Vector3): string => {
            // Try to find a simple multiplier
            const xRatio = pos.x / distance;
            const yRatio = pos.y / distance;
            const zRatio = pos.z / distance;
            
            // Round to 1 decimal place and check if it's close
            const roundTo1Decimal = (val: number) => Math.round(val * 10) / 10;
            const tolerance = 0.001;
            
            const xRounded = roundTo1Decimal(xRatio);
            const yRounded = roundTo1Decimal(yRatio);
            const zRounded = roundTo1Decimal(zRatio);
            
            if (Math.abs(xRatio - xRounded) < tolerance &&
                Math.abs(yRatio - yRounded) < tolerance &&
                Math.abs(zRatio - zRounded) < tolerance) {
                // Format with distance multiplier (matching tours.ts format)
                const formatComponent = (val: number) => {
                    if (val === 0) return '0';
                    if (val === 1) return 'distance';
                    return `distance * ${val}`;
                };
                return `new THREE.Vector3(${formatComponent(xRounded)}, ${formatComponent(yRounded)}, ${formatComponent(zRounded)})`;
            }
            // Otherwise use exact values
            return `new THREE.Vector3(${pos.x.toFixed(4)}, ${pos.y.toFixed(4)}, ${pos.z.toFixed(4)})`;
        };

        // Build the parameter object
        const parameterLines: string[] = [];
        
        parameterLines.push(`                position: ${formatPosition(pos)},`);
        parameterLines.push(`                cameraRotation: {`);
        parameterLines.push(`                    pitch: ${this.camera.rotation.x.toFixed(4)},`);
        parameterLines.push(`                    yaw: ${this.camera.rotation.y.toFixed(4)}`);
        parameterLines.push(`                },`);
        parameterLines.push(`                cloudMovementSpeed: ${this.cloudControl.getSpeed().toFixed(4)},`);
        parameterLines.push(`                cloudAmount: ${this.cloudControl.getAmount().toFixed(4)},`);
        parameterLines.push(`                colorWarmth: ${this.lanternControl.getWarmth().toFixed(4)},`);
        parameterLines.push(`                colorIntensity: ${this.lanternControl.getIntensity().toFixed(4)},`);
        parameterLines.push(`                fogValue: ${this.fogSlider.getDensity().toFixed(6)},`);
        parameterLines.push(`                dateTime: new Date(${dateTime.getFullYear()}, ${dateTime.getMonth()}, ${dateTime.getDate()}, ${dateTime.getHours()}, ${dateTime.getMinutes()}), // ${dateTime.getHours().toString().padStart(2, '0')}:${dateTime.getMinutes().toString().padStart(2, '0')}`);
        parameterLines.push(`                duration: 3.0`);

        const code = `            {\n${parameterLines.join('\n')}\n            },`;

        // Copy to clipboard
        navigator.clipboard.writeText(code).then(() => {
            console.log('Settings copied to clipboard');
            // Visual feedback
            const originalHTML = this.button.innerHTML;
            this.button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
            `;
            setTimeout(() => {
                this.button.innerHTML = originalHTML;
            }, 1000);
        }).catch((err) => {
            console.error('Failed to copy settings:', err);
        });
    }
}

