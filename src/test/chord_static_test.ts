import { test, expect } from "bun:test";
import { NOTES } from "./utils";
import { Note, NoteType } from "../classes/Note";
import { Chord } from "../classes/Chord";


test("Test de l'ordonnancement des notes d'un accord", () => { 

  const notes: NoteType[] = [NOTES.do, NOTES.mi, NOTES.sol];
  const lesnotes: Note[] = notes.map(n => n as Note);
 const expected = [{
  chord: undefined,
  realNotes: lesnotes,
  foreignNotes: []
 }];

  const res: {
    chord: Chord, 
    realNotes: Note[], 
    foreignNotes: Note[]
  }[] = Chord.orderNotes(lesnotes);

  // On ne pourra pas le faire comme ci-dessous car l'instance
  // :chord ne sera pas connue. Mais on pourra en revanche 
  // tester ses notes, sa fonction (null puisqu'aucun contexte
  // n'est fourni), etc.
  expect(res[0]).toEqual(expected[0]);

});