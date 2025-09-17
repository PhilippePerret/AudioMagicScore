import { expect, test } from "bun:test";
import { Note } from "../../classes/Note";


test("On peut obtenir la note à un écartement d'une note", () => {

  const tests: [any[], string][] = [
    [['c', 2, 1], 'd'],
    [['c', 1, 1], 'db'],
    [['c', 1, 0], 'cd'],

    // Depuis une note, jusqu'à la même note enharmonique
    [['c', 3, 2], 'eb'],
    [['c', 4, 2], 'e'],
    [['c', 5, 2], 'ed'],
    [['c', 4, 3], 'fb'],
    [['c', 5, 3], 'f'],
    [['c', 6, 3], 'fd'],
    [['c', 6, 4], 'gb'],
    [['c', 7, 4], 'g'],
    [['c', 8, 4], 'gd'],
    [['c', 8, 5], 'ab'],
    [['c', 9, 5], 'a'],
    [['c', 10, 5], 'ad'],
    [['c', 10, 6], 'bb'],
    [['c', 11, 6], 'b'],
    [['c', 12, 6], 'bd'],

    // De note en note de la gamme
    [['c', 2, 1], 'd'],
    [['d', 2, 1], 'e'],
    [['e', 1, 1], 'f'],
    [['f', 2, 1], 'g'],
    [['g', 2, 1], 'a'],
    [['a', 2, 1], 'b'],
    [['b', 1, 1], 'c'],

    // De note chromatique ne note chromatique
    [['c', 1, 0], 'cd'],
    [['c', 1, 1], 'db'],
    [['cd', 1, 0], 'cdd'],
    [['cd', 1, 1], 'd'],
    [['d', 1, 0], 'dd'],
    [['d', 1, 1], 'eb'],
    [['eb', 1, 0], 'e'],
    [['eb', 1, 1], 'fb'],
    [['e', 1, 0], 'ed'],
    [['e', 1, 1], 'f'],
    [['f', 1, 0], 'fd'],
    [['f', 1, 1], 'gb'],
    [['fd',1, 0], 'fdd'],
    [['g',1, 0], 'gd'],
    [['g',1,1], 'ab'],
    [['gd',1, 0], 'gdd'],
    [['gd', 1, 1], 'a'],
    [['a', 1, 0], 'ad'],
    [['a', 1, 1], 'bb'],
    [['ad', 1, 0], 'add'],
    [['bb', 1, 0], 'b'],
    [['bb', 1, 1], 'cb'],
    [['b', 1, 0], 'bd'],
    [['b', 1, 1], 'c'],

    // Les degrés négatifs
    [['d', -2, -1], 'c'],
    [['c', -2, -1], 'bb'],
    [['c', -3, -2], 'a'],

    // Plus complexes
    [['bd', 1, 0], 'bdd'],
    [['bd', -1, 0], 'b'],
    [['bd', -2, 0], 'bb'],
    [['bd', 3, 2], 'dd']
  ];

  tests.forEach(([prov, expected]: [any[], string]) => {
    console.log("*** Test avec %s (doit donner '%s')", prov.join(', '), expected);
    expect(Note.noteAt(prov[0], prov[1], prov[2])).toBe(expected);
  })

});