export interface FortyTwoProject {
  id: number;
  name: string;

  children?: FortyTwoProject[];
  experience?: number;

  finishedAt?: number;
  mark?: number;
  bonus?: boolean;
}

export interface CalculatorEntry {
  project: FortyTwoProject;
  addedAt: number;

  experience: number;
  level: number;
}
