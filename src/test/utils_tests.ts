import { existsSync, unlinkSync } from "fs";
import { DUREE, Note, NoteType } from "../classes/Note"
import { join } from "path";

// Pour DUPliquer une note (NoteType) en fournissant d'autres valeurs
// si nécessaire.
export function dupN(note: NoteType, newVals: {[x: string]: any} ) {
  return Object.assign({...note}, newVals);
}

export function unlinkByIfExist(
  folder: string,
  names: string[]
){
  names.forEach(name => {
    const path = join(folder, name);
    if ( existsSync(path)) { unlinkSync(path); }
  });
}

export const db_croche = DUREE.db_croche;
export const croche = DUREE.croche;
export const noire = DUREE.noire;
export const blanche = DUREE.blanche;
export const ronde = DUREE.ronde;


export const ut: NoteType = {
    rnote: 'c',
    note: 'c', 
    duree: noire,
    octave: 4,
    relDegree: 1,
    absDegree: 1,
    chromaticNumber: 1,
    alteration: 0
  } 
export const utd: NoteType = {
  rnote: 'cis',
  note: 'c',
  alteration: 1,
  duree: noire,
  octave: 4,
  relDegree: 1,
  absDegree: 1,
  chromaticNumber: 2
}
export const re: NoteType = {
  rnote: 'd',
  note: 'd',
  alteration: 0,
  duree: noire,
  octave: 4,
  relDegree: 2, 
  absDegree: 2,
  chromaticNumber: 3
}
export const mib: NoteType = {
  rnote: 'ees',
  note: 'e', 
  alteration: -1,
  duree: noire,
  octave: 4,
  relDegree: 3,
  absDegree: 3,
  chromaticNumber: 4
}
export const mi: NoteType = {
  rnote: 'e',
  note: 'e',
  duree: noire,
  octave: 4,
  relDegree: 3,
  absDegree: 3,
  chromaticNumber: 5,
  alteration:0 
}
export const fa: NoteType = {
  rnote: 'f',
  note: 'f', 
  duree: noire,
  octave: 4,
  relDegree: 4,
  absDegree: 4,
  chromaticNumber: 6,
  alteration: 0
}
export const fad: NoteType = {
  rnote: 'fis',
  note: 'f',
  duree: noire,
  octave: 4,
  relDegree: 4,
  absDegree: 4,
  chromaticNumber: 7,
  alteration: 1
}
export const solb: NoteType = {
  rnote: 'ges',
  note: 'g',
  duree: noire,
  octave: 4,
  relDegree: 5,
  absDegree: 5,
  chromaticNumber: 7,
  alteration: -1
}
export const sol: NoteType = {
  rnote: 'g',
  note: 'g', 
  duree: noire,
  octave: 4,
  relDegree: 5,
  absDegree: 5,
  chromaticNumber: 8,
  alteration: 0
}
export const sold: NoteType = {
  rnote: 'gis',
  note: 'g',
  duree: noire,
  octave: 4,
  relDegree: 5,
  absDegree: 5,
  chromaticNumber: 9,
  alteration: 1
}
export const lab: NoteType = {
  rnote: 'aes',
  note: 'a',
  duree: noire,
  octave: 4,
  relDegree: 6,
  absDegree: 6,
  chromaticNumber: 9,
  alteration: -1
}
export const la: NoteType = {
  rnote: 'a',
  note: 'a',
  duree: noire,
  octave: 4,
  relDegree: 6,
  absDegree: 6,
  chromaticNumber: 10,
  alteration: 0
}
export const lad: NoteType = {
  rnote: 'ais',
  note: 'a',
  duree: noire,
  octave: 4,
  relDegree: 6,
  absDegree: 6,
  chromaticNumber: 11,
  alteration: 1
}
export const sib: NoteType = {
  rnote: 'bes',
  note: 'b',
  duree: noire,
  octave: 4,
  relDegree: 7,
  absDegree: 7,
  chromaticNumber: 11,
  alteration: -1
}
export const si: NoteType = {
    rnote: 'b',
    note: 'b',
    duree: DUREE.noire,
    octave: 4,
    relDegree: 7,
    absDegree: 7,
    chromaticNumber: 12,
    alteration: 0
}
export const NOTES = {
  c: ut, do: ut, ut: ut,
  cd: utd, utd: utd, cis: utd,
  d: re, re: re,
  eb: mib, mib: mib, eis: mib,
  e: mi, mi: mi,
  fa: fa, f: fa,
  fad: fad, fd: fad,
  solb: solb, gb: solb,
  sol: sol, g: sol,
  sold: sold, gd: sold, gis: sold,
  lab: lab, ab: lab, aes: lab,
  a: la, la: la,
  lad: lad, ad: lad, ais: lad,
  
  bb: sib, sib: sib,
  b: si, si: si
}

