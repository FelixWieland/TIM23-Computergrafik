import * as THREE from 'three';
import { Tour } from './tour';

export const tours: Tour[] = [
    new Tour(
        "Demo Tour",
        "Test",
        [
            {
                position: new THREE.Vector3(137.8763, 40.6445, 36.1236),
                cameraRotation: {
                    pitch: -0.0266,
                    yaw: 1.8240
                },
                cloudMovementSpeed: 0.2000,
                cloudAmount: 0.7000,
                colorWarmth: 0.5000,
                colorIntensity: 10.0000,
                fogValue: 0.000000,
                dateTime: new Date(2025, 10, 23, 11, 40), // 11:40
                duration: 0
            },
            {
                position: new THREE.Vector3(43.5418, 262.1559, -311.7202),
                cameraRotation: {
                    pitch: -0.8526,
                    yaw: 3.0780
                },
                cloudMovementSpeed: 0.2000,
                cloudAmount: 0.7000,
                colorWarmth: 0.5000,
                colorIntensity: 10.0000,
                fogValue: 0.000000,
                dateTime: new Date(2025, 10, 23, 22, 12), // 22:12
                duration: 5000
            },
            {
                position: new THREE.Vector3(-293.3460, 65.7031, 31.3497),
                cameraRotation: {
                    pitch: -0.1446,
                    yaw: -1.6452
                },
                cloudMovementSpeed: 0.2000,
                cloudAmount: 0.7000,
                colorWarmth: 0.5000,
                colorIntensity: 10.0000,
                fogValue: 0.0052,
                dateTime: new Date(2025, 10, 24, 10, 0), // 10:00
                duration: 5000
            },
        ]
    ),
];

