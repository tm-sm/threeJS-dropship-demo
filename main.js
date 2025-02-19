// ==========================================
// IMPORTS
// ==========================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { setLights } from './lights.js';
import { setupTerrain } from './terrain.js';
import { input } from './controls.js';
import { loadControls } from './controls.js';
import { loadExternalModels } from './meshCreator.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { Rocket, SmokeParticle } from './otherObjects.js';

import { currentCamera } from './controls.js';

// ==========================================
// GLOBAL CONSTANTS AND VARIABLES
// ==========================================

const scene = new THREE.Scene();
scene.fog = new THREE.Fog( 0xcccccc, 10, 1500 );
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
const clock = new THREE.Clock();


export const chaseCamera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 20000 );
export const topViewCamera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 20000 );
export const sideViewCamera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 20000 );
export const fpvCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 20000  );
export const debugCamera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 20000 );
export const frontViewCamera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 20000 );

const controls = new OrbitControls( debugCamera, renderer.domElement );

debugCamera.position.set( 0, 20, 100 );

chaseCamera.position.x = -15;
chaseCamera.position.y = 6;

topViewCamera.position.y = 30;
topViewCamera.position.x = -1;

sideViewCamera.position.z = 20;

fpvCamera.position.x = 2.4;
fpvCamera.position.y = 0.;
fpvCamera.rotation.y = -Math.PI / 2;

frontViewCamera.position.x = 15;
frontViewCamera.position.y = 2;


const globalDropshipMovement = new THREE.Group();
const pitchDropshipMovement = new THREE.Group();

const airframe = new THREE.Group();
const wings = new THREE.Group();
const cockpit = new THREE.Group();
const ramp = new THREE.Group();

const engineRight = new THREE.Group();
const engineLeft = new THREE.Group();
const engines = new THREE.Group();

const bladesLeft = new THREE.Group();
const bladesRight = new THREE.Group();

const skidLeft = new THREE.Group();
const skidRight = new THREE.Group();

const rocketMount = new THREE.Group();

const collisionRaycast = new THREE.Raycaster();

airframe.add(fpvCamera);

globalDropshipMovement.add(chaseCamera);
globalDropshipMovement.add(topViewCamera);
globalDropshipMovement.add(frontViewCamera);
pitchDropshipMovement.add(sideViewCamera);

chaseCamera.lookAt(globalDropshipMovement.position);
topViewCamera.lookAt(globalDropshipMovement.position);
sideViewCamera.lookAt(pitchDropshipMovement.position);
frontViewCamera.lookAt(globalDropshipMovement.position);

var terrain;


// ==========================================
// RENDERER SETUP
// ==========================================

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

// ==========================================
// SETUP FUNCTIONS
// ==========================================

function addHelpers() {
    /*const axesHelper = new THREE.AxesHelper( 5 );
    const box = new THREE.BoxHelper( engineRight.getObjectByName('propLMesh'), 0xffff00 );
    scene.add(box);
    scene.add( axesHelper );*/
}

// ==========================================
// MOVEMENT HANDLER
// ==========================================
const forwardAcceleration = 3;
const backwardAcceleration = -2;
const leftAcceleration = -0.1;
const rightAcceleration = -leftAcceleration;
const leftTurnAcceleration = 0.3;
const rightTurnAcceleration = -leftTurnAcceleration;
const upAcceleration = 3;
const downAcceleration = -2;

const maxBackwardAcceleration = -600;
const maxForwardAcceleration = 800;
const maxLeftAcceleration = -100;
const maxRightAcceleration = -maxLeftAcceleration;
const maxLeftTurningAcceleration = 15;
const maxRightTurningAcceleration = -maxLeftTurningAcceleration;
const maxUpAcceleration = 100;
const maxDownAcceleration = -100;

const airDrag = 0.03; // Controls how fast the ship comes to a stop

