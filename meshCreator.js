import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createBladeGeometry } from './sweptSurface.js';

export function loadExternalModels(scene, globalDropshipMovement, pitchDropshipMovement, airframe, wings, cockpit, ramp, engines,
     engineLeft, engineRight, bladesLeft, bladesRight) {
    const loader = new GLTFLoader();
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

    loader.load( 'public/models/dropship/engine_r.glb', function ( gltf ) {
        var model = gltf.scene;
        var modelMaterial = new THREE.MeshStandardMaterial({color: 0x001100});
        model.traverse((o) => {
            if (o.isMesh) o.material = modelMaterial;
        });
        gltf.scene.name = 'engineRMesh';
        engineLeft.add(model);
    }, undefined, function ( error ) {
        console.error( error );
    });

    loader.load( 'public/models/dropship/engine_l.glb', function ( gltf ) {
        var model = gltf.scene;
        var modelMaterial = new THREE.MeshStandardMaterial({ color: 0x001100 });
        model.traverse((o) => {
            if (o.isMesh) o.material = modelMaterial;
        });
        gltf.scene.name = 'engineLMesh';
        engineRight.add(model);
    }, undefined, function ( error ) {
        console.error( error );
    });

    loader.load( 'public/models/dropship/rotor.glb', function ( gltf ) {
        var model = gltf.scene;
        var modelMaterial = new THREE.MeshStandardMaterial({ color: 0x001100 });
        model.traverse((o) => {
            if (o.isMesh) o.material = modelMaterial;
        });
        gltf.scene.name = 'rotorRMesh';
        gltf.scene.position.z = 0.37;
        gltf.scene.position.x = 0;
        gltf.scene.position.y = 0.687924;
        engineRight.add(model);
    }, undefined, function ( error ) {
        console.error( error );
    });

    loader.load( 'public/models/dropship/rotor.glb', function ( gltf ) {
        var model = gltf.scene;
        var modelMaterial = new THREE.MeshStandardMaterial({ color: 0x001100 });
        model.traverse((o) => {
            if (o.isMesh) o.material = modelMaterial;
        });
        gltf.scene.name = 'rotorLMesh';
        gltf.scene.position.z = -0.37;
        gltf.scene.position.x = 0;
        gltf.scene.position.y = 0.687924;
        engineLeft.add(model);
    }, undefined, function ( error ) {
        console.error( error );
    });

    addBlades(scene, bladesLeft, bladesRight, engineLeft, engineRight);

    engineRight.position.z = 3.98655;
    engineLeft.position.z = -3.98655;

    engines.add(engineLeft);
    engines.add(engineRight);
    engines.position.x = -1.48602;
    engines.position.y = 0.598318;

    airframe.add(wings);
    airframe.add(ramp);
    airframe.add(engines);
    airframe.add(cockpit);

    pitchDropshipMovement.add(airframe);
    globalDropshipMovement.add(pitchDropshipMovement);

    globalDropshipMovement.position.y = 30;
    scene.add(globalDropshipMovement);
}

function addBlades(scene, bladesLeft, bladesRight, engineLeft, engineRight) {
    const g = createBladeGeometry();
    let material = new THREE.MeshStandardMaterial({ color: 0x001100 });
    
    const rightBlade1 = new THREE.Mesh(g, material);
    const rightBlade2 = new THREE.Mesh(g, material);
    const rightBlade3 = new THREE.Mesh(g, material);

    bladesRight.add(rightBlade1);
    rightBlade2.rotation.y = 2.0944;
    bladesRight.add(rightBlade2);
    rightBlade3.rotation.y = -2.0944;
    bladesRight.add(rightBlade3);

    const leftBlade1 = new THREE.Mesh(g, material);
    const leftBlade2 = new THREE.Mesh(g, material);
    const leftBlade3 = new THREE.Mesh(g, material);

    bladesLeft.add(leftBlade1);
    leftBlade2.rotation.y = 2.0944;
    bladesLeft.add(leftBlade2);
    leftBlade3.rotation.y = -2.0944;
    bladesLeft.add(leftBlade3);

    bladesRight.position.set(0, 1.5, 0.3);
    bladesLeft.position.set(0, 1.5, -0.4);

    bladesLeft.rotation.y = 1;


    engineLeft.add(bladesLeft);
    engineRight.add(bladesRight);
}