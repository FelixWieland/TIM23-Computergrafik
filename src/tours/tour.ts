import * as THREE from 'three';

/**
 * Defines a single step in a tour with camera position, rotation, and scene settings.
 * Each parameter can animate smoothly from the previous state to the new values.
 */
export interface TourParameter {
    position?: THREE.Vector3;
    cameraRotation?: {
        pitch: number;
        yaw: number;
    };
    cloudMovementSpeed?: number;
    cloudAmount?: number;
    colorWarmth?: number;
    colorIntensity?: number;
    fogValue?: number;
    dateTime?: Date;
    duration: number; // in ms
}

/**
 * Represents a guided tour through the scene with multiple animated steps.
 * Tours smoothly animate the camera and scene settings to show interesting views.
 */
export class Tour {
    public name: string;
    public description: string;
    public parameters: TourParameter[];

    /**
     * Creates a new tour with a name, description, and sequence of animated steps.
     * @param name The tour name displayed to users
     * @param description Brief description of what the tour shows
     * @param parameters Array of tour steps to animate through in sequence
     */
    constructor(name: string, description: string, parameters: TourParameter[]) {
        this.name = name;
        this.description = description;
        this.parameters = parameters;
    }
}

