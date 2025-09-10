export interface MEIAnyObjet {
  id: string;
  type: 'note' | 'chord' | 'rest' | 'arpeg';
  [x: string]: any;
}

export interface MEINote extends MEIAnyObjet {
}