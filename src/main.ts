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

function main() {
    // Slideshow
    const slideshow = new Slideshow();

    // Controls
    const controls = new Controls();
    controls.registerPreviousButton(() => slideshow.previousSlide());
    controls.registerNextButton(() => slideshow.nextSlide());

    // Time Picker
    const timePicker = new TimePicker();

    // Fog Slider
    const fogSlider = new FogSlider();

    // Cloud Control
    const cloudControl = new CloudControl();

    // Lantern Control
    const lanternControl = new LanternControl();

    // Tour Control
    const tourControl = new TourControl();
    tourControl.setTours(tours);

    // Tour Animator
    const tourAnimator = new TourAnimator();

    // Copy Settings Control
    const copySettingsControl = new CopySettingsControl();

    // Fullscreen Control
    const fullscreenControl = new FullscreenControl();

    // Stats
    const stats = new Stats();
	stats.showPanel(0);
    document.getElementById("stats-panel")?.appendChild(stats.dom)

    // Scene
    // Create the Three.js scene, camera, and renderer
    const scene = new THREE.Scene();
    // Set far plane to accommodate the large skybox (3x table size + buffer)
    const distance = getReferenceDistance();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, distance * 5);
    const renderer = new THREE.WebGLRenderer({
        antialias: false,
        powerPreference: "high-performance",
    });

    // Set up the renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    document.getElementById('app')!.appendChild(renderer.domElement);

    console.log(`Camera far plane set to: ${(distance * 5).toFixed(2)}m`);

    // Create our custom scene class
    const customScene = new Scene(scene, camera, renderer);

    // Coordinates Display
    const coordinatesDisplay = new CoordinatesDisplay(camera);

    // Set up copy settings control handlers
    copySettingsControl.setHandlers(
        camera,
        customScene,
        timePicker,
        fogSlider,
        cloudControl,
        lanternControl
    );

    // Connect time picker to controls and sun
    controls.registerTimePickerButton(() => {
        timePicker.show();
    });

    // Connect fog slider to controls
    controls.registerFogControlButton(() => {
        fogSlider.show();
    });

    // Connect cloud control to controls
    controls.registerCloudControlButton(() => {
        cloudControl.show();
    });

    // Connect lantern control to controls
    controls.registerLanternControlButton(() => {
        lanternControl.show();
    });

    // Connect tour control to controls
    controls.registerTourControlButton(() => {
        tourControl.show();
    });

    // Handle time picker changes
    timePicker.onTimeChange((time: number) => {
        const sun = customScene.getSun();
        const clocks = customScene.getClocks();

        // Create a date with the selected time (using current date)
        const now = new Date();
        const hours = Math.floor(time);
        const minutes = Math.floor((time - hours) * 60);
        const customDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
        
        // Apply the custom time to the sun
        sun.setCustomDateTime(customDate);
        clocks.setCustomDateTime(customDate);


        
        console.log(`Sun time set to: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    });

    // Handle fog slider changes
    fogSlider.onDensityChange((density: number) => {
        const fog = customScene.getFog();
        fog.setDensity(density);
        console.log(`Fog density set to: ${density.toFixed(4)}`);
    });

    // Handle cloud control changes
    cloudControl.onSpeedChange((speed: number) => {
        const clouds = customScene.getClouds();
        clouds.setMovementSpeed(speed);
        console.log(`Cloud movement speed set to: ${speed.toFixed(5)}`);
    });

    cloudControl.onAmountChange((amount: number) => {
        const clouds = customScene.getClouds();
        clouds.setCloudAmount(amount);
        console.log(`Cloud amount set to: ${(amount * 100).toFixed(0)}%`);
    });

    // Handle lantern control changes
    lanternControl.onWarmthChange((warmth: number) => {
        const lanterns = customScene.getLanterns();
        lanterns.setWarmth(warmth);
        console.log(`Lantern warmth set to: ${(warmth * 100).toFixed(0)}%`);
    });

    lanternControl.onIntensityChange((intensity: number) => {
        const lanterns = customScene.getLanterns();
        lanterns.setIntensity(intensity);
        console.log(`Lantern intensity set to: ${intensity.toFixed(1)}`);
    });

    lanternControl.onEnableChange((enabled: boolean) => {
        const lanterns = customScene.getLanterns();
        lanterns.setEnabled(enabled);
        console.log(`Lantern lighting ${enabled ? 'enabled' : 'disabled'}`);
    });

    // Handle tour selection
    tourControl.onTourSelect(async (tour: Tour) => {
        console.log(`Starting tour: ${tour.name}`);
        
        const camera = customScene.getCamera();
        
        // Animate through all parameters sequentially
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

    // Expose scene globally for testing
    (window as any).scene = customScene;
    (window as any).sun = customScene.getSun();
    (window as any).timePicker = timePicker;
    (window as any).fullscreenControl = fullscreenControl;
    
    // Test: Force sun to noon position for better lighting
    setTimeout(() => {
        const sun = customScene.getSun();
        sun.setToNoon(); // Use the new noon method
        sun.setMaximumBrightness(); // Force maximum brightness
        console.log('Sun forced to noon position with maximum brightness');
        
        // Also test with real solar calculation at noon
        const noonDate = new Date();
        noonDate.setHours(12, 0, 0, 0);
        sun.setCustomDateTime(noonDate);
        console.log('Sun also set to real noon time');
    }, 2000);

    // Animation loop
    function animate() {
        stats.begin();
        requestAnimationFrame(animate);
        customScene.animate();
        coordinatesDisplay.update();
        renderer.render(scene, camera);
        stats.end();
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // We are finished with the setup, remove the loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.remove();
    }

    // Start the animation loop
    animate();
}


// Initialize the slideshow when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add a small delay to ensure window dimensions are stable
    setTimeout(() => {
        main();
    }, 100);
});