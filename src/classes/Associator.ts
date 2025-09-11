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
 *  - quand on fournit un objet "owner", on le mémorise et on
 *    regarde s'il a déjà un objet associé.
 *  - quand on fournit un objet "associé", on le mémorise avec l'id
 *    auquel il doit être associé, sauf si on connait déjà son
 *    objet.
 * 
 */
export interface AnyOwnerObjet extends MEIAnyObjet {
  objets: any[];
}
export interface AnyAssociatedObjet extends MEIAnyObjet {
  ownerId: string; // identifiant du propriétaire (l'objet owner)
}

export class Associator {
  private static _owners: Map<string, AnyOwnerObjet> = new Map();
  private static _associated: Map<string, AnyAssociatedObjet[]> = new Map();
  // Met en cache la liste des owners qui ont reçu un associé
  private static _ownersWithAssociateds: Map<string, true> = new Map();

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
  public static addOwner(owner: AnyOwnerObjet) {
    console.log("AJOUT OBJET ASSOCIABLE:", owner);
    // Quoi qu'il en soit, on enregistre toujours un objet
    // owner
    this.addInTableowners(owner);
    // S'il a déjà des objets associés enregistrés, on lui donne
    if ( this.hasAssociatedObjets(owner.id)) {
      owner.objets.push(...this.getAssociated(owner.id));
    }
  }
  
  /**
   * @api
   * 
   * Lorsqu'un objet DOIT être associé à un autre (par exemple un
   * signe 'arpège' à un accord), on l'envoie à cette fonction.
   * (note: on sait qu'il DOIT être associé lorsqu'il possède une
   * propriété avec une valeur d'identifiant — reconnaissable au 
   * fait qu'elle a un préfixe '#')
   * 
   * Si le propriétaire a déjà été enregistré, on lui donne tout de
   * suite cet associé.
   * 
   * @param objet Objet qu'on peut associer à un propriétaire
   */
  public static addAssociatedObject(objet: AnyAssociatedObjet) {
    console.log("AJOUT OBJET ASSOCIÉ", objet);
    if ( this.isKnownOwner(objet.ownerId)) {
      console.log("On peut déjà l'associer à son propriétaire");
      this.getOwner(objet.ownerId).objets.push(objet); // J'ai l'impression que ça ne fonctionne pas par référence…
      // On indique qu'il a été associé
      this._ownersWithAssociateds.set(objet.ownerId, true);
    } else {
      // Sinon il faut le mémoriser pour l'associer plus tard
      this.addInTableAssociated(objet);
    }
  }

  /** 
  * @return Le propriétaire avec ses objets associés, mais SEULEMENT
  * s'il a reçu des associés. La fonction est principalement appelée
  * à la fin du scan pour vraiment prendre le propriétaire avec tous
  * les associés, par exemple l'accord (chord) avec tous ses signes,
  * dont le signe 'arpège'.
  */
  public static getOwnerIfHasAssociated(ownerId: string) {
    if ( this._ownersWithAssociateds.has('#' + ownerId) ) {
      return this.getOwner('#' + ownerId);
    }
  }

  private static getOwner(ownerId: string) {
    return this._owners.get(ownerId);
  }

  private static getAssociated(objetId: string) {
    return this._associated.get(objetId);
  }

  // Return True si +ownerId+ est l'identifiant d'un propriétaire
  // connu.
  private static isKnownOwner(ownerId: string): boolean{
    return this._owners.has(ownerId)
  }
  private static hasAssociatedObjets(ownerId: string) {
    return this._associated.has(ownerId);
  }
  private static addInTableowners(objet: AnyOwnerObjet){
    // Les identifiants de propriétaire, dans les associés, commen-
    // cent toujours par un "#". Plutôt que de les modifier partout
    // en retirant ce '#' pour obtenir l'id véritable, on l'ajoute
    // simplement ici.
    const ownerId = `#${objet.id}`
    this._owners.set(ownerId, objet); 
  }
  private static addInTableAssociated(objet: AnyAssociatedObjet){
    if ( false === this._associated.has(objet.ownerId)) {
      this._associated.set(objet.ownerId, []);
      this._ownersWithAssociateds.set(objet.ownerId, true);
    }
    const liste = this._associated.get(objet.ownerId);
    liste.push(objet);
  }
}