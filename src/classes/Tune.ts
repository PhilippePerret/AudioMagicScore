import { CHORD_FUNCTIONS } from "../utils/music_constants";
import { Chord } from "./Chord";
import { SimpleNote, TuneType } from "./Note"

type SimpleAlterStr = '' | 'b' | 'd';

/**
 * Class Tune
 * 
 * Pour la gestion d'une tonalité, par exemple obtenir le degré d'un accord
 * dans la tonalité.
 */
export class Tune {

  /**
   * @api
   * 
   * Retourne le poids d'un accord quelconque dans le contexte d'une
   * tonalité donnée (ce Tune)
   */
  public weightOfChord(notes: any[]): number {
    // console.log("Notes transmises", notes);
    const realNotes = notes.map(dnote => dnote.rnote);
    const dataChord = this.getDataChord(realNotes);
    // console.log("Data de l'accord %s : ", realNotes.join('-'), dataChord);
    return dataChord.get('weight');
  }

  /**
   * Retourne les données de l'accord de notes +notes+, données qui définissent 
   * sa fonction, son nom, etc.
   * 
   * @param notes Les notes simples de l'accord. Par exemple [c, e g bb]
   * @returns Le Map des données de l'accord dans la tonalité du contexte, s'il est connu
   */
  public getDataChord(notes: string[]): Map<string, any> {
    const chordKey = notes.join('-');
    if ( this.chords.has(chordKey) ) {
      return this.chords.get(chordKey);
    } else {
      // Accord inconnu dans ce contexte
      // TODO Il faudrait pouvoir calculer son éloignement du context
      // tonal courant
      const map = new Map();
      map.set('fonction', 'unknown');
      map.set('weight', -1);
      return map;
    }

  }

  //=============== /FIN DE L'API ==================

  // Les intervalles des gammes majeures et mineures
  private static TUNE_INTERVALLES = {
    maj: [2, 2, 1, 2, 2, 2],
    min: [2, 1, 2, 2, 1, 3],
  }
  private static CHROM_SCALES = new Map();  // Elles ne seront faites qu'au besoin
  private static SCALES = new Map();        // idem
  private static NOTES_SPECS: Map<string, any> = new Map(); // idem

  // @return les spécificités de la note simple (i.e. sans altération) +note+
  public static getNoteSpecs(note: SimpleNote){
    if ( false === this.NOTES_SPECS.has(note)) {
      const noteSpecs = ((n) => {
        const m = new Map();
        switch(n){
          case 'c':
            m.set('next', 'd'); m.set('indexChroma', 0); m.set('degre', 1); break;
          case 'd':
            m.set('next', 'e'); m.set('indexChroma', 2); m.set('degre', 2); break;
          case 'e':
            m.set('next', 'f'); m.set('indexChroma', 4); m.set('degre', 3); break;
          case 'f':
            m.set('next', 'g'); m.set('indexChroma', 5); m.set('degre', 4); break;
          case 'g':
            m.set('next', 'a'); m.set('indexChroma', 7); m.set('degre', 5); break;
          case 'a':
            m.set('next', 'b'); m.set('indexChroma', 9); m.set('degre', 6); break;
          case 'b':
            m.set('next', 'c'); m.set('indexChroma', 11); m.set('degre', 7); break;
        }
        return m;
      })(note);
      this.NOTES_SPECS.set(note, noteSpecs);
    }
    return this.NOTES_SPECS.get(note);
  }

