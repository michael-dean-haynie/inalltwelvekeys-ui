export interface IVoicing {
  intervals: string[]
}

const voicings = [
  {
    intervals: ['1P', '3M', '5P'],
    chordType: ''
  }
]

export const Voicing = {
  // all: (): IScalePattern[] => patterns,
  //
  // names: (): string[] => patterns.map(pattern => pattern.name),
  //
  // get: (name: string): IScalePattern | undefined => patterns.find(pattern => pattern.name === name),
  //
  // directions: (): ScaleDirection[] => ['ascending', 'descending', 'ascending then descending', 'descending then ascending']
}
