import { test, expect } from "bun:test";
import { NOTES } from "./utils_tests";
import { Note, NoteType } from "../classes/Note";
import { Chord } from "../classes/Chord";


test("Test de l'ordonnancement des notes d'un accord", () => { 

  const ut = NOTES.do;
  const mi = NOTES.mi;
  const sol = NOTES.sol;
  const lad = NOTES.lad;
  const notes: NoteType[] = [ut, mi, sol];

  const listeChecks = [
    //[<ordre donné>], [<accord>], [<foreigners>]
    [[ut, mi, sol], [ut, mi, sol], []],
    [[mi, sol, ut], [ut, mi, sol], []],
    [[sol, ut, mi], [ut, mi, sol], []],
    [[mi, ut, sol], [ut, mi, sol], []],
    [[sol, mi, ut], [ut, mi, sol], []],
    
    // Cas spécial de la sixte augmentée
    [[lad, ut, mi, sol], [ut, mi, sol, lad], []]
  ];

  listeChecks.forEach( ([given, sorted, foreigners]) => {
    const res = Chord.orderNotes(given);
    const acc = res[0];
    expect(acc.chordNotes).toEqual(sorted);
    expect(acc.foreignNotes).toEqual(foreigners);
  })
});