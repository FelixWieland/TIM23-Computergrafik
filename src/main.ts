import { Scene } from './scene.ts'
import * as THREE from 'three';

import { Slideshow } from './slides.ts';
import { Controls } from './controls.ts';
import { TimePicker } from './controls/time-picker.ts';
import { FogSlider } from './controls/fog-slider.ts';
import { CloudControl } from './controls/cloud-control.ts';
import { LanternControl } from './controls/lantern-control.ts';
import { FullscreenControl } from './controls/fullscreen-control.ts';
import { CoordinatesDisplay } from './controls/coordinates-display.ts';
import { TourControl } from './controls/tour-control.ts';
import { Tour } from './tours/tour';
import { tours } from './tours/tours';
import { TourAnimator } from './tours/tour-animator';
import { CopySettingsControl } from './controls/copy-settings-control';

import { getReferenceDistance } from './util';
import Stats from 'three/examples/jsm/libs/stats.module.js';

/**
 * Sets up and starts the 3D visualization application.
 * Initializes the scene, camera, renderer, controls, and all interactive elements.
 * This includes slideshow navigation, time controls, fog, clouds, lanterns, and tours.
 */
function main() {
    const slideshow = new Slideshow();

    const controls = new Controls();
    controls.registerPreviousButton(() => slideshow.previousSlide());
    controls.registerNextButton(() => slideshow.nextSlide());

    const timePicker = new TimePicker();

    const fogSlider = new FogSlider();

    const cloudControl = new CloudControl();

    const lanternControl = new LanternControl();

    const tourControl = new TourControl(tours);

    const tourAnimator = new TourAnimator();
    const copySettingsControl = new CopySettingsControl();
    const fullscreenControl = new FullscreenControl();

    const stats = new Stats();
	stats.showPanel(0);
    document.getElementById("stats-panel")?.appendChild(stats.dom)

    const scene = new THREE.Scene();
    const distance = getReferenceDistance();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, distance * 5);
    const renderer = new THREE.WebGLRenderer({
        antialias: false,
        powerPreference: "high-performance",
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    document.getElementById('app')!.appendChild(renderer.domElement);

    const customScene = new Scene(scene, camera, renderer);
    customScene.setTourAnimator(tourAnimator);

    const coordinatesDisplay = new CoordinatesDisplay(camera);
    copySettingsControl.setHandlers(
        camera,
        customScene,
        timePicker,
        fogSlider,
        cloudControl,
        lanternControl
    );

    controls.registerTimePickerButton(() => {
        timePicker.show();
    });
    controls.registerFogControlButton(() => {
        fogSlider.show();
    });
    controls.registerCloudControlButton(() => {
        cloudControl.show();
    });
    controls.registerLanternControlButton(() => {
        lanternControl.show();
    });
    controls.registerTourControlButton(() => {
        tourControl.show();
    });
    timePicker.onTimeChange((time: number) => {
        const sun = customScene.getSun();
        const clocks = customScene.getClocks();
        const now = new Date();
        const hours = Math.floor(time);
        const minutes = Math.floor((time - hours) * 60);
        const customDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
        sun.setCustomDateTime(customDate);
        clocks.setCustomDateTime(customDate);
    });
    fogSlider.onDensityChange((density: number) => {
        const fog = customScene.getFog();
        fog.setDensity(density);
    });
    cloudControl.onSpeedChange((speed: number) => {
        const clouds = customScene.getClouds();
        clouds.setMovementSpeed(speed);
    });
    cloudControl.onAmountChange((amount: number) => {
        const clouds = customScene.getClouds();
        clouds.setCloudAmount(amount);
    });
    lanternControl.onWarmthChange((warmth: number) => {
        const lanterns = customScene.getLanterns();
        lanterns.setWarmth(warmth);
    });
    lanternControl.onIntensityChange((intensity: number) => {
        const lanterns = customScene.getLanterns();
        lanterns.setIntensity(intensity);
    });
    lanternControl.onEnableChange((enabled: boolean) => {
        const lanterns = customScene.getLanterns();
        lanterns.setEnabled(enabled);
    });
    tourControl.onTourSelect(async (tour: Tour) => {
        console.log(`Starting tour: ${tour.name}`);
        const camera = customScene.getCamera();
        for (const parameter of tour.parameters) {
            await tourAnimator.animateTourParameter(
                parameter,
                camera,
                customScene,
                timePicker,
                fogSlider,
                cloudControl,
                lanternControl
            );
        }
        console.log(`Tour completed: ${tour.name}`);
    });

    (window as any).scene = customScene;
    (window as any).sun = customScene.getSun();
    (window as any).timePicker = timePicker;
    (window as any).fullscreenControl = fullscreenControl;
    
    /**
     * Main animation loop that updates and renders the scene every frame.
     * Updates performance stats, scene animations, camera position display, and renders the final frame.
     */
    function animate() {
        stats.begin();
        requestAnimationFrame(animate);
        customScene.animate();
        coordinatesDisplay.update();
        renderer.render(scene, camera);
        stats.end();
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
}


document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        main();
    }, 100);
});