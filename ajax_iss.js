window.onload = function(){

var lat_iss = 0;
var long_iss = 0;
var map;
var marker;
var points = new Array();

function initMap(latitude, longitude, zoom_level){
  //Initialisation de la carte avec l'API Google Maps
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: latitude, lng: longitude},
    scrollwheel: false,
    zoom: zoom_level
  });
}

function textPosition(latitude,longitude){
  //Ajout du texte indiquant la position
  var text_position = document.getElementById("position");
  text_position.innerHTML = "Latitude : "+latitude.toString()+" - Longitude : "+longitude.toString();
}

function getPosition() {
  //Requête AJAX pour récupérer la position de l'ISS avec l'API 'wheretheiss'
  $.ajax({
    url:"https://api.wheretheiss.at/v1/satellites/25544",
    dataType: "json",
    complete: function(data){
      if(data.readyState === 4 && data.status === 200){

        //Récupération des données
        lat_iss = data.responseJSON.latitude;
        long_iss = data.responseJSON.longitude;
        var coord = {lat: lat_iss, lng: long_iss};

        //Mise à jour de la carte avec les données récupérées
        map.setCenter(coord);

        //Mise à jour de la zone texte indiquant les coordonnées de l'ISS
        textPosition(lat_iss, long_iss);

        //Ajout des markers
        if(typeof(marker) != "undefined"){
          marker.setMap(null); //si un marker existe déjà, on le supprime avant de mettre le suivant
        }
        marker = new google.maps.Marker({
          position: coord,
          map: map
        });

        //Tracé de la polyligne
        points.push(coord);
        if(points.length > 1){ //on commence à tracer la polyligne dès qu'on a + de 2 points.
          var trajet_iss = new google.maps.Polyline({
            path: points,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
          });
          trajet_iss.setMap(map);
        }
      };
    }
  })
}

//Initialisation de la carte et de la zone de texte
initMap(0,0,7);
textPosition(0,0);

//Mise à jour toutes les 5 secondes pour suivre la position de l'ISS.
setInterval(getPosition, 5000);


}
