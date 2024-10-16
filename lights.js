import * as THREE from 'three';


// Set up lighting
export function setLights(scene) {
    const ambientLight = new THREE.AmbientLight(0xffffff, .8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xcccccc, 5.0);
    directionalLight.position.set(100, 100, 0);
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

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, .5); // Adjusted intensity
    scene.add(hemisphereLight);
}