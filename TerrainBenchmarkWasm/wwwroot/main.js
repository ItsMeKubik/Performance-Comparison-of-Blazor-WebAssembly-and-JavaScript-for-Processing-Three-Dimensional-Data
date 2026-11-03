// Licensed to the .NET Foundation under one or more agreements.
// The .NET Foundation licenses this file to you under the MIT license.

import { dotnet } from './_framework/dotnet.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


// .NET Bootstrap
const dotnetRuntime = await dotnet.create();
const exports = await dotnetRuntime.getAssemblyExports(dotnetRuntime.getConfig().mainAssemblyName);


const container = document.getElementById("webgl_container");
const clock_container = document.getElementById("clock");
const sizeSelect = document.getElementById('gridSize');
const vertexDisplay = document.getElementById('vertexCount');
const startBtn = document.getElementById('startBtn');


const containerWidth = container.clientWidth;
const containerHeight = window.innerHeight;


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);

scene.background = new THREE.Color(0x111111);

const renderer = new THREE.WebGLRenderer();
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(containerWidth, containerHeight);
container.appendChild(renderer.domElement);

const orbitControls = new OrbitControls(camera, renderer.domElement);
camera.position.set(120, 50, 105);
orbitControls.update();

const light = new THREE.DirectionalLight(0xffffff, 1.0);
scene.add(light);

let mesh;
let vertexArray;
let BENCHMARK_START_TIME;
let time, time_start, time_end;
let count = 0;
let time_took = 0;
const TESTING_TIME = 60000;

sizeSelect.addEventListener('change', (event) => {
    const size = parseInt(event.target.value);
    const vertices = (size + 1) * (size + 1);
    vertexDisplay.innerText = `Vertices: ${vertices}`;
});


startBtn.addEventListener('click', () => {
    startBtn.disabled = true;
    sizeSelect.disabled = true;

    const size = parseInt(sizeSelect.value);

    const geometry = new THREE.PlaneGeometry(size, size, size, size);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    
    const vertices = (size + 1) * (size + 1);
    let totalFloats = vertices * 3;

    const pointer = exports.TerrainGenerator.InitBuffer(totalFloats);
    const wasmMemory = dotnetRuntime.Module.HEAPU8.buffer;

    const pole = new Float32Array(wasmMemory, pointer, totalFloats);
    pole.set(geometry.attributes.position.array)
    
    mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    
    mesh.geometry.setAttribute('position', new THREE.BufferAttribute(pole, 3));
    scene.add(mesh);

    BENCHMARK_START_TIME = performance.now();
    animate();
});

function animate() {
    count += 1;
    time = (performance.now() * 0.001) * 0.5;
    time_start = performance.now();
    
    exports.TerrainGenerator.Generate(time);
    
    mesh.geometry.attributes.position.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
    time_end = performance.now();
    time_took += time_end - time_start;
    
    orbitControls.update();
    renderer.render(scene, camera);
    
    let animID = requestAnimationFrame(animate);
    let elapsed_time = performance.now() - BENCHMARK_START_TIME;
    
    let totalSeconds = Math.floor(elapsed_time / 1000);
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    clock_container.innerHTML = `Uplynulý čas: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} / ${((TESTING_TIME / 1000) / 60).toString()}:${((TESTING_TIME / 1000) % 60).toString().padStart(2,'0')} `;
    
    if (elapsed_time >= TESTING_TIME) {
        clock_container.innerHTML = `Průměrný čas výpočtu: ${(time_took / count).toFixed(2)} ms`;
        cancelAnimationFrame(animID);
        return;
    }
}
