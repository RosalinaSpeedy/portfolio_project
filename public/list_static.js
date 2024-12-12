function prettyLocation(location) {
    let empty = "";
    let splitLocation = location.split(';');
    console.log(splitLocation)
    if (splitLocation.length > 1) {
        empty += "Location: "
    }
    for (let i = 0; i < splitLocation.length; i++) {
        let tmpWord = splitLocation[i].split("=");
        console.log(tmpWord[tmpWord.length - 1]);
        if (tmpWord[tmpWord.length - 1] !== '') {
            empty += tmpWord[tmpWord.length - 1];
            empty += ", ";
        }
    }
    return empty;
}
function setPrettyLocations() {
    let locations = document.getElementsByClassName("locationString")
    for (let i = 0; i < locations.length; i++) {
        locations[i].innerText = prettyLocation(locations[i].innerText)
    }
}

setPrettyLocations();

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            try {
                userLocation.latitude = position.coords.latitude;
                userLocation.longitude = position.coords.longitude;
            } catch { console.log("location data not needed") }
        });
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}
try {
    getLocation(); 
} catch { console.log("location data not needed") }
function updateCostValue(val) {
    document.getElementById('ticketCostValue').innerText = 'Ticket cost up to: £' + val;
}