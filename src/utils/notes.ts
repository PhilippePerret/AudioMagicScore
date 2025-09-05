/**
 * Fonctions utiles pour travailler avec les notes
 */

import { Note, NoteType } from "../classes/Note";

/**
 * Calcul l'intervalle entre deux notes et retourne une paire qui indique
 * en premier nombre l'intervalle simple (3 pour tierce, 6 pour sixte, etc.)
 * et en deuxième nombre l'altération de cet interval (0 pour quinte juste,
 * 0 pour 3ce mineure et 1 pour tierce majeur, etc.)
 * 
 * ## Examples
 * 
 *    > si on donne 'b' et 'c' par exemple ça retourne [2, -1] (seconde mineure)
 *      Si (b, c) fourni (2e majeur donc [2,1] attendu)
 *      degré  : b: 7, c: 1 => (1 - 7) => -6 (+7) => 1(+1) => 2 => [2, ?]
 *      chroma : (intervale majeur = 2) 
 *          b:11, c:1 => (1 - 11) => -10(+12) => 2(-2) => 0 => [2,0]
 *      Si (c, b) fourni (7e majeur, donc [7, 1] attendu)
 *      degré (c: 1, b: 7 => (7 - 1) + 1 => 7 => [7, ?]
 *      chroma : (intervale mineur = 10)
 *          c:1, b:11 => (11-1)+1 => 11(-10) => 1 => [7,1]
 * 
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
  ++chromaticInterval;
  const diff = chromaticInterval - IntervalJusteOrMajeur ;

  return [degreeInterval, diff];
}