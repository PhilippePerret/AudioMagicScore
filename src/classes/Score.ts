import { existsSync, readFileSync } from "fs";
import { XMLParser } from "fast-xml-parser";
const FastXmlParserOptions = {
  ignoreAttributes: false,           // ESSENTIEL pour MEI
  attributeNamePrefix: '@_',         // Préfixe pour les attributs
  parseAttributeValue: true,         // Parse les valeurs (oct="4" → number 4)
  trimValues: true,
  parseTrueNumberOnly: true,         // "4" → 4, mais "4a" → "4a"
  // ignoreNameSpace: false,            // Important pour xml:id
  ignoreNameSpace: true,            // n'a plus les xml:id
  allowBooleanAttributes: true
}
import { MeasureType } from "./Measure";
import { Piece } from "./Piece";
import { throwError } from "../utils/message";
import { ALL } from "dns";
import { ALTER_STR_TO_ALTER_NB } from "../utils/music_constants";


type CleType = 'G' | 'F' | 'C' ; // clé de la portée
type LineType = 1 | 2 | 3 | 4 | 5 ; // Ligne de la clé (3, pour UT3 p.e.)
type alterType = 0 | 1 | -1; // pour rien | # | b
type alterCountType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
type meterCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 12 | 16 | 32;
type meterUnit = 1 | 2 | 4 | 8 | 16 | 32;

interface ScoreMetadataType {
  label: string;
}
interface StaffType {
  clef: [CleType, LineType];
  armure: [alterType, alterCountType]; // armature [<altération>, <nombre>] (MEI: keySign)
  metrique: [meterCount, meterUnit]; // metrique (MEI: meterSig)
}

interface ScoreType {
  staffs: StaffType[];
}

/**
 * Les chemins XML à utiliser pour trouver les informations.
 */
const xmlPaths = {
  base: 'mei.music.body.mdiv.score',
  staffs: 'scoreDef.staffGrp.staffGrp', // attention, je pense qu'il peut y avoir plusieurs "staffgrp", le premier staffGrp doit signifie 'staffGroups' (noter le "s") et le second 'staffGroup' (le groupe de staffs en question) 
  staff: {multi: true, in: 'staffs', tag: 'StaffDef'}, 
  clef: {in: 'staff', tag: 'clef'},
  armure: {in: 'staff', tag: 'keySig'},
  metrique: {in: 'staff', tag: 'meterSig'} 

}

export class Score implements ScoreType {
  piece: Piece;
  data: JSON;
  metadata: ScoreMetadataType;
  staffs: StaffType[];
  measures: MeasureType[];

  constructor(
    private path: string
  ) { }

  parse() {
    existsSync(this.path) || throwError('mei-file-unfound', [this.path]); 
    const xmlData = readFileSync(this.path, "utf-8");
    this.data = this.parseXMLData(xmlData);
  }

  private _staffsgrps;
  private get staffsGroup() {
    return this._staffsgrps || (this._staffsgrps = this.searchXML(xmlPaths.staffs));
  }
  /**
   * Relève les données générales du score
   */
  parseScoreMetadata(){
    const staffsGroup = this.staffsGroup;
    this.metadata = {
      label: staffsGroup.label['#text']
    };

  }
  /**
   * Relève les données générales des portées (clé, armure, métrique)
   */
  parseStaffsData() {
    const staffsDef = this.staffsGroup['staffDef'];
    this.staffs = [];
    staffsDef.forEach((sdef: any) => {
      const arm: any = sdef.keySig['@_sig'] ; // p.e. '6f' pour 6 bémols
      let [nombre, alteration] = arm.split('');
      nombre = Number(nombre);
      alteration = ALTER_STR_TO_ALTER_NB[alteration]; // => 1 ou -1
      let metrique: any = sdef.meterSig;
      let count = Number(metrique['@_count']) as meterCount;
      let unit = Number(metrique['@_unit']) as meterUnit;
      const staff: StaffType = {
        clef: [sdef.clef['@_shape'], sdef.clef['@_line'] ],
        armure: [alteration, nombre],
        metrique: [count, unit],
      };
      this.staffs.push(staff);
    });
  }

  searchXML(path: string){
    if (!path.startsWith('mei')) { path = xmlPaths.base + '.' + path; }
    let currentObject = this.data;
    path.split('.').forEach(name => {
      currentObject = currentObject[name];
    })
    return currentObject;
  }
  parseXMLData(xmlData: string): JSON  {
    const parser = new XMLParser(FastXmlParserOptions);
    const parsedData = parser.parse(xmlData);
    return parsedData;
  }
}