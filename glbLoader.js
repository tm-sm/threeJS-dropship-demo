import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function loadExternalModels(scene, globalDropshipMovement, pitchDropshipMovement, airframe, wings, cockpit, ramp, propellerCasings,
     propellerCasingLeft, propellerCasingRight) {
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