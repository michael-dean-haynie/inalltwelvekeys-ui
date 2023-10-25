import {ScaleDirection} from "../../utilities/scale-pattern";

export interface ScaleGenerator {
  scaleType: string;
  pattern: string;
  direction: string;
  octaves: number;
}
