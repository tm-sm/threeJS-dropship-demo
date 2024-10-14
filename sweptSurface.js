import * as THREE from 'three';

export function createBladeGeometry() {
    const shape = new THREE.Shape();
    shape.moveTo(-0.1, -0.2); // Adjusted y to center the shape
    shape.lineTo(0.06, -0.2);
    shape.lineTo(0.035, -0.1);
    shape.lineTo(-0.02, 0.2); 
    shape.lineTo(-0.1, -0.2); // Close the shape


    const bladeCurve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(0, 0, 0.1),
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 0, 4),
        new THREE.Vector3(0.1, -0.08, 7.4)
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