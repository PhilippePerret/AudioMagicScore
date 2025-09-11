# Chantier des tests



Juste le code à utiliser avec une partition appelée « score.svg » (la nommer comme ça pour la transformer puis lui donner un vrai nom.

La construire comme ci-dessous avec ScoreImage puis lancer le code :

~~~zsh
inkscape -o score.pdf score.svg
audiveris -batch -export score.pdf
unzip score.mxl -d score
rm score.mxl
mv score/score.xml score.xml
rm -rf score/
verovio score.xml -o score.mei -f musicxml -t mei
~~~

~~~
score-image << 'SCORE'
--piano
--time 4/4
--tune F

-> score
c e g b | c g e d | c e8 f g4 a8 b | c g e d |
c4. c c4 | c4. c c4 | c4. c c4 | c4. c c4 |
SCORE
~~~



Pour produire des partitions tests :

* On fabrique le fichier avec ScoreImage, en ouvrant un Terminal à ce dossier et en jouant par exemple : 

  > ATTENTION, il faut qu’il y ait un minimum de mesures, sinon Audiveris ne détectera rien.

  ~~~zsh
  score-image << 'SCORE'
  --piano
  --time 4/4
  --tune F
  
  -> score2
  c d e f | c d e f | c d e f | c d e f
  f e d c | f e d c | f e d c | f e d c 
  SCORE
  ~~~

  =>  **Ce code produit le fichier SVG de la partition**

* Récupérer l’image (la partition) dans le dossier [`Programmes/ScoreSuite/ScoreImage/scores`](/Users/philippeperret/Programmes/ScoreSuite/ScoreImage/scores).

* La mettre dans ce dossier ou un sous-dossier.

* Toujours dans le terminal à ce dossier, on transforme le SVG en PDF avec :

  ~~~szh
  inkscape -o score1.pdf score1.svg
  ~~~

  > Si le pdf produit ne permet pas de faire un traitement avec Audiveris, c’est qu’il ne contient pas assez de données (de mesures)

  => **Ce code produit le fichier PDF**

* Ensuite, on demande l’analyse par Audiveris avec sortie en fichier `.mxl`

  ~~~zsh
  audiveris -batch -export score1.pdf
  ~~~

  > Pour obtenir le retour, on peut ajouter au bout, bien sûr : `> audiveris.log 2>&1`

  => **Ce code produit le fichier MXL**
  
* Ensuite, il faut décompresser ce fichier `.mxl` pour en tirer un fichier de même extension mais que **verovio** pourra transformer en `mei`

  ~~~zsh
  unzip score1.mxl -d score1
  ~~~

  **=> Produit le fichier score1/score1.mxl**

* Il reste juste ensuite à traiter ce fichier pour en faire une fichier `.mei`

  ~~~zsh
  verovio score1/score1.xml -o score1.mei -f musicxml -t mei
  ~~~

  **=> Produit le fichier MEI désiré**





>  Si on ne réussit vraiment pas à produire le fichier de cette manière, on peut essayer de passer par Affinity Publisher pour faire une page de partition, comme pour les livres.





Pour fonctionner, il faut bien entendu avec un lien symbolique : 

~~~zsh
sudo ln -s /Applications/Audiveris.app/Contents/MacOS/audiveris /usr/local/bin/audiveris

~~~

