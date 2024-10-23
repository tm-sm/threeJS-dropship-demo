import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createSweptMesh } from './sweptSurface.js';

const dropshipMaterial = new THREE.MeshStandardMaterial({color: 0xbbbbbb,
    roughness: .2,
    metalness: 1.0,
    emissive: 0x111111
});


export function loadExternalModels(scene, globalDropshipMovement, pitchDropshipMovement, airframe, wings, cockpit, ramp, engines,
     engineLeft, engineRight, bladesLeft, bladesRight) {

    const loader = new GLTFLoader();
    loader.load( 'public/models/dropship/airframe.glb', function ( gltf ) {
        var model = gltf.scene;
        var modelMaterial = dropshipMaterial;
        model.traverse((o) => {
            if (o.isMesh) o.material = modelMaterial;
        });
        gltf.scene.name = 'aiframeMesh';
        gltf.scene.side = THREE.DoubleSide;
        airframe.add(gltf.scene);
    }, undefined, function ( error ) {
        console.error( error );
    });

    loader.load( 'public/models/dropship/cockpit.glb', function ( gltf ) {
        var model = gltf.scene;
        var modelMaterial = new THREE.MeshLambertMaterial({color: 0x999999,
        transparent: true,
        opacity: 0.1,
        emissive: 0xea6d1a,
        roughness: 0.0,
        metalness: 0.6,
        side: THREE.DoubleSide});
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
        var modelMaterial = dropshipMaterial;
        model.traverse((o) => {
            if (o.isMesh) o.material = modelMaterial;
        });
        gltf.scene.name = 'wingsMesh';
        wings.position.x = -1;
        wings.add(gltf.scene);
        gltf.scene.position.x = 1;
    }, undefined, function ( error ) {
        console.error( error );
    });

    loader.load( 'public/models/dropship/ramp.glb', function ( gltf ) {
        var model = gltf.scene;
        var modelMaterial = dropshipMaterial;
        model.traverse((o) => {
            if (o.isMesh) o.material = modelMaterial;
        });
        gltf.scene.name = 'rampMesh';
        ramp.position.set(-2.28, -0.58, 0);
        gltf.scene.position.set(2.28, 0.58, 0);
        gltf.scene.side = THREE.DoubleSide;
        ramp.add(gltf.scene);
    }, undefined, function ( error ) {
        console.error( error );
    });

    loader.load( 'public/models/dropship/engine_r.glb', function ( gltf ) {
        var model = gltf.scene;
        var modelMaterial = dropshipMaterial;
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
        var modelMaterial = dropshipMaterial;
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
        var modelMaterial = dropshipMaterial;
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
        var modelMaterial = dropshipMaterial;
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


    engineRight.position.z = 6.3;
    engineLeft.position.z = -6.3;

    engines.add(engineLeft);
    engines.add(engineRight);
    engines.position.x = -0.48602;
    engines.position.y = 0.598318;

    wings.add(engines);
    airframe.add(wings);
    airframe.add(ramp);
    airframe.add(cockpit);

    pitchDropshipMovement.add(airframe);
    globalDropshipMovement.add(pitchDropshipMovement);

    globalDropshipMovement.position.y = 30;
    scene.add(globalDropshipMovement);
}

function addBlades(scene, bladesLeft, bladesRight, engineLeft, engineRight) {
    
    const rightBlade1 = createBladesSlow();
    const rightBlade2 = createBladesSlow();
    const rightBlade3 = createBladesSlow();

    rightBlade1.name = 'b1';
    rightBlade2.name = 'b2';
    rightBlade3.name = 'b3';

    rightBlade1.scale.set(-1, 1, 1);
    rightBlade2.scale.set(-1, 1, 1);
    rightBlade3.scale.set(-1, 1, 1);

    const rBladesSlow = new THREE.Group();

    rBladesSlow.add(rightBlade1);
    rightBlade2.rotation.y = 2.0944;
    rBladesSlow.add(rightBlade2);
    rightBlade3.rotation.y = -2.0944;
    rBladesSlow.add(rightBlade3);

    rBladesSlow.name = 'slow';

    bladesRight.add(rBladesSlow);

    const rightBlade1Fast = createBladesFast();
    const rightBlade2Fast = createBladesFast();
    const rightBlade3Fast = createBladesFast();

    rightBlade1Fast.name = 'b1';
    rightBlade2Fast.name = 'b2';
    rightBlade3Fast.name = 'b3';

    rightBlade1Fast.scale.set(-1, 1, 1);
    rightBlade2Fast.scale.set(-1, 1, 1);
    rightBlade3Fast.scale.set(-1, 1, 1);

    const rBladesFast = new THREE.Group();

    rBladesFast.add(rightBlade1Fast);
    rightBlade2Fast.rotation.y = 2.0944;
    rBladesFast.add(rightBlade2Fast);
    rightBlade3Fast.rotation.y = -2.0944;
    rBladesFast.add(rightBlade3Fast);

    rBladesFast.name = 'fast';

    bladesRight.add(rBladesFast);
    const leftBlade1 = createBladesSlow();
    const leftBlade2 = createBladesSlow();
    const leftBlade3 = createBladesSlow();

    leftBlade1.name = 'b1';
    leftBlade2.name = 'b2';
    leftBlade3.name = 'b3';

    const lBladesSlow = new THREE.Group();

    lBladesSlow.add(leftBlade1);
    leftBlade2.rotation.y = 2.0944;
    lBladesSlow.add(leftBlade2);
    leftBlade3.rotation.y = -2.0944;
    lBladesSlow.add(leftBlade3);

    lBladesSlow.name = 'slow';

    bladesLeft.add(lBladesSlow);

    const leftBlade1Fast = createBladesFast();
    const leftBlade2Fast = createBladesFast();
    const leftBlade3Fast = createBladesFast();

    leftBlade1Fast.name = 'b1';
    leftBlade2Fast.name = 'b2';
    leftBlade3Fast.name = 'b3';

    leftBlade1Fast.scale.set(-1, 1, 1);
    leftBlade2Fast.scale.set(-1, 1, 1);
    leftBlade3Fast.scale.set(-1, 1, 1);

    const lBladesFast = new THREE.Group();

    lBladesFast.add(leftBlade1Fast);
    leftBlade2Fast.rotation.y = 2.0944;
    lBladesFast.add(leftBlade2Fast);
    leftBlade3Fast.rotation.y = -2.0944;
    lBladesFast.add(leftBlade3Fast);

    lBladesFast.name = 'fast';

    bladesLeft.add(lBladesFast);

    bladesRight.position.set(0, 1.48, 0.4);
    bladesLeft.position.set(0, 1.48, -0.4);


    engineLeft.add(bladesLeft);
    engineRight.add(bladesRight);
}

function createBladesSlow() {
    const shape = new THREE.Shape();
    shape.moveTo(-0.1, -0.2); // Adjusted y to center the shape
    shape.lineTo(0.0, -0.3);
    shape.lineTo(0.01, -0.1);
    shape.lineTo(-0.01, 0.2); 
    shape.lineTo(-0.1, -0.2); // Close the shape


    const bladeCurve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(0, 0, 0.1),
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 0, 4),
        new THREE.Vector3(0.2, -0.19, 6.6)
    );

    const points = bladeCurve.getPoints(10); 


    const curvePath = new THREE.CurvePath();
    curvePath.add(new THREE.CatmullRomCurve3(points));

    const extrudeSettings = {
        steps: 100, 
        depth: 0,
        bevelEnabled: false,
        extrudePath: curvePath 
    };

    return createSweptMesh(shape, curvePath, extrudeSettings, dropshipMaterial)

}

function createBladesFast() {
    const height = 0.01;
    const radius = 6.6;
    const radialSegments = 8;
    const thetaStart = 0;
    const thetaLength = Math.PI / 6;

    const geometry = new THREE.CylinderGeometry(
        radius,   
        radius,    
        height,   
        radialSegments,
        1,         
        false,     
        thetaStart,
        thetaLength
    );

    const ghostGeometry = new THREE.CylinderGeometry(
        radius * 0.99, 
        radius * 0.99, 
        height,
        radialSegments,
        1,
        false,
        thetaLength,
        (Math.PI * 2 / 3) - thetaLength,
    )


    let material = new THREE.MeshStandardMaterial({ color: 0x001100,
        transparent: true,
        opacity: 0.2,    
        roughness: 0.7,
        metalness: 0.4, });
    let ghostMaterial =  new THREE.MeshStandardMaterial({ color: 0x001100, 
        transparent: true, 
        opacity: 0.1,    
        roughness: 0.7,
        metalness: 0.4, });

    const bladeSegment = new THREE.Mesh(geometry, material);
    const ghostBladeSegment = new THREE.Mesh(ghostGeometry, ghostMaterial)

    return new THREE.Group().add(bladeSegment).add(ghostBladeSegment);
}
