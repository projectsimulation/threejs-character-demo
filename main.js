// Three.js Character Controller – GitHub Pages compatible

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xc5d1c5);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 4, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.enablePan = false;
controls.enableZoom = false;

scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.8));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60),
  new THREE.MeshStandardMaterial({ color: 0xc5d1c5, flatShading: true })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

let mixer, model;
const loader = new THREE.GLTFLoader();
loader.load(
  './basic_walk_free_animation_30_frames_loop.glb',
  (gltf) => {
    model = gltf.scene;
    scene.add(model);
    mixer = new THREE.AnimationMixer(model);
    if (gltf.animations && gltf.animations.length) {
      mixer.clipAction(gltf.animations[0]).play();
    }
    model.position.set(0, 0, 0);
  },
  undefined,
  (error) => {
    console.error('Error loading GLB:', error);
  }
);

const keys = { forward: false, back: false, left: false, right: false };
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.forward = true;
  if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.back = true;
  if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = true;
  if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = true;
});
window.addEventListener('keyup', (e) => {
  if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.forward = false;
  if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.back = false;
  if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = false;
  if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = false;
});

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  if (model) {
    const dir = new THREE.Vector3(
      (keys.right ? 1 : 0) - (keys.left ? 1 : 0),
      0,
      (keys.back ? 1 : 0) - (keys.forward ? 1 : 0)
    );
    if (dir.lengthSq()) {
      dir.normalize().multiplyScalar(delta * 2);
      model.position.add(dir);
      model.rotation.y = Math.atan2(dir.x, dir.z);
    }

    const camPos = new THREE.Vector3(
      model.position.x,
      model.position.y + 4,
      model.position.z + 10
    );
    camera.position.lerp(camPos, 0.1);
    controls.target.lerp(model.position.clone().add(new THREE.Vector3(0, 1, 0)), 0.1);
    controls.update();
  }

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
