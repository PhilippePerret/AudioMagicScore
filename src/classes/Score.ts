import { execSync } from 'child_process';
import { existsSync, readdirSync, statSync, unlinkSync } from "fs";
import { basename, dirname, join } from "path";
import { throwError } from "../utils/message";
import { MEIMesureType } from "./Measure";
import { ScoreMetadataType, ScorePageParser, ScoreType } from "./ScoreParser";

export class Score implements ScoreType {
  metadata: ScoreMetadataType;
  measures: MEIMesureType[];

  constructor(){}
  
  private reset(){
    this.nombreEssais = 0;
  }

  /**
   * Fonction qui prend les fichiers PDF ou SVG d'une partition et
   * les transforme (si possible) en fichiers MEI pour être assemblés
   * et traités dans cette application
   */
  private nombreEssais: number | undefined;
  originalScore2mei(
    paths: string | string[],
    folder: string | undefined = undefined,
    params: {debug: boolean}
  ){
    const debugIt = params.debug === true;
    const originalPaths = paths; // pour une autre tentative
    if (this.nombreEssais === undefined) this.reset();
    ++ this.nombreEssais;
    debugIt && console.log("ESSAI #%i", this.nombreEssais);
    if ( folder && Array.isArray(paths)) {
      paths = paths.map(path => join(folder, path));
    }
    paths = this.checkPathsValidity(paths, ['svg', 'pdf']);
    const dossier = dirname(paths[0]);
    if ( paths[0].endsWith('.svg')){
      this.emptyFolderBut(dossier, ['svg', 'mei']);
    } else {
      this.emptyFolderBut(dossier, ['pdf', 'mei']);
    }

    paths.forEach(path => {
      const bname = basename(path);
      const base = bname.substring(0, bname.length - 4);
      const meiname = `${base}.mei`;
      const finalpath = join(dossier, meiname); 
      if (existsSync(finalpath)) { return ;}
      const pdfname = `${base}.pdf`;
      const svgname = `${base}.svg`;
      const xmlname = `${base}.xml`;
      const mxlname = `${base}.mxl`;
      if ( existsSync(finalpath)) unlinkSync(finalpath);
      let code: string[] = [];
      if ( path.endsWith('.svg')) { 
        code.push(`inkscape -o ${pdfname} ${svgname}`); 
      }
      code.push(`audiveris -batch -export -save ${pdfname}`);
      code.push(`unzip ${mxlname} -d folder/`);
      //*
      code.push(`rm ${mxlname}`);
      code.push(`mv folder/${xmlname} ${xmlname}`);
      code.push(`rm -rf folder`);
      code.push(`verovio ${xmlname} -o ${meiname} -f musicxml -t mei`);
      //*/
      code.forEach((command: string) => {
        command = `cd ${dossier} && ${command}`;
        try {
          debugIt && console.log("COMMANDE '%s'", command);
          const result = execSync(command, { 
            encoding: 'utf8',
            stdio: 'pipe' 
          });
          // console.log("résultat", result);
        } catch(erreur) {
          console.log("ERROR #%i", erreur.status);
          // console.log("ERREUR", erreur);
        }
      })
    });
    // On vérifie que les fichiers ont bien été créés
    // Et si ça n'est pas le cas, on recommence jusqu'à 2 fois
    let oneMEIFileNotFound = false;
    paths.forEach(path => {
      const base = path.substring(0, path.length - 4);
      const finalPath = `${base}.mei`;
      if (existsSync(finalPath)) { 
        debugIt && console.log("FICHIER CRÉÉ: %s", finalPath);
      } else {
        debugIt && console.log("### Fichier non trouvé : %s", finalPath);
        oneMEIFileNotFound = true;
      }
    })
    if (oneMEIFileNotFound) {
        if ( this.nombreEssais > 2 ) {
          this.nombreEssais = undefined;
          throwError('mei-files-not-built'); 
       }
       this.nombreEssais ++ ;
       this.originalScore2mei(originalPaths, folder, params);
    } else {
      console.log("Fichiers MEI produits avec succès.");
      this.nombreEssais = undefined;
    }

  }

  /**
   * Vide le dossier donné en argument sauf les fichiers portant
   * l'extension +extension+
   */
  emptyFolderBut(dossier: string, extensions: string[]) {
    const regExt = new RegExp(`\.(${extensions.join('|')})$`);
    readdirSync(dossier).forEach(name => {
      if ( name.match(regExt)) { return ; }
      const path = join(dossier, name);
      if (statSync(path).isDirectory()) {
        console.log("JE DOIS APPRENDRE À DÉTRUIRE LE DOSSIER", path);
      } else {
        unlinkSync(path);
      }
    })
  }

  /**
   * Fonction qui prend un ensemble de partitions .mei et les assemble
   * pour former la partition complète (obtenir les objets, les notes)
   * 
   * @param paths Liste des chemins d'accès aux partitions ou dossier les contenant.
   */
  assemble(paths: string | string[]){
    this.measures = [];
    paths = this.checkPathsValidity(paths, ['mei']);
    // On boucle sur chaque path, qui doit être dans l'ordre, pour
    // rassembler toutes les notes (tous les objets)
    paths.forEach((path: string) => {
      const parser = new ScorePageParser(path);
      parser.treate();
      // on récupère ses mesures
      this.measures.push(...parser.measures);
    });
    // Ici, toutes les mesures ont été rassemblées
    // Il faut refaire leur numérotation
    this.measures.forEach((mesure: MEIMesureType, i: number) => {
      const bonNumero = i + 1;
      mesure.numero = bonNumero;
    });
  }

  private checkPathsValidity(
    paths: string |  string[],
    extensions: string[]
  ): string[] {
    if ( undefined === paths) { throw new Error("Il faut fournir le path de la partition, le path du dossier contenant les partitions, ou la liste des partitions.");}
    let folderPath: string = '--list provided--';
    if ( 'string' === typeof paths){
      existsSync(paths) || throwError('unknown-file', [paths]);
      if (statSync(paths).isDirectory()) {
        // un dossier
        folderPath = String(paths);
        paths = readdirSync(paths);
        // Pas de dossier vide
        if (paths.length === 0) { throwError('assemble-empty-folder', [folderPath]); }
     } else { // un fichier
        paths = [paths]
      }
    } 
    // Liste vide
    if (paths.length === 0) { throwError('no-path-provided');}
    // On vérifie la validité des paths fournis (si un seul n'est pas
    // bon on arrête tout)
    const regExt = new RegExp(`\.(${extensions.join('|')})$`)
    paths.forEach((path: string) => {
      existsSync(path) || throwError('unknown-file', [path]);
      path.match(regExt) || throwError('bad-extension', [path]);
    })
    return paths;
  }

}