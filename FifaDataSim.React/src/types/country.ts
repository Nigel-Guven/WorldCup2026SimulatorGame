import type { Confederation } from './confederation';

export interface Country {
  id: string;
  name: string;
  short_name: string;
  confederation: Confederation;
  football_association: string;
  default_points: number;
  strength: number;
  flag_url: string;
  home_stadium: string;
  form: string;
}