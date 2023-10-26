import {AfterViewChecked, Component, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ExerciseService} from "../exercise.service";
import {Exercise} from "../models/api/exercise";
import { v4 as uuidv4 } from "uuid";
import {Interval, RomanNumeral, ScaleType, Tonal} from "tonal";
import {ScalePattern} from "../utilities/scale-pattern";
import {ExerciseBeat} from "../models/api/exercise-beat";
import {posModRes} from "../utilities/math-utilities";
import {forkJoin, Subscription, take} from "rxjs";
import {ScaleGeneratorService} from "../scale-generator.service";
import {VoicingGenerator} from "../utilities/voicing-generator";

@Component({
  selector: 'app-exercise-edit',
  templateUrl: './exercise-edit.component.html',
  styleUrls: ['./exercise-edit.component.scss']
})
export class ExerciseEditComponent implements OnInit, OnDestroy, AfterViewChecked {
  id: string | undefined | null;
  origin: string | undefined | null;
  readyToDisplay = false;
  editMode: 'create' | 'update' = 'create';
  exerciseForm: FormGroup = this.fb.group({});
  subscriptions: Subscription[] = [];
  scaleGeneratorForm: FormGroup = this.initializeScaleGeneratorForm();
  voicingGeneratorForm: FormGroup = this.initializeVoicingGeneratorForm();
  afterViewCheckedTasks: Array<() => void> = [];