var totalForwardAcceleration = 0;
var totalHorizontalAcceleration = 0;
var totalVerticalAcceleration = 0;
var totalTurningAcceleration = 0;

var forwardSpeed = 0;
var horizontalSpeed = 0;
var turningSpeed = 0;
var verticalSpeed = 0;

function handleMovement() {

    // -- Movement along the ship's X axis --
    if (input.forward && isEnginePowered && !inGround) {
        totalForwardAcceleration = Math.min(totalForwardAcceleration + forwardAcceleration, maxForwardAcceleration);
    } else if (input.backward && isEnginePowered && !inGround) {
        totalForwardAcceleration = Math.max(totalForwardAcceleration + backwardAcceleration, maxBackwardAcceleration);
    } else {
        // No input detected, the ship should start to slow down
        totalForwardAcceleration -= (airDrag * forwardSpeed);
    }


    // Dynamic max speed calculation
    forwardSpeed = totalForwardAcceleration - (airDrag * forwardSpeed);

    if (input.left && isEnginePowered && !inGround) {
        totalHorizontalAcceleration = Math.min(totalHorizontalAcceleration + leftAcceleration, maxLeftAcceleration);
    } else if (input.right && isEnginePowered && !inGround) {
        totalHorizontalAcceleration = Math.max(totalHorizontalAcceleration + rightAcceleration, maxRightAcceleration);
    } else {
        totalHorizontalAcceleration -= (airDrag * horizontalSpeed) * 0.4;
    }

    horizontalSpeed = totalHorizontalAcceleration - (airDrag * horizontalSpeed);

    // -- Rotation along the ship's Y axis --
    if (input.turnLeft && isEnginePowered && !inGround) {
        totalTurningAcceleration = Math.min(totalTurningAcceleration + leftTurnAcceleration, maxLeftTurningAcceleration);
    } else if (input.turnRight && isEnginePowered && !inGround) {
        totalTurningAcceleration = Math.max(totalTurningAcceleration + rightTurnAcceleration, maxRightTurningAcceleration);
    } else {
        totalTurningAcceleration -= (airDrag * turningSpeed) * 2;
    }

    // Dynamic max turning speed calculation
    turningSpeed = totalTurningAcceleration - (airDrag * turningSpeed);


    if (input.up && isEnginePowered) {
        totalVerticalAcceleration = Math.min(totalVerticalAcceleration + upAcceleration, maxUpAcceleration);
    } else if (input.down && isEnginePowered) {
        totalVerticalAcceleration = Math.max(totalVerticalAcceleration + downAcceleration, maxDownAcceleration);
    } else {
        totalVerticalAcceleration -= (airDrag * verticalSpeed);
    }

    // Dynamic max vertical speed calculation
    verticalSpeed = totalVerticalAcceleration - (airDrag * verticalSpeed);

    // Apply local movement
    globalDropshipMovement.translateX(forwardSpeed / 1000);
    globalDropshipMovement.translateZ(horizontalSpeed / 1000);
    globalDropshipMovement.rotateY(turningSpeed / 1000);
    globalDropshipMovement.translateY(verticalSpeed / 1000);

    let objects = [];
    objects.push(terrain);
    let shipPosition = globalDropshipMovement.position.clone();
    let rayOrigin = new THREE.Vector3(shipPosition.x, shipPosition.y, shipPosition.z);
    collisionRaycast.set(rayOrigin, new THREE.Vector3(0, -1, 0));
    
    let intersects = collisionRaycast.intersectObjects(objects);
    
    if (intersects.length > 0) {
        const distanceToGround = intersects[0].distance;
        movement.height = distanceToGround;
        if (distanceToGround < 4 && !gearInPosition) {
            globalDropshipMovement.translateY(4 - distanceToGround);
        } else if (distanceToGround < 1.8 && gearInPosition) {
            globalDropshipMovement.translateY(1.8 - distanceToGround);
        }
        if (distanceToGround < 3) {
            inGround = true;

            let heightLeft = 3;
            let heightRight = 3;
            let heightFore = 3;
            let heightBack = 3;
            // Assume `globalDropshipMovement.rotation.y` gives the yaw in radians
            let yaw = globalDropshipMovement.rotation.y;

            // Create offset vectors for left, right, fore, and back directions
            let leftOffset = new THREE.Vector3(Math.cos(globalDropshipMovement.rotation.y) * 3.0, 0, Math.sin(globalDropshipMovement.rotation.y) * -3.0);
            let rightOffset = new THREE.Vector3(Math.cos(globalDropshipMovement.rotation.y) * 3.0, 0, Math.sin(globalDropshipMovement.rotation.y) * 3.0);
            let foreOffset = new THREE.Vector3(Math.cos(globalDropshipMovement.rotation.y) * 3.0, 0, Math.sin(globalDropshipMovement.rotation.y) * 3.0);
            let backOffset = new THREE.Vector3(Math.cos(globalDropshipMovement.rotation.y) * -3.0, 0, Math.sin(globalDropshipMovement.rotation.y) * 3.0);

            // Now add the rotated offsets to the ship's position to get the ray origins
            let leftRayOrigin = new THREE.Vector3().copy(shipPosition).add(leftOffset);
            let rightRayOrigin = new THREE.Vector3().copy(shipPosition).add(rightOffset);
            let foreRayOrigin = new THREE.Vector3().copy(shipPosition).add(foreOffset);
            let backRayOrigin = new THREE.Vector3().copy(shipPosition).add(backOffset);

            collisionRaycast.set(leftRayOrigin, new THREE.Vector3(0, -1, 0));
            let intersectsLeft = collisionRaycast.intersectObjects(objects);
            if (intersectsLeft.length > 0) {
                heightLeft = intersectsLeft[0].distance;
            }

            collisionRaycast.set(rightRayOrigin, new THREE.Vector3(0, -1, 0));
            let intersectsRight = collisionRaycast.intersectObjects(objects);
            if (intersectsRight.length > 0) {
                heightRight = intersectsRight[0].distance;
            }

            collisionRaycast.set(foreRayOrigin, new THREE.Vector3(0, -1, 0));
            let intersectsFore = collisionRaycast.intersectObjects(objects);
            if (intersectsFore.length > 0) {
                heightFore = intersectsFore[0].distance;
            }

            collisionRaycast.set(backRayOrigin, new THREE.Vector3(0, -1, 0));
            let intersectsBack = collisionRaycast.intersectObjects(objects);
            if (intersectsBack.length > 0) {
                heightBack = intersectsBack[0].distance;
            }

            airframe.rotation.set((1 - ((distanceToGround - 1.8) / 1.2)) * (-Math.atan((heightLeft - heightRight) / 6)), 0, (1 - ((distanceToGround - 1.8) / 1.2)) * (-Math.atan((heightFore - heightBack) / 6)));

        } else {
            inGround = false;
        }
    } else {
        inGround = false;
    }

    // Update movement values for debugging purposes
    movement.accF = totalForwardAcceleration;
    movement.accT = totalTurningAcceleration;
    movement.dragF = airDrag * forwardSpeed;
    movement.dragT = airDrag * turningSpeed;
    movement.speed = forwardSpeed;
    movement.turn = turningSpeed;
}


