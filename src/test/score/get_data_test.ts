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
  // --- Vérifications ---
  const meta = score.metadata;
  expect(meta.label).toEqual('Piano');
  const staffs = meta.staffs;
  // console.log("meta staffs", meta.staffs);
  expect(staffs.length).toBe(2);
  const staff1 = staffs[0];
  const staff2 = staffs[1];
  expect(staff1.clef).toEqual(["G", 2]);
  expect(staff2.clef).toEqual(["G", 2]);
  expect(staff1.armure).toEqual([-1, 6]);
  expect(staff2.armure).toEqual([-1, 6]);
  expect(staff1.metrique).toEqual([3, 2]);
  expect(staff2.metrique).toEqual([3, 2]);
  // console.log("staffs", staffs);
})
test("On peut récupérer les données d'un fichier Audioveris", () => {
  const score = getScore();
  score.retrieveMeasures();
  console.log("measuresData", score.measuresData);
});

test("On peut parser les notes", () => {
  const score = getScore();
  score.retrieveMeasures();
});