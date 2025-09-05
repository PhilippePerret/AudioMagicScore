export interface NoteType {
  rnote: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'r';
  relDegree: number;
  absDegree: number;
  chromaticNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  alteration: 0 | 1 | -1 | 2 | -2;
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