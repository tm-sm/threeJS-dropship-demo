import * as THREE from 'three';
import { addParticleToScene, removeParticleFromScene } from './main.js';

export class Rocket {
    constructor(x, y, z, direction, strength) {
        let geometry = new THREE.SphereGeometry(0.4, 32, 16); 
        let material = new THREE.MeshBasicMaterial({ color: 0xe25822 }); 
        let rocket = new THREE.Mesh(geometry, material);
        this.rocket = rocket;
        this.hit = false;
        this.direction = direction.clone().normalize();
        this.strength = strength;
        this.rocketGroup = new THREE.Group();
        let glowGeometry = new THREE.SphereGeometry(0.7, 32, 16);
        let glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4500,
            transparent: true,
            opacity: 0.6
        });
        this.glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
        this.rocketGroup.add(this.glowSphere);
        this.rocketGroup.add(this.rocket);
        this.rocketGroup.position.set(x, y, z);

        this.raycaster = new THREE.Raycaster();
        this.deathTick = 80;
        this.rocketFuel = 10;
        this.gravity = 0;
    }

    getRocketObject() {
        return this.rocketGroup;
    }

    checkHit() {
        return this.hit;
    }

    move(objectsToCheck) {
        if(!this.hit) {
            this.deathTick--;
            if (this.deathTick <= 0) {
                this.hit = true;
            } else {
                let normalizedDirection = this.direction.clone().normalize();
                let translationVector = normalizedDirection.multiplyScalar(this.strength);
                this.gravity += 0.02;
                translationVector.y -= this.gravity;
                
                
                if (this.rocketFuel > 0) {
                    const segmentCount = 4;
                    for (let i = 1; i <= segmentCount; i++) {
                        const t = i / segmentCount;
                        const intermediatePosition = new THREE.Vector3()
                            .copy(this.rocketGroup.position)
                            .add(translationVector.clone().multiplyScalar(t));
                
                        // Reuse a particle from the pool or create one if necessary
                        let smokeParticle;
                        if (particlePool.length > 0) {
                            smokeParticle = particlePool.pop();
                            smokeParticle.sprite.position.set(intermediatePosition.x, intermediatePosition.y, intermediatePosition.z);
                            smokeParticle.ttl = 5; // Reset TTL
                            smokeParticle.isDead = false;
                            smokeParticle.sprite.material.opacity = 0.5;
                            smokeParticle.sprite.scale.set(1, 1, 1); // Reset scale
                        } else {
                            smokeParticle = new SmokeParticle(intermediatePosition.x, intermediatePosition.y, intermediatePosition.z, 5);
                        }
                
                        // Add the particle back to the scene
                        addParticleToScene(smokeParticle);
                    }
                    this.rocketFuel--;
                }

                this.rocketGroup.position.add(translationVector);
                
                this.checkCollision(objectsToCheck);
            }
        } 
    }

    checkCollision(objectsToCheck) {
        let maxRayLength = 2;  
        let forwardRay = new THREE.Vector3().copy(this.rocketGroup.position).add(this.direction.clone().setLength(1));
        
        this.raycaster.set(this.rocketGroup.position, this.direction.clone().normalize());
        this.raycaster.far = maxRayLength; 
        let forwardIntersects = this.raycaster.intersectObjects(objectsToCheck, true);
        
        this.raycaster.set(forwardRay, new THREE.Vector3(0, -0.1).normalize());
        this.raycaster.far = maxRayLength; 
        let downwardIntersects = this.raycaster.intersectObjects(objectsToCheck, true);
        
        if (forwardIntersects.length > 0 || downwardIntersects.length > 0) {
            this.hit = true;
            new ExplosionParticle(this.rocketGroup.x, this.rocketGroup.y, this.rocketGroup.z, 100);
        }
    }
}

const textureLoader = new THREE.TextureLoader();
const smokeTexture = textureLoader.load('./public/textures/smoke.png'); // Replace with your image URL

export class ExplosionParticle {
    constructor(x, y, z, ttl) {
        this.isDead = false;
        this.totalttl = ttl;
        this.ttl = ttl;
    
        const spriteMaterial = new THREE.SpriteMaterial({
            map: smokeTexture,
            transparent: true,
            opacity: 1 
        });

        this.sprite = new THREE.Sprite(spriteMaterial);
        this.sprite.position.set(x, y, z);
        this.sprite.scale.x = 4;
        this.sprite.scale.y = 4;
        this.sprite.scale.z = 4;
        addParticleToScene(this);
    }

    getParticleObject() {
        return this.sprite;
    }

    update() {
        this.ttl--;
        if (this.ttl <= 0) {
            this.isDead = true;
            removeParticleFromScene(this);
        }
        this.sprite.material.opacity = (this.ttl / this.totalttl) / 2;
        this.sprite.scale.x *= 1.005;
        this.sprite.scale.y *= 1.005;
        this.sprite.scale.z *= 1.005;
        this.sprite.position.z += 0.01;
    }
}

const particlePool = []; 
const MAX_POOL_SIZE = 100; 

export class SmokeParticle {
    constructor(x, y, z, ttl) {
        this.isDead = false;
        this.totalttl = ttl;
        this.ttl = ttl;

        if (particlePool.length > 0) {
            const pooledParticle = particlePool.pop();
            this.sprite = pooledParticle.sprite;
        } else {
            const spriteMaterial = new THREE.SpriteMaterial({
                map: smokeTexture,
                transparent: true,
                opacity: 0.5,
            });
            this.sprite = new THREE.Sprite(spriteMaterial);
        }

        this.reset(x, y, z, ttl);
        addParticleToScene(this);
    }

    getParticleObject() {
        return this.sprite;
    }

    update() {
        this.ttl--;
        if (this.ttl <= 0) {
            this.recycle();
            return;
        }

        const ttlRatio = this.ttl / this.totalttl;
        this.sprite.material.opacity = ttlRatio / 2;
        const scaleFactor = 1.04;
        this.sprite.scale.multiplyScalar(scaleFactor);
        this.sprite.position.z += 0.04;
    }

    reset(x, y, z, ttl) {
        this.isDead = false;
        this.totalttl = ttl;
        this.ttl = ttl;

        this.sprite.position.set(x, y, z);
        this.sprite.material.opacity = 0.5;
        this.sprite.scale.set(1, 1, 1); 
    }

    recycle() {
        removeParticleFromScene(this);

        if (particlePool.length < MAX_POOL_SIZE) {
            particlePool.push(this);
        }
    }
}