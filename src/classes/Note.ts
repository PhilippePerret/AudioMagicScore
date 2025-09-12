import { Chord } from "./Chord";
import { MeasureType } from "./Measure";
import { Slice } from "./Slice";

/**
 * Type NoteType
 * 
 * Pour une note quelconque de la pièce
 */
type SimpleNote = 'a'|'b'|'c'|'d'|'e'|'f'|'g';
type RealNote = `${SimpleNote}${''|'es'|'is'|'eses'|'isis'}`;
export type DureeType = number;
type ChromaticNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface NoteType {
  rnote: RealNote;  // p.e. 'eisis'
  note: SimpleNote; // seulement la lettre de la note, p.e. 'e'
  alteration: 0 | 1 | -1 | 2 | -2;
  octave: -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  duree: DureeType; // Durée totale dans la tranche 
  relDegree: number;
  absDegree?: number;
  chromaticNumber: ChromaticNumber; 
}

/**
 * Ce type sert à gérer les notes de façon absolue dans l'analyse de
 * l'harmonie. Pour cette analyse, on se fiche de connaitre l'octave
 */
export interface AbsNoteType {
  rnote: RealNote;
  note: SimpleNote;
  alteration: 0 | 1 | -1 | 2 | -2;
  duree: DureeType;
  relDegree: number;
  absDegree: number;
  chromaticNumber: ChromaticNumber;
  occurrence: number; // nombre de citation dans la tranche
  isLower: boolean; // true si c'est la note la plus basse de la tranche
}

// Pour la tonalité, version simple [<note>, <altération>] ou TuneType
export type SimpleTune = `${SimpleNote}${'b'|'d'|''}${'' | 'm'}`;
export type Tune = [SimpleNote, 'b' | 'd' | '', 'min' | 'maj'];
export interface TuneType {
  note: SimpleNote;
  alte: 'b' | 'd' | '' ;
  nature: 'maj' | 'min';
}

export interface ContextType {
  tune: SimpleTune | Tune | TuneType;
  periode?: 'classique' | 'romantique' | 'baroque' | 'moderne' | undefined;
  portion?: 'first_measures' | 'last_measures' | 'developpement' | undefined;
  previous_chord?: Chord;
  next_chord?: Chord;
  measure?: MeasureType;
  slice?: Slice; 
}

export const DUREE = {
  ronde: 128, ronde_pointee: 128+64,
  blanche: 64, blanche_pointee: 64+32,
  noire: 32, noire_pointee: 32+16, noire_ternaire: 32 * 2/3,
  croche: 16, croche_pointee: 16+8, croche_ternaire: 16 * 2/3,
  db_croche: 8, db_croche_pointee: 8+4, db_croche_ternaire: 8 * 2.3,
  tr_croche: 4, tr_croche_pointee: 4+2, tr_croche_ternaire: 4 * 2.3,
  qu_croche: 2, qu_croche_pointee: 2+1, qu_croche_ternaire: 2 * 2/3,
  mini: 1
}

// Note : ci-dessous, le 'implements NoteType' permet juste de
// s'assurer que Note possèdera bien toutes les propriétés de
// l'interface NoteType définie ci-dessus.
export class Note implements NoteType {
  rnote: RealNote;
  note: SimpleNote;
  alteration: 0 | 1 | -1 | 2 | -2;
  octave: 0 | 1 | -1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  duree: DureeType;
  relDegree: number;
  absDegree?: number;
  chromaticNumber: ChromaticNumber;

  constructor(
    data: NoteType, 
    context: ContextType 
  ) {
    for(var prop in data) { this[prop] = data[prop];}
  }
  
  static readonly DIST4INTERV = {
    // La clé représente l'intervalle simple (seconde, tierce
    // quarte, etc.) et la valeur le nombre de demi-tons qu'il
    // faut pour atteindre l'intervale juste/majeur ou naturel
    // Par exemple, 2:2 signifie "pour la seconde, il faut monter de
    // 2 demi-tons pour l'atteindre"
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