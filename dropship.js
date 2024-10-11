// ==========================================
// IMPORTS
// ==========================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// ==========================================
// GLOBAL CONSTANTS AND VARIABLES
// ==========================================

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
const loader = new GLTFLoader();

var currentCamera;

const chaseCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const topViewCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const sideViewCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

currentCamera = chaseCamera;

chaseCamera.position.x = -15;
chaseCamera.position.y = 6;

topViewCamera.position.y = 30;
topViewCamera.position.x = -1;

sideViewCamera.position.z = 20;

const globalDropshipMovement = new THREE.Group();
const pitchDropshipMovement = new THREE.Group();

globalDropshipMovement.add(chaseCamera);
globalDropshipMovement.add(topViewCamera);
pitchDropshipMovement.add(sideViewCamera);

chaseCamera.lookAt(globalDropshipMovement.position);
topViewCamera.lookAt(globalDropshipMovement.position);
sideViewCamera.lookAt(pitchDropshipMovement.position);

const airframe = new THREE.Group();
const wings = new THREE.Group();
const cockpit = new THREE.Group();
const ramp = new THREE.Group();

const propellerCasingLeft = new THREE.Group();
const propellerCasingRight = new THREE.Group();
const propellerCasings = new THREE.Group();


// ==========================================
// RENDERER SETUP
// ==========================================

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

// ==========================================
// SETUP FUNCTIONS
// ==========================================

// Set up lighting for the scene
function setLights() {
    const ambientLight = new THREE.AmbientLight( 0xffffff );
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    scene.add( ambientLight );
    scene.add( directionalLight );
}

// Set up terrain for the scene
function setupTerrain() {
    const terrainGeometry = new THREE.PlaneGeometry(500, 500);
    const material = new THREE.MeshBasicMaterial( { color: 0x333333 } );
    const terrain = new THREE.Mesh(terrainGeometry, material);
    terrain.rotation.x -= Math.PI / 2.0;
    scene.add(terrain);
}

// Add helpers (like axes) to the scene
function addHelpers() {
    const axesHelper = new THREE.AxesHelper( 5 );
    const box = new THREE.BoxHelper( propellerCasingLeft.getObjectByName('propLMesh'), 0xffff00 );
    scene.add(box);
    scene.add( axesHelper );
}

// ==========================================
// LOAD EXTERNAL MODELS
// ==========================================

function loadExternalModels() {
    loader.load( 'public/models/dropship/airframe.glb', function ( gltf ) {
        var model = gltf.scene;
        var modelMaterial = new THREE.MeshStandardMaterial({color: 0xff0000});
        model.traverse((o) => {
            if (o.isMesh) o.material = modelMaterial;
        });
        gltf.scene.name = 'aiframeMesh';
        airframe.add(gltf.scene);
    }, undefined, function ( error ) {
        console.error( error );
    });

    loader.load( 'public/models/dropship/cockpit.glb', function ( gltf ) {
        var model = gltf.scene;
        var modelMaterial = new THREE.MeshStandardMaterial({color: 0x0000ff});
        model.traverse((o) => {
            if (o.isMesh) o.material = modelMaterial;
        });
        gltf.scene.name = 'cockpitMesh';
        cockpit.add(gltf.scene);
    }, undefined, function ( error ) {
        console.error( error );
    });

    loader.load( 'public/models/dropship/wings.glb', function ( gltf ) {
        var model = gltf.scene;
        var modelMaterial = new THREE.MeshStandardMaterial({color: 0xff0000});
        model.traverse((o) => {
            if (o.isMesh) o.material = modelMaterial;
        });
        gltf.scene.name = 'wingsMesh';
        wings.add(gltf.scene);
    }, undefined, function ( error ) {
        console.error( error );
    });

    loader.load( 'public/models/dropship/ramp.glb', function ( gltf ) {
        var model = gltf.scene;
        var modelMaterial = new THREE.MeshStandardMaterial({color: 0xff0000});
        model.traverse((o) => {
            if (o.isMesh) o.material = modelMaterial;
        });
        gltf.scene.name = 'rampMesh';
        ramp.add(gltf.scene);
    }, undefined, function ( error ) {
        console.error( error );
    });

    loader.load( 'public/models/dropship/propeller_l.glb', function ( gltf ) {
        var model = gltf.scene;
        var modelMaterial = new THREE.MeshStandardMaterial({color: 0xffff00});
        model.traverse((o) => {
            if (o.isMesh) o.material = modelMaterial;
        });
        gltf.scene.name = 'propLMesh';
        gltf.scene.position.x = 1.48602;
        gltf.scene.position.y = 0.602539;
        propellerCasingLeft.add(model);
    }, undefined, function ( error ) {
        console.error( error );
    });

    loader.load( 'public/models/dropship/propeller_r.glb', function ( gltf ) {
        var model = gltf.scene;
        var modelMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
        model.traverse((o) => {
            if (o.isMesh) o.material = modelMaterial;
        });
        gltf.scene.name = 'propRMesh';
        gltf.scene.position.x = 1.48602;
        gltf.scene.position.y = 0.602539;
        propellerCasingRight.add(model);
    }, undefined, function ( error ) {
        console.error( error );
    });

    propellerCasings.add(propellerCasingLeft);
    propellerCasings.add(propellerCasingRight);
    propellerCasings.position.x = -1.48602;
    propellerCasings.position.y = -0.602539;

    airframe.add(wings);
    airframe.add(ramp);
    airframe.add(propellerCasings);
    airframe.add(cockpit);

    pitchDropshipMovement.add(airframe);
    globalDropshipMovement.add(pitchDropshipMovement);

    globalDropshipMovement.position.y = 3;
    scene.add(globalDropshipMovement);
}

