import type { Confederation } from './confederation';

export interface Country {
  id: string;
  name: string;
  short_name: string;
  confederation: Confederation;
  football_association: string;
  default_points: number;
  strength_attack: number;
  strength_defence: number;
  flag_url: string;
  home_stadium: string;
  form: string;
  home_advantage: number;
  is_starred: boolean;
}