import { DUREE, Note, NoteType } from "../classes/Note"

const noire = DUREE.noire;

const ut: NoteType = {
    rnote: 'c',
    note: 'c', 
    duree: noire,
    octave: 4,
    relDegree: 1,
    absDegree: 1,
    chromaticNumber: 1,
    alteration: 0
  } 
const dod: NoteType = {
  rnote: 'cis',
  note: 'c',
  alteration: 1,
  duree: noire,
  octave: 4,
  relDegree: 1,
  absDegree: 1,
  chromaticNumber: 2
}
const re: NoteType = {
  rnote: 'd',
  note: 'd',
  alteration: 0,
  duree: noire,
  octave: 4,
  relDegree: 2, 
  absDegree: 2,
  chromaticNumber: 3
}
const mib: NoteType = {
  rnote: 'ees',
  note: 'e', 
  alteration: -1,
  duree: noire,
  octave: 4,
  relDegree: 3,
  absDegree: 3,
  chromaticNumber: 4
}
const mi: NoteType = {
  rnote: 'e',
  note: 'e',
  duree: noire,
  octave: 4,
  relDegree: 3,
  absDegree: 3,
  chromaticNumber: 5,
  alteration:0 
}
const fa: NoteType = {
  rnote: 'f',
  note: 'f', 
  duree: noire,
  octave: 4,
  relDegree: 4,
  absDegree: 4,
  chromaticNumber: 6,
  alteration: 0
}
const fad: NoteType = {
  rnote: 'fis',
  note: 'f',
  duree: noire,
  octave: 4,
  relDegree: 4,
  absDegree: 4,
  chromaticNumber: 7,
  alteration: 1
}
const solb: NoteType = {
  rnote: 'ges',
  note: 'g',
  duree: noire,
  octave: 4,
  relDegree: 5,
  absDegree: 5,
  chromaticNumber: 7,
  alteration: -1
}
const sol: NoteType = {
  rnote: 'g',
  note: 'g', 
  duree: noire,
  octave: 4,
  relDegree: 5,
  absDegree: 5,
  chromaticNumber: 8,
  alteration: 0
}
const sold: NoteType = {
  rnote: 'gis',
  note: 'g',
  duree: noire,
  octave: 4,
  relDegree: 5,
  absDegree: 5,
  chromaticNumber: 9,
  alteration: 1
}
const lab: NoteType = {
  rnote: 'aes',
  note: 'a',
  duree: noire,
  octave: 4,
  relDegree: 6,
  absDegree: 6,
  chromaticNumber: 9,
  alteration: -1
}
const la: NoteType = {
  rnote: 'a',
  note: 'a',
  duree: noire,
  octave: 4,
  relDegree: 6,
  absDegree: 6,
  chromaticNumber: 10,
  alteration: 0
}
const lad: NoteType = {
  rnote: 'ais',
  note: 'a',
  duree: noire,
  octave: 4,
  relDegree: 6,
  absDegree: 6,
  chromaticNumber: 11,
  alteration: 1
}
const sib: NoteType = {
  rnote: 'bes',
  note: 'b',
  duree: noire,
  octave: 4,
  relDegree: 7,
  absDegree: 7,
  chromaticNumber: 11,
  alteration: -1
}
const si: NoteType = {
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
  cd: dod, dod: dod, cis: dod,
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