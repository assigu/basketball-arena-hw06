/**
 * @fileoverview SUPER ENHANCED Interactive Basketball Arena
 * @description Ultimate 3D basketball experience with enhanced features
 * @requires three.js
 * @requires OrbitControls.js
 *
 * SUPER FEATURES:
 * 🌙 Day/Night Cycle System - 4 dynamic time periods with smooth transitions
 * 🎯 Smart Shot Predictor - Real-time arc visualization with accuracy feedback
 * ✨ Advanced Particle Effects - Score explosions, rim sparks, ball trails
 * 🏀 Realistic Ball Physics - Slower, skill-based shooting mechanics
 */

import {OrbitControls} from './OrbitControls.js'

// =============================================================================
// ENHANCED CONSTANTS & CONFIGURATION
// =============================================================================

// Court dimensions
const COURT_LENGTH = 28;
const COURT_WIDTH = 15;
const COURT_FLOOR_Y = 0;
const LINE_THICKNESS = 0.05;
const LINES_Y_OFFSET = 0.01;

// Basketball hoop specifications
const RIM_Y = 3.05;
const RIM_RADIUS = 0.225;
const BACKBOARD_WIDTH = 1.8;
const BACKBOARD_HEIGHT = 1.05;
const BACKBOARD_DIST_FROM_BASELINE = 1.2;
const POLE_RADIUS = 0.15;

// Basketball specifications
const BALL_RADIUS = 0.1213;

// Enhanced physics constants
const GRAVITY = -9.8;
const BALL_MOVEMENT_SPEED = 0.08; // Slower, more controlled movement
const MIN_SHOT_POWER = 0.1;
const MAX_SHOT_POWER = 1.0;
const POWER_STEP = 0.0008; // Slower power adjustment
const BOUNCE_DAMPING = 0.7;
const ROTATION_SCALE = 6.0; // Reduced rotation speed
const BACKBOARD_DAMP_FACTOR = 0.6;

// Particle settings
const MAX_QUALITY_PARTICLES = 500;

// Camera configuration
const CAMERA_INITIAL_POS = new THREE.Vector3(0, 15, 25);

// =============================================================================
// DAY/NIGHT CYCLE SYSTEM
// =============================================================================

class DayNightCycle {
    constructor() {
        this.timeOfDay = 0.25; // Start at day
        this.cycleSpeed = 0.0001;
        this.currentPeriod = 'day';
        this.transitionDuration = 2.0;
        this.transitionProgress = 0;

        this.periods = {
            dawn: { start: 0.0, end: 0.25, color: new THREE.Color(0.9, 0.6, 0.4) },
            day: { start: 0.25, end: 0.5, color: new THREE.Color(0.8, 0.9, 1.0) },
            dusk: { start: 0.5, end: 0.75, color: new THREE.Color(0.8, 0.4, 0.2) },
            night: { start: 0.75, end: 1.0, color: new THREE.Color(0.1, 0.1, 0.3) }
        };

        this.setupLighting();
    }

    setupLighting() {
        // Enhanced lighting system for day/night cycle
        this.ambientLight = new THREE.AmbientLight(0x404060, 0.8);
        scene.add(this.ambientLight);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        this.directionalLight.position.set(10, 20, 15);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.near = 1;
        this.directionalLight.shadow.camera.far = 100;
        this.directionalLight.shadow.camera.left = -30;
        this.directionalLight.shadow.camera.right = 30;
        this.directionalLight.shadow.camera.top = 30;
        this.directionalLight.shadow.camera.bottom = -30;
        scene.add(this.directionalLight);

        // Stadium lights for night illumination
        this.stadiumLights = [];
        const positions = [
            [15, 12, 10], [-15, 12, 10], [15, 12, -10], [-15, 12, -10],
            [0, 18, 12], [0, 18, -12], [12, 15, 0], [-12, 15, 0]
        ];

        positions.forEach(pos => {
            const light = new THREE.SpotLight(0xffffff, 0.3, 50, Math.PI / 4, 0.2, 2);
            light.position.set(...pos);
            light.castShadow = true;
            scene.add(light);
            this.stadiumLights.push(light);
        });
    }

    update(deltaTime) {
        this.timeOfDay += this.cycleSpeed * deltaTime;
        if (this.timeOfDay > 1) this.timeOfDay = 0;

        this.updateLighting();
        this.updateSkyColor();
    }

    getCurrentPeriod() {
        for (const [name, period] of Object.entries(this.periods)) {
            if (this.timeOfDay >= period.start && this.timeOfDay < period.end) {
                return name;
            }
        }
        return 'night';
    }

    updateLighting() {
        const period = this.periods[this.currentPeriod];
        const intensity = this.getLightIntensity();

        // Smooth transition for ambient light
        this.ambientLight.intensity = THREE.MathUtils.lerp(
            this.ambientLight.intensity,
            intensity * 0.8,
            0.05
        );

        // Directional light (sun)
        this.directionalLight.intensity = THREE.MathUtils.lerp(
            this.directionalLight.intensity,
            intensity * 1.2,
            0.05
        );

        // Stadium lights (stronger at night)
        const stadiumIntensity = this.currentPeriod === 'night' ? 1.2 : 0.2;
        this.stadiumLights.forEach(light => {
            light.intensity = THREE.MathUtils.lerp(
                light.intensity,
                stadiumIntensity,
                0.05
            );
        });

        // Update directional light color
        const targetColor = period.color;
        this.directionalLight.color.lerp(targetColor, 0.05);
    }

    getLightIntensity() {
        switch(this.currentPeriod) {
            case 'dawn': return 0.7;
            case 'day': return 1.0;
            case 'dusk': return 0.6;
            case 'night': return 0.3;
            default: return 0.8;
        }
    }

    updateSkyColor() {
        const period = this.periods[this.currentPeriod];
        const currentColor = scene.background;

        if (currentColor && currentColor.lerp) {
            currentColor.lerp(period.color, 0.02);
        } else {
            scene.background = period.color.clone();
        }
    }

    cyclePeriod() {
        // Manual cycle for demonstration - FIXED!
        const periods = ['dawn', 'day', 'dusk', 'night'];
        const currentIndex = periods.indexOf(this.currentPeriod);
        const nextIndex = (currentIndex + 1) % periods.length;
        const nextPeriod = periods[nextIndex];

        // Update current period and time of day
        this.currentPeriod = nextPeriod;
        this.timeOfDay = this.periods[nextPeriod].start + 0.01; // Small offset to ensure we're in the period

        ui.updateGameStatus(`⏰ Time changed to ${nextPeriod.toUpperCase()}! 🌅🌞🌅🌙`);
    }
}

// =============================================================================
// SMART SHOT PREDICTOR SYSTEM
// =============================================================================

class ShotPredictor {
    constructor() {
        this.enabled = false;
        this.arcPoints = [];
        this.arcLine = null;
        this.predictionAccuracy = 'unknown';
        this.targetPosition = new THREE.Vector3();

        this.setupVisuals();
    }

    setupVisuals() {
        // Create the prediction arc line
        const arcGeometry = new THREE.BufferGeometry();
        const arcMaterial = new THREE.LineBasicMaterial({
            color: 0x00ff00,
            linewidth: 3,
            transparent: true,
            opacity: 0.8
        });

        this.arcLine = new THREE.Line(arcGeometry, arcMaterial);
        this.arcLine.visible = false;
        scene.add(this.arcLine);
    }

    toggle() {
        this.enabled = !this.enabled;
        this.arcLine.visible = this.enabled;

        const status = this.enabled ? 'Shot predictor ENABLED 🎯' : 'Shot predictor DISABLED';
        ui.updateGameStatus(status);
    }

    update() {
        if (!this.enabled || gameState.isShooting) {
            this.arcLine.visible = false;
            return;
        }

        this.calculateTrajectory();
        this.updateVisuals();
        this.arcLine.visible = true;
    }

