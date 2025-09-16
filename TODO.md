# TODO

## En ce moment

  * Test en profondeur des discrimitations par poids de l'accord
  * Découpage par tranches des mesures :
    - On essaie de trouver un seul accord (avec quelques notes étrangères)
    - SI on trouve => OK, on a notre chiffrage (on analyse les notes étrangères)
      SINON, on découpe en temps (en fonction de la métrique)
      SI ça marche par temps, OK, on a notre chiffrage
      SINON, on découpe par demi-temps/croche (dernier découpage qui doit faire l'affaire)
      On consière qu'on ne peut pas aller plus bas, on interprète en fonction (avec des
      notes de passages, de retard, etc.)

## Plus tard

* Production des fichiers Score-image pour produire les partitions
* Production de l'analyse harmonique
* Production des statistiques (à voir) 

Quand j'aurais un algorithme qui fonctionnera à peu près, passer le test avec le "MENUET DE TRIO" (dans les plus beaux préludes de Bach). En fait, ça peut être un morceau test, tant il est complexe.

* Pour l'analyse, il faut passer les données parsées (utilisées pour produire les mus-score) par un converteur qui va transformer les durées (et peut-être d'autres valeurs).
* Tenir compte du contexte pour interdire certaines choses. Par exemple, dans un contexte classique, on ne prend que les septièmes, pas les neuvièmes.
* Quand on ne trouve aucun accord, on prend la première tierce venue, et le cas échéant, la seule note (voir le pont modulant dans l’exposition de la sonate facile de mozart (sol-fa# en trille qui devient sol-fa — en sachant qu’ici sol-fa dessine un accord de septième de dominante)
* Tenir compte des trilles écrites, qui donnent une importance à une note étrangère, parfois chromatique, qui doit pouvoir être passée pour l’analyse.

## PROBLÈMES / QUESTIONS

* Comment gérer les **PÉDALES** ? Notes tenues qui peuvent être retirées de l’analyse d’un accord. Dans la méthode de détection des accords, on la retrouvera donc en note étrangères.

  Donc SI accord MAIS note étrangère, MAIS que cette note étrangère est la pédale courante, ALORS l’accord peut être considéré comme bon.
