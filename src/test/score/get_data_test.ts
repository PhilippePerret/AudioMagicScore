import { test, expect } from "bun:test";
import { ScorePageParser } from "../../classes/ScoreParser";

function getScore(){
const path = "./assets/xml/preludeEbm.mei";
  const score = new ScorePageParser(path);
  score.parse();
  return score;
}
test("On peut récupérer les méta-données d'une page de partition", () => {
  const score = getScore();
  score.scanMetadata();
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
test.only("Essaie de totale récupération", () => {
  const score = getScore();
  score.treate();
});
test("Le parseur peut récupérer les données note d'un fichier MEI (fichier de partition)", () => {
  const score = getScore();
  const mesures = score.scanMeasures();
  // console.log("Mesures :", mesures);
  // --- Vérification ---
  // Il doit y avoir 14 mesures
  expect(mesures.length).toBe(14);
  for(var i = 0; i < 14; ++i){
    const expectedNum = i + 1;
    const mesure = mesures[i];
    expect(mesure).toContainAllKeys(['numero', 'portees', 'assets']);
    expect(mesure.numero).toBe(expectedNum);
    // console.log("portée", mesure.portees);
    expect(mesure.portees).toBeArray();
    // Il y a 2 portées dans toutes les mesures
    expect(mesure.portees.length).toBe(2); 
    const staff1 = mesure.portees[0];
    expect(staff1).toBeObject();
    expect(staff1).toContainAllKeys(['voices', 'attrs']);
    expect(staff1.attrs).toContainAllKeys(['id', 'staffNum']);
    // On teste grossièrement les portées de chaque mesure
    for (var is = 0; is < 2; ++ is) {
      const expectedStaffNum = is + 1;
      const staff = mesure.portees[is];
      expect(staff.attrs.staffNum).toBe(expectedStaffNum); // bon numéro de portée 
    }
  }
  // On vérifie quelques mesures en particulier
  let mes: any, md: any, mg: any;
  let v1_md: any[], v2_md: any[];
  let n1: any, n2: any, n3: any;

  // La mesure 6 pour les différentes voices
  mes = mesures[5];
  // console.log("Mesure 6 : ", mes);
  md = mes.portees[0];
  mg = mes.portees[1]; 
  // console.log("Main droite de mesure six : ", md);
  expect(md.attrs.staffNum).toBe(1);
  expect(mg.attrs.staffNum).toBe(2);
  expect(md.voices).toBeArray();
  // console.log("Première voices de la main droite", md.voices[0]);
  // La première voices de la main droite contient 3 mib d'octave
  // 5 en blanche
  v1_md = md.voices[0];
  // Les trois notes sont identiques
  for (n1 of v1_md) {
    expect(n1.type).toBe('note');
    expect(n1.note).toBe('e');
    expect(n1.octave).toBe(5);
    expect(n1.duree).toBe(2);
    expect(n1.alteration).toBe('f');
  }
  // La deuxième voix contient trois accords presque identiques.
  // Ils contiennent les trois les notes solb dob en arpège et le
  // premier contient en plus la note mib
  v2_md = md.voices[1];
  // console.log("Deuxième voix de la main droite : ", v2_md); 
  for (n1 of v2_md) {
    expect(n1).toContainAllKeys(['type', 'id', 'duree', 'ppq', 'notes', 'objets']);
    expect(n1.type).toBe('chord');
    expect(n1.duree).toBe(2);
    // console.log("Notes de l'accord", n1.notes);
    expect(n1.notes.length).toBeWithin(2, 4); 
    // Les notes ne doivent pas avoir de durée
    for (n2 of n1.notes) {
      expect(n2.duree).toBeUndefined();
      expect(n2.ppq).toBeUndefined();
    }
    console.log("Objets de l'accord", n1.objets); // doit contenir l'arpège

  }
  // Dans l'accord (ou la mesure), on doit aussi trouver l'arpègiation
  // TODO

  // La mesure 8 pour les ornements et le changement de clé
  const mhuit = mesures[8];
  md = mes.portees[0];
  mg = mes.portees[1]; 
 
});
