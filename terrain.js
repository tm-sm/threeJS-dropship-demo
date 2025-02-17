import * as THREE from 'three';
import { noise } from './libs/noisejs/perlin.js'

export function setupTerrain(scene) {
    const segmentWidth = 64;
    const segmentLength = 64;
    const width = 5120;
    const length = 5120;
    
    const { vertices, indices } = setVerticesAndIndices(segmentWidth, segmentLength, width, length);
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));

    geometry.computeVertexNormals();

    const textureLoader = new THREE.TextureLoader();
    const sandBump = textureLoader.load('./public/textures/sand_bump.jpg', () => {
        sandBump.wrapS = THREE.RepeatWrapping;
        sandBump.wrapT = THREE.RepeatWrapping;
        sandBump.repeat.set(10, 10); // Adjust tiling for larger terrains
    });
    
    const material = new THREE.MeshStandardMaterial({
        color: 0x7D6741,
        roughness: 0.9,
        metalness: 0.5,
        side: THREE.DoubleSide,
        bumpMap: sandBump,
        flatShading: false // Ensure smooth shading for normal map effects
    });

    var terrain = new THREE.Mesh(geometry, material);
    terrain.castShadow = true;
    terrain.receiveShadow = true;
    scene.add(terrain);
    scene.background = new THREE.Color(0x82c8e5)

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
            vertices[vertIndex++] = x;
            vertices[vertIndex++] = ((noise.simplex2(x, z))) * ((x + z) / 50) * Math.sin(x * Math.cos(z));
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
