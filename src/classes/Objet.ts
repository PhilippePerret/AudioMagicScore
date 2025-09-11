export interface MEIAnyObjet {
  id: string;
  type: 'note' | 'chord' | 'rest' | 'clef' | 
    'beam' | 'arpeg' | 'accid' | 'artic' | 
    'tie' | 'slur' | 
    'mordent' | 'space' | 'sb' ; 
  [x: string]: any;
}

export interface MEINote extends MEIAnyObjet {
}