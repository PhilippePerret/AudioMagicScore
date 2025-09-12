import { Chord } from "./Chord";
import { ContextType, NoteType } from "./Note";
import { Tune } from "./Tune";

/**
 * Class Analyzor
 * 
 * Classe qui analyse la partition et retourne un rapport des accords
 * et des fonctions.
 */
export class Analyzor {

  /**
   * @api
   * 
   * Fonction qui reçoit une liste de notes et un contexte, et
   * retourne l'analyse en fonction des notes de de ce contexte.
   * 
   */
  analyze(notes: NoteType[], context:ContextType): {[x: string]: any} {
    const res = {
      notes: notes,
      context: context,
      analyze: {
        ok: false, // mis à true si on a trouvé un candidat sûr
        chordRanking: [
          // {chord: /* L'accord presque certain */ undefined, trust: /* indice confiance /5 */ undefined}
       ]
      }
    }
    console.log("Notes fournies", notes);
    const chordCandidates = Chord.detectChords(notes);
    console.log("Candidats:", chordCandidates);
    const nombreCandidats = chordCandidates.length;
    if ( nombreCandidats === 1){
      // <= Un seul candidat
      // => C'est le choix parfait
      res.analyze.chordRanking = [{chord: chordCandidates[0], trust: 5}];
    } else if (nombreCandidats == 2) {
      
      // => Il faut les discriminer pour choisir le plus probable

    } else {
      // <= Trop de candidats
      // => Il faut réduire la durée fournie (tranches) pour voir si
      //    quelque chose se dessine mieux.
      // TODO
    }

    return res;
  }

  /**
   * Discrimination par nombre de notes
   * 
   * Reçoit un accord et détermine sont poids-notes (notesWeight) par
   * rapport au nombre de notes totales.
   * 
   * Ça consiste à :
   *  - compter le nombre d'occurences de chaque note (f ≠ fd)
   *  - leur attribuer une valeur relative au totale
   *  - additionner cette valeur par note de l'accord.
   *  - classer en fonction de cette note
   *  - définir le rankByOccurence de chaque accord
   */
  discrimineByOccurencesCount(
    chords: Chord[],
    notes: NoteType[]
  ): Chord[] {
    // On fait une table (Map) qui va conserver le nombre d'occurence
    // de chaque note
    const toccurences: Map<string, number> = new Map()
    notes.forEach((note: NoteType) => {
      if ( false === toccurences.has(note.rnote)) {
        toccurences.set(note.rnote, 0);
      }
      toccurences.set(note.rnote, toccurences.get(note.rnote) + 1);
    })
    // Maintenant qu'on connait le nombre d'occurences, on peut 
    // calculer le point de chaque note en occurences
    const nombreTotalNote = notes.length;
    toccurences.forEach((occurence: number, note: string) => {
      toccurences.set(note, occurence / nombreTotalNote * 100);
    });
    console.log("Table occurence calculée", toccurences);

    chords.sort((aChord: Chord, bChord: Chord) => {
      const occWA = aChord.calcWeightOccurences(toccurences);
      const occWB = bChord.calcWeightOccurences(toccurences);
      return occWA > occWB ? -1 : 1;
    }).forEach((chord: Chord, i: number) => {
      chord.rankByOccurences = i + 1;
    })

    // On définira le chord.rankByOccurences de chaque accord
    return chords;
  }

  // TODO Il faudrait la même chose que la précédente, mais en
  // prenant aussi la durée. Donc la valeur serait occurence * duree

  /**
   * Discrimination par durée
   * 
   * Reçoit l'accord +chord+ et détermine son poids-durees 
   * (dureeWeight) calculé en fonction de la durée totale
   * +dureeTotale+
   * Cette valeur correspond au calcul :
   *  <durée totale des notes de l'accord>/dureeTotale * 100
   */
  discrimineByDureeNote(
    chords: Chord[],
    notes: NoteType[]
  ): Chord[] {
    // On calcule la durée totale des notes
    const dureeTotale = notes.reduce(
      (accum, note) => accum + note.duree, 0);
    // On trie par poids durée de chaque accord, puis
    // on lui attribue un rang
    chords.sort((aChord, bChord) => {
      const dureeA = aChord.dureeRelWeight(dureeTotale);
      const dureeB = bChord.dureeRelWeight(dureeTotale); 
      return dureeA > dureeB ? -1 : 1; 
    }).forEach((chord: Chord, i: number) => {
      chord.rankByDuree = i + 1;
    });

    return chords;
  }


  /**
   * Discrimination des accords par leur fonction dans le contexte
   * 
   */
  discrimineByFunction(
    chords: Chord[],
    contexte: ContextType
  ): Chord[] {
    // On ajoute dans le contexte la tonalité courant (l'instance)
    const currentTune = new Tune(contexte.tune as string);
    Object.assign(contexte, {tuneInstance: currentTune});
    return chords.sort((aChord, bChord) => {
      const funA = aChord.functionWeightInContext(contexte);
      const funB = bChord.functionWeightInContext(contexte);
      return funA > funB ? -1 : +1;
    }).map((chord: Chord, index: number) => {
      chord.rankByFunction = index + 1;
      return chord;
    })
  }
}