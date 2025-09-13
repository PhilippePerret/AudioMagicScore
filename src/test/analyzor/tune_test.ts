import { test, expect } from "bun:test";
import { Tune } from "../../classes/Tune";


test("Tune sait construire les gammes majeures et mineures", () => {
  let tune = new Tune('c');
  expect(tune.getNotes()).toEqual(['c','d','e','f','g','a','b']);
  tune = new Tune('em');
  expect(tune.getNotes()).toEqual(['e','fd','g','a','b','c','dd',]);
  tune = new Tune('cb');
  expect(tune.getNotes()).toEqual(['cb','db','eb','fb','gb','ab','bb']);
  tune = new Tune('eb');
  expect(tune.getNotes()).toEqual(['eb','f','g','ab','bb','c','d']);
  tune = new Tune('gdm');
  expect(tune.getNotes()).toEqual(['gd','ad','b','cd','dd','e','fdd']);
  tune = new Tune('dm');
  expect(tune.getNotes()).toEqual(['d','e','f','g','a','bb','cd']);
})

test.only("Tune sais déterminer tous les accords d'une tonalité quelconque", () => { 
  let tune: Tune;
  let chords: Map<any, any>;

  tune = new Tune('c');
  expect(typeof tune.getChords).toBe('function'); // seulement fonction de débug
  chords = tune.getChords();

  [
    // accord,          fonction      Chiffrage    Nom
    [['c','e','g']    , 'tonique'         , 'I'   , 'C'],
    [['c','e','g','b'], 'tonique'         , 'I7M' , 'C7M'],
    [['d','f','a']    , 'sus-tonique'     , 'II'  , 'Dm'],
    [['d','f','a','c'], 'sus-tonique'     , 'II7' , 'Dm7'],
    [['e','g','b']    , 'mediante'         , 'III' , 'Em'],
    [['f','a','c']    , 'sous-dominante'  , 'IV'  , 'F'],
    [['f','a','c','e'], 'sous-dominante'  , 'IV7M', 'F7M'],
    [['g','b','d']    , 'dominante'       , 'V'   , 'G'],
    [['g','b','d','f'], 'dominante'       , 'V7'  , 'G7'],
    [['g','c','d','f'], 'dominante-sus4'  , 'V7+4', 'G7+4'],
    [['a','c','e']    , 'sus-dominante'   , 'VI'  , 'Am'],
    [['b','d','f']    , 'sous-tonique'    , 'VII' , 'B5-'],
    [['b','d','f','a'], 'sous-tonique'    , 'VIIo/','Bo/'],
    // Accords hors harmonisation
    [['d','fd','a']     , 'dom-de-dom'      , 'V/V'   , 'D'],
    [['d','fd','a','c'] , 'dom-de-dom'      , 'V7/V'  , 'D7'],
    [['fd','a','c','eb'], '7e-de-sensible-de-dom', 'VIIo/V', 'Fdo'],
    [['b','d','f','ab'] , '7e-dim-de-sensible', 'VIIo', 'Bo'],
    [['db','f','ab'], 'napolitaine', 'N', 'Db'],
    [['ab','c','eb','fd'], 'sixte-aug-allemande', 'VI+', 'Ab6+'],
    [['ab','c','d','fd'], 'sixte-aug-francaise', 'VI+', 'DM75-'],
    [['ab','c','fd'], 'sixte-aug-italienne', 'VI+', 'Ab6+'],
  ].forEach(([chord, fonction, chiffre, nom]: [any, string, string, string]) => {
    chord = chord.join('-');
    console.log("Test de l'accord (%s) : ", fonction, chord);
    // console.log("Dans chords", chords.get(chord));
    expect(chords.has(chord)).toBeTrue();
    expect(chords.get(chord).get('function')).toBe(fonction);
    expect(chords.get(chord).get('chiffre')).toBe(chiffre);
    expect(chords.get(chord).get('name')).toBe(nom);
    console.log("Chord %s OK", chord);
  });

  // Tonalité mineure avec altération
  tune = new Tune('gdm');
  chords = tune.getChords();
  [
    [['gd','b','dd'], 'tonique', 'I', 'Gdm'],
    [['gd','b','dd','fdd'], 'tonique', 'I7M', 'Gdm7M'],
    [['ad','cd','e'], 'sus-tonique', 'II', 'Ad5-'],
    [['ad','cd','e','gd'], 'sus-tonique', 'IIo/', 'Ado/'],
    [['b','dd','fdd'], 'mediante', 'III', 'B5+'],
    [['cd','e','gd'], 'sous-dominante', 'IV', 'Cdm'],
    [['cd','e','gd','b'], 'sous-dominante', 'IV7', 'Cdm7'],
    [['dd','fdd','ad'], 'dominante', 'V', 'Dd'],
    [['dd','fdd','ad','cd'], 'dominante', 'V7', 'Dd7'],
    [['e','gd','b'], 'sus-dominante', 'VI', 'E'],
    [['e','gd','b','dd'], 'sus-dominante', 'VI7M', 'E7M'],
    [['fdd','ad','cd'], 'sous-tonique', 'VII', 'Fdd5-'],
    [['fdd','ad','cd','e'], 'sous-tonique', 'VIIo', 'Fddo'],
    // Accord hors tonalité
    // [['ad','cdd','ed'], 'dom-de-dom', 'V/V', 'Ad'],
    // [['ad','cdd','ed','gd'], 'dom-de-dom', 'V7/V', 'Ad7'],
    [['cdd','ed','gd','b'], '7e-de-sensible-de-dom', 'VIIo/V', 'Cddo'],
    [['a','cd','e'], 'napolitaine', 'N', 'A'],
    [['e','gd','b','cdd'], 'sixte-aug-allemande', 'VI+', 'E6+'],
    [['e','gd','ad','cdd'], 'sixte-aug-francaise', 'VI+', 'AdM75-'],
    [['e','gd','cdd'], 'sixte-aug-italienne', 'VI+', 'E6+'],
  ].forEach(([notes, fonction, chiffre, nom]: [any, string, string, string]) => {
    const kchord = notes.join('-');
    console.log("Test de l'accord : ", kchord);
    if ( ! chords.has(kchord)){
      console.error("Clé inconnue %s dans", kchord, chords.keys() );
    }
    console.log("Dans chords", chords.get(kchord));
    expect(chords.has(kchord)).toBeTrue();
    const chord = chords.get(kchord);
    expect(chord.get('function')).toBe(fonction);
    expect(chord.get('chiffre')).toBe(chiffre);
    expect(chord.get('name')).toBe(nom);
    console.log("Chord %s OK", kchord);
 
  })
})

test("Tune sais donner le chiffrage exact en fonction du renversement", () => {
  
})

test("Tune sais déterminer le relatif", () => {

})