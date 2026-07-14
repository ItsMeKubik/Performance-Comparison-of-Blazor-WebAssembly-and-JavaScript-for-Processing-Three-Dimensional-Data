import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const webglcontainer = document.getElementById("webgl_container");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x496baa);
//scene.fog = new THREE.Fog(0xffffff, 0.0025, 50);

const renderer = new THREE.WebGLRenderer({ antialias: true});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
webglcontainer.appendChild(renderer.domElement);

// CAMERA CONTROL
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
const controls = new OrbitControls( camera, renderer.domElement );
camera.position.set( 120, 50, 105 );
controls.enableDamping = true;
controls.update();


// LIGHT CONTROL
const light = new THREE.DirectionalLight(0xffffff,2);
light.position.x = 100;
light.position.y = 100;
light.position.z = 50;


// GEOMETRIE
const geometry = new THREE.PlaneGeometry(200,200,100,100);
const material = new THREE.MeshStandardMaterial({color: 0xffffff});
const plane = new THREE.Mesh(geometry,material);
let x,y,z;
for (let i = 0; i < plane.geometry.attributes.position.array.length; i+=3) {
    x = plane.geometry.attributes.position.array[i];
    y = plane.geometry.attributes.position.array[i + 1];
    z = (Math.sin(x * 0.05) * 10) + (Math.sin(x * 0.2) * 2) + (Math.cos(y * 0.05) * 10);
    plane.geometry.attributes.position.array[i + 2] = z;
}
plane.geometry.attributes.position.needsUpdate = true;
plane.geometry.computeVertexNormals();

plane.rotation.x = -Math.PI / 2;
scene.add(plane,light);

function animate(){
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene,camera);
}

animate();
