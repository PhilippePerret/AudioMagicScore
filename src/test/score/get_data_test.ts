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
});

test("On peut parser les notes", () => {
  const score = getScore();
  score.retrieveMeasures();
});