    calculateTrajectory() {
        // Find nearest hoop
        const rightHoopPos = new THREE.Vector3();
        const leftHoopPos = new THREE.Vector3();

        if (rightHoop && rightHoop.userData.rimPosition) {
            rightHoop.localToWorld(rightHoopPos.copy(rightHoop.userData.rimPosition));
        }
        if (leftHoop && leftHoop.userData.rimPosition) {
            leftHoop.localToWorld(leftHoopPos.copy(leftHoop.userData.rimPosition));
        }

        const distToRight = gameState.ballPosition.distanceTo(rightHoopPos);
        const distToLeft = gameState.ballPosition.distanceTo(leftHoopPos);
        this.targetPosition = distToRight < distToLeft ? rightHoopPos : leftHoopPos;

        // Calculate trajectory based on current power
        const toHoop = this.targetPosition.clone().sub(gameState.ballPosition);
        const horizontalDistance = Math.sqrt(toHoop.x * toHoop.x + toHoop.z * toHoop.z);
        const verticalDistance = toHoop.y;

        const TIME_TO_RIM = 1.4;
        const perfect_vy = (verticalDistance - 0.5 * GRAVITY * TIME_TO_RIM * TIME_TO_RIM) / TIME_TO_RIM;
        const perfect_vx = toHoop.x / TIME_TO_RIM;
        const perfect_vz = toHoop.z / TIME_TO_RIM;

        // Apply current power to prediction
        const MAX_SHOOTING_DISTANCE = 25.0;
        const distanceRatio = Math.min(1.0, horizontalDistance / MAX_SHOOTING_DISTANCE);
        const idealPower = MIN_SHOT_POWER + distanceRatio * (MAX_SHOT_POWER - MIN_SHOT_POWER);
        const powerDifference = gameState.shotPower - idealPower;
        const errorFactor = 1.0 + (powerDifference * 0.5);

        const velocity = new THREE.Vector3(perfect_vx, perfect_vy, perfect_vz).multiplyScalar(errorFactor);

        // Generate arc points
        this.arcPoints = [];
        const steps = 30;

        for (let i = 0; i <= steps; i++) {
            const t = (i / steps) * TIME_TO_RIM * errorFactor;
            const pos = gameState.ballPosition.clone();

            pos.x += velocity.x * t;
            pos.y += velocity.y * t + 0.5 * GRAVITY * t * t;
            pos.z += velocity.z * t;

            this.arcPoints.push(pos);

            // Stop if we hit the ground
            if (pos.y <= COURT_FLOOR_Y + BALL_RADIUS) break;
        }

        // Determine accuracy
        if (this.arcPoints.length > 0) {
            const endPoint = this.arcPoints[this.arcPoints.length - 1];
            const distanceToTarget = endPoint.distanceTo(this.targetPosition);

            if (distanceToTarget < RIM_RADIUS * 0.8) {
                this.predictionAccuracy = 'excellent';
            } else if (distanceToTarget < RIM_RADIUS * 1.5) {
                this.predictionAccuracy = 'good';
            } else if (distanceToTarget < RIM_RADIUS * 3) {
                this.predictionAccuracy = 'fair';
            } else {
                this.predictionAccuracy = 'poor';
            }
        }
    }

    updateVisuals() {
        if (this.arcPoints.length === 0) return;

        // Update arc line geometry
        const positions = new Float32Array(this.arcPoints.length * 3);
        for (let i = 0; i < this.arcPoints.length; i++) {
            positions[i * 3] = this.arcPoints[i].x;
            positions[i * 3 + 1] = this.arcPoints[i].y;
            positions[i * 3 + 2] = this.arcPoints[i].z;
        }

        this.arcLine.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Color code based on accuracy
        let color;
        switch (this.predictionAccuracy) {
            case 'excellent': color = 0x00ff00; break; // Green
            case 'good': color = 0x80ff00; break;      // Light green
            case 'fair': color = 0xffff00; break;      // Yellow
            case 'poor': color = 0xff4400; break;      // Red
            default: color = 0xffffff; break;          // White
        }

        this.arcLine.material.color.setHex(color);
    }
}

// =============================================================================
// ADVANCED PARTICLE EFFECTS SYSTEM
// =============================================================================

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.particlePool = [];
        this.maxParticles = MAX_QUALITY_PARTICLES;

        this.setupParticleTypes();
    }

    setupParticleTypes() {
        // Different particle systems for different effects
        this.particleTypes = {
            scoreExplosion: {
                count: 50,
                spread: 2.0,
                speed: 5.0,
                life: 2.0,
                colors: [0xff6b35, 0xffd700, 0xff4500, 0x00ff00],
                size: 0.05
            },
            rimSpark: {
                count: 20,
                spread: 0.5,
                speed: 3.0,
                life: 1.0,
                colors: [0xffffff, 0xffaa00, 0xff6600],
                size: 0.02
            },
            courtDust: {
                count: 15,
                spread: 0.8,
                speed: 1.0,
                life: 1.5,
                colors: [0x8b7355, 0xa0895c, 0x9c8459],
                size: 0.03
            },
            ballTrail: {
                count: 5,
                spread: 0.1,
                speed: 0.5,
                life: 0.5,
                colors: [0xff6b35, 0xff8c42],
                size: 0.025
            }
        };
    }

    createParticle(type, position, velocity = new THREE.Vector3()) {
        if (this.particles.length >= this.maxParticles * this.performanceLevel) {
            return; // Skip if too many particles
        }

        const config = this.particleTypes[type];
        if (!config) return;

        // Create particle geometry and material
        const geometry = new THREE.SphereGeometry(config.size, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: config.colors[Math.floor(Math.random() * config.colors.length)],
            transparent: true,
            opacity: 1.0
        });

        const particle = new THREE.Mesh(geometry, material);
        particle.position.copy(position);

        // Add random spread
        particle.position.add(new THREE.Vector3(
            (Math.random() - 0.5) * config.spread,
            (Math.random() - 0.5) * config.spread,
            (Math.random() - 0.5) * config.spread
        ));

        // Set particle properties
        particle.userData = {
            velocity: velocity.clone().add(new THREE.Vector3(
                (Math.random() - 0.5) * config.speed,
                Math.random() * config.speed,
                (Math.random() - 0.5) * config.speed
            )),
            life: config.life,
            maxLife: config.life,
            type: type
        };

        scene.add(particle);
        this.particles.push(particle);
    }

    createScoreExplosion(position, isThreePointer = false) {
        const particleCount = isThreePointer ? 75 : 50;
        const explosionColors = isThreePointer ?
            [0x00ff00, 0x00ff88, 0x88ff00, 0xffd700] :
            [0xff6b35, 0xffd700, 0xff4500, 0xffaa00];

        for (let i = 0; i < particleCount * this.performanceLevel; i++) {
            const geometry = new THREE.SphereGeometry(0.04, 6, 6);
            const material = new THREE.MeshBasicMaterial({
                color: explosionColors[Math.floor(Math.random() * explosionColors.length)],
                transparent: true
            });

            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(position);

            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 8,
                Math.random() * 6 + 2,
                (Math.random() - 0.5) * 8
            );

            particle.userData = {
                velocity: velocity,
                life: 3.0,
                maxLife: 3.0,
                type: 'scoreExplosion'
            };

            scene.add(particle);
            this.particles.push(particle);
        }
    }

    createBallTrail(position) {
        if (Math.random() > 0.3) return; // Only create trail sometimes for performance

        this.createParticle('ballTrail', position);
    }

    createRimSparks(position) {
        for (let i = 0; i < 15 * this.performanceLevel; i++) {
            this.createParticle('rimSpark', position);
        }
    }

    createCourtDust(position) {
        for (let i = 0; i < 10 * this.performanceLevel; i++) {
            this.createParticle('courtDust', position);
        }
    }

    update(deltaTime) {
        // Update all particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            const data = particle.userData;

            // Update physics
            data.velocity.y += GRAVITY * deltaTime * 0.5; // Lighter gravity for particles
            particle.position.add(data.velocity.clone().multiplyScalar(deltaTime));

            // Update life
            data.life -= deltaTime;

            // Fade out
            const alpha = data.life / data.maxLife;
            particle.material.opacity = alpha;

            // Scale down over time for some effects
            if (data.type === 'scoreExplosion') {
                const scale = 0.5 + alpha * 0.5;
                particle.scale.setScalar(scale);
            }

            // Remove dead particles
            if (data.life <= 0) {
                scene.remove(particle);
                particle.geometry.dispose();
                particle.material.dispose();
                this.particles.splice(i, 1);
            }
        }
    }

    clear() {
        // Remove all particles
        this.particles.forEach(particle => {
            scene.remove(particle);
            particle.geometry.dispose();
            particle.material.dispose();
        });
        this.particles = [];
    }
}

// =============================================================================
// 3-POINT SCORING SYSTEM
// =============================================================================

function isThreePointShot(shotPosition, targetHoopPos) {
    const THREE_POINT_ARC_RADIUS = 6.75;
    const COURT_WIDTH_HALF = COURT_WIDTH / 2;
    const THREE_POINT_STRAIGHT_LINE_Y = COURT_WIDTH_HALF - 0.9;

    const horizontalDistance = Math.sqrt(
        Math.pow(shotPosition.x - targetHoopPos.x, 2) +
        Math.pow(shotPosition.z - targetHoopPos.z, 2)
    );

    if (horizontalDistance >= THREE_POINT_ARC_RADIUS) {
        if (Math.abs(shotPosition.z) <= THREE_POINT_STRAIGHT_LINE_Y) {
            return true;
        } else {
            const distanceFromBaseline = Math.abs(shotPosition.x - targetHoopPos.x);
            return distanceFromBaseline >= THREE_POINT_ARC_RADIUS;
        }
    }

    return false;
}

// =============================================================================
// ENHANCED GAME STATE
// =============================================================================

const gameState = {
    // Ball physics
    ballPosition: new THREE.Vector3(0, COURT_FLOOR_Y + BALL_RADIUS + LINES_Y_OFFSET, 0),
    ballVelocity: new THREE.Vector3(0, 0, 0),
    ballRotation: new THREE.Vector3(0, 0, 0),
    ballAngularVelocity: new THREE.Vector3(0, 0, 0),

    // Input state
    keys: {},
    shotPower: 0.5,
    isMoving: false,
    isShooting: false,

    // Scoring system
    score: 0,
    shotAttempts: 0,
    shotsMade: 0,

    // Game status
    lastShotResult: '',
    shotFeedbackTimer: 0,

    // 3-point tracking
    shotOrigin: new THREE.Vector3(0, 0, 0),
    isThreePointer: false,

    // Enhanced features
    lastBallPosition: new THREE.Vector3(0, 0, 0)
};

