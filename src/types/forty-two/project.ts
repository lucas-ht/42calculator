export interface FortyTwoProject {
  id: number;
  name: string;

  experience?: number;

  finishedAt?: number;
  mark?: number;
  bonus?: boolean;
}

export interface FortyTwoProjectCalculator
  extends Omit<FortyTwoProject, "experience"> {
  addedAt: number;
  experience: {
    base: number;
    gained: number;
  };
  level: number;
}
