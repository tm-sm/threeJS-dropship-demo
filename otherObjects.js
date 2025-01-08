import * as THREE from 'three';
import { addNonPriorityParticleToScene, removeNonPriorityParticleFromScene, addParticleToScene, removeParticleFromScene } from './main.js';
import { currentCamera } from './controls.js';

export class Rocket {
    constructor(x, y, z, direction, strength, rotX, rotY) {
        let geometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 8, 1); 
        let material = new THREE.MeshBasicMaterial({ 
            color: 0x223322
        });
        this.rocket = new THREE.Mesh(geometry, material);
        this.rocket.rotation.z = Math.PI / 2;
        this.hit = false;
        this.direction = direction.clone().normalize();
        this.strength = strength;
        this.rocketGroup = new THREE.Group();
        let glowGeometry = new THREE.SphereGeometry(0.2, 32, 16);
        let glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffbb00,
            transparent: true,
            opacity: 0.7
        });
        this.glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
        this.glowSphere.position.x = -1;
        this.rocketGroup.add(this.glowSphere);
        this.rocketGroup.add(this.rocket);
        this.rocketGroup.position.set(x, y, z);

        this.rocketGroup.rotation.x = rotX;
        this.rocketGroup.rotation.y = rotY; 
        this.deathTick = 80;
        this.rocketFuel = 10;
        this.gravity = 0;
        this.raycaster = new THREE.Raycaster();
    }

    getRocketObject() {
        return this.rocketGroup;
    }

    checkHit() {
        return this.hit;
    }

    move(objectsToCheck) {
        if (!this.hit) {
            this.deathTick--;
            if (this.deathTick <= 0) {
                this.hit = true;
            } else {
                let normalizedDirection = this.direction.clone().normalize();
                let translationVector = normalizedDirection.multiplyScalar(this.strength);
                this.gravity += 0.02;
                translationVector.y -= this.gravity;

                if (this.rocketFuel > 0) {
                    const segmentCount = 10;
                    for (let i = 1; i <= segmentCount; i++) {
                        const t = i / segmentCount;
                        const intermediatePosition = new THREE.Vector3()
                            .copy(this.rocketGroup.position)
                            .add(translationVector.clone().multiplyScalar(t));

                        let smokeParticle = new SmokeParticle(intermediatePosition.x, intermediatePosition.y, intermediatePosition.z, 20);
                    }
                    this.rocketFuel--;
                } else {
                    this.glowSphere.material.opcaity = 0.0;
                }

                this.rocketGroup.position.add(translationVector);

                let forwardVector = new THREE.Vector3(0, 0, 1);
                let rotationQuaternion = new THREE.Quaternion().setFromUnitVectors(forwardVector, translationVector.clone().normalize());

                this.rocketGroup.rotation.z = rotationQuaternion.z;

                this.checkCollision(objectsToCheck, translationVector.normalize());
            }
        } 
    }

    checkCollision(objectsToCheck, direction) {
        this.raycaster.set(this.rocketGroup.position, direction);

        const intersections = this.raycaster.intersectObjects(objectsToCheck, true);

        if (intersections.length > 0) {
            const nearestIntersection = intersections[0];
            if (nearestIntersection.distance < 10) {
                this.hit = true;

                new ExplosionParticle(
                    nearestIntersection.point.x,
                    nearestIntersection.point.y,
                    nearestIntersection.point.z,
                    500
                );
            }
        }
    }
}

const textureLoader = new THREE.TextureLoader();
const smokeTexture = textureLoader.load('./public/textures/smoke.png'); 

const explosionTexture = textureLoader.load('./public/textures/explosion.png'); 

export class ExplosionParticle {
    constructor(x, y, z, ttl) {
        this.isDead = false;
        this.totalttl = ttl;
        this.ttl = ttl;
    
        const spriteMaterial = new THREE.SpriteMaterial({
            map: explosionTexture,
            transparent: true,
            color: 0x9D8761,
            opacity: 1 
        });

        const spriteMaterial2 = new THREE.SpriteMaterial({
            map: explosionTexture,
            transparent: true,
            color: 0x7D6741,
            opacity: 1 
        });

        const spriteMaterial3 = new THREE.SpriteMaterial({
            map: explosionTexture,
            transparent: true,
            color: 0xBDA781,
            opacity: 1 
        });

        this.explosion = new THREE.Group();

        this.middleSprite = new THREE.Sprite(spriteMaterial3);
        this.middleSprite.scale.x = 10;
        this.middleSprite.scale.y = 10;
        this.middleSprite.scale.z = 10;

        this.backSprite = new THREE.Sprite(spriteMaterial2);
        this.backSprite.position.z = -3;
        this.backSprite.scale.x = 6;
        this.backSprite.scale.y = 6;
        this.backSprite.scale.z = 6;

        this.foreSprite = new THREE.Sprite(spriteMaterial);
        this.foreSprite.position.z = 3;
        this.foreSprite.scale.x = 6;
        this.foreSprite.scale.y = 6;
        this.foreSprite.scale.z = 6;
        

        this.explosion.add(this.foreSprite);
        this.explosion.add(this.middleSprite);
        this.explosion.add(this.backSprite);

        this.explosion.position.set(x, y, z);

        this.explosion.scale.setScalar(0.5);
        addParticleToScene(this);
    }

    getParticleObject() {
        return this.explosion;
    }

    update() {

        this.ttl--;
        if (this.ttl <= 0) {
            removeParticleFromScene(this);
            return;
        }

        const explosionStrength = 1.4;
        const explosionSpeed = 200;
        const explosionCycle = 4;
        const explosionStart = 0.06 ;

        const ttlRatio = this.ttl / this.totalttl;
        this.middleSprite.material.opacity = ttlRatio;
        this.foreSprite.material.opacity = ttlRatio;
        this.backSprite.material.opacity = ttlRatio / (2);
        
        const scaleFactor = Math.log(ttlRatio) * 0.6 + 2;
        const scaleFactor2 = (1 - ttlRatio);
        const scaleFactor3 = (((((scaleFactor2 + explosionStart) * explosionCycle) / (Math.pow((scaleFactor2 + explosionStart) * explosionCycle, 2) + 1)) * explosionSpeed - 0.25 / 4) + 1) * explosionStrength;

        this.backSprite.scale.y = 0.14 * scaleFactor3 * explosionStrength;
        this.backSprite.position.y += 0.01;
        this.backSprite.scale.x += 0.0005 * scaleFactor3 * explosionStrength;

        this.foreSprite.position.x += 0.001;
        this.foreSprite.scale.x += 0.01;

        this.explosion.scale.setScalar(scaleFactor);
        this.explosion.position.y += 0.01;
        this.explosion.position.z += 0.01;

        this.explosion.lookAt(currentCamera.position);
    }
}

const particlePool = []; 
const MAX_POOL_SIZE = 1000; 

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
        addNonPriorityParticleToScene(this);
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
        this.sprite.position.y += 0.04;

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
        removeNonPriorityParticleFromScene(this);

        if (particlePool.length < MAX_POOL_SIZE) {
            particlePool.push(this);
        }
    }
}