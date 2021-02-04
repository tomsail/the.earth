import * as THREE from 'https://unpkg.com/three@0.124.0/build/three.module.js';

function createRenderer() {
  const renderer = new THREE.WebGLRenderer();
  
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;
  
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.autoClear = false;

  renderer.physicallyCorrectLights = true;

  return renderer;
}

export { createRenderer };
