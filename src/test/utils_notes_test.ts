import { test, expect } from "bun:test";
import { intervalBetween } from "../utils/notes";
import { DUREE, Note, NoteType } from "../classes/Note";
import { NOTES } from "./utils_tests";


test("Test de la fonction qui calcule l'intervalle entre deux notes", () => {
  const liste: [NoteType, NoteType, [number, number]][] = [
    [NOTES.do, NOTES.si, [7, 1]],
    [NOTES.do, NOTES.mib, [3, -1]],
    [NOTES.do, NOTES.mi, [3, 0]],
    [NOTES.do, NOTES.fa, [4,0]],
    [NOTES.do, NOTES.fad, [4,1]],
    [NOTES.do, NOTES.solb, [5,-1]],
    [NOTES.do, NOTES.sol, [5,0]],
    [NOTES.do, NOTES.lab, [6, -1]],
    [NOTES.do, NOTES.la, [6,0]],
    [NOTES.do, NOTES.sib, [7,0]],

    [NOTES.re, NOTES.do, [7,0]],
    [NOTES.sol, NOTES.dod, [4, 1]],
    [NOTES.lab, NOTES.dod, [3, 1]],
    [NOTES.si, NOTES.do, [2, -1]]
  ]
  liste.forEach( ary => {
    const [n1, n2, res] = ary;
    const actual = intervalBetween(n1, n2);
    console.log("actual", actual);
    expect(actual).toEqual(res);
  });
});