import * as THREE from 'three';
import { addNonPriorityParticleToScene, removeNonPriorityParticleFromScene, addParticleToScene, removeParticleFromScene } from './main.js';

export class Rocket {
    constructor(x, y, z, direction, strength) {
        let geometry = new THREE.SphereGeometry(0.4, 32, 16); 
        let material = new THREE.MeshBasicMaterial({ 
            color: 0xe25822, 
            transparent: true,
            opacity: 0.8
        }); 
        let rocket = new THREE.Mesh(geometry, material);
        this.rocket = rocket;
        this.hit = false;
        this.direction = direction.clone().normalize();
        this.strength = strength;
        this.rocketGroup = new THREE.Group();
        let glowGeometry = new THREE.SphereGeometry(0.7, 32, 16);
        let glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffbb00,
            transparent: true,
            opacity: 0.3
        });
        this.glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
        this.rocketGroup.add(this.glowSphere);
        this.rocketGroup.add(this.rocket);
        this.rocketGroup.position.set(x, y, z);

        this.boundingSphere = new THREE.Sphere(this.rocketGroup.position, 0.7); // Radius matches the glow sphere size

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
                    const segmentCount = 10;
                    for (let i = 1; i <= segmentCount; i++) {
                        const t = i / segmentCount;
                        const intermediatePosition = new THREE.Vector3()
                            .copy(this.rocketGroup.position)
                            .add(translationVector.clone().multiplyScalar(t));
                
                        let smokeParticle;
                        if (particlePool.length > 0) {
                            smokeParticle = particlePool.pop();
                            smokeParticle.sprite.position.set(intermediatePosition.x, intermediatePosition.y, intermediatePosition.z);
                            smokeParticle.ttl = 5; 
                            smokeParticle.isDead = false;
                            smokeParticle.sprite.material.opacity = 0.5;
                            smokeParticle.sprite.scale.set(1, 1, 1); 
                        } else {
                            smokeParticle = new SmokeParticle(intermediatePosition.x, intermediatePosition.y, intermediatePosition.z, 10);
                        }
                    }
                    this.rocketFuel--;
                }

                this.rocketGroup.position.add(translationVector);
                
                this.boundingSphere.center.copy(this.rocketGroup.position);
                
                this.checkCollision(objectsToCheck);
            }
        } 
    }

    checkCollision(objectsToCheck) {
        for (let object of objectsToCheck) {
            if (!object.geometry.boundingSphere) {
                object.geometry.computeBoundingSphere();
            }
    
            // Clone the bounding sphere and apply the object's world matrix
            let objectBoundingSphere = object.geometry.boundingSphere.clone();
            objectBoundingSphere.applyMatrix4(object.matrixWorld);
    
            // Check if the rocket intersects the bounding sphere of the terrain
            if (this.boundingSphere.intersectsSphere(objectBoundingSphere)) {
                const geometry = object.geometry;
                const positions = geometry.attributes.position.array;
                const indices = geometry.index.array;
    
                const rocketPosition = this.rocketGroup.position;
    
                // Iterate through all triangles (indices)
                for (let i = 0; i < indices.length; i += 3) {
                    const v1 = new THREE.Vector3().fromArray(positions, indices[i] * 3);
                    const v2 = new THREE.Vector3().fromArray(positions, indices[i + 1] * 3);
                    const v3 = new THREE.Vector3().fromArray(positions, indices[i + 2] * 3);
    
                    // Check if the rocket intersects the triangle formed by vertices v1, v2, v3
                    if (this.checkTriangleCollision(rocketPosition, v1, v2, v3)) {
                        this.hit = true;
                        new ExplosionParticle(
                            this.rocketGroup.position.x,
                            this.rocketGroup.position.y,
                            this.rocketGroup.position.z,
                            100
                        );
                        return;
                    }
                }
            }
        }
    }
    
    // Check if the rocket intersects a triangle
    checkTriangleCollision(rocketPosition, v1, v2, v3) {
        // Use a ray-triangle intersection test, assuming rocket is a point for simplicity
        const normal = new THREE.Vector3();
        const edge1 = new THREE.Vector3().subVectors(v2, v1);
        const edge2 = new THREE.Vector3().subVectors(v3, v1);
        normal.crossVectors(edge1, edge2).normalize();
    
        // Plane equation: normal . (P - P0) = 0
        const d = -normal.dot(v1);
        const t = (normal.dot(rocketPosition) + d) / normal.dot(normal);
    
        if (t >= 0) {
            // Find the intersection point with the plane
            const intersectionPoint = rocketPosition.clone().sub(normal.multiplyScalar(t));
    
            // Check if the intersection point lies inside the triangle using barycentric coordinates
            const edge0 = new THREE.Vector3().subVectors(v2, v1);
            const edge1 = new THREE.Vector3().subVectors(v3, v1);
            const edge2 = new THREE.Vector3().subVectors(intersectionPoint, v1);
    
            const d00 = edge0.dot(edge0);
            const d01 = edge0.dot(edge1);
            const d11 = edge1.dot(edge1);
            const d20 = edge2.dot(edge0);
            const d21 = edge2.dot(edge1);
    
            const denom = d00 * d11 - d01 * d01;
            const v = (d11 * d20 - d01 * d21) / denom;
            const w = (d00 * d21 - d01 * d20) / denom;
            const u = 1.0 - v - w;
    
            return (u >= 0 && v >= 0 && w >= 0);
        }
    
        return false;
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
            opacity: 1 
        });

        this.explosion = new THREE.Group();

        this.backSprite = new THREE.Sprite(spriteMaterial);
        this.backSprite.scale.x = 10;
        this.backSprite.scale.y = 10;
        this.backSprite.scale.z = 10;

        this.foreSprite = new THREE.Sprite(spriteMaterial);
        this.foreSprite.position.x = -2;
        this.foreSprite.scale.x = 6;
        this.foreSprite.scale.y = 6;
        this.foreSprite.scale.z = 6;
        

        this.explosion.add(this.foreSprite);
        this.explosion.add(this.backSprite);

        this.explosion.position.set(x, y, z);
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

        const ttlRatio = this.ttl / this.totalttl;
        this.backSprite.material.opacity = ttlRatio;
        this.foreSprite.material.opacity = ttlRatio;
        
        const scaleFactor = Math.log(ttlRatio + 1) * 0.03 + 1;  

        this.explosion.scale.multiplyScalar(scaleFactor);
        this.explosion.position.y += 0.01;
        this.explosion.position.z += 0.01;
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