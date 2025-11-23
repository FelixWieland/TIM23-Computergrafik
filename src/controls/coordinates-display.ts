import * as THREE from 'three';

/**
 * Displays the current camera position and rotation on screen.
 * Clicking the display copies the coordinates to clipboard for easy sharing.
 */
export class CoordinatesDisplay {
    private displayElement: HTMLElement;
    private camera: THREE.PerspectiveCamera;

    /**
     * Creates a coordinate display that shows camera position and rotation.
     * @param camera The camera to track and display coordinates for
     */
    constructor(camera: THREE.PerspectiveCamera) {
        this.camera = camera;
        this.displayElement = document.getElementById('coordinates-display') as HTMLElement;
        
        if (!this.displayElement) {
            console.error('Coordinates display element not found');
            return;
        }

        this.displayElement.addEventListener('click', () => {
            const textToCopy = this.displayElement.textContent;
            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy).catch((err) => {
                    console.error('Failed to copy coordinates:', err);
                });
            }
        });
        this.update();
    }

    /**
     * Updates the displayed coordinates to match current camera position and rotation.
     * Call this every frame to keep the display current.
     */
    public update(): void {
        if (!this.displayElement) return;

        const pos = this.camera.position;
        const x = pos.x.toFixed(2);
        const y = pos.y.toFixed(2);
        const z = pos.z.toFixed(2);

        const pitch = THREE.MathUtils.radToDeg(this.camera.rotation.x).toFixed(1);
        const yaw = THREE.MathUtils.radToDeg(this.camera.rotation.y).toFixed(1);

        this.displayElement.textContent = `${x}, ${y}, ${z} | ${pitch}°, ${yaw}°`;
    }
}

