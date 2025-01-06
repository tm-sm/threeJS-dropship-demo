import * as THREE from 'three';

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
        this.deathTick = 1000;
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
                this.rocketGroup.position.add(translationVector);
        
                this.checkCollision(objectsToCheck);
            }
        } 
    }

    checkCollision(objectsToCheck) {
        let forwardRay = new THREE.Vector3().copy(this.rocketGroup.position).add(this.direction.clone().setLength(1));

        let downwardRay = new THREE.Vector3().copy(forwardRay).add(new THREE.Vector3(0, -3, 0));

        this.raycaster.set(this.rocketGroup.position, this.direction.clone().normalize());
        let forwardIntersects = this.raycaster.intersectObjects(objectsToCheck, true);

        this.raycaster.set(forwardRay, new THREE.Vector3(0, -3).normalize());
        let downwardIntersects = this.raycaster.intersectObjects(objectsToCheck, true);

        if (forwardIntersects.length > 0 || downwardIntersects.length > 0) {
            this.hit = true;
        }
    }
}