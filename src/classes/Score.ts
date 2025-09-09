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
  attributeNamePrefix: '@_',         // Préfixe pour les attributs
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
  attributeNamePrefix: '@_',         // Préfixe pour les attributs
  parseAttributeValue: true,         // Parse les valeurs (oct="4" → number 4)
  trimValues: true,
  parseTrueNumberOnly: true,         // "4" → 4, mais "4a" → "4a"
  // ignoreNameSpace: false,            // Important pour xml:id
  ignoreNameSpace: true,            // n'a plus les xml:id
  allowBooleanAttributes: true
}

import { MeasureType, MEIAttributes, MEIMesureType } from "./Measure";
import { Piece } from "./Piece";
import { throwError } from "../utils/message";
import { ALTER_STR_TO_ALTER_NB } from "../utils/music_constants";

type CleType = 'G' | 'F' | 'C' ; // clé de la portée
type LineType = 1 | 2 | 3 | 4 | 5 ; // Ligne de la clé (3, pour UT3 p.e.)
type alterType = 0 | 1 | -1; // pour rien | # | b
type alterCountType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
type meterCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 12 | 16 | 32;
type meterUnit = 1 | 2 | 4 | 8 | 16 | 32;

interface ScoreMetadataType {
  label: string;
  staffs: StaffType[];
}
interface StaffType {
  clef: [CleType, LineType];
  armure: [alterType, alterCountType]; // armature [<altération>, <nombre>] (MEI: keySign)
  metrique: [meterCount, meterUnit]; // metrique (MEI: meterSig)
}

interface ScoreType {
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
  measures: MeasureType[];

  constructor(
    private path: string
  ) { }
  
  /**
   * Traitement complet du fichier de chemin this.path
   */
  treate() {
    this.parse();
    this.retrieveMetadata();
    this.parseStaffsData();
  }

  /**
   * PARSING du fichier MEI
   * 
   * Pour pouvoir travailler correctement avec les limitations de 
   * fast-xml-parser, on fait deux relèves : 
   * -  une de la section 'scoreDef' (par objet) qui permettra de 
   *    relever toutes les informations générales
   * -  une de la section 'section' (par liste) qui permettra de
   *    gérer la liste des measures, des notes, etc.
   */
  parse() {
    existsSync(this.path) || throwError('mei-file-unfound', [this.path]); 
    const xmlData = readFileSync(this.path, "utf-8");
    this.parseXMLScoreDef(xmlData);
    this.parseXMLMeasures(xmlData);
 }

  scoreDefData: JSON;
  measuresData: JSON;
  /**
   * On parse le bloc XML de définition du score
   * 
   * @param xml Bloc de code total
   */
  parseXMLScoreDef(xml: string): void {
    const blocScoreDef = this.readRawCode(xml, 'scoreDef');
    console.log("bloc scoredef", blocScoreDef);
    this.scoreDefData = (new XMLParser(FastXmlParserOptions)).parse(blocScoreDef);
  }

  /**
   * Parse du bloc XML définition les mesures (section)
   * 
   * @param xml Bloc de code XML complet
   */
  parseXMLMeasures(xml: string): void {
    const blocSection = this.readRawCode(xml, 'section');
    this.measuresData = (new XMLParser(FastXmlOrderedParserOptions)).parse(blocSection);
    this.measuresData = this.measuresData[0];
  }
  
  readRawCode(xml: string, tagname: string){
    const strIn = xml.indexOf('<' + tagname + ' ');
    const tagFin = '</' + tagname + '>';
    const strOut = xml.indexOf(tagFin) + tagFin.length;
    return xml.substring(strIn, strOut);
  }

  private _staffsgrps;
  private get staffsGroup() {
    return this._staffsgrps || (this._staffsgrps = this.searchXML(xmlPaths.staffs));
  }


