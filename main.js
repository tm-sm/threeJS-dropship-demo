// ==========================================
// IMPORTS
// ==========================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { setLights } from './lights.js'
import { setupTerrain } from './terrain.js'
import { accelerating } from './controls.js'
import { loadControls } from './controls.js'
import { loadExternalModels } from './meshCreator.js';
import { createBladeGeometry } from './sweptSurface.js';

import { currentCamera } from './controls.js'

// ==========================================
// GLOBAL CONSTANTS AND VARIABLES
// ==========================================

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
const clock = new THREE.Clock();


export const chaseCamera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 5000 );
export const topViewCamera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 5000 );
export const sideViewCamera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 5000 );
export const fpvCamera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 0.1, 5000  );
export const debugCamera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
export const frontViewCamera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 5000 );

const controls = new OrbitControls( debugCamera, renderer.domElement );

debugCamera.position.set( 0, 20, 100 );

chaseCamera.position.x = -15;
chaseCamera.position.y = 6;

topViewCamera.position.y = 30;
topViewCamera.position.x = -1;

sideViewCamera.position.z = 20;

fpvCamera.position.x = 2.7;
fpvCamera.position.y = 0.2;
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
    const axesHelper = new THREE.AxesHelper( 5 );
    const box = new THREE.BoxHelper( engineRight.getObjectByName('propLMesh'), 0xffff00 );
    scene.add(box);
    scene.add( axesHelper );
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
    if (accelerating.forward) {
        totalForwardAcceleration = Math.min(totalForwardAcceleration + forwardAcceleration, maxForwardAcceleration);
    } else if (accelerating.backward) {
        totalForwardAcceleration = Math.max(totalForwardAcceleration + backwardAcceleration, maxBackwardAcceleration);
    } else {
        // No input detected, the ship should start to slow down
        totalForwardAcceleration -= (airDrag * forwardSpeed);
    }


    // Dynamic max speed calculation
    forwardSpeed = totalForwardAcceleration - (airDrag * forwardSpeed);

    if (accelerating.left) {
        totalHorizontalAcceleration = Math.min(totalHorizontalAcceleration + leftAcceleration, maxLeftAcceleration);
    } else if (accelerating.right) {
        totalHorizontalAcceleration = Math.max(totalHorizontalAcceleration + rightAcceleration, maxRightAcceleration);
    } else {
        totalHorizontalAcceleration -= (airDrag * horizontalSpeed) * 0.4;
    }

    horizontalSpeed = totalHorizontalAcceleration - (airDrag * horizontalSpeed);

    // -- Rotation along the ship's Y axis --
    if (accelerating.turnLeft) {
        totalTurningAcceleration = Math.min(totalTurningAcceleration + leftTurnAcceleration, maxLeftTurningAcceleration);
    } else if (accelerating.turnRight) {
        totalTurningAcceleration = Math.max(totalTurningAcceleration + rightTurnAcceleration, maxRightTurningAcceleration);
    } else {
        totalTurningAcceleration -= (airDrag * turningSpeed) * 2;
    }

    // Dynamic max turning speed calculation
    turningSpeed = totalTurningAcceleration - (airDrag * turningSpeed);


    if (accelerating.up) {
        totalVerticalAcceleration = Math.min(totalVerticalAcceleration + upAcceleration, maxUpAcceleration);
    } else if (accelerating.down) {
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
        if (distanceToGround < 4) {
            globalDropshipMovement.translateY(0.1);
        }
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

const maxAirframePitchDown = Math.PI / 10;
const maxPropsPitchDown = Math.PI / 8;
const maxBladePitch = Math.PI / 8;

const maxAirframePitchUp = Math.PI / 12;
const maxPropsPitchUp = Math.PI / 10;

const maxIndividualPropTiltForward = Math.PI / 10;
const maxIndividualPropTiltBackward = Math.PI / 24;
const maxAirframeTilt = Math.PI / 20;

function handleRotationVisuals() {
    if (accelerating.forward) {
        cumulativeForwardIndicator = Math.min(cumulativeForwardIndicator + step, 1);
    } else if (accelerating.backward) {
        cumulativeForwardIndicator = Math.max(cumulativeForwardIndicator - step, -1);
    } else if (cumulativeForwardIndicator != 0) {
        cumulativeForwardIndicator -= step * cumulativeForwardIndicator * 1.2;
    }

    // Negative due to anti-clockwise positive rotation in WebGL
    engines.rotation.z = (cumulativeForwardIndicator >= 0) ? -(maxPropsPitchDown * cumulativeForwardIndicator) : -(maxPropsPitchUp * cumulativeForwardIndicator);
    pitchDropshipMovement.rotation.z = (cumulativeForwardIndicator >= 0) ? -(maxAirframePitchDown * cumulativeForwardIndicator) : -(maxAirframePitchUp * cumulativeForwardIndicator);

    if (accelerating.turnLeft) {
        cumulativeTurningIndicator = Math.min(cumulativeTurningIndicator + step, 1);
    } else if (accelerating.turnRight) {
        cumulativeTurningIndicator = Math.max(cumulativeTurningIndicator - step, -1);
    } else if (cumulativeTurningIndicator != 0) {
        cumulativeTurningIndicator -= cumulativeTurningIndicator * step * 2;
    }

    if (cumulativeTurningIndicator >= 0) {
        engineRight.rotation.z = -maxIndividualPropTiltBackward * cumulativeTurningIndicator;
        engineLeft.rotation.z = -maxIndividualPropTiltForward * cumulativeTurningIndicator;
    } else {
        engineLeft.rotation.z = maxIndividualPropTiltBackward * cumulativeTurningIndicator;
        engineRight.rotation.z = maxIndividualPropTiltForward * cumulativeTurningIndicator;
    }

    airframe.rotation.x = - (cumulativeTurningIndicator * maxAirframeTilt);

    if (accelerating.left) {
        cumulativeHorizontalIndicator = Math.max(cumulativeHorizontalIndicator - step * 4, -1);
    } else if (accelerating.right) {
        cumulativeHorizontalIndicator = Math.min(cumulativeHorizontalIndicator + step * 4, 1);
    } else if (cumulativeHorizontalIndicator != 0) {
        cumulativeHorizontalIndicator -= step * cumulativeHorizontalIndicator * 1.3;
    }

    airframe.rotation.x += cumulativeHorizontalIndicator * maxAirframeTilt;

    if (accelerating.up) {
        cumulativeVerticalIndicator = Math.min(cumulativeVerticalIndicator + step, 1);
    } else if (accelerating.down) {
        cumulativeVerticalIndicator = Math.max(cumulativeVerticalIndicator - step, -1);
    } else if (cumulativeVerticalIndicator != 0) {
        cumulativeVerticalIndicator -= step * cumulativeVerticalIndicator * 2;
    }

    bladesRight.getObjectByName('b1').rotation.z = (cumulativeVerticalIndicator * maxBladePitch);
    bladesRight.getObjectByName('b2').rotation.z = (cumulativeVerticalIndicator * maxBladePitch);
    bladesRight.getObjectByName('b3').rotation.z = (cumulativeVerticalIndicator * maxBladePitch);

    bladesLeft.getObjectByName('b1').rotation.z = -(cumulativeVerticalIndicator * maxBladePitch);
    bladesLeft.getObjectByName('b2').rotation.z = -(cumulativeVerticalIndicator * maxBladePitch);
    bladesLeft.getObjectByName('b3').rotation.z = -(cumulativeVerticalIndicator * maxBladePitch);

    bladesLeft.rotateY(-2.887);
    bladesRight.rotateY(2.887);
}

function addBaseMovement() {
    let delta = clock.getElapsedTime();

    airframe.position.set(Math.sin(delta) * 0.01, Math.cos(delta) * 0.3, Math.sin(delta * 0.8) * 0.1);
    airframe.rotation.x += Math.sin(delta) * 0.01;
    airframe.rotation.y = Math.cos(delta * 0.3) * 0.01;
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

    handleMovement();
    handleRotationVisuals();
    addBaseMovement();
    updateCameras();

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
    var gui = new dat.GUI( );
    gui.domElement.id = 'gui';

    var f1 = gui.addFolder('controls');
    f1.add(accelerating, 'forward').name('forward').listen();
    f1.add(accelerating, 'backward').name('backward').listen();
    f1.add(accelerating, 'left').name('left').listen();
    f1.add(accelerating, 'right').name('right').listen();
    f1.add(accelerating, 'turnLeft').name('turnLeft').listen();
    f1.add(accelerating, 'turnRight').name('turnRight').listen();
    f1.add(accelerating, 'up').name('up').listen();
    f1.add(accelerating, 'down').name('down').listen();

    var f2 = gui.addFolder('data');
    f2.add(movement, 'height', 0, 100).step(0.5).name('height').listen();
    f2.add(movement, 'dragF', -4, 4).step(0.1).name('dragF').listen();
    f2.add(movement, 'dragT', -0.5, 0.5).step(0.1).name('dragT').listen();
    f2.add(movement, 'accF', -400, 400).step(0.1).name('accF').listen();
    f2.add(movement, 'accT', -20, 20).step(0.1).name('accT').listen();
    f2.add(movement, 'speed', -400, 400).step(0.1).name('speed').listen();
    f2.add(movement, 'turn', -20, 20).step(0.1).name('turn').listen();
}


// ==========================================
// INITIALIZE SCENE
// ==========================================

setLights(scene);
terrain = setupTerrain(scene, terrain);
addHelpers();
loadExternalModels(scene, globalDropshipMovement, pitchDropshipMovement, airframe, wings, cockpit, ramp, engines,
    engineRight, engineLeft, bladesLeft, bladesRight);
loadControls();
//createMenu();