import { OrbitControls } from 'https://unpkg.com/three@0.124.0/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'https://unpkg.com/three@0.124.0//examples/jsm/libs/dat.gui.module.js';

function createControls(camera, canvas, rotation) {
  const controls = new OrbitControls(camera, canvas);

  // controls.enableDamping = true;
	controls.autoRotate = true;
  controls.autoRotateSpeed =  rotation;
  
  // forward controls.update to our custom .tick method
  controls.tick = () => controls.update();
  return controls;
}

function initParams(){
  const params = {
    Map: 0,
    earthRotation: 0.00007,

    enabled: true,
    avgLuminance: 1.3,
    middleGrey: 3.2,
    maxLuminance: 30,

    adaptionRate: 2.0,
    opacityLights : 0.25,
    mapHeight : 1.5
  };
  return params
}

function initGui(params, earth){
  const gui = new GUI();
  const sceneGui = gui.addFolder( 'Scenes' );
  const toneMappingGui = gui.addFolder( 'ToneMapping' );
  const staticToneMappingGui = gui.addFolder( 'StaticOnly' );
  const adaptiveToneMappingGui = gui.addFolder( 'AdaptiveOnly' );

  sceneGui.add( params, 'earthRotation', 0.0, 0.001 );
  sceneGui.add( params, 'mapHeight', 1, 120 );
  sceneGui.add( params, 'opacityLights', 0.0, 1.0 );

  toneMappingGui.add( params, 'enabled' );
  toneMappingGui.add( params, 'middleGrey', 0, 12 );
  toneMappingGui.add( params, 'maxLuminance', 1, 30 );

  staticToneMappingGui.add( params, 'avgLuminance', 0.001, 2.0 );

  adaptiveToneMappingGui.add( params, 'adaptionRate', 0.0, 10.0 );


  sceneGui.add( params, 'Map', { 'The Earth today': 0, 'The Earth in year 3000': 1 } ).onChange( function ( val ) {

    switch ( val ) {

      case '0':
        console.log('loading current map')
        earth.sphereMesh.visible = true;
        earth.sphereLightsMesh.visible = true;
        earth.sphereMesh1.visible = false;
        earth.sphereLightsMesh1.visible = false;
        break;

      case '1':
        console.log('loading future map')
        earth.sphereMesh1.visible = true;
        earth.sphereLightsMesh1.visible = true;
        earth.sphereMesh.visible = false;
        earth.sphereLightsMesh.visible = false;
        break;
    }

  } );

  return (gui)
} 

export { createControls, initParams, initGui};