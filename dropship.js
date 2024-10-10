// ==========================================
// IMPORTS
// ==========================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// ==========================================
// GLOBAL CONSTANTS AND VARIABLES
// ==========================================

const PI = 3.1415927;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();

const controls = new OrbitControls( camera, renderer.domElement );
const loader = new GLTFLoader();

camera.position.z = 5;

const globalDropshipMovement = new THREE.Group();
const pitchDropshipMovement = new THREE.Group();

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
    terrain.rotation.x -= PI / 2.0;
    scene.add(terrain);
}

// Add helpers (like axes) to the scene
function addHelpers() {
    const axesHelper = new THREE.AxesHelper( 5 );
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
        propellerCasingLeft.add(gltf.scene);
    }, undefined, function ( error ) {
        console.error( error );
    });

    loader.load( 'public/models/dropship/propeller_r.glb', function ( gltf ) {
        var model = gltf.scene;
        var modelMaterial = new THREE.MeshStandardMaterial({color: 0xffff00});
        model.traverse((o) => {
            if (o.isMesh) o.material = modelMaterial;
        });
        propellerCasingRight.add(gltf.scene);
    }, undefined, function ( error ) {
        console.error( error );
    });

    propellerCasings.add(propellerCasingLeft);
    propellerCasings.add(propellerCasingRight);

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
const forwardAcceleration = 0.0001;
const backwardAcceleration = -0.00005;
const leftAcceleration = 0.0001;
const rightAcceleration = -leftAcceleration;

const maxBackwardAcceleration = -0.005;
const maxForwardAcceleration = 0.01;
const maxLeftTurningAcceleration = 0.0002;
const maxRightTurningAcceleration = -maxLeftTurningAcceleration;

const airDrag = 0.05; // You can adjust this for more/less drag

var totalForwardAcceleration = 0;
var totalTurningAcceleration = 0;

var forwardSpeed = 0;
var turningSpeed = 0;

var acceleration = {
    accForward: false,
    accBackward: false,
    turnRight: false,
    turnLeft: false
};


function moveForward() {
    totalForwardAcceleration += forwardAcceleration;
    globalDropshipMovement.position.x += forwardSpeed;
    forwardSpeed = Math.min(forwardSpeed + forwardAcceleration, maxForwardAcceleration);
}

function moveBackward() {
    globalDropshipMovement.position.x += forwardSpeed;
    forwardSpeed = Math.max(forwardSpeed + backwardAcceleration, maxBackwardAcceleration);
}

function handleMovement() {
    var finalForwardAcceleration = 0.0;
    var finalTurningAcceleration = 0.0;

    // Forward/backward acceleration handling
    if (acceleration.accForward) {
        totalForwardAcceleration = Math.min(totalForwardAcceleration + forwardAcceleration, maxForwardAcceleration);
    } else if (acceleration.accBackward) {
        totalForwardAcceleration = Math.max(totalForwardAcceleration + backwardAcceleration, maxBackwardAcceleration);
    }

    // Turning acceleration handling
    if (acceleration.turnLeft) {
        totalTurningAcceleration = Math.min(totalTurningAcceleration + leftAcceleration, maxLeftTurningAcceleration);
    } else if (acceleration.turnRight) {
        totalTurningAcceleration = Math.max(totalTurningAcceleration + rightAcceleration, maxRightTurningAcceleration);
    }

    // Apply drag force for forward movement
    finalForwardAcceleration = totalForwardAcceleration;
    var direction = forwardSpeed >= 0 ? 1 : -1;
    let dragForceForward = 0.5 * airDrag * Math.pow(forwardSpeed, 2) * direction;
    finalForwardAcceleration -= dragForceForward;

    forwardSpeed += finalForwardAcceleration;

    // Apply drag force for turning movement
    finalTurningAcceleration = totalTurningAcceleration;
    var turnDirection = turningSpeed >= 0 ? 1 : -1;
    let dragForceTurning = 0.5 * airDrag * Math.pow(turningSpeed, 2) * turnDirection;
    finalTurningAcceleration -= dragForceTurning;

    turningSpeed += finalTurningAcceleration;

    // Move the object
    globalDropshipMovement.translateX(forwardSpeed);
    globalDropshipMovement.rotateY(turningSpeed);

    // Needed to stop moving the dropship once speed is too low
    if (Math.abs(forwardSpeed) < 0.0001) {
        forwardSpeed = 0;
        totalForwardAcceleration = 0;
    }

    if (Math.abs(turningSpeed) < 0.0001) {
        turningSpeed = 0;
        totalTurningAcceleration = 0;
    }
}

// Forward
const startPitchingDownAt = 0.4;
const stopPitchingDownAt = 0.8;
const startPitchingPropsAt = 0.01;
const stopPitchingPropsAt = 0.3;

const maxAirframePitchDown = Math.PI / 10;
const maxPropsPitchDown = Math.PI / 8;

// Backward
const startPitchingUpAt = -0.4; // Reverse threshold for pitching up
const stopPitchingUpAt = -0.8;
const startPitchingPropsUpAt = -0.01;
const stopPitchingPropsUpAt = -0.3;

