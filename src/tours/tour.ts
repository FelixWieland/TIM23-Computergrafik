import * as THREE from 'three';

export interface TourParameter {
    position?: THREE.Vector3;
    cameraRotation?: {
        pitch: number; // in radians
        yaw: number;   // in radians
    };
    cloudMovementSpeed?: number;
    cloudAmount?: number;
    colorWarmth?: number;
    colorIntensity?: number;
    fogValue?: number;
    dateTime?: Date;
    duration: number; // in seconds - required for each parameter
}

export class Tour {
    public name: string;
    public description: string;
    public parameters: TourParameter[];

    constructor(name: string, description: string, parameters: TourParameter[]) {
        this.name = name;
        this.description = description;
        this.parameters = parameters;
    }
}

