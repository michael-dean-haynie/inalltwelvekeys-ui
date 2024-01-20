import * as ba from "./beat-analyzers";
import {ExerciseBeat} from "../../models/api/exercise-beat";

fdescribe('beat-analyzers', () => {
    it('sandbox', () => {
      // Arrange
      const beat: ExerciseBeat = {
        chordRomanNumeral: "IV",
        chordVoicing: ['3M', '5P', '8P']
      }

      // Act
      const chordRoot = ba.getChordRoot('C', beat);
      console.log({chordRoot});

      const bassOfBeatVoicing = ba.getBassOfBeatVoicing('C', beat);
      console.log({bassOfBeatVoicing});

      // Assert
      expect(true).toBeTruthy();
    });
});
