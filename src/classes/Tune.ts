import { intervalBetween } from "../utils/notes";
import { NoteType, SimpleNote, TuneType } from "./Note"

type SimpleAlterStr = '' | 'b' | 'd';

/**
 * Class Tune
 * 
 * Pour la gestion d'une tonalité, par exemple obtenir le degré d'un accord
 * dans la tonalité.
 */
export class Tune {
  // Les intervalles des gammes majeures et mineures
  private static TUNE_INTERVALLES = {
    maj: [2, 2, 1, 2, 2, 2, 1],
    min: [2, 1, 2, 2, 1, 3, 1],
  }
  private static CHROM_SCALES = new Map();  // Elles ne seront faites qu'au besoin
  private static SCALES = new Map();        // idem
  private static NOTES_SPECS: Map<string, any>; // idem

  // @return les spécificités de la note simple (i.e. sans altération) +note+
  private static getNoteSpecs(note: SimpleNote){
    if ( false === this.NOTES_SPECS.has(note)) {
      const noteSpecs = ((n) => {
        const m = new Map();
        switch(n){
          case 'c':
            m.set('next', 'd'); m.set('indexChroma', 0); break;
          case 'd':
            m.set('next', 'e'); m.set('indexChroma', 2); break;
          case 'e':
            m.set('next', 'f'); m.set('indexChroma', 4); break;
          case 'f':
            m.set('next', 'g'); m.set('indexChroma', 5); break;
          case 'g':
            m.set('next', 'a'); m.set('indexChroma', 7); break;
          case 'a':
            m.set('next', 'b'); m.set('indexChroma', 9); break;
          case 'b':
            m.set('next', 'c'); m.set('indexChroma', 11); break;
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
  private static CHROM_DATA = [
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

  private static buildScale({note, alte, nature}: TuneType) {
    // La gamme qu'il faut construire
    const notes: string[] = []; 
    // Les intervalles en fonction de la nature
    const intervalles = this.TUNE_INTERVALLES[nature]
    let curNatNote = note;
    let curNote = `${note}${alte}`;
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
  private static adjustIndexChromaByAlter(
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
  private note: SimpleNote;
  private alterStr: SimpleAlterStr;
  private alteration: 0 | 1 | -1;
  private nature: 'min' | 'maj';

  constructor(
    private tune: string
  ){
    console.log("Ton fourni = '%s'", this.tune);
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

    console.log("g = ", g);
    this.nature = g === 'm' ? 'min' : 'maj';
    console.log("nature gamme = %s", this.nature);
    this.note = n as SimpleNote;
    this.build();
  }

  build(){
    this.notes = Tune.buildScale({
      note: this.note, 
      alte: this.alterStr, 
      nature: this.nature
    });
   console.log("GAMMES de %s", this.tune, this.notes);

  }
    

  // === FONCTIONS DE DEBUG ===
  getNotes(){ return this.notes; }
}
