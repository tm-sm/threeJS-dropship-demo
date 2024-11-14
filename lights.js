import * as THREE from 'three';


// Set up lighting
export function setLights(scene) {
    const ambientLight = new THREE.AmbientLight(0x88888888, 7.5);
    scene.add(ambientLight);

    const sunCoords = new THREE.Vector3(10000, 1000, 200);

    const directionalLight = new THREE.DirectionalLight(0xfdfbd3, 2.5);
    directionalLight.position.set(sunCoords.x, sunCoords.y, sunCoords.z);
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
    const sunGeometry = new THREE.SphereGeometry(300, 30, 16); // Adjust the radius and segment values
    const sunMaterial = new THREE.MeshPhongMaterial({ color: 0xd6902e,
        emissive: 0xffffff,
     });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    
    sun.position.set(sunCoords.x, sunCoords.y, sunCoords.z);
    scene.add(sun);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.5); // Adjusted intensity
    scene.add(hemisphereLight);
}