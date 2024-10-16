import * as THREE from 'three'
import { chaseCamera, topViewCamera, sideViewCamera, debugCamera, fpvCamera, frontViewCamera } from './main.js'

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
const iKey = 73;
const numOne = 49;
const numTwo = 50;
const numThree = 51;
const numFour = 52;
const numFive = 53;
const numSix = 54;
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
    i: false,
};


export var input = {
    forward: false,
    backward: false,
    right: false,
    left: false,
    turnRight: false,
    turnLeft: false,
    up: false,
    down: false,
    toggleEngine: false,
};

export function loadControls() {
    currentCamera = chaseCamera;
    document.addEventListener('keydown', (e) => {
        switch (e.keyCode) {
            case wKey:
                keyState.w = true;
                input.forward = true;
                input.backward = false;
                break;
            case sKey:
                keyState.s = true;
                input.backward = true;
                input.forward = false;
                break;
            case aKey:
                keyState.a = true;
                input.left = true;
                input.right = false;
                break;
            case dKey:
                keyState.d = true;
                input.right = true;
                input.left = false;
                break;
            case zKey:
                keyState.z = true;
                input.turnLeft = true;
                input.turnRight = false;
                break;
            case xKey:
                keyState.x = true;
                input.turnRight = true;
                input.turnLeft = false;
                break;
            case qKey:
                keyState.q = true;
                input.up = true;
                input.down = false;
                break;
            case eKey:
                keyState.e = true;
                input.down = true;
                input.up = false;
                break;
            case iKey:
                keyState.i = true;
                input.toggleEngine = !input.toggleEngine;
                break;
            case numOne:
                break;
            case numTwo:
                currentCamera = chaseCamera;
                break;
            case numThree:
                currentCamera = sideViewCamera;
                break;
            case numFour:
                currentCamera = topViewCamera;
                break;
            case numFive:
                currentCamera = frontViewCamera;
                break;
            case numSix:
                currentCamera = fpvCamera;
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
                input.forward = false;
                break;
            case sKey:
                keyState.s = false;
                input.backward = false;
                break;
            case aKey:
                keyState.a = false;
                input.left = false;
                break;
            case dKey:
                keyState.d = false;
                input.right = false;
                break;
             case zKey:
                keyState.z = false;
                input.turnLeft = false;
                break;
            case xKey:
                keyState.x = false;
                input.turnRight = false;
                break;
            case qKey:
                keyState.q = false;
                input.up = false;
                break;
            case eKey:
                keyState.e = false;
                input.down = false;
                break;
            case iKey:
                keyState.i = false;
                break;
            default:
                break;
        }
    
        // Stop movement/turning when no keys are pressed
        if (!keyState.w && !keyState.s) {
            input.forward = false;
            input.backward = false;
        }
    
        if (!keyState.a && !keyState.d) {
            input.turnLeft = false;
            input.turnRight = false;
        }
    });
}
