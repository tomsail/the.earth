import { PerspectiveCamera } from 'https://unpkg.com/three@0.117.0/build/three.module.js';
import { OrthographicCamera } from 'https://unpkg.com/three@0.117.0/build/three.module.js';

let EARTH_R = 6.371; // in thousand of km
let SCALE = 100;
let DIST2SUN = 1473*1000; // in thousand of km
let DISTCAM = EARTH_R*2 * SCALE;

function createCamera(lat,lon) {
  const camera = new PerspectiveCamera( 35, window.innerWidth / window.innerHeight,0.001, DIST2SUN**2 );

  let x,y,z;
  [x,y,z] = calcPosFromLatLonRad(lat,lon,DISTCAM);
  camera.position.x = x; // add geolocposition
  camera.position.y = y; // add geolocposition
  camera.position.z = z; // add geolocposition

  return camera;
}

function createCameraCube() {
  const camera = new PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, DIST2SUN**4 );
  return camera;
}

function calcPosFromLatLonRad(lat,lon,radius){
	var phi   = (90-lat)*(Math.PI/180)
	var theta = (lon+180)*(Math.PI/180)
	var x = -((radius) * Math.sin(phi)*Math.cos(theta))
	var z = ((radius) * Math.sin(phi)*Math.sin(theta))
	var y = ((radius) * Math.cos(phi))

	return [x,y,z];
}

export { createCamera };
export { createCameraCube };
export { calcPosFromLatLonRad };