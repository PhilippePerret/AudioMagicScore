
const ERRORS = {
  // Soit un simple string, 
  // Soit une liste avec des indices et un array fourni
  // Soit une liste avec des clés et un object fourni (ou les deux)
  'test-message': 'Juste un test de message sans paramètres',
  'mei-file-unfound': ['Le fichier', 0, 'est introuvable.'],
  'mei-files-not-built': 'Les fichiers MEI n’ont pas pu être construits',
  'unknown-file' : ['Unknown File:', 0],
  'assemble-empty-folder': ['Empty folder:', 0],
  'bad-extension': ['Bad extension (.mei required):', 0],
  'no-path-provided': 'No path provided.',


}
export function throwError(msgId: keyof typeof ERRORS, params: {[x: string]: string} | string[] | undefined = undefined) {
  let msg: string | Array<string | number> = ERRORS[msgId];
  if ( params ) {
    msg = (msg as Array<string | number>).map(n => params[n] || n).join(' '); 
  } 
  throw new Error(msg as string);
}