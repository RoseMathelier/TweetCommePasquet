<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Origin");

//récupération des variables
$lat = $_GET["lat"];
$long = $_GET["long"];

//récupération des données sur l'API geonames
$xml_result = file_get_contents("http://api.geonames.org/extendedFindNearby?lat=".strval($lat)."&lng=".strval($long)."&username=rosemathelier2");

//XML2JSON
$xml_result = str_replace(array("\n", "\r", "\t"), '', $xml_result);
$xml_result = trim(str_replace('"', "'", $xml_result));
$simpleXml = new SimpleXMLElement($xml_result);
$json_result = json_encode($simpleXml);

echo $json_result;

?>
