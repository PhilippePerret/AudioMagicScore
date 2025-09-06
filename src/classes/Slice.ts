import { MeasureType } from "./Measure";
import { Note } from "./Note";

export interface SliceType {
  measure: MeasureType;
  indice: number;
  notes: Note[];
}

export class Slice implements SliceType {
  measure: MeasureType;
  indice: number;
  notes: Note[];

  constructor(
    data: SliceType,
    params: {[x: string]: any}
  ){
    for (let prop in data) { this[prop] = data[prop]; }
  }
}