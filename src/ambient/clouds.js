import * as THREE from 'three';
import { getReferenceDistance } from '../util';

/**
 * Creates realistic volumetric clouds using 3D textures and ray-marching shaders.
 * The clouds move across the sky, change density, and respond to sun lighting for day/night cycles.
 * This implementation uses advanced rendering techniques to create fluffy, atmospheric clouds.
 *
 * Shader adapted from: https://github.com/leoawen/volumetric-clouds
 */
export class Clouds {
    scene;
    camera;
    mesh;
    material;
    uniforms;
    lastUpdate = performance.now();
    time = 0;
    movementSpeed = 0.2;
    cloudAmount = 0.7;
    textureOffset = new THREE.Vector3();
    daySunColor = new THREE.Color(0xfff1cf);
    twilightSunColor = new THREE.Color(0xffb26b);
    nightSunColor = new THREE.Color(0x1a243a);
    dayAmbientColor = new THREE.Color(0xcfdff7);
    twilightAmbientColor = new THREE.Color(0x4a5c7c);
    nightAmbientColor = new THREE.Color(0x0a1220);
    tempColorA = new THREE.Color();
    tempColorB = new THREE.Color();
    tempVector = new THREE.Vector3();
    volumeTexture;
    maskTexture;
    detailTexture;
    blueNoiseTexture;

