import * as THREE from 'three';

export function createBladeGeometry() {
    const shape = new THREE.Shape();
    shape.moveTo(-0.1, 0); // Adjusted width for blade
    shape.lineTo(0.06, 0);
    shape.lineTo(0.07, 0.1); // Height of the blade
    shape.lineTo(-0.07, 0.4);
    shape.lineTo(-0.1, 0); // Close the shape


    const bladeCurve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 0, 2),
        new THREE.Vector3(0.01, 0, 6.6)
    );

    const points = bladeCurve.getPoints(30); 


    const curvePath = new THREE.CurvePath();
    curvePath.add(new THREE.CatmullRomCurve3(points));

    const extrudeSettings = {
        steps: 100, 
        depth: 0,
        bevelEnabled: false,
        extrudePath: curvePath 
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    return geometry;
}