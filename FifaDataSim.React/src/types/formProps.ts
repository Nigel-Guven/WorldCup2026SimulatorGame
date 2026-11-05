import type { Country } from "./country";
import type { Phase } from "./phase";

export interface FormProps<T> {
  config: T;
  targetPhases: Phase[];
  teams?: Country[];
  onChange: (field: string, value: unknown) => void;
}