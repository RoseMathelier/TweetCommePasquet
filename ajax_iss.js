window.onload = function(){

var lat_iss = 0;
var long_iss = 0;

function initMap(){
  //Initialisation de la carte avec l'API Google Maps
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 0, lng: 0},
    scrollwheel: false,
    zoom: 1
  });
}

function textPosition(latitude,longitude){
  //Ajout du texte indiquant la position
  var text_position = document.getElementById("position");
  text_position.innerHTML = "Latitude : "+latitude.toString()+", Longitude : "+longitude.toString();
}

function getPosition() {
  //Requête AJAX pour récupérer la position de l'ISS avec l'API 'wheretheiss'
  $.ajax({
    url:"https://api.wheretheiss.at/v1/satellites/25544",
    dataType: "json",
    complete: function(data){
      if(data.readyState === 4 && data.status === 200){
        lat_iss = data.responseJSON.latitude;
        long_iss = data.responseJSON.longitude;
        //Création de la carte une fois les données de l'ISS récupérées
        initMap();
        //Création de la zone texte indiquant les coordonnées de l'ISS
        textPosition(lat_iss,long_iss);
      };
    }
  })
}

getPosition();




}

/*var ajax = new Ajax.Request("http://api.open-notify.org/iss-now.json",
  { method:'get',

    requestHeaders: {Accept: 'application/json'},

    onSuccess: function(transport){

      console.log('Success !');

      //Récupération des données de l'ISS
      var json = transport.responseJSON.evalJSON(true);
      var latitude = json.iss_position.latitude;
      var longitude = json.iss_position.longitude;

      //Création de la carte
      var map = new google.maps.Map(document.getElementById("map"),
        { center: {lat: 0, lng: 0},
          scrollwheel: false,
          zoom: 8
        });

      //Ajout du texte indiquant la position
      //var text_position = document.getElementById("position");
      //text_position.innerHTML = "Latitude : "+latitude.toString()+", Longitude : "+longitude.toString();
    }
  });*/
