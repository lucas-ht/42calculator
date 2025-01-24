export interface FortyTwoProject {
  id: number;
  name: string;

  experience: number;

  parentId?: number | undefined;
  children: FortyTwoProject[];

  completions: number;
  duration: number;

  createdAt?: number;
  updatedAt?: number;

  mark?: number | undefined;
  bonus?: boolean | undefined;
}

export interface CalculatorEntry {
  project: FortyTwoProject;
  order: number;

  experience: number;
  level: number;

  parentId?: number | undefined;
  children: CalculatorEntry[];
}
