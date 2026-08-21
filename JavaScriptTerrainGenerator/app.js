import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createNoise2D } from 'simplex-noise';

const container = document.getElementById("webgl_container");

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


const noise2D = createNoise2D();


const geometry = new THREE.PlaneGeometry(100,100,100,100);

const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
material.wireframe = true;
const mesh = new THREE.Mesh(geometry,material);


const vertexArray = mesh.geometry.attributes.position.array;

let x,y,z,time;
let scale = 0.05
let amplitude = 5


mesh.rotation.x = -Math.PI / 2;

scene.add(mesh);

function animate() {
    mesh.geometry.attributes.position.needsUpdate = true;
    time = (performance.now() * 0.001) * 0.5;
    for (let index = 0; index < vertexArray.length; index += 3) {
    x = vertexArray[index];
    y = vertexArray[index + 1];
    z = noise2D(x * scale, (y * scale) + time) * amplitude
    vertexArray[index+2] = z;
    }
    mesh.geometry.computeVertexNormals();
    requestAnimationFrame(animate);
    orbitControls.update();
    renderer.render(scene,camera);
}

animate();