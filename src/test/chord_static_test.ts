import { test, expect } from "bun:test";
import { ut, re, mi, fa, fad, sol, la, lad, sold, utd, solb } from "./utils_tests";
import { Chord } from "../classes/Chord";
import { NoteType } from "../classes/Note";
import { deepEquals } from "bun";
  

/*
Traite une liste de cas avec seulement un accord
*/
function checkCaseList(listeChecks) {
  listeChecks.forEach( ([given, sorted, foreigners]) => {
    const res = Chord.detectChords(given);
    const acc = res[0];
    expect(sorted).toEqual(acc.chordNotes);
    expect(foreigners).toEqual(acc.foreignNotes);
  })
}

function errorMessageFor(givenNotes: NoteType[], expectChord: NoteType[], actualChord: NoteType[]): string {
  function chord2str(chord: NoteType[]) {
    return '[' + chord.map(n => n.rnote).join(', ') + ']';
  }
  const msg = []
  msg.push("\n");
  msg.push('Give:     ' + chord2str(givenNotes));
  msg.push("\n");
  msg.push('Expected: ' + chord2str(expectChord));
  msg.push("\n");
  msg.push('Actual:   ' + chord2str(actualChord));
  return msg.join(' ');
}
/* 
Traite une liste de cas avec des retours à plusieurs accords
*/
const checkCaseMultiList = (listeChecks) => {
  listeChecks.forEach(([given, founds]) =>{
    const res = Chord.detectChords(given);
    res.forEach((found, index) => {
      const [chord, foreigners] = founds[index];
      if ( !deepEquals(chord, found.chordNotes) ) {
        throw new Error(errorMessageFor(given, chord, found.chordNotes));
      }
      if (!deepEquals(foreigners, found.foreignNotes)){
        throw new Error(errorMessageFor(given, foreigners, found.foreignNotes));
      }
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

  checkCaseList(listeChecks);

});


test("Détection des accords (avec notes étrangères)", ()=>{
  const listeChecks = [
    [[ut, mi, sol, fa], [ut, mi, sol], [fa]],
    [[ut, mi, sol, fad, fa], [ut, mi, sol], [fad, fa]],
    [[sol, mi, ut, fad, fa], [ut, mi, sol], [fad, fa]],
    [[fa, fad, sol, mi, ut], [ut, mi, sol], [fa, fad]],
  ]

  checkCaseList(listeChecks);

})

test("Détection des accords avec notes identiques", ()=> {
  const listeChecks = [
    //*
    [[ut, mi, sol, sold], [
      [[ut, mi, sol], [sold]],
      [[ut, mi, sold], [sol]]
    ]],
    //*/
    //*
    // Avec deux notes à variantes
    [[ut, utd, mi, sol, sold], [
      [[ut, mi, sol], [utd, sold]],
      [[ut, mi, sold], [utd, sol]],
      [[utd, mi, sol], [ut, sold]],
      [[utd, mi, sold], [ut, sol]]
    ]],
    //*/

    //*
    // Avec une note à deux variantes
    // Ce cas teste aussi les variantes pour les notes étrangères
    [[ut, mi, sol, solb, sold], [
      [[ut, mi, sol], [solb, sold]],
      [[ut, mi, solb], [sol, sold]],
      [[ut, mi, sold], [sol, solb]]
    ]]
    //*/
  ]
  checkCaseMultiList(listeChecks);
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
  checkCaseMultiList(listeChecks);
})