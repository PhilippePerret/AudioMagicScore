import { test, expect } from "bun:test";
import { Score } from "../../classes/Score";
import { join } from "path";
import { existsSync, unlinkSync } from "fs";
import { unlinkByIfExist } from "../utils_tests";

test("On peut transformer une partition PDF en fichier MEI", () => {
  const score = new Score();
  const folder = 'src/test/assets/files/from-original-pdf';
  const paths = [
    'score1.pdf',
    'score2.pdf'
  ]
  // Il faut détruire les éventuels fichiers .mei fabriqués au cours
  // d'un précédent tour de test
  unlinkByIfExist(folder, ['score1.mei', 'score2.mei']);
 
  // -- Test --
  score.originalScore2mei(paths, folder, {debug: false});
  // -- vérification --
  // Les deux fichiers ont dû être fabriqués
  expect(existsSync(join(folder,'score1.mei')))
  expect(existsSync(join(folder,'score2.mei')))
}, {timeout: 20 * 1000})


test("On peut transformer une partition SVG en fichier MEI", () => {
  const score = new Score();
  const folder = 'src/test/assets/files/from-original-svg';
  const paths = [
    'score1.svg',
    'score2.svg'
  ]
  // Il faut détruire les éventuels fichiers .mei fabriqués au cours
  // d'un précédent tour de test
  unlinkByIfExist(folder, ['score1.mei', 'score2.mei']);
  
  // --- Test ---
  score.originalScore2mei(paths, folder, {debug: false});
  // --- Vérification ---
  // Les deux fichiers ont dû être fabriqués
  expect(existsSync(join(folder,'score1.mei')))
  expect(existsSync(join(folder,'score2.mei')))

}, {timeout: 20 * 1000});

