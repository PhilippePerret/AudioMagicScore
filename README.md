# AudioMagicScore

<font color="red" style="bold">Attention ce projet ne fait pas vraiment partie de la **Suite Score**, même s’il est un peu lié.</font>

C’est un projet un peu fou qui consisterait à utiliser la programmation pour produire plus rapidement des partitions pour les éditions Icare. Le schéma suivi serait le suivant :

* Récupération de la partition libre de droit sur ISMLP par exemple.
* Analyse par l’application **Audiveris** pour en produire un fichier XML.
* Transformation du fichier XML en fichier MUS pour utiliser Score-Image pour produire la partition finale.
* Utilisation des données intermédiaires (depuis XML, en ruby) pour donner une première analyse de la partition (analyse harmonique et mélodique).
  * voir dans quelle mesure on pourrait ajouter l’analyse directement sur le fichier Score.
* Pouvoir également produire des statistiques

## Aspect technique (langage et applications)

Utiliser **bun** pour développer, donc du TypeScript/Javascript, qui peut être 10 fois plus rapide que Ruby (et que j’aime bien, pas autant que ruby, mais bon…).

Jouer : **`bun run main.ts`**

## Algorithme d’harmonisation

C’est le vraiment gros morceau de l’application, qui doit permettre de déduire les accords, les modulations et les emprunts.

* jouer sur les probabilités (un accord V a de fortes chances d’être suivi par un accord I, dans le contexte classique)
* les notes ont une valeurs par rapport au morceau et par rapport à la tonalité courante.
* les notes doivent être considérées en tant que degrés, mais la tonalité définie doit permettre de les retrouver
* La note est soumise à des contraintes : une septième (surtout de dominante) doit baisser, ou doit être détournée dans l’autre sens.
* On doit pouvoir lire un peu en avance pour déduire des choses. Un accord doit être déterminé en analysant la suite (au moins les trois prochaines mesures).
* Bien voir que les données sont fixes, figées (les partitions). Les fuites mémoires ne doivent pas vraiment arriver.

Les classes à utiliser : 

