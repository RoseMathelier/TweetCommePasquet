window.onload = function(){

var lat_iss = 0;
var long_iss = 0;

var map;
var marker;
var zoom;

var points = new Array(); //initialisation du tableau qui servira à tracer les polylignes
points.push([]); // dans ce tableau on ajoute un tableau vide qui correspond à la première polyligne
var nb_polylines = 1;

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

function setZoom(){
  //Détermine le niveau de zoom selon les cases cochées par l'utilisateur
  if(document.getElementById("c_follow_iss").checked == false){
    zoom = 2;
    map.setCenter({lat: 0, lng: 0});
  }
  else if(document.getElementById("r_smartphone").checked){
    zoom = 7
  }
  else if(document.getElementById("r_reflex").checked){
    zoom = 10
  }
  else if(document.getElementById("r_teleobjectif").checked){
    zoom = 13
  }
map.setZoom(zoom);
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

        // ************* Ajout des markers *************

        //si un marker existe déjà, on le supprime avant de mettre le suivant
        if(typeof(marker) != "undefined"){
          marker.setMap(null);
        }
        var image_marker = {
          url: 'satellite_detoureV2.png',
          size: new google.maps.Size(80,80),
          origin: new google.maps.Point(0,0),
          anchor: new google.maps.Point(20,35)
        };
        marker = new google.maps.Marker({
          position: coord,
          map: map,
          icon: image_marker,
        });

        // ************* Tracé de la polyligne *************

        //Gestion du problème de "saut" de latitude/longitude
        var last_polyline = points[points.length - 1]
        if(last_polyline[last_polyline.length - 1] < last_polyline[last_polyline.length - 2]){
          nb_polylines++;
          points.push([]);
          points[nb_polylines - 1].push(coord);
        }
        else{
          points[nb_polylines - 1].push(coord);
        }

        //Tracé de la (ou des) polyligne(s)s
        for(var i = 0; i < nb_polylines; i++){
          if(points[i].length > 1){ //on commence à tracer la polyligne dès qu'on a + de 2 points.
            var trajet_iss = new google.maps.Polyline({
              path: points[i],
              geodesic: true,
              strokeColor: '#FF0000',
              strokeOpacity: 1.0,
              strokeWeight: 2
            });
            trajet_iss.setMap(map);
          }
        }


      };
    }
  })
}

//*****************************************************************************************************************************************************

//Première initialisation de la carte et de la zone de texte avant les appels vers l'API de l'ISS.
initMap(0,0,2);
textPosition(0,0);

//Mise à jour toutes les 5 secondes pour suivre la position de l'ISS.
setInterval(getPosition, 5000);

//Listener sur le formulaire pour choisir le zoom et le centre de la carte.
formulaire = document.getElementsByClassName("form");
for(var i = 0; i < formulaire.length; i++){
  formulaire[i].addEventListener("change",setZoom(),true);
};


}
