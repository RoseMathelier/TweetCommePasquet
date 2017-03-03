<?php
    // on vérifie que l'information "zoom_type" existe
    if ( isset($_POST['zoom_type']) )

    /* si c'est bien le cas (existe ET non-vide à la fois),
    on récupère le zoom souhaité et on redirige le visiteur vers la page principale" : */

         {
          $zoom = $_POST['zoom_type'];
           header("Location: pesquet.html");
          }

    /* sinon, on le redirige vers cette même page en renvoyant un message d'erreur */
    else
         {
           $zoom = 7;
           header("Location: pesquet.html");
         }

    echo $zoom;

?>