    /**
     * Creates a new volumetric cloud system.
     * @param scene The Three.js scene to add clouds to
     * @param camera The camera used for rendering clouds (needed for proper ray-marching)
     */
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.bakeTextures();
        this.createClouds();
    }

    /**
     * Pre-generates all 3D noise textures needed for cloud rendering.
     * Creates volume, mask, detail, and blue noise textures with different characteristics.
     */
    bakeTextures() {
        this.volumeTexture = this.generate3DTexture({
            size: 96,
            coverage: 0.55,
            softness: 0.08,
            noiseScale: 3.5,
            octaves: 5,
            persistence: 0.5,
            lacunarity: 3.0,
            intensity: 1.0,
            seed: 1337
        });
        this.maskTexture = this.generate3DTexture({
            size: 48,
            coverage: 0.6,
            softness: 0.12,
            noiseScale: 2.2,
            octaves: 4,
            persistence: 0.5,
            lacunarity: 2.0,
            intensity: 1.0,
            seed: 9001
        });
        this.detailTexture = this.generate3DTexture({
            size: 32,
            coverage: 0.55,
            softness: 0.1,
            noiseScale: 5.0,
            octaves: 3,
            persistence: 0.45,
            lacunarity: 2.5,
            intensity: 1.0,
            seed: 4242
        });
        this.blueNoiseTexture = this.generateBlueNoiseTexture(64);
    }

    /**
     * Sets up the cloud rendering system with custom shaders.
     * Creates a large cube that uses ray-marching to render volumetric clouds inside it.
     * The shaders sample 3D textures to create realistic cloud shapes and lighting.
     */
    createClouds() {
        const vertexShader = /* glsl */ `
            in vec3 position;

            uniform mat4 modelMatrix;
            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;
            uniform vec3 cameraPos;

            out vec3 vOrigin;
            out vec3 vDirection;

            void main() {
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vOrigin = vec3(inverse(modelMatrix) * vec4(cameraPos, 1.0)).xyz;
                vDirection = position - vOrigin;
                gl_Position = projectionMatrix * mvPosition;
            }
        `;
        const fragmentShader = /* glsl */ `
            precision highp float;
            precision highp sampler3D;

            in vec3 vOrigin;
            in vec3 vDirection;

            out vec4 outColor;

            uniform sampler3D uVolumeTexture;
            uniform sampler3D uMaskNoiseMap;
            uniform sampler3D uMaskNoiseDetailMap;
            uniform sampler2D uBlueNoise;

            uniform vec2 uBlueNoiseSize;
            uniform vec2 uResolution;

            uniform vec3 uSunColor;
            uniform float uSunIntensity;
            uniform vec3 uLightDir;
            uniform vec3 uAmbientColor;
            uniform float uAmbientIntensity;

            uniform float uOpacity;
            uniform int uMaxSteps;
            uniform int uLightSteps;
            uniform float uDensityThreshold;
            uniform float uDensityMultiplier;
            uniform vec3 uTextureOffset;
            uniform float uTextureTiling;
            uniform float uMaskRadius;
            uniform float uMaskSoftness;
            uniform float uMaskNoiseStrength;
            uniform float uMaskDetailStrength;
            uniform float uCloudCoverage;

            const vec3 EXTINCTION = vec3(0.6, 0.65, 0.7);

            vec2 hitBox(vec3 orig, vec3 dir) {
                const vec3 boxMin = vec3(-0.5);
                const vec3 boxMax = vec3( 0.5);
                vec3 invDir = 1.0 / dir;
                vec3 tMin = (boxMin - orig) * invDir;
                vec3 tMax = (boxMax - orig) * invDir;
                vec3 t1 = min(tMin, tMax);
                vec3 t2 = max(tMin, tMax);
                float tNear = max(t1.x, max(t1.y, t1.z));
                float tFar  = min(t2.x, min(t2.y, t2.z));
                return vec2(tNear, tFar);
            }

            float getMaskValue(vec3 p) {
                float sphere = uMaskRadius - length(p);
                vec3 coord = p + 0.5;
                float primary = texture(uMaskNoiseMap, coord).r * 2.0 - 1.0;
                float detail = texture(uMaskNoiseDetailMap, coord * 2.0).r * 2.0 - 1.0;
                return sphere + primary * uMaskNoiseStrength + detail * uMaskDetailStrength;
            }

            float getMaskFactor(vec3 p) {
                float sdf = getMaskValue(p);
                return smoothstep(0.0, uMaskSoftness, sdf);
            }

            float getDensity(vec3 p) {
                float mask = getMaskFactor(p);
                if (mask <= 0.0) return 0.0;
                vec3 texCoord = (p + 0.5) * uTextureTiling + uTextureOffset;
                float baseDensity = texture(uVolumeTexture, texCoord).r;
                float coverage = mix(0.35, 0.85, uCloudCoverage);
                float density = max(baseDensity - (1.0 - coverage), 0.0);
                density = max(density - uDensityThreshold, 0.0);
                density *= uDensityMultiplier * mask;
                return density;
            }

            float computeLight(vec3 samplePos) {
                float stepLen = 1.0 / float(uLightSteps);
                float accum = 0.0;
                for (int i = 0; i < 64; i++) {
                    if (i >= uLightSteps) break;
                    vec3 p = samplePos + uLightDir * (float(i) + 0.5) * stepLen;
                    if (any(lessThan(p, vec3(-0.5))) || any(greaterThan(p, vec3(0.5)))) break;
                    accum += getDensity(p) * stepLen;
                }
                return exp(-accum);
            }

            void main() {
                vec3 rayDir = normalize(vDirection);
                vec2 bounds = hitBox(vOrigin, rayDir);
                if (bounds.x > bounds.y) discard;
                bounds.x = max(bounds.x, 0.0);

                float rayLength = bounds.y - bounds.x;
                float stepSize = rayLength / float(uMaxSteps);
                if (stepSize <= 0.0) discard;

                float jitter = texture(uBlueNoise, mod(gl_FragCoord.xy, uBlueNoiseSize) / uBlueNoiseSize).r;
                vec3 p = vOrigin + (bounds.x + jitter * stepSize) * rayDir;

                vec3 transmittance = vec3(1.0);
                vec3 accumulated = vec3(0.0);

                for (int i = 0; i < 256; i++) {
                    if (i >= uMaxSteps) break;

                    float density = getDensity(p);
                    if (density > 0.001) {
                        float lightEnergy = computeLight(p);
                        vec3 sun = uSunColor * uSunIntensity * lightEnergy;
                        vec3 ambient = uAmbientColor * uAmbientIntensity;
                        vec3 scattering = (sun + ambient) * density * stepSize;

                        accumulated += transmittance * scattering;
                        vec3 extinction = exp(-density * stepSize * EXTINCTION * uOpacity);
                        transmittance *= extinction;

                        if (max(transmittance.r, max(transmittance.g, transmittance.b)) < 0.01) break;
                    }

                    p += rayDir * stepSize;
                }

                float alpha = clamp(1.0 - transmittance.r, 0.0, 1.0);
                vec3 baseSky = vec3(0.55, 0.7, 0.85);
                vec3 color = mix(baseSky, accumulated, alpha);
                outColor = vec4(color, alpha);
            }
        `;

        this.uniforms = {
            cameraPos: { value: new THREE.Vector3() },
            uVolumeTexture: { value: this.volumeTexture },
            uMaskNoiseMap: { value: this.maskTexture },
            uMaskNoiseDetailMap: { value: this.detailTexture },
            uBlueNoise: { value: this.blueNoiseTexture },
            uBlueNoiseSize: { value: new THREE.Vector2(this.blueNoiseTexture.image.width, this.blueNoiseTexture.image.height) },
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            uSunColor: { value: new THREE.Color(1.0, 0.78, 0.65) },
            uSunIntensity: { value: 4.0 },
            uLightDir: { value: new THREE.Vector3(0.35, 0.8, -0.6).normalize() },
            uAmbientColor: { value: new THREE.Color(0.35, 0.45, 0.6) },
            uAmbientIntensity: { value: 0.8 },
            uOpacity: { value: 4.5 },
            uMaxSteps: { value: 72 },
            uLightSteps: { value: 16 },
            uDensityThreshold: { value: 0.08 },
            uDensityMultiplier: { value: 4.0 },
            uTextureOffset: { value: this.textureOffset },
            uTextureTiling: { value: 1.4 },
            uMaskRadius: { value: 0.52 },
            uMaskSoftness: { value: 0.15 },
            uMaskNoiseStrength: { value: 0.08 },
            uMaskDetailStrength: { value: 0.03 },
            uCloudCoverage: { value: this.cloudAmount }
        };

        this.material = new THREE.RawShaderMaterial({
            glslVersion: THREE.GLSL3,
            uniforms: this.uniforms,
            vertexShader,
            fragmentShader,
            side: THREE.BackSide,
            transparent: true
        });

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const distance = getReferenceDistance();
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.scale.setScalar(distance * 3);
        this.scene.add(this.mesh);
    }

    /**
     * Updates cloud animation every frame by moving the texture offset.
     * This creates the appearance of clouds drifting across the sky with wind.
     */
    animate() {
        if (!this.material)
            return;

        const now = performance.now();
        const delta = Math.min((now - this.lastUpdate) / 1000, 0.1);
        this.lastUpdate = now;
        this.time += delta;
        this.uniforms.cameraPos.value.copy(this.camera.position);
        this.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
        const wind = new THREE.Vector3(0.05, 0.0, 0.02);
        this.textureOffset.addScaledVector(wind, this.movementSpeed * delta);
        this.textureOffset.x = this.textureOffset.x % 1000.0;
        this.textureOffset.y = this.textureOffset.y % 1000.0;
        this.textureOffset.z = this.textureOffset.z % 1000.0;
    }

    /**
     * Changes how fast clouds drift across the sky.
     * @param speed Movement speed (0 = stationary, higher = faster)
     */
    setMovementSpeed(speed) {
        this.movementSpeed = THREE.MathUtils.clamp(speed, 0, 5);
    }

    /**
     * Gets the current cloud movement speed.
     * @return The movement speed value
     */
    getMovementSpeed() {
        return this.movementSpeed;
    }

    /**
     * Adjusts how much of the sky is covered by clouds.
     * @param amount Cloud coverage (0 = clear sky, 1 = fully overcast)
     */
    setCloudAmount(amount) {
        this.cloudAmount = THREE.MathUtils.clamp(amount, 0, 1);
        if (this.uniforms?.uCloudCoverage) {
            this.uniforms.uCloudCoverage.value = this.cloudAmount;
        }
    }

    /**
     * Gets the current cloud coverage amount.
     * @return The cloud amount value (0-1)
     */
    getCloudAmount() {
        return this.cloudAmount;
    }

    /**
     * Gets the Three.js mesh used for cloud rendering.
     * @return The cloud mesh object
     */
    getMesh() {
        return this.mesh;
    }

    /**
     * Updates cloud lighting based on the sun's position in the sky.
     * Changes cloud colors and brightness to match time of day - brighter during day, darker at night.
     * @param elevation The sun's elevation angle in degrees
     * @param sunDirection Optional 3D vector pointing toward the sun for directional lighting
     */
    updateLightingForSun(elevation, sunDirection) {
        if (!this.uniforms || !isFinite(elevation))
            return;
        const twilightBlend = THREE.MathUtils.clamp((elevation + 8) / 18, 0, 1);
        const dayBlend = THREE.MathUtils.clamp((elevation - 2) / 45, 0, 1);
        this.tempColorA
            .copy(this.nightSunColor)
            .lerp(this.twilightSunColor, twilightBlend)
            .lerp(this.daySunColor, dayBlend);
        this.uniforms.uSunColor.value.copy(this.tempColorA);
        this.tempColorB
            .copy(this.nightAmbientColor)
            .lerp(this.twilightAmbientColor, twilightBlend)
            .lerp(this.dayAmbientColor, dayBlend);
        this.uniforms.uAmbientColor.value.copy(this.tempColorB);
        const twilightIntensity = THREE.MathUtils.lerp(0.18, 2.2, twilightBlend);
        const dayBoost = THREE.MathUtils.lerp(0.0, 2.8, dayBlend);
        this.uniforms.uSunIntensity.value = THREE.MathUtils.clamp(twilightIntensity + dayBoost, 0.05, 5.0);
        const ambientBase = THREE.MathUtils.lerp(0.15, 0.7, twilightBlend);
        this.uniforms.uAmbientIntensity.value = THREE.MathUtils.clamp(ambientBase + dayBlend * 0.4, 0.1, 1.1);
        if (sunDirection && sunDirection.lengthSq() > 0) {
            this.uniforms.uLightDir.value.copy(this.tempVector.copy(sunDirection).normalize());
        }
    }

    /**
     * Generates a random noise texture used to break up banding in cloud rendering.
     * @param size The width and height of the texture in pixels
     * @return A 2D noise texture
     */
    generateBlueNoiseTexture(size) {
        const data = new Uint8Array(size * size);
        for (let i = 0; i < data.length; i++) {
            data[i] = Math.floor(Math.random() * 255);
        }
        const texture = new THREE.DataTexture(data, size, size, THREE.RedFormat);
        texture.needsUpdate = true;
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    /**
     * Creates a 3D noise texture using fractal Brownian motion.
     * These textures define the shape and detail of the clouds.
     * @param options Configuration for texture generation including size, noise scale, and other parameters
     * @return A 3D texture containing volumetric noise data
     */
    generate3DTexture(options) {
        const { size, coverage, softness, noiseScale, octaves, persistence, lacunarity, intensity, seed } = options;
        const data = new Float32Array(size * size * size);
        const random = createSeededRandom(seed);
        const noise = new ImprovedNoise(random);
        let i = 0;
        for (let z = 0; z < size; z++) {
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    const nx = (x / size - 0.5) * noiseScale;
                    const ny = (y / size - 0.5) * noiseScale;
                    const nz = (z / size - 0.5) * noiseScale;
                    const fbmValue = fbm(noise, nx, ny, nz, octaves, persistence, lacunarity);
                    const normalized = fbmValue * 0.5 + 0.5;
                    const shaped = THREE.MathUtils.smoothstep(normalized, coverage - softness, coverage + softness);
                    data[i++] = Math.pow(THREE.MathUtils.clamp(shaped * intensity, 0, 1), 1.0 + softness * 2.0);
                }
            }
        }
        const texture = new THREE.Data3DTexture(data, size, size, size);
        texture.format = THREE.RedFormat;
        texture.type = THREE.FloatType;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.unpackAlignment = 1;
        texture.wrapR = texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.needsUpdate = true;
        return texture;
    }
}

