//
// ENG1003 S2 2017 Assignment 1 Toposcope app
//
// Team: ...
//
// =========================================================
// You should extend this file with you assignment solution.
// =========================================================


var locationsOfInterest = [
    {lat: -37.812855, lng: 144.980450, title: "Fritzroy Garden"},
    {lat: -37.805457, lng: 144.971412, title: "Carlton Garden"},
    {lat: -37.886232, lng: 145.083000, title: "Chadstone Mall"}
];

// Global variable declaration
var userLocation = [0, 0];
var alpha = 0;
var beta = 0;
var distance = [];
var bearing;
var noOrientation = false;
var poleCorrection = 0;
var history = [null, null];

// Initialize distances
for (var i = 0; i < locationsOfInterest.length; i++)
    {
        distance.push(0);
    };


// This function draws/redraws the compass, lines and distances for locations
// of interest.  This function should be called each time a new GPS location
// or new bearing is receieved for the user.
//
function updateDisplay()
{
    var canvas = document.getElementById("compassCanvas");
    var context = canvas.getContext("2d");
    var radius = canvas.height / 2;

    // Clear the canvas.
    context.clearRect(-radius, -radius, canvas.width, canvas.height);

    // Use reduced radius for actual drawing.
    radius = radius * 0.80

    drawCompassFace(context, radius);

    // ADD FURTHER INSTUCTIONS HERE...
    // See the following functions defined in toposcopeview.js:
    //     drawCompassFace
    drawCompassFace(context, radius);
    //     drawNeedle
    var direction = 0;
    var directionCorrected = 0;
    for (var i = 0; i < locationsOfInterest.length; i++)
        {
            bearing = calcBearing(userLocation[0], userLocation[1], locationsOfInterest[i].lat, locationsOfInterest[i].lng);
            direction = alpha - bearing;
            if (poleCorrection === 180)
                {
                    if (direction < 180)
                        {
                            directionCorrected = 180 - direction;
                        }
                    else
                        {
                            directionCorrected = 180 + (360 - direction);
                        };
                }
            else
                {
                    directionCorrected = direction;
                }

            drawNeedle(context, directionCorrected, 0, (distance[i]/findMax(distance)) * radius, 5, distinquishableColour(i + 1));
        };
    drawNeedle(context, 0, 0, radius, distinquishableColour(9));
    //     drawText
    drawLetter(context, radius, alpha - 0 + poleCorrection, "N");
    drawLetter(context, radius, alpha - 90, "W");
    drawLetter(context, radius, alpha - 180 + poleCorrection, "S");
    drawLetter(context, radius, alpha - 270, "E");

    // Update list of locations. See function below.
    updateLocationDistances();
}


// This function will update the list of locations displayed by the app.
// It should be called each time there are updated distance estimations to
// the locations of interest.
//
// See the following functions defined in toposcopeview.js:
//      updateLocationList
//      distinquishableColour
//
function updateLocationDistances()
{
    var listCellContents = [];

    for (var i = 0; i < locationsOfInterest.length; i++)
        {
            distance[i] = calcDistance(userLocation[0], userLocation[1], locationsOfInterest[i].lat, locationsOfInterest[i].lng);
            listCellContents.push({label: locationsOfInterest[i].title, labelColour: distinquishableColour(i), detailLabel: "Distance: " + distance[i].toFixed(2) + " km"});
        }

    updateLocationList(listCellContents);
}


// Initialisation code

// ADD INSTRUCTIONS TO WATCH GPS AND DEVICE ORIENTATION...
function trackPosition(position)
    {
        userLocation[0] = position.coords.latitude;
        userLocation[1] = position.coords.longitude;

        updateLocationDistances();

        if (noOrientation === true)
            {
                if (history[0] === null)
                    {
                        history[0] = userLocation[0];
                        history[1] = userLocation[1];
                    };
                alpha = calcBearing(history[0], history[1], userLocation[0], userLocation[1]);
                history[0] = userLocation[0];
                history[1] = userLocation[1];

                updateDisplay();
            };
    };

function deviceOrientationHandler(event)
    {
        alpha = event.alpha;
        if (alpha < 0)
            {
                alpha = 360 + alpha;
            };

        beta = event.beta;
        if (Math.abs(beta) <= 90)
            {
                poleCorrection = 0;
            }
        else
            {
                poleCorrection = 180;
            }

        if (alpha === null || beta === null)
            {
                noOrientation = true;
                window.removeEventListener('deviceorientation', deviceOrientationHandler);
                alert("Your device does not support compass feature! Your heading will be determined from your walking path");
            }

        updateDisplay();
    }

// Draw the display for the first time.
updateDisplay();

// Custom functions
function findMax(numberArray)
    {
        var tempMax = numberArray[0];
        for (var i = 0; i < numberArray.length; i++)
            {
                if (numberArray[i] > tempMax)
                    {
                        tempMax = numberArray[i];
                    }
            }

        return tempMax
    }

function calcDistance(lat1, lon1, lat2, lon2)
    {
        var R = 6371; // kilometres                                                                                                                     //
        var phi1 = lat1 * Math.PI / 180;                //lat1.toRadians();                                                                             //
        var phi2 = lat2 * Math.PI / 180;                //.toRadians();                                                                                 //  Formula taken from 
        var deltaPhi = (lat2-lat1) * Math.PI / 180;     //.toRadians();                                                                                 //
        var deltaLamda = (lon2-lon1) * Math.PI / 180;   //.toRadians();                                                                                 //  https://www.movable-
                                                                                                                                                        //  type.co.uk/scripts/latlong.html
        var a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLamda/2) * Math.sin(deltaLamda/2);        //
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));                                                                                           //
                                                                                                                                                        //
        var d = R * c;                                                                                                                                  //
        return d                                                                                                                                        //
    };

function calcBearing(lat1,lng1,lat2,lng2)
    {
        var dLon = (lng2-lng1);
        var y = Math.sin(dLon) * Math.cos(lat2);
        var x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
        var brng = Math.atan2(y, x).toDegrees();
        return 360 - ((brng + 360) % 360);
    };

// Add event listeners
if (window.DeviceOrientationEvent)
    {
        window.addEventListener('deviceorientation', deviceOrientationHandler);
    }
else
    {
        noOrientation = true;
        alert("Your device does not support compass feature! Your heading will be determined from your walking path");
    };

function GPSErrorAlert()
    {
        alert("Your device does not support GPS tracking !");
    };

if (navigator.geolocation)
    {
        navigator.geolocation.watchPosition(trackPosition, GPSErrorAlert);
    }
else
    {
        GPSErrorAlert();
    }