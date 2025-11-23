import { type Scene, Vector3 } from "three";
import { Clock } from "./clock";

export class Clocks {
    scene: Scene;
    clocks: Clock[] = [];

    public constructor(scene: Scene) {
        this.scene = scene;
        this.setup();
    }

    public setup() {
        this.clocks.push(new Clock(this.scene, new Vector3(39.2, 45.5, 57.6), 170, 3));
        this.clocks.push(new Clock(this.scene, new Vector3(31.65, 45.5, 64.09), 82, 3));
        this.clocks.push(new Clock(this.scene, new Vector3(33.65, 45.5, 49.09), 262, 3));
        this.clocks.push(new Clock(this.scene, new Vector3(-335.90, 15.2, -21.3), -11, 1));
        this.clocks.push(new Clock(this.scene, new Vector3(-323.1, 15.2, -18.6), 169, 1));
    }

    public setCustomDateTime(date: Date) {
        for (const clock of this.clocks) {
            clock.setCustomDateTime(date);
        }
    }

    public animate() {
        for (const clock of this.clocks) {
            clock.animate();
        }
    }

}