<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Origin");

//Paramètres
$rayon_terre = 6371; //en km
$vitesse_iss = 27600; // en km/h
$altitude_iss = 400; // en km
$inclinaison_iss = 51.64*M_PI/180; //en radian
$polar = M_PI/2; //en radian

//Coordonnées de l'ellipsoide
$e = 0.08181919106;
$a = 6378137.06356752314;
$f = 1 - sqrt(1-$e**2);

//On récupère le temps écoulé depuis la 1ère connexion (en ms, puis en h)
$first_time = $_GET["time"];
$current_time = microtime(true)*1000;
$delta_t = $current_time - $first_time; //en ms
$delta_t_h = $delta_t /(1000*3600); //en h

//Calcul de l'azimuth de la station
$perimetre_orbite = 2 * M_PI * ($rayon_terre + $altitude_iss); //en km
$distance_parcourue = $vitesse_iss * $delta_t_h; //en km
$azimuth = $distance_parcourue * 2 * M_PI / $perimetre_orbite; // en radian

//Coordonnées (X,Y,Z) du point
$X_init = ($rayon_terre + $altitude_iss) * sin($polar) * cos($azimuth);
$Y_init = ($rayon_terre + $altitude_iss) * cos($polar) * sin($azimuth);
$Z_init = ($rayon_terre + $altitude_iss) * cos($polar);

//Rotation 3D selon l'inclinaison
$X_new = $X_init * cos($inclinaison_iss) - $Z_init * sin($inclinaison_iss);
$Y_new = $Y_init;
$Z_new = $X_init * sin($inclinaison_iss) + $Z_init * cos($inclinaison_iss);

//Calcul de la latitude
$mu = atan(($Z_new/(sqrt($X_new**2+$Y_new**2))) * ((1-$f) + ($e**2 * $a / $rayon_terre)));
$latitude_iss = atan(($Z_new*(1-$f) + $e**2 * $a *(sin($mu))**3) / ((1-$f)*(sqrt($X_new**2+$Y_new**2) - $e**2 * $a * (cos($mu))**3 )));

//Calcul de la longitude
if($X_new > 0){
	$longitude_iss = atan($Y_new/$X_new);
}
else if($Y_new >= 0 and $X_new < 0){
	$longitude_iss = atan($Y_new/$X_new) + M_PI;
}
else if($Y_new < 0 and $X_new < 0){
	$longitude_iss = atan($Y_new/$X_new) - M_PI;
}
else if($Y_new > 0 and $X_new = 0){
	$longitude_iss = M_PI/2;
}
else if($Y_new < 0 and $X_new = 0){
	$longitude_iss = - M_PI/2;
}	

//Retour des coordonnées en JSON
$coord = '{"latitude": '.$latitude_iss.', "longitude": '.$longitude_iss.'}';
echo $coord;

?>