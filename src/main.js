import { World } from './World/World.js';

async function main() {
  if (navigator.geolocation) {
    var lat, lon = navigator.geolocation.getCurrentPosition(showPosition,error,{timeout:5000});

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

  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
    backup();
  }
  async function backup(){
    /** ---------------- temporary fix ------------- */
    const res = await fetch('https://location.services.mozilla.com/v1/geolocate?key=test').then(el=>el.json())
    const point = [res.location.lat, res.location.lng];
    var lat = res.location.lat;
    var lon = res.location.lng;
    console.log(res);
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
    /** ---------------- temporary fix ------------- */
  }

}
function GEOdeclined(error) {
alert('Error: ' +error.message);
}
function GEOprocess(position) {
alert('it works');
}

main();