const step = 0.02; // Controls how 'violently' the dropship reacts to input

var cumulativeForwardIndicator = 0.0;
var cumulativeHorizontalIndicator = 0.0;
var cumulativeTurningIndicator = 0.0;
var cumulativeVerticalIndicator = 0.0;

const maxAirframePitchDown = Math.PI / 24;
const maxPropsPitchDown = Math.PI / 2 - maxAirframePitchDown;
const maxBladePitch = Math.PI / 8;

const maxAirframePitchUp = Math.PI / 20;
const maxPropsPitchUp = Math.PI / 16;

const maxIndividualPropTiltForward = Math.PI / 16;
const maxIndividualPropTiltBackward = Math.PI / 24;
const maxAirframeTilt = Math.PI / 20;

function handleRotationVisuals() {
    if (input.forward && isEnginePowered && !inGround) {
        cumulativeForwardIndicator = Math.min(cumulativeForwardIndicator + step, 1);
    } else if (input.backward && isEnginePowered && !inGround) {
        cumulativeForwardIndicator = Math.max(cumulativeForwardIndicator - step, -1);
    } else if (cumulativeForwardIndicator != 0) {
        cumulativeForwardIndicator -= step * cumulativeForwardIndicator * 1.2;
    }

    // Negative due to anti-clockwise positive rotation in WebGL
    engines.rotation.z = (cumulativeForwardIndicator >= 0) ? -(maxPropsPitchDown * cumulativeForwardIndicator) : -(maxPropsPitchUp * cumulativeForwardIndicator);
    pitchDropshipMovement.rotation.z = (cumulativeForwardIndicator >= 0) ? -(maxAirframePitchDown * cumulativeForwardIndicator) : -(maxAirframePitchUp * cumulativeForwardIndicator);

    if (input.turnLeft && isEnginePowered && !inGround) {
        cumulativeTurningIndicator = Math.min(cumulativeTurningIndicator + step, 1);
    } else if (input.turnRight && isEnginePowered && !inGround) {
        cumulativeTurningIndicator = Math.max(cumulativeTurningIndicator - step, -1);
    } else if (cumulativeTurningIndicator != 0) {
        cumulativeTurningIndicator -= cumulativeTurningIndicator * step * 2;
    }
    
    if (cumulativeForwardIndicator >= 0.9) {
        engineRight.rotation.z = 0;
        engineLeft.rotation.z = 0;
    } else if (cumulativeTurningIndicator >= 0) {
        engineRight.rotation.z = -maxIndividualPropTiltBackward * cumulativeTurningIndicator;
        engineLeft.rotation.z = maxIndividualPropTiltForward * cumulativeTurningIndicator;
    } else {
        engineLeft.rotation.z = maxIndividualPropTiltBackward * cumulativeTurningIndicator;
        engineRight.rotation.z = -maxIndividualPropTiltForward * cumulativeTurningIndicator;
    }

    airframe.rotation.x = - (cumulativeTurningIndicator * maxAirframeTilt);

    if (input.left && isEnginePowered && !inGround) {
        cumulativeHorizontalIndicator = Math.max(cumulativeHorizontalIndicator - step * 4, -1);
    } else if (input.right && isEnginePowered && !inGround) {
        cumulativeHorizontalIndicator = Math.min(cumulativeHorizontalIndicator + step * 4, 1);
    } else if (cumulativeHorizontalIndicator != 0) {
        cumulativeHorizontalIndicator -= step * cumulativeHorizontalIndicator * 1.3;
    }

    if (cumulativeForwardIndicator < 0.9) {
        airframe.rotation.x += cumulativeHorizontalIndicator * maxAirframeTilt * 1.5;
    } else {
        airframe.rotation.y = - cumulativeHorizontalIndicator * maxAirframeTilt * 0.5;
    }
    
    if (input.up) {
        cumulativeVerticalIndicator = Math.min(cumulativeVerticalIndicator + step, 1);
    } else if (input.down) {
        cumulativeVerticalIndicator = Math.max(cumulativeVerticalIndicator - step, -1);
    } else if (cumulativeVerticalIndicator != 0) {
        cumulativeVerticalIndicator -= step * cumulativeVerticalIndicator * 2;
    }

    var rightBladesPitch = (cumulativeTurningIndicator == 0) ? (cumulativeVerticalIndicator * maxBladePitch) : ((cumulativeVerticalIndicator + cumulativeTurningIndicator) / 2 * maxBladePitch);
    var leftBladePitch = (cumulativeTurningIndicator == 0) ? (cumulativeVerticalIndicator * maxBladePitch) : ((cumulativeVerticalIndicator - cumulativeTurningIndicator) / 2 * maxBladePitch);

    bladesRight.getObjectByName('b1').rotation.z = (rightBladesPitch);
    bladesRight.getObjectByName('b2').rotation.z = (rightBladesPitch);
    bladesRight.getObjectByName('b3').rotation.z = (rightBladesPitch);

    bladesLeft.getObjectByName('b1').rotation.z = -(leftBladePitch);
    bladesLeft.getObjectByName('b2').rotation.z = -(leftBladePitch);
    bladesLeft.getObjectByName('b3').rotation.z = -(leftBladePitch);
}

