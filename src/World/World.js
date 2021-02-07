// COMPONENTS OF THE SCENE
import { createCamera,createCameraCube } from './components/camera.js';
import { createScene, createEffectComposer,updateEffectComposer } from './components/scene.js';
import { Earth } from './components/earth.js'
import { Sun } from './components/sun.js'

// SYSTEMS 
import { Resizer } from './systems/Resizer.js';
import { Loop } from './systems/Loop.js';
import { createRenderer } from './systems/renderer.js';
import { createControls, initGui, initParams } from './systems/controls.js';
// import { getGeoLocation } from './systems/geoLocation.js'
import Stats from 'https://unpkg.com/three@0.124.0//examples/jsm/libs/stats.module.js';

let loop;

// STATS
let stats;

let scene,sceneCube,debugScene;
let camera, renderer, dynamicHdrEffectComposer; 
let cameraCube;
let cameraBG;

// CAMERA ROTATION
let camRotation = 0.0;  

// PARTICLES
let afterimagePass; // control alpha
let instances = 1000; // control the number of particules
let time = 0;

let sun;
let earth;
let orbitControls;

let params;
let gui;

// USER LOCATION
let lat,lon;
let meshLoc, geometryLoc;

class World {
	constructor(container,lat,lon){	
		//  GUI controls
		params = initParams();
		// LIGHTS
		sun = new Sun(params, renderer);

		// OBJECTS
		earth = new Earth(params, renderer);

		// Cameras (for earth and Cubic scene)
		camera = createCamera(lat,lon);
		cameraCube = createCameraCube();

		// Renderer
		renderer = createRenderer();

		// SCENES
		[scene,sceneCube,debugScene] = createScene();
		
		// Append to HTML
		container.appendChild(renderer.domElement);

		// stats
		stats = new Stats();
		container.appendChild( stats.dom );
		
		// Controls : Orbit 
		orbitControls = createControls(camera, renderer.domElement, camRotation);
		
		const resizer = new Resizer(container, camera, cameraCube, renderer);
		
		gui = initGui(params, earth);
		gui.open();

	}

	async init(){

		// Add lights to scene 
		sun.initLight();
		// sun.initPostpro();
		sun.addToScene(scene);

		// Load textures
		earth.addToScene(scene); 

		earth.debugSceneAdd(debugScene);

		dynamicHdrEffectComposer = createEffectComposer(renderer, scene, sceneCube, debugScene, camera, cameraCube, cameraBG);	// LOOP
		loop = new Loop(camera, cameraCube, scene, renderer,dynamicHdrEffectComposer);
		loop.updatables.push(orbitControls);

	}

	// using loop 
	start(){
		// updateGeoLoc(camera,lat,lon);
		loop.start(stats,orbitControls,sun,earth,params);
	}
	
	stop(){
		loop.stop();
	}
	
}
export { World }