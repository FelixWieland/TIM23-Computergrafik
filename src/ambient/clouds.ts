import * as THREE from 'three';
import { getReferenceDistance } from '../util';

type TextureBakeOptions = {
    size: number;
    coverage: number;
    softness: number;
    noiseScale: number;
    octaves: number;
    persistence: number;
    lacunarity: number;
    intensity: number;
    seed: number;
};

/**
 * This clouds shader was adapted from the following Code: https://github.com/leoawen/volumetric-clouds
 */
export class Clouds {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;

    private mesh!: THREE.Mesh<THREE.BoxGeometry, THREE.RawShaderMaterial>;
    private material!: THREE.RawShaderMaterial;
    private uniforms!: Record<string, THREE.IUniform>;

    private lastUpdate = performance.now();
    private time = 0;

    private movementSpeed = 0.2;
    private cloudAmount = 0.7;
    private textureOffset = new THREE.Vector3();
    private readonly daySunColor = new THREE.Color(0xfff1cf);
    private readonly twilightSunColor = new THREE.Color(0xffb26b);
    private readonly nightSunColor = new THREE.Color(0x1a243a);
    private readonly dayAmbientColor = new THREE.Color(0xcfdff7);
    private readonly twilightAmbientColor = new THREE.Color(0x4a5c7c);
    private readonly nightAmbientColor = new THREE.Color(0x0a1220);
    private readonly tempColorA = new THREE.Color();
    private readonly tempColorB = new THREE.Color();
    private readonly tempVector = new THREE.Vector3();

    private volumeTexture!: THREE.Data3DTexture;
    private maskTexture!: THREE.Data3DTexture;
    private detailTexture!: THREE.Data3DTexture;
    private blueNoiseTexture!: THREE.DataTexture;

    constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
        this.scene = scene;
        this.camera = camera;

        this.bakeTextures();
        this.createClouds();
    }

    private bakeTextures() {
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

    private createClouds() {
        const vertexShader = /* glsl */`
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

        const fragmentShader = /* glsl */`
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

    public update() {
        if (!this.material) return;

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

    public setMovementSpeed(speed: number) {
        this.movementSpeed = THREE.MathUtils.clamp(speed, 0, 5);
    }

    public getMovementSpeed(): number {
        return this.movementSpeed;
    }

    public setCloudAmount(amount: number) {
        this.cloudAmount = THREE.MathUtils.clamp(amount, 0, 1);
        if (this.uniforms?.uCloudCoverage) {
            this.uniforms.uCloudCoverage.value = this.cloudAmount;
        }
    }

    public getCloudAmount(): number {
        return this.cloudAmount;
    }

    public getMesh() {
        return this.mesh;
    }

    public updateLightingForSun(elevation: number, sunDirection?: THREE.Vector3) {
        if (!this.uniforms || !isFinite(elevation)) return;

        const twilightBlend = THREE.MathUtils.clamp((elevation + 8) / 18, 0, 1);
        const dayBlend = THREE.MathUtils.clamp((elevation - 2) / 45, 0, 1);

        this.tempColorA
            .copy(this.nightSunColor)
            .lerp(this.twilightSunColor, twilightBlend)
            .lerp(this.daySunColor, dayBlend);
        (this.uniforms.uSunColor.value as THREE.Color).copy(this.tempColorA);

        this.tempColorB
            .copy(this.nightAmbientColor)
            .lerp(this.twilightAmbientColor, twilightBlend)
            .lerp(this.dayAmbientColor, dayBlend);
        (this.uniforms.uAmbientColor.value as THREE.Color).copy(this.tempColorB);

        const twilightIntensity = THREE.MathUtils.lerp(0.18, 2.2, twilightBlend);
        const dayBoost = THREE.MathUtils.lerp(0.0, 2.8, dayBlend);
        this.uniforms.uSunIntensity.value = THREE.MathUtils.clamp(twilightIntensity + dayBoost, 0.05, 5.0);

        const ambientBase = THREE.MathUtils.lerp(0.15, 0.7, twilightBlend);
        this.uniforms.uAmbientIntensity.value = THREE.MathUtils.clamp(ambientBase + dayBlend * 0.4, 0.1, 1.1);

        if (sunDirection && sunDirection.lengthSq() > 0) {
            (this.uniforms.uLightDir.value as THREE.Vector3).copy(
                this.tempVector.copy(sunDirection).normalize()
            );
        }
    }

    private generateBlueNoiseTexture(size: number) {
        const data = new Uint8Array(size * size);
        for (let i = 0; i < data.length; i++) {
            data[i] = Math.floor(Math.random() * 255);
        }
        const texture = new THREE.DataTexture(data, size, size, THREE.RedFormat);
        texture.needsUpdate = true;
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    private generate3DTexture(options: TextureBakeOptions) {
        const {
            size,
            coverage,
            softness,
            noiseScale,
            octaves,
            persistence,
            lacunarity,
            intensity,
            seed
        } = options;

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

function createSeededRandom(seed: number) {
    return function () {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

class ImprovedNoise {
    private p: Uint8Array;

    constructor(random = Math.random) {
        const p = new Uint8Array(256);
        for (let i = 0; i < 256; i++) p[i] = i;
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }
        this.p = new Uint8Array(512);
        for (let i = 0; i < 512; i++) this.p[i] = p[i & 255];
    }

    noise(x: number, y: number, z: number) {
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

        return lerp(w,
            lerp(v,
                lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)),
                lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z))
            ),
            lerp(v,
                lerp(u, grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1)),
                lerp(u, grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1))
            )
        );
    }
}

function fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(t: number, a: number, b: number) {
    return a + t * (b - a);
}

function grad(hash: number, x: number, y: number, z: number) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function fbm(
    noise: ImprovedNoise,
    x: number,
    y: number,
    z: number,
    octaves: number,
    persistence: number,
    lacunarity: number
) {
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