function addBaseMovement(delta) {
    if (isEnginePowered && !inGround) {
        airframe.translateX(Math.sin(delta) * 0.003);
        airframe.translateY(Math.cos(delta) * 0.002);
        airframe.translateZ(Math.sin(delta) * 0.0024);
        airframe.rotation.x += Math.sin(delta) * 0.01;
        airframe.rotation.y += Math.cos(delta * 0.9) * 0.00001;
        airframe.rotation.z += Math.cos(delta * 0.8) * 0.0001;
    }
}

var cumulativeLeftEnginePower = 1.0;
var cumulativeRightEnginePower = 1.0;
var isEnginePowered = true;
var areBladesMoving = true;

var movementFakerAux = true;

function motorHandler(delta) {
    // A lot of magic numbers
    cumulativeLeftEnginePower = (input.toggleEngine && engineAllowed) ? Math.min(cumulativeLeftEnginePower + 0.001, 1) : Math.max(cumulativeLeftEnginePower - 0.001 * (cumulativeLeftEnginePower + 0.1), 0);
    cumulativeRightEnginePower = (input.toggleEngine && cumulativeLeftEnginePower > 0.2 && engineAllowed) ? Math.min(cumulativeRightEnginePower + 0.001, 1) : Math.max(cumulativeRightEnginePower - 0.001 * (cumulativeRightEnginePower + 0.1), 0);

    isEnginePowered = (cumulativeLeftEnginePower > 0.9 && cumulativeRightEnginePower > 0.9);

    // Left engine
    if (cumulativeLeftEnginePower >= 0 && cumulativeLeftEnginePower < 0.4) {
        engineLeft.getObjectByName('slow').visible = true;
        engineLeft.getObjectByName('fast').visible= false;
        bladesLeft.rotateY(-cumulativeLeftEnginePower);
    } else if (cumulativeLeftEnginePower >= 0.4 && cumulativeLeftEnginePower < 0.9) {
        engineLeft.getObjectByName('slow').visible = false;
        engineLeft.getObjectByName('fast').visible= true;
        bladesLeft.rotation.y = bladesLeft.rotation.y + (2 * ((cumulativeLeftEnginePower - 0.5 / 0.9))) - ((movementFakerAux - 0.5) * 2) * (0.1);
    } else {
        engineLeft.getObjectByName('slow').visible = false;
        engineLeft.getObjectByName('fast').visible= true;
        bladesLeft.rotation.y = bladesLeft.rotation.y + (-2 * 0.6) - ((movementFakerAux - 0.5) * 2) * (0.1);
    }

    // Right engine
    if (cumulativeRightEnginePower >= 0 && cumulativeRightEnginePower < 0.4) {
        engineRight.getObjectByName('slow').visible = true;
        engineRight.getObjectByName('fast').visible= false;
        bladesRight.rotateY(cumulativeRightEnginePower);
    } else if (cumulativeRightEnginePower >= 0.4 && cumulativeRightEnginePower < 0.9) {
        engineRight.getObjectByName('slow').visible = false;
        engineRight.getObjectByName('fast').visible= true;
        bladesRight.rotation.y = bladesRight.rotation.y + (-2 * ((cumulativeRightEnginePower - 0.5 / 0.9))) + ((movementFakerAux - 0.5) * 2) * (0.1);
    } else {
        engineRight.getObjectByName('slow').visible = false;
        engineRight.getObjectByName('fast').visible= true;
        bladesRight.rotation.y = bladesRight.rotation.y + (-2 * 0.6) + ((movementFakerAux - 0.5) * 2) * (0.1);
    }

    movementFakerAux = !movementFakerAux;

    engineLeft.translateX((Math.sin(delta*10)*0.0015) * cumulativeLeftEnginePower); 
    engineLeft.translateZ((Math.sin(delta*10)*0.001) * cumulativeLeftEnginePower);
    engineLeft.translateY((Math.cos(delta*10) * 0.0008) * cumulativeLeftEnginePower);

    engineRight.translateX((Math.sin(delta*10)*0.0015) * cumulativeRightEnginePower);
    engineRight.translateZ((Math.sin(delta*10)*0.001) * cumulativeRightEnginePower);
    engineRight.translateY((Math.cos(delta*10) * 0.0008) * cumulativeRightEnginePower)
}