/**
 * Creates a seeded random number generator for reproducible noise.
 * @param seed The seed value that determines the random sequence
 * @return A random function that generates consistent values based on the seed
 */
function createSeededRandom(seed) {
    return function () {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Generates smooth Perlin noise for creating natural-looking patterns.
 * This is used to generate the base shapes of clouds.
 */
class ImprovedNoise {
    p;
    /**
     * Creates a new Perlin noise generator with a custom random function.
     * @param random Optional random function to use (defaults to Math.random)
     */
    constructor(random = Math.random) {
        const p = new Uint8Array(256);
        for (let i = 0; i < 256; i++) {
            p[i] = i;
        }
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }
        this.p = new Uint8Array(512);
        for (let i = 0; i < 512; i++) {
            this.p[i] = p[i & 255];
        }
    }

    /**
     * Generates a smooth noise value at a 3D point.
     * @param x X coordinate in noise space
     * @param y Y coordinate in noise space
     * @param z Z coordinate in noise space
     * @return A noise value between -1 and 1
     */
    noise(x, y, z) {
        const p = this.p;
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);
        const u = fade(x);
        const v = fade(y);
        const w = fade(z);
        const A = p[X] + Y;
        const AA = p[A] + Z;
        const AB = p[A + 1] + Z;
        const B = p[X + 1] + Y;
        const BA = p[B] + Z;
        const BB = p[B + 1] + Z;

        return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)), lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z))), lerp(v, lerp(u, grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1)), lerp(u, grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1))));
    }
}

