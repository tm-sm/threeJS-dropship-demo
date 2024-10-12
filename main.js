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

const chaseCamera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 5000 );
const topViewCamera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 5000 );
const sideViewCamera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 5000 );

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

const collisionRaycast = new THREE.Raycaster();

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

// Set up lighting
function setLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xcccccc, 5.0);
    directionalLight.position.set(100, 100, 100);
    directionalLight.lookAt(0, 0, 0);
    directionalLight.castShadow = true;

    directionalLight.shadow.mapSize.width = 2048; 
    directionalLight.shadow.mapSize.height = 2048;

    directionalLight.shadow.camera.near = 1; 
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -500;
    directionalLight.shadow.camera.right = 500;
    directionalLight.shadow.camera.top = 500;
    directionalLight.shadow.camera.bottom = -500;

    scene.add(directionalLight);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5); // Adjusted intensity
    scene.add(hemisphereLight);
}

// Set up terrain
function setupTerrain() {
    const segmentWidth = 100;
    const segmentLength = 100;
    const width = 5000;
    const length = 5000;
    
    const { vertices, indices } = setVerticesAndIndices(segmentWidth, segmentLength, width, length);
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));

    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({ 
        color: new THREE.Color(0xCBBD93),
        roughness: 1.0,
        metalness: 0.3,
        side: THREE.DoubleSide
    }); 

    terrain = new THREE.Mesh(geometry, material);
    terrain.castShadow = true;
    terrain.receiveShadow = true;
    scene.add(terrain);
    scene.background = new THREE.Color(0xbbbbff)
}

function setVerticesAndIndices(segmentWidth, segmentLength, width, length) {
    const segmentsX = width / segmentWidth;
    const segmentsZ = length / segmentLength;

    const verticesCount = (segmentsX + 1) * (segmentsZ + 1);
    const vertices = new Float32Array(verticesCount * 3); // 3 values (x, y, z) per vertex

    const indicesCount = segmentsX * segmentsZ * 6;
    const indices = new Uint16Array(indicesCount);

    let offsetX = -width / 2;
    let offsetZ = -length / 2;

    // Define vertices in mesh
    let vertIndex = 0;
    for (let i = 0; i <= segmentsX; i++) {
        for (let j = 0; j <= segmentsZ; j++) {
            let x = offsetX + i * segmentWidth;
            let z = offsetZ + j * segmentLength;
            vertices[vertIndex++] = x;
            vertices[vertIndex++] = terrainNoise(x, z);
            vertices[vertIndex++] = z;
        }
    }


    let index = 0;
    for (let i = 0; i < segmentsX; i++) {
        for (let j = 0; j < segmentsZ; j++) {
            let a = i * (segmentsZ + 1) + j;           // Top left
            let b = (i + 1) * (segmentsZ + 1) + j;     // Top right
            let c = i * (segmentsZ + 1) + (j + 1);     // Bottom left
            let d = (i + 1) * (segmentsZ + 1) + (j + 1); // Bottom right

            // First triangle in segment
            indices[index++] = a;
            indices[index++] = b;
            indices[index++] = c;

            // Second triangle in segment
            indices[index++] = c;
            indices[index++] = b;
            indices[index++] = d;
        }
    }

    return { vertices, indices };
}

function terrainNoise(x, z) {
    const frequency1 = 0.01;
    const frequency2 = 0.005;
    const amplitude1 = 20;
    const amplitude2 = 10; 

    return (
        Math.sin(x * frequency1) * amplitude1 +
        Math.cos(z * frequency1) * amplitude1 +
        Math.sin(x * frequency2) * (amplitude2 / 2) +
        Math.cos(z * frequency2) * (amplitude2 / 2)
    );
}

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
        var modelMaterial = new THREE.MeshStandardMaterial({color: 0x001100});
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
        var modelMaterial = new THREE.MeshStandardMaterial({color: 0x222255});
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
        var modelMaterial = new THREE.MeshStandardMaterial({color: 0x001100});
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
        var modelMaterial = new THREE.MeshStandardMaterial({color: 0x001100});
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
        var modelMaterial = new THREE.MeshStandardMaterial({color: 0x001100});
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
        var modelMaterial = new THREE.MeshStandardMaterial({ color: 0x001100 });
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

    globalDropshipMovement.position.y = 30;
    scene.add(globalDropshipMovement);
}

// ==========================================
// MOVEMENT HANDLER
// ==========================================
const forwardAcceleration = 1.5;
const backwardAcceleration = -1.3;
const leftAcceleration = -0.2;
const rightAcceleration = -leftAcceleration;
const leftTurnAcceleration = 1;
const rightTurnAcceleration = -leftTurnAcceleration;
const upAcceleration = 0.8;
const downAcceleration = -0.6;

const maxBackwardAcceleration = -300;
const maxForwardAcceleration = 400;
const maxLeftAcceleration = -60;
const maxRightAcceleration = -maxLeftAcceleration;
const maxLeftTurningAcceleration = 20;
const maxRightTurningAcceleration = -maxLeftTurningAcceleration;
const maxUpAcceleration = 50;
const maxDownAcceleration = -50;

const airDrag = 0.03; // Controls how fast the ship comes to a stop

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
        cumulativeForwardIndicator -= step * cumulativeForwardIndicator * 1.2;
    }

    // Negative due to anti-clockwise positive rotation in WebGL
    propellerCasings.rotation.z = (cumulativeForwardIndicator >= 0) ? -(maxPropsPitchDown * cumulativeForwardIndicator) : -(maxPropsPitchUp * cumulativeForwardIndicator);
    pitchDropshipMovement.rotation.z = (cumulativeForwardIndicator >= 0) ? -(maxAirframePitchDown * cumulativeForwardIndicator) : -(maxAirframePitchUp * cumulativeForwardIndicator);

    if (accelerating.turnLeft) {
        cumulativeTurningIndicator = Math.min(cumulativeTurningIndicator + step, 1);
    } else if (accelerating.turnRight) {
        cumulativeTurningIndicator = Math.max(cumulativeTurningIndicator - step, -1);
    } else if (cumulativeTurningIndicator != 0) {
        cumulativeTurningIndicator -= cumulativeTurningIndicator * step * 2;
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
        cumulativeHorizontalIndicator -= step * cumulativeHorizontalIndicator * 1.3;
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
const numOne = 49;
const numTwo = 50;
const numThree = 51;
const numFour = 52;

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

setLights();
setupTerrain();
addHelpers();
loadExternalModels();
createMenu();