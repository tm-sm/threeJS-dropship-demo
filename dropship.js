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
// MOVEMENT FUNCTIONS
// ==========================================

var forwardAcceleration = 0.01;
var backwardAcceleration = -0.005;
var turningAcceleration = 0.05;

const maxForwardSpeed = 0.3;
const maxBackwardSpeed = -0.2;

const maxTurningSpeed = 0.8;

var forwardSpeed = 0;
var turningSpeed = 0;

function moveForward() {
    globalDropshipMovement.position.x += forwardSpeed;
    forwardSpeed = Math.ceil(forwardSpeed + forwardAcceleration, maxForwardSpeed)
}

function moveBackward() {
    globalDropshipMovement.position.x += forwardSpeed;
    forwardSpeed = Math.floor(forwardSpeed + backwardAcceleration, maxBackwardSpeed)
}

// Handle keyboard inputs for dropship movement
function handleKeys(pressedKeys) {

    if (pressedKeys[87]) { // W
        moveForward();
    } else if (pressedKeys[83]) { // S
        moveBackward();
    }

    if (pressedKeys[65]) { // A
        moveForward();
    } else if (pressedKeys[68]) { // D
        moveBackward();
    }
}

// ==========================================
// ANIMATION LOOP
// ==========================================

function animate() {

    var pressedKeys = {};
    window.onkeyup = function(e) { pressedKeys[e.keyCode] = false; }
    window.onkeydown = function(e) { pressedKeys[e.keyCode] = true; }

    handleKeys(pressedKeys);

	renderer.render( scene, camera );
}

// ==========================================
// INITIALIZE SCENE
// ==========================================

setLights();
setupTerrain();
addHelpers();
loadExternalModels();