* **Piece** (Pièce). C’est elle qui contient tout le reste.
  Ses propriétés sont :

  * **tempo** de départ

  * **partitions** (au pluriel car on peut imaginer que la pièce possède plusieurs versions. C’est une *Array* de *Partition*(s).

* **Score** (Partition). La partition complète, telle qu’elle se présente. Elle possède des **Métadonnées** et des **mesures**.
  Ses propriétés sont :

  * **metadata** (par exemple les instruments qui jouent)

  * **mesures**. Array de ses mesures, dans l’ordre.

  * **reprises**. Définition de ses reprises lorsqu’il y en a.

  * **grid**. Une **`Grille`** qui contient plusieurs pistes, pour une vision horizontale des mesures.

* **Grid** (Grille). Ce serait un élément qui doublerait les mesures et contiendrait les métadonnées contextuelles, à commencer par la tonalité courante. Elles pourraient être constituée de **Piste**. Par exemple la piste des altérations accidentelles (mélodiques ou harmoniques), la piste des accords, la piste des modulations, etc.

  Permettrait aussi de garder visible les modulations.

* **Mesure**. C’est une mesure de la partition. Elle appartient à une partition, peut-être aussi à un segment (introduction, première fois, etc.), mais on peut dire que son élément supérieur est la partition.
  Ces propriétés sont :

  *  **numero** (le numéro absolu de la mesure dans la partition — peut-être 0 lorsque c’est la levée du morceau)

  * ses **slices** (« tranches » dans l’ordre). C’est une table de **`Slice`**

  * son **tempo** (par défaut, celui de la pièce, mais il peut changer)

* **Slice** (tranche). C’est une section de la mesure d’une durée minimale d’une croche, qui peut aller jusqu’à la mesure complète. La tranche est une ***unité analysable*** c’est-à-dire qu’on peut déterminer l’accord qui l’occupe et partant la tonalité courante. Propriétés :

  * La durée (croche par défaut, donc 8)

  * L’indice dans la mesure

  * Les notes (**Notes**)

  * L’accord

* **Note**. C’est une note, qui peut être un silence. Elle possède toutes les propriétés attendues, hauteur, octave, durée.

  * **rnote** (pour « real note », note réelle — do, ré, mi, etc. en anglais) ou le silence.
  * **alteration**, l’altération de la note (none, dièse, double-dièse, bémol, double bémol quart de ton ?)
  * **octave** (nombre de -1 à 8)
  * **duree**, la durée de la note (comme dans Lilypond — 1 = ronde, 2 = blanche etc.)
  * **absDegree**, le degré absolu, dans la tonalité courante (quelle que soit la tonalité courante). Comme pour les accords, si la note appartient à un accord pivot, son degré est une paire de valeur ([degré dans la tonalité avant, degré dans la tonalité après]
  * **relDegree**, le degré relatif, dans la tonalité courante (de 1 à 7)
  * **role**, la fonction dans l’accord (fondamentale, tierce, quinte, septième, neuvième) — c’est le degré dans l’accord (1, 3, 5, 7, 2, 4, 6, 9).
  * **nature** (note réelle, retard, appogiature, passage, passage chromatique, broderie, broderie chromatique, double-broderie, double-broderie chromatique, échappée, anticipation)

* **Chord** (Accord). Pour une approche plus verticale de la mesure et des notes. Une mesure serait composée aussi d’accords, avec une durée. Cet accord et l’objet du travail de cette application, qui doit justement le déterminer.

  * **duree**, la durée subjective ou objective (la durée n’est pas toujours claire et peut être sujette à discussion)
  * **humName**, le nom humain (par exemple « Do mineur 7e »)
  * **humShortName**, le nom court humain, celui qui sera écrit sur la partition (par exemple « Cm7 » dans la police adéquate).
  * **harmonicFunction**, la fonction harmonique dans la tonalité courante (tonique, dominante, etc.)
  * **genre** (mineur, majeur, mixte/ambivalent)
  * **harmonicColor**, la couleur harmonique (septième, accord de quarte, de seconde, de neuvième)
  * **relDegree**, le degré relatif de l’accord dans la tonalité courante (lié à la fonction harmonique). C’est soit un nombre, soit une paire de nombre quand c’est un accord pivot (le premier chiffre indique le degré dans la tonalité précédente, et le deuxième le degré dans la tonalité suivante).
  * **notes**, la liste des notes (instances `Note`) qu’il contient, de bas en haut.
  * **mesure**, instance de la mesure à laquelle il appartient (OU PASSE-T-ON PAR LA TRANCHE ?).
  * **slice**, la tranche à laquelle il appartient.
  * **isPivot** (valeur booleénne) indiquant que l’accord appartient à la tonalité précédente et suivante. Ça déterminer 

* **Modulation**. Comment considérer une modulation dans ce contexte ? Qu’est-ce que c’est au juste ? On peut le définir pour le moment comme changement de **contexte harmonique** ou plus exactement comme *le moment où l’on change de contexte harmonique*.

  Noter que ce moment passe très souvent par un accord pivot, donc un accord appartenant aux deux tonalités (suivante et précédante).



## Principes

### TRANCHES de la mesure

La *tranche* est l’*unité analysable* de la mesure. C’est elle qui permet, grâce aux notes qu’elle contient, de déterminer l’accord (*son* accord) puis la tonalité.

On part du principe qu’une harmonie ne peut pas « tenir » dans moins qu’une croche (quel que soit le tempo). Donc une mesure est « découpée » en croches et on détermine en scannant la partition les notes qui se trouvent sur quelle croche.

En faisant ce travail ou après, on ***rationnalise*** les tranches (on les fusionne). Si deux tranches contiennent les mêmes notes (tout octavec confondu ?), on les fusionne c’est-à-dire qu’on se retrouve avec une tranche plus longue (une noire, puis une noire pointée, puis une blanche, etc.)

### Accord

On les déterminera en le empilant par les tierces, mais on vérifiera qu’il y ait bien au moins un ton et demi entre les deux premières notes, sinon ce sera une sixte augmentée (le vérifier), donc soit Lab-Do-Mib-Fa#. Noter que Re-Fa#-Lab-Do reste dans cette ordre, même si on a un ton entre Fa# et Lab.

On fera une fonction utile qui renverra l’interval entre deux notes : **`intervalBetween(note1, note2)`** qui pourra renvoyer des valeurs comme « 2nde », « 2b », « 2# », « 3ce », « 3cem », « 4te », « 4# », etc. OU PLLUTÔT [3, 0] (tierce mineur), [3, 1] (tierce majeur), [4, -1], [4, 0], [4, 1], etc. qui permet de savoir tout de suite si, par exemple, c’est une tierce.

Principe pour déterminer l’ordre. Si la note suivante est…

* à une seconde  = 7e + fond => [b, x, x, a]
* à une tierce => elle est au-dessus [a, b]
* à une quarte = quinte + fond => [b, x, a]
* à une quinte => [a, x, b]
* à une sixte => [b, a]
* à une septième => [a, x, x, b]

C’est une fonction **`orderChordNotes`** qui s’en chargerait (dans la class `Chord`). chaque fois on analyse la nouvelle note par rapport à la première de la liste :

* La liste est vide, on met la note dedans => `[a]`
* la note suivante (b) est à une tierce de la première note de la liste => `[a,b]`. Si elle avait été à une quinte, on aurait ajouté un « trou » => `[a, x, b]`
* La note suivante (c) est à une quarte de la première note de la liste => on l’ajoute deux notes avant => `[c, x, a, b]`
* Si la note suivante (d) est à une tierce de la première note de la liste, tout va bien => `[c, d, a, b]`. Sinon, on se trouve en présence de notes étrangères.

### Tonalités

Pour le moment, on considère que ce sont les accords qui vont permettre de déterminer la tonalité, mais on peut aussi faire une lecture des simples altérations (hors broderies ou notes de passage chromatique) pour dessiner la tonalité.

Une « tranche » pourrait être modulante à partir du moment où elle contient une note symptomatique et définir une ***tonalité a priori*** (**`guessedTune`**)

### Hypothèses

On fonctionne par **hypothèse** et on choisit la plus probable. Par exemple, si on doute d’une tonalité, d’un accord : on calcule la valeur relative de chaque note, dans les accords supposés.  on choisit (presque toujours) la version qui contient le plus de notes réelles, SAUF si ça contredit trop les accords attendus dans un contexte donné (classique seulement pour moment). Par exemple, si une hypothèse conclut au IIIe degré sans qu’on soit dans une marche harmonique, il y a de fortes chance que ce ne soit pas l’accord.

Les **hypothèses** sont utilisées aussi pour imaginer, quand on manque de notes, quelle note on pourrait avoir. En général : soit la tierce manquante au-dessus, soit la basse dernièrement jouée.

On applique les **règles de fréquence** :

* un mineur 7e est souvent un II (en majeur) ou un IV (en mineur) d’une autre tonalité
* les notes symptômatiques
* un accord majorisé est très souvent la dominante de la tonalité suivante.
* une 7e descend (ou est détournée, mais plus rarement)
* une pédale commence et termine dans un accord qui la contient.

On a la possibilité de **fixer par la force des valeurs** pour palier les erreurs d’interprétation (en sachant que le mieux est de trouver le moyen de ne pas avoir l’erreur, c’est-à-dire de comprendre ce qui se passe).

Processus de l’**analyse générale** : On considère une mesure entière, d’abord. Si elle ne contient pas un seul accord, on prend une partie (par temps ou par 2 temps si la mesure contient 4 temps). S’il y a encore des problèmes, on analyse par demi-temps. On ne va pas plus loin que la croche (rencontre-t-on vraiment des harmonisation par double-croches ?).