var cumulativeRampExtension = 0.0;
const maxRampExtension = Math.PI / 4;

function rampHandler(delta) {
    cumulativeRampExtension = input.toggleRamp ? Math.min(cumulativeRampExtension + 0.02, 1) : Math.max(cumulativeRampExtension - 0.02, 0);

    ramp.rotation.z = cumulativeRampExtension * maxRampExtension;
}

var cumulativeBladeFold = 0.0;
var cumulativeEngineFold = 0.0;
var cumulativeWingFold = 0.0;

var bladesInPosition = true;

input.toggleBladeExtension = false;

var engineAllowed = true;

function bladeFoldHandler(delta) {
    if (input.toggleEngine) {
        input.toggleBladeExtension = false;
    }


    if (input.toggleBladeExtension && cumulativeLeftEnginePower == 0) {

        bladesLeft.rotation.y = 0;
        bladesRight.rotation.set(0, Math.PI, 0);
        bladesInPosition = true;
        /*bladesLeft.rotation.y = bladesLeft.rotation.y % (Math.PI * 2);
        bladesRight.rotation.y = bladesRight.rotation.y % (Math.PI * 2);

        if (Math.abs(bladesLeft.rotation.y) <= 0.1 && Math.abs(bladesRight.rotation.y) >= Math.PI - 0.1 && Math.abs(bladesRight.rotation.y) <= Math.PI + 0.1) {
            bladesInPosition = true;
        } else {
            bladesLeft.rotation.y += bladesLeft.rotation.y > 0 ? -0.01 : 0.01;
            bladesRight.rotation.y += bladesRight.rotation.y > Math.PI ? -0.01 : 0.01;
            bladesInPosition = false;
        }*/

    } else {
        bladesInPosition = false;
    }

    if (cumulativeEngineFold == 0 && cumulativeWingFold == 0) {
        cumulativeBladeFold = input.toggleBladeExtension && bladesInPosition ?
         Math.min(cumulativeBladeFold + ((0.01 * (1 - cumulativeBladeFold)) + 0.001), 1) 
         : Math.max(cumulativeBladeFold - ((0.01 * cumulativeBladeFold) + 0.001), 0);
    }

    if (cumulativeBladeFold == 1 && cumulativeEngineFold == 0) {
        cumulativeWingFold = input.toggleBladeExtension && bladesInPosition ?
         Math.min(cumulativeWingFold + ((0.005 * (1 - cumulativeWingFold)) + 0.001), 1) 
         : Math.max(cumulativeWingFold - ((0.005 * cumulativeWingFold) + 0.001), 0);
    }
    
    if (cumulativeWingFold == 1) {
        cumulativeEngineFold = input.toggleBladeExtension && bladesInPosition ?
         Math.min(cumulativeEngineFold + ((0.01 * (1 - cumulativeEngineFold)) + 0.001), 1) 
         : Math.max(cumulativeEngineFold - ((0.01 * cumulativeEngineFold) + 0.001), 0);
    }
   
    if (cumulativeBladeFold == 0) {
        engineAllowed = true;
    } else {
        engineAllowed = false;
    }

    if (cumulativeLeftEnginePower == 0) {
        bladesLeft.getObjectByName('b2').rotation.set(0, 2.0944 - (cumulativeBladeFold * (Math.PI / 1.7)), 0);
        bladesLeft.getObjectByName('b3').rotation.set(0, -2.0944 + (cumulativeBladeFold * (Math.PI / 1.7)), 0);

        bladesRight.getObjectByName('b2').rotation.set(0, 2.0944 - (cumulativeBladeFold * (Math.PI / 1.7)), 0);
        bladesRight.getObjectByName('b3').rotation.set(0, -2.0944 + (cumulativeBladeFold * (Math.PI / 1.7 )), 0);

        wings.rotation.set(0, Math.PI / 2.5 * Math.max((cumulativeWingFold - 0.3) / 0.7, 0), 0);
        wings.position.y = 0.3 * Math.min(cumulativeWingFold / 0.3, 1);

        engineLeft.rotation.set(0, 0, -cumulativeEngineFold * (Math.PI / 2));
        engineRight.rotation.set(0, 0, cumulativeEngineFold * (Math.PI / 2));
    }

}

