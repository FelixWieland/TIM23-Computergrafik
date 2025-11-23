import * as THREE from 'three';

export interface CollisionResult {
    hasCollision: boolean;
    hitPoint?: THREE.Vector3;
    normal?: THREE.Vector3;
    distance?: number;
}

export class CollisionDetector {
    private scene: THREE.Scene;
    private raycaster: THREE.Raycaster;
    private collisionMeshes: THREE.Mesh[] = [];
    private collisionRadius: number;
    private meshCacheDirty: boolean = true;

    constructor(scene: THREE.Scene, collisionRadius: number = 0.5) {
        this.scene = scene;
        this.raycaster = new THREE.Raycaster();
        this.collisionRadius = collisionRadius;
    }

    /**
     * Collect all meshes from the scene that should be checked for collisions
     * Excludes lights, helpers, and other non-collidable objects
     */
    private collectCollisionMeshes(): void {
        this.collisionMeshes = [];
        
        this.scene.traverse((object) => {
            // Only include meshes
            if (object instanceof THREE.Mesh) {
                // Exclude certain object types (lights, helpers, etc.)
                // You can add more exclusions here if needed
                if (object.userData.skipCollision) {
                    return;
                }
                
                // Ensure the mesh has geometry
                if (object.geometry) {
                    this.collisionMeshes.push(object);
                }
            }
        });
        
        this.meshCacheDirty = false;
    }

    /**
     * Update the collision mesh cache if needed
     */
    private updateMeshCache(): void {
        if (this.meshCacheDirty) {
            this.collectCollisionMeshes();
        }
    }

    /**
     * Check if a proposed position would collide with any scene objects
     * @param fromPosition Starting position
     * @param toPosition Proposed position
     * @returns CollisionResult with collision information
     */
    public checkCollision(fromPosition: THREE.Vector3, toPosition: THREE.Vector3): CollisionResult {
        this.updateMeshCache();

        if (this.collisionMeshes.length === 0) {
            return { hasCollision: false };
        }

        // Calculate direction and distance
        const direction = new THREE.Vector3().subVectors(toPosition, fromPosition);
        const distance = direction.length();

        if (distance < 0.001) {
            return { hasCollision: false };
        }

        direction.normalize();

        // Cast ray from current position toward proposed position
        this.raycaster.set(fromPosition, direction);
        this.raycaster.far = distance + this.collisionRadius;

        const intersections = this.raycaster.intersectObjects(this.collisionMeshes, false);

        if (intersections.length > 0) {
            const closestIntersection = intersections[0];
            
            // Check if collision is within the movement distance (accounting for collision radius)
            if (closestIntersection.distance <= distance + this.collisionRadius) {
                return {
                    hasCollision: true,
                    hitPoint: closestIntersection.point.clone(),
                    normal: closestIntersection.face?.normal.clone(),
                    distance: closestIntersection.distance
                };
            }
        }

        // Also check if the destination position itself is inside any geometry
        // by casting a short ray in multiple directions
        const checkDirections = [
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, -1, 0),
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(0, 0, -1)
        ];

        for (const dir of checkDirections) {
            this.raycaster.set(toPosition, dir);
            this.raycaster.far = this.collisionRadius;
            const nearbyIntersections = this.raycaster.intersectObjects(this.collisionMeshes, false);
            
            if (nearbyIntersections.length > 0 && nearbyIntersections[0].distance < this.collisionRadius) {
                return {
                    hasCollision: true,
                    hitPoint: nearbyIntersections[0].point.clone(),
                    normal: nearbyIntersections[0].face?.normal.clone(),
                    distance: nearbyIntersections[0].distance
                };
            }
        }

        return { hasCollision: false };
    }

    /**
     * Check collision for a specific axis movement
     * @param currentPosition Current camera position
     * @param deltaMovement Movement delta for the axis (e.g., {x: 0, y: 0, z: -5})
     * @returns true if movement is allowed, false if blocked
     */
    public canMove(currentPosition: THREE.Vector3, deltaMovement: THREE.Vector3): boolean {
        const proposedPosition = currentPosition.clone().add(deltaMovement);
        const result = this.checkCollision(currentPosition, proposedPosition);
        return !result.hasCollision;
    }

    /**
     * Get the allowed movement along an axis, stopping at collision
     * @param currentPosition Current camera position
     * @param deltaMovement Desired movement delta
     * @returns Allowed movement delta (may be reduced if collision detected)
     */
    public getAllowedMovement(currentPosition: THREE.Vector3, deltaMovement: THREE.Vector3): THREE.Vector3 {
        const proposedPosition = currentPosition.clone().add(deltaMovement);
        const result = this.checkCollision(currentPosition, proposedPosition);

        if (!result.hasCollision) {
            return deltaMovement.clone();
        }

        // If collision detected, try to move as close as possible without colliding
        if (result.distance !== undefined && result.distance > this.collisionRadius) {
            const allowedDistance = result.distance - this.collisionRadius;
            const direction = deltaMovement.clone().normalize();
            return direction.multiplyScalar(allowedDistance);
        }

        // No movement allowed
        return new THREE.Vector3(0, 0, 0);
    }

    /**
     * Mark the mesh cache as dirty (call this when scene objects are added/removed)
     */
    public invalidateCache(): void {
        this.meshCacheDirty = true;
    }

    /**
     * Set the collision radius
     */
    public setCollisionRadius(radius: number): void {
        this.collisionRadius = radius;
    }

    /**
     * Get the collision radius
     */
    public getCollisionRadius(): number {
        return this.collisionRadius;
    }

    /**
     * Find the ground height below a given position
     * @param position Position to check from
     * @param maxDistance Maximum distance to check downward
     * @returns Ground height (Y coordinate) or null if no ground found
     */
    public getGroundHeight(position: THREE.Vector3, maxDistance: number = 10): number | null {
        this.updateMeshCache();

        if (this.collisionMeshes.length === 0) {
            return null;
        }

        // Cast ray downward to find ground
        const downDirection = new THREE.Vector3(0, -1, 0);
        this.raycaster.set(position, downDirection);
        this.raycaster.far = maxDistance;

        const intersections = this.raycaster.intersectObjects(this.collisionMeshes, false);

        if (intersections.length > 0) {
            return intersections[0].point.y;
        }

        return null;
    }
}

