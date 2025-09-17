import { test, expect } from "bun:test";
import { Analyzor } from "../../classes/Analyzor";
import { ContextType, NoteType } from "../../classes/Note";
import { dupN, fa, fad, la, lab, lad, mi, mib, re, red, si, sid, sol, ut, utd } from "../utils_tests";
import { Chord } from "../../classes/Chord";
import { shuffleArray } from "../../utils/classes_extensions";
import { CHORD_FUNCTIONS } from "../../utils/music_constants";
import { isContext } from "vm";

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
  expect(Am.functionInContext(contexte)).toBe(CHORD_FUNCTIONS.SousDominante);
  expect(CM.functionInContext(contexte)).toBe(CHORD_FUNCTIONS.SusDominante);
 
})
test("Classement par fonction de quatre accords (tonalité simple", () => {
  let contexte: ContextType = {
    tune: 'cm',
    periode: 'classique',
    tuneInstance: undefined
  }

  let chords = [
    new Chord({id: 'accord-Cm', notes: [ut, mib, sol], context: contexte}),
    new Chord({id: 'accord-C', notes: [ut, mi, sol], context: contexte}),
    new Chord({id: 'accord-Ab', notes: [lab, ut, mib], context: contexte}),
    new Chord({id: 'accord-F#7dim', notes: [fad, la, ut, mib], context: contexte})
  ]

  const A = new Analyzor();

  for (var i = 0; i < 4; ++i) {
    shuffleArray(chords);
    console.log("Accords mélangés", structuredClone(chords).map((c: Chord) => c.id).join(', '));
    // --- Test ---
    let res: Chord[] = A.discrimineByFunction(chords, contexte);
    console.log("Accords classés", res.map((c: Chord) => `${c.id}`).join(', '));
    // --- Vérifications --
    const [acc1, acc2, acc3, acc4] = res;
    res.forEach((c: Chord) => {
      console.log("Poids de l'accord %s (%s) : %i (%s)", c.name, c.simpleNotes, c.weight, c.function);
    })
    expect(acc1.id).toBe('accord-Cm');
    expect(acc2.id).toBe('accord-F#7dim');
    expect(acc3.id).toBe('accord-Ab');
    expect(acc4.id).toBe('accord-C');
  }
});


test("Classement par la fonction de quatre accords (tonalité complexe)", () => {
  let contexte: ContextType = {
    tune: 'fdm', // Fa dièse mineur
    periode: 'classique',
    tuneInstance: undefined // sera instancié plus tard
  }

  let chords = [
    new Chord({id: 'accord-F#m', notes: [fad, la, utd], context: contexte}),
    new Chord({id: 'accord-F#', notes: [fad, lad, utd], context: contexte}),
    new Chord({id: 'accord-D', notes: [re, fad, la], context: contexte}),
    new Chord({id: 'accord-B#7dim', notes: [sid, red, fad, la], context: contexte})
  ]
  
  const A = new Analyzor();

  for (var i = 0; i < 4; ++i) {
    shuffleArray(chords);
    console.log("Accords mélangés", structuredClone(chords).map((c: Chord) => c.id).join(', '));
    // --- Test ---
    let res: Chord[] = A.discrimineByFunction(chords, contexte);
    console.log("Accords classés", res.map((c: Chord) => `${c.id}`).join(', '));
    // --- Vérifications --
    const [acc1, acc2, acc3, acc4] = res;
    res.forEach((c: Chord) => {
      console.log("Poids de l'accord %s (%s) : %i (%s)", c.name, c.simpleNotes, c.weight, c.function);    
    })
    expect(acc1.id).toBe('accord-F#m');
    expect(acc2.id).toBe('accord-B#7dim');
    expect(acc3.id).toBe('accord-D');
    expect(acc4.id).toBe('accord-F#');
  }
});


test("Reconnaissance de l'accord si#7dim", () => {

  function show(chord: Chord){
    console.log("Chord (%s) = %s", chord.simpleNotes, chord.name);
  }

  let contexte: ContextType = {
    tune: 'cm',
    periode: 'classique',
    tuneInstance: undefined
  }

  let chord: Chord = new Chord({id: "si7dim", notes: [si, re, fa, lab], context: contexte})

  show(chord);
  expect(chord.name).toBe('Bo');

  contexte = {
    tune: 'cdm',
    tuneInstance: undefined
  }
  chord = new Chord({notes: [sid, red, fad], context: contexte});
  show(chord);
  expect(chord.name).toBe('Bd5-');

  chord = new Chord({notes: [sid, red, fad, la], context: contexte});
  show(chord);
  expect(chord.name).toBe('Bdo');

  contexte = {tune: 'cd', tuneInstance: undefined}

  chord = new Chord({notes: [sid, red, fad, lad], context: contexte});
  show(chord);
  expect(chord.name).toBe('Bdo/');

  // Dans le même context majeur, un accord de 7e diminué doit être
  // reconnu
  chord = new Chord({notes: [sid, red, fad, la], context: contexte});
  show(chord);
  expect(chord.name).toBe('Bdo');

  // Le même dans un contexte de Fa# mineur (doit être une Dom de
  // Dom en tant que 7e dim de Dominante)
  // Dominante de F#m = C#7
  // Dominante (VII) de Dominante = VII de C#7 = Si# Re# Fa# La
  contexte = { tune: 'fdm', tuneInstance: undefined }
  chord = new Chord({notes: [sid, red, fad, la], context: contexte});
  show(chord);
  expect(chord.name).toBe('Bdo');
  expect(chord.function).toBe(CHORD_FUNCTIONS.SeptDeSensibleDeDom);
});


test.only("On peut trouver les données d'un accord ignoré par la tonalité courante", () => {
  let contexte: ContextType = {
    tune: 'c', tuneInstance: undefined
  }
  let chord = new Chord({notes:[fa, lab, ut], context: contexte});
  const A = new Analyzor();

  let maybeTunes = A.nearestTunesFor(chord);
  
  expect(maybeTunes[0]).toBe('eb');  //  supposition Accord = II
  expect(maybeTunes[1]).toBe('cm');  //  supposition Accord = IV (de Im)
  expect(maybeTunes[2]).toBe('ab');  //  supposition Accord = Rel


});