import { Group, Vector3, type Scene } from "three";
import type { GLTF } from "three/examples/jsm/Addons.js";
import { Gltf } from "./gltf";

export class Clock {
    scene: Scene;
    position: Vector3;
    rotationY: number;
    scale: number;
    customDate: Date;

    clockGroup: Group | null = null;
    clockGltf: Gltf;
    minutehandGltf: Gltf;
    hourhandGltf: Gltf;
    minuteHandMesh: Group | null = null;
    hourHandMesh: Group | null = null;

    public constructor(scene: Scene, position: Vector3, rotationY: number = 180, scale: number = 1) {
        this.clockGltf = new Gltf("/models/UhrBasis.optim.glb");
        this.minutehandGltf = new Gltf("/models/Minutenzeiger.optim.glb");
        this.hourhandGltf = new Gltf("/models/Stundenzeiger.optim.glb");
        this.customDate = new Date();
        
        this.scene = scene;
        this.position = position;
        this.rotationY = rotationY;
        this.scale = scale;

        const gltfs = Promise.all([
            this.clockGltf.getGltf(), 
            this.minutehandGltf.getGltf(), 
            this.hourhandGltf.getGltf()
        ]);
        gltfs.then(this.setup.bind(this))
    }

    public setup([clockGltf, minutehandGltf, hourhandGltf]: [GLTF, GLTF, GLTF]) {
        this.clockGroup = new Group();
        this.clockGroup.add(clockGltf.scene);
        this.clockGroup.add(minutehandGltf.scene);
        this.clockGroup.add(hourhandGltf.scene);

        this.minuteHandMesh = minutehandGltf.scene;
        this.hourHandMesh = hourhandGltf.scene;

        this.clockGroup.position.copy(this.position);
        this.clockGroup.rotation.set(0, this.rotationY * Math.PI / 180, 90 * Math.PI / 180);
        this.clockGroup.scale.set(this.scale, 7, this.scale);

        this.scene.add(this.clockGroup);
    }

    public setCustomDateTime(date: Date) {
        this.customDate = date;
    }

    public animate() {
        if (this.clockGroup === null || this.minuteHandMesh === null || this.hourHandMesh === null) return;
 
        const hours = this.customDate.getHours() + 3;
        const minutes = this.customDate.getMinutes() +15;
        const seconds = this.customDate.getSeconds();

        // Calculate rotation angles in radians
        // Hour hand: 12 hours = 360 degrees, so 1 hour = 30 degrees
        // Also account for minutes: each minute adds 0.5 degrees (30/60)
        // Also account for seconds: each second adds 0.0083 degrees (30/3600)
        const hourAngle = ((hours % 12) * 30 + minutes * 0.5 + seconds * 0.0083) * Math.PI / 180;
        
        // Minute hand: 60 minutes = 360 degrees, so 1 minute = 6 degrees
        // Also account for seconds: each second adds 0.1 degrees (6/60)
        const minuteAngle = (minutes * 6 + seconds * 0.1) * Math.PI / 180;

        // Rotate hands around Z-axis (clockwise, so negative)
        // The clock is rotated 90 degrees on Z, so hands rotate on Z-axis
        this.hourHandMesh.rotation.y = -hourAngle;
        this.minuteHandMesh.rotation.y = -minuteAngle;
    }
}