// ==========================================
// MOVEMENT HANDLER
// ==========================================
const forwardAcceleration = 1.5;
const backwardAcceleration = -1.3;
const leftAcceleration = -0.1;
const rightAcceleration = -leftAcceleration;
const leftTurnAcceleration = 1;
const rightTurnAcceleration = -leftTurnAcceleration;
const upAcceleration = 0.8;
const downAcceleration = -0.6;

const maxBackwardAcceleration = -300;
const maxForwardAcceleration = 400;
const maxLeftAcceleration = -30;
const maxRightAcceleration = -maxLeftAcceleration;
const maxLeftTurningAcceleration = 20;
const maxRightTurningAcceleration = -maxLeftTurningAcceleration;
const maxUpAcceleration = 50;
const maxDownAcceleration = -50;

const airDrag = 0.01; // Controls how fast the ship comes to a stop

var totalForwardAcceleration = 0;
var totalHorizontalAcceleration = 0;
var totalVerticalAcceleration = 0;
var totalTurningAcceleration = 0;

var forwardSpeed = 0;
var horizontalSpeed = 0;
var turningSpeed = 0;
var verticalSpeed = 0;

var accelerating = {
    forward: false,
    backward: false,
    right: false,
    left: false,
    turnRight: false,
    turnLeft: false,
    up: false,
    down: false,
};

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
        totalHorizontalAcceleration -= (airDrag * horizontalSpeed) * 0.1;
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

    verticalSpeed = totalVerticalAcceleration - (airDrag * verticalSpeed);

    // Apply local movement
    globalDropshipMovement.translateX(forwardSpeed / 1000);
    globalDropshipMovement.translateZ(horizontalSpeed / 1000);
    globalDropshipMovement.rotateY(turningSpeed / 1000);
    globalDropshipMovement.translateY(verticalSpeed / 1000);



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

const maxAirframePitchDown = Math.PI / 10;
const maxPropsPitchDown = Math.PI / 8;

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
        cumulativeForwardIndicator -= (cumulativeForwardIndicator >= 0) ? step / 4 : -step / 4;
    }

    // Negative due to anti-clockwise positive rotation in WebGL
    propellerCasings.rotation.z = (cumulativeForwardIndicator >= 0) ? -(maxPropsPitchDown * cumulativeForwardIndicator) : -(maxPropsPitchUp * cumulativeForwardIndicator);
    pitchDropshipMovement.rotation.z = (cumulativeForwardIndicator >= 0) ? -(maxAirframePitchDown * cumulativeForwardIndicator) : -(maxAirframePitchUp * cumulativeForwardIndicator);

    if (accelerating.turnLeft) {
        cumulativeTurningIndicator = Math.min(cumulativeTurningIndicator + step, 1);
    } else if (accelerating.turnRight) {
        cumulativeTurningIndicator = Math.max(cumulativeTurningIndicator - step, -1);
    } else if (cumulativeTurningIndicator != 0) {
        cumulativeTurningIndicator -= (cumulativeTurningIndicator >= 0) ? step / 4 : -step / 4;
    }

    if (cumulativeTurningIndicator >= 0) {
        propellerCasingLeft.rotation.z = -maxIndividualPropTiltBackward * cumulativeTurningIndicator;
        propellerCasingRight.rotation.z = maxIndividualPropTiltForward * cumulativeTurningIndicator;
    } else {
        propellerCasingRight.rotation.z = maxIndividualPropTiltBackward * cumulativeTurningIndicator;
        propellerCasingLeft.rotation.z = -maxIndividualPropTiltForward * cumulativeTurningIndicator;
    }

    airframe.rotation.x = - (cumulativeTurningIndicator * maxAirframeTilt);

    if (accelerating.left) {
        cumulativeHorizontalIndicator = Math.max(cumulativeHorizontalIndicator - step * 1.5, -1);
    } else if (accelerating.right) {
        cumulativeHorizontalIndicator = Math.min(cumulativeHorizontalIndicator + step * 1.5, 1);
    } else if (cumulativeHorizontalIndicator != 0) {
        cumulativeHorizontalIndicator -= (cumulativeHorizontalIndicator >= 0) ? step / 2 : -step / 2;
    }

    airframe.rotation.x += cumulativeHorizontalIndicator * maxAirframeTilt;
}

