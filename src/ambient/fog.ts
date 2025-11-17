import * as THREE from 'three';

export class Fog {
    private scene: THREE.Scene;
    private fog: THREE.FogExp2;
    private density: number = 0.0; // Default: no fog
    private readonly nightColor = new THREE.Color(0x080b12);
    private readonly twilightColor = new THREE.Color(0x3a3b4c);
    private readonly dayColor = new THREE.Color(0xdde4ef);
    private readonly colorBuffer = new THREE.Color();

    constructor(scene: THREE.Scene, color: number = 0xcccccc, density: number = 0.0) {
        this.scene = scene;
        this.density = density;
        
        // Create exponential fog (more realistic than linear fog)
        this.fog = new THREE.FogExp2(color, density);
        this.scene.fog = this.fog;
    }

    /**
     * Set the fog density
     * @param density Fog density (0.0 = no fog, higher values = more fog)
     */
    public setDensity(density: number): void {
        this.density = Math.max(0, density); // Ensure non-negative
        this.fog.density = this.density;
    }

    /**
     * Get the current fog density
     */
    public getDensity(): number {
        return this.density;
    }

    /**
     * Set the fog color
     * @param color Fog color (hex value)
     */
    public setColor(color: number): void {
        this.fog.color.setHex(color);
    }

    /**
     * Get the fog color
     */
    public getColor(): THREE.Color {
        return this.fog.color;
    }

    /**
     * Update the fog color based on the sun elevation to avoid glowing fog at night.
     * @param elevation Current sun elevation in degrees
     */
    public updateColorForSunElevation(elevation: number): void {
        if (!isFinite(elevation)) {
            return;
        }

        const twilightBlend = THREE.MathUtils.clamp((elevation + 5) / 15, 0, 1);
        const dayBlend = THREE.MathUtils.clamp((elevation - 5) / 45, 0, 1);

        this.colorBuffer
            .copy(this.nightColor)
            .lerp(this.twilightColor, twilightBlend)
            .lerp(this.dayColor, dayBlend);

        this.fog.color.copy(this.colorBuffer);
    }
}

