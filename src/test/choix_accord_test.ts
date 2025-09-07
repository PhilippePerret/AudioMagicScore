import { test, expect } from "bun:test";
import { Chord } from "../classes/Chord";
import { blanche, db_croche, fa, la, mi, ronde, sol, ut } from "./utils_tests";
import { Note, NoteType } from "../classes/Note";

/**
 * Dans ce module de test, on regarde comment un accord est choisi
 * parmi une liste d'accord en fonction :
 * 1) du contexte
 * 2) de son poids
 */

// Pour DUPliquer une note (NoteType) en fournissant d'autres valeurs
// si nécessaire.
function dup(note: NoteType, newVals: {[x: string]: any} ) {
  return Object.assign({...note}, newVals);
}

test("Un accord plus lourd est prioritaire", () => {

  const faLi: NoteType = dup(fa, {duree: db_croche});
  const laLi: NoteType = dup(la, {duree: db_croche});
  const utLi: NoteType = dup(ut, {duree: db_croche}); 
  
  const utLo: NoteType = dup(ut, {duree: ronde});
  const miLo: NoteType = dup(mi, {duree: blanche});
  const soLo: NoteType = dup(sol, {duree: blanche});

  const loChord = new Chord({
    id: 'heavy-chord',
    notes: [utLo, miLo, soLo], 
    context: {tune: 'c'}
  });
  const liChord = new Chord({
    id: 'light-chord',
    notes: [faLi, laLi, utLi], 
    context: {tune: 'c'}
  });

  let candidats = [loChord, liChord];
  let discriminedChords = Chord.discrimineChords(candidats);
  let preferedChord = discriminedChords.favorite;
  expect(preferedChord.id).toBe('heavy-chord')

  // Ce n'est pas l'ordre qui fait la différence
  candidats = [liChord, loChord];
  discriminedChords = Chord.discrimineChords(candidats);
  preferedChord = discriminedChords.favorite;
  expect(preferedChord.id).toBe('heavy-chord');

})

test("Un accord de même poids est choisi en fonction du contexte", ()=>{

  // (sans modulation entre les deux accords)
  // à poids égal, l'accord qui suit un accord
  // V
  // est par ordre de préférence
  // I, VII, VI, II, IV, (III)

  // (sans modulation entre les deux accords)
  // à poids égal, l'accord qui suit un accord 
  // II
  // est par ordre de préférence un
  // V, VII, IV, I, VI
  
  // (sans modulation entre les deux accords)
  // à poids égal, l'accord qui suit un accord :
  // I
  // est par ordre de préférence un :
  // Majeur : V, IV, II, VI, VII, III
  // Mineur : IV, V, VII, VI, II, III

})