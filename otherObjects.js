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
        this.deathTick = 100;
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
                translationVector.y -= 1;
                
                let segmentCount = 4;
                for (let i = 1; i <= segmentCount; i++) {
                
                    let t = i / (segmentCount);
                    let intermediatePosition = new THREE.Vector3().copy(this.rocketGroup.position).add(translationVector.clone().multiplyScalar(t));
                
                    new SmokeParticle(intermediatePosition.x, intermediatePosition.y, intermediatePosition.z, 10);
                }

                this.rocketGroup.position.add(translationVector);
                
                this.checkCollision(objectsToCheck);
            }
        } 
    }

    checkCollision(objectsToCheck) {
        let maxRayLength = 2;  // Set the max distance at which the ray will detect collisions

        let forwardRay = new THREE.Vector3().copy(this.rocketGroup.position).add(this.direction.clone().setLength(1));
        
        this.raycaster.set(this.rocketGroup.position, this.direction.clone().normalize());
        this.raycaster.far = maxRayLength;  // Limit the ray's distance to 0.3 units
        let forwardIntersects = this.raycaster.intersectObjects(objectsToCheck, true);
        
        this.raycaster.set(forwardRay, new THREE.Vector3(0, -0.1).normalize());
        this.raycaster.far = maxRayLength;  // Limit the downward ray to the same distance
        let downwardIntersects = this.raycaster.intersectObjects(objectsToCheck, true);
        
        if (forwardIntersects.length > 0 || downwardIntersects.length > 0) {
            this.hit = true;
        }
    }
}

const textureLoader = new THREE.TextureLoader();
const smokeTexture = textureLoader.load('./public/textures/smoke.png'); // Replace with your image URL

export class SmokeParticle {
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