import * as THREE from 'three';

export class CoordinatesDisplay {
    private displayElement: HTMLElement;
    private camera: THREE.PerspectiveCamera;

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

