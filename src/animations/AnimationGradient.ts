import { serializable } from "../Serializable";
import AnimationBits from "./AnimationBits";
import AnimationInstanceGradient from "./AnimationInstanceGradient";
import AnimationPreset from "./AnimationPreset";
import { AnimationType, AnimationTypeValues } from "./AnimationType";

export default class AnimationGradient implements AnimationPreset {
  @serializable(1, { padding: 1 })
  readonly type: AnimationType = AnimationTypeValues.Gradient;

  @serializable(2)
  duration = 0; // ms

  @serializable(4)
  faceMask = 0;

  @serializable(2, { padding: 2 })
  gradientTrackOffset = 0;

  createInstance(bits: AnimationBits): AnimationInstanceGradient {
    return new AnimationInstanceGradient(this, bits);
  }
}