const maxAirframePitchUp = Math.PI / 12;
const maxPropsPitchUp = Math.PI / 10;

function handleRotationVisuals() {
    // Calculate speed percentage based on total acceleration
    const maxSpeedPercentage = totalForwardAcceleration / maxForwardAcceleration;

    // --- Airframe pitching when moving forward ---
    if (maxSpeedPercentage > startPitchingDownAt && maxSpeedPercentage <= stopPitchingDownAt) {
        const normalizedPercentage = (maxSpeedPercentage - startPitchingDownAt) / (stopPitchingDownAt - startPitchingDownAt);
        airframe.rotation.z = -(normalizedPercentage * maxAirframePitchDown); // Pitch the airframe
    } else if (maxSpeedPercentage > stopPitchingDownAt) {
        airframe.rotation.z = -maxAirframePitchDown; // Max pitch reached
    } else {
        airframe.rotation.z = 0; // No pitch before startPitchingDownAt
    }

    // --- Props pitching when moving forward ---
    if (maxSpeedPercentage > startPitchingPropsAt && maxSpeedPercentage <= stopPitchingPropsAt) {
        const normalizedPercentage = (maxSpeedPercentage - startPitchingPropsAt) / (stopPitchingPropsAt - startPitchingPropsAt);
        propellerCasings.rotation.z = -(normalizedPercentage * maxPropsPitchDown); // Pitch the props
    } else if (maxSpeedPercentage > stopPitchingPropsAt) {
        propellerCasings.rotation.z = -maxPropsPitchDown; // Max pitch for props
    } else {
        propellerCasings.rotation.z = 0; // No pitch before startPitchingPropsAt
    }

    // --- Airframe pitching when moving backward ---
    if (totalForwardAcceleration < startPitchingUpAt && totalForwardAcceleration >= stopPitchingUpAt) {
        const normalizedPercentage = (startPitchingUpAt - totalForwardAcceleration) / (startPitchingUpAt - stopPitchingUpAt);
        airframe.rotation.z = (normalizedPercentage * maxAirframePitchUp); // Reverse pitch for backward movement
    } else if (totalForwardAcceleration < stopPitchingUpAt) {
        airframe.rotation.z = maxAirframePitchUp; // Max reverse pitch reached
    }

    // --- Props pitching when moving backward ---
    if (totalForwardAcceleration < startPitchingPropsUpAt && totalForwardAcceleration >= stopPitchingPropsUpAt) {
        const normalizedPercentage = (startPitchingPropsUpAt - totalForwardAcceleration) / (startPitchingPropsUpAt - stopPitchingPropsUpAt);
        propellerCasings.rotation.z = (normalizedPercentage * maxPropsPitchUp); // Reverse pitch for props
    } else if (totalForwardAcceleration < stopPitchingPropsUpAt) {
        propellerCasings.rotation.z = maxPropsPitchUp; // Max reverse pitch for props
    }
}

// ==========================================
// INPUT HANDLERS
// ==========================================

const wKey = 87;
const sKey = 83;
const aKey = 65;
const dKey = 68;

const keyState = {
    w: false,
    s: false,
    a: false,
    d: false
};

document.addEventListener('keydown', (e) => {
    switch (e.keyCode) {
        case wKey:
            keyState.w = true;
            acceleration.accForward = true;
            acceleration.accBackward = false;
            break;
        case sKey:
            keyState.s = true;
            acceleration.accBackward = true;
            acceleration.accForward = false;
            break;
        case aKey:
            keyState.a = true;
            acceleration.turnLeft = true;
            acceleration.turnRight = false;
            break;
        case dKey:
            keyState.d = true;
            acceleration.turnRight = true;
            acceleration.turnLeft = false;
            break;
        default:
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.keyCode) {
        case wKey:
            keyState.w = false;
            acceleration.accForward = false;
            break;
        case sKey:
            keyState.s = false;
            acceleration.accBackward = false;
            break;
        case aKey:
            keyState.a = false;
            acceleration.turnLeft = false;
            break;
        case dKey:
            keyState.d = false;
            acceleration.turnRight = false;
            break;
        default:
            break;
    }

    // Stop movement/turning when no keys are pressed
    if (!keyState.w && !keyState.s) {
        acceleration.accForward = false;
        acceleration.accBackward = false;
    }

    if (!keyState.a && !keyState.d) {
        acceleration.turnLeft = false;
        acceleration.turnRight = false;
    }
});


// ==========================================
// SIMULATION LOOP
// ==========================================

function animate() {

    handleMovement();
    handleRotationVisuals();

	renderer.render( scene, camera );
}

// ==========================================
// MISC
// ==========================================

/*
function createMenu() {
    var gui = new GUI( );
    gui.domElement.id = 'gui';

    var f1 = gui.addFolder('reloj');
    f1.add(acceleration, "accForward");
    f1.open();

}
    */

// ==========================================
// INITIALIZE SCENE
// ==========================================

setLights();
setupTerrain();
addHelpers();
loadExternalModels();