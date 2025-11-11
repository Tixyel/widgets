export enum Alejo$Pronouns {
  hehim = 'He/Him',
  sheher = 'She/Her',
  theythem = 'They/Them',
  shethem = 'She/They',
  hethem = 'He/They',
  heshe = 'He/She',
  xexem = 'Xe/Xem',
  faefaer = 'Fae/Faer',
  vever = 'Ve/Ver',
  aeaer = 'Ae/Aer',
  ziehir = 'Zie/Hir',
  perper = 'Per/Per',
  eem = 'E/Em',
  itits = 'It/Its',
}

export type Alejo$Pronouns$name =
  | 'hehim'
  | 'sheher'
  | 'theythem'
  | 'shethem'
  | 'hethem'
  | 'heshe'
  | 'xexem'
  | 'faefaer'
  | 'vever'
  | 'aeaer'
  | 'ziehir'
  | 'perper'
  | 'eem'
  | 'itits';

export type Alejo$Pronouns$display =
  | 'He/Him'
  | 'She/Her'
  | 'They/Them'
  | 'She/They'
  | 'He/They'
  | 'He/She'
  | 'Xe/Xem'
  | 'Fae/Faer'
  | 'Ve/Ver'
  | 'Ae/Aer'
  | 'Zie/Hir'
  | 'Per/Per'
  | 'E/Em'
  | 'It/Its';

export type Alejo$Pronouns$User = {
  id: string;
  login: string;
  pronouns: Alejo$Pronouns$name;
};
