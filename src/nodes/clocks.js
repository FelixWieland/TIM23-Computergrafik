import { Vector3 } from "three";
import { Clock } from "./clock";

/**
 * Manages multiple clock instances placed throughout the scene.
 * All clocks stay synchronized and can be set to a custom time together.
 */
export class Clocks {
    scene;
    clocks = [];

    /**
     * Creates all clocks and positions them at their locations in the scene.
     * @param scene The Three.js scene to add clocks to
     */
    constructor(scene) {
        this.scene = scene;
        this.setup();
    }

    /**
     * Creates and positions all clock instances at their specific locations.
     */
    setup() {
        this.clocks.push(new Clock(this.scene, new Vector3(39.2, 45.5, 57.6), 170, 3));
        this.clocks.push(new Clock(this.scene, new Vector3(31.65, 45.5, 64.09), 82, 3));
        this.clocks.push(new Clock(this.scene, new Vector3(33.65, 45.5, 49.09), 262, 3));
        this.clocks.push(new Clock(this.scene, new Vector3(-335.90, 15.2, -21.3), -11, 1));
        this.clocks.push(new Clock(this.scene, new Vector3(-323.1, 15.2, -18.6), 169, 1));
    }

    /**
     * Sets all clocks to display a specific time.
     * @param date The date and time to display on all clocks
     */
    setCustomDateTime(date) {
        for (const clock of this.clocks) {
            clock.setCustomDateTime(date);
        }
    }
    
    /**
     * Updates all clock hands to show the current time.
     * Called every frame to keep the clocks moving.
     */
    animate() {
        for (const clock of this.clocks) {
            clock.animate();
        }
    }
}
