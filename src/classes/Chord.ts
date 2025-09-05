import { Note } from "./Note";

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
  public static orderNotes(notes: Note[]): {chord: Chord, realNotes: Note[], foreignNotes: Note[]}[] {
    const chord = new Chord();
    return [{chord: undefined, realNotes: notes, foreignNotes: []}]; // pour le moment
  } 
}