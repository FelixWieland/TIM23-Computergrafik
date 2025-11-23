import * as THREE from 'three';

/**
 * Controls the scene fog that creates atmospheric depth and changes color with time of day.
 * The fog automatically adjusts its color based on sun elevation for realistic day/night transitions.
 */
export class Fog {
    private scene: THREE.Scene;
    private fog: THREE.FogExp2;
    private density: number = 0.0; // Default: no fog
    private readonly nightColor = new THREE.Color(0x080b12);
    private readonly twilightColor = new THREE.Color(0x3a3b4c);
    private readonly dayColor = new THREE.Color(0xdde4ef);
    private readonly colorBuffer = new THREE.Color();

    /**
     * Creates a new fog controller and adds it to the scene.
     * @param scene The Three.js scene to add fog to
     * @param color The initial fog color as a hex value
     * @param density The initial fog density (0 = no fog, higher = thicker fog)
     */
    constructor(scene: THREE.Scene, color: number = 0xcccccc, density: number = 0.0) {
        this.scene = scene;
        this.density = density;

        this.fog = new THREE.FogExp2(color, density);
        this.scene.fog = this.fog;
    }

    /**
     * Changes how thick the fog appears in the scene.
     * @param density The fog density value (0 = no fog, higher = thicker fog)
     */
    public setDensity(density: number): void {
        this.density = Math.max(0, density);
        this.fog.density = this.density;
    }

    /**
     * Gets the current fog density.
     * @return The current fog density value
     */
    public getDensity(): number {
        return this.density;
    }

    /**
     * Sets the fog color directly using a hex color value.
     * @param color The fog color as a hex number
     */
    public setColor(color: number): void {
        this.fog.color.setHex(color);
    }

    /**
     * Gets the current fog color.
     * @return The fog color as a Three.js Color object
     */
    public getColor(): THREE.Color {
        return this.fog.color;
    }

    /**
     * Adjusts fog color based on the sun's position in the sky.
     * Creates natural color transitions between day (blue-gray), twilight (purple-gray), and night (dark blue).
     * @param elevation The sun's elevation angle in degrees (negative = below horizon)
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

