import { getReferenceDistance } from '../util';

/**
 * Provides a button to copy the current camera position and scene settings to clipboard.
 * Useful for saving specific views and settings to use in tour definitions.
 */
export class CopySettingsControl {
    button;
    /** Camera reference for reading position */
    camera;
    customScene;
    timePicker;
    fogSlider;
    cloudControl;
    lanternControl;
    
    /**
     * Creates a copy settings control and finds the button in the DOM.
     */
    constructor() {
        this.button = document.getElementById('copy-settings');
        if (!this.button) {
            console.error('Copy settings button not found');
            return;
        }
        this.setupEventListeners();
    }

    /**
     * Sets up the click handler for the copy button.
     */
    setupEventListeners() {
        this.button.addEventListener('click', () => {
            this.copyCurrentSettings();
        });
    }

    /**
     * Connects this control to the scene and UI components it needs to read settings from.
     * @param camera The camera to get position and rotation from
     * @param customScene The scene manager
     * @param timePicker The time picker to get current time from
     * @param fogSlider The fog slider to get fog density from
     * @param cloudControl The cloud control to get cloud settings from
     * @param lanternControl The lantern control to get lantern settings from
     */
    setHandlers(camera, customScene, timePicker, fogSlider, cloudControl, lanternControl) {
        this.camera = camera;
        this.customScene = customScene;
        this.timePicker = timePicker;
        this.fogSlider = fogSlider;
        this.cloudControl = cloudControl;
        this.lanternControl = lanternControl;
    }

    /**
     * Gathers all current camera and scene settings and copies them to clipboard as formatted code.
     * The output is ready to paste into tour definition files.
     */
    copyCurrentSettings() {
        if (!this.camera || !this.customScene || !this.timePicker ||
            !this.fogSlider || !this.cloudControl || !this.lanternControl) {
            console.error('Copy settings handlers not set');
            return;
        }
        const distance = getReferenceDistance();
        const pos = this.camera.position;
        const currentTime = this.timePicker.getTime();
        const hours = Math.floor(currentTime);
        const minutes = Math.floor((currentTime - hours) * 60);
        const now = new Date();
        const dateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
        const formatPosition = (pos) => {
            const xRatio = pos.x / distance;
            const yRatio = pos.y / distance;
            const zRatio = pos.z / distance;
            const roundTo1Decimal = (val) => Math.round(val * 10) / 10;
            const tolerance = 0.001;
            const xRounded = roundTo1Decimal(xRatio);
            const yRounded = roundTo1Decimal(yRatio);
            const zRounded = roundTo1Decimal(zRatio);
            if (Math.abs(xRatio - xRounded) < tolerance &&
                Math.abs(yRatio - yRounded) < tolerance &&
                Math.abs(zRatio - zRounded) < tolerance) {
                const formatComponent = (val) => {
                    if (val === 0)
                        return '0';
                    if (val === 1)
                        return 'distance';
                    return `distance * ${val}`;
                };
                return `new THREE.Vector3(${formatComponent(xRounded)}, ${formatComponent(yRounded)}, ${formatComponent(zRounded)})`;
            }
            return `new THREE.Vector3(${pos.x.toFixed(4)}, ${pos.y.toFixed(4)}, ${pos.z.toFixed(4)})`;
        };
        const parameterLines = [];
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
        parameterLines.push(`                duration: 3000`);
        const code = `            {\n${parameterLines.join('\n')}\n            },`;
        navigator.clipboard.writeText(code).catch((err) => {
            console.error('Failed to copy settings:', err);
        });
    }
}
