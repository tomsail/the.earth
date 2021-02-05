import * as THREE from 'https://unpkg.com/three@0.124.0/build/three.module.js';
import { EffectComposer } from 'https://unpkg.com/three@0.124.0//examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.124.0//examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'https://unpkg.com/three@0.124.0//examples/jsm/postprocessing/ShaderPass.js';
import { AdaptiveToneMappingPass } from 'https://unpkg.com/three@0.124.0//examples/jsm/postprocessing/AdaptiveToneMappingPass.js';
import { GammaCorrectionShader } from 'https://unpkg.com/three@0.124.0//examples/jsm/shaders/GammaCorrectionShader.js';

let bloomPass;
let adaptToneMappingPass;
let gammaCorrectionPass;

function createScene() {
	const scene = new THREE.Scene();
	const debugScene = new THREE.Scene();
	const sceneCube = new THREE.Scene();

	const r = "../../textures/cube/MilkyWay/";
	const urls = [ r + "dark-s_px.jpg", r + "dark-s_nx.jpg",
					r + "dark-s_py.jpg", r + "dark-s_ny.jpg",
					r + "dark-s_pz.jpg", r + "dark-s_nz.jpg" ];

	const textureCube = new THREE.CubeTextureLoader().load( urls );
	textureCube.encoding = THREE.sRGBEncoding;

	sceneCube.background = textureCube;


  	return [scene, sceneCube, debugScene];
}

function createEffectComposer(renderer, scene, sceneCube, debugScene, camera, cameraCube, cameraBG){
	let width = window.innerWidth || 1;
	let height = window.innerHeight || 1;

	const parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
	parameters.type = THREE.FloatType;

	if ( renderer.capabilities.isWebGL2 === false && renderer.extensions.has( 'OES_texture_half_float_linear' ) === false ) {
		parameters.type = undefined; // avoid usage of floating point textures
	}

	const hdrRenderTarget = new THREE.WebGLRenderTarget( width, height, parameters );
	let dynamicHdrEffectComposer = new EffectComposer( renderer, hdrRenderTarget );
	dynamicHdrEffectComposer.setSize( window.innerWidth, window.innerHeight );

	const debugPass = new RenderPass( debugScene, cameraBG );
	debugPass.clear = false;
	const scenePass = new RenderPass( scene, camera, undefined, undefined, undefined );
	const skyboxPass = new RenderPass( sceneCube, cameraCube );
	scenePass.clear = false;

	adaptToneMappingPass = new AdaptiveToneMappingPass( true, 256 );
	adaptToneMappingPass.needsSwap = true;
	gammaCorrectionPass = new ShaderPass( GammaCorrectionShader );

	dynamicHdrEffectComposer.addPass( skyboxPass );
	dynamicHdrEffectComposer.addPass( scenePass );
	dynamicHdrEffectComposer.addPass( adaptToneMappingPass );
	dynamicHdrEffectComposer.addPass( gammaCorrectionPass );
	
	return dynamicHdrEffectComposer;
}

function updateEffectComposer(params, earth){
	
	if ( adaptToneMappingPass ) {
		earth.updateToneTextures(adaptToneMappingPass, params);
	}
}

export { createScene, createEffectComposer, updateEffectComposer };