var cumulativeGearExtension = 1.0;

var gearInPosition = true;

var inGround = true;

function gearHandler(delta) {

    cumulativeGearExtension = (input.toggleGear || inGround) ? Math.min(1.0, cumulativeGearExtension + 0.05) : Math.max(0.0, cumulativeGearExtension - 0.05);

    gearInPosition = cumulativeGearExtension == 1.0;

    skidLeft.position.y = cumulativeGearExtension * -0.8;
    skidRight.position.y = cumulativeGearExtension * -0.8;
}

var rockets = []

let lastFireTime = 0; 
let fireCooldown = 0.3;
var rocketCount = 16; 

function weaponsHandler(delta) {
    rockets.forEach(rocket => {
        let objects = [];
        objects.push(terrain)
        rocket.move(objects);
    }
    );

    rockets = rockets.filter(rocket => {
        if (rocket.checkHit()) {
            scene.remove(rocket.getRocketObject());
            return false; 
        }
        return true;
    });

    if (input.fireRocket && rocketCount > 0) {
        let currentTime = performance.now() / 1000; 

        if (currentTime - lastFireTime >= fireCooldown) {
            var forward = new THREE.Vector3(1, 0, 0);
            var combinedQuaternion = globalDropshipMovement.quaternion.clone().multiply(pitchDropshipMovement.quaternion);

            var globalDirection = forward.applyQuaternion(combinedQuaternion);
            

            const offsetDistance = 2;

            let sideDirection = new THREE.Vector3(0, 1, 0).cross(globalDirection).normalize();

            let offset = sideDirection.multiplyScalar(rocketCount % 2 === 0 ? offsetDistance : -offsetDistance);

            let rocketPosition = new THREE.Vector3(
                globalDropshipMovement.position.x,
                globalDropshipMovement.position.y,
                globalDropshipMovement.position.z
            ).add(offset);

            let rocket = new Rocket(
                rocketPosition.x,
                rocketPosition.y,
                rocketPosition.z,
                globalDirection,
                7,
                pitchDropshipMovement.rotation.x,
                globalDropshipMovement.rotation.y
            );
            
            scene.add(rocket.getRocketObject());
            rockets.push(rocket);
            rocketCount--;

            lastFireTime = currentTime;
        }
    }
}

