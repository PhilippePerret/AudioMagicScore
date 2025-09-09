import { test, expect } from "bun:test";
import { Score } from "../../classes/Score";

function getScore(){
const path = "./assets/xml/preludeEbm.mei";
  const score = new Score(path);
  score.parse();
  return score;
}
test.only("On peut récupérer les méta-données du score", () => {
  const score = getScore();
  score.retrieveMetadata();
  console.log("ScoreDefData", score.scoreDefData);
  const meta = score.metadata;
  // --- Vérifications ---
  expect(meta.label).toEqual('Piano');
})
test("On peut récupérer les données d'un fichier Audioveris", () => {
  const score = getScore();
  score.retrieveMeasures();
  console.log("measuresData", score.measuresData);
  const staffs = score.staffs;
  // console.log("Staffs", staffs);
  // --- Vérifications ---
  expect(staffs.length).toBe(2);
  const md = staffs[0];
  const mg = staffs[1];
  expect(md.clef).toEqual(['G', 2]);
  expect(mg.clef).toEqual(['G', 2]);
  expect(md.armure).toEqual([-1, 6]); // 6 bémols
  expect(mg.metrique).toEqual([3,2]);
});

test.only("On peut parser les notes", () => {
  const score = getScore();
  score.retrieveMeasures();
});