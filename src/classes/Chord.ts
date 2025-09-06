import { demiTonsBetween, intervalBetween } from "../utils/notes";
import { Note, NoteType } from "./Note";

export class Chord {
  /**
   * Fonction qui reçoit des notes au hasard et les ordonne pour former un
   * accord analysable. Retourne les notes de l'accord (:chord) et les notes
   * étrangères qui ont été retirés
   * 
   * @return une liste de : {chord: Note[], foreignNotes: Note[]} contenant
   * toutes les possibilités qu'on a avec ces notes. En général une seule,
   * mais il arrive qu'on puisse en obtenir plusieurs. Il faudra ensuite 
   * choisir le bon en fonction du poids des notes.
   */
  public static detectChords(notes: NoteType[]): {chordNotes: Note[], foreignNotes: Note[]}[] {

    const notesCount = notes.length;

    /*
    Ici, plutôt que de manipuler des objets de type NoteType (avec
    obligation d'avoir recours à structuredClone(array) pour faire
    des copies profondes)), je passe par les index seulement. C'est
    à dire que toutes les manipulations se font sur les index, pas
    sur les notes elles-mêmes.
    */
 
    // Dans un premmier temps, on classe toutes les notes pour
    // obtenir un empilage de tierces, par exemple une liste qui
    // ressemblera à : (les lettres sont fictives et représentent
    // des NoteType)
    //  [x, y, undefined, undefined, z, w, k, undefined]
    //
    const bytierces: number[] = [0];  // on commence toujours avec la première…
    for (var index = 1; index < notesCount ; ++index) {
      const firstNote = notes[bytierces[0]];
      const note = notes[index];
      
      // console.log("Comparaison entre", firstNote, note, bytierces);
      let val;
      switch(val = intervalBetween(firstNote, note)[0]){
        case 2: // <= first = septième, note = fond
          bytierces.unshift(index, undefined, undefined); break;
        case 3: 
          if ( bytierces.length >= 2 ) { 
            if ( bytierces[1] === undefined ) {
              bytierces[1] = index;
            } else {
              throw new Error("Place déjà prise pour la Tierce !");
            }
          } else {
            bytierces.push(index);
          }
          break;
        case 4:
          bytierces.unshift(index, undefined); 
          break;
        case 5:
          if (bytierces.length < 3) { bytierces.length = 3 ;}
          if ( bytierces[2] === undefined) {
            bytierces[2] = index;
          } else {
            throw new Error("Place déjà prise pour la Quinte !")
          }
          break;
        case 6:
          bytierces.unshift(index); 
          break; 
        case 7:
          if ( bytierces.length < 4) {bytierces.length = 4; }
          if ( bytierces[3] === undefined) {
            bytierces[3] = index;
          } else {
            throw new Error("Place déjà prise pour la Septième !");
          }
          break;
        default:
          console.error("Valeur non traitée : %s", val);
      } 
    };

    // console.log("bytierces", bytierces);

    // Maintenant qu'on a une liste avec les notes classées en
    // empilage de tierces, on va regarder les sections continues
    // de notes qui pourraient faire des accords
    // La règle : dès que trois notes au moins se suivent, c'est
    // un accord. Sinon, ce sont des notes étrangères. Chaque accord
    // possible donne lieu à une version
    let resultat = {
      foreigners: [],
      chords: []
    };
    // Pour accumuler les notes d'un accord possible
    let chordNotes: number[] = []
    bytierces.forEach((nOrU: undefined | number) => {
      if (nOrU === undefined) {
        // <= Une note indéfinie (un "trou") a été trouvé
        // => On doit dispatcher les notes qu'on a relevées
        resultat = this.dispatchChordNotesInResultat(resultat, chordNotes);
        chordNotes = [];
      } else {
        chordNotes.push(nOrU);
      } 
    });
    if ( chordNotes.length ) {
      resultat = this.dispatchChordNotesInResultat(resultat, chordNotes);
    }
    
    // console.log("résultat du DISPATCH des notes", resultat);

    /**
     * On ajoute les notes étrangères en construisant le retour de
     * la fonction.
     */
   const chordsFound = []
    // Le principe des notes étrangères est le suivant :
    //  - si des notes ne peuvent pas former un accord, ce sont
    //    fatalement des notes étrangères
    //  - s'il y a plusieurs accords, les notes des autres accords
    //    sont toujours des notes étrangères pour les autres
    //    accords (obsolète, on ne calcule plus comme ça)
    const chords: number[][] = resultat.chords;
    for(var i = 0, len = chords.length; i < len; ++i) {
      const chord = chords[i];
       // Cas de la sixte augmentée allemande
      if ( demiTonsBetween(notes[chord[0]], notes[chord[1]]) === 2 ) {
        chord.push(chord.shift());
      }
      // Pour les notes étrangères, je crois que le plus simple est 
      // de passer en revue chaque note
      const chordSet = new Set(chord);
      const foreigns = [];
      for (var f = 0; f < notesCount; ++ f){
        if ( !chordSet.has(f) ) { foreigns.push(f); }
      }
      const chordFound = {
        chordNotes: chord, 
        foreignNotes: foreigns
      };

      console.log("chordFound avant remise des notes", chordFound);

      // On remplace les index par les notes et on enregistre cette
      // possibilité
      const finalChordFound = { chordNotes: [], foreignNotes: [] };
      finalChordFound.chordNotes = chordFound.chordNotes.map(i => notes[i]);
      finalChordFound.foreignNotes = chordFound.foreignNotes.map(i => notes[i]);

     // On ajoute cet accord à la liste des accords
      chordsFound.push(finalChordFound);
    };

    return chordsFound; 
  } 
  /**
   * 
   * @param resultat Table du résultat
   * @param notes Liste des INDEX des notes
   * @returns 
   */
  private static dispatchChordNotesInResultat(resultat: any, notes: number[]) {
    if (notes.length >= 3) {
      // Traitement des cas où l'on se retrouve avec plus de notes
      // que normalement
      if (notes.length > 4) {
        while(notes.length > 3){
          if ( notes.length > 4 ) { resultat.chords.push( notes.slice(0, 5));}
          resultat.chords.push(notes.slice(0,4));
          notes.shift();
        }
        resultat.chords.push(notes);
      } else {
        resultat.chords.push(notes);
      }
    } else {
      resultat.foreigners.push(...notes);
    }
    return resultat;
  }
}