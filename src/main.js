import { World } from './World/World.js';

function main() {
  if (navigator.geolocation) {
    var lat, lon = navigator.geolocation.getCurrentPosition(showPosition,noLocation,{timeout:10000});
  }
  else {
    console.log("Geolocation is not supported by this browser.");
  }
  
  function showPosition(position) {
    console.log("la");
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    // Get a reference to the container element
    // const container = document.querySelector('#scene-container');
    const container = document.createElement( 'div' );
    document.body.appendChild( container );
    console.log(lat, lon);
    // create a new world
    const world = new World(container,lat,lon);

    // complete async tasks
    world.init();

    // start the animation loop
    world.start();
  
    return lat,lon;
  } 

  function noLocation() {
    console.log("Could not find location");
  }
}

main();