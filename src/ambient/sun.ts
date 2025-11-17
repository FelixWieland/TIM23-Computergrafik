import * as THREE from 'three';
import { getReferenceDistance } from '../util';

export class Sun {
    private light!: THREE.DirectionalLight;
    private sunMesh!: THREE.Mesh;
    private scene: THREE.Scene;
    private orbitRadius!: number;
    
    // Solar positioning parameters
    private latitude: number = 52.5; // Default to Berlin, Germany
    private longitude: number = 13.4;
    private timezone: number = 1; // UTC+1 (Central European Time)
    private customDateTime: Date | null = null; // Custom date/time override
    private lastSolarInfo: { azimuth: number, elevation: number, isDay: boolean } | null = null;

    constructor(scene: THREE.Scene, latitude?: number, longitude?: number, timezone?: number) {
        this.scene = scene;
        if (latitude !== undefined) this.latitude = latitude;
        if (longitude !== undefined) this.longitude = longitude;
        if (timezone !== undefined) this.timezone = timezone;
        this.createSun();
    }

    private createSun() {
        // Calculate scaled dimensions based on the table size
        const distance = getReferenceDistance();
        this.orbitRadius = distance * 2; // Orbit at 2x the table size
        
        // Create the directional light (sun rays)
        this.light = new THREE.DirectionalLight(0xffffff, 2.0); // Increased initial intensity
        this.light.position.set(this.orbitRadius, this.orbitRadius * 0.5, this.orbitRadius);
        this.light.castShadow = true;
        
        // Ensure the light is initially very bright
        this.light.intensity = 2.0;
        
        // Configure shadow properties for better quality - scaled to new size
        this.light.shadow.mapSize.width = 2048;
        this.light.shadow.mapSize.height = 2048;
        this.light.shadow.camera.near = 0.5;
        this.light.shadow.camera.far = distance * 6; // Far enough to cover the skybox
        this.light.shadow.camera.left = -distance * 2;
        this.light.shadow.camera.right = distance * 2;
        this.light.shadow.camera.top = distance * 2;
        this.light.shadow.camera.bottom = -distance * 2;

        // Create a visual representation of the sun (sphere) - scaled appropriately
        const sunSize = distance * 0.03 * 0; // Decreased sun model to zero for debugging purposes
        const sunGeometry = new THREE.SphereGeometry(sunSize, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffff00 // Bright yellow
        });
        
        this.sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
        this.sunMesh.position.copy(this.light.position);

        // Add both light and visual to the scene
        this.scene.add(this.light);
        this.scene.add(this.sunMesh);
        
