import { serializable } from "../Serializable";
import AnimationBits from "./AnimationBits";
import AnimationInstanceGradientPattern from "./AnimationInstanceGradientPattern";
import AnimationPreset from "./AnimationPreset";
import { AnimationType, AnimationTypeValues } from "./AnimationType";

//TODO Not 32 bits aligned (14 bytes total)
export default class AnimationGradientPattern implements AnimationPreset {
  @serializable(1, { padding: 1 })
  readonly type: AnimationType = AnimationTypeValues.GradientPattern;

  @serializable(2)
  duration = 0; // ms

  @serializable(2)
  speedMultiplier256 = 0; // A multiplier to the duration, scaled to 256

  @serializable(2)
  tracksOffset = 0; // offset into a global buffer of tracks

  @serializable(2)
  trackCount = 0;

  @serializable(2)
  gradientTrackOffset = 0;

  @serializable(1, { padding: 1 })
  overrideWithFace = 0;

  createInstance(bits: AnimationBits): AnimationInstanceGradientPattern {
    return new AnimationInstanceGradientPattern(this, bits);
  }
}
