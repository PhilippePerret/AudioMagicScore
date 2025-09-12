# Présentation générale

L'application est formée de quatre parties distinctes mais fonctionnant ensemble.

* La **CONVERSION**, partie prenant les fichiers PDF ou SVG de la partition est les transformant en fichier MEI (`Convertor`),
* Le **PARSING-SCANNING**, phase de travail où l'on prend les fichiers MEI produits pour en extraire les notes et tous les objets musicaux (`Parser` et `Scanner`).
* L'**ANALYSE MUSICALE**, phase de travail où l'on prend les notes relevées pour procéder à l'analyse musicale de la partition, et principalement : recherche des accords, leur nom et leur fonction, analyse des notes étrangères, repérage des pédales, des marches harmoniques principalement (`Analyzor`).
* La **GRAVURE**, phase de travail après l'analyse et le scanning qui permet de graver la partition, c'est-à-dire de produire le fichier Score-image qui va permettre de produire la partition finale (compris aussi dans cette phase — `Gravor`).

  Avant de graver, on passe par une **FUSION** des données des notes et des données d'analyse pour pouvoir les injecter dans le code Score-image.


## GRAVURE

Pour les marches harmoniques, on pourrait utiliser les [crochets d'analyse](https://lilypond.org/doc/v2.24/Documentation/notation/outside-the-staff#analysis-brackets)

## Annexe

### Calcul du degré d'un accord quelconque dans la tonalité

Il est possible de faire ça en concevant d'abord la tonalité courante.

* note tonalité => note de départ (p.e. 'e')
* genre tonalité (mineur/majeur) => gamme (sur deux octaves)
* on prend ensuite les degrés deux par deux pour avoir tous les accords :
  [0, 2, 4] => tonique
  [1, 3, 5] => sus-tonique
  [2, 4, 6] => mediane
  [3, 5, 7] => Sous-dominante