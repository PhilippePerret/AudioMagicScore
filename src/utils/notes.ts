/**
 * Fonctions utiles pour travailler avec les notes
 */

import { Note, NoteType } from "../classes/Note";

/**
 * Calcul l'intervalle entre deux notes et retourne une paire qui indique
 * en premier nombre l'intervalle simple (3 pour tierce, 6 pour sixte, etc.)
 * et en deuxième nombre l'altération de cet interval (0 pour quinte juste,
 * -1 pour 3ce mineure et 1 pour tierce majeur, etc.)
 * 
 * Le résultat est donc [<intervalle>, <altération de l'intervalle>]
 * 
 * Noter que pour la septième, la septième "naturelle" ([7, 0]) est la
 * septième mineure.
 * 
 * La fonction ne prend pas en compte les octaves, mais seulement les notes
 * en considérant que la deuxième est TOUJOURS au-dessus de la première.
 * 
 * Cette méthode est testée dans `utils_notes_test.ts`
 * 
 * @return [<intervalle simple>, <altération>] par exemple [4,1] pour 
 * "quarte augmentée", [5,0] pour "quinte juste". Noter que [7,0] 
 * signifie "7e mineure" puisque la 7e est mineure par défaut.
 */
export function intervalBetween(note1: NoteType, note2: NoteType): [number, number] {
  
  let degreeInterval:number = note2.absDegree - note1.absDegree;
  if (degreeInterval < 0) { degreeInterval += 7}
  ++degreeInterval; 

  const IntervalJusteOrMajeur = Note.getIntervalJusteFor(degreeInterval);
  let chromaticInterval: number = note2.chromaticNumber - note1.chromaticNumber;
  if (chromaticInterval < 0) { chromaticInterval += 12;}
  const diff = chromaticInterval - IntervalJusteOrMajeur ;

  return [degreeInterval, diff];
}

export function demiTonsBetween(note1: NoteType, note2: NoteType): number {
  let interv = note2.chromaticNumber - note1.chromaticNumber;
  if ( interv < 0 ) { interv += 12 ; }
  return interv;
}