  _voicingGeneratorBeatIndex: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private exerciseService: ExerciseService,
    private scaleGeneratorService: ScaleGeneratorService,
    private fb: FormBuilder
  ) {}

  get beats(): FormArray {
    return this.exerciseForm.get('beats') as FormArray;
  }

  get scaleTypeOptions(): string[] {
    return [...ScaleType.all()] // shallow copy
      .map(scaleType => scaleType.name)
      .sort(); // ascending by default
  }

  get patternOptions(): string[] {
    return [...ScalePattern.names()];
  }

  get directionOptions(): string[] {
    return [...ScalePattern.directions()];
  }

  get voicingGeneratorChordTypeOptions(): string[] {
    return [...VoicingGenerator.chordTypeNames()];
  }

  get voicingNameOptions(): string[] {
    const result: string[] = [];
    const chordType = this.voicingGeneratorForm.get('chordType')?.value;
    if(chordType) {
      const voicingNames = VoicingGenerator.forChord(chordType).map(voicing => voicing.name);
      result.push(...voicingNames);
    }
    return result;
  }

  getVoicingByBeatIndex(beatIdx: number): FormArray {
    return this.beats.controls[beatIdx].get('chordVoicing') as FormArray;
  }

  ngOnInit(): void {
    // wait for both params and queryParams to resolve ...
    this.subscriptions.push(forkJoin([
      this.route.paramMap.pipe(take(1)),
      this.route.queryParamMap.pipe(take(1))
    ]).subscribe(([params, queryParams]) => {
      this.origin = queryParams.get('origin');
      this.id = params.get('id');

      if (this.id && this.id.length) {
        this.exerciseService.get(this.id).subscribe(exercise => {
          if (exercise) {
            this.loadFormWithExercise(exercise);
            this.editMode = 'update';
            this.readyToDisplay = true;
          }
          else {
            this.router.navigate(['/404'], { skipLocationChange: true});
          }
        });
      }
      else {
        this.loadFormWithExercise(this.generateNewExercise());
        this.editMode = 'create';
        this.readyToDisplay = true;
      }
    }));
  }

  ngOnDestroy(): void {
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  ngAfterViewChecked(): void {
    while(this.afterViewCheckedTasks.length) {
      const task = this.afterViewCheckedTasks.pop() as () => void;
      task();
    }
  }

  onSubmit(startExercise: boolean = false): void {
    const exercise: Exercise = {
      id: this.exerciseForm.get('id')?.value,
      name: this.exerciseForm.get('name')?.value,
      description: this.exerciseForm.get('description')?.value,
      beats: this.beats.controls.map(beatCtrl => {
        const beatFG = beatCtrl as FormGroup;
        return {
          chordRomanNumeral: beatFG.get('chordRomanNumeral')?.value,
          chordType: beatFG.get('chordType')?.value,
          chordVoicing: (beatFG.get('chordVoicing') as FormArray).controls.map(intervalCtrl => {
            return intervalCtrl.value
          }),
        };
      })
    }

    if (this.editMode === 'create') {
      this.exerciseService.create(exercise).subscribe(_ => {
        if (startExercise) {
          this.router.navigate(['/exercise', exercise.id]);
        } else {
          this.router.navigate(['/exercises']);
        }
      });
    }
    else {
      this.exerciseService.update(exercise).subscribe(_ => {
        if (startExercise) {
          this.router.navigate(['/exercise', exercise.id]);
        } else {
          this.router.navigate(['/exercises']);
        }
      });
    }
  }

  onCancel(): void {
    let returnTo: 'exercise' | 'exercises' = 'exercises';
    if (this.origin && this.origin === 'exercise') {
      returnTo = 'exercise';
    }
    switch (returnTo) {
      case 'exercise':
        this.router.navigate(['/exercise', this.id])
        break;
      case 'exercises':
        this.router.navigate(['/exercises'])
        break;
    }
  }

  addBeat(): void {
    this.beats.push(this.fb.group({
      chordRomanNumeral: ['I'],
      chordType: ['maj'],
      chordVoicing: this.fb.array([
        ['1P'],
        ['3M'],
        ['5P']
      ])
    }));

    const beatIndex = this.beats.controls.length - 1;
    this.afterViewCheckedTasks.push(() => {
      const button = document.querySelector(`[data-bs-target="#beatPanel-${beatIndex}"]`) as HTMLElement;
      button.click();
    });
  }

  removeBeat(beatIndex: number): void {
    this.beats.removeAt(beatIndex);
  }

  addInterval(beatIndex: number): void {
    const voicing = this.getVoicingByBeatIndex(beatIndex);
    voicing.push(new FormControl(''));
  }

  removeInterval(beatIndex: number, intervalIndex: number): void {
    const voicing = this.getVoicingByBeatIndex(beatIndex);
    voicing.removeAt(intervalIndex);
  }


  generateScaleBeats(): void {
    const selectedScaleTypeLit = this.scaleGeneratorForm.get('scaleType')?.value;
    const scaleType = ScaleType.get(selectedScaleTypeLit);

    const selectedPatternLit = this.scaleGeneratorForm.get('pattern')?.value;
    const pattern = ScalePattern.get(selectedPatternLit);

    const direction = this.scaleGeneratorForm.get('direction')?.value;
    const octaves = this.scaleGeneratorForm.get('octaves')?.value;

    const repeatTonicOnReverseDirection: boolean = pattern?.name !== 'linear';

    let scaleSteps: { interval: string, direction: 'ascending' | 'descending', finalForDirection: boolean }[] = []
    switch (direction) {
      case 'ascending':
        for (let i = 0; i < octaves; i++) {
          scaleSteps = scaleSteps.concat([...scaleType.intervals]
            .map(interval => ({ interval, direction: 'ascending', finalForDirection: false })))
        }
        scaleSteps.push({ interval: '1P', direction: 'ascending', finalForDirection: true })
        break;
      case 'descending':
        scaleSteps.push({ interval: '1P', direction: 'descending', finalForDirection: false });
        for (let i = 0; i < octaves; i++) {
          scaleSteps = scaleSteps.concat([...scaleType.intervals]
            .reverse()
            .map(interval => ({ interval, direction: 'descending', finalForDirection: false })))
        }
        scaleSteps[scaleSteps.length - 1].finalForDirection = true;
        break;
      case 'ascending then descending':
        for (let i = 0; i < octaves; i++) {
          scaleSteps = scaleSteps.concat([...scaleType.intervals]
            .map(interval => ({ interval, direction: 'ascending', finalForDirection: false })))
        }
        scaleSteps.push({ interval: '1P', direction: 'ascending', finalForDirection: true })
        if (repeatTonicOnReverseDirection) {
          scaleSteps.push({ interval: '1P', direction: 'descending', finalForDirection: false });
        }
        for (let i = 0; i < octaves; i++) {
          scaleSteps = scaleSteps.concat([...scaleType.intervals]
            .reverse()
            .map(interval => ({ interval, direction: 'descending', finalForDirection: false })))
        }
        scaleSteps[scaleSteps.length - 1].finalForDirection = true;
        break;
      case 'descending then ascending':
        scaleSteps.push({ interval: '1P', direction: 'descending', finalForDirection: false });
        for (let i = 0; i < octaves; i++) {
          scaleSteps = scaleSteps.concat([...scaleType.intervals]
            .reverse()
            .map(interval => ({ interval, direction: 'descending', finalForDirection: false })))
        }
        scaleSteps[scaleSteps.length - 1].finalForDirection = true;
        if (!repeatTonicOnReverseDirection) {
          scaleSteps.pop();
        }
        for (let i = 0; i < octaves; i++) {
          scaleSteps = scaleSteps.concat([...scaleType.intervals]
            .map(interval => ({ interval, direction: 'ascending', finalForDirection: false })))
        }
        scaleSteps.push({ interval: '1P', direction: 'ascending', finalForDirection: true })
        break;
    }

    const exerciseBeats: ExerciseBeat[] = scaleSteps
      .flatMap(scaleStep => { // expand pattern for each scale step
        if (!pattern) { throw new Error(); }
        const patternSteps = scaleStep.finalForDirection ? [0] : [...pattern.steps] || [];
        if (scaleStep.direction === 'descending') {
          patternSteps.reverse();
        }
        const beatIntervals: string[] = patternSteps.map(pStep => {
          const baseStep = scaleType.intervals.indexOf(scaleStep.interval);
          const pStepIntervalIndex = posModRes(baseStep + pStep, scaleType.intervals.length);
          return scaleType.intervals[pStepIntervalIndex];
        });

        if (pattern.addApproach && !scaleStep.finalForDirection) {
          let approachInterval = Interval.substract(beatIntervals[0], '2m');
          if (!approachInterval) { throw new Error(); }
          const intv = Interval.get(approachInterval);
          if (!intv) { throw new Error(); }
          if (intv.dir || 0 < 0) {
            approachInterval = Interval.add(approachInterval, '8P');
          }
          if (!approachInterval) { throw new Error(); }
          beatIntervals.unshift(approachInterval);
        }

        return beatIntervals;
      })
      .map(intervalLit => ({ // map to exercise beat
      chordRomanNumeral: RomanNumeral.get(Interval.get(intervalLit)).name,
      chordVoicing: ['1P']
    }));

    this.beats.clear();
    for (let beat of exerciseBeats) {
      this.beats.push(this.fb.group({
        chordRomanNumeral: [beat.chordRomanNumeral],
        chordType: [beat.chordType],
        chordVoicing: this.fb.array(beat.chordVoicing)
      }));
    }
  }

  generateVoicing(): void {
    const beat = this.beats.at(this._voicingGeneratorBeatIndex);
    if (beat) {
      const beatVoicing = beat.get('chordVoicing') as FormArray;
      if (beatVoicing) {
        const chordType = this.voicingGeneratorForm.get('chordType')?.value;
        const beatChordTypeCtrl = beat.get('chordType');
        if (beatChordTypeCtrl) {
          beatChordTypeCtrl.setValue(chordType);
        }
        if (chordType) {
          const voicings = VoicingGenerator.forChord(chordType);
          if (voicings) {
            const voicingName = this.voicingGeneratorForm.get('voicingName')?.value;
            if (voicingName) {
              const voicing = voicings.find(vcng => vcng.name === voicingName);
              if (voicing) {
                beatVoicing.clear();
                for (let interval of voicing.intervals) {
                  beatVoicing.push(new FormControl(interval));
                }
              }
            }
          }
        }
      }
    }
  }

  contextualizeVoicingGeneratorForm(beatIndex: number): void {
    this._voicingGeneratorBeatIndex = beatIndex;
    const beat = this.beats.at(beatIndex);
    const chordType = beat.get('chordType')?.value;
    this.voicingGeneratorForm.get('chordType')?.setValue(chordType || 'maj');
  }

  formatBeat(beatIndex: number): {symbol: string, voicing: string} {
    const beatFg: FormGroup = this.beats.at(beatIndex) as FormGroup;
    const chordRomanNumeral = beatFg.value['chordRomanNumeral'] || '';
    const chordType = beatFg.value['chordType'] || '';
    const chordVoicing: string[] = beatFg.value['chordVoicing'];

    return {
      symbol: `${chordRomanNumeral || ''}${chordType || ''}`,
      voicing: `(${chordVoicing.join(' - ')})`
    }
  }

  private loadFormWithExercise(exercise: Exercise): void {
    this.exerciseForm = this.fb.group({
      id: [exercise.id],
      name: [exercise.name],
      description: [exercise.description],
      beats: this.fb.array(exercise.beats.map(beat => this.fb.group({
        chordRomanNumeral: [beat.chordRomanNumeral],
        chordType: [beat.chordType],
        chordVoicing: this.fb.array(beat.chordVoicing)
      })))
    });
  }

  private initializeScaleGeneratorForm(): FormGroup {
    const sg = this.scaleGeneratorService.scaleGenerator;
    const sgfg = this.fb.group({
      scaleType: [sg.scaleType],
      pattern: [sg.pattern],
      direction: [sg.direction],
      octaves: [sg.octaves]
    });

    this.subscriptions.push(sgfg.valueChanges.subscribe(value => {
      const { scaleType, pattern, direction, octaves } = value;
      if (!scaleType || !pattern || !direction || !octaves) { throw new Error(); }
      this.scaleGeneratorService.scaleGenerator = { scaleType, pattern, direction, octaves };
    }));

    return sgfg;
  }
  private initializeVoicingGeneratorForm(): FormGroup {
    const fg =  this.fb.group({
      chordType: ['maj'],
      voicingName: ['']
    });

    const chordTypeCtrl = fg.get('chordType');
    if (chordTypeCtrl){
      this.subscriptions.push(chordTypeCtrl.valueChanges.subscribe(value => {
        const voicingName = fg.get('voicingName')?.value || '';
        if (!this.voicingNameOptions.includes(voicingName)) {
          fg.get('voicingName')?.setValue(this.voicingNameOptions[0]);
        }
      }));
    }

    return fg;
  }

  private generateNewExercise(): Exercise {
    return {
      id: uuidv4(),
      name: 'New Exercise',
      description: '',
      beats: [
        // {
        //   chordRomanNumeral: 'II',
        //   chordType: 'm9',
        //   chordVoicing: ['3m', '5P', '7m', '9M']
        // }
      ]
    }
  }
}
