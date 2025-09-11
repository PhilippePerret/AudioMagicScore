


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