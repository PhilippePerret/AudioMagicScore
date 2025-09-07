import { MeasureType } from "./Measure";
import { AbsNoteType } from "./Note";

export interface SliceType {
  measure: MeasureType;
  indice: number;
  notes: AbsNoteType[];
}

export class Slice implements SliceType {
  measure: MeasureType;
  indice: number;
  notes: AbsNoteType[];

  constructor(
    data: SliceType,
  ){
    for (let prop in data) { this[prop] = data[prop]; }
  }
}