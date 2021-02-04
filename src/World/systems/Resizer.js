const setSize = (container, camera, cameraCube, renderer) => {
  camera.aspect =  window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

	cameraCube.aspect =  window.innerWidth / window.innerHeight;
  cameraCube.updateProjectionMatrix();
  
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setPixelRatio(window.devicePixelRatio);
};

class Resizer {
  constructor(container, camera, cameraCube, renderer) {
    // set initial size
    setSize(container,  camera, cameraCube, renderer);

    window.addEventListener('resize', () => {
      // set the size again if a resize occurs
      setSize(container, camera, cameraCube, renderer);
      // perform any custom actions
      this.onResize();
    });
  }
  onResize() {}
}

export { Resizer };
