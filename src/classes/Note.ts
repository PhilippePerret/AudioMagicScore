/**
 * Type NoteType
 * 
 * Pour une note quelconque de la pièce
 */
type SimpleNote = 'a'|'b'|'c'|'d'|'e'|'f'|'g';
type RealNote = `${SimpleNote}${''|'es'|'is'|'eses'|'isis'}`;

export interface NoteType {
  rnote: RealNote;  // p.e. 'eisis'
  note: SimpleNote; // seulement la lettre de la note, p.e. 'e'
  alteration: 0 | 1 | -1 | 2 | -2;
  octave: -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  duree: number | 1 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 3 /*1.*/ | 6 /*2.*/ | 12 /*4.*/ ;
  relDegree: number;
  absDegree?: number;
  chromaticNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}

export const DUREE = {
  ronde: 1, ronde_pointee: 1+2,
  blanche: 2, blanche_pointee: 2+4,
  noire: 4, noire_pointee: 4+8, noire_ternaire: 4.3,
  croche: 8, croche_pointee: 8+16, croche_ternaire: 8.3,
  db_croche: 16, db_croche_pointee: 16 + 32, db_croche_ternaire: 16.3,
  tr_croche: 32, tr_croche_pointee: 32 + 64, tr_croche_ternaire: 32.3,
  qu_croche: 64, qu_croche_pointee: 64+128, qu_croche_ternaire: 64.3
}
export class Note {
  static readonly DIST4INTERV = {
    2: 2, // <= seconde juste = 2 1/2 tons
    3: 4, // <= tierce majeur = 4 demi-tons
    4: 5, // <= quarte juste = 5 demi-tons
    5: 7, // <= quinte juste = 7 demi-tons
    6: 9, // <= sixte majeure = 9 demi-tons
    7: 10,// <= septième mineure (!) = 10 demi-tons
    0: 0, // <= unisson/octave = 0 demi-tons
  }
  // @return la distance en demi-ton, pour un intervalle donné
  // exprimé en nombre (tierce = 3) le nombre de demi-ton pour
  // obtenir l'intervalle par défaut (majeur ou juste, mineur
  // pour la 7e)
  static getIntervalJusteFor(interval: number): number {
    return this.DIST4INTERV[interval];
  }
}