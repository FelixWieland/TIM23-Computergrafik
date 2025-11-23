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

    private collectCollisionMeshes(): void {
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

    private updateMeshCache(): void {
        if (this.meshCacheDirty) {
            this.collectCollisionMeshes();
        }
    }

    public checkCollision(fromPosition: THREE.Vector3, toPosition: THREE.Vector3): CollisionResult {
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

    public canMove(currentPosition: THREE.Vector3, deltaMovement: THREE.Vector3): boolean {
        const proposedPosition = currentPosition.clone().add(deltaMovement);
        const result = this.checkCollision(currentPosition, proposedPosition);
        return !result.hasCollision;
    }

    public getAllowedMovement(currentPosition: THREE.Vector3, deltaMovement: THREE.Vector3): THREE.Vector3 {
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

    public invalidateCache(): void {
        this.meshCacheDirty = true;
    }

    public setCollisionRadius(radius: number): void {
        this.collisionRadius = radius;
    }

    public getCollisionRadius(): number {
        return this.collisionRadius;
    }

    public getGroundHeight(position: THREE.Vector3, maxDistance: number = 10): number | null {
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

