export interface IScalePattern {
  name: string;
  steps: number[];
  addApproach?: boolean
}

export type ScaleDirection = 'ascending' | 'descending' | 'ascending then descending' | 'descending then ascending';

const patterns: IScalePattern[] = [
  { name: 'linear', steps: [0] },
  { name: '1 skip', steps: [0, 2] },
  { name: 'approach 1 skip', steps: [0, 2], addApproach: true },
  { name: '2 skips', steps: [0, 2, 4] },
  { name: 'approach 2 skips', steps: [0, 2, 4], addApproach: true },
  { name: '3 skips', steps: [0, 2, 4, 6] },
  { name: 'approach 3 skips', steps: [0, 2, 4, 6], addApproach: true }
];

export const ScalePattern = {
  all: (): IScalePattern[] => patterns,

  names: (): string[] => patterns.map(pattern => pattern.name),

  get: (name: string): IScalePattern | undefined => patterns.find(pattern => pattern.name === name),

  directions: (): ScaleDirection[] => ['ascending', 'descending', 'ascending then descending', 'descending then ascending']
}