  /**
   * RELÈVE et DISPATCH DES NOTES
   * 
   * C'est le gros morceau du parsing.
   * Il prend le bloc <section> du fichier XML et en tire toutes les
   * notes, les accords, les silences et autres signes utiles, 
   * - pour chaque mesure
   * - pour chaque portée (staff) de chaque mesure
   * Il retourne un objet fonctionnant pareil avec : 
   * 
   * mesures: [
   *    // Liste des mesures
   *    {mesure 1},
   *    {mesure 2},
   *    {mesure 3}
   * ]
   * 
   * Ou chaque objet mesure contient :
   *    // Par exemple {mesure 1}
   *    = {
   *      portees: [
   *        {éléments de portée 1 — MD par exemple pour du piano},
   *        {éléments de portée 2 — MG par exemple pour du piano},
   *        {...},
   *        {élément de portée N}
   *      ]
   *    }
   */
  retrieveMeasures(): MEIMesureType[] {
    console.log("this.measureData", this.measuresData);
    const mesures = []; // on le mettra peut-être en 'this.mesures'
    this.measuresData['section'].forEach((dmesure, iMeasure: number) => {
      // Si ce n'est pas une mesure, on passe à la suivante
      if (!dmesure.measure) { 
        console.log("Pas une mesure :", dmesure);
        return; 
      } 
      // console.log("Une mesure : ", dmesure);
      const mesure: MEIMesureType = { // la mesure à conserver
        numero: dmesure[':@']['@_n'],
        portees: [],
        assets: []
      };
      mesures.push(mesure); // on l'ajoute (comme référence) la liste

      // On peut analyser cette mesure
      const measure = dmesure.measure;
      measure.forEach((content: {[x: string]: any}) => {
        console.log("[Measure #%i", iMeasure, content);
        const tagName = Object.keys(content)[0];
        const attrs = content[':@'];
        const id: string = attrs['@_xml:id'];
        const params: MEIAttributes = {id: id};
        // Attributs optionnels (mais qu'on rencontre souvent)
        let staffNum: number | undefined = attrs['@_n'];
        if ( staffNum ) { Object.assign(params, {staffNum}); };
        let startId: string | undefined = attrs['@_startid'];
        if ( startId) { Object.assign(params, {startId});}
        let endId: string | undefined = attrs['@_endid'];
        if (endId) { Object.assign(params, {endId});}

        switch(tagName) {
          case 'staff': // une portée, ses notes
            const voix = this.retrieveLayerInStaff(content['staff']);
            mesure.portees.push({voix: voix, attrs: params});
            break;
          case 'tie': // une hampe ? une liaison ?
            mesure.assets.push({type: 'tie', attrs: params});
            break;
          case 'slur': // une slur
            mesure.assets.push({type: 'slur', attrs: params});
            break;
          case 'arpeg': // un arpège
            Object.assign(params, {plist: attrs['@_plist']});
            mesure.assets.push({type: 'arpeg', attrs: params});
            break;
          case 'mordent': // Les mordants
            Object.assign(params, {
              place: attrs['@_place'],
              form: attrs['@_form'], // upper, etc.
            })
            mesure.assets.push({type: 'mordent', attrs: params});
            break;
          case 'sb': // ???
            console.warn('Je ne sais pas traiter sb, je ne sais même pas ce que c’est…');
            break;
          default: 
            throw new Error(`Il faut apprendre à traiter <${tagName}> avant de poursuivre.`);
        }
        
      });
    });
    return mesures /* just for specify type -> */ as MEIMesureType[];
  }

  /**
   * Fonction qui relève toutes les voix (Layer) dans la portée
   * donnée en argument. Le plus souvent, au piano, il n'y en a
   * qu'une seule, mais il arrive fréquemment qu'il y en ait plus
   * 
   * La fonction retourne la liste de tous les objets relevé,
   * principalement notes et accords.
   * 
   * @param staff Liste des layer(s) pour la portée
   */
  retrieveLayerInStaff(staff: any[]){
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
    staff.forEach(layerObj => {
      const layer = layerObj['layer'];
      const layerAttrs = layerObj[':@'];
      console.log("Layer", layer);
      console.log("Attributs layer", layerAttrs);
      const attrs = {
        num: layerAttrs['@_n'],
        id: layerAttrs['@_xml:id']
      }
      layer.forEach((itemObj: {[x: string]: any}) => {
        const tagName = Object.keys(itemObj)[0];
        const attrs = itemObj[':@']
        // On met déjà les attributs qui peuvent être partagés par
        // plusieurs type d'item
        const params = {
          id: attrs['@_xml:id'],
          duree: attrs['@_dur'],
        }
        switch(tagName) {
          case 'note': // une note, l'élément de base
            // Pas de contenu (SI, quelquefois, un accid), tout est dans les attributs
            Object.assign(params, {
              octave: attrs['@_oct'],
              note: attrs['@_pname'],
              alteration: attrs['@_accid.ges'], // 'f' ou 's'
            })
            if (itemObj['note'].length) {
              // La note définit des choses (comme des accid — même s'il existe l'attribut accid.ges pour les définir… Peut-être qu'ils sont mis là lorsque ce sont des notes exceptionnelles comme les Fa bémol ou Mi dièse ?)
              if (itemObj['note'].length > 1) { throw new Error("Je n'ai appris qu'à traiter un seul élément dans <note>… Il faut corriger ça !");}
              const objInNote = itemObj['note'][0];
              const tagName = Object.keys(objInNote)[0]
              const attrs = objInNote[':@'];
              switch(tagName){
                case 'accid': // un accident 
                  Object.assign(params, {
                    accident: attrs['@_accid'] // on trouve des 'n', des 'f'
                  });
                  break;
                case 'artic': // une articulation
                  Object.assign(params, {
                    articulation: attrs['@_artic'],
                    placement: attrs['@_place']
                  });
                  break;
                default: 
                  console.warn("Il faut que j'apprenne à traiter les éléments '%s' dans les <note>", tagName, objInNote);
                  throw new Error("Corriger déjà ça.");
              }
            }
            break;
          case 'chord': // un accord (= liste de notes)
            break;
          case 'space': // une espace ?…
            // @_dur pour durée 
            // PAS DE CONTENU
            console.warn("Je dois voir à quoi correspond un item 'space'");
            break;
          default:
            console.warn("Je dois apprendre à traiter les items '%s'", tagName);
        }
      })
      // Chaque layer définit une voix dans la portée
    })
  }
  /**
   * Relève les données générales du score
   */
  retrieveMetadata(){
    const staffsGroup = this.staffsGroup;
    this.metadata = {
      label: staffsGroup.label['#text'],
      staffs: this.parseStaffsData()
    };
  }
  /**
   * Relève les données générales des portées (clé, armure, métrique)
   */
  parseStaffsData(): StaffType[] {
    const staffsDef = this.staffsGroup['staffDef'];
    const staffs = [];
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
      staffs.push(staff);
    });
    return staffs;
  }

  searchXML(path: string){
    if (!path.startsWith('mei')) { path = xmlPaths.base + '.' + path; }
    let currentObject = this.data;
    path.split('.').forEach(name => {
      currentObject = currentObject[name];
    })
    return currentObject;
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