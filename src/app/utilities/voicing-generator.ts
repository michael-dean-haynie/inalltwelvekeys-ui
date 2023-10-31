import {ChordType, Interval} from "tonal";

export interface Voicing {
  name: string;
  intervals: string[];
}

const voicings: { [key: string]: Voicing[] } = {
  // triads
  'maj': [],
  'min': [],
  'dim': [],
  'aug': [],

  // 7th chords
  'm7': [],
  'maj7': [],
  '7': [],
  // 'm7b5': [],
  // 'm/maj7': [],

  // 9th chords
  'm9': [
    {
      name: 'rootless type a',
      intervals: ['3m', '5P', '7m', '9M']
    },
    {
      name: 'rootless type b',
      intervals: ['7m', '9M', '10m', '12P']
    },
  ],
  'maj9': [
    {
      name: 'rootless type a',
      intervals: ['3M', '5P', '7M', '9M']
    },
    {
      name: 'rootless type b',
      intervals: ['7M', '9M', '10M', '12P']
    },
  ],
  'm9b5b9': [
    {
      name: 'rootless type a',
      intervals: ['3m', '5d', '7m', '9m']
    },
    {
      name: 'rootless type b',
      intervals: ['7m', '9m', '10m', '12d']
    },
  ],
  'mM9': [
    {
      name: 'rootless type a',
      intervals: ['3m', '5P', '7M', '9M']
    },
    {
      name: 'rootless type b',
      intervals: ['7M', '9M', '10m', '12P']
    },
  ],

  // 13th chords
  '13': [
    {
      name: 'rootless type a',
      intervals: ['7m', '9M', '10M', '13M']
    },
    {
      name: 'rootless type b',
      intervals: ['3M', '6M', '7m', '9M']
    },
  ],
  '13b9b13': [
    {
      name: 'rootless type a',
      intervals: ['7m', '9m', '10M', '13m']
    },
    {
      name: 'rootless type b',
      intervals: ['3M', '6m', '7m', '9m']
    },
  ]
};
for (let chordTypeName in voicings) {
  const chordType = ChordType.get(chordTypeName);
  voicings[chordTypeName].push(...getInversionVoicings(chordType.intervals))
}


export const VoicingGenerator = {
  chordTypeNames: (): string[] => Object.keys(voicings),

  forChord: (chordTypeName: string): Voicing[] => voicings[chordTypeName]
}

function getInversionVoicings(intervals: string[]): Voicing[] {
  const result: Voicing[] = [];

  for(let i = 0; i < intervals.length; i++) {
    const name = i > 0 ? `${addSuffix(i)} inversion` : 'root position';
    result.push({
      name,
      intervals: arrangeIntervals(rotateArray(intervals, i))
    });
  }

  return result;
}

function addSuffix(num: number): string {
  const numString: string = num.toString();
  const finalDigit: number = parseInt(numString[numString.length - 1]);
  let suffix;
  if (finalDigit === 1) {
    suffix = 'st';
  } else if (finalDigit === 2) {
    suffix = 'nd';
  } else if (finalDigit === 3) {
    suffix = 'rd';
  } else {
    suffix = 'th';
  }

  return `${numString}${suffix}`;
}


// rotates array like: [1, 2, 3, 4, 5] -> [2, 3, 4, 5, 1]
function rotateArray<T>(theArray: T[], times: number = 1): T[] {
  theArray = [...theArray]; // shallow copy
  if (theArray.length) {
    for (let i = 0; i < times; i++) {
      theArray.push(theArray.shift() as T);
    }
  }
  return theArray;
}

function arrangeIntervals(intervals: string[]): string[] {
  let lastIntervalHalfSteps = 0;
  let addOctaves = 0;
  for (let i = 0; i < intervals.length; i++) {
    const simpleInterval = Interval.simplify(intervals[i]);
    intervals[i] = simpleInterval;

    const thisIntervalHalfSteps = Interval.get(simpleInterval).semitones;
    if (thisIntervalHalfSteps === undefined ) { throw new Error(); }
    if (thisIntervalHalfSteps < lastIntervalHalfSteps) {
      addOctaves++;
    }
    lastIntervalHalfSteps = thisIntervalHalfSteps;

    for(let o = 0; o < addOctaves; o++) {
      const intervalSum = Interval.add(intervals[i], '8P');
      if (!intervalSum) { throw new Error(); }
      intervals[i] = intervalSum;
    }
  }
  return intervals;
}
