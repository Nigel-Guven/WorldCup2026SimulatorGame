import type { Phase } from "./phase";

export interface FormProps<T> {
  config: T;
  targetPhases: Phase[];
  onChange: (field: string, value: unknown) => void;
}