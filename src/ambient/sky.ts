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
        this.sky = new ThreeSky();
        const distance = getReferenceDistance();
        this.sky.scale.setScalar(distance * 3);

        this.scene.add(this.sky);

        this.skySun = new THREE.Vector3();

        const uniforms = this.sky.material.uniforms;
        uniforms['turbidity'].value = 10;
        uniforms['rayleigh'].value = 3;
        uniforms['mieCoefficient'].value = 0.005;
        uniforms['mieDirectionalG'].value = 0.7;

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
        const sunPosition = this.sun.getSunMesh().position;
        
        this.skySun.copy(sunPosition).normalize();
        
        const uniforms = this.sky.material.uniforms;
        uniforms['sunPosition'].value.copy(this.skySun);
        
        const solarInfo = this.sun.getSolarInfo();
        const elevation = solarInfo.elevation;
        
        if (elevation < 0) {
            const nightFactor = Math.min(1, Math.abs(elevation) / 30);
            uniforms['turbidity'].value = 10 + (nightFactor * 20);
            uniforms['rayleigh'].value = 3 * (1 - nightFactor * 0.8);
            uniforms['mieCoefficient'].value = 0.005 * (1 - nightFactor * 0.5);
        } else {
            uniforms['turbidity'].value = 10;
            uniforms['rayleigh'].value = 3;
            uniforms['mieCoefficient'].value = 0.005;
        }
    }
}