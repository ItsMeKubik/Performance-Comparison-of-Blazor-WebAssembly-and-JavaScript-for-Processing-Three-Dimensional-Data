import * as THREE from "https://esm.sh/three@0.160.0";

import { OrbitControls } from "https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js";

// Globální proměnné
let scene, camera, renderer, orbitControls, wasmExports, wasmMemory, light, dotnetRuntime;
let mesh;
let BENCHMARK_START_TIME;
let time, time_start, time_end;
let count = 0;
let time_took = 0;
const TESTING_TIME = 60000;

export async function initThreeJSEngine(){
    dotnetRuntime = await globalThis.getDotnetRuntime(0);
    wasmExports = await dotnetRuntime.getAssemblyExports("BlazorTerrainGenerator.dll");

    const container = document.getElementById("webgl_container");


    const containerWidth = container.clientWidth;
    const containerHeight = window.innerHeight;

    // Vytvoření scény
    scene = new THREE.Scene();

    // Vytvoření kamery
    camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);


    // Nastavení backgroundu na černou
    scene.background = new THREE.Color(0x111111);

    // Renderer -> kde se bude renderovat terén
    renderer = new THREE.WebGLRenderer();
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setSize(containerWidth, containerHeight);
    container.appendChild(renderer.domElement);


    // Nastavení ovládání (pro UX)
    orbitControls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(120, 50, 105);
    orbitControls.update();

    // Světlo
    light = new THREE.DirectionalLight(0xffffff, 1.0);
    scene.add(light);
}

export function startBenchmark(size){
    return new Promise((resolve, reject) => {
        count = 0;
        time_took = 0;
        const geometry = new THREE.PlaneGeometry(size, size, size, size);
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    
        const vertices = (size + 1) * (size + 1);
        let totalFloats = vertices * 3;

        const pointer = wasmExports.TerrainGenerator.InitBuffer(totalFloats);
        wasmMemory = dotnetRuntime.Module.HEAPU8.buffer;

        const pole = new Float32Array(wasmMemory, pointer, totalFloats);
        pole.set(geometry.attributes.position.array)

        if(mesh){
            scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        }
        mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        
        mesh.geometry.setAttribute('position', new THREE.BufferAttribute(pole, 3));
        scene.add(mesh);

        function animate() {
            count += 1;
            time = (performance.now() * 0.001) * 0.5;
            time_start = performance.now();
            
            wasmExports.TerrainGenerator.Generate(time);
            
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
            
            if (elapsed_time >= TESTING_TIME) {
                cancelAnimationFrame(animID);
                let averageTime = time_took / count;
                resolve(averageTime);
                return;
            }
        }
        BENCHMARK_START_TIME = performance.now();
        animate();
    });
}

