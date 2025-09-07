import { demiTonsBetween, intervalBetween } from "../utils/notes";
import { ContextType, DUREE, DureeType, Note, NoteType, SimpleTune, Tune } from "./Note";

export class Chord {
  /**
   * Fonction qui reçoit des notes au hasard et les ordonne pour former un
   * accord analysable. Retourne les notes de l'accord (:chord) et les notes
   * étrangères qui ont été retirés
   * 
   * @return une liste de : {chord: Note[], foreignNotes: Note[]} contenant
   * toutes les possibilités qu'on a avec ces notes. En général une seule,
   * mais il arrive qu'on puisse en obtenir plusieurs. Il faudra ensuite 
   * choisir le bon en fonction du poids des notes.
   */
  public static detectChords(notes: NoteType[]): {chordNotes: Note[], foreignNotes: Note[]}[] {

    const notesCount = notes.length;

    /*
    Ici, plutôt que de manipuler des objets de type NoteType (avec
    obligation d'avoir recours à structuredClone(array) pour faire
    des copies profondes)), je passe par les index seulement. C'est
    à dire que toutes les manipulations se font sur les index, pas
    sur les notes elles-mêmes.
    */
 
    // Dans un premmier temps, on classe toutes les notes pour
    // obtenir un empilage de tierces, par exemple une liste qui
    // ressemblera à : (les lettres sont fictives et représentent
    // des NoteType)
    //  [x, y, undefined, undefined, z, w, k, undefined]
    //
    const bytierces: number[] = [0];  // on commence toujours avec la première…
    // Pour conserver les variantes, c'est-à-dire les notes iden-
    // tiques (sol et sol#) dont on doublera les accords plus tard. 
    // C'est-à-dire que si on a par exemple ut, mi, sol et sol#, on
    // prend l'accord [ut, mi, sol], on enregistre le fait que sol
    // a une variante sol# et au moment de consigner l'accord on le
    // double avec l'accord [ut, mi, sol#]
    let variantes: Map<number, number[]> = new Map();
    // Méthode permettant d'ajouter une variante
    function addVariante(vars: Map<number, number[]>, indice: number, variant: number): Map<number, number[]> {
      vars.has(indice) || vars.set(indice, []);
      const newVars = vars.get(indice);
      newVars.push(variant);
      vars.set(indice, newVars);
      return vars;
    }

    for (var index = 1; index < notesCount ; ++index) {
      const firstNote = notes[bytierces[0]];
      const note = notes[index];
      
      // console.log("Comparaison entre", firstNote, note, bytierces);
      let val;
      switch(val = intervalBetween(firstNote, note)[0]){
        case 1: // p.e. Fa et Fad
          variantes = addVariante(variantes, bytierces[0], index);
          break;
        case 2: // <= first = septième, note = fond
          bytierces.unshift(index, undefined, undefined); 
          break;
        case 3: 
          if ( bytierces.length >= 2 ) { 
            if ( bytierces[1] === undefined ) {
              bytierces[1] = index;
            } else {
              variantes = addVariante(variantes, bytierces[1], index);
            }
          } else {
            bytierces.push(index);
          }
          break;
        case 4:
          bytierces.unshift(index, undefined); 
          break;
        case 5:
          if (bytierces.length < 3) { bytierces.length = 3 ;}
          if ( bytierces[2] === undefined) {
            bytierces[2] = index;
          } else {
            variantes = addVariante(variantes, bytierces[2], index);
          }
          break;
        case 6:
          bytierces.unshift(index); 
          break; 
        case 7:
          if ( bytierces.length < 4) {bytierces.length = 4; }
          if ( bytierces[3] === undefined) {
            bytierces[3] = index;
          } else {
            variantes = addVariante(variantes, bytierces[3], index);
          }
          break;
        default:
          console.error("Valeur d'intervalle non traitée : %s", val);
      } 
    };

    /*
    console.log("bytierces", bytierces);
    console.log("variantes", variantes);
    //*/

    // Maintenant qu'on a une liste avec les notes classées en
    // empilage de tierces, on va regarder les sections continues
    // de notes qui pourraient faire des accords
    // La règle : dès que trois notes au moins se suivent, c'est
    // un accord. Sinon, ce sont des notes étrangères. Chaque accord
    // possible donne lieu à une version
    let resultat = {
      foreigners: [],
      chords: []
    };
    // Pour accumuler les notes d'un accord possible
    let chordNotes: number[] = []
    bytierces.forEach((nOrU: undefined | number) => {
      if (nOrU === undefined) {
        // <= Une note indéfinie (un "trou") a été trouvé
        // => On doit dispatcher les notes qu'on a relevées
        resultat = this.dispatchChordNotesInResultat(resultat, chordNotes);
        chordNotes = [];
      } else {
        chordNotes.push(nOrU);
      } 
    });
    if ( chordNotes.length ) {
      resultat = this.dispatchChordNotesInResultat(resultat, chordNotes);
    }
    
    // console.log("résultat du DISPATCH des notes", resultat);

    // Fonction interne retournant les notes étrangères à l'accord
    // +chord+ fourni en argument
    function getForeignNotesInChord(chord: number[]): number[] {
      const foreigns = [];
      if (chord.length < notesCount) {
        const chordSet = new Set(chord);
        for (var f = 0; f < notesCount; ++f) {
          if (!chordSet.has(f)) { foreigns.push(f); }
        }
      }
      return foreigns;
    }

    // Fonction interne recevant les index et retournant les "vraies"
    // notes de l'accord.
    function realNotes(indexList: number[]): NoteType[] {
      return indexList.map(i => notes[i]);
    }

    /**
     * On ajoute les notes étrangères en construisant le retour de
     * la fonction.
     */
   const chordsFound = []
    // Le principe des notes étrangères est le suivant :
    //  - si des notes ne peuvent pas former un accord, ce sont
    //    fatalement des notes étrangères
    //  - s'il y a plusieurs accords, les notes des autres accords
    //    sont toujours des notes étrangères pour les autres
    //    accords (obsolète, on ne calcule plus comme ça)
    const chords: number[][] = resultat.chords;
    for(var i = 0, len = chords.length; i < len; ++i) {
      const chord = chords[i];
       // Cas de la sixte augmentée allemande
      if ( 2 === demiTonsBetween(notes[chord[0]], notes[chord[1]])) {
        chord.push(chord.shift());
      }
      // Pour les notes étrangères, le plus simple est de passer en 
      // revue chaque note
      const foreigns = getForeignNotesInChord(chord);
      
      // On enregistre l'accord de base, souvent le seul
      const chordFound = {
        chordNotes: chord, 
        foreignNotes: foreigns
      };

      // console.log("chordFound avant remise des notes", chordFound);

     // On remplace les index par les notes et on enregistre cette
      // possibilité
      const finalChordFound = { chordNotes: [], foreignNotes: [] };
      finalChordFound.chordNotes = realNotes(chordFound.chordNotes);
      finalChordFound.foreignNotes = realNotes(chordFound.foreignNotes);

      // On ajoute cet accord à la liste des accords
      chordsFound.push(finalChordFound);

      // On traite les éventuelles VARIANTES de cet accord, i.e. les
      // [ut, mi, sol] et [ut, mi, sol#]
      if (variantes.size) { // Seulement si des variantes ont été enregistrées
        const varChords = this.getAllChordVariantes(chord, variantes);
        // console.log("Toutes les variantes", varChords);
        varChords.shift(); // Le premier est toujours l'original
        // On ajoute les variants (s'il y en a, bien sûr) à la liste des
        // accords trouvés
        varChords.forEach( vchord => {
          const foreigners = getForeignNotesInChord(vchord);
          // console.log("Chord and Foreigners (notes)", vchord, foreigners, notes);
          const finalChord = {
            chordNotes: realNotes(vchord),
            foreignNotes: realNotes(foreigners)
          }
          chordsFound.push(finalChord);
        })
      }
    };

    return chordsFound; 
  }
  private static getAllChordVariantes(chord: number[], variantes: Map<number, number[]>) {
    const results = [];

    function generateVariants(currentChord, index) {
      if (index === chord.length) {
        results.push([...currentChord]);
        return;
      }

      const originalValue = chord[index];
      const variants = variantes.get(originalValue) || [];

      // Toujours inclure la valeur originale
      currentChord[index] = originalValue;
      generateVariants(currentChord, index + 1);

      // Puis essayer chaque variante
      for (const variant of variants) {
        currentChord[index] = variant;
        generateVariants(currentChord, index + 1);
      }
    }

    generateVariants([...chord], 0);
    return results;
  }

