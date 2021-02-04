function getGeoLocation() {
    if (navigator.geolocation) {
        var lat, lon = navigator.geolocation.getCurrentPosition(showPosition);
        } else {
        console.log("Geolocation is not supported by this browser.");
    }
    
    function showPosition(callback) {
        lat = position.coords.latitude;
        lon = position.coords.longitude;
        return callback(position);
    }
}
export {getGeoLocation};
