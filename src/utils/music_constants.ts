
export type ChordFunction = 
  'Tonique' | 'Tonique majorisée' | 'Tonique dominantisée' | 'Tonique minorisée'
  | 'Sus-Tonique' | 'Mediante' | 'Sous-Dominante' 
  | 'Dominante' | 'DominanteSus4' | 'Sus-Dominante' | 'Sous-Tonique' 
  | 'Dom-de-Dom' | '7e-dim-de-sensible' | '7e-de-sensible-de-dom'
  | 'Napolitaine' | 'Sixte-aug-italienne' | 'Sixte-aug-francaise' | 'Sixte-aug-allemande';

  export const CHORD_FUNCTIONS = {
    Tonique: 'Tonique' as ChordFunction,
    ToniqueMin: 'Tonique minorisée' as ChordFunction,
    ToniqueMaj: 'Tonique majorisée' as ChordFunction,
    Tonique7: 'Tonique dominantisée' as ChordFunction,
    SusTonique: 'Sus-Tonique' as ChordFunction,
    Mediante: 'Mediante' as ChordFunction,
    SousDominante: 'Sous-Dominante' as ChordFunction,
    SubDominante: 'Sous-Dominante' as ChordFunction,
    Dominante: 'Dominante' as ChordFunction,
    DominanteSus4: 'DominanteSus4' as ChordFunction,
    SusDominante: 'Sus-Dominante' as ChordFunction,
    SousTonique: 'Sous-Tonique' as ChordFunction,
    SubTonique: 'Sous-Tonique' as ChordFunction,
    // Autres fonctions
    DomDeDom: 'Dom-de-Dom' as ChordFunction,
    SeptDimDeSensible: '7e-dim-de-sensible' as ChordFunction,
    SeptDeSensibleDeDom: '7e-de-sensible-de-dom' as ChordFunction,
    Napolitaine: 'Napolitaine' as ChordFunction,
    SixteAugAllemande: 'Sixte-aug-allemande' as ChordFunction,
    SixteAugItalienne: 'Sixte-aug-italienne' as ChordFunction,
    SixteAugFrancaise: 'Sixte-aug-francaise' as ChordFunction
  }
 

export const ALTER_STR_TO_ALTER_NB = {
  'f': -1, 's': 1,
  'b': -1, 'd': 1, 'bb': -2, 'dd': 2,
  'es': -1, 'is': 1, 'eses': -2, 'isis': 2
}


/**
 * Liste de la correspondance entre les attributs qu'on peut trouver
 * dans le fichier MEI, pour tous les objets, avec leur propriété 
 * correspondante dans l'application.
 * 
 * Cette table doit donc contenir TOUS les attributs qu'on peut
 * trouver.
 */
export const MEI_ATTRS_TO_KEYS = {
  'pname': 'note',
  'oct': 'octave',
  'dur': 'duree',
  'dots': 'points', // pour durée pointée
  'accid.ges': 'alteration',
  'dur.ppq': 'ppq',
  'place': 'place',
  'artic': 'articulation',
  'ploc': 'pitch', // position de silence
  'oloc': 'octave', // idem
  'shape': 'key', // Clé pour changement de clé
  'line': 'line', // idem
}