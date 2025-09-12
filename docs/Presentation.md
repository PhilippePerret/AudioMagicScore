# Présentation générale

L'application est formée de quatre parties distinctes mais fonctionnant ensemble.

* La **CONVERSION**, partie prenant les fichiers PDF ou SVG de la partition est les transformant en fichier MEI (`Convertor`),
* Le **PARSING-SCANNING**, phase de travail où l'on prend les fichiers MEI produits pour en extraire les notes et tous les objets musicaux (`Parser` et `Scanner`).
* L'**ANALYSE MUSICALE**, phase de travail où l'on prend les notes relevées pour procéder à l'analyse musicale de la partition, et principalement : recherche des accords, leur nom et leur fonction, analyse des notes étrangères, repérage des pédales, des marches harmoniques principalement (`Analyzor`).
* La **GRAVURE**, phase de travail après l'analyse et le scanning qui permet de graver la partition, c'est-à-dire de produire le fichier Score-image qui va permettre de produire la partition finale (compris aussi dans cette phase — `Gravor`).

  Avant de graver, on passe par une **FUSION** des données des notes et des données d'analyse pour pouvoir les injecter dans le code Score-image.