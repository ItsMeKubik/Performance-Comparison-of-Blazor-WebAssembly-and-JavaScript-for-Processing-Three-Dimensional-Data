import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById("webgl_container");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);

const renderer = new THREE.WebGLRenderer();
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize( window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement)

const orbitControls = new OrbitControls(camera, renderer.domElement);
camera.position.set(12,1,3);
orbitControls.update();

const geometry = new THREE.PlaneGeometry(2,2,2,2);
const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
material.wireframe = true;

const mesh = new THREE.Mesh(geometry,material);

mesh.geometry.attributes.position.array[14] = 1;



scene.add(mesh);

mesh.rotation.x = -Math.PI / 2;

function animate() {
    requestAnimationFrame(animate);
    orbitControls.update();
    renderer.render(scene,camera);
}

animate();


