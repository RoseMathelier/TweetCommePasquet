<?php

// initialisation de la session
$curl = curl_init("http://api.geonames.org/extendedFindNearby?lat=50&lng=2&username=rosemathelier2");
//récupération des données de l'API
$xml_result = curl_exec($curl);
// fermeture des ressources
curl_close($curl);

//XML2JSON
$xml_result = str_replace(array("\n", "\r", "\t"), '', $xml_result);
$xml_result = trim(str_replace('"', "'", $xml_result));
$simpleXml = simplexml_load_string($xml_result);
$json_result = json_encode($simpleXml);

echo $json_result;

?>
