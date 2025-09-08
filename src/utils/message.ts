
const ERRORS = {
  // Soit un simple string, 
  // Soit une liste avec des indices et un array fourni
  // Soit une liste avec des clés et un object fourni (ou les deux)
  'test-message': 'Juste un test de message sans paramètres',
  'mei-file-unfound': ['Le fichier', 0, 'est introuvable.'],
}
export function throwError(msgId: string, params: {[x: string]: string} | string[] | undefined = undefined) {
  let msg: string | Array<string | number> = ERRORS[msgId];
  if ( params ) {
    msg = (msg as Array<string | number>).map(n => params[n] || n); 
  } 
  throw new Error(msg as string);
}