import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ExerciseService} from "../exercise.service";
import {Exercise} from "../models/api/exercise";
import { v4 as uuidv4 } from "uuid";
import {Interval, RomanNumeral, ScaleType} from "tonal";
import {ScalePattern} from "../utilities/scale-pattern";
import {ExerciseBeat} from "../models/api/exercise-beat";
import {posModRes} from "../utilities/math-utilities";

@Component({
  selector: 'app-exercise-edit',
  templateUrl: './exercise-edit.component.html',
  styleUrls: ['./exercise-edit.component.scss']
})
export class ExerciseEditComponent implements OnInit{
  name = new FormControl('');
  modeIsCreate = false;
  modeIsUpdate = false;
  exerciseForm: FormGroup = this.fb.group({});
  scaleGeneratorForm: FormGroup = this.initializeScaleGeneratorForm();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private exerciseService: ExerciseService,
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

  getVoicingByBeatIndex(beatIdx: number): FormArray {
    return this.beats.controls[beatIdx].get('chordVoicing') as FormArray;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id && id.length) {
        this.exerciseService.get(id).subscribe(exercise => {
          if (exercise) {
            this.loadFormWithExercise(exercise);
            this.modeIsUpdate = true;
          }
          else {
            this.router.navigate(['/404'], { skipLocationChange: true});
          }
        });
      }
      else {
        this.loadFormWithExercise(this.generateNewExercise());
        this.modeIsCreate = true;
      }
    });
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

    if (this.modeIsCreate) {
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

  generateScaleBeats(): void {
    const selectedScaleTypeLit = this.scaleGeneratorForm.get('scaleType')?.value;
    const scaleType = ScaleType.get(selectedScaleTypeLit);

    const selectedPatternLit = this.scaleGeneratorForm.get('pattern')?.value;
    const pattern = ScalePattern.get(selectedPatternLit);

    const direction = this.scaleGeneratorForm.get('direction')?.value;
    const octaves = this.scaleGeneratorForm.get('octaves')?.value;

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
        scaleSteps.push({ interval: '1P', direction: 'descending', finalForDirection: false });
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
    return this.fb.group({
      scaleType: ['major'],
      pattern: ['linear'],
      direction: ['descending'],
      octaves: [2]
    });
  }

  private generateNewExercise(): Exercise {
    return {
      id: uuidv4(),
      name: 'New Exercise Name',
      description: 'New Exercise Description',
      beats: [
        {
          chordRomanNumeral: 'II',
          chordType: 'm9',
          chordVoicing: ['3m', '5P', '7m', '9M']
        }
      ]
    }
  }
}
