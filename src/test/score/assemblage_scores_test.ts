import { test, expect } from "bun:test";
import { Score } from "../../classes/Score";


test("On doit fournir les bons arguments, pour un assemblage", () => {
  const score = new Score();
  expect(score['assemble']).toBeFunction();
  expect(score.assemble.bind(score)).toThrow();
  expect(score.assemble.bind(score, "bad/path/file.mei")).toThrow('Unknown File: bad/path/file.mei');
  expect(score.assemble.bind(score, 'src/test/assets/empty_folder')).toThrow('Empty folder: src/test/assets/empty_folder');
  expect(score.assemble.bind(score, 'src/test/assets/files/extension.xml')).toThrow('Bad extension (.mei required): src/test/assets/files/extension.xml');
  expect(score.assemble.bind(score, [])).toThrow('No path provided.');
});
test("On peut assembler plusieurs partitions valides", () => {
  const files = [
    'src/test/assets/files/score1.mei',
    'src/test/assets/files/score2.mei',
  ]
  const score = new Score()
  score.assemble(files);
  const mesures = score.measures;
  console.log("Toutes les mesures (%i)", score.measures.length, score.measures);

  // Les mesures ont bien été renumérotées
  for (var i = 0, len = mesures.length; i < len; ++ i){
    const num = 1 + i;
    const mes = mesures[i];
    expect(mes.numero).toBe(num);
  }
  
})