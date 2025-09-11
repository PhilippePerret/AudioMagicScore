import { test, expect } from "bun:test";
import { ScorePageParser } from "../../classes/ScoreParser";
import { MEIAnyObjet } from "../../classes/Objet";

/**
 * Pour vérifier qu'une note est bien celle qu'on croit.
 * 
 *  expectNote(<note MEI>, [pitch, altération, octave, durée])
 */
type SimplifiedNote = [
  pitch: string, alter: string, octave: number, duree: number
];
function expectNote(
  note: MEIAnyObjet, 
  [pitch, alter, octave, duree]: SimplifiedNote
){
  expect(note.type).toBe('note');
  expect(note.note).toBe(pitch);
  expect(note.alteration).toBe(alter);
  expect(note.duree).toBe(duree);
  expect(note.octave).toBe(octave);
}

// Renvoie une instance ScorePageParser
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
  type AO = MEIAnyObjet[];
  let mes: any, md: any, mg: any;
  let v1_md: AO, v2_md: AO, v1_mg: AO, v2_mg: AO;
  let n1: any, n2: any, n3: any;
  let a1: MEIAnyObjet, a2: MEIAnyObjet, a3: MEIAnyObjet; // pour les accord, p.e.
  
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
  for (n1 of v1_md) { expectNote(n1, ['e', 'f', 5, 2]); }
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
  }
  // Dans l'accord (ou la mesure), on doit aussi trouver l'arpègiation
  // TODO

  // La mesure 8 pour les ornements, le beam et le changement de clé
  mes = mesures[7];
  md = mes.portees[0];
  mg = mes.portees[1]; 

  // Première voix de la MD
  v1_md = md.voices[0];
  // console.log("voix 1 MD", v1_md);
  // Les premières notes doivent être "dé-beamées"
  expectNote(v1_md[0], ['c', 'f', 5, 4]);
  expect(v1_md[0].points).toBe(1)
  expectNote(v1_md[1], ['b', 'f', 4, 16]);
  expectNote(v1_md[2], ['a', 'f', 4, 16]);
  
  v1_mg = mg.voices[0];
  console.log("Voix 1 de main gauche", v1_mg);

  // Le premier accord a un objet associé
  a1 = v1_mg[0];
  expect(a1.objets.length).toBe(1);
  expect(a1.objets[0].type).toBe('arpeg')

  // Le deuxième objet doit être un changement de clé
  // (non, bizarrement, c'est le troisième, le changement de clé est
  //  inséré entre le premier silence et le deuxième)
  a2 = v1_mg[2];
  console.log("Deuxime objet", a2);
  expect(a2.type).toBe('clef');
  expect(a2.key).toBe('G');
  expect(a2.line).toBe(2);

  // Le (vrai) deuxième objet est un silence, comme le quatrième
  a2 = v1_mg[1];
  a3 = v1_mg[3];
  for( var r of [a2, a3]){
    expect(r.type).toBe('rest');
    expect(r.pitch).toBe('d');
    expect(r.octave).toBe(3);
  }
  expect(a2.duree).toBe(4);
  expect(a3.duree).toBe(8);

});
