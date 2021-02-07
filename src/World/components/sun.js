import * as THREE from 'https://unpkg.com/three@0.124.0/build/three.module.js'; 
import { EffectComposer } from 'https://unpkg.com/three@0.124.0//examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.124.0//examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'https://unpkg.com/three@0.124.0//examples/jsm/postprocessing/ShaderPass.js';
let SCALE = 40;
const OCCLUSION_LAYER = 1;
let volumetricLightShaderUniforms;
let SUN_R = 696*SCALE**2;     // in thousand of km
let DIST2SUN = 1473e+3*SCALE; // in thousand of km
let VolumetricLightShader = new THREE.ShaderMaterial( {
  uniforms: {
    tDiffuse: {value:null},
    lightPosition: {value: new THREE.Vector2(0.5, 0.5)},
    exposure: {value: 0.18},
    decay: {value: 0.95},
    density: {value: 0.8},
    weight: {value: 0.4},
    samples: {value: 50}
  },
  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}"
  ].join("\n"),
  fragmentShader: [
    "varying vec2 vUv;",
    "uniform sampler2D tDiffuse;",
    "uniform vec2 lightPosition;",
    "uniform float exposure;",
    "uniform float decay;",
    "uniform float density;",
    "uniform float weight;",
    "uniform int samples;",
    "const int MAX_SAMPLES = 100;",
    "void main()",
    "{",
      "vec2 texCoord = vUv;",
      "vec2 deltaTextCoord = texCoord - lightPosition;",
      "deltaTextCoord *= 1.0 / float(samples) * density;",
      "vec4 color = texture2D(tDiffuse, texCoord);",
      "float illuminationDecay = 1.0;",
      "for(int i=0; i < MAX_SAMPLES; i++)",
      "{",
        "if(i == samples){",
          "break;",
        "}",
        "texCoord -= deltaTextCoord;",
        "vec4 sample = texture2D(tDiffuse, texCoord);",
        "sample *= illuminationDecay * weight;",
        "color += sample;",
        "illuminationDecay *= decay;",
      "}",
      "gl_FragColor = color * exposure;",
    "}"
  ].join("\n")
} );

let AdditiveBlendingShader = new THREE.ShaderMaterial({
  uniforms: {
    tDiffuse: { value:null },
    tAdd: { value:null }
  },

  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}"
  ].join("\n"),

  fragmentShader: [
    "uniform sampler2D tDiffuse;",
    "uniform sampler2D tAdd;",
    "varying vec2 vUv;",
    "void main() {",
      "vec4 color = texture2D( tDiffuse, vUv );",
      "vec4 add = texture2D( tAdd, vUv );",
      "gl_FragColor = color + add;",
    "}"
  ].join("\n")
});

let PassThroughShader = new THREE.ShaderMaterial({
  uniforms: {
    tDiffuse: { value: null }
  },

  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}"
  ].join( "\n" ),

  fragmentShader: [
    "uniform sampler2D tDiffuse;",
    "varying vec2 vUv;",
    "void main() {",
      "gl_FragColor = texture2D( tDiffuse, vec2( vUv.x, vUv.y ) );",
    "}"
  ].join( "\n" )
});

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
    console.log(t);

    // tranformation matrix for the position of the Sun during the day: https://arxiv.org/pdf/1208.1043.pdf
    let t0 = 18000; 
    let omega = 2 * Math.PI / 23.9545;
    let A = Math.cos(omega*(t-t0));
    let B = Math.sin(omega*(t-t0));

    // finally, compute x,y,z coordinates
    this.x = A*X + B*Y; 
    this.y = -B*X + A*Y; 
    this.z = Z;
    this.r = DIST2SUN;

    // a white sphere serves as the sun in the scene used 
    // to create the effect
    const sunGeo = new THREE.SphereBufferGeometry( SUN_R, 100, 100 );
    const material = new THREE.MeshBasicMaterial( { color: 0xffffff } ); // color white
    this.source = new THREE.Mesh( sunGeo, material );

    // // the earth in the scene that rotates around the light -- TODO add earth rotation
    // const earthGeo = new THREE.SphereBufferGeometry( 600, 120, 120 );
    // const material1 = new THREE.MeshBasicMaterial( { color:0x000000 } ); // color black
    // this.occlusion = new THREE.Mesh( earthGeo, material1);
    // this.occlusion.layers.set( OCCLUSION_LAYER );

    // // create the occlusion render target and composer
    // // to increase performance we only render the effect at 1/2 the screen size
    // this.occlusionRenderTarget = new THREE.WebGLRenderTarget( window.innerWidth , window.innerHeight );
    // this.occlusionComposer = new EffectComposer( this.renderer, this.occlusionRenderTarget);
    // // a second composer and render pass for the lit scene
    // this.composer = new EffectComposer( this.renderer );
    
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

  initPostpro(scene){

    // this.source.layers.set( OCCLUSION_LAYER );
    // this.occlusion.layers.set( OCCLUSION_LAYER );
  }

  addToScene(scene){
		scene.add( this.ambient ); 
		scene.add( this.spotLight ); 
		scene.add( this.source ); 
    // scene.add( this.occlusion );   
  }

  update(scene, camera, params){
    this.spotLight.intensity = params.sunLight;

    var pass;
    
    // add a scene render pass
    this.occlusionComposer.addPass( new RenderPass( scene, camera ) );
    // add the volumeteric shader pass that will automatically be applied
    // to texture created by the scene render 
    pass = new ShaderPass( VolumetricLightShader );
    console.log(pass.uniforms)
    // since only one shader is used the front and back buffers do not need to be swapped
    // after the shader does its work.
    pass.needsSwap = false;
    this.occlusionComposer.addPass( pass );

    volumetricLightShaderUniforms = pass.uniforms;
    
    this.composer.addPass( new RenderPass( scene, camera ) );
    // an additive blending pass that takes as a uniform
    // the resulting texture from the volumetric light shader 
    pass = new ShaderPass( AdditiveBlendingShader );
    pass.uniforms.tAdd.value = this.occlusionRenderTarget.texture;
    this.composer.addPass( pass );
    pass.renderToScreen = true;

    const material = new THREE.ShaderMaterial( PassThroughShader );
    material.uniforms.tDiffuse.value = occlusionRenderTarget.texture;

    let mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), material );
    this.composer.passes[1].scene.add( mesh );
    mesh.visible = false;
  }
}

export { Sun };
