# TODO

Quand j'aurais un algorithme qui fonctionnera à peu près, passer le test avec le "MENUET DE TRIO" (dans les plus beaux préludes de Bach). En fait, ça peut être un morceau test, tant il est complexe.

* Tenir compte du contexte pour interdire certaines choses. Par exemple, dans un contexte classique, on ne prend que les septièmes, pas les neuvièmes.
* Quand on ne trouve aucun accord, on prend la première tierce venue, et le cas échéant, la seule note (voir le pont modulant dans l’exposition de la sonate facile de mozart (sol-fa# en trille qui devient sol-fa — en sachant qu’ici sol-fa dessine un accord de septième de dominante)

## PROBLÈMES / QUESTIONS

* Comment gérer les **PÉDALES** ? Notes tenues qui peuvent être retirées de l’analyse d’un accord. Dans la méthode de détection des accords, on la retrouvera donc en note étrangères.

  Donc SI accord MAIS note étrangère, MAIS que cette note étrangère est la pédale courante, ALORS l’accord peut être considéré comme bon.