const particlesGroups = []; 
const priorityParticles = [];
let currentGroupIndex = 0;
const NUM_GROUPS = 20; 

for (let i = 0; i < NUM_GROUPS; i++) {
    particlesGroups.push([]);
}

function handleParticles() {
    if (particlesGroups.length === 0) return;

    particlesGroups[currentGroupIndex].forEach(particle => particle.update());
    priorityParticles.forEach(particle => particle.update());

    currentGroupIndex = (currentGroupIndex + 1) % NUM_GROUPS;
}

export function removeParticleFromScene(particle) {
    scene.remove(particle.getParticleObject());


    const index = priorityParticles.indexOf(particle);
    if (index !== -1) {
        priorityParticles.splice(index, 1);
    }
}

export function removeNonPriorityParticleFromScene(particle) {
    scene.remove(particle.getParticleObject());

    for (const group of particlesGroups) {
        const index = group.indexOf(particle);
        if (index !== -1) {
            group.splice(index, 1);
            break;
        }
    }
}

export function addParticleToScene(particle) {
    scene.add(particle.getParticleObject());
    priorityParticles.push(particle);
}

export function addNonPriorityParticleToScene(particle) {
    scene.add(particle.getParticleObject());

    let smallestGroup = particlesGroups[0];
    for (const group of particlesGroups) {
        if (group.length < smallestGroup.length) {
            smallestGroup = group;
        }
    }
    smallestGroup.push(particle);
}


