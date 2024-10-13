import * as THREE from 'three'
import { chaseCamera, topViewCamera, sideViewCamera, debugCamera } from './main.js'

export var currentCamera;

// ==========================================
// INPUT HANDLERS
// ==========================================

const wKey = 87;
const sKey = 83;
const aKey = 65;
const dKey = 68;
const zKey = 90;
const xKey = 88;
const qKey = 81;
const eKey = 69;
const numOne = 49;
const numTwo = 50;
const numThree = 51;
const numFour = 52;
const numNine = 57;

const keyState = {
    w: false,
    s: false,
    a: false,
    d: false,
    z: false,
    x: false,
    q: false,
    e: false,
};


export var accelerating = {
    forward: false,
    backward: false,
    right: false,
    left: false,
    turnRight: false,
    turnLeft: false,
    up: false,
    down: false,
};

export function loadControls() {
    currentCamera = chaseCamera;
    document.addEventListener('keydown', (e) => {
        switch (e.keyCode) {
            case wKey:
                keyState.w = true;
                accelerating.forward = true;
                accelerating.backward = false;
                break;
            case sKey:
                keyState.s = true;
                accelerating.backward = true;
                accelerating.forward = false;
                break;
            case aKey:
                keyState.a = true;
                accelerating.left = true;
                accelerating.right = false;
                break;
            case dKey:
                keyState.d = true;
                accelerating.right = true;
                accelerating.left = false;
                break;
            case zKey:
                keyState.z = true;
                accelerating.turnLeft = true;
                accelerating.turnRight = false;
                break;
            case xKey:
                keyState.x = true;
                accelerating.turnRight = true;
                accelerating.turnLeft = false;
                break;
            case qKey:
                keyState.q = true;
                accelerating.up = true;
                accelerating.down = false;
                break;
            case eKey:
                keyState.e = true;
                accelerating.down = true;
                accelerating.up = false;
                break;
            case numOne:
                break;
            case numTwo:
                currentCamera = chaseCamera;
                break;
            case numThree:
                currentCamera = topViewCamera;
                break;
            case numFour:
                currentCamera = sideViewCamera;
                break;
            case numNine:
                currentCamera = debugCamera;
                break;
            default:
                break;
        }
    });
    
    document.addEventListener('keyup', (e) => {
        switch (e.keyCode) {
            case wKey:
                keyState.w = false;
                accelerating.forward = false;
                break;
            case sKey:
                keyState.s = false;
                accelerating.backward = false;
                break;
            case aKey:
                keyState.a = false;
                accelerating.left = false;
                break;
            case dKey:
                keyState.d = false;
                accelerating.right = false;
                break;
             case zKey:
                keyState.z = false;
                accelerating.turnLeft = false;
                break;
            case xKey:
                keyState.x = false;
                accelerating.turnRight = false;
                break;
            case qKey:
                keyState.q = false;
                accelerating.up = false;
                break;
            case eKey:
                keyState.e = false;
                accelerating.down = false;
                break;
            default:
                break;
        }
    
        // Stop movement/turning when no keys are pressed
        if (!keyState.w && !keyState.s) {
            accelerating.forward = false;
            accelerating.backward = false;
        }
    
        if (!keyState.a && !keyState.d) {
            accelerating.turnLeft = false;
            accelerating.turnRight = false;
        }
    });
}