  /**
   * La donnée chromatique qui permet d'obtenir toutes les notes
   * 
   * Par exemple, si on a 'f' comme note de référence :
   *  - f => note suivante "g"
   *  - f => index 5 dans chromatique
   *  - ton au-dessus = 7e note chromatique, en sol
   *  - => CHROM[7]['g'] => 'g'
   * 
   * Plus intéressant, en Dm, on est à Sib
   *  - Si => note suivante "c"
   *  - Sib => index 10 dans chromatique
   *  - 6e note de la gamme mineure 
   *    => suivante +3
   *    => (10 + 3) % 12 => 1
   *  - => CHROM[1]['c'] => 'cd
   */
  public static CHROM_DATA = [
    { 'b': 'bd', 'c': 'c', 'd': 'dbb' },  // 0 | c
    { 'b': 'bdd', 'c': 'cd', 'd': 'db' }, // 1 | cd
    { 'c': 'cdd', 'd': 'd', 'e': 'ebb' }, // 2 | d
    { 'd': 'dd', 'e': 'eb', 'f': 'fbb' }, // 3 | eb
    { 'd': 'ddd', 'e': 'e', 'f': 'fb' },  // 4 | e
    { 'e': 'ed', 'f': 'f', 'g': 'gbb' },  // 5 | f
    { 'e': 'edd', 'f': 'fd', 'g': 'gb' }, // 6 | fd
    { 'f': 'fdd', 'g': 'g', 'a': 'abb' }, // 7 | g
    { 'g': 'gd', 'a': 'ab' },             // 8 | ab
    { 'g': 'gdd', 'a': 'a', 'b': 'bbb' }, // 9 | a
    { 'a': 'ad', 'b': 'bb', 'c': 'cbb' }, // 10 | bb
    { 'a': 'add', 'b': 'b', 'c': 'cb' },  // 11 | b
  ]

  // @return la gamme de ton +tune+
  // Par exemple {note: 'd', alte: '', nature: 'min'}
  // En la construisant au besoin
  private static getScale(tune: TuneType) {
    if (false === this.SCALES.has(tune)) { this.SCALES.set(tune, this.buildScale(tune)); }
    return this.SCALES.get(tune);
  }

  /**
   * Construit une gamme quelconque à partir de la note et du genre
   * 
   * @param {<note>, <alteration>, <majeur ou mineur>}
   * @returns 
   */
  private static buildScale({note, alte, nature}: TuneType) {
    // La gamme qu'il faut construire
    const notes: string[] = []; 
    // Les intervalles en fonction de la nature
    const intervalles = this.TUNE_INTERVALLES[nature]
    let curNatNote = note;
    let curNote = `${note}${alte}`;
    notes.push(curNote);
    let noteSpecs = this.getNoteSpecs(note);
   
    // Boucle sur chaque intervalles
    intervalles.forEach(intervalle => {
      const noteSpecs = this.getNoteSpecs(curNatNote);
      const nextNatNote = noteSpecs.get('next');
      // Calcul de l'indice chromatique de la note courante
      const alter = curNote.substring(1, curNote.length) || '';
      let indexChroma = noteSpecs.get('indexChroma')
      indexChroma = this.adjustIndexChromaByAlter(indexChroma, alter);
      // Calcul de l'index chromatique de la note suivante
      const nextIndexChroma = (indexChroma + intervalle) % 12;
      // On en déduit la nouvelle note courante
      curNote =  this.CHROM_DATA[nextIndexChroma][nextNatNote];
      // On enregistre la note dans la gamme
      notes.push(curNote);
      curNatNote = curNote.split('')[0] as SimpleNote; // on passe à la suivante
    })
    return notes;
  }

  // @return L'index chromatique exact en fonction de l'altération 
  // fournie
  public static adjustIndexChromaByAlter(
    indexChroma: number, 
    alter: string
  ): number {
    if (alter === '') { return indexChroma; }
    indexChroma = ((alter) => {
      switch (alter) {
        case 'd': return indexChroma + 1;
        case 'dd': return indexChroma + 2;
        case 'b': return indexChroma - 1;
        case 'bb': return indexChroma - 2;
      }
    })(alter);
   if (indexChroma < 0) { indexChroma += 12; }
   else if (indexChroma > 11) { indexChroma -= 12; }
   return indexChroma;
  }

  private notes: string[];
  /**
   * Données sur les accords
   * Attention, malgré son petit nom, cette donnée est fondamentale
   * dans l'instance Tune, car elle définit tous les accords de
   * chaque tonalité (de la tonalité de l'instance) et renseignant
   * son nom, sa fonction, son chiffrage, etc.
   */
  private chords: Map<any, any>;
  private note: SimpleNote;
  private alterStr: SimpleAlterStr;
  private alteration: 0 | 1 | -1;
  private nature: 'min' | 'maj';

