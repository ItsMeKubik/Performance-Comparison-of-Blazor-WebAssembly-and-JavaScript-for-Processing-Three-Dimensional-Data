import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js'

const webglcontainer = document.getElementById("webgl_container");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.Fog(0xffffff, 0.0025, 50);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.x = 0;
camera.position.z = 8;
camera.position.y = 2;

const renderer = new THREE.WebGLRenderer({ antialias: true});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
webglcontainer.appendChild(renderer.domElement);

const geometry = new THREE.PlaneGeometry(10,10,20,20);
const material = new THREE.MeshBasicMaterial({color: 0xffff00,side: THREE.DoubleSide});
material.wireframe = true;
const plane = new THREE.Mesh(geometry,material);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

function animate(){
    requestAnimationFrame(animate);
    renderer.render(scene,camera);
}

animate();
