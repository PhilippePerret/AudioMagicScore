# Présentation générale

L'application est formée de quatre parties distinctes mais fonctionnant ensemble.

* La **CONVERSION**, partie prenant les fichiers PDF ou SVG de la partition est les transformant en fichier MEI (`Convertor`),
* Le **PARSING-SCANNING**, phase de travail où l'on prend les fichiers MEI produits pour en extraire les notes et tous les objets musicaux (`Parser` et `Scanner`).
* L'**ANALYSE MUSICALE**, phase de travail où l'on prend les notes relevées pour procéder à l'analyse musicale de la partition, et principalement : recherche des accords, leur nom et leur fonction, analyse des notes étrangères, repérage des pédales, des marches harmoniques principalement (`Analyzor`).
* La **GRAVURE**, phase de travail après l'analyse et le scanning qui permet de graver la partition, c'est-à-dire de produire le fichier Score-image qui va permettre de produire la partition finale (compris aussi dans cette phase — `Gravor`).

  Avant de graver, on passe par une **FUSION** des données des notes et des données d'analyse pour pouvoir les injecter dans le code Score-image.

score-image << 'NOTES'
--piano
--chiffrage
--time 4/4
--tune Eb

-> essais-chiffrage
c4\chifName "Cm" ees8 f aes g4
c1\chifDeg "T"
NOTES


score-image << 'NOTES'
--piano
--chiffrage
--time 4/4
--tune Eb

-> essais-chiffrage
c4\chifName "Cm" ees8 f\chifNP aes\chifNote "ap" g4
c1\chifDeg "T"
NOTES


## GRAVURE

Pour les marches harmoniques, on pourrait utiliser les [crochets d'analyse](https://lilypond.org/doc/v2.24/Documentation/notation/outside-the-staff#analysis-brackets)