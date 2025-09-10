import { Chord } from "./Chord";
import { Note } from "./Note";
import { Score } from "./Score";

interface SimpleMeasureType {
  notes: Note[] | Chord[]; // notes ou accords, dans l'ordre
}

export interface MeasureType {
  number: number;
  score: Score;
  // Une mesure correspond à une mesure sur toutes ses portées
  staffMap: Map<number, SimpleMeasureType[]>
}

export interface MEIAttributes {
  id: string;
  staffNum?: string;
  startId?: number;
  endId?: number;
  plist?: string;
}

export interface MEIPorteeType {
  voices: any[];
  attrs: any;
}

export interface MEIMesureType {
  numero: number;
  portees: MEIPorteeType[];
  assets: {type: 'tie' | 'slur' | 'arpeg' | 'mordent', attrs: MEIAttributes}[];
}



export class Measure implements MeasureType {
  number: number;
  score: Score;
  staffMap: Map<number, SimpleMeasureType[]>;


}