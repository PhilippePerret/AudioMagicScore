import { existsSync, readFileSync } from "fs";
import { XMLParser } from "fast-xml-parser";

/*
* Pour obtenir un parsing utile, on doit le faire double:
* - un parsing va garder les objets dans l'ordre (les layer)
* - un parsing va les rassembler en objet (pour les atteindre plus facilement)
*/
// Version objets
const FastXmlParserOptions = {
  preserveOrder: false,                // Pour ne pas rassembler les éléments de même types
  ignoreAttributes: false,           // ESSENTIEL pour MEI
  attributeNamePrefix: '@',         // Préfixe pour les attributs
  parseAttributeValue: true,         // Parse les valeurs (oct="4" → number 4)
  trimValues: true,
  parseTrueNumberOnly: true,         // "4" → 4, mais "4a" → "4a"
  // ignoreNameSpace: false,            // Important pour xml:id
  ignoreNameSpace: true,            // n'a plus les xml:id
  allowBooleanAttributes: true
}
const FastXmlOrderedParserOptions = {
  preserveOrder: true,                // Pour ne pas rassembler les éléments de même types
  ignoreAttributes: false,           // ESSENTIEL pour MEI
  attributeNamePrefix: '@',         // Préfixe pour les attributs
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
  metadata: ScoreMetadataType;
  measures: MeasureType[];
}

/**
 * Les chemins XML à utiliser pour trouver les informations.
 */
const xmlPaths = {
  base: 'mei.music.body.mdiv.score',
  measures: {multi: true, in: 'section', tag: 'measure'},
  staffs: 'scoreDef.staffGrp.staffGrp', // attention, je pense qu'il peut y avoir plusieurs "staffgrp", le premier staffGrp doit signifie 'staffGroups' (noter le "s") et le second 'staffGroup' (le groupe de staffs en question) 
  staff: {multi: true, in: 'staffs', tag: 'StaffDef'}, 
  clef: {in: 'staff', tag: 'clef'},
  armure: {in: 'staff', tag: 'keySig'},
  metrique: {in: 'staff', tag: 'meterSig'} 

}

export class Score implements ScoreType {
  piece: Piece;
  data: JSON;       // les data XML, en préservant les objets
  orderData: JSON; // les data XML, en préservant l'ordre
  metadata: ScoreMetadataType;
  staffs: StaffType[];
  measures: MeasureType[];

  constructor(
    private path: string
  ) { }

  parse() {
    existsSync(this.path) || throwError('mei-file-unfound', [this.path]); 
    const xmlData = readFileSync(this.path, "utf-8");
    this.parseXMLData(xmlData);
    this.parseScoreMetadata();
    this.parseStaffsData();
  }

  private _staffsgrps;
  private get staffsGroup() {
    return this._staffsgrps || (this._staffsgrps = this.searchXML(xmlPaths.staffs));
  }


  /**
   * RELÈVE et DISPATCH DES NOTES
   * 
   * C'est le gros morceau du parsing.
   * 
   */
  parseMeasures(){
    // console.log('Mesures:', this.searchXML('section').measure); 
    this.searchXML('section')['measure'].forEach((measure: {[x: string]: any}, i: number) => {
      /**
       * Une <measure> contient beaucoup d'éléments différents, dont
       * - staff (array) liste des notes par portée
       * - slur  (Object)
       * - tie   (Object) 
       * - mordent (Object) les mordants {staff: <numéro portée>, place: <above|below>, form: <upper|...>}
       * - arpeg (Object) {plist: ?}
       */
      console.log("Mesure %i", i, measure);

      // On répète pour chaque portée
      measure.staff.forEach(staff => {
        console.log("Portée", staff);
        // staff['@_n'] pour le numéro de la portée
        // staff['@_xml:id'] pour l'identifiant de la portée dans la mesure
        // staff.layer
        //    Une voix sur la portée. Plusieurs layers s'il y a plusieurs
        //    voix. Note : un layer, logiquement, remplit toute la mesure.
        // staff['layer'] Soit un seul objet (peut définir par exemple {chord: [...notes...]})
        //                Soit une liste (array) d'objets qui peuvent définir :
        //    :beam, :rest, :note, :space
        //    TODO Voir ce que chaque élément peut contenir
        /*
        * Pour chaque measure, c'est dans staff.layer que sont définies, 
        * dans l'ordre, toutes les choses, c'est-à-dire des :
        *   - <note>
        *     props : @dur, @oct, @pname (pitch name) @accid.ges (f, s)
        *     peuvent contenir une <artic> (articulation)
        *       <artic> @artic (le type, pe 'stacc') et @place (la position, above, below)
        *     peuvent contenir une <accid> (accident) dans propriété @accid (f, s) (peut-être pour les notes enharmoniques ? comme fab ?)
        *   - <chord> qui contiennent des : 
        *       • <note>
        *       • <artic> (articulation)  
        *     Properties @dur (la durée)
        *   - <beam> qui contient des <note> attachées
        *   - <rest>
        *     @dur (durée) @ploc (pitch location, une note) @oloc (octave location)
        *   - <clef> Des changements de clé (@shape et @line)
         */
        console.log("staff", staff);
        staff["layer"].forEach((layer, ilayer) => {
          Object.entries(layer).forEach(([tagname, content]: [string, any]) => {
            console.log("tagname '%s' content:", tagname, content);
          });
        });
      });

      throw new Error("Pour s'arrêter là.")

    });
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
  parseXMLData(xmlData: string): void {
    this.data = (new XMLParser(FastXmlParserOptions)).parse(xmlData);
    this.orderData = (new XMLParser(FastXmlOrderedParserOptions)).parse(xmlData);
  }
}

// LE PROBLÈME QUI SE POSE MAINTENANT EST DE POUVOIR RÉCUPÉRER LES LAYERS
// QUI DOIVENT ÊTRE PRIS DANS orderData POUR CONSERVER LES ÉLÉMENTS DANS
// L'ORDER MAIS JE NE SAIS PAS COMMENT LES RETROUVER. JE FAIS UN DOUBLE
// PARSING (ORDONNÉ ET PAS ORDONNÉ) MAIS JE NE SAIS PAS SI JE NE VAIS PAS
// ME RETROUVER À DEVOIR FAIRE UNE RECHERCHE SUR LES DONNÉES ORDONNÉES,
// BEAUCOUP PLUS DIFFICILE À GÉRER, VISIBLEMENT.
// PEUT-ÊTRE PASSER PAR LES ID ? EN FAISANT UNE TABLE DES LAYERS PAR ID,
// ET SEULEMENT DES LAYERS, CAR JE PENSE QUE CE SONT LES SEULS OBJETS
// À POSER CE PROBLÈME