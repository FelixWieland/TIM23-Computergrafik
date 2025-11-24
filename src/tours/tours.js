import * as THREE from 'three';
import { Tour } from './tour';

/**
 * Collection of predefined tours that users can select.
 * Each tour shows interesting views and demonstrates different times of day or weather conditions.
 */
export const tours = [
    new Tour("Kirchen und Kapellentour", "Ein Rundumflug um die St. Martin Kirche und der Kapelle", [
        {
            position: new THREE.Vector3(50.6701, 54.2083, -20.9754),
            cameraRotation: {
                pitch: -0.1668,
                yaw: 2.7684
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.4033,
            colorIntensity: 20.0000,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 11, 7), // 11:07
            duration: 3000
        },
        {
            position: new THREE.Vector3(-53.3977, 54.2083, -16.5579),
            cameraRotation: {
                pitch: -0.3028,
                yaw: -2.3788
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.4033,
            colorIntensity: 20.0000,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 18, 49), // 18:49
            duration: 3000
        },
        {
            position: new THREE.Vector3(-76.0610, 54.2083, 91.7272),
            cameraRotation: {
                pitch: -0.2748,
                yaw: -1.0568
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.4033,
            colorIntensity: 20.0000,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 18, 49), // 18:49
            duration: 3000
        },
        {
            position: new THREE.Vector3(46.4638, 77.5932, 130.5178),
            cameraRotation: {
                pitch: -0.4348,
                yaw: 0.2912
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.4033,
            colorIntensity: 20.0000,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 18, 49), // 18:49
            duration: 3000
        },
        {
            position: new THREE.Vector3(102.2320, 110.5457, 83.0647),
            cameraRotation: {
                pitch: -0.6308,
                yaw: 1.1992
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.4033,
            colorIntensity: 20.0000,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 18, 49), // 18:49
            duration: 3000
        },
        {
            position: new THREE.Vector3(53.1030, 110.5457, -17.0305),
            cameraRotation: {
                pitch: -0.6488,
                yaw: 2.8392
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.4033,
            colorIntensity: 20.0000,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 18, 49), // 18:49
            duration: 3000
        },
        {
            position: new THREE.Vector3(-86.3834, 134.1251, 49.7882),
            cameraRotation: {
                pitch: -0.7088,
                yaw: -1.6420
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.4033,
            colorIntensity: 20.0000,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 18, 49), // 18:49
            duration: 3000
        },
        {
            position: new THREE.Vector3(342.3427, 66.0719, 105.4221),
            cameraRotation: {
                pitch: -0.3288,
                yaw: 1.0360
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.4033,
            colorIntensity: 20.0000,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 18, 49), // 18:49
            duration: 3000
        },
        {
            position: new THREE.Vector3(334.8817, 36.1216, -5.9299),
            cameraRotation: {
                pitch: -0.3328,
                yaw: 2.5020
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.4033,
            colorIntensity: 20.0000,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 18, 49), // 18:49
            duration: 3000
        },
        {
            position: new THREE.Vector3(256.7199, 36.1216, 14.1558),
            cameraRotation: {
                pitch: -0.4788,
                yaw: -2.3332
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.4033,
            colorIntensity: 20.0000,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 18, 49), // 18:49
            duration: 3000
        },
        {
            position: new THREE.Vector3(292.3264, 15.1859, 76.4453),
            cameraRotation: {
                pitch: -0.0348,
                yaw: -0.1092
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.4033,
            colorIntensity: 20.0000,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 18, 49), // 18:49
            duration: 3000
        },
        {
            position: new THREE.Vector3(362.2806, 15.1859, 66.3685),
            cameraRotation: {
                pitch: 0.0652,
                yaw: 1.2008
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.4033,
            colorIntensity: 20.0000,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 18, 49), // 18:49
            duration: 3000
        },
        {
            position: new THREE.Vector3(294.2039, 90.1403, -44.6152),
            cameraRotation: {
                pitch: -0.6428,
                yaw: 2.8848
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.4033,
            colorIntensity: 20.0000,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 18, 49), // 18:49
            duration: 3000
        },
        {
            position: new THREE.Vector3(50.6701, 54.2083, -20.9754),
            cameraRotation: {
                pitch: -0.1668,
                yaw: 2.7684
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.4033,
            colorIntensity: 20.0000,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 11, 7), // 11:07
            duration: 3000
        },
    ]),

    new Tour("Stadtmauertour", "Eine Umrundung der Stadtmauer mit einem Fokus auf den besonderen Türmen Biberachs", [
        {
            position: new THREE.Vector3(-290.6152, 2.0535, -11.0876),
            cameraRotation: {
                pitch: 0.2732,
                yaw: 1.4104
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6000,
            colorIntensity: 11.8333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 11, 45), // 11:45
            duration: 3000
        },
        {
            position: new THREE.Vector3(-372.3593, 2.0535, -29.6365),
            cameraRotation: {
                pitch: 0.2412,
                yaw: -1.8108
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6000,
            colorIntensity: 11.8333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 19, 3), // 19:03
            duration: 3000
        },
        {
            position: new THREE.Vector3(-387.2264, 39.0858, -14.5215),
            cameraRotation: {
                pitch: -0.4868,
                yaw: -1.4648
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6000,
            colorIntensity: 11.8333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 19, 3), // 19:03
            duration: 3000
        },
        {
            position: new THREE.Vector3(-334.3932, 39.0858, 193.6443),
            cameraRotation: {
                pitch: -0.2488,
                yaw: -1.7028
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6000,
            colorIntensity: 11.8333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 19, 3), // 19:03
            duration: 3000
        },
        {
            position: new THREE.Vector3(-48.0633, 39.0858, 363.3673),
            cameraRotation: {
                pitch: -0.2728,
                yaw: -1.0628
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6000,
            colorIntensity: 11.8333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 19, 3), // 19:03
            duration: 3000
        },
        {
            position: new THREE.Vector3(170.1827, 39.0858, 437.4167),
            cameraRotation: {
                pitch: -0.1928,
                yaw: -0.4808
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6000,
            colorIntensity: 11.8333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 19, 3), // 19:03
            duration: 3000
        },
        {
            position: new THREE.Vector3(292.6757, 39.0858, 427.5787),
            cameraRotation: {
                pitch: -0.2488,
                yaw: 0.7932
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6000,
            colorIntensity: 11.8333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 19, 3), // 19:03
            duration: 3000
        },
        {
            position: new THREE.Vector3(271.7759, 39.0858, 252.3889),
            cameraRotation: {
                pitch: -0.1468,
                yaw: -2.0088
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6000,
            colorIntensity: 11.8333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 19, 3), // 19:03
            duration: 3000
        },
        {
            position: new THREE.Vector3(382.5066, 39.0858, 216.6659),
            cameraRotation: {
                pitch: -0.1228,
                yaw: 2.5704
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6000,
            colorIntensity: 11.8333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 19, 3), // 19:03
            duration: 3000
        },
        {
            position: new THREE.Vector3(437.6886, 39.0858, 66.4565),
            cameraRotation: {
                pitch: -0.2188,
                yaw: 0.6324
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6000,
            colorIntensity: 11.8333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 19, 3), // 19:03
            duration: 3000
        },
        {
            position: new THREE.Vector3(223.6843, 39.0858, -316.6847),
            cameraRotation: {
                pitch: -0.2108,
                yaw: 2.5184
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6000,
            colorIntensity: 11.8333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 19, 3), // 19:03
            duration: 3000
        },
        {
            position: new THREE.Vector3(44.4507, 39.0858, -243.6587),
            cameraRotation: {
                pitch: -0.2688,
                yaw: 1.6464
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6000,
            colorIntensity: 11.8333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 19, 3), // 19:03
            duration: 3000
        },
        {
            position: new THREE.Vector3(-245.1321, 39.0858, -296.0377),
            cameraRotation: {
                pitch: -0.1928,
                yaw: 3.0204
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6000,
            colorIntensity: 11.8333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 19, 3), // 19:03
            duration: 3000
        },
        {
            position: new THREE.Vector3(-402.4803, 39.0858, -87.8982),
            cameraRotation: {
                pitch: -0.3108,
                yaw: -2.3388
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6000,
            colorIntensity: 11.8333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 19, 3), // 19:03
            duration: 3000
        },
        {
            position: new THREE.Vector3(-368.5615, 2.0535, -29.6424),
            cameraRotation: {
                pitch: 0.1792,
                yaw: -1.7628
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6000,
            colorIntensity: 11.8333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 19, 3), // 19:03
            duration: 3000
        },
        {
            position: new THREE.Vector3(-290.6152, 2.0535, -11.0876),
            cameraRotation: {
                pitch: 0.2732,
                yaw: 1.4104
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6000,
            colorIntensity: 11.8333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 11, 45), // 11:45
            duration: 3000
        },
    ]),
    new Tour("Brücken und Brunnen", "Ein Spaziergang zu den Brücken und Brunnen Biberachs", [
        {
            position: new THREE.Vector3(329.0411, 2.0534, 63.1555),
            cameraRotation: {
                pitch: 0.0432,
                yaw: 1.6644
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6000,
            colorIntensity: 11.8333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 25, 12, 4), // 12:04
            duration: 3000
        },
        {
            position: new THREE.Vector3(258.6412, 2.0534, 69.1510),
            cameraRotation: {
                pitch: 0.1472,
                yaw: 1.6144
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6000,
            colorIntensity: 11.8333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 25, 12, 5), // 12:04
            duration: 3000
        },
        {
            position: new THREE.Vector3(228.7146, 2.0534, 72.7512),
            cameraRotation: {
                pitch: 0.0552,
                yaw: -1.3096
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6000,
            colorIntensity: 11.8333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 25, 12, 6), // 12:04
            duration: 3000
        },
        {
            position: new THREE.Vector3(171.1708, 2.0534, 61.0875),
            cameraRotation: {
                pitch: -0.1288,
                yaw: 0.5604
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6300,
            colorIntensity: 11.8333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 25, 12, 7), // 12:04
            duration: 3000
        },
        {
            position: new THREE.Vector3(157.5930, 2.0534, 52.4868),
            cameraRotation: {
                pitch: -0.1908,
                yaw: -0.3696
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6300,
            colorIntensity: 11.8333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 25, 12, 8), // 12:04
            duration: 1000
        },
        {
            position: new THREE.Vector3(167.4646, 2.0535, 29.6966),
            cameraRotation: {
                pitch: -0.0208,
                yaw: 1.8704
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6300,
            colorIntensity: 11.8333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 25, 12, 9), // 12:04
            duration: 3000
        },
        {
            position: new THREE.Vector3(109.0524, 2.0535, 22.8368),
            cameraRotation: {
                pitch: 0.2992,
                yaw: 2.8624
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6300,
            colorIntensity: 11.8333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 25, 12, 10), // 12:04
            duration: 3000
        },
        {
            position: new THREE.Vector3(112.8053, 2.0534, 52.0182),
            cameraRotation: {
                pitch: 0.3512,
                yaw: 0.5272
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6300,
            colorIntensity: 11.8333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 25, 12, 11), // 12:04
            duration: 3000
        },
        {
            position: new THREE.Vector3(73.6917, 2.0534, 65.0152),
            cameraRotation: {
                pitch: 0.3572,
                yaw: 1.9092
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6300,
            colorIntensity: 11.8333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 25, 12, 12), // 12:04
            duration: 3000
        },
        {
            position: new THREE.Vector3(-6.5001, 2.0534, 90.7416),
            cameraRotation: {
                pitch: 0.3992,
                yaw: -0.3028
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6300,
            colorIntensity: 11.8333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 25, 12, 13), // 12:04
            duration: 3000
        },
        {
            position: new THREE.Vector3(-74.1133, 2.0534, 124.8745),
            cameraRotation: {
                pitch: -0.1568,
                yaw: 1.3552
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6300,
            colorIntensity: 11.8333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 25, 12, 14), // 12:04
            duration: 3000
        },
        {
            position: new THREE.Vector3(-156.1691, 2.0534, 86.9149),
            cameraRotation: {
                pitch: 0.0272,
                yaw: 1.9732
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6300,
            colorIntensity: 11.8333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 25, 12, 15), // 12:04
            duration: 3000
        },
    ]),
    new Tour("Uhren über den Tag", "Zeigt die funktiosweiße der Uhren über einen Tag", [
        {
            position: new THREE.Vector3(37.3987, 43.1966, 16.7317),
            cameraRotation: {
                pitch: 0.1652,
                yaw: 3.0944
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.6000,
            colorIntensity: 30.0000,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 19, 21), // 19:21
            duration: 3000
        },
        {
            position: new THREE.Vector3(37.3987, 43.1966, 16.7317),
            cameraRotation: {
                pitch: 0.1712,
                yaw: 3.0924
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.8533,
            colorIntensity: 22.6667,
            fogValue: 0.008500,
            dateTime: new Date(2025, 10, 24, 0, 0), // 00:00
            duration: 3000
        },
        {
            position: new THREE.Vector3(74.0197, 43.1966, 39.9063),
            cameraRotation: {
                pitch: 0.0612,
                yaw: 1.9684
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.8533,
            colorIntensity: 22.6667,
            fogValue: 0.008500,
            dateTime: new Date(2025, 10, 24, 6, 0), // 06:00
            duration: 3000
        },
        {
            position: new THREE.Vector3(61.9149, 43.1966, 96.0386),
            cameraRotation: {
                pitch: 0.0512,
                yaw: 0.7544
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.8533,
            colorIntensity: 22.6667,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 12, 0), // 12:00
            duration: 3000
        },
        {
            position: new THREE.Vector3(6.5347, 43.1966, 95.0833),
            cameraRotation: {
                pitch: 0.0152,
                yaw: -0.5696
            },
            cloudMovementSpeed: 0.2000,
            cloudAmount: 0.7000,
            colorWarmth: 0.8533,
            colorIntensity: 22.6667,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 23, 59), // 20:00
            duration: 3000
        },
    ]),
    new Tour("Sonnenaufgang am Kirchturm", "Erlebe den Sonnenaufgang neben der Kirche in einem nebligen Setting", [
        {
            position: new THREE.Vector3(136.2243, 47.3724, 3.1329),
            cameraRotation: {
                pitch: 0.1472,
                yaw: 2.4744
            },
            cloudMovementSpeed: 0.0813,
            cloudAmount: 0.0031,
            colorWarmth: 0.6700,
            colorIntensity: 1.6667,
            fogValue: 0.005433,
            dateTime: new Date(2025, 10, 24, 5, 0), // 05:02
            duration: 3000
        },
        {
            position: new THREE.Vector3(136.2243, 47.3724, 3.1329),
            cameraRotation: {
                pitch: 0.1472,
                yaw: 2.4744
            },
            cloudMovementSpeed: 0.0813,
            cloudAmount: 0.0031,
            colorWarmth: 0.6700,
            colorIntensity: 1.6667,
            fogValue: 0.005433,
            dateTime: new Date(2025, 10, 24, 7, 35), // 07:35
            duration: 3000
        },
        {
            position: new THREE.Vector3(136.2243, 47.3724, 3.1329),
            cameraRotation: {
                pitch: 0.1472,
                yaw: 2.4744
            },
            cloudMovementSpeed: 0.0813,
            cloudAmount: 0.0031,
            colorWarmth: 0.6700,
            colorIntensity: 1.6667,
            fogValue: 0.005433,
            dateTime: new Date(2025, 10, 24, 7, 30), // 08:04
            duration: 3000
        },
        {
            position: new THREE.Vector3(136.2243, 47.3724, 3.1329),
            cameraRotation: {
                pitch: 0.1472,
                yaw: 2.4744
            },
            cloudMovementSpeed: 0.0813,
            cloudAmount: 0.0031,
            colorWarmth: 0.6700,
            colorIntensity: 13.3333,
            fogValue: 0.005933,
            dateTime: new Date(2025, 10, 24, 8, 0), // 07:50
            duration: 3000
        },
        {
            position: new THREE.Vector3(136.2243, 47.3724, 3.1329),
            cameraRotation: {
                pitch: 0.1472,
                yaw: 2.4744
            },
            cloudMovementSpeed: 0.0813,
            cloudAmount: 0.0031,
            colorWarmth: 0.3833,
            colorIntensity: 13.3333,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 10, 0), // 10:00
            duration: 5000
        },
    ]),
    new Tour("Dauerhafter Sonnenaufgang", "Erlebe ein beleuchtetes Biberach während des Sonnenaufgangs", [
        {
            position: new THREE.Vector3(500.5060, 100.4253, -170.2024),
            cameraRotation: {
                pitch: -0.1228,
                yaw: 2.0364
            },
            cloudMovementSpeed: 0.4125,
            cloudAmount: 0.6687,
            colorWarmth: 0.7067,
            colorIntensity: 24.1667,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 7, 40), // 07:40
            duration: 1
        },
        {
            position: new THREE.Vector3(500.5060, 100.4253, -170.2024),
            cameraRotation: {
                pitch: -0.1228,
                yaw: 2.0364
            },
            cloudMovementSpeed: 0.4125,
            cloudAmount: 0.6687,
            colorWarmth: 0.7067,
            colorIntensity: 24.1667,
            fogValue: 0.000000,
            dateTime: new Date(2025, 10, 24, 7, 40), // 07:40
            duration: 1
        },
    ])
];