// =============================================================================
// ENHANCED MATERIALS & TEXTURES
// =============================================================================

const textureLoader = new THREE.TextureLoader();

const COURT_MATERIAL = new THREE.MeshPhongMaterial({
    map: textureLoader.load('src/court/court.png'),
    shininess: 60
});
COURT_MATERIAL.map.wrapS = THREE.RepeatWrapping;
COURT_MATERIAL.map.wrapT = THREE.RepeatWrapping;
COURT_MATERIAL.map.repeat.set(8, 8);

const BALL_MATERIAL = new THREE.MeshStandardMaterial({
    map: textureLoader.load('src/ball/color.png'),
    bumpMap: textureLoader.load('src/ball/bump.png'),
    bumpScale: 0.02,
    roughnessMap: textureLoader.load('src/ball/roughbump.png'),
    roughness: 1.0,
});

const WHITE_LINE_MATERIAL = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0.1,
    side: THREE.DoubleSide
});

const RED_PAINT_MATERIAL = new THREE.MeshStandardMaterial({
    color: 0xcc2936,
    roughness: 0.8,
    metalness: 0.1,
    side: THREE.DoubleSide
});

const POLE_MATERIAL = new THREE.MeshStandardMaterial({
    color: 0x2c2c2c,
    roughness: 0.3,
    metalness: 0.7
});

const RIM_MATERIAL = new THREE.MeshStandardMaterial({
    color: 0xff4500,
    roughness: 0.2,
    metalness: 0.8
});

const NET_MATERIAL = new THREE.LineBasicMaterial({
    color: 0xffffff,
    linewidth: 3,
    transparent: true,
    opacity: 1.0
});

const BACKBOARD_MATERIAL = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    roughness: 0.1,
    metalness: 0.1
});

const BALL_SEAM_MATERIAL = new THREE.MeshStandardMaterial({
    map: textureLoader.load('src/ball/bump.png'),
    color: 0x2a2a2a,
    roughness: 0.8,
    metalness: 0.1,
    bumpMap: textureLoader.load('src/ball/bump.png'),
    bumpScale: 0.005,
    aoMap: textureLoader.load('src/ball/bump.png'),
    aoMapIntensity: 0.5
});

const BALL_LOGO_MATERIAL = new THREE.MeshBasicMaterial({
    map: textureLoader.load('src/ball/nike.png'),
    transparent: true,
    alphaTest: 0.1,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4
});

// =============================================================================
// SCENE SETUP
// =============================================================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue default

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.copy(CAMERA_INITIAL_POS);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);

// Global system references
let ballGroup;
let rightHoop, leftHoop;
let dayNightCycle;
let shotPredictor;
let particleSystem;
let performanceManager;

// =============================================================================
// ENHANCED UI FRAMEWORK
// =============================================================================

class GameUI {
    constructor() {
        this.setupStyles();
        this.createGameInterface();
    }

    setupStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .game-ui {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                color: white;
                position: absolute;
                z-index: 1000;
                background: linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(17, 17, 35, 0.95));
                padding: 20px;
                border-radius: 15px;
                backdrop-filter: blur(15px);
                border: 2px solid rgba(255, 107, 53, 0.4);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            }

            .scoreboard {
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                text-align: center;
                min-width: 350px;
            }

            .score-display {
                font-size: 36px;
                font-weight: bold;
                color: #ff6b35;
                margin: 10px 0;
                text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
            }

            .stats-row {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                font-size: 16px;
            }

            .stat-item {
                background: rgba(255, 107, 53, 0.2);
                padding: 5px 10px;
                border-radius: 8px;
                border: 1px solid rgba(255, 107, 53, 0.3);
            }

            .controls-panel {
                bottom: 20px;
                left: 20px;
                max-width: 280px;
            }

            .controls-panel h3 {
                margin: 0 0 15px 0;
                color: #ff6b35;
                font-size: 20px;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
            }

            .control-item {
                margin: 8px 0;
                padding: 6px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                border-left: 3px solid #ff6b35;
                font-size: 13px;
            }

            .control-key {
                display: inline-block;
                background: #ff6b35;
                color: white;
                padding: 3px 6px;
                border-radius: 3px;
                font-weight: bold;
                margin-right: 6px;
                min-width: 18px;
                text-align: center;
                font-size: 11px;
            }

            .power-panel {
                bottom: 20px;
                right: 320px;
                min-width: 200px;
            }

            .power-display {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 15px;
                text-align: center;
            }

            .power-bar {
                width: 100%;
                height: 20px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                overflow: hidden;
                border: 2px solid rgba(255, 107, 53, 0.4);
            }

            .power-fill {
                height: 100%;
                background: linear-gradient(90deg, #00ff00, #ffff00, #ff0000);
                border-radius: 8px;
                transition: width 0.1s ease;
            }

            .feedback-panel {
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                font-size: 32px;
                font-weight: bold;
                padding: 30px;
                background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(26, 26, 46, 0.9));
                border: 3px solid;
                text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
                display: none;
                min-width: 250px;
            }

            .feedback-made {
                color: #00ff00;
                border-color: #00ff00;
                animation: pulse-green 0.5s ease-in-out;
            }

            .feedback-missed {
                color: #ff4444;
                border-color: #ff4444;
                animation: pulse-red 0.5s ease-in-out;
            }

            @keyframes pulse-green {
                0%, 100% { transform: translate(-50%, -50%) scale(1); }
                50% { transform: translate(-50%, -50%) scale(1.1); }
            }

            @keyframes pulse-red {
                0%, 100% { transform: translate(-50%, -50%) scale(1); }
                50% { transform: translate(-50%, -50%) scale(1.05); }
            }

            .game-status {
                margin-top: 15px;
                font-size: 14px;
                color: #ccc;
                text-align: center;
            }
        `;
        document.head.appendChild(style);
    }

    createGameInterface() {
        // Main scoreboard
        this.scoreboard = document.createElement('div');
        this.scoreboard.className = 'game-ui scoreboard';
        this.scoreboard.innerHTML = `
            <h2 style="margin: 0 0 10px 0; color: #ff6b35;">🏀 SUPER BASKETBALL ARENA</h2>
            <div class="score-display" id="score-display">SCORE: 0</div>
            <div class="stats-row">
                <div class="stat-item">
                    <strong>Attempts:</strong> <span id="attempts">0</span>
                </div>
                <div class="stat-item">
                    <strong>Made:</strong> <span id="made">0</span>
                </div>
                <div class="stat-item">
                    <strong>Accuracy:</strong> <span id="accuracy">0%</span>
                </div>
            </div>
            <div class="game-status" id="game-status">🌟 SUPER ARENA: Enhanced with Day/Night, Replay, Particles & More! 🌟</div>
        `;
        document.body.appendChild(this.scoreboard);

        // Enhanced controls panel
        this.controlsPanel = document.createElement('div');
        this.controlsPanel.className = 'game-ui controls-panel';
        this.controlsPanel.innerHTML = `
            <h3>🎮 SUPER CONTROLS</h3>
            <div class="control-item">
                <span class="control-key">←→↑↓</span>Move Basketball
            </div>
            <div class="control-item">
                <span class="control-key">W/S</span>Adjust Shot Power
            </div>
            <div class="control-item">
                <span class="control-key">SPACE</span>Shoot Basketball
            </div>
            <div class="control-item">
                <span class="control-key">P</span>Toggle Shot Predictor
            </div>
            <div class="control-item">
                <span class="control-key">T</span>Change Time of Day
            </div>
            <div class="control-item">
                <span class="control-key">R</span>Reset Ball Position
            </div>
            <div class="control-item">
                <span class="control-key">O</span>Toggle Camera Controls
            </div>
            <div class="control-item">
                <span class="control-key">I</span>Animate Net
            </div>
            <div class="control-item">
                <span class="control-key">F</span>Toggle Fullscreen
            </div>
        `;
        document.body.appendChild(this.controlsPanel);

        // Power adjustment panel
        this.powerPanel = document.createElement('div');
        this.powerPanel.className = 'game-ui power-panel';
        this.powerPanel.innerHTML = `
            <div class="power-display" id="power-display">SHOT POWER: 50%</div>
            <div class="power-bar">
                <div class="power-fill" id="power-fill" style="width: 50%"></div>
            </div>
            <div style="text-align: center; margin-top: 10px; font-size: 12px; color: #ccc;">
                Use W/S keys to adjust
            </div>
        `;
        document.body.appendChild(this.powerPanel);

        // Shot feedback panel
        this.feedbackPanel = document.createElement('div');
        this.feedbackPanel.className = 'game-ui feedback-panel';
        this.feedbackPanel.id = 'feedback-panel';
        document.body.appendChild(this.feedbackPanel);
    }

    updateScore(score, attempts, made) {
        document.getElementById('score-display').textContent = `SCORE: ${score}`;
        document.getElementById('attempts').textContent = attempts;
        document.getElementById('made').textContent = made;

        const accuracy = attempts > 0 ? Math.round((made / attempts) * 100) : 0;
        document.getElementById('accuracy').textContent = `${accuracy}%`;
    }

    updatePower(power) {
        const percentage = Math.round(power * 100);
        document.getElementById('power-display').textContent = `SHOT POWER: ${percentage}%`;
        document.getElementById('power-fill').style.width = `${percentage}%`;
    }

    showShotFeedback(made) {
        const panel = document.getElementById('feedback-panel');
        panel.style.display = 'block';

        if (made) {
            const shotType = gameState.isThreePointer ? '3-POINTER MADE! 🔥' : 'SHOT MADE! 🎉';
            panel.textContent = shotType;
            panel.className = 'game-ui feedback-panel feedback-made';
        } else {
            const missType = gameState.isThreePointer ? 'MISSED 3-POINTER 😔' : 'MISSED SHOT 😔';
            panel.textContent = missType;
            panel.className = 'game-ui feedback-panel feedback-missed';
        }

        setTimeout(() => {
            panel.style.display = 'none';
        }, 2000);
    }

    updateGameStatus(status) {
        document.getElementById('game-status').textContent = status;
    }
}

// =============================================================================
// NET ANIMATION SYSTEM
// =============================================================================

function updateNetAnimation(deltaTime) {
    const hoops = [rightHoop, leftHoop];

    for (const hoop of hoops) {
        if (!hoop || !hoop.userData.net || !hoop.userData.net.animation.isActive) {
            continue;
        }

        const net = hoop.userData.net;
        const anim = net.animation;
        anim.time += deltaTime;

        const damping = 1.0 - Math.min(1.0, anim.time / anim.duration);

        if (damping <= 0) {
            anim.isActive = false;

            for (let i = 0; i < net.geometries.length; i++) {
                net.geometries[i].attributes.position.copy(net.originalPositions[i]);
                net.geometries[i].attributes.position.needsUpdate = true;
            }
            continue;
        }

        for (let i = 0; i < net.geometries.length; i++) {
            const geometry = net.geometries[i];
            const positions = geometry.attributes.position;
            const originalPositions = net.originalPositions[i];
            const vertexCount = positions.count;

            for (let j = 0; j < vertexCount; j++) {
                const originalX = originalPositions.getX(j);
                const originalY = originalPositions.getY(j);
                const originalZ = originalPositions.getZ(j);

                const ripple = Math.sin(originalY * anim.frequency + anim.time * anim.speed);
                const effectStrength = Math.abs(originalY / 0.45);

                const offsetX = ripple * anim.amplitude * effectStrength * damping;
                const offsetZ = ripple * anim.amplitude * effectStrength * damping;

                positions.setXYZ(j, originalX + offsetX, originalY, originalZ + offsetZ);
            }
            positions.needsUpdate = true;
        }
    }
}

function triggerNetAnimation() {
    if (!rightHoop || !leftHoop) return;

    const rightHoopPos = new THREE.Vector3();
    const leftHoopPos = new THREE.Vector3();

    if (rightHoop.userData.rimPosition) {
        rightHoop.localToWorld(rightHoopPos.copy(rightHoop.userData.rimPosition));
    }
    if (leftHoop.userData.rimPosition) {
        leftHoop.localToWorld(leftHoopPos.copy(leftHoop.userData.rimPosition));
    }

    const distToRight = gameState.ballPosition.distanceTo(rightHoopPos);
    const distToLeft = gameState.ballPosition.distanceTo(leftHoopPos);

    const targetHoop = distToRight < distToLeft ? rightHoop : leftHoop;
    const hoopSide = distToRight < distToLeft ? 'right' : 'left';

    if (targetHoop.userData.net) {
        targetHoop.userData.net.animation.isActive = true;
        targetHoop.userData.net.animation.time = 0;
        ui.updateGameStatus(`🌊 Net SWISH animation on ${hoopSide} hoop! 🏀✨`);
    }
}

// =============================================================================
// COURT CONSTRUCTION FUNCTIONS
// =============================================================================

function createCourtFloor() {
    const courtGroup = new THREE.Group();

    const courtGeometry = new THREE.BoxGeometry(COURT_LENGTH + 4, 0.3, COURT_WIDTH + 4);
    const court = new THREE.Mesh(courtGeometry, COURT_MATERIAL);
    court.position.y = COURT_FLOOR_Y - 0.15;
    court.receiveShadow = true;
    court.castShadow = true;
    courtGroup.add(court);

    const borderMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b4513,
        roughness: 0.7,
        metalness: 0.2
    });

    const borderThickness = 0.5;
    const borderHeight = 0.1;

    const sideBorderGeo = new THREE.BoxGeometry(COURT_LENGTH + 4 + borderThickness * 2, borderHeight, borderThickness);
    const topBorder = new THREE.Mesh(sideBorderGeo, borderMaterial);
    topBorder.position.set(0, borderHeight / 2, (COURT_WIDTH + 4) / 2 + borderThickness / 2);
    topBorder.castShadow = true;
    courtGroup.add(topBorder);

    const bottomBorder = topBorder.clone();
    bottomBorder.position.z = -topBorder.position.z;
    courtGroup.add(bottomBorder);

    const endBorderGeo = new THREE.BoxGeometry(borderThickness, borderHeight, COURT_WIDTH + 4);
    const leftBorder = new THREE.Mesh(endBorderGeo, borderMaterial);
    leftBorder.position.set(-(COURT_LENGTH + 4) / 2 - borderThickness / 2, borderHeight / 2, 0);
    leftBorder.castShadow = true;
    courtGroup.add(leftBorder);

    const rightBorder = leftBorder.clone();
    rightBorder.position.x = -leftBorder.position.x;
    courtGroup.add(rightBorder);

    return courtGroup;
}

function createBoundaryLines() {
    const group = new THREE.Group();
    group.name = 'Boundary Lines';
    const y = COURT_FLOOR_Y + LINES_Y_OFFSET;

    const sidelineGeo = new THREE.BoxGeometry(COURT_LENGTH, 0.02, LINE_THICKNESS);
    const sidelineTop = new THREE.Mesh(sidelineGeo, WHITE_LINE_MATERIAL);
    sidelineTop.position.set(0, y, COURT_WIDTH / 2 - LINE_THICKNESS / 2);
    sidelineTop.castShadow = true;
    group.add(sidelineTop);

    const sidelineBottom = sidelineTop.clone();
    sidelineBottom.position.z = -sidelineTop.position.z;
    group.add(sidelineBottom);

    const endlineGeo = new THREE.BoxGeometry(LINE_THICKNESS, 0.02, COURT_WIDTH);
    const endlineLeft = new THREE.Mesh(endlineGeo, WHITE_LINE_MATERIAL);
    endlineLeft.position.set(-COURT_LENGTH / 2 + LINE_THICKNESS / 2, y, 0);
    endlineLeft.castShadow = true;
    group.add(endlineLeft);

    const endlineRight = endlineLeft.clone();
    endlineRight.position.x = -endlineLeft.position.x;
    group.add(endlineRight);

    const centerLineGeo = new THREE.BoxGeometry(LINE_THICKNESS, 0.02, COURT_WIDTH);
    const centerLine = new THREE.Mesh(centerLineGeo, WHITE_LINE_MATERIAL);
    centerLine.position.y = y;
    centerLine.castShadow = true;
    group.add(centerLine);

    return group;
}

function createCenterCircle() {
    const group = new THREE.Group();
    group.name = 'Center Circle';
    const y = COURT_FLOOR_Y + LINES_Y_OFFSET;
    const radius = 1.8;

    const ringGeo = new THREE.RingGeometry(radius - LINE_THICKNESS, radius, 64);
    const circleLine = new THREE.Mesh(ringGeo, WHITE_LINE_MATERIAL);
    circleLine.rotation.x = -Math.PI / 2;
    circleLine.position.y = y;
    circleLine.castShadow = true;
    group.add(circleLine);

    const fillerGeo = new THREE.CircleGeometry(radius - LINE_THICKNESS, 64);
    const fillerCircle = new THREE.Mesh(fillerGeo, RED_PAINT_MATERIAL);
    fillerCircle.receiveShadow = true;
    fillerCircle.castShadow = true;
    fillerCircle.rotation.x = -Math.PI / 2;
    fillerCircle.position.y = y - 0.001;
    group.add(fillerCircle);

    return group;
}

function createEndzoneMarkings() {
    const group = new THREE.Group();
    group.name = 'Endzone Markings';
    const y = COURT_FLOOR_Y + LINES_Y_OFFSET;

    const arcRadius = 6.75;
    const hoopDistFromBaseline = 1.575;
    const zPos = (COURT_WIDTH / 2) - 0.9;
    const arcCenterX = (COURT_LENGTH / 2) - hoopDistFromBaseline;
    const intersectX = arcCenterX - Math.sqrt(arcRadius**2 - zPos**2);
    const segmentLength = (COURT_LENGTH / 2) - intersectX;

    const threePointSegmentGeo = new THREE.BoxGeometry(segmentLength, 0.02, LINE_THICKNESS);
    const topSegment = new THREE.Mesh(threePointSegmentGeo, WHITE_LINE_MATERIAL);
    topSegment.position.set(intersectX + segmentLength / 2, y, zPos);
    topSegment.castShadow = true;
    group.add(topSegment);

    const bottomSegment = topSegment.clone();
    bottomSegment.position.set(intersectX + segmentLength / 2, y, -zPos);
    group.add(bottomSegment);

    const angle = Math.asin(zPos / arcRadius);
    const startAngle = Math.PI - angle;
    const sweepAngle = angle * 2;
    const threePointArcGeo = new THREE.RingGeometry(arcRadius - LINE_THICKNESS, arcRadius, 64, 1, startAngle, sweepAngle);
    const threePointArc = new THREE.Mesh(threePointArcGeo, WHITE_LINE_MATERIAL);
    threePointArc.position.set(arcCenterX, y, 0);
    threePointArc.rotation.x = -Math.PI / 2;
    threePointArc.castShadow = true;
    group.add(threePointArc);

    const laneWidth = 4.9;
    const laneLength = 5.8;
    const freeThrowLineX = (COURT_LENGTH / 2) - laneLength;

    const laneSideGeo = new THREE.BoxGeometry(laneLength, 0.02, LINE_THICKNESS);
    const topLaneLine = new THREE.Mesh(laneSideGeo, WHITE_LINE_MATERIAL);
    topLaneLine.position.set((COURT_LENGTH / 2) - (laneLength / 2), y, laneWidth / 2);
    topLaneLine.castShadow = true;
    group.add(topLaneLine);

    const bottomLaneLine = topLaneLine.clone();
    bottomLaneLine.position.z = -topLaneLine.position.z;
    group.add(bottomLaneLine);

    const freeThrowLineGeo = new THREE.BoxGeometry(LINE_THICKNESS, 0.02, laneWidth);
    const freeThrowLine = new THREE.Mesh(freeThrowLineGeo, WHITE_LINE_MATERIAL);
    freeThrowLine.position.set(freeThrowLineX, y, 0);
    freeThrowLine.castShadow = true;
    group.add(freeThrowLine);

    const freeThrowArcRadius = 1.8;
    const arcRingGeo = new THREE.RingGeometry(freeThrowArcRadius - LINE_THICKNESS, freeThrowArcRadius, 64, 1, Math.PI / 2, Math.PI);
    const arcLine = new THREE.Mesh(arcRingGeo, WHITE_LINE_MATERIAL);
    arcLine.position.set(freeThrowLineX, y, 0);
    arcLine.rotation.x = -Math.PI / 2;
    arcLine.castShadow = true;
    group.add(arcLine);

    const arcFillerGeo = new THREE.CircleGeometry(freeThrowArcRadius - LINE_THICKNESS, 64, Math.PI / 2, Math.PI);
    const arcFiller = new THREE.Mesh(arcFillerGeo, RED_PAINT_MATERIAL);
    arcFiller.receiveShadow = true;
    arcFiller.castShadow = true;
    arcFiller.position.set(freeThrowLineX, y - 0.001, 0);
    arcFiller.rotation.x = -Math.PI / 2;
    group.add(arcFiller);

    return group;
}

function createHoop() {
    const group = new THREE.Group();
    group.name = 'Hoop Assembly';

    group.userData.net = {
        geometries: [],
        originalPositions: [],
        animation: {
            isActive: false,
            time: 0,
            duration: 2.0,
            amplitude: 0.25,
            frequency: 20.0,
            speed: 12.0
        }
    };

    const poleX = (COURT_LENGTH / 2) + POLE_RADIUS + 0.5;
    const backboardX = poleX - POLE_RADIUS - BACKBOARD_DIST_FROM_BASELINE;

    const poleGeo = new THREE.CylinderGeometry(POLE_RADIUS, POLE_RADIUS * 1.1, RIM_Y + BACKBOARD_HEIGHT / 2, 32);
    const pole = new THREE.Mesh(poleGeo, POLE_MATERIAL);
    pole.castShadow = true;
    pole.receiveShadow = true;
    pole.position.set(poleX, (RIM_Y + BACKBOARD_HEIGHT / 2) / 2, 0);
    group.add(pole);

    const baseGeo = new THREE.CylinderGeometry(POLE_RADIUS * 1.8, POLE_RADIUS * 2.2, 0.4, 32);
    const base = new THREE.Mesh(baseGeo, POLE_MATERIAL);
    base.castShadow = true;
    base.receiveShadow = true;
    base.position.set(poleX, 0.2, 0);
    group.add(base);

    const backboardGeo = new THREE.BoxGeometry(0.08, BACKBOARD_HEIGHT, BACKBOARD_WIDTH);
    const glassBackboard = new THREE.Mesh(backboardGeo, BACKBOARD_MATERIAL);
    glassBackboard.name = 'backboard';
    glassBackboard.castShadow = true;
    glassBackboard.receiveShadow = true;
    glassBackboard.position.set(backboardX, RIM_Y + (BACKBOARD_HEIGHT / 2) - 0.15, 0);
    group.add(glassBackboard);

    group.userData.backboard = glassBackboard;

    const squareGeo = new THREE.PlaneGeometry(0.59, 0.45);
    const squareMaterial = new THREE.MeshStandardMaterial({
        color: 0xff4500,
        roughness: 0.8,
        metalness: 0.1,
        transparent: true,
        opacity: 0.8
    });
    const square = new THREE.Mesh(squareGeo, squareMaterial);
    square.position.set(glassBackboard.position.x - 0.041, RIM_Y + 0.225, 0);
    square.rotation.y = Math.PI / 2;
    square.castShadow = true;
    group.add(square);

    const armLength = pole.position.x - POLE_RADIUS - (glassBackboard.position.x + 0.04);
    const armGeo = new THREE.BoxGeometry(armLength, 0.12, 0.12);
    const arm = new THREE.Mesh(armGeo, POLE_MATERIAL);
    arm.castShadow = true;
    arm.receiveShadow = true;
    arm.position.set(glassBackboard.position.x + 0.04 + (armLength / 2), RIM_Y, 0);
    group.add(arm);

    const connectorDepth = 0.15;
    const connectorGeo = new THREE.BoxGeometry(connectorDepth, 0.08, 0.25);
    const connector = new THREE.Mesh(connectorGeo, RIM_MATERIAL);
    connector.position.set(glassBackboard.position.x - 0.04 - (connectorDepth / 2), RIM_Y, 0);
    connector.castShadow = true;
    group.add(connector);

    const rimGeo = new THREE.TorusGeometry(RIM_RADIUS, 0.025, 16, 64);
    const rim = new THREE.Mesh(rimGeo, RIM_MATERIAL);
    rim.castShadow = true;
    rim.receiveShadow = true;
    rim.position.set(connector.position.x - (connectorDepth / 2) - RIM_RADIUS, RIM_Y, 0);
    rim.rotation.x = Math.PI / 2;
    group.add(rim);

    group.userData.rimPosition = rim.position.clone();
    group.userData.rimRadius = RIM_RADIUS;

    const netGroup = new THREE.Group();
    const numMainStrands = 12;
    const netLength = 0.45;
    const netBottomRadius = RIM_RADIUS * 0.3;

    const processStrand = (points) => {
        const strandGeo = new THREE.BufferGeometry().setFromPoints(points);
        const strand = new THREE.Line(strandGeo, NET_MATERIAL);

        group.userData.net.geometries.push(strandGeo);
        group.userData.net.originalPositions.push(strandGeo.attributes.position.clone());

        netGroup.add(strand);
    };

    for (let i = 0; i < numMainStrands; i++) {
        const angle = (i / numMainStrands) * Math.PI * 2;
        const segmentCount = 10;
        const strandPoints = [];

        for (let j = 0; j <= segmentCount; j++) {
            const t = j / segmentCount;
            const curveFactor = Math.sin(t * Math.PI) * 0.08;
            const radiusAtPoint = RIM_RADIUS * 0.95 * (1 - t * 0.7) + netBottomRadius * t;
            const swayFactor = Math.sin(angle * 3 + t * Math.PI) * 0.02;

            const x = radiusAtPoint * Math.cos(angle) + curveFactor * Math.cos(angle + Math.PI/2) + swayFactor;
            const y = -t * netLength - Math.pow(t, 2.5) * 0.12;
            const z = radiusAtPoint * Math.sin(angle) + curveFactor * Math.sin(angle + Math.PI/2) + swayFactor;

            strandPoints.push(new THREE.Vector3(x, y, z));
        }
        processStrand(strandPoints);
    }

    const horizontalLevels = 5;
    for (let level = 1; level <= horizontalLevels; level++) {
        const levelHeight = -(level / horizontalLevels) * netLength * 0.85;
        const levelRadius = RIM_RADIUS * 0.95 * (1 - (level / horizontalLevels) * 0.7) + netBottomRadius * (level / horizontalLevels);

        for (let i = 0; i < numMainStrands; i++) {
            const angle1 = (i / numMainStrands) * Math.PI * 2;
            const angle2 = ((i + 1) / numMainStrands) * Math.PI * 2;
            const sag = Math.pow(level / horizontalLevels, 2) * 0.03;
            const x1 = levelRadius * Math.cos(angle1);
            const z1 = levelRadius * Math.sin(angle1);
            const x2 = levelRadius * Math.cos(angle2);
            const z2 = levelRadius * Math.sin(angle2);
            const midX = (x1 + x2) / 2;
            const midZ = (z1 + z2) / 2;

            const horizontalPoints = [
                new THREE.Vector3(x1, levelHeight, z1),
                new THREE.Vector3(midX, levelHeight - sag, midZ),
                new THREE.Vector3(x2, levelHeight, z2)
            ];
            processStrand(horizontalPoints);
        }
    }

    for (let i = 0; i < 8; i++) {
        const angle = (Math.random() * Math.PI * 2);
        const startRadius = RIM_RADIUS * (0.7 + Math.random() * 0.2);
        const startX = startRadius * Math.cos(angle);
        const startZ = startRadius * Math.sin(angle);

        const loosePoints = [
            new THREE.Vector3(startX, -netLength * 0.2, startZ),
            new THREE.Vector3(startX * 0.9 + (Math.random() - 0.5) * 0.05, -netLength * 0.5, startZ * 0.9 + (Math.random() - 0.5) * 0.05),
            new THREE.Vector3(startX * 0.6 + (Math.random() - 0.5) * 0.08, -netLength * 0.8, startZ * 0.6 + (Math.random() - 0.5) * 0.08),
            new THREE.Vector3(startX * 0.3 + (Math.random() - 0.5) * 0.1, -netLength * 1.05, startZ * 0.3 + (Math.random() - 0.5) * 0.1)
        ];
        processStrand(loosePoints);
    }

    netGroup.position.copy(rim.position);
    group.add(netGroup);

    return group;
}

function createBall() {
    const group = new THREE.Group();
    group.name = "Basketball";

    const ballGeo = new THREE.SphereGeometry(BALL_RADIUS, 64, 64);
    const ballMesh = new THREE.Mesh(ballGeo, BALL_MATERIAL);
    ballMesh.castShadow = true;
    ballMesh.receiveShadow = true;
    group.add(ballMesh);

    const seamTubeRadius = 0.001;

    function createTubeFromPath(path) {
        const tubeGeo = new THREE.TubeGeometry(path, 128, seamTubeRadius, 8, path.closed);
        return new THREE.Mesh(tubeGeo, BALL_SEAM_MATERIAL);
    }

    const mainSeamPath = new THREE.CatmullRomCurve3((() => {
        const pts = [];
        for (let i = 0; i <= 256; i++) {
            const t = i / 256;
            const θ = t * Math.PI * 2;
            pts.push(new THREE.Vector3(
                BALL_RADIUS * Math.cos(θ) * Math.cos(Math.sin(2 * θ)),
                BALL_RADIUS * Math.sin(θ) * Math.cos(Math.sin(2 * θ)),
                BALL_RADIUS * Math.sin(Math.sin(2 * θ))
            ));
        }
        return pts;
    })(), true);
    group.add(createTubeFromPath(mainSeamPath));

    const oppositeSeamPath = new THREE.CatmullRomCurve3((() => {
        const pts = [];
        for (let i = 0; i <= 256; i++) {
            const t = i / 256;
            const θ = t * Math.PI * 2;
            pts.push(new THREE.Vector3(
                BALL_RADIUS * Math.cos(θ + Math.PI) * Math.cos(Math.sin(2 * θ + Math.PI)),
                BALL_RADIUS * Math.sin(θ + Math.PI) * Math.cos(Math.sin(2 * θ + Math.PI)),
                BALL_RADIUS * Math.sin(Math.sin(2 * θ + Math.PI))
            ));
        }
        return pts;
    })(), true);
    group.add(createTubeFromPath(oppositeSeamPath));

    const createVerticalSeam = (rotation) => new THREE.CatmullRomCurve3((() => {
        const pts = [];
        for (let i = 0; i <= 128; i++) {
            const t = i / 128;
            const φ = t * Math.PI;
            pts.push(new THREE.Vector3(
                BALL_RADIUS * Math.sin(φ) * Math.cos(rotation),
                BALL_RADIUS * Math.cos(φ),
                BALL_RADIUS * Math.sin(φ) * Math.sin(rotation)
            ));
        }
        return pts;
    })(), false);

    for (let i = 0; i < 4; i++) {
        const verticalSeamCurve = createVerticalSeam((i * Math.PI) / 2);
        group.add(createTubeFromPath(verticalSeamCurve));
    }

    const horizontalSeamPath = new THREE.CatmullRomCurve3((() => {
        const pts = [];
        for (let i = 0; i <= 256; i++) {
            const t = i / 256;
            const θ = t * Math.PI * 2;
            pts.push(new THREE.Vector3(
                BALL_RADIUS * Math.cos(θ),
                0,
                BALL_RADIUS * Math.sin(θ)
            ));
        }
        return pts;
    })(), true);
    group.add(createTubeFromPath(horizontalSeamPath));

    const logoSize = BALL_RADIUS * 0.6;
    const logoGeo = new THREE.PlaneGeometry(logoSize, logoSize);

    const logoPositions = [
        { position: new THREE.Vector3(BALL_RADIUS, 0, 0), normal: new THREE.Vector3(1, 0, 0) },
        { position: new THREE.Vector3(-BALL_RADIUS, 0, 0), normal: new THREE.Vector3(-1, 0, 0) }
    ];

    logoPositions.forEach((logoData, index) => {
        const logoMesh = new THREE.Mesh(logoGeo, BALL_LOGO_MATERIAL);
        logoMesh.renderOrder = 1;
        logoMesh.position.copy(logoData.position);
        logoMesh.position.addScaledVector(logoData.normal, 0.001);
        logoMesh.lookAt(logoData.position.clone().multiplyScalar(2));
        logoMesh.castShadow = false;
        group.add(logoMesh);
    });

    return group;
}

// =============================================================================
// ENHANCED PHYSICS SYSTEM
// =============================================================================

class PhysicsSystem {
    static updateBallPhysics(deltaTime) {
        // Store last position for trail effects
        gameState.lastBallPosition.copy(gameState.ballPosition);

        if (gameState.isShooting) {
            // Apply gravity
            gameState.ballVelocity.y += GRAVITY * deltaTime;

            // Update position based on velocity
            const deltaPos = gameState.ballVelocity.clone().multiplyScalar(deltaTime);
            gameState.ballPosition.add(deltaPos);

            // Create ball trail particles
            if (particleSystem && gameState.ballVelocity.length() > 2) {
                particleSystem.createBallTrail(gameState.ballPosition);
            }

            // Ground collision detection and bouncing
            if (gameState.ballPosition.y <= COURT_FLOOR_Y + BALL_RADIUS + LINES_Y_OFFSET) {
                gameState.ballPosition.y = COURT_FLOOR_Y + BALL_RADIUS + LINES_Y_OFFSET;
                gameState.ballVelocity.y = -gameState.ballVelocity.y * BOUNCE_DAMPING;
                gameState.ballVelocity.x *= BOUNCE_DAMPING;
                gameState.ballVelocity.z *= BOUNCE_DAMPING;

                // Create dust particles on bounce
                if (particleSystem) {
                    particleSystem.createCourtDust(gameState.ballPosition);
                }

                // Stop ball if velocity is too low
                if (Math.abs(gameState.ballVelocity.y) < 0.1 &&
                    gameState.ballVelocity.length() < 0.5) {
                    gameState.ballVelocity.set(0, 0, 0);
                    gameState.ballAngularVelocity.set(0, 0, 0);
                    gameState.isShooting = false;
                }
            }

            // Court boundary collision detection
            const courtEdgeX = COURT_LENGTH / 2 - BALL_RADIUS;
            if (gameState.ballPosition.x >= courtEdgeX) {
                gameState.ballPosition.x = courtEdgeX;
                gameState.ballVelocity.x = -gameState.ballVelocity.x * BOUNCE_DAMPING;
            } else if (gameState.ballPosition.x <= -courtEdgeX) {
                gameState.ballPosition.x = -courtEdgeX;
                gameState.ballVelocity.x = -gameState.ballVelocity.x * BOUNCE_DAMPING;
            }

            const courtEdgeZ = COURT_WIDTH / 2 - BALL_RADIUS;
            if (gameState.ballPosition.z >= courtEdgeZ) {
                gameState.ballPosition.z = courtEdgeZ;
                gameState.ballVelocity.z = -gameState.ballVelocity.z * BOUNCE_DAMPING;
            } else if (gameState.ballPosition.z <= -courtEdgeZ) {
                gameState.ballPosition.z = -courtEdgeZ;
                gameState.ballVelocity.z = -gameState.ballVelocity.z * BOUNCE_DAMPING;
            }

            // Enhanced ball rotation
            const velocityLength = gameState.ballVelocity.length();
            if (velocityLength > 0.1) {
                const rotationAxis = new THREE.Vector3(-gameState.ballVelocity.z, 0, gameState.ballVelocity.x).normalize();
                const rotationSpeed = velocityLength * ROTATION_SCALE * deltaTime;
                gameState.ballAngularVelocity.copy(rotationAxis.multiplyScalar(rotationSpeed));
            }

            gameState.ballRotation.add(gameState.ballAngularVelocity);

            this.checkBackboardCollision();
            this.checkHoopCollision();
        }

        // Update ball visual position and rotation
        if (ballGroup) {
            ballGroup.position.copy(gameState.ballPosition);
            ballGroup.rotation.x = gameState.ballRotation.x;
            ballGroup.rotation.y = gameState.ballRotation.y;
            ballGroup.rotation.z = gameState.ballRotation.z;
        }
    }

    static checkBackboardCollision() {
        if (!rightHoop || !leftHoop) return;

        const hoops = [rightHoop, leftHoop];

        hoops.forEach(hoop => {
            if (!hoop.userData.backboard) return;

            const backboard = hoop.userData.backboard;
            const backboardPos = new THREE.Vector3();
            hoop.localToWorld(backboardPos.copy(backboard.position));

            const backboardWidth = BACKBOARD_WIDTH;
            const backboardHeight = BACKBOARD_HEIGHT;
            const backboardThickness = 0.08;

            const ballToBackboard = gameState.ballPosition.clone().sub(backboardPos);
            const isWithinHeight = Math.abs(ballToBackboard.y) <= (backboardHeight / 2 + BALL_RADIUS);
            const isWithinWidth = Math.abs(ballToBackboard.z) <= (backboardWidth / 2 + BALL_RADIUS);

            if (isWithinHeight && isWithinWidth) {
                let hitFromFront = false;

                if (hoop === rightHoop) {
                    hitFromFront = gameState.ballPosition.x < backboardPos.x;
                } else {
                    hitFromFront = gameState.ballPosition.x > backboardPos.x;
                }

                const distanceToBackboard = Math.abs(ballToBackboard.x);
                const collisionThreshold = (backboardThickness / 2) + BALL_RADIUS;

                if (distanceToBackboard <= collisionThreshold) {
                    if (hoop === rightHoop) {
                        if (hitFromFront) {
                            gameState.ballPosition.x = backboardPos.x - collisionThreshold;
                        } else {
                            gameState.ballPosition.x = backboardPos.x + collisionThreshold;
                        }
                    } else {
                        if (hitFromFront) {
                            gameState.ballPosition.x = backboardPos.x + collisionThreshold;
                        } else {
                            gameState.ballPosition.x = backboardPos.x - collisionThreshold;
                        }
                    }

                    gameState.ballVelocity.x = -gameState.ballVelocity.x * BOUNCE_DAMPING * BACKBOARD_DAMP_FACTOR;
                    gameState.ballVelocity.y *= BOUNCE_DAMPING * 0.9 * BACKBOARD_DAMP_FACTOR;
                    gameState.ballVelocity.z *= BOUNCE_DAMPING * 0.95 * BACKBOARD_DAMP_FACTOR;

                    ui.updateGameStatus('Ball hit the backboard! 🏀');
                }
            }
        });
    }

    static checkHoopCollision() {
        if (!rightHoop || !leftHoop) return;

        const hoops = [rightHoop, leftHoop];
        const rimThickness = 0.025;

        hoops.forEach((hoop, hoopIndex) => {
            if (!hoop.userData.rimPosition) return;

            const rimPos = new THREE.Vector3();
            hoop.localToWorld(rimPos.copy(hoop.userData.rimPosition));

            const ballToRim = gameState.ballPosition.clone().sub(rimPos);
            const horizontalDistance = Math.sqrt(ballToRim.x * ballToRim.x + ballToRim.z * ballToRim.z);
            const verticalDistance = Math.abs(ballToRim.y);

            // Check for made basket
            if (horizontalDistance < RIM_RADIUS - BALL_RADIUS * 0.5 &&
                verticalDistance < BALL_RADIUS &&
                gameState.ballVelocity.y < 0) {

                this.scoreBasket(hoop);

            // Check for rim collision
            } else if (verticalDistance < BALL_RADIUS + rimThickness &&
                       horizontalDistance > RIM_RADIUS - BALL_RADIUS &&
                       horizontalDistance < RIM_RADIUS + rimThickness) {

                const collisionNormal = new THREE.Vector3(ballToRim.x, 0, ballToRim.z).normalize();
                gameState.ballVelocity.reflect(collisionNormal);
                gameState.ballVelocity.multiplyScalar(BOUNCE_DAMPING);
                gameState.ballVelocity.y = Math.abs(gameState.ballVelocity.y * BOUNCE_DAMPING * 0.5) + 0.5;

                const repositionVector = collisionNormal.clone().multiplyScalar(RIM_RADIUS + BALL_RADIUS - horizontalDistance + 0.01);
                gameState.ballPosition.add(repositionVector);

                // Create rim spark particles
                if (particleSystem) {
                    particleSystem.createRimSparks(rimPos);
                }

                const hoopSide = hoopIndex === 0 ? 'right' : 'left';
                ui.updateGameStatus(`Clank! Off the ${hoopSide} rim! 💥`);
            }
        });
    }

    static scoreBasket(hoop) {
        if (gameState.lastShotResult !== 'made') {
            const points = gameState.isThreePointer ? 3 : 2;
            gameState.score += points;
            gameState.shotsMade++;
            gameState.lastShotResult = 'made';
            ui.updateScore(gameState.score, gameState.shotAttempts, gameState.shotsMade);

            // Trigger net animation
            if (hoop && hoop.userData.net) {
                hoop.userData.net.animation.isActive = true;
                hoop.userData.net.animation.time = 0;
            }

            // Create score explosion particles
            if (particleSystem) {
                const rimPos = new THREE.Vector3();
                hoop.localToWorld(rimPos.copy(hoop.userData.rimPosition));
                particleSystem.createScoreExplosion(rimPos, gameState.isThreePointer);
            }

            const shotTypeText = gameState.isThreePointer ? '3-POINTER MADE! 🔥' : 'SHOT MADE! 🎉';
            const encouragementText = gameState.isThreePointer ? 'From downtown! Amazing!' : 'Great shooting!';

            setTimeout(() => {
                ui.showShotFeedback(true);
                ui.updateGameStatus(`${shotTypeText} ${encouragementText} 🏀`);
            }, 500);
        }
    }
}

// =============================================================================
// ENHANCED INPUT SYSTEM
// =============================================================================

class InputSystem {
    static handleInput(deltaTime) {
        if (gameState.isShooting) return;

        let moved = false;
        const moveVector = new THREE.Vector3();

        // Arrow key movement (slower and more controlled)
        if (gameState.keys['ArrowLeft']) {
            moveVector.x = -BALL_MOVEMENT_SPEED;
            moved = true;
        }
        if (gameState.keys['ArrowRight']) {
            moveVector.x = BALL_MOVEMENT_SPEED;
            moved = true;
        }
        if (gameState.keys['ArrowUp']) {
            moveVector.z = -BALL_MOVEMENT_SPEED;
            moved = true;
        }
        if (gameState.keys['ArrowDown']) {
            moveVector.z = BALL_MOVEMENT_SPEED;
            moved = true;
        }

        // Apply movement with boundary checking
        if (moved) {
            const newPosition = gameState.ballPosition.clone().add(moveVector);

            // Keep ball within court boundaries
            const maxX = COURT_LENGTH / 2 - BALL_RADIUS;
            const maxZ = COURT_WIDTH / 2 - BALL_RADIUS;

            newPosition.x = Math.max(-maxX, Math.min(maxX, newPosition.x));
            newPosition.z = Math.max(-maxZ, Math.min(maxZ, newPosition.z));

            gameState.ballPosition.copy(newPosition);

            // Add rotation during movement
            const rotationAxis = new THREE.Vector3(-moveVector.z, 0, moveVector.x).normalize();
            const rotationSpeed = moveVector.length() * ROTATION_SCALE * deltaTime;
            gameState.ballAngularVelocity.copy(rotationAxis.multiplyScalar(rotationSpeed));
            gameState.ballRotation.add(gameState.ballAngularVelocity);

            gameState.isMoving = true;
        } else {
            gameState.isMoving = false;
            gameState.ballAngularVelocity.multiplyScalar(0.95);
        }

        // Power adjustment (slower and more precise)
        if (gameState.keys['KeyW']) {
            gameState.shotPower = Math.min(MAX_SHOT_POWER, gameState.shotPower + POWER_STEP);
            ui.updatePower(gameState.shotPower);
        }
        if (gameState.keys['KeyS']) {
            gameState.shotPower = Math.max(MIN_SHOT_POWER, gameState.shotPower - POWER_STEP);
            ui.updatePower(gameState.shotPower);
        }
    }

    static shootBall() {
        if (gameState.isShooting) return;

        // Store the shot origin for 3-point calculation
        gameState.shotOrigin.copy(gameState.ballPosition);

        // Find the nearest hoop to target
        const rightHoopPos = new THREE.Vector3();
        const leftHoopPos = new THREE.Vector3();

        if (rightHoop && rightHoop.userData.rimPosition) {
            rightHoop.localToWorld(rightHoopPos.copy(rightHoop.userData.rimPosition));
        }
        if (leftHoop && leftHoop.userData.rimPosition) {
            leftHoop.localToWorld(leftHoopPos.copy(leftHoop.userData.rimPosition));
        }

        const distToRight = gameState.ballPosition.distanceTo(rightHoopPos);
        const distToLeft = gameState.ballPosition.distanceTo(leftHoopPos);
        const targetHoopPos = distToRight < distToLeft ? rightHoopPos : leftHoopPos;

        // Check if this is a 3-point shot
        gameState.isThreePointer = isThreePointShot(gameState.shotOrigin, targetHoopPos);

        // Enhanced skill-based trajectory calculation
        const toHoop = targetHoopPos.clone().sub(gameState.ballPosition);
        const horizontalDistance = Math.sqrt(toHoop.x * toHoop.x + toHoop.z * toHoop.z);
        const verticalDistance = toHoop.y;

        const TIME_TO_RIM = 1.6; // Slightly longer for more realistic arc

        const perfect_vy = (verticalDistance - 0.5 * GRAVITY * TIME_TO_RIM * TIME_TO_RIM) / TIME_TO_RIM;
        const perfect_vx = toHoop.x / TIME_TO_RIM;
        const perfect_vz = toHoop.z / TIME_TO_RIM;

        const perfectVelocity = new THREE.Vector3(perfect_vx, perfect_vy, perfect_vz);

        // Enhanced power system with distance-based ideal power
        const MAX_SHOOTING_DISTANCE = 25.0;
        const distanceRatio = Math.min(1.0, horizontalDistance / MAX_SHOOTING_DISTANCE);
        const idealPower = MIN_SHOT_POWER + distanceRatio * (MAX_SHOT_POWER - MIN_SHOT_POWER);

        const powerDifference = gameState.shotPower - idealPower;
        const SHOT_ERROR_SENSITIVITY = 0.4; // Slightly more forgiving
        const errorFactor = 1.0 + (powerDifference * SHOT_ERROR_SENSITIVITY);

        gameState.ballVelocity.copy(perfectVelocity).multiplyScalar(errorFactor);

        // Update game state
        gameState.isShooting = true;
        gameState.shotAttempts++;
        gameState.lastShotResult = '';

        const feedbackTime = Math.max(2.0, TIME_TO_RIM + 0.5);
        gameState.shotFeedbackTimer = feedbackTime;

        ui.updateScore(gameState.score, gameState.shotAttempts, gameState.shotsMade);

        // Show shot type feedback
        const shotType = gameState.isThreePointer ? '3-POINTER' : '2-POINTER';
        ui.updateGameStatus(`${shotType} shot in progress... 🎯`);
    }

    static resetBall() {
        gameState.ballPosition.set(0, COURT_FLOOR_Y + BALL_RADIUS + LINES_Y_OFFSET, 0);
        gameState.ballVelocity.set(0, 0, 0);
        gameState.ballRotation.set(0, 0, 0);
        gameState.ballAngularVelocity.set(0, 0, 0);
        gameState.shotPower = 0.5;
        gameState.isShooting = false;
        gameState.isMoving = false;
        gameState.lastShotResult = '';

        ui.updatePower(gameState.shotPower);
        ui.updateGameStatus('🏀 Ball reset to center court! Ready for action! 🏀');
    }
}

// =============================================================================
// MAIN APPLICATION ENTRY POINT
// =============================================================================

let ui;
let clock;

function init() {
    // Initialize enhanced game systems
    clock = new THREE.Clock();
    ui = new GameUI();

    // Initialize all the super systems
    dayNightCycle = new DayNightCycle();
    shotPredictor = new ShotPredictor();
    particleSystem = new ParticleSystem();

    // Build complete basketball court
    scene.add(createCourtFloor());
    scene.add(createBoundaryLines());
    scene.add(createCenterCircle());

    // Add endzone markings for both sides of court
    const endzoneMarkingsRight = createEndzoneMarkings();
    scene.add(endzoneMarkingsRight);

    const endzoneMarkingsLeft = endzoneMarkingsRight.clone();
    endzoneMarkingsLeft.rotation.y = Math.PI;
    scene.add(endzoneMarkingsLeft);

    // Add basketball hoops for both ends of court
    rightHoop = createHoop();
    scene.add(rightHoop);

    leftHoop = createHoop();
    leftHoop.rotation.y = Math.PI;
    scene.add(leftHoop);

    // Add basketball at center court
    ballGroup = createBall();
    ballGroup.position.copy(gameState.ballPosition);
    scene.add(ballGroup);

    // Setup event listeners
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);

    // Initialize UI
    ui.updateScore(gameState.score, gameState.shotAttempts, gameState.shotsMade);
    ui.updatePower(gameState.shotPower);

    // Welcome message
    ui.updateGameStatus('🌟 Welcome to SUPER BASKETBALL ARENA! Press P for shot predictor, T for time cycle! 🌟');

    // Start the enhanced game loop
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(e) {
    const key = e.code;
    gameState.keys[key] = true;

    switch(key) {
        case "KeyO":
            controls.enabled = !controls.enabled;
            ui.updateGameStatus(controls.enabled ? '📷 Camera controls enabled' : '📷 Camera controls disabled');
            break;
        case "KeyR":
            InputSystem.resetBall();
            break;
        case "KeyI":
            e.preventDefault();
            triggerNetAnimation();
            break;
        case "KeyP":
            e.preventDefault();
            if (shotPredictor) {
                shotPredictor.toggle();
            }
            break;
        case "KeyT":
            e.preventDefault();
            if (dayNightCycle) {
                dayNightCycle.cyclePeriod();
            }
            break;
        case "KeyF":
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
                ui.updateGameStatus('🖥️ Fullscreen mode activated!');
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                    ui.updateGameStatus('🖥️ Fullscreen mode deactivated!');
                }
            }
            break;
        case "Space":
            e.preventDefault();
            InputSystem.shootBall();
            break;
    }
}

function onKeyUp(e) {
    gameState.keys[e.code] = false;
}

function animate() {
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();

    // Update all enhanced systems
    InputSystem.handleInput(deltaTime);
    PhysicsSystem.updateBallPhysics(deltaTime);

    // Update super systems
    if (dayNightCycle) dayNightCycle.update(deltaTime);
    if (shotPredictor) shotPredictor.update();
    if (particleSystem) particleSystem.update(deltaTime);

    updateNetAnimation(deltaTime);

    // Handle shot feedback timeout
    if (gameState.shotFeedbackTimer > 0) {
        gameState.shotFeedbackTimer -= deltaTime;
        if (gameState.shotFeedbackTimer <= 0 && gameState.lastShotResult === '') {
            gameState.lastShotResult = 'missed';
            ui.showShotFeedback(false);

            const missText = gameState.isThreePointer ?
                'Missed 3-pointer. Keep shooting from deep! 💪' :
                'Shot missed. Try again! 💪';
            ui.updateGameStatus(missText);
        }
    }

    // Update controls and render
    controls.update();

    renderer.render(scene, camera);
}

// =============================================================================
// GLOBAL SYSTEM ACCESS
// =============================================================================

// Make systems globally accessible for debugging and advanced features
window.gameState = gameState;
window.dayNightCycle = dayNightCycle;
window.shotPredictor = shotPredictor;
window.particleSystem = particleSystem;

// =============================================================================
// INITIALIZE THE SUPER BASKETBALL ARENA
// =============================================================================

// Initialize the enhanced basketball arena application
init();

// Development helper functions
window.debugMode = false;
window.toggleDebug = function() {
    window.debugMode = !window.debugMode;
    console.log('Debug mode:', window.debugMode ? 'ON' : 'OFF');
};

window.setTimeOfDay = function(period) {
    if (dayNightCycle && dayNightCycle.periods[period]) {
        dayNightCycle.currentPeriod = period;
        ui.updateGameStatus(`🌅 Time set to: ${period.toUpperCase()}`);
    }
};

window.createTestParticles = function() {
    if (particleSystem) {
        particleSystem.createScoreExplosion(new THREE.Vector3(0, 5, 0), true);
        ui.updateGameStatus('🎆 Test particle explosion created!');
    }
};

// Performance optimization helper
window.createTestParticles = function() {
    if (particleSystem) {
        particleSystem.createScoreExplosion(new THREE.Vector3(0, 5, 0), true);
        ui.updateGameStatus('🎆 Test particle explosion created!');
    }
};

console.log(`
🏀 SUPER BASKETBALL ARENA LOADED! 🏀
=====================================
✨ Enhanced Features:
• Day/Night Cycle (T key)
• Shot Predictor (P key)
• Particle Effects (automatic)
• Realistic Physics (enhanced)