// ==========================================
// CAMERA HANDLERS
// ==========================================

function updateCameras() {

}

// ==========================================
// SIMULATION LOOP
// ==========================================

function animate() {
    let delta = clock.getElapsedTime();

    gearHandler(delta);
    handleRotationVisuals(delta);
    addBaseMovement(delta);
    updateCameras(delta);
    motorHandler(delta);
    rampHandler(delta);
    bladeFoldHandler(delta);
    handleMovement(delta);
    weaponsHandler(delta);
    handleParticles(delta);


    controls.update();
	renderer.render( scene, currentCamera );
}

// ==========================================
// MONITORING
// =========================================

const movement = {
    height: 0.0,
    dragF: 0.0,
    dragT: 0.0,
    accF: 0.0,
    accT: 0.0,
    speed: 0.0,
    turn: 0.0,
}


function createMenu() {
    var gui = new GUI( );
    gui.domElement.id = 'gui';

    var f1 = gui.addFolder('controls');
    f1.add(input, 'forward').name('forward').listen();
    f1.add(input, 'backward').name('backward').listen();
    f1.add(input, 'left').name('left').listen();
    f1.add(input, 'right').name('right').listen();
    f1.add(input, 'turnLeft').name('turnLeft').listen();
    f1.add(input, 'turnRight').name('turnRight').listen();
    f1.add(input, 'up').name('up').listen();
    f1.add(input, 'down').name('down').listen();

    var f2 = gui.addFolder('data');
    f2.add(movement, 'height', 0, 100).step(0.5).name('height').listen();
    f2.add(movement, 'dragF', -4, 4).step(0.1).name('dragF').listen();
    f2.add(movement, 'dragT', -0.5, 0.5).step(0.1).name('dragT').listen();
    f2.add(movement, 'accF', -400, 400).step(0.1).name('accF').listen();
    f2.add(movement, 'accT', -20, 20).step(0.1).name('accT').listen();
    f2.add(movement, 'speed', -400, 400).step(0.1).name('speed').listen();
    f2.add(movement, 'turn', -20, 20).step(0.1).name('turn').listen();

    gui.close();
}


// ==========================================
// INITIALIZE SCENE
// ==========================================

setLights(scene);
terrain = setupTerrain(scene, terrain);
addHelpers();
loadExternalModels(scene, globalDropshipMovement, pitchDropshipMovement, airframe, wings, cockpit, ramp, engines,
    engineLeft, engineRight, bladesLeft, bladesRight, skidLeft, skidRight, rocketMount);
loadControls();
input.toggleGear = true;
createMenu();