// ==========================================
// CAMERA HANDLERS
// ==========================================

function updateCameras() {

}


// ==========================================
// INPUT HANDLERS
// ==========================================

const wKey = 87;
const sKey = 83;
const aKey = 65;
const dKey = 68;
const zKey = 90;
const xKey = 88;
const qKey = 81;
const eKey = 69;
const numOne = 97;
const numTwo = 98;
const numThree = 99;
const numFour = 100;

const keyState = {
    w: false,
    s: false,
    a: false,
    d: false,
    z: false,
    x: false,
    q: false,
    e: false,
};

document.addEventListener('keydown', (e) => {
    switch (e.keyCode) {
        case wKey:
            keyState.w = true;
            accelerating.forward = true;
            accelerating.backward = false;
            break;
        case sKey:
            keyState.s = true;
            accelerating.backward = true;
            accelerating.forward = false;
            break;
        case aKey:
            keyState.a = true;
            accelerating.left = true;
            accelerating.right = false;
            break;
        case dKey:
            keyState.d = true;
            accelerating.right = true;
            accelerating.left = false;
            break;
        case zKey:
            keyState.z = true;
            accelerating.turnLeft = true;
            accelerating.turnRight = false;
            break;
        case xKey:
            keyState.x = true;
            accelerating.turnRight = true;
            accelerating.turnLeft = false;
            break;
        case qKey:
            keyState.q = true;
            accelerating.up = true;
            accelerating.down = false;
            break;
        case eKey:
            keyState.e = true;
            accelerating.down = true;
            accelerating.up = false;
            break;
        case numOne:
            break;
        case numTwo:
            currentCamera = chaseCamera;
            break;
        case numThree:
            currentCamera = topViewCamera;
            break;
        case numFour:
            currentCamera = sideViewCamera;
            break;
        default:
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.keyCode) {
        case wKey:
            keyState.w = false;
            accelerating.forward = false;
            break;
        case sKey:
            keyState.s = false;
            accelerating.backward = false;
            break;
        case aKey:
            keyState.a = false;
            accelerating.left = false;
            break;
        case dKey:
            keyState.d = false;
            accelerating.right = false;
            break;
         case zKey:
            keyState.z = false;
            accelerating.turnLeft = false;
            break;
        case xKey:
            keyState.x = false;
            accelerating.turnRight = false;
            break;
        case qKey:
            keyState.q = false;
            accelerating.up = false;
            break;
        case eKey:
            keyState.e = false;
            accelerating.down = false;
            break;
        default:
            break;
    }

    // Stop movement/turning when no keys are pressed
    if (!keyState.w && !keyState.s) {
        accelerating.forward = false;
        accelerating.backward = false;
    }

    if (!keyState.a && !keyState.d) {
        accelerating.turnLeft = false;
        accelerating.turnRight = false;
    }
});


// ==========================================
// SIMULATION LOOP
// ==========================================

function animate() {

    handleMovement();
    handleRotationVisuals();
    updateCameras();

	renderer.render( scene, currentCamera );
}

// ==========================================
// MONITORING
// =========================================

const movement = {
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

setLights();
setupTerrain();
addHelpers();
loadExternalModels();
createMenu();