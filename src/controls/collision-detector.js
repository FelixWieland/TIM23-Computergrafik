import * as THREE from 'three';

/**
 * Detects collisions between the player and scene objects to prevent walking through walls.
 * Uses raycasting to check if movement would cause collisions and finds ground height.
 */
export class CollisionDetector {
    scene;
    raycaster;
    collisionMeshes = [];
    collisionRadius;
    meshCacheDirty = true;

    /**
     * Creates a new collision detector for a scene.
     * @param scene The Three.js scene containing objects to check collisions with
     * @param collisionRadius How close the player can get to objects before colliding (in world units)
     */
    constructor(scene, collisionRadius = 0.5) {
        this.scene = scene;
        this.raycaster = new THREE.Raycaster();
        this.collisionRadius = collisionRadius;
    }

    /**
     * Scans the scene and collects all meshes that should be checked for collisions.
     * Meshes with `skipCollision` in userData are ignored.
     */
    collectCollisionMeshes() {
        this.collisionMeshes = [];
        this.scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                if (object.userData.skipCollision) {
                    return;
                }
                if (object.geometry) {
                    this.collisionMeshes.push(object);
                }
            }
        });
        this.meshCacheDirty = false;
    }

    /**
     * Updates the list of collision meshes if it has been marked as dirty.
     */
    updateMeshCache() {
        if (this.meshCacheDirty) {
            this.collectCollisionMeshes();
        }
    }

    /**
     * Checks if moving from one position to another would cause a collision.
     * Uses raycasting to detect obstacles along the path and near the destination.
     * @param fromPosition Starting position
     * @param toPosition Desired end position
     * @return Collision information including whether a collision occurred
     */
    checkCollision(fromPosition, toPosition) {
        this.updateMeshCache();
        if (this.collisionMeshes.length === 0) {
            return { hasCollision: false };
        }
        const direction = new THREE.Vector3().subVectors(toPosition, fromPosition);
        const distance = direction.length();
        if (distance < 0.001) {
            return { hasCollision: false };
        }
        direction.normalize();
        this.raycaster.set(fromPosition, direction);
        this.raycaster.far = distance + this.collisionRadius;
        const intersections = this.raycaster.intersectObjects(this.collisionMeshes, false);
        if (intersections.length > 0) {
            const closestIntersection = intersections[0];
            if (closestIntersection.distance <= distance + this.collisionRadius) {
                return {
                    hasCollision: true,
                    hitPoint: closestIntersection.point.clone(),
                    normal: closestIntersection.face?.normal.clone(),
                    distance: closestIntersection.distance
                };
            }
        }
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
     * Simple check if movement is possible without collisions.
     * @param currentPosition Current position
     * @param deltaMovement Movement vector to apply
     * @return True if movement is allowed, false if it would collide
     */
    canMove(currentPosition, deltaMovement) {
        const proposedPosition = currentPosition.clone().add(deltaMovement);
        const result = this.checkCollision(currentPosition, proposedPosition);
        return !result.hasCollision;
    }

    /**
     * Calculates how far the player can move before hitting an obstacle.
     * If full movement would collide, returns a reduced movement that stops before the collision.
     * @param currentPosition Current position
     * @param deltaMovement Desired movement vector
     * @return Actual allowed movement (may be less than requested if collision detected)
     */
    getAllowedMovement(currentPosition, deltaMovement) {
        const proposedPosition = currentPosition.clone().add(deltaMovement);
        const result = this.checkCollision(currentPosition, proposedPosition);
        if (!result.hasCollision) {
            return deltaMovement.clone();
        }
        if (result.distance !== undefined && result.distance > this.collisionRadius) {
            const allowedDistance = result.distance - this.collisionRadius;
            const direction = deltaMovement.clone().normalize();
            return direction.multiplyScalar(allowedDistance);
        }
        return new THREE.Vector3(0, 0, 0);
    }

    /**
     * Marks the mesh cache as dirty so it will be rebuilt on next use.
     * Call this when objects are added or removed from the scene.
     */
    invalidateCache() {
        this.meshCacheDirty = true;
    }

    /**
     * Changes how close the player can get to objects.
     * @param radius New collision radius in world units
     */
    setCollisionRadius(radius) {
        this.collisionRadius = radius;
    }

    /**
     * Gets the current collision radius.
     * @return The collision radius in world units
     */
    getCollisionRadius() {
        return this.collisionRadius;
    }
    
    /**
     * Finds the height of the ground below a position by casting a ray downward.
     * Used to keep the player standing on terrain.
     * @param position Position to check ground height at
     * @param maxDistance Maximum distance to search downward
     * @return Ground height (Y coordinate) or null if no ground found
     */
    getGroundHeight(position, maxDistance = 10) {
        this.updateMeshCache();
        if (this.collisionMeshes.length === 0) {
            return null;
        }
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
