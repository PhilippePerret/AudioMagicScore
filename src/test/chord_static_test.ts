import { test, expect } from "bun:test";
import { NOTES } from "./utils_tests";
import { Note, NoteType } from "../classes/Note";
import { Chord } from "../classes/Chord";
  

const ut = NOTES.do;
const re = NOTES.re;
const mi = NOTES.mi;
const fa = NOTES.fa;
const fad = NOTES.fad;
const sol = NOTES.sol;
const la = NOTES.la;
const lad = NOTES.lad;
const notes: NoteType[] = [ut, mi, sol];

/*
Traite une liste de cas avec seulement un accord
*/
function CheckCaseList(listeChecks) {
  listeChecks.forEach( ([given, sorted, foreigners]) => {
    const res = Chord.detectChords(given);
    const acc = res[0];
    expect(sorted).toEqual(acc.chordNotes);
    expect(foreigners).toEqual(acc.foreignNotes);
  })
}

/* 
Traite une liste de cas avec des retours à plusieurs accords
*/
function CheckCaseMultiList(listeChecks) {
  listeChecks.forEach(([given, founds]) =>{
    const res = Chord.detectChords(given);
    res.forEach((found, index) => {
      const [chord, foreigners] = founds[index];
      expect(chord).toEqual(found.chordNotes);
      expect(foreigners).toEqual(found.foreignNotes);
    })
  })

}

test("Test de la détection des accords (simple, sans note étrangère)", () => { 

  const listeChecks = [
    //[<ordre donné>], [<accord>], [<foreigners>]
    [[ut, mi, sol], [ut, mi, sol], []],
    [[mi, sol, ut], [ut, mi, sol], []],
    [[sol, ut, mi], [ut, mi, sol], []],
    [[mi, ut, sol], [ut, mi, sol], []],
    [[sol, mi, ut], [ut, mi, sol], []],
    
    // Cas spécial de la sixte augmentée
    [[lad, ut, mi, sol], [ut, mi, sol, lad], []],
    [[sol, lad, ut, mi], [ut, mi, sol, lad], []],
    [[mi, sol, lad, ut], [ut, mi, sol, lad], []],
    [[ut, mi, sol, lad], [ut, mi, sol, lad], []],
    [[lad, mi, ut, sol], [ut, mi, sol, lad], []],
    [[lad, sol, ut, mi], [ut, mi, sol, lad], []],
    [[lad, mi, sol, ut], [ut, mi, sol, lad], []],
  ];

  CheckCaseList(listeChecks);

});


test("Détection des accords (avec notes étrangères)", ()=>{
  const listeChecks = [
    [[ut, mi, sol, fa], [ut, mi, sol], [fa]],
    [[ut, mi, sol, fad, fa], [ut, mi, sol], [fad, fa]],
    [[sol, mi, ut, fad, fa], [ut, mi, sol], [fad, fa]],
    [[fa, fad, sol, mi, ut], [ut, mi, sol], [fa, fad]],
  ]

  CheckCaseList(listeChecks);

})

test("Détection des accords (avec plusieurs accords)", ()=>{
  const listeChecks = [
    [
      // dans le cas ci-dessous, on se retrouve avec une première
      // analyse où l'on obtient [re, fa, la, do, mi, sol]
      /* given */[ut, mi, sol, fa, re, la], 
      /* founds */[
        [[re, fa, la, ut, mi], [sol]],
        [[re, fa, la, ut], [mi, sol]],
        [[fa, la, ut, mi, sol], [re]],
        [[fa, la, ut, mi], [sol, re]],
        [[la, ut, mi, sol], [fa, re]],
        [[ut, mi, sol], [fa, re, la]]
      ]
    ]
  ]
  CheckCaseMultiList(listeChecks);
})