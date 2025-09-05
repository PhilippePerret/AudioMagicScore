import { DUREE, NoteType } from "../classes/Note"

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
  chromaticNumber: 4,
  alteration:0 
}

const si: NoteType = {
    rnote: 'b',
    note: 'b',
    duree: DUREE.noire,
    octave: 4,
    relDegree: 7,
    absDegree: 7,
    chromaticNumber: 11,
    alteration: 0
}
export const NOTES = {
  c: ut, do: ut, ut: ut,
  e: mi, mi: mi,
  eb: mib, mib: mib, eis: mib,
  b: si, si: si
}