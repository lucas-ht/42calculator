export type FortyTwoProjectStatus =
  | "in_progress"
  | "finished"
  | "searching_a_group"
  | "creating_group"
  | "waiting_for_correction";

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

  status?: FortyTwoProjectStatus | undefined;
  is_validated?: boolean | undefined;
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
