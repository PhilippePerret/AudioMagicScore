import { intervalBetween } from "../utils/notes";
import { NoteType, SimpleNote } from "./Note"

/**
 * Class Tune
 * 
 * Pour la gestion d'une tonalité, par exemple obtenir le degré d'un accord
 * dans la tonalité.
 */
export class Tune {
  private static TUNES_INTERVALLES = {
    Major: [2, 2, 1, 2, 2, 2, 1],
    minor: [2, 1, 2, 2, 1, 3, 1],
  }
  private static _quickdata: Map<string, any>;


  private notes: string[];
  private note: SimpleNote;
  private alteration: 0 | 1 | -1;
  private genre: 'minor' | 'Major';

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
        exp.shift();
        break;
      case 'd':
        this.alteration = 1;
        exp.shift();
        break;
    }
    g = exp.shift() || 'M';

    console.log("g = ", g);
    this.genre = g === 'm' ? 'minor' : 'Major';
    console.log("Genre gamme = %s", this.genre);
    this.note = n as SimpleNote;
    this.build();
  }

  build(){
    console.log("Début de la construction de la gamme %s", this.tune);
    this.notes = [];
    let lastNote: string = this.note;
    if (this.alteration) {
      if (this.alteration === 1 ) { lastNote += 'd'; }
      else if (this.alteration === -1) { lastNote += 'b';}
    }
    this.notes.push(lastNote);
    let curNote = String(this.note);
    while(this.notes.length < 7) {
      // La note suivante dans la gamme
      curNote = this.nextNote(curNote);
      console.log("Note suivante = %s", curNote);
      // Intervalle requis entre cette note et la précédente
      const reqInterv = Tune.TUNES_INTERVALLES[this.genre][this.notes.length - 1]
      lastNote = this.notes[this.notes.length - 1];
      const absInterv = this.intervalBetween(lastNote, curNote); 
      console.log("Interval requis: %i, intervale entre les notes %s et précédente = %i", reqInterv, curNote, absInterv);
      const diff = reqInterv - absInterv;
      console.log("Différence: %i demi-tons", diff);
      curNote = this.add(curNote, diff);
      console.log("Note finale", curNote);
      this.notes.push(curNote);
    }
    this.notes.push(...this.notes)
    this.notes.push(this.notes[0]);
    console.log("GAMMES de %s", this.tune, this.notes);
  }

  private nextNote(note: string) {
    return (this.quickData.get(note)).get('next');
  }
  private intervalBetween(n1: string, n2: string): number {
    return this.quickData.get(n1).get(n2);
  }

  // raccourci
  private get quickData() { return Tune._quickdata; }

  private add(note: string, demitons: number) {
    if ( demitons === 0) { return note; }
    switch(demitons){
      case 0: return note;
      case 1: return note + 'd';
      case 2: return note + 'dd';
      case -1: return note + 'b';
      case -2: return note + 'bb';
    }
  }
 
  
  static init() {
    let n: Map<string, number | string>;
    const QuickData = new Map();
    
    n = new Map();
    n.set('note', 'cb'); n.set('next', 'd');
    n.set('bbb', 2); n.set('bb', 1); n.set('dbb', 1); n.set('db', 2);
    QuickData.set(n.get('note'), n);
 
    const c = new Map();
    c.set('note', 'c'); c.set('next', 'd');
    c.set('bb', 2); c.set('b', 1); c.set('db', 1); c.set('d', 2);
    QuickData.set('c', c);

    n = new Map();
    n.set('note', 'cd'); n.set('next', 'd');
    n.set('b', 2); n.set('bd',1); n.set('d', 1); n.set('dd', 2);
    QuickData.set('n', n);

    n = new Map();
    n.set('note', 'db'); n.set('next', 'e');
    n.set('cb', 2); n.set('c', 1); n.set('ebb', 1); n.set('eb', 2);
    QuickData.set('dd', n);
 
   const d = new Map();
    d.set('note', 'd'); d.set('next', 'e');
    d.set('c', 2); d.set('cd', 1); d.set('eb', 1); d.set('e', 2);
    QuickData.set('d', d);

    n = new Map();
    n.set('note', 'dd'); n.set('next', 'e');
    n.set('cd', 2); n.set('cdd',1); n.set('e', 1); n.set('ed',2);
    QuickData.set('n', n);

    n = new Map();
    n.set('note', 'eb'); n.set('next', 'f');
    n.set('db', 2); n.set('d', 1); n.set('fb', 1); n.set('f', 2);
    QuickData.set(n.get('note'), n);

    n = new Map();
    n.set('note', 'e'); n.set('next', 'f');
    n.set('d', 2); n.set('dd', 1); n.set('f', 1); n.set('fd', 2);
    QuickData.set(n.get('note'), n);

    n = new Map();
    n.set('note', 'ed'); n.set('next', 'f');
    n.set('dd', 2); n.set('ddd', 1); n.set('fd', 1); n.set('fdd', 2);
    QuickData.set(n.get('note'), n);

    n = new Map();
    n.set('note', 'fb'); n.set('next', 'g');
    n.set('ebb', 2); n.set('eb', 1); n.set('gbb', 1); n.set('gb', 2);
    QuickData.set(n.get('note'), n);

    n = new Map();
    n.set('note', 'f'); n.set('next', 'g');
    n.set('eb', 2); n.set('e', 1); n.set('gb', 1), n.set('g', 2);
    QuickData.set(n.get('note'), n);

    n = new Map();
    n.set('note', 'fd'); n.set('next', 'g');
    n.set('e', 2); n.set('ed', 1); n.set('g', 1); n.set('gd', 2);
    QuickData.set(n.get('note'), n);

    n = new Map();
    n.set('note', 'gb'); n.set('next', 'a');
    n.set('fb', 2); n.set('f', 1); n.set('abb', 1); n.set('ab', 2);
    QuickData.set(n.get('note'), n);

    n = new Map();
    n.set('note', 'g'); n.set('next', 'a');
    n.set('f',2); n.set('fd', 1); n.set('ab', 1); n.set('a', 2);
    QuickData.set(n.get('note'), n);

    n = new Map();
    n.set('note', 'gd'); n.set('next', 'a');
    n.set('fd',2); n.set('fdd', 1); n.set('a', 1); n.set('ad', 2);
    QuickData.set(n.get('note'), n);

    n = new Map();
    n.set('note', 'ab'); n.set('next', 'b');
    n.set('gb', 2); n.set('g', 1); n.set('bbb', 1); n.set('bb', 2);
    QuickData.set(n.get('note'), n);

    n : new Map();
    n.set('note', 'a'); n.set('next', 'b');
    n.set('g', 2); n.set('gd', 1); n.set('bb', 1); n.set('b', 2);
    QuickData.set(n.get('note'), n);
    
    n = new Map();
    n.set('note', 'ad'); n.set('next', 'b');
    n.set('gd', 2); n.set('gdd', 1); n.set('b', 1); n.set('bd', 2);
    QuickData.set(n.get('note'), n);

    n = new Map();
    n.set('note', 'bb'); n.set('next', 'c');
    n.set('ab', 2); n.set('a',1); n.set('cb', 1); n.set('c', 2);
    QuickData.set(n.get('note'), n);

    n =  new Map();
    n.set('note', 'b'); n.set('next', 'c');
    n.set('a', 2); n.set('ad', 1); n.set('c', 1); n.set('cd', 2);
    QuickData.set(n.get('note'), n);

    n = new Map();
    n.set('note', 'bd'); n.set('next', 'c');
    n.set('ad', 2); n.set('add', 1); n.set('cd',1); n.set('cdd',2);
    QuickData.set(n.get('note'), n);
  
    Tune._quickdata = QuickData;
  }


 
 

  // === FONCTIONS DE DEBUG ===
  getNotes(){ return this.notes; }
}


Tune.init();