🎮 Controls:
• Arrow Keys: Move ball
• W/S: Adjust power
• Space: Shoot
• P: Toggle predictor
• T: Change time of day
• R: Reset ball
• I: Net animation
• O: Camera controls
• F: Fullscreen

🛠️ Debug Commands:
• toggleDebug() - Toggle debug mode
• setTimeOfDay('dawn'/'day'/'dusk'/'night')
• createTestParticles() - Test particles

Have fun in the SUPER ARENA! 🌟
`);

/**
 * 🏀 SUPER BASKETBALL ARENA - FEATURE SUMMARY 🏀
 *
 * 🌙 DAY/NIGHT CYCLE SYSTEM:
 * - 4 dynamic time periods with smooth lighting transitions
 * - Adaptive sky colors and stadium lighting
 * - Manual cycle with 'T' key
 *
 * 🎯 SMART SHOT PREDICTOR:
 * - Real-time trajectory visualization
 * - Color-coded accuracy feedback (Green/Yellow/Red)
 * - Toggle with 'P' key
 *
 * ✨ ADVANCED PARTICLE EFFECTS:
 * - Score explosions with multiple colors
 * - Rim sparks on collision
 * - Court dust on ball bounce
 * - Ball trails during flight
 *
 * 🏀 ENHANCED BALL PHYSICS:
 * - Slower, more controlled movement
 * - Skill-based shooting mechanics
 * - Realistic collision detection
 * - Enhanced rotation system
 *
 * Clean, focused, and optimized for pure
 * basketball gameplay experience!
 */