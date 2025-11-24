import * as THREE from 'three';
import { getReferenceDistance } from '../util';

/**
 * Manages the sun's position and lighting based on real-world solar calculations.
 * Simulates accurate sun movement across the sky using geographic location and time.
 * The sun automatically adjusts its color and intensity throughout the day for realistic lighting.
 */
export class Sun {
    light;
    sunMesh;
    scene;
    orbitRadius;
    latitude = 52.5;
    longitude = 13.4;
    timezone = 1;
    customDateTime = null;
    lastSolarInfo = null;

    /**
     * Creates a new sun system with accurate solar positioning.
     * @param scene The Three.js scene to add the sun to
     * @param latitude Geographic latitude in degrees (defaults to 52.5 for Berlin)
     * @param longitude Geographic longitude in degrees (defaults to 13.4 for Berlin)
     * @param timezone Timezone offset from UTC in hours (defaults to 1 for CET)
     */
    constructor(scene, latitude, longitude, timezone) {
        this.scene = scene;
        if (latitude !== undefined)
            this.latitude = latitude;
        if (longitude !== undefined)
            this.longitude = longitude;
        if (timezone !== undefined)
            this.timezone = timezone;
        this.createSun();
    }

    /**
     * Creates the sun light source and visual sun mesh.
     * Sets up directional lighting with shadows and positions the sun in the sky.
     */
    createSun() {
        const distance = getReferenceDistance();
        this.orbitRadius = distance * 2;
        this.light = new THREE.DirectionalLight(0xffffff, 2.0); // Increased initial intensity
        this.light.position.set(this.orbitRadius, this.orbitRadius * 0.5, this.orbitRadius);
        this.light.castShadow = true;
        this.light.intensity = 2.0;
        this.light.shadow.mapSize.width = 2048;
        this.light.shadow.mapSize.height = 2048;
        this.light.shadow.camera.near = 0.5;
        this.light.shadow.camera.far = distance * 6;
        this.light.shadow.camera.left = -distance * 2;
        this.light.shadow.camera.right = distance * 2;
        this.light.shadow.camera.top = distance * 2;
        this.light.shadow.camera.bottom = -distance * 2;
        const sunSize = distance * 0.03 * 0;
        const sunGeometry = new THREE.SphereGeometry(sunSize, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00 // Bright yellow
        });
        this.sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
        this.sunMesh.position.copy(this.light.position);
        this.scene.add(this.light);
        this.scene.add(this.sunMesh);
    }

    /**
     * Calculates the sun's position in the sky using astronomical formulas.
     * Takes into account the date, time, location, and equation of time for accurate positioning.
     * @return Object containing azimuth (compass direction) and elevation (height above horizon) in degrees
     */
    calculateSolarPosition() {
        const now = this.customDateTime || new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const B = (dayOfYear - 81) * 2 * Math.PI / 365;
        const equationOfTime = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
        const localStandardTime = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
        const longitudeCorrection = (this.longitude - (this.timezone * 15)) / 15; // 15 degrees per hour
        const solarTime = localStandardTime + longitudeCorrection + equationOfTime / 60;
        const hourAngle = 15 * (solarTime - 12); // degrees
        const declination = 23.45 * Math.sin((284 + dayOfYear) * 2 * Math.PI / 365);
        const latRad = this.latitude * Math.PI / 180;
        const hourAngleRad = hourAngle * Math.PI / 180;
        const declinationRad = declination * Math.PI / 180;
        const elevationRad = Math.asin(Math.sin(latRad) * Math.sin(declinationRad) +
            Math.cos(latRad) * Math.cos(declinationRad) * Math.cos(hourAngleRad));
        const azimuthRad = Math.atan2(Math.sin(hourAngleRad), Math.cos(hourAngleRad) * Math.sin(latRad) - Math.tan(declinationRad) * Math.cos(latRad));
        let azimuth = azimuthRad * 180 / Math.PI;
        if (azimuth < 0)
            azimuth += 360;
        return {
            azimuth: azimuth,
            elevation: elevationRad * 180 / Math.PI
        };
    }

    /**
     * Converts solar angles (azimuth and elevation) to a 3D position in the scene.
     * @param azimuth The compass direction in degrees (0 = north, 90 = east, 180 = south, 270 = west)
     * @param elevation The height above horizon in degrees (0 = horizon, 90 = directly overhead)
     * @return The 3D position where the sun should be placed
     */
    solarAnglesToPosition(azimuth, elevation) {
        const azimuthRad = azimuth * Math.PI / 180;
        const elevationRad = elevation * Math.PI / 180;
        const x = Math.cos(elevationRad) * Math.sin(azimuthRad) * this.orbitRadius;
        const y = Math.sin(elevationRad) * this.orbitRadius;
        const z = Math.cos(elevationRad) * Math.cos(azimuthRad) * this.orbitRadius;
        return new THREE.Vector3(x, y, z);
    }

    /**
     * Updates the sun's position and lighting for the current frame.
     * Recalculates solar position, adjusts light intensity, and changes color for sunrise/sunset effects.
     * Called every frame to keep the sun moving realistically across the sky.
     */
    update() {
        const solarPosition = this.calculateSolarPosition();
        const sunPosition = this.solarAnglesToPosition(solarPosition.azimuth, solarPosition.elevation);
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
        }
        else {
            this.light.intensity = Math.max(0.1, intensity); // Dimmer at night
        }
        // Adjust light color based on elevation (warmer colors at sunrise/sunset)
        if (solarPosition.elevation < 10) {
            // Sunrise/sunset colors
            const warmness = Math.max(0, (10 - solarPosition.elevation) / 10);
            this.light.color.setHex(0xffffff).lerp(new THREE.Color(0xff6600), warmness * 0.3);
        }
        else {
            // Daytime white light
            this.light.color.setHex(0xffffff);
        }
    }

    /**
     * Gets the directional light that represents the sun's illumination.
     * @return The Three.js directional light used for sun lighting
     */
    getLight() {
        return this.light;
    }

    /**
     * Gets the visual mesh that represents the sun in the sky.
     * @return The Three.js mesh that shows where the sun is
     */
    getSunMesh() {
        return this.sunMesh;
    }

    /**
     * Gets the current solar position information including whether it's daytime.
     * @return Object with azimuth, elevation angles in degrees, and daytime flag
     */
    getSolarInfo() {
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
     * Changes the geographic location used for solar position calculations.
     * @param latitude Geographic latitude in degrees (positive = north, negative = south)
     * @param longitude Geographic longitude in degrees (positive = east, negative = west)
     * @param timezone Timezone offset from UTC in hours
     */
    setLocation(latitude, longitude, timezone) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.timezone = timezone;
        this.lastSolarInfo = null;
        console.log(`Sun location updated: Lat ${latitude}°, Lon ${longitude}°, Timezone UTC+${timezone}`);
    }

    /**
     * Sets a custom date and time instead of using the current real time.
     * Useful for showing how the sun moves at different times of day or year.
     * @param dateTime The date and time to use for solar calculations
     */
    setCustomDateTime(dateTime) {
        this.customDateTime = new Date(dateTime);
        this.lastSolarInfo = null;
        console.log(`Sun time set to: ${this.customDateTime.toLocaleString()}`);
    }

    /**
     * Stops using custom time and returns to using the current real time.
     */
    resetToCurrentTime() {
        this.customDateTime = null;
        this.lastSolarInfo = null;
        console.log('Sun time reset to current time');
    }

    /**
     * Manually positions the sun at specific angles, bypassing solar calculations.
     * Useful for testing or creating specific lighting scenarios.
     * @param azimuth The compass direction in degrees
     * @param elevation The height above horizon in degrees
     */
    setSunPosition(azimuth, elevation) {
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
        }
        else {
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
     * Positions the sun at high noon with maximum brightness.
     * Places sun high in the southern sky for strong overhead lighting.
     */
    setToNoon() {
        // For noon: azimuth 180° (south), elevation should be very high for maximum lighting
        const noonElevation = Math.max(75, 90 - this.latitude + 23.45); // Higher elevation for better lighting
        this.setSunPosition(180, noonElevation);
        console.log(`Sun set to noon: Elevation ${noonElevation.toFixed(1)}°`);
    }

    /**
     * Sets the sun to maximum brightness for testing or demonstration purposes.
     */
    setMaximumBrightness() {
        this.light.intensity = 3.0; // Maximum brightness
        this.light.color.setHex(0xffffff); // Pure white
        console.log('Sun set to maximum brightness');
    }
    
    /**
     * Prints detailed information about the current sun position to the console.
     * Useful for debugging or understanding current solar conditions.
     */
    logCurrentSolarInfo() {
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