  constructor(
    private tune: string
  ){
    // console.log("Ton fourni = '%s'", this.tune);
    let a: string | number | undefined, g: string | number | undefined;
    const exp = this.tune.split('');
    let n: string = exp.shift();
    switch(exp[0]){
      case 'b':
        this.alteration = -1;
        this.alterStr = exp.shift() as SimpleAlterStr;
        break;
      case 'd':
        this.alteration = 1;
        this.alterStr = exp.shift() as SimpleAlterStr;
        break;
      default: 
        this.alterStr = '';
    }
    g = exp.shift() || 'M';

    // console.log("g = ", g);
    this.nature = g === 'm' ? 'min' : 'maj';
    // console.log("nature gamme = %s", this.nature);
    this.note = n as SimpleNote;
    this.build();
  }

  build(){
    this.buildScale(); // ne pas confondre avec la méthode de classe
    this.buildChords(); 
  }

  private static readonly CHFCT = CHORD_FUNCTIONS;
  private static CHORDS_DATA = {
    'maj':
      [
        { degs: [0, 2, 4], function: this.CHFCT.Tonique, chiffre: 'I', name: '_N_', weight: 12, genre: 'maj'},
        { degs: [0, 2, 4, 6], function: this.CHFCT.Tonique, chiffre: 'I7M', name: '_N_7M', weight: 5, genre: 'maj'},
        { degs: [1, 3, 5], function: this.CHFCT.SusTonique, chiffre: 'II', name: '_N_m', weight: 9, genre: 'min'},
        { degs: [1, 3, 5, 0], function: this.CHFCT.SusTonique, chiffre: 'II7', name: '_N_m7', weight: 11, genre: 'min'},
        { degs: [2, 4, 6], function: this.CHFCT.Mediante, chiffre: 'III', name: '_N_m', weight: 3, genre: 'min'},
        { degs: [2, 4, 6, 1], function: this.CHFCT.Mediante, chiffre: 'III7', name: '_N_m7', weight: 3, genre: 'min', weight_if: [{cond: ['marche_harmonique'], value: 8}]},
        { degs: [3, 5, 0], function: this.CHFCT.SousDominante, chiffre: 'IV', name: '_N_', weight: 8, genre: 'maj', weight_if: [ {cond: ['last_measures'], value: 10 }]},
        { degs: [3, 5, 0, 2], function: this.CHFCT.SousDominante, chiffre: 'IV7M', name: '_N_7M', weight: 8, genre: 'maj'},
        { degs: [4, 6, 1], function: this.CHFCT.SousDominante, chiffre: 'V', name: '_N_', weight: 10, genre: 'maj'},
        { degs: [4, 0, 1], function: this.CHFCT.DominanteSus4, chiffre: 'V+4', name: '_N_+4', weight: 9.5, genre: 'maj'},
        { degs: [4, 6, 1, 3], function: this.CHFCT.Dominante, chiffre: 'V7', name: '_N_7', weight: 12, genre: 'maj'},
        { degs: [4, 0, 1, 3], function: this.CHFCT.DominanteSus4, chiffre: 'V7+4', name: '_N_7+4', weight: 12, genre: 'maj'},
        { degs: [5, 0, 2], function: this.CHFCT.SusDominante, chiffre: 'VI', name: '_N_m', weight: 7, genre: 'min'},
        { degs: [5, 0, 2, 4], function: this.CHFCT.SusDominante, chiffre: 'VI', name: '_N_m7', weight: 8, genre: 'min'},
        { degs: [6, 1, 3], function: this.CHFCT.SousTonique, chiffre: 'VII', name: '_N_5-', weight: 12, genre: '5-'},
        { degs: [6, 1, 3, 5], function: this.CHFCT.SousTonique, chiffre: 'VIIo/', name: '_N_o/', weight: 6, genre: '5-'},
        // Autres accords (hors gammes)
        { degs: [1, [3, +1], 5], function: this.CHFCT.DomDeDom, chiffre: 'V/V', name: '_N_', weight: 6, genre: 'maj'},
        { degs: [1, [3, +1], 5, 0], function: this.CHFCT.DomDeDom, chiffre: 'V7/V', name: '_N_7', weight: 7, genre: 'maj'},
        { degs: [6, 1, 3, [5, -1]], function: this.CHFCT.SeptDimDeSensible, chiffre: 'VIIo', name: '_N_o', weight: 10, genre: '5-'},
        { degs: [[3, +1], 5, 0, [2, -1]], function: this.CHFCT.SeptDeSensibleDeDom, chiffre: 'VIIo/V', name: '_N_o', weight: 9, genre: '5-'},
        { degs: [[1, -1], 3, [5, -1]], function: this.CHFCT.Napolitaine, chiffre: 'N', name: '_N_', weight: 4, genre: 'maj'},
        { degs: [[5, -1], 0, [2, -1], [3, +1]], function: this.CHFCT.SixteAugAllemande, chiffre: 'VI+', name: '_N_6+', weight: 6, genre: '6+'},
        { degs: [[5, -1], 0, 1, [3, +1]], function: this.CHFCT.SixteAugFrancaise, chiffre: 'VI+', name: (notes) => '_N_M75-'.replace(/_N_/, notes[2]), weight: 6, genre: '6+'},
        { degs: [[5, -1], 0, [3, +1]], function: this.CHFCT.SixteAugItalienne, chiffre: 'VI+', name: '_N_6+', weight: 6, genre: '6+'},

      ],
    'min': [
        { degs: [0, 2, 4], function: this.CHFCT.Tonique, chiffre: 'I', name: '_N_m', weight: 12, genre: 'min'},
        { degs: [0, 2, 4, 6], function: this.CHFCT.Tonique, chiffre: 'I7M', name: '_N_m7M', weight: 3, genre: 'min'},
        { degs: [0, [2,1], 4], function: this.CHFCT.ToniqueMaj, chiffre: 'IM', name: '_N_M', weight: 6, genre: 'maj'},
        { degs: [0, [2,1], 4, [6,-1]], function: this.CHFCT.Tonique7, chiffre: 'I7', name: '_N_7', weight: 7, genre: 'maj'},
        { degs: [1, 3, 5], function: this.CHFCT.SusTonique, chiffre: 'II', name: '_N_5-', weight: 6, genre: '5-'},
        { degs: [1, 3, 5, 0], function: this.CHFCT.SusTonique, chiffre: 'IIo/', name: '_N_o/', weight: 7, genre: '5-'},
        { degs: [2, 4, 6], function: this.CHFCT.Mediante, chiffre: 'III', name: '_N_5+', weight: 4, genre: '5+'},
        { degs: [2, 4, 6, 1], function: this.CHFCT.Mediante, chiffre: 'III7', name: '_N_75+', weight: 3, genre: '5+', weight_if: [{cond: ['marche_harmonique'], value: 8}]},
        { degs: [3, 5, 0], function: this.CHFCT.SousDominante, chiffre: 'IV', name: '_N_m', weight: 8, genre: 'min', weight_if: [ {cond: ['last_measures', 'first_measures'], value: 10 }]},
        { degs: [3, 5, 0, 2], function: this.CHFCT.SousDominante, chiffre: 'IV7', name: '_N_m7', weight: 8, genre: 'min'},
        { degs: [4, 6, 1], function: this.CHFCT.Dominante, chiffre: 'V', name: '_N_', weight: 10, genre: 'maj'},
        { degs: [4, 6, 1, 3], function: this.CHFCT.Dominante, chiffre: 'V7', name: '_N_7', weight: 12, genre: 'maj'},
        { degs: [5, 0, 2], function: this.CHFCT.SusDominante, chiffre: 'VI', name: '_N_', weight: 7, genre: 'maj'},
        { degs: [5, 0, 2, 4], function: this.CHFCT.SusDominante, chiffre: 'VI7M', name: '_N_7M', weight: 8, genre: 'maj'},
        { degs: [6, 1, 3], function: this.CHFCT.SousTonique, chiffre: 'VII', name: '_N_5-', weight: 12, genre: '5-'},
        { degs: [6, 1, 3, 5], function: this.CHFCT.SousTonique, chiffre: 'VIIo', name: '_N_o', weight: 11, genre: '5-'},
        // Autres accords (hors gammes)
        // { degs: [1, [3, +1], [5, 1]], function: 'dom-de-dom', chiffre: 'V/V', name: '_N_', weight: 6, genre: 'maj'},
        // { degs: [1, [3, +1], 5, 0], function: 'dom-de-dom', chiffre: 'V7/V', name: '_N_7', weight: 7, genre: 'maj'},
        { degs: [[3, +1], [5,+1], 0, 2], function: this.CHFCT.SeptDeSensibleDeDom, chiffre: 'VIIo/V', name: '_N_o', weight: 9, genre: '5-'},
        { degs: [[1, -1], 3, 5], function: this.CHFCT.Napolitaine, chiffre: 'N', name: '_N_', weight: 8, genre: 'maj'},
        { degs: [5, 0, 2, [3, +1]], function: this.CHFCT.SixteAugAllemande, chiffre: 'VI+', name: '_N_6+', weight: 6, genre: '6+'},
        { degs: [5, 0, 1, [3, +1]], function: this.CHFCT.SixteAugFrancaise, chiffre: 'VI+', name: (notes: string[]) => '_N_M75-'.replace(/_N_/, notes[2]), weight: 6, genre: '6+'},
        { degs: [5, 0, [3, +1]], function: this.CHFCT.SixteAugItalienne, chiffre: 'VI+', name: '_N_6+', weight: 6, genre: '6+'},
    ]

  } 
  

