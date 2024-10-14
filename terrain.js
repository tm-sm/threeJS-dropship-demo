import * as THREE from 'three';
import { noise } from './libs/noisejs/perlin.js'

export function setupTerrain(scene) {
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
        color: new THREE.Color(0x7D6741),
        roughness: 1.0,
        metalness: 0.3,
        side: THREE.DoubleSide,
    }); 

    var terrain = new THREE.Mesh(geometry, material);
    terrain.castShadow = true;
    terrain.receiveShadow = true;
    scene.add(terrain);
    scene.background = new THREE.Color(0xbbbbff)

    return terrain;
}

function setVerticesAndIndices(segmentWidth, segmentLength, width, length) {
    const segmentsX = width / segmentWidth;
    const segmentsZ = length / segmentLength;
    noise.seed(119); // ?

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
            vertices[vertIndex++] = x - 10 * (noise.simplex2(x, z));
            vertices[vertIndex++] = ((noise.simplex2(x, z) + 1) / 2) * 60;
            vertices[vertIndex++] = z + (noise.simplex2(x, z));
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