/**
 * Smoothing function used in Perlin noise interpolation.
 * @param t Input value
 * @return Smoothed output value
 */
function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Linear interpolation between two values.
 * @param t Blend factor (0 = all a, 1 = all b)
 * @param a Start value
 * @param b End value
 * @return Interpolated value
 */
function lerp(t, a, b) {
    return a + t * (b - a);
}

/**
 * Gradient function used in Perlin noise calculation.
 * @param hash Random hash value
 * @param x X coordinate offset
 * @param y Y coordinate offset
 * @param z Z coordinate offset
 * @return Gradient value
 */
function grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

/**
 * Fractal Brownian Motion - combines multiple octaves of noise for detailed cloud shapes.
 * Creates natural-looking patterns by layering noise at different scales.
 * @param noise The noise generator to use
 * @param x X coordinate
 * @param y Y coordinate
 * @param z Z coordinate
 * @param octaves Number of noise layers to combine
 * @param persistence How much each octave contributes (amplitude multiplier)
 * @param lacunarity How much detail each octave adds (frequency multiplier)
 * @return Combined noise value
 */
function fbm(noise, x, y, z, octaves, persistence, lacunarity) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;
    for (let i = 0; i < octaves; i++) {
        total += noise.noise(x * frequency, y * frequency, z * frequency) * amplitude;
        maxValue += amplitude;
        amplitude *= persistence;
        frequency *= lacunarity;
    }
    return total / maxValue;
}
