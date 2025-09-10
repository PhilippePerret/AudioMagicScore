import { MEIMesureType } from "./Measure";
import { ScoreMetadataType, ScoreType } from "./ScoreParser";

export class Score implements ScoreType {
  metadata: ScoreMetadataType;
  measures: MEIMesureType[];

}