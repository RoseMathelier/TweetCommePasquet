window.onload = function(){

var lat_iss = 0;
var long_iss = 0;

var map;
var marker;
var zoom;
var coord;

var color;
var points = new Array(); //initialisation du tableau qui servira à tracer les polylignes
points.push([]); // dans ce tableau on ajoute un tableau vide qui correspond à la première polyligne
var nb_polylines = 1;
var trajet_iss;

var location_name;
var country;

var photo;
var hello_para;

var first_time = new Date().getTime();


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

function addMarker(map,coord){
	
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
	
}

function addPolyline(map,coord,points,nb_polylines){
	
	//Gestion du problème de "saut" de latitude/longitude
    var last_polyline = points[points.length - 1];
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
		trajet_iss = new google.maps.Polyline({
		  path: points[i],
		  geodesic: true,
		  strokeColor: color,
		  strokeOpacity: 1.0,
		  strokeWeight: 2
		});
		trajet_iss.setMap(map);
	  }
	}
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
        coord = {lat: lat_iss, lng: long_iss};

        //Mise à jour de la carte avec les données récupérées
        if(document.getElementById("c_follow_iss").checked){
          map.setCenter(coord);
        };

        //Mise à jour de la zone texte indiquant les coordonnées de l'ISS
        textPosition(lat_iss, long_iss);

        //Ajout des markers
		addMarker(map,coord);

        //Tracé de la polyligne
		addPolyline(map,coord,points,nb_polylines);

      };
    }
  })
}

function getZoom() {
  //Récupère le zoom choisi
  var r_zooms = document.getElementsByName("zoom_type");
  for(var i = 0; i < r_zooms.length; i++){
    if(r_zooms[i].checked){
      zoom = r_zooms[i].value;
    }
  }
  console.log(zoom);
  return zoom;
}

function getPhoto(zoom) {
  //constitue l'URL de la source de la photo grâce au zoom et aux coordonnées de l'ISS
  var espace_photo = document.getElementById("hello_photo");
  if(typeof(photo) != "undefined"){ //si une photo existe déjà, on la supprime.
    espace_photo.removeChild(photo);
  };
  photo = document.createElement("img");
  photo.width = "600";
  var url = "https://maps.googleapis.com/maps/api/staticmap?center="+lat_iss.toString()+","+long_iss.toString()+"&zoom="+zoom.toString()+"&scale=false&size=600x300&maptype=roadmap&format=png&visual_refresh=true";
  photo.src = url;
  espace_photo.appendChild(photo);

}

function getGeoname() {
  //appel ajax vers le wrapper json qui lui-même appelle l'API geonames
  var ajax = new XMLHttpRequest();
  var url = "wrapper_json.php?lat="+lat_iss.toString()+"&long="+long_iss.toString();

  ajax.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        //Récupération de la donnée souhaitée
        var result_text = this.responseText;
		var result = JSON.parse(result_text);
        console.log(result);
		
		//Cas où l'on est sur un continent
		if(result.hasOwnProperty("geoname")){
			var tab = result.geoname;
			var len = tab.length;
			var geo = tab[len-1];
			location_name = geo.name;
			country = geo.countryName;
		}
		
		//Cas où l'on est sur un océan
		else if(result.hasOwnProperty("ocean")){
			location_name = result.ocean.name;
		}
		
		//Au cas où...
		else{
			location_name = "World";
		}

        //Ajout du texte dans le DOM
		var espace_text = document.getElementById("hello_tweet");
        if(typeof(hello_para) != "undefined"){ //si le texte existe déjà, on le supprime.
          espace_text.removeChild(hello_para);
        };
		hello_para = document.createElement('p');
        var hello_text = "Hello "+location_name;
        if(typeof(country) != "undefined"){ //si on n'est pas au dessus de l'océan, donc s'il y a un nom de pays à ajouter, on l'ajoute.
          hello_text = hello_text + ", " +country;
        };
		hello_text = hello_text + " !"
        var tweet = document.createTextNode(hello_text);
        hello_para.appendChild(tweet);
        espace_text.appendChild(hello_para);
      }
  };

  ajax.open("GET", url, true);
  ajax.send();

}

function getPositionAPI () {
	
	var ajax2 = new XMLHttpRequest();
	var url2 = "api_loc.php?time="+first_time.toString();
	ajax2.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
		  
		//Récupération des coordonnées
        var result_api = this.responseText;
		console.log(result_api);
		var result_api_json = JSON.parse(result_api);
		lat_iss = result_api_json.latitude;
        long_iss = result_api_json.longitude;
        coord = {lat: lat_iss, lng: long_iss};
		
		//Mise à jour de la carte avec les données récupérées
        if(document.getElementById("c_follow_iss").checked){
          map.setCenter(coord);
        };

        //Mise à jour de la zone texte indiquant les coordonnées de l'ISS
        textPosition(lat_iss, long_iss);

        //Ajout des markers
		addMarker(map,coord);

        //Tracé de la polyligne
		addPolyline(map,coord,points,nb_polylines);
		
		  
	  }
	}
	ajax2.open("GET", url2, true);
	ajax2.send();
	
	
}


//*****************************************************************************************************************************************************

//Première initialisation de la carte et de la zone de texte avant les appels vers l'API de l'ISS.
initMap(0,0,2);
textPosition(0,0);

//Mise en place de l'intervalle en mode normal (non debug)
color = '#FF0000';
interval = setInterval(getPosition, 5000);


//Event listener sur la checkbox debug;
document.getElementById("debug").addEventListener("click", function(event){
	

	
	//Mise à jour toutes les 5 secondes pour suivre la position de l'ISS
	if(document.getElementById("debug").checked){
		if(typeof(interval) != "undefined"){
			clearInterval(interval); //si un intervalle existe déjà, on le supprime
		}
		color = '#32CD32';
		interval = setInterval(getPositionAPI, 5000); //mode debug
	}
	else {
		if(typeof(interval) != "undefined"){
			clearInterval(interval); //si un intervalle existe déjà, on le supprime
		}
		color = '#FF0000';
		interval = setInterval(getPosition, 5000); //mode normal
	}
	
});

//Event listener sur le bouton Tweet comme Pesquet
document.getElementById("validation").addEventListener("click", function(event){
  event.preventDefault();
  zoom = getZoom();
  getPhoto(zoom);
  getGeoname();
});

}
