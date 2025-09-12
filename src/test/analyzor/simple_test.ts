import { test, expect } from "bun:test";
import { Analyzor } from "../../classes/Analyzor";
import { ContextType, NoteType } from "../../classes/Note";
import { dupN, fa, la, mi, mib, si, sol, ut } from "../utils_tests";
import { Chord } from "../../classes/Chord";
import { Tune } from "../../classes/Tune";

/**
 * Module pour faire des tests simples, c'est-à-dire des tests de
 * situations sans complexités.
 */

test("Un accord dans une mesure est facilement détecté", () => {
  const A = new Analyzor();
  const context: ContextType = {tune: 'cm'}
  const notes: NoteType[] = [ut, mib, fa, sol];
  const res = A.analyze(notes, context);
  expect(res).toBeDefined();
});

test("La discrimination par occurences fonctionne", () => {
  // On a un contexte simple…
  const contexte: ContextType = {tune: 'c'};
  // On a un ensemble de notes de même durée
  const notes = [ut, ut, ut, ut, mi, mi, mi, sol, sol, sol, si, si, si];
  // On a deux accords C et Em
  const chords = [
    new Chord({id: 'accord-C', notes: [ut, mi, sol], context: contexte}),
    new Chord({id: 'accord-Em', notes: [mi, sol, si], context: contexte})
  ]
  // On fait un analyzor
  const A = new Analyzor();
  // On les discrimine par le nombre de notes
  let res: Chord[] = A.discrimineByOccurencesCount(chords, notes);
  console.log("Résultat de la discrimination", res)
  expect(res[0].id).toBe('accord-C');
  expect(res[0].rankByOccurences).toBe(1);
  expect(res[1].id).toBe('accord-Em');
  expect(res[1].rankByOccurences).toBe(2);
  // -- Test --
  // On change de groupe de notes
  notes.push(...[si, si, si, si]);
  res = A.discrimineByOccurencesCount(chords, notes);
  console.log("Résultat de la discrimination", res)
  // -- Vérification --
  expect(res[1].id).toBe('accord-C');
  expect(res[1].rankByOccurences).toBe(2);
  expect(res[0].id).toBe('accord-Em');
  expect(res[0].rankByOccurences).toBe(1);
})

test("Discrimination pour durée", () => {
  const contexte: ContextType = {tune: 'c'};
  const utshort = dupN(ut, {duree: 12});
  const silong = dupN(si, {duree: 128});
  const notes = [utshort, utshort, utshort, mi, mi, mi, sol, sol, sol, silong, silong, silong];
  // On a deux accords C et Em
  const chords = [
    new Chord({id: 'accord-C', notes: [utshort, mi, sol], context: contexte}),
    new Chord({id: 'accord-Em', notes: [mi, sol, silong], context: contexte})
  ]
  const A = new Analyzor();
  // -- Test ---
  let res = A.discrimineByDureeNote(chords, notes);
  // console.log("RÉSULTAT DISCRIM DURÉE:", res);
  // -- Vérification --
  expect(res[1].id).toBe('accord-C');
  expect(res[1].rankByOccurences).toBe(undefined);
  expect(res[1].rankByDuree).toBe(2);
  expect(res[0].id).toBe('accord-Em');
  expect(res[0].rankByOccurences).toBe(undefined);
  expect(res[0].rankByDuree).toBe(1);
})

test.only("Discrimination par durée et occurence", () => {
  // Par exemple, un accord peut avoir plus de notes dans 
  // la partie, mais d'une durée faible. Il va donc
  // l'emporter au niveau du nombre de notes, le perdre
  // au niveau de la durée, c'est le mélange des deux
  // qui pourra les départager
});

test("Discrimination par la fonction dans un context", () => {
  // Entre un accord de Do majeur et un accord de La mineur, 
  // dans un contexte de Em, c'est le Em qui l'emporte
   // On a un contexte simple…
  const contexte: ContextType = {
    tune: 'em',
    periode: 'classique'
  };
  // On a deux accords C et Em
  const chords = [
    new Chord({id: 'accord-C', notes: [ut, mi, sol], context: contexte}),
    new Chord({id: 'accord-Am', notes: [la, ut, mi], context: contexte})
  ]
  // On fait un analyzor
  const A = new Analyzor();
  // -- Test --
  const res = A.discrimineByFunction(chords, contexte);
  // -- Vérification --
  const Am = res[0];
  const CM = res[1];
  expect(Am.id).toBe('accord-Am');
  expect(CM.id).toBe('accord-C');
  expect(Am.rankByFunction).toBe(Chord.FONCTIONS.SubDominante.rankValue);
 
})


test.only("Pour essai", () => {
  let tune = new Tune('c');
  expect(tune.getNotes()).toEqual(['c','d','e','f','g','a','b','c','d','e','f','g','a','b','c']);
  tune = new Tune('em');
  expect(tune.getNotes()).toEqual(['e','fd','g','a','b','c','dd','e','fd','g','a','b','c','dd','e']);
  tune = new Tune('cb');
  expect(tune.getNotes()).toEqual(['cb','db','eb','fb','gb','ab','bb','cb','db','eb','fb','gb','ab','bb','cb']);
  tune = new Tune('eb');
  expect(tune.getNotes()).toEqual(['eb','f','g','ab','bb','c','d','eb','f','g','ab','bb','c','d','eb']);
  tune = new Tune('gdm');
  expect(tune.getNotes()).toEqual(['gd','ad','b','cd','dd','e','fdd','gd','ad','b','cd','dd','e','fdd','gd']);
  
})