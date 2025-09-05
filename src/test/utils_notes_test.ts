import { test, expect } from "bun:test";
import { intervalBetween } from "../utils/notes";
import { DUREE, Note, NoteType } from "../classes/Note";
import { NOTES } from "./utils";


test("Test de la fonction qui calcule l'intervalle entre deux notes", () => {
  const liste: [NoteType, NoteType, [number, number]][] = [
    [NOTES.do, NOTES.si, [7, 1]],
    [NOTES.do, NOTES.mib, [3, -1]],
    [NOTES.do, NOTES.mi, [3, 0]],
    [NOTES.si, NOTES.do, [2, -1]]
  ]
  liste.forEach( ary => {
    const [n1, n2, res] = ary;
    console.log("n1 = ", n1);
    console.log("n2 = ", n2);
    console.log("res = ", res);
    const actual = intervalBetween(n1, n2);
    console.log("actual", actual);
    expect(actual).toEqual(res);
  });
});