import * as THREE from 'three';

export function createSweptMesh(shape, curvePath, extrudeSettings, material) {

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    return new THREE.Mesh(geometry, material);
}