        console.log(`Sun created with orbit radius: ${this.orbitRadius.toFixed(2)}m, size: ${sunSize.toFixed(2)}m`);
    }

    /**
     * Calculate solar position based on current date and time
     * Returns azimuth and elevation angles in degrees
     */
    private calculateSolarPosition(): { azimuth: number, elevation: number } {
        const now = this.customDateTime || new Date();
        
        // Calculate day of year
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        // Calculate equation of time (approximation)
        const B = (dayOfYear - 81) * 2 * Math.PI / 365;
        const equationOfTime = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
        
        // Calculate local solar time
        const localStandardTime = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
        const longitudeCorrection = (this.longitude - (this.timezone * 15)) / 15; // 15 degrees per hour
        const solarTime = localStandardTime + longitudeCorrection + equationOfTime / 60;
        
        // Calculate hour angle
        const hourAngle = 15 * (solarTime - 12); // degrees
        
        // Calculate declination angle (more accurate formula)
        const declination = 23.45 * Math.sin((284 + dayOfYear) * 2 * Math.PI / 365);
        
        // Convert to radians
        const latRad = this.latitude * Math.PI / 180;
        const hourAngleRad = hourAngle * Math.PI / 180;
        const declinationRad = declination * Math.PI / 180;
        
        // Calculate elevation angle
        const elevationRad = Math.asin(
            Math.sin(latRad) * Math.sin(declinationRad) + 
            Math.cos(latRad) * Math.cos(declinationRad) * Math.cos(hourAngleRad)
        );
        
        // Calculate azimuth angle (corrected formula)
        const azimuthRad = Math.atan2(
            Math.sin(hourAngleRad),
            Math.cos(hourAngleRad) * Math.sin(latRad) - Math.tan(declinationRad) * Math.cos(latRad)
        );
        
        // Adjust azimuth to be 0-360 degrees (0 = North, 90 = East, 180 = South, 270 = West)
        let azimuth = azimuthRad * 180 / Math.PI;
        if (azimuth < 0) azimuth += 360;
        
        return {
            azimuth: azimuth,
            elevation: elevationRad * 180 / Math.PI
        };
    }

    /**
     * Convert solar angles to 3D position
     */
    private solarAnglesToPosition(azimuth: number, elevation: number): THREE.Vector3 {
        // Convert to radians
        const azimuthRad = azimuth * Math.PI / 180;
        const elevationRad = elevation * Math.PI / 180;
        
        // Calculate position in 3D space
        // For Three.js coordinate system: X=East, Y=Up, Z=South
        const x = Math.cos(elevationRad) * Math.sin(azimuthRad) * this.orbitRadius;
        const y = Math.sin(elevationRad) * this.orbitRadius;
        const z = Math.cos(elevationRad) * Math.cos(azimuthRad) * this.orbitRadius;
        
        return new THREE.Vector3(x, y, z);
    }

    public update() {
        // Calculate real solar position based on current date and time
        const solarPosition = this.calculateSolarPosition();
        const sunPosition = this.solarAnglesToPosition(solarPosition.azimuth, solarPosition.elevation);
        
        // Log solar position every 60 frames (approximately once per second at 60fps)
        if (Math.floor(Date.now() / 1000) % 10 === 0 && Math.random() < 0.1) {
            console.log(`Solar Position - Azimuth: ${solarPosition.azimuth.toFixed(1)}°, Elevation: ${solarPosition.elevation.toFixed(1)}°, Is Day: ${solarPosition.elevation > 0}`);
            console.log(`Sun Position: (${sunPosition.x.toFixed(2)}, ${sunPosition.y.toFixed(2)}, ${sunPosition.z.toFixed(2)})`);
            console.log(`Light Intensity: ${this.light.intensity.toFixed(2)}`);
            console.log(`Location: ${this.latitude}°N, ${this.longitude}°E, Timezone: UTC+${this.timezone}`);
        }
        
        this.lastSolarInfo = {
            azimuth: solarPosition.azimuth,
            elevation: solarPosition.elevation,
            isDay: solarPosition.elevation > 0
        };
        
        // Update light position
        this.light.position.copy(sunPosition);
        
        // Update the visual sun position to match the light
        this.sunMesh.position.copy(sunPosition);
        
        // Update light direction to always point towards the center
        this.light.target.position.set(0, 0, 0);
        this.light.target.updateMatrixWorld();
        
        // Adjust light intensity based on elevation (much brighter for better lighting)
        const intensity = Math.max(0.3, Math.sin(solarPosition.elevation * Math.PI / 180));
        this.light.intensity = intensity;
        
        // Add significant ambient light boost during daytime
        if (solarPosition.elevation > 0) {
            this.light.intensity = Math.max(1.5, intensity * 2); // Much brighter during day
        } else {
            this.light.intensity = Math.max(0.1, intensity); // Dimmer at night
        }
        
        // Adjust light color based on elevation (warmer colors at sunrise/sunset)
        if (solarPosition.elevation < 10) {
            // Sunrise/sunset colors
            const warmness = Math.max(0, (10 - solarPosition.elevation) / 10);
            this.light.color.setHex(0xffffff).lerp(new THREE.Color(0xff6600), warmness * 0.3);
        } else {
            // Daytime white light
            this.light.color.setHex(0xffffff);
        }
    }

    public getLight(): THREE.DirectionalLight {
        return this.light;
    }

    public getSunMesh(): THREE.Mesh {
        return this.sunMesh;
    }

    /**
     * Get current solar position information
     */
    public getSolarInfo(): { azimuth: number, elevation: number, isDay: boolean } {
        if (this.lastSolarInfo) {
            return { ...this.lastSolarInfo };
        }
        
        const solarPosition = this.calculateSolarPosition();
        this.lastSolarInfo = {
            azimuth: solarPosition.azimuth,
            elevation: solarPosition.elevation,
            isDay: solarPosition.elevation > 0
        };
        
        return { ...this.lastSolarInfo };
    }

    /**
     * Set location for solar calculations
     */
    public setLocation(latitude: number, longitude: number, timezone: number): void {
        this.latitude = latitude;
        this.longitude = longitude;
        this.timezone = timezone;
        this.lastSolarInfo = null;
        console.log(`Sun location updated: Lat ${latitude}°, Lon ${longitude}°, Timezone UTC+${timezone}`);
    }

    /**
     * Set custom date and time for solar calculations
     */
    public setCustomDateTime(dateTime: Date): void {
        this.customDateTime = new Date(dateTime);
        this.lastSolarInfo = null;
        console.log(`Sun time set to: ${this.customDateTime.toLocaleString()}`);
    }

    /**
     * Reset to current real time
     */
    public resetToCurrentTime(): void {
        this.customDateTime = null;
        this.lastSolarInfo = null;
        console.log('Sun time reset to current time');
    }

    /**
     * Force sun to a specific position for testing
     */
    public setSunPosition(azimuth: number, elevation: number): void {
        const sunPosition = this.solarAnglesToPosition(azimuth, elevation);
        
        // Update light position
        this.light.position.copy(sunPosition);
        this.sunMesh.position.copy(sunPosition);
        
        // Update light direction
        this.light.target.position.set(0, 0, 0);
        this.light.target.updateMatrixWorld();
        
        // Set appropriate intensity (much brighter for high elevations)
        const intensity = Math.max(0.5, Math.sin(elevation * Math.PI / 180));
        if (elevation > 45) {
            this.light.intensity = Math.max(2.0, intensity * 2.5); // Very bright for high sun
        } else {
            this.light.intensity = intensity;
        }
        
        this.lastSolarInfo = {
            azimuth,
            elevation,
            isDay: elevation > 0
        };
        
        console.log(`Sun forced to position: Azimuth ${azimuth}°, Elevation ${elevation}°`);
        console.log(`Sun Position: (${sunPosition.x.toFixed(2)}, ${sunPosition.y.toFixed(2)}, ${sunPosition.z.toFixed(2)})`);
    }

    /**
     * Set sun to perfect noon position (directly overhead)
     */
    public setToNoon(): void {
        // For noon: azimuth 180° (south), elevation should be very high for maximum lighting
        const noonElevation = Math.max(75, 90 - this.latitude + 23.45); // Higher elevation for better lighting
        this.setSunPosition(180, noonElevation);
        console.log(`Sun set to noon: Elevation ${noonElevation.toFixed(1)}°`);
    }

    /**
     * Force maximum brightness for testing
     */
    public setMaximumBrightness(): void {
        this.light.intensity = 3.0; // Maximum brightness
        this.light.color.setHex(0xffffff); // Pure white
        console.log('Sun set to maximum brightness');
    }

    /**
     * Test method to get current solar information
     */
    public logCurrentSolarInfo(): void {
        const solarInfo = this.getSolarInfo();
        const now = new Date();
        console.log(`=== Solar Information for ${now.toLocaleString()} ===`);
        console.log(`Location: ${this.latitude}°N, ${this.longitude}°E (UTC+${this.timezone})`);
        console.log(`Azimuth: ${solarInfo.azimuth.toFixed(1)}°`);
        console.log(`Elevation: ${solarInfo.elevation.toFixed(1)}°`);
        console.log(`Is Day: ${solarInfo.isDay}`);
        console.log(`Sun Position: (${this.sunMesh.position.x.toFixed(2)}, ${this.sunMesh.position.y.toFixed(2)}, ${this.sunMesh.position.z.toFixed(2)})`);
        console.log(`Light Intensity: ${this.light.intensity.toFixed(2)}`);
        console.log('=====================================');
    }
}
