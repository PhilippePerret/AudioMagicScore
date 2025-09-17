import { test, expect } from "bun:test";
import { lad, mi, mib, sol, sold, ut } from "../utils_tests";
import { ContextType } from "../../classes/Note";
import { Chord } from "../../classes/Chord";
import { Tune } from "../../classes/Tune";


test("On peut déterminer le genre d'un accord avec Chord.genreOf", () => {
  let contexte: ContextType = {tune: 'c', tuneInstance: undefined};

  let chord: Chord;

  Tune.reset();
  chord = new Chord({notes: [ut, mi, sol], context: contexte});
  console.log("*** Test de l'accord", chord.notes);
  expect(Chord.genreOf(chord)).toBe('maj');

  Tune.reset();
  chord = new Chord({notes: [ut, mib, sol], context: contexte});
  console.log("*** Test de l'accord", chord.notes);
  expect(Chord.genreOf(chord)).toBe('min');
  contexte = {tune: 'am', tuneInstance: undefined};

  Tune.reset();
  chord = new Chord({notes: [ut, mi, sold], context: contexte});
  console.log("*** Test de l'accord", chord.notes);
  expect(Chord.genreOf(chord)).toBe('5+');


  Tune.reset();
  chord = new Chord({notes: [ut, mi, sol, lad], context: contexte});
  console.log("*** Test de l'accord", chord.notes);
  expect(Chord.genreOf(chord)).toBe('6+');

  // FAIRE PASSER CE TEST ET RATIONNALISER (DRY)

})