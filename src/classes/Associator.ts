import { MEIAnyObjet } from "./Objet";

/**
 * class Associator
 * 
 * Typiquement, cette classe est faite pour associer des éléments qui
 * peuvent être distinct dans le fichier MEI/XML. Elle a été initiée
 * par exemple pour associer accord (chord) et arpèges (arpeg) qui ne
 * sont pas directement associés dans le fichier MEI/XML
 * 
 * Les objets associés le sont par leur identifiant, apparemment,
 * donc le fonctionnement est le suivant : 
 *  - quand on fournit un objet "associable", on le mémorise et on
 *    regarde s'il a déjà un objet associé.
 *  - quand on fournit un objet "associé", on le mémorise avec l'id
 *    auquel il doit être associé, sauf si on connait déjà son
 *    objet.
 * 
 */
export interface AnyAssociableObjet extends MEIAnyObjet {
  objets: any[];
}
export interface AnyAssociatedObjet extends MEIAnyObjet {
  ownerId: string; // identifiant du propriétaire (l'objet associable)
}

export class Associator {
  private static _associables: Map<string, AnyAssociableObjet> = new Map();
  private static _associated: Map<string, AnyAssociatedObjet[]> = new Map();
  // Met en cache la liste des associables qui ont reçu un associé
  private static _associabilizedIds: Map<string, true> = new Map();

  /**
   * @api
   * 
   * Fonction qui ajoute un propriétaire (potentiel) la liste des
   * objet à qui ont peut associer d'autres éléments, par exemple
   * un accord (chord) auquel on peut associer un signe d'arpège.
   * 
   * Si un objet associé attend déjà le propriétaire, on les associe
   * et on marque que le propriétaire a reçu un associé.
   * 
   * @param objet Un propriétaire
   */
  public static addAssociable(owner: AnyAssociableObjet) {
    console.log("AJOUT OBJET ASSOCIABLE:", owner);
    // Quoi qu'il en soit, on enregistre toujours un objet
    // associable
    this.addInTableAssociables(owner);
    // S'il a déjà des objets associés enregistrés, on lui donne
    if ( this.hasAssociatedObjets(owner.id)) {
      owner.objets.push(...this.getAssociated(owner.id));
    }
  }
  
  /**
   * @api
   * 
   * Lorsqu'un objet doit être associé à un autre (par exemple un
   * signe 'arpège' à un accord), on l'envoie à cette fonction.
   * 
   * Si le propriétaire a déjà été enregistré, on lui donne tout de
   * suite cet associé.
   * 
   * @param objet Objet qu'on peut associer à un propriétaire
   */
  public static addAssociatedObject(objet: AnyAssociatedObjet) {
    console.log("AJOUT OBJET ASSOCIÉ", objet);
    if ( this.isKnownAssociable(objet.ownerId)) {
      console.log("On peut déjà l'associer à son propriétaire");
      this.getAssociable(objet.ownerId).objets.push(objet); // J'ai l'impression que ça ne fonctionne pas par référence…
      // On indique qu'il a été associé
      this._associabilizedIds.set(objet.id, true);
    } else {
      // Sinon il faut le mémoriser pour l'associer plus tard
      this.addInTableAssociated(objet);
    }
  }

  /** 
  * @return Le propriétaire avec ses associés, mais seulement
  * s'il a reçu des associés. La fonction est principalement appelée
  * à la fin pour vraiment prendre le propriétaire avec tous ses
  * associé, par exemple l'accord (chord) avec tous ses signes, dont
  * le signe 'arpège'.
  */
  public static getIfAssociabilized(ownerId: string) {
    if ( this._associabilizedIds.has('#' + ownerId) ) {
      return this.getAssociable('#' + ownerId);
    }
  }

  private static getAssociable(ownerId: string) {
    return this._associables.get(ownerId);
  }

  private static getAssociated(objetId: string) {
    return this._associated.get(objetId);
  }

  // Return True si +ownerId+ est l'identifiant d'un propriétaire
  // connu.
  private static isKnownAssociable(ownerId: string): boolean{
    return this._associables.has(ownerId)
  }
  private static hasAssociatedObjets(ownerId: string) {
    return this._associated.has(ownerId);
  }
  private static addInTableAssociables(objet: AnyAssociableObjet){
    // Les identifiants de propriétaire, dans les associés, commen-
    // cent toujours par un "#". Plutôt que de les modifier partout
    // en retirant ce '#' pour obtenir l'id véritable, on l'ajoute
    // simplement ici.
    const ownerId = `#${objet.id}`
    this._associables.set(ownerId, objet); 
  }
  private static addInTableAssociated(objet: AnyAssociatedObjet){
    if ( false === this._associated.has(objet.ownerId)) {
      this._associated.set(objet.ownerId, []);
      this._associabilizedIds.set(objet.ownerId, true);
    }
    const liste = this._associated.get(objet.ownerId);
    liste.push(objet);
  }
}