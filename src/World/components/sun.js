import * as THREE from 'https://unpkg.com/three@0.124.0/build/three.module.js'; 
import { EffectComposer } from 'https://unpkg.com/three@0.124.0//examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.124.0//examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'https://unpkg.com/three@0.124.0//examples/jsm/postprocessing/ShaderPass.js';

let SCALE = 40;
let SUN_R = 696*SCALE**2;     // in thousand of km
let DIST2SUN = 1473e+3*SCALE; // in thousand of km

class Sun{
  constructor(params, renderer){
    this.params = params;
    this.renderer = renderer
    this.ambient = new THREE.AmbientLight(0x050505);
    this.spotLight = new THREE.DirectionalLight(0xffffff, params.sunLight );

    // calculating the rectangular equatorial coordinates, in the earth referential
    // (earth is in the center of the scene, at pos (0,0,0) )
    let T = new Date().getTime(); // Get the time (in ms) since January 1, 1970
    let d = T /1000 / 3600 / 24;  // translate to number of days 
    // number of days since the 1st of Jan 2000
    let n = d - 10957;            // substracting the number of between 2000 and 1970
    // The mean longitude of the Sun
    let L = 280.460 + 0.9856474 * n;
    // Sun mean anomaly
    let g = 357.528 + 0.9856003 * n;
    // Eccliptic longitude
    let lambda = L + 1.915 * Math.sin(g/180*Math.PI) + 0.02 * Math.sin(2*g/180*Math.PI); // in degrees
    // Obliquity of the ecliptic
    let epsilon = 23.49 - 0.0000004 * n;
    // equatorial position [X,Y,Z]
    let X = Math.cos(lambda/180*Math.PI);
    let Y = Math.sin(lambda/180*Math.PI) * Math.cos(epsilon/180*Math.PI);
    let Z = Math.sin(lambda/180*Math.PI) * Math.sin(epsilon/180*Math.PI);

    // angular velocity of the earth
    let H = new Date().getHours()    // Get the hour (0-23)
    let M = new Date().getMinutes()  // Get the minute (0-59)
    let S = new Date().getSeconds()  // Get the second (0-59)    
    let t = H*3600 + M*60 + S; 
    // set t0 for the initial position of the sun
    let t0 = -3600; 
    let omega = 2 * Math.PI / 23.9545;

    // finally, compute x,y,z coordinates using the tranformation matrix 
    // for the position of the Sun during the day: https://arxiv.org/pdf/1208.1043.pdf
    // [ A  B  0]   [X]
    // |-B  A  0| * |Y| 
    // [ 0  0  1]   [Z]
    console.log(t-t0)
    let A = Math.cos(omega*(t-t0)/3600);
    let B = Math.sin(omega*(t-t0)/3600);

    this.x = A*X + B*Y; 
    this.y = -B*X + A*Y; 
    this.z = Z;
    this.r = DIST2SUN;

    // a white sphere serves as the sun in the scene used 
    // to create the effect
    const sunGeo = new THREE.SphereBufferGeometry( SUN_R, 100, 100 );
    const material = new THREE.MeshBasicMaterial( { color: 0xffffff } ); // color white
    this.source = new THREE.Mesh( sunGeo, material );

    // for POSTPRO
    this.composer = new POSTPROCESSING.EffectComposer(this.renderer);
  }
  initLight(){
    // sunlight
    this.spotLight.position.set( this.y, this.z, this.x ).normalize();
    this.spotLight.position.multiplyScalar( this.r );
    this.spotLight.castShadow = true;
    this.spotLight.shadow.mapSize.width   = 2048;
    this.spotLight.shadow.mapSize.height 	= 2048;
    this.spotLight.shadow.camera.near     = 200;
    this.spotLight.shadow.camera.far      = 1500;
    this.spotLight.shadow.camera.fov      = 40;
    this.spotLight.shadow.bias 			      = -0.005;
    // physical sun
    this.source.position.set(this.y,this.z,this.x).normalize();
    this.source.position.multiplyScalar( this.r );
    // add ambient
  }

  initPostpro(scene, camera, renderer, params) {
    // Init GODRAYS effect
    let godraysEffect = new POSTPROCESSING.GodRaysEffect(camera, this.source, {
      resolutionScale: 0.75,
      density: 0.95,
      decay: 0.95,
      weight: 0.80,
      samples: 100
    });

    let renderPass = new POSTPROCESSING.RenderPass(scene, camera)
    
    
    let areaImage = new Image();
    areaImage.src = POSTPROCESSING.SMAAEffect.areaImageDataURL;
    let searchImage = new Image();
    searchImage.src = POSTPROCESSING.SMAAEffect.searchImageDataURL;
    let smaaEffect = new POSTPROCESSING.SMAAEffect(searchImage,areaImage,1);
    let effectPass = new POSTPROCESSING.EffectPass(camera,smaaEffect,godraysEffect);
    effectPass.renderToScreen = true;
    this.composer.addPass(renderPass);
    this.composer.addPass(effectPass);

    return this.composer;
  }

  addToScene(scene){
		scene.add( this.ambient ); 
		scene.add( this.spotLight ); 
		scene.add( this.source ); 
  }

  update(params){
    this.spotLight.intensity = params.sunLight;
  }
}

export { Sun };
