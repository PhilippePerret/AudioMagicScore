import { test, expect } from "bun:test";
import { Analyzor } from "../../classes/Analyzor";
import { ContextType, NoteType } from "../../classes/Note";
import { dupN, fa, fad, la, lad, mi, mib, re, red, si, sid, sol, ut, utd } from "../utils_tests";
import { Chord } from "../../classes/Chord";
import { shuffleArray } from "../../utils/classes_extensions";

/**
 * Module pour faire des tests simples, c'est-à-dire des tests de
 * situations sans complexités.
 */

test("Un accord dans une mesure est facilement détecté", () => {
  const A = new Analyzor();
  const context: ContextType = {tune: 'cm', tuneInstance: undefined}
  const notes: NoteType[] = [ut, mib, fa, sol];
  const res = A.analyze(notes, context);
  expect(res).toBeDefined();
});

test("La discrimination par occurences fonctionne", () => {
  // On a un contexte simple…
  const contexte: ContextType = {tune: 'c', tuneInstance: undefined};
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
  const contexte: ContextType = {tune: 'c', tuneInstance: undefined};
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

test("Discrimination par durée et occurence", () => {
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
    periode: 'classique',
    tuneInstance: undefined
  };
  // … On a deux accords C et Em
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
  expect(Am.functionInContext(contexte)).toBe(Chord.FUNCTIONS.SousDominante);
  expect(CM.functionInContext(contexte)).toBe(Chord.FUNCTIONS.SusDominante);
 
})

test.only("Classement par la fonction de quatre accords", () => {
  const contexte: ContextType = {
    tune: 'fdm', // Fa dièse mineur
    periode: 'classique',
    tuneInstance: undefined // sera instancié plus tard
  }
  const chords = [
    new Chord({id: 'accord-F#m', notes: [fad, la, utd], context: contexte}),
    new Chord({id: 'accord-F#', notes: [fad, lad, utd], context: contexte}),
    new Chord({id: 'accord-D', notes: [re, fad, la], context: contexte}),
    new Chord({id: 'accord-B#7dim', notes: [sid, red, fad, la], context: contexte})
  ]
  
  const A = new Analyzor();

  for (var i = 0; i < 4; ++i) {
    shuffleArray(chords);
    console.log("Classement initial des accords", chords.map((c: Chord) => c.id).join(', '));
    // --- Test ---
    let res: Chord[] = A.discrimineByFunction(chords, contexte);
    // --- Vérifications --
    const [acc1, acc2, acc3, acc4] = res;
    expect(acc1.id).toBe('accord-F#m');
    expect(acc2.id).toBe('accord-B#7dim');
    expect(acc3.id).toBe('accord-D');
    expect(acc4.id).toBe('accord-F#');
  }
});

