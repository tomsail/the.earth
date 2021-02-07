import { Clock } from 'https://unpkg.com/three@0.124.0/build/three.module.js';
import { updateEffectComposer } from '../components/scene.js';

const clock = new Clock();
const OCCLUSION_LAYER = 1;
const DEFAULT_LAYER = 0;

class Loop {
  constructor(camera,cameraCube, scene, renderer,effectComposer) {
    this.camera = camera;
    this.cameraCube = cameraCube;
    this.scene = scene;
    this.renderer = renderer;
    this.effectComposer = effectComposer;
    this.updatables = [];
  }

  start(stats,orbitControls, sun,earth,params) {
    this.renderer.setAnimationLoop(() => {
      // tell every animated object to tick forward one frame
      this.tick();
      stats.update();
      orbitControls.update();
      updateEffectComposer(params, earth);
      earth.updateTextures(params);
      // sun.update(this.scene, this.camera,this.renderer, params);

      // update params 
      // this.renderer.update();
      // render a frame
      this.scene.children[3].rotation.y += params.earthRotation; // earth 
      this.scene.children[4].rotation.y += params.earthRotation; // earth in the future
      this.scene.children[5].rotation.y += params.earthRotation; // lights
      this.scene.children[6].rotation.y += params.earthRotation; // lights
      this.scene.children[7].rotation.y += params.earthRotation*2; // clouds
      this.scene.children[8].rotation.z += params.earthRotation/4; // clouds

      this.camera.lookAt( this.scene.position );
      this.cameraCube.rotation.copy( this.camera.rotation );

      this.renderer.setViewport( 0, 0 ,window.innerWidth  , window.innerHeight );
      this.effectComposer.render( 0.017 );

      // show the objects in the occlusion scene
      // this.camera.layers.set(OCCLUSION_LAYER);
      // // render the occlusion scene and apply the volumetric light shader
      // sun.occlusionComposer.render();

      // // show the objects in the lit scene
      // this.camera.layers.set(DEFAULT_LAYER);
      // // render the lit scene and blend the volumetric light effect
      // sun.composer.render();

    });
  }

  stop() {
    this.renderer.setAnimationLoop(null);
  }

  tick() {
    // only call the getDelta function once per frame!
    const delta = clock.getDelta();

    // console.log(
    //   `The last frame rendered in ${delta * 1000} milliseconds`,
    // );

    for (const object of this.updatables) {
      object.tick(delta);
    }
  }
}

export { Loop };