  /**
   * 
   * @param resultat Table du résultat
   * @param notes Liste des INDEX des notes
   * @returns 
   */
  private static dispatchChordNotesInResultat(resultat: any, notes: number[]) {
    if (notes.length >= 3) {
      // Traitement des cas où l'on se retrouve avec plus de notes
      // que normalement
      if (notes.length > 4) {
        while(notes.length > 3){
          if ( notes.length > 4 ) { resultat.chords.push( notes.slice(0, 5));}
          resultat.chords.push(notes.slice(0,4));
          notes.shift();
        }
        resultat.chords.push(notes);
      } else {
        resultat.chords.push(notes);
      }
    } else {
      resultat.foreigners.push(...notes);
    }
    return resultat;
  }

  /**
   * Fonction pour discriminer des accords (la plupart du temps dans
   * une tranche-slice)
   */
  static discrimineChords(candidats: Chord[]): 
    { favorite: Chord | undefined, highWeight: Chord[], lowWeight: Chord[] } 
  {
    // La table qui sera retournée
    const discTbl = {
      favorite: undefined,
      highWeight: [],
      lowWeight: []
    }
    const candidatsCount = candidats.length;

    // On classe les accords par poids
    const sorted = Chord.sortByWeight(candidats);

    discTbl.favorite = sorted[0];
    const nbHigh = candidatsCount > 3 ? 2 : 1;
    discTbl.highWeight = sorted.slice(1, nbHigh);
    if ( candidatsCount > 2 ) {
      discTbl.lowWeight = sorted.slice(nbHigh, candidatsCount);
    }

    return discTbl;
  }

