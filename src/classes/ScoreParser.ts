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

import { MEIAttributes, MEIMesureType } from "./Measure";
import { Piece } from "./Piece";
import { throwError } from "../utils/message";
import { ALTER_STR_TO_ALTER_NB, MEI_ATTRS_TO_KEYS } from "../utils/music_constants";
import { AnyOwnerObjet, AnyAssociatedObjet, Associator } from "./Associator";
import { MEIAnyObjet } from "./Objet";

type CleType = 'G' | 'F' | 'C' ; // clé de la portée
type LineType = 1 | 2 | 3 | 4 | 5 ; // Ligne de la clé (3, pour UT3 p.e.)
type alterType = 0 | 1 | -1; // pour rien | # | b
type alterCountType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
type meterCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 12 | 16 | 32;
type meterUnit = 1 | 2 | 4 | 8 | 16 | 32;

export interface ScoreMetadataType {
  label: string;
  staffs: StaffType[];
}
export interface StaffType {
  clef: [CleType, LineType];
  armure: [alterType, alterCountType]; // armature [<altération>, <nombre>] (MEI: keySign)
  metrique: [meterCount, meterUnit]; // metrique (MEI: meterSig)
}

export interface ScoreType {
  metadata: ScoreMetadataType;
  measures: MEIMesureType[];
}

/**
 * Les chemins XML à utiliser pour trouver les informations.
 */
const xmlPaths = {
  measures: {multi: true, in: 'section', tag: 'measure'},
  staffs: 'scoreDef.staffGrp.staffGrp', // attention, je pense qu'il peut y avoir plusieurs "staffgrp", le premier staffGrp doit signifie 'staffGroups' (noter le "s") et le second 'staffGroup' (le groupe de staffs en question) 
  staff: {multi: true, in: 'staffs', tag: 'StaffDef'}, 
  clef: {in: 'staff', tag: 'clef'},
  armure: {in: 'staff', tag: 'keySig'},
  metrique: {in: 'staff', tag: 'meterSig'} 
}

/**
 * 
 * 
 * ScorePage car il y aura plusieurs fichier PDF et donc MEI pour 
 * former une seule partition. Donc le score final, de type Score
 * sera en fait une addition des ScorePage qui auront été relevées
 */
export class ScorePageParser implements ScoreType {
  piece: Piece;
  metadata: ScoreMetadataType;
  scoreDefData: JSON;
  measuresData: JSON;
  // La donnée vraiment intéressante, celle qui va contenir tous les
  // objets, à commencer par les notes et les silences.
  // Path: measures.portees.voices
  measures: MEIMesureType[];

  constructor(
    private path: string
  ) { }
  
  /**
   * Traitement complet du fichier de chemin this.path
   */
  treate() {
    this.parse();
    this.scanMetadata();
    this.parseStaffsData();
    this.measures = this.scanMeasures(); // récupération des notes et des mesures
    // this.retreivePlainOwnerInAssociator();
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
    const xmlCode = readFileSync(this.path, "utf-8");
    this.parseXMLScoreDef(xmlCode);
    this.parseXMLMeasures(xmlCode);
 }

