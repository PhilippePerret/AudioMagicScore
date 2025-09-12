import { demiTonsBetween, intervalBetween } from "../utils/notes";
import { ContextType, DUREE, DureeType, Note, NoteType, SimpleTune, Tune, TuneType } from "./Note";

export class Chord {
  // Définition des fonctions
  // ---------------------------------------- 
  // TODO Ajouter au contexte :
  //  - marche_harmonique
  //  - last_meaures
  //  - classique (ou romantique, contemporain, baroque)
  // TODO Ajouter au traitement discrimineByFunction
  //  - propriété :after (autre fonction)
  //  - propriété :if (contexte)
  //  - propriété :if_not (contexte)
  public static FONCTIONS = {
    Tonique: {rankValue: 7, after: {Dominante: +1}}, // 1er degré
    // Dominante, 5e degré
    Dominante: {rankValue: 6, after: {Dominante: +1, SusTonique: +1}},
    // Relatif, 6e degré
    Relative: {rankValue: 5, after: {Dominante: +1}}, // 6e degré
    // 2e degré, sus-tonique
    SusTonique: {rankValue: 4, after: {Dominante: +1}}, 
    // Sous-dominante, 4e degré
    SubDominante: {rankValue: 3, after: {Tonique: +1}, if: {last_measures: +2}}, 
    // 3e degré (rare hors marche)
    Mediane: {rankValue: 1, if: {marche_harmonique: +2, classique: -1}, if_not: {classique: +2}}
  }
  /**
   * @api
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
          if (bytierces.length < 4) {
            bytierces.unshift(index, undefined, undefined); 
          } else if (bytierces.length === 4) {
            bytierces.push(index);
          } else if (bytierces[4] === undefined) {
            bytierces[4] = index;
          } else {
           variantes = addVariante(variantes, bytierces[4], index); 
          }
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
            // console.log("Variante avec la note d'index %i et bytierces = ", index, bytierces);
            variantes = addVariante(variantes, bytierces[3], index);
          }
          break;
        default:
          console.error("Valeur d'intervalle non traitée : %s", val);
      }
      // console.log("bytierces dans boucle", bytierces); 
      // console.log("variantes dans boucle", variantes);
    };

    /*
    console.log("bytierces FINALE", bytierces);
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
   * 
   * =============== INSTANCE Chord =================
   * 
   */

  private notes: NoteType[];
  private context: ContextType;
  public id: string;
  public rankByDuree: number; // relatif au context, le rang, parmi plusieurs accords, en fonction de la durée de ses notes
  public rankByOccurences: number; // relatif au context, le rang, parmi plusieurs accords, en fonction de l'occurrence de ses notes
  public rankByFunction: number; // relatif au context, le rang, parmi plusieurs accords, en fonction de sa fonction harmonique
  private _weight: number;

  constructor(params: ChordParamType) {
    this.notes = params.notes;
    this.context = params.context;
    this.id = params.id || crypto.randomUUID();
  }

  /**
   * @return le poids en durée de l'accord (somme de la durée de
   * toutes ses notes)
   * Note : ne pas confondre avec la fonction dureeRelWeigth qui 
   * calcule le poids par rapport à un ensemble de notes données
   */
  get dureeAbsWeight(){
    return this._dureeweight || (this._dureeweight = this.sumOf('duree'))
  }
  private _dureeweight: number;
  
  /**
   * Retourne la somme de la valeur de la propriété +property+ det
   * toutes les notes de l'accord.
   * 
   * @param property La propriété qu'il faut prendre en compte
   * @returns La somme 
   */
  sumOf(property: string): number {
    return this.notes.reduce(
      (accum, note) => accum + note[property], 0
    )

  }

  /**
   * @return le poids relatif en durée de l'accord par rapport à une
   * durée totale +dureeTotale+
   */
  dureeRelWeight(dureeTotale: number): number {
    let poids = this.dureeAbsWeight / dureeTotale * 100;
    return poids; 
  }

  /**
   * @return le poids de l'accord en fonction de sa nature dans la
   * tonalité fournie.
   */
  functionWeight(tune: TuneType): number {
      let poids = 0; // pour le moment
    return poids; 
  }


  /**
   * Calcul le poids de l'accord en fonction de l'occurence des ses
   * notes dans un contexte donné (pas ici : ici, on ne reçoit que
   * la table des occurences qui définit, pour chaque note du contexte,
   * son poids en occurence qui dépend de sa fréquence dans le contexte
   * donné)
   * o
   * NOTE DEV : On pourrait généraliser cette méthode, qui pourrait 
   * certainement fonctionner pour d'autres poids.
   * 
   * @param tableOccurences Table définissant le poids pour chaque note d'une liste (contenant aussi les notes de l'accord) en fonction de leur occurence dans une liste de notes données (qui a permis de construire la table — voir par exemple la fonction Analyzor.discrimineByOccurenceCount)
   * @returns 
   */
  calcWeightOccurences(tableOccurences: Map<string, number>): number {
    return this.notes.reduce(
      (accum, note) => accum + tableOccurences.get(note.rnote), 0
    )
  }
}

export interface ChordParamType {
  id?: string,
  notes: NoteType[];
  context: ContextType;
  
}