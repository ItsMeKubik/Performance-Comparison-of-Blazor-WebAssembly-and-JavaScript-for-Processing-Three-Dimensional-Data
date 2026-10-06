import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import FastNoiseLite  from "fastnoise-lite";

const container = document.getElementById("webgl_container");
const clock_container = document.getElementById("clock");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);

scene.background = new THREE.Color(0x111111);

const renderer = new THREE.WebGLRenderer();
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize( window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

const orbitControls = new OrbitControls(camera, renderer.domElement);
camera.position.set(120,50,105);
orbitControls.update();


const fastNoise = new FastNoiseLite();
fastNoise.SetNoiseType(FastNoiseLite.NoiseType.OpenSimplex2);
fastNoise.SetSeed(1337);
fastNoise.SetFractalType(FastNoiseLite.FractalType.None);
fastNoise.SetFrequency(1);

const geometry = new THREE.PlaneGeometry(250,250,250,250);


const light = new THREE.DirectionalLight( {color: 0xffffff} );

const material = new THREE.MeshStandardMaterial( { color: 0xffffff } );
const mesh = new THREE.Mesh(geometry,material);

const vertexArray = mesh.geometry.attributes.position.array;

let x,y,z,time,scale,amplitude,j,i,time_start,time_end,n;
let count = 0;
let time_took = 0;

mesh.rotation.x = -Math.PI / 2;

scene.add(mesh,light);

function animate() {
    count += 1;
    time_start = performance.now();
    mesh.geometry.attributes.position.needsUpdate = true;
    time = (performance.now() * 0.001) * 0.5;
    for (i = 0; i < vertexArray.length; i += 3) {
        scale = 0.05;
        amplitude = 4;
        x = vertexArray[i];
        y = vertexArray[i + 1];
        z = 0;
        for (j = 0; j < 4; j++) {
            n = fastNoise.GetNoise(x*scale, (y*scale) + time) * amplitude;
            z += (n + 1) / 2;
            scale *= 2;
            amplitude /= 2;
        }
        vertexArray[i+2] = Math.pow(z,1.5);
    }
    mesh.geometry.computeVertexNormals();
    time_end = performance.now();
    time_took += time_end - time_start;
    orbitControls.update();
    renderer.render(scene,camera);
    requestAnimationFrame(animate);
    if (count == 60){
        clock_container.innerHTML = time_took / 60;
        time_took = 0;
        count = 0;
    }
    
}

animate();