  /**
   * On parse le bloc XML de définition du score
   * 
   * @param xml Bloc de code total
   */
  parseXMLScoreDef(xml: string): void {
    const blocScoreDef = this.readRawCode(xml, 'scoreDef');
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
  
  /**
   * Relève le code brut dans une balise (un nœud) du fichier xml
   * complet.
   * 
   * @param xml Tout le code
   * @param tagname La balise recherchée
   * @returns Tout le code dans la base, brut.
   */
  private readRawCode(xml: string, tagname: string){
    const strIn = xml.indexOf('<' + tagname + ' ');
    const tagFin = '</' + tagname + '>';
    const strOut = xml.indexOf(tagFin) + tagFin.length;
    return xml.substring(strIn, strOut);
  }

  private _staffsgrps: JSON;
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
   * 
   * 
   * Système des associations (Associator)
   * ------------------------
   * Une des difficultés de la relève optimum, c'est que des infor-
   * mations sur les objets peuvent être disséminés à différents en-
   * droits. Typiquement, un accord arpégé peut voir son signe "arp-
   * égé" être enregistré autre part, tout au fond de la staff.
   * Pour paler ce problème, on utilise l'Associator qui va justement
   * permettre de faire ces associations. On lui envoie tous les 
   * objets qui peuvent être des propriétaires (ici les accords) et
   * on envoie ensuite les objets associés en les associant (l'asso-
   * ciation peut avoir lui après aussi, quand on envoie un proprié
   * qui peut avoir déjà des objets associés).
   * Le problème, c'est qu'il semble que ça ne fonctionne pas bien
   * par référence. Donc quand l'associé est associé à son proprié-
   * taire, ça ne semble être fait que dans l'Associator.
   * Pour palier ce problème, à la toute fin, quand on a fini de
   * scanner tous les éléments, on passe en revue tous les objets
   * en récupérant leur vraie valeur dans l'Associateur si ce sont
   * des objets propriétaires. Et le tour est joué.
   */
  scanMeasures(): MEIMesureType[] {
    // console.log("this.measureData", this.measuresDat);
    const mesures = []; // on le mettra peut-être en 'this.mesures'
    this.measuresData['section'].forEach((dmesure: {measure: any}, iMeasure: number) => { // Si ce n'est pas une mesure, on passe à la suivante
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
        // console.log("[Measure #%i", iMeasure, content);
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
            const voices = this.scanLayersInStaff(content['staff']);
            mesure.portees.push({voices: voices, attrs: params});
            break;
          case 'tie': // une hampe ? une liaison ?
            mesure.assets.push({type: 'tie', attrs: params});
            break;
          case 'slur': // une slur
            mesure.assets.push({type: 'slur', attrs: params});
            break;
          case 'arpeg': // un arpège
            const ownerId = attrs['@_plist'];
            const obj = {type: 'arpeg', ownerId: ownerId, attrs: params};
            Associator.addAssociatedObject(obj as undefined as AnyAssociatedObjet);
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
   * Fonction qui relève toutes les voices (Layer) dans la portée
   * donnée en argument. Le plus souvent, au piano, il n'y en a
   * qu'une seule, mais il arrive fréquemment qu'il y en ait plus
   * 
   * La fonction retourne la liste de tous les objets relevé,
   * principalement notes et accords.
   * 
   * @param staff Liste des layer(s) pour la portée
   */
  scanLayersInStaff(staff: any[]): any[] {
    // staff.layer
    //    Une voices sur la portée. Plusieurs layers s'il y a plusieurs
    //    voices. Note : un layer, logiquement, remplit toute la mesure.
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
    return staff.map(layerObj => {
      const layer = layerObj['layer'];
      const layerAttrs = layerObj[':@'];
      // console.log("Layer", layer);
      // console.log("Attributs layer", layerAttrs);
      const attrs = {
        num: layerAttrs['@_n'],
        id: layerAttrs['@_xml:id']
      }
      const layerObjets: MEIAnyObjet[] = [];
      layer.forEach((itemObj: MEIAnyObjet) => {
        const scannedObjet = this.scanMEIObjetFrom(itemObj);
        if (scannedObjet.type === 'beam'){
          // L'objet 'beam', dans un fichier MEI, est juste un objet
          // rassemblant plusieurs notes attachées. On n'en a pas
          // besoin.
          layerObjets.push(...scannedObjet.notes);
          if (scannedObjet.objets.length) {
            console.log("Objets du beam perdus", scannedObjet.objets);
          }
        } else {
          layerObjets.push(scannedObjet);
        }
      });
      return layerObjets;
    });
  }


  /**
   * Cette méthode est pensée pour traiter n'importe quel type
   * d'objet du fichier MEI/XML, à commencer par les notes.
   * 
   * Normalement, tout type d'objet, que ce soit les articulations
   * ou les accords, en passant par les arpèges, doit passer par
   * cette fonction pour être traité.
   * 
   * @return l'objet parsé dans un format plus simple/JS
   * 
   * @param itemObj Item quelconque du fichier MEI, parsé
   */
  scanMEIObjetFrom(itemObj: MEIAnyObjet): MEIAnyObjet {
    const tagName = Object.keys(itemObj)[0];
    const attrs = itemObj[':@'];
    const objet = {
      type: tagName, // par exemple 'note' ou 'artic'
      id: attrs['@_xml:id'],
    }
    // On ne met ensuite que les attributs présents (pour pouvoir
    // faire plus facilement des tests de type)
    let val: string | number | boolean;
    for (var meiProp in MEI_ATTRS_TO_KEYS) {
      const prop: string = MEI_ATTRS_TO_KEYS[meiProp];
      (val = attrs[`@_${meiProp}`]) && Object.assign(objet, {[prop]: val});
    }

    let notes: MEIAnyObjet[] = []; 
    let objets: MEIAnyObjet[] = [];
    let obj: MEIAnyObjet;

    // Traitement spécial de certains cas
    switch(tagName) {
      
      // --- Les ACCORDS ---
      case 'chord':
        const chord = itemObj['chord'];
        [notes, objets] = [[], []];
        chord.forEach((chordObj: any) => {
          obj = this.scanMEIObjetFrom(chordObj);
          obj.type == 'note' ? notes.push(obj) : objets.push(obj);
        });
        // Si des objets "extérieurs" sont attachés à l'accord (typiquement : un arpège),
        // on l'ajoute. Et de toutes façons on l'enregistre comme objet propriétaire
        Associator.addOwner(objet as undefined as AnyOwnerObjet);

        Object.assign(objet, { notes: notes, objets: objets }); 
        break;

      // --- Les NOTES ATTACHÉES ---
      case 'beam':
        const beam = itemObj['beam'];
        [notes, objets] = [[], []];
        beam.forEach((beamObj: MEIAnyObjet) => {
          obj = this.scanMEIObjetFrom(beamObj);
          obj.type == 'note' ? notes.push(obj) : objets.push(obj);
        });
        // Plus tard, les notes seront mises dans le flux normal
        // (on laisse lilypond gérer ça seul)
        Object.assign(objet, { notes: notes, objets: objets });
        break;

      case 'clef':
        if ( attrs['@_sameas']) {
          Object.assign(objet, { ownerId: attrs['@_sameas'] });
          Associator.addAssociatedObject(objet as undefined as AnyAssociatedObjet);
        } else {
          // Sinon, ça peut être un propriétaire
          Associator.addOwner(objet as undefined as AnyOwnerObjet);
        }
        break;
    }

    return objet as MEIAnyObjet;
  }

  /**
   * Traitement propre à une note dans la fonction précédente.
   * 
   * Parce que son traitement est utile pour les notes seules et pour
   * les accords.
   */
  scanNoteFromMEIItem(itemObj: MEIAnyObjet){
    const attrs = itemObj[':@'];
    const objet = {
      type: 'note',
      id: attrs['@_xml:id'],
      duree: attrs['@_dur'], // pas pour les notes d'accord
      ppq: attrs['@_dur_ppq'], // idem
    }
    // Pas de contenu (SI, quelquefois, un accid), tout est dans les attributs
    Object.assign(objet, {
      octave: attrs['@_oct'],
      note: attrs['@_pname'],
      alteration: attrs['@_accid.ges'], // 'f' ou 's'
    })
    if (itemObj['note'] && itemObj['note'].length) {
      // La note définit des choses (comme des accid — même s'il existe l'attribut accid.ges pour les définir… Peut-être qu'ils sont mis là lorsque ce sont des notes exceptionnelles comme les Fa bémol ou Mi dièse ?)
      if (itemObj['note'].length > 1) { throw new Error("Je n'ai appris qu'à traiter un seul élément dans <note>… Il faut corriger ça !"); }
      const objInNote = itemObj['note'][0];
      const tagName = Object.keys(objInNote)[0]
      const attrs = objInNote[':@'];
      switch (tagName) {
        case 'accid': // un accident 
          Object.assign(objet, {
            accident: attrs['@_accid'] // on trouve des 'n', des 'f'
          });
          break;
        case 'artic': // une articulation
          Object.assign(objet, {
            articulation: attrs['@_artic'],
            placement: attrs['@_place']
          });
          break;
        default:
          console.warn("Il faut que j'apprenne à traiter les éléments '%s' dans les <note>", tagName, objInNote);
          throw new Error("Corriger déjà ça.");
      }
    }
    return objet;
  }

  /**
   * Relève les données générales du score
   */
  scanMetadata(){
    const staffsGroup = this.staffsGroup;
    this.metadata = {
      label: staffsGroup['label']['#text'],
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
    let currentObject = this.scoreDefData;
    // console.log("path", path);
    path.split('.').forEach(name => {
      // console.log("currentObjet / name", currentObject, name);
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