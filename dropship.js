import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();

const controls = new OrbitControls( camera, renderer.domElement );
const loader = new GLTFLoader();

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );


const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

camera.position.z = 5;

function setLights() {
    const ambientLight = new THREE.AmbientLight( 0xffffff );
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );


    scene.add( ambientLight );
    scene.add( directionalLight );
}

function loadGLTF() {
    loader.load( 'public/models/dropship/airframe.glb', function ( gltf ) {
        var airframe = gltf.scene;
        var airframeMaterial = new THREE.MeshStandardMaterial({color: 0xff0000});
        airframe.traverse((o) => {
            if (o.isMesh) o.material = airframeMaterial;
        });


        scene.add( gltf.scene );
    
    }, undefined, function ( error ) {
    
        console.error( error );
    
    } );

    loader.load( 'public/models/dropship/cockpit.glb', function ( gltf ) {
        var airframe = gltf.scene;
        var airframeMaterial = new THREE.MeshStandardMaterial({color: 0x0000ff});
        airframe.traverse((o) => {
            if (o.isMesh) o.material = airframeMaterial;
        });


        scene.add( gltf.scene );
    
    }, undefined, function ( error ) {
    
        console.error( error );
    
    } );

    loader.load( 'public/models/dropship/wings.glb', function ( gltf ) {
        var airframe = gltf.scene;
        var airframeMaterial = new THREE.MeshStandardMaterial({color: 0xff0000});
        airframe.traverse((o) => {
            if (o.isMesh) o.material = airframeMaterial;
        });


        scene.add( gltf.scene );
    
    }, undefined, function ( error ) {
    
        console.error( error );
    
    } );

    loader.load( 'public/models/dropship/ramp.glb', function ( gltf ) {
        var airframe = gltf.scene;
        var airframeMaterial = new THREE.MeshStandardMaterial({color: 0xff0000});
        airframe.traverse((o) => {
            if (o.isMesh) o.material = airframeMaterial;
        });


        scene.add( gltf.scene );
    
    }, undefined, function ( error ) {
    
        console.error( error );
    
    } );

    loader.load( 'public/models/dropship/propeller_l.glb', function ( gltf ) {
        var airframe = gltf.scene;
        var airframeMaterial = new THREE.MeshStandardMaterial({color: 0xffff00});
        airframe.traverse((o) => {
            if (o.isMesh) o.material = airframeMaterial;
        });


        scene.add( gltf.scene );
    
    }, undefined, function ( error ) {
    
        console.error( error );
    
    } );

    loader.load( 'public/models/dropship/propeller_r.glb', function ( gltf ) {
        var airframe = gltf.scene;
        var airframeMaterial = new THREE.MeshStandardMaterial({color: 0xffff00});
        airframe.traverse((o) => {
            if (o.isMesh) o.material = airframeMaterial;
        });


        scene.add( gltf.scene );
    
    }, undefined, function ( error ) {
    
        console.error( error );
    
    } );

}

function animate() {

	renderer.render( scene, camera );

}

setLights();
loadGLTF();