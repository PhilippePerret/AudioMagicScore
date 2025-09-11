import { existsSync, readdirSync, statSync } from "fs";
import { MEIMesureType } from "./Measure";
import { ScoreMetadataType, ScorePageParser, ScoreType } from "./ScoreParser";
import { throwError } from "../utils/message";

export class Score implements ScoreType {
  metadata: ScoreMetadataType;
  measures: MEIMesureType[];

  constructor(){}

  assemble(paths: string | string[]){
    this.measures = [];
    paths = this.checkPathsValidity(paths);
    // On boucle sur chaque path, qui doit être dans l'ordre, pour
    // rassembler toutes les notes (tous les objets)
    paths.forEach((path: string) => {
      const parser = new ScorePageParser(path);
      parser.treate();
      // on récupère ses mesures
      this.measures.push(...parser.measures);
    });
    // Ici, toutes les mesures ont été rassemblées
  }
  private checkPathsValidity(paths: string |  string[]): string[] {
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
    paths.forEach((path: string) => {
      existsSync(path) || throwError('unknown-file', [path]);
      path.endsWith('.mei') || throwError('bad-extension', [path]);
    })
    return paths;
  }

}