  private static sortByWeight(chords: Chord[]): Chord[]{
    return chords.sort((a, b) => a.weight > b.weight ? -1 : 1)
  }



  /**
   * 
   * =============== INSTANCE Chord =================
   * 
   */

  private notes: NoteType[];
  private context: ContextType;
  public id: string;
  private _weight: number;
  public get weight(){ return this._weight || ( this._weight = this.calcWeight())}

  constructor(params: ChordParamType) {
    this.notes = params.notes;
    this.context = params.context;
    this.id = params.id || crypto.randomUUID();
  }

  /**
   * Calcule le poids de l'accord
   * 
   * @returns Le poids de l'accord dans le contexte donné
   */
  calcWeight(): number {
    
    var poids = 0;

    // -  Le POIDS est dépendant de la durée des notes
    //    (pour le moment, on tient compte de la durée totale de la
    //    note — si c'est vraiment elle qui est conservé dans la note
    //    car ce n'est pas encore sûr).
    //    Principe simple :
    //      - les notes sous la croche ont un poids null (0)
    //      - les notes entre la croche est la noire ont un  poids de 1
    //      - les notes au-dessus de la noire ont un poids de 2
    //    On additionne pour chaque note et on divise par le nombre de
    //    notes.
      const poidsDuree = this.notes.reduce(
        (accum, note) => accum + this.pointDureeFor(note.duree),
        0
      ) / this.notes.length * 10 ;

      poids += poidsDuree;

    // -  Le poids est dépendant de la fonction de l'accord dans le
    //    contexte tonal donné

    // -  Le poids est dépendant de l'accord précédent (plus 
    //    difficile à obtenir…)

    // -  Le poids est dépendant de l'accord suivant (plus difficile
    //    à calculer)

    return poids ;
  }

  pointDureeFor(duree: DureeType) {
    if      /* courte à très courte */ (duree < DUREE.croche) { return 0 }
    else if /* moyenne */ (duree <= DUREE.noire) { return 1 }
    else    /* longue à très longue */ { return 2 }
  }
}
export interface ChordParamType {
  id?: string,
  notes: NoteType[];
  context: ContextType;
  
}