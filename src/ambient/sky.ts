import * as THREE from 'three';
import { Scene } from 'three'
import { Sky as ThreeSky } from 'three/examples/jsm/objects/Sky.js';
import { getReferenceDistance } from '../util';
import type { Sun } from './sun';

export class Sky {
    scene: Scene
    sky!: ThreeSky
    skySun!: THREE.Vector3;
    sun: Sun;

    public constructor(scene: Scene, sun: Sun) {
        this.scene = scene;
        this.sun = sun;
        this.setup()
    }

    public setup() {
        // Create realistic sky shader
        this.sky = new ThreeSky();
        // Scale the sky to be large enough for our world
        const distance = getReferenceDistance();
        this.sky.scale.setScalar(distance * 3); // 3 times the table size

        this.scene.add(this.sky);

        // Create sun vector for sky shader
        this.skySun = new THREE.Vector3();

        // Configure sky parameters for realistic appearance
        const uniforms = this.sky.material.uniforms;
        uniforms['turbidity'].value = 10;
        uniforms['rayleigh'].value = 3;
        uniforms['mieCoefficient'].value = 0.005;
        uniforms['mieDirectionalG'].value = 0.7;

        // Set initial sun position (elevation: 45 degrees, azimuth: 180 degrees)
        const elevation = 45; // degrees
        const azimuth = 180; // degrees

        const phi = THREE.MathUtils.degToRad(90 - elevation);
        const theta = THREE.MathUtils.degToRad(azimuth);

        this.skySun.setFromSphericalCoords(1, phi, theta);
        uniforms['sunPosition'].value.copy(this.skySun);

        console.log(`Sky created with scale: ${(distance * 3).toFixed(2)}m`);
        console.log(`Sun position: (${this.skySun.x.toFixed(3)}, ${this.skySun.y.toFixed(3)}, ${this.skySun.z.toFixed(3)})`);
    }

    public animate() {
        
        // Get the sun's position from our Sun class
        const sunPosition = this.sun.getSunMesh().position;
        
        // Normalize the sun position for the sky shader
        this.skySun.copy(sunPosition).normalize();
        
        // Update the sky shader's sun position
        const uniforms = this.sky.material.uniforms;
        uniforms['sunPosition'].value.copy(this.skySun);
        
        // Get solar info to determine if it's day or night
        const solarInfo = this.sun.getSolarInfo();
        const elevation = solarInfo.elevation;
        
        // Adjust sky darkness based on time of day
        // When elevation is negative (night), make the sky darker
        if (elevation < 0) {
            // Night time: make sky darker
            // Use a smooth transition from day to night
            const nightFactor = Math.min(1, Math.abs(elevation) / 30); // Full darkness at -30 degrees
            
            // Increase turbidity (makes sky darker/more hazy)
            uniforms['turbidity'].value = 10 + (nightFactor * 20); // Range from 10 to 30
            
            // Decrease rayleigh scattering (reduces blue sky effect)
            uniforms['rayleigh'].value = 3 * (1 - nightFactor * 0.8); // Range from 3 to 0.6
            
            // Reduce mie scattering
            uniforms['mieCoefficient'].value = 0.005 * (1 - nightFactor * 0.5);
        } else {
            // Day time: use normal sky parameters
            uniforms['turbidity'].value = 10;
            uniforms['rayleigh'].value = 3;
            uniforms['mieCoefficient'].value = 0.005;
        }
    }
}