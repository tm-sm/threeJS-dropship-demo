import * as THREE from 'three'
import { chaseCamera, topViewCamera, sideViewCamera, debugCamera, fpvCamera, frontViewCamera } from './main.js'

export var currentCamera;

// ==========================================
// INPUT HANDLERS
// ==========================================
const keyMap = {
    87: { key: 'w', input: 'forward', state: true },  // W key
    83: { key: 's', input: 'backward', state: true },  // S key
    65: { key: 'a', input: 'turnLeft', state: true },  // A key
    68: { key: 'd', input: 'turnRight', state: true }, // D key
    90: { key: 'z', input: 'left', state: true },      // Z key
    88: { key: 'x', input: 'right', state: true },     // X key
    81: { key: 'q', input: 'up', state: true },        // Q key
    69: { key: 'e', input: 'down', state: true },      // E key
    73: { key: 'i', input: 'toggleEngine', toggle: true }, // I key
    80: { key: 'p', input: 'toggleRamp', toggle: true }, // P key
    71: { key: 'g', input: 'toggleGear', toggle: true }, // G key
    72: { key: 'h', input: 'toggleBladeExtension', toggle: true }, // H key
    32: { key: ' ', input: 'fireRocket', toggle: false }, // space key
    49: { action: () => {} },                         // Camera (Num 1)
    50: { action: () => currentCamera = chaseCamera },  // Num 2
    51: { action: () => currentCamera = sideViewCamera }, // Num 3
    52: { action: () => currentCamera = topViewCamera },  // Num 4
    53: { action: () => currentCamera = frontViewCamera }, // Num 5
    54: { action: () => currentCamera = fpvCamera },    // Num 6
    57: { action: () => currentCamera = debugCamera },  // Num 9
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
    toggleRamp: false,
    toggleBladeExtension: false,
    toggleGear: false,
    fireRocket: false,
};

function handleKeyEvent(e, isKeyDown) {
    const mapping = keyMap[e.keyCode];
    if (mapping) {
        if (mapping.action) {
            mapping.action();
        } else if (mapping.toggle) {
            if (isKeyDown) {
                input[mapping.input] = !input[mapping.input];
            }
        } else {
            input[mapping.input] = isKeyDown;
        }
    }

    // Reset when keys are released
    if (!isKeyDown) {
        if (!input.forward && !input.backward) {
            input.forward = input.backward = false;
        }
        if (!input.turnLeft && !input.turnRight) {
            input.turnLeft = input.turnRight = false;
        }
        if (!input.left && !input.right) {
            input.left = input.right = false;
        }
        if (!input.up && !input.down) {
            input.up = input.down = false;
        }
    }
}

export function loadControls() {
    currentCamera = chaseCamera;
    document.addEventListener('keydown', (e) => handleKeyEvent(e, true));
    document.addEventListener('keyup', (e) => handleKeyEvent(e, false));
}