  /**
   * Fonction qui construit tous les accords de la tonalité du con-
   * texte + tous ceux qui sont définis pour ce contexte.
   */
  private buildChords(){
    let diff: number ;
    this.chords = new Map();
    Tune.CHORDS_DATA[this.nature].forEach((cdata: any) => {
      const cnotes = cdata.degs.map((index: number | Array<number | 1 | -1>): string => {
        if ( 'number' === typeof index) {
          return this.notes[index] as string
        } else {
          [index, diff] = index;
          return this.getNoteWithDiff(this.notes[index], diff as 1 | -1); 
        }
      });
      const cmap = new Map(Object.entries(cdata));
      cmap.set('notes', cnotes);
      // console.log("cnotes", cnotes);
      let name: any;
      if ('string' === typeof cdata.name) {
        name = cnotes[0];
        name = cdata.name.replace(/_N_/, name);
      } else {
        name = cdata.name(cnotes);
      }
      name = name.split('');
      name[0] = name[0].toUpperCase();
      name = name.join('');
      cmap.set('name', name);
      // Les deux clés pour obtenir l'accord (array de ses notes + chiffrage)
      const kchord = cnotes.join('-');
      // console.log("Clé de l'accord %s : '%s'", cmap.get('function'), kchord, cnotes);
      this.chords.set(kchord, cmap);
      // this.chords.has(cnotes) || throwError('build-chord-key-array-error')
      this.chords.set(cmap.get('chiffre'), cmap);
    })
    // console.log("This.chords final", this.chords);
  }
  
  /**
   * Méthode qui reçoit la note +note+ et la renvoie avec la diffé-
   * de demitons +diff+.
   * Par exemple : 
   *    c, +1 => cd
   *    c, -1 => cb
   *    cd, -1 => c 
   */
  private getNoteWithDiff(note: string, diff: 1 | -1){
    switch(diff) {
      case +1:
        if ( note !== 'b' && note.endsWith('b')) { return note.substring(0, note.length - 1);}
        else { return note + 'd'; }
      case -1:
        if ( note !== 'd' && note.endsWith('d')) { return note.substring(0, note.length - 1);}
        else { return note + 'b'; }
    }

  }

  /**
   * Construction de la gamme
   * Produit this.notes, qui contient les 7 notes de la gamme de la
   * tonalité courante.
   */
  private buildScale(){
    this.notes = Tune.buildScale({
      note: this.note, 
      alte: this.alterStr, 
      nature: this.nature
    });
  //  console.log("GAMME de %s", this.tune, this.notes);

  }
    

  // === FONCTIONS DE DEBUG ===

  getNotes(){ return this.notes; }
  getChords() { return this.chords; }
  debugChords() {
    this.chords.forEach((v, k) => {
      console.log("%s %s", k, v.get('function'));
    })
  }
}
