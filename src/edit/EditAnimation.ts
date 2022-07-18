import AnimationBits from "../animations/AnimationBits";
import AnimationPreset from "../animations/AnimationPreset";
import { AnimationType } from "../animations/AnimationType";
import EditDataSet from "./EditDataSet";
import EditPattern from "./EditPattern";
import Editable from "./Editable";

export default abstract class EditAnimation extends Editable {
  name: string;

  abstract get type(): AnimationType;

  // Float, in seconds
  abstract get duration(): number;
  abstract set duration(_value: number);

  constructor(name = "") {
    super();
    this.name = name;
  }

  abstract toAnimation(
    _editSet: EditDataSet,
    _bits: AnimationBits
  ): AnimationPreset;
  abstract duplicate(): EditAnimation;

  requiresPattern(_pattern: EditPattern): { asRgb: boolean } | undefined {
    